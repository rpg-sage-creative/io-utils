import { errorReturnUndefined } from "@rsc-utils/core-utils";
import { collectItems } from "./collectItems.js";
import { collectUnprocessedItems } from "./collectUnprocessedItems.js";
import { createBatchCommand } from "./createBatchCommand.js";
async function processBatch(inArgs, outArgs) {
    const { cmd, ddbRepo, batchItems } = inArgs;
    const command = createBatchCommand(cmd, batchItems, ddbRepo.tableNameParser);
    const response = await ddbRepo
        .getClient()
        .send(command)
        .catch(errorReturnUndefined);
    outArgs.batchCount++;
    if (response?.$metadata.httpStatusCode !== 200) {
        outArgs.errorCount++;
    }
    if (cmd === "Get") {
        outArgs.items = outArgs.items
            .concat(collectItems(batchItems, response));
    }
    else {
        outArgs.unprocessed = outArgs.unprocessed
            .concat(collectUnprocessedItems(response));
    }
}
export async function processInBatches(ddbRepo, cmd, itemsOrKeys) {
    const batchMaxItemCount = cmd === "Get"
        ? ddbRepo.batchGetMaxItemCount
        : ddbRepo.batchPutMaxItemCount;
    const results = {
        batchCount: 0,
        errorCount: 0,
        items: [],
        unprocessed: [],
    };
    let startIndex = 0;
    let batchItems;
    while (startIndex < itemsOrKeys.length) {
        batchItems = itemsOrKeys.slice(startIndex, startIndex + batchMaxItemCount);
        if (!batchItems.length)
            break;
        await processBatch({ ddbRepo, cmd, batchItems }, results);
        startIndex += batchItems.length;
    }
    if (cmd === "Get") {
        return {
            batchCount: results.batchCount,
            errorCount: results.errorCount,
            items: results.items,
        };
    }
    const unprocessedCount = results.unprocessed.length;
    return {
        batchCount: results.batchCount,
        errorCount: results.errorCount,
        partial: unprocessedCount > 0 && unprocessedCount < itemsOrKeys.length,
        success: results.errorCount === 0 && unprocessedCount === 0,
        unprocessed: results.unprocessed,
    };
}
