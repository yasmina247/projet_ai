import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from './api'

export const useOverview = (days) =>
  useQuery({ queryKey: ['overview', days], queryFn: () => apiRequest(`/api/overview?days=${days}`) })

export const useInventoryAlerts = (limit = 50) =>
  useQuery({ queryKey: ['inventory-alerts', limit], queryFn: () => apiRequest(`/api/inventory/alerts?limit=${limit}`) })

export const useForecast = (horizon) =>
  useQuery({ queryKey: ['forecast', horizon], queryFn: () => apiRequest(`/api/analytics/forecast?horizon=${horizon}`) })

export const useSegments = () =>
  useQuery({ queryKey: ['segments'], queryFn: () => apiRequest('/api/insights/segments') })

export const useRecommendations = (productId) =>
  useQuery({
    queryKey: ['recommendations', productId],
    queryFn: () => apiRequest(`/api/insights/recommendations?product_id=${productId}&top_n=5`),
    enabled: !!productId,
  })

export const useSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => apiRequest('/api/settings') })

export const useUpdateSettings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => apiRequest('/api/settings', { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries(), // devise et seuil changent plusieurs pages
  })
}