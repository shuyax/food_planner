const request = require("supertest")
const path = require("path");
const fs = require("fs");
const app = require("../../src/app")

const testImages = ["test-image.jpeg", "test-image-2.webp"]
const testPath = './test/uploads'

describe("Upload API", () => {
    const uploadDir = process.env.UPLOAD_DIR || "uploads";

    // Ensure uploads folder exists
    beforeAll(() => {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    });

    // Clean up uploaded test files after each test
    afterEach(() => {
        const files = fs.readdirSync(uploadDir);
        files.forEach((file) => {
            if (file.startsWith("test-")) fs.unlinkSync(path.join(uploadDir, file));
        });
    });

    it("should upload a single file", async () => {
        const res = await request(app)
            .post("/upload")
            .attach("files", path.join(testPath, testImages[0]));
        expect(res.statusCode).toBe(200);
        expect(res.body.files).toHaveLength(1);
        expect(res.body.files[0]).toMatch(/test-image/);
    });

    it("should upload multiple files", async () => {
        const res = await request(app)
            .post("/upload")
            .attach("files", path.join(testPath, testImages[0]))
            .attach("files", path.join(testPath, testImages[1]));
        expect(res.statusCode).toBe(200);
        expect(res.body.files).toHaveLength(2);
        expect(res.body.files[0]).toMatch(/test-image/);
    });

    it("should return 400 if no file uploaded", async () => {
        const res = await request(app)
            .post("/upload")
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe("No files uploaded")
    })
})