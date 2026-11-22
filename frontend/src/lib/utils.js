//fonction utilitaire indispensable (cn) utilisée par tous les composants UI (Button, Card,..) Elle fusionne proprement 
// les classes CSS Tailwind et évite les conflits de style
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}