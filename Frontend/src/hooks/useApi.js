import { useState, useCallback } from 'react';
import api from '../services/api';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const request = useCallback(async (method, url, body = null, config = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.request({
        method,
        url,
        data: body,
        ...config
      });
      
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return request('GET', url, null, config);
  }, [request]);

  const post = useCallback((url, body, config = {}) => {
    return request('POST', url, body, config);
  }, [request]);

  const put = useCallback((url, body, config = {}) => {
    return request('PUT', url, body, config);
  }, [request]);

  const del = useCallback((url, config = {}) => {
    return request('DELETE', url, null, config);
  }, [request]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    get,
    post,
    put,
    delete: del,
    clearError,
    clearData,
    request
  };
};

export default useApi;