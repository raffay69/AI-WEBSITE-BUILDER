'use client';

import * as React from 'react';
import { Progress } from '@nextui-org/react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Dice1, Download, Sheet } from 'lucide-react';
import { DownloadPopup } from '@/components/download-popup';
import { useWebContainer } from '@/hook/useWebContainer';
import { SquareTerminal } from 'lucide-react';
import { useProjectDownloader } from '@/hook/useProjectDownloader';
import { useProject } from '../projectContext';

export default function EditorPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [followUp, setFollowUp] = useState('');
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const searchParams = useSearchParams();
  const [projectName, setProjectName] = useState('');
  const [labelContent, setLabelContent] = useState("Setting things up...");
  const [prompt, setPrompt] = useState('')
  const textAreaRef = useRef<HTMLTextAreaElement>(null);  
  const webcontainer = useWebContainer();
  const [completeCode , setCompleteCode] = useState('');
  const isFirstRender = useRef(true);  
  const [url , setUrl] = useState('');
  const [iframeBackground, setIframeBackground] = useState('transparent');
  const [iframeText , setIframeText] = useState('Click on "SHOW PREVIEW" after the code is generated....');
  const [iframeLoader , setIframeLoader] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { downloadCurrentProject } = useProjectDownloader();
  const { setDownloadTitle } = useProject();
  
  

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



  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      if (progress < 100) {
        progress += 1;
        setProgressValue(Math.min(progress, 100));
        if (progress < 30) {
          setLabelContent("Setting things up...");
        } else if (progress < 70) {
          setLabelContent("Working on it...");
        } else if (progress < 90) {
          setLabelContent("Final touches...");
        } else {
          setLabelContent("All done! Ready to go!");
        }        
      } else {
        clearInterval(interval);
      }
    }, 450);

    return interval;
  };

  useEffect(() => {
    const progressInterval = simulateProgress();

    const fetchBackendData = async () => {
      try {
        const response = await fetch('https://ai-webgen-backend.onrender.com/prompt-from-backend');
        const data = await response.json();

        if (data?.forFrontend) {
          const projectTitle = data.forFrontend[0]?.projectName || 'Unnamed Project';
          setDownloadTitle(projectTitle);
          const filesContent = data.forFrontend
            .filter((item: { fileName: any; content: any }) => item.fileName && item.content)
            .map((item: { fileName: any; content: any }) => `File: ${item.fileName}\n\n${item.content}`)
            .join('\n\n');

          const shellCommands = data.forFrontend
            .filter((item: { command: any }) => item.command)
            .map((item: { command: any }) => `Command: ${item.command}`)
            .join('\n\n');

          // const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n${shellCommands}`;
          const streamContent = (projectTitle: any, filesContent: any, shellCommands: any) => {  
            const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;
            setCompleteCode(combinedContent);
            let currentContent = ""; // Tracks the streamed content
            let index = 0;
            const interval = setInterval(() => {
              if (index < combinedContent.length) {
                currentContent += combinedContent[index]; // Append the next character
                setCode(currentContent); // Update the state with partial content
                index++;
                if (textAreaRef.current) {
                  textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
                }        
              } else {
                clearInterval(interval); // Clear the interval once complete
              }
            }, 1);
          };
          streamContent(projectTitle,filesContent,shellCommands);
          // setCode(combinedContent);
          // setProjectName(projectTitle);
        } else {
          setCode('No valid data received from the backend.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCode('Failed to fetch data from the backend.');
      } finally {
        setIsLoading(false);
        clearInterval(progressInterval);
        setProgressValue(100);
      }
    };

    const timer = setTimeout(() => {
      fetchBackendData();
    }, 47000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      setCode('');
      setProjectName('');
      setProgressValue(0);
      
    };
  }, []);

  const handleFollowUpSubmit = async () => {
    if(!prompt.trim()){
      return;
    }
    setPrompt('');
    const requestData = { Prompt: prompt.trim() }
    const response = await fetch('https://ai-webgen-backend.onrender.com/modify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    console.log('Follow-up question:', followUp);
    setFollowUp('');
    setProgressValue(0); // Reset progress
    setIsLoading(true); // Show progress bar
    setCode("");
    let progress = 0;
    const followUpProgress = setInterval(() => {
      if (progress < 100) {
        progress += 1;
        setProgressValue(Math.min(progress, 100));
        if (progress < 30) {
          setLabelContent('Setting things up...');
        } else if (progress < 70) {
          setLabelContent('Making changes...');
        } else if (progress < 90) {
          setLabelContent('Modifying your code...');
        } 
        }
        else{
        setLabelContent('All done! Ready to go!');
        clearInterval(followUpProgress);
        setIsLoading(false); // Hide progress bar
      }
    }, 450);

    const fetchModBackendData = async () => {
      try {
        const response = await fetch('https://ai-webgen-backend.onrender.com/modPrompt-from-backend');
        const data = await response.json();

        if (data?.modifyFrontend) {
          const projectTitle = data.modifyFrontend[0]?.projectName || 'Unnamed Project';
          setDownloadTitle(projectTitle);

          const filesContent = data.modifyFrontend
            .filter((item: { fileName: any; content: any }) => item.fileName && item.content)
            .map((item: { fileName: any; content: any }) => `File: ${item.fileName}\n\n${item.content}`)
            .join('\n\n');

          const shellCommands = data.modifyFrontend
            .filter((item: { command: any }) => item.command)
            .map((item: { command: any }) => `Command: ${item.command}`)
            .join('\n\n');

          const streamContent = (projectTitle: any, filesContent: any, shellCommands: any) => {  
          const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;
          setCompleteCode(combinedContent);
          let currentContent = ""; // Tracks the streamed content
          let index = 0;
          const interval = setInterval(() => {
            if (index < combinedContent.length) {
              currentContent += combinedContent[index]; // Append the next character
              setCode(currentContent); // Update the state with partial content
              index++;
              if (textAreaRef.current) {
                textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
              } 
            } else {
              clearInterval(interval); // Clear the interval once complete
            }
          }, 1);
        };
        streamContent(projectTitle,filesContent,shellCommands);
          // setCode(combinedContent);
          // setProjectName(projectTitle);
        } else {
          setCode('No valid data received from the backend.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setCode('Failed to fetch data from the backend.');
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(() => {
      fetchModBackendData();
    }, 47000);
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
        if (/ReferenceError/.test(cleanData)) {
            console.error('ReferenceError:', cleanData);
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



  return (
    <div className="min-h-screen flex flex-col">
      <div className="p-6">
        <Logo />
      </div>

      <div className="flex-1 flex p-6 gap-6 relative">
        <div className="w-1/2 flex flex-col">
          <div className="mb-2 font-orbitron text-lg font-normal">CODE</div>
          <div className="relative flex-1">
            <textarea
              readOnly
              ref={textAreaRef}
              className="absolute inset-0 bg-[#111] rounded-lg p-4 text-sm resize-none border border-gray-800 focus:border-gray-700 focus:outline-none input-glow mb-4 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-black"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            
            {/* Centered Progress Bar with Explicit Styling */}
            {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-3/4">
                <Progress 
                  label={`${labelContent}`}
                  value={progressValue} 
                  color="primary" 
                  showValueLabel={true} 
                  size="lg" // You can adjust this size, or set it to 'lg' if needed
                  classNames={{
                    base: "w-full", 
                    track: "bg-gray-700 border-none h-1.5",
                    indicator: "bg-customRed border-none h-1.5",
                    label: "text-white",
                    value: "text-white"
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
            <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-stone-400 mb-2 font-orbitron">{iframeText} </p>
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


