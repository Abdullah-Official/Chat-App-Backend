const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin/admin");
const jwt = require("jsonwebtoken");
const Conversation = require("./models/conversation");
const message = require("./models/message");
const app = express();

// middlewares
app.use(express.json());

const PORT = 5000;
const MONGOURI =
  "mongodb+srv://abdullah:FLgm9NM1r5GqFfFL@cluster0.h6tai.mongodb.net/chatapp?retryWrites=true&w=majority";
const JWT_SECRET_ADMIN = "sankssfnskfnsl";
// FLgm9NM1r5GqFfFL
mongoose.connect(MONGOURI, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on("connected", () => {
  console.log("Database Connected");
});
mongoose.connection.on("error", (err) => {
  console.log("Database dropped", err);
});

// Admin SIGNIN

app.post("/adminsignin", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(422).json({ error: "Please add all FIELDS." });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ error: "Admin DOESN't exists" });
    }
    const doMatch = await bcrypt.compare(password, admin.password);
    if (doMatch) {
      const token = jwt.sign({ userId: admin._id }, JWT_SECRET_ADMIN);
      res
        .status(201)
        .json({ message: "Admin Logged INN successfully .. :)", token });
    }
    res.status(401).json({ message: "Username or Password in incorrect" });
  } catch (err) {
    console.log("Error during signup ", err);
  }
});

//  New Conversation

app.post("/newconvo", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//  Get Conversation

app.get("/getconversation/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Create Message

app.post("/createmessage", async (req, res) => {
  const newMessage = new message(req.body);
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Fetch Conversation MEssages

app.get("/fetchconversation/:conversationId", async (req, res) => {
  try {
    const messages = await message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/", (req, res) => {
  res.send("Chat APP LIVE BACKEND !!!");
});

app.listen(PORT, () => {
  console.log("Server is running ..");
});
