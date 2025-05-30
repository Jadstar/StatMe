import React, { useState, useEffect, useCallback } from 'react';
import { PlayerStats, CategoryScores, StatCategory, PlayerLeaderboardEntry, PlayerVotes, VoteStatus, AppView } from './types';
import { CATEGORIES_DATA, DEFAULT_STAT_VALUE, DEFAULT_PLAYER_NAME, LEADERBOARD_STORAGE_KEY, VOTES_STORAGE_KEY } from './constants';
import StatInputGroup from './components/StatInputGroup';
import PlayerCard from './components/PlayerCard';
import Leaderboard from './components/Leaderboard';
import { IconMap } from './components/Icons';
import { showToast } from './utils/toast';

const App: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>(DEFAULT_PLAYER_NAME);
  const [currentImageId, setCurrentImageId] = useState<number>(Math.floor(Math.random() * 1000));

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
  
  const [leaderboard, setLeaderboard] = useState<PlayerLeaderboardEntry[]>([]);
  const [playerVotes, setPlayerVotes] = useState<PlayerVotes>({});
  const [currentView, setCurrentView] = useState<AppView>('creator');

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedLeaderboard = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (storedLeaderboard) {
        setLeaderboard(JSON.parse(storedLeaderboard));
      }
      const storedVotes = localStorage.getItem(VOTES_STORAGE_KEY);
      if (storedVotes) {
        setPlayerVotes(JSON.parse(storedVotes));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      showToast("Error loading saved data.", "error");
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
    } catch (error) {
      console.error("Failed to save leaderboard to localStorage:", error);
      showToast("Error saving leaderboard.", "error");
    }
  }, [leaderboard]);

  useEffect(() => {
    try {
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(playerVotes));
    } catch (error) {
      console.error("Failed to save votes to localStorage:", error);
       showToast("Error saving votes.", "error");
    }
  }, [playerVotes]);

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
    if (totalCategories > 0) {
      setOverallRating(Math.round(totalWeightedSumForOverall / totalCategories));
    } else {
      setOverallRating(0);
    }
  }, [stats]);

  useEffect(() => {
    calculateScores();
  }, [calculateScores]);

  const handleStatChange = (attributeId: string, value: number) => {
    setStats(prevStats => ({
      ...prevStats,
      [attributeId]: value,
    }));
  };

  const handlePlayerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  const handleSaveToLeaderboard = () => {
    if (!playerName || playerName === DEFAULT_PLAYER_NAME) {
      showToast("Please enter a valid player name.", "error");
      return;
    }
    const newEntry: PlayerLeaderboardEntry = {
      // id: `${playerName.toLowerCase()}_${Date.now()}`, // Could lead to issues if name changes case
      id: playerName.trim().toLowerCase().replace(/\s+/g, '-'), // More stable ID based on name
      playerName: playerName.trim(),
      overallRating,
      categoryScores,
      upvotes: 0,
      downvotes: 0,
      timestamp: Date.now(),
      imageUrl: `https://picsum.photos/seed/${currentImageId}/200/200`,
    };

    setLeaderboard(prevLeaderboard => {
      const existingEntryIndex = prevLeaderboard.findIndex(entry => entry.id === newEntry.id);
      if (existingEntryIndex !== -1) {
        // Update existing entry
        const updatedEntry = {
          ...prevLeaderboard[existingEntryIndex],
          overallRating: newEntry.overallRating,
          categoryScores: newEntry.categoryScores,
          timestamp: newEntry.timestamp,
          imageUrl: newEntry.imageUrl, // Update image if it changed
        };
        const newBoard = [...prevLeaderboard];
        newBoard[existingEntryIndex] = updatedEntry;
        showToast(`${newEntry.playerName}'s card updated on leaderboard!`, "success");
        return newBoard;
      } else {
        // Add new entry
        showToast(`${newEntry.playerName} added to leaderboard!`, "success");
        return [...prevLeaderboard, newEntry];
      }
    });
     // Reset for next potential card, or not? User might want to tweak current.
    // setPlayerName(DEFAULT_PLAYER_NAME);
    // setStats(initializeStats());
    // setCurrentImageId(Math.floor(Math.random() * 1000)); 
  };

  const handleVote = (entryId: string, voteType: 'up' | 'down') => {
    setLeaderboard(prevLeaderboard =>
      prevLeaderboard.map(entry => {
        if (entry.id === entryId) {
          const currentVote = playerVotes[entryId];
          let newUpvotes = entry.upvotes;
          let newDownvotes = entry.downvotes;

          if (currentVote === voteType) { // Clicking same vote again - remove vote
            if (voteType === 'up') newUpvotes--;
            else newDownvotes--;
            setPlayerVotes(prev => ({ ...prev, [entryId]: undefined }));
            showToast("Vote removed.", "info");
          } else { // New vote or changing vote
            if (currentVote === 'up') newUpvotes--; // Was upvoted, now changing
            if (currentVote === 'down') newDownvotes--; // Was downvoted, now changing
            
            if (voteType === 'up') newUpvotes++;
            else newDownvotes++;
            setPlayerVotes(prev => ({ ...prev, [entryId]: voteType }));
            showToast(`Vote cast for ${entry.playerName}!`, "success");
          }
          return { ...entry, upvotes: Math.max(0,newUpvotes), downvotes: Math.max(0,newDownvotes) };
        }
        return entry;
      })
    );
  };
  
  const resetCard = () => {
    setPlayerName(DEFAULT_PLAYER_NAME);
    setStats(initializeStats());
    setCurrentImageId(Math.floor(Math.random() * 1000));
    showToast("Card reset to default values.", "info");
  }

  const SaveIcon = IconMap['save'];
  const ListIcon = IconMap['list'];
  const EditIcon = IconMap['edit'];
  const TrophyIcon = IconMap['trophy'];
  const RefreshIcon = IconMap['refresh'];


  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 p-4 sm:p-8 flex flex-col items-center">
      <header className="mb-6 sm:mb-10 text-center w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 pb-2">
          StatMe
        </h1>
        <p className="text-slate-400 text-md sm:text-lg">Craft your stats. Share your card.</p>
      </header>

      {/* View Toggle Buttons */}
      <div className="mb-6 sm:mb-8 flex justify-center space-x-2 sm:space-x-4">
        <button
          onClick={() => setCurrentView('creator')}
          aria-pressed={currentView === 'creator'}
          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2
            ${currentView === 'creator' ? 'bg-sky-500 text-white shadow-lg ring-2 ring-sky-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >
          {EditIcon && <EditIcon className="w-5 h-5" />}
          <span>Card Creator</span>
        </button>
        <button
          onClick={() => setCurrentView('leaderboard')}
          aria-pressed={currentView === 'leaderboard'}
          className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all duration-200 ease-in-out flex items-center space-x-2
            ${currentView === 'leaderboard' ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-300' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
        >
          {TrophyIcon && <TrophyIcon className="w-5 h-5" />}
          <span>Leaderboard</span>
        </button>
      </div>

      {currentView === 'creator' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="lg:pr-4 flex flex-col">
            <div className="mb-6 bg-slate-800 p-6 rounded-xl shadow-xl">
              <label htmlFor="playerName" className="block text-lg font-medium text-sky-400 mb-2">Player Name</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={handlePlayerNameChange}
                placeholder="Enter player name"
                className="w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              />
            </div>
            <div className="flex space-x-2 mb-6">
                <button
                onClick={handleSaveToLeaderboard}
                disabled={!playerName || playerName === DEFAULT_PLAYER_NAME}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                {SaveIcon && <SaveIcon className="w-5 h-5" />}
                <span>Save to Leaderboard</span>
                </button>
                 <button
                onClick={resetCard}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 ease-in-out flex items-center justify-center space-x-2"
                >
                 {RefreshIcon && <RefreshIcon className="w-5 h-5" />}
                <span>Reset Card</span>
                </button>
            </div>
            <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-350px)] lg:max-h-[calc(100vh-320px)] pr-2 custom-scrollbar">
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

          {/* Player Card Section */}
          <div className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] flex items-start justify-center">
            <PlayerCard
              playerName={playerName}
              overallRating={overallRating}
              categoryScores={categoryScores}
              imageUrl={`https://picsum.photos/seed/${currentImageId}/200/200`}
            />
          </div>
        </div>
      )}

      {currentView === 'leaderboard' && (
        <Leaderboard
          entries={leaderboard}
          playerVotes={playerVotes}
          onVote={handleVote}
        />
      )}
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} StatMe. Create. Share. Compete.</p>
      </footer>
    </div>
  );
};

export default App;