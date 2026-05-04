/**
 * Interfaz base para pasarelas de pago.
 * Todos los adapters deben extender esta clase e implementar los 3 métodos.
 */
class PaymentGateway {
  /**
   * Inicia el proceso de pago para una orden.
   * @param {Object} order - Documento de Order de Mongoose (populado)
   * @returns {Promise<Object>}
   *   - Redirect: { redirect_url: string, preference_id?: string }
   *   - COD/inline: { success: true, order_id: string }
   */
  async initializePayment(order) {
    throw new Error('initializePayment() no implementado');
  }

  /**
   * Verifica el estado actual de un pago.
   * @param {Object} order - Documento de Order con payment_transaction_id
   * @returns {Promise<{ status: 'approved'|'pending'|'rejected'|'failed' }>}
   */
  async verifyPayment(order) {
    throw new Error('verifyPayment() no implementado');
  }

  /**
   * Procesa un webhook/callback entrante de la pasarela.
   * @param {Object} payload - Body del webhook
   * @param {Object} headers - Headers HTTP del webhook
   * @returns {Promise<{ orderId: string, transactionId: string, status: string, gatewayResponse: Object }|null>}
   *   Retorna null si el payload no es relevante (ej: evento de tipo distinto a 'payment').
   */
  async handleWebhook(payload, headers) {
    throw new Error('handleWebhook() no implementado');
  }
}

module.exports = PaymentGateway;
