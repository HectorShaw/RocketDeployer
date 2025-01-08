import { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const uploadService = async (
  fileName: string,
  localFilePath: string
) => {
  console.log("Uploading file to S3");
  const fileContent = fs.readFileSync(localFilePath);
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error("AWS_BUCKET_NAME is not defined in the environment variables");
  }

  const res = await s3
    .upload({
      Body: fileContent,
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
    })
    .promise();

  console.log("File uploaded successfully", res);
};
