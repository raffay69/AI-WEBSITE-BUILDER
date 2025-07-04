import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

// Singleton instance to track WebContainer
let globalWebContainerInstance: WebContainer | null = null;
let webContainerPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();

    async function main() {
        // If no promise exists, create one
        if (!webContainerPromise) {
            webContainerPromise = WebContainer.boot({
                workdirName:"projects",
                coep:"credentialless"
            });
        }

        try {
            // Wait for the existing or new promise
            const webcontainerInstance = await webContainerPromise;
            
            // Set the global instance if not already set
            if (!globalWebContainerInstance) {
                globalWebContainerInstance = webcontainerInstance;
            }

            setWebcontainer(globalWebContainerInstance);
        } catch (error) {
            console.error('WebContainer boot error:', error);
        }
    }

    useEffect(() => {
        main();
    }, [])
    

    return webcontainer;
}