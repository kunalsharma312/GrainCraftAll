/**
 * useLocationDetector Hook
 * Automatically detects user location on app startup and syncs with Redux
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setLocation } from '../redux/slices/authSlice';
import { locationService, LocationData, LocationError } from '../services/locationService';
import { analyticsService } from '../services/analyticsService';

interface UseLocationDetectorOptions {
  autoDetect?: boolean;
  onLocationDetected?: (location: LocationData) => void;
  onLocationError?: (error: LocationError) => void;
}

/**
 * Custom hook to detect and manage user location
 * Should be called once on app startup
 */
export function useLocationDetector(options: UseLocationDetectorOptions = {}) {
  const { autoDetect = true, onLocationDetected, onLocationError } = options;
  const dispatch = useAppDispatch();
  const location = useAppSelector((state) => state.auth.location);

  /**
   * Get current location and update Redux store
   */
  const detectLocation = useCallback(async () => {
    try {
      analyticsService.info('LOCATION', 'Starting location detection');

      const result = await locationService.getCurrentLocation();

      // Check if result is an error
      if ('code' in result && 'message' in result) {
        const error = result as LocationError;
        analyticsService.warn('LOCATION', `Location detection failed: ${error.code} - ${error.message}`);
        onLocationError?.(error);
        return null;
      }

      // Result is LocationData
      const locationData = result as LocationData;
      dispatch(setLocation(locationData));
      analyticsService.info(
        'LOCATION',
        `Location detected: ${locationData.city}, ${locationData.state}`
      );
      onLocationDetected?.(locationData);
      return locationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      analyticsService.error('LOCATION', 'Error detecting location', error as Error);
      onLocationError?.({
        code: 'UNKNOWN',
        message: errorMessage,
      });
      return null;
    }
  }, [dispatch, onLocationDetected, onLocationError]);

  /**
   * Watch location for continuous updates
   */
  const watchLocation = useCallback(() => {
    analyticsService.info('LOCATION', 'Starting location watch');

    const subscription = locationService.watchLocation(
      (locationData) => {
        dispatch(setLocation(locationData));
        analyticsService.debug('LOCATION', `Location updated: ${locationData.city}, ${locationData.state}`);
        onLocationDetected?.(locationData);
      },
      (error) => {
        analyticsService.warn('LOCATION', `Location watch error: ${error.code}`);
        onLocationError?.(error);
      }
    );

    return subscription;
  }, [dispatch, onLocationDetected, onLocationError]);

  /**
   * Run auto-detection on mount if enabled and location not already set
   */
  useEffect(() => {
    if (!autoDetect) return;

    // If location is already set, skip detection
    if (location !== null) {
      analyticsService.debug('LOCATION', 'Location already available, skipping auto-detection');
      return;
    }

    let active = true;

    const initializeLocation = async () => {
      const detectedLocation = await detectLocation();
      if (active && detectedLocation) {
        // Start watching for location updates after initial detection
        watchLocation();
      }
    };

    initializeLocation();

    return () => {
      active = false;
    };
  }, [autoDetect, location, detectLocation, watchLocation]);

  return {
    location,
    detectLocation,
    watchLocation,
  };
}

export default useLocationDetector;
