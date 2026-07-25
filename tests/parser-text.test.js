import test from "node:test";
import assert from "node:assert/strict";
import * as parser from "../src/core/scopus-parser.js";

test("semantic text parsing accepts every listed percentile format", () => {
  const cases = [
    ["Percentile 96", 96],
    ["Percentile: 96%", 96],
    ["96th percentile", 96],
    ["96% CiteScore percentile", 96]
  ];
  cases.forEach(([text, expected]) => assert.equal(parser.parsePercentileFromText(text), expected, text));
});

test("semantic text parsing accepts every listed rank format in nearby text", () => {
  const expected = { rank: 12, total: 250 };
  const cases = [
    "Rank 12/250",
    "Rank 12 out of 250",
    "Rank 12 of 250",
    "Rank #12/250",
    "In category: Economics Rank #12/250"
  ];
  cases.forEach((text) => assert.deepEqual(parser.parseRankFromText(text), expected, text));
});

test("page-derived text is normalized, stripped of controls, and bounded", () => {
  assert.equal(parser.sanitizeText("  A\u0000\n\tB  "), "A B");
  assert.equal(parser.sanitizeText("abcdef", 3), "abc");
});

test("unlabelled unrelated numbers are not treated as percentiles", () => {
  assert.equal(parser.parsePercentileFromText("Published in 2024 with 96 articles"), null);
  assert.equal(parser.parseRankFromText("Published in 2024 with 96 articles"), null);
});
