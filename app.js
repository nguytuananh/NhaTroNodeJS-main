var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var controller = require(__dirname + "/apps/controllers");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/static", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
    res.locals.username = req.cookies.username || null;
    res.locals.role = req.cookies.role || null;
    next();
});

app.use(controller);

app.set("views", __dirname + "/apps/views");
app.set("view engine", "ejs");

var server = app.listen(3000, function () {
    console.log("Server is running http://localhost:3000");
});