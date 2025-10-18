import { useState, useEffect } from 'react';
import { copyManager } from '@/lib/copyManager';

export const useCopy = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadCopy = async () => {
      await copyManager.loadStrings();
      setIsLoaded(true);
    };
    
    loadCopy();
  }, []);

  const getString = (key: string, fallback: string = key) => {
    return copyManager.getString(key, fallback);
  };

  return { getString, isLoaded };
};