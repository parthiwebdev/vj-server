const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json'); // Use __dirname to resolve the path

app.use(express.json());

const readDB = async () => {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
};

const writeDB = async (data) => {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
};

// GET all items
app.get('/', (req, res) => {
  res.json({ "name": "Parthiban" });
});

// GET all items
app.get('/items', async (req, res) => {
  try {
    const db = await readDB();
    res.json(db.items);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET item by ID
app.get('/items/:id', async (req, res) => {
  try {
    const db = await readDB();
    const item = db.items.find((i) => i.id === parseInt(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST create a new item
app.post('/items', async (req, res) => {
  try {
    const db = await readDB();
    const newItem = { id: Date.now(), ...req.body };
    db.items.push(newItem);
    await writeDB(db);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PUT update an item
app.put('/items/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.items.findIndex((i) => i.id === parseInt(req.params.id));
    if (index !== -1) {
      db.items[index] = { ...db.items[index], ...req.body };
      await writeDB(db);
      res.json(db.items[index]);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE an item
app.delete('/items/:id', async (req, res) => {
  try {
    const db = await readDB();
    const index = db.items.findIndex((i) => i.id === parseInt(req.params.id));
    if (index !== -1) {
      const deletedItem = db.items.splice(index, 1);
      await writeDB(db);
      res.json(deletedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
