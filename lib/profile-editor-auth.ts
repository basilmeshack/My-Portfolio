import "server-only"

import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const HASH_PREFIX = "scrypt"

function normalizePassword(password: string): string {
  return password.normalize("NFKC")
}

export function hashEditorPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = scryptSync(normalizePassword(password), salt, 64).toString("hex")
  return `${HASH_PREFIX}:${salt}:${derivedKey}`
}

export function verifyEditorPassword(password: string, encodedHash: string): boolean {
  const [prefix, salt, storedHash] = encodedHash.split(":")
  if (prefix !== HASH_PREFIX || !salt || !storedHash) {
    return false
  }

  const derivedKey = scryptSync(normalizePassword(password), salt, 64)
  const storedBuffer = Buffer.from(storedHash, "hex")

  if (derivedKey.length !== storedBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedKey, storedBuffer)
}
