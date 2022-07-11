const User = require('../models/user');

const ERROR_CODE_400 = 400;
const ERROR_CODE_404 = 404;
const ERROR_CODE_500 = 500;

// GET /users — возвращает всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// GET /users/:userId - возвращает пользователя по _id
module.exports.getUserById = (req, res) => {
  User.findById(req.params.id, { runValidators: true }).populate('name').populate('about').populate('avatar')
    .then((user) => {
      if (user === null) { return res.status(ERROR_CODE_404).send({ message: 'Пользователь по указанному id не найден' }); }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при поиске' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: err.message });
    });
};

// POST /users — создаёт пользователя
module.exports.createUser = (req, res) => {
  User.create({ name: req.body.name, about: req.body.about, avatar: req.body.avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при создании пользователя' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: err.message });
    });
};

// PATCH /users/me — обновляет профиль
module.exports.updateUser = (req, res) => {
  User.findOneAndUpdate(req.user._id, { name: req.body.name, about: req.body.about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при обновлении профиля' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_404).send({ message: 'Пользователь по указанному id не найден' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: err.message });
    });
};

// PATCH /users/me/avatar — обновляет аватар
module.exports.updateAvatar = (req, res) => {
  User.findOneAndUpdate(req.user._id, { avatar: req.body.avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: 'Переданы некорректные данные при обновлении аватара' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(ERROR_CODE_404).send({ message: 'Пользователь по указанному id не найден' });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: err.message });
    });
};
