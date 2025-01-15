import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./util";
import { getAllFiles } from "./file";
import path from "path";
import { uploadService } from "./upload";
import { createClient } from "redis";


const publisher = createClient();
publisher.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;

  const id = generate();
  try {
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`), {});
    console.log("Repository cloned successfully");

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    await Promise.all(
      files.map((file) => uploadService(file.slice(__dirname.length + 1), file))
    );

    await publisher.lPush("build-queue", id);
    console.log(`Pushed ID: ${id} to Redis build-queue`);

    res
      .status(200)
      .json({ id: id, message: "Repository deployed successfully!" });
  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to deploy repository", error });
    }
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
