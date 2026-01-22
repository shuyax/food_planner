
const request = require("supertest")
const app = require("../../src/app")

describe("GET /food", () => {
  it.skip("should return all food items", async () => {
    const res = await request(app).get("/food");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
