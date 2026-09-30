import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../theme';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  value?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  placeholder = 'Search grains, blends...',
  onSearch,
  onClear,
  loading = false,
  value = '',
  autoFocus = false,
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = useCallback(
    (text: string) => {
      setSearchValue(text);
      if (text.length > 2) {
        onSearch(text);
      } else if (text.length === 0) {
        onClear?.();
      }
    },
    [onSearch, onClear]
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    onClear?.();
  }, [onClear]);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      <MaterialIcons
        name="search"
        size={20}
        color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={searchValue}
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        editable={!loading}
        returnKeyType="search"
      />

      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.primary}
          style={styles.loader}
        />
      ) : searchValue.length > 0 ? (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.components.button.borderRadius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  containerFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
    padding: 0,
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});
