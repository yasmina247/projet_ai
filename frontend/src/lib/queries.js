import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
    mutationFn: (body) => apiRequest('/api/settings', { method: 'PUT', body }),
    onSuccess: () => qc.invalidateQueries(), // devise et seuil changent plusieurs pages
  })

}
export const useInventoryProducts = ({ search = '', status = 'all', page = 1, pageSize = 15 }) =>
  useQuery({
    queryKey: ['inventory-products', search, status, page, pageSize],
    queryFn: () =>
      apiRequest(`/api/inventory/products?${new URLSearchParams({ search, status, page, page_size: pageSize })}`),
    placeholderData: keepPreviousData,
  })
export const useSales = (days) =>
  useQuery({ queryKey: ['sales', days], queryFn: () => apiRequest(`/api/analytics/sales?days=${days}`) })
// ... tes imports existants ...

export function useSignal() {
  return useQuery({
    queryKey: ['signal'],
    queryFn: () => apiRequest('/api/overview/signal'),
    // On peut ajouter un staleTime pour éviter de recalculer à chaque clic
    staleTime: 5 * 60 * 1000, 
  })
}