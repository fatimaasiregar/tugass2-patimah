import express from "express";
import pool from "./db.js";

const app = express();

app.use(express.json());

// ===== MOVIE ===== //

// GET all movies
app.get("/movie", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movie");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST a new movie
app.post("/movie", async (req, res) => {
  const { title, genre, sinopsis, language } = req.body;

  try {
    const checkTitle = await pool.query(
      "SELECT * FROM movie WHERE title = $1",
      [title]
    );
    if (checkTitle.rows.length > 0) {
      return res.status(400).send("Title movie tersebut sudah ada.");
    }

    const result = await pool.query(
      "INSERT INTO movie (title, genre, sinopsis, language) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, genre, sinopsis, language]
    );
    res.status(201).send("Movie berhasil ditambahkan.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT to update a movie by ID
app.put("/movie/:id", async (req, res) => {
  const { id } = req.params;
  const { title, genre, sinopsis, language } = req.body;
  try {
    const result = await pool.query(
      "UPDATE movie SET title = $1, genre = $2, sinopsis = $3, language = $4 WHERE id = $5 RETURNING *",
      [title, genre, sinopsis, language, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a movie by ID
app.delete("/movie/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM movie WHERE id = $1", [id]);
    res.status(200).send(`Movie with ID ${id} deleted.`);
  } catch (err) {
    res.status(500).json(err);
  }
});
// ===== REGISTER =====
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      // Validasi input
      if (!name || !email || !password) {
        return res.status(400).send("Semua field harus diisi.");
      }
  
      // Cek apakah email sudah terdaftar
      const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).send("Email sudah digunakan.");
      }
  
      // Simpan user ke database
      const newUser = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
        [name, email, password]
      );
  
      res.status(201).send("Registrasi berhasil.");
    } catch (err) {
      console.error("Error saat registrasi:", err);
      res.status(500).send("Terjadi kesalahan server.");
    }
  });
  
  // ===== LOGIN =====
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Validasi input
      if (!email || !password) {
        return res.status(400).send("Email dan password harus diisi.");
      }
  
      // Cek apakah email ada di database
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) {
        return res.status(400).send("Email atau password salah.");
      }
  
      // Verifikasi password
      if (user.rows[0].password !== password) {
        return res.status(400).send("Email atau password salah.");
      }
  
      res.status(200).send("Login berhasil.");
    } catch (err) {
      console.error("Error saat login:", err);
      res.status(500).send("Terjadi kesalahan server.");
    }
  });
  
// Start the server
app.listen(3000, () => {
  console.log("Server Berjalan di Port 3000");
});

