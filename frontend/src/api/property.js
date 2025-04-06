import axios from './axios';
import mongoose from 'mongoose';

const propertyApi = {
  // Get all properties with filters
  getProperties: async (filters) => {
    const response = await axios.get('/properties', { params: filters });
    return response.data;
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    const response = await axios.get(`/properties/${id}`);
    return response.data;
  },

  // Create new property
  createProperty: async (propertyData, token) => {
    try {
      const formData = new FormData();
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'type', 'price'];
      const requiredLocation = ['address', 'city', 'state', 'zipCode'];
      
      requiredFields.forEach(field => {
        if (!propertyData[field]) {
          throw new Error(`${field} is required`);
        }
        formData.append(field, propertyData[field]);
      });

      if (!propertyData.location || typeof propertyData.location !== 'object') {
        throw new Error('Location object is required');
      }

      requiredLocation.forEach(field => {
        if (!propertyData.location[field]) {
          throw new Error(`location.${field} is required`);
        }
      });
      formData.append('location', JSON.stringify(propertyData.location));

      // Validate and append status
      const validStatus = ['for-sale', 'for-rent', 'sold', 'rented'];
      const status = propertyData.status || 'for-sale';
      if (!validStatus.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatus.join(', ')}`);
      }
      formData.append('status', status);

      // Append features if provided
      if (propertyData.features) {
        formData.append('features', JSON.stringify(propertyData.features));
      }

      // Validate and append images
      if (!propertyData.images || !Array.isArray(propertyData.images) || propertyData.images.length === 0) {
        throw new Error('At least one image is required');
      }

      propertyData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        } else if (image instanceof Object && image.hasOwnProperty('url')) {
          // Handle existing image objects
          formData.append('existingImages', JSON.stringify(image));
        } else {
          throw new Error('Invalid image format. Must be a File object or an existing image object');
        }
      });

      const response = await axios.post('/properties', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Error creating property');
      }
      throw error;
    }
  },

  // Update property
  updateProperty: async (id, propertyData, token) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid property ID');
    }

    const formData = new FormData();
    
    // Validate location fields if provided
    if (propertyData.location) {
      const requiredLocation = ['address', 'city', 'state', 'zipCode'];
      requiredLocation.forEach(field => {
        if (propertyData.location[field] === undefined || propertyData.location[field] === '') {
          throw new Error(`location.${field} is required`);
        }
      });
    }

    // Validate status if provided
    if (propertyData.status) {
      const validStatus = ['for-sale', 'for-rent', 'sold', 'rented'];
      if (!validStatus.includes(propertyData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatus.join(', ')}`);
      }
    }

    // Append text data
    Object.keys(propertyData).forEach(key => {
      if (key !== 'images') {
        if (key === 'location' || Array.isArray(propertyData[key])) {
          formData.append(key, JSON.stringify(propertyData[key]));
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    });

    // Validate and append images if provided
    if (propertyData.images) {
      if (!Array.isArray(propertyData.images)) {
        throw new Error('Images must be an array');
      }

      propertyData.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('images', image);
        } else {
          throw new Error('Invalid image format. Must be a File object');
        }
      });
    }

    const response = await axios.put(`/properties/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete property
  deleteProperty: async (id, token) => {
    await axios.delete(`/properties/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return id;
  },

  // Toggle like property
  toggleLike: async (id, token) => {
    const response = await axios.post(`/properties/${id}/like`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
};

export default propertyApi;