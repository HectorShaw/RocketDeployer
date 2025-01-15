import { createClient, commandOptions } from "redis";
import { downloadFileFromS3 } from "./aws";

const subscriber = createClient();
subscriber.connect();

async function main() {
    while(1){
        const res = await subscriber.brPop(
            commandOptions({isolated: true}),
            'build-queue',
            0
        )
        console.log('res', res)

        if (res !== null) {
            const id = res.element;
            await downloadFileFromS3(`/output/${id}`);
            console.log(`Downloaded file for ${id}`);
        }

    }
}

main()