require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const MongoClient = require("mongodb").MongoClient;
const passport = require("./auth");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

let dbHost = process.env.DB_HOST || "localhost";
let dbPort = process.env.DB_PORT || 27017;
let dbUsername = process.env.DB_USERNAME || "cysun";
let dbPassword = process.env.DB_PASSWORD || "abcd";
let dbUrl = `mongodb://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbUsername}`;

MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error("Failed to connect to database", err);
    process.exit(1);
  } else {
    app.locals.mongo = client;
    app.locals.db = client.db(dbUsername);
    console.log("Connected to database");
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use( passport.initialize() );
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

async function shutdown(callback) {
  await app.locals.mongo.close();
  console.log("Disconnected from database");
  if (typeof callback === "function") callback();
  else process.exit(0);
}

process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);

process.once("SIGUSR2", () => {
  shutdown(() => process.kill(process.pid, "SIGUSR2"));
});

module.exports = app;
