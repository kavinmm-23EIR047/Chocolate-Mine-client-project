import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useCustomHooks';

const SearchInput = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
}) => {
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, 400);

  /* ----------------------------------------------------------
     SAFE SEARCH TRIGGER
  ---------------------------------------------------------- */
  useEffect(() => {
    if (typeof onSearch === 'function') {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  /* ----------------------------------------------------------
     CLEAR SEARCH
  ---------------------------------------------------------- */
  const handleClear = () => {
    setQuery('');

    if (typeof onSearch === 'function') {
      onSearch('');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input border border-input-border text-body pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-muted/60"
      />

      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;