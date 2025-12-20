import { useEffect, useState } from "react";
import ScoreAPI, { type IGameScore, type IUserScoreSummary } from "@/api/score";

interface GameResultProps {
  gameId: string;
  score: number;
  timeSpent?: number;
  onScoreSubmitted?: () => void;
}

/**
 * Component untuk menampilkan hasil game dan submit score
 */
export const GameResult = ({
  gameId,
  score,
  timeSpent,
  onScoreSubmitted,
}: GameResultProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highestScore, setHighestScore] = useState<IGameScore | null>(null);

  const handleSubmitScore = async () => {
    setLoading(true);
    setError(null);

    try {
      await ScoreAPI.submitScore({
        game_id: gameId,
        score,
        time_spent: timeSpent,
      });

      // Fetch highest score setelah submit
      const highest = await ScoreAPI.getHighestScore(gameId);
      setHighestScore(highest);

      onScoreSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-result">
      <h2>Game Complete!</h2>
      <div className="result-info">
        <div className="score-display">
          <p className="current-score">Your Score: {score}</p>
          {timeSpent && <p className="time-spent">Time: {timeSpent}s</p>}
        </div>

        {highestScore && (
          <div className="highest-score">
            <p className="label">Highest Score:</p>
            <p className="value">{highestScore.score}</p>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <button
          onClick={handleSubmitScore}
          disabled={loading}
          className="submit-btn"
        >
          {loading ? "Submitting..." : "Submit Score"}
        </button>
      </div>
    </div>
  );
};

/**
 * Component untuk menampilkan history scores
 */
export const GameHistory = ({ gameId }: { gameId: string }) => {
  const [history, setHistory] = useState<IGameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await ScoreAPI.getGameHistory(gameId, 10);
        setHistory(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch history",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [gameId]);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="game-history">
      <h3>Score History</h3>
      {history.length === 0 ? (
        <p>No scores yet. Play to record your first score!</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Score</th>
              <th>Time (s)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td className="score">{item.score}</td>
                <td className="time">{item.time_spent || "-"}</td>
                <td className="date">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/**
 * Component untuk menampilkan leaderboard
 */
export const GameLeaderboard = ({ gameId }: { gameId: string }) => {
  const [leaderboard, setLeaderboard] = useState<
    {
      user_id: string;
      username: string;
      highest_score: number;
      total_plays: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await ScoreAPI.getLeaderboard(gameId, 10);
        setLeaderboard(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch leaderboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [gameId]);

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leaderboard">
      <h3>Top Scores</h3>
      {leaderboard.length === 0 ? (
        <p>No scores yet</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Highest Score</th>
              <th>Plays</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((item, index) => (
              <tr key={item.user_id}>
                <td className="rank">{index + 1}</td>
                <td className="player">{item.username}</td>
                <td className="score">{item.highest_score}</td>
                <td className="plays">{item.total_plays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

/**
 * Component untuk menampilkan user stats/dashboard
 */
export const UserScoresDashboard = () => {
  const [scores, setScores] = useState<IUserScoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllScores = async () => {
      try {
        const data = await ScoreAPI.getAllUserScores();
        setScores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch scores");
      } finally {
        setLoading(false);
      }
    };

    fetchAllScores();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="scores-dashboard">
      <h2>Your Game Statistics</h2>
      {scores.length === 0 ? (
        <p>You haven't played any games yet. Start playing!</p>
      ) : (
        <div className="scores-grid">
          {scores.map((item) => (
            <div key={item.game_id} className="score-card">
              <h4>{item.game_name}</h4>
              <div className="stat">
                <span className="label">Highest Score:</span>
                <span className="value">{item.highest_score}</span>
              </div>
              <div className="stat">
                <span className="label">Total Plays:</span>
                <span className="value">{item.total_plays}</span>
              </div>
              <div className="stat">
                <span className="label">Last Played:</span>
                <span className="value">
                  {new Date(item.last_played).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
