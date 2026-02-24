const { pool } = require('../config/database');
const Grade = require('../models/Grade');
const Calculator = require('../utils/calculator');

class GradeController {
    // Save user grades
    async saveGrades(req, res) {
        try {
            const { userId, grades } = req.body;

            if (!userId || !grades) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide userId and grades'
                });
            }

            const calculator = new Calculator();
            const totalPoints = calculator.calculateTotalPoints(grades);
            const meanGrade = calculator.calculateMeanGrade(totalPoints);
            const subjectCount = Object.values(grades).filter(g => g && g !== '').length;

            const gradeId = await Grade.create({
                userId,
                grades,
                meanGrade,
                totalPoints,
                subjectCount
            });

            res.status(201).json({
                success: true,
                message: 'Grades saved successfully',
                data: {
                    id: gradeId,
                    meanGrade,
                    totalPoints,
                    subjectCount
                }
            });

        } catch (error) {
            console.error('Error saving grades:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving grades',
                error: error.message
            });
        }
    }

    // Get user grades
    async getUserGrades(req, res) {
        try {
            const { userId } = req.params;

            const grades = await Grade.findByUserId(userId);

            res.status(200).json({
                success: true,
                data: grades
            });

        } catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching grades',
                error: error.message
            });
        }
    }

    // Get latest user grades
    async getLatestGrades(req, res) {
        try {
            const { userId } = req.params;

            const grade = await Grade.findLatestByUserId(userId);

            res.status(200).json({
                success: true,
                data: grade
            });

        } catch (error) {
            console.error('Error fetching latest grades:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching latest grades',
                error: error.message
            });
        }
    }

    // Update grades
    async updateGrades(req, res) {
        try {
            const { id } = req.params;
            const { grades } = req.body;

            const calculator = new Calculator();
            const totalPoints = calculator.calculateTotalPoints(grades);
            const meanGrade = calculator.calculateMeanGrade(totalPoints);
            const subjectCount = Object.values(grades).filter(g => g && g !== '').length;

            const updated = await Grade.update(id, {
                grades,
                meanGrade,
                totalPoints,
                subjectCount
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Grade record not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Grades updated successfully'
            });

        } catch (error) {
            console.error('Error updating grades:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating grades',
                error: error.message
            });
        }
    }

    // Delete grades
    async deleteGrades(req, res) {
        try {
            const { id } = req.params;

            const deleted = await Grade.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Grade record not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Grades deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting grades:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting grades',
                error: error.message
            });
        }
    }

    // Validate grades
    async validateGrades(req, res) {
        try {
            const { grades } = req.body;

            const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E'];
            const invalidSubjects = [];

            for (const [subject, grade] of Object.entries(grades)) {
                if (grade && grade !== '' && !validGrades.includes(grade)) {
                    invalidSubjects.push(subject);
                }
            }

            res.status(200).json({
                success: true,
                data: {
                    isValid: invalidSubjects.length === 0,
                    invalidSubjects
                }
            });

        } catch (error) {
            console.error('Error validating grades:', error);
            res.status(500).json({
                success: false,
                message: 'Error validating grades',
                error: error.message
            });
        }
    }
}

module.exports = new GradeController();