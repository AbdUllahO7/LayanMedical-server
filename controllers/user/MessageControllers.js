const Message = require("../../models/Message");
const User = require("../../models/User");


// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { userSender, userReceiver, business, subject, message  , replayed} = req.body;
        const newMessage = new Message({
            userSender,
            userReceiver,
            business,
            subject,
            message,
            replayed
        });

        await newMessage.save();
        res.status(201).json({ success : true ,  message: 'Message sent successfully!', data: newMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success : false , message: 'Server error. Could not create the message.' });
    }
};

// Get messages for a specific business
exports.getBusinessMessages = async (req, res) => {
    try {
        const { businessId } = req.params;

        const messages = await Message.find({ business: businessId })
            .populate('userSender', 'username')  // Populate sender's username
            .populate('userReceiver', 'username')  // Populate receiver's username
            .populate('business', 'name');  // Populate business name

        // Return empty array with success if no messages are found
        res.status(200).json({
            success: true,
            message: messages.length ? 'Messages fetched successfully' : 'No messages found for this business.',
            data: messages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Could not fetch the messages.' });
    }
};


exports.getUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { sort, search, page = 1, limit = 10 } = req.query; // Get sort, search, page, and limit from query params

        // Find the user by userId to get user info
        const user = await User.findById(userId).select('userName email'); // Add other fields as needed

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Construct the search query for the message title or content (if provided)
        const searchQuery = search ? {
            $or: [
                { subject: { $regex: search, $options: 'i' } }, // Case-insensitive search in title
                { message: { $regex: search, $options: 'i' } }, // Case-insensitive search in content
            ]
        } : {};

        // Construct the sorting options based on the sort parameter
        let sortOption = {};
        switch (sort) {
            case "title-atoz":
                sortOption = { title: 1 }; // Sort by title A to Z
                break;
            case "title-ztoa":
                sortOption = { title: -1 }; // Sort by title Z to A
                break;
            case "time-newest":
                sortOption = { createdAt: -1 }; // Sort by newest first (desc)
                break;
            case "time-oldest":
                sortOption = { createdAt: 1 }; // Sort by oldest first (asc)
                break;
            default:
                sortOption = {}; // Default to no sorting (or you can set a default sort)
        }

        // Find messages with the applied search and sorting
        const messages = await Message.find({
            $or: [{ userSender: userId }, { userReceiver: userId }],
            ...searchQuery, // Include the search filter
        })
            .populate('userSender', 'userName')
            .populate('userReceiver', 'userName')
            .populate('business', 'title')
            .sort(sortOption)
            .skip((page - 1) * limit) // Pagination logic
            .limit(limit); // Limit the number of results based on the limit

        // Get the total count of messages for pagination
        const totalCount = await Message.countDocuments({
            $or: [{ userSender: userId }, { userReceiver: userId }],
            ...searchQuery,
        });

        // Return the response
        res.status(200).json({
            success: true,
            message: messages.length ? 'User messages fetched successfully' : 'No messages found for this user.',
            data: {
                userInfo: user, // Include user info in the response
                messages: messages, // Include messages with business info
                totalCount: totalCount, // Include total count for pagination
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Could not fetch user messages.' });
    }
};

// Get unread messages count for a specific user
exports.getUnreadMessagesCount = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the count of unread messages for the user
        const unreadCount = await Message.countDocuments({
            $or: [
                { userSender: userId },  // If user is the sender
                { userReceiver: userId }  // If user is the receiver
            ],
            replayed: false // Only count messages that have not been marked as "replayed" (or "read")
        });

        // Return the count
        res.status(200).json({
            success: true,
            message: `Unread messages count for user ${userId}`,
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Could not fetch unread message count.' });
    }
};




// Update a message (update subject or rating)
exports.updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { replayed } = req.body;

        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { replayed: replayed },
            { new: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        res.status(200).json({ success: true, message: 'Message updated successfully', data: updatedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Could not update the message.' });
    }
};


// Delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({success : false , message: 'Message not found.' });
        }

        res.status(200).json({success : true , message: 'Message deleted successfully', data: deletedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({success : false , message: 'Server error. Could not delete the message.' });
    }
};

// Delete all messages for a specific user (either as sender or receiver)
exports.deleteAllMessagesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type } = req.query; // Accept "type" query parameter: "sent" or "incoming"
        let filter = {};
        if (type === "SentMessages") {
            filter = { userSender: userId };
        } else if (type === "IncomingMessages") {
            filter = { userReceiver: userId };
        } else {
            return res.status(400).json({ success: false, message: 'Invalid type. Please specify "sent" or "incoming".' });
        }

        // Delete messages based on the filter
        const deletedMessages = await Message.deleteMany(filter);

        if (deletedMessages.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'No messages found for the specified criteria.' });
        }

        res.status(200).json({
            success: true,
            message: `All ${type} messages for the user deleted successfully`,
        
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error. Could not delete user messages.' });
    }
};

