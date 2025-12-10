// ask-ollama.js
// Talk to your LOCAL AI (FREE, works offline!)

// ============================================================================
// IMPORTS - Much simpler than OpenAI!
// ============================================================================

// No dotenv needed - no API keys required! 🎉
// No authentication needed - it's YOUR local AI!

// Fetch is built into Node 18+, but we'll import for older versions
import fetch from 'node-fetch';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Ollama runs locally on your computer at this address
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// Which model to use (the one you just downloaded!)
const MODEL = 'llama3.2';

// ============================================================================
// MAIN FUNCTION - Ask your local AI anything!
// ============================================================================

async function askOllama(question) {
  console.log('🤖 Thinking... (using FREE local AI!)');
  
  try {
    // Send request to LOCAL Ollama (not the cloud!)
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,              // llama3.2
        prompt: question,          // Your question
        stream: false              // Get complete answer at once
      })
    });

    // Check if Ollama is running
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}. Is Ollama running?`);
    }

    // Parse the response
    const data = await response.json();
    
    // Extract the answer
    const answer = data.response;
    
    return answer;

  } catch (error) {
    // If connection fails, Ollama might not be running
    if (error.code === 'ECONNREFUSED') {
      return '❌ Error: Ollama is not running! Start it with: ollama serve';
    }
    
    // Other errors
    return `❌ Error: ${error.message}`;
  }
}

// ============================================================================
// RUN THE SCRIPT
// ============================================================================

// Get question from command line (same as before!)
const question = process.argv.slice(2).join(' ') || 'Explain what a Large Language Model is in one sentence.';

console.log(`\n📝 Question: ${question}\n`);

// Ask your local AI and print the answer
askOllama(question)
  .then(answer => {
    console.log('💡 Answer:\n');
    console.log(answer);
    console.log('\n✅ Done! (This was 100% FREE and OFFLINE!)');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });