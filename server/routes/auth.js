import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { requireAuth } from '../middleware/auth.js';

export function createAuthRouter(prisma) {
  const router = Router();

  // POST /api/auth/register
  router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already in use' });

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({ data: { email, password: hashed } });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user.id, email: user.email } });
    } catch {
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // POST /api/auth/forgot-password
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: 'No account found with that email' });

      const resetToken = randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await prisma.user.update({
        where: { email },
        data: { resetToken, resetExpiry },
      });

      res.json({ resetToken });
    } catch {
      res.status(500).json({ error: 'Failed to generate reset token' });
    }
  });

  // POST /api/auth/reset-password
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });

      const user = await prisma.user.findUnique({ where: { resetToken: token } });
      if (!user) return res.status(400).json({ error: 'Invalid reset token' });
      if (user.resetExpiry < new Date()) return res.status(400).json({ error: 'Reset token has expired' });

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, resetToken: null, resetExpiry: null },
      });

      res.json({ message: 'Password reset successful' });
    } catch {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  });

  // POST /api/auth/change-password
  router.post('/change-password', requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
      }

      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });

      res.json({ message: 'Password changed successfully' });
    } catch {
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  return router;
}
