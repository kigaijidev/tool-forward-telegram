const TelegramBot = require('node-telegram-bot-api');
const { 
    BLOCK_TIME, 
    BOT_MANAGER_TOKEN, 
    MAX_COPY_PER_MINUTE 
} = require('../helper/constant')

class BotManager {
    constructor() {
        this.botStaffs = [];
        this.blockedBots = new Set();
        this.lastMinuteMsgCount = new Map();
        this.chatIdFirst;
        this.chatIdSecond;
        this.messageQueue = [];
        this.processingMessage = false;

        if(BOT_MANAGER_TOKEN) {
            // Khởi tạo Bot Manager
            this.managerBot = new TelegramBot(BOT_MANAGER_TOKEN, { polling: { params: { limit: 10, timeout: 2 }} });
            this.managerBot.on('message', (msg) => this.handleMessage(msg));
        } else {
            console.log('NOT FOUND BOT MANAGER TOKEN');
        }

    }

    // Xử lý tin nhắn từ Bot Manager
    handleMessage(msg) {
        this.setChatId(msg.chat.id);
        
        if(!this.chatIdSecond) {
            return;
        }

        const message = {
            fromChatId: msg.chat.id,
            toChatId: msg.chat.id == this.chatIdFirst ? this.chatIdSecond : this.chatIdFirst,
            messageId: msg.message_id,
            caption: msg.caption || '',
            message: msg
        };

        // Xử lý tin nhắn từ Bot Manager và thêm vào hàng đợi
        this.messageQueue.push(message);


        // Kiểm tra xem có đang xử lý tin nhắn hay không
        if (!this.processingMessages) {
            this.processMessages();
        }
    }

    // Phân phối tin nhắn cho các Bot Staff
    distributeMessage(message) {

        if (this.botStaffs.length === 0) {
            console.log("No available Bot Staff.");
            return;
        }

        // Kiểm tra xem Bot nào có thể nhận tin nhắn
        let availableBot = this.botStaffs.find(bot => !this.blockedBots.has(bot.token));
        if (!availableBot) {
            console.log("All Bot Staffs are blocked.");
            return;
        }

        availableBot.bot.copyMessage(message.toChatId, message.fromChatId, message.messageId, { caption: message.caption })
            .then((copiedMessage) => {
                console.log('Message copied successfully:', copiedMessage);
            })
            .catch((error) => {
                if(error.message.includes('ETELEGRAM: 429 Too Many Requests')) {
                    this.blockBot(availableBot.token);
                    this.distributeMessage(message);
                }
                console.log('ERROR', message)
                console.error('Error copying message:', error.message);
            });

        const currentMinute = Math.floor(Date.now() / 1000 / 60);
        const msgCount = this.lastMinuteMsgCount.get(availableBot.token) || 0;
        if (currentMinute === availableBot.lastMinute) {
            this.lastMinuteMsgCount.set(availableBot.token, msgCount + 1);
        } else {
            this.lastMinuteMsgCount.set(availableBot.token, 1);
            availableBot.lastMinute = currentMinute;
        }

        if (msgCount + 1 >= MAX_COPY_PER_MINUTE) {
            this.blockBot(availableBot.token);
        }
    }

    // Block Bot trong một khoảng thời gian
    blockBot(botToken) {
        this.blockedBots.add(botToken);
        setTimeout(() => {
            this.unblockBot(botToken);
        }, BLOCK_TIME * 1000);
    }

    // Unblock Bot sau khi hết thời gian block
    unblockBot(botToken) {
        this.blockedBots.delete(botToken);
        this.lastMinuteMsgCount.delete(botToken);
        const botIndex = this.botStaffs.findIndex(bot => bot.token === botToken);
        if (botIndex !== -1) {
            this.botStaffs[botIndex].lastMinute = null; // Reset lastMinute
        }
    }

    // Thêm Bot Staff vào danh sách
    addBotStaff(botToken) {

        if(botToken === BOT_MANAGER_TOKEN) {
            this.botStaffs.push({ bot: this.managerBot, token: botToken, lastMinute: null });
            return;
        }

        const bot = new TelegramBot(botToken, { polling: { params: { limit: 10, timeout: 2 }} });
        bot.on('message', (msg) => { });
        this.botStaffs.push({ bot, token: botToken, lastMinute: null });
    }

    setChatId(chatId) {
        if(this.chatIdFirst && this.chatIdSecond) {
            return;
        }

        if (!this.chatIdFirst) {
            this.chatIdFirst = chatId;
            console.log(`Set ${chatId} added to group chatIdFirst`);
        } else if(!this.chatIdSecond && this.chatIdFirst !== chatId) {
            this.chatIdSecond = chatId;
            console.log(`Set ${chatId} added to group chatIdSecond`);
        } else {
            console.log(`Error: User ${chatId} sent message from unexpected group`);
            return;
        }
    }

    processMessages() {

        this.processingMessages = true;
        const messagesToProcess = this.messageQueue.splice(0, 13);

        messagesToProcess.forEach((msg, idx) => {
            setTimeout(() => this.distributeMessage(msg), idx * 1500);
        });

        this.processingMessages = false;
        if (this.messageQueue.length > 0) {
            setTimeout(() => {
                this.processMessages();
            }, 10000);
        }
    }
}
 module.exports = new BotManager()
