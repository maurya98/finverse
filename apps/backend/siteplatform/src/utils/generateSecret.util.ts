import crypto from "node:crypto";

export function generateSecret() {
    return crypto.randomBytes(32).toString("hex");
}