import React from 'react';
import { IconWeight } from 'phosphor-react';

export interface Attribute {
  id: string;
  label: string;
  weight: number;
}

export interface StatCategory {
  id: string;
  name: string;
  attributes: Attribute[];
  iconKey: string; // Key to look up the icon component
  color: string; // Tailwind color class for the category
}

export type PlayerStats = {
  [attributeId: string]: number;
};

export type CategoryScores = {
  [categoryId: string]: {
    score: number;
    name: string;
    iconKey: string;
    color: string;
  };
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  weight?: IconWeight; // Phosphor icons use this prop
}

export interface LeaderboardEntry {
  id: string; // Unique ID for the entry (usually derived from playerName)
  playerName: string; 
  overallRating: number;
  categoryScores: CategoryScores;
  upvotes: number;
  downvotes: number;
  timestamp: number;
  imageUrl?: string;
}

export type VoteStatus = 'up' | 'down' | undefined;

// Votes for entries within the single "Your Cards" list
export type UserVotes = { 
  [entryId: string]: VoteStatus;
};

export type AppView = 'creator' | 'leaderboard'; // 'leaderboard' now refers to "Your Cards"
