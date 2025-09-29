require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// مسیر تستی
app.get('/', (req, res) => {
  res.send('سرور فروشگاه تجهیزات پزشکی آماده است! ✅');
});

// شروع سرور
app.listen(PORT, () => {
  console.log( سرور روی پورت ${PORT} در حال اجراست...);
});