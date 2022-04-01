const express = require("express");
const port = 3000;
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const userRouter = require("./routers/user");

mongoose
  .connect(process.env.mongoUri)
  .then(() => console.log("Mongooes is connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
