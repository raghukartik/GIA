import pool from "../db/pool.js";

const bookableItems = async (req, res) => {
  try {
    const queryString =
      "Select id, name, description, is_active, tax_applicable from items where is_active = true and is_bookable=true";
    const { rows } = await pool.query(queryString);

    if (rows.length === 0) {
      return res.status(204).json({
        success: true,
        message: "No bookable items found!",
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

const availableSlotsForItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { date } = req.query;

    if (!itemId || !date) {
      return res.status(400).json({
        success: false,
        message: "itemId and date are required",
      });
    }

    const itemQuery = `
            SELECT id
            FROM items
            WHERE id = $1 AND is_bookable = true
        `;
    const { rows: items } = await pool.query(itemQuery, [itemId]);

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found or not bookable",
      });
    }

    const dayOfWeek = new Date(date).getDay();

    const availabilityQuery = `
            SELECT start_time, end_time, capacity
            FROM item_availability
            WHERE item_id = $1
              AND day_of_week = $2
            ORDER BY start_time
        `;
    const { rows: availability } = await pool.query(availabilityQuery, [
      itemId,
      dayOfWeek,
    ]);

    if (availability.length === 0) {
      return res.json({
        success: true,
        available_slots: [],
      });
    }

    const availableSlots = [];

    for (const slot of availability) {
      const slotStart = `${date} ${slot.start_time}`;
      const slotEnd = `${date} ${slot.end_time}`;

      const countQuery = `
                SELECT COUNT(*) AS booking_count
                FROM bookings
                WHERE item_id = $1
                  AND status = 'confirmed'
                  AND start_datetime < $2
                  AND end_datetime > $3
            `;
      const { rows } = await pool.query(countQuery, [
        itemId,
        slotEnd,
        slotStart,
      ]);

      const bookingCount = Number(rows[0].booking_count);

      if (bookingCount < slot.capacity) {
        availableSlots.push({
          start_time: slot.start_time,
          end_time: slot.end_time,
          remaining_capacity: slot.capacity - bookingCount,
        });
      }
    }

    return res.status(200).json({
      success: true,
      item_id: itemId,
      date,
      available_slots: availableSlots,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const bookItem = async (req, res) => {
  const client = await pool.connect();

  try {
    const { item_id, customer_id, start_datetime, end_datetime } = req.body;

    if (!item_id || !customer_id || !start_datetime || !end_datetime) {
      return res.status(400).json({
        success: false,
        message:
          "item_id, customer_id, start_datetime, end_datetime are required",
      });
    }

    const startDt = new Date(start_datetime);
    const endDt = new Date(end_datetime);

    if (isNaN(startDt) || isNaN(endDt)) {
      return res.status(400).json({
        success: false,
        message: "Invalid datetime format. Use ISO 8601 format",
      });
    }

    if (startDt >= endDt) {
      return res.status(400).json({
        success: false,
        message: "start_datetime must be before end_datetime",
      });
    }

    await client.query("BEGIN");

    // 1. Check item is bookable
    const itemQuery = `
            SELECT id
            FROM items
            WHERE id = $1 AND is_bookable = true
        `;
    const { rows: items } = await client.query(itemQuery, [item_id]);

    if (items.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Item not bookable",
      });
    }

    // 2. Calculate day of week (Postgres: 0 = Sunday)
    const dayOfWeek = startDt.getDay();

    // 3. Validate booking fully fits inside ONE availability slot
    const availabilityQuery = `
            SELECT
                (DATE($3) + start_time) AS slot_start,
                (DATE($3) + end_time)   AS slot_end,
                capacity
            FROM item_availability
            WHERE item_id = $1
              AND day_of_week = $2
              AND $3::timestamp >= (DATE($3) + start_time)
              AND $4::timestamp <= (DATE($3) + end_time)
            FOR UPDATE
        `;
    const { rows: slots } = await client.query(availabilityQuery, [
      item_id,
      dayOfWeek,
      start_datetime,
      end_datetime,
    ]);

    if (slots.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Requested time is outside available slot range",
      });
    }

    const slot = slots[0];

    // 4. Capacity check (prevent overbooking)
    const countQuery = `
            SELECT COUNT(*) AS booking_count
            FROM bookings
            WHERE item_id = $1
              AND status = 'CONFIRMED'
              AND start_datetime < $2
              AND end_datetime > $3
        `;
    const { rows: countRows } = await client.query(countQuery, [
      item_id,
      end_datetime,
      start_datetime,
    ]);

    const bookingCount = Number(countRows[0].booking_count);

    if (bookingCount >= slot.capacity) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        success: false,
        message: "Slot capacity reached",
      });
    }

    // 5. Insert booking
    const insertQuery = `
            INSERT INTO bookings (
                item_id,
                customer_id,
                booking_date,
                start_datetime,
                end_datetime,
                status
            )
            VALUES (
                $1,
                $2,
                DATE($3),
                $3,
                $4,
                'CONFIRMED'
            )
            RETURNING id
        `;
    const { rows: booking } = await client.query(insertQuery, [
      item_id,
      customer_id,
      start_datetime,
      end_datetime,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      booking_id: booking[0].id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
};

export const bookingController = {
  bookableItems,
  availableSlotsForItem,
  bookItem,
};
