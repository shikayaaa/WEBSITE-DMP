// src/components/ui/use-toast.ts
import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    // Simple alert for now (you can enhance this with a proper toast UI later)
    const message = description ? `${title}\n${description}` : title;
    
    if (variant === 'destructive') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  return { toast, toasts };
}