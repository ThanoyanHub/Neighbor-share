import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Unauthorized</h1>
        <p className="text-xl text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <Link 
          to="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
