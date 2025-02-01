import { createClient, commandOptions } from "redis";
import { copyFinalOutputToS3, downloadFileFromS3 } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();

const publisher = createClient();
publisher.connect();

async function main() {
  while (1) {
    const res = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );
     // @ts-ignore;
    const id = res.element;
    await downloadFileFromS3(`output/${id}`);
    console.log(`Downloaded file for ${id}`);

    await buildProject(id)
    await copyFinalOutputToS3(id);
    publisher.hSet("status", id, "deployed")
  }
}

main();
