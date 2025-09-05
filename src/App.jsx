import { useState } from 'react'
import './App.css'


const searchRepositoriesViaBackend = async (userQuery, retryCount = 0) => {
  const maxRetries = 2
  const url = `http://localhost:3000/search?q=${encodeURIComponent(userQuery)}`
  
  try {
    console.log(`Backend API attempt ${retryCount + 1} with query:`, userQuery)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend API error response:', errorText)
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`Backend API returned ${data.repositories?.length || 0} repositories`)
    
    if (!data.repositories || !Array.isArray(data.repositories)) {
      throw new Error('Invalid response from backend API')
    }
    
    return data
    
  } catch (error) {
    console.error(`Backend API attempt ${retryCount + 1} failed:`, error.message)
    
    if (retryCount < maxRetries) {
      console.log(`Retrying Backend API in 1 second... (attempt ${retryCount + 2}/${maxRetries + 1})`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return searchRepositoriesViaBackend(userQuery, retryCount + 1)
    }
    
    throw error
  }
}

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState(null)
  const [currentStep, setCurrentStep] = useState('') 
  const [generatedKeywords, setGeneratedKeywords] = useState('')
  const [retryInfo, setRetryInfo] = useState('') 

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || loading) return 

    setLoading(true)
    setHasSearched(true)
    setError(null)
    setRepositories([])
    setGeneratedKeywords('')
    setRetryInfo('')
    
    try {
      
      setCurrentStep('Processing your query with AI and searching repositories...')
      setRetryInfo('')
      console.log('Starting backend API call with query:', searchQuery)
      
      const data = await searchRepositoriesViaBackend(searchQuery)
      console.log('Backend returned data:', data)
      
      
      setRepositories(data.repositories)
      setGeneratedKeywords(data.isFallback ? `${data.originalQuery}` : data.keywords)
      
      setCurrentStep('')
      setRetryInfo('')
    } catch (err) {
      console.error('Search error details:', err)
      setError(`Search failed: ${err.message}`)
      setCurrentStep('')
      setRetryInfo('')
    } finally {
      setLoading(false)
    }
  }


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
            GitMap
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
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none"
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
                  disabled={loading}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Processing Status */}
        {loading && (
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30">
              {/* AI Processing Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">AI Agent Processing</h3>
                <p className="text-gray-300">Your query is being analyzed</p>
              </div>

              {/* Processing Steps */}
              <div className="space-y-6">
                {/* Single Step: AI Processing and Search */}
                <div className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 ${
                  currentStep === 'Processing your query with AI and searching repositories...' 
                    ? 'bg-blue-500/20 border border-blue-400/50' 
                    : repositories.length > 0 
                      ? 'bg-green-500/20 border border-green-400/50' 
                      : 'bg-gray-800/50 border border-gray-600/50'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === 'Processing your query with AI and searching repositories...' 
                      ? 'bg-blue-500 text-white animate-pulse' 
                      : repositories.length > 0 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-600 text-gray-300'
                  }`}>
                    {currentStep === 'Processing your query with AI and searching repositories...' ? '⟳' : repositories.length > 0 ? '✓' : '1'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">AI-Powered Repository Search</h4>
                    <p className="text-gray-400 text-sm">
                      {currentStep === 'Processing your query with AI and searching repositories...' 
                        ? 'AI is processing your query and searching for relevant repositories...'
                        : repositories.length > 0 
                          ? `Found ${repositories.length} relevant repositories`
                          : 'Waiting to process your query...'
                      }
                    </p>
                  </div>
                  {currentStep === 'Processing your query with AI and searching repositories...' && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  )}
                </div>

                {/* Generated Keywords Display */}
                {generatedKeywords && (
                  <div className={`rounded-xl p-6 border ${
                    generatedKeywords.startsWith('Fallback:') 
                      ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-400/30' 
                      : 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-400/30'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{generatedKeywords.startsWith('Fallback:') ? '⚠️' : '✨'}</div>
                      <h4 className="text-white font-semibold">
                        {generatedKeywords.startsWith('Fallback:') ? 'Fallback Search' : 'AI-Generated Keywords'}
                      </h4>
                    </div>
                    {generatedKeywords.startsWith('Fallback:') && (
                      <div className="mb-3 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                        <p className="text-orange-300 text-sm">
                          ⚠️ Gemini API rate limit exceeded. Using your original query for search.
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {generatedKeywords.replace('Fallback: ', '').split(' ').map((keyword, index) => (
                        <span 
                          key={index}
                          className={`px-3 py-1 text-white text-sm rounded-full font-medium animate-fadeIn ${
                            generatedKeywords.startsWith('Fallback:')
                              ? 'bg-gradient-to-r from-orange-500 to-red-500'
                              : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Progress</span>
                  <span>
                    {currentStep === 'Processing your query with AI and searching repositories...' ? '50%' : 
                     repositories.length > 0 ? '100%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: currentStep === 'Processing your query with AI and searching repositories...' ? '50%' : 
                             repositories.length > 0 ? '100%' : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
              <div className="text-red-400 text-2xl mb-2">⚠️</div>
              <h3 className="text-red-400 font-semibold mb-2">Search Error</h3>
              <p className="text-gray-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && hasSearched && !error && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {repositories.length > 0 ? `Found ${repositories.length} repositories` : 'No repositories found'}
              </h2>
              <p className="text-gray-400 mb-2">
                Original query: <span className="text-blue-400 font-medium">"{searchQuery}"</span>
              </p>
              {generatedKeywords && (
                <p className="text-gray-400">
                  AI-generated keywords: <span className="text-purple-400 font-medium">"{generatedKeywords}"</span>
                </p>
              )}
            </div>
            
            {repositories.length > 0 ? (
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
                      {repo.topics && repo.topics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          {topic}
                        </span>
                      ))}
                      {repo.topics && repo.topics.length > 3 && (
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
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">
                  🤖 AI-powered search completed!
                </div>
                <p className="text-gray-500 text-sm max-w-2xl mx-auto">
                  No repositories were found for the generated keywords. Try rephrasing your query or using more specific terms.
                </p>
                {generatedKeywords && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700 max-w-2xl mx-auto">
                    <p className="text-sm text-gray-400 mb-2">Keywords used in search:</p>
                    <p className="text-purple-400 font-medium">{generatedKeywords}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-8">
              Describe what you're looking for in natural language. Our AI will find the perfect GitHub repositories for your project.
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-blue-400 text-3xl mb-4">🤖</div>
                <h3 className="text-white font-semibold mb-2">AI-Powered</h3>
                <p className="text-gray-400 text-sm">Gemini AI processes your query into optimal search keywords</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-purple-400 text-3xl mb-4">⭐</div>
                <h3 className="text-white font-semibold mb-2">Quality Results</h3>
                <p className="text-gray-400 text-sm">Get the most popular and well-maintained repositories</p>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="text-green-400 text-3xl mb-4">🚀</div>
                <h3 className="text-white font-semibold mb-2">Smart Discovery</h3>
                <p className="text-gray-400 text-sm">Find relevant repositories you might not have thought to search for</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
