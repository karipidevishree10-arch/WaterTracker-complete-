const express = require("express");
const router = express.Router();
const db = require("../db");

// CREATE - Add a new water log
router.post("/", (req, res) => {
  const { glasses, time, date } = req.body;

  if (!glasses || !time || !date) {
    return res.status(400).json({
      message: "Please fill all fields."
    });
  }

  const stmt = db.prepare(
    "INSERT INTO water_logs (glasses, time, date) VALUES (?, ?, ?)"
  );

  const result = stmt.run(glasses, time, date);

  res.status(201).json({
    message: "Water log added successfully!",
    id: result.lastInsertRowid
  });
});

// READ - Get all water logs
router.get("/", (req, res) => {
  const stmt = db.prepare(
    "SELECT * FROM water_logs ORDER BY id DESC"
  );

  const logs = stmt.all();

  res.json(logs);
});

// UPDATE - Update a water log
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { glasses, time, date } = req.body;

  const stmt = db.prepare(
    `UPDATE water_logs
     SET glasses=?, time=?, date=?
     WHERE id=?`
  );

  const result = stmt.run(glasses, time, date, id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Water log not found."
    });
  }

  res.json({
    message: "Water log updated successfully!"
  });
});

// DELETE - Delete a water log
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(
    "DELETE FROM water_logs WHERE id=?"
  );

  const result = stmt.run(id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Water log not found."
    });
  }

  res.json({
    message: "Water log deleted successfully!"
  });
});

module.exports = router;