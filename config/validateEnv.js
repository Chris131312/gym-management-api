const { isValidTimezone } = require("../utils/dates");

function validateEnv() {
  const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("\n FATAL: Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\n Check your .env file against .env.example\n");
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      "\n WARNING: JWT_SECRET is shorter than 32 characters. Generate a strong one with:\n" +
        "   node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\"\n",
    );
  }

  if (process.env.GYM_TIMEZONE && !isValidTimezone(process.env.GYM_TIMEZONE)) {
    console.error(
      `\n FATAL: GYM_TIMEZONE "${process.env.GYM_TIMEZONE}" is not a valid IANA timezone (e.g. America/Mexico_City)\n`,
    );
    process.exit(1);
  }

  console.log(" Environment variables validated successfully.");
}

module.exports = validateEnv;
