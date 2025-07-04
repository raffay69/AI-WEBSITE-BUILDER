/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Progress } from "@nextui-org/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo, Logo2 } from "@/components/logo";
import {
  Dice1,
  Download,
  FullscreenIcon,
  RefreshCwIcon,
  Sheet,
} from "lucide-react";
import { DownloadPopup } from "@/components/download-popup";
import { useWebContainer } from "@/hook/useWebContainer";
import { SquareTerminal, FolderOpen } from "lucide-react";
import { useProjectDownloader } from "@/hook/useProjectDownloader";
import { useProject } from "../../projectContext";
import axios from "axios";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  SandpackFile,
  Sandpack,
} from "@codesandbox/sandpack-react";
import { levelUp } from "@codesandbox/sandpack-themes";
import AuthButtons from "@/components/ui/auth-buttons";
import { useAuth } from "../../auth/authContext";
import { toast } from "sonner";
import {
  addUserContent,
  auth,
  getContentByIDPrompt,
  updateContentByChatId,
} from "../../auth/firebase";
import { ClaudeSidebar } from "@/components/ui/sidebar";
import { mergeProjects, parseProjectString, stringifyProject } from "./helper";
import { WebContainerProcess } from "@webcontainer/api";
import QRdisplay from "@/components/ui/qrDisplay";
import "@xterm/xterm/css/xterm.css";
import { CoolLoader } from "@/components/ui/cool-loader";
// import { FitAddon } from 'xterm-addon-fit';
// import { Terminal } from '@xterm/xterm';

let Terminal: any;
let FitAddon: any;

