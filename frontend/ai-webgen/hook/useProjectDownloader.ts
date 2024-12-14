import { WebContainer } from '@webcontainer/api';
import JSZip from 'jszip';
import { useWebContainer } from './useWebContainer';
import { useProject } from '@/app/projectContext';



async function downloadProject(webContainer: WebContainer , downloadTitle: string) {
  // Create a function to recursively download files
  async function downloadDirectory(directoryPath: string = '.') {
    const directory = await webContainer.fs.readdir(directoryPath, { withFileTypes: true });
    
    const projectFiles: { [path: string]: string } = {};

    for (const item of directory) {
      const fullPath = `${directoryPath}/${item.name}`;
      
      // Skip node_modules directory
      if (item.name === 'node_modules') {
        continue;
      }

      if (item.isDirectory()) {
        // Recursively download subdirectories
        const subDirFiles = await downloadDirectory(fullPath);
        Object.assign(projectFiles, subDirFiles);
      } else if (item.isFile()) {
        // Read file contents
        const fileContents = await webContainer.fs.readFile(fullPath, 'utf-8');
        projectFiles[fullPath] = fileContents;
      }
    }

    return projectFiles;
  }

  function createProjectZip(files: { [path: string]: string }) {
    const zip = new JSZip();

    // Add each file to the zip
    Object.entries(files).forEach(([path, content]) => {
      // Remove leading ./ or / from path
      const cleanPath = path.replace(/^\.?\//, '');
      
      // Additional check to ensure node_modules is not included
      if (!cleanPath.startsWith('node_modules/')) {
        zip.file(cleanPath, content);
      }
    });

    return zip;
  }

  try {
    // Download all project files
    const projectFiles = await downloadDirectory();
    
    // Create zip
    const projectZip = createProjectZip(projectFiles);

    // Generate the zip file
    const zipBlob = await projectZip.generateAsync({ type: 'blob' });

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = `${downloadTitle}.zip`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

  } catch (error) {
    console.error('Project download error:', error);
  }
}

export function useProjectDownloader() {
  const webContainer = useWebContainer();
  const {downloadTitle} = useProject();
  

  const downloadCurrentProject = () => {
    if (webContainer) {
      downloadProject(webContainer , downloadTitle);
    }
  };

  return { downloadCurrentProject };
}