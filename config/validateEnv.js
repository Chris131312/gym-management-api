function validateEnv() {
  const requiredEnvVars = ["DATABASE_URL"];

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("\n FATAL: Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error("\n Check your .env file against .env.example\n");
    process.exit(1);
  }

  console.log(" Environment variables validated successfully.");
}

module.exports = validateEnv;
