import { request } from "./api";

const placesService = {
  async searchNearby({ latitude, longitude, roasts }) {
    const data = await request("/places/search", {
      method: "POST",
      body: { latitude, longitude, roasts },
    });
    return data.places ?? [];
  },

  async getDetails(placeId) {
    const data = await request(`/places/${encodeURIComponent(placeId)}`);
    return data.place;
  },
};

export default placesService;
