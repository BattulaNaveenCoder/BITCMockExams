import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface InputProps {
    label?: string;
    type?: string;
    name: string;
    value: string | number | boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    rows?: number;
    enablePasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
    rows = 4,
    enablePasswordToggle = false
}) => {
    const inputId = `input-${name}`;
    const isTextarea = type === 'textarea';
    const isPassword = type === 'password';
    const [showPassword, setShowPassword] = useState(false);

    const baseInputClasses = "w-full px-4 py-3 font-sans text-base text-text-primary bg-white border-2 border-border rounded-md transition-all duration-150 focus:border-primary-blue focus:outline-none focus:ring-4 focus:ring-primary-blue/10 disabled:bg-bg-light disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-text-light";
    const errorClasses = error ? "border-error focus:ring-error/10" : "";
    const textareaClasses = isTextarea ? "resize-y min-h-[100px]" : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className={`mb-lg ${className}`}>
            {label && (
                <label htmlFor={inputId} className="block mb-sm font-semibold text-text-primary text-sm">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
            )}

                        {isTextarea ? (
                <textarea
                    id={inputId}
                    name={name}
                    value={value as string}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    rows={rows}
                    className={`${baseInputClasses} ${errorClasses} ${textareaClasses}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
                        ) : (
                                <div className={`relative`}> 
                                    <input
                                            id={inputId}
                                            type={isPassword && enablePasswordToggle ? (showPassword ? 'text' : 'password') : type}
                                            name={name}
                                            value={value as string}
                                            onChange={handleChange}
                                            placeholder={placeholder}
                                            required={required}
                                            disabled={disabled}
                                            className={`${baseInputClasses} ${errorClasses} ${isPassword && enablePasswordToggle ? 'pr-12' : ''}`}
                                            aria-invalid={error ? 'true' : 'false'}
                                            aria-describedby={error ? `${inputId}-error` : undefined}
                                    />
                                    {isPassword && enablePasswordToggle && (
                                        <button
                                            type="button"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                            onClick={() => setShowPassword((s) => !s)}
                                            tabIndex={0}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    )}
                                </div>
                        )}

            {error && (
                <span id={`${inputId}-error`} className="block mt-sm text-sm text-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
