import { useState } from 'react';

const tabs = [
  { key: 'subscription', label: 'Subscription' },
  { key: 'reports', label: 'Exam Reports' },
];

const subscriptions = [
  { title: 'PL-300 : Power BI Data Analyst Associate', start: 'Apr 12, 2023', end: 'Dec 31, 2025', progress: 10 },
  { title: 'PL-100: Microsoft Power Platform App Maker', start: 'Apr 12, 2023', end: 'Dec 31, 2025', progress: 20 },
  { title: 'PL-900: Power Platform Fundamentals', start: 'Apr 12, 2023', end: 'Dec 31, 2025', progress: 5 },
  { title: 'PL-200: Microsoft Power Platform Functional Consultant', start: 'Apr 12, 2023', end: 'Dec 31, 2025', progress: 15 },
];

export default function Dashboard() {
  const [active, setActive] = useState('subscription');
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-4 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-6 py-2 rounded-full border ${active === t.key ? 'bg-primary-blue text-white border-primary-blue' : 'bg-white text-text-primary border-border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 'subscription' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subscriptions.map((s, i) => (
            <div key={i} className="rounded-xl shadow-md border border-border bg-white">
              <div className="px-4 pt-4">
                <h3 className="m-0 text-text-primary font-semibold text-base">{s.title}</h3>
              </div>
              <div className="p-4">
                <p className="m-0 font-semibold">Start Date: <span className="font-normal">{s.start}</span></p>
                <p className="m-0 font-semibold">End Date: <span className="font-normal">{s.end}</span></p>
                <div className="mt-4 h-2 w-full bg-border rounded-full">
                  <div className="h-2 bg-primary-blue rounded-full" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {active === 'reports' && (
        <div className="text-text-secondary">Exam Reports view coming soon.</div>
      )}
    </div>
  );
}
