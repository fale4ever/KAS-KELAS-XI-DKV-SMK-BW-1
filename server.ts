import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(process.cwd(), 'kas_data.json');

// GET /api/kas-data - Fetch current live state
app.get('/api/kas-data', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        parsed.adminPin = 'dkv20262027';
        return res.json({ success: true, data: parsed });
      }
    }
  } catch (err) {
    console.error('Failed to read kas_data.json', err);
  }
  return res.json({ success: true, data: null });
});

// POST /api/kas-data - Save updated state from treasurer/admin
app.post('/api/kas-data', (req, res) => {
  try {
    const newState = req.body;
    if (newState && typeof newState === 'object' && newState.students) {
      newState.adminPin = 'dkv20262027';
      fs.writeFileSync(DATA_FILE, JSON.stringify(newState, null, 2), 'utf-8');
      return res.json({ success: true });
    }
  } catch (err) {
    console.error('Failed to write kas_data.json', err);
    return res.status(500).json({ success: false, error: 'Database write error' });
  }
  return res.status(400).json({ success: false, error: 'Invalid state object' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
