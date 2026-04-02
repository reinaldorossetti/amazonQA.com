export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type ShopTabsParamList = {
  Home: undefined;
  Cart: undefined;
  Orders: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Shop: undefined;
  ProductDetails: { productId: number };
  Checkout: undefined;
  Payments: { orderId: number; remaining: number };
  ThankYou: { orderId: number };
  OrderDetails: { orderId: number };
};
