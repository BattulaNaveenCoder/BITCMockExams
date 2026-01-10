import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppFab: React.FC = () => {
  const { pathname } = useLocation();

  // Hide on PracticeExam and ExamReview pages
  const isPracticeExam = /^\/exams\/[^/]+\/[^/]+\/[^/]+/.test(pathname);
  const isExamReview = /^\/exam-review\//.test(pathname);
  if (isPracticeExam || isExamReview) return null;

  const message = encodeURIComponent('Hello, I need assistance with Mock Exams.');
  const link = `https://wa.me/918143805923?text=${message}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp chat"
      className="group fixed bottom-15 right-15 z-50"
    >
      <span className="relative inline-flex items-center justify-center">
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-green-500/40 animate-ping" />
        <span className="absolute inline-flex h-18 w-18 rounded-full bg-green-500/30 animate-pulse" />
        <span className="relative grid h-18 w-18 place-items-center rounded-full bg-green-500 text-white shadow-xl ring-4 ring-green-400/30">
          <FaWhatsapp className="text-5xl" />
          {/* Notification red dot */}
          <span className="absolute -top-0 -right-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
        </span>

        {/* Hover label tooltip */}
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 select-none whitespace-nowrap rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white shadow-2xl opacity-0 scale-95 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100"
        >
          Thank you for visiting , how can I help you?
          {/* Arrow */}
          <span className="absolute left-full top-1/2 -translate-y-1/2 h-0 w-0 border-y-6 border-y-transparent border-l-8 border-l-neutral-800" />
        </span>
      </span>
    </a>
  );
};

export default WhatsAppFab;
