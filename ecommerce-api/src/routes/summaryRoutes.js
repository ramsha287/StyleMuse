// routes/summaryRoutes.js
const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');
const {admin} = require('../middlewares/authMiddleware');
const { verifyToken } = require('../utils/generateToken');


// Define the route for fetching the summary
router.get('/',verifyToken,admin, summaryController.getSummary);

module.exports = router;
