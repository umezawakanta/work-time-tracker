// src/services/api/projectApi.ts
import { api } from './apiConfig';

interface Project {
  _id: string;
  name: string;
  color: string;
  lastUsed?: Date;
  userId: string;
}

interface CreateProjectParams {
  name: string;
  color: string;
  userId: string;
  lastUsed?: Date;
}

const projectApi = {
  getUserProjects: async (userId: string) => {
    return api.get(`/projects/user/${userId}`);
  },

  createProject: async (projectData: CreateProjectParams) => {
    return api.post('/projects', projectData);
  },

  updateProject: async (projectId: string, projectData: Partial<Project>) => {
    return api.put(`/projects/${projectId}`, projectData);
  },

  deleteProject: async (projectId: string) => {
    return api.delete(`/projects/${projectId}`);
  },
};

export default projectApi;
