const express = require("express");
const app = express();
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

// Connection To DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected To MongoDB..."))
  .catch((err) => console.log("Connection Failed!", err));

// Apply Middlewares
app.use(express.json());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("combined"));
}

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));

// Running The Server
const port = process.env.PORT;
app.listen(port, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${port}`
  )
);
