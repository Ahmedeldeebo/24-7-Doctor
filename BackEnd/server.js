const express = require("express");
const port = 5000;
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const userRouter = require("./routers/user");
const  testAPIRouter = require("./routes/testAPI");
mongoose
  .connect(process.env.mongoUri)
  .then(() => console.log("Mongooes is connected"))
  .catch((err) => {
    console.log(err);
  });

app.use(express.json());
app.use("/testAPI", testAPIRouter);
app.use("/api/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
