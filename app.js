// app.js
// Interactive terminal app for your ARIA

// ============================================================================
// IMPORTS
// ============================================================================

import readline from 'readline';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import { ChromaClient } from 'chromadb';

// ============================================================================
// CONFIGURATION
// ============================================================================

const NOTES_FILE = 'my-notes.json';
const SKILLS_FILE = 'my-skills.json';
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const OLLAMA_EMBED_URL = 'http://localhost:11434/api/embeddings';
const MODEL = 'llama3.2';
const EMBED_MODEL = 'nomic-embed-text'; // Ollama embedding model

// Initialize Chroma client
const chromaClient = new ChromaClient();

// Default skills with milestones
const DEFAULT_SKILLS = {
  python: { 
    name: '🐍 Python', 
    level: 0, 
    maxLevel: 100, 
    category: 'programming',
    completedMilestones: [],
    milestones: {
      10: { title: 'Wrote first "Hello World" script', resource: 'Python.org tutorials' },
      20: { title: 'Used variables, if/else, and loops', resource: 'Learn Python the Hard Way' },
      30: { title: 'Created functions and imported modules', resource: 'Real Python' },
      40: { title: 'Built a CLI tool or script', resource: 'Click library docs' },
      50: { title: 'Worked with APIs (requests library)', resource: 'Requests documentation' },
      60: { title: 'Used pandas/numpy for data analysis', resource: 'Python Data Science Handbook' },
      70: { title: 'Read "Automate the Boring Stuff with Python"', resource: 'automatetheboringstuff.com' },
      80: { title: 'Built a complete project (scraper, bot, app)', resource: 'Real Python Projects' },
      90: { title: 'Contributed to open source Python project', resource: 'GitHub Explore' },
      100: { title: 'Deployed production Python application', resource: 'Heroku/Railway docs' }
    }
  },
  math: { 
    name: '📐 Math/Statistics', 
    level: 0, 
    maxLevel: 100, 
    category: 'foundation',
    completedMilestones: [],
    milestones: {
      10: { title: 'Learned basic algebra and equations', resource: 'Khan Academy Algebra' },
      20: { title: 'Studied probability basics', resource: 'Khan Academy Probability' },
      30: { title: 'Learned statistics fundamentals', resource: 'Statistics for Data Science' },
      40: { title: 'Understood linear algebra basics', resource: '3Blue1Brown YouTube' },
      50: { title: 'Learned calculus fundamentals', resource: 'Khan Academy Calculus' },
      60: { title: 'Applied statistics to real data', resource: 'Think Stats book' },
      70: { title: 'Read statistics/ML math book', resource: 'Mathematics for ML' },
      80: { title: 'Understood advanced concepts (PCA, SVD)', resource: 'Stanford CS229' },
      90: { title: 'Implemented algorithms from scratch', resource: 'Math for Programmers' },
      100: { title: 'Can explain mathematical proofs', resource: 'MIT OpenCourseWare' }
    }
  },
  llm: { 
    name: '🤖 LLM', 
    level: 0, 
    maxLevel: 100, 
    category: 'ai',
    completedMilestones: [],
    milestones: {
      10: { title: 'Used ChatGPT or similar AI tool', resource: 'OpenAI Playground' },
      20: { title: 'Learned about prompting techniques', resource: 'Prompt Engineering Guide' },
      30: { title: 'Installed and ran local LLM (Ollama)', resource: 'Ollama.com' },
      40: { title: 'Built simple chatbot with API', resource: 'LangChain docs' },
      50: { title: 'Understood transformers architecture', resource: 'Attention Is All You Need paper' },
      60: { title: 'Experimented with prompt engineering', resource: 'Learn Prompting' },
      70: { title: 'Read LLM research papers', resource: 'arXiv AI papers' },
      80: { title: 'Fine-tuned a model or used embeddings', resource: 'HuggingFace tutorials' },
      90: { title: 'Built production LLM application', resource: 'LangChain cookbook' },
      100: { title: 'Contributed to LLM open source', resource: 'GitHub Transformers' }
    }
  },
  rag: { 
    name: '📚 RAG', 
    level: 0, 
    maxLevel: 100, 
    category: 'ai',
    completedMilestones: [],
    milestones: {
      10: { title: 'Learned what RAG is', resource: 'RAG explanation articles' },
      20: { title: 'Understood embeddings concept', resource: 'OpenAI Embeddings Guide' },
      30: { title: 'Created first embeddings', resource: 'Sentence Transformers' },
      40: { title: 'Built simple document Q&A', resource: 'LangChain RAG tutorial' },
      50: { title: 'Used vector database', resource: 'Chroma/Pinecone docs' },
      60: { title: 'Implemented semantic search', resource: 'FAISS library' },
      70: { title: 'Optimized retrieval quality', resource: 'RAG best practices' },
      80: { title: 'Built production RAG system', resource: 'LlamaIndex docs' },
      90: { title: 'Experimented with advanced techniques', resource: 'RAG research papers' },
      100: { title: 'Deployed RAG in real application', resource: 'Production RAG guides' }
    }
  },
  n8n: { 
    name: '⚙️ n8n/Workflows', 
    level: 0, 
    maxLevel: 100, 
    category: 'ai',
    completedMilestones: [],
    milestones: {
      10: { title: 'Learned about workflow automation', resource: 'n8n.io introduction' },
      20: { title: 'Installed n8n locally', resource: 'n8n installation guide' },
      30: { title: 'Created first simple workflow', resource: 'n8n quickstart' },
      40: { title: 'Connected multiple services', resource: 'n8n integrations' },
      50: { title: 'Automated daily tasks', resource: 'n8n workflow examples' },
      60: { title: 'Used webhooks and APIs', resource: 'n8n webhook docs' },
      70: { title: 'Built complex multi-step workflows', resource: 'n8n advanced tutorials' },
      80: { title: 'Integrated AI with workflows', resource: 'n8n + AI guides' },
      90: { title: 'Created custom n8n nodes', resource: 'n8n development docs' },
      100: { title: 'Run production workflows', resource: 'n8n cloud hosting' }
    }
  },
  javascript: { 
    name: '💻 JavaScript/Node.js', 
    level: 0, 
    maxLevel: 100, 
    category: 'programming',
    completedMilestones: [],
    milestones: {
      10: { title: 'Wrote first JavaScript code', resource: 'JavaScript.info' },
      20: { title: 'Used variables, functions, loops', resource: 'MDN Web Docs' },
      30: { title: 'Learned ES6+ features', resource: 'ES6 for Everyone' },
      40: { title: 'Built Node.js CLI tool', resource: 'Node.js docs' },
      50: { title: 'Used async/await and promises', resource: 'JavaScript Promises Guide' },
      60: { title: 'Built REST API with Express', resource: 'Express.js docs' },
      70: { title: 'Worked with npm packages', resource: 'NPM documentation' },
      80: { title: 'Built full-stack application', resource: 'Full Stack Open' },
      90: { title: 'Learned React or Vue', resource: 'React docs' },
      100: { title: 'Deployed production app', resource: 'Vercel/Netlify docs' }
    }
  },
  vectordb: { 
    name: '🗄️ Vector Databases', 
    level: 0, 
    maxLevel: 100, 
    category: 'ai',
    completedMilestones: [],
    milestones: {
      10: { title: 'Learned what vector databases are', resource: 'Pinecone blog' },
      20: { title: 'Understood vector similarity', resource: 'Cosine similarity guide' },
      30: { title: 'Created first vectors', resource: 'Embeddings tutorial' },
      40: { title: 'Stored vectors in database', resource: 'Chroma quickstart' },
      50: { title: 'Performed similarity search', resource: 'Vector search guide' },
      60: { title: 'Optimized search performance', resource: 'FAISS documentation' },
      70: { title: 'Compared different vector DBs', resource: 'Vector DB comparison' },
      80: { title: 'Built RAG with vector DB', resource: 'LangChain vector stores' },
      90: { title: 'Scaled vector search', resource: 'Production vector DB' },
      100: { title: 'Deployed production system', resource: 'Pinecone/Weaviate cloud' }
    }
  },
  api: { 
    name: '🔌 APIs', 
    level: 0, 
    maxLevel: 100, 
    category: 'programming',
    completedMilestones: [],
    milestones: {
      10: { title: 'Learned what APIs are', resource: 'REST API basics' },
      20: { title: 'Made first API call with fetch', resource: 'Fetch API docs' },
      30: { title: 'Used API keys and authentication', resource: 'API authentication guide' },
      40: { title: 'Worked with JSON data', resource: 'Working with JSON' },
      50: { title: 'Built simple REST API', resource: 'Express REST tutorial' },
      60: { title: 'Handled errors and edge cases', resource: 'API error handling' },
      70: { title: 'Used webhooks', resource: 'Webhooks explained' },
      80: { title: 'Documented API with OpenAPI', resource: 'Swagger/OpenAPI' },
      90: { title: 'Built production-ready API', resource: 'API design best practices' },
      100: { title: 'Deployed and scaled API', resource: 'API deployment guide' }
    }
  }
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Load notes from file
async function loadNotes() {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save notes to file
async function saveNotes(notes) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// Load skills from file
async function loadSkills() {
  try {
    const data = await fs.readFile(SKILLS_FILE, 'utf-8');
    const skills = JSON.parse(data);
    
    // Migrate old format to new format (add milestones if missing)
    let needsMigration = false;
    for (const [key, skill] of Object.entries(skills)) {
      if (!skill.milestones || !skill.completedMilestones) {
        needsMigration = true;
        // Add missing properties from DEFAULT_SKILLS
        if (DEFAULT_SKILLS[key]) {
          skills[key] = {
            ...DEFAULT_SKILLS[key],
            level: skill.level || 0, // Keep existing level
            name: skill.name,
            category: skill.category
          };
        }
      }
    }
    
    // Save migrated data
    if (needsMigration) {
      console.log('📦 Migrating skills to new format with milestones...\n');
      await saveSkills(skills);
    }
    
    return skills;
  } catch (error) {
    await saveSkills(DEFAULT_SKILLS);
    return DEFAULT_SKILLS;
  }
}

// Save skills to file
async function saveSkills(skills) {
  await fs.writeFile(SKILLS_FILE, JSON.stringify(skills, null, 2));
}

// Create progress bar
function createProgressBar(current, max, width = 20) {
  const percentage = (current / max) * 100;
  const filled = Math.floor((current / max) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${Math.floor(percentage)}%`;
}

// Ask Ollama AI
async function askAI(prompt) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false
      })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    return `❌ Error: ${error.message}. Is Ollama running?`;
  }
}

// ============================================================================
// PHASE 3: RAG FUNCTIONS (Vector Database)
// ============================================================================

// Generate embedding for text using Ollama
async function generateEmbedding(text) {
  try {
    const response = await fetch(OLLAMA_EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: EMBED_MODEL,
        prompt: text
      })
    });
    
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.log(`⚠️  Embedding failed: ${error.message}`);
    return null;
  }
}

// Custom embedding function for Chroma
class OllamaEmbeddingFunction {
  async generate(texts) {
    const embeddings = [];
    for (const text of texts) {
      const embedding = await generateEmbedding(text);
      if (embedding) {
        embeddings.push(embedding);
      } else {
        embeddings.push(Array(768).fill(0)); // Fallback: zero vector
      }
    }
    return embeddings;
  }
}

// Initialize or get Chroma collection for notes
async function getNotesCollection() {
  try {
    // Create custom embedding function
    const embeddingFunction = new OllamaEmbeddingFunction();
    
    // Try to get existing collection
    const collection = await chromaClient.getOrCreateCollection({
      name: 'aria_notes',
      embeddingFunction: embeddingFunction,
      metadata: { description: 'ARIA learning notes with embeddings' }
    });
    return collection;
  } catch (error) {
    console.log(`⚠️  Chroma error: ${error.message}`);
    return null;
  }
}

// Add note to vector database
async function addNoteToVectorDB(noteId, content) {
  try {
    console.log('📊 Creating embedding for note...');
    const embedding = await generateEmbedding(content);
    
    if (!embedding) {
      console.log('⚠️  Skipping vector storage (embedding failed)\n');
      return false;
    }
    
    const collection = await getNotesCollection();
    if (!collection) {
      console.log('⚠️  Skipping vector storage (Chroma unavailable)\n');
      return false;
    }
    
    await collection.add({
      ids: [noteId.toString()],
      embeddings: [embedding],
      documents: [content],
      metadatas: [{ timestamp: new Date().toISOString() }]
    });
    
    console.log('✅ Note stored in vector database!\n');
    return true;
  } catch (error) {
    console.log(`⚠️  Vector storage failed: ${error.message}\n`);
    return false;
  }
}

// Search similar notes using semantic search
async function searchSimilarNotes(query, topK = 5) {
  try {
    const embedding = await generateEmbedding(query);
    if (!embedding) return null;
    
    const collection = await getNotesCollection();
    if (!collection) return null;
    
    const results = await collection.query({
      queryEmbeddings: [embedding],
      nResults: topK
    });
    
    return results;
  } catch (error) {
    console.log(`⚠️  Search failed: ${error.message}`);
    return null;
  }
}

// ============================================================================
// OPTION A: SMART AI SKILL DETECTION
// ============================================================================

// Detect skills from note content using AI
async function detectSkillsWithAI(content) {
  console.log('🤖 ARIA is analyzing your note to detect skills...\n');
  
  const prompt = `You are a skill detection assistant. Read this learning note and identify which skills the person practiced or learned about.

Learning Note: "${content}"

Available Skills and What Counts:
- python: ANY Python programming (scripts, tools, automation, web scraping, data processing, bots, CLI tools, pandas, numpy)
- math: Mathematics, statistics, linear algebra, probability, calculus, algorithms
- llm: Large Language Models, GPT, Ollama, chatbots, AI models, neural networks, transformers
- rag: Retrieval systems, embeddings, vector search, document Q&A, semantic search
- n8n: Workflow automation, task automation, n8n, zapier, integrations
- javascript: JavaScript, Node.js, async/await, ES6+, npm, Express, React
- vectordb: Vector databases, Pinecone, Chroma, Weaviate, similarity search, embeddings storage
- api: REST APIs, endpoints, fetch, HTTP requests, webhooks, API integration, web requests

IMPORTANT RULES:
1. Be GENEROUS with detection - if someone built something, they used the skill!
2. "Built a tool" = programming skill (python or javascript)
3. "Web scraper" = python + api
4. "Chatbot" = llm
5. "Automation" = n8n or python
6. "Data processing" = python
7. When in doubt, include the skill rather than exclude it

Return ONLY skill IDs separated by commas. NO explanations.

Examples:
- "Built a web scraper" → "python,api"
- "Made a chatbot" → "llm"
- "Automated my tasks" → "n8n,python"
- "Learned about embeddings" → "rag,vectordb"
- "Studied neural networks" → "llm,math"

Your response (just skill IDs):`;

  try {
    const aiResponse = await askAI(prompt);
    const skillIds = aiResponse.trim().toLowerCase().split(',').map(s => s.trim());
    
    // Filter valid skills and create detection objects
    const validSkills = ['python', 'math', 'llm', 'rag', 'n8n', 'javascript', 'vectordb', 'api'];
    const detected = [];
    
    for (const skillId of skillIds) {
      if (validSkills.includes(skillId)) {
        detected.push({ skill: skillId, xp: 10 });
      }
    }
    
    return detected;
  } catch (error) {
    console.log('⚠️  AI detection failed, using fallback keyword matching...\n');
    // Fallback to simple keyword matching if AI fails
    return detectSkillsFallback(content);
  }
}

// Fallback keyword detection (if AI fails)
function detectSkillsFallback(content) {
  const detected = [];
  const lower = content.toLowerCase();
  
  if (lower.includes('python') || lower.includes('pandas') || lower.includes('numpy')) {
    detected.push({ skill: 'python', xp: 10 });
  }
  if (lower.includes('math') || lower.includes('statistics') || lower.includes('algebra')) {
    detected.push({ skill: 'math', xp: 10 });
  }
  if (lower.includes('llm') || lower.includes('language model') || lower.includes('gpt') || lower.includes('ollama')) {
    detected.push({ skill: 'llm', xp: 10 });
  }
  if (lower.includes('rag') || lower.includes('retrieval') || lower.includes('embedding')) {
    detected.push({ skill: 'rag', xp: 10 });
  }
  if (lower.includes('n8n') || lower.includes('workflow') || lower.includes('automation')) {
    detected.push({ skill: 'n8n', xp: 10 });
  }
  if (lower.includes('javascript') || lower.includes('node') || lower.includes('js')) {
    detected.push({ skill: 'javascript', xp: 10 });
  }
  if (lower.includes('vector') || lower.includes('database') || lower.includes('pinecone')) {
    detected.push({ skill: 'vectordb', xp: 10 });
  }
  if (lower.includes('api') || lower.includes('endpoint') || lower.includes('fetch')) {
    detected.push({ skill: 'api', xp: 10 });
  }
  
  return detected;
}

// Prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Clear screen (works on Windows CMD and PowerShell)
function clearScreen() {
  console.clear();
}

// Draw a box around text
function drawBox(text, width = 50) {
  const line = '═'.repeat(width);
  console.log(`╔${line}╗`);
  console.log(`║ ${text.padEnd(width - 1)}║`);
  console.log(`╚${line}╝`);
}

// ============================================================================
// MAIN MENU FUNCTIONS
// ============================================================================
async function showMenu() {
  clearScreen();
  
  // Get stats
  const notes = await loadNotes();
  const skills = await loadSkills();
  const today = new Date().toDateString();
  const todayNotes = notes.filter(n => 
    new Date(n.date).toDateString() === today
  );
  
  // Calculate overall skill progress
  const totalLevel = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);
  const overallProgress = Math.floor((totalLevel / (Object.keys(skills).length * 100)) * 100);
  
  // Top banner ASCII art
  console.log('\n\n');
  console.log('                          [=========]');
  console.log('               -==++""" .  /. . .  \\ .  """++==-');
  console.log('        -+""   \\   .. . .  | ..  . |  . .  .   /   ""-+');
  console.log('     /\\  +-""   `-----=====\\  <O>  /=====-----\'   ""-+  /\\');
  console.log('    / /                      ""=""                      \\ \\');
  console.log('  / /                                                     \\ \\');
  console.log(' //                            |                            \\\\');
  console.log('/")                          \\ | /                          ("\\');
  console.log('\\o\\                           \\*/                           /o/');
  console.log(' \\ )                       --**O**--                       ( /');
  console.log('                              /*\\');
  console.log('                             / | \\');
  console.log('                               |');
  console.log('\n');
  
  // ASCII art lines (anime character)
  const asciiArt = [
    "@@@@@@@@@@@@@@@@@@@@@**^^\"~~~\"^@@^*@*@@**@@@@@@@@@",
    "@@@@@@@@@@@@@*^^'\"~   , - ' '; ,@@b. '  -e@@@@@@@@@",
    "@@@@@@@@*^\"~      . '     . ' ,@@@@(  e@*@@@@@@@@@@",
    "@@@@@^~         .       .   ' @@@@@@, ~^@@@@@@@@@@@",
    "@@@~ ,e**@@*e,  ,e**e, .    ' '@@@@@@e,  \"*@@@@@'^@",
    "@',e@@@@@@@@@@ e@@@@@@       ' '*@@@@@@    @@@'   0",
    "@@@@@@@@@@@@@@@@@@@@@',e,     ;  ~^*^'    ;^~   ' 0",
    "@@@@@@@@@@@@@@@^\"\"^@@e@@@   .'           ,'   .'  @",
    "@@@@@@@@@@@@@@'    '@@@@@ '         ,  ,e'  .    ;@",
    "@@@@@@@@@@@@@' ,&&,  ^@*'     ,  .  i^\"@e, ,e@e  @@",
    "@@@@@@@@@@@@' ,@@@@,          ;  ,& !,,@@@e@@@@ e@@",
    "@@@@@,~*@@*' ,@@@@@@e,   ',   e^~^@,   ~'@@@@@@,@@@",
    "@@@@@@, ~\" ,e@@@@@@@@@*e*@*  ,@e  @@\"\"@e,,@@@@@@@@@",
    "@@@@@@@@ee@@@@@@@@@@@@@@@\" ,e@' ,e@' e@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@\" ,@\" ,e@@e,,@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@~ ,@@@,,0@@@@@@@@@@@@@@@@@@@",
    "@@@@@@@@@@@@@@@@@@@@@@@@,,@@@@@@@@@@@@@@@@@@@@@@@@@",
  ];
  
  // Menu lines - FIXED ALIGNMENT
  const menuLines = [
    '╔════════════════════════════════════════════╗',
    '║    ARIA - AI Learning Companion            ║',
    '║    Your Offline AI Assistant               ║',
    '╠════════════════════════════════════════════╣',
    '║                                            ║',
    `║    Stats: ${notes.length} notes | Today: ${todayNotes.length}                       ║`,
    `║    Overall Progress: ${overallProgress}%                     ║`,
    '║                                            ║',
    '╠════════════════════════════════════════════╣',
    '║                                            ║',
    '║    [1]  Add a note                         ║',
    '║    [2]  View all notes                     ║',
    '║    [3]  Search notes with AI               ║',
    '║    [4]  Get AI summary                     ║',
    '║    [5]  Chat with AI directly              ║',
    '║    [6]  Delete a note                      ║',
    '║    [7]  View skill progress                ║',
    '║    [8]  Add skill XP manually              ║',
    '║    [9]  Manage milestones                  ║',
    '║    [10] Semantic search (RAG)              ║',
    '║    [0]  Exit                               ║',
    '║                                            ║',
    '╚════════════════════════════════════════════╝'
  ];
  
  // Print menu and ASCII art side by side
  const maxLines = Math.max(menuLines.length, asciiArt.length);
  
  for (let i = 0; i < maxLines; i++) {
    const menuLine = menuLines[i] || ''.padEnd(46);
    const artLine = asciiArt[i] || '';
    console.log(menuLine + '    ' + artLine);
  }
  
  console.log('\n');
  const choice = await prompt('Choose an option (0-10): ');
  return choice.trim();
}

// ============================================================================
// FEATURE FUNCTIONS
// ============================================================================

// [1] Add a note (WITH OPTION A: SMART AI DETECTION)
async function addNote() {
  clearScreen();
  drawBox('📝 ADD A NOTE');
  console.log('\n');
  
  const content = await prompt('What did you learn? (or type "back" to go back)\n> ');
  
  if (content.toLowerCase() === 'back' || !content.trim()) {
    return;
  }
  
  const notes = await loadNotes();
  
  const newNote = {
    id: Date.now(),
    content: content.trim(),
    date: new Date().toISOString(),
    tags: []
  };
  
  notes.push(newNote);
  await saveNotes(notes);
  
  console.log('\n✅ Note saved successfully!\n');
  
  // PHASE 3: Add to vector database for RAG
  await addNoteToVectorDB(newNote.id, newNote.content);
  
  // OPTION A: Use AI-powered skill detection
  const detectedSkills = await detectSkillsWithAI(content);
  
  if (detectedSkills.length > 0) {
    console.log('🎯 Skills detected! Adding XP...\n');
    
    const skills = await loadSkills();
    
    for (const { skill, xp } of detectedSkills) {
      if (skills[skill]) {
        const oldLevel = skills[skill].level;
        skills[skill].level = Math.min(skills[skill].level + xp, skills[skill].maxLevel);
        
        console.log(`   ${skills[skill].name} +${xp} XP (${oldLevel}% → ${skills[skill].level}%)`);
      }
    }
    
    await saveSkills(skills);
    console.log('');
  } else {
    console.log('ℹ️  No specific skills detected in this note.\n');
  }
  
  await prompt('Press Enter to continue...');
}

// [10] Semantic search with RAG
async function semanticSearch() {
  clearScreen();
  drawBox('🔍 SEMANTIC SEARCH (RAG)');
  console.log('\n');
  console.log('Find notes by meaning, not just keywords!\n');
  
  const query = await prompt('What are you looking for? (or "back")\n> ');
  
  if (query.toLowerCase() === 'back' || !query.trim()) {
    return;
  }
  
  console.log('\n🔍 Searching with AI...\n');
  
  const results = await searchSimilarNotes(query, 5);
  
  if (!results || !results.documents || results.documents[0].length === 0) {
    console.log('📭 No similar notes found!\n');
    console.log('💡 Tip: Add more notes with embeddings enabled.\n');
    await prompt('Press Enter to continue...');
    return;
  }
  
  console.log('📊 Similar Notes Found:\n');
  
  // Display results with similarity scores
  const docs = results.documents[0];
  const distances = results.distances[0];
  
  docs.forEach((doc, index) => {
    // Convert distance to similarity percentage (lower distance = higher similarity)
    const similarity = Math.max(0, (1 - distances[index]) * 100).toFixed(1);
    
    console.log(`${index + 1}. [${similarity}% match]`);
    console.log(`   ${doc.substring(0, 100)}${doc.length > 100 ? '...' : ''}\n`);
  });
  
  console.log('\n💡 These notes are semantically similar to your query!\n');
  
  // Ask if they want AI to summarize
  const summarize = await prompt('Want AI to answer based on these notes? (yes/no): ');
  
  if (summarize.toLowerCase() === 'yes' || summarize.toLowerCase() === 'y') {
    console.log('\n🤖 ARIA is analyzing...\n');
    
    const context = docs.join('\n- ');
    const prompt_text = `Based on these relevant notes:
- ${context}

Question: ${query}

Please provide a helpful answer based ONLY on the notes above.`;

    const answer = await askAI(prompt_text);
    
    console.log('💡 ARIA\'s Answer:\n');
    console.log(answer);
    console.log('\n');
  }
  
  await prompt('Press Enter to continue...');
}

// [9] Manage milestones
async function manageMilestones() {
  clearScreen();
  drawBox('🎯 MANAGE MILESTONES');
  console.log('\n');
  
  const skills = await loadSkills();
  
  // Show all skills
  console.log('Select a skill to manage:\n');
  const skillKeys = Object.keys(skills);
  skillKeys.forEach((key, index) => {
    const skill = skills[key];
    console.log(`[${index + 1}] ${skill.name} (${skill.level}%)`);
  });
  console.log('\n[0] Go back\n');
  
  const choice = await prompt('Choose a skill (0-' + skillKeys.length + '): ');
  const skillIndex = parseInt(choice) - 1;
  
  if (choice === '0' || skillIndex < 0 || skillIndex >= skillKeys.length) {
    return;
  }
  
  const skillKey = skillKeys[skillIndex];
  const skill = skills[skillKey];
  
  // Show milestones for selected skill
  while (true) {
    clearScreen();
    
    // Add a small delay to ensure screen clears
    await new Promise(resolve => setTimeout(resolve, 100));
    
    drawBox(`${skill.name} MILESTONES`);
    console.log('\n');
    
    const milestoneKeys = Object.keys(skill.milestones).map(Number).sort((a, b) => a - b);
    
    milestoneKeys.forEach(level => {
      const milestone = skill.milestones[level];
      const isCompleted = skill.completedMilestones.includes(level);
      const isCurrent = skill.level === level;
      
      let checkbox = '□';
      if (isCompleted) checkbox = '✅';
      else if (isCurrent) checkbox = '☑️';
      
      console.log(`${checkbox} [${level}%] ${milestone.title}`);
      console.log(`     📚 Resource: ${milestone.resource}\n`);
    });
    
    console.log('\nOptions:');
    console.log('[1] Complete a milestone');
    console.log('[2] Uncomplete a milestone');
    console.log('[0] Go back\n');
    
    const action = await prompt('Choose an action: ');
    
    if (action === '0') {
      break;
    } else if (action === '1') {
      // Complete milestone
      const levelStr = await prompt('Enter milestone level to complete (10-100): ');
      const level = parseInt(levelStr);
      
      if (skill.milestones[level]) {
        if (!skill.completedMilestones.includes(level)) {
          skill.completedMilestones.push(level);
          skill.completedMilestones.sort((a, b) => a - b);
          // Level should be the HIGHEST completed milestone, not the one just completed
          skill.level = Math.max(...skill.completedMilestones);
          await saveSkills(skills);
          console.log(`\n✅ Milestone completed! You are now at ${skill.level}%\n`);
        } else {
          console.log('\n⚠️  This milestone is already completed!\n');
        }
      } else {
        console.log('\n❌ Invalid milestone level!\n');
      }
      await prompt('Press Enter to continue...');
      
    } else if (action === '2') {
      // Uncomplete milestone
      const levelStr = await prompt('Enter milestone level to uncomplete (10-100): ');
      const level = parseInt(levelStr);
      
      if (skill.milestones[level]) {
        const index = skill.completedMilestones.indexOf(level);
        if (index > -1) {
          skill.completedMilestones.splice(index, 1);
          // Recalculate level to highest completed milestone
          skill.level = skill.completedMilestones.length > 0 
            ? Math.max(...skill.completedMilestones)
            : 0;
          await saveSkills(skills);
          console.log(`\n✅ Milestone uncompleted! You are now at ${skill.level}%\n`);
        } else {
          console.log('\n⚠️  This milestone is not completed yet!\n');
        }
      } else {
        console.log('\n❌ Invalid milestone level!\n');
      }
      await prompt('Press Enter to continue...');
    }
  }
}

// [7] View skill progress
async function viewSkills() {
  clearScreen();
  const skills = await loadSkills();
  
  drawBox('🎯 YOUR SKILL PROGRESS');
  console.log('\n');
  
  // Calculate overall progress
  const totalLevel = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);
  const totalMax = Object.values(skills).length * 100;
  const overallProgress = Math.floor((totalLevel / totalMax) * 100);
  
  console.log(`📊 Overall Progress: ${createProgressBar(totalLevel, totalMax, 30)}\n`);
  
  // Group by category
  const categories = {
    ai: '🤖 AI & Machine Learning',
    programming: '💻 Programming',
    foundation: '📚 Foundations'
  };
  
  for (const [catKey, catName] of Object.entries(categories)) {
    console.log(`${catName}:`);
    console.log('─'.repeat(60));
    
    for (const [key, skill] of Object.entries(skills)) {
      if (skill.category === catKey) {
        console.log(`${skill.name.padEnd(25)} ${createProgressBar(skill.level, skill.maxLevel, 20)}`);
      }
    }
    console.log('');
  }
  
  await prompt('Press Enter to continue...');
}

// [8] Add skill XP manually
async function addSkillXP() {
  clearScreen();
  const skills = await loadSkills();
  
  drawBox('⚡ ADD SKILL XP');
  console.log('\n');
  
  console.log('Available skills:\n');
  Object.entries(skills).forEach(([key, skill]) => {
    console.log(`  ${key.padEnd(12)} - ${skill.name}`);
  });
  
  console.log('\n');
  const skillKey = await prompt('Enter skill name (or "back"): ');
  
  if (skillKey.toLowerCase() === 'back' || !skillKey.trim()) {
    return;
  }
  
  if (!skills[skillKey]) {
    console.log('\n❌ Skill not found!\n');
    await prompt('Press Enter to continue...');
    return;
  }
  
  const xpStr = await prompt('How much XP to add? ');
  const xp = parseInt(xpStr);
  
  if (isNaN(xp)) {
    console.log('\n❌ Invalid number!\n');
    await prompt('Press Enter to continue...');
    return;
  }
  
  const skill = skills[skillKey];
  const oldLevel = skill.level;
  skill.level = Math.min(skill.level + xp, skill.maxLevel);
  
  await saveSkills(skills);
  
  console.log(`\n✅ ${skill.name} increased!`);
  console.log(`   ${oldLevel}% → ${skill.level}% (+${xp} XP)`);
  console.log(`   ${createProgressBar(skill.level, skill.maxLevel, 20)}\n`);
  
  await prompt('Press Enter to continue...');
}

// [2] View all notes
async function viewNotes() {
  clearScreen();
  const notes = await loadNotes();
  
  drawBox('📚 YOUR NOTES');
  console.log('\n');
  
  if (notes.length === 0) {
    console.log('📭 No notes yet! Add some to get started.\n');
  } else {
    notes.forEach((note, index) => {
      const date = new Date(note.date).toLocaleString();
      console.log(`${index + 1}. [${date}]`);
      console.log(`   ${note.content}\n`);
    });
  }
  
  await prompt('Press Enter to continue...');
}

// [3] Search notes with AI
async function searchNotes() {
  clearScreen();
  drawBox('🔍 SEARCH NOTES WITH AI');
  console.log('\n');
  
  const notes = await loadNotes();
  
  if (notes.length === 0) {
    console.log('📭 No notes to search!\n');
    await prompt('Press Enter to continue...');
    return;
  }
  
  const question = await prompt('Ask a question about your notes (or "back"):\n> ');
  
  if (question.toLowerCase() === 'back' || !question.trim()) {
    return;
  }
  
  console.log('\n🤖 ARIA is thinking...\n');
  
  const allNotes = notes.map(n => `- ${n.content}`).join('\n');
  
  const prompt_text = `Here are my learning notes:
${allNotes}

Question: ${question}

Please answer based ONLY on the notes above. If the answer isn't in the notes, say so.`;

  const answer = await askAI(prompt_text);
  
  console.log('💡 ARIA\'s Answer:\n');
  console.log(answer);
  console.log('\n');
  
  await prompt('Press Enter to continue...');
}

// [4] Get AI summary
async function getSummary() {
  clearScreen();
  drawBox('📊 AI SUMMARY');
  console.log('\n');
  
  const notes = await loadNotes();
  
  if (notes.length === 0) {
    console.log('📭 No notes to summarize!\n');
    await prompt('Press Enter to continue...');
    return;
  }
  
  console.log('🤖 ARIA is generating summary...\n');
  
  const allNotes = notes.map(n => `- ${n.content}`).join('\n');
  
  const prompt_text = `Here are my learning notes:
${allNotes}

Please give me a brief summary of what I've been learning. Group by topics if possible.`;

  const summary = await askAI(prompt_text);
  
  console.log('📊 Summary:\n');
  console.log(summary);
  console.log('\n');
  
  await prompt('Press Enter to continue...');
}

// [5] Chat with AI directly
async function chatWithAI() {
  clearScreen();
  drawBox('💬 CHAT WITH ARIA');
  console.log('\n');
  console.log('Type your questions. Type "back" to return to menu.\n');
  
  while (true) {
    const question = await prompt('You: ');
    
    if (question.toLowerCase() === 'back' || !question.trim()) {
      break;
    }
    
    console.log('\n🤖 ARIA is thinking...\n');
    
    const answer = await askAI(question);
    
    console.log('ARIA:', answer);
    console.log('\n');
  }
}

// [6] Delete a note
async function deleteNote() {
  clearScreen();
  const notes = await loadNotes();
  
  drawBox('🗑️  DELETE A NOTE');
  console.log('\n');
  
  if (notes.length === 0) {
    console.log('📭 No notes to delete!\n');
    await prompt('Press Enter to continue...');
    return;
  }
  
  // Show notes with numbers
  notes.forEach((note, index) => {
    const date = new Date(note.date).toLocaleDateString();
    console.log(`${index + 1}. [${date}] ${note.content.substring(0, 50)}...`);
  });
  
  console.log('\n');
  const choice = await prompt('Enter note number to delete (or "back"): ');
  
  if (choice.toLowerCase() === 'back' || !choice.trim()) {
    return;
  }
  
  const index = parseInt(choice) - 1;
  
  if (index >= 0 && index < notes.length) {
    const confirm = await prompt(`Delete "${notes[index].content.substring(0, 30)}..."? (yes/no): `);
    
    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      notes.splice(index, 1);
      await saveNotes(notes);
      console.log('\n✅ Note deleted!\n');
    } else {
      console.log('\n❌ Cancelled.\n');
    }
  } else {
    console.log('\n❌ Invalid note number!\n');
  }
  
  await prompt('Press Enter to continue...');
}

