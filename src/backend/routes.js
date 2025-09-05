import express from "express"; // Because we are in ES module mode
import { Octokit } from "@octokit/rest"; // Octokit allows us to use Github REST API via NPM
import cors from "cors";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Helper function to get keywords from Gemini API
const getKeywordsFromGemini = async (userQuery, retryCount = 0) => {
  const apiKey = process.env.GEMINI_API_KEY
  const maxRetries = 2
  
  console.log(`Gemini API attempt ${retryCount + 1}:`, !!apiKey)
  
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set GEMINI_API_KEY in your environment variables.')
  }
  
  const prompt = `Given this user query: "${userQuery}"

Please provide 3-5 relevant keywords or search terms that would be useful for finding GitHub repositories related to the user query. Focus on:
- Programming languages
- Technologies
- Frameworks
- Libraries
- Tools
- Concepts
- Clones of existing companies and products 
- Limit responses to english only 

Return only the keywords separated by spaces, no explanations or additional text.`

  try {
   
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API timeout after 8 seconds')), 8000)
    })

    const fetchPromise = fetch(`${GEMINI_API_BASE}/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    const response = await Promise.race([fetchPromise, timeoutPromise])
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response:', errorText)
      
      if (response.status === 429) {
        throw new Error('Gemini API rate limit exceeded. Using fallback search.')
      } else {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
      }
    }
    
    const data = await response.json()
    console.log('Gemini API response:', data)
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Invalid response structure from Gemini API')
    }
    
    const keywords = data.candidates[0].content.parts[0].text.trim()
    
    if (!keywords || keywords.length < 3) {
      throw new Error('Gemini returned empty or invalid keywords')
    }
    
    console.log('Extracted keywords:', keywords)
    return keywords
    
  } catch (error) {
    console.error(`Gemini API attempt ${retryCount + 1} failed:`, error.message)
    
    if (retryCount < maxRetries) {
      console.log(`Retrying Gemini API in 2 seconds... (attempt ${retryCount + 2}/${maxRetries + 1})`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return getKeywordsFromGemini(userQuery, retryCount + 1)
    }
    
    throw error
  }
}

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/search", async (req, res) => {
    try {
        const userQuery = req.query.q || "fastapi docker"; 
        console.log('Backend received search query:', userQuery);
        
        let keywords;
        let isFallback = false;
        
       
        try {
            console.log('Attempting Gemini API call...');
            keywords = await getKeywordsFromGemini(userQuery);
            console.log('Gemini returned keywords:', keywords);
        } catch (geminiError) {
            console.warn('Gemini API failed, using fallback:', geminiError.message);
            
            keywords = userQuery;
            isFallback = true;
        }
        
      
        console.log('Searching GitHub with keywords:', keywords);
        const result = await octokit.rest.search.repos({
            q: keywords,
            sort: "stars",
            order: "desc",
            per_page: 30,
        });

  
        const repositories = result.data.items.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description || '',
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics || []
        }));

        res.json({
            repositories,
            keywords,
            isFallback,
            originalQuery: userQuery
        });
        
    } catch (err) {
        console.error('Backend search error:', err);
        res.status(500).json({ 
            error: "Something went wrong", 
            message: err.message 
        });
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

});
