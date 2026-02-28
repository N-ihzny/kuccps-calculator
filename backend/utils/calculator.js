class Calculator {
    constructor() {
        this.gradePoints = {
            'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
            'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3,
            'D-': 2, 'E': 1
        };
    }

    calculateTotalPoints(grades) {
        let total = 0;
        for (const grade of Object.values(grades)) {
            if (grade && grade !== '') {
                total += this.gradePoints[grade] || 0;
            }
        }
        return total;
    }

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
        const clusterAverage = clusterCount > 0 ? (clusterTotal / clusterCount) : 0;
        const totalAverage = totalPoints / 7;

        return ((clusterAverage * 48) + (totalAverage * 36)) / 84;
    }

    meetsRequirements(grades, requirements) {
        if (!requirements || requirements.length === 0) return true;
        
        for (const req of requirements) {
            const grade = grades[req.subject_code];
            if (!grade) return false;
            
            const gradePoints = this.gradePoints[grade] || 0;
            const requiredPoints = this.gradePoints[req.minimum_grade] || 0;
            
            if (gradePoints < requiredPoints) return false;
        }
        return true;
    }

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

    calculateRecommendationScore(clusterPoints, cutoffPoints, demandLevel = 50) {
        const pointsDiff = clusterPoints - (cutoffPoints || 0);
        const demandFactor = (100 - demandLevel) / 100;
        return (pointsDiff * 10) + (demandFactor * 5);
    }

    getBestSubjects(grades, count = 7) {
        const subjects = this.getSubjectBreakdown(grades);
        return subjects.slice(0, count);
    }
}

module.exports = Calculator;
