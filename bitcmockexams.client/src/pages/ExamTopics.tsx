import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '@shared/components/ui/Button';
import { getExamTopics } from '../data/examTopics';
import ExamInstructionsModal from '@shared/components/exams/ExamInstructionsModal';
import { useTestSuitesApi } from '@shared/api/testSuites';
import { useAuth } from '@features/auth/context/AuthContext';
import { FaQuestionCircle, FaClock } from 'react-icons/fa';
import { title } from 'node:process';

const ExamTopics: React.FC = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const suiteId = searchParams.get('suiteId') || '';
  const pathId = searchParams.get('pathId') || '';
  const { getTestSuiteByPathId } = useTestSuitesApi();
  const { user } = useAuth();
  const userId = useMemo(() => (user as any)?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'] as string || '', [user]);
  const [topics, setTopics] = useState(getExamTopics(code || ''));
  const [suiteDetails, setSuiteDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!suiteId || !pathId || !userId) return;
      setLoading(true);
      try {
        const details = await getTestSuiteByPathId(pathId, suiteId, userId);
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
  }, [suiteId, pathId, userId]);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = topics.find(t => t.id === selectedId) || null;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-12">
      <div className="rounded-2xl bg-light-blue border border-primary-blue/10 p-5 md:p-6 lg:p-8">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            {suiteDetails?.TestSuiteTitle || 'Exam'} 
          </h1>
          <p className="text-text-secondary mt-1 md:mt-2">
            Choose a section to start practicing. Each topic aligns with the official exam domains.
          </p>
        </div>

      <div className="space-y-3">
        {topics.map((topic, idx) => (
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
                  const qp = new URLSearchParams();
                  if (suiteId) qp.set('suiteId', suiteId);
                  if ((topic as any).testId) qp.set('testId', (topic as any).testId);
                  navigate(`/practice/${code}/section/${topic.id}${qp.toString() ? `?${qp.toString()}` : ''}`);
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
        ))}
      </div>
      </div>
      {/* Instructions Modal */}
      <ExamInstructionsModal
        open={open}
        onClose={() => setOpen(false)}
        onStart={() => {
          if (selected) {
            setOpen(false);
            const qp = new URLSearchParams();
            if (suiteId) qp.set('suiteId', suiteId);
            if ((selected as any).testId) qp.set('testId', (selected as any).testId);
            navigate(`/practice/${code}/section/${selected.id}${qp.toString() ? `?${qp.toString()}` : ''}`);
          }
        }}
        questions={selected?.questions || 0}
        maxMarks={selected?.questions || 0}
        passingPercent={50}
        title={`${code} Exam Instructions`}
      />
    </div>
  );
};

export default ExamTopics;
