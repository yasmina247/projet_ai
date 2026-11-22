const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function apiRequest(path, options = {}) {
  const { token, headers, ...request } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...request,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error(`La requête a échoué (${response.status}).`)
  }

  return response.json()
}
// BACKEND INTEGRATION: POST /api/auth/register — never send or store passwords in the frontend.
// BACKEND INTEGRATION: POST /api/auth/login — return a short-lived backend-issued token.
// BACKEND INTEGRATION: GET /api/auth/me — hydrate the merchant session on app start.
// BACKEND INTEGRATION: POST /api/auth/logout — revoke the backend session server-side.
// BACKEND INTEGRATION: GET/POST/PATCH/DELETE /api/products — replace product mock actions.
// BACKEND INTEGRATION: GET/PATCH /api/orders — orders created by confirmed WhatsApp purchases.
// BACKEND INTEGRATION: GET/POST /api/whatsapp/conversations — retrieve and send messages.
// BACKEND INTEGRATION: GET /api/ml/sales-forecast — load model output, not client-generated claims.
// BACKEND INTEGRATION: GET /api/recommendations — load personalized recommendations.
