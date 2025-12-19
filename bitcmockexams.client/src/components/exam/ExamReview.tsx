import React, { useEffect, useMemo, useState, useId, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTestsApi } from '@shared/api/tests';
import { useTestSuitesApi } from '@shared/api/testSuites';
import Button from '@shared/components/ui/Button';
import Skeleton from '@shared/components/ui/Skeleton';
import { FaCheck, FaTimes, FaDownload, FaShareAlt, FaInfoCircle, FaPlus, FaMinus, FaFileAlt, FaQuestionCircle, FaTimesCircle } from 'react-icons/fa';
import { decryptPayload } from '@shared/utils/crypto';
import { useAuth } from '@features/auth/context/AuthContext';
import { getUserIdFromClaims } from '@shared/utils/auth';

type ResultType = 'PASSED' | 'FAILED';

export interface ReviewOption {
	id: string;
	text: string; // Plain text or HTML string
	isCorrect: boolean;
}

export interface ReviewQuestion {
	id: string;
	index: number; // 1-based index for display and navigator
	text: string; // Plain text or HTML string
	options: ReviewOption[];
	selectedOptionIds: string[]; // Support multi-select questions
	explanation?: string; // Optional explanation (can contain HTML)
	status?: 'correct' | 'incorrect' | 'unanswered'; // Optional override from backend marks
}

export interface ExamReviewProps {
	title: string;
	examCode?: string;
	duration?: string; // e.g. 45:23
	passMark?: number; // percentage like 70
	score: number; // percentage like 75
	correct: number;
	incorrect: number;
	unanswered?: number;
	total: number;
	result: ResultType;
	questions: ReviewQuestion[];
	onDownload?: () => void;
	onShare?: () => void;
}

// Small helper to safely render content that may contain basic HTML
const HtmlBlock: React.FC<{ html: string; className?: string }> = ({ html, className }) => (
	<div
		className={className}
		dangerouslySetInnerHTML={{ __html: html }}
	/>
);

const ScoreDonut: React.FC<{ value: number } & React.SVGProps<SVGSVGElement>> = ({ value, ...svgProps }) => {
	const radius = 80;
	const stroke = 14;
	const normalizedRadius = radius - stroke / 2;
	const circumference = 2 * Math.PI * normalizedRadius;
	const clamped = Math.max(0, Math.min(100, value));
	const displayValue = Number(clamped.toFixed(1));
	const offset = circumference - (clamped / 100) * circumference;
	const gid = useId();

	return (
		<svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`} {...svgProps}>
			<defs>
				<linearGradient id={`grad-${gid}`} x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#0078D4" />
					<stop offset="100%" stopColor="#50E6FF" />
				</linearGradient>
			</defs>
			<circle
				cx={radius}
				cy={radius}
				r={normalizedRadius}
				fill="transparent"
				stroke="#E6EDF5"
				strokeWidth={stroke}
			/>
			<circle
				cx={radius}
				cy={radius}
				r={normalizedRadius}
				fill="transparent"
				stroke={`url(#grad-${gid})`}
				strokeWidth={stroke}
				strokeDasharray={`${circumference} ${circumference}`}
				strokeDashoffset={offset}
				strokeLinecap="round"
				style={{ transition: 'stroke-dashoffset 800ms ease' }}
			/>
			<text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="font-extrabold fill-text-primary" fontSize="36">
				{displayValue}%
			</text>
		</svg>
	);
};

const StatPill: React.FC<{ label: string; value: React.ReactNode; tone?: 'success' | 'error' | 'warning' | 'default' }> = ({ label, value, tone = 'default' }) => {
	const tones = {
		success: 'bg-green-50 text-green-700',
		error: 'bg-red-50 text-red-600',
		warning: 'bg-amber-50 text-amber-700',
		default: 'bg-slate-50 text-slate-700'
	} as const;
	return (
		<div className={`flex-1 rounded-xl border border-gray-200 p-5 text-center ${tones[tone]}`}>
			<div className="text-3xl font-extrabold tracking-tight">{value}</div>
			<div className="mt-1 text-sm font-medium uppercase tracking-wide opacity-80">{label}</div>
		</div>
	);
};

// Removed Question Navigator; using accordion instead

// New metric card aligned to the attached design
const MetricCard: React.FC<{ icon: React.ReactNode; value: React.ReactNode; label: string; tone?: 'success' | 'error' | 'warning' | 'default' }> = ({ icon, value, label, tone = 'default' }) => {
	const tones = {
		success: 'text-green-600',
		error: 'text-red-600',
		warning: 'text-amber-600',
		default: 'text-primary-blue'
	} as const;
	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
			<div className={`w-10 h-10 grid place-items-center rounded-full bg-light-blue ${tones[tone]}`}>{icon}</div>
			<div>
				<div className="text-2xl font-extrabold tracking-tight">{value}</div>
				<div className="text-xs font-semibold text-text-secondary uppercase mt-1">{label}</div>
			</div>
		</div>
	);
};

