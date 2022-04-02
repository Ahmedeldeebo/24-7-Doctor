const express = require("express");
const port = 5000;
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt=require("bcrypt");


dotenv.config();

const userRouter = require("./routers/user");
const registerRouter = require("./routers/register");
mongoose
  .connect(process.env.mongoUri)
  .then(() => console.log("Mongooes is connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/patientRegister", registerRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
