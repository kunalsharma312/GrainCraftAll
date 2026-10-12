'use client';

import { useState, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  value?: string;
}

export default function SearchBar({
  placeholder = 'Search grains, blends...',
  onSearch,
  onClear,
  loading = false,
  value = '',
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
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-gray-100 border-2 rounded-lg transition-all ${
        isFocused ? 'border-primary bg-white shadow-md' : 'border-transparent'
      }`}
    >
      <FiSearch
        size={20}
        className={`flex-shrink-0 ${
          isFocused ? 'text-primary' : 'text-gray-400'
        }`}
      />

      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => handleChangeText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={loading}
        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 disabled:opacity-50"
      />

      {loading ? (
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : searchValue.length > 0 ? (
        <button
          onClick={handleClear}
          className="p-1 hover:bg-gray-200 rounded transition flex-shrink-0"
          aria-label="Clear search"
        >
          <FiX size={18} className="text-gray-400" />
        </button>
      ) : null}
    </div>
  );
}
