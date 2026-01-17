import express from "express";
import { restaurantController } from "../controllers/restaurantController.js";
const Router = express.Router();

Router.route('/restaurants').get(restaurantController.getRestaurants);
Router.route('/restaurants/:restId/categories').get(restaurantController.getRestaurantsCategories);
Router.route('/category/:categoryId/subcategories').get(restaurantController.getRestaurantsSubcategories);
Router.route('/category/:categoryId/items').get(restaurantController.getCategoryItems);
Router.route('/subcategory/:subcategoryId/items').get(restaurantController.getSubcategoryItems);
Router.route('/items/:itemId/item-price').get(restaurantController.getItemsPrice);
Router.route('/search').get(restaurantController.searchItems);
Router.route('/bookable-items').get(restaurantController.bookableItems);
Router.route('/items/:itemId/available-slots').get(restaurantController.availableSlotsForItem);
Router.route('/item/book-item').post(restaurantController.bookItem);

export default Router;