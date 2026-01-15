import express from "express";
import { restaurantController } from "../controllers/restaurantController.js";
const Router = express.Router();

Router.route('/restaurants').get(restaurantController.getRestaurants);
Router.route('/restaurants/:restId/categories').get(restaurantController.getRestaurantsCategories)

export default Router;