const express = require("express");
const request = require("supertest");
const { setupRoutes } = require("../routes");

describe("Route Tests", () => {
  let app;

  beforeEach(() => {
    app = express();
    setupRoutes(app);
  });

  test("GET /api/example should return 200", async () => {
    app.get("/api/example", (req, res) => res.sendStatus(200));
    await request(app).get("/api/example").expect(200);
  });
});
