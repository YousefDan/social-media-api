const jwt = require("jsonwebtoken");

// verify token
function verifyToken(req, res, next) {
  const authToken = req.headers.token;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = data;
      next();
    } catch (error) {
      return res.status(401).send("invalid token");
    }
  } else {
    return res.status(403).send("no token provided");
  }
}

// verify toke and authentication
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user._id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(401).send("you are not allowed");
    }
  });
}

// verify toke and admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(401).send("only admin allowed!");
    }
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
