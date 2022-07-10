const router = require('express').Router();
const { getCards, createCard, deleteCardById, likeCard, dislikeCard } = require('../controllers/Cards');

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCardById);
router.put('/:cardId/likes', likeCard);
router.delete('/:cardId/likes', dislikeCard);

module.exports = router;
