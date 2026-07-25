"use strict";

  const SOURCE_PERCENTILE = "Scopus percentile";
  const SOURCE_RANK = "Estimated from rank";

  function parsePercentile(value) {
    if (typeof value === "number") {
      return Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const text = value.trim();
    if (!text) {
      return null;
    }

    const patterns = [
      /^(100|\d{1,2})(?:st|nd|rd|th)?\s*(?:%|percentile)?$/i,
      /^percentile\s*:?[\s\u00a0]*(100|\d{1,2})(?:st|nd|rd|th)?\s*%?$/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const percentile = Number(match[1]);
        return percentile >= 0 && percentile <= 100 ? percentile : null;
      }
    }

    return null;
  }

  function quartileFromPercentile(value) {
    const percentile = parsePercentile(value);
    if (percentile === null) {
      return null;
    }
    if (percentile >= 75) {
      return "Q1";
    }
    if (percentile >= 50) {
      return "Q2";
    }
    if (percentile >= 25) {
      return "Q3";
    }
    return "Q4";
  }

  function validateRank(rank, total) {
    const parsedRank = typeof rank === "number" ? rank : Number(rank);
    const parsedTotal = typeof total === "number" ? total : Number(total);

    if (
      !Number.isInteger(parsedRank) ||
      !Number.isInteger(parsedTotal) ||
      parsedRank < 1 ||
      parsedTotal < 1 ||
      parsedRank > parsedTotal
    ) {
      return null;
    }

    return { rank: parsedRank, total: parsedTotal };
  }

  function parseRank(value) {
    if (typeof value !== "string") {
      return null;
    }

    const text = value.trim();
    const match = text.match(
      /^(?:rank\s*:?[\s\u00a0]*#?\s*)?(\d+)\s*(?:\/|out\s+of|of)\s*(\d+)$/i
    );

    return match ? validateRank(Number(match[1]), Number(match[2])) : null;
  }

  function estimatedPercentileFromRank(rank, total) {
    const validRank = validateRank(rank, total);
    if (!validRank) {
      return null;
    }

    const estimated = Math.floor(
      ((validRank.total - validRank.rank + 0.5) / validRank.total) * 100
    );
    return Math.max(0, Math.min(100, estimated));
  }

  function calculateCategory(input) {
    const category = input && typeof input.category === "string" ? input.category : "";
    const displayedPercentile = parsePercentile(input && input.percentile);

    if (displayedPercentile !== null) {
      return {
        category,
        quartile: quartileFromPercentile(displayedPercentile),
        percentile: displayedPercentile,
        displayedPercentile,
        rank: input && input.rank ? validateRank(input.rank.rank, input.rank.total) : null,
        estimated: false,
        label: "CiteScore Quartile",
        source: SOURCE_PERCENTILE
      };
    }

    const validRank = input && input.rank
      ? validateRank(input.rank.rank, input.rank.total)
      : null;
    const estimatedPercentile = validRank
      ? estimatedPercentileFromRank(validRank.rank, validRank.total)
      : null;

    if (estimatedPercentile !== null) {
      return {
        category,
        quartile: quartileFromPercentile(estimatedPercentile),
        percentile: estimatedPercentile,
        displayedPercentile: null,
        rank: validRank,
        estimated: true,
        label: "Estimated CiteScore Quartile",
        source: SOURCE_RANK
      };
    }

    return {
      category,
      quartile: null,
      percentile: null,
      displayedPercentile: null,
      rank: null,
      estimated: false,
      label: "Unable to calculate",
      source: "Unavailable"
    };
  }

  function bestQuartile(results) {
    if (!Array.isArray(results)) {
      return null;
    }

    const valid = results
      .map((result) => (result && /^Q[1-4]$/.test(result.quartile) ? result.quartile : null))
      .filter(Boolean)
      .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    return valid.length ? valid[0] : null;
  }

export {
  SOURCE_PERCENTILE,
  SOURCE_RANK,
  parsePercentile,
  quartileFromPercentile,
  validateRank,
  parseRank,
  estimatedPercentileFromRank,
  calculateCategory,
  bestQuartile
};
