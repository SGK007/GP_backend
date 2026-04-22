"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
async function signup(payload) {
    const { name, email, password, role } = payload;
    // Check if user already exists
    const existingUser = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error('Email already exists');
    }
    // Hash password
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    // Create user
    const user = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role,
        },
    });
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '24h' });
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
    };
}
async function login(payload) {
    const { email, password } = payload;
    // Find user by email
    const user = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    // Compare password
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '24h' });
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
    };
}
//# sourceMappingURL=authService.js.map