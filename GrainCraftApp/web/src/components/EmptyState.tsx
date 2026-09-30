'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({
  icon = '📦',
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-sm">
        {message}
      </p>
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
