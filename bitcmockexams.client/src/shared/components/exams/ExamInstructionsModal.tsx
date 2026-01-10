import React, { useEffect } from 'react';
import { FaTimes, FaCheck, FaFileAlt, FaLock } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  questions: number;
  maxMarks?: number;
  passingPercent?: number; // e.g., 50
  title?: string;
  instructions?: string[];
  isSubscribed?: boolean;
}

const ExamInstructionsModal: React.FC<Props> = ({
  open,
  onClose,
  onStart,
  questions,
  maxMarks,
  passingPercent = 50,
  title = 'Exam Instructions',
  instructions = [
    'The exam comprises of the following types of questions - Multiple Choice Single Response & Multiple Choice Multiple Response',
    'There is no negative Marking',
    'Exam can be ended once you click finish or when you close or go back, the exam automatically pauses. You can resume by clicking Start.'
  ],
  isSubscribed = true
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  const marks = maxMarks ?? questions;

  return (
    <div className="fixed inset-0 z-[1200]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div
        className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
      >
        <div
          className="w-full max-w-[95vw] sm:max-w-[700px] md:max-w-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-secondary-blue to-primary-blue text-white">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-white text-xl" />
              <h2 className="m-0 text-xl md:text-2xl font-extrabold tracking-tight">{title}</h2>
            </div>
            <button
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-light-blue border border-primary-blue/20 p-4">
                <div className="text-sm text-text-secondary">QUESTIONS</div>
                <div className="text-2xl font-extrabold text-text-primary mt-1">{questions}</div>
              </div>
              <div className="rounded-xl bg-light-blue border border-primary-blue/20 p-4">
                <div className="text-sm text-text-secondary">MAX. MARKS</div>
                <div className="text-2xl font-extrabold text-text-primary mt-1">{marks}</div>
              </div>
              <div className="rounded-xl bg-light-blue border border-primary-blue/20 p-4">
                <div className="text-sm text-text-secondary">PASSING</div>
                <div className="text-2xl font-extrabold text-text-primary mt-1">{passingPercent}%</div>
              </div>
            </div>

            {/* Instructions list */}
            <div className="space-y-3">
              {instructions.map((text, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-border bg-white shadow-sm p-4"
                >
                  <div className="w-8 h-8 shrink-0 rounded-full bg-light-blue text-primary-blue grid place-items-center font-bold">
                    {i + 1}
                  </div>
                  <p className="m-0 text-text-secondary">{text}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-border">
              <Button variant="secondary" size="medium" className="rounded-md w-full sm:w-auto" onClick={onClose}>
                ← Go Back
              </Button>
              <Button
                variant="secondary"
                size="medium"
                className="rounded-lg px-5 py-2 shadow-[0_2px_12px_rgba(28,100,242,0.20)] w-full sm:w-auto"
                icon={isSubscribed ? undefined : <FaLock />}
                onClick={onStart}
              >
                {isSubscribed ? 'Start Exam' : 'Practice Preview'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructionsModal;
