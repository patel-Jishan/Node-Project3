let express = require("express");
let fs = require("fs").promises;

let app = express();
let PORT = 3000;

app.use(express.json());

function validationMiddleware(req, res, next) {
  let { username, ID, Rating, Description, Genre, Cast } = req.body;
  let errors = [];

  if (typeof username !== "string") {
    errors.push("Username must be a String");
  }
  if (typeof ID !== "number") {
    errors.push("ID must be a Number");
  }
  if (typeof Rating !== "number") {
    errors.push("Rating must be a Number");
  }
  if (typeof Description !== "string") {
    errors.push("Description must be a String");
  }
  if (typeof Genre !== "string") {
    errors.push("Genre must be a String");
  }
  if (!Array.isArray(Cast)) {
    errors.push("Cast must be an Array");
  } else {
    let invalidCast = Cast.filter(e => typeof e !== "string");
    if (invalidCast.length > 0) {
      errors.push("All Cast members must be Strings");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Some data is incorrect",
      errors
    });
  }

  next();
}

app.post("/data", validationMiddleware, async (req, res, next) => {
  try {
    let data = await fs.readFile("datastore.json", "utf-8");
    let parsedData = JSON.parse(data);

    parsedData.data.push(req.body);

    await fs.writeFile(
      "datastore.json",
      JSON.stringify(parsedData, null, 2)
    );

    res.json({ message: "Data added successfully", success: true });
  } catch (error) {
    next(error); 
  }
});

function errorMiddleware(err, req, res, next) {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong",
    error: err.message
  });
}

app.use(errorMiddleware); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
