import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string) => {
  console.log(folderPath);

  let res: string[] = [];

  const allFandF = fs.readdirSync(folderPath);

  allFandF.forEach((files) => {
    const fandfPath = path.join(folderPath, files);

    if (fs.statSync(fandfPath).isDirectory()) {
      res = res.concat(getAllFiles(fandfPath));
    } else {
      res.push(fandfPath);
    }
  });
  return res;
};
