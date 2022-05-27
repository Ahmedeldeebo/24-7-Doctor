const express = require("express");
const port = 5000;
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const PatientAuthRouter = require("./routers/PatientAuth");
const PhamacyAuthRouter = require("./routers/PharmacyAuth");
const DoctorAuthRouter = require("./routers/DoctorAuth");
const user = require("./routers/user");
const cors = require("cors");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  authorization,
} = require("./routers/verifyToken");
const User = require("./models/Patient");
const Pharmacy = require("./models/Pharmacy");
const { aggregate } = require("./models/Patient");

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
app.use("/pharmacy", PhamacyAuthRouter);
app.use("/users", user);
app.use(cors({ origin: "*", credentials: true }));
app.use(cookieParser());
// app.use((req, res, next) => {
//   console.log(req.url);
//   if (
//     req.url === "/profile-setting" ||
//     req.url == "/signin" ||
//     req.url === "/signuptest" ||
//     req.url === "/signup"
//   ) {
//     console.log("test");
//     return next();
//   } else return verifyToken(req, res, next);
// });

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/signup", (req, res, next) => {
  res.render("signUp.ejs", { errorMessage: "" });
});

app.get("/signin", (req, res) => {
  res.render("signIn.ejs", { errorMessage: "" });
});
app.get("/signin-Doctor", (req, res) => {
  res.render("./Doc/signInDoc.ejs", { errorMessage: "" });
});
app.get("/signin-Pharmacy", (req, res) => {
  res.render("./Pharmacy/signInPhar.ejs", { errorMessage: "" });
});

app.get("/profile", (req, res) => {
  res.render("./Patient/Profile.ejs");
});
app.get("/doctors", (req, res) => {
  res.render("doctors.ejs");
});
app.get("/booking", (req, res) => {
  res.render("./Patient/booking.ejs");
});
app.get("/team", (req, res) => {
  res.render("team.ejs");
});
app.get("/Doctorreg", (req, res) => {
  res.render("./Doc/DocSignup.ejs", { errorMessage: "" });
});
app.get("/Pharmacyreg", (req, res) => {
  res.render("./Pharmacy/PharmacySignUp.ejs", { errorMessage: "" });
});
app.get("/doctorview", async (req, res) => {
  res.render("doctorview.ejs", { users: users });
});
app.get("/signuptest", (req, res) => {
  res.render("signUptest");
});
app.get("/home", authorization, (req, res) => {
  res.render("./Patient/Patienthome.ejs");
});
// app.get("/ManageAppointments", (req, res) => {
//   res.render("./Doc/DocMangApp.ejs");
// });
app.get("/PublicTicket", (req, res) => {
  res.render("PublicTicket.ejs");
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
