import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processQuery } from '../services/aiService.js';
import { searchGoogle } from '../services/googleService.js';
import { searchYoutube } from '../services/youtubeService.js';
import { searchLinkedin } from '../services/linkedinService.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const processedQueries = await processQuery(query);
    const [googleResults, youtubeResults, linkedinResults] = await Promise.all([
      searchGoogle(processedQueries.google || query),
      searchYoutube(processedQueries.youtube || query),
      searchLinkedin(processedQueries.linkedin || query)
    ]);

    res.json({
      results: [...googleResults, ...youtubeResults, ...linkedinResults],
      originalQuery: query,
      processedQueries
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default app;
