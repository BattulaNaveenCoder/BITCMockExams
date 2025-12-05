import React from 'react';

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
    rows = 4
}) => {
    const inputId = `input-${name}`;
    const isTextarea = type === 'textarea';

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
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            ) : (
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={value as string}
                    onChange={handleChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`${baseInputClasses} ${errorClasses}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
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
