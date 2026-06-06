import crypto from "crypto";

const ADJECTIVES = [
  "LION",
  "FALCON",
  "EAGLE",
  "TIGER",
  "WOLF",
  "BISON",
  "OTTER",
  "PANDA",
  "KOALA",
  "RAVEN"
];

function randomInt(max: number) {
  return crypto.randomInt(0, max);
}

function checkDigit(str: string) {
  // simple stable checksum (not security, just typo detection)
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return String.fromCharCode(65 + (sum % 26));
}

export function generateToken() {
  const prefix = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const number = String(randomInt(9000) + 1000); // 1000–9999

  const base = `${prefix}-${number}`;
  const suffix = checkDigit(base);

  return `${base}-${suffix}`;
}
