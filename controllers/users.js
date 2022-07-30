const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');

const BadRequestError = require('../errors/bad-req-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');

// GET /users — возвращает всех пользователей
module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

// GET /users/:userId - возвращает пользователя по _id
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id, { runValidators: true }).populate('name').populate('about').populate('avatar')
    .then((user) => {
      if (user === null) { throw new NotFoundError('Пользователь по указанному id не найден'); }
      return res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Переданы некорректные данные при поиске');
      }
      next(err);
    });
};

// POST /users — создаёт пользователя
module.exports.createUser = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user !== null) {
        throw new ConflictError('Пользователь с данным email уже существует');
      }
      bcrypt.hash(req.body.password, 10)
        .then((hash) => User.create({
          name: req.body.name,
          about: req.body.about,
          avatar: req.body.avatar,
          email: req.body.email,
          password: hash,
        }))
        .then((userData) => res.send({ data: userData }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new BadRequestError('Переданы некорректные данные при создании пользователя');
          }
          next(err);
        });
    })
    .catch(next);
};

// PATCH /users/me — обновляет профиль
module.exports.updateUser = (req, res, next) => {
  User.findOneAndUpdate(req.user._id, { name: req.body.name, about: req.body.about }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении профиля');
      }
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      next(err);
    });
};

// GET /users/me - возвращает информацию о текущем пользователе
module.exports.getUser = (req, res, next) => {
  User.findOne({})
    .then((user) => res.send({ data: user }))
    .catch(next);
};

// PATCH /users/me/avatar — обновляет аватар
module.exports.updateAvatar = (req, res, next) => {
  User.findOneAndUpdate(req.user._id, { avatar: req.body.avatar }, {
    new: true,
    runValidators: true,
  })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы некорректные данные при обновлении аватара');
      }
      if (err.name === 'CastError') {
        throw new NotFoundError('Пользователь по указанному id не найден');
      }
      next(err);
    });
};

// Логин пользователя
module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });

      res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Ошибка аутентификации');
    });
};
