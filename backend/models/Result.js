// backend/models/Result.js
const { pool } = require('../config/database');

class Result {
    static async create(resultData) {
        const { userId, programType, results, summary } = resultData;
        
        const [result] = await pool.query(
            `INSERT INTO results (user_id, program_type, results_data, summary) 
             VALUES (?, ?, ?, ?)`,
            [userId, programType, JSON.stringify(results), JSON.stringify(summary || {})]
        );
        
        return result.insertId;
    }

    static async findByUserId(userId) {
        const [results] = await pool.query(
            'SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return results;
    }

    static async findByUserIdAndProgram(userId, programType) {
        const [results] = await pool.query(
            'SELECT * FROM results WHERE user_id = ? AND program_type = ? ORDER BY created_at DESC',
            [userId, programType]
        );
        return results;
    }
}

module.exports = Result;