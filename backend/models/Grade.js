const { pool } = require('../config/database');

class Grade {
    // Create grade record
    static async create(gradeData) {
        const { userId, grades, meanGrade, totalPoints, subjectCount } = gradeData;
        
        const [result] = await pool.query(
            `INSERT INTO grades (user_id, grades_data, mean_grade, total_points, subject_count) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, JSON.stringify(grades), meanGrade, totalPoints, subjectCount]
        );
        
        return result.insertId;
    }

    // Find grades by user ID
    static async findByUserId(userId) {
        const [grades] = await pool.query(
            'SELECT * FROM grades WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return grades;
    }

    // Find latest grades by user ID
    static async findLatestByUserId(userId) {
        const [grades] = await pool.query(
            'SELECT * FROM grades WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        return grades[0];
    }

    // Find grade by ID
    static async findById(id) {
        const [grades] = await pool.query(
            'SELECT * FROM grades WHERE id = ?',
            [id]
        );
        return grades[0];
    }

    // Update grade
    static async update(id, updates) {
        const { grades, meanGrade, totalPoints, subjectCount } = updates;
        
        const [result] = await pool.query(
            `UPDATE grades 
             SET grades_data = ?, mean_grade = ?, total_points = ?, subject_count = ?
             WHERE id = ?`,
            [JSON.stringify(grades), meanGrade, totalPoints, subjectCount, id]
        );

        return result.affectedRows > 0;
    }

    // Delete grade
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM grades WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get average grades stats
    static async getUserStats(userId) {
        const [stats] = await pool.query(
            `SELECT 
                AVG(total_points) as avg_points,
                COUNT(*) as total_attempts,
                MAX(total_points) as best_points,
                MIN(total_points) as worst_points
             FROM grades 
             WHERE user_id = ?`,
            [userId]
        );
        return stats[0];
    }
}

module.exports = Grade;