const express = require('express');
const router = express.Router();
const { getMessagesByRoom, createMessage } = require('../controllers/messageController');

router.get('/:room', getMessagesByRoom);
router.post('/', createMessage);

module.exports = router;
