const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth.routes");
const appRoutes = require("./routes/app.routes");
const deviceRoutes = require("./routes/device.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/", appRoutes);
app.use("/", deviceRoutes);
app.use("/", notificationRoutes);

module.exports = { app };