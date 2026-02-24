class Calculator {
    constructor() {
        this.gradePoints = {
            'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
            'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
            'D-': 2, 'E': 1
        };
    }

    // Calculate total points from grades
    calculateTotalPoints(grades) {
        let total = 0;
        for (const grade of Object.values(grades)) {
            if (grade && grade !== '') {
                total += this.gradePoints[grade] || 0;
            }
        }
        return total;
    }

    // Calculate mean grade from points
    calculateMeanGrade(totalPoints, subjectCount = 7) {
        const mean = totalPoints / subjectCount;
        
        if (mean >= 12) return 'A';
        if (mean >= 11) return 'A-';
        if (mean >= 10) return 'B+';
        if (mean >= 9) return 'B';
        if (mean >= 8) return 'B-';
        if (mean >= 7) return 'C+';
        if (mean >= 6) return 'C';
        if (mean >= 5) return 'C-';
        if (mean >= 4) return 'D+';
        if (mean >= 3) return 'D';
        if (mean >= 2) return 'D-';
        return 'E';
    }

    // Calculate cluster points
    calculateClusterPoints(grades, clusterSubjects = []) {
        let clusterTotal = 0;
        let clusterCount = 0;

        for (const subject of clusterSubjects) {
            if (grades[subject]) {
                clusterTotal += this.gradePoints[grades[subject]] || 0;
                clusterCount++;
            }
        }

        const totalPoints = this.calculateTotalPoints(grades);
        
        // KUCCPS cluster points formula (simplified)
        // (Cluster Subjects Total / 48) * 48 + (Total Points / 84) * 36
        const clusterAverage = clusterCount > 0 ? (clusterTotal / clusterCount) : 0;
        const totalAverage = totalPoints / 7;

        return ((clusterAverage * 48) + (totalAverage * 36)) / 84;
    }

    // Check if grades meet course requirements
    meetsRequirements(grades, requirements) {
        for (const req of requirements) {
            const grade = grades[req.subject];
            if (!grade) return false;
            
            const gradePoints = this.gradePoints[grade] || 0;
            const requiredPoints = this.gradePoints[req.minimum_grade] || 0;
            
            if (gradePoints < requiredPoints) return false;
        }
        return true;
    }

    // Get subject breakdown
    getSubjectBreakdown(grades, clusterSubjects = []) {
        const breakdown = [];

        for (const [subject, grade] of Object.entries(grades)) {
            if (grade && grade !== '') {
                breakdown.push({
                    subject,
                    grade,
                    points: this.gradePoints[grade] || 0,
                    inCluster: clusterSubjects.includes(subject)
                });
            }
        }

        return breakdown.sort((a, b) => b.points - a.points);
    }

    // Calculate recommendation score
    calculateRecommendationScore(clusterPoints, cutoffPoints, demandLevel = 50) {
        const pointsDiff = clusterPoints - (cutoffPoints || 0);
        const demandFactor = (100 - demandLevel) / 100; // Lower demand = higher score
        
        return (pointsDiff * 10) + (demandFactor * 5);
    }

    // Get best subjects
    getBestSubjects(grades, count = 7) {
        const subjects = this.getSubjectBreakdown(grades);
        return subjects.slice(0, count);
    }
}

module.exports = Calculator;