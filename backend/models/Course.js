const { pool } = require('../config/database');

class Course {
    // Create new course
    static async create(courseData) {
        const { institutionId, name, code, programType, durationYears, description, requirements, cutoffPoints } = courseData;
        
        const [result] = await pool.query(
            `INSERT INTO courses (institution_id, name, code, program_type, duration_years, description, requirements, cutoff_points) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [institutionId, name, code, programType, durationYears, description, JSON.stringify(requirements || {}), cutoffPoints]
        );
        
        return result.insertId;
    }

    // Find course by ID
    static async findById(id) {
        const [courses] = await pool.query(
            `SELECT c.*, i.name as institution_name, i.type as institution_type 
             FROM courses c
             JOIN institutions i ON c.institution_id = i.id
             WHERE c.id = ?`,
            [id]
        );
        return courses[0];
    }

    // Find courses by program type
    static async findByProgramType(programType, limit = 100, offset = 0) {
        const [courses] = await pool.query(
            `SELECT c.*, i.name as institution_name 
             FROM courses c
             JOIN institutions i ON c.institution_id = i.id
             WHERE c.program_type = ?
             ORDER BY c.name ASC
             LIMIT ? OFFSET ?`,
            [programType, limit, offset]
        );
        return courses;
    }

    // Find courses by institution
    static async findByInstitution(institutionId, programType = null) {
        let query = `
            SELECT * FROM courses 
            WHERE institution_id = ?
        `;
        const params = [institutionId];

        if (programType) {
            query += ' AND program_type = ?';
            params.push(programType);
        }

        query += ' ORDER BY name ASC';

        const [courses] = await pool.query(query, params);
        return courses;
    }

    // Search courses
    static async search(query, limit = 20) {
        const searchTerm = `%${query}%`;
        const [courses] = await pool.query(
            `SELECT c.*, i.name as institution_name 
             FROM courses c
             JOIN institutions i ON c.institution_id = i.id
             WHERE c.name LIKE ? OR c.code LIKE ? OR i.name LIKE ?
             ORDER BY c.name ASC
             LIMIT ?`,
            [searchTerm, searchTerm, searchTerm, limit]
        );
        return courses;
    }

    // Get all courses with filters
    static async findAll(filters = {}) {
        let query = `
            SELECT c.*, i.name as institution_name 
            FROM courses c
            JOIN institutions i ON c.institution_id = i.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.programType) {
            query += ' AND c.program_type = ?';
            params.push(filters.programType);
        }

        if (filters.institutionId) {
            query += ' AND c.institution_id = ?';
            params.push(filters.institutionId);
        }

        if (filters.minCutoff) {
            query += ' AND c.cutoff_points >= ?';
            params.push(filters.minCutoff);
        }

        if (filters.maxCutoff) {
            query += ' AND c.cutoff_points <= ?';
            params.push(filters.maxCutoff);
        }

        query += ' ORDER BY c.name ASC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        if (filters.offset) {
            query += ' OFFSET ?';
            params.push(parseInt(filters.offset));
        }

        const [courses] = await pool.query(query, params);
        return courses;
    }

    // Get course requirements
    static async getRequirements(courseId) {
        const [requirements] = await pool.query(
            'SELECT * FROM course_requirements WHERE course_id = ?',
            [courseId]
        );
        return requirements;
    }

    // Update course
    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'duration_years', 'description', 'requirements', 'cutoff_points'];
        const sets = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                sets.push(`${key} = ?`);
                values.push(key === 'requirements' ? JSON.stringify(value) : value);
            }
        }

        if (sets.length === 0) return false;

        values.push(id);
        const [result] = await pool.query(
            `UPDATE courses SET ${sets.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete course
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get course count
    static async getCount(programType = null) {
        let query = 'SELECT COUNT(*) as count FROM courses';
        const params = [];

        if (programType) {
            query += ' WHERE program_type = ?';
            params.push(programType);
        }

        const [result] = await pool.query(query, params);
        return result[0].count;
    }
}

module.exports = Course;