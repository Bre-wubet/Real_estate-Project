import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import propertyApi from '../api/property';

const EditProperty = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    type: 'house',
    status: 'Available',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    features: {
      bedrooms: '',
      bathrooms: '',
      area: '',
      parking: false,
      furnished: false
    },
    amenities: [],
    images: []
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const property = await propertyApi.getPropertyById(id);
        setFormData({
          title: property.title,
          description: property.description,
          price: property.price,
          type: property.type,
          status: property.status,
          location: property.location,
          features: property.features,
          images: [] // Reset images as they need to be re-uploaded
        });
      } catch (err) {
        setError(err.message || 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Price must be a positive number';
    if (!formData.location.address?.trim()) errors.address = 'Address is required';
    if (!formData.location.city?.trim()) errors.city = 'City is required';
    if (!formData.location.state?.trim()) errors.state = 'State is required';
    if (!formData.location.zipCode?.trim()) errors.zipCode = 'Zip code is required';
    if (!formData.features.bedrooms || parseInt(formData.features.bedrooms) <= 0) errors.bedrooms = 'Number of bedrooms must be a positive number';
    if (!formData.features.bathrooms || parseInt(formData.features.bathrooms) <= 0) errors.bathrooms = 'Number of bathrooms must be a positive number';
    if (!formData.features.area || parseFloat(formData.features.area) <= 0) errors.area = 'Property area must be a positive number';
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('status', formData.status);
      
      // Append location data
      Object.entries(formData.location).forEach(([key, value]) => {
        formDataToSend.append(`location[${key}]`, value.trim());
      });

      // Append features data
      Object.entries(formData.features).forEach(([key, value]) => {
        formDataToSend.append(`features[${key}]`, value);
      });

      // Append amenities
      formData.amenities.forEach(amenity => {
        formDataToSend.append('amenities[]', amenity);
      });

      // Append images
      formData.images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await propertyApi.updateProperty(id, formDataToSend, token);
      navigate('/properties');
    } catch (err) {
      setError(err.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const amenitiesList = [
    'Parking',
    'Pool',
    'Garden',
    'Security',
    'Gym',
    'Air Conditioning',
    'Heating',
    'Internet'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h1>

        {formErrors.submit && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {formErrors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Property Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.title ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.title && (
                <p className="mt-2 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.price ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.price && (
                <p className="mt-2 text-sm text-red-600">{formErrors.price}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.description ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.description && (
                <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.address ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.address && (
                <p className="mt-2 text-sm text-red-600">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                name="type"
                id="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                id="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.bedrooms ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.bedrooms && (
                <p className="mt-2 text-sm text-red-600">{formErrors.bedrooms}</p>
              )}
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                id="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.bathrooms ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.bathrooms && (
                <p className="mt-2 text-sm text-red-600">{formErrors.bathrooms}</p>
              )}
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                Area (sq ft)
              </label>
              <input
                type="number"
                name="area"
                id="area"
                value={formData.area}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${formErrors.area ? 'border-red-300' : 'border-gray-300'}`}
              />
              {formErrors.area && (
                <p className="mt-2 text-sm text-red-600">{formErrors.area}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {amenitiesList.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={amenity} className="ml-2 text-sm text-gray-700">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4 file:rounded-md
                  file:border-0 file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Property image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                  Updating...
                </div>
              ) : (
                'Update Property'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;