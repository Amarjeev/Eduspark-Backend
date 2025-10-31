
require("dotenv").config();
const { Redis } = require("@upstash/redis");

// Create Redis client using Upstash REST credentials
const client = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = client;

