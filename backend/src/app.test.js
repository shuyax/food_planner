const request = require("supertest")
const app = require("../src/app")

describe("GET /", () => {
    it("should return 'Food Planner API Running'", async ()=> {
        const res = await request(app).get("/");

        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("Food Planner API Running");
    });
});

