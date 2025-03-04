import React, { useState } from 'react';
import { SearchResult } from '../types';
import ResultCard from './ResultCard';
import { ArrowUpDown } from 'lucide-react';

interface ResultsContainerProps {
  results: SearchResult[];
  query: string;
}

type SortOption = 'relevance' | 'date';

const ResultsContainer: React.FC<ResultsContainerProps> = ({ results, query }) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'relevance') {
      return b.relevanceScore - a.relevanceScore;
    } else if (sortBy === 'date' && a.publishedDate && b.publishedDate) {
      return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
    }
    return 0;
  });

  const sourceCount = {
    google: results.filter(r => r.source === 'google').length,
    youtube: results.filter(r => r.source === 'youtube').length,
    linkedin: results.filter(r => r.source === 'linkedin').length
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Results for "{query}" <span className="text-gray-500 text-sm">({results.length} results)</span>
          </h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
        <div className="flex mt-2 text-sm text-gray-500 space-x-4">
          <span>Google: {sourceCount.google}</span>
          <span>YouTube: {sourceCount.youtube}</span>
          <span>LinkedIn: {sourceCount.linkedin}</span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600">No results found. Try a different search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedResults.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsContainer;