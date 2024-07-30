const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = './db.json';

app.use(bodyParser.json());

const readDB = () => {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// GET all items
app.get('/items', (req, res) => {
  const db = readDB();
  res.json(db.items);
});

// GET item by ID
app.get('/items/:id', (req, res) => {
  const db = readDB();
  const item = db.items.find((i) => i.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// POST create a new item
app.post('/items', (req, res) => {
  const db = readDB();
  const newItem = { id: Date.now(), ...req.body };
  db.items.push(newItem);
  writeDB(db);
  res.status(201).json(newItem);
});

// PUT update an item
app.put('/items/:id', (req, res) => {
  const db = readDB();
  const index = db.items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index !== -1) {
    db.items[index] = { ...db.items[index], ...req.body };
    writeDB(db);
    res.json(db.items[index]);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

// DELETE an item
app.delete('/items/:id', (req, res) => {
  const db = readDB();
  const index = db.items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index !== -1) {
    const deletedItem = db.items.splice(index, 1);
    writeDB(db);
    res.json(deletedItem);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
