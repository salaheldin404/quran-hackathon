import crypto from "crypto";

// --- Constants ---
const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH = 16; 
const AUTH_TAG_LENGTH = 16; 
const KEY_LENGTH = 32;

function loadKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("TOKEN_ENCRYPTION_KEY environment variable is not set");
  }

  const key = Buffer.from(raw, "hex");
  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `TOKEN_ENCRYPTION_KEY must decode to ${KEY_LENGTH} bytes (got ${key.length})`,
    );
  }

  return key;
}

// Cached after first successful load
let _key: Buffer | undefined;
function getKey(): Buffer {
  return (_key ??= loadKey());
}

export function encryptToken(token: string): string {
  if (!token) {
    throw new Error("Token must be a non-empty string");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const ciphertext = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    ciphertext.toString("hex"),
  ].join(":");
}

export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error("Encrypted token must be a non-empty string");
  }

  const parts = encryptedToken.split(":");
  if (parts.length !== 3) {
    throw new Error(
      `Invalid encrypted token format: expected 3 parts, got ${parts.length}`,
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getKey(),
      Buffer.from(ivHex, "hex"),
      { authTagLength: AUTH_TAG_LENGTH },
    );

    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextHex, "hex")),
      decipher.final(),
    ]);

    return plaintext.toString("utf8");
  } catch (err) {
    // Avoid leaking crypto internals; signal tamper or corruption clearly
    throw new Error("Token decryption failed: invalid or tampered data", {
      cause: err,
    });
  }
}

