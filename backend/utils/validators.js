const validators = {
    // Validate email
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate Kenyan phone number
    phone: (phone) => {
        if (!phone) return false;
        const cleaned = phone.replace(/\s/g, '');
        const re = /^(?:(?:\+|00)254|0)[17]\d{8}$/;
        return re.test(cleaned);
    },

    // Validate KCSE index number
    indexNumber: (index) => {
        if (!index) return false;
        const re = /^\d{4}\/\d{5,6}$/;
        return re.test(index);
    },

    // Validate KCSE grade
    grade: (grade) => {
        const validGrades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', ''];
        return validGrades.includes(grade);
    },

    // Validate password strength
    password: (password) => {
        return password && password.length >= 6;
    },

    // Validate full name
    fullName: (name) => {
        return name && name.length >= 3;
    },

    // Validate year (between 2000 and current year)
    year: (year) => {
        const currentYear = new Date().getFullYear();
        return year && year >= 2000 && year <= currentYear;
    },

    // Validate amount
    amount: (amount) => {
        return amount && !isNaN(amount) && amount > 0;
    },

    // Validate transaction reference
    transactionReference: (ref) => {
        const re = /^TXN_\d+_[A-Z0-9]+$/;
        return re.test(ref);
    },

    // Validate URL
    url: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // Validate program type
    programType: (type) => {
        const validTypes = ['degree', 'diploma', 'certificate', 'kmtc'];
        return validTypes.includes(type);
    },

    // Validate institution type
    institutionType: (type) => {
        const validTypes = ['university', 'kmtc', 'ttc', 'tvet', 'national_polytechnic'];
        return validTypes.includes(type);
    },

    // Validate pagination params
    pagination: (page, limit) => {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        return {
            valid: !isNaN(pageNum) && pageNum > 0 && !isNaN(limitNum) && limitNum > 0 && limitNum <= 100,
            page: pageNum || 1,
            limit: limitNum || 20
        };
    },

    // Validate object has required fields
    hasRequiredFields: (obj, requiredFields) => {
        const missing = [];
        for (const field of requiredFields) {
            if (!obj[field] || obj[field] === '') {
                missing.push(field);
            }
        }
        return {
            valid: missing.length === 0,
            missing
        };
    }
};

module.exports = validators;