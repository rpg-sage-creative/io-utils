import { error, http } from "@rsc-utils/core-utils";
import { ProgressTracker } from "@rsc-utils/progress-utils";
export function createHttpLogger(label, total, interval) {
    const tracker = new ProgressTracker(label, total, interval);
    tracker.on("status", evData => http(evData.message));
    tracker.on("error", evData => error(evData.message));
    return tracker;
}
