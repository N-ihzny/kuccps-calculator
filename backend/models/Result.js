// backend/models/Result.js
const { pool } = require('../config/database');

class Result {
    static async create(resultData) {
        const { userId, programType, results, summary } = resultData;
        
        const result = await pool.query(
            `INSERT INTO results (user_id, program_type, results_data, summary) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [userId, programType, JSON.stringify(results), JSON.stringify(summary || {})]
        );
        
        return result.rows[0].id;
    }

    static async findByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM results WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    static async findByUserIdAndProgram(userId, programType) {
        const result = await pool.query(
            'SELECT * FROM results WHERE user_id = $1 AND program_type = $2 ORDER BY created_at DESC',
            [userId, programType]
        );
        return result.rows;
    }
}

module.exports = Result;
