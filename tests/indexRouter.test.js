const request = require("supertest");
const express = require("express");
const indexRouter = require("../routes/indexRouter");

const app = express();
app.use("/", indexRouter);

describe("GET /", () => {
  it("should respond with status 200 without query parameters", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
  });

  it.each([
    "9990-11-22",
    "2011-31-12",
    "22-11-11",
    "fff",
    "2023-10-10, 2023-10-09",
  ])(
    "should respond with status 400 if query parameter date is incorrect",
    async (date) => {
      const response = await request(app).get("/").query({ date });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("incorrect date filter");
    }
  );

  it.each(["2", "-1", "aaa"])(
    "should respond with status 400 if query parameter status is incorrect",
    async (status) => {
      const response = await request(app).get("/").query({ status });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("incorrect status filter");
    }
  );

  it.each(["1,a,b", "aaa"])(
    "should respond with status 400 if query parameter teacherIds is incorrect",
    async (teacherIds) => {
      const response = await request(app).get("/").query({ teacherIds });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("incorrect teacherIds filter");
    }
  );

  it.each(["1,a,b", "1,2,3", "aaa"])(
    "should respond with status 400 if query parameter studentsCount is incorrect",
    async (studentsCount) => {
      const response = await request(app).get("/").query({ studentsCount });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("incorrect studentsCount filter");
    }
  );

  it.each(["1b", ",", "aaa"])(
    "should respond with status 400 if query parameter page is incorrect",
    async (page) => {
      const response = await request(app).get("/").query({ page });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("incorrect page filter");
    }
  );

  it.each(["1b", ",", "aaa"])(
    "should respond with status 400 if query parameter lessonsPerPage is incorrect",
    async (lessonsPerPage) => {
      const response = await request(app).get("/").query({ lessonsPerPage });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("incorrect lessonsPerPage filter");
    }
  );

  it("should return lessons with specific filters, validate JSON structure, and limit lessonsPerPage", async () => {
    const lessonsPerPage = 2;
    const startDate = "2019-09-01";
    const endDate = "2019-09-05";
    const status = 1;
    const minStudentsCount = 0;
    const maxStudentsCount = 1;

    const response = await request(app)
      .get("/")
      .query({
        date: `${startDate},${endDate}`,
        status: status.toString(),
        teacherIds: "1,2,3",
        studentsCount: `${minStudentsCount},${maxStudentsCount}`,
        page: "1",
        lessonsPerPage: lessonsPerPage.toString(),
      });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toEqual(
      expect.stringContaining("application/json")
    );

    const result = response.body;

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(lessonsPerPage);

    for (const lesson of result) {
      expect(lesson).toHaveProperty("id");
      expect(lesson).toHaveProperty("date");
      expect(lesson).toHaveProperty("title");
      expect(lesson).toHaveProperty("status");
      expect(lesson).toHaveProperty("visitCount");
      expect(lesson).toHaveProperty("students");
      expect(Array.isArray(lesson.students)).toBe(true);
      expect(lesson).toHaveProperty("teachers");
      expect(Array.isArray(lesson.teachers)).toBe(true);
      expect(new Date(lesson.date).getTime()).toBeGreaterThanOrEqual(
        new Date(startDate).getTime()
      );
      expect(new Date(lesson.date).getTime()).toBeLessThanOrEqual(
        new Date(endDate).getTime()
      );
      expect(lesson.status).toEqual(status);
      expect(lesson.students.length).toBeGreaterThanOrEqual(minStudentsCount);
      expect(lesson.students.length).toBeLessThanOrEqual(maxStudentsCount);
    }
  });
});
