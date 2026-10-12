/**
 * LocationDisplay Component
 * Shows current city and state to the user
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector } from '../redux/hooks';
import Text from './ThemedText';
import theme from '../theme';
import { LocationData } from '../services/locationService';

interface LocationDisplayProps {
  onRefresh?: () => void;
  loading?: boolean;
  variant?: 'compact' | 'expanded';
  showRefreshButton?: boolean;
}

/**
 * Displays current location (city, state) with optional refresh button
 */
export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  onRefresh,
  loading = false,
  variant = 'compact',
  showRefreshButton = true,
}) => {
  const location = useAppSelector((state) => state.auth.location);

  if (!location) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <MaterialIcons name="location-off" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>Location not detected</Text>
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
        <Text style={styles.locationText}>
          {location.city}, {location.state}
        </Text>
        {showRefreshButton && (
          <TouchableOpacity onPress={onRefresh} disabled={loading} style={styles.refreshButton}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <MaterialIcons name="refresh" size={16} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      <View style={styles.header}>
        <MaterialIcons name="location-on" size={24} color={theme.colors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Your Location</Text>
          <Text style={styles.subtitle}>Used to show available deliveries</Text>
        </View>
      </View>

      <View style={styles.details}>
        <LocationDetailRow label="City" value={location.city} />
        <LocationDetailRow label="State" value={location.state} />
        {location.address && <LocationDetailRow label="Address" value={location.address} />}
        {location.postalCode && <LocationDetailRow label="Postal Code" value={location.postalCode} />}
        {location.accuracy !== undefined && (
          <LocationDetailRow
            label="Accuracy"
            value={`±${Math.round(location.accuracy)} meters`}
          />
        )}
      </View>

      {showRefreshButton && (
        <TouchableOpacity
          onPress={onRefresh}
          disabled={loading}
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color={theme.colors.primary} style={styles.buttonIcon} />
              <Text style={styles.updateButtonText}>Updating...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="refresh" size={18} color={theme.colors.primary} />
              <Text style={styles.updateButtonText}>Update Location</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {location.timestamp && (
        <Text style={styles.timestamp}>
          Last updated: {new Date(location.timestamp).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

interface LocationDetailRowProps {
  label: string;
  value: string;
}

/**
 * Single detail row for expanded view
 */
const LocationDetailRow: React.FC<LocationDetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  refreshButton: {
    padding: 4,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  expandedContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  details: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '600',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 12,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 4,
  },
  updateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LocationDisplay;
