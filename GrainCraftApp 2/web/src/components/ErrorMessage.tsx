'use client';

import { FiAlertCircle, FiX } from 'react-icons/fi';
import { useState } from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export default function ErrorMessage({
  message,
  onRetry,
  onDismiss,
  dismissible = true,
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-slideInDown">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="text-error flex-shrink-0 mt-0.5" size={20} />

        <div className="flex-1 min-w-0">
          <p className="text-error font-medium">{message}</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-error hover:text-error/80 font-medium text-sm transition"
            >
              Retry
            </button>
          )}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="text-error hover:text-error/80 transition p-1"
              aria-label="Dismiss"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
