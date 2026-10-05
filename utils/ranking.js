const countInto = (counts, value) => {
  if (value) {
    counts[value] = (counts[value] || 0) + 1;
  }
};

export const summarizeReviews = (reviews) => {
  const summary = {
    count: reviews.length,
    averageRating: null,
    roasts: {},
    origins: {},
    brewMethods: {},
  };
  if (reviews.length === 0) {
    return summary;
  }

  let total = 0;
  for (const review of reviews) {
    total += review.rating;
    countInto(summary.roasts, review.roast);
    countInto(summary.origins, review.origin);
    countInto(summary.brewMethods, review.brewMethod);
  }
  summary.averageRating = total / reviews.length;
  return summary;
};

export const summarizeByPlace = (reviews) => {
  const grouped = {};
  for (const review of reviews) {
    (grouped[review.placeId] ??= []).push(review);
  }
  return Object.fromEntries(
    Object.entries(grouped).map(([placeId, list]) => [
      placeId,
      summarizeReviews(list),
    ])
  );
};

export const sortedCounts = (counts) =>
  Object.entries(counts).sort((a, b) => b[1] - a[1]);

// Community reports outweigh Google keyword hits because they come from people
// who actually drank that roast at the shop.
const COMMUNITY_WEIGHT = 2;
const GOOGLE_WEIGHT = 1;

export const rankPlaces = (places, summaries, preferredRoasts) =>
  places
    .map((place) => {
      const roastCounts = summaries[place.id]?.roasts ?? {};
      const communityMatches = preferredRoasts.filter((r) => roastCounts[r]);
      const googleMatches = preferredRoasts.filter((r) =>
        place.matchedRoasts?.includes(r)
      );
      const score =
        communityMatches.reduce(
          (sum, r) => sum + roastCounts[r] * COMMUNITY_WEIGHT,
          0
        ) +
        googleMatches.length * GOOGLE_WEIGHT;

      return { ...place, score, communityMatches, googleMatches };
    })
    .sort((a, b) => b.score - a.score || (b.rating ?? 0) - (a.rating ?? 0));
