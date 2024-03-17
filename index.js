const { BOT_STAFF_TOKENS } = require('./src/helper/constant')
const botManager = require('./src/models/BotManager');

// Khởi tạo Bot Manager và thêm các Bot Staff vào danh sách
BOT_STAFF_TOKENS.forEach(botToken => botManager.addBotStaff(botToken));