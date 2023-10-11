const express = require("express");
const morgan = require("morgan");
const indexRouter = require("./routes/indexRouter");
const lessonsRouter = require("./routes/lessonsRouter");

require("dotenv").config();

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());

app.use('/', indexRouter);
app.use('/lessons', lessonsRouter);

app.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
