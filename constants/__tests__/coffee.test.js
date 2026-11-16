import { getRoast, roastLabel, ROASTS } from "../coffee";

describe("coffee constants", () => {
  it("includes the four roast keys used by ranking and reviews", () => {
    expect(ROASTS.map((r) => r.key)).toEqual([
      "light",
      "medium",
      "medium-dark",
      "dark",
    ]);
  });

  it("looks up a roast by key", () => {
    expect(getRoast("medium").label).toBe("Medium Roast");
    expect(getRoast("missing")).toBeUndefined();
  });

  it("returns a readable label or falls back to the key", () => {
    expect(roastLabel("light")).toBe("Light Roast");
    expect(roastLabel("unknown")).toBe("unknown");
  });
});
