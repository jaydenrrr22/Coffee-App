import { request } from "./api";

const placesService = {
  async searchNearby({ latitude, longitude, roasts }) {
    const data = await request("/places/search", {
      method: "POST",
      body: { latitude, longitude, roasts },
    });
    return {
      places: data.places ?? [],
      summaries: data.summaries ?? {},
    };
  },

  async getCommunityStats(placeIds) {
    if (placeIds.length === 0) {
      return {};
    }
    const data = await request("/places/stats", {
      method: "POST",
      body: { placeIds },
    });
    return data.summaries ?? {};
  },

  async getDetails(placeId) {
    const data = await request(`/places/${encodeURIComponent(placeId)}`);
    return data.place;
  },
};

export default placesService;
