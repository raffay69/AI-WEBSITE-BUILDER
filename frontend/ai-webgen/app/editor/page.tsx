/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Progress } from '@nextui-org/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';  
import { Logo } from '@/components/logo';
import { Dice1, Download, FullscreenIcon, RefreshCwIcon, Sheet } from 'lucide-react';
import { DownloadPopup } from '@/components/download-popup';
import { useWebContainer } from '@/hook/useWebContainer';
import { SquareTerminal , FolderOpen } from 'lucide-react';
import { useProjectDownloader } from '@/hook/useProjectDownloader';
import { useProject } from '../projectContext';
import axios from 'axios';
import { 
  SandpackProvider, 
  SandpackLayout, 
  SandpackCodeEditor, 
  SandpackFileExplorer,
  SandpackFile,
  Sandpack,
} from "@codesandbox/sandpack-react";
import {  levelUp  } from "@codesandbox/sandpack-themes";
import AuthButtons from '@/components/ui/auth-buttons';
import { useAuth  } from '../auth/authContext';
import { toast } from 'sonner';
import { getIdToken } from 'firebase/auth';
import { addUserContent, auth, getContentByIDPrompt, updateContentByChatId } from '../auth/firebase';
import { ClaudeSidebar } from '@/components/ui/sidebar';
import { mergeProjects, parseProjectString, stringifyProject } from './helper';




