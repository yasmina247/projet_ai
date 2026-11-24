const ISO = { DH: 'MAD', MAD: 'MAD', EUR: 'EUR', '€': 'EUR', USD: 'USD', $: 'USD' }

export function formatMoney(value, currency = 'EUR') {
  const code = ISO[currency] ?? currency
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${Math.round(value).toLocaleString('fr-FR')} ${currency}`
  }
}

export function formatDelta(pct) {
  if (pct == null) return '—'
  return `${pct > 0 ? '+' : ''}${pct.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}%`
}

export const formatDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
export const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`