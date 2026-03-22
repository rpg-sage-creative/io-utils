import { deserializeObject } from "./deserialize.js";
function setItem(itemMap, item) {
    if (!item) {
        return;
    }
    const { id, objectType } = item;
    if (!itemMap.has(objectType)) {
        itemMap.set(objectType, new Map());
    }
    itemMap
        .get(objectType)
        .set(id, item);
}
export function collectItems(keys, output) {
    let items;
    if (output?.Responses) {
        const itemMap = new Map();
        Object
            .values(output.Responses)
            .forEach(serialized => {
            serialized
                .map(deserializeObject)
                .forEach(item => setItem(itemMap, item));
        });
        items = keys.map(key => itemMap.get(key.objectType)?.get(key.id));
    }
    return items ?? [];
}
