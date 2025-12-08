import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error';
    title: string;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, type, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        {type === 'success' ? (
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <FaCheckCircle className="text-green-500 text-3xl" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <FaExclamationCircle className="text-red-500 text-3xl" />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-center text-gray-600 mb-6">
                        {message}
                    </p>

                    {/* Button */}
                    <button
                        onClick={onClose}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${type === 'success'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
