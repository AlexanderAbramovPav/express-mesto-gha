const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
}, (err) => {
  if (err) throw err;
});

// подключаем мидлвары, роуты и всё остальное

app.use((req, res, next) => {
  req.user = {
    _id: '62cb1afe8a1263095cef79bd',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('/*', (req, res) => {
  res.status(404).send({ message: 'Запрос сделан к несуществующей странице' });
});

app.listen(3000);
