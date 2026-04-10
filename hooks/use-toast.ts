'use client'

import * as React from 'react'

type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

const TOAST_LIMIT = 5

export type Toast = ToastProps & {
  id: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(({ ...props }: ToastProps) => {
    const id = Math.random().toString(36).slice(2)
    
    setToasts((prev) => {
      const newToasts = [...prev, { id, open: true, onOpenChange: (open: boolean) => {
        setToasts((prev2) => prev2.map((t) => t.id === id ? { ...t, open } : t))
      }, ...props }]
      
      return newToasts.slice(-TOAST_LIMIT)
    })

    return {
      id,
      dismiss: () => setToasts((prev) => prev.map((t) => t.id === id ? { ...t, open: false } : t)),
      update: (props: ToastProps) => setToasts((prev) => prev.map((t) => t.id === id ? { ...t, ...props } : t)),
    }
  }, [])

  const dismiss = (id: string) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, open: false } : t))
  }

  return { toasts, toast, dismiss }
}
