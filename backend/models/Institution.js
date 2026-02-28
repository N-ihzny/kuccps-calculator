const { pool } = require('../config/database');

class Institution {
    static async create(institutionData) {
        const { name, code, type, location } = institutionData;
        
        const result = await pool.query(
            `INSERT INTO institutions (name, code, type, location) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, code, type, location]
        );
        
        return result.rows[0].id;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM institutions WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByType(type) {
        const result = await pool.query(
            'SELECT * FROM institutions WHERE type = $1 ORDER BY name ASC',
            [type]
        );
        return result.rows;
    }

    static async findAll(filters = {}) {
        let query = 'SELECT * FROM institutions WHERE 1=1';
        const params = [];
        let paramIndex = 1;

        if (filters.type) {
            query += ` AND type = $${paramIndex}`;
            params.push(filters.type);
            paramIndex++;
        }

        if (filters.category) {
            query += ` AND category = $${paramIndex}`;
            params.push(filters.category);
            paramIndex++;
        }

        if (filters.county) {
            query += ` AND county = $${paramIndex}`;
            params.push(filters.county);
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

    static async search(searchQuery) {
        const searchTerm = `%${searchQuery}%`;
        const result = await pool.query(
            'SELECT * FROM institutions WHERE name ILIKE $1 OR code ILIKE $2 ORDER BY name ASC LIMIT 20',
            [searchTerm, searchTerm]
        );
        return result.rows;
    }

    static async update(id, updates) {
        const allowedFields = ['name', 'code', 'type', 'location', 'category', 'website', 'description', 'contact_email', 'contact_phone'];
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

    static async delete(id) {
        const result = await pool.query('DELETE FROM institutions WHERE id = $1', [id]);
        return result.rowCount > 0;
    }

    static async getStats(id) {
        const result = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1) as total_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'degree') as degree_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'diploma') as diploma_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'certificate') as certificate_courses,
                (SELECT COUNT(*) FROM courses WHERE institution_id = $1 AND program_type = 'kmtc') as kmtc_courses`,
            [id]
        );
        return result.rows[0];
    }

    static async getInstitutionsByCounty() {
        const result = await pool.query(
            `SELECT 
                county,
                COUNT(*) as total,
                SUM(CASE WHEN type = 'university' THEN 1 ELSE 0 END) as universities,
                SUM(CASE WHEN type = 'kmtc' THEN 1 ELSE 0 END) as kmtc_campuses,
                SUM(CASE WHEN type = 'ttc' THEN 1 ELSE 0 END) as teacher_colleges,
                SUM(CASE WHEN type = 'tvet' THEN 1 ELSE 0 END) as tvet_institutions
             FROM institutions
             WHERE county IS NOT NULL
             GROUP BY county
             ORDER BY county`
        );
        return result.rows;
    }
}

module.exports = Institution;
