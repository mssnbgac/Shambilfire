'use client';

import { useEffect, useRef } from 'react';
import { runDataMigrations } from '@/lib/dataMigration';

/**
 * Component that runs data migrations on app initialization
 * This ensures all data is properly formatted and persists correctly
 */
export default function DataMigrationInitializer() {
  const hasRun = useRef(false);
  
  useEffect(() => {
    // Only run once per session
    if (!hasRun.current && typeof window !== 'undefined') {
      hasRun.current = true;
      
      // Run migrations after a short delay to not block initial render
      setTimeout(() => {
        try {
          runDataMigrations();
        } catch (error) {
          console.error('Error running data migrations:', error);
        }
      }, 100);
    }
  }, []);
  
  // This component doesn't render anything
  return null;
}
