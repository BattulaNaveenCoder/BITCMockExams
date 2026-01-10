import React from 'react';
import Button from './Button';
import microsoftLogo from '../../../assets/microsoft.png';

export interface PromoAdProps {
  brand?: string;
  title: string;
  price: string | number;
  oldPrice?: string | number;
  description?: string;
  highlight?: string;
  contactName?: string;
  phone?: string; // e.g. +91999...
  email?: string;
  note?: string;
  ctaUrl?: string;
  className?: string;
}

const PromoAd: React.FC<PromoAdProps> = ({
  brand,
  title,
  price,
  oldPrice,
  description,
  highlight,
  contactName,
  phone,
  email,
  note,
  ctaUrl,
  className,
}) => {
  const checklist = [
    'Globally Recognized Certification',
    'Accepted by Top MNCs',
    'Valid for All Azure Role-Based Exams',
    'Official Microsoft Exam Voucher',
  ];

  return (
    <div className={`rounded-2xl bg-gradient-to-r from-primary-blue to-secondary-blue text-white p-6 md:p-8 shadow-xl ring-1 ring-white/15 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 grid place-items-center rounded-md bg-white/10">
          {brand && brand.toLowerCase() === 'microsoft' ? (
            <img src={microsoftLogo} alt="Microsoft" className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-xs font-bold">{brand ? brand.substring(0, 2).toUpperCase() : 'AD'}</span>
          )}
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-wider text-white/75">{brand || 'Microsoft'}</p>
          <h3 className="text-lg md:text-xl font-semibold leading-tight">{title || 'Microsoft Certification Exam Vouchers'}</h3>
        </div>
      </div>

      {/* Highlight pill */}
      {highlight && (
        <div className="mb-6">
          <span className="inline-flex items-center rounded-full bg-white/10 text-amber-300 font-semibold px-3 py-1 shadow-sm">
            {highlight}
          </span>
        </div>
      )}

      {/* Main content: 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Price card */}
        <div>
          <div className="bg-white/10 rounded-xl p-4 md:p-5 shadow-inner ring-1 ring-white/15">
            <div className="flex items-baseline gap-4">
              {oldPrice && (
                <div className="text-red-200 text-sm md:text-base line-through decoration-2 decoration-red-400">
                  {oldPrice}
                </div>
              )}
              <div className="text-4xl md:text-5xl font-extrabold leading-none tracking-tight drop-shadow-sm">{price}</div>
            </div>
            <div className="mt-3">
              <div className="h-9 md:h-10 rounded-md bg-white/20 text-white grid place-items-center text-sm md:text-base font-semibold">
                Microsoft Azure Exam Voucher
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            <p className="text-white/90 text-sm">Microsoft Azure Exam Voucher</p>
            <p className="inline-flex items-center rounded-full bg-amber-400/20 text-amber-300 text-sm font-semibold px-3 py-1 shadow-sm">
              Limited Time Deccansoft Offer
            </p>
            {description && (
              <p className="text-white/90 text-sm leading-relaxed mt-2">{description}</p>
            )}
          </div>
        </div>

        {/* Middle: Contact + CTA */}
        <div className="flex flex-col items-start">
          <p className="text-white/85 text-base">For further details or inquiries, please contact: </p>
          {contactName && <p className="font-medium mt-1">{contactName}</p>}
          {phone && (
            <p className="mt-1">
              <a className="underline hover:text-white" href={`tel:${phone}`}>{phone}</a>
            </p>
          )}
          {email && (
            <p className="mt-2">
              <a
                href={`mailto:${email}`}
                className="inline-block rounded-md bg-white text-primary-blue px-3 py-1.5 font-semibold shadow-sm hover:opacity-90"
              >
                {email}
              </a>
            </p>
          )}
          {note && (
            <p className="text-xs text-white/70 mt-2">{note}</p>
          )}

          <div className="mt-6 w-full max-w-sm">
            <Button
              variant="secondary"
              size="large"
              fullWidth
              onClick={() => {
                const url = ctaUrl || 'https://www.getmicrosoftcertification.com/Home/Vouchers';
                window.open(url, '_blank');
              }}
            >
              BUY EXAM VOUCHER NOW
            </Button>
            <p className="text-[12px] text-white/80 mt-2">Limited vouchers available • First come first serve</p>
          </div>
        </div>

        {/* Right: Checklist */}
        <div className="space-y-3">
          {checklist.map((item) => (
            <div key={item} className="flex items-center gap-3 bg-white/15 rounded-lg p-3 ring-1 ring-white/10">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-light-blue text-primary-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <span className="text-sm md:text-base font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoAd;
