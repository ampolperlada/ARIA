// app.js
// Interactive terminal app for your AI Learning Companion

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
const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

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
  const today = new Date().toDateString();
  const todayNotes = notes.filter(n => 
    new Date(n.date).toDateString() === today
  );
  
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🤖 AI LEARNING COMPANION                 ║');
  console.log('║   Your Offline AI Assistant                ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log('║                                            ║');
  console.log(`║   📊 Stats: ${notes.length} notes | Today: ${todayNotes.length}`.padEnd(45) + '║');
  console.log('║                                            ║');
  console.log('║   What would you like to do?               ║');
  console.log('║                                            ║');
  console.log('║   [1] 📝 Add a note                        ║');
  console.log('║   [2] 📚 View all notes                    ║');
  console.log('║   [3] 🔍 Search notes with AI              ║');
  console.log('║   [4] 📊 Get AI summary                    ║');
  console.log('║   [5] 💬 Chat with AI directly             ║');
  console.log('║   [6] 🗑️  Delete a note                    ║');
  console.log('║   [0] 👋 Exit                              ║');
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  const choice = await prompt('Choose an option (0-6): ');
  return choice.trim();
}

// ============================================================================
// FEATURE FUNCTIONS
// ============================================================================

// [1] Add a note
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
  
  console.log('\n🤖 AI is thinking...\n');
  
  const allNotes = notes.map(n => `- ${n.content}`).join('\n');
  
  const prompt_text = `Here are my learning notes:
${allNotes}

Question: ${question}

Please answer based ONLY on the notes above. If the answer isn't in the notes, say so.`;

  const answer = await askAI(prompt_text);
  
  console.log('💡 AI Answer:\n');
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
  
  console.log('🤖 AI is generating summary...\n');
  
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
  drawBox('💬 CHAT WITH AI');
  console.log('\n');
  console.log('Type your questions. Type "back" to return to menu.\n');
  
  while (true) {
    const question = await prompt('You: ');
    
    if (question.toLowerCase() === 'back' || !question.trim()) {
      break;
    }
    
    console.log('\n🤖 AI is thinking...\n');
    
    const answer = await askAI(question);
    
    console.log('AI:', answer);
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
  console.log('\n🚀 Starting AI Learning Companion...\n');
  
  // Check if Ollama is running
  console.log('🔍 Checking Ollama...');
  const testResponse = await askAI('Say "ready"');
  
  if (testResponse.includes('Error')) {
    console.log('\n⚠️  Warning: Ollama might not be running!');
    console.log('   Start it with: ollama serve\n');
    await prompt('Press Enter to continue anyway...');
  } else {
    console.log('✅ Ollama is ready!\n');
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
      case '0':
        clearScreen();
        console.log('\n👋 Thanks for using AI Learning Companion!');
        console.log('💡 Keep learning and taking notes!\n');
        rl.close();
        process.exit(0);
      default:
        console.log('\n❌ Invalid option! Please choose 0-6.\n');
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