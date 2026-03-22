import { deserializeObject } from "./deserialize.js";
export function collectUnprocessedItems(output) {
    const unprocessed = [];
    if (output?.UnprocessedItems) {
        Object.values(output.UnprocessedItems).forEach(writeRequests => {
            writeRequests.forEach(({ DeleteRequest, PutRequest }) => {
                if (DeleteRequest) {
                    unprocessed.push(deserializeObject(DeleteRequest.Key));
                }
                if (PutRequest) {
                    unprocessed.push(deserializeObject(PutRequest.Item));
                }
            });
        });
    }
    return unprocessed;
}
