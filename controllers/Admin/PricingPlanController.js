// controllers/pricingPlanController.js

const pricingPlan = require("../../models/pricingPlan");

exports.getAllPlans = async (req, res) => {
    try {
        const plans = await pricingPlan.find();
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPlan = async (req, res) => {
    const { title, price, frequency, features } = req.body;

    // Ensure features is an array, splitting it if it's a string
    const featuresArray = Array.isArray(features) 
        ? features 
        : typeof features === 'string' 
            ? features.split(',').map(feature => feature.trim()) // Split string into an array
            : [];

    console.log(title, price, frequency, featuresArray); // Log the processed features array

    const newPlan = new pricingPlan({ title, price, frequency, features: featuresArray });

    try {
        const savedPlan = await newPlan.save();
        res.status(201).json({ success: true, data: savedPlan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};



exports.updatePlan = async (req, res) => {
    try {
        const updatedPlan = await pricingPlan.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        res.status(200).json({ success: true, data: updatedPlan });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        await pricingPlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
