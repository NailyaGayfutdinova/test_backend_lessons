SELECT 
  lessons.id as id,
  TO_CHAR(lessons.date, 'YYYY-MM-DD') as date,
  lessons.title as title,
  lessons.status,
  CAST(COUNT(DISTINCT CASE WHEN lesson_students.visit = true THEN lesson_students.student_id ELSE NULL END) AS INTEGER) as "visitCount",
  ARRAY_AGG(DISTINCT students.name) as students,
  ARRAY_AGG(DISTINCT teachers.name) as teachers
FROM
  lessons
LEFT JOIN 
  lesson_students ON lessons.id = lesson_students.lesson_id
LEFT JOIN
  students ON lesson_students.student_id = students.id  
LEFT JOIN
  lesson_teachers ON lessons.id = lesson_teachers.lesson_id
LEFT JOIN
  teachers ON lesson_teachers.teacher_id = teachers.id    
WHERE
  (
    (${singleDate} IS NULL AND ${startDate} IS NULL AND ${endDate} IS NULL) OR
    (${singleDate} IS NOT NULL AND lessons.date = ${singleDate}) OR 
    (${startDate} IS NOT NULL AND ${endDate} IS NOT NULL AND lessons.date BETWEEN ${startDate} AND ${endDate})
  )
  AND
  (CAST(${status} AS INTEGER) IS NULL OR lessons.status = ${status})
  AND (
    ${teacherIds} IS NULL OR 
    EXISTS (
      SELECT 1
      FROM lesson_teachers as lt
      WHERE lt.lesson_id = lessons.id AND lt.teacher_id = ANY(ARRAY[${teacherIds}]::int[])
    )
  )
GROUP BY
  lessons.id
HAVING
  (
    (${studentsCount} IS NULL AND ${minStudentsCount} IS NULL AND ${maxStudentsCount} IS NULL) OR
    (
      (${minStudentsCount} IS NOT NULL AND ${maxStudentsCount} IS NOT NULL) AND
      (
        CAST(${minStudentsCount} AS INTEGER) <= 
        CAST(COUNT(DISTINCT lesson_students.student_id) AS INTEGER) AND
        CAST(COUNT(DISTINCT lesson_students.student_id) AS INTEGER) <=
        CAST(${maxStudentsCount} AS INTEGER)
      )
      OR
      (${studentsCount} IS NOT NULL) AND
      (
        CAST(${studentsCount} AS INTEGER) = 
        CAST(COUNT(DISTINCT lesson_students.student_id) AS INTEGER)
      )
    )
  )
LIMIT
  ${lessonsPerPage} OFFSET ((CAST(${page} AS INTEGER) - 1) * CAST(${lessonsPerPage} AS INTEGER));