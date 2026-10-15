const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot tokeningizni shu yerga yozasiz
const TOKEN = 'BOT_TOKENINGIZNI_SHU_YERGA_QO'YING';
const bot = new TelegramBot(TOKEN, { polling: true });

// 1. Veb-sayt (WebApp) fayllarini ulash
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Telegram bot menyu tugmalari (/start bosganda)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, "Xush kelibsiz! Quyidagi menyulardan birini tanlang:", {
        reply_markup: {
            keyboard: [
                [{ text: "🎮 O'ynash", web_app: { url: "https://super-win-game.onrender.com" } }],
                [{ text: "👥 Do'stlarni taklif qilish" }, { text: "📊 Statistika" }],
                [{ text: "ℹ️ Bot haqida" }]
            ],
            resize_keyboard: true
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
