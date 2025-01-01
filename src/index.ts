import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./util";
import validator from "validator";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    
    // Validate repoUrl using validator library
    if (!repoUrl || !validator.isURL(repoUrl, { protocols: ['https'], require_tld: true, require_protocol: true }) || !repoUrl.endsWith('.git')) {
        return res.status(400).send("Invalid repository URL");
    }

    const id = generate();
    try {
        await simpleGit().clone(repoUrl, `output/${id}`);
        res.status(200).send("Repository cloned successfully");
    } catch (error) {
        res.status(500).send("Failed to clone repository");
    }
});

app.listen(3000);

