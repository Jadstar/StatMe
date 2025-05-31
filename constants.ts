import { StatCategory } from './types';

export const DEFAULT_STAT_VALUE = 50;
export const MAX_STAT_VALUE = 100;
export const MIN_STAT_VALUE = 0;
export const DEFAULT_PLAYER_NAME = 'YOUR NAME';

export const LEADERBOARD_ENTRIES_STORAGE_KEY = 'statMeLeaderboardEntries';
export const USER_VOTES_STORAGE_KEY = 'statMeUserVotes';


export const CATEGORIES_DATA: StatCategory[] = [
  {
    id: 'smartness',
    name: 'Smartness',
    iconKey: 'brain',
    color: 'text-sky-400',
    attributes: [
      { id: 'intelligence', label: 'Intelligence', weight: 0.4 },
      { id: 'adaptability', label: 'Adaptability', weight: 0.35 },
      { id: 'wisdom', label: 'Wisdom', weight: 0.25 },
    ],
  },
  {
    id: 'competitiveness',
    name: 'Competitiveness',
    iconKey: 'target', 
    color: 'text-red-400',
    attributes: [
      { id: 'drive', label: 'Drive', weight: 0.3 },
      { id: 'resilience', label: 'Resilience', weight: 0.25 },
      { id: 'ambition', label: 'Ambition', weight: 0.25 },
      { id: 'confidence', label: 'Confidence', weight: 0.2 },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    iconKey: 'users', 
    color: 'text-emerald-400',
    attributes: [
      { id: 'communication', label: 'Communication', weight: 0.3 },
      { id: 'inspiration', label: 'Inspiration', weight: 0.2 },
      { id: 'empathy', label: 'Empathy', weight: 0.2 },
      { id: 'decisionMaking', label: 'Decision-making', weight: 0.3 },
    ],
  },
  {
    id: 'talent',
    name: 'Talent',
    iconKey: 'lightbulb',
    color: 'text-amber-400',
    attributes: [
      { id: 'taste', label: 'Taste', weight: 0.3 },
      { id: 'creativity', label: 'Creativity', weight: 0.4 },
      { id: 'selfReflection', label: 'Self-reflection', weight: 0.3 },
    ],
  },
];