// Performance summary card with progress bar and required marker
const PerformanceSummary: React.FC<{ percent: number; required: number; result: ResultType | null }> = ({ percent, required, result }) => {
	const clamped = Math.max(0, Math.min(100, percent || 0));
	const requiredPct = Math.max(0, Math.min(100, required || 0));
	const isPass = result === 'PASSED';
	// Use theme colors (blue gradient) for the banner regardless of result
	const bannerClass = 'bg-gradient-to-r from-primary-blue to-secondary-blue';
	// Message pill styled to match theme, avoiding red
	const pillClass = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20';
	return (
		<div className={`rounded-2xl overflow-hidden shadow-sm ${bannerClass} text-white`}> 
			<div className="px-6 py-6 md:px-8 md:py-8">
				<div className="flex items-start justify-between">
					<div>
						<div className="text-white/90 font-semibold">Overall Performance</div>
						<div className="text-xs opacity-90">Required: {requiredPct}% to pass</div>
					</div>
					<FaTimesCircle className="opacity-90" />
				</div>

				<div className="mt-4 flex items-center gap-4">
					<div className="text-5xl font-extrabold tracking-tight">{Number(clamped).toFixed(1)}%</div>
					<span className={pillClass}>
						{isPass ? <FaCheck /> : <FaTimes />}
						{isPass ? 'Congratulations! You Passed!' : 'Commiserations! Try Again!'}
					</span>
				</div>

				{/* Progress bar */}
				<div className="mt-6">
					<div className="relative h-3 rounded-full bg-white/30">
						<div className="absolute left-0 top-0 h-3 rounded-full bg-white/70" style={{ width: `${clamped}%` }} />
						{/* Required marker */}
						<div className="absolute -top-1 h-5 w-[2px] bg-white/90" style={{ left: `${requiredPct}%` }} />
					</div>
					<div className="mt-2 flex justify-between text-xs">
						<span>0%</span>
						<span>Required: {requiredPct}%</span>
						<span>100%</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const AnswerChip: React.FC<{ state: 'correct' | 'chosen-correct' | 'chosen-incorrect' | 'neutral'; children: React.ReactNode }>
	= ({ state, children }) => {
	const styles: Record<string, string> = {
		correct: 'bg-green-50 border-green-200 text-green-800',
		'chosen-correct': 'bg-green-100 border-green-300 text-green-800',
		'chosen-incorrect': 'bg-red-100 border-red-300 text-red-800',
		neutral: 'bg-white border-gray-200 text-text-primary'
	};
	const icon = state === 'correct' || state === 'chosen-correct' ? <FaCheck className="text-green-600" /> : state === 'chosen-incorrect' ? <FaTimes className="text-red-500" /> : null;
	return (
		<div className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${styles[state]}`}>
			<div className="flex-1">{children}</div>
			{icon}
		</div>
	);
};

// Lightweight confetti overlay using canvas (no external deps)
const ConfettiOverlay: React.FC<{ active: boolean; duration?: number }> = ({ active, duration = 4000 }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (!active) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationFrame = 0;
		let running = true;

		const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
		const resize = () => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			canvas.style.width = w + 'px';
			canvas.style.height = h + 'px';
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		const onResize = () => resize();
		window.addEventListener('resize', onResize);

		const colors = ['#0078D4', '#50E6FF', '#1E90FF', '#00B7C3', '#7DD3FC', '#93C5FD'];
		type Particle = {
			x: number; y: number; vx: number; vy: number;
			size: number; color: string; rotation: number; rotationSpeed: number;
			shape: 'rect' | 'circle'; life: number;
		};
		const particles: Particle[] = [];
		const createBurst = (x: number, y: number, count: number) => {
			for (let i = 0; i < count; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = 6 + Math.random() * 4;
				particles.push({
					x, y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed - 3,
					size: 6 + Math.random() * 6,
					color: colors[Math.floor(Math.random() * colors.length)],
					rotation: Math.random() * Math.PI,
					rotationSpeed: (Math.random() - 0.5) * 0.2,
					shape: Math.random() < 0.6 ? 'rect' : 'circle',
					life: 0,
				});
			}
		};

		// Initial bursts
		const w = window.innerWidth;
		const h = window.innerHeight;
		createBurst(w * 0.25, h * 0.25, 80);
		createBurst(w * 0.75, h * 0.25, 80);
		const lateBurst = setTimeout(() => createBurst(w * 0.5, h * 0.2, 120), 300);

		const gravity = 0.15;
		const drag = 0.003;
		const fade = 0.002;
		const maxLife = duration;

		const start = performance.now();
		const render = (now: number) => {
			if (!running) return;
			const t = now - start;
			ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.life += 16;
				p.vy += gravity;
				p.vx *= (1 - drag);
				p.vy *= (1 - drag);
				p.x += p.vx;
				p.y += p.vy;
				p.rotation += p.rotationSpeed;

				if (p.y - p.size > window.innerHeight + 20 || p.life > maxLife + 1000) {
					particles.splice(i, 1);
					continue;
				}
				const alpha = Math.max(0, 1 - (t * fade) / duration);
				ctx.globalAlpha = alpha;
				ctx.fillStyle = p.color;
				ctx.save();
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation);
				if (p.shape === 'rect') {
					ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
				} else {
					ctx.beginPath();
					ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.restore();
				ctx.globalAlpha = 1;
			}
			animationFrame = requestAnimationFrame(render);
		};
		animationFrame = requestAnimationFrame(render);

		const stopTimer = setTimeout(() => {
			running = false;
			cancelAnimationFrame(animationFrame);
		}, duration + 800);

		return () => {
			running = false;
			cancelAnimationFrame(animationFrame);
			clearTimeout(stopTimer);
			clearTimeout(lateBurst);
			window.removeEventListener('resize', onResize);
		};
	}, [active, duration]);

	if (!active) return null;
	return (
		<div className="fixed inset-0 pointer-events-none z-50">
			<canvas ref={canvasRef} />
		</div>
	);
};

const labelFromIndex = (i: number) => String.fromCharCode(65 + i); // A, B, C ...

const computeStatus = (q: ReviewQuestion): 'correct' | 'incorrect' | 'unanswered' => {
	if (q.status) return q.status;
	if (!q.selectedOptionIds?.length) return 'unanswered';
	const correctIds = new Set(q.options.filter(o => o.isCorrect).map(o => o.id));
	const selected = new Set(q.selectedOptionIds);
	if (correctIds.size !== selected.size) return 'incorrect';
	for (const id of selected) if (!correctIds.has(id)) return 'incorrect';
	return 'correct';
};

const ExamReview: React.FC = () => {
	const { buyerTestId } = useParams<{ buyerTestId: string }>();
	const { getBuyerTestById, getAllExamQuestionsById, getAllOptionsWithQuestionId } = useTestsApi() as any;
	const { globalSearch, getTestSuiteByPathId } = useTestSuitesApi();
	const navigate = useNavigate();
	const [buyerTest, setBuyerTest] = useState<any | null>(null);
	const [vm, setVm] = useState<any | null>(null);
	const [examQuestions, setExamQuestions] = useState<any[] | null>(null);
	const [optionsMap, setOptionsMap] = useState<Record<string, ReviewOption[]>>({});
    const [questionsLoading, setQuestionsLoading] = useState<boolean>(false);
    const [optionsLoading, setOptionsLoading] = useState<Record<string, boolean>>({});
	const { user } = useAuth();
	const userId = useMemo(() => getUserIdFromClaims(user as any), [user]);

	useEffect(() => {
		let mounted = true;
		const fetchData = async () => {
			if (!buyerTestId) return;
			// Avoid global overlay loader on review page
			const data = await getBuyerTestById(buyerTestId, false);
			if (!mounted || !data) return;
			setBuyerTest(data);
			try {
				const parsed = data?.JsonAsString ? JSON.parse(data.JsonAsString) : null;
				setVm(parsed);
			} catch (err) {
				console.error('Failed to parse JsonAsString for buyer test:', err);
				setVm(null);
			}
		};
		fetchData();
		return () => { mounted = false; };
	}, [buyerTestId, getBuyerTestById]);

	// Fetch exam questions by TestId from parsed VM
	useEffect(() => {
		let mounted = true;
		const loadQuestions = async () => {
			const testId = vm?.FKTestId || vm?.TestId || vm?.FKTestID;
			if (!testId) return;
			setQuestionsLoading(true);
			const qs = await getAllExamQuestionsById(testId, false);
			if (!mounted) return;
			setExamQuestions(qs);
			setQuestionsLoading(false);
		};
		loadQuestions();
		return () => { mounted = false; };
	}, [vm, getAllExamQuestionsById]);


	
	// D
	// erived loading state to control initial skeletons and avoid flashing wrong status
	const isInitialLoading = !vm || examQuestions === null;

	// Static data mapping for summary once available
	const title = vm?.Title || 'Exam Review';
	const examCode = buyerTest?.FkTestID || '-';
	const formatDuration = (seconds?: number) => {
		if (!seconds || seconds <= 0) return '—';
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	};
	const duration = vm ? formatDuration(vm.DurationinSeconds) : '—';
	const passMark = vm?.PassPercentage;
	const totalMarksAllocated = vm?.TotalMarksAllocated ?? 0;
	const marksScored = vm?.Questions?.reduce((sum: number, q: any) => sum + (q?.MarksScoredForthisQuestion || 0), 0) ?? 0;
	const scorePercent = totalMarksAllocated > 0 ? (marksScored / totalMarksAllocated) * 100 : 0;
	const scoreRounded = Math.round(scorePercent);
	const scorePercentDisplay = isInitialLoading || totalMarksAllocated === 0 ? '—' : scorePercent.toFixed(1);
	const hasScoreTargets = typeof passMark === 'number' && totalMarksAllocated > 0;
	const result: ResultType | null = !isInitialLoading && hasScoreTargets
		? (scoreRounded >= (passMark as number) ? 'PASSED' : 'FAILED')
		: null;

	// Celebration: show confetti overlay when the user passes
	const [celebrate, setCelebrate] = useState(false);
	useEffect(() => {
		if (!isInitialLoading && result === 'PASSED') {
			setCelebrate(true);
			const t = setTimeout(() => setCelebrate(false), 5000);
			return () => clearTimeout(t);
		} else if (!isInitialLoading) {
			setCelebrate(false);
		}
	}, [result, isInitialLoading]);
	// Map real exam questions (if available) to review format
	const mappedQuestions: ReviewQuestion[] | null = useMemo(() => {
		if (!examQuestions || !vm?.Questions) return null;
		const vmMap = new Map<string, any>();
		vm.Questions.forEach((q: any) => vmMap.set(q.QuestionId, q));
		return examQuestions.map((q: any, idx: number) => {
			const vmQ = vmMap.get(q.PKTestQuestionId);
			// Parse SelectedOptionId which may be comma-separated (possibly trailing comma)
			const selectedOptionIds: string[] = typeof vmQ?.SelectedOptionId === 'string'
				? vmQ.SelectedOptionId.split(',').map((s: string) => s.trim()).filter(Boolean)
				: [];
			const marks = Number(vmQ?.MarksScoredForthisQuestion || 0);
			const status: 'correct' | 'incorrect' | 'unanswered' = marks > 0
				? 'correct'
				: (selectedOptionIds.length === 0 ? 'unanswered' : 'incorrect');
			return {
				id: q.PKTestQuestionId,
				index: q.SerialNumber ?? idx + 1,
				text: q.Description || '',
				options: optionsMap[q.PKTestQuestionId] || [],
				selectedOptionIds,
				explanation: q.Explanation || undefined,
				status,
			} as ReviewQuestion;
		});
	}, [examQuestions, vm, optionsMap]);

	const questions: ReviewQuestion[] = mappedQuestions ?? [];
	const total = questions.length;
	console.log('ExamReview rendered with data:', { buyerTestId, buyerTest, vm, questions });

	// Read encrypted suite details from query string and decrypt
	const location = useLocation();
	const [suiteMeta, setSuiteMeta] = useState<any | null>(null);
	useEffect(() => {
		const qs = new URLSearchParams(location.search);
		const token = qs.get('suite');
		console.log('ExamReview query parsed. Has suite token?', !!token);
		if (!token) return;
		(async () => {
			console.log('Decrypting suite token...');
			const meta = await decryptPayload(token);
			console.log('Decrypted suite meta:', meta);
			if (meta && typeof meta === 'object') setSuiteMeta(meta);
		})();
	}, [location.search]);

	// Helpers: resolve PathId and navigation handlers
	const resolvePathId = useCallback(async (): Promise<string | null> => {
		// Prefer PathId from decrypted suite metadata
		const enc = (suiteMeta as any)?.PathId || null;
		if (enc && typeof enc === 'string' && enc.trim()) return enc.trim();
		// Prefer explicit PathId if present anywhere in payloads
		const direct = (vm as any)?.PathId || (buyerTest as any)?.PathId || null;
		if (direct && typeof direct === 'string' && direct.trim()) return direct.trim();
		// Try to extract exam code like AZ-204 from title
		const title: string = (vm as any)?.Title || (buyerTest as any)?.Title || '';
		const m = title.match(/\b([A-Z]{2,3}-\d{2,3})\b/);
		const code = m?.[1];
		if (!code) return null;
		try {
			const suites = await globalSearch(code, 0, 5);
			const found = suites?.find((s: any) => (s?.PathId || '').toUpperCase().startsWith(code.toUpperCase()));
			return found?.PathId || null;
		} catch {
			return null;
		}
	}, [suiteMeta, vm, buyerTest, globalSearch]);

	const handleRetake = useCallback(async () => {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			navigate(-1);
			return;
		}
		// Fallback when there's no history (e.g., direct open)
		const pathId = (suiteMeta as any)?.PathId || await resolvePathId();
		navigate(pathId ? `/exams/${pathId}` : '/mock-exams');
	}, [navigate, suiteMeta, resolvePathId]);

	// Compute next topic/test route inside current suite
	const [nextRoute, setNextRoute] = useState<string | null>(null);
	const [topicsPathId, setTopicsPathId] = useState<string | null>(null);
	useEffect(() => {
		let mounted = true;
		const compute = async () => {
			try {
				const currentTestId: string | null = vm?.FKTestId || vm?.TestId || vm?.FKTestID || null;
				if (!currentTestId) { if (mounted) setNextRoute(null); return; }
				const pathId = (suiteMeta as any)?.PathId || await resolvePathId();
				if (!pathId) { if (mounted) setNextRoute(null); return; }
				if (mounted) setTopicsPathId(pathId);
				const details = await getTestSuiteByPathId(pathId, userId);
				const tests: any[] = details?.TestsDetailsDTO || [];
				const idx = tests.findIndex(t => (t?.PKTestId || t?.TestId) === currentTestId);
				if (idx >= 0 && idx + 1 < tests.length) {
					const next = tests[idx + 1];
					const encodedTitle = encodeURIComponent(next?.Title || 'Next');
					const route = `/exams/${pathId}/${encodedTitle}/${next?.PKTestId || next?.TestId}`;
					if (mounted) setNextRoute(route);
				} else {
					if (mounted) setNextRoute(null);
				}
			} catch (e) {
				if (mounted) setNextRoute(null);
			}
		};
		compute();
		return () => { mounted = false; };
	}, [vm, suiteMeta, resolvePathId, getTestSuiteByPathId, userId]);

	const handleNextTopic = useCallback(async () => {
		if (nextRoute) {
			navigate(nextRoute);
			return;
		}
		const pathId = topicsPathId || (await resolvePathId());
		navigate(pathId ? `/exams/${pathId}` : '/mock-exams');
	}, [nextRoute, navigate, topicsPathId, resolvePathId]);

	// Intercept browser back to route to ExamTopics
	useEffect(() => {
		debugger;
		const onPopState = async () => {
			try {
				const pathId = (suiteMeta as any)?.PathId || await resolvePathId();
				console.log('Browser back intercepted. Navigating to topics:', pathId);
				navigate(pathId ? `/exams/${pathId}` : '/mock-exams', { replace: true });
			} catch {
				navigate('/mock-exams', { replace: true });
			}
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, [suiteMeta, resolvePathId, navigate]);

    // Next Topic functionality intentionally disabled; button kept for UI consistency
	// Track expanded questions for accordion; load options on demand
	const [expanded, setExpanded] = useState<Set<string>>(new Set());
	const toggleExpanded = async (qid: string) => {
		setExpanded(prev => {
			const isOpen = prev.has(qid);
			return isOpen ? new Set() : new Set([qid]);
		});
		if (!optionsMap[qid] && !optionsLoading[qid]) {
			setOptionsLoading(prev => ({ ...prev, [qid]: true }));
			const opts = await getAllOptionsWithQuestionId(qid, false);
			if (opts && Array.isArray(opts)) {
				const mapped: ReviewOption[] = opts.map((o: any) => ({
					id: o.PKOptionId,
					text: o.Description || '',
					isCorrect: !!o.IsCorrect,
				}));
				setOptionsMap(prev => ({ ...prev, [qid]: mapped }));
			}
			setOptionsLoading(prev => ({ ...prev, [qid]: false }));
		}
	};

	const statuses = useMemo(() => questions.map(q => computeStatus(q)), [questions]);

	const computedCounts = useMemo(() => {
		let c = 0, i = 0, u = 0;
		statuses.forEach(s => {
			if (s === 'correct') c++;
			else if (s === 'incorrect') i++;
			else u++;
		});
		return { correct: c, incorrect: i, unanswered: u, total: questions.length };
	}, [statuses, questions.length]);

	return (
		<div className="min-h-screen bg-bg-light">
			{/* Header */}
			<div className="bg-gradient-to-r from-primary-blue to-secondary-blue text-white">
				<div className="w-full px-4 sm:px-6 py-6 flex items-center justify-between">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
					<div className="flex items-center gap-3">
						{/* <Button variant="secondary" onClick={onDownload} icon={<FaDownload />}>
							Download Report
						</Button>
						<Button variant="primary" onClick={onShare} icon={<FaShareAlt />}>
							Share Results
						</Button> */}
						<Button variant="secondary" size="medium" onClick={handleRetake}>
							Retake Exam
						</Button>
						<Button variant="primary" size="medium" onClick={handleNextTopic} disabled={false}>
							Next Topic
						</Button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="w-full px-4 sm:px-6 py-6 grid grid-cols-12 gap-6">
				{/* Main column */}
				<div className="col-span-12 flex flex-col gap-6">
					{/* Metrics row per attached design */}
					{isInitialLoading ? (
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
							{Array.from({ length: 5 }).map((_, i) => (
								<div key={i} className="rounded-2xl border border-gray-200 p-5">
									<Skeleton className="h-6 w-6 rounded-full mb-3" />
									<Skeleton className="h-8 w-24 mb-2" />
									<Skeleton className="h-4 w-28" />
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
							{/* Confetti celebration overlay */}
							<ConfettiOverlay active={celebrate} duration={4200} />
							<MetricCard icon={<FaCheck />} value={marksScored} label="Marks Scored" tone="success" />
							<MetricCard icon={<FaTimes />} value={computedCounts.incorrect} label="Incorrect" tone="error" />
							<MetricCard icon={<FaFileAlt />} value={totalMarksAllocated} label="Total Marks" tone="default" />
							<MetricCard icon={<FaQuestionCircle />} value={computedCounts.unanswered} label="Unanswered" tone="warning" />
							<MetricCard icon={<FaFileAlt />} value={computedCounts.total} label="Total Questions" tone="default" />
						</div>
					)}

					{/* Performance summary per attached design */}
					{isInitialLoading ? (
						<div className="rounded-2xl overflow-hidden shadow-sm bg-slate-200">
							<div className="px-6 py-6 md:px-8 md:py-8">
								<Skeleton className="h-4 w-40 mb-3" />
								<Skeleton className="h-10 w-32 mb-3" />
								<Skeleton className="h-4 w-64" />
							</div>
						</div>
					) : (
						<PerformanceSummary percent={scorePercent} required={passMark ?? 0} result={result} />
					)}

					{/* Accordion list of questions */}
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-100 font-bold text-text-primary">Questions</div>
						<ul className="divide-y divide-gray-100">
							{(mappedQuestions === null ? Array.from({ length: 5 }) : questions).map((qOr, idx) => {
								const q = mappedQuestions === null ? null : (qOr as ReviewQuestion);
								if (!q) {
									return (
										<li key={`skeleton-${idx}`} className="px-6 py-4">
											<div className="flex items-start gap-4">
												<Skeleton className="w-8 h-8 rounded-full" />
												<div className="flex-1">
													<div className="flex items-center justify-between">
														<Skeleton className="h-4 w-48" />
														<Skeleton className="h-5 w-24 rounded-full" />
													</div>
													<div className="mt-2 space-y-2">
														<Skeleton className="h-3 w-full" />
														<Skeleton className="h-3 w-11/12" />
													</div>
												</div>
											</div>
										</li>
									);
								}
								const open = expanded.has(q.id);
								const status = statuses[idx];
								return (
									<li key={q.id} className="group">
										<div
											className="px-6 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50"
											role="button"
											aria-expanded={open}
											onClick={() => toggleExpanded(q.id)}
										>
											<div className="mt-1">
												<span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-gray-700 bg-white">
													{open ? <FaMinus /> : <FaPlus />}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-3">
													<div className="font-semibold text-text-primary truncate">Question {q.index} of {total}</div>
													{status === 'correct' ? (
														<span className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold">
															<FaCheck /> Correct
														</span>
													) : status === 'incorrect' ? (
														<span className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold">
															<FaTimes /> Incorrect
														</span>
													) : (
														<span className="inline-flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1 rounded-full text-xs font-semibold">
															Unanswered
														</span>
													)}
												</div>
												{/* Summary text */}
												<div className="mt-2 text-[15px] leading-relaxed text-text-primary">
													{q.text && q.text.trim() ? (
														/<[a-z][\s\S]*>/i.test(q.text) ? (
															<HtmlBlock html={q.text} className="prose max-w-none" />
														) : (
															<p className="line-clamp-3">{q.text}</p>
														)
													) : (
														<span className="text-sm text-slate-500">This question’s content isn’t included in the saved results.</span>
													)}
												</div>

												{/* Expanded content */}
												{open && (
													<div className="mt-4 space-y-4 animate-fadeIn">
														<div className="space-y-3">
															{optionsLoading[q.id] && (!q.options || q.options.length === 0) && (
																<>
																	{Array.from({ length: 3 }).map((_, sIdx) => (
																		<div key={`opt-skel-${sIdx}`} className="p-4 border rounded-lg">
																			<div className="flex items-start gap-3">
																				<Skeleton className="w-7 h-7 rounded-md" />
																				<div className="flex-1 space-y-2">
																					<Skeleton className="h-3 w-3/4" />
																					<Skeleton className="h-3 w-2/3" />
																				</div>
																			</div>
																		</div>
																	))}
																</>
															)}

															{!optionsLoading[q.id] && q.options && q.options.length > 0 && (
																q.options.map((opt, i) => {
																	const label = labelFromIndex(i);
																	const isSelected = q.selectedOptionIds?.includes(opt.id);
																	const st: 'correct' | 'chosen-correct' | 'chosen-incorrect' | 'neutral' =
																		opt.isCorrect && isSelected
																			? 'chosen-correct'
																		: opt.isCorrect
																		? 'correct'
																		: isSelected
																		? 'chosen-incorrect'
																		: 'neutral';
																	return (
																		<AnswerChip key={opt.id} state={st}>
																			<div className="flex items-start gap-3">
																				<span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-md bg-light-blue text-primary-blue font-bold">{label}</span>
																				{/<[a-z][\s\S]*>/i.test(opt.text) ? (
																					<HtmlBlock html={opt.text} className="prose max-w-none text-[15px] leading-relaxed" />
																				) : (
																					<span className="text-[15px] leading-relaxed">{opt.text}</span>
																				)}
																		</div>
																	</AnswerChip>
																	);
																})
															)}

															{!optionsLoading[q.id] && (!q.options || q.options.length === 0) && (
																<div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
																	No options are available in these results.
																</div>
															)}
														</div>

														{q.explanation && (
															<div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
																<div className="flex items-center gap-2 font-semibold mb-2">
																	<FaInfoCircle /> Explanation
																</div>
																{/<[a-z][\s\S]*>/i.test(q.explanation) ? (
																	<HtmlBlock html={q.explanation} className="prose max-w-none text-[15px] leading-relaxed" />
																) : (
																	<p className="text-[15px] leading-relaxed">{q.explanation}</p>
																)}
															</div>
														)}
													</div>
												)}
											</div>
										</div>
									</li>
								);
							})}
							</ul>
					</div>
				</div>

				{/* No sidebar; navigator removed */}
			</div>

			{/* Minimal typography helpers when HTML appears */}
			<style>
				{`
					.prose p { margin-bottom: 0.75rem; }
					.prose ul, .prose ol { margin-left: 1.25rem; margin-bottom: 0.75rem; }
					.prose li { margin-bottom: 0.35rem; }
					.prose code { background: #f3f4f6; padding: .125rem .25rem; border-radius: .25rem; }
					.prose img { max-width: 100%; height: auto; border-radius: .5rem; margin: .75rem 0; }
					.prose table { border-collapse: collapse; width: 100%; margin: .75rem 0; }
					.prose th, .prose td { border: 1px solid #e5e7eb; padding: .5rem; text-align: left; }
					.prose th { background: #f9fafb; font-weight: 600; }
				`}
			</style>
		</div>
	);
};

export default ExamReview;

