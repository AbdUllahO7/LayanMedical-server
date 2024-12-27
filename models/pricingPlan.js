const mongoose = require('mongoose');

const pricingPlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    frequency: {
        type: String,
        required: true,
    },
    features: {
        type: [String], // Ensure this is defined as an array of strings
        required: true,
    },
});

const pricingPlan = mongoose.model('PricingPlan', pricingPlanSchema);
module.exports = pricingPlan;
