const dotenv = require('dotenv');
dotenv.config();

const BOT_MANAGER_TOKEN = process.env.BOT_MANAGER_TOKEN;
const BOT_STAFF_TOKENS = JSON.parse(process.env.BOT_STAFF_TOKENS);
const MAX_COPY_PER_MINUTE = parseInt(process.env.MAX_COPY_PER_MINUTE);
const BLOCK_TIME = parseInt(process.env.BLOCK_TIME); // Thời gian block, tính bằng giây

module.exports = {
    BOT_MANAGER_TOKEN,
    BOT_STAFF_TOKENS,
    MAX_COPY_PER_MINUTE,
    BLOCK_TIME,
}