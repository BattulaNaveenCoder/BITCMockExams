import { useLoader } from '@shared/contexts/LoadingContext';

const Loader = () => {
  const { loading } = useLoader();
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/60 border-t-transparent" />
    </div>
  );
};

export default Loader;
