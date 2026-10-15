const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Foydalanuvchilar ma'lumotlar bazasi
let users = {};
let withdrawalRequests = [];

// 1. Foydalanuvchi ma'lumotlarini olish / yaratish
app.post('/api/user', (req, res) => {
    const { userId, username, refBy } = req.body;
    if (!users[userId]) {
        users[userId] = {
            id: userId,
            username: username || 'O\'yinchi',
            balance: 1000,
            streak: 0,
            lastBonus: null,
            referrals: []
        };
        // Referal bonus berish
        if (refBy && users[refBy] && refBy !== userId) {
            users[refBy].balance += 2500;
            users[refBy].referrals.push(userId);
            users[userId].balance += 2500;
        }
    }
    res.json(users[userId]);
});

// 2. Tap (Ekranga bosib tanga yig'ish)
app.post('/api/tap', (req, res) => {
    const { userId, count } = req.body;
    if (users[userId]) {
        users[userId].balance += (count || 1);
        return res.json({ success: true, balance: users[userId].balance });
    }
    res.status(400).json({ error: 'Foydalanuvchi topilmadi' });
});

// 3. Kunlik Bonus olish
app.post('/api/daily-bonus', (req, res) => {
    const { userId } = req.body;
    const user = users[userId];
    if (!user) return res.status(400).json({ error: 'Foydalanuvchi topilmadi' });

    const now = new Date();
    const last = user.lastBonus ? new Date(user.lastBonus) : null;

    if (last && (now - last) < 24 * 60 * 60 * 1000) {
        return res.json({ success: false, message: 'Bonus bugun olingan!' });
    }

    user.streak = (user.streak % 7) + 1;
    const bonusAmount = user.streak * 200;
    user.balance += bonusAmount;
    user.lastBonus = now;

    res.json({ success: true, bonus: bonusAmount, balance: user.balance, streak: user.streak });
});

// 4. Reyting (Leaderboard)
app.get('/api/leaderboard', (req, res) => {
    const topUsers = Object.values(users)
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
    res.json(topUsers);
});

// 5. Pul Yechib Olish so'rovi
app.post('/api/withdraw', (req, res) => {
    const { userId, amount, card } = req.body;
    const user = users[userId];
    if (!user || user.balance < amount) {
        return res.status(400).json({ success: false, message: 'Mablag\' yetarli emas!' });
    }

    user.balance -= amount;
    withdrawalRequests.push({ userId, username: user.username, amount, card, date: new Date() });
    res.json({ success: true, message: 'Pul yechish so\'rovi adminga yuborildi!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
