import { Link, useNavigate } from 'react-router-dom';
import Button from '@shared/components/ui/Button';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-[60vh] md:min-h-[70vh] flex items-center justify-center px-6 py-16 bg-gradient-to-b from-white to-light-blue">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full bg-light-blue shadow-md mb-6">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-12 h-12 text-primary-blue">
              <path fill="currentColor" d="M11.983 2a9.983 9.983 0 1 0 9.983 9.983A9.983 9.983 0 0 0 11.983 2Zm0 18.306a8.323 8.323 0 1 1 8.323-8.323 8.323 8.323 0 0 1-8.323 8.323Zm-.03-12.3a.9.9 0 0 0-.9.9v3.6a.9.9 0 1 0 1.8 0v-3.6a.9.9 0 0 0-.9-.9Zm.03 7.2a1.2 1.2 0 1 0 1.2 1.2 1.2 1.2 0 0 0-1.2-1.2Z" />
            </svg>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-blue via-secondary-blue to-accent-blue">404</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-2">Page not found</p>
          <p className="text-base md:text-lg text-text-light mb-8">
            The page you’re looking for doesn’t exist or may have moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button variant="primary" size="large" onClick={() => navigate('/')}>Go to Home</Button>
            <Link to="/contact">
              <Button variant="outline" size="large">Contact Support</Button>
            </Link>
          </div>

          <div className="mt-10 text-sm text-text-light">
            <span>Try checking the URL or return to the homepage.</span>
          </div>
        </div>
      </section>
  );
};

export default PageNotFound;
