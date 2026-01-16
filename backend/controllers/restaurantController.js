import pool from "../models/db.js"
import { validate as isUUID } from "uuid";

const getRestaurants = async(req, res) => {
    try {
        const result = await pool.query("Select id, name from restaurants");
        const restaurants = result.rows;
        if(!restaurants){
            return res.status(204).json({
                success: true,
                message: "No restaurants found"
            })
        }

        return res.status(200).json({
            success: true,
            results: restaurants.length,
            restaurants
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getRestaurantsCategories = async(req, res) => {
    try {
        const {restId} = req.params;
        if(!restId){
            return res.status(400).json({
                success: false,
                message: "Restaurant Id required"
            })
        }

        const query = `
        SELECT id, restaurant_id, name, description,
                tax_applicable, tax_percentage, is_active
        FROM categories
        WHERE restaurant_id = $1
        `;

        const result = await pool.query(query, [restId]);
        const categories = result.rows;

        if(categories.length === 0){
            return res.status(204).json({
                success: true,
                message: "No categories for this restaurant!"
            })
        }

        return res.status(200).json({
            success: true,
            results: categories.length,
            categories
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getRestaurantsSubcategories = async(req, res) => {
    try {
        const {categoryId} = req.params;

        if(!categoryId){
            return res.status(400).json({
                success: "false",
                message: "categoryId is required"
            })
        }

        const queryString = `
        SELECT *
        FROM subcategory
        WHERE category_id = $1
        `;
        const restaurantsResult = await pool.query(queryString, [categoryId]);
        const subCategories = restaurantsResult.rows;

        if(subCategories.length === 0){
            return res.status(204).json({
                success: true, 
                message: "No subcategories found!"
            })
        }

        return res.status(200).json({
            success: true,
            results: subCategories.length,
            subCategories
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getCategoryItems = async(req, res) => {
    try {
        const {categoryId} = req.params;
        if(!categoryId){
            return res.status(204).json({
                status: false,
                message: "categoryId required"
            })
        }

        const queryString = `Select id, category_id, name, description, is_active, pricing_type, is_bookable from items 
            where category_id = $1 and is_active = true`

        const result = await pool.query(queryString, [categoryId]);
        const items = result.rows;

        if(items.length === 0){
            return res.status(204).json({
                success: true,
                message: "No items found"
            })
        }

        return res.status(200).json({
            success: true,
            results: items.length,
            items
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getSubcategoryItems = async(req, res) => {
    try {
        const {subcategoryId} = req.params;
        if(!subcategoryId){
            return res.status(204).json({
                status: false,
                message: "subcategoryId required"
            })
        }

        const queryString = `Select id, subcategory_id, name, description, is_active, pricing_type, is_bookable from items 
            where subcategory_id = $1 and is_active = true`

        const result = await pool.query(queryString, [subcategoryId]);
        const items = result.rows;

        if(items.length === 0){
            return res.status(204).json({
                success: true,
                message: "No items found"
            })
        }

        return res.status(200).json({
            success: true,
            results: items.length,
            items
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const getItemsPrice = async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "itemId required"
            });
        }

        const queryString = `
            SELECT
                ip.base_price,
                ip.currency,
                ip.item_id,
                t.tax_applicable,
                t.tax_percentage
            FROM item_pricing ip
            JOIN item_effective_tax t ON ip.item_id = t.item_id
            WHERE ip.item_id = $1
        `;

        const { rows } = await pool.query(queryString, [itemId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No item pricing found"
            });
        }

        return res.status(200).json({
            success: true,
            results: rows.length,
            itemPrices: rows
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const restaurantController = {
    getRestaurants,
    getRestaurantsCategories,
    getRestaurantsSubcategories,
    getCategoryItems, 
    getSubcategoryItems,
    getItemsPrice
}