import { faker } from '@faker-js/faker';

export const createMockUser = (overrides = {}) => ({
  id: overrides.id || faker.number.int(),
  name: overrides.name || faker.person.fullName(),
  email: overrides.email || faker.internet.email(),
  phone: overrides.phone || faker.phone.number(),
  role: overrides.role || 'user',
  createdAt: overrides.createdAt || faker.date.past(),
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: overrides.id || faker.number.int(),
  name: overrides.name || faker.commerce.productName(),
  description: overrides.description || faker.commerce.productDescription(),
  price: overrides.price || parseFloat(faker.commerce.price()),
  originalPrice: overrides.originalPrice || parseFloat(faker.commerce.price({ min: 100 })),
  category: overrides.category || faker.commerce.department(),
  images: overrides.images || [faker.image.url(), faker.image.url()],
  rating: overrides.rating || faker.number.float({ min: 1, max: 5, precision: 0.1 }),
  reviews: overrides.reviews || faker.number.int({ min: 0, max: 1000 }),
  stock: overrides.stock || faker.number.int({ min: 0, max: 100 }),
  sku: overrides.sku || faker.string.hexadecimal({ length: 10 }),
  discount: overrides.discount || 0,
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: overrides.id || faker.number.int(),
  productId: overrides.productId || faker.number.int(),
  product: overrides.product || createMockProduct(),
  quantity: overrides.quantity || faker.number.int({ min: 1, max: 10 }),
  price: overrides.price || parseFloat(faker.commerce.price()),
  ...overrides,
});

export const createMockCart = (overrides = {}) => ({
  id: overrides.id || faker.number.int(),
  userId: overrides.userId || faker.number.int(),
  items: overrides.items || [createMockCartItem(), createMockCartItem()],
  subtotal: overrides.subtotal || 100,
  tax: overrides.tax || 10,
  discount: overrides.discount || 0,
  total: overrides.total || 110,
  coupon: overrides.coupon || null,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: overrides.id || `ORD-${faker.string.hexadecimal({ length: 8 })}`,
  userId: overrides.userId || faker.number.int(),
  items: overrides.items || [createMockCartItem()],
  status: overrides.status || 'pending',
  total: overrides.total || 150,
  shippingAddress: overrides.shippingAddress || {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
    country: faker.location.country(),
  },
  createdAt: overrides.createdAt || faker.date.past(),
  ...overrides,
});

export const createMockAuthToken = (overrides = {}) => ({
  token: overrides.token || faker.string.hexadecimal({ length: 100 }),
  refreshToken: overrides.refreshToken || faker.string.hexadecimal({ length: 100 }),
  expiresIn: overrides.expiresIn || 3600,
  user: overrides.user || createMockUser(),
});

export const createMockLanguage = (overrides = {}) => ({
  code: overrides.code || 'pt',
  name: overrides.name || 'Português',
  ...overrides,
});

export const createMockReview = (overrides = {}) => ({
  id: overrides.id || faker.number.int(),
  userId: overrides.userId || faker.number.int(),
  productId: overrides.productId || faker.number.int(),
  rating: overrides.rating || faker.number.int({ min: 1, max: 5 }),
  comment: overrides.comment || faker.lorem.paragraph(),
  createdAt: overrides.createdAt || faker.date.past(),
  ...overrides,
});
