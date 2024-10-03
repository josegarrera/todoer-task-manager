import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import winston from 'winston';
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

const mongoUri = process.env.MONGO_URI;

mongoose
  .connect(mongoUri)
  .then(() => winston.info('Connected to MongoDB'))
  .catch((err) => winston.info('Failed to connect to MongoDB', err));

const todoSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
});

const Todo = mongoose.model('Todo', todoSchema);

app.post('/todos', async (req, res) => {
  const { title } = req.body;
  const newTodo = new Todo({ title, completed: false });
  await newTodo.save();
  res.status(201).json(newTodo);
});

app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todo = await Todo.findByIdAndUpdate(id, { title, completed }, { new: true });

  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.patch('/todos/:id/complete', async (req, res) => {
  const { id } = req.params;
  const todo = await Todo.findByIdAndUpdate(id, { completed: true }, { new: true });

  if (todo) {
    res.json(todo);
  } else {
    res.status(404).json({ message: 'Todo not found' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

app.listen(port, () => {
  logger.info(`TODO service running at http://localhost:${port}`);
});
