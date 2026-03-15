import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000, // 30 second timeout for long scans
});

// Request Interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
    response => response,
    error => {
        // Handle Network Errors / CORS
        if (!error.response) {
            console.error('Network/CORS Error:', error.message);
            return Promise.reject({ message: 'Network Error: Please check your connection or CORS configuration.' });
        }

        const status = error.response.status;

        // Handle 401 Unauthorized globally
        if (status === 401) {
            // Optional: Automatically clear token and force login on 401, but careful with loops
            console.warn('Unauthorized access detected.');
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }

        // Handle specific API error structures
        const customMessage = error.response.data?.message || error.response.data?.error || 'An unexpected error occurred.';

        console.error(`API Error [${status}]:`, customMessage);

        // Normalize the error to a standard format for components to catch easily
        return Promise.reject({ ...error, message: customMessage });
    }
);

export default api;
