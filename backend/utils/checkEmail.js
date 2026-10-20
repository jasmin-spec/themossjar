const validator = require("validator");
const dns = require("dns").promises;

// A few well-known throwaway email services (not a complete list)
const DISPOSABLE = new Set([
  "mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com",
  "temp-mail.org", "yopmail.com", "trashmail.com", "sharklasers.com",
  "getnada.com", "throwawaymail.com", "maildrop.cc", "dispostable.com",
  "fakeinbox.com",
]);

// Stops a slow DNS lookup from hanging the request
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error("timeout"), { code: "ETIMEOUT" })), ms)
    ),
  ]);

const NO_DOMAIN = (code) => code === "ENODATA" || code === "ENOTFOUND";

async function checkEmail(rawEmail) {
  const email = String(rawEmail || "").trim().toLowerCase();

  if (!validator.isEmail(email)) {
    return { ok: false, message: "Please enter a valid email address" };
  }

  const domain = email.split("@")[1];

  if (DISPOSABLE.has(domain)) {
    return { ok: false, message: "Temporary email addresses are not accepted" };
  }

  const badDomain = { ok: false, message: "This email domain cannot receive email. Please check the spelling" };

  try {
    const mx = await withTimeout(dns.resolveMx(domain), 4000);
    if (mx && mx.length > 0) return { ok: true, email };
    return badDomain;
  } catch (err) {
    if (NO_DOMAIN(err.code)) {
      // No mail records: some small domains use a plain address record instead
      try {
        await withTimeout(dns.resolve4(domain), 4000);
        return { ok: true, email };
      } catch (err2) {
        if (NO_DOMAIN(err2.code)) return badDomain;
        return { ok: true, email };
      }
    }
    // A DNS problem on our side must never block a real customer
    return { ok: true, email };
  }
}

module.exports = checkEmail;