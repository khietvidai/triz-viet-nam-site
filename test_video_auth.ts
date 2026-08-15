import { createSessionToken, verifySessionToken } from "./src/lib/videoAuth.js";

async function run() {
    const secret = "test-secret-key-12345678901234567890";
    const email = "test@example.com";
    const token = await createSessionToken(secret, email);
    const verifiedEmail = await verifySessionToken(secret, token);
    if (verifiedEmail !== email) {
        throw new Error(`Expected ${email}, got ${verifiedEmail}`);
    }
    console.log("Session token verification: PASS");
}
run().catch((err) => {
    console.error(err);
    process.exit(1);
});
