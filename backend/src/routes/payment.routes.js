const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');

// Ruta para iniciar el proceso de donación
router.post('/create-checkout-session', paymentController.createDonationSession);

module.exports = router;