export function stringOrUndefined(value) {
    return value === null || value === undefined || value.trim() === "" ? undefined : value;
}
