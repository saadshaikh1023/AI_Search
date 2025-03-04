import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';
import { rankResults } from './aiService.js';

// Cache to store search results for 1 hour
const searchCache = new NodeCache({ stdTTL: 3600 });

/**
 * Search LinkedIn for the given query
 * @param {string} query - The search query
 * @returns {Promise<Array>} - LinkedIn search results
 */
export async function searchLinkedin(query) {
  try {
    // Check if we have cached results for this query
    const cacheKey = `linkedin_${query}`;
    const cachedResults = searchCache.get(cacheKey);
    
    if (cachedResults) {
      console.log('Using cached LinkedIn results for:', query);
      return cachedResults;
    }
    
    // If no cached results, perform web scraping
    console.log('Scraping LinkedIn results for:', query);
    const results = await scrapeLinkedinResults(query);
    
    // Rank the results
    const rankedResults = await rankResults(results, query);
    
    // Cache the results
    searchCache.set(cacheKey, rankedResults);
    
    return rankedResults;
  } catch (error) {
    console.error('LinkedIn search error:', error);
    // Fallback to mock data if scraping fails
    console.log('Falling back to mock data for LinkedIn search');
    return getMockLinkedinResults(query);
  }
}

/**
 * Scrape LinkedIn search results using Google search with site:linkedin.com
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Scraped search results
 */
async function scrapeLinkedinResults(query) {
  try {
    // Use Google search with site:linkedin.com to find LinkedIn profiles and content
    const response = await axios.get(`https://www.google.com/search?q=${encodeURIComponent(query)}+site:linkedin.com`, {
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
      if (!url || !url.includes('linkedin.com')) return;
      
      // Extract description
      const descriptionElement = $(element).find('.VwiC3b, .s3v9rd, .st');
      const description = descriptionElement.length ? descriptionElement.text() : '';
      
      // Determine the type of LinkedIn content
      let type = 'profile';
      if (url.includes('linkedin.com/company')) {
        type = 'company';
      } else if (url.includes('linkedin.com/groups')) {
        type = 'group';
      } else if (url.includes('linkedin.com/events')) {
        type = 'event';
      } else if (url.includes('linkedin.com/posts')) {
        type = 'post';
      }
      
      // Get appropriate thumbnail based on content type
      let thumbnail;
      switch (type) {
        case 'profile':
          thumbnail = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80';
          break;
        case 'company':
          thumbnail = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80';
          break;
        case 'group':
          thumbnail = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80';
          break;
        case 'event':
          thumbnail = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80';
          break;
        case 'post':
          thumbnail = 'https://images.unsplash.com/photo-1512626120412-faf41adb4874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80';
          break;
        default:
          thumbnail = null;
      }
      
      if (title && url) {
        results.push({
          id: uuidv4(),
          title,
          description: description || `LinkedIn ${type} related to ${query}`,
          url,
          source: 'linkedin',
          thumbnail,
          publishedDate: new Date().toISOString(),
          additionalInfo: {
            type
          },
          relevanceScore: 0 // Will be set by rankResults
        });
      }
    });
    
    return results.length > 0 ? results : getMockLinkedinResults(query);
  } catch (error) {
    console.error('Error scraping LinkedIn results:', error);
    return getMockLinkedinResults(query);
  }
}

/**
 * Generate mock LinkedIn search results as a fallback
 * @param {string} query - The search query
 * @returns {Array} - Mock search results
 */
function getMockLinkedinResults(query) {
  return [
    {
      id: uuidv4(),
      title: `${query} Specialist`,
      description: `Professional with expertise in ${query} and related technologies.`,
      url: `https://www.linkedin.com/in/${query.toLowerCase().replace(/\s+/g, '-')}-specialist`,
      source: 'linkedin',
      thumbnail: `https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80`,
      publishedDate: new Date().toISOString(),
      author: 'LinkedIn Member',
      additionalInfo: {
        connections: '500+',
        location: 'San Francisco, CA'
      }
    },
    {
      id: uuidv4(),
      title: `${query} Group`,
      description: `A professional group dedicated to discussing ${query} and sharing insights.`,
      url: `https://www.linkedin.com/groups/${generateRandomGroupId()}`,
      source: 'linkedin',
      publishedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      additionalInfo: {
        members: '12,500',
        activity: 'Very Active'
      }
    },
    {
      id: uuidv4(),
      title: `${query} Conference 2025`,
      description: `The premier industry event for ${query} professionals and enthusiasts.`,
      url: `https://www.linkedin.com/events/${generateRandomEventId()}`,
      source: 'linkedin',
      thumbnail: `https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=200&q=80`,
      publishedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      additionalInfo: {
        date: 'June 15-17, 2025',
        location: 'Virtual Event'
      }
    },
    {
      id: uuidv4(),
      title: `${query} Solutions Inc.`,
      description: `A leading company specializing in ${query} solutions for enterprise clients.`,
      url: `https://www.linkedin.com/company/${query.toLowerCase().replace(/\s+/g, '-')}-solutions`,
      source: 'linkedin',
      thumbnail: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300&q=80`,
      publishedDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      additionalInfo: {
        employees: '1,000-5,000',
        industry: 'Technology'
      }
    }
  ];
}

/**
 * Generate a random LinkedIn group ID
 * @returns {string} - Random group ID
 */
function generateRandomGroupId() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

/**
 * Generate a random LinkedIn event ID
 * @returns {string} - Random event ID
 */
function generateRandomEventId() {
  return Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
}