/*==================== 
    DATABASE CONNECTION (JSON ALTERNATIVE)
    Pure JavaScript fallback for environments without C++ Build Tools
====================*/

const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'db.json');

// Memory storage
let data = {
    products: [
        { id: 1, category: 'bouquet', name: 'Mawar Cantik', description: 'Buket mawar merah premium', price: 150000, image_url: '/assets/img/mawar.jpg', badge: 'Terlaris', is_active: 1 },
        { id: 2, category: 'flower', name: 'Anggrek Putih', description: 'Tanaman anggrek putih segar', price: 250000, image_url: '/assets/img/anggrek.jpg', badge: 'Baru', is_active: 1 }
    ],
    customers: [],
    orders: [],
    order_items: [],
    wishlist: [],
    cart_items: []
};

// Load data if exists
function loadData() {
    if (fs.existsSync(dbPath)) {
        try {
            const fileContent = fs.readFileSync(dbPath, 'utf8');
            data = JSON.parse(fileContent);
            console.log('✅ Loaded database from db.json');
        } catch (err) {
            console.error('❌ Error loading db.json, using defaults');
        }
    } else {
        saveData();
    }
}

// Save data to file
function saveData() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('❌ Error saving db.json:', err.message);
    }
}

// Mimic SQLite prepare().get() and prepare().all()
const db = {
    prepare: (sql) => {
        // Very basic SQL parsing for the most common use cases in this project
        return {
            get: (param) => {
                if (sql.includes('FROM customers WHERE email = ?')) {
                    return data.customers.find(c => c.email === param);
                }
                if (sql.includes('FROM customers WHERE id = ?')) {
                    return data.customers.find(c => c.id === param);
                }
                return null;
            },
            all: (...params) => {
                if (sql.includes('FROM products')) {
                    return data.products.filter(p => p.is_active === 1);
                }
                return [];
            },
            run: (...params) => {
                // Not used directly in the code as we use helpers
                return { lastInsertRowid: 0, changes: 0 };
            }
        };
    },
    exec: (sql) => {
        // No-op for JSON DB
    },
    pragma: (sql) => {
        // No-op
    }
};

// Database Helpers
const dbHelpers = {
    getAll: (table, where = '', params = []) => {
        let results = data[table] || [];
        // Support simple where filters if needed (e.g. "WHERE customer_id = ?")
        return results;
    },

    getById: (table, id) => {
        const tableData = data[table] || [];
        return tableData.find(item => item.id === parseInt(id));
    },

    insert: (table, itemData) => {
        if (!data[table]) data[table] = [];
        const newId = data[table].length > 0 ? Math.max(...data[table].map(i => i.id)) + 1 : 1;
        const newItem = { id: newId, ...itemData, created_at: new Date().toISOString() };
        data[table].push(newItem);
        saveData();
        return newId;
    },

    update: (table, id, updateData) => {
        const tableData = data[table] || [];
        const index = tableData.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            data[table][index] = { ...data[table][index], ...updateData, updated_at: new Date().toISOString() };
            saveData();
            return 1;
        }
        return 0;
    },

    delete: (table, id) => {
        if (!data[table]) return 0;
        const initialLength = data[table].length;
        data[table] = data[table].filter(item => item.id !== parseInt(id));
        if (data[table].length !== initialLength) {
            saveData();
            return 1;
        }
        return 0;
    },

    count: (table, where = '', params = []) => {
        return (data[table] || []).length;
    },

    generateOrderNumber: () => {
        const date = new Date();
        const prefix = 'BB';
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${dateStr}${random}`;
    }
};

// Initialize
loadData();

module.exports = {
    db,
    ...dbHelpers
};
