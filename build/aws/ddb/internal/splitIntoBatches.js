export function splitIntoBatches(items, maxBatchSize) {
    const batches = [];
    let batch;
    for (const item of items) {
        if (!batch || batch.length === maxBatchSize) {
            batch = [];
            batches.push(batch);
        }
        batch.push(item);
    }
    return batches;
}
