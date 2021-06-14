import * as chrono from "../src/";
import { testSingleCase } from "./test_util";

//-------------------------------------

test("Test - Timezone difference on reference date", function () {
    // Sun Jun 06 2021 19:00:00 GMT+0900 (JST)
    // Sun Jun 06 2021 11:00:00 GMT+0100 (BST)
    const refInstant = new Date("Sun Jun 06 2021 19:00:00 GMT+0900 (JST)");

    testSingleCase(chrono, "At 4pm tomorrow", { instant: refInstant, timezone: "BST" }, (result) => {
        const expectedInstant = new Date("Mon Jun 07 2021 16:00:00 GMT+0100 (BST)");
        expect(result).toBeDate(expectedInstant);
    });

    testSingleCase(chrono, "At 4pm tomorrow", { instant: refInstant, timezone: "JST" }, (result) => {
        const expectedInstant = new Date("Mon Jun 07 2021 16:00:00 GMT+0900 (JST)");
        expect(result).toBeDate(expectedInstant);
    });
});

test("Test - Timezone difference on written date", function () {
    // Sun Jun 06 2021 19:00:00 GMT+0900 (JST)
    // Sun Jun 06 2021 11:00:00 GMT+0100 (BST)
    const refInstant = new Date("Sun Jun 06 2021 19:00:00 GMT+0900 (JST)");

    testSingleCase(chrono, "Sun Jun 06 2021 19:00:00", { timezone: "JST" }, (result) => {
        expect(result).toBeDate(refInstant);
    });

    testSingleCase(chrono, "Sun Jun 06 2021 11:00:00", { timezone: "BST" }, (result) => {
        expect(result).toBeDate(refInstant);
    });

    testSingleCase(chrono, "Sun Jun 06 2021 11:00:00", { timezone: 60 }, (result) => {
        expect(result).toBeDate(refInstant);
    });
});

test("Test - Precise [now] mentioned", function () {
    const refDate = new Date("Sat Mar 13 2021 14:22:14 GMT+0900 (Japan Standard Time)");

    testSingleCase(chrono, "now", refDate, (result) => {
        expect(result).toBeDate(refDate);
    });

    testSingleCase(chrono, "now", { instant: refDate }, (result) => {
        expect(result).toBeDate(refDate);
    });

    testSingleCase(chrono, "now", { instant: refDate, timezone: 540 }, (result) => {
        expect(result).toBeDate(refDate);
    });

    testSingleCase(chrono, "now", { instant: refDate, timezone: "JST" }, (result) => {
        expect(result).toBeDate(refDate);
    });

    testSingleCase(chrono, "now", { instant: refDate, timezone: -300 }, (result) => {
        expect(result).toBeDate(refDate);
    });
});

test("Test - Precise date/time mentioned", function () {
    const text = "Sat Mar 13 2021 14:22:14 GMT+0900";
    const refDate = new Date();

    testSingleCase(chrono, text, refDate, (result, text) => {
        expect(result).toBeDate(new Date(text));
    });

    testSingleCase(chrono, text, { instant: refDate }, (result) => {
        expect(result).toBeDate(new Date(text));
    });

    testSingleCase(chrono, text, { instant: refDate, timezone: 540 }, (result) => {
        expect(result).toBeDate(new Date(text));
    });

    testSingleCase(chrono, text, { instant: refDate, timezone: "JST" }, (result) => {
        expect(result).toBeDate(new Date(text));
    });

    testSingleCase(chrono, text, { instant: refDate, timezone: -300 }, (result) => {
        expect(result).toBeDate(new Date(text));
    });
});
