const crypto = require("crypto");
const https = require("https");

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "internarea-b947e";
const FIREBASE_CERT_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let certificateCache = { expiresAt: 0, certificates: null };

function decodeBase64Url(value) {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        if (response.statusCode !== 200) {
          reject(new Error(`Certificate request failed with status ${response.statusCode}`));
          return;
        }
        try {
          resolve({ data: JSON.parse(body), cacheControl: response.headers["cache-control"] || "" });
        } catch (error) {
          reject(error);
        }
      });
    });
    request.setTimeout(10000, () => request.destroy(new Error("Certificate request timed out")));
    request.on("error", reject);
  });
}

async function getFirebaseCertificates() {
  if (certificateCache.certificates && certificateCache.expiresAt > Date.now()) {
    return certificateCache.certificates;
  }

  const response = await getJson(FIREBASE_CERT_URL);
  const maxAgeMatch = response.cacheControl.match(/max-age=(\d+)/i);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;

  certificateCache = {
    certificates: response.data,
    expiresAt: Date.now() + Math.max(60, maxAgeSeconds) * 1000,
  };
  return certificateCache.certificates;
}

async function verifyFirebaseToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) throw new Error("Malformed Firebase token");

  const header = JSON.parse(decodeBase64Url(parts[0]).toString("utf8"));
  const payload = JSON.parse(decodeBase64Url(parts[1]).toString("utf8"));

  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported token algorithm");
  const now = Math.floor(Date.now() / 1000);
  const projectId = FIREBASE_PROJECT_ID;

  if (payload.aud !== projectId ||
      payload.iss !== `https://securetoken.google.com/${projectId}` ||
      typeof payload.sub !== "string" || !payload.sub ||
      !Number.isFinite(payload.exp) || payload.exp <= now ||
      !Number.isFinite(payload.iat) || payload.iat > now + 60) {
    throw new Error("Invalid Firebase token claims");
  }

  const certificates = await getFirebaseCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) throw new Error("Unknown Firebase signing key");

  const signature = decodeBase64Url(parts[2]);
  const signedContent = Buffer.from(`${parts[0]}.${parts[1]}`);
  const valid = crypto.verify("RSA-SHA256", signedContent, certificate, signature);
  if (!valid) throw new Error("Invalid Firebase token signature");

  return {
    uid: payload.sub,
    email: payload.email || "",
    name: payload.name || "",
    picture: payload.picture || "",
    phoneNumber: payload.phone_number || "",
  };
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

async function requireUser(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    req.user = await verifyFirebaseToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired user session" });
  }
}

function createAdminToken(username) {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_TOKEN_SECRET must be configured with at least 32 characters");
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    role: "admin",
    iat: now,
    exp: now + (8 * 60 * 60),
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyAdminToken(token) {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret || secret.length < 32) return false;

  const parts = String(token || "").split(".");
  if (parts.length !== 2) return false;

  const expected = crypto.createHmac("sha256", secret).update(parts[0]).digest();
  const actual = decodeBase64Url(parts[1]);
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return false;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[0]).toString("utf8"));
    const now = Math.floor(Date.now() / 1000);
    return payload.role === "admin" &&
      typeof payload.sub === "string" &&
      Number.isFinite(payload.exp) &&
      payload.exp > now;
  } catch (error) {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const token = getBearerToken(req);
  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  req.admin = { role: "admin" };
  return next();
}

module.exports = {
  requireUser,
  requireAdmin,
  createAdminToken,
  verifyFirebaseToken,
  verifyAdminToken,
};
