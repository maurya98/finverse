import crypto from "node:crypto";

export function verifySignature(
    payload: string,
    signature: string,
    secret: string
) {
    const expected = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
    );
}
