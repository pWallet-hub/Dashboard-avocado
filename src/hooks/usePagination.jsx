import { useState, useEffect } from 'react';

export const usePagination = (fetchFunction, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFunction({
        ...initialParams,
        ...params,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        setData(response.data || []);
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changeLimit = (limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit]);

  return {
    data,
    pagination,
    loading,
    error,
    refetch: fetchData,
    goToPage,
    changeLimit
  };
};