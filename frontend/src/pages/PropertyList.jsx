import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search as SearchIcon } from '@mui/icons-material';
import { fetchProperties, setFilters } from '../redux/slices/propertySlice';

const PropertyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { properties: reduxProperties, loading: reduxLoading } = useSelector(state => state.property);

  // Get search query from URL parameters and fetch properties
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      dispatch(setFilters({ search: searchParam }));
    }
    dispatch(fetchProperties());
  }, [dispatch, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${encodeURIComponent(searchQuery)}`);
    dispatch(setFilters({ search: searchQuery }));
    dispatch(fetchProperties());
  };

  useEffect(() => {
    setProperties(reduxProperties);
    setLoading(reduxLoading);
  }, [reduxProperties, reduxLoading]);

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
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {property.images && property.images[0] && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {property.title}
              </h3>
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  {property.location?.city}, {property.location?.state}
                </p>
                <div className="flex gap-4">
                  <span>{property.features?.bedrooms || 0} beds</span>
                  <span>{property.features?.bathrooms || 0} baths</span>
                  <span>{property.features?.area || 0} sqft</span>
                </div>
              </div>
              <p className="text-gray-600">{property.description}</p>
              <div className="flex flex-col space-y-2">
                {property.features?.type && (
                  <span className="text-sm text-gray-600">Type: {property.features.type}</span>
                )}
                {property.features?.status && (
                  <span className="text-sm text-gray-600">Status: {property.features.status}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-600 font-bold text-xl">
                  ${property.price?.toLocaleString() || 'Price on request'}
                </span>
                <button
                  onClick={() => navigate(`/properties/${property._id}`)}
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