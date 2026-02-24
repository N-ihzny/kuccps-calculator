// backend/controllers/courseController.js
const { pool } = require('../config/database');

class CourseController {
    // Get all courses with filters
    async getCourses(req, res) {
        try {
            const { programType, institution, search, limit = 50, offset = 0 } = req.query;

            let query = `
                SELECT c.*, i.name as institution_name, i.type as institution_type
                FROM courses c
                JOIN institutions i ON c.institution_id = i.id
                WHERE 1=1
            `;
            const params = [];

            if (programType) {
                query += ' AND c.program_type = ?';
                params.push(programType);
            }

            if (institution) {
                query += ' AND i.name LIKE ?';
                params.push(`%${institution}%`);
            }

            if (search) {
                query += ' AND (c.name LIKE ? OR c.code LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY c.name ASC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), parseInt(offset));

            const [courses] = await pool.query(query, params);

            // Get total count
            let countQuery = 'SELECT COUNT(*) as total FROM courses c JOIN institutions i ON c.institution_id = i.id WHERE 1=1';
            const countParams = [];
            
            if (programType) {
                countQuery += ' AND c.program_type = ?';
                countParams.push(programType);
            }
            
            const [countResult] = await pool.query(countQuery, countParams);

            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses,
                pagination: {
                    total: countResult[0].total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });

        } catch (error) {
            console.error('Error fetching courses:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching courses',
                error: error.message
            });
        }
    }

    // Get course by ID
    async getCourseById(req, res) {
        try {
            const { id } = req.params;

            const [courses] = await pool.query(
                `SELECT c.*, i.name as institution_name, i.type as institution_type, i.location
                 FROM courses c
                 JOIN institutions i ON c.institution_id = i.id
                 WHERE c.id = ?`,
                [id]
            );

            if (courses.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            // Get requirements for this course
            const [requirements] = await pool.query(
                'SELECT * FROM course_requirements WHERE course_id = ?',
                [id]
            );

            const course = courses[0];
            course.requirements = requirements;

            res.status(200).json({
                success: true,
                data: course
            });

        } catch (error) {
            console.error('Error fetching course:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching course',
                error: error.message
            });
        }
    }

    // Get courses by program type
    async getCoursesByProgram(req, res) {
        try {
            const { programType } = req.params;

            const [courses] = await pool.query(
                `SELECT c.*, i.name as institution_name
                 FROM courses c
                 JOIN institutions i ON c.institution_id = i.id
                 WHERE c.program_type = ?
                 ORDER BY c.name ASC`,
                [programType]
            );

            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });

        } catch (error) {
            console.error('Error fetching courses by program:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching courses',
                error: error.message
            });
        }
    }

    // Search courses
    async searchCourses(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide search query'
                });
            }

            const [courses] = await pool.query(
                `SELECT c.*, i.name as institution_name
                 FROM courses c
                 JOIN institutions i ON c.institution_id = i.id
                 WHERE c.name LIKE ? OR c.code LIKE ? OR i.name LIKE ?
                 ORDER BY c.name ASC
                 LIMIT 20`,
                [`%${q}%`, `%${q}%`, `%${q}%`]
            );

            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });

        } catch (error) {
            console.error('Error searching courses:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching courses',
                error: error.message
            });
        }
    }
}

module.exports = new CourseController();