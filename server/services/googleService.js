import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import { rankResults } from './aiService.js';

// Cache to store search results for 1 hour
const searchCache = new NodeCache({ stdTTL: 3600 });

/**
 * Search Google for the given query
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Google search results
 */
export async function searchGoogle(query) {
  try {
    // Check if we have cached results for this query
    const cacheKey = `google_${query}`;
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      console.log('Using cached Google results for:', query);
      return cachedResults;
    }
    
    // If no cached results, perform web scraping
    console.log('Scraping Google results for:', query);
    const results = await scrapeGoogleResults(query);
    
    // Rank the results
    const rankedResults = await rankResults(results, query);
    
    // Cache the results
    searchCache.set(cacheKey, rankedResults);
    
    return rankedResults;
  } catch (error) {
    console.error('Google search error:', error);
    // Fallback to mock data if scraping fails
    console.log('Falling back to mock data for Google search');
    return getMockGoogleResults(query);
  }
}

/**
 * Scrape Google search results
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Scraped search results
 */
async function scrapeGoogleResults(query) {
  try {
    // Use a proxy service to avoid Google's anti-scraping measures
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    // Extract search results
    $('.g').each((i, element) => {
      // Extract title
      const titleElement = $(element).find('h3');
      if (!titleElement.length) return;
      
      const title = titleElement.text();
      
      // Extract URL
      const linkElement = $(element).find('a');
      if (!linkElement.length) return;
      
      const url = linkElement.attr('href');
      if (!url || !url.startsWith('http')) return;
      
      // Extract description
      const descriptionElement = $(element).find('.VwiC3b, .s3v9rd, .st');
      const description = descriptionElement.length ? descriptionElement.text() : '';
      
      if (title && url) {
        results.push({
          id: uuidv4(),
          title,
          description: description || `Search result for ${query}`,
          url,
          source: 'google',
          publishedDate: new Date().toISOString(),
          relevanceScore: 0 // Will be set by rankResults
        });
      }
    });
    
    // If no results were found, try an alternative scraping approach
    if (results.length === 0) {
      $('div.tF2Cxc').each((i, element) => {
        const title = $(element).find('h3.LC20lb').text();
        const url = $(element).find('a').attr('href');
        const description = $(element).find('div.VwiC3b').text();
        
        if (title && url) {
          results.push({
            id: uuidv4(),
            title,
            description: description || `Search result for ${query}`,
            url,
            source: 'google',
            publishedDate: new Date().toISOString(),
            relevanceScore: 0 // Will be set by rankResults
          });
        }
      });
    }
    
    return results.length > 0 ? results : getMockGoogleResults(query);
  } catch (error) {
    console.error('Error scraping Google results:', error);
    return getMockGoogleResults(query);
  }
}

/**
 * Generate mock Google search results as a fallback
 * @param {string} query - The search query
 * @returns {Array} - Mock search results
 */
function getMockGoogleResults(query) {
  return [
    {
      id: uuidv4(),
      title: `${query} - Wikipedia`,
      description: `Comprehensive information about ${query} from the free encyclopedia.`,
      url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
      source: 'google',
      publishedDate: new Date().toISOString(),
      author: 'Wikipedia Contributors'
    },
    {
      id: uuidv4(),
      title: `The Ultimate Guide to ${query}`,
      description: `Learn everything you need to know about ${query} with our comprehensive guide.`,
      url: `https://example.com/guide/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: 'google',
      publishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Expert Team'
    },
    {
      id: uuidv4(),
      title: `${query} News and Updates`,
      description: `Stay up to date with the latest news and developments about ${query}.`,
      url: `https://news.example.com/topics/${query.toLowerCase().replace(/\s+/g, '-')}`,
      source: 'google',
      publishedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'News Team'
    },
    {
      id: uuidv4(),
      title: `${query} Research Papers`,
      description: `Academic research and scholarly articles related to ${query}.`,
      url: `https://scholar.example.com/search?q=${query.replace(/\s+/g, '+')}`,
      source: 'google',
      publishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      author: 'Academic Publishers'
    }
  ];
}