const Card = require('../models/card');

const ERROR_CODE_400 = 400;
const ERROR_CODE_404 = 404;
const ERROR_CODE_500 = 500;


// GET /cards — возвращает все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(err => res.status(500).send({ message: err.message }));
};

// POST /cards — создаёт карточку
module.exports.createCard = (req, res) => {
  Card.create({ name: req.body.name, link: req.body.link, owner: req.user._id }, {runValidators: true})
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'ValidationError') {
          res.status(ERROR_CODE_400).send({ message: "Переданы некорректные данные при создании карточки" });
          return;
        }
      res.status(ERROR_CODE_500).send({ message: err.message })
    });
};


// DELETE /cards/:cardId — удаляет карточку по идентификатору
module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'CastError') {
          res.status(ERROR_CODE_404).send({ message: "Карточка с указанным id не найдена" });
          return;
        }
      res.status(ERROR_CODE_500).send({ message: err.message })
    });
};


// PUT /cards/:cardId/likes — поставить лайк карточке
module.exports.likeCard = (req, res) => {Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
      { new: true, runValidators: true },
    )
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: "Переданы некорректные данные для постановки лайка" });
        return;
      }
      if (err.name === 'CastError') {
          res.status(ERROR_CODE_404).send({ message: "Передан несуществующий id карточки" });
          return;
        }
      res.status(ERROR_CODE_500).send({ message: err.message })
    });
};


// DELETE /cards/:cardId/likes — убрать лайк с карточки
module.exports.dislikeCard = (req, res) => {Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true, runValidators: true  },
    )
    .then(card => res.send({ data: card }))
    .catch(err => {
      if (err.name === 'CastError') {
          res.status(ERROR_CODE_404).send({ message: "Передан несуществующий id карточки" });
          return;
      }
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE_400).send({ message: "Переданы некорректные данные для снятия лайка" });
        return;
      }
      res.status(ERROR_CODE_500).send({ message: err.message })
    });
};
