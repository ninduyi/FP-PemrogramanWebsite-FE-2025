import api from '../axios';

export interface ISubmitScorePayload {
  game_id: string;
  score: number;
  time_spent?: number;
  game_data?: Record<string, any>;
}

export interface IGameScore {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  time_spent?: number;
  game_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ILeaderboardEntry {
  user_id: string;
  username: string;
  highest_score: number;
  total_plays: number;
}

export interface IUserScoreSummary {
  game_id: string;
  game_name: string;
  highest_score: number;
  total_plays: number;
  last_played: string;
}

class ScoreAPI {
  static async submitScore(payload: ISubmitScorePayload) {
    try {
      const response = await api.post(`/api/score/submit`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to submit score:', error);
      throw error;
    }
  }

  static async getHighestScore(gameId: string): Promise<IGameScore | null> {
    try {
      const response = await api.get(`/api/score/highest/${gameId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get highest score:', error);
      throw error;
    }
  }

  static async getGameHistory(gameId: string, limit: number = 10): Promise<IGameScore[]> {
    try {
      const response = await api.get(`/api/score/history/${gameId}`, {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get game history:', error);
      throw error;
    }
  }

  static async getLeaderboard(gameId: string, limit: number = 10): Promise<ILeaderboardEntry[]> {
    try {
      const response = await api.get(`/api/score/leaderboard/${gameId}`, {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  static async getAllUserScores(): Promise<IUserScoreSummary[]> {
    try {
      const response = await api.get(`/api/score/user/all-scores`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get all user scores:', error);
      throw error;
    }
  }
}

export default ScoreAPI;
