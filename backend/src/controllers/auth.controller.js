const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { logActivity } = require('../utils/activity');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required.' });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already in use.' });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    await logActivity({ action: 'USER_REGISTERED', entityType: 'USER', entityId: user.id, userId: user.id });

    const { password: _, ...safe } = user;
    res.status(201).json({ token: signToken(user), user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(401).json({ error: 'Account deactivated. Contact admin.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });
    await logActivity({ action: 'USER_LOGGED_IN', entityType: 'USER', entityId: user.id, userId: user.id });

    const { password: _, ...safe } = user;
    res.json({ token: signToken(user), user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed.' });
  }
};

exports.logout = async (req, res) => {
  // Stateless JWT — client must delete the token.
  res.json({ message: 'Logged out successfully.' });
};
