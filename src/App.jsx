import { useState } from 'react'
import './App.css'

  // put this helper above your component or inside it
  const normalizeRepo = (r) => ({
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    description: r.description || "No description",
    html_url: r.html_url,
    stargazers_count: Number(r.stargazers_count ?? 0),
    language: r.language || "Unknown",
    topics: Array.isArray(r.topics) ? r.topics : [],
  });

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

const handleSearch = async (e) => {
  e.preventDefault();
  const q = searchQuery.trim();
  if (!q) return;

  setLoading(true);
  setHasSearched(true);

  try {
    // If you use a Vite proxy, keep /api/search. If you use CORS, use http://localhost:3000/search
    const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // normalize incoming JSON to your mock shape
    const normalized = (Array.isArray(data) ? data : []).map(normalizeRepo);
    setRepositories(normalized);   // ← this updates what your cards render
    console.log("Fetched repos:", normalized);
  } catch (err) {
    console.error("Fetch error:", err);
    setRepositories([]);           // show empty state on error
  } finally {
    setLoading(false);
  }
};



  const handleExampleClick = (example) => {
    setSearchQuery(example)
  }

  const exampleQueries = [
    "HTTP client library",
    "React UI components",
    "Node.js web framework",
    "Python machine learning",
    "Database ORM"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            GitHub Agent
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Discover the perfect GitHub repositories for your project. Ask for any tool, library, or solution you need!
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for? (e.g., 'HTTP client library', 'React components')"
                className="flex-1 px-6 py-4 text-lg rounded-xl border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Example Queries */}
          <div className="mt-6">
            <p className="text-gray-400 mb-3">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-4">Searching GitHub repositories...</p>
          </div>
        )}

        {/* Results Section */}
        {!loading && hasSearched && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Found {repositories.length} repositories
              </h2>
              <p className="text-gray-400">
                Results for: <span className="text-blue-400 font-medium">"{searchQuery}"</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repositories.map((repo) => (
                <div key={repo.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all hover:transform hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white truncate">
                      {repo.name}
                    </h3>
                    <span className="flex items-center text-yellow-400 text-sm">
                      ⭐ {repo.stargazers_count.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {repo.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded">
                      {repo.language}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {repo.full_name}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.slice(0, 3).map((topic, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        +{repo.topics.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    View Repository
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-8">
              Enter a search query to find relevant GitHub repositories for your project.
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-blue-400 text-3xl mb-4">🔍</div>
                <h3 className="text-white font-semibold mb-2">Smart Search</h3>
                <p className="text-gray-400 text-sm">Find repositories using natural language queries</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-purple-400 text-3xl mb-4">⭐</div>
                <h3 className="text-white font-semibold mb-2">Quality Results</h3>
                <p className="text-gray-400 text-sm">Get the most popular and well-maintained repositories</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-green-400 text-3xl mb-4">🚀</div>
                <h3 className="text-white font-semibold mb-2">Instant Access</h3>
                <p className="text-gray-400 text-sm">Quick access to repository details and links</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
