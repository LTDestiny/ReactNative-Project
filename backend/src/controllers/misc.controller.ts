import { Request, Response } from 'express';
import { db } from '../database';

export async function getCategories(req: Request, res: Response) {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

export async function getBrands(req: Request, res: Response) {
  try {
    const result = await db.query('SELECT * FROM brands ORDER BY name ASC');

    res.json({ brands: result.rows });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
}
