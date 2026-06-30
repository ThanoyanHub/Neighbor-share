import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </h2>
        <p className="text-gray-500 mb-8">
          You might have typed the wrong address or the page may have moved.
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
