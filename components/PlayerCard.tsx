import React from 'react';
import { CategoryScores } from '../types';
import { IconMap } from './Icons';
import { showToast } from '../utils/toast';
import { DEFAULT_PLAYER_NAME } from '../constants';

interface PlayerCardProps {
  playerName: string;
  overallRating: number;
  categoryScores: CategoryScores;
  imageUrl?: string;
  onShare?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ playerName, overallRating, categoryScores, imageUrl, onShare }) => {
  
  const getRatingColor = (rating: number): string => {
    if (rating >= 85) return 'text-green-400 border-green-400';
    if (rating >= 70) return 'text-yellow-400 border-yellow-400';
    if (rating >= 50) return 'text-orange-400 border-orange-400';
    return 'text-red-400 border-red-400';
  };

  const overallRatingColor = getRatingColor(overallRating);
  const ShareIcon = IconMap['share'];
  const displayName = playerName.trim() === '' || playerName === DEFAULT_PLAYER_NAME ? DEFAULT_PLAYER_NAME : playerName;


  const handleShare = async () => {
    const textToShare = `Check out the StatMe card for ${displayName === DEFAULT_PLAYER_NAME ? 'this amazing profile' : displayName}! Overall Rating: ${overallRating}. Create yours on StatMe!`;
    const shareData = {
      title: 'StatMe Card',
      text: textToShare,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Card shared successfully!');
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        showToast('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        showToast('Sharing failed, link copied to clipboard instead.');
      } catch (copyError) {
        console.error('Error copying to clipboard:', copyError);
        showToast('Could not share or copy link.');
      }
    }
    if(onShare) onShare();
  };


  return (
    <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 hover:scale-105 relative">
      {ShareIcon && (
        <button
            onClick={handleShare}
            aria-label="Share card"
            className="absolute top-4 right-4 p-2 bg-slate-600/50 hover:bg-sky-500 rounded-full text-white transition-colors"
          >
            <ShareIcon className="w-5 h-5" weight="bold" />
          </button>
        )}
      <div className="flex flex-col items-center pt-4">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={displayName} 
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-600 shadow-lg mb-4"
          />
        )}
         <h2 className="text-3xl font-bold text-white tracking-wide break-all text-center max-w-full px-2">
          {displayName}
        </h2>
        <div className={`mt-2 text-7xl font-extrabold ${overallRatingColor.split(' ')[0]}`}>
          {overallRating}
        </div>
        <div className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-6">Overall Rating</div>
      </div>

      <div className="mt-6 space-y-4">
        {Object.entries(categoryScores).map(([categoryId, { score, name, iconKey, color }]) => {
          const IconComponent = IconMap[iconKey];
          const categoryRatingColor = getRatingColor(score);
          return (
            <div key={categoryId} className="bg-slate-700/50 p-4 rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center">
                {IconComponent && <IconComponent className={`w-6 h-6 mr-3 ${color}`} weight="regular" />}
                <span className={`text-lg font-medium ${color}`}>{name}</span>
              </div>
              <span className={`text-2xl font-bold ${categoryRatingColor.split(' ')[0]}`}>{score}</span>
            </div>
          );
        })}
      </div>
       <div className="mt-8 text-center text-xs text-slate-500">
        Powered by StatMe&trade;
      </div>
    </div>
  );
};

export default PlayerCard;