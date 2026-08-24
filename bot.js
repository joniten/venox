require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/order', (req, res) => {
    try {
        console.log("ПОЛУЧЕН ЗАКАЗ:", req.body);
        const order = {
            ...req.body,
            paymentStatus: 'Не оплачено'
        };

        saveOrder(order);

        res.json({
            success: true
        });

    } catch (error) {
        console.error('Помилка збереження замовлення:', error);

        res.status(500).json({
            success: false
        });
    }


app.listen(process.env.PORT || 3000, () => {
    console.log("Сервер замовлень запущено на порту 3000");
});
const ORDERS_FILE = path.join(__dirname, 'orders.json');
function saveOrder(order) {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));

  orders.push({
    id: Date.now(),
    ...order,
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(
    ORDERS_FILE,
    JSON.stringify(orders, null, 2),
    'utf8'
  );
}


const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const ADMIN_ID = 966297755;

const isAdmin = (ctx) => ctx.from?.id === ADMIN_ID;
bot.command('admin', (ctx) => {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Доступ заборонено.');
  }

  ctx.reply('👑 Ви адміністратор VENOX Shop.');
});

const menu = Markup.keyboard([
  ['🛍️ Каталог'],
  ['📦 Мої замовлення', '🔎 Пошук товару'],
  ['📞 Підтримка']
]).resize();

bot.start((ctx) => {
  ctx.reply(
    'Вітаємо у VENOX Shop! 🛍️\n\nОберіть потрібний розділ:',
    menu
  );
});

bot.command('myid', (ctx) => {
  ctx.reply(`Твій Telegram ID: ${ctx.from.id}`);
});

bot.command('orders', (ctx) => {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Доступ заборонено.');
  }

  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));

  if (orders.length === 0) {
    return ctx.reply('📦 Замовлень поки немає.');
  }

  let message = '📦 ТВОЇ ЗАМОВЛЕННЯ:\n\n';

orders.forEach((order, index) => {
  message +=
    '#' + (index + 1) + '\n' +
    '👤 Клієнт: ' + order.customer + '\n' +
    '📦 Товар: ' + order.product + '\n' +
    '📞 Телефон: ' + order.phone + '\n' +
    ' Місто: ' + order.city + '\n' +
'📍 Населений пункт: ' + order.settlement + '\n' +
'🏢 Відділення: ' + order.department + '\n' +
    '💳 Оплата: ' + order.payment + '\n' +
    '💰 Статус: ' + order.paymentStatus + '\n' +
    '🕐 Дата: ' + order.createdAt + '\n\n';
});

ctx.reply(message);
}

bot.launch();

console.log('VENOX Shop бот запущено!');
