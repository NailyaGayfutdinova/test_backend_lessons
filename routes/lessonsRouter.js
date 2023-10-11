const express = require("express");
const pool = require("../db/database");

const lessonsRouter = express.Router();

lessonsRouter.post("/lessons", async (req, res) => {
  const { teacherIds, title, days, firstDate, lessonsCount, lastDate } = req.body;

  if (!teacherIds || !title || !days || !firstDate || !(lessonsCount || lastDate)) {
    return res.status(400).json({ message: 'input data are incomplete' });
  }

  if (lessonsCount && lastDate) {
    return res.status(400).json({ message: 'lessonsCount and lastDate parameters are mutually exclusive' });
  }

  // teacherIds validation
  if (!Array.isArray(teacherIds) || !teacherIds.every((el) => isNaN(Number(el)))) {
    return res.status(400).json({ message: 'incorrect teacherIds' });
  }

  // title validation
  if (title !== 'Blue Ocean') {
    return res.status(400).json({ message: 'incorrect title' });
  }

  // days validation

  try {
    // create
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = lessonsRouter;
