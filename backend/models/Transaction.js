const { pool } = require('../config/database');

class Transaction {
    // Create new transaction
    static async create(transactionData) {
        const { userId, reference, amount, status, metadata } = transactionData;
        
        const result = await pool.query(
            `INSERT INTO transactions (user_id, reference, amount, status, metadata) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [userId, reference, amount, status || 'pending', JSON.stringify(metadata || {})]
        );
        
        return result.rows[0].id;
    }

    // Find transaction by reference
    static async findByReference(reference) {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE reference = $1',
            [reference]
        );
        return result.rows[0];
    }

    // Find transactions by user ID
    static async findByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    // Find transaction by ID
    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Update transaction status
    static async updateStatus(reference, status) {
        const result = await pool.query(
            `UPDATE transactions 
             SET status = $1, paid_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE paid_at END 
             WHERE reference = $2`,
            [status, reference]
        );
        return result.rowCount > 0;
    }

    // Get user's latest successful transaction
    static async getLatestSuccessful(userId) {
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
            [userId, 'completed']
        );
        return result.rows[0];
    }

    // Check if user has paid
    static async hasUserPaid(userId) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM transactions WHERE user_id = $1 AND status = $2',
            [userId, 'completed']
        );
        return parseInt(result.rows[0].count) > 0;
    }

    // Get transaction statistics
    static async getStats(userId = null) {
        let query = `
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_transactions,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_transactions,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_transactions,
                SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
            FROM transactions
        `;
        const params = [];

        if (userId) {
            query += ' WHERE user_id = $1';
            params.push(userId);
        }

        const result = await pool.query(query, params);
        return result.rows[0];
    }

    // Get transactions by date range
    static async getByDateRange(startDate, endDate, userId = null) {
        let query = 'SELECT * FROM transactions WHERE created_at BETWEEN $1 AND $2';
        const params = [startDate, endDate];
        let paramIndex = 3;

        if (userId) {
            query += ` AND user_id = $${paramIndex}`;
            params.push(userId);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }
}

module.exports = Transaction;
