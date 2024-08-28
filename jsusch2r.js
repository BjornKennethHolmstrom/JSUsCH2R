const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
