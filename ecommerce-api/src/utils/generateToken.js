const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id, expiresIn = '24h') => {
    return jwt.sign(
        { id,role },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

// Generate refresh token
const generateRefreshToken = (id, expiresIn = '7d') => {
    return jwt.sign(
        { id ,role},
        process.env.JWT_REFRESH_SECRET,
        { expiresIn }
    );
};

// Verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request
    next();
  } catch (err) {
    console.error('Invalid token:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};


// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
};