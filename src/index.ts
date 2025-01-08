import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./util";
import validator from "validator";
import { getAllFiles } from "./file";
import path from "path";
import { uploadService } from "./upload";





const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    
    if (!repoUrl || !validator.isURL(repoUrl, { protocols: ['https'], require_tld: true, require_protocol: true }) || !repoUrl.endsWith('.git')) {
        return res.status(400).send("Invalid repository URL");
    }

    const id = generate();
    try {
        await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`), {});
        res.status(200).send("Repository cloned successfully");
    } catch (error) {
        res.status(500).send("Failed to clone repository");
    }
///////////////////////////////////////
    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    files.forEach(async file => {
        await uploadService(file.slice(__dirname.length+1), file);        
    });

    res.json({
        id:id
    });

});



app.listen(3000);

