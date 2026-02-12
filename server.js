const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------
// MIDDLEWARES
// -------------------------
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));


// -------------------------
// MONGODB CONNECTION
// -------------------------
mongoose
  .connect("mongodb+srv://yashshende205_db_user:ZRt43MK1o0pb4doq@cluster1.c2eapo6.mongodb.net/")
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// -------------------------
// SCHEMAS
// -------------------------
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  emergencyContact: String,
  emergencyPhone: String,
  notifications: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  subject: String,
  message: String,
  newsletter: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  name: String,
  location: String,
  latitude: Number,
  longitude: Number,
  description: String,
  contact: String,
  date: { type: Date, default: Date.now },
});

const locationSchema = new mongoose.Schema({
  userId: String,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now },
});

const sosSchema = new mongoose.Schema({
  number: String,
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now },
});

const selfDefenceSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  training: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

// -------------------------
// MODELS
// -------------------------
const User = mongoose.model("User", userSchema);
const Contact = mongoose.model("Contact", contactSchema);
const Report = mongoose.model("Report", reportSchema);
const Location = mongoose.model("Location", locationSchema);
const SOS = mongoose.model("SOS", sosSchema);
const SelfDefence = mongoose.model("SelfDefence", selfDefenceSchema);

// -------------------------
// TWILIO CONFIG (loaded from environment variables)
// Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are set in your .env or environment
// e.g. TWILIO_ACCOUNT_SID=AC... TWILIO_AUTH_TOKEN=... TWILIO_NUMBER=+1...
// -------------------------
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_NUMBER = process.env.TWILIO_NUMBER || "+14067095986";

// -------------------------
// AUTH ROUTES
// -------------------------


// -------------------------
// CONTACT FORM
// -------------------------
app.post("/contact", async (req, res) => {
  try {
    await Contact.create(req.body);
    res.json({ message: "Message sent successfully!" });
  } catch {
    res.status(500).json({ message: "Failed to send message!" });
  }
});


// -------------------------
// SELF DEFENCE FORM
// -------------------------
app.post("/self-defence", async (req, res) => {
  try {
    await SelfDefence.create(req.body);
    res.json({ message: "Self defence request submitted!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit request" });
  }
});

// -------------------------
// EMERGENCY REPORT
// -------------------------
app.post("/report", async (req, res) => {
  try {
    await Report.create(req.body);
    res.json({ message: "Emergency alert sent!" });
  } catch {
    res.status(500).json({ message: "Emergency alert failed!" });
  }
});

// -------------------------
// LIVE LOCATION
// -------------------------
app.post("/api/location", async (req, res) => {
  try {
    await Location.create(req.body);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/api/locations", async (req, res) => {
  const locations = await Location.find().sort({ timestamp: -1 });
  res.json(locations);
});

// Return count of distinct users who have sent locations within the last N minutes (default 10)
app.get('/api/live-count', async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes || '10', 10);
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const users = await Location.distinct('userId', { timestamp: { $gte: since } });
    res.json({ count: users.length, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ count: 0 });
  }
});

// -------------------------
// SOS CONTACT & SMS
// -------------------------
app.post("/save-sos", async (req, res) => {
  try {
    await SOS.create({ number: req.body.number, latitude: req.body.latitude, longitude: req.body.longitude });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/send-sos", async (req, res) => {
  try {
    const { number, latitude, longitude, name } = req.body;
    const sender = name || 'USER';

    let body = `🚨 SOS ALERT from ${sender}! Immediate help needed!`;

    if (latitude && longitude) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      body += `\nLocation: ${mapUrl}`;
      body += `\nCoords: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    await client.messages.create({
      body,
      from: TWILIO_NUMBER,
      to: number,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Twilio error:', {
      status: err && err.status,
      code: err && err.code,
      message: err && err.message,
      moreInfo: err && err.moreInfo,
    });
    res.status(500).json({ success: false, error: err && err.message });
  }
});

// -------------------------
// ADMIN PANEL
// -------------------------
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/admin-login.html"));
});

app.get("/admin/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/admin-dashboard.html"));
});

app.get("/admin/api/data", async (req, res) => {
  try {
    const users = await User.find();
    const contacts = await Contact.find();
    const reports = await Report.find();
    const locations = await Location.find().sort({ timestamp: -1 });
    const sos = await SOS.find();
    const selfDefence = await SelfDefence.find().sort({ createdAt: -1 });

    // ⚠️ ONLY ONE RESPONSE
    res.json({
      users,
      contacts,
      reports,
      locations,
      sos,
      selfDefence
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin data fetch failed" });
  }
});


app.get("/admin/logout", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/admin-logout.html"));
});

// Serve chatbot.js explicitly
app.get('/chatbot.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chatbot.js'));
});

// -------------------------
// GENERATIVE LANGUAGE PROXY
// -------------------------
app.post('/api/generate', async (req, res) => {
  try {
    const prompt = req.body.prompt || '';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Generative API error:', response.status, text);
      return res.status(502).json({ error: 'Generative API error' });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text });
  } catch (err) {
    console.error('Error proxying generate:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// -------------------------
// START SERVER
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

});

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, emergencyContact, emergencyPhone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists!" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      emergencyContact,
      emergencyPhone
    });

    await newUser.save();
    res.status(201).json({ message: "✅ Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "❌ Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "❌ Invalid email or password" });

    // Send user data (without password)
    const { password: _, ...userData } = user._doc;
    res.json({ message: `✅ Logged in as ${email}`, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user profile (example)
app.get("/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Signup
app.post("/api/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if(existingUser) return res.json({ success: false, message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({ firstName, lastName, email, password: hashedPassword });
  await newUser.save();
  res.json({ success: true, message: "Account created successfully" });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if(!user) return res.json({ success: false, message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) return res.json({ success: false, message: "Incorrect password" });

  res.json({ success: true, user });
});




