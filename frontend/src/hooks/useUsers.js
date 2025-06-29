// frontend/src/hooks/useUsers.js
import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useUsers = (initialParams = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [params, setParams] = useState(initialParams);

  // Fetch users function
  const fetchUsers = useCallback(async (searchParams = params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUsers(searchParams);
      
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Create user function
  const createUser = async (userData) => {
    try {
      const response = await apiService.createUser(userData);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return response;
      }
    } catch (err) {
      throw err;
    }
  };

  // Update user function
  const updateUser = async (id, userData) => {
    try {
      const response = await apiService.updateUser(id, userData);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return response;
      }
    } catch (err) {
      throw err;
    }
  };

  // Delete user function
  const deleteUser = async (id) => {
    try {
      const response = await apiService.deleteUser(id);
      if (response.success) {
        await fetchUsers(); // Refresh the list
        return response;
      }
    } catch (err) {
      throw err;
    }
  };

  // Update search parameters
  const updateParams = (newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    params,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    updateParams,
    refetch: fetchUsers
  };
};

export default useUsers;