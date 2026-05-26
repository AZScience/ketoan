import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AutocompleteProps {
  collectionName: string;
  searchField: string;
  displayField: string;
  valueField: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, item?: any) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  filters?: any[];
  renderItem?: (item: any) => React.ReactNode;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  collectionName,
  searchField,
  displayField,
  valueField,
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  className,
  label,
  disabled,
  required,
  filters = [],
  renderItem
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If value changes from outside, we might need to fetch the item to display its name
    // But for simplicity, we assume value is the code/id we want to show
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (search: string) => {
    if (!search || search.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch all items and filter client-side for better multi-field search
      // In a real large-scale app, we'd use Algolia or similar, but for this size, 
      // fetching a reasonable limit and filtering is more user-friendly than prefix-only search
      const q = query(
        collection(db, collectionName),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const filtered = items.filter(item => {
        const searchLower = search.toLowerCase();
        const val1 = String(item[searchField] || '').toLowerCase();
        const val2 = String(item[displayField] || '').toLowerCase();
        return val1.includes(searchLower) || val2.includes(searchLower);
      }).slice(0, 10);

      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    fetchSuggestions(val);
    if (!val) {
      onChange('', null);
    }
  };

  const handleSelect = (item: any) => {
    setInputValue(item[valueField]);
    onChange(item[valueField], item);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-1", className)}>
      {label && (
        <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && fetchSuggestions(inputValue)}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={cn(
            "w-full p-2 rounded-lg bg-white border border-slate-200 focus:border-blue-500 outline-none text-sm transition-all pr-8",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50"
          )}
        />
        <div className="absolute inset-y-0 right-2 flex items-center gap-1">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-slate-400" />
          ) : inputValue ? (
            <button 
              type="button"
              onClick={() => { setInputValue(''); onChange('', null); setSuggestions([]); }}
              className="text-slate-300 hover:text-slate-500"
            >
              <X size={14} />
            </button>
          ) : (
            <Search size={14} className="text-slate-300" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-50"
          >
            {suggestions.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handleSelect(item)}
                className={cn(
                  "p-3 text-sm cursor-pointer transition-colors flex flex-col gap-0.5",
                  selectedIndex === index ? "bg-blue-50" : "hover:bg-slate-50"
                )}
              >
                {renderItem ? renderItem(item) : (
                  <>
                    <span className="font-bold text-slate-900">{item[displayField]}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item[valueField]}</span>
                  </>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
