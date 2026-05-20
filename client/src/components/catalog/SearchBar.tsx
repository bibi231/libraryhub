import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  autoNavigate?: boolean;
}

export function SearchBar({ initialValue = '', onSearch, placeholder = 'Search books, authors, ISBN...', size = 'md', autoNavigate }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  function handleChange(v: string) {
    setValue(v);
    if (onSearch) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch!(v), 350);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (autoNavigate && value.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(value.trim())}`);
    } else if (onSearch) {
      onSearch(value);
    }
  }

  const sizeStyles = {
    sm: 'py-2 text-sm',
    md: 'py-3 text-sm',
    lg: 'py-4 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-4 h-4 left-4',
    lg: 'w-5 h-5 left-4',
  };

  const padding = {
    sm: 'pl-9',
    md: 'pl-11',
    lg: 'pl-12',
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${iconSizes[size]}`} />
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${padding[size]} pr-10 ${sizeStyles[size]} rounded-2xl border border-stone-200 dark:border-navy-600 bg-white dark:bg-navy-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-warm transition-all`}
      />
      {value && (
        <button
          type="button"
          onClick={() => { setValue(''); onSearch?.(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
