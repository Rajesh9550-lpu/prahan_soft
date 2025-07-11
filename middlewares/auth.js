import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.sendStatus(403);
    next();
  };
};