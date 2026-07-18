const Stripe = require('stripe');
require('dotenv').config();

// Inicializamos Stripe directamente aquí para saltarnos problemas de config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createDonationSession = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'El monto debe ser mayor a 0.' });
    }

    // Convertimos a centavos de forma segura
    const amountInFloat = parseFloat(amount);
    if (isNaN(amountInFloat)) {
      return res.status(400).json({ message: 'El monto no es un número válido.' });
    }
    const amountInCents = Math.round(amountInFloat * 100);

    // Creamos la sesión de Stripe directamente aquí
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donación a IdeAgora',
              description: 'Apoyo al repositorio académico de proyectos',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/?status=success',
      cancel_url: 'http://localhost:5173/?status=cancel',
    });

    // Respondemos la URL
    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error("Error en Stripe:", error);
    return res.status(500).json({ message: 'Hubo un error en el servidor al procesar el pago.', error: error.message });
  }
};

module.exports = {
  createDonationSession,
};