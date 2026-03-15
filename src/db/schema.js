export const userSchema = {
  title: 'user schema',
  version: 0,
  description: 'describes a user profile',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    cpf: { type: 'string' },
    cnpj: { type: 'string' },
    address: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        number: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zip: { type: 'string' }
      }
    }
  },
  required: ['id', 'name', 'email', 'password']
};

export const productSchema = {
  title: 'product schema',
  version: 0,
  description: 'describes a product item',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    price: { type: 'number' },
    description: { type: 'string' },
    category: { type: 'string' },
    image: { type: 'string' }
  },
  required: ['id', 'name', 'price']
};
