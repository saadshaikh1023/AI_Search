import React from 'react';
import { Globe, Youtube, Linkedin, Filter } from 'lucide-react';

interface FilterPanelProps {
  activeFilters: {
    google: boolean;
    youtube: boolean;
    linkedin: boolean;
  };
  toggleFilter: (filter: 'google' | 'youtube' | 'linkedin') => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ activeFilters, toggleFilter }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Filter Results</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            id="filter-google"
            type="checkbox"
            checked={activeFilters.google}
            onChange={() => toggleFilter('google')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="filter-google" className="ml-2 flex items-center">
            <Globe className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-gray-700">Google</span>
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="filter-youtube"
            type="checkbox"
            checked={activeFilters.youtube}
            onChange={() => toggleFilter('youtube')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="filter-youtube" className="ml-2 flex items-center">
            <Youtube className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-gray-700">YouTube</span>
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="filter-linkedin"
            type="checkbox"
            checked={activeFilters.linkedin}
            onChange={() => toggleFilter('linkedin')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="filter-linkedin" className="ml-2 flex items-center">
            <Linkedin className="h-4 w-4 text-blue-800 mr-2" />
            <span className="text-sm text-gray-700">LinkedIn</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;