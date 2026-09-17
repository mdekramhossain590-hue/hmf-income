import os

with open('server.ts', 'r') as f:
    content = f.read()

mysql_code = """
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'test',
  port: Number(process.env.MYSQL_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initMySQL() {
  try {
    const connection = await pool.getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        user_photo VARCHAR(255),
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("MySQL Database Initialized & Tables Created.");
    connection.release();
  } catch (error) {
    console.error("MySQL Initialization Error:", error);
  }
}
initMySQL();

"""

if 'import mysql from' not in content:
    content = content.replace('dotenv.config();', 'dotenv.config();\n' + mysql_code)

    # Also add the API routes
    api_routes = """
  app.get("/api/mysql-reviews", async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM app_reviews ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/mysql-reviews", async (req, res) => {
    try {
      const { user_name, user_photo, rating, comment } = req.body;
      if (!user_name || !comment) return res.status(400).json({ error: "Missing fields" });
      
      const [result] = await pool.execute(
        'INSERT INTO app_reviews (user_name, user_photo, rating, comment) VALUES (?, ?, ?, ?)',
        [user_name, user_photo || '', Number(rating) || 5, comment]
      );
      res.json({ success: true, id: (result as any).insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to post review" });
    }
  });
"""
    content = content.replace('app.get("/api/download-zip"', api_routes + '\n  app.get("/api/download-zip"')

    with open('server.ts', 'w') as f:
        f.write(content)
    print("Patched server.ts")
else:
    print("Already patched")
