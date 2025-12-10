// notes.js
// Save and search your learning notes with AI!

// ============================================================================
// IMPORTS
// ============================================================================

import fs from 'fs/promises';
import fetch from 'node-fetch';

// ============================================================================
// CONFIGURATION
// ============================================================================

const NOTES_FILE = 'my-notes.json';      // Where notes are saved
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Load existing notes from file
async function loadNotes() {
  try {
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    return [];
  }
}

// Save notes to file
async function saveNotes(notes) {
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// Ask Ollama a question
async function askAI(prompt) {
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
}

// ============================================================================
// MAIN COMMANDS
// ============================================================================

// ADD a new note
async function addNote(content) {
  const notes = await loadNotes();
  
  const newNote = {
    id: Date.now(),                           // Unique ID
    content: content,                         // What you learned
    date: new Date().toISOString(),          // When you wrote it
    tags: []                                  // For later: auto-tag with AI
  };
  
  notes.push(newNote);
  await saveNotes(notes);
  
  console.log('✅ Note saved!');
  console.log(`📝 "${content}"`);
  console.log(`📅 ${new Date().toLocaleString()}\n`);
}

// LIST all notes
async function listNotes() {
  const notes = await loadNotes();
  
  if (notes.length === 0) {
    console.log('📭 No notes yet! Add one with: node notes.js add "your note"');
    return;
  }
  
  console.log(`📚 You have ${notes.length} notes:\n`);
  
  notes.forEach((note, index) => {
    const date = new Date(note.date).toLocaleDateString();
    console.log(`${index + 1}. [${date}] ${note.content}`);
  });
  
  console.log('');
}

// SEARCH notes using AI
async function searchNotes(query) {
  const notes = await loadNotes();
  
  if (notes.length === 0) {
    console.log('📭 No notes to search!');
    return;
  }
  
  console.log('🔍 Searching your notes with AI...\n');
  
  // Combine all notes into one text
  const allNotes = notes.map(n => `- ${n.content}`).join('\n');
  
  // Ask AI to search/summarize based on query
  const prompt = `Here are my learning notes:
${allNotes}

Question: ${query}

Please answer based ONLY on the notes above. If the answer isn't in the notes, say so.`;

  const answer = await askAI(prompt);
  
  console.log('💡 AI Answer:\n');
  console.log(answer);
  console.log('');
}

// SUMMARIZE all your notes
async function summarizeNotes() {
  const notes = await loadNotes();
  
  if (notes.length === 0) {
    console.log('📭 No notes to summarize!');
    return;
  }
  
  console.log('🧠 Summarizing your learning journey...\n');
  
  const allNotes = notes.map(n => `- ${n.content}`).join('\n');
  
  const prompt = `Here are my learning notes:
${allNotes}

Please give me a brief summary of what I've been learning. Group by topics if possible.`;

  const summary = await askAI(prompt);
  
  console.log('📊 Summary:\n');
  console.log(summary);
  console.log('');
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];
const content = args.slice(1).join(' ');

console.log('\n🤖 AI Learning Companion - Notes System\n');

// Route to correct function based on command
switch (command) {
  case 'add':
    if (!content) {
      console.log('❌ Please provide note content!');
      console.log('Usage: node notes.js add "what you learned"\n');
    } else {
      await addNote(content);
    }
    break;
    
  case 'list':
    await listNotes();
    break;
    
  case 'search':
    if (!content) {
      console.log('❌ Please provide a search query!');
      console.log('Usage: node notes.js search "your question"\n');
    } else {
      await searchNotes(content);
    }
    break;
    
  case 'summary':
    await summarizeNotes();
    break;
    
  default:
    // Show help
    console.log('📖 Available commands:\n');
    console.log('  node notes.js add "note"       - Add a new learning note');
    console.log('  node notes.js list             - Show all your notes');
    console.log('  node notes.js search "query"   - Ask AI about your notes');
    console.log('  node notes.js summary          - Get AI summary of all notes\n');
    console.log('Examples:');
    console.log('  node notes.js add "Learned about RAG and vector databases"');
    console.log('  node notes.js search "What did I learn about RAG?"\n');
}