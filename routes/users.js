var express = require("express");
var router = express.Router();
var passport = require("../auth");

var jwt = require("jsonwebtoken");
var jwtSecret = process.env.JWT_SECRET || "hello";

router.post("/login", function (req, res, next) {
  if (req.body.username == "cysun" && req.body.password == "abcd")
    res.json({
      token: jwt.sign(
        {
          username: "cysun",
          isAdmin: false,
        },
        jwtSecret
      ),
    });
  else
    res.status(401).json({
      message: "Authentication failed",
    });
});

router.get(
  "/",
  passport.authenticate("jwt", {
    session: false,
    failWithError: true,
  }),
  async function (req, res, next) {
    console.log(req.user);
    let user = await req.app.locals.db.collection("users");
    res.json(await user.find().toArray());
  }
);

module.exports = router;
