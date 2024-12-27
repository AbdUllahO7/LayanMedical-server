// routes/pricingPlanRoutes.js
const express = require("express");
const {
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan
} = require("../../controllers/Admin/PricingPlanController");

const router = express.Router();

router.get("/plans", getAllPlans);
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

module.exports = router;
