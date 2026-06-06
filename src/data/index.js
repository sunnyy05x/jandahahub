export { dhabaItems, bakeryItems } from './foodItems';
export { kiranaItems } from './groceryItems';
export { mandiItems } from './mandiItems';
export { shuttleRoutes, bikeRentals } from './travelData';
export { sampleOrders } from './orders';

// Combined product list for search, filtering, etc.
import { dhabaItems, bakeryItems } from './foodItems';
import { kiranaItems } from './groceryItems';
import { mandiItems } from './mandiItems';

export const allProducts = [
  ...dhabaItems,
  ...bakeryItems,
  ...kiranaItems,
  ...mandiItems,
];
