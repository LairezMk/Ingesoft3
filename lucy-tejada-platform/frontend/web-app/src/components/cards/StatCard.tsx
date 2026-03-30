/**
 * ============================================
 * STAT CARD COMPONENT
 * ============================================
 */

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  iconColor?: string;
  description?: string;
  loading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor = 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  description,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={clsx('card p-6', className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-8 w-32" />
            <div className="skeleton h-3 w-20" />
          </div>
          <div className="skeleton w-12 h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx('card p-6', className)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-500 dark:text-dark-400">{title}</p>

          <p className="mt-2 text-3xl font-bold text-dark-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString('es-CO') : value}
          </p>

          {change && (
            <div className="mt-2 flex items-center gap-1">
              {change.type === 'increase' && (
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {change.type === 'decrease' && (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span
                className={clsx(
                  'text-sm font-medium',
                  change.type === 'increase' && 'text-emerald-600 dark:text-emerald-400',
                  change.type === 'decrease' && 'text-red-600 dark:text-red-400',
                  change.type === 'neutral' && 'text-dark-500 dark:text-dark-400'
                )}
              >
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              <span className="text-sm text-dark-400 dark:text-dark-500">vs. mes anterior</span>
            </div>
          )}

          {description && (
            <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">{description}</p>
          )}
        </div>

        {icon && (
          <div className={clsx('p-3 rounded-xl', iconColor)}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
