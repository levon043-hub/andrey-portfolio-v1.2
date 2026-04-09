/**
 * contact-form.js — sends form data directly to Telegram Bot API
 */

'use strict';

function initContactForm() {
  const form   = document.getElementById('contactForm');
  const status = document.getElementById('contactFormStatus');
  const btn    = document.getElementById('contactFormBtn');

  if (!form) return;

  // Telegram Bot API
  const BOT_TOKEN = '8251451598:AAGcvrBxyu-SILmVZLvCtpPpysXmzvZ2YdE';
  const CHAT_ID   = '7090987621';
  const API_URL   = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  // Service name mapping
  const serviceNames = {
    landing:   'Лендинг под ключ',
    multipage: 'Многостраничный сайт',
    redesign:  'Редизайн сайта',
    coding:    'Вёрстка по макету',
    consult:   'Консультация по дизайну',
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.elements.name.value.trim();
    const contact = form.elements.contact.value.trim();
    const service = form.elements.service.value;
    const message = form.elements.message.value.trim();

    // Basic validation
    if (!name || !contact || !service) {
      showStatus('Заполните обязательные поля', 'error');
      return;
    }

    // Disable button
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Отправка...';

    // Format Telegram message
    const text = [
      '📩 *Новая заявка с сайта*',
      '',
      `👤 *Имя:* ${escapeMarkdown(name)}`,
      `📱 *Контакт:* ${escapeMarkdown(contact)}`,
      `🔧 *Услуга:* ${serviceNames[service] || service}`,
      message ? `\n💬 *Описание:*\n${escapeMarkdown(message)}` : '',
      '',
      `🕐 _${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}_`,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    CHAT_ID,
          text:       text,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) {
        showStatus('Заявка отправлена! Я отвечу в ближайшее время.', 'success');
        form.reset();
      } else {
        throw new Error('Telegram API error');
      }
    } catch (err) {
      showStatus('Ошибка отправки. Напишите мне напрямую в Telegram.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Отправить заявку
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    }
  });

  function escapeMarkdown(text) {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
  }

  function showStatus(msg, type) {
    status.textContent = msg;
    status.className = 'contact-form__status contact-form__status--' + type;
    setTimeout(() => {
      status.textContent = '';
      status.className = 'contact-form__status';
    }, 5000);
  }
}

if (document.readyState !== 'loading') {
  initContactForm();
} else {
  document.addEventListener('DOMContentLoaded', initContactForm);
}
