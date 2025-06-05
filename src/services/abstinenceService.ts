import { AbstinenceChallenge, AbstinenceLog, AbstinenceStats } from '@/types/abstinence';

class AbstinenceService {
  private baseUrl = '/api/abstinence';

  async getChallenges(): Promise<AbstinenceChallenge[]> {
    try {
      const response = await fetch(`${this.baseUrl}/challenges`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch challenges');
      }

      return await response.json();
    } catch (error) {
      console.error('Get challenges error:', error);
      throw error;
    }
  }

  async createChallenge(challengeData: {
    type: string;
    title?: string;
    description?: string;
  }): Promise<AbstinenceChallenge> {
    try {
      const response = await fetch(`${this.baseUrl}/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create challenge');
      }

      return await response.json();
    } catch (error) {
      console.error('Create challenge error:', error);
      throw error;
    }
  }

  async recordDaily(
    challengeId: string,
    status: 'success' | 'failure',
    note?: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/challenges/${challengeId}/record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status, note }),
      });

      if (!response.ok) {
        throw new Error('Failed to record daily status');
      }

      return await response.json();
    } catch (error) {
      console.error('Record daily error:', error);
      throw error;
    }
  }

  async getStats(): Promise<AbstinenceStats> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  async getAchievements(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }

      return await response.json();
    } catch (error) {
      console.error('Get achievements error:', error);
      throw error;
    }
  }
}

export const abstinenceService = new AbstinenceService();
export default abstinenceService;
