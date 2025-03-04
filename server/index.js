import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processQuery } from './services/aiService.js';
import { searchGoogle } from './services/googleService.js';
import { searchYoutube } from './services/youtubeService.js';
import { searchLinkedin } from './services/linkedinService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

// Routes
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log(`Received search request for: "${query}"`);
    
    // Process the query with AI to generate optimized search queries
    const processedQueries = await processQuery(query);
    console.log('Processed queries:', processedQueries);
    
    // Run searches in parallel
    const [googleResults, youtubeResults, linkedinResults] = await Promise.all([
      searchGoogle(processedQueries.google || query),
      searchYoutube(processedQueries.youtube || query),
      searchLinkedin(processedQueries.linkedin || query)
    ]);
    
    console.log(`Found ${googleResults.length} Google results, ${youtubeResults.length} YouTube results, ${linkedinResults.length} LinkedIn results`);
    
    // Combine and rank results
    const combinedResults = [
      ...googleResults,
      ...youtubeResults,
      ...linkedinResults
    ];
    
    // Return the results
    res.json({ 
      results: combinedResults,
      originalQuery: query,
      processedQueries
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'An error occurred during search',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/health`);
});
