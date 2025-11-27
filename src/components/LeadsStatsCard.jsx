import React from 'react';
import { useTranslation } from 'react-i18next';

export const LeadsStatsCard = ({ title, value, change, changeType, icon, color, compact = false }) => {
  const { t } = useTranslation();
  
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
    <div className={`bg-[var(--panel-bg)] ${compact ? 'p-2' : 'p-4'} rounded-lg shadow-md border border-[var(--panel-border)]`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-0.5' : 'mb-2'}`}>
        <div className={`rounded-lg ${compact ? 'p-1' : 'p-2'} ${color}`}>
          <span className={`text-white ${compact ? 'text-sm' : 'text-lg'}`}>{icon}</span>
        </div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${getChangeColor()}`}>
          {getChangeIcon()} {change}
        </div>
      </div>
      <h4 className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text ${compact ? 'mb-0' : 'mb-1'}`}>{title}</h4>
      <p className={`${compact ? 'text-lg' : 'text-2xl'} font-bold`}>{value}</p>
    </div>
  );
};
