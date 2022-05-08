const express = require("express");
const port = 5000;
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const ejs = require("ejs");
const PatientAuthRouter = require("./routers/PatientAuth");
const DoctorAuthRouter = require("./routers/DoctorAuth");
const user = require("./routers/user");
const cors = require("cors");
const User = require("./models/Patient");

dotenv.config();

mongoose
  .connect(process.env.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Mongooes is connected"))
  .catch((err) => {
    console.log(err);
  });
// view eingin setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// server static files form /public
let publicpaht = path.join(__dirname, "/public");
app.use(express.static(publicpaht));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/patient", PatientAuthRouter);
app.use("/doctor", DoctorAuthRouter);
app.use("/users", user);
app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/signup", (req, res, next) => {
  res.render("signUp.ejs");
});

app.get("/signin", (req, res) => {
  res.render("signIn.ejs", { errorMessage: "" });
});

app.get("/profile", (req, res) => {
  res.render("Profile.ejs");
});
app.get("/doctors", (req, res) => {
  res.render("doctors.ejs");
});
app.get("/appointment", (req, res) => {
  res.render("appointment.ejs");
});
app.get("/patient/login", (req, res) => {
  res.render("test.ejs");
});
app.get("/doctorview", (req, res) => {
  res.render("doctorview.ejs");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
