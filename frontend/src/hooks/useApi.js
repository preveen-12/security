import { useState } from 'react';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const execute = async (apiPromise, onSuccess) => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await apiPromise;
            setResult(response.data);
            if (onSuccess) onSuccess(response.data);
            return response.data;
        } catch (err) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, result, error, execute, setResult, setError };
};
