const express = require('express');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET);

router.post('/create-checkout-session', async (req, res) => {
    try {
        const { plan, userId } = req.body;
        const lineItems = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.title,
                    },
                    unit_amount: plan.price * 100, // Convert price to cents
                },
                quantity: 1,
            },
        ];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `http://localhost:5000/api/stripe/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'http://localhost:5173/PaymentCancel',
            metadata: {
                userId: userId, // Add userId to metadata
                planId: plan._id, // Add planId to metadata
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});


router.get('/payment-success', async (req, res) => {
    try {
        const { session_id } = req.query;

        // Fetch the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        // Extract metadata
        const { userId, planId } = session.metadata;


        // Perform the update
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { PlanType: planId }, // Directly set the PlanType field to planId
            { new: true } // Return the updated document
        );

        // Check if the update was successful
        if (!updatedUser) {
            console.error('User not found or update failed.');
            return res.status(404).json({ error: 'User not found or update failed' });
        }


        // Redirect to the success page
        res.redirect('http://localhost:5173/PaymentSuccess');
    } catch (error) {
        console.error('Error processing payment success:', error.message);
        res.status(500).json({ error: 'Failed to process payment success' });
    }
});







module.exports = router;



