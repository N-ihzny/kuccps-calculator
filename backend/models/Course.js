const { pool } = require('../config/database');

class Course {
    // Create new course
    static async create(courseData) {
        const { institutionId, name, code, programType, durationYears, description, requirements, cutoffPoints } = courseData;
        
        const result = await pool.query(
            `INSERT INTO courses (institution_id, name, code, program_type, duration_years, description, requirements, cutoff_points) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
            [institutionId, name, code, programType, durationYears, description, JSON.stringify(requirements || {}), cutoffPoints]
        );
        
        return result.rows[0].id;
    }

    // Find course by ID
    static async findById(id) {
        const result = await pool.query(
            `SELECT c.*, i.name as institution_name, i.type as institution_type 
             FROM courses c
             JOIN institutions i ON c.institution_id = i.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Find courses by program type
    static async findByProgramType(programType, limit = 100, offset = 0) {
        const result = await pool.query(
            `SELECT c.*, i.name as institution_name 
             FROM courses c
             JOIN institutions i ON c.institution_id = i.id
             WHERE c.program_type = $1
             ORDER BY c.name ASC
             LIMIT $2 OFFSET $3`,
            [programType, limit, offset]
        );
        return result.rows;
    }

    // Find courses by institution
    static async findByInstitution(institutionId, programType = null) {
        let query = `
            SELECT * FROM courses 
            WHERE institution_id = $1
        `;
        const params = [institutionId];
        let paramIndex = 2;

        if (programType) {
            query += ` AND program_type = $${paramIndex}`;
            params.push(programType);
            paramIndex++;
        }

        query += ' ORDER BY name ASC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    // Search courses
    static async search(searchQuery, limit = 20) {
        const searchTerm = `%${searchQuery}%`;
        const result = await pool.query(
            `SELECT c.*, i.name as institution_name 
             FROM courses c
             JOIN institutions i ON c.institution_id = i.id
             WHERE c.name ILIKE $1 OR c.code ILIKE $2 OR i.name ILIKE $3
             ORDER BY c.name ASC
             LIMIT $4`,
            [searchTerm, searchTerm, searchTerm, limit]
        );
        return result.rows;
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
        let paramIndex = 1;

        if (filters.programType) {
            query += ` AND c.program_type = $${paramIndex}`;
            params.push(filters.programType);
            paramIndex++;
        }

        if (filters.institutionId) {
            query += ` AND c.institution_id = $${paramIndex}`;
            params.push(filters.institutionId);
            paramIndex++;
        }

        if (filters.minCutoff) {
            query += ` AND c.cutoff_points >= $${paramIndex}`;
            params.push(filters.minCutoff);
            paramIndex++;
        }

        if (filters.maxCutoff) {
            query += ` AND c.cutoff_points <= $${paramIndex}`;
            params.push(filters.maxCutoff);
            paramIndex++;
        }

        query += ' ORDER BY c.name ASC';

        if (filters.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(parseInt(filters.limit));
            paramIndex++;
        }

        if (filters.offset) {
            query += ` OFFSET $${paramIndex}`;
            params.push(parseInt(filters.offset));
        }

        const result = await pool.query(query, params);
        return result.rows;
    }

    // Get course requirements
    static async getRequirements(courseId) {
        const result = await pool.query(
            'SELECT * FROM course_requirements WHERE course_id = $1',
            [courseId]
        );
        return result.rows;
    }

    // Update course
    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'duration_years', 'description', 'requirements', 'cutoff_points'];
        const sets = [];
        const values = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                sets.push(`${key} = $${paramIndex}`);
                values.push(key === 'requirements' ? JSON.stringify(value) : value);
                paramIndex++;
            }
        }

        if (sets.length === 0) return false;

        values.push(id);
        const result = await pool.query(
            `UPDATE courses SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        return result.rowCount > 0;
    }

    // Delete course
    static async delete(id) {
        const result = await pool.query('DELETE FROM courses WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    // Get course count
    static async getCount(programType = null) {
        let query = 'SELECT COUNT(*) as count FROM courses';
        const params = [];

        if (programType) {
            query += ' WHERE program_type = $1';
            params.push(programType);
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count);
    }
}

module.exports = Course;