function Editor() {
  useEffect(() => {
    const loadBrowserDependencies = async () => {
      if (typeof window !== "undefined") {
        const xtermModule = await import("@xterm/xterm");
        Terminal = xtermModule.Terminal;
        const fitAddonModule = await import("xterm-addon-fit");
        FitAddon = fitAddonModule.FitAddon;
      }
    };
    loadBrowserDependencies();
  }, []);

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [prompt, setPrompt] = useState("");
  const webcontainer = useWebContainer();
  const [completeCode, setCompleteCode] = useState("");
  const isFirstRender = useRef(true);
  const [url, setUrl] = useState("");
  const [iframeBackground, setIframeBackground] = useState("transparent");
  const [iframeText, setIframeText] = useState(
    `Click "SHOW PREVIEW" after the code is generated...`
  );
  const [iframeLoader, setIframeLoader] = useState<JSX.Element | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  // const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { downloadCurrentProject } = useProjectDownloader();
  const { setDownloadTitle } = useProject();
  const searchParams = useSearchParams();
  const [prevRes, setPrevRes] = useState("");
  const [showFiles, setShowFiles] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [data, setData] = useState<
    { filename: string | SandpackFile; content: string | SandpackFile }[]
  >([]);
  const [files, setFiles] = useState({});
  const { userLoggedIn, loading, getIdToken, currentUser } = useAuth();
  const router = useRouter();
  const [isReloded, setIsReloded] = useState(false);
  const [title, setTitle] = useState("untitled");
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  // const [inject , setInject] = useState(false)
  const [currDevProcess, setCurrDevProcess] = useState<
    WebContainerProcess | undefined
  >();
  const [qrURL, setQrURL] = useState("");
  const [expoUpgraded, setExpoUpgraded] = useState(false);
  const type = "mobile";
  const xtermRef = useRef<any | null>(null);
  const fitAddonRef = useRef<any | null>(null);
  const shellInitialized = useRef<boolean>(false);

  //xterm terminal logic
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!terminalRef.current || !webcontainer || shellInitialized.current)
      return;

    xtermRef.current = new Terminal({
      cursorBlink: false,
      convertEol: true,
      scrollback: 3000,
      fontFamily: "monospace",
      fontSize: 14,
      disableStdin: true,
      theme: {
        background: "#000000",
        foreground: "#f8f8f2",
      },
    });

    fitAddonRef.current = new FitAddon();
    xtermRef.current.loadAddon(fitAddonRef.current);
    xtermRef.current.open(terminalRef.current);

    setTimeout(() => fitAddonRef.current?.fit(), 0);

    const initShell = async () => {
      try {
        const shellProcess = await webcontainer.spawn("jsh", {
          terminal: {
            cols: xtermRef.current?.cols || 80,
            rows: xtermRef.current?.rows || 24,
          },
        });

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data: string) {
              xtermRef.current?.write(data);
            },
          })
        );

        xtermRef.current?.onResize(
          ({ cols, rows }: { cols: number; rows: number }) => {
            fitAddonRef.current?.fit();
            shellProcess.resize({ cols, rows });
          }
        );

        shellInitialized.current = true;
      } catch (error) {
        console.error("Shell initialization failed:", error);
      }
    };

    initShell();

    const handleResize = () => {
      if (showTerminal && fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [webcontainer]);

  useEffect(() => {
    if (showTerminal && fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current?.fit();
        xtermRef.current?.scrollToBottom();
      }, 0);
    }
  }, [showTerminal]);

  useEffect(() => {
    if (!loading && !userLoggedIn) {
      toast("please Login first");
      router.push("/signIn");
    }
  }, [userLoggedIn, loading, router]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasReloaded = urlParams.get("reloaded");

    if (hasReloaded) {
      setIsReloded(true);
    }

    if (!hasReloaded) {
      setIsReloded(false);
      const timer = setTimeout(() => {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("reloaded", "true");
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
    const encodedPrompt = searchParams?.get("prompt");

    if (!encodedPrompt) return;
    if (loading) return;
    if (!isReloded) return;

    const chatID = searchParams?.get("chat");

    const fetchContent = async () => {
      setIsLoading(true);

      try {
        // Check if user is logged in
        if (!userLoggedIn) {
          toast.error("Please login first");
          router.push("/signIn");
          return;
        }

        const idToken = await getIdToken();
        if (!idToken) {
          toast.error("Authentication failed");
          router.push("/signIn");
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
          console.log("Using existing content from database");
          setDownloadTitle(existingContent.title);
          setTitle(existingContent.title);
          setCode(existingContent.content);
          setCompleteCode(existingContent.content);
          setPrevRes(existingContent.content);
        } else {
          // Make the API call for new content
          console.log("Fetching new content from API");
          const requestData = {
            Prompt: encodedPrompt.trim(),
          };

          const response = await axios.post(
            "https://ai-webgen-backend.onrender.com/generate-mobile",
            requestData,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          const data = response.data;

          if (data?.forFrontend) {
            const projectTitle =
              data.forFrontend[0]?.projectName || "Unnamed Project";
            setDownloadTitle(projectTitle);
            setTitle(projectTitle);

            const filesContent = data.forFrontend
              .filter(
                (item: { fileName: any; content: any }) =>
                  item.fileName && item.content
              )
              .map(
                (item: { fileName: any; content: any }) =>
                  `File: ${item.fileName}\n\n${item.content}`
              )
              .join("\n\n");

            const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;
            setCode(combinedContent);
            setCompleteCode(combinedContent);
            setPrevRes(combinedContent);

            await addUserContent(
              currentUser?.uid,
              projectTitle,
              combinedContent,
              encodedPrompt.trim(),
              chatID!,
              type
            );
          } else {
            setCode("No valid data received from the backend.");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast("Failed to fetch data from the backend.");
        setCode("Failed to fetch data from the backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [
    searchParams,
    loading,
    userLoggedIn,
    getIdToken,
    router,
    isReloded,
    currentUser?.uid,
  ]);

  const toggleTerminal = () => setShowTerminal((prev) => !prev);

  const handleFollowUpSubmit = async () => {
    if (!prompt.trim()) {
      return;
    }
    const chatID = searchParams?.get("chat");

    const requestData = {
      Prompt: prompt.trim(),
      prevRes: prevRes,
    };
    setPrompt("");
    setIsLoading(true); // Show progress bar
    setCode("");
    const fetchModBackendData = async () => {
      try {
        const idToken = await getIdToken();
        const response = await axios.post(
          "https://ai-webgen-backend.onrender.com/modify-mobile",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        const data = response.data;

        if (data?.modifyFrontend) {
          const projectTitle =
            data.modifyFrontend[0]?.projectName || "Unnamed Project";
          setDownloadTitle(projectTitle);
          setTitle(projectTitle);

          const filesContent = data.modifyFrontend
            .filter(
              (item: { fileName: any; content: any }) =>
                item.fileName && item.content
            )
            .map(
              (item: { fileName: any; content: any }) =>
                `File: ${item.fileName}\n\n${item.content}`
            )
            .join("\n\n");

          const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;

          const existing = parseProjectString(prevRes);
          const updated = parseProjectString(combinedContent);
          const merge = mergeProjects(existing, updated);
          const complete = stringifyProject(merge);

          setCompleteCode(combinedContent);
          setCode(combinedContent);
          setPrevRes(complete);

          await updateContentByChatId(currentUser?.uid, chatID!, complete);
        } else {
          setCode("No valid data received from the backend.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast("Failed to fetch data from the backend.");
        setCode("Failed to fetch data from the backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModBackendData();
  };

  const handleErrorsSubmit = async () => {
    const chatID = searchParams?.get("chat");

    const requestData = {
      Prompt: `Fix these errors:\n\n${errors.join("\n")}`,
      prevRes: prevRes,
    };
    setPrompt("");
    setErrors([]);
    setIsLoading(true);
    setCode("");
    const fetchModBackendData = async () => {
      try {
        const idToken = await getIdToken();
        const response = await axios.post(
          "https://ai-webgen-backend.onrender.com/modify-mobile",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        const data = response.data;

        if (data?.modifyFrontend) {
          const projectTitle =
            data.modifyFrontend[0]?.projectName || "Unnamed Project";
          setDownloadTitle(projectTitle);
          setTitle(projectTitle);

          const filesContent = data.modifyFrontend
            .filter(
              (item: { fileName: any; content: any }) =>
                item.fileName && item.content
            )
            .map(
              (item: { fileName: any; content: any }) =>
                `File: ${item.fileName}\n\n${item.content}`
            )
            .join("\n\n");

          const combinedContent = `Project Name: ${projectTitle}\n\n${filesContent}\n\n`;

          const existing = parseProjectString(prevRes);
          const updated = parseProjectString(combinedContent);
          const merge = mergeProjects(existing, updated);
          const complete = stringifyProject(merge);

          setCompleteCode(combinedContent);
          setCode(combinedContent);
          setPrevRes(complete);

          await updateContentByChatId(currentUser?.uid, chatID!, complete);
          toast(
            <span className="glitch font-orbitron">
              Errors fixed! Click <strong>'Show Preview'</strong> to run the
              updated code.
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
          setCode("No valid data received from the backend.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast("Failed to fetch data from the backend.");
        setCode("Failed to fetch data from the backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchModBackendData();
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // Mark as not the first render
      return; // Skip effect logic on mount
    }
    const parseContentToFiles = (content: string) => {
      const files: Record<string, any> = {};

      // Split the content into individual file blocks, skipping the first line (Project Name)
      const fileBlocks = content.split(/\n\n(?=File:)/).slice(1);

      fileBlocks.forEach((block) => {
        // Trim any leading/trailing whitespace
        block = block.trim();

        // Skip blocks that might be commands
        if (block.startsWith("Command:")) return;

        // Split block into header and content
        const lines = block.split("\n");
        const fileHeader = lines[0]?.trim(); // First line is the file header
        const fileContent = lines.slice(1).join("\n").trim(); // Remaining lines are the content

        // Check if the block has a valid file header
        const fileMatch = fileHeader?.match(/^File:\s*(.+)$/);
        if (fileMatch) {
          const filePath = fileMatch[1].trim(); // Extracted file path

          // Split file path into directories
          const pathParts = filePath.split("/");
          let currentDir = files;

          // Loop through the path parts to create directory/file structure
          pathParts.forEach((part, index) => {
            if (index === pathParts.length - 1) {
              // If it's the last part, it's a file
              currentDir[part] = {
                file: {
                  contents: fileContent,
                },
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
    console.log("files mounted");
  }, [completeCode, webcontainer]);

  const handleDownload = () => {
    downloadCurrentProject();
    setShowDownloadPopup(false);
  };

  async function main() {
    setIframeBackground("black");
    setIframeText("");
    setIframeLoader(<CoolLoader />);

    // Improved logging function
    const logOutput = (data: string) => {
      // Remove ANSI color codes
      const cleanData = data.replace(/\x1b\[[0-9;]*[mz]/g, "");

      // Log clean output
      console.log(cleanData.trim());

      if (/Metro waiting on/.test(cleanData)) {
        const match = cleanData.match(
          /Metro waiting on (exp:\/\/[\w\.-]+\.[\w\.\/\-]+)/
        );
        if (match && match[1]) {
          const url = match[1];
          console.log("Found QR URL:", url);
          setQrURL(url);
        }
      }

      // Check for specific errors
      if (
        /ReferenceError|Error|TypeError|SyntaxError|warning|failed|failure|exception|invalid|unexpected|cannot|unable|unhandled|rejected|not found|undefined|null|crashed|missing|conflict|fatal|ERR!|error when starting dev server|webpack|module not found|Failed to compile|Cannot find module|Cannot resolve module|Invalid hook call|React Hook|React.createElement|React.Component|Uncaught|ENOENT|EACCES|EPERM|EADDRINUSE|ECONNREFUSED|export .* was not found|import .* from/i.test(
          cleanData
        )
      ) {
        // Add error to state
        setErrors((prev) => {
          const updatedErrors = [...prev, cleanData.trim()];
          // console.log(`----------------errors---------------------
          //     ${updatedErrors}
          //     ----------------errors end---------------------`);
          return updatedErrors;
        });
      }
    };

    await webcontainer?.fs.writeFile(
      "/setup-proxy.js",
      `
const https = require('https');
const url = require('url');

const originalRequest = https.request;
const originalGet = https.get;

function isExpoApi(requestOptions) {
  if (typeof requestOptions === 'string') {
    return requestOptions.includes('api.expo.dev') || requestOptions.includes('exp.host');
  }

  const hostname = requestOptions.hostname || requestOptions.host || '';
  return hostname.includes('api.expo.dev') || hostname.includes('exp.host');
}

function getProxiedOptions(options) {
  const targetUrl =
    typeof options === 'string'
      ? options
      : \`https://\${options.hostname}\${options.path}\`;

  const proxiedUrl = \`https://cors-proxy-phantom.onrender.com/\${targetUrl}\`;
  const parsed = url.parse(proxiedUrl);

  return {
    ...parsed,
    method: options.method || 'GET',
    headers: {
      ...(options.headers || {}),
      'X-Requested-With': 'XMLHttpRequest'
    },
  };
}

https.request = function (options, callback) {
  if (isExpoApi(options)) {
    console.log('[Proxy] Routing to proxy:', options.path || options);
    return originalRequest(getProxiedOptions(options), callback);
  }
  return originalRequest(options, callback);
};

https.get = function (options, callback) {
  const req = https.request(options, callback);
  req.end();
  return req;
};

console.log('[Proxy] https.request and https.get patched');
`
    );

    /*
------------------------------testing script start----------------------------------- 
*/

    // await webcontainer?.fs.writeFile('/test-fetch.js', `
    //   const https = require('https');

    //   https.get('https://exp.host/--/api/v2/versions/latest', res => {
    //     let data = '';
    //     res.on('data', chunk => data += chunk);
    //     res.on('end', () => {
    //       console.log('[Test] Response from Expo API:');
    //       console.log(data);
    //     });
    //   }).on('error', err => {
    //     console.error('[Test] Request error:', err.message);
    //   });
    // `);

    // const node = await webcontainer?.spawn('node', ['test-fetch.js'], {
    //   env: {
    //     NODE_OPTIONS: '--require ./setup-proxy.js'
    //   }
    // });

    // node?.output.pipeTo(new WritableStream({
    //   write(data) {
    //     logOutput(data);
    //   }
    // }));

    // await node?.exit;

    /*
------------------------------testing script end----------------------------------- 
*/
    console.log(currDevProcess);
    if (currDevProcess) {
      await currDevProcess.kill();
    }

    const installProcess = await webcontainer?.spawn("npm", ["install"], {
      terminal: {
        cols: xtermRef.current?.cols || 80,
        rows: xtermRef.current?.rows || 24,
      },
    });

    // Pipe install process output
    installProcess?.output.pipeTo(
      new WritableStream({
        write(data) {
          logOutput(data);
          xtermRef.current?.write(data);
        },
      })
    );
    await installProcess?.exit;

    if (!expoUpgraded) {
      setExpoUpgraded(true);
      console.log("upgrading expo..................");
      xtermRef.current?.write("Upgrading expo .............");
      const installExpo = await webcontainer?.spawn(
        "npm",
        ["install", "expo-cli@latest"],
        {
          terminal: {
            cols: xtermRef.current?.cols || 80,
            rows: xtermRef.current?.rows || 24,
          },
        }
      );
      installExpo?.output.pipeTo(
        new WritableStream({
          write(data) {
            logOutput(data);
            xtermRef.current?.write(data);
          },
        })
      );

      await installExpo?.exit;

      // ---------------- may come in handy --------------------------
      const upgrade = await webcontainer?.spawn(
        "npx",
        ["expo-cli", "upgrade", "--non-interactive"],
        {
          env: {
            NODE_OPTIONS: "--require ./setup-proxy.js",
          },
          terminal: {
            cols: xtermRef.current?.cols || 80,
            rows: xtermRef.current?.rows || 24,
          },
        }
      );
      upgrade?.output.pipeTo(
        new WritableStream({
          write(data) {
            logOutput(data);
            xtermRef.current?.write(data);
          },
        })
      );

      await upgrade?.exit;

      // second install just to be safe
      const installProcess2 = await webcontainer?.spawn("npm", ["install"], {
        terminal: {
          cols: xtermRef.current?.cols || 80,
          rows: xtermRef.current?.rows || 24,
        },
      });

      // Pipe install process output
      installProcess2?.output.pipeTo(
        new WritableStream({
          write(data) {
            logOutput(data);
            xtermRef.current?.write(data);
          },
        })
      );
      await installProcess2?.exit;
    } else {
      console.log("expo already upgraded");
      xtermRef.current?.write("expo already upgraded");
    }

    window.addEventListener("message", (event) => {
      if (
        event.data &&
        (event.data.type === "react-error" ||
          event.data.type === "react-promise-error" ||
          event.data.type === "react-console-error" ||
          event.data.type === "react-module-error")
      ) {
        // Store the error
        setErrors((prev) => {
          let errorMessage;

          if (event.data.type === "react-error") {
            errorMessage = `React Error: ${event.data.message} at ${event.data.filename}:${event.data.lineno}`;
          } else if (event.data.type === "react-module-error") {
            errorMessage = `Module Error: ${event.data.message}`;
          } else {
            errorMessage = `${event.data.type}: ${
              event.data.message || JSON.stringify(event.data)
            }`;
          }

          const updatedErrors = [...prev, errorMessage];
          // console.log(`----------------React App Error---------------------
          //     ${errorMessage}
          //     ----------------React App Error End---------------------`);
          return updatedErrors;
        });
      }
    });

    const devProcess = await webcontainer?.spawn("npm", ["start"], {
      env: {
        NODE_OPTIONS: "--require ./setup-proxy.js",
      },
      terminal: {
        cols: xtermRef.current?.cols || 80,
        rows: xtermRef.current?.rows || 24,
      },
    });

    setCurrDevProcess(devProcess);
    // Pipe dev process output
    devProcess?.output.pipeTo(
      new WritableStream({
        write(data) {
          logOutput(data);
          xtermRef.current?.write(data);
        },
      })
    );

    // Wait for server to be ready
    webcontainer?.on("server-ready", (port, url) => {
      console.log("Server URL:", url);
      console.log("Server Port:", port);
      setUrl(url);
    });
  }

  function convertToObjects(
    data: string
  ): { filename: string; content: string }[] {
    // First clean the project name line
    const cleaned = data.replace(/^Project Name: .+?\n\n/, "");

    // Split files using a more robust regex
    const files = cleaned.split(/\n\nFile: /);

    return files.map((file, index) => {
      // Added index parameter
      const firstNewline = file.indexOf("\n");
      if (firstNewline === -1) return { filename: "unknown", content: file };

      let filename = file.slice(0, firstNewline).trim();
      let content = file.slice(firstNewline + 1).trim();

      // Clean "File: " prefix from first file
      if (index === 0 && filename.startsWith("File: ")) {
        filename = filename.replace(/^File:\s*/, "");
      }

      // Remove any leading/trailing code block markers
      content = content
        .replace(/^```(json|html|jsx?|tsx?)?/, "")
        .replace(/```$/, "")
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
        setIsSideBarOpen(true);
      }

      // Close sidebar when mouse is far from the sidebar (when sidebar is open)
      if (e.clientX > 300 && isSideBarOpen) {
        setIsSideBarOpen(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isSideBarOpen]);

  //----------------------------------------sidebar------------------------------

  //array.reduce(callback, initialValue) -> write in notes

  return (
    <div className="min-h-screen flex flex-col">
      <ClaudeSidebar
        isOpen={isSideBarOpen}
        setIsOpen={setIsSideBarOpen}
        color="purple"
      />
      <div className="relative w-full">
        <div className="p-6">
          <Logo2 />
        </div>
        <div className="absolute left-1/2 top-8 transform -translate-x-1/2 flex items-center">
          <img
            src={"/phantom-mobile.png"}
            alt="Title icon"
            className="w-8 h-8 mr-2 object-contain"
          />
          <h1 className="text-l font-orbitron">{title}</h1>
        </div>
        <div className="flex justify-center absolute right-5 top-8 ">
          <AuthButtons color="#8A2BE2" />
        </div>
      </div>

      <div className="flex-1 flex p-6 gap-6 relative">
        <div className="w-1/2 flex flex-col">
          <div className="mb-2 font-orbitron text-lg font-normal">CODE</div>
          <div className="relative flex-1">
            {!isLoading && (
              <SandpackProvider
                style={{ border: "none" }}
                theme={myModifiedTheme}
                files={files}
                options={{
                  activeFile: (files as Record<string, unknown>)[
                    "/app/index.tsx"
                  ]
                    ? "/app/index.tsx"
                    : "unknown",
                  visibleFiles: ["/app/index.tsx"],
                }}
              >
                <SandpackLayout
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "red",
                    height: "400px",
                    width: "735px",
                    backgroundColor: "black",
                  }}
                >
                  <FolderOpen
                    style={{
                      position: "relative",
                      left: "10px",
                      top: "10px",
                      cursor: "pointer",
                      zIndex: 98,
                    }}
                    size={20}
                    color="purple"
                    onClick={() => {
                      setShowFiles(!showFiles);
                      setIsOpen(!isOpen);
                    }}
                  />
                  {showFiles && (
                    <SandpackFileExplorer
                      className="mobile"
                      style={{
                        marginLeft: "10px",
                        height: "400px",
                        width: "100px",
                        overflow: "auto",
                      }}
                    />
                  )}
                  <SandpackCodeEditor
                    className="mobile"
                    style={{
                      marginLeft: isOpen ? "0px" : "10px",
                      height: "400px",
                      width: "900px",
                    }}
                    readOnly
                    closableTabs={true}
                    showReadOnly={false}
                  />
                </SandpackLayout>
              </SandpackProvider>
            )}
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
                      indicator:
                        "bg-[#8A2BE2] border-none h-1.5 animate-[progress-indeterminate_1.5s_infinite_linear]",
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
              className="w-full bg-[#8A2BE2] text-black hover:text-black py-2 rounded-lg hover:opacity-80 transition-colors font-orbitron text-lg font-bold"
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
                className="text-[#8A2BE2] hover:text-[#A64DFF]"
              >
                Show Preview
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button
            className="text-gray-400 hover:text-white"
            title='FullScreen'
            onClick={handleIframeFullscreen}
            >
            <FullscreenIcon />
          </button> */}
              <QRdisplay appUrl={qrURL} />
              <button
                className="text-gray-400 hover:text-white"
                title="Terminal"
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
                <p className="text-stone-400 mb-2 font-orbitron">
                  {iframeText}
                </p>
                <div className="text-center text-stone-400 font-orbitron text-xs opacity-80 leading-relaxed">
                  <p>
                    If the screen stays blank or stuck on{" "}
                    <strong> Loading...</strong> for too long, open Developer
                    Tools to check for errors.
                  </p>
                  <p>
                    Use <strong>F12</strong> or{" "}
                    <strong>Ctrl + Shift + I</strong> (Windows/Linux) or{" "}
                    <strong>Cmd + Option + I</strong> (Mac) to access it.
                  </p>
                </div>
              </div>
            </div>
            {!url && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ zIndex: 10 }}
              >
                <p className="text-black mb-2 font-orbitron">
                  {" "}
                  {iframeLoader}{" "}
                </p>
              </div>
            )}

            <iframe
              src={url}
              className="w-full h-full rounded-lg border-gray-800 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-black"
              title="Preview"
              style={{
                backgroundColor: iframeBackground,
                zIndex: url ? 20 : 5,
                position: "relative",
              }}
            />

            <div
              ref={terminalRef}
              className={`absolute inset-0 bg-black pt-2 z-[9998]  scrollbar-thin-mobile  
                      ${showTerminal ? "block" : "hidden"}`}
              style={{ pointerEvents: "auto" }}
            ></div>

            {/* error display */}
            {errors.length > 0 && (
              <div
                className="absolute bottom-36 inset-0 flex  items-end justify-center z-[9999] pointer-events-none"
                style={{ padding: "0 1rem 1rem 1rem" }}
              >
                <div className="bg-red-900/90 border border-red-700 rounded-lg shadow-lg w-full max-w-full max-h-62  pointer-events-auto">
                  <div className="flex justify-between items-center p-3 border-b border-red-700">
                    <h3 className="text-red-300 font-bold font-orbitron">
                      {errors.length} {errors.length === 1 ? "Error" : "Errors"}{" "}
                      Detected
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleErrorsSubmit}
                        className="text-white hover:text-white bg-black hover:bg-black/60 rounded px-3 py-1 text-sm font-orbitron transition-colors border border-red-700"
                      >
                        Fix with{" "}
                        <span className="inline-block font-orbitron text-sm font-bold text-[#8A2BE2] tracking-wider">
                          PHANTOM
                        </span>
                        <span className="font-orbitron text-xs text-[#B98DF0] ml-1 self-end mb-1">
                          mobile
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
                      <div
                        key={index}
                        className="mb-2 last:mb-0 border-l-2 border-red-600 pl-2"
                      >
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
    <React.Suspense
      fallback={
        <div className="flex justify-center items-center">
          <div className="inline-flex items-center cursor-pointer hover:opacity-80 transition-opacity relative right-5 bottom-4">
            <span className="font-orbitron text-2xl font-bold text-[#8A2BE2] tracking-wider">
              PHANTOM
            </span>
            <span className="font-orbitron text-sm text-[#B98DF0] ml-1 self-end mb-1">
              mobile
            </span>
          </div>
        </div>
      }
    >
      <Editor />
    </React.Suspense>
  );
}
