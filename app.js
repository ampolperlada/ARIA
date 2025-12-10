// app.js
// Interactive terminal app for your ARIA

// ============================================================================
// IMPORTS
// ============================================================================

import readline from 'readline';
import fs from 'fs/promises';
import fetch from 'node-fetch';

// ============================================================================
// CONFIGURATION
// ============================================================================

const NOTES_FILE = 'my-notes.json';
const SKILLS_FILE = 'my-skills.json';
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

// Default skills
const DEFAULT_SKILLS = {
  python: { name: '🐍 Python', level: 0, maxLevel: 100, category: 'programming' },
  math: { name: '📐 Math/Statistics', level: 0, maxLevel: 100, category: 'foundation' },
  llm: { name: '🤖 LLM', level: 0, maxLevel: 100, category: 'ai' },
  rag: { name: '📚 RAG', level: 0, maxLevel: 100, category: 'ai' },
  n8n: { name: '⚙️ n8n/Workflows', level: 0, maxLevel: 100, category: 'ai' },
  javascript: { name: '💻 JavaScript/Node.js', level: 0, maxLevel: 100, category: 'programming' },
  vectordb: { name: '🗄️ Vector Databases', level: 0, maxLevel: 100, category: 'ai' },
  api: { name: '🔌 APIs', level: 0, maxLevel: 100, category: 'programming' }
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
    return JSON.parse(data);
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
// OPTION A: SMART AI SKILL DETECTION
// ============================================================================

// Detect skills from note content using AI
async function detectSkillsWithAI(content) {
  console.log('🤖 ARIA is analyzing your note to detect skills...\n');
  
  const prompt = `You are a skill detection assistant. Read this learning note and identify which skills the person practiced or learned about.

Learning Note: "${content}"

Available Skills:
- python: Python programming, pandas, numpy, data analysis, scripting
- math: Mathematics, statistics, linear algebra, probability, calculus
- llm: Large Language Models, GPT, Ollama, prompts, AI models
- rag: Retrieval Augmented Generation, embeddings, vector search, document Q&A
- n8n: Workflow automation, n8n tool, zapier, integrations
- javascript: JavaScript, Node.js, async/await, ES6+, npm
- vectordb: Vector databases, Pinecone, Chroma, Weaviate, similarity search
- api: REST APIs, endpoints, fetch, HTTP requests, webhooks

Instructions:
1. Analyze what the person learned or practiced
2. Return ONLY the skill IDs (separated by commas) that match
3. If multiple skills apply, list all of them
4. If no skills clearly match, return "none"
5. Do NOT include explanations, just the skill IDs

Example responses:
- "python,api" (if they learned Python and APIs)
- "llm,rag" (if they learned about LLMs and RAG)
- "none" (if no clear skills match)

Your response:`;

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
  
  // Menu lines
  const menuLines = [
    '╔════════════════════════════════════════════╗',
    '║    ARIA - AI Learning Companion            ║',
    '║   Your Offline AI Assistant                ║',
    '╠════════════════════════════════════════════╣',
    '║                                            ║',
    `║   📊 Stats: ${notes.length} notes | Today: ${todayNotes.length}                      ║`,
    `║   🎯 Overall Progress: ${overallProgress}%                    ║`,
    '║                                            ║',
    '║   What would you like to do?               ║',
    '║                                            ║',
    '║   [1]  Add a note                          ║',
    '║   [2]  View all notes                      ║',
    '║   [3]  Search notes with AI                ║',
    '║   [4]  Get AI summary                      ║',
    '║   [5]  Chat with AI directly               ║',
    '║   [6]  Delete a note                       ║',
    '║   [7]  View skill progress                 ║',
    '║   [8]  Add skill XP manually               ║',
    '║   [0]  Exit                                ║',
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
  const choice = await prompt('Choose an option (0-8): ');
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
    console.log(' llm is ready\n');
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
      case '0':
        clearScreen();
        console.log('\n Thanks for using ARIA!');
        console.log(' Keep learning and taking notes!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n Invalid option! Please choose 0-8.\n');
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