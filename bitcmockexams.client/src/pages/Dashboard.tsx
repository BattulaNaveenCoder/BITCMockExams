import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/context/AuthContext';
import { useTestsApi, type UserTestSubscription } from '@shared/api/tests';
import { useTestSuitesApi, type TestSuite } from '@shared/api/testSuites';
import { getUserIdFromClaims, normalizeClaims } from '@shared/utils/auth';

const tabs = [
  { key: 'subscription', label: 'Subscription' },
  { key: 'reports', label: 'Exam Reports' },
];

type SubscriptionView = { code: string; title: string; start: string; end: string; pathId?: string; suiteId?: string };

function toDate(d: string) {
  return new Date(d);
}

function useProgress(startStr: string, endStr: string) {
  return useMemo(() => {
    const start = toDate(startStr);
    const end = toDate(endStr);
    const now = new Date();
    const totalMs = end.getTime() - start.getTime();
    const elapsedMs = Math.max(0, Math.min(now.getTime() - start.getTime(), totalMs));
    const remainingMs = Math.max(0, end.getTime() - now.getTime());
    const pct = totalMs > 0 ? (elapsedMs / totalMs) * 100 : 0;
    const msToDays = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24));
    return {
      percentage: Number(pct.toFixed(1)),
      elapsedDays: msToDays(elapsedMs),
      remainingDays: msToDays(remainingMs),
    };
  }, [startStr, endStr]);
}

