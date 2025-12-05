import React from 'react';
import { FaTimes, FaCheck, FaFileAlt } from 'react-icons/fa';
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
    'There is a timer at the upper-right corner of the exam screen that indicates the time remaining for the completion of the exam.',
    'Pause Quiz - you can pause the ongoing quiz anytime by clicking on pause quiz between next to timer on the upper-right corner. The timer will pause & resume only after you click on resume button',
    'Exam can be ended once you click finish or will automatically end if time-up'
  ]
}) => {
  if (!open) return null;
  const marks = maxMarks ?? questions;

  return (
    <div className="fixed inset-0 z-[1200]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden">
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
          <div className="p-6 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <Button variant="secondary" size="medium" className="rounded-md" onClick={onClose}>
                ← Go Back
              </Button>
              <Button
                variant="primary"
                size="medium"
                className="rounded-md bg-gradient-to-r from-secondary-blue to-primary-blue"
                onClick={onStart}
              >
                Start Exam →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructionsModal;
