import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from '@mui/icons-material';

const PropertyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      // TODO: Fetch properties based on search query
    }
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    // TODO: Fetch properties based on search query
  };

  // Temporary mock data
  useEffect(() => {
    const mockProperties = Array.from({ length: 9 }, (_, index) => ({
      id: index + 1,
      title: `Luxury Villa ${index + 1}`,
      description: 'Beautiful property with modern amenities and stunning views',
      price: (1 + index) * 199000,
      location: 'Prime Location',
      bedrooms: 4,
      bathrooms: 3,
      area: 2500,
    }));
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Section */}
      <div className="mb-8">
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

      {/* Filters Section - TODO: Implement filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          {/* Add filter components here */}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-200" />
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {property.title}
              </h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>{property.bedrooms} beds</span>
                <span>{property.bathrooms} baths</span>
                <span>{property.area} sqft</span>
              </div>
              <p className="text-gray-600">{property.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-primary-600 font-bold text-xl">
                  ${property.price.toLocaleString()}
                </span>
                <button
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination - TODO: Implement pagination */}
      <div className="mt-8 flex justify-center">
        {/* Add pagination components here */}
      </div>
    </div>
  );
};

export default PropertyList;