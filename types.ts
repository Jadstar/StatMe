import React from 'react';

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
}

export interface PlayerLeaderboardEntry {
  id: string; // Unique ID for the entry, could be playerName + timestamp or just a UUID
  playerName: string;
  overallRating: number;
  categoryScores: CategoryScores; // Store the detailed scores too
  upvotes: number;
  downvotes: number;
  timestamp: number; // To sort by latest if ratings are same or for recency
  imageUrl?: string; // Store image URL used at the time of saving
}

export type VoteStatus = 'up' | 'down' | undefined;

export type PlayerVotes = {
  [entryId: string]: VoteStatus;
};

export type AppView = 'creator' | 'leaderboard';