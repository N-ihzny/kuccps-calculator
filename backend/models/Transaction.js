const { pool } = require('../config/database');

class Transaction {
    // Create new transaction
    static async create(transactionData) {
        const { userId, reference, amount, status, metadata } = transactionData;
        
        const [result] = await pool.query(
            `INSERT INTO transactions (user_id, reference, amount, status, metadata) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, reference, amount, status || 'pending', JSON.stringify(metadata || {})]
        );
        
        return result.insertId;
    }

    // Find transaction by reference
    static async findByReference(reference) {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE reference = ?',
            [reference]
        );
        return transactions[0];
    }

    // Find transactions by user ID
    static async findByUserId(userId) {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return transactions;
    }

    // Find transaction by ID
    static async findById(id) {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [id]
        );
        return transactions[0];
    }

    // Update transaction status
    static async updateStatus(reference, status) {
        const [result] = await pool.query(
            `UPDATE transactions 
             SET status = ?, paid_at = CASE WHEN ? = 'completed' THEN NOW() ELSE paid_at END 
             WHERE reference = ?`,
            [status, status, reference]
        );
        return result.affectedRows > 0;
    }

    // Get user's latest successful transaction
    static async getLatestSuccessful(userId) {
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
            [userId, 'completed']
        );
        return transactions[0];
    }

    // Check if user has paid
    static async hasUserPaid(userId) {
        const [result] = await pool.query(
            'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND status = ?',
            [userId, 'completed']
        );
        return result[0].count > 0;
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
            query += ' WHERE user_id = ?';
            params.push(userId);
        }

        const [stats] = await pool.query(query, params);
        return stats[0];
    }

    // Get transactions by date range
    static async getByDateRange(startDate, endDate, userId = null) {
        let query = 'SELECT * FROM transactions WHERE created_at BETWEEN ? AND ?';
        const params = [startDate, endDate];

        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY created_at DESC';

        const [transactions] = await pool.query(query, params);
        return transactions;
    }
}

module.exports = Transaction;