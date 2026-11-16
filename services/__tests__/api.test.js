import { ApiError, buildQuery } from "../api";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  expoConfig: { hostUri: "192.168.1.10:8081" },
}));

describe("buildQuery", () => {
  it("encodes params and drops empty values", () => {
    expect(
      buildQuery({ placeId: "abc", roast: "light", limit: 50, skip: null })
    ).toBe("placeId=abc&roast=light&limit=50");
  });

  it("encodes special characters", () => {
    expect(buildQuery({ placeIds: "a,b" })).toBe("placeIds=a%2Cb");
  });
});

describe("ApiError", () => {
  it("stores status with the message", () => {
    const error = new ApiError("Nope", 401);
    expect(error.message).toBe("Nope");
    expect(error.status).toBe(401);
  });
});
