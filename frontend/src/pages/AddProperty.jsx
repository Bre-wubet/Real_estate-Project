import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../redux/slices/propertySlice';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Typography,
  Box,
  Paper,
  FormHelperText,
  Chip,
  Stack
} from '@mui/material';

const AddProperty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.property);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    type: '',
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
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const propertyTypes = ['house', 'apartment', 'condo', 'land', 'commercial'];
  const commonAmenities = [
    'Air Conditioning',
    'Swimming Pool',
    'Garden',
    'Gym',
    'Security System',
    'Elevator',
    'Parking',
    'Balcony'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [name]: checked }
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.type) errors.type = 'Property type is required';
    if (!formData.location.address) errors['location.address'] = 'Address is required';
    if (!formData.location.city) errors['location.city'] = 'City is required';
    if (!formData.location.state) errors['location.state'] = 'State is required';
    if (!formData.location.zipCode) errors['location.zipCode'] = 'ZIP code is required';
    if (!formData.features.bedrooms) errors['features.bedrooms'] = 'Number of bedrooms is required';
    if (!formData.features.bathrooms) errors['features.bathrooms'] = 'Number of bathrooms is required';
    if (!formData.features.area) errors['features.area'] = 'Area is required';
    if (imageFiles.length === 0) errors.images = 'At least one image is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'location' || key === 'features') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key !== 'images') {
        formDataToSend.append(key, formData[key]);
      }
    });

    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);
    });

    try {
      await dispatch(createProperty(formDataToSend)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      setFormErrors({
        submit: err.message || 'Failed to create property'
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Property
        </Typography>

        {formErrors.submit && (
          <Typography color="error" sx={{ mb: 2 }}>
            {formErrors.submit}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.type}>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Property Type"
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.type && (
                  <FormHelperText>{formErrors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                error={!!formErrors['location.address']}
                helperText={formErrors['location.address']}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                error={!!formErrors['location.city']}
                helperText={formErrors['location.city']}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="location.state"
                value={formData.location.state}
                onChange={handleChange}
                error={!!formErrors['location.state']}
                helperText={formErrors['location.state']}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="location.zipCode"
                value={formData.location.zipCode}
                onChange={handleChange}
                error={!!formErrors['location.zipCode']}
                helperText={formErrors['location.zipCode']}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="features.bedrooms"
                type="number"
                value={formData.features.bedrooms}
                onChange={handleChange}
                error={!!formErrors['features.bedrooms']}
                helperText={formErrors['features.bedrooms']}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="features.bathrooms"
                type="number"
                value={formData.features.bathrooms}
                onChange={handleChange}
                error={!!formErrors['features.bathrooms']}
                helperText={formErrors['features.bathrooms']}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Area (sq ft)"
                name="features.area"
                type="number"
                value={formData.features.area}
                onChange={handleChange}
                error={!!formErrors['features.area']}
                helperText={formErrors['features.area']}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.features.parking}
                    onChange={handleCheckbox}
                    name="parking"
                  />
                }
                label="Parking Available"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.features.furnished}
                    onChange={handleCheckbox}
                    name="furnished"
                  />
                }
                label="Furnished"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {commonAmenities.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Images
              </Typography>
              <input
                accept="image/*"
                type="file"
                multiple
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span">
                  Upload Images
                </Button>
              </label>
              {formErrors.images && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {formErrors.images}
                </Typography>
              )}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {previewUrls.map((url, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 100
                    }}
                  >
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        minWidth: 'auto',
                        p: 0.5
                      }}
                    >
                      ×
                    </Button>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Creating...' : 'Create Property'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddProperty;
