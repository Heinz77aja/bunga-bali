/*==================== 
    DATABASE MIGRATION
    Add customers table and update orders
====================*/

const { db } = require('./db');

console.log('🔄 Running database migration...');

try {
    // 1. Create customers table
    db.exec(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Customers table created/verified');

    // 2. Add customer_id to orders if not exists
    try {
        db.exec('ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id)');
        console.log('✅ Added customer_id to orders table');
    } catch (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('ℹ️  customer_id column already exists in orders table');
        } else {
            throw err;
        }
    }

    console.log('✅ Migration completed successfully');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
}
