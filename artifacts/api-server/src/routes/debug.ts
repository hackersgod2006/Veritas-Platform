import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

// GET /api/debug/db — lists tables and shows connection info
router.get("/debug/db", async (req, res) => {
  try {
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((r: any) => r.table_name);

    // Try a simple query on users table
    let usersStatus = "unknown";
    try {
      await pool.query("SELECT COUNT(*) FROM users");
      usersStatus = "ok";
    } catch (e: any) {
      usersStatus = e.message;
    }

    res.json({
      connected: true,
      tables,
      usersTable: usersStatus,
      nodeEnv: process.env.NODE_ENV,
      tlsReject: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
    });
  } catch (err: any) {
    res.status(500).json({
      connected: false,
      error: err?.message,
      cause: err?.cause?.message ?? null,
    });
  }
});

export default router;
