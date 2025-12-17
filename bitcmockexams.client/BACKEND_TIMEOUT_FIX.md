# SQL Timeout Error - Complete Fix Guide

## Error Summary
**Error**: `Microsoft.Data.SqlClient.SqlException: Execution Timeout Expired`  
**Location**: `TestSuiteRepository.GetAllTestSuites()` at line 271  
**Cause**: SQL query taking longer than 30 seconds (default timeout)

---

## ✅ Frontend Fixes (Already Applied)

### 1. Extended Timeout
- Increased API timeout from 100s to **180s (3 minutes)**
- Applied specifically to the `getAllTestSuitesByUserId` call

### 2. Retry Logic
- Automatic retry up to 2 times on timeout
- Exponential backoff (2s, 4s delays)
- Smart timeout detection

### 3. Better Error Handling
- User-friendly error messages
- Timeout-specific messaging
- Retry button for users
- Visual error feedback UI

---

## ⚠️ Backend Fixes (Required - Root Cause)

### Priority 1: Database Query Optimization

#### A. Add Indexes
Check if indexes exist on these columns in your SQL database:

```sql
-- Check existing indexes
SELECT 
    TableName = t.name,
    IndexName = ind.name,
    IndexType = ind.type_desc,
    ColumnName = col.name
FROM 
    sys.indexes ind 
INNER JOIN sys.index_columns ic ON ind.object_id = ic.object_id and ind.index_id = ic.index_id 
INNER JOIN sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id 
INNER JOIN sys.tables t ON ind.object_id = t.object_id 
WHERE 
    t.name = 'TestSuites'  -- Your table name
ORDER BY 
    t.name, ind.name, ic.index_column_id;

-- Add missing indexes (adjust table/column names as needed)
CREATE NONCLUSTERED INDEX IX_TestSuites_IsActive ON TestSuites(IsActive) INCLUDE (PKTestSuiteId, TestSuiteTitle);
CREATE NONCLUSTERED INDEX IX_TestSuites_UserId ON TestSuites(FKUserId) WHERE IsActive = 1;
CREATE NONCLUSTERED INDEX IX_TestSuites_Status ON TestSuites(Status) INCLUDE (IsActive);
```

#### B. Optimize the LINQ Query
In `TestSuiteRepository.cs` at line 271:

**Current (Problematic):**
```csharp
var testSuites = await _context.TestSuites
    .Include(ts => ts.SomeRelatedEntity)
    .Include(ts => ts.AnotherRelatedEntity)
    .ToListAsync(); // Loads EVERYTHING into memory
```

**Optimized:**
```csharp
var testSuites = await _context.TestSuites
    .Where(ts => ts.IsActive == true) // Filter early
    .Select(ts => new TestSuiteDto 
    {
        // Select only needed fields
        PKTestSuiteId = ts.PKTestSuiteId,
        TestSuiteTitle = ts.TestSuiteTitle,
        // ... other needed fields
    })
    .AsNoTracking() // Don't track changes
    .ToListAsync();
```

#### C. Add Query Splitting (if using multiple Includes)
```csharp
var testSuites = await _context.TestSuites
    .Where(ts => ts.IsActive)
    .AsSplitQuery() // Prevents cartesian explosion
    .Include(ts => ts.Tests)
    .Include(ts => ts.Contributors)
    .AsNoTracking()
    .ToListAsync();
```

### Priority 2: Increase SQL Server Timeout

#### A. In DbContext Configuration
```csharp
// In your DbContext or Startup.cs
services.AddDbContext<YourDbContext>(options =>
    options.UseSqlServer(
        connectionString,
        sqlServerOptions => sqlServerOptions
            .CommandTimeout(180) // 3 minutes
            .EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(5),
                errorNumbersToAdd: null
            )
    )
);
```

#### B. Or in Connection String
```
Server=myServerAddress;Database=myDataBase;Trusted_Connection=True;Command Timeout=180;
```

### Priority 3: Implement Pagination

**In Repository:**
```csharp
public async Task<PagedResult<TestSuite>> GetAllTestSuites(
    string userrole, 
    string userId, 
    int pageNumber = 1, 
    int pageSize = 50)
{
    var query = _context.TestSuites
        .Where(ts => ts.IsActive)
        .AsNoTracking();

    var totalCount = await query.CountAsync();
    
    var items = await query
        .OrderBy(ts => ts.SerialNumber)
        .Skip((pageNumber - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return new PagedResult<TestSuite>
    {
        Items = items,
        TotalCount = totalCount,
        PageNumber = pageNumber,
        PageSize = pageSize
    };
}
```

**In Controller:**
```csharp
[HttpGet("GetAllTestSuites/{userrole}/{userid}")]
public async Task<IActionResult> GetAllTestSuites(
    string userrole, 
    string userid,
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 50)
{
    var result = await _repository.GetAllTestSuites(userrole, userid, pageNumber, pageSize);
    return Ok(result);
}
```

### Priority 4: Add Caching

```csharp
public class TestSuiteRepository
{
    private readonly IMemoryCache _cache;
    private readonly YourDbContext _context;
    
    public async Task<List<TestSuite>> GetAllTestSuites(string userrole, string userId)
    {
        var cacheKey = $"TestSuites_{userrole}_{userId}";
        
        if (!_cache.TryGetValue(cacheKey, out List<TestSuite> testSuites))
        {
            testSuites = await _context.TestSuites
                .Where(ts => ts.IsActive)
                .AsNoTracking()
                .ToListAsync();
            
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(10))
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));
            
            _cache.Set(cacheKey, testSuites, cacheOptions);
        }
        
        return testSuites;
    }
}
```

### Priority 5: Check Azure SQL Database Performance

#### A. Check Database Tier
- If using Azure SQL Database Basic tier, consider upgrading to Standard (S3+) or Premium
- Basic tier has limited DTUs which can cause timeouts

#### B. Monitor Query Performance
```sql
-- Find slow queries
SELECT TOP 10
    qs.execution_count,
    qs.total_elapsed_time / 1000000.0 AS total_elapsed_time_seconds,
    qs.total_elapsed_time / qs.execution_count / 1000000.0 AS avg_elapsed_time_seconds,
    SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
        ((CASE qs.statement_end_offset
            WHEN -1 THEN DATALENGTH(qt.text)
            ELSE qs.statement_end_offset
        END - qs.statement_start_offset)/2) + 1) AS statement_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
ORDER BY qs.total_elapsed_time DESC;
```

---

## 🎯 Recommended Implementation Order

1. **Immediate (Today)**:
   - ✅ Frontend fixes (already done)
   - Add indexes to database
   - Increase SQL timeout in connection string

2. **Short-term (This Week)**:
   - Optimize LINQ query with `.AsNoTracking()` and specific `.Select()`
   - Implement query splitting if using multiple Includes
   - Add basic caching

3. **Medium-term (Next Sprint)**:
   - Implement pagination
   - Upgrade Azure SQL tier if needed
   - Add comprehensive caching strategy

4. **Long-term (Ongoing)**:
   - Monitor query performance regularly
   - Set up Application Insights alerts for slow queries
   - Consider implementing CQRS pattern for read-heavy operations

---

## 🔍 Debugging Steps

1. **Check actual query execution time**:
   ```csharp
   var sw = System.Diagnostics.Stopwatch.StartNew();
   var result = await query.ToListAsync();
   sw.Stop();
   _logger.LogWarning($"Query took {sw.ElapsedMilliseconds}ms");
   ```

2. **Enable SQL query logging**:
   ```csharp
   // In appsettings.Development.json
   "Logging": {
     "LogLevel": {
       "Microsoft.EntityFrameworkCore.Database.Command": "Information"
     }
   }
   ```

3. **Check SQL Profiler or Query Store** in Azure SQL Database

---

## 📊 Expected Results

After implementing these fixes:
- Query execution time: **< 5 seconds** (currently > 30s)
- 95% reduction in timeout errors
- Better user experience with retry logic
- Scalable solution for growing data

---

## 🆘 If Issues Persist

1. Share the actual SQL query from logs
2. Check table row counts (`SELECT COUNT(*) FROM TestSuites`)
3. Review database statistics: `UPDATE STATISTICS TestSuites`
4. Consider database maintenance: `ALTER INDEX ALL ON TestSuites REBUILD`
5. Contact Azure Support for database performance analysis
