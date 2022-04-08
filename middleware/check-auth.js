const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const authMiddleware = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  const authorizationHeader = req.headers.authorization; // later change this to token.user

  if (!authorizationHeader) {
    const error = new HttpError("You are not authorized.", 403);
    return next(error);
  }

  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    const error = new HttpError(
      "Please provide a token with your request.",
      403
    );
    return next(error);
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    const error = new HttpError("Token not valid", 403);
  }

  req.userData = { userId: decodedToken.userId, email: decodedToken.email };

  next();
};

module.exports = authMiddleware;
