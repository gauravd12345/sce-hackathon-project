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
        const query = req.query.q || "fastapi docker"; // ?q=term in the URL
        const result = await octokit.rest.search.repos({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: 3,
        });

        // send JSON back
        res.json(
        result.data.items.map(repo => ({
            name: repo.full_name,
            stars: repo.stargazers_count,
            url: repo.html_url,
        }))
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);

});
