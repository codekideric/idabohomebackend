const router = require("express").Router();
const nodemailer = require("nodemailer");
const Booking = require("../models/Booking");
require('dotenv').config();

// Configure the transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

/* CREATE BOOKING */
router.post("/create", async (req, res) => {
  try {
    const { customerId, customerName, customerPhone, customerEmail, hostId, listingId, startDate, endDate, totalPrice } = req.body;

    // Check for overlapping bookings
    const existingBooking = await Booking.findOne({
      listingId,
      $or: [
        { startDate: { $lte: endDate, $gte: startDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
      ],
    });

    if (existingBooking && new Date(existingBooking.endDate) >= new Date()) {
      // If there's an existing booking and it's not yet over, return an error response
      return res.status(400).json({ 
        message: "The listing is already booked for the selected dates.",
        existingBooking: {
          startDate: existingBooking.startDate,
          endDate: existingBooking.endDate
        },
        alreadyBooked: true
      });
    }

    // If there's no overlapping booking, create a new booking
    const newBooking = new Booking({ customerId, customerName, customerPhone, customerEmail, hostId, listingId, startDate, endDate, totalPrice });
    await newBooking.save();

    // Send email confirmation to the customer
    const mailOptions = {
      from: process.env.EMAIL,
      to: 'idabomovingandstorage@gmail.com',
      subject: 'New Booking Confirmation',
      text: `Booking Details:
        - Customer Name: ${customerName}
        - Customer Phone: ${customerPhone}
        - Customer Email: ${customerEmail}
        - Start Date: ${startDate}
        - End Date: ${endDate}
        - Total Price: ${totalPrice}`,
    };

    await transporter.sendMail(mailOptions);

    // Send success response
    res.status(200).json({ alreadyBooked: false });
  } catch (err) {
    console.log(err);
    // If there's any error, send error response
    res.status(400).json({ message: "Fail to create a new Booking!", error: err.message });
  }
});

module.exports = router;
