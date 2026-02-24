const { pool } = require('../config/database');

class Institution {
    // Create new institution
    static async create(institutionData) {
        const { name, code, type, location } = institutionData;
        
        const [result] = await pool.query(
            `INSERT INTO institutions (name, code, type, location) 
             VALUES (?, ?, ?, ?)`,
            [name, code, type, location]
        );
        
        return result.insertId;
    }

    // Find institution by ID
    static async findById(id) {
        const [institutions] = await pool.query(
            'SELECT * FROM institutions WHERE id = ?',
            [id]
        );
        return institutions[0];
    }

    // Find institutions by type
    static async findByType(type) {
        const [institutions] = await pool.query(
            'SELECT * FROM institutions WHERE type = ? ORDER BY name ASC',
            [type]
        );
        return institutions;
    }

    // Find all institutions with filters
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM institutions WHERE 1=1';
        const params = [];

        if (filters.type) {
            query += ' AND type = ?';
            params.push(filters.type);
        }

        query += ' ORDER BY name ASC';

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        if (filters.offset) {
            query += ' OFFSET ?';
            params.push(parseInt(filters.offset));
        }

        const [institutions] = await pool.query(query, params);
        return institutions;
    }

    // Search institutions
    static async search(query) {
        const searchTerm = `%${query}%`;
        const [institutions] = await pool.query(
            'SELECT * FROM institutions WHERE name LIKE ? OR code LIKE ? ORDER BY name ASC LIMIT 20',
            [searchTerm, searchTerm]
        );
        return institutions;
    }

    // Update institution
    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'type', 'location'];
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
            `UPDATE institutions SET ${sets.join(', ')} WHERE id = ?`,
            values
        );

        return result.affectedRows > 0;
    }

    // Delete institution
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM institutions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get institution stats
    static async getStats(id) {
        const [stats] = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM courses WHERE institution_id = ?) as total_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = ? AND program_type = 'degree') as degree_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = ? AND program_type = 'diploma') as diploma_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = ? AND program_type = 'certificate') as certificate_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = ? AND program_type = 'kmtc') as kmtc_courses
             FROM dual`,
            [id, id, id, id, id]
        );
        return stats[0];
    }
}

module.exports = Institution;