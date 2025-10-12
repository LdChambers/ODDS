import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// In-memory users for dev (will be replaced by DB queries)
const devUsers = [
  {
    id: 1,
    email: 'admin@odds.com',
    password: '$2b$10$rIbQzQJ5vYXh6kMxqXJ0JOqFqZ9kF.PqW.lX5Z5Z5Z5Z5Z5Z5Z5Z5', // 'password'
    fk_schoolID: 1,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    hasGlobalPermissions: 1
  },
  {
    id: 2,
    email: 'instructor@school1.com',
    password: '$2b$10$rIbQzQJ5vYXh6kMxqXJ0JOqFqZ9kF.PqW.lX5Z5Z5Z5Z5Z5Z5Z5Z5', // 'password'
    fk_schoolID: 1,
    firstName: 'John',
    lastName: 'Instructor',
    role: 'instructor',
    hasGlobalPermissions: 0
  },
  {
    id: 3,
    email: 'instructor@school2.com',
    password: '$2b$10$rIbQzQJ5vYXh6kMxqXJ0JOqFqZ9kF.PqW.lX5Z5Z5Z5Z5Z5Z5Z5Z5', // 'password'
    fk_schoolID: 2,
    firstName: 'Jane',
    lastName: 'Teacher',
    role: 'instructor',
    hasGlobalPermissions: 0
  }
];

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Try to find user in DB first
    let user = await prisma.user.findFirst({
      where: { 
        email: email.toLowerCase(),
        deletedAt: null
      },
      include: {
        school: true
      }
    });

    // Fallback to in-memory dev users
    if (!user) {
      const devUser = devUsers.find(u => u.email === email);
      if (!devUser) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // For dev users, use simple password comparison
      if (password !== 'password') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      user = devUser;
    } else {
      // For DB users, verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.userID || user.id,
        email: user.email,
        role: user.role,
        fk_schoolID: user.fk_schoolID,
        hasGlobalPermissions: user.hasGlobalPermissions
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.userID || user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fk_schoolID: user.fk_schoolID,
        hasGlobalPermissions: user.hasGlobalPermissions,
        schoolName: user.school?.name || null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/forgot-password (stub)
router.post('/forgot-password', (req, res) => {
  res.json({ message: 'Password reset email sent (stub)' });
});

export default router;

