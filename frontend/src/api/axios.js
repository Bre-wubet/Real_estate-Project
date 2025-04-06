import axios from 'axios';

const baseURL = 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000
});

// Function to check if the data contains files
const hasFiles = (data) => {
  return data instanceof FormData && Array.from(data.values()).some(value => value instanceof File);
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set appropriate Content-Type header based on data type
    if (config.data && hasFiles(config.data)) {
      config.headers['Content-Type'] = 'multipart/form-data';
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;