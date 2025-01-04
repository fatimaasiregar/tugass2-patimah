import express from "express";
import pool from "./db.js";

const app = express();

app.use(express.json());

// ===== MOVIE ===== //

// GET all movies
app.get("/movie", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movie");
    res.status(200).json(result.rows); // Mengembalikan semua film sebagai JSON
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data movie." });
  }
});

// POST a new movie
app.post("/movie", async (req, res) => {
  const { title, genre, sinopsis, language } = req.body;

  try {
    // Validasi input
    if (!title || !genre || !sinopsis || !language) {
      return res.status(400).json({ error: "Semua field harus diisi." });
    }

    // Cek apakah judul sudah ada
    const checkTitle = await pool.query("SELECT * FROM movie WHERE title = $1", [title]);
    if (checkTitle.rows.length > 0) {
      return res.status(400).json({ error: "Title movie tersebut sudah ada." });
    }

    // Tambahkan film ke database
    const result = await pool.query(
      "INSERT INTO movie (title, genre, sinopsis, language) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, genre, sinopsis, language]
    );

    res.status(201).json({ message: "Movie berhasil ditambahkan.", movie: result.rows[0] });
  } catch (err) {
    console.error("Error adding movie:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menambahkan movie." });
  }
});

// PUT to update a movie by ID
app.put("/movie/:id", async (req, res) => {
  const { id } = req.params;
  const { title, genre, sinopsis, language } = req.body;

  try {
    // Validasi input
    if (!title || !genre || !sinopsis || !language) {
      return res.status(400).json({ error: "Semua field harus diisi." });
    }

    // Perbarui data film berdasarkan ID
    const result = await pool.query(
      "UPDATE movie SET title = $1, genre = $2, sinopsis = $3, language = $4 WHERE id = $5 RETURNING *",
      [title, genre, sinopsis, language, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Movie dengan ID tersebut tidak ditemukan." });
    }

    res.status(200).json({ message: "Movie berhasil diperbarui.", movie: result.rows[0] });
  } catch (err) {
    console.error("Error updating movie:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat memperbarui movie." });
  }
});

// DELETE a movie by ID
app.delete("/movie/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Hapus film berdasarkan ID
    const result = await pool.query("DELETE FROM movie WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Movie dengan ID tersebut tidak ditemukan." });
    }

    res.status(200).json({ message: `Movie dengan ID ${id} berhasil dihapus.` });
  } catch (err) {
    console.error("Error deleting movie:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus movie." });
  }
});
// ===== REGISTER =====
app.post("/register", async (req, res) => {
  const { name, username, password } = req.body;

  try {
    // Validasi input
    if (!name || !username || !password) {
      return res.status(400).json({ error: "Semua field harus diisi." });
    }

    // Cek apakah username sudah terdaftar
    const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Username sudah digunakan." });
    }

    // Simpan user ke database
    const newUser = await pool.query(
      "INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING *",
      [name, username, password]
    );

    res.status(201).json({ message: "Registrasi berhasil.", user: newUser.rows[0] });
  } catch (err) {
    console.error("Error saat registrasi:", err);
    res.status(500).json({ error: "Terjadi kesalahan server." });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validasi input
    if (!username || !password) {
      return res.status(400).json({ error: "Username dan password harus diisi." });
    }

    // Cek apakah username ada di database
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Username atau password salah." });
    }

    // Verifikasi password
    if (user.rows[0].password !== password) {
      return res.status(400).json({ error: "Username atau password salah." });
    }

    res.status(200).json({ message: "Login berhasil.", user: { id: user.rows[0].id, name: user.rows[0].name, username: user.rows[0].username } });
  } catch (err) {
    console.error("Error saat login:", err);
    res.status(500).json({ error: "Terjadi kesalahan server." });
  }
});
  
// Start the server
app.listen(3000, () => {
  console.log("Server Berjalan di Port 3000");
});