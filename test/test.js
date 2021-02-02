var supertest = require("supertest");
var should = require("should");
var app = require("../app");

// This agent refers to PORT where program is runninng.
var server = supertest.agent(app);

describe("GET /", function () {
  it("renders index.ejs", function (done) {
    server.get("/")
      .expect("Content-type", /text\/html/)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }
        res.status.should.equal(200);
        done();
      });
  });
});