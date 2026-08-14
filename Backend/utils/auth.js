import crypto from "crypto";

const TOKEN_TTL_SECONDS = 24 * 60 * 60;

const getSecret = () => {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters long");
  }

  return secret;
};

const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

const decode = (value) =>
  JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

export const createAuthToken = (user) => {
  const payload = encode({
    sub: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  });

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
};

export const verifyAuthToken = (token) => {
  if (!token) return null;

  const [payload, signature] = token.split(".");

  if (!payload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return null;
  }

  const data = decode(payload);

  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return data;
};

export const requireAuth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    const user = verifyAuthToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to perform this action"
    });
  }

  next();
};
