const { pool } = require('../config/database');

class Institution {
    // Create new institution
    static async create(institutionData) {
        const { name, code, type, location } = institutionData;
        
        const result = await pool.query(
            `INSERT INTO institutions (name, code, type, location) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, code, type, location]
        );
        
        return result.rows[0].id;
    }

    // Find institution by ID
    static async findById(id) {
        const result = await pool.query(
            'SELECT * FROM institutions WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Find institutions by type
    static async findByType(type) {
        const result = await pool.query(
            'SELECT * FROM institutions WHERE type = $1 ORDER BY name ASC',
            [type]
        );
        return result.rows;
    }

    // Find all institutions with filters
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM institutions WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.type) {
            query += ` AND type = $${paramIndex}`;
            params.push(filters.type);
            paramIndex++;
        }

        query += ' ORDER BY name ASC';

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

    // Search institutions
    static async search(searchQuery) {
        const searchTerm = `%${searchQuery}%`;
        const result = await pool.query(
            'SELECT * FROM institutions WHERE name ILIKE $1 OR code ILIKE $2 ORDER BY name ASC LIMIT 20',
            [searchTerm, searchTerm]
        );
        return result.rows;
    }

    // Update institution
    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'type', 'location'];
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
            `UPDATE institutions SET ${sets.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        return result.rowCount > 0;
    }

    // Delete institution
    static async delete(id) {
        const result = await pool.query('DELETE FROM institutions WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    // Get institution stats
    static async getStats(id) {
        const result = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1) as total_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'degree') as degree_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'diploma') as diploma_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'certificate') as certificate_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'kmtc') as kmtc_courses`
        );
        return result.rows[0];
    }
}

module.exports = Institution;
