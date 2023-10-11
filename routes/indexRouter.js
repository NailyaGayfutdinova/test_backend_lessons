const express = require("express");
const db = require("../db/database");
const path = require("path");
const { QueryFile } = require("pg-promise");
const isValidDate = require("../shared/functions");

const indexRouter = express.Router();

indexRouter.get("/", async (req, res) => {
  const { date, status, teacherIds, studentsCount, page, lessonsPerPage } =
    req.query;

  // date validation
  if (date) {
    const dateArray = date.split(",").map((el) => el.trim());
    const isValidDateParam =
      (dateArray.length == 1 && isValidDate(dateArray[0])) ||
      (dateArray.length == 2 &&
        isValidDate(dateArray[0]) &&
        isValidDate(dateArray[1]) &&
        dateArray[0] <= dateArray[1]);
    if (!isValidDateParam)
      return res.status(400).json({ message: "incorrect date filter" });
  }

  // status validation
  if (status && status !== "0" && status !== "1")
    return res.status(400).json({ message: "incorrect status filter" });

  // teacherIds validation
  if (teacherIds) {
    const teacherIdsArray = teacherIds.split(",").map((el) => el.trim());
    const areValidTeacherIds = teacherIdsArray.every(
      (id) => !isNaN(Number(id))
    );
    if (!areValidTeacherIds)
      return res.status(400).json({ message: "incorrect teacherIds filter" });
  }

  // studentsCount validation
  if (studentsCount) {
    const studentsCountArray = studentsCount.split(",").map((el) => el.trim());
    const isValidStudentsCount =
      (studentsCountArray.length == 1 &&
        !isNaN(Number(studentsCountArray[0]))) ||
      (studentsCountArray.length == 2 &&
        studentsCountArray.every((count) => !isNaN(Number(count))) &&
        Number(studentsCountArray[0]) <= Number(studentsCountArray[1]));
    if (!isValidStudentsCount)
      return res
        .status(400)
        .json({ message: "incorrect studentsCount filter" });
  }

  // page validation
  if (page && (page === "0" || isNaN(Number(page)))) {
    return res.status(400).json({ message: "incorrect page filter" });
  }

  // lessonsPerPage validation
  if (
    lessonsPerPage &&
    (lessonsPerPage === "0" || isNaN(Number(lessonsPerPage)))
  ) {
    return res.status(400).json({ message: "incorrect lessonsPerPage filter" });
  }

  const filterParams = {
    singleDate: date?.split(",").length == 1 ? date.trim() : null,
    startDate: date?.includes(",") ? date.split(",")[0].trim() : null,
    endDate: date?.includes(",") ? date.split(",")[1].trim() : null,
    status: status || null,
    teacherIds: teacherIds?.split(",").map((el) => el.trim()) || null,
    studentsCount:
      studentsCount?.split(",").length == 1 ? studentsCount.trim() : null,
    minStudentsCount: studentsCount?.includes(",")
      ? studentsCount.split(",")[0].trim()
      : null,
    maxStudentsCount: studentsCount?.includes(",")
      ? studentsCount.split(",")[1].trim()
      : null,
    page: page || 1,
    lessonsPerPage: lessonsPerPage || 5,
  };


  try {
    const query = new QueryFile(
      path.resolve(__dirname, "../db/indexQuery.sql")
    );
    const result = await db.query(query, filterParams);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = indexRouter;
