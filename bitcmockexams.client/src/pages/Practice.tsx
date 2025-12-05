import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getExamTopics } from '../data/examTopics';
import Button from '@shared/components/ui/Button';
import { FaLock, FaClock, FaTimes } from 'react-icons/fa';

interface Question {
  id: number;
  text: string;
  options: string[];
  multi?: boolean;
  domain?: string;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
};

const Practice: React.FC = () => {
  const { code, sectionId } = useParams();
  const topics = getExamTopics(code || '');
  const topic = topics.find(t => String(t.id) === String(sectionId)) || topics[0];

  // Build mock questions to fit UI
  const questions: Question[] = useMemo(() => {
    const count = topic?.questions || 20;
    const arr: Question[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      text: `You are developing an Azure solution. Question ${i + 1}: Which two tools should you use?`,
      options: [
        'Microsoft Graph API',
        'Microsoft Authentication Library (MSAL)',
        'Azure API Management',
        'Microsoft Azure Security Center',
        'Microsoft Azure Key Vault SDK'
      ],
      multi: true,
      domain: topic?.title || 'Exam Domain'
    }));
    return arr;
  }, [topic]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Record<number, Set<number>>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [showAnswer, setShowAnswer] = useState(false);

  // Timer
  const [remaining, setRemaining] = useState((topic?.durationMins || 60) * 60);
  useEffect(() => {
    setRemaining((topic?.durationMins || 60) * 60);
  }, [topic]);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const q = questions[index];
  const total = questions.length;

  const toggleOption = (qi: number, oi: number) => {
    setSelected(prev => {
      const ns = { ...prev };
      const set = new Set(ns[qi] || []);
      if (set.has(oi)) set.delete(oi); else set.add(oi);
      ns[qi] = set;
      return ns;
    });
  };

  const goto = (i: number) => {
    setIndex(Math.max(0, Math.min(total - 1, i)));
    setShowAnswer(false);
  };

  const accessibleCount = Math.min(21, total); // rest appear locked like screenshot

  return (
    <div className="w-full p-3">
      {/* Top bar */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-blue">
          {topic?.title} <span className="text-text-primary">(Practice)</span>
        </h1>
        <Button variant="secondary" className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full px-6 py-2">Unlock Questions</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question panel */}
        <div className="lg:col-span-9">
          <div className="rounded-2xl bg-white shadow-md border border-border p-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold text-text-primary">Question: <span className="text-primary-blue">{String(index + 1).padStart(2,'0')} of {total}</span></div>
              <div className="flex items-center gap-2 bg-yellow-200 text-text-primary rounded-full px-4 py-2">
                <FaClock />
                <span className="font-semibold">Time: {formatTime(remaining)}</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="inline-block bg-light-blue text-primary-blue rounded-md px-4 py-2 font-semibold">Domain: {q.domain || topic?.title}</span>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-text-primary">{q.text}</p>

            <div className="mt-6 rounded-lg bg-green-100 text-green-700 px-4 py-3">(Please select all correct answers)</div>

            {/* Options */}
            <div className="mt-4 space-y-4">
              {q.options.map((opt, i) => {
                const selectedSet = selected[q.id] || new Set<number>();
                const isSelected = selectedSet.has(i);
                const label = String.fromCharCode(65 + i);
                return (
                  <button
                    key={i}
                    className={`w-full text-left rounded-xl border border-border px-4 py-4 hover:border-primary-blue transition-colors ${isSelected ? 'ring-2 ring-primary-blue bg-light-blue' : 'bg-white'}`}
                    onClick={() => toggleOption(q.id, i)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md border ${isSelected ? 'bg-primary-blue text-white border-primary-blue' : 'border-border text-text-secondary'}`}>{label}</span>
                      <span className="text-text-primary">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show Answer */}
            <div className="mt-6 rounded-xl border border-border bg-gray-50 p-4">
              <button className="text-primary-blue font-semibold" onClick={() => setShowAnswer(s => !s)}>Show Answer</button>
              {showAnswer && (
                <div className="mt-3 text-text-secondary">Answers are available in the paid version. Upgrade to unlock detailed explanations.</div>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Button variant="secondary" size="small" onClick={() => goto(0)}>{'« First'}</Button>
              <Button variant="secondary" size="small" onClick={() => goto(index - 1)}>{'‹ Previous'}</Button>
              <Button variant="primary" size="small" onClick={() => goto(index + 1)}>{'Next ›'}</Button>
              <Button variant="primary" size="small" onClick={() => goto(total - 1)}>{'Last »'}</Button>
              <div className="ml-auto">
                <Button
                  variant="secondary"
                  size="medium"
                  className="!bg-green-600 !text-white hover:!bg-green-700 !border-0 rounded-full px-6"
                >
                  Finish
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white shadow-md border border-border p-6">
            <div className="flex items-center justify-between">
              <h3 className="m-0 font-bold text-text-primary">Questions</h3>
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={!!marked[q.id]}
                  onChange={(e) => setMarked(m => ({ ...m, [q.id]: e.target.checked }))}
                />
                Mark for Review
              </label>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3">
              {Array.from({ length: accessibleCount }, (_, i) => (
                <button
                  key={i}
                  className={`h-12 rounded-md border ${i === index ? 'bg-primary-blue text-white border-primary-blue' : 'bg-gray-100 text-text-primary border-border'} font-semibold`}
                  onClick={() => goto(i)}
                >
                  {i + 1}
                </button>
              ))}
              {Array.from({ length: total - accessibleCount }, (_, i) => (
                <div key={`lock-${i}`} className="h-12 rounded-md bg-gray-200 text-text-secondary grid place-items-center">
                  <FaLock />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
