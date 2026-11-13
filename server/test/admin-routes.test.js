const test = require("node:test");
const assert = require("node:assert/strict");

process.env.ADMIN_USERNAME = "test-admin";
process.env.ADMIN_PASSWORD = "test-password";
process.env.ADMIN_TOKEN_SECRET = "test-secret-with-at-least-32-characters-long";

const { app } = require("../index");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  if (server) await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("admin login rejects incorrect credentials", async () => {
  const response = await fetch(`${baseUrl}/api/admin/adminLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test-admin", password: "wrong" }),
  });
  assert.equal(response.status, 401);
});

test("admin login issues a token and protected admin route accepts it", async () => {
  const loginResponse = await fetch(`${baseUrl}/api/admin/adminLogin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test-admin", password: "test-password" }),
  });
  assert.equal(loginResponse.status, 200);
  const { token } = await loginResponse.json();
  assert.ok(token);

  const protectedResponse = await fetch(`${baseUrl}/api/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(protectedResponse.status, 200);
  assert.deepEqual(await protectedResponse.json(), { authenticated: true, role: "admin" });
});

test("listing creation and application administration reject requests without admin token", async () => {
  const requests = [
    ["POST", "/api/job"],
    ["POST", "/api/internship"],
    ["GET", "/api/application"],
    ["PUT", "/api/application/507f1f77bcf86cd799439011"],
  ];

  for (const [method, path] of requests) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" || method === "PUT" ? JSON.stringify({}) : undefined,
    });
    assert.equal(response.status, 401, `${method} ${path} should require admin authentication`);
  }
});
