import axios from './axios';

const propertyApi = {
  // Get all properties with optional search and filter params
  getProperties: async (params) => {
    const response = await axios.get('/properties', { params });
    return response.data;
  },

  // Get a single property by ID
  getPropertyById: async (id) => {
    const response = await axios.get(`/properties/${id}`);
    return response.data;
  },

  // Create a new property
  createProperty: async (propertyData, token) => {
    const formData = new FormData();
    
    // Append basic property data
    Object.keys(propertyData).forEach(key => {
      if (key === 'images') {
        propertyData.images.forEach(image => {
          formData.append('images', image);
        });
      } else if (key === 'location' || key === 'features') {
        formData.append(key, JSON.stringify(propertyData[key]));
      } else {
        formData.append(key, propertyData[key]);
      }
    });

    const response = await axios.post('/properties', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Update an existing property
  updateProperty: async (id, propertyData, token) => {
    const formData = new FormData();
    
    // Append updated property data
    Object.keys(propertyData).forEach(key => {
      if (key === 'images') {
        // Only append new images that are File objects
        propertyData.images.forEach(image => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (key === 'location') {
        // Append location fields individually
        Object.entries(propertyData.location).forEach(([locKey, value]) => {
          formData.append(`location[${locKey}]`, value);
        });
      } else if (key === 'features') {
        // Append features fields individually
        Object.entries(propertyData.features).forEach(([featKey, value]) => {
          formData.append(`features[${featKey}]`, value);
        });
      } else if (key === 'amenities' && Array.isArray(propertyData.amenities)) {
        // Append amenities as an array
        propertyData.amenities.forEach(amenity => {
          formData.append('amenities[]', amenity);
        });
      } else {
        formData.append(key, propertyData[key]);
      }
    });

    const response = await axios.put(`/properties/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete a property
  deleteProperty: async (id, token) => {
    const response = await axios.delete(`/properties/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  // Toggle like on a property
  toggleLike: async (id, token) => {
    const response = await axios.post(`/properties/${id}/like`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default propertyApi;