const { pool } = require('../config/database');
const Institution = require('../models/Institution');
const Course = require('../models/Course');

class InstitutionController {
    // Get all institutions
    async getAllInstitutions(req, res) {
        try {
            const { type, limit = 50, offset = 0 } = req.query;

            const institutions = await Institution.findAll({ type, limit, offset });

            res.status(200).json({
                success: true,
                count: institutions.length,
                data: institutions
            });

        } catch (error) {
            console.error('Error fetching institutions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching institutions',
                error: error.message
            });
        }
    }

    // Get institution by ID
    async getInstitutionById(req, res) {
        try {
            const { id } = req.params;

            const institution = await Institution.findById(id);

            if (!institution) {
                return res.status(404).json({
                    success: false,
                    message: 'Institution not found'
                });
            }

            res.status(200).json({
                success: true,
                data: institution
            });

        } catch (error) {
            console.error('Error fetching institution:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching institution',
                error: error.message
            });
        }
    }

    // Get institutions by type
    async getInstitutionsByType(req, res) {
        try {
            const { type } = req.params;

            const institutions = await Institution.findByType(type);

            res.status(200).json({
                success: true,
                count: institutions.length,
                data: institutions
            });

        } catch (error) {
            console.error('Error fetching institutions by type:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching institutions',
                error: error.message
            });
        }
    }

    // Get institution courses
    async getInstitutionCourses(req, res) {
        try {
            const { id } = req.params;
            const { programType } = req.query;

            const courses = await Course.findByInstitution(id, programType);

            res.status(200).json({
                success: true,
                count: courses.length,
                data: courses
            });

        } catch (error) {
            console.error('Error fetching institution courses:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching institution courses',
                error: error.message
            });
        }
    }

    // Search institutions
    async searchInstitutions(req, res) {
        try {
            const { q } = req.query;

            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide search query'
                });
            }

            const institutions = await Institution.search(q);

            res.status(200).json({
                success: true,
                count: institutions.length,
                data: institutions
            });

        } catch (error) {
            console.error('Error searching institutions:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching institutions',
                error: error.message
            });
        }
    }

    // Get institution stats
    async getInstitutionStats(req, res) {
        try {
            const { id } = req.params;

            const stats = await Institution.getStats(id);

            res.status(200).json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error fetching institution stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching institution stats',
                error: error.message
            });
        }
    }

    // Get all institution types (for filtering)
    async getInstitutionTypes(req, res) {
        try {
            const types = [
                'university',
                'kmtc',
                'ttc',
                'tvet',
                'national_polytechnic'
            ];

            res.status(200).json({
                success: true,
                data: types
            });

        } catch (error) {
            console.error('Error fetching institution types:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching institution types',
                error: error.message
            });
        }
    }
}

module.exports = new InstitutionController();