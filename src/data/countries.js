// Country and state catalog used by the storefront address forms.
// Kept inline (no DB lookup) so the UI can populate selects without an extra round trip.

const COUNTRIES = [
  {
    id: 1, name: 'Colombia', sortname: 'CO', phone_code: '57',
    state: [
      { id: 101, name: 'Antioquia' },
      { id: 102, name: 'Atlántico' },
      { id: 103, name: 'Bogotá D.C.' },
      { id: 104, name: 'Bolívar' },
      { id: 105, name: 'Boyacá' },
      { id: 106, name: 'Caldas' },
      { id: 107, name: 'Caquetá' },
      { id: 108, name: 'Cauca' },
      { id: 109, name: 'Cesar' },
      { id: 110, name: 'Córdoba' },
      { id: 111, name: 'Cundinamarca' },
      { id: 112, name: 'Chocó' },
      { id: 113, name: 'Huila' },
      { id: 114, name: 'La Guajira' },
      { id: 115, name: 'Magdalena' },
      { id: 116, name: 'Meta' },
      { id: 117, name: 'Nariño' },
      { id: 118, name: 'Norte de Santander' },
      { id: 119, name: 'Quindío' },
      { id: 120, name: 'Risaralda' },
      { id: 121, name: 'Santander' },
      { id: 122, name: 'Sucre' },
      { id: 123, name: 'Tolima' },
      { id: 124, name: 'Valle del Cauca' },
      { id: 125, name: 'Arauca' },
      { id: 126, name: 'Casanare' },
      { id: 127, name: 'Putumayo' },
      { id: 128, name: 'San Andrés y Providencia' },
      { id: 129, name: 'Amazonas' },
      { id: 130, name: 'Guainía' },
      { id: 131, name: 'Guaviare' },
      { id: 132, name: 'Vaupés' },
      { id: 133, name: 'Vichada' },
    ],
  },
  {
    id: 2, name: 'United States', sortname: 'US', phone_code: '1',
    state: [
      { id: 201, name: 'California' }, { id: 202, name: 'New York' },
      { id: 203, name: 'Texas' }, { id: 204, name: 'Florida' },
      { id: 205, name: 'Illinois' }, { id: 206, name: 'Pennsylvania' },
      { id: 207, name: 'Ohio' }, { id: 208, name: 'Georgia' },
      { id: 209, name: 'Michigan' }, { id: 210, name: 'Washington' },
    ],
  },
  {
    id: 3, name: 'Mexico', sortname: 'MX', phone_code: '52',
    state: [
      { id: 301, name: 'Ciudad de México' }, { id: 302, name: 'Jalisco' },
      { id: 303, name: 'Nuevo León' }, { id: 304, name: 'Estado de México' },
      { id: 305, name: 'Puebla' }, { id: 306, name: 'Guanajuato' },
    ],
  },
  {
    id: 4, name: 'Argentina', sortname: 'AR', phone_code: '54',
    state: [
      { id: 401, name: 'Buenos Aires' }, { id: 402, name: 'Córdoba' },
      { id: 403, name: 'Santa Fe' }, { id: 404, name: 'Mendoza' },
    ],
  },
  {
    id: 5, name: 'Chile', sortname: 'CL', phone_code: '56',
    state: [
      { id: 501, name: 'Región Metropolitana' }, { id: 502, name: 'Valparaíso' },
      { id: 503, name: 'Biobío' }, { id: 504, name: 'Maule' },
    ],
  },
  {
    id: 6, name: 'Peru', sortname: 'PE', phone_code: '51',
    state: [
      { id: 601, name: 'Lima' }, { id: 602, name: 'Arequipa' },
      { id: 603, name: 'Cusco' }, { id: 604, name: 'La Libertad' },
    ],
  },
  {
    id: 7, name: 'Ecuador', sortname: 'EC', phone_code: '593',
    state: [
      { id: 701, name: 'Pichincha' }, { id: 702, name: 'Guayas' },
      { id: 703, name: 'Azuay' }, { id: 704, name: 'Manabí' },
    ],
  },
  {
    id: 8, name: 'Spain', sortname: 'ES', phone_code: '34',
    state: [
      { id: 801, name: 'Madrid' }, { id: 802, name: 'Cataluña' },
      { id: 803, name: 'Andalucía' }, { id: 804, name: 'Valencia' },
    ],
  },
  {
    id: 9, name: 'Canada', sortname: 'CA', phone_code: '1',
    state: [
      { id: 901, name: 'Ontario' }, { id: 902, name: 'Quebec' },
      { id: 903, name: 'British Columbia' }, { id: 904, name: 'Alberta' },
    ],
  },
  {
    id: 10, name: 'Brazil', sortname: 'BR', phone_code: '55',
    state: [
      { id: 1001, name: 'São Paulo' }, { id: 1002, name: 'Rio de Janeiro' },
      { id: 1003, name: 'Minas Gerais' }, { id: 1004, name: 'Bahia' },
    ],
  },
];

function findCountry(id) {
  if (id === undefined || id === null || id === '') return null;
  const n = Number(id);
  return COUNTRIES.find((c) => c.id === n) || null;
}

function findState(countryId, stateId) {
  const country = findCountry(countryId);
  if (!country) return null;
  if (stateId === undefined || stateId === null || stateId === '') return null;
  const n = Number(stateId);
  return (country.state || []).find((s) => s.id === n) || null;
}

module.exports = { COUNTRIES, findCountry, findState };
