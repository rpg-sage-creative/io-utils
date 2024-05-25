export function collectCheckFields(page) {
    const fields = [];
    const checkFields = page.Boxsets ?? [];
    checkFields.forEach(field => {
        if (Array.isArray(field.boxes)) {
            field.boxes.forEach(box => {
                if (box.T?.Name === "box") {
                    const name = (box.id?.Id ?? "").trim();
                    const checked = box.checked === true;
                    if (name) {
                        fields.push({ name, checked });
                    }
                }
            });
        }
    });
    return fields;
}
