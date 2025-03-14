const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let tasks = [];

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const task = {
    ...req.body,
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.json(task);
});

app.put('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json(tasks[taskIndex]);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});
