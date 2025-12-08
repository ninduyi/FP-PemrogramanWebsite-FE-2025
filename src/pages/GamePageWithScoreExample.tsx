/**
 * CONTOH IMPLEMENTASI: Game Page dengan Score System
 * 
 * File ini menunjukkan cara mengintegrasikan score system
 * ke dalam game page yang sudah ada
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ScoreAPI, { type IGameScore } from '@/api/score';
import {
  GameResult,
  GameHistory,
  GameLeaderboard,
} from '@/components/ui/ScoreComponents';

interface GameState {
  isPlaying: boolean;
  score: number;
  startTime: number;
  endTime?: number;
}

/**
 * Main Game Component dengan Score Integration
 */
export const GamePageWithScore = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    startTime: 0,
  });

  const [highestScore, setHighestScore] = useState<IGameScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'result' | 'history' | 'leaderboard'>('result');

  if (!gameId) return <div>Game not found</div>;

  // Start Game
  const handleStartGame = () => {
    setGameState({
      isPlaying: true,
      score: 0,
      startTime: Date.now(),
    });
  };

  // End Game & Calculate Results
  const handleEndGame = async (finalScore: number) => {
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - gameState.startTime) / 1000);

    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      score: finalScore,
      endTime: endTime,
    }));

    // Submit score ke backend
    await submitScore(finalScore, timeSpent);
  };

  // Submit Score API Call
  const submitScore = async (score: number, timeSpent: number) => {
    setLoading(true);
    try {
      await ScoreAPI.submitScore({
        game_id: gameId,
        score: score,
        time_spent: timeSpent,
        game_data: {
          // Tambahkan metadata game apa pun yang relevan
          timestamp: new Date().toISOString(),
          difficulty: 'medium', // atau dari game state
        },
      });

      // Fetch highest score setelah submit berhasil
      const highest = await ScoreAPI.getHighestScore(gameId);
      setHighestScore(highest);
      setActiveTab('result');
    } catch (error) {
      console.error('Failed to submit score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Game Playing State
  if (gameState.isPlaying) {
    return (
      <div className="game-container">
        <GameCanvas
          gameId={gameId}
          onGameEnd={handleEndGame}
        />
      </div>
    );
  }

  // Render Result/History/Leaderboard
  return (
    <div className="game-results-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveTab('result')}
        >
          Result
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'result' && (
          <div>
            <GameResult
              gameId={gameId}
              score={gameState.score}
              timeSpent={
                gameState.endTime
                  ? Math.floor((gameState.endTime - gameState.startTime) / 1000)
                  : undefined
              }
              onScoreSubmitted={() => {
                // Reload highest score after submit
              }}
            />
            {highestScore && (
              <div className="highest-score-display">
                <h3>Your Highest Score: {highestScore.score}</h3>
              </div>
            )}
            <button
              onClick={handleStartGame}
              className="play-again-btn"
              disabled={loading}
            >
              Play Again
            </button>
          </div>
        )}

        {activeTab === 'history' && <GameHistory gameId={gameId} />}

        {activeTab === 'leaderboard' && <GameLeaderboard gameId={gameId} />}
      </div>
    </div>
  );
};

/**
 * Contoh Game Canvas Component (placeholder)
 */
interface GameCanvasProps {
  gameId: string;
  onGameEnd: (score: number) => void;
}

const GameCanvas = ({ gameId, onGameEnd }: GameCanvasProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onGameEnd(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [score, onGameEnd]);

  const handlePointEarned = (points: number) => {
    setScore((prev) => prev + points);
  };

  const handleGameEnd = () => {
    onGameEnd(score);
  };

  return (
    <div className="game-canvas">
      <div className="game-info">
        <div className="score-display">Score: {score}</div>
        <div className="timer">Time: {timeLeft}s</div>
      </div>

      {/* Render actual game content here */}
      <div className="game-content">
        {/* Game elements */}
      </div>

      <button onClick={handleGameEnd} className="end-game-btn">
        End Game
      </button>
    </div>
  );
};

/**
 * ALTERNATIVE: Simplified Score Submission
 * 
 * Jika Anda hanya ingin submit score tanpa UI components,
 * gunakan pattern ini:
 */
export const SimpleGameScoreSubmission = () => {
  const handleSubmitScore = async (gameId: string, score: number) => {
    try {
      const response = await ScoreAPI.submitScore({
        game_id: gameId,
        score: score,
        time_spent: 120,
      });

      if (response.data) {
        console.log('Score submitted:', response.data);
        alert(`Score ${score} submitted successfully!`);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score');
    }
  };

  return (
    <button onClick={() => handleSubmitScore('game-uuid', 100)}>
      Submit Score
    </button>
  );
};

/**
 * USER DASHBOARD DENGAN SCORE SUMMARY
 */
export const UserGameStatsDashboard = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await ScoreAPI.getAllUserScores();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="user-stats">
      <h2>Your Gaming Statistics</h2>
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.game_id} className="stat-card">
            <h3>{stat.game_name}</h3>
            <div className="stat-item">
              <label>Best Score:</label>
              <span className="value">{stat.highest_score}</span>
            </div>
            <div className="stat-item">
              <label>Times Played:</label>
              <span className="value">{stat.total_plays}</span>
            </div>
            <div className="stat-item">
              <label>Last Played:</label>
              <span className="value">
                {new Date(stat.last_played).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * STYLED CSS EXAMPLE
 * 
 * Tambahkan ke CSS file:
 */
const EXAMPLE_CSS = `
.game-results-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab.active {
  color: #0066cc;
  border-bottom-color: #0066cc;
}

.tab-content {
  min-height: 400px;
}

.game-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}

.highest-score-display {
  background: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.play-again-btn {
  padding: 12px 24px;
  font-size: 16px;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.play-again-btn:hover {
  background: #0052a3;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin-top: 0;
  color: #333;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item label {
  color: #666;
  font-weight: 500;
}

.stat-item .value {
  color: #0066cc;
  font-weight: bold;
}
`;

export default GamePageWithScore;
