/**
 * Location Service
 * Handles geolocation detection, reverse geocoding, and location management
 */

import * as Location from 'expo-location';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends LocationCoordinates {
  city: string;
  state: string;
  country: string;
  postalCode?: string | null;
  address?: string | null;
  accuracy?: number;
  timestamp: number;
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'LOCATION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

class LocationService {
  private lastKnownLocation: LocationData | null = null;
  private locationPermissionGranted = false;

  /**
   * Request location permission from user
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionGranted = status === 'granted';
      return this.locationPermissionGranted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Check if location permission is already granted
   */
  async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.locationPermissionGranted = status === 'granted';
      return this.locationPermissionGranted;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  /**
   * Get current device location with reverse geocoding
   */
  async getCurrentLocation(): Promise<LocationData | LocationError> {
    try {
      // Check permission first
      const hasPermission = await this.checkLocationPermission();
      if (!hasPermission) {
        const permissionGranted = await this.requestLocationPermission();
        if (!permissionGranted) {
          return {
            code: 'PERMISSION_DENIED',
            message: 'Location permission denied by user',
          };
        }
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        mayShowUserSettingsDialog: true,
      });

      // Reverse geocode to get city and state
      const geocodedAddress = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocodedAddress.length === 0) {
        return {
          code: 'LOCATION_UNAVAILABLE',
          message: 'Could not determine city/state from coordinates',
        };
      }

      const address = geocodedAddress[0];
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: address.city || 'Unknown',
        state: address.region || 'Unknown',
        country: address.country || 'Unknown',
        postalCode: address.postalCode,
        address: address.formattedAddress,
        accuracy: location.coords.accuracy || undefined,
        timestamp: Date.now(),
      };

      this.lastKnownLocation = locationData;
      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          return {
            code: 'PERMISSION_DENIED',
            message: 'Location permission was denied',
          };
        }
        if (error.message.includes('timeout')) {
          return {
            code: 'TIMEOUT',
            message: 'Location request timed out',
          };
        }
      }
      return {
        code: 'UNKNOWN',
        message: 'Failed to get location',
      };
    }
  }

  /**
   * Get coordinates from address string (forward geocoding)
   */
  async geocodeAddress(address: string): Promise<LocationCoordinates[] | LocationError> {
    try {
      const geocodedLocations = await Location.geocodeAsync(address);
      if (geocodedLocations.length === 0) {
        return {
          code: 'LOCATION_UNAVAILABLE',
          message: 'Address not found',
        };
      }
      return geocodedLocations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));
    } catch (error) {
      console.error('Error geocoding address:', error);
      return {
        code: 'UNKNOWN',
        message: 'Failed to geocode address',
      };
    }
  }

  /**
   * Get the last known location
   */
  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  /**
   * Watch location changes (for continuous tracking)
   */
  watchLocation(
    callback: (location: LocationData) => void,
    errorCallback?: (error: LocationError) => void
  ): Location.LocationSubscription | null {
    if (!this.locationPermissionGranted) {
      errorCallback?.({
        code: 'PERMISSION_DENIED',
        message: 'Location permission not granted',
      });
      return null;
    }

    let subscription: Location.LocationSubscription | null = null;

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 100, // Or when moved 100 meters
      },
      async (location) => {
        // Reverse geocode
        const geocodedAddress = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocodedAddress.length > 0) {
          const address = geocodedAddress[0];
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            city: address.city || 'Unknown',
            state: address.region || 'Unknown',
            country: address.country || 'Unknown',
            postalCode: address.postalCode || undefined,
            address: address.formattedAddress || undefined,
            accuracy: location.coords.accuracy || undefined,
            timestamp: Date.now(),
          };
          this.lastKnownLocation = locationData;
          callback(locationData);
        }
      }
    ).then((sub) => {
      subscription = sub;
    });

    return subscription;
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   */
  calculateDistance(
    coord1: LocationCoordinates,
    coord2: LocationCoordinates
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.latitude * Math.PI) / 180) *
        Math.cos((coord2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if location is within a radius (in kilometers)
   */
  isWithinRadius(
    userLocation: LocationCoordinates,
    targetLocation: LocationCoordinates,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(userLocation, targetLocation);
    return distance <= radiusKm;
  }
}

// Export singleton instance
export const locationService = new LocationService();

export default locationService;
