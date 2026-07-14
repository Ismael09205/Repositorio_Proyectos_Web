const Stripe = require('stripe');
require('dotenv').config();

// Inicializamos Stripe con la llave secreta de pruebas
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;