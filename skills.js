// skills.js
// Track your learning progress across different skills!

// ============================================================================
// IMPORTS
// ============================================================================

import fs from 'fs/promises';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SKILLS_FILE = 'my-skills.json';

// Default skills to track
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Load skills from file
async function loadSkills() {
  try {
    const data = await fs.readFile(SKILLS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create default skills
    await saveSkills(DEFAULT_SKILLS);
    return DEFAULT_SKILLS;
  }
}

// Save skills to file
async function saveSkills(skills) {
  await fs.writeFile(SKILLS_FILE, JSON.stringify(skills, null, 2));
}

// Create a progress bar
function createProgressBar(current, max, width = 20) {
  const percentage = (current / max) * 100;
  const filled = Math.floor((current / max) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${Math.floor(percentage)}%`;
}

// Get skill level name
function getLevelName(level) {
  if (level === 0) return '🌱 Beginner';
  if (level < 25) return '📖 Learning';
  if (level < 50) return '💪 Intermediate';
  if (level < 75) return '🎯 Advanced';
  if (level < 100) return '⭐ Expert';
  return '🏆 Master';
}

// ============================================================================
// MAIN COMMANDS
// ============================================================================

// VIEW all skills
async function viewSkills() {
  const skills = await loadSkills();
  
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       📊 YOUR SKILL PROGRESS DASHBOARD        ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  // Calculate overall progress
  const totalLevel = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);
  const totalMax = Object.values(skills).length * 100;
  const overallProgress = Math.floor((totalLevel / totalMax) * 100);
  
  console.log(`🎯 Overall Progress: ${createProgressBar(totalLevel, totalMax, 30)}\n`);
  
  // Group by category
  const categories = {
    ai: '🤖 AI & Machine Learning',
    programming: '💻 Programming',
    foundation: '📚 Foundations'
  };
  
  for (const [catKey, catName] of Object.entries(categories)) {
    console.log(`\n${catName}:`);
    console.log('─'.repeat(50));
    
    for (const [key, skill] of Object.entries(skills)) {
      if (skill.category === catKey) {
        const levelName = getLevelName(skill.level);
        console.log(`${skill.name.padEnd(25)} ${createProgressBar(skill.level, skill.maxLevel)} ${levelName}`);
      }
    }
  }
  
  console.log('\n');
}

// ADD XP to a skill
async function addXP(skillKey, amount) {
  const skills = await loadSkills();
  
  if (!skills[skillKey]) {
    console.log(`\n❌ Skill "${skillKey}" not found!\n`);
    console.log('Available skills:', Object.keys(skills).join(', '));
    return;
  }
  
  const skill = skills[skillKey];
  const oldLevel = skill.level;
  skill.level = Math.min(skill.level + amount, skill.maxLevel);
  
  await saveSkills(skills);
  
  console.log(`\n✅ ${skill.name} increased!`);
  console.log(`   ${oldLevel} → ${skill.level} (+${amount} XP)`);
  console.log(`   ${createProgressBar(skill.level, skill.maxLevel)}`);
  console.log(`   ${getLevelName(skill.level)}\n`);
}

// SET skill level directly
async function setLevel(skillKey, level) {
  const skills = await loadSkills();
  
  if (!skills[skillKey]) {
    console.log(`\n❌ Skill "${skillKey}" not found!\n`);
    return;
  }
  
  const skill = skills[skillKey];
  skill.level = Math.min(Math.max(level, 0), skill.maxLevel);
  
  await saveSkills(skills);
  
  console.log(`\n✅ ${skill.name} set to ${skill.level}%`);
  console.log(`   ${createProgressBar(skill.level, skill.maxLevel)}`);
  console.log(`   ${getLevelName(skill.level)}\n`);
}

// SUGGEST what to learn next
async function suggestNext() {
  const skills = await loadSkills();
  
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       🎯 WHAT YOU SHOULD LEARN NEXT           ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  // Find lowest skill
  const sortedSkills = Object.entries(skills).sort((a, b) => a[1].level - b[1].level);
  
  console.log('📉 Skills that need attention:\n');
  
  sortedSkills.slice(0, 3).forEach(([key, skill], index) => {
    console.log(`${index + 1}. ${skill.name} - ${skill.level}%`);
    console.log(`   ${createProgressBar(skill.level, skill.maxLevel)}`);
    
    // Suggestions based on skill
    const suggestions = {
      python: 'Practice LeetCode, build small scripts, learn pandas',
      math: 'Study linear algebra, statistics, probability',
      llm: 'Read papers, experiment with prompts, build chatbots',
      rag: 'Learn embeddings, vector databases, build Q&A system',
      n8n: 'Create workflows, automate daily tasks',
      javascript: 'Build Node.js apps, learn async/await',
      vectordb: 'Try Pinecone, Chroma, or Weaviate',
      api: 'Build REST APIs, learn authentication'
    };
    
    if (suggestions[key]) {
      console.log(`   💡 Try: ${suggestions[key]}\n`);
    }
  });
  
  console.log('');
}

// RESET all skills
async function resetSkills() {
  await saveSkills(DEFAULT_SKILLS);
  console.log('\n✅ All skills reset to 0!\n');
}

// ============================================================================
// COMMAND LINE INTERFACE
// ============================================================================

const args = process.argv.slice(2);
const command = args[0];

console.log('\n🎯 AI Learning Companion - Skill Tracker\n');

switch (command) {
  case 'view':
  case 'show':
    await viewSkills();
    break;
    
  case 'add':
    if (args.length < 3) {
      console.log('Usage: node skills.js add <skill> <amount>');
      console.log('Example: node skills.js add python 10\n');
    } else {
      await addXP(args[1], parseInt(args[2]));
    }
    break;
    
  case 'set':
    if (args.length < 3) {
      console.log('Usage: node skills.js set <skill> <level>');
      console.log('Example: node skills.js set python 50\n');
    } else {
      await setLevel(args[1], parseInt(args[2]));
    }
    break;
    
  case 'suggest':
  case 'next':
    await suggestNext();
    break;
    
  case 'reset':
    await resetSkills();
    break;
    
  default:
    console.log('📖 Available commands:\n');
    console.log('  node skills.js view          - Show all your skills');
    console.log('  node skills.js add <skill> <xp>  - Add XP to a skill');
    console.log('  node skills.js set <skill> <level>  - Set skill level (0-100)');
    console.log('  node skills.js suggest       - Get learning suggestions');
    console.log('  node skills.js reset         - Reset all skills to 0\n');
    console.log('Available skills:');
    console.log('  python, math, llm, rag, n8n, javascript, vectordb, api\n');
    console.log('Examples:');
    console.log('  node skills.js add python 10');
    console.log('  node skills.js set llm 60\n');
}