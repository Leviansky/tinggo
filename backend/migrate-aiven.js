const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function runMigration() {
    try {
        console.log('Connecting to Aiven MySQL database...');
        console.log(`Host: ${process.env.DB_HOST}`);
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('Connected successfully!');
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync('schema.sql', 'utf8');
        
        // Split by semicolon and run each statement
        const statements = schema.split(';').filter(stmt => stmt.trim() !== '');
        
        for (const stmt of statements) {
            console.log('Executing:', stmt.substring(0, 50).replace(/\n/g, ' ').trim() + '...');
            await connection.query(stmt);
        }
        
        console.log('\n✅ Schema imported successfully to Aiven!');
        await connection.end();
    } catch (err) {
        console.error('❌ Migration Error:', err.message);
    }
}

runMigration();
