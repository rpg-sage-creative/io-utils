export function collectTextFields(page) {
    const fields = [];
    const textFields = page.Fields ?? [];
    textFields.forEach(field => {
        if (field.T?.Name === "alpha") {
            const name = (field.id?.Id ?? "").trim();
            const value = (field.V ?? "").trim();
            if (name) {
                fields.push({ name, value });
            }
        }
    });
    return fields;
}
