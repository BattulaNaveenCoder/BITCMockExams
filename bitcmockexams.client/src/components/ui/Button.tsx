import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
    size?: 'small' | 'medium' | 'large';
    icon?: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    icon,
    onClick,
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    className = ''
}) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-sans font-semibold border-0 rounded-md cursor-pointer transition-all duration-250 no-underline whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary-blue text-white hover:bg-secondary-blue hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:hover:transform-none disabled:hover:shadow-none",
        secondary: "bg-white text-primary-blue border-2 border-primary-blue hover:bg-light-blue hover:-translate-y-0.5 hover:shadow-md disabled:hover:transform-none disabled:hover:shadow-none",
        outline: "bg-transparent text-primary-blue border-2 border-primary-blue hover:bg-primary-blue hover:text-white disabled:hover:bg-transparent disabled:hover:text-primary-blue",
        ghost: "bg-transparent text-primary-blue hover:bg-light-blue disabled:hover:bg-transparent",
        dark: "bg-text-primary text-white hover:bg-text-secondary hover:-translate-y-0.5 hover:shadow-lg disabled:hover:transform-none disabled:hover:shadow-none"
    };

    const sizes = {
        small: "px-4 py-2 text-sm",
        medium: "px-6 py-3 text-base",
        large: "px-8 py-4 text-lg"
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const buttonClass = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

    return (
        <button
            type={type}
            className={buttonClass}
            onClick={onClick}
            disabled={disabled || loading}
            aria-busy={loading}
        >
            {loading ? (
                <span className="w-[1em] h-[1em] border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
                <>
                    {icon && <span className="flex items-center text-[1.2em]">{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

export default Button;
