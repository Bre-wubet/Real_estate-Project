import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative bg-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Find Your Dream Home
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Discover the perfect property that matches your lifestyle and dreams
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by location, property type, or keywords"
                  className="flex-1 px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white transition-colors"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          <p className="mt-4 text-lg text-gray-600">
            Explore our handpicked selection of premium properties
          </p>
        </div>

        {/* Property Grid - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200" />
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Luxury Villa {item}
                </h3>
                <p className="text-gray-600">
                  Beautiful property with modern amenities and stunning views
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-bold text-xl">
                    $1,{item}99,000
                  </span>
                  <button
                    onClick={() => navigate(`/properties/${item}`)}
                    className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to Find Your Perfect Home?
          </h2>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/properties')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Properties
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-3 bg-white text-primary-600 rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;