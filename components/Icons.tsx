import React from 'react';
import { IconProps } from '../types';
import {
  Brain,
  Crosshair,
  UsersThree,
  Lightbulb,
  ShareNetwork,
  ArrowUp,
  ArrowDown,
  Trophy,
  FloppyDisk,
  ListBullets,
  PencilSimpleLine,
  ArrowClockwise,
  Trash, // Kept for potential future use (e.g., deleting individual entries)
  IconContext
} from 'phosphor-react';

export const IconMap: { [key: string]: React.FC<IconProps> } = {
  brain: (props) => <Brain {...props} />,
  target: (props) => <Crosshair {...props} />,
  users: (props) => <UsersThree {...props} />,
  lightbulb: (props) => <Lightbulb {...props} />,
  share: (props) => <ShareNetwork {...props} />,
  arrowUp: (props) => <ArrowUp {...props} />,
  arrowDown: (props) => <ArrowDown {...props} />,
  trophy: (props) => <Trophy {...props} />,
  save: (props) => <FloppyDisk {...props} />,
  list: (props) => <ListBullets {...props} />, 
  edit: (props) => <PencilSimpleLine {...props} />, // For Card Creator tab
  refresh: (props) => <ArrowClockwise {...props} />,
  delete: (props) => <Trash {...props} />, // Not currently used, but kept for potential
};
