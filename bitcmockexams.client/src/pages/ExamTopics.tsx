import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import { getExamTopics } from '../data/examTopics';
import ExamInstructionsModal from '@shared/components/exams/ExamInstructionsModal';
import { useTestSuitesApi } from '@shared/api/testSuites';
import { useAuth } from '@features/auth/context/AuthContext';
import { useLoginModal } from '@features/auth/context/LoginModalContext';
import { FaQuestionCircle, FaClock } from 'react-icons/fa';
import { getUserIdFromClaims } from '@shared/utils/auth';

const ExamTopics: React.FC = () => {
  const { PathId } = useParams();
  const navigate = useNavigate();
  const pathId = PathId || '';
  const { getTestSuiteByPathId } = useTestSuitesApi();
  const { user, isAuthenticated } = useAuth();
  const { open: openLoginModal } = useLoginModal();
  const userId = useMemo(() => getUserIdFromClaims(user as any), [user]);
  const [topics, setTopics] = useState(getExamTopics(pathId || ''));
  const [suiteDetails, setSuiteDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    console.log(pathId, userId);
    const load = async () => {
      if (!pathId) return;
      setLoading(true);
      try {
        const details = await getTestSuiteByPathId(pathId, userId);
        if (mounted && details) {
          setSuiteDetails(details);
          const apiTopics = (details.TestsDetailsDTO || []).map((t: any, idx: number) => ({
            id: idx + 1,
            title: t.Title,
            description: t.SubTitle,
            questions: t.NumberOfQuestions ?? t.MaximumMarks ?? 0,
            durationMins: t.DurationinMinutes ?? 60,
            testId: t.PKTestId,
            pathId: t.PathId,
          }));
          if (apiTopics.length) setTopics(apiTopics);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [pathId, userId]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = topics.find(t => t.id === selectedId) || null;

  const startExam = (topic: any) => {
    const testId = topic?.testId || '';
    const encodedTitle = encodeURIComponent(topic?.title ?? '');
    const returnUrl = `/exams/${pathId}/${encodedTitle}/${testId}`;

    if (isAuthenticated === false) {
      openLoginModal(returnUrl);
      return;
    }

    if (isAuthenticated === null) {
      return;
    }

    navigate(returnUrl);
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-12">
      <div className="rounded-2xl bg-light-blue border border-primary-blue/10 p-5 md:p-6 lg:p-8">
        <div className="mb-4 md:mb-6">
          {loading ? (
            <>
              <Skeleton className="h-8 w-2/3" />
              <div className="mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                {suiteDetails?.TestSuiteTitle || 'Exam'} 
              </h1>
              <p className="text-text-secondary mt-1 md:mt-2">
                Choose a section to start practicing. Each topic aligns with the official exam domains.
              </p>
            </>
          )}
        </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-white shadow-sm border border-gray-100 px-4 md:px-8 lg:px-12 py-3 md:py-4">
              <div className="flex-1">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <div className="flex items-center gap-6 mt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-md" />
              </div>
            </div>
          ))
        ) : (
          topics.map((topic, idx) => (
            <div
              key={topic.id}
              className="flex items-center justify-between rounded-xl bg-white shadow-sm border border-gray-100 px-4 md:px-8 lg:px-12 py-3 md:py-4 hover:shadow-md transition-shadow border-l-4 border-primary-blue"
            >
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <span className="text-text-primary font-semibold text-lg md:text-xl">
                    {idx + 1}. {topic.title}
                  </span>
                </div>
                <p className="text-sm md:text-base text-text-secondary mt-1">
                  {topic.description}
                </p>
                <div className="flex items-center gap-6 mt-2 md:mt-3 text-sm text-text-secondary">
                  <span className="flex items-center gap-2">
                    <FaQuestionCircle className="text-primary-blue" />
                    Questions {topic.questions}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock className="text-yellow-500" />
                    {topic.durationMins} Mins
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="medium"
                  className="rounded-md px-5 py-2 shadow-[0_8px_24px_rgba(28,100,242,0.25)]"
                  onClick={() => {
                    startExam(topic);
                  }}
                >
                  Start
                </Button>
                <button
                  aria-label="Info"
                  className="w-10 h-10 grid place-items-center rounded-md bg-secondary-blue text-white"
                  title="Section details"
                  onClick={() => { setSelectedId(topic.id); setOpen(true); }}
                >
                  i
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
      {/* Instructions Modal */}
      <ExamInstructionsModal
        open={open}
        onClose={() => setOpen(false)}
        onStart={() => {
          if (selected) {
            setOpen(false);
            startExam(selected);
          }
        }}
        questions={selected?.questions || 0}
        maxMarks={selected?.questions || 0}
        passingPercent={50}
        title={`${suiteDetails?.TestSuiteTitle || 'Exam'} Instructions`}
      />
    </div>
  );
};

export default ExamTopics;
