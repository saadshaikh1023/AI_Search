import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process the user query with AI to generate optimized search queries for different platforms
 * @param {string} query - The original user query
 * @returns {Promise<Object>} - Optimized queries for each platform
 */
export async function processQuery(query) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps optimize search queries for different platforms. 
          Given a user's search query, generate the most effective search terms for Google, YouTube, and LinkedIn.
          Format your response as JSON with the following structure:
          {
            "google": "optimized query for Google",
            "youtube": "optimized query for YouTube",
            "linkedin": "optimized query for LinkedIn"
          }`
        },
        {
          role: "user",
          content: `Generate optimized search queries for the following user query: "${query}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error processing query with AI:', error);
    // Return the original query if AI processing fails
    return {
      google: query,
      youtube: query,
      linkedin: query
    };
  }
}

/**
 * Analyze and rank search results based on relevance to the original query
 * @param {Array} results - The search results to analyze
 * @param {string} originalQuery - The original user query
 * @returns {Promise<Array>} - Ranked search results
 */
export async function rankResults(results, originalQuery) {
  try {
    // For each result, calculate a relevance score based on title and description match
    const rankedResults = results.map(result => {
      // Calculate a basic relevance score
      let score = 0;
      
      // Check if title contains the query (case insensitive)
      const titleLower = result.title.toLowerCase();
      const queryLower = originalQuery.toLowerCase();
      const queryWords = queryLower.split(/\s+/);
      
      // Title exact match is highly relevant
      if (titleLower === queryLower) {
        score += 5;
      }
      // Title contains the query
      else if (titleLower.includes(queryLower)) {
        score += 4;
      }
      // Title contains all words from the query
      else if (queryWords.every(word => titleLower.includes(word))) {
        score += 3;
      }
      // Title contains some words from the query
      else {
        const matchedWords = queryWords.filter(word => titleLower.includes(word));
        score += (matchedWords.length / queryWords.length) * 2;
      }
      
      // Check description if available
      if (result.description) {
        const descLower = result.description.toLowerCase();
        
        // Description contains the query
        if (descLower.includes(queryLower)) {
          score += 2;
        }
        // Description contains some words from the query
        else {
          const matchedWords = queryWords.filter(word => descLower.includes(word));
          score += (matchedWords.length / queryWords.length);
        }
      }
      
      // Add a small random factor to break ties
      score += Math.random() * 0.5;
      
      // Ensure score is between 0-5
      score = Math.min(5, Math.max(0, score));
      
      return {
        ...result,
        relevanceScore: score
      };
    });
    
    // Try to use AI for more sophisticated ranking if there are enough results
    if (results.length >= 3 && process.env.OPENAI_API_KEY) {
      try {
        const aiRankedResults = await rankResultsWithAI(results, originalQuery);
        return aiRankedResults;
      } catch (aiError) {
        console.error('Error ranking results with AI:', aiError);
        // Fall back to basic ranking
        return rankedResults;
      }
    }
    
    return rankedResults;
  } catch (error) {
    console.error('Error ranking results:', error);
    // Return the original results with default relevance scores if ranking fails
    return results.map(result => ({
      ...result,
      relevanceScore: 3 // Default middle score
    }));
  }
}

/**
 * Use AI to rank search results based on relevance to the original query
 * @param {Array} results - The search results to analyze
 * @param {string} originalQuery - The original user query
 * @returns {Promise<Array>} - AI-ranked search results
 */
async function rankResultsWithAI(results, originalQuery) {
  try {
    // Prepare the results for AI analysis
    const resultsForAI = results.map((result, index) => ({
      id: index, // Use index as temporary ID for the AI
      title: result.title,
      description: result.description || '',
      source: result.source
    }));
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that ranks search results based on their relevance to a user's query.
          You will be given a list of search results and the original query.
          For each result, assign a relevance score from 0 to 5, where 5 is extremely relevant and 0 is not relevant at all.
          Format your response as a JSON array of objects with the following structure:
          [
            {
              "id": 0,
              "relevanceScore": 4.5
            },
            ...
          ]`
        },
        {
          role: "user",
          content: `Original query: "${originalQuery}"
          
          Search results:
          ${JSON.stringify(resultsForAI, null, 2)}
          
          Rank these results by relevance to the original query.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const rankings = JSON.parse(content);
    
    // Apply the AI rankings to the original results
    return results.map((result, index) => {
      const ranking = rankings.find(r => r.id === index);
      return {
        ...result,
        relevanceScore: ranking ? ranking.relevanceScore : 3 // Default to 3 if not found
      };
    });
  } catch (error) {
    console.error('Error ranking results with AI:', error);
    throw error;
  }
}