// ============================================================================
// MAIN LOOP
// ============================================================================

async function main() {
  console.log('\n🚀 i am Aria ur Advanced Reasoning & Intelligent Assistant...\n');
  
  // Check if Ollama is running
  console.log('Checking Ollama...');
  const testResponse = await askAI('Say "ready"');
  
  if (testResponse.includes('Error')) {
    console.log('\n  Warning: Ollama might not be running!');
    console.log('   Start it with: ollama serve\n');
    await prompt('Press Enter to continue anyway...');
  } else {
    console.log(' llm is ready');
    
    // Check if embedding model is available
    console.log(' Checking RAG embedding model...');
    const testEmbed = await generateEmbedding('test');
    if (testEmbed) {
      console.log(' ✅ RAG embeddings ready!\n');
    } else {
      console.log(' ⚠️  Embedding model not found. Download with:');
      console.log('   ollama pull nomic-embed-text\n');
      console.log(' 💡 You can still use ARIA, but semantic search will be disabled.\n');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Main menu loop
  while (true) {
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await addNote();
        break;
      case '2':
        await viewNotes();
        break;
      case '3':
        await searchNotes();
        break;
      case '4':
        await getSummary();
        break;
      case '5':
        await chatWithAI();
        break;
      case '6':
        await deleteNote();
        break;
      case '7':
        await viewSkills();
        break;
      case '8':
        await addSkillXP();
        break;
      case '9':
        await manageMilestones();
        break;
      case '10':
        await semanticSearch();
        break;
      case '0':
        clearScreen();
        console.log('\n Thanks for using ARIA!');
        console.log(' Keep learning and taking notes!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n Invalid option! Please choose 0-10.\n');
        await prompt('Press Enter to continue...');
    }
  }
}

// ============================================================================
// RUN THE APP
// ============================================================================

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});