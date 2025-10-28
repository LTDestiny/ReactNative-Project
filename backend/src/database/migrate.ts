import { db } from './index';

const migrations = [
  // Migration 1: Create users table
  `
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    password_hash varchar(255) NOT NULL,
    full_name varchar(255),
    phone varchar(30),
    role varchar(20) NOT NULL DEFAULT 'customer',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `,

  // Migration 2: Create categories table
  `
  CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(150) NOT NULL,
    slug varchar(150) UNIQUE NOT NULL,
    parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
  `,

  // Migration 3: Create brands table
  `
  CREATE TABLE IF NOT EXISTS brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(150) NOT NULL,
    slug varchar(150) UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
  `,

  // Migration 4: Create products table
  `
  CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sku varchar(100) UNIQUE,
    name varchar(255) NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    sale_price numeric(12,2),
    brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    weight_grams integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true
  );
  CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('english', name || ' ' || coalesce(description,'')));
  CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
  `,

  // Migration 5: Create product_images table
  `
  CREATE TABLE IF NOT EXISTS product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    url text NOT NULL,
    is_primary boolean DEFAULT false,
    position int DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
  `,

  // Migration 6: Create inventory table
  `
  CREATE TABLE IF NOT EXISTS inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    quantity int NOT NULL DEFAULT 0,
    location varchar(255),
    updated_at timestamptz DEFAULT now()
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
  `,

  // Migration 7: Create addresses table
  `
  CREATE TABLE IF NOT EXISTS addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    label varchar(100),
    address_line text,
    city varchar(100),
    district varchar(100),
    postal_code varchar(20),
    phone varchar(30),
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
  `,

  // Migration 8: Create orders table
  `
  CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id),
    address_id uuid REFERENCES addresses(id),
    total_amount numeric(12,2) NOT NULL,
    shipping_fee numeric(12,2) DEFAULT 0,
    status varchar(50) NOT NULL DEFAULT 'pending',
    payment_status varchar(50) NOT NULL DEFAULT 'unpaid',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `,

  // Migration 9: Create order_items table
  `
  CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    product_name varchar(255),
    quantity int NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    total_price numeric(12,2) NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `,

  // Migration 10: Create payments table
  `
  CREATE TABLE IF NOT EXISTS payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
    payment_provider varchar(100),
    provider_transaction_id varchar(255),
    amount numeric(12,2) NOT NULL,
    currency varchar(10) DEFAULT 'VND',
    status varchar(50) NOT NULL,
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
  `,

  // Migration 11: Create carts table
  `
  CREATE TABLE IF NOT EXISTS carts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) UNIQUE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  `,

  // Migration 12: Create cart_items table
  `
  CREATE TABLE IF NOT EXISTS cart_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    quantity int NOT NULL DEFAULT 1,
    added_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
  `,

  // Migration 13: Create reviews table
  `
  CREATE TABLE IF NOT EXISTS reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id),
    rating smallint CHECK (rating >=1 AND rating <=5),
    title varchar(255),
    body text,
    created_at timestamptz DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
  `,
];

export async function runMigrations() {
  console.log('🚀 Running database migrations...');

  try {
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}...`);
      await db.query(migrations[i]);
      console.log(`✅ Migration ${i + 1} completed`);
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to run migrations:', error);
      process.exit(1);
    });
}
