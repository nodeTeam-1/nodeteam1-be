const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require('./routes/index');
const app = express();

// cors, dotenv, bodyParser 설정
app.use(cors());
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // req.body 객체 인식

// 라우터 연결
app.use('/api', indexRouter);

// MongoDB 연결
const mongoURI = process.env.MONGODB_URI_PROD;
mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.send('nodeteam1: SNS Project');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
