const PaymentGateway = require('../PaymentGateway');

/**
 * Adapter para Cash on Delivery (contra entrega).
 * No requiere ninguna integración externa — la orden queda pendiente hasta la entrega.
 */
class CodAdapter extends PaymentGateway {
  async initializePayment(order) {
    return { success: true, order_id: String(order._id) };
  }

  async verifyPayment(order) {
    // COD se confirma manualmente cuando el repartidor entrega
    return { status: 'pending' };
  }

  async handleWebhook(payload, headers) {
    return null; // COD no tiene webhooks
  }
}

module.exports = CodAdapter;
