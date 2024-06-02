const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");

// Define CORS options
const corsOptions = {
  origin: "https://website-79fc5fea.hjm.zca.mybluehost.me",
};

// Use CORS middleware with custom options
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static("public"));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/properties", listingRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);

/* ROOT ROUTE */
app.get("/", (req, res) => {
  res.send("<h1>Hello</h1>");
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URL, {
    dbName: "idabo_homes",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((err) => console.log(`${err} did not connect`));

module.exports = app;
