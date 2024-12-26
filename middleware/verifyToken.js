import jwt from 'jsonwebtoken';

function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
          if (!token) {
            return res
              .status(401)
              .json({ error: "Authorization token is missing." });
          }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Assign decoded payload to req.user
        req.user = decoded;
        // Call next() to invoke the next middleware function
        next();
    } catch (error) {
        // If any errors, send back a 401 status and an 'Invalid token.' error message
        console.error("JWT verification error:", error);
        res.status(401).json({ error: 'Invalid authorization token.' });
    }
}

export default verifyToken;