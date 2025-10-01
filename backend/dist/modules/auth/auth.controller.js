"use strict";
/**
 * Authentication Controller
 * Handles user authentication, registration, and session management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../../index");
const zod_1 = require("zod");
const crypto_1 = __importDefault(require("crypto"));
// Validation schemas
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number and special character'),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    middleName: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().regex(/^\+234[0-9]{10}$/, 'Invalid Nigerian phone number'),
    role: zod_1.z.enum(['HOSPITAL_OWNER', 'PATIENT']).optional(),
    stateOfOrigin: zod_1.z.string().optional(),
    localGovernment: zod_1.z.string().optional(),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string(),
    password: zod_1.z.string().min(8),
});
// Generate JWT token
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: '7d' });
};
// Generate random token
const generateRandomToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.authController = {
    // User login
    async login(req, res, next) {
        try {
            const { email, password } = loginSchema.parse(req.body);
            // Find user
            const user = await index_1.prisma.user.findUnique({
                where: { email },
                include: {
                    ownedHospitals: {
                        include: {
                            hospital: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    employments: {
                        include: {
                            hospital: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }
            // Check if account is active
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated. Please contact support.',
                });
            }
            // Check if account is locked
            if (user.lockoutUntil && user.lockoutUntil > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is temporarily locked. Please try again later.',
                });
            }
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                // Increment failed login attempts
                await index_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        loginAttempts: user.loginAttempts + 1,
                        // Lock account after 5 failed attempts
                        lockoutUntil: user.loginAttempts >= 4
                            ? new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
                            : null,
                    },
                });
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                });
            }
            // Reset login attempts and update last login
            await index_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    loginAttempts: 0,
                    lockoutUntil: null,
                    lastLogin: new Date(),
                },
            });
            // Generate token
            const token = generateToken(user.id);
            // Create session
            await index_1.prisma.session.create({
                data: {
                    sessionToken: token,
                    userId: user.id,
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                },
            });
            // Prepare user data
            const userData = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                phoneNumber: user.phoneNumber,
                avatar: user.avatar,
                isEmailVerified: user.isEmailVerified,
                hospitalId: user.ownedHospitals[0]?.hospital.id || user.employments[0]?.hospital.id,
                hospitalName: user.ownedHospitals[0]?.hospital.name || user.employments[0]?.hospital.name,
            };
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    token,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    // User registration
    async register(req, res, next) {
        try {
            const validatedData = registerSchema.parse(req.body);
            // Check if user exists
            const existingUser = await index_1.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: validatedData.email },
                        { phoneNumber: validatedData.phoneNumber },
                    ],
                },
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: existingUser.email === validatedData.email
                        ? 'Email already registered'
                        : 'Phone number already registered',
                });
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
            // Generate email verification token
            const emailVerificationToken = generateRandomToken();
            // Create user
            const user = await index_1.prisma.user.create({
                data: {
                    email: validatedData.email,
                    firstName: validatedData.firstName,
                    lastName: validatedData.lastName,
                    middleName: validatedData.middleName,
                    phoneNumber: validatedData.phoneNumber,
                    password: hashedPassword,
                    username: validatedData.email.split('@')[0] + Math.floor(Math.random() * 1000),
                    role: validatedData.role || 'PATIENT',
                    nationality: 'Nigerian',
                    country: 'Nigeria',
                    stateOfOrigin: validatedData.stateOfOrigin,
                    localGovernment: validatedData.localGovernment,
                    emailVerificationToken,
                    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });
            // TODO: Send verification email
            console.log('Verification token:', emailVerificationToken);
            // Generate token
            const token = generateToken(user.id);
            res.status(201).json({
                success: true,
                message: 'Registration successful. Please verify your email.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                    },
                    token,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    // Verify email
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.params;
            const user = await index_1.prisma.user.findFirst({
                where: {
                    emailVerificationToken: token,
                    emailVerificationExpires: {
                        gt: new Date(),
                    },
                },
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired verification token',
                });
            }
            await index_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    isEmailVerified: true,
                    emailVerificationToken: null,
                    emailVerificationExpires: null,
                },
            });
            res.json({
                success: true,
                message: 'Email verified successfully',
            });
        }
        catch (error) {
            next(error);
        }
    },
    // Forgot password
    async forgotPassword(req, res, next) {
        try {
            const { email } = forgotPasswordSchema.parse(req.body);
            const user = await index_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                // Don't reveal if email exists
                return res.json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent',
                });
            }
            // Generate reset token
            const resetToken = generateRandomToken();
            await index_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    passwordResetToken: resetToken,
                    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                },
            });
            // TODO: Send password reset email
            console.log('Password reset token:', resetToken);
            res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent',
            });
        }
        catch (error) {
            next(error);
        }
    },
    // Reset password
    async resetPassword(req, res, next) {
        try {
            const { token, password } = resetPasswordSchema.parse(req.body);
            const user = await index_1.prisma.user.findFirst({
                where: {
                    passwordResetToken: token,
                    passwordResetExpires: {
                        gt: new Date(),
                    },
                },
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token',
                });
            }
            // Hash new password
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            await index_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    passwordResetToken: null,
                    passwordResetExpires: null,
                },
            });
            res.json({
                success: true,
                message: 'Password reset successful',
            });
        }
        catch (error) {
            next(error);
        }
    },
    // Logout
    async logout(req, res, next) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (token) {
                // Delete session
                await index_1.prisma.session.deleteMany({
                    where: { sessionToken: token },
                });
            }
            res.json({
                success: true,
                message: 'Logout successful',
            });
        }
        catch (error) {
            next(error);
        }
    },
    // Get current user
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.userId;
            const user = await index_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    phoneNumber: true,
                    role: true,
                    avatar: true,
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    nationality: true,
                    stateOfOrigin: true,
                    localGovernment: true,
                    addressLine1: true,
                    addressLine2: true,
                    city: true,
                    state: true,
                    country: true,
                    ownedHospitals: {
                        include: {
                            hospital: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                    employments: {
                        include: {
                            hospital: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
    // Update profile
    async updateProfile(req, res, next) {
        try {
            const userId = req.userId;
            const updates = req.body;
            // Remove sensitive fields from updates
            delete updates.password;
            delete updates.email;
            delete updates.role;
            delete updates.isActive;
            const user = await index_1.prisma.user.update({
                where: { id: userId },
                data: updates,
            });
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map