function CertificationCard({ code, title, start, end, pathId, suiteId }: { code: string; title: string; start: string; end: string; pathId?: string; suiteId?: string }) {
  const navigate = useNavigate();
  const progress = useProgress(start, end);
  return (
    <div
      className="relative rounded-3xl border border-[#cfe6ff] bg-gradient-to-b from-[#eaf4ff] via-[#e1f0ff] to-[#d7ecff] shadow-sm p-6 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#93c5fd]/40 hover:border-[#93c5fd] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1e88e5]/30"
      onClick={() => {
        const qp = new URLSearchParams();
        if (pathId) qp.set('pathId', pathId);
        if (suiteId) qp.set('suiteId', suiteId);
        const examCode = (code || '').split(':')[0] || code;
        navigate(`/exams/${examCode}/topics${qp.toString() ? `?${qp.toString()}` : ''}`);
      }}
    >
      
      <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-[#111827] leading-snug">
        {title}
      </h3>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-border/60 p-4">
          <div className="text-[#6b7280] text-xs font-semibold">START DATE</div>
          <div className="text-[#111827] text-base md:text-lg font-semibold mt-1">{start}</div>
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-border/60 p-4">
          <div className="text-[#6b7280] text-xs font-semibold">END DATE</div>
          <div className="text-[#111827] text-base md:text-lg font-semibold mt-1">{end}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#6b7280] text-sm">Progress</div>
          <div className="text-[#1e88e5] text-sm font-semibold">{progress.percentage}%</div>
        </div>
        <div className="h-3 w-full rounded-full bg-[#d0e8ff] overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-[#64b5f6] via-[#1e88e5] to-[#1565c0]"
            style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
          />
        </div>
       
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [active, setActive] = useState('subscription');
  const { user } = useAuth();
  const { getTestsByUserId } = useTestsApi();
  const { getAllTestSuitesByUserId } = useTestSuitesApi();
  
  const [subs, setSubs] = useState<SubscriptionView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suiteMap, setSuiteMap] = useState<Record<string, string>>({});

  useEffect(() => {
    debugger;
    const normalized = normalizeClaims(user as any);
    const email = normalized.email;
    const userId = getUserIdFromClaims(user as any) as string | undefined;
    if (!email || !userId) {
      setError('Missing user info');
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [rows, suites] = await Promise.all([
          getTestsByUserId(userId, email),
          getAllTestSuitesByUserId(userId)
        ]);
        const map: Record<string, string> = {};
        (suites || []).forEach((s: TestSuite) => {
          if (s.PathId && s.PKTestSuiteId) map[s.PathId] = s.PKTestSuiteId;
        });
        setSuiteMap(map);
        const mapped: SubscriptionView[] = rows.map((r) => ({
          code: r.PathId ?? r.TestId,
          title: r.TestName,
          start: new Date(r.TestStartDate).toLocaleDateString(),
          end: new Date(r.TestEndDate).toLocaleDateString(),
          pathId: r.PathId,
          suiteId: r.PathId ? map[r.PathId] : undefined,
        }));
        setSubs(mapped);
      } catch (e) {
        setError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-6 py-2 rounded-full border ${active === t.key ? 'bg-primary-blue text-white border-primary-blue' : 'bg-white text-text-primary border-border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'subscription' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <div className="col-span-full text-center">Loading...</div>}
          {error && <div className="col-span-full text-center text-red-600">{error}</div>}
          {!loading && !error && subs.length === 0 && (
            <div className="col-span-full text-center text-[#6b7280]">No subscriptions found.</div>
          )}
          {subs.map((s: SubscriptionView, i: number) => (
            <CertificationCard key={i} code={s.code} title={s.title} start={s.start} end={s.end} pathId={s.pathId} suiteId={s.suiteId} />
          ))}
        </div>
      )}

      {active === 'reports' && (
        <ReportsTab />
      )}
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'danger' | 'mode' }) {
  const styles = {
    default: 'bg-[#fff] text-[#111827] border border-[#e5e7eb]',
    warning: 'bg-[#fff7e6] text-[#92400e] border border-[#fde68a]',
    danger: 'bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]',
    mode: 'bg-[#e0f2ff] text-[#1e88e5] border border-[#bae6fd]',
  } as const;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-sm font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}

function IconDocument({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" opacity="0.2" />
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm0 2.5L18.5 7H14V4.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
    </svg>
  );
}

function IconStopwatch({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13 3V1h-2v2H8v2h8V3h-3z" />
      <path d="M12 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm1 8.27 3.2 1.85-.98 1.7L12 16v-6h1v4.27z" />
    </svg>
  );
}

function IconChart({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 3h2v18H5V3zm6 6h2v12h-2V9zm6-4h2v16h-2V5z" />
    </svg>
  );
}

const reportRows = [
  { id: 1, name: 'Perform solution envisioning and requirement analysis', date: 'May 31, 2025 02:04 PM (IST)', timeTaken: '0:0', marks: 0, percentage: 0, mode: 'Practice' },
  { id: 2, name: 'Azure Virtual Networking (Day1)', date: 'February 04, 2025 05:53 PM (IST)', timeTaken: '0:0', marks: 0, percentage: 0, mode: 'Practice' },
  { id: 3, name: 'Design, implement, and manage connectivity services', date: 'December 31, 2024 01:43 PM (IST)', timeTaken: '0:0', marks: 0, percentage: 0, mode: 'Practice' },
  { id: 4, name: 'Prepare about the data', date: 'December 13, 2024 10:47 AM (IST)', timeTaken: '1:0', marks: 5, percentage: 8, mode: 'Practice' },
];

function ReportsTab() {
  return (
    <div>
      
      <div className="rounded-3xl overflow-hidden shadow-sm border border-[#cfe6ff]">
        <div className="bg-[#0ea5e9] text-white px-6 py-4 flex items-center rounded-t-3xl">
          <div className="grid grid-cols-12 w-full gap-4 text-sm font-semibold">
            <div className="col-span-1">S.NO</div>
            <div className="col-span-4">NAME OF EXAM</div>
            <div className="col-span-3">DATE</div>
            <div className="col-span-1">TIME TAKEN</div>
            <div className="col-span-1">MARKS OBTAINED</div>
            <div className="col-span-1">MODE</div>
            <div className="col-span-1">RESULT</div>
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#eaf4ff] via-[#e1f0ff] to-[#d7ecff] p-0">
          {reportRows.map((row, idx) => (
            <div key={row.id} className={`px-6 py-4 ${idx !== 0 ? 'border-t border-[#dbeafe]' : ''} flex items-center`}>
              <div className="grid grid-cols-12 w-full gap-4 items-center">
                <div className="col-span-1 text-[#1e88e5] font-bold">{row.id}</div>
                <div className="col-span-4 text-[#111827]">{row.name}</div>
                <div className="col-span-3 text-[#6b7280]">{row.date}</div>
                <div className="col-span-1">
                  <Badge variant="warning"><IconStopwatch className="w-4 h-4" /> <span>{row.timeTaken}</span></Badge>
                </div>
                <div className="col-span-1">
                  <Badge variant={row.percentage === 0 ? 'danger' : 'default'}><IconChart className="w-4 h-4" /> <span>{row.marks} ({row.percentage}%)</span></Badge>
                </div>
                <div className="col-span-1">
                  <Badge variant="mode">{row.mode}</Badge>
                </div>
                <div className="col-span-1">
                  <button className="inline-flex items-center justify-center w-9 h-9 rounded-xl border-2 border-[#0ea5e9] bg-white text-[#0ea5e9] shadow-sm" aria-label="View report">
                    <IconDocument className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
