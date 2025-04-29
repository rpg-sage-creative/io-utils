import { appendFile } from "./appendFile.js";
import { fileExists } from "./fileExists.js";
import { contentToFileOutput } from "./internal/contentToFileOutput.js";
import { writeFile } from "./writeFile.js";
export async function appendJsonDb(filePath, content) {
    const exists = await fileExists(filePath);
    if (exists) {
        return appendFile(filePath, "\n" + contentToFileOutput(content));
    }
    return writeFile(filePath, content, { makeDir: true });
}
