const { pool } = require('../config/database');

class Subject {
    static async getAll() {
        const result = await pool.query('SELECT * FROM subjects ORDER BY name ASC');
        return result.rows;
    }

    static async getByGroup(group) {
        const result = await pool.query(
            'SELECT * FROM subjects WHERE subject_group = $1 ORDER BY name ASC',
            [group]
        );
        return result.rows;
    }

    static async findByCode(code) {
        const result = await pool.query('SELECT * FROM subjects WHERE code = $1', [code]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(subjectData) {
        const { name, code, group, isCompulsory } = subjectData;
        
        const result = await pool.query(
            `INSERT INTO subjects (name, code, subject_group, is_compulsory) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, code, group, isCompulsory || false]
        );
        
        return result.rows[0].id;
    }

    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'subject_group', 'is_compulsory'];
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
            `UPDATE subjects SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        return result.rowCount > 0;
    }

    static async delete(id) {
        const result = await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    static async getByCourse(courseId) {
        const result = await pool.query(
            `SELECT s.*, cr.minimum_grade, cr.weight 
             FROM subjects s
             JOIN course_requirements cr ON s.id = cr.subject_id
             WHERE cr.course_id = $1
             ORDER BY cr.weight DESC, s.name ASC`,
            [courseId]
        );
        return result.rows;
    }

    static async getGroups() {
        const result = await pool.query('SELECT DISTINCT subject_group FROM subjects ORDER BY subject_group');
        return result.rows.map(row => row.subject_group);
    }

    static getGradePoints() {
        return {
            'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
            'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
            'D-': 2, 'E': 1
        };
    }

    static async getCompulsory() {
        const result = await pool.query(
            'SELECT * FROM subjects WHERE is_compulsory = true ORDER BY name ASC'
        );
        return result.rows;
    }

    static async getOptional() {
        const result = await pool.query(
            'SELECT * FROM subjects WHERE is_compulsory = false ORDER BY name ASC'
        );
        return result.rows;
    }
}

module.exports = Subject;
