const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// In-memory storage with a limit
const MAX_LIBRARIES = 100;
let scheduleLibraries = {};

function generateUniqueId() {
  return uuidv4();
}

let userSchedule = [
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "🧘", activity: "Meditating"},
  {emoji: "🍵", activity: "Having tea"},
  {emoji: "🎨", activity: "Creating art"},
  {emoji: "👔", activity: "Working"},
  {emoji: "🎮", activity: "Playing games"},
  {emoji: "🎶", activity: "Listening to music"},
  {emoji: "🍲", activity: "Eating lunch"},
  {emoji: "📷", activity: "Taking photos"},
  {emoji: "👔", activity: "Working"},
  {emoji: "💻", activity: "Coding"},
  {emoji: "📝", activity: "Writing"},
  {emoji: "🥗", activity: "Having dinner"},
  {emoji: "🚶", activity: "Walking"},
  {emoji: "💪", activity: "Exercising"},
  {emoji: "🤗", activity: "Socializing"},
  {emoji: "📖", activity: "Reading"},
  {emoji: "😴", activity: "Sleeping"},
  {emoji: "😴", activity: "Sleeping"}
];

app.get('/api/schedule', (req, res) => {
  res.json({ schedule: userSchedule });
});

app.post('/update-schedule', (req, res) => {
  const { schedule } = req.body;
  if (Array.isArray(schedule) && schedule.length === 24) {
    userSchedule = schedule.map(item => ({
      emoji: item.emoji || "⏺",
      activity: item.activity || "Unknown"
    }));
    res.json({ success: true, schedule: userSchedule });
  } else {
    res.status(400).json({ success: false, message: "Invalid schedule format" });
  }
});

// Save or update a schedule-library
app.post('/api/schedule-library', (req, res) => {
  const { id, name, schedule, emojiLibrary } = req.body;
  
  if (Object.keys(scheduleLibraries).length >= MAX_LIBRARIES && !id) {
    return res.status(403).json({ error: 'Maximum number of libraries reached. Cannot create new library.' });
  }

  const libraryId = id || generateUniqueId();
  scheduleLibraries[libraryId] = { id: libraryId, name: name || 'Untitled Library', schedule, emojiLibrary };
  res.json({ id: libraryId, name: scheduleLibraries[libraryId].name, message: 'Schedule-library saved successfully' });
});

// Get a specific schedule-library
app.get('/api/schedule-library/:id', (req, res) => {
  const { id } = req.params;
  if (scheduleLibraries[id]) {
    res.json(scheduleLibraries[id]);
  } else {
    res.status(404).json({ error: 'Schedule-library not found' });
  }
});

// Search public libraries
app.put('/api/schedule-library/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (scheduleLibraries[id]) {
    scheduleLibraries[id].name = name;
    res.json({ message: 'Library name updated successfully', name });
  } else {
    res.status(404).json({ error: 'Schedule-library not found' });
  }
});

app.get('/api/public-libraries', (req, res) => {
  const { search } = req.query;
  const publicLibraries = Object.values(scheduleLibraries)
    .filter(library => library.name.toLowerCase().includes((search || '').toLowerCase()))
    .map(({ id, name }) => ({ id, name }));
  res.json(publicLibraries);
});

// Merge emoji libraries
app.post('/api/merge-emoji-library', (req, res) => {
  const { sourceId, targetId } = req.body;
  if (scheduleLibraries[sourceId] && scheduleLibraries[targetId]) {
    const sourceEmojis = scheduleLibraries[sourceId].emojiLibrary;
    const targetEmojis = scheduleLibraries[targetId].emojiLibrary;
    const mergedEmojis = [...new Set([...targetEmojis, ...sourceEmojis])];
    scheduleLibraries[targetId].emojiLibrary = mergedEmojis;
    res.json({ message: 'Emoji libraries merged successfully', emojiLibrary: mergedEmojis });
  } else {
    res.status(404).json({ error: 'One or both libraries not found' });
  }
});

app.delete('/api/schedule-library/:id', (req, res) => {
  const { id } = req.params;
  if (scheduleLibraries[id]) {
    delete scheduleLibraries[id];
    res.json({ message: 'Schedule-library deleted successfully' });
  } else {
    res.status(404).json({ error: 'Schedule-library not found' });
  }
});

app.use('*', (req, res) => {
  console.log('Received request to undefined route:', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'An unexpected error occurred', details: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
