const CodAdapter = require('./adapters/CodAdapter');
const MercadoPagoAdapter = require('./adapters/MercadoPagoAdapter');

/**
 * Para agregar una nueva pasarela:
 * 1. Crea src/services/payment/adapters/NuevaAdapter.js extendiendo PaymentGateway
 * 2. Importa aquí y agrega a ADAPTERS
 */
const ADAPTERS = {
  cod:          CodAdapter,
  mercadopago:  MercadoPagoAdapter,
};

/**
 * Retorna la instancia del adapter correspondiente al método de pago.
 * @param {string} paymentMethod - ej: 'cod', 'mercadopago'
 * @returns {PaymentGateway}
 */
function getGateway(paymentMethod) {
  const Adapter = ADAPTERS[paymentMethod] || ADAPTERS['cod'];
  return new Adapter();
}

module.exports = { getGateway };
