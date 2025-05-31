import React, { useState, useEffect, useCallback } from 'react';
import { PlayerStats, CategoryScores, StatCategory, LeaderboardEntry, UserVotes, AppView } from './types';
import { CATEGORIES_DATA, DEFAULT_STAT_VALUE, DEFAULT_PLAYER_NAME, LEADERBOARD_ENTRIES_STORAGE_KEY, USER_VOTES_STORAGE_KEY } from './constants';
import StatInputGroup from './components/StatInputGroup';
import PlayerCard from './components/PlayerCard';
import LeaderboardDisplay from './components/Leaderboard';
import { IconMap } from './components/Icons';
import { showToast } from './utils/toast';

const App: React.FC = () => {
  const [currentName, setCurrentName] = useState<string>(DEFAULT_PLAYER_NAME);
  const [currentImageId, setCurrentImageId] = useState<number>(() => Math.floor(Math.random() * 1000));

  const initializeStats = (): PlayerStats => {
    const initialStats: PlayerStats = {};
    CATEGORIES_DATA.forEach(category => {
      category.attributes.forEach(attr => {
        initialStats[attr.id] = DEFAULT_STAT_VALUE;
      });
    });
    return initialStats;
  };

  const [stats, setStats] = useState<PlayerStats>(initializeStats);
  const [categoryScores, setCategoryScores] = useState<CategoryScores>({});
  const [overallRating, setOverallRating] = useState<number>(0);
  
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [currentView, setCurrentView] = useState<AppView>('creator');

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(LEADERBOARD_ENTRIES_STORAGE_KEY);
      if (storedEntries) {
        setLeaderboardEntries(JSON.parse(storedEntries));
      }
      const storedVotes = localStorage.getItem(USER_VOTES_STORAGE_KEY);
      if (storedVotes) {
        setUserVotes(JSON.parse(storedVotes));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      showToast("Error loading saved data.", "error");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LEADERBOARD_ENTRIES_STORAGE_KEY, JSON.stringify(leaderboardEntries));
    } catch (error) {
      console.error("Failed to save entries to localStorage:", error);
      showToast("Error saving your cards.", "error");
    }
  }, [leaderboardEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_VOTES_STORAGE_KEY, JSON.stringify(userVotes));
    } catch (error) {
      console.error("Failed to save votes to localStorage:", error);
      showToast("Error saving your votes.", "error");
    }
  }, [userVotes]);

  const calculateScores = useCallback(() => {
    const newCategoryScores: CategoryScores = {};
    let totalWeightedSumForOverall = 0;
    let totalCategories = 0;

    CATEGORIES_DATA.forEach(category => {
      let categoryScore = 0;
      category.attributes.forEach(attr => {
        categoryScore += (stats[attr.id] || 0) * attr.weight;
      });
      const roundedCategoryScore = Math.round(categoryScore);
      newCategoryScores[category.id] = {
        score: roundedCategoryScore,
        name: category.name,
        iconKey: category.iconKey,
        color: category.color,
      };
      totalWeightedSumForOverall += roundedCategoryScore;
      totalCategories++;
    });

    setCategoryScores(newCategoryScores);
    setOverallRating(totalCategories > 0 ? Math.round(totalWeightedSumForOverall / totalCategories) : 0);
  }, [stats]);

  useEffect(() => {
    calculateScores();
  }, [calculateScores]);

  const handleStatChange = (attributeId: string, value: number) => {
    setStats(prevStats => ({ ...prevStats, [attributeId]: value }));
  };

  const handleCurrentNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(event.target.value);
  };
  
  const handleSaveToLeaderboard = () => {
    const trimmedName = currentName.trim();
    if (!trimmedName || trimmedName === DEFAULT_PLAYER_NAME) {
      showToast("Please enter a valid name for your card.", "error");
      return;
    }

    const newEntryId = trimmedName.toLowerCase().replace(/\s+/g, '-');
    const newEntry: LeaderboardEntry = {
      id: newEntryId,
      playerName: trimmedName,
      overallRating,
      categoryScores,
      upvotes: 0, // Initialized for new, preserved for existing
      downvotes: 0, // Initialized for new, preserved for existing
      timestamp: Date.now(),
      imageUrl: `https://picsum.photos/seed/${currentImageId}/200/200`,
    };

    setLeaderboardEntries(prevEntries => {
      const existingEntryIndex = prevEntries.findIndex(entry => entry.id === newEntry.id);
      if (existingEntryIndex !== -1) {
        const updatedExistingEntry = {
          ...prevEntries[existingEntryIndex], // Preserve votes
          overallRating: newEntry.overallRating,
          categoryScores: newEntry.categoryScores,
          timestamp: newEntry.timestamp,
          imageUrl: newEntry.imageUrl,
        };
        const updatedEntries = [...prevEntries];
        updatedEntries[existingEntryIndex] = updatedExistingEntry;
        showToast(`Card for "${trimmedName}" updated!`, "success");
        return updatedEntries;
      } else {
        showToast(`Card for "${trimmedName}" saved!`, "success");
        return [...prevEntries, newEntry];
      }
    });
  };

  const handleVote = (entryId: string, voteType: 'up' | 'down') => {
    setLeaderboardEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.id === entryId) {
          const currentVoteStatus = userVotes[entryId];
          let newUpvotes = entry.upvotes;
          let newDownvotes = entry.downvotes;

          // Revert previous vote if exists
          if (currentVoteStatus === 'up') newUpvotes--;
          if (currentVoteStatus === 'down') newDownvotes--;

          // Apply new vote or clear if same vote
          if (currentVoteStatus !== voteType) {
            if (voteType === 'up') newUpvotes++;
            else newDownvotes++;
            setUserVotes(prevVotes => ({ ...prevVotes, [entryId]: voteType }));
             showToast(`Vote cast for ${entry.playerName}!`, "success");
          } else { // Undoing vote
            setUserVotes(prevVotes => {
              const updatedVotes = { ...prevVotes };
              delete updatedVotes[entryId];
              return updatedVotes;
            });
            showToast("Vote removed.", "info");
          }
          return { ...entry, upvotes: Math.max(0, newUpvotes), downvotes: Math.max(0, newDownvotes) };
        }
        return entry;
      })
    );
  };
  
  const resetCard = () => {
    setCurrentName(DEFAULT_PLAYER_NAME);
    setStats(initializeStats());
    setCurrentImageId(Math.floor(Math.random() * 1000));
    showToast("Card reset to default values.", "info");
  };

  const EditIcon = IconMap['edit'];
  const TrophyIcon = IconMap['trophy'];
  const SaveIcon = IconMap['save'];
  const RefreshIcon = IconMap['refresh'];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <header className="mb-6 sm:mb-10 text-center w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 pb-2">
          StatMe
        </h1>
        <p className="text-slate-400 text-md sm:text-lg">Craft your stats. View your cards.</p>
      </header>

      <div className="mb-6 sm:mb-8 flex justify-center space-x-2 sm:space-x-4">
        <button
          onClick={() => setCurrentView('creator')}
          aria-pressed={currentView === 'creator'}
          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2
            ${currentView === 'creator' ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >
          {EditIcon && <EditIcon className="w-5 h-5" weight="bold" />}
          <span>Card Creator</span>
        </button>
        <button
          onClick={() => setCurrentView('leaderboard')}
          aria-pressed={currentView === 'leaderboard'}
          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2
            ${currentView === 'leaderboard' ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >
          {TrophyIcon && <TrophyIcon className="w-5 h-5" weight="bold" />}
          <span>Your Cards</span>
        </button>
      </div>

      {currentView === 'creator' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:pr-4 flex flex-col">
            <div className="mb-6 bg-slate-800 p-6 rounded-xl shadow-xl">
              <label htmlFor="currentName" className="block text-lg font-medium text-sky-400 mb-2">Your Name for this Card</label>
              <input
                type="text"
                id="currentName"
                value={currentName}
                onChange={handleCurrentNameChange}
                placeholder="Enter card name"
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              />
            </div>
            <div className="flex space-x-2 mb-6">
                <button
                  onClick={handleSaveToLeaderboard}
                  disabled={!currentName.trim() || currentName.trim() === DEFAULT_PLAYER_NAME}
                  title={(!currentName.trim() || currentName.trim() === DEFAULT_PLAYER_NAME) ? "Enter a valid name" : "Save card"}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                  {SaveIcon && <SaveIcon className="w-5 h-5" weight="bold" />}
                  <span>Save Card</span>
                </button>
                 <button
                  onClick={resetCard}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                 {RefreshIcon && <RefreshIcon className="w-5 h-5" weight="bold" />}
                <span>Reset Card</span>
                </button>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-420px)] lg:max-h-[calc(100vh-380px)] pr-2 custom-scrollbar">
              {CATEGORIES_DATA.map((category: StatCategory) => (
                <StatInputGroup
                  key={category.id}
                  category={category}
                  stats={stats}
                  onStatChange={handleStatChange}
                />
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] flex items-start justify-center">
            <PlayerCard
              playerName={currentName}
              overallRating={overallRating}
              categoryScores={categoryScores}
              imageUrl={`https://picsum.photos/seed/${currentImageId}/200/200`}
            />
          </div>
        </div>
      )}

      {currentView === 'leaderboard' && (
        <div className="w-full max-w-4xl mx-auto">
          <LeaderboardDisplay
            entries={leaderboardEntries}
            userVotes={userVotes}
            onVote={handleVote}
          />
        </div>
      )}
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} StatMe. Create. View. Rate.</p>
      </footer>
    </div>
  );
};

export default App;
