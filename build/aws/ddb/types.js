export function resolveId(resolvable) {
    return typeof (resolvable) === "string"
        ? resolvable
        : resolvable?.id;
}
