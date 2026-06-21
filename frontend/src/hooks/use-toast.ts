'use client';
import * as React from 'react';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

type Action =
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string };

function reducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [action.toast, ...state.toasts].slice(0, 3) };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

const listeners: Array<(state: ToastState) => void> = [];
let memState: ToastState = { toasts: [] };

function dispatch(action: Action) {
  memState = reducer(memState, action);
  listeners.forEach((l) => l(memState));
}

export function toast({ title, description, variant = 'default', duration = 4000 }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  dispatch({ type: 'ADD_TOAST', toast: { id, title, description, variant, duration } });
  setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), duration);
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const idx = listeners.indexOf(setState); if (idx > -1) listeners.splice(idx, 1); };
  }, []);
  return { toasts: state.toasts, toast };
}
