interface Resource {
  id?: string;
  title: string;
  url: string;
  description?: string;
  category: string;
  icon?: string;
  projectId?: string;
  isGlobal: boolean;
  createdBy: string;
}

class ResourceService {
  private baseUrl = '/api/resources';

  async getResources(category: string, projectId?: string): Promise<Resource[]> {
    try {
      const url = projectId
        ? `${this.baseUrl}/${category}?projectId=${projectId}`
        : `${this.baseUrl}/${category}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      return await response.json();
    } catch (error) {
      console.error('Get resources error:', error);
      throw error;
    }
  }

  async createResource(resourceData: Omit<Resource, 'id'>): Promise<Resource> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(resourceData),
      });

      if (!response.ok) {
        throw new Error('Failed to create resource');
      }

      return await response.json();
    } catch (error) {
      console.error('Create resource error:', error);
      throw error;
    }
  }

  async updateResource(resourceId: string, updates: Partial<Resource>): Promise<Resource> {
    try {
      const response = await fetch(`${this.baseUrl}/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update resource');
      }

      return await response.json();
    } catch (error) {
      console.error('Update resource error:', error);
      throw error;
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${resourceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Delete resource error:', error);
      throw error;
    }
  }
}

export const resourceService = new ResourceService();
export default resourceService;
