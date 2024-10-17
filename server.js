const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  }
};

connectDB();

// Event Schema
const eventSchema = new mongoose.Schema({
  userId: String,
  eventType: String,
  timestamp: { type: Date, default: Date.now },
  properties: Object
});

const Event = mongoose.model('Event', eventSchema);

// API Routes
app.post('/api/track', async (req, res) => {
  try {
    const { userId, eventType, properties } = req.body;
    const event = new Event({ userId, eventType, properties });
    await event.save();
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ message: 'Error tracking event' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort('-timestamp').limit(100);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

app.get('/api/aggregate', async (req, res) => {
  try {
    const aggregation = await Event.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(aggregation);
  } catch (error) {
    console.error('Error aggregating events:', error);
    res.status(500).json({ message: 'Error aggregating events' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});