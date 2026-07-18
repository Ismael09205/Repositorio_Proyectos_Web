const stripe = require('../config/stripe');

class PaymentService {
  async createCheckoutSession(amount, currency = 'usd') {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: 'Donación a IdeAgora',
                description: 'Apoyo al repositorio académico de proyectos',
              },
              unit_amount: amount, // Ya debe venir en centavos desde el controlador
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        // Cambia estas URLs por las de tu frontend en producción si es necesario
        success_url: 'http://localhost:3000/?status=success',
        cancel_url: 'http://localhost:3000/?status=cancel',
      });

      return session;
    } catch (error) {
      throw new Error('Error al crear la sesión en Stripe: ' + error.message);
    }
  }
}

module.exports = new PaymentService();