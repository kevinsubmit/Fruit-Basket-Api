
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can access this route' });
    }
    next(); 
  };
  
 export default checkAdmin;
  