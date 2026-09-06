import { deserializeObject } from "./deserialize.js";
function setItem(itemMap, item) {
    // ignore undefined items
    if (!item) {
        return;
    }
    // cache key variables
    const { id, objectType } = item;
    // ensure objectType map exists
    if (!itemMap.has(objectType)) {
        itemMap.set(objectType, new Map());
    }
    // add the item
    itemMap
        .get(objectType)
        .set(id, item);
}
export function collectItems(keys, output) {
    let items;
    if (output?.Responses) {
        // initialize item map
        const itemMap = new Map();
        // add all received items to the map
        Object
            .values(output.Responses)
            .forEach(serialized => {
            serialized
                .map(deserializeObject)
                .forEach(item => setItem(itemMap, item));
        });
        // return the items in the order in which they were requested
        items = keys.map(key => itemMap.get(key.objectType)?.get(key.id));
    }
    return items ?? [];
}
