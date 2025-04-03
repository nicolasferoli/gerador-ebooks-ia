'use client';

import React from 'react';
import { Progress } from '../../components/ui/progress';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  color?: 'default' | 'purple' | 'blue' | 'green';
}

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  className,
  height = 'md',
  animated = true,
  color = 'purple'
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    default: 'bg-slate-600',
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600'
  };

  const roundedPercentage = Math.round(value);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span>{label}</span>}
          {showPercentage && <span>{roundedPercentage}%</span>}
        </div>
      )}
      <Progress 
        value={value} 
        className={cn('w-full bg-gray-200 rounded-full dark:bg-gray-700', heightClasses[height])} 
        indicatorClassName={cn(
          colorClasses[color], 
          animated && 'animate-pulse',
          'transition-all duration-300 ease-in-out'
        )}
      />
    </div>
  );
} 