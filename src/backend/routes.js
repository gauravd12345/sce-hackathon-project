import express from "express"; // Because we are in ES module mode

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.get("/search", (req, res) => {
  res.send("Search API");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

});
