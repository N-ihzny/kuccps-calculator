const { pool } = require('../config/database');

class User {
    // Create new user - UPDATED to accept id parameter
    static async create(userData) {
        const { id, fullName, email, phone, password, indexNumber, examYear, schoolName, county, authProvider } = userData;
        
        const result = await pool.query(
            `INSERT INTO users (id, full_name, email, phone, password, index_number, exam_year, school_name, county, auth_provider) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [id, fullName, email, phone, password, indexNumber || null, examYear || null, schoolName || null, county || null, authProvider || 'local']
        );
        
        return result.rows[0].id;
    }

    // Find user by email
    static async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const result = await pool.query(
            'SELECT id, full_name, email, phone, index_number, exam_year, school_name, county, role, payment_status, auth_provider, created_at, updated_at FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Find user by index number
    static async findByIndexNumber(indexNumber) {
        const result = await pool.query(
            'SELECT * FROM users WHERE index_number = $1',
            [indexNumber]
        );
        return result.rows[0];
    }

    // Find user by phone
    static async findByPhone(phone) {
        const result = await pool.query(
            'SELECT * FROM users WHERE phone = $1',
            [phone]
        );
        return result.rows[0];
    }

    // Update user
    static async update(id, updates) {
        const allowedFields = ['full_name', 'phone', 'school_name', 'county', 'exam_year', 'index_number'];
        const sets = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                sets.push(`${key} = $${paramIndex}`);
                values.push(value);
                paramIndex++;
            }
        }

        if (sets.length === 0) return false;

        values.push(id);
        const result = await pool.query(
            `UPDATE users SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        return result.rowCount > 0;
    }

    // Update payment status
    static async updatePaymentStatus(id, status) {
        const result = await pool.query(
            'UPDATE users SET payment_status = $1 WHERE id = $2',
            [status, id]
        );
        return result.rowCount > 0;
    }

    // Update password
    static async updatePassword(id, hashedPassword) {
        const result = await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, id]
        );
        return result.rowCount > 0;
    }

    // Delete user
    static async delete(id) {
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    // Get user stats
    static async getStats() {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN payment_status = true THEN 1 ELSE 0 END) as paid_users,
                SUM(CASE WHEN payment_status = false THEN 1 ELSE 0 END) as unpaid_users,
                COUNT(DISTINCT county) as counties_represented,
                MIN(created_at) as earliest_user,
                MAX(created_at) as latest_user
             FROM users`
        );
        return result.rows[0];
    }

    // Get users by date range
    static async getByDateRange(startDate, endDate) {
        const result = await pool.query(
            'SELECT * FROM users WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at DESC',
            [startDate, endDate]
        );
        return result.rows;
    }
}

module.exports = User;
