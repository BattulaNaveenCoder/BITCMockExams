import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ExamCard from '@shared/components/exams/ExamCard';
import ExamCardSkeleton from '@shared/components/exams/ExamCardSkeleton';
import { useTestSuites } from '@shared/contexts/TestSuitesContext';
import type { MockExam } from '../types';

const CertificationExams: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [filteringInProgress, setFilteringInProgress] = useState<boolean>(false);
  
  // Use shared context instead of making individual API calls
  const { suites, loading, error } = useTestSuites();

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  const handleCategoryChange = (newCategory: string) => {
    setFilteringInProgress(true);
    setSelectedCategory(newCategory);
    // Use setTimeout to ensure UI updates before heavy filtering
    setTimeout(() => {
      setFilteringInProgress(false);
    }, 100);
  };

  const getDifficultyLevel = (code: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (code.includes('900')) return 'Beginner';
    if (code.includes('305') || code.includes('400') || code.includes('600') || code.includes('102')) return 'Advanced';
    return 'Intermediate';
  };

  const categories = useMemo(() => [
    { value: 'all', label: 'All Certifications' },
    { value: 'AI', label: 'AI Certification Dumps' },
    { value: 'Azure', label: 'Azure Certification Dumps' },
    { value: 'Data Engineering', label: 'Data Engineering Certification Dumps' },
    { value: 'Power Platform', label: 'Power Platform Certification Dumps' },
    { value: 'Security', label: 'SC Certification Dumps' },
    { value: 'Miscellaneous', label: 'Miscellaneous Certification Dumps' }
  ], []);

  const getCategoryFromCode = useMemo(() => (code: string, title: string): string => {
    const upperCode = code.toUpperCase();
    if (upperCode.startsWith('AI-')) return 'AI';
    if (upperCode.startsWith('AZ-') || upperCode.includes('DOCKER')) return 'Azure';
    if (upperCode.startsWith('DP-')) return 'Data Engineering';
    if (upperCode.startsWith('PL-')) return 'Power Platform';
    if (upperCode.startsWith('SC-')) return 'Security';
    if (upperCode.includes('SQL')) return 'Miscellaneous';
    return 'Miscellaneous';
  }, []);

  const apiTransformedExams: MockExam[] = useMemo(() => {
    if (!suites?.length) return [];

    return suites.map((suite, idx) => {
      const code = (suite.PathId || '').split(':')[0] || 'EXAM';
      return {
        id: idx + 1,
        title: suite.TestSuiteTitle || 'Untitled Exam',
        code,
        suiteId: suite.PKTestSuiteId,
        pathId: suite.PathId,
        vendor: 'Microsoft',
        category: getCategoryFromCode(code, suite.TestSuiteTitle || ''),
        description: suite.FKContributorName || 'Certification practice tests',
        questions: suite.totalCountQues ?? 0,
        duration: 60,
        difficulty: getDifficultyLevel(code),
        price: 0,
        rating: suite.Average ?? 0,
        students: suite.TotalLearners ?? 0,
        image: suite.ImageTestsuiteUrl || '',
      } as MockExam;
    });
  }, [suites, getCategoryFromCode]);

  const filteredExams = useMemo(() => {
    if (selectedCategory === 'all') return apiTransformedExams;
    return apiTransformedExams.filter(exam => exam.category === selectedCategory);
  }, [apiTransformedExams, selectedCategory]);

  const groupedExams = useMemo(() => {
    const grouped: Record<string, MockExam[]> = {};
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        grouped[cat.label] = [];
      }
    });
    
    apiTransformedExams.forEach(exam => {
      const cat = categories.find(c => c.value === exam.category);
      if (cat && cat.label) {
        if (!grouped[cat.label]) grouped[cat.label] = [];
        grouped[cat.label].push(exam);
      }
    });
    
    return grouped;
  }, [apiTransformedExams, categories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: apiTransformedExams.length };
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        counts[cat.value] = apiTransformedExams.filter(e => e.category === cat.value).length;
      }
    });
    return counts;
  }, [apiTransformedExams, categories]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-blue to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Microsoft Certification Exam Questions
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Analyzing where you stand in your career is the first step to building a strong one.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link to="/" className="hover:text-primary-blue">Home</Link>
            <span>/</span>
            <strong className="text-text-primary">Exam Dumps</strong>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-2xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-700">Filter by Category</h2>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-blue border-t-transparent"></div>
                )}
              </div>
              {!loading && suites.length > 0 && (
                <div className="text-sm text-gray-500">
                  Showing {filteredExams.length} of {apiTransformedExams.length} exams
                </div>
              )}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loading}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-base cursor-pointer hover:border-primary-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Filter by Category"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} {!loading && categoryCounts[cat.value] !== undefined ? `(${categoryCounts[cat.value]})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mb-4"></div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Error Loading Exams</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredExams.length === 0 && !loading ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No exams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No certification exams available in this category.
            </p>
            <button
              onClick={() => handleCategoryChange('all')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-blue hover:bg-blue-700"
            >
              View All Exams
            </button>
          </div>
        ) : selectedCategory === 'all' ? (
          Object.entries(groupedExams).map(([categoryName, exams]) => (
            exams.length > 0 && (
              <div key={categoryName} className="mb-12">
                <h2 className="text-2xl font-bold text-primary-blue mb-6">{categoryName}:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {exams.map(exam => (
                    <ExamCard key={exam.id} exam={exam} hideVendorTag={true} />
                  ))}
                </div>
              </div>
            )
          ))
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-primary-blue mb-6">
              {categories.find(c => c.value === selectedCategory)?.label}:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} hideVendorTag={true} />
              ))}
            </div>
          </div>
        )}

        {!loading && filteredExams.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-text-secondary">No exams found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationExams;
