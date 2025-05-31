import React from 'react';
import { LeaderboardEntry, UserVotes } from '../types';
import { IconMap } from './Icons'; 

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  userVotes: UserVotes;
  onVote: (entryId: string, voteType: 'up' | 'down') => void;
}

const LeaderboardDisplay: React.FC<LeaderboardDisplayProps> = ({ entries, userVotes, onVote }) => {
  const ArrowUpIcon = IconMap['arrowUp'];
  const ArrowDownIcon = IconMap['arrowDown'];
  const TrophyIcon = IconMap['trophy'];

  const sortedEntries = [...entries].sort((a, b) => {
    if (b.overallRating !== a.overallRating) {
      return b.overallRating - a.overallRating;
    }
    // Secondary sort by timestamp for tie-breaking (newest first)
    return b.timestamp - a.timestamp;
  });

  const getRatingColor = (rating: number): string => {
    if (rating >= 85) return 'text-green-400';
    if (rating >= 70) return 'text-yellow-400';
    if (rating >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  if (entries.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto mt-8 text-center bg-slate-800 p-8 rounded-xl shadow-xl">
        {TrophyIcon && <TrophyIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" weight="duotone" />}
        <h2 className="text-2xl font-semibold text-slate-300 mb-2">Your Cards List is Empty</h2>
        <p className="text-slate-400">Save some cards from the 'Card Creator' tab to see them here!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-2">
      <div className="bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
                {TrophyIcon && <TrophyIcon className="w-8 h-8 text-amber-400" weight="fill" />}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                  Your Cards
                </h2>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/50">
              <tr>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-sky-300 w-16">Rank</th>
                <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-sky-300">Name</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-sky-300 w-24">Overall</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-sky-300 w-28">Credibility</th>
                <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-sky-300 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-slate-800">
              {sortedEntries.map((entry, index) => {
                const credibility = entry.upvotes - entry.downvotes;
                const userVoteForEntry = userVotes[entry.id];
                const overallColor = getRatingColor(entry.overallRating);

                return (
                  <tr key={entry.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-300 text-center">#{index + 1}</td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center">
                        {entry.imageUrl && (
                            <img src={entry.imageUrl} alt={entry.playerName} className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-slate-600 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                            <div className="font-semibold text-white truncate" title={entry.playerName}>{entry.playerName}</div>
                            <div className="text-xs text-slate-400">
                                {new Date(entry.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                      </div>
                    </td>
                    <td className={`whitespace-nowrap px-4 py-4 text-xl font-bold text-center ${overallColor}`}>{entry.overallRating}</td>
                    <td className={`whitespace-nowrap px-4 py-4 text-lg font-semibold text-center ${credibility > 0 ? 'text-green-400' : credibility < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                      {credibility >= 0 ? `+${credibility}` : credibility}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={() => onVote(entry.id, 'up')}
                          aria-label={`Upvote ${entry.playerName}`}
                          className={`p-1.5 rounded-full transition-all duration-150 ease-in-out
                            ${userVoteForEntry === 'up' ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-slate-600 hover:bg-green-500 text-slate-300 hover:text-white'}`}
                        >
                          {ArrowUpIcon ? <ArrowUpIcon className="w-5 h-5" weight="bold" /> : 'Up'}
                        </button>
                        <button
                          onClick={() => onVote(entry.id, 'down')}
                          aria-label={`Downvote ${entry.playerName}`}
                           className={`p-1.5 rounded-full transition-all duration-150 ease-in-out
                            ${userVoteForEntry === 'down' ? 'bg-red-500 text-white ring-2 ring-red-300' : 'bg-slate-600 hover:bg-red-500 text-slate-300 hover:text-white'}`}
                        >
                          {ArrowDownIcon ? <ArrowDownIcon className="w-5 h-5" weight="bold" /> : 'Down'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
         {sortedEntries.length > 0 && (
            <div className="p-4 text-xs text-center text-slate-500 border-t border-slate-700">
                Displaying {sortedEntries.length} entr{sortedEntries.length === 1 ? 'y' : 'ies'}.
            </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardDisplay;
