import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(apiFunction: () => Promise<T>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getProducts(page);
      setProducts(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.searchProducts(query);
      setProducts(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    searchProducts,
  };
}

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getOrders();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
  };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (token: string, provider: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.loginWithToken(token, provider);
      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.loginAsGuest();
      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    loginAsGuest,
    logout,
  };
}
