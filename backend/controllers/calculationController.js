const Calculator = require('../utils/calculator');
const Result = require('../models/Result');
const Course = require('../models/Course');

class CalculationController {
    constructor() {
        this.calculator = new Calculator();
    }

    // Calculate eligibility for a specific program
    async calculateEligibility(req, res) {
        try {
            const { userId, programType, grades } = req.body;

            if (!userId || !programType || !grades) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide userId, programType and grades'
                });
            }

            const courses = await Course.findByProgramType(programType);
            const totalPoints = this.calculator.calculateTotalPoints(grades);
            const meanGrade = this.calculator.calculateMeanGrade(totalPoints);

            const eligibleCourses = [];
            for (const course of courses) {
                const requirements = await Course.getRequirements(course.id);
                const meetsRequirements = this.calculator.meetsRequirements(grades, requirements);
                
                if (meetsRequirements) {
                    eligibleCourses.push({
                        ...course,
                        requirements
                    });
                }
            }

            const results = {
                summary: {
                    meanGrade,
                    totalPoints,
                    programType,
                    eligibleCount: eligibleCourses.length
                },
                courses: eligibleCourses
            };

            await Result.create({
                userId,
                programType,
                results: results,
                summary: results.summary
            });

            res.status(200).json({
                success: true,
                message: 'Eligibility calculated successfully',
                data: results
            });

        } catch (error) {
            console.error('Calculation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error calculating eligibility',
                error: error.message
            });
        }
    }

    // Calculate cluster points
    async calculateClusterPoints(req, res) {
        try {
            const { grades, clusterSubjects } = req.body;

            if (!grades || !clusterSubjects) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide grades and cluster subjects'
                });
            }

            const clusterPoints = this.calculator.calculateClusterPoints(grades, clusterSubjects);
            const totalPoints = this.calculator.calculateTotalPoints(grades);
            const meanGrade = this.calculator.calculateMeanGrade(totalPoints);

            res.status(200).json({
                success: true,
                data: {
                    clusterPoints,
                    totalPoints,
                    meanGrade,
                    breakdown: this.calculator.getSubjectBreakdown(grades, clusterSubjects)
                }
            });

        } catch (error) {
            console.error('Cluster points calculation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error calculating cluster points',
                error: error.message
            });
        }
    }

    // Compare courses
    async compareCourses(req, res) {
        try {
            const { courseIds, grades } = req.body;

            if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide course IDs to compare'
                });
            }

            const comparisons = [];
            for (const courseId of courseIds) {
                const course = await Course.findById(courseId);
                const requirements = await Course.getRequirements(courseId);
                const meetsRequirements = this.calculator.meetsRequirements(grades, requirements);
                const clusterPoints = this.calculator.calculateClusterPoints(grades, 
                    requirements.map(r => r.subject_code));

                comparisons.push({
                    course,
                    meetsRequirements,
                    clusterPoints,
                    gap: clusterPoints - (course.cut_off_points || 0)
                });
            }

            res.status(200).json({
                success: true,
                data: comparisons
            });

        } catch (error) {
            console.error('Course comparison error:', error);
            res.status(500).json({
                success: false,
                message: 'Error comparing courses',
                error: error.message
            });
        }
    }

    // Get recommendations
    async getRecommendations(req, res) {
        try {
            const { grades, limit = 10 } = req.body;

            if (!grades) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide grades'
                });
            }

            const allCourses = await Course.findAll();
            const scoredCourses = [];

            for (const course of allCourses) {
                const requirements = await Course.getRequirements(course.id);
                const meetsRequirements = this.calculator.meetsRequirements(grades, requirements);
                
                if (meetsRequirements) {
                    const clusterPoints = this.calculator.calculateClusterPoints(grades,
                        requirements.map(r => r.subject_code));
                    const score = this.calculator.calculateRecommendationScore(
                        clusterPoints,
                        course.cut_off_points || 0,
                        course.demand_level || 50
                    );

                    scoredCourses.push({
                        ...course,
                        clusterPoints,
                        score
                    });
                }
            }

            const recommendations = scoredCourses
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            res.status(200).json({
                success: true,
                data: recommendations
            });

        } catch (error) {
            console.error('Recommendation error:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating recommendations',
                error: error.message
            });
        }
    }
}

module.exports = new CalculationController();
