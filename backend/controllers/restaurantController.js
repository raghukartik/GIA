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

const getCategoryItems = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId required",
      });
    }

    const query = `
      SELECT
        i.id,
        i.category_id,
        i.name,
        i.description,
        i.is_active,
        i.pricing_type,
        i.is_bookable,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'description', a.description,
              'price', a.price,
              'is_mandatory', a.is_mandatory
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS addons
      FROM items i
      LEFT JOIN item_addons ia ON ia.item_id = i.id
      LEFT JOIN addons a 
        ON a.id = ia.addon_id
       AND a.is_active = true
      WHERE i.category_id = $1
        AND i.is_active = true
      GROUP BY i.id;
    `;

    const { rows } = await pool.query(query, [categoryId]);

    if (rows.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No items found",
      });
    }

    return res.status(200).json({
      success: true,
      results: rows.length,
      items: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getSubcategoryItems = async (req, res) => {
  try {
    const { subcategoryId } = req.params;

    if (!subcategoryId) {
      return res.status(400).json({
        success: false,
        message: "subcategoryId required",
      });
    }

    const query = `
      SELECT
        i.id,
        i.subcategory_id,
        i.name,
        i.description,
        i.is_active,
        i.pricing_type,
        i.is_bookable,
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'description', a.description,
              'price', a.price,
              'is_mandatory', a.is_mandatory
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS addons
      FROM items i
      LEFT JOIN item_addons ia ON ia.item_id = i.id
      LEFT JOIN addons a
        ON a.id = ia.addon_id
       AND a.is_active = true
      WHERE i.subcategory_id = $1
        AND i.is_active = true
      GROUP BY i.id;
    `;

    const { rows } = await pool.query(query, [subcategoryId]);

    if (rows.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No items found",
      });
    }

    return res.status(200).json({
      success: true,
      results: rows.length,
      items: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


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

const searchItems = async (req, res) => {
  try {
    const { text } = req.body;
    const {
      minPrice,
      maxPrice,
      categoryId,
      subcategoryId,
      activeOnly,
      taxApplicable,
    } = req.query;

    let query = `
      SELECT
        i.id,
        i.name,
        i.description,
        i.is_active,
        ip.base_price,
        ip.currency
      FROM items i
      JOIN item_pricing ip
        ON ip.item_id = i.id
    `;

    const conditions = [];
    const values = [];
    let idx = 1;


    if (text) {
      conditions.push(`(i.name ILIKE $${idx} OR i.description ILIKE $${idx})`);
      values.push(`%${text}%`);
      idx++;
    }


    if (minPrice) {
      conditions.push(`ip.base_price >= $${idx}`);
      values.push(minPrice);
      idx++;
    }

    if (maxPrice) {
      conditions.push(`ip.base_price <= $${idx}`);
      values.push(maxPrice);
      idx++;
    }

    if (categoryId) {
      conditions.push(`i.category_id = $${idx}`);
      values.push(categoryId);
      idx++;
    }

    if (subcategoryId) {
      conditions.push(`i.subcategory_id = $${idx}`);
      values.push(subcategoryId);
      idx++;
    }


    if (activeOnly === "true") {
      conditions.push(`i.is_active = true`);
    }

    if (taxApplicable === "true") {
      conditions.push(`i.tax_applicable = true`);
    }
    if (taxApplicable === "false") {
        conditions.push(`i.tax_applicable IS DISTINCT FROM true`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY i.name ASC";

    const { rows } = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      results: rows.length,
      items: rows,
    });
  } catch (error) {
    console.error("SEARCH QUERY ERROR:", error);
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
    getCategoryItems, 
    getSubcategoryItems,
    getItemsPrice,
    searchItems,
}