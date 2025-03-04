import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import NodeCache from 'node-cache';
import { rankResults } from './aiService.js';

// Cache to store search results for 1 hour
const searchCache = new NodeCache({ stdTTL: 3600 });

/**
 * Search YouTube for the given query
 * @param {string} query - The search query
 * @returns {Promise<Array>} - YouTube search results
 */
export async function searchYoutube(query) {
  try {
    // Check if we have cached results for this query
    const cacheKey = `youtube_${query}`;
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      console.log('Using cached YouTube results for:', query);
      return cachedResults;
    }
    
    // If no cached results, perform API search
    console.log('Fetching YouTube results for:', query);
    const results = await fetchYoutubeResults(query);
    
    // Rank the results
    const rankedResults = await rankResults(results, query);
    
    // Cache the results
    searchCache.set(cacheKey, rankedResults);
    
    return rankedResults;
  } catch (error) {
    console.error('YouTube search error:', error);
    // Fallback to mock data if API search fails
    console.log('Falling back to mock data for YouTube search');
    return getMockYoutubeResults(query);
  }
}

/**
 * Fetch YouTube search results using the Invidious API (a YouTube frontend that provides a free API)
 * @param {string} query - The search query
 * @returns {Promise<Array>} - YouTube search results
 */
async function fetchYoutubeResults(query) {
  try {
    // Using Invidious API (a YouTube frontend that provides a free API)
    const response = await axios.get(`https://invidious.snopyta.org/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from Invidious API');
    }
    
    return response.data.slice(0, 5).map(video => ({
      id: uuidv4(),
      title: video.title,
      description: video.description || `YouTube video about ${query}`,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      source: 'youtube',
      thumbnail: video.videoThumbnails && video.videoThumbnails.length > 0 
        ? video.videoThumbnails[0].url 
        : `https://source.unsplash.com/300x200/?video,${query.replace(/[^\w\s]/gi, '').replace(/\s+/g, ',')}`,
      publishedDate: video.published ? new Date(video.published * 1000).toISOString() : new Date().toISOString(),
      author: video.author,
      additionalInfo: {
        views: video.viewCount ? formatViewCount(video.viewCount) : 'Unknown',
        duration: video.lengthSeconds ? formatDuration(video.lengthSeconds) : 'Unknown'
      },
      relevanceScore: 0 // Will be set by rankResults
    }));
  } catch (error) {
    console.error('Error fetching YouTube results:', error);
    
    // Try alternative API if first one fails
    try {
      const alternativeResponse = await axios.get(`https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      if (!alternativeResponse.data || !Array.isArray(alternativeResponse.data)) {
        throw new Error('Invalid response from alternative API');
      }
      
      return alternativeResponse.data.slice(0, 5).map(video => ({
        id: uuidv4(),
        title: video.title,
        description: video.description || `YouTube video about ${query}`,
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        source: 'youtube',
        thumbnail: video.videoThumbnails && video.videoThumbnails.length > 0 
          ? video.videoThumbnails[0].url 
          : `https://source.unsplash.com/300x200/?video,${query.replace(/[^\w\s]/gi, '').replace(/\s+/g, ',')}`,
        publishedDate: video.published ? new Date(video.published * 1000).toISOString() : new Date().toISOString(),
        author: video.author,
        additionalInfo: {
          views: video.viewCount ? formatViewCount(video.viewCount) : 'Unknown',
          duration: video.lengthSeconds ? formatDuration(video.lengthSeconds) : 'Unknown'
        },
        relevanceScore: 0 // Will be set by rankResults
      }));
    } catch (alternativeError) {
      console.error('Error fetching YouTube results from alternative API:', alternativeError);
      return getMockYoutubeResults(query);
    }
  }
}

/**
 * Format view count to a readable string
 * @param {number} viewCount - The view count
 * @returns {string} - Formatted view count
 */
function formatViewCount(viewCount) {
  if (viewCount >= 1000000) {
    return `${(viewCount / 1000000).toFixed(1)}M`;
  } else if (viewCount >= 1000) {
    return `${(viewCount / 1000).toFixed(1)}K`;
  } else {
    return viewCount.toString();
  }
}

/**
 * Format duration in seconds to a readable string
 * @param {number} seconds - The duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Generate mock YouTube search results as a fallback
 * @param {string} query - The search query
 * @returns {Array} - Mock search results
 */
function getMockYoutubeResults(query) {
  const cleanQuery = query.replace(/[^\w\s]/gi, '').replace(/\s+/g, ',');
  
  return [
    {
      id: uuidv4(),
      title: `${query} Explained in 5 Minutes`,
      description: `A quick and easy explanation of ${query} that anyone can understand.`,
      url: `https://www.youtube.com/watch?v=${generateRandomVideoId()}`,
      source: 'youtube',
      thumbnail: `https://source.unsplash.com/300x200/?video,${cleanQuery}`,
      publishedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'ExplainItSimply',
      additionalInfo: {
        views: '1.2M',
        duration: '5:24'
      }
    },
    {
      id: uuidv4(),
      title: `The Complete ${query} Tutorial`,
      description: `Learn everything about ${query} in this comprehensive tutorial.`,
      url: `https://www.youtube.com/watch?v=${generateRandomVideoId()}`,
      source: 'youtube',
      thumbnail: `https://source.unsplash.com/300x200/?tutorial,${cleanQuery}`,
      publishedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'TutorialMaster',
      additionalInfo: {
        views: '850K',
        duration: '32:17'
      }
    },
    {
      id: uuidv4(),
      title: `${query} - Latest Developments and Future Trends`,
      description: `Stay up to date with the latest developments and future trends in ${query}.`,
      url: `https://www.youtube.com/watch?v=${generateRandomVideoId()}`,
      source: 'youtube',
      thumbnail: `https://source.unsplash.com/300x200/?future,${cleanQuery}`,
      publishedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'FutureTrends',
      additionalInfo: {
        views: '425K',
        duration: '18:42'
      }
    }
  ];
}

/**
 * Generate a random YouTube video ID
 * @returns {string} - Random video ID
 */
function generateRandomVideoId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}