// Must be required before any app module: provides env without a real database
process.env.DATABASE_URL ||= "postgresql://test:test@127.0.0.1:1/test";
process.env.JWT_SECRET ||= "test-secret-test-secret-test-secret-123456";
process.env.NODE_ENV = "test";