function Editor() {
  
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);  
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [prompt, setPrompt] = useState('')
  const webcontainer = useWebContainer();
  const [completeCode , setCompleteCode] = useState('');
  const isFirstRender = useRef(true);  
  const [url , setUrl] = useState('');
  const [iframeBackground, setIframeBackground] = useState('transparent');
  const [iframeText, setIframeText] = useState(
    `Click "SHOW PREVIEW" after the code is generated...`
  );const [iframeLoader , setIframeLoader] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { downloadCurrentProject } = useProjectDownloader();
  const { setDownloadTitle } = useProject();
  const searchParams = useSearchParams(); 
  const [prevRes , setPrevRes] = useState('');
  const [showFiles, setShowFiles] = useState(true);
  const [isOpen , setIsOpen] = useState(true)
  const [data, setData] = useState<{ filename: string |  SandpackFile; content: string | SandpackFile }[]>([]);
  const [files , setFiles] = useState({})
  const {userLoggedIn , loading ,getIdToken , currentUser } = useAuth()
  const router = useRouter()
  const [isReloded , setIsReloded] = useState(false)
  const [title , setTitle] = useState("untitled")
  const [isSideBarOpen , setIsSideBarOpen] = useState(false)
  const [errors , setErrors] =  useState<string[]>([]);
  const [inject , setInject] = useState(false)
  
  
  useEffect(()=>{
    if(!loading && !userLoggedIn){
      toast("please Login first")
      router.push('/signIn')
    }
  },[userLoggedIn, loading, router])


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get('reloaded');
   
    if(hasReloaded){
    setIsReloded(true)
    }

    if (!hasReloaded) {
      setIsReloded(false)
      const timer = setTimeout(() => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('reloaded', 'true');
        window.location.href = newUrl.toString();
      }, 1000);
            
      return () => clearTimeout(timer);
    }
  }, []);

  const myModifiedTheme = {
    ...levelUp, // Extend the base theme
    colors: {
      ...levelUp.colors, // Keep original colors
      surface1: "#000000",
      surface3: "#000000", 
      accent: "red",
    },
  };

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const encodedPrompt = searchParams?.get('prompt');
    
    if (!encodedPrompt) return;
    if (loading) return; 
    if (!isReloded) return;
    
    const chatID = searchParams?.get('chat');

    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
        // Check if user is logged in
        if (!userLoggedIn) {
          toast.error("Please login first");
          router.push('/signIn');
          return;
        }
        
        const idToken = await getIdToken();
        if (!idToken) {
          toast.error("Authentication failed");
          router.push('/signIn');
          return;
        }
  
        // Check for existing content using both prompt and conversationId
        const existingContent = await getContentByIDPrompt(
          currentUser?.uid, 
          encodedPrompt.trim(),
          chatID!
        );
        
        if (existingContent) {
          // Content exists in DB, use that
          console.log('Using existing content from database');
          setDownloadTitle(existingContent.title);
          setTitle(existingContent.title);
          setCode(existingContent.content);
          setCompleteCode(existingContent.content);
          setPrevRes(existingContent.content);
        } else {
          // Make the API call for new content
          console.log('Fetching new content from API');
          const requestData = {
            Prompt: encodedPrompt.trim(),
          };
          
          const response = await axios.post('https://ai-webgen-backend.onrender.com/generate', requestData, {
            headers: {
              Authorization: `Bearer ${idToken}`, 
            },
          });
          
          const data = response.data;
          
          if (data?.forFrontend) {
            const projectTitle = data.forFrontend[0]?.projectName || 'Unnamed Project';
            setDownloadTitle(projectTitle);
            setTitle(projectTitle);
    
            const filesContent = data.forFrontend
              .filter((item: { fileName: any; content: any; }) => item.fileName && item.content)
              .map((item: { fileName: any; content: any; }) => `File: ${item.fileName}\n\n${item.content}`)
              .join('\n\n');
    
            const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;
            setCode(combinedContent);
            setCompleteCode(combinedContent);
            setPrevRes(combinedContent);
            

            await addUserContent(
              currentUser?.uid, 
              projectTitle, 
              combinedContent, 
              encodedPrompt.trim(),
              chatID!
            );
          } else {
            setCode('No valid data received from the backend.');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast("Failed to fetch data from the backend.");
        setCode('Failed to fetch data from the backend.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchContent();
  }, [searchParams, loading, userLoggedIn, getIdToken, router, isReloded, currentUser?.uid]);
  

  const toggleTerminal = () => setShowTerminal((prev) => !prev);

  useEffect(() => {
    // Store the original console methods
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    // Override console methods to capture logs
    console.log = (...args) => {
      // Call the original console method
      originalConsoleLog(...args);
      
      // Add the log to our terminal output
      setTerminalOutput((prev) => [
        ...prev, 
        args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')
      ]);
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      setTerminalOutput((prev) => [
        ...prev, 
        `ERROR: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`
      ]);
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      setTerminalOutput((prev) => [
        ...prev, 
        `WARN: ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`
      ]);
    };

    // Cleanup function to restore original console methods
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);


  useEffect(() => {
    // Scroll the terminal to the bottom when output updates
    if (showTerminal&&terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput,showTerminal]);


  const handleFollowUpSubmit = async () => {
    if(!prompt.trim()){
      return;
    }
    const chatID = searchParams?.get('chat');

    const requestData = { 
      Prompt: prompt.trim(),
      prevRes: prevRes
    }
    setPrompt('');
    setIsLoading(true); // Show progress bar
    setCode("");
    const fetchModBackendData = async () => {
        try {
        
          const idToken = await getIdToken();
          const response = await axios.post('https://ai-webgen-backend.onrender.com/modify', requestData ,{
            headers: {
              Authorization: `Bearer ${idToken}`, 
            }});
          
          const data = response.data;
          
          if (data?.modifyFrontend) {
            const projectTitle = data.modifyFrontend[0]?.projectName || 'Unnamed Project';
            setDownloadTitle(projectTitle);
            setTitle(projectTitle)
  
            const filesContent = data.modifyFrontend
              .filter((item: { fileName: any; content: any }) => item.fileName && item.content)
              .map((item: { fileName: any; content: any }) => `File: ${item.fileName}\n\n${item.content}`)
              .join('\n\n');
  
            
              const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;
              
              const existing = parseProjectString(prevRes)
              const updated = parseProjectString(combinedContent)
              const merge = mergeProjects(existing,updated)
              const complete = stringifyProject(merge)

              setCompleteCode(combinedContent);
              setCode(combinedContent);
              setPrevRes(complete);
              
              await updateContentByChatId(currentUser?.uid, chatID! , complete); 


          } else {
            setCode('No valid data received from the backend.');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast("Failed to fetch data from the backend.")
          setCode('Failed to fetch data from the backend.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchModBackendData();
    };

    const handleErrorsSubmit = async () => {
      
      const chatID = searchParams?.get('chat');
  
      const requestData = { 
        Prompt: `Fix these errors:\n\n${errors.join('\n')}`,
        prevRes: prevRes
      }
      setPrompt('');
      setErrors([])
      setIsLoading(true); 
      setCode("");
      const fetchModBackendData = async () => {
          try {
          
            const idToken = await getIdToken();
            const response = await axios.post('https://ai-webgen-backend.onrender.com/modify', requestData ,{
              headers: {
                Authorization: `Bearer ${idToken}`, 
              }});
            
            const data = response.data;
            
            if (data?.modifyFrontend) {
              const projectTitle = data.modifyFrontend[0]?.projectName || 'Unnamed Project';
              setDownloadTitle(projectTitle);
              setTitle(projectTitle)
    
              const filesContent = data.modifyFrontend
                .filter((item: { fileName: any; content: any }) => item.fileName && item.content)
                .map((item: { fileName: any; content: any }) => `File: ${item.fileName}\n\n${item.content}`)
                .join('\n\n');
    
              
                const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;
                
                const existing = parseProjectString(prevRes)
                const updated = parseProjectString(combinedContent)
                const merge = mergeProjects(existing,updated)
                const complete = stringifyProject(merge)
  
                setCompleteCode(combinedContent);
                setCode(combinedContent);
                setPrevRes(complete);
                
                await updateContentByChatId(currentUser?.uid, chatID! , complete); 
                toast(
                  <span className="glitch font-orbitron">
                     Errors fixed! Click <strong>'Show Preview'</strong> to run the updated code. 
                  </span>,
                  {
                    style: {
                      background: "#001100", // Dark green background
                      color: "#00ff00", // Neon green text
                      border: "1px solid #00ff00", // Neon green border
                      textShadow: "0 0 5px #00ff00, 0 0 10px #00ff55", // Glowing green effect
                    },
                  }
                );
            } else {
              setCode('No valid data received from the backend.');
            }
          } catch (error) {
            console.error('Error fetching data:', error);
            toast("Failed to fetch data from the backend.")
            setCode('Failed to fetch data from the backend.');
          } finally {
            setIsLoading(false);
          }
        };
        
        fetchModBackendData();
      };


  useEffect(()=>{
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark as not the first render
      return; // Skip effect logic on mount
    }
    const parseContentToFiles = (content: string) => {
      const files: Record<string, any> = {};
    
      // Split the content into individual file blocks, skipping the first line (Project Name)
      const fileBlocks = content.split(/\n\n(?=File:)/).slice(1);
    
      fileBlocks.forEach(block => {
        // Trim any leading/trailing whitespace
        block = block.trim();
    
        // Skip blocks that might be commands
        if (block.startsWith('Command:')) return;
    
        // Split block into header and content
        const lines = block.split('\n');
        const fileHeader = lines[0]?.trim(); // First line is the file header
        const fileContent = lines.slice(1).join('\n').trim(); // Remaining lines are the content
    
        // Check if the block has a valid file header
        const fileMatch = fileHeader?.match(/^File:\s*(.+)$/);
        if (fileMatch) {
          const filePath = fileMatch[1].trim(); // Extracted file path
    
          // Split file path into directories
          const pathParts = filePath.split('/');
          let currentDir = files;
    
          // Loop through the path parts to create directory/file structure
          pathParts.forEach((part, index) => {
            if (index === pathParts.length - 1) {
              // If it's the last part, it's a file
              currentDir[part] = { 
                file: { 
                  contents: fileContent 
                } 
              };
            } else {
              // Otherwise, it's a directory
              if (!currentDir[part]) {
                currentDir[part] = { directory: {} };
              }
              currentDir = currentDir[part].directory;
            }
          });
        }
      });
    
      return files;
    };
        
    const filesToMount = parseContentToFiles(completeCode);
    // console.log(filesToMount)  
    
    webcontainer?.mount(filesToMount);
    console.log("files mounted")
    
  },[completeCode,webcontainer])




  const handleDownload = () => {
    downloadCurrentProject();
    setShowDownloadPopup(false);
  };






  

  async function main() {
    setIframeBackground('white');
    setIframeText('');
    setIframeLoader("loading......");
    
    // Improved logging function
    const logOutput = (data: string) => {
        // Remove ANSI color codes
        const cleanData = data.replace(/\x1b\[[0-9;]*[mz]/g, '');
        
        // Log clean output
        console.log(cleanData.trim());

        // Check for specific errors
        if (/ReferenceError|Error|TypeError|SyntaxError|warning|failed|failure|exception|invalid|unexpected|cannot|unable|unhandled|rejected|not found|undefined|null|crashed|missing|conflict|deprecated|fatal|ERR!|error when starting dev server|webpack|module not found|Failed to compile|Cannot find module|Cannot resolve module|Invalid hook call|React Hook|React.createElement|React.Component|Uncaught|ENOENT|EACCES|EPERM|EADDRINUSE|ECONNREFUSED|export .* was not found|import .* from/i.test(cleanData)) {
          // Add error to state
          setErrors(prev => {
            const updatedErrors = [...prev, cleanData.trim()];
            console.log(`----------------errors---------------------
                ${updatedErrors}
                ----------------errors end---------------------`);
            return updatedErrors;
        });
        }
    };

    // Await the install process to complete
    const installProcess = await webcontainer?.spawn('npm', ['install']);
    
    // Pipe install process output
    installProcess?.output.pipeTo(new WritableStream({
      write(data) {
        logOutput(data);
      }
    }));

    // Wait for install to complete
    await installProcess?.exit;


    window.addEventListener('message', (event) => {
      if (event.data && (
        event.data.type === 'react-error' || 
        event.data.type === 'react-promise-error' ||
        event.data.type === 'react-console-error' ||
        event.data.type === 'react-module-error'  // Add the new error type
      )) {
        // Store the error
        setErrors(prev => {
          let errorMessage;
          
          if (event.data.type === 'react-error') {
            errorMessage = `React Error: ${event.data.message} at ${event.data.filename}:${event.data.lineno}`;
          } else if (event.data.type === 'react-module-error') {
            errorMessage = `Module Error: ${event.data.message}`;
          } else {
            errorMessage = `${event.data.type}: ${event.data.message || JSON.stringify(event.data)}`;
          }
          
          const updatedErrors = [...prev, errorMessage];
          console.log(`----------------React App Error---------------------
              ${errorMessage}
              ----------------React App Error End---------------------`);
          return updatedErrors;
        });
      }
    });


    if(!inject){
    const injected = await injectEnhancedErrorHandling();
    if (injected) {
      console.log("Successfully injected error handling");
      setInject(true)
    } else {
      console.log("Could not inject error handling, falling back to console log parsing");
    }
  } else if(inject){
    console.log("already injected")
  }


    // Start dev server
    const devProcess = await webcontainer?.spawn('npm', ['run', 'dev']);

    // Pipe dev process output
    devProcess?.output.pipeTo(new WritableStream({
      write(data) {
        logOutput(data);
      }
    }));


    // Wait for server to be ready
    webcontainer?.on('server-ready', (port, url) => {
      console.log('Server URL:', url);
      console.log('Server Port:', port);
      setUrl(url);
    });
}



async function injectEnhancedErrorHandling() {
  try {
    // First, try to modify index.html to catch errors early
    try {
      const htmlContent = await webcontainer?.fs.readFile('index.html', 'utf-8');
      
      // Create our early error handling script
      const earlyErrorHandlingScript = `
      <script>
        // Set up early error handlers before any modules load
        window.addEventListener('error', function(event) {
          // Check if this is a script error or module loading error
          const isModuleError = event.message && (
            event.message.includes('module') || 
            event.message.includes('import') || 
            event.message.includes('export')
          );
          
          window.parent.postMessage({
            type: isModuleError ? 'react-module-error' : 'react-error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack || 'No stack trace available'
          }, '*');
          
          // Log to console for debugging
          console.error('[Error Tracking]', event.message);
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
          window.parent.postMessage({
            type: 'react-promise-error',
            message: event.reason?.message || 'Unhandled Promise Rejection',
            stack: event.reason?.stack || 'No stack trace available'
          }, '*');
        });
        
        // Override console.error to capture React errors
        const originalConsoleError = console.error;
        console.error = function(...args) {
          // Call original console.error
          originalConsoleError.apply(console, args);
          
          // Extract message from arguments
          const errorMsg = args.map(arg => 
            typeof arg === 'object' && arg !== null ? 
              (arg instanceof Error ? arg.toString() : JSON.stringify(arg)) 
              : String(arg)
          ).join(' ');
          
          // Check if this looks like a module error
          const isModuleError = errorMsg.includes('module') || 
                               errorMsg.includes('import') || 
                               errorMsg.includes('export');
          
          // Post to parent
          window.parent.postMessage({
            type: isModuleError ? 'react-module-error' : 'react-console-error',
            message: errorMsg
          }, '*');
        };
        
        // Special handler for syntax errors in modules
        window.moduleLoadErrors = [];
        window.captureModuleError = function(error) {
          window.moduleLoadErrors.push(error);
          window.parent.postMessage({
            type: 'react-module-error',
            message: error.message || 'Module Loading Error',
            stack: error.stack || 'No stack trace available'
          }, '*');
        };
      </script>
      `;
      
      // Add try-catch wrapper for script tags
      const scriptTagPattern = /<script\s+type=["']module["']\s+src=["']([^"']+)["']\s*><\/script>/g;
      let modifiedHtml = htmlContent!.replace(scriptTagPattern, (match, src) => {
        return `<script type="module">
          try {
            import('${src}').catch(error => {
              window.captureModuleError(error);
            });
          } catch (error) {
            window.captureModuleError(error);
          }
        </script>`;
      });
      
      // Inject early error handling script at the beginning of head
      modifiedHtml = modifiedHtml.replace('<head>', '<head>\n' + earlyErrorHandlingScript);
      
      await webcontainer?.fs.writeFile('index.html', modifiedHtml);
      console.log("Injected enhanced error handling into index.html");
    } catch (htmlError) {
      console.error("Error modifying HTML:", htmlError);
    }
    
    // Also inject into the entry file as before
    const entryFile = `src/main.tsx`;
    try {
      console.log(`Also injecting error handling into entry file: ${entryFile}`);
      const content = await webcontainer?.fs.readFile(entryFile, 'utf-8');
      
      // Create enhanced error reporting code for the entry file
      const errorReportingCode = `
// Enhanced error reporting code - injected by webcontainer
// These will catch runtime errors after modules are loaded

// Function to safely stringify objects
function safeStringify(obj) {
  try {
    if (obj instanceof Error) {
      return obj.message + (obj.stack ? '\\n' + obj.stack : '');
    }
    return typeof obj === 'object' && obj !== null ? JSON.stringify(obj) : String(obj);
  } catch (e) {
    return 'Error: Unable to stringify object';
  }
}

// Error event listener
window.addEventListener('error', function(event) {
  const errorInfo = {
    type: 'react-error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack || 'No stack trace available'
  };
  
  console.log('[Error Tracker] Caught error:', errorInfo);
  window.parent.postMessage(errorInfo, '*');
});

// Promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
  const errorInfo = {
    type: 'react-promise-error',
    message: event.reason?.message || 'Unhandled Promise Rejection',
    stack: event.reason?.stack || 'No stack trace available'
  };
  
  console.log('[Error Tracker] Caught promise rejection:', errorInfo);
  window.parent.postMessage(errorInfo, '*');
});

// Console.error override
const originalConsoleError = console.error;
console.error = function(...args) {
  // Call original console.error
  originalConsoleError.apply(console, args);
  
  // Extract message from arguments
  const errorMsg = args.map(safeStringify).join(' ');
  
  // Post to parent
  window.parent.postMessage({
    type: 'react-console-error',
    message: errorMsg
  }, '*');
};
`;

      // Inject at the beginning of the file
      const modifiedContent = errorReportingCode + '\n\n' + content;
      
      // Write back the modified file
      await webcontainer?.fs.writeFile(entryFile, modifiedContent);
      console.log(`Successfully injected error handling into ${entryFile}`);
    }
    catch(error){
      console.error(`Entry file ${entryFile} not found or could not be modified:`, error);
      // Post a specific message about the missing entry point
      window.parent.postMessage({
        type: 'react-module-error',
        message: `Entry file not found: ${entryFile}`
      }, '*');
    }

    
    return true;
  } catch (error) {
    console.error("Error injecting enhanced error handlers:", error);
    return false;
  }
}



function convertToObjects(data: string): { filename: string; content: string }[] {
  // First clean the project name line
  const cleaned = data.replace(/^Project Name: .+?\n\n/, '');
  
  // Split files using a more robust regex
  const files = cleaned.split(/\n\nFile: /);
  
  return files.map((file, index) => { // Added index parameter
    const firstNewline = file.indexOf("\n");
    if (firstNewline === -1) return { filename: 'unknown', content: file };

    let filename = file.slice(0, firstNewline).trim();
    let content = file.slice(firstNewline + 1).trim();

    // Clean "File: " prefix from first file
    if (index === 0 && filename.startsWith("File: ")) {
      filename = filename.replace(/^File:\s*/, "");
    }

    // Remove any leading/trailing code block markers
    content = content.replace(/^```(json|html|jsx?|tsx?)?/, '')
                     .replace(/```$/, '')
                     .trim();

    return { filename, content };
  });
}

useEffect(() => {
  const obj = convertToObjects(code);
  setData(obj);
}, [code]);

interface CodeFile {
  filename: string;
  content: string;
}

useEffect(() => {
  if (data.length === 0) return;

  setFiles((prevFiles: Record<string, string>) => {
    const mergedFiles = (data as CodeFile[]).reduce(
      (acc: Record<string, string>, file: CodeFile) => {
        try {
          let content = file.content;

          if (file.filename === "package.json") {
            // Type-safe content comparison
            const prevContent = prevFiles[`/${file.filename}`];
            if (prevContent !== content) {
              const parsed = JSON.parse(content);
              content = JSON.stringify(parsed, null, 2);
            }
          }

          acc[`/${file.filename}`] = content;
        } catch (error) {
          console.error(`Error processing ${file.filename}:`, error);
          acc[`/${file.filename}`] = String(file.content);
        }
        return acc;
      },
      { ...prevFiles } // Start with previous files
    );

    return mergedFiles;
  });
}, [data]);

//----------------------------------------sidebar------------------------------
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {


    // Open sidebar when mouse is within 20px of the left edge
    if (e.clientX <= 20 && !isSideBarOpen) {
      setIsSideBarOpen(true)
    }

    // Close sidebar when mouse is far from the sidebar (when sidebar is open)
    if (e.clientX > 300 && isSideBarOpen) {
      setIsSideBarOpen(false)
    }
  }

  window.addEventListener("mousemove", handleMouseMove)
  return () => window.removeEventListener("mousemove", handleMouseMove)
}, [isSideBarOpen])

//----------------------------------------sidebar------------------------------


const handleIframeFullscreen = () => {
  const iframe = document.querySelector("iframe");
  if (iframe?.requestFullscreen) {
    iframe.requestFullscreen();
  }
};

//array.reduce(callback, initialValue) -> write in notes



  return (
    <div className="min-h-screen flex flex-col">
    <ClaudeSidebar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />
      <div className="relative w-full">
      <div className="p-6">
        <Logo />
      </div>
      <div className="absolute left-1/2 top-8 transform -translate-x-1/2 flex items-center">
        <img 
          src={"/phantom-mascot-logo_71220-38-removebg-preview.png"}
          alt="Title icon" 
          className="w-8 h-8 mr-2 object-contain"
        />
        <h1 className="text-l font-orbitron">{title}</h1>
      </div>
      <div className="flex justify-center absolute right-5 top-8 ">
        <AuthButtons />
      </div>
      </div>

      <div className="flex-1 flex p-6 gap-6 relative">
        <div className="w-1/2 flex flex-col">
          <div className="mb-2 font-orbitron text-lg font-normal">CODE</div>
          <div className="relative flex-1">
          {!isLoading && (<SandpackProvider
              style={{border:"none"}}
              theme={myModifiedTheme}
              files={files}
              options={{
                activeFile: (files as Record<string, unknown>)["/src/App.tsx"] ? "/src/App.tsx" : "unknown",
                visibleFiles: ["/src/App.tsx"],
              }}
            >
              <SandpackLayout 
              style={{
                scrollbarWidth:'thin',
                scrollbarColor:"red",
                height:"400px",
                width:"735px",
                backgroundColor:"black"
              }}
              >
              <FolderOpen
              style={{
                position:"relative",
                left:"10px",
                top:"10px",
                cursor:"pointer",
                zIndex:98
              }} 
              size={20}
              color="red"
              onClick={() => {
                setShowFiles(!showFiles);
                setIsOpen(!isOpen)
              }}
              />
              {showFiles && (
                <SandpackFileExplorer
                style={{
                  marginLeft:"10px",
                  height:"400px",
                  width:"100px",
                  overflow:"auto"
                }}
                />
              )}
              <SandpackCodeEditor 
              style={{
                marginLeft:isOpen?"0px":"10px",
                height:"400px",
                width:"900px"
              }}
              readOnly
              closableTabs={true}  showReadOnly={false}/>
              </SandpackLayout> 
         </SandpackProvider> )}
            {/* Centered Progress Bar with Explicit Styling */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-99 pointer-events-none bg-black bg-opacity-50">
                <div className="w-full max-w-md px-4">
                  <Progress 
                    isIndeterminate 
                    aria-label="Loading..." 
                    size="sm"
                    className="animate-pulse" 
                    classNames={{
                      base: "w-full", 
                      track: "bg-gray-700 border-none h-1.5",
                      indicator: "bg-customRed border-none h-1.5 animate-[progress-indeterminate_1.5s_infinite_linear]",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-[20%] flex flex-col">
            <textarea
              className="font-orbitron font-normal flex-1 bg-[#111] rounded-lg p-4 text-sm resize-none border border-gray-800 focus:border-gray-700 focus:outline-none input-glow mb-2"
              placeholder="Ask a follow-up ..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleFollowUpSubmit}
              className="w-full bg-customRed text-stone-400 hover:text-white py-2 rounded-lg hover:bg-customRed1 transition-colors font-orbitron text-lg font-normal"
            >
              Submit Follow-up
            </button>
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="mb-2 flex justify-between items-center font-orbitron text-lg font-normal">
          <div className="flex items-center space-x-4">
          <span>PREVIEW</span>
              <button
                onClick={main}
                className="text-customRed hover:text-customRed1">
                Show Preview
              </button>
            </div>
            <div className="flex items-center space-x-4">
            <button
            className="text-gray-400 hover:text-white"
            title='FullScreen'
            onClick={handleIframeFullscreen}
            >
            <FullscreenIcon />
          </button>
            <button
            // onClick={toggleTerminal}
            className="text-gray-400 hover:text-white"
            title='Terminal'
            onClick={toggleTerminal}
            >
            <SquareTerminal />
          </button>
              <button
                onClick={() => setShowDownloadPopup(true)}
                
                className="text-gray-400 hover:text-white"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative flex-1 bg-black rounded-lg border border-gray-800 focus:border-gray-700 focus:outline-none input-glow mb-2">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-stone-400 mb-2 font-orbitron">{iframeText}</p>
              <div className="text-center text-stone-400 font-orbitron text-xs opacity-80 leading-relaxed">
                <p>If the screen stays blank or stuck on <strong> Loading...</strong> for too long, open Developer Tools to check for errors.</p>
                <p>
                  Use <strong>F12</strong> or <strong>Ctrl + Shift + I</strong> (Windows/Linux)  
                  or <strong>Cmd + Option + I</strong> (Mac) to access it.
                </p>
              </div>
            </div>
          </div>
            {!url && (<div className="absolute inset-0 flex items-center justify-center"style={{ zIndex: 10 }}>
              <p className="text-black mb-2 font-orbitron"> {iframeLoader} </p>
              </div>)}
              
            <iframe
              src={url}
              className="w-full h-full rounded-lg border-gray-800 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-black"
              title="Preview"
              style={{
                        backgroundColor: iframeBackground,
                        zIndex:url?20:5, // Ensures iframe is on top
                        position: 'relative',
               }} 
                />
                {showTerminal && (
                  <div
                    ref={terminalRef} 
                    className="absolute inset-0 bg-black text-stone-400 font-mono text-sm p-4 overflow-y-auto z-[9999] scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-black"
                    style={{
                      pointerEvents: 'auto', // Ensures scrolling works properly
                    }}
                  >
                    {terminalOutput.length === 0 ? (
                      <p className="text-center">No console output...</p>
                    ) : (
                      terminalOutput.map((line, index) => {
                        let textColor = 'text-stone-400'; // default color
                        if (line.startsWith('ERROR:')) {
                          textColor = 'text-red-500'; // red for errors
                        } else if (line.startsWith('WARN:')) {
                          textColor = 'text-yellow-500'; // yellow for warnings
                        }

                        return (
                          <p
                            key={index}
                            className={`whitespace-pre-wrap ${textColor} font-vt323 text-lg`}
                          >
                            {line}
                          </p>
                        );
                      })
                    )}
                  </div>
                )}
        {/* error display */}
        {errors.length > 0 && (
          <div 
            className="absolute bottom-36 inset-0 flex  items-end justify-center z-[10000] pointer-events-none"
            style={{ padding: '0 1rem 1rem 1rem' }}
          >
            <div 
              className="bg-red-900/90 border border-red-700 rounded-lg shadow-lg w-full max-w-full max-h-62  pointer-events-auto"
            >
              <div className="flex justify-between items-center p-3 border-b border-red-700">
                <h3 className="text-red-300 font-bold font-orbitron">
                  {errors.length} {errors.length === 1 ? 'Error' : 'Errors'} Detected
                </h3>
                <div className='flex gap-2'>
                <button 
              onClick={handleErrorsSubmit} 
              className="text-white hover:text-white bg-black hover:bg-black/60 rounded px-3 py-1 text-sm font-orbitron transition-colors border border-red-700"
            >
              Fix with <span className="inline-block font-orbitron text-sm font-bold text-red-600 tracking-wider">
              &nbsp; PHANTOM
              </span>
            </button>
            <button 
              onClick={() => setErrors([])} 
              className="text-red-300 hover:text-white bg-red-800 hover:bg-red-700 rounded px-2 py-1 text-sm font-orbitron transition-colors"
            >
              Clear
            </button>
            </div>
              </div>
              <div className="p-3 text-red-200 font-mono text-sm overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-red-900/50">
                {errors.map((error, index) => (
                  <div key={index} className="mb-2 last:mb-0 border-l-2 border-red-600 pl-2"> 
                    {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* error display end */}     
          </div>
        </div>
      </div>
      {showDownloadPopup && (
        <DownloadPopup
          onDownload={handleDownload}
          onCancel={() => setShowDownloadPopup(false)}
        />
      )}
    </div>
  );
}

export default function EditorPage() {
  
  return ( 
    <React.Suspense fallback={<div>Loading......</div>}>
      <Editor />
    </React.Suspense>
  );
}

