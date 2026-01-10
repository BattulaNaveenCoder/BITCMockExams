import React from 'react';
import Button from '@shared/components/ui/Button';
import { FaTimes, FaUser, FaEnvelope, FaWhatsapp } from 'react-icons/fa';

interface UnlockQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportMessage: string;
}

const UnlockQuestionsModal: React.FC<UnlockQuestionsModalProps> = ({ isOpen, onClose, supportMessage }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-[600px] md:max-w-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-border">
          <h2 className="text-xl sm:text-2xl font-bold">Unlock Questions</h2>
          <button
            aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="px-4 sm:px-6 py-4 overflow-y-auto">
          <p className="text-text-secondary mb-6">
            To unlock full access, please contact our support team.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
              <div className="w-10 h-10 rounded-md bg-light-blue text-primary-blue flex items-center justify-center">
                <FaUser />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Contact Persons</div>

                <div className="mt-2">
                  <div className="font-medium">Mr. Shubham Mishra</div>
                  <div className="text-sm text-text-secondary">Mobile / WhatsApp: +91 81438 05923</div>
                  <div className="text-sm">
                    <a
                      className="text-primary-blue underline"
                      href="mailto:info@bestitcourses.com"
                    >
                      info@bestitcourses.com
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                      href={`https://wa.me/918143805923?text=${supportMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp /> WhatsApp Chat
                    </a>
                  </div>
                </div>

                <div className="border-t border-border my-4" />

                <div>
                  <div className="font-medium">Mrs. Kashmira Shah</div>
                  <div className="text-sm text-text-secondary">Mobile / WhatsApp: +91 93474 58388</div>
                  <div className="text-sm">
                    <a
                      className="text-primary-blue underline"
                      href="mailto:kashmira.shah@deccansoft.com"
                    >
                      kashmira.shah@deccansoft.com
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <a
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                      href={`https://wa.me/919347458388?text=${supportMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp /> WhatsApp Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
              <div className="w-10 h-10 rounded-md bg-light-blue text-primary-blue flex items-center justify-center">
                <FaEnvelope />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Support Email</div>
                <a
                  className="text-primary-blue underline text-sm"
                  href="mailto:support@bestitcourses.com"
                >
                  support@bestitcourses.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-border flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnlockQuestionsModal;
