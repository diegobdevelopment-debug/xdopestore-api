const PaymentGateway = require('../PaymentGateway');

/**
 * Adapter para Mercado Pago — Checkout Pro (flujo de redirect).
 *
 * Variables de entorno requeridas:
 *   MP_ACCESS_TOKEN  — Access Token de producción o sandbox
 *   BASE_URL         — URL pública del backend (para notification_url)
 *   STORE_URL        — URL pública del frontend (para back_urls)
 *
 * Para instalar el SDK: npm install mercadopago
 */
class MercadoPagoAdapter extends PaymentGateway {
  _getClient() {
    const { MercadoPagoConfig } = require('mercadopago');
    return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  }

  async initializePayment(order) {
    const { Preference } = require('mercadopago');
    const client = this._getClient();
    const preference = new Preference(client);

    const body = {
      items: order.products.map(p => ({
        id: String(p.product_id),
        title: p.name,
        quantity: Number(p.quantity),
        unit_price: Number(p.price),
        currency_id: 'COP',
      })),
      external_reference: String(order._id),
      back_urls: {
        success: `${process.env.STORE_URL}/order/success?id=${order._id}`,
        failure: `${process.env.STORE_URL}/order/failure?id=${order._id}`,
        pending: `${process.env.STORE_URL}/order/pending?id=${order._id}`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BASE_URL}/payment/webhook`,
    };

    const result = await preference.create({ body });
    // En producción usar result.init_point; en sandbox usar result.sandbox_init_point
    const redirect_url = process.env.MP_SANDBOX === 'true'
      ? result.sandbox_init_point
      : result.init_point;

    return { redirect_url, preference_id: result.id };
  }

  async verifyPayment(order) {
    if (!order.payment_transaction_id) return { status: 'pending' };
    const { Payment } = require('mercadopago');
    const payment = new Payment(this._getClient());
    const result = await payment.get({ id: order.payment_transaction_id });
    return { status: result.status }; // approved | pending | rejected
  }

  async handleWebhook(payload, headers) {
    // Mercado Pago envía: { type: 'payment', data: { id: '...' } }
    if (payload.type !== 'payment' || !payload.data?.id) return null;

    const { Payment } = require('mercadopago');
    const payment = new Payment(this._getClient());
    const result = await payment.get({ id: payload.data.id });

    return {
      orderId: result.external_reference,
      transactionId: String(result.id),
      status: result.status,       // approved | pending | rejected
      gatewayResponse: result,
    };
  }
}

module.exports = MercadoPagoAdapter;
