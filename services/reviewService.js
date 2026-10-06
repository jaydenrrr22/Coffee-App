import { buildQuery, request } from "./api";

const reviewService = {
  async listForPlaces(placeIds) {
    if (placeIds.length === 0) {
      return [];
    }
    return request(
      `/reviews?${buildQuery({ placeIds: placeIds.join(","), limit: 500 })}`
    );
  },

  async listForPlace(placeId) {
    return request(`/reviews?${buildQuery({ placeId, limit: 50 })}`);
  },

  async listForRoast(roast) {
    return request(`/reviews?${buildQuery({ roast, limit: 25 })}`);
  },

  async create(review) {
    try {
      return await request("/reviews", { method: "POST", body: review });
    } catch (error) {
      return { error: error.message || "Could not save your review" };
    }
  },
};

export default reviewService;
