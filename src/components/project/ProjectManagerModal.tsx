'use client'

import React, { useState, useEffect } from 'react'
import { ProjectData } from '@/lib/project/types'
import { ProjectManager } from '@/lib/project/projectManager'

interface ProjectManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onNewProject: (name: string, description?: string) => void
  onLoadProject: (projectData: ProjectData) => void
  onSaveProject: (name: string, description?: string) => void
  currentProjectName?: string
}

export default function ProjectManagerModal({
  isOpen,
  onClose,
  onNewProject,
  onLoadProject,
  onSaveProject,
  currentProjectName
}: ProjectManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'open' | 'save'>('new')
  const [savedProjects, setSavedProjects] = useState<ProjectData[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [saveProjectName, setSaveProjectName] = useState(currentProjectName || '')
  const [saveProjectDescription, setSaveProjectDescription] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSavedProjects(ProjectManager.getSavedProjects())
      setSaveProjectName(currentProjectName || '')
    }
  }, [isOpen, currentProjectName])

  const handleNewProject = () => {
    if (newProjectName.trim()) {
      onNewProject(newProjectName.trim(), newProjectDescription.trim() || undefined)
      setNewProjectName('')
      setNewProjectDescription('')
      onClose()
    }
  }

  const handleLoadProject = () => {
    if (selectedProject) {
      onLoadProject(selectedProject)
      onClose()
    }
  }

  const handleSaveProject = () => {
    if (saveProjectName.trim()) {
      onSaveProject(saveProjectName.trim(), saveProjectDescription.trim() || undefined)
      onClose()
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      ProjectManager.deleteProject(projectId)
      setSavedProjects(ProjectManager.getSavedProjects())
      if (selectedProject?.metadata.id === projectId) {
        setSelectedProject(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Project Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'new', label: 'New Project', icon: '📄' },
              { id: 'open', label: 'Open Project', icon: '📂' },
              { id: 'save', label: 'Save Project', icon: '💾' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* New Project Tab */}
          {activeTab === 'new' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Project
                </button>
              </div>
            </div>
          )}

          {/* Open Project Tab */}
          {activeTab === 'open' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Open Existing Project</h3>
                {savedProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No saved projects found</p>
                    <p className="text-sm">Create a new project or import an existing one</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedProjects.map((project) => (
                      <div
                        key={project.metadata.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedProject?.metadata.id === project.metadata.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{project.metadata.name}</h4>
                            {project.metadata.description && (
                              <p className="text-sm text-gray-600 mt-1">{project.metadata.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Created: {formatDate(project.metadata.createdAt)}</span>
                              <span>Updated: {formatDate(project.metadata.updatedAt)}</span>
                              <span>{project.placedEquipment.length} equipment items</span>
                              <span>{project.backgroundImages.length} background images</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProject(project.metadata.id)
                            }}
                            className="ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLoadProject}
                  disabled={!selectedProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Open Project
                </button>
              </div>
            </div>
          )}

          {/* Save Project Tab */}
          {activeTab === 'save' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Save Current Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={saveProjectName}
                      onChange={(e) => setSaveProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={saveProjectDescription}
                      onChange={(e) => setSaveProjectDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter project description"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={!saveProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
