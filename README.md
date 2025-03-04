# AI-Powered Search and Aggregation Tool

This project is a prototype of an AI-powered search and aggregation tool that can take user input, retrieve data from sources such as Google, YouTube, and LinkedIn, and present the results in a structured UI.

## Features

- User input module with a clean, responsive UI
- Multithreaded backend service that queries multiple platforms
- AI processing of queries to optimize search terms
- Structured display of search results with filtering and sorting options
- Relevance ranking of search results

## Tech Stack

- **Frontend**: React.js + Vite with TypeScript
- **Backend**: Node.js with Express
- **Data Retrieval**: Web scraping (simulated in this prototype)
- **AI/NLP**: OpenAI GPT-3.5 Turbo
- **Styling**: Tailwind CSS

## Project Structure

```
/
├── src/                  # Frontend React application
│   ├── components/       # React components
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── server/               # Backend Node.js server
│   ├── index.js          # Server entry point
│   └── services/         # Backend services
│       ├── aiService.js  # AI processing service
│       ├── googleService.js # Google search service
│       ├── youtubeService.js # YouTube search service
│       └── linkedinService.js # LinkedIn search service
├── .env                  # Environment variables
└── package.json          # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Serp API key
- Youtube API key


### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SERPAPI_KEY= your_serp_api_key_here
   YOUTUBE_API_KEY= your_youtube_api_key_here
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

### Running the Application

1. Start the backend server:
   ```
   npm run server
   ```
2. In a separate terminal, start the frontend development server:
   ```
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`

## Implementation Notes

- This prototype uses mock data for search results instead of actual API calls or web scraping
- The AI processing is done using OpenAI's GPT-3.5 Turbo model
- The relevance ranking is simulated with random scores in this prototype

## Future Enhancements

- Implement actual API integrations for Google, YouTube, and LinkedIn
- Add user authentication and search history
- Improve the AI ranking algorithm with more sophisticated NLP techniques
- Add pagination for search results
- Implement caching for improved performance