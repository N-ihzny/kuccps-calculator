const { pool } = require('../config/database');

class User {
    // Create new user
    static async create(userData) {
        const { fullName, email, phone, password, indexNumber, examYear, schoolName, county, authProvider } = userData;
        
        const [result] = await pool.query(
            `INSERT INTO users (full_name, email, phone, password, index_number, exam_year, school_name, county, auth_provider) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [fullName, email, phone, password, indexNumber || null, examYear || null, schoolName || null, county || null, authProvider || 'local']
        );
        
        return result.insertId;
    }

    // Find user by email
    static async findByEmail(email) {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return users[0];
    }

    // Find user by ID
    static async findById(id) {
        const [users] = await pool.query(
            'SELECT id, full_name, email, phone, index_number, exam_year, school_name, county, role, payment_status, auth_provider, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        return users[0];
    }

    // Find user by index number
    static async findByIndexNumber(indexNumber) {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE index_number = ?',
            [indexNumber]
        );
        return users[0];
    }

    // Find user by phone
    static async findByPhone(phone) {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE phone = ?',
            [phone]
        );
        return users[0];
    }

    // Update user
    static async update(id, updates) {
        const allowedFields = ['full_name', 'phone', 'school_name', 'county', 'exam_year', 'index_number'];
        const sets = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                sets.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (sets.length === 0) return false;

        values.push(id);
        const [result] = await pool.query(
            `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Update payment status
    static async updatePaymentStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE users SET payment_status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    // Update password
    static async updatePassword(id, hashedPassword) {
        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    // Delete user
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get user stats
    static async getStats() {
        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN payment_status = 1 THEN 1 ELSE 0 END) as paid_users,
                SUM(CASE WHEN payment_status = 0 THEN 1 ELSE 0 END) as unpaid_users,
                COUNT(DISTINCT county) as counties_represented,
                MIN(created_at) as earliest_user,
                MAX(created_at) as latest_user
             FROM users`
        );
        return stats[0];
    }

    // Get users by date range
    static async getByDateRange(startDate, endDate) {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC',
            [startDate, endDate]
        );
        return users;
    }
}

module.exports = User;