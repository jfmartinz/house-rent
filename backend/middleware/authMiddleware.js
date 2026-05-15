const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      return res
        .status(401)
        .send({ message: "Authorization header missing", success: false });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Token missing", success: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res
          .status(401)
          .send({ message: "Token is not valid", success: false });
      }

      req.user = {
        id: decode.id,
        role: decode.role,
      };
      next();
    });
  } catch (error) {
    console.error(error); // Handle or log the error appropriately
    res.status(500).send({ message: "Internal server error", success: false });
  }
};
