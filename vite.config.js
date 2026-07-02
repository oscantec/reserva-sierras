import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_FILE = path.join(__dirname, 'saved-config.json')

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
    server: {
      port: 3000,
      open: true
    }
  };

  if (command === 'serve') {
    config.plugins.push({
      name: 'dev-api-middleware',
      configureServer(server) {
        // Google Sheets fetch endpoint (development only)
        server.middlewares.use('/api/backend-sheets', async (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', async () => {
              try {
                const { sheetId, sheetName, email, privateKey } = JSON.parse(body);
                if (!sheetId || !email || !privateKey) {
                  throw new Error('Missing required credentials');
                }
                const { fetchSheetData } = await import('./lib/sheets-utils.js');
                const data = await fetchSheetData(sheetId, sheetName, email, privateKey);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data }));
              } catch (error) {
                console.error('Middleware Error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else {
            next();
          }
        });

        // Google Sheets append endpoint (development only)
        server.middlewares.use('/api/backend-sheets-append', async (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', async () => {
              try {
                const { sheetId, sheetName, email, privateKey, rowData } = JSON.parse(body);
                if (!sheetId || !email || !privateKey || !rowData) {
                  throw new Error('Missing required data');
                }
                const { appendSheetData } = await import('./lib/sheets-utils.js');
                const result = await appendSheetData(sheetId, sheetName, email, privateKey, rowData);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, data: result }));
              } catch (error) {
                console.error('Append Error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else {
            next();
          }
        });

        // Config endpoint - SAVES TO FILE for persistence in development
        server.middlewares.use('/api/config', async (req, res, next) => {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(CONFIG_FILE)) {
                const data = fs.readFileSync(CONFIG_FILE, 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                console.log('✅ Config loaded from saved-config.json');
              } else {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({}));
              }
            } catch (error) {
              console.error('Error reading config:', error);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({}));
            }
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', () => {
              try {
                const config = JSON.parse(body);
                fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
                console.log('✅ Config saved to saved-config.json');
              } catch (error) {
                console.error('Error saving config:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else {
            next();
          }
        });

        // iCal proxy endpoint (development only) - replaces dead api.allorigins.win
        server.middlewares.use('/api/ical-proxy', async (req, res, next) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString() });
            req.on('end', async () => {
              try {
                const { url } = JSON.parse(body);
                if (!url) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'URL is required' }));
                  return;
                }
                console.log('📅 Fetching iCal:', url.substring(0, 60) + '...');
                const response = await fetch(url, {
                  headers: {
                    'User-Agent': 'ReservaDeLasSierras/1.0 iCal-Sync',
                    'Accept': 'text/calendar, text/plain, */*',
                  },
                  redirect: 'follow',
                });
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }
                const icsData = await response.text();
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end(icsData);
                console.log('✅ iCal data fetched successfully');
              } catch (error) {
                console.error('❌ iCal proxy error:', error.message);
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          } else if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 200;
            res.end();
          } else {
            next();
          }
        });
      }
    });
  }

  return config;
});
