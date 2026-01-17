import pool from "../db/pool.js";
import { validate as isUUID } from "uuid";

const getRestaurants = async (req, res) => {
  try {
    const result = await pool.query("Select id, name from restaurants");
    const restaurants = result.rows;
    if (!restaurants) {
      return res.status(204).json({
        success: true,
        message: "No restaurants found",
      });
    }

    return res.status(200).json({
      success: true,
      results: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRestaurantsCategories = async (req, res) => {
  try {
    const { restId } = req.params;
    if (!restId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant Id required",
      });
    }

    const query = `
        SELECT id, restaurant_id, name, description,
                tax_applicable, tax_percentage, is_active
        FROM categories
        WHERE restaurant_id = $1
        `;

    const result = await pool.query(query, [restId]);
    const categories = result.rows;

    if (categories.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No categories for this restaurant!",
      });
    }

    return res.status(200).json({
      success: true,
      results: categories.length,
      categories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRestaurantsSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: "false",
        message: "categoryId is required",
      });
    }

    const queryString = `
        SELECT *
        FROM subcategory
        WHERE category_id = $1
        `;
    const restaurantsResult = await pool.query(queryString, [categoryId]);
    const subCategories = restaurantsResult.rows;

    if (subCategories.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No subcategories found!",
      });
    }

    return res.status(200).json({
      success: true,
      results: subCategories.length,
      subCategories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const restaurantController = {
  getRestaurants,
  getRestaurantsCategories,
  getRestaurantsSubcategories,
};
