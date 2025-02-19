require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  db.connect((err) => {
    if (err) console.error("Database connection failed:", err);
    else console.log("Connected to MySQL database");
  });
  
  module.exports = db;

  app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    // Check if the email already exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        return res.status(500).send({ error: "Database error" });
      }
      if (results.length > 0) {
        return res.status(400).send({ error: "Email already exists" });
      }
  
      // If email doesn't exist, proceed with registration
      const hashedPassword = await bcrypt.hash(password, 10);
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        (err) => {
          if (err) {
            return res.status(500).send({ error: "Error registering user" });
          }
          res.send({ message: "User registered successfully" });
        }
      );
    });
  });
  

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" }); // Send JSON error
    }

    const match = await bcrypt.compare(password, result[0].password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ user: result[0], token });
  });
});



app.get("/api/user/:id", (req, res) => {
  const userId = req.params.id;

  db.query("SELECT id, name, email FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result[0]); // Return only the logged-in user's details
  });
});


app.put("/api/user/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, userId],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      res.json({ id: userId, name, email });
    }
  );
});

app.delete("/api/user/:id", (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.json({ message: "User deleted successfully" });
  });
});



app.get("/api/users", (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, result) => {
    if (err) res.status(500).send(err);
    else res.send(result);
  });
});


app.post("/api/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
      (err) => {
        if (err) res.status(500).send(err);
        else res.send({ message: "User registered" });
      }
    );
  });

app.listen(5000, () => console.log("Server running on port 5000"));
