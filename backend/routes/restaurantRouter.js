import express from "express";
import { restaurantController } from "../controllers/restaurant.controller.js";
import { itemController } from "../controllers/item.controller.js";
import { bookingController } from "../controllers/booking.controller.js";
const Router = express.Router();


/**
 * @swagger
 * /restaurants:
 *   get:
 *     summary: Get list of restaurants
 *     description: Fetch all restaurants available in the system.
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: Restaurants fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
Router.route('/restaurants').get(restaurantController.getRestaurants);

/**
 * @swagger
 * /restaurants/{restId}/categories:
 *   get:
 *     summary: Get categories available in a restaurant
 *     description: Fetch all item categories associated with a specific restaurant.
 *     tags: [Restaurant, Category]
 *     parameters:
 *       - in: path
 *         name: restId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Invalid restaurant ID
 *       404:
 *         description: Restaurant or categories not found
 *       500:
 *         description: Internal server error
 */
Router.route('/restaurants/:restId/categories').get(restaurantController.getRestaurantsCategories);

/**
 * @swagger
 * /category/{categoryId}/subcategories:
 *   get:
 *     summary: Get subcategories under a category
 *     description: Fetch all subcategories belonging to a specific category within a restaurant.
 *     tags: [Category, Subcategory]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Subcategories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category or subcategories not found
 *       500:
 *         description: Internal server error
 */
Router.route('/category/:categoryId/subcategories').get(restaurantController.getRestaurantsSubcategories);

/**
 * @swagger
 * /category/{categoryId}/items:
 *   get:
 *     summary: Get items under a category
 *     description: |
 *       Fetch all items belonging to a specific category.
 *       Items may be directly associated with the category or indirectly via its subcategories.
 *     tags: [Category, Item]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 6
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       base_price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       is_available:
 *                         type: boolean
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category or items not found
 *       500:
 *         description: Internal server error
 */
Router.route('/category/:categoryId/items').get(itemController.getCategoryItems);

/**
 * @swagger
 * /subcategory/{subcategoryId}/items:
 *   get:
 *     summary: Get items under a subcategory
 *     description: Fetch all items directly associated with a specific subcategory.
 *     tags: [Subcategory, Item]
 *     parameters:
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subcategory ID
 *     responses:
 *       200:
 *         description: Items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       base_price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       is_available:
 *                         type: boolean
 *       400:
 *         description: Invalid subcategory ID
 *       404:
 *         description: Subcategory or items not found
 *       500:
 *         description: Internal server error
 */
Router.route('/subcategory/:subcategoryId/items').get(itemController.getSubcategoryItems);

/**
 * @swagger
 * /items/{itemId}/item-price:
 *   get:
 *     summary: Get item price with effective tax
 *     description: |
 *       Fetch the base price of an item along with its effective tax.
 *       The effective tax may be inherited from subcategory, category, or restaurant level.
 *     tags: [Item, Pricing, Tax]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item price fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     item_id:
 *                       type: string
 *                       format: uuid
 *                     base_price:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     tax_applicable:
 *                       type: boolean
 *                     tax_percentage:
 *                       type: number
 *                     final_price:
 *                       type: number
 *       400:
 *         description: Invalid item ID
 *       404:
 *         description: Item pricing not found
 *       500:
 *         description: Internal server error
 */
Router.route('/items/:itemId/item-price').get(itemController.getItemsPrice);


/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search items with filters
 *     description: |
 *       Perform a partial-text search on items and apply optional filters such as
 *       category, subcategory, price range, availability, and tax applicability.
 *     tags: [Item, Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Partial text to search in item name or description
 *       - in: query
 *         name: categoryId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter items by category
 *       - in: query
 *         name: subcategoryId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter items by subcategory
 *       - in: query
 *         name: minPrice
 *         required: false
 *         schema:
 *           type: number
 *         description: Minimum base price filter
 *       - in: query
 *         name: maxPrice
 *         required: false
 *         schema:
 *           type: number
 *         description: Maximum base price filter
 *       - in: query
 *         name: activeOnly
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Return only active/available items
 *       - in: query
 *         name: tax_applicable
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter items based on tax applicability
 *     responses:
 *       200:
 *         description: Search results fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       base_price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       is_available:
 *                         type: boolean
 *                       tax_applicable:
 *                         type: boolean
 *       400:
 *         description: Missing or invalid query parameters
 *       500:
 *         description: Internal server error
 */
Router.route('/search').get(itemController.searchItems);

/**
 * @swagger
 * /bookable-items:
 *   get:
 *     summary: Get bookable items
 *     description: Fetch a list of items that are currently enabled for booking.
 *     tags: [Booking, Item]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter bookable items by restaurant
 *       - in: query
 *         name: activeOnly
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Return only active bookable items
 *     responses:
 *       200:
 *         description: Bookable items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       booking_enabled:
 *                         type: boolean
 *                       base_price:
 *                         type: number
 *                       currency:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
Router.route('/bookable-items').get(bookingController.bookableItems);

/**
 * @swagger
 * /items/{itemId}/available-slots:
 *   get:
 *     summary: Get available booking slots for an item
 *     description: |
 *       Fetch all available time slots for a specific bookable item.
 *       Only slots that are not already booked are returned.
 *     tags: [Booking, Availability]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Item ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for which available slots are requested (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Available slots fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       start_datetime:
 *                         type: string
 *                         format: date-time
 *                       end_datetime:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid item ID or date
 *       404:
 *         description: Item not found or not bookable
 *       500:
 *         description: Internal server error
 */
Router.route('/items/:itemId/available-slots').get(bookingController.availableSlotsForItem);

/**
 * @swagger
 * /item/book-item:
 *   post:
 *     summary: Book an item slot
 *     description: |
 *       Book a time slot for a bookable item.
 *       Prevents double booking for overlapping time ranges.
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_id
 *               - customer_id
 *               - start_datetime
 *               - end_datetime
 *             properties:
 *               item_id:
 *                 type: string
 *                 format: uuid
 *               customer_id:
 *                 type: string
 *                 format: uuid
 *               start_datetime:
 *                 type: string
 *                 format: date-time
 *               end_datetime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Item booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 booking_id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Invalid booking request
 *       409:
 *         description: Slot already booked
 *       500:
 *         description: Internal server error
 */
Router.route('/item/book-item').post(bookingController.bookItem);

export default Router;