const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return response(405, { message: 'Faqat POST so‘rovi qabul qilinadi' }, { Allow: 'POST' });
  }

  if (!event.body || event.body.length > 16_000) {
    return response(400, { message: 'Buyurtma ma’lumoti noto‘g‘ri' });
  }

  let order;
  try {
    order = validateOrder(JSON.parse(event.body));
  } catch (error) {
    return response(400, { message: error instanceof Error ? error.message : 'Buyurtma ma’lumoti noto‘g‘ri' });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    console.error('Telegram order integration is missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return response(503, { message: 'Buyurtma xizmati hali sozlanmagan. Iltimos, telefon orqali bog‘laning.' });
  }

  const orderedAt = new Date();
  const pendingOrderNumber = 'aniqlanmoqda';
  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      text: createTelegramMessage(order, pendingOrderNumber, orderedAt)
    })
  });

  const telegramResult = await telegramResponse.json().catch(() => null);
  const messageId = telegramResult?.result?.message_id;

  if (!telegramResponse.ok || telegramResult?.ok !== true || !Number.isInteger(messageId)) {
    console.error(`Telegram sendMessage failed (${telegramResponse.status}): ${JSON.stringify(telegramResult).slice(0, 500)}`);
    return response(502, { message: 'Buyurtmani yuborib bo‘lmadi. Iltimos, qayta urinib ko‘ring.' });
  }

  const orderNumber = createOrderNumber(messageId);
  const editResponse = await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      text: createTelegramMessage(order, orderNumber, orderedAt)
    })
  });

  if (!editResponse.ok) {
    const editError = await editResponse.text().catch(() => 'Unknown Telegram error');
    console.error(`Telegram editMessageText failed (${editResponse.status}): ${editError.slice(0, 500)}`);
  }

  return response(200, {
    ok: true,
    orderNumber,
    orderedAt: orderedAt.toISOString()
  });
};

function validateOrder(input) {
  const fullName = cleanText(input.fullName, 80);
  const phone = cleanText(input.phone, 20);
  const productName = cleanText(input.productName, 160);
  const productCategory = cleanText(input.productCategory, 80);
  const productId = cleanText(input.productId, 80);
  const quantity = Number(input.quantity);
  const unitPrice = Number(input.unitPrice);
  const totalPrice = Number(input.totalPrice);

  if (fullName.split(/\s+/).length < 2) throw new Error('Ism va familiyani to‘liq kiriting');
  if (!/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(phone)) throw new Error('Telefon raqamini to‘liq kiriting');
  if (!productId || !productName || !productCategory) throw new Error('Mahsulot ma’lumoti yetarli emas');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Mahsulot soni noto‘g‘ri');
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('Mahsulot narxi noto‘g‘ri');
  if (!Number.isFinite(totalPrice) || totalPrice !== unitPrice * quantity) throw new Error('Buyurtma summasi noto‘g‘ri');

  return { fullName, phone, productName, productCategory, productId, quantity, unitPrice, totalPrice };
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

function createOrderNumber(messageId) {
  return `RT-${String(messageId).padStart(6, '0')}`;
}

function createTelegramMessage(order, orderNumber, orderedAt) {
  const dateText = new Intl.DateTimeFormat('uz-UZ', {
    timeZone: 'Asia/Tashkent',
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(orderedAt);

  return [
    '<b>YANGI BUYURTMA</b>',
    '',
    `<b>Buyurtma raqami:</b> ${escapeHtml(orderNumber)}`,
    `<b>Buyurtma vaqti:</b> ${escapeHtml(dateText)}`,
    '',
    '<b>MIJOZ MA’LUMOTLARI</b>',
    `<b>Ism-familiya:</b> ${escapeHtml(order.fullName)}`,
    `<b>Telefon:</b> ${escapeHtml(order.phone)}`,
    '',
    '<b>MAHSULOT</b>',
    `<b>Turi:</b> ${escapeHtml(order.productCategory)}`,
    `<b>Nomi:</b> ${escapeHtml(order.productName)}`,
    `<b>Soni:</b> ${order.quantity} dona`,
    `<b>Bir dona narxi:</b> ${formatPrice(order.unitPrice)}`,
    `<b>Jami:</b> ${formatPrice(order.totalPrice)}`,
    `<b>Mahsulot ID:</b> <code>${escapeHtml(order.productId)}</code>`
  ].join('\n');
}

function formatPrice(value) {
  return `${new Intl.NumberFormat('uz-UZ').format(value)} so‘m`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...jsonHeaders, ...extraHeaders },
    body: JSON.stringify(body)
  };
}

exports.validateOrder = validateOrder;
exports.createOrderNumber = createOrderNumber;
exports.createTelegramMessage = createTelegramMessage;
