const db = require('../config/db');

class UserModel {
    static async findByEmail(email) {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return users.length > 0 ? users[0] : null;
    }

    static async create(name, email, hashedPassword) {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return { id: result.insertId, name, email };
    }
}

module.exports = UserModel;
