const { pool } = require('../config/database');

class Grade {
    static async create(gradeData) {
        const { userId, grades, meanGrade, totalPoints, subjectCount } = gradeData;
        
        const result = await pool.query(
            `INSERT INTO grades (user_id, grades_data, mean_grade, total_points, subject_count) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [userId, JSON.stringify(grades), meanGrade, totalPoints, subjectCount]
        );
        
        return result.rows[0].id;
    }

    static async findByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM grades WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return result.rows;
    }

    static async findLatestByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM grades WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM grades WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, updates) {
        const { grades, meanGrade, totalPoints, subjectCount } = updates;
        
        const result = await pool.query(
            `UPDATE grades 
             SET grades_data = $1, mean_grade = $2, total_points = $3, subject_count = $4
             WHERE id = $5`,
            [JSON.stringify(grades), meanGrade, totalPoints, subjectCount, id]
        );

        return result.rowCount > 0;
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM grades WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    static async getUserStats(userId) {
        const result = await pool.query(
            `SELECT 
                AVG(total_points) as avg_points,
                COUNT(*) as total_attempts,
                MAX(total_points) as best_points,
                MIN(total_points) as worst_points
             FROM grades 
             WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }
}

module.exports = Grade;
