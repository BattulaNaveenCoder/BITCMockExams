import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTestSuites } from '@shared/contexts/TestSuitesContext';
import SEO from '@shared/components/SEO';
import Skeleton from '@shared/components/ui/Skeleton';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

type Category =
  | 'Azure'
  | 'AI'
  | 'Data Engineering'
  | 'Power Platform'
  | 'Security'
  | 'GitHub'
  | 'Docker'
  | 'Other';

interface ExamItem {
  title: string;
  code: string;
  pathId: string;
  difficulty: Difficulty;
  category: Category;
}

const levelOrder: Record<Difficulty, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};

function inferDifficulty(code: string, title: string): Difficulty {
  const key = code.trim().toUpperCase();
  const t = title.trim();
  const beginners = new Set(['AZ-900', 'DP-900', 'AI-900', 'PL-900']);
  const advanced = new Set(['AZ-305', 'AZ-400', 'PL-600', 'AI-102']);
  const intermediates = new Set([
    'AZ-104', 'AZ-204', 'AZ-500', 'AZ-700',
    'DP-100', 'DP-203',
    'PL-100', 'PL-200', 'PL-300', 'PL-400', 'PL-500',
    'SC-200', 'SC-300', 'SC-400',
    'GH-300', 'DCA',
  ]);

  if (beginners.has(key)) return 'Beginner';
  if (advanced.has(key)) return 'Advanced';
  if (intermediates.has(key)) return 'Intermediate';
  if (/Challenge/i.test(t) && /AZ-104/i.test(t)) return 'Intermediate';
  if (/Docker Certified Associate/i.test(t)) return 'Intermediate';
  if (/SQL Server Live Session/i.test(t)) return 'Intermediate';
  if (key.startsWith('AZ-900') || key.startsWith('DP-900') || key.startsWith('AI-900') || key.startsWith('PL-900')) return 'Beginner';
  if (key.startsWith('AZ-305') || key.startsWith('AZ-400') || key.startsWith('PL-600') || key.startsWith('AI-102')) return 'Advanced';
  return 'Intermediate';
}

function inferCategory(code: string, title: string): Category {
  const key = code.trim().toUpperCase();
  if (key.startsWith('AZ-')) return 'Azure';
  if (key.startsWith('DP-')) return 'Data Engineering';
  if (key.startsWith('AI-')) return 'AI';
  if (key.startsWith('PL-')) return 'Power Platform';
  if (key.startsWith('SC-')) return 'Security';
  if (key.startsWith('GH-')) return 'GitHub';
  if (/Docker Certified Associate/i.test(title)) return 'Docker';
  return 'Other';
}

const SiteMap: React.FC = () => {
  const { suites, loading } = useTestSuites();

  const exams: ExamItem[] = useMemo(() => {
    return suites.map((s) => {
      const code = (s.PathId || '').split(':')[0] || 'EXAM';
      const difficulty = inferDifficulty(code, s.TestSuiteTitle || '');
      const category = inferCategory(code, s.TestSuiteTitle || '');
      return {
        title: s.TestSuiteTitle || code,
        code,
        pathId: s.PathId,
        difficulty,
        category,
      } as ExamItem;
    }).sort((a, b) => levelOrder[a.difficulty] - levelOrder[b.difficulty] || a.title.localeCompare(b.title));
  }, [suites]);

  const grouped = useMemo(() => {
    const byCategory: Record<Category, Record<Difficulty, ExamItem[]>> = {
      Azure: { Beginner: [], Intermediate: [], Advanced: [] },
      AI: { Beginner: [], Intermediate: [], Advanced: [] },
      'Data Engineering': { Beginner: [], Intermediate: [], Advanced: [] },
      'Power Platform': { Beginner: [], Intermediate: [], Advanced: [] },
      Security: { Beginner: [], Intermediate: [], Advanced: [] },
      GitHub: { Beginner: [], Intermediate: [], Advanced: [] },
      Docker: { Beginner: [], Intermediate: [], Advanced: [] },
      Other: { Beginner: [], Intermediate: [], Advanced: [] },
    };
    exams.forEach(e => { byCategory[e.category][e.difficulty].push(e); });
    return byCategory;
  }, [exams]);

  const categories: Category[] = ['Azure', 'AI', 'Data Engineering', 'Power Platform', 'Security', 'GitHub', 'Docker'];

  return (
    <div className="sitemap-page">
      <SEO
        title="Sitemap | BITC Mock Exams"
        description="Browse Microsoft certification mock exams by category and difficulty. Azure, AI, Data Engineering, Power Platform, Security, GitHub, and Docker."
        keywords="sitemap, Microsoft certification mock exams, Azure exams, AI exams, Data Engineering exams, Power Platform exams, Security exams, GitHub Copilot exam, Docker Certified Associate"
        canonical="https://exam-getmicrosoftcertification.azurewebsites.net/sitemap"
        ogTitle="Sitemap | BITC Mock Exams"
        ogDescription="Discover all practice exams organized by category and difficulty."
      />

      <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-white">Sitemap</h1>
          <p className="text-xl text-white/90 max-w-[800px] mx-auto">
            Explore all certification practice exams organized by category and difficulty for quick access.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow-md">
                  <Skeleton className="h-8 w-1/2" />
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map(cat => (
                <div key={cat} className="rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-blue to-secondary-blue text-white p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">{cat}</h2>
                      <Link to={`/certification-exams?category=${encodeURIComponent(cat)}`} className="text-white/90 underline">
                        View all {cat}
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white">
                    {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map(level => (
                      <div key={level} className="rounded-lg bg-bg-light p-4">
                        <h3 className="text-lg font-semibold text-text-primary mb-2">{level}</h3>
                        {grouped[cat][level].length === 0 ? (
                          <p className="text-text-secondary text-sm">No exams listed.</p>
                        ) : (
                          <ul className="list-none m-0 p-0 space-y-2">
                            {grouped[cat][level].map((e) => (
                              <li key={`${e.code}-${e.pathId}`} className="flex items-center justify-between">
                                <Link
                                  to={`/exams/${encodeURI(e.pathId)}`}
                                  className="text-primary-blue hover:underline"
                                >
                                  {e.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SiteMap;
