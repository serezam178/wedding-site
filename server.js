const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
    // API route for RSVP
    if (req.url === '/api/rsvp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body || '{}');
                const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
                const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

                if (BOT_TOKEN && CHAT_ID) {
                    const daysText = Array.isArray(data.days) ? data.days.join(', ') : (data.days || 'Не указано');
                    const text = `🎊 *Новая заявка на свадьбу!*\n\n👤 *Имя:* ${data.name || 'Не указано'}\n📅 *Дни:* ${daysText}\n🥂 *Напитки:* ${data.drinks || 'Не указано'}`;
                    
                    try {
                        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: 'Markdown' })
                        });
                        const tgData = await tgRes.json();
                        if (!tgData.ok) console.error('Telegram API error:', tgData);
                    } catch (e) {
                        console.error('Failed to send to Telegram:', e.message);
                    }
                } else {
                    console.log('📩 [Локальный тест заявки]:', data);
                }

                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Static files
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }
        const ext = path.extname(filePath);
        let contentType = 'text/html; charset=utf-8';
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.js') contentType = 'text/javascript';
        if (ext === '.json') contentType = 'application/json';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Wedding Vercel Project running locally at http://localhost:${PORT}/`);
});
