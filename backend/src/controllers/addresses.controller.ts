import { Request, Response } from 'express';
import { db } from '../database';

// Get user's addresses
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const addresses = await db.query(
      `SELECT * FROM addresses 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: addresses.rows,
    });
  } catch (error) {
    console.error('Error getting addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get addresses',
    });
  }
};

// Get single address
export const getAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { address_id } = req.params;

    const address = await db.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [address_id, userId]
    );

    if (address.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    res.json({
      success: true,
      data: address.rows[0],
    });
  } catch (error) {
    console.error('Error getting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get address',
    });
  }
};

// Create address
export const createAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { label, address_line, city, district, postal_code, phone, is_default } = req.body;

    if (!address_line || !city) {
      return res.status(400).json({
        success: false,
        message: 'Address line and city are required',
      });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await db.query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1`,
        [userId]
      );
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, label, address_line, city, district, postal_code, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, label, address_line, city, district, postal_code, phone, is_default || false]
    );

    res.status(201).json({
      success: true,
      message: 'Address created',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
    });
  }
};

// Update address
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { address_id } = req.params;
    const { label, address_line, city, district, postal_code, phone, is_default } = req.body;

    // Verify address belongs to user
    const existing = await db.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [address_id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await db.query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2`,
        [userId, address_id]
      );
    }

    const result = await db.query(
      `UPDATE addresses 
       SET label = COALESCE($1, label),
           address_line = COALESCE($2, address_line),
           city = COALESCE($3, city),
           district = COALESCE($4, district),
           postal_code = COALESCE($5, postal_code),
           phone = COALESCE($6, phone),
           is_default = COALESCE($7, is_default)
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [label, address_line, city, district, postal_code, phone, is_default, address_id, userId]
    );

    res.json({
      success: true,
      message: 'Address updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
    });
  }
};

// Delete address
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { address_id } = req.params;

    // Verify address belongs to user
    const existing = await db.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [address_id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    await db.query(
      `DELETE FROM addresses WHERE id = $1 AND user_id = $2`,
      [address_id, userId]
    );

    res.json({
      success: true,
      message: 'Address deleted',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
    });
  }
};

// Set default address
export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { address_id } = req.params;

    // Verify address belongs to user
    const existing = await db.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [address_id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Unset all defaults
    await db.query(
      `UPDATE addresses SET is_default = false WHERE user_id = $1`,
      [userId]
    );

    // Set this one as default
    await db.query(
      `UPDATE addresses SET is_default = true WHERE id = $1`,
      [address_id]
    );

    res.json({
      success: true,
      message: 'Default address updated',
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default address',
    });
  }
};
