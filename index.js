const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());

// In-memory storage for demonstration purposes
let dbCache = { items: [] };

const readDB = async () => {
  const data = await fs.readFile(DB_FILE, 'utf-8');
  dbCache = JSON.parse(data); // Update in-memory cache
  return dbCache;
};

const writeDB = async () => {
  await fs.writeFile(DB_FILE, JSON.stringify(dbCache, null, 2));
};

// GET all items
app.get('/items', async (req, res) => {
  try {
    await readDB(); // Update in-memory cache
    res.json(dbCache.items);
  } catch (err) {
    console.error('Error in GET /items:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// GET item by ID
app.get('/items/:id', async (req, res) => {
  try {
    await readDB(); // Update in-memory cache
    const item = dbCache.items.find((i) => i.id === parseInt(req.params.id));
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    console.error('Error in GET /items/:id:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// POST create a new item
app.post('/items', async (req, res) => {
  try {
    await readDB(); // Update in-memory cache
    const newItem = { id: Date.now(), ...req.body };
    dbCache.items.push(newItem); // Temporarily store in-memory
    await writeDB(); // Write to file
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error in POST /items:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// PUT update an item
app.put('/items/:id', async (req, res) => {
  try {
    await readDB(); // Update in-memory cache
    const index = dbCache.items.findIndex((i) => i.id === parseInt(req.params.id));
    if (index !== -1) {
      dbCache.items[index] = { ...dbCache.items[index], ...req.body };
      await writeDB(); // Write to file
      res.json(dbCache.items[index]);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    console.error('Error in PUT /items/:id:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

// DELETE an item
app.delete('/items/:id', async (req, res) => {
  try {
    await readDB(); // Update in-memory cache
    const index = dbCache.items.findIndex((i) => i.id === parseInt(req.params.id));
    if (index !== -1) {
      const deletedItem = dbCache.items.splice(index, 1);
      await writeDB(); // Write to file
      res.json(deletedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    console.error('Error in DELETE /items/:id:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
