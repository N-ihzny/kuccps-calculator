// Register new user
async register(req, res) {
    try {
        const { fullName, email, phone, password, indexNumber, examYear, schoolName, county } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a proper VARCHAR ID (USR + timestamp + random)
        const userId = 'USR' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();

        // Create user with the generated ID
        const userData = {
            id: userId,  // Add the ID here
            fullName,
            email,
            phone,
            password: hashedPassword,
            indexNumber,
            examYear,
            schoolName,
            county
        };

        // Update User.create method to accept id
        await User.create(userData);

        // Get created user
        const user = await User.findById(userId);

        // Generate token
        const token = jwtHelper.generateToken({ id: user.id, email: user.email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user, token }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
}
