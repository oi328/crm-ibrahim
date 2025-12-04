import React from 'react';
import { useTheme } from '@shared/context/ThemeProvider';

export const LeadsStatsCard = ({ title, value, change, changeType, icon, color, compact = false }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600 dark:text-green-400';
    if (changeType === 'negative') return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↗';
    if (changeType === 'negative') return '↘';
    return '→';
  };

  return (
    <div className={`bg-[var(--panel-bg)] ${compact ? 'p-2' : 'p-4'} rounded-lg shadow-md border border-[var(--panel-border)] h-full flex flex-col justify-between`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-0.5' : 'mb-2'}`}>
        <div className={`rounded-lg ${compact ? 'p-1' : 'p-2'} ${color}`}>
          <span className={`text-white ${compact ? 'text-sm' : 'text-lg'}`}>{icon}</span>
        </div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${getChangeColor()}`}>
          {getChangeIcon()} {change}
        </div>
      </div>
      <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-semibold ${isLight ? 'text-[var(--content-text)]' : 'dark:text-gray-100'} ${compact ? 'mb-0' : 'mb-1'}`}>{title}</h4>
      <p className={`${compact ? 'text-lg' : 'text-2xl'} font-bold ${isLight ? 'text-[var(--text-primary)]' : 'dark:text-gray-100'}`}>{value}</p>
    </div>
  );
};
