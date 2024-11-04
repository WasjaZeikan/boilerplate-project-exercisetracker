const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

const DB_URL = 'mongodb+srv://<db_user>:<db_password>@cluster0.ckoah.mongodb.net/<db_name>?retryWrites=true&w=majority&appName=Cluster0'
  .replace('<db_user>', process.env.DB_USER)
  .replace('<db_password>', process.env.DB_PASSWORD)
  .replace('<db_name>', process.env.DB_NAME);
mongoose.connect(DB_URL);

app.use(express.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const ExerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
}, { versionKey: false });
const Exercise = mongoose.model('Exercise', ExerciseSchema);

const UserSchema = new mongoose.Schema({ username: String }, { versionKey: false });
const User = mongoose.model('User', UserSchema);

app.post('/api/users', (req, res) => {
  User.create({ username: req.body.username })
    .then(data => res.json(data));
});

app.get('/api/users', (req, res) => {
  User.find().then((data) => res.json(data));
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = await User.findById(req.params._id);
  Exercise.create({
    description: req.body.description,
    username: user.username,
    duration: req.body.duration,
    date: req.body.date ? req.body.date : new Date().toDateString()
  })
    .then(data => res.json(data));
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const limit = req.query.limit;
  const from = req.query.from;
  const to = req.query.to;
  const user = await User.findById(req.params._id);
  const query = Exercise.find({ username: user.username }).select('-_id -username');
  if (limit) query.limit(limit);
  if (from) query.gte('date', new Date(from).toDateString());
  if (to) query.lte('date', new Date(to).toDateString());
  const exercises = await query;
  res.json({
    _id: user._id,
    count: exercises.length,
    username: user.username,
    log: exercises
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
