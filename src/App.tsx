import React, { useState } from 'react';
import { Search, Youtube, Linkedin, Globe, Filter, SlidersHorizontal, Loader } from 'lucide-react';
import SearchBar from './components/SearchBar';
import ResultsContainer from './components/ResultsContainer';
import FilterPanel from './components/FilterPanel';
import { SearchResult } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    google: true,
    youtube: true,
    linkedin: true
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setQuery(searchQuery);
    
    try {
      const response = await fetch('https://ai-search-bckend.vercel.app/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Error during search:', error);
      // Handle error state here
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const filteredResults = results.filter(result => {
    if (result.source === 'google' && !activeFilters.google) return false;
    if (result.source === 'youtube' && !activeFilters.youtube) return false;
    if (result.source === 'linkedin' && !activeFilters.linkedin) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Search Aggregator</h1>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Panel - Mobile: Hidden by default, Desktop: Always visible */}
          <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
            <FilterPanel 
              activeFilters={activeFilters} 
              toggleFilter={toggleFilter} 
            />
          </div>

          {/* Results */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="h-8 w-8 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Searching across multiple platforms...</p>
              </div>
            ) : (
              query ? (
                <ResultsContainer results={filteredResults} query={query} />
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-4">
                      <Globe className="h-8 w-8 text-blue-600" />
                      <Youtube className="h-8 w-8 text-red-600" />
                      <Linkedin className="h-8 w-8 text-blue-800" />
                    </div>
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Search Across Multiple Platforms</h2>
                  <p className="text-gray-600">
                    Enter a query above to search Google, YouTube, and LinkedIn simultaneously.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
