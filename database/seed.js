/*==================== 
    DATABASE SEEDER
    Initial data for Bunga Bali
====================*/

const { db } = require('./db');
const bcrypt = require('bcryptjs');

console.log('🌱 Starting database seeding...');

// Seed admin user
function seedAdmin() {
    const existingAdmin = db.prepare('SELECT * FROM admin_users WHERE username = ?').get('admin');

    if (!existingAdmin) {
        const passwordHash = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO admin_users (username, password_hash, full_name)
            VALUES (?, ?, ?)
        `).run('admin', passwordHash, 'Administrator');
        console.log('✅ Admin user created (username: admin, password: admin123)');
    } else {
        console.log('ℹ️  Admin user already exists');
    }
}

// Seed products
function seedProducts() {
    const count = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

    if (count > 0) {
        console.log(`ℹ️  Products already seeded (${count} products)`);
        return;
    }

    const products = [
        // Bouquets
        {
            category: 'bouquet',
            subcategory: 'money',
            name: 'Buket Uang Premium',
            description: 'Buket uang cantik dengan rangkaian bunga artificial. Cocok untuk hadiah wisuda atau ulang tahun.',
            price: 350000,
            image_url: '/assets/img/bouquet_money.jpg',
            badge: 'Best Seller'
        },
        {
            category: 'bouquet',
            subcategory: 'premium',
            name: 'Elegant Black Series',
            description: 'Rangkaian bunga premium dengan tema hitam elegan. Tampilan mewah dan eksklusif.',
            price: 450000,
            image_url: '/assets/img/bouquet_elegant.jpg',
            badge: 'Eksklusif'
        },
        {
            category: 'bouquet',
            subcategory: 'rose',
            name: 'Cinta Romantis',
            description: 'Buket mawar merah klasik untuk momen romantis. 20 tangkai mawar segar pilihan.',
            price: 385000,
            image_url: '/assets/img/product1.png',
            badge: 'Romantis'
        },
        {
            category: 'bouquet',
            subcategory: 'wedding',
            name: 'Buket Pengantin',
            description: 'Hand bouquet cantik untuk hari pernikahan Anda. Terdiri dari bunga segar pilihan.',
            price: 550000,
            image_url: '/assets/img/product2.png',
            badge: 'Pernikahan'
        },

        // Individual Flowers
        {
            category: 'flower',
            subcategory: 'mawar',
            name: 'Mawar Merah',
            description: 'Mawar merah segar, simbol cinta klasik',
            price: 15000,
            image_url: 'https://images.unsplash.com/photo-1518882605630-8eb294bf3086?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'mawar',
            name: 'Mawar Pink',
            description: 'Mawar pink lembut, simbol kasih sayang',
            price: 15000,
            image_url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'mawar',
            name: 'Mawar Putih',
            description: 'Mawar putih murni, simbol kesucian',
            price: 15000,
            image_url: 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'mawar',
            name: 'Mawar Biru',
            description: 'Mawar biru langka dan eksklusif',
            price: 35000,
            image_url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=200&h=200&fit=crop',
            badge: 'Langka'
        },
        {
            category: 'flower',
            subcategory: 'gerbera',
            name: 'Gerbera Merah',
            description: 'Gerbera merah cerah, simbol kebahagiaan',
            price: 12000,
            image_url: 'https://images.unsplash.com/photo-1535586797186-ee88e13376e5?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'gerbera',
            name: 'Gerbera Kuning',
            description: 'Gerbera kuning ceria',
            price: 12000,
            image_url: 'https://images.unsplash.com/photo-1598224421498-d30da04b43c5?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'hydrangea',
            name: 'Hydrangea Biru',
            description: 'Hydrangea biru cantik untuk dekorasi',
            price: 45000,
            image_url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=200&h=200&fit=crop',
            badge: 'Premium'
        },
        {
            category: 'flower',
            subcategory: 'sunflower',
            name: 'Bunga Matahari',
            description: 'Bunga matahari segar, simbol keceriaan',
            price: 20000,
            image_url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=200&h=200&fit=crop',
            badge: 'Populer'
        },
        {
            category: 'flower',
            subcategory: 'lily',
            name: 'Casablanca Putih',
            description: 'Lily Casablanca putih dengan aroma harum',
            price: 25000,
            image_url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'baby-breath',
            name: 'Baby Breath',
            description: 'Baby breath putih untuk pelengkap rangkaian',
            price: 35000,
            image_url: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3?w=200&h=200&fit=crop',
            badge: null
        },
        {
            category: 'flower',
            subcategory: 'tulip',
            name: 'Tulip Merah',
            description: 'Tulip merah import Belanda',
            price: 22000,
            image_url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=200&h=200&fit=crop',
            badge: 'Import'
        }
    ];

    const insertStmt = db.prepare(`
        INSERT INTO products (category, subcategory, name, description, price, image_url, badge)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            insertStmt.run(
                item.category,
                item.subcategory,
                item.name,
                item.description,
                item.price,
                item.image_url,
                item.badge
            );
        }
    });

    insertMany(products);
    console.log(`✅ ${products.length} products seeded`);
}

// Run seeders
try {
    seedAdmin();
    seedProducts();
    console.log('');
    console.log('🌺 Database seeding completed!');
    console.log('');
} catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
}
