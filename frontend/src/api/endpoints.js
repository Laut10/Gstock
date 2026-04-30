import { api } from './client.js';

export const productsApi = {
  list:   (q = '') => api.get(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  get:    (id)     => api.get(`/api/products/${id}`),
  create: (data)   => api.post('/api/products', data),
  update: (id, d)  => api.patch(`/api/products/${id}`, d),
  remove: (id)     => api.delete(`/api/products/${id}`),
};

export const stockApi = {
  list:    ()                    => api.get('/api/stock'),
  low:     ()                    => api.get('/api/stock/low'),
  setMin:  (productId, minQty)   => api.patch(`/api/stock/${productId}/min`, { minQuantity: minQty }),
};

export const movementsApi = {
  list:   ({ productId, type } = {}) => {
    const params = new URLSearchParams();
    if (productId) params.set('productId', productId);
    if (type)      params.set('type', type);
    const qs = params.toString();
    return api.get(`/api/movements${qs ? `?${qs}` : ''}`);
  },
  create: (data) => api.post('/api/movements', data),
};
