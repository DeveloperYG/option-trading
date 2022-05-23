
var jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
     
      try {
        const decoded = jwt.verify(token, "ijrg][09djhf89f%&v]");
        req.userData = decoded;
        console.log(decoded);
        next();
        
      } catch (err) {
          console.log(err)
        return res.status(400).send("Invalid Token");
      }
  
    } else {
      res.status(400).json("You are not authenticated!");
    }
};