const dotenv = require('dotenv');
dotenv.config();

const BOT_MANAGER_TOKEN = process.env.BOT_MANAGER_TOKEN;
const BOT_STAFF_TOKENS = JSON.parse(process.env.BOT_STAFF_TOKENS);
const MAX_COPY_PER_MINUTE = parseInt(process.env.MAX_COPY_PER_MINUTE);
const BLOCK_TIME = parseInt(process.env.BLOCK_TIME); // Thời gian block, tính bằng giây
const ID_GROUP_FIRST = parseInt(process.env.ID_GROUP_FIRST);
const ID_GROUP_SECOND = parseInt(process.env.ID_GROUP_SECOND);

module.exports = {
    BOT_MANAGER_TOKEN,
    BOT_STAFF_TOKENS,
    MAX_COPY_PER_MINUTE,
    BLOCK_TIME,
    ID_GROUP_FIRST,
    ID_GROUP_SECOND
}