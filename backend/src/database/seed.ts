import { db } from './index';
import { hashPassword } from '../utils/auth';
import { v4 as uuidv4 } from 'uuid';

const seedData = {
  users: [
    {
      email: 'customer@example.com',
      password: 'Password123!',
      full_name: 'Khách Hàng',
      phone: '0901234567',
      role: 'customer',
    },
    {
      email: 'admin@example.com',
      password: 'AdminPass123!',
      full_name: 'Admin',
      phone: '0907654321',
      role: 'admin',
    },
  ],
  categories: [
    { name: 'Dụng cụ cầm tay', slug: 'dung-cu-cam-tay' },
    { name: 'Máy khoan', slug: 'may-khoan' },
    { name: 'Máy hàn', slug: 'may-han' },
    { name: 'Phụ tùng', slug: 'phu-tung' },
  ],
  brands: [
    { name: 'Makita', slug: 'makita' },
    { name: 'Bosch', slug: 'bosch' },
    { name: 'DeWalt', slug: 'dewalt' },
    { name: 'Stanley', slug: 'stanley' },
  ],
  products: [
    {
      sku: 'DRL-001',
      name: 'Máy khoan Makita 13mm',
      description:
        'Máy khoan động lực Makita 13mm, công suất 650W, tốc độ không tải 0-2800 vòng/phút. Thích hợp cho khoan bê tông, gạch, gỗ và kim loại.',
      price: 1200000,
      sale_price: 1100000,
      brand: 'makita',
      category: 'may-khoan',
      weight_grams: 2500,
      stock: 10,
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500',
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500',
      ],
    },
    {
      sku: 'WLD-002',
      name: 'Máy hàn Bosch 200A',
      description:
        'Máy hàn điện tử Bosch 200A, công nghệ IGBT, hàn que 1.6-4.0mm. Nhỏ gọn, tiết kiệm điện năng.',
      price: 2200000,
      sale_price: null,
      brand: 'bosch',
      category: 'may-han',
      weight_grams: 5000,
      stock: 5,
      images: ['https://images.unsplash.com/photo-1581092918484-8313e1f6e825?w=500'],
    },
    {
      sku: 'DRL-003',
      name: 'Máy khoan pin DeWalt 18V',
      description:
        'Máy khoan pin DeWalt 18V Li-ion, 2 pin, mô-men xoắn 60Nm. Đầu kẹp tự động 13mm, có chế độ khoan búa.',
      price: 3500000,
      sale_price: 3200000,
      brand: 'dewalt',
      category: 'may-khoan',
      weight_grams: 1800,
      stock: 8,
      images: [
        'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500',
        'https://images.unsplash.com/photo-1581092918484-8313e1f6e825?w=500',
      ],
    },
    {
      sku: 'HND-004',
      name: 'Bộ dụng cụ Stanley 150 chi tiết',
      description:
        'Bộ dụng cụ đa năng Stanley 150 chi tiết gồm: tua vít, cờ lê, kìm, búa, đầu khẩu... Vali nhựa chắc chắn.',
      price: 850000,
      sale_price: null,
      brand: 'stanley',
      category: 'dung-cu-cam-tay',
      weight_grams: 4200,
      stock: 15,
      images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500'],
    },
    {
      sku: 'PRT-005',
      name: 'Đầu khoan bê tông Bosch 6-16mm',
      description:
        'Bộ 10 mũi khoan bê tông Bosch từ 6mm đến 16mm, mũi hợp kim carbide sắc bén, tuổi thọ cao.',
      price: 320000,
      sale_price: 290000,
      brand: 'bosch',
      category: 'phu-tung',
      weight_grams: 800,
      stock: 30,
      images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500'],
    },
    {
      sku: 'PRT-006',
      name: 'Điện cực hàn Makita 2.5mm',
      description:
        'Điện cực hàn Makita 2.5mm, gói 1kg (khoảng 50 que). Thích hợp cho hàn sắt, thép carbon.',
      price: 75000,
      sale_price: null,
      brand: 'makita',
      category: 'phu-tung',
      weight_grams: 1000,
      stock: 50,
      images: ['https://images.unsplash.com/photo-1581092918484-8313e1f6e825?w=500'],
    },
  ],
};

export async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data (optional - comment out to keep existing data)
    console.log('Clearing existing data...');
    await db.query(
      'TRUNCATE users, categories, brands, products, product_images, inventory CASCADE'
    );

    // Seed users
    console.log('Seeding users...');
    const userIds: { [email: string]: string } = {};
    for (const user of seedData.users) {
      const id = uuidv4();
      const password_hash = await hashPassword(user.password);
      await db.query(
        'INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, user.email, password_hash, user.full_name, user.phone, user.role]
      );
      userIds[user.email] = id;
      console.log(`  ✅ Created user: ${user.email}`);
    }

    // Seed categories
    console.log('Seeding categories...');
    const categoryIds: { [slug: string]: string } = {};
    for (const category of seedData.categories) {
      const id = uuidv4();
      await db.query('INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)', [
        id,
        category.name,
        category.slug,
      ]);
      categoryIds[category.slug] = id;
      console.log(`  ✅ Created category: ${category.name}`);
    }

    // Seed brands
    console.log('Seeding brands...');
    const brandIds: { [slug: string]: string } = {};
    for (const brand of seedData.brands) {
      const id = uuidv4();
      await db.query('INSERT INTO brands (id, name, slug) VALUES ($1, $2, $3)', [
        id,
        brand.name,
        brand.slug,
      ]);
      brandIds[brand.slug] = id;
      console.log(`  ✅ Created brand: ${brand.name}`);
    }

    // Seed products
    console.log('Seeding products...');
    for (const product of seedData.products) {
      const productId = uuidv4();
      const brandId = brandIds[product.brand];
      const categoryId = categoryIds[product.category];

      await db.query(
        `INSERT INTO products (id, sku, name, description, price, sale_price, brand_id, category_id, weight_grams)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          productId,
          product.sku,
          product.name,
          product.description,
          product.price,
          product.sale_price,
          brandId,
          categoryId,
          product.weight_grams,
        ]
      );

      // Add inventory
      await db.query('INSERT INTO inventory (id, product_id, quantity) VALUES ($1, $2, $3)', [
        uuidv4(),
        productId,
        product.stock,
      ]);

      // Add images
      for (let i = 0; i < product.images.length; i++) {
        await db.query(
          'INSERT INTO product_images (id, product_id, url, is_primary, position) VALUES ($1, $2, $3, $4, $5)',
          [uuidv4(), productId, product.images[i], i === 0, i]
        );
      }

      console.log(`  ✅ Created product: ${product.name}`);
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Database seeded');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to seed database:', error);
      process.exit(1);
    });
}
