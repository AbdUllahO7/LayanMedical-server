const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/user/MessageControllers');

// Create a new message
router.post('/create', messageController.createMessage);

// Get messages for a specific business
router.get('/business/:businessId', messageController.getBusinessMessages);

// Get all messages for a specific user (sender or receiver)
router.get('/user/:userId', messageController.getUserMessages);

// Update a message (subject or rating)
router.put('/update/:messageId', messageController.updateMessage);

// Delete a message
router.delete('/delete/:messageId', messageController.deleteMessage);
router.delete('/deleteAll/:userId', messageController.deleteAllMessagesByUserId);
router.get('/user/:userId/unreadCount', messageController.getUnreadMessagesCount);

module.exports = router;
