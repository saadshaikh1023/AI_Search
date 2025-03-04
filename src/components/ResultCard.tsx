import React from 'react';
import { SearchResult } from '../types';
import { Globe, Youtube, Linkedin, ExternalLink, Calendar, Star } from 'lucide-react';

interface ResultCardProps {
  result: SearchResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const getSourceIcon = () => {
    switch (result.source) {
      case 'google':
        return <Globe className="h-5 w-5 text-blue-600" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-800" />;
      default:
        return <Globe className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSourceLabel = () => {
    switch (result.source) {
      case 'google':
        return 'Google';
      case 'youtube':
        return 'YouTube';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return 'Unknown';
    }
  };

  // Fallback image for when the thumbnail is not available or fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getSourceIcon()}
            <span className="text-sm font-medium text-gray-500">{getSourceLabel()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">{result.relevanceScore.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="flex">
          {result.thumbnail && (
            <div className="flex-shrink-0 mr-4">
              <img 
                src={result.thumbnail} 
                alt={result.title} 
                className="w-24 h-24 object-cover rounded"
                onError={handleImageError}
              />
            </div>
          )}
          
          <div className="flex-grow">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:underline flex items-center"
              >
                {result.title}
                <ExternalLink className="h-4 w-4 ml-1 inline-block" />
              </a>
            </h3>
            
            <p className="text-sm text-gray-600 mb-2">{result.description}</p>
            
            <div className="flex items-center text-xs text-gray-500 space-x-4">
              {result.publishedDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(result.publishedDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {result.author && (
                <div>
                  <span>By {result.author}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;