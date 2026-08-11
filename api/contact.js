const MAX = { name: 80, contact: 120, service: 80, message: 1600 };
const attempts = new Map();

const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;

export default async function handler(request, response) {
  if (process.env.FORM_ENABLED !== 'true') return response.status(404).json({ error: 'Not found' });
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const allowedOrigin = process.env.FORM_ORIGIN;
  if (!allowedOrigin || request.headers.origin !== allowedOrigin) return response.status(403).json({ error: 'Forbidden' });
  const ip = String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || '').split(',')[0].trim();
  const now = Date.now();
  const lastAttempt = attempts.get(ip) || 0;
  if (now - lastAttempt < 60_000) return response.status(429).json({ error: 'Попробуйте ещё раз через минуту' });
  const { name, contact, service, message, website, startedAt } = request.body || {};
  if (website || !Number.isFinite(startedAt) || Date.now() - startedAt < 2500) return response.status(400).json({ error: 'Unable to send request' });
  if (!text(name, MAX.name) || !text(contact, MAX.contact) || !text(service, MAX.service) || !text(message, MAX.message)) return response.status(400).json({ error: 'Проверьте поля формы' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return response.status(503).json({ error: 'Форма временно недоступна. Напишите в Telegram.' });
  attempts.set(ip, now);
  const safe = (value) => value.trim().replace(/[<>]/g, '');
  const body = ['Новая заявка с сайта', `Имя: ${safe(name)}`, `Контакт: ${safe(contact)}`, `Услуга: ${safe(service)}`, `Задача: ${safe(message)}`].join('\n');
  try {
    const telegram = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: body, disable_web_page_preview: true }) });
    if (!telegram.ok) throw new Error('Telegram API request failed');
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ error: 'Не удалось отправить заявку. Напишите в Telegram.' });
  }
}
