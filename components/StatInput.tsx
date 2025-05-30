
import React from 'react';
import { MIN_STAT_VALUE, MAX_STAT_VALUE } from '../constants';

interface StatInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  attributeId: string; // For unique key/id if needed
  colorClass?: string; // Tailwind color class for the slider thumb/track
}

const StatInput: React.FC<StatInputProps> = ({ label, value, onChange, attributeId, colorClass = 'accent-sky-500' }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  // Dynamic style for slider progress
  const progressPercentage = ((value - MIN_STAT_VALUE) / (MAX_STAT_VALUE - MIN_STAT_VALUE)) * 100;
  const sliderStyle = {
    background: `linear-gradient(to right, currentColor ${progressPercentage}%, #4A5568 ${progressPercentage}%)`
  };


  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 text-sm">
        <label htmlFor={attributeId} className="font-medium text-gray-300">
          {label}
        </label>
        <span className={`font-semibold ${colorClass ? colorClass.replace('text-','bg-').replace('-400','-500').replace('accent-','bg-') : 'bg-sky-500'} text-white px-2 py-0.5 rounded-full text-xs`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        id={attributeId}
        name={attributeId}
        min={MIN_STAT_VALUE}
        max={MAX_STAT_VALUE}
        value={value}
        onChange={handleInputChange}
        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${colorClass}`}
        style={sliderStyle}
      />
    </div>
  );
};

export default StatInput;
