import React from "react";
import type { Project } from "../types";

interface ProjectsSectionProps {
  showProjects: boolean;
  setShowProjects: (show: boolean) => void;
  closeOtherFeatures: (activeFeature: string) => void;
  showProjectForm: boolean;
  setShowProjectForm: (show: boolean) => void;
  projects: Project[];
  projectsLoading: boolean;
  selectedProject: string;
  setSelectedProject: (projectId: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  projectDescription: string;
  setProjectDescription: (description: string) => void;
  projectColor: string;
  setProjectColor: (color: string) => void;
  loading: boolean;
  handleCreateProject: (e: React.FormEvent) => Promise<void>;
  loadProjects: () => Promise<void>;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  showProjects,
  setShowProjects,
  closeOtherFeatures,
  showProjectForm,
  setShowProjectForm,
  projects,
  projectsLoading,
  selectedProject,
  setSelectedProject,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  projectColor,
  setProjectColor,
  loading,
  handleCreateProject,
  loadProjects,
}) => {
  return (
    <div key="projects" className="projects-section">
      <div className="section-header">
        <h2>
          <span className="section-icon">
            <div className="mini-character">
              <div className="mini-character-halo"></div>
              <div className="mini-character-wings">
                <div className="mini-wing left-mini-wing"></div>
                <div className="mini-wing right-mini-wing"></div>
              </div>
              <div className="mini-character-face">
                <div className="mini-character-eyes">
                  <div className="mini-eye left-mini-eye"></div>
                  <div className="mini-eye right-mini-eye"></div>
                </div>
                <div className="mini-character-mouth"></div>
              </div>
              <div className="mini-character-body"></div>
              <div className="mini-sparkles">
                <div className="mini-sparkle mini-sparkle-1"></div>
                <div className="mini-sparkle mini-sparkle-2"></div>
              </div>
            </div>
          </span>
          プロジェクト
        </h2>
        <div className="section-controls">
          {showProjects ? (
            <button
              onClick={() => setShowProjects(false)}
              className="close-section-button"
              title="セクションを閉じる"
            >
              ✕
            </button>
          ) : (
            <button
              onClick={() => {
                closeOtherFeatures("projects");
                setShowProjects(true);
              }}
              className="show-section-button"
              title="セクションを表示"
            >
              ▶️
            </button>
          )}
        </div>
      </div>

      {showProjects && (
        <div className="section-content">
          <div className="projects-header">
            <button
              onClick={() => setShowProjectForm(!showProjectForm)}
              className="add-project-button"
            >
              {showProjectForm ? "❌ キャンセル" : "➕ プロジェクト追加"}
            </button>
            <button
              onClick={loadProjects}
              className="refresh-button"
              title="プロジェクトを更新"
            >
              🔄
            </button>
          </div>

          {showProjectForm && (
            <form onSubmit={handleCreateProject} className="project-form">
              <div className="form-group">
                <label htmlFor="projectName">プロジェクト名</label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">説明（任意）</label>
                <input
                  type="text"
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectColor">色</label>
                <input
                  type="color"
                  id="projectColor"
                  value={projectColor}
                  onChange={(e) => setProjectColor(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? "作成中..." : "プロジェクト作成"}
              </button>
            </form>
          )}

          <div className="projects-list">
            {projectsLoading ? (
              <div className="data-loading">
                <div className="spinner"></div>
                <p>プロジェクトを読み込み中...</p>
              </div>
            ) : !projects || projects.length === 0 ? (
              <p className="no-projects">プロジェクトが登録されていません</p>
            ) : (
              projects && projects.map((project) => (
                <div
                  key={project.id}
                  className={`project-item ${
                    selectedProject === project.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="project-icon">
                    <div className="mini-character">
                      <div className="mini-character-halo"></div>
                      <div className="mini-character-wings">
                        <div className="mini-wing left-mini-wing"></div>
                        <div className="mini-wing right-mini-wing"></div>
                      </div>
                      <div className="mini-character-face">
                        <div className="mini-character-eyes">
                          <div className="mini-eye left-mini-eye"></div>
                          <div className="mini-eye right-mini-eye"></div>
                        </div>
                        <div className="mini-character-mouth"></div>
                      </div>
                      <div className="mini-character-body"></div>
                      <div className="mini-sparkles">
                        <div className="mini-sparkle mini-sparkle-1"></div>
                        <div className="mini-sparkle mini-sparkle-2"></div>
                        <div className="mini-sparkle mini-sparkle-3"></div>
                      </div>
                    </div>
                  </div>
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    {project.description && <p>{project.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
