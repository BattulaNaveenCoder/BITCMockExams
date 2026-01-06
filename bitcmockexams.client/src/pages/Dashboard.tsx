import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/context/AuthContext';
import { useTestsApi } from '@shared/api/tests';
import { useTestSuites } from '@shared/contexts/TestSuitesContext';
import { getUserIdFromClaims, normalizeClaims } from '@shared/utils/auth';
import Skeleton from '@shared/components/ui/Skeleton';
import Button from '@shared/components/ui/Button';
import { HiOutlineInbox } from 'react-icons/hi2';

// Removed tabs and reports; Dashboard now shows subscriptions only.

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
        const examPathId = pathId || code;
        navigate(`/exams/${examPathId}`);
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
  const { user } = useAuth();
  const { getTestsByUserId } = useTestsApi();
  const { suites } = useTestSuites(); // Use shared context
  
  const [subs, setSubs] = useState<SubscriptionView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        const rows = await getTestsByUserId(userId, email);
        
        // Use suites from context
        const map: Record<string, string> = {};
        (suites || []).forEach((s) => {
          if (s.PathId && s.PKTestSuiteId) map[s.PathId] = s.PKTestSuiteId;
        });
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <SubscriptionCardSkeleton key={i} />
            ))}
          </>
        )}
        {error && <div className="col-span-full text-center text-red-600">{error}</div>}
        {!loading && !error && subs.length === 0 && (
          <EmptySubscriptions />
        )}
        {subs.map((s: SubscriptionView, i: number) => (
          <CertificationCard key={i} code={s.code} title={s.title} start={s.start} end={s.end} pathId={s.pathId} suiteId={s.suiteId} />
        ))}
      </div>
    </div>
  );
}

function SubscriptionCardSkeleton() {
  return (
    <div className="relative rounded-3xl border border-[#cfe6ff] bg-gradient-to-b from-[#eaf4ff] via-[#e1f0ff] to-[#d7ecff] shadow-sm p-6">
      <div className="mb-2">
        <Skeleton className="h-4 w-24 bg-[#d0e8ff]" rounded="rounded-full" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-8 w-3/4 bg-[#d0e8ff]" rounded="rounded-xl" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-border/60 p-4">
          <Skeleton className="h-3 w-20 bg-gray-200/80" rounded="rounded-md" />
          <div className="mt-2">
            <Skeleton className="h-5 w-28 bg-gray-200/80" rounded="rounded-md" />
          </div>
        </div>
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-border/60 p-4">
          <Skeleton className="h-3 w-20 bg-gray-200/80" rounded="rounded-md" />
          <div className="mt-2">
            <Skeleton className="h-5 w-28 bg-gray-200/80" rounded="rounded-md" />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-20 bg-gray-200/80" rounded="rounded-md" />
          <Skeleton className="h-4 w-10 bg-gray-200/80" rounded="rounded-md" />
        </div>
        <div className="h-3 w-full rounded-full bg-[#d0e8ff] overflow-hidden">
          <Skeleton className="h-3 w-2/3 bg-gradient-to-r from-[#64b5f6] via-[#1e88e5] to-[#1565c0]" rounded="rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Reports UI removed

function EmptySubscriptions() {
  const navigate = useNavigate();
  return (
    <div className="col-span-full">
      <div className="relative rounded-3xl border border-[#cfe6ff] bg-gradient-to-b from-[#eaf4ff] via-[#e1f0ff] to-[#d7ecff] shadow-sm p-10 text-center">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#cfe6ff] flex items-center justify-center shadow-sm">
          <HiOutlineInbox className="h-8 w-8 text-[#1e88e5]" aria-hidden="true" />
        </div>
        <h3 className="text-2xl md:text-3xl font-semibold text-[#111827]">No subscriptions yet</h3>
        <p className="mt-2 text-[#6b7280] max-w-md mx-auto">
          You don’t have any active subscriptions. Browse certification exams to get started.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" size="medium" onClick={() => navigate('/certification-exams')}>
            Browse Certification Exams
          </Button>
        </div>
      </div>
    </div>
  );
}
