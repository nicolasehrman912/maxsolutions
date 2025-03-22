'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ClientContextValue {
  isClient: boolean;
  disableCache: boolean;
}

const ClientContext = createContext<ClientContextValue>({
  isClient: false,
  disableCache: false,
});

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [disableCache, setDisableCache] = useState(false);
  
  useEffect(() => {
    // Set isClient to true once the component mounts on the client
    setIsClient(true);
    
    // Check for nocache parameter
    try {
      const url = new URL(window.location.href);
      setDisableCache(url.searchParams.has('nocache'));
    } catch (e) {
      // If there's an error parsing the URL, don't disable cache
      setDisableCache(false);
    }
  }, []);
  
  return (
    <ClientContext.Provider value={{ isClient, disableCache }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  return useContext(ClientContext);
} 