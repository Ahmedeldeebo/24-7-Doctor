const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.cookie;
  console.log(req.headers.cookie);
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(401).json("Token is not valid!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not authenticated!");
  }
};

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.headers.cookie === req.headers.cookie) {
      next();
    } else {
      res.status(403).json("You are no alowed to do that !");
    }
  });
};
// const cookieJwtAuth = (req, res, next) => {
//   const token = req.cookies.accessToken;

//   try {
//     // The important part
//     const user = jwt.verify(token, process.env.JWT_SEC);
//     req.user = user;
//     next();
//   } catch (err) {
//     res.clearCookie("token");
//     return res.redirect("/");
//   }
// };
const authorization = (req, res, next) => {
  let token = req.headers.cookie;
  token = token.slice(12, token.length);
  console.log(token);
  if (!token) {
    console.log(token);
    return res.sendStatus(403).redirect("/");
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SEC);
    console.log(data);
    res.locals.user = data;
    // req.user._id = data.id;
    // req.userRole = data.role;
    return next();
  } catch (err) {
    console.log(err);
    return res.sendStatus(403).redirect("/");
  }
};
module.exports = { verifyToken, verifyTokenAndAuthorization, authorization };
