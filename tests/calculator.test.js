import test from "node:test";
import assert from "node:assert/strict";
import * as calculator from "../src/core/quartile-calculator.js";

test("all official percentile boundaries map to the correct quartile", () => {
  const cases = [
    [100, "Q1"],
    [99, "Q1"],
    [75, "Q1"],
    [74, "Q2"],
    [50, "Q2"],
    [49, "Q3"],
    [25, "Q3"],
    [24, "Q4"],
    [0, "Q4"]
  ];
  cases.forEach(([percentile, expected]) => {
    assert.equal(calculator.quartileFromPercentile(percentile), expected, `${percentile} should be ${expected}`);
  });
});

test("proximity shows the exact percentile-point distance to the next better quartile", () => {
  const cases = [
    [74, "Q2", "Q1", 75, 1],
    [50, "Q2", "Q1", 75, 25],
    [49, "Q3", "Q2", 50, 1],
    [25, "Q3", "Q2", 50, 25],
    [24, "Q4", "Q3", 25, 1],
    [0, "Q4", "Q3", 25, 25]
  ];

  cases.forEach(([percentile, quartile, nextQuartile, nextThreshold, pointsToNext]) => {
    assert.deepEqual(calculator.proximityToBetterQuartile(percentile), {
      quartile,
      percentile,
      isHighest: false,
      nextQuartile,
      nextThreshold,
      pointsToNext
    });
  });

  assert.deepEqual(calculator.proximityToBetterQuartile(75), {
    quartile: "Q1",
    percentile: 75,
    isHighest: true,
    nextQuartile: null,
    nextThreshold: null,
    pointsToNext: null
  });
  assert.equal(calculator.proximityToBetterQuartile("not numeric"), null);
});

test("all supported percentile formats are parsed", () => {
  const cases = ["96", "96%", "96th percentile", "Percentile 96", "percentile: 96%"];
  cases.forEach((value) => assert.equal(calculator.parsePercentile(value), 96, value));
});

test("all supported rank formats are parsed", () => {
  const expected = { rank: 12, total: 250 };
  const cases = ["12/250", "12 out of 250", "12 of 250", "Rank #12/250", "Rank 12 of 250"];
  cases.forEach((value) => assert.deepEqual(calculator.parseRank(value), expected, value));
});

test("rank-out-of estimated percentile uses the specified midpoint formula", () => {
  assert.equal(calculator.estimatedPercentileFromRank(42, 320), 87);
  assert.equal(calculator.estimatedPercentileFromRank(1, 1), 50);
  assert.equal(calculator.estimatedPercentileFromRank(1, 100), 99);
  assert.equal(calculator.estimatedPercentileFromRank(100, 100), 0);
});

test("rank fallback is labelled as an Estimated CiteScore Quartile", () => {
  const result = calculator.calculateCategory({
    category: "Business and International Management",
    percentile: null,
    rank: { rank: 42, total: 320 }
  });
  assert.equal(result.percentile, 87);
  assert.equal(result.quartile, "Q1");
  assert.equal(result.label, "Estimated CiteScore Quartile");
  assert.equal(result.source, "Estimated from rank");
  assert.equal(result.estimated, true);
  assert.equal(result.proximity.isHighest, true);

  const nearQ2 = calculator.calculateCategory({
    category: "Estimated Q3 example",
    percentile: null,
    rank: { rank: 51, total: 100 }
  });
  assert.equal(nearQ2.percentile, 49);
  assert.equal(nearQ2.quartile, "Q3");
  assert.equal(nearQ2.proximity.pointsToNext, 1);
  assert.equal(nearQ2.proximity.nextQuartile, "Q2");
});

test("displayed Scopus percentile always wins over a rank estimate", () => {
  const result = calculator.calculateCategory({
    category: "Economics",
    percentile: "74%",
    rank: { rank: 1, total: 200 }
  });
  assert.equal(result.percentile, 74);
  assert.equal(result.quartile, "Q2");
  assert.equal(result.source, "Scopus percentile");
  assert.equal(result.estimated, false);
  assert.equal(result.proximity.pointsToNext, 1);
  assert.equal(result.proximity.nextQuartile, "Q1");
});

test("invalid values are rejected without producing a quartile", () => {
  const invalidPercentiles = [-1, 101, Infinity, NaN, "-1", "101", "hello", "", null, undefined];
  invalidPercentiles.forEach((value) => assert.equal(calculator.quartileFromPercentile(value), null));

  const invalidRanks = [
    [0, 10],
    [-1, 10],
    [11, 10],
    [1, 0],
    [1, -2],
    [1.5, 10],
    ["abc", 10],
    [null, null]
  ];
  invalidRanks.forEach(([rank, total]) => {
    assert.equal(calculator.estimatedPercentileFromRank(rank, total), null);
  });
  ["0/10", "-1/10", "11/10", "1/0", "rank unknown", "", "42"].forEach((value) => {
    assert.equal(calculator.parseRank(value), null);
  });
});

test("multiple subject categories preserve different quartiles and identify only the best", () => {
  const results = [86, 70, 40, 12].map((percentile) => calculator.calculateCategory({ percentile }));
  assert.deepEqual(results.map((result) => result.quartile), ["Q1", "Q2", "Q3", "Q4"]);
  assert.equal(calculator.bestQuartile(results), "Q1");
});

test("best result uses the strongest percentile within the best available quartile", () => {
  const results = [49, 25, 48].map((percentile) => calculator.calculateCategory({ percentile }));
  assert.equal(calculator.bestQuartile(results), "Q3");
  assert.equal(calculator.bestQuartileResult(results).percentile, 49);
  assert.equal(calculator.bestQuartileResult(results).proximity.pointsToNext, 1);
});
