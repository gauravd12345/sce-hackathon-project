import express from "express"; // Because we are in ES module mode
import { Octokit } from "@octokit/rest"; // Octokit allows us to use Github REST API via NPM
import cors from "cors";
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});


app.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const result = await octokit.rest.search.repos({
      q,
      sort: "stars",
      order: "desc",
      per_page: 9,
      headers: { accept: "application/vnd.github.mercy-preview+json" }, // includes topics[]
    });

    const data = result.data.items.map(r => ({
      id: r.id,
      name: r.name,                   
      full_name: r.full_name,         
      description: r.description || "No description",
      html_url: r.html_url,          
      stargazers_count: r.stargazers_count,
      language: r.language || "Unknown",
      topics: Array.isArray(r.topics) ? r.topics : [], 
    }));

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "GitHub API failed" });
  }
});




app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

});
