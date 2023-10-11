const DATACONST = require("./constants");

function isValidDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  return (
    !isNaN(date) &&
    date.toISOString().split("T")[0] === dateStr &&
    year >= DATACONST.minYear &&
    year <= DATACONST.maxYear
  );
}

module.exports = isValidDate;
