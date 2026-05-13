require("dotenv").config();

const validateEnv = require("./config/validateEnv");
validateEnv();

const express = require("express");
const cors = require("cors");
const poll = require("./config/db");

const validate = require("./middleware/validate");
const asyncHandler = require("./middleware/asyncHandler");
const errorHandler = require("./middleware/errorHandler");

const {
  createMemberSchema,
  updatedMemberSchema,
} = require("./schemas/memberSchema");
const { NotfoundError, ForbiddenError } = require("./utils/errors");

const app = express();
const PORT = process.env.PORT || 3000;
