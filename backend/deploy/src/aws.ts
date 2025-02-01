import { S3 } from "aws-sdk";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function downloadFileFromS3(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "rocketdeployer-ap",
      Prefix: prefix,
    })
    .promise();

  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }

        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);

        console.log(`Creating directory: ${dirName}`);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }

        console.log(`Saving file to: ${finalOutputPath}`);
        s3.getObject({
          Bucket: "rocketdeployer-ap",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            console.log(`Finished writing file: ${finalOutputPath}`);
            resolve("");
          });
      });
    }) || [];

  console.log("waiting");

  await Promise.all(allPromises?.filter((x) => x !== undefined));
}


export function copyFinalOutputToS3(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach(file => {
      uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  })
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
      const fullFilePath = path.join(folderPath, file);
      if (fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath))
      } else {
          response.push(fullFilePath);
      }
  });
  return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.upload({
      Body: fileContent,
      Bucket: "rocketdeployer-ap",
      Key: fileName,
  }).promise();
  console.log(response);
}