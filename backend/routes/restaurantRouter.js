import express from "express";
import { restaurantController } from "../controllers/restaurant.controller.js";
import { itemController } from "../controllers/item.controller.js";
import { bookingController } from "../controllers/booking.controller.js";
const Router = express.Router();

Router.route('/restaurants').get(restaurantController.getRestaurants);
Router.route('/restaurants/:restId/categories').get(restaurantController.getRestaurantsCategories);
Router.route('/category/:categoryId/subcategories').get(restaurantController.getRestaurantsSubcategories);
Router.route('/category/:categoryId/items').get(itemController.getCategoryItems);
Router.route('/subcategory/:subcategoryId/items').get(itemController.getSubcategoryItems);
Router.route('/items/:itemId/item-price').get(itemController.getItemsPrice);
Router.route('/search').get(itemController.searchItems);
Router.route('/bookable-items').get(bookingController.bookableItems);
Router.route('/items/:itemId/available-slots').get(bookingController.availableSlotsForItem);
Router.route('/item/book-item').post(bookingController.bookItem);

export default Router;