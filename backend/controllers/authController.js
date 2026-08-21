const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
        return res.status(400).json({ code: 400, status: false, message: 'Email already exists', data: null });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await UserModel.create(name, email, hashedPassword);

    res.status(201).json({
        code: 201,
        status: true,
        message: 'User registered successfully',
        data: result
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
        return res.status(401).json({ code: 401, status: false, message: 'Invalid credentials', data: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ code: 401, status: false, message: 'Invalid credentials', data: null });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET, // Fails fast if undefined
        { expiresIn: '1d' }
    );

    res.status(200).json({
        code: 200,
        status: true,
        message: 'Login successful',
        data: { token }
    });
};
