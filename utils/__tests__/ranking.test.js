import {
  rankPlaces,
  sortedCounts,
  summarizeByPlace,
  summarizeReviews,
} from "../ranking";

const reviews = [
  {
    placeId: "B",
    rating: 5,
    roast: "light",
    origin: "Ethiopia",
    brewMethod: "Pour-over",
  },
  {
    placeId: "B",
    rating: 3,
    roast: "light",
    origin: "Colombia",
    brewMethod: "Espresso",
  },
  {
    placeId: "A",
    rating: 5,
    roast: "dark",
    origin: "Brazil",
    brewMethod: "Drip",
  },
];

describe("summarizeReviews", () => {
  it("returns empty summary for no reviews", () => {
    expect(summarizeReviews([])).toEqual({
      count: 0,
      averageRating: null,
      roasts: {},
      origins: {},
      brewMethods: {},
    });
  });

  it("aggregates roast, origin, brew method, and average rating", () => {
    const summary = summarizeReviews(reviews.filter((r) => r.placeId === "B"));
    expect(summary.count).toBe(2);
    expect(summary.averageRating).toBe(4);
    expect(summary.roasts).toEqual({ light: 2 });
    expect(summary.origins).toEqual({ Ethiopia: 1, Colombia: 1 });
    expect(summary.brewMethods).toEqual({ "Pour-over": 1, Espresso: 1 });
  });

  it("ignores missing optional tags", () => {
    const summary = summarizeReviews([
      { placeId: "X", rating: 4, roast: null, origin: undefined, brewMethod: "" },
    ]);
    expect(summary.roasts).toEqual({});
    expect(summary.origins).toEqual({});
    expect(summary.brewMethods).toEqual({});
  });
});

describe("summarizeByPlace", () => {
  it("groups reviews by placeId", () => {
    const byPlace = summarizeByPlace(reviews);
    expect(Object.keys(byPlace).sort()).toEqual(["A", "B"]);
    expect(byPlace.B.roasts).toEqual({ light: 2 });
    expect(byPlace.A.roasts).toEqual({ dark: 1 });
  });
});

describe("sortedCounts", () => {
  it("sorts tags by count descending", () => {
    expect(sortedCounts({ light: 1, dark: 5, medium: 3 })).toEqual([
      ["dark", 5],
      ["medium", 3],
      ["light", 1],
    ]);
  });
});

describe("rankPlaces", () => {
  const places = [
    { id: "A", name: "Alpha", rating: 4.2, matchedRoasts: ["light"] },
    { id: "B", name: "Beta", rating: 4.8, matchedRoasts: [] },
    { id: "C", name: "Cafe C", rating: 4.0, matchedRoasts: ["dark"] },
  ];

  it("ranks by community roast weight over Google keyword matches", () => {
    const summaries = summarizeByPlace(reviews);
    const ranked = rankPlaces(places, summaries, ["light"]);

    expect(ranked.map((p) => p.name)).toEqual(["Beta", "Alpha", "Cafe C"]);
    // Beta: 2 light reviews * community weight 2 = 4
    expect(ranked[0]).toMatchObject({
      name: "Beta",
      score: 4,
      communityMatches: ["light"],
      googleMatches: [],
    });
    // Alpha: Google keyword only = 1
    expect(ranked[1]).toMatchObject({
      name: "Alpha",
      score: 1,
      communityMatches: [],
      googleMatches: ["light"],
    });
    expect(ranked[2].score).toBe(0);
  });

  it("uses Google rating as a tiebreaker when scores are equal", () => {
    const tied = [
      { id: "low", name: "Low", rating: 3.5, matchedRoasts: ["light"] },
      { id: "high", name: "High", rating: 4.9, matchedRoasts: ["light"] },
    ];
    const ranked = rankPlaces(tied, {}, ["light"]);
    expect(ranked.map((p) => p.name)).toEqual(["High", "Low"]);
    expect(ranked[0].score).toBe(1);
    expect(ranked[1].score).toBe(1);
  });

  it("does not use origin or brew method in the score", () => {
    const summaries = summarizeByPlace(reviews);
    const withPrefs = rankPlaces(places, summaries, ["light"]);
    const withoutLookingAtOrigin = withPrefs.find((p) => p.id === "B").score;

    // Same reviews, same roast preference → score unchanged even though
    // origins/brew methods exist in the summary.
    expect(summaries.B.origins.Ethiopia).toBe(1);
    expect(summaries.B.brewMethods["Pour-over"]).toBe(1);
    expect(withoutLookingAtOrigin).toBe(4);
  });

  it("returns score 0 when there are no preferences", () => {
    const ranked = rankPlaces(places, summarizeByPlace(reviews), []);
    expect(ranked.every((p) => p.score === 0)).toBe(true);
  });
});
