import { Request, Response } from 'express';
import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

interface ProductQuery {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}

export async function getProducts(req: Request<{}, {}, {}, ProductQuery>, res: Response) {
  try {
    const {
      query = '',
      category,
      brand,
      minPrice,
      maxPrice,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let queryText = `
      SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        c.name as category_name,
        c.slug as category_slug,
        i.quantity as stock,
        COALESCE(
          (SELECT json_agg(
            json_build_object('id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary, 'position', pi.position)
            ORDER BY pi.position, pi.is_primary DESC
          )
          FROM product_images pi WHERE pi.product_id = p.id),
          '[]'
        ) as images,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.is_active = true
    `;

    const params: any[] = [];
    let paramCount = 0;

    // Search by name/description
    if (query) {
      paramCount++;
      queryText += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${query}%`);
    }

    // Filter by category
    if (category) {
      paramCount++;
      queryText += ` AND c.slug = $${paramCount}`;
      params.push(category);
    }

    // Filter by brand
    if (brand) {
      paramCount++;
      queryText += ` AND b.slug = $${paramCount}`;
      params.push(brand);
    }

    // Filter by price range
    if (minPrice) {
      paramCount++;
      queryText += ` AND p.price >= $${paramCount}`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND p.price <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
    }

    queryText += `
      GROUP BY p.id, b.name, b.slug, c.name, c.slug, i.quantity
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limitNum, offset);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const countParams: any[] = [];
    let countParamIndex = 0;

    if (query) {
      countParamIndex++;
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`;
      countParams.push(`%${query}%`);
    }

    if (category) {
      countParamIndex++;
      countQuery += ` AND c.slug = $${countParamIndex}`;
      countParams.push(category);
    }

    if (brand) {
      countParamIndex++;
      countQuery += ` AND b.slug = $${countParamIndex}`;
      countParams.push(brand);
    }

    if (minPrice) {
      countParamIndex++;
      countQuery += ` AND p.price >= $${countParamIndex}`;
      countParams.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      countParamIndex++;
      countQuery += ` AND p.price <= $${countParamIndex}`;
      countParams.push(parseFloat(maxPrice));
    }

    const [productsResult, countResult] = await Promise.all([
      db.query(queryText, params),
      db.query(countQuery, countParams),
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      products: productsResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        c.name as category_name,
        c.slug as category_slug,
        i.quantity as stock,
        COALESCE(
          (SELECT json_agg(
            json_build_object('id', pi.id, 'url', pi.url, 'is_primary', pi.is_primary, 'position', pi.position)
            ORDER BY pi.position, pi.is_primary DESC
          )
          FROM product_images pi WHERE pi.product_id = p.id),
          '[]'
        ) as images,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.product_id = i.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, b.name, b.slug, c.name, c.slug, i.quantity
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const {
      sku,
      name,
      description,
      price,
      sale_price,
      brand_id,
      category_id,
      weight_grams,
      images = [],
      stock = 0,
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // Create product
      const productResult = await client.query(
        `INSERT INTO products (id, sku, name, description, price, sale_price, brand_id, category_id, weight_grams)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          uuidv4(),
          sku || null,
          name,
          description || null,
          price,
          sale_price || null,
          brand_id || null,
          category_id || null,
          weight_grams || null,
        ]
      );

      const product = productResult.rows[0];

      // Create inventory record
      await client.query(
        'INSERT INTO inventory (id, product_id, quantity) VALUES ($1, $2, $3)',
        [uuidv4(), product.id, stock]
      );

      // Add images if provided
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          await client.query(
            'INSERT INTO product_images (id, product_id, url, is_primary, position) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), product.id, images[i].url, i === 0, i]
          );
        }
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Product created successfully',
        product,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      description,
      price,
      sale_price,
      brand_id,
      category_id,
      weight_grams,
      is_active,
    } = req.body;

    const result = await db.query(
      `UPDATE products 
       SET sku = COALESCE($2, sku),
           name = COALESCE($3, name),
           description = COALESCE($4, description),
           price = COALESCE($5, price),
           sale_price = $6,
           brand_id = $7,
           category_id = $8,
           weight_grams = $9,
           is_active = COALESCE($10, is_active),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id, sku, name, description, price, sale_price, brand_id, category_id, weight_grams, is_active]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to false
    const result = await db.query(
      'UPDATE products SET is_active = false, updated_at = now() WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}
