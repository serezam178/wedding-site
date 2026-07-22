export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, days, drinks } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  // Секретные ключи берутся из Environment Variables в Vercel
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    // Если переменные в Vercel еще не заданы, возвращаем мок-ответ,
    // чтобы анимации на сайте работали.
    return res.status(200).json({ message: 'Mock success (Env vars not set)' });
  }

  const message = `🔔 *Новая заявка на свадьбу!*\n\n*Гость:* ${name}\n*Дни:* ${days && days.length ? days.join(', ') : 'Никакие'}\n*Напитки:* ${drinks || 'Не указано'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(500).json({ message: 'Telegram API Error', details: errorData });
    }

    return res.status(200).json({ message: 'Success' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
