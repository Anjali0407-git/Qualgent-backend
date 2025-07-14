const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'avsvvstdytdy';

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ msg: 'No token, auth denied' });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded.userId;
    next();
  } catch {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
module.exports = auth;
