const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Override DB to test database before anything imports
const uri = process.env.MONGODB_URI || "";
process.env.MONGODB_URI = uri.replace(/\/[^/?]+(\?|$)/, "/dialysis_test$1");

console.log("Test DB:", process.env.MONGODB_URI);