import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ExamCard from '@shared/components/exams/ExamCard';
import ExamCardSkeleton from '@shared/components/exams/ExamCardSkeleton';
import { useTestSuitesApi, type TestSuite } from '@shared/api/testSuites';
import { useAuth } from '@features/auth/context/AuthContext';
import { getUserIdFromClaims } from '@shared/utils/auth';
import type { MockExam } from '../types';

const CertificationExams: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { getAllTestSuitesByUserId } = useTestSuitesApi();
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const userId = useMemo(() => getUserIdFromClaims(user as any), [user]);

  // Fetch test suites from API - always load dynamic data
  useEffect(() => {
    let mounted = true;
    const loadSuites = async () => {
      console.log('🔵 CertificationExams - Loading test suites...');
      setLoading(true);
      try {
        const data = await getAllTestSuitesByUserId(userId || '');
        console.log('✅ CertificationExams - Fetched test suites:', data?.length || 0, 'suites');
        console.log('📊 CertificationExams - First suite:', data?.[0]);
        if (mounted) {
          setSuites(data || []);
        }
      } catch (e) {
        console.error('❌ CertificationExams - Error loading test suites:', e);
        if (mounted) setSuites([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadSuites();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Helper function to determine difficulty level
  const getDifficultyLevel = (code: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (code.includes('900')) return 'Beginner';
    if (code.includes('305') || code.includes('400') || code.includes('600') || code.includes('102')) return 'Advanced';
    return 'Intermediate';
  };

  const categories = [
    { value: 'all', label: 'All Certifications' },
    { value: 'AI', label: 'AI Certification Dumps' },
    { value: 'Azure', label: 'Azure Certification Dumps' },
    { value: 'Data Engineer', label: 'Data Engineer Certification Dumps' },
    { value: 'Power Platform', label: 'Power Platform Certification Dumps' },
    { value: 'Security', label: 'SC Certification Dumps' },
    { value: 'Miscellaneous', label: 'Miscellaneous Certification Dumps' }
  ];

  // Transform API data to MockExam format with categories
  const apiTransformedExams: MockExam[] = useMemo(() => {
    if (!suites || suites.length === 0) {
      console.log('⚠️ CertificationExams - No suites data available for transformation');
      return [];
    }
    
    console.log('🔄 CertificationExams - Transforming suites to exams:', suites.length);
    
    const getCategoryFromCode = (code: string, title: string): string => {
      const upperCode = code.toUpperCase();
      if (upperCode.startsWith('AI-')) return 'AI';
      if (upperCode.startsWith('AZ-') || upperCode.includes('DOCKER')) return 'Azure';
      if (upperCode.startsWith('DP-')) return 'Data Engineer';
      if (upperCode.startsWith('PL-')) return 'Power Platform';
      if (upperCode.startsWith('SC-')) return 'Security';
      if (upperCode.includes('SQL')) return 'Miscellaneous';
      return 'Miscellaneous';
    };
    
    const transformed = suites.map((suite, idx) => {
      const code = (suite.PathId || '').split(':')[0] || 'EXAM';
      const category = getCategoryFromCode(code, suite.TestSuiteTitle || '');
      
      const exam = {
        id: idx + 1,
        title: suite.TestSuiteTitle || 'Untitled Exam',
        code,
        suiteId: suite.PKTestSuiteId,
        pathId: suite.PathId,
        vendor: 'Microsoft',
        category,
        description: suite.FKContributorName || 'Certification practice tests',
        questions: suite.totalCountQues ?? 0,
        duration: 60,
        difficulty: getDifficultyLevel(code),
        price: 0,
        rating: suite.Average ?? 0,
        students: suite.TotalLearners ?? 0,
        image: suite.ImageTestsuiteUrl || '',
      } as MockExam;
      
      return exam;
    });
    
    console.log('✅ CertificationExams - Transformed exams:', transformed.length);
    console.log('📋 CertificationExams - Sample exam:', transformed[0]);
    return transformed;
  }, [suites]);

  // Use dynamic API data only
  const examSource = useMemo(() => {
    console.log('🎯 CertificationExams - Using API data:', apiTransformedExams.length, 'exams');
    return apiTransformedExams;
  }, [apiTransformedExams]);

  const filteredExams = useMemo(() => {
    const filtered = examSource.filter(exam => {
      const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
      return matchesCategory;
    });
    console.log('🔍 CertificationExams - Filtered exams for category', selectedCategory + ':', filtered.length);
    return filtered;
  }, [examSource, selectedCategory]);

  const groupedExams = useMemo(() => {
    const grouped = categories.reduce((acc, cat) => {
      if (cat.value !== 'all') {
        acc[cat.label] = examSource.filter(exam => exam.category === cat.value);
      }
      return acc;
    }, {} as Record<string, MockExam[]>);
    console.log('📦 CertificationExams - Grouped exams:', Object.keys(grouped).map(k => `${k}: ${grouped[k].length}`).join(', '));
    return grouped;
  }, [examSource]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Link to="/" className="hover:text-primary-blue">Home</Link>
            <span>/</span>
            <strong className="text-text-primary">Exam Dumps</strong>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-2xl hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-700">Filter by Category</h2>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-base cursor-pointer hover:border-primary-blue transition-colors duration-200"
                aria-label="Filter by Category"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mb-8"></div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        ) : selectedCategory === 'all' ? (
          // Show grouped by category
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
          // Show filtered results
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
