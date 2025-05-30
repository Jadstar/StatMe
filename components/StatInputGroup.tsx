
import React from 'react';
import { StatCategory, PlayerStats } from '../types';
import StatInput from './StatInput';
import { IconMap } from './Icons';

interface StatInputGroupProps {
  category: StatCategory;
  stats: PlayerStats;
  onStatChange: (attributeId: string, value: number) => void;
}

const StatInputGroup: React.FC<StatInputGroupProps> = ({ category, stats, onStatChange }) => {
  const IconComponent = IconMap[category.iconKey];

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl mb-6">
      <div className="flex items-center mb-4">
        {IconComponent && <IconComponent className={`w-6 h-6 mr-3 ${category.color}`} />}
        <h3 className={`text-xl font-semibold ${category.color}`}>{category.name}</h3>
      </div>
      {category.attributes.map((attr) => (
        <StatInput
          key={attr.id}
          attributeId={attr.id}
          label={attr.label}
          value={stats[attr.id]}
          onChange={(value) => onStatChange(attr.id, value)}
          colorClass={category.color.replace('text-','accent-')}
        />
      ))}
    </div>
  );
};

export default StatInputGroup;
