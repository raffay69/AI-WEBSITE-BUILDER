'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for your context value
interface ProjectContextType {
    downloadTitle: string;
    setDownloadTitle: (title: string) => void;
}

// Create the context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Create a provider component
export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [downloadTitle, setDownloadTitle] = useState<string>('');

  return (
    <ProjectContext.Provider value={{ downloadTitle, setDownloadTitle }}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to access the context
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
