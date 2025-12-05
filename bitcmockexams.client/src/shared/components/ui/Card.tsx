import React from 'react';

interface CardProps {
    children: React.ReactNode;
    image?: string;
    imageAlt?: string;
    title?: string;
    subtitle?: string;
    badge?: string;
    hover?: boolean;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    image,
    imageAlt = '',
    title,
    subtitle,
    badge,
    hover = true,
    className = '',
    onClick
}) => {
    const hoverClasses = hover ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl group' : '';
    const cardClass = `bg-white rounded-lg overflow-hidden shadow-md transition-all duration-250 h-full flex flex-col ${hoverClasses} ${className}`;

    return (
        <div className={cardClass} onClick={onClick}>
            {image && (
                <div className="w-full h-[200px] overflow-hidden relative">
                    <img
                        src={image}
                        alt={imageAlt}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-transform duration-350 ${hover ? 'group-hover:scale-110' : ''}`}
                    />
                </div>
            )}

            <div className="p-6 flex-1 flex flex-col">
                {badge && (
                    <span className="inline-block px-3 py-1 bg-light-blue text-primary-blue text-xs font-semibold uppercase rounded-sm mb-2 w-fit">
                        {badge}
                    </span>
                )}
                {title && <h3 className="text-xl font-bold text-text-primary mb-2 leading-tight">{title}</h3>}
                {subtitle && <p className="text-sm text-text-secondary mb-4 leading-relaxed">{subtitle}</p>}
                {children}
            </div>
        </div>
    );
};

export default Card;
