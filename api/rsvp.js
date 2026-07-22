// api/rsvp.js — Vercel Serverless Function
// Получает данные из формы и отправляет сообщение в Telegram бот

export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Переменные из Vercel Environment (добавь в Settings → Environment Variables)
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Токен от @BotFather
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;   // ID чата или твой личный ID

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Bot not configured' });
  }

  // Достаём данные из тела запроса
  const { name, days, drinks } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  // Форматируем сообщение для Telegram
  const daysText = Array.isArray(days) && days.length > 0
    ? days.join(', ')
    : 'Не указано';

  const message = [
    '🎊 *Новая заявка на свадьбу!*',
    '',
    `👤 *Имя:* ${escapeMarkdown(name)}`,
    `📅 *Дни:* ${escapeMarkdown(daysText)}`,
    `🥂 *Напитки:* ${escapeMarkdown(drinks || 'Не указано')}`,
    '',
    '— _Сайт Даниила и Аси_',
  ].join('\n');

  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    CHAT_ID,
        text:       message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return res.status(500).json({ error: 'Telegram error', details: data });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Network error:', err);
    return res.status(500).json({ error: 'Network error' });
  }
}

// Экранируем спецсимволы Markdown для Telegram
function escapeMarkdown(text) {
  return String(text).replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
