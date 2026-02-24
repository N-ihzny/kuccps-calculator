const { pool } = require('../config/database');

class Subject {
    // Get all subjects
    static async getAll() {
        const [subjects] = await pool.query(
            'SELECT * FROM subjects ORDER BY name ASC'
        );
        return subjects;
    }

    // Get subjects by group
    static async getByGroup(group) {
        const [subjects] = await pool.query(
            'SELECT * FROM subjects WHERE subject_group = ? ORDER BY name ASC',
            [group]
        );
        return subjects;
    }

    // Get subject by code
    static async findByCode(code) {
        const [subjects] = await pool.query(
            'SELECT * FROM subjects WHERE code = ?',
            [code]
        );
        return subjects[0];
    }

    // Get subject by ID
    static async findById(id) {
        const [subjects] = await pool.query(
            'SELECT * FROM subjects WHERE id = ?',
            [id]
        );
        return subjects[0];
    }

    // Create new subject
    static async create(subjectData) {
        const { name, code, group } = subjectData;
        
        const [result] = await pool.query(
            `INSERT INTO subjects (name, code, subject_group) 
             VALUES (?, ?, ?)`,
            [name, code, group]
        );
        
        return result.insertId;
    }

    // Update subject
    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'subject_group'];
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
            `UPDATE subjects SET ${sets.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete subject
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM subjects WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get subjects by course
    static async getByCourse(courseId) {
        const [subjects] = await pool.query(
            `SELECT s.*, cr.minimum_grade, cr.weight 
             FROM subjects s
             JOIN course_requirements cr ON s.id = cr.subject_id
             WHERE cr.course_id = ?
             ORDER BY cr.weight DESC, s.name ASC`,
            [courseId]
        );
        return subjects;
    }

    // Get subject groups
    static async getGroups() {
        const [groups] = await pool.query(
            'SELECT DISTINCT subject_group FROM subjects ORDER BY subject_group'
        );
        return groups.map(g => g.subject_group);
    }

    // Get grade points mapping
    static getGradePoints() {
        return {
            'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
            'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
            'D-': 2, 'E': 1
        };
    }
}

module.exports = Subject;