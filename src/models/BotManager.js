const TelegramBot = require('node-telegram-bot-api');
const { 
    BLOCK_TIME,
    MAX_COPY_PER_MINUTE,
    ID_GROUP_FIRST,
    ID_GROUP_SECOND,
} = require('../helper/constant')

class BotManager {
    constructor() {
        this.botStaffs = [];
        this.botIds = [];
        this.blockedBots = new Set();
        this.lastMinuteMsgCount = new Map();
        this.chatIdFirst = ID_GROUP_FIRST;
        this.chatIdSecond = ID_GROUP_SECOND;
        this.messageQueue = {};
        this.processingMessage = false;
    }

    // Xử lý tin nhắn từ Bot Manager
    handleMessage(msg, botId) {
        this.setChatId(msg.chat.id);
        
        if(!this.chatIdSecond) {
            return;
        }

        const message = {
            fromChatId: msg.chat.id,
            toChatId: msg.chat.id == this.chatIdFirst ? this.chatIdSecond : this.chatIdFirst,
            messageId: msg.message_id,
            caption: msg.caption || '',
            text: msg.text,
        };

        // Xử lý tin nhắn từ Bot Manager và thêm vào hàng đợi
        if(this.messageQueue[botId]) {
            this.messageQueue[botId].push(message);
        } else {
            this.messageQueue[botId] = [message];
        }

        // Kiểm tra xem có đang xử lý tin nhắn hay không
        if (!this.processingMessages) {
            this.processMessages();
        }
    }

    // Phân phối tin nhắn cho các Bot Staff
    distributeMessage(message, availableBot) {

        if (this.botStaffs.length === 0) {
            console.log("No available Bot Staff.");
            return false;
        }

        availableBot.bot.copyMessage(message.toChatId, message.fromChatId, message.messageId, { caption: message.caption })
            .then(() => {
                this.shiftAllQueue();
                this.checkBot(availableBot);
                return true;
            })
            .catch((error) => {
                if(error.message.includes('ETELEGRAM: 429 Too Many Requests')) {
                    this.blockBot(availableBot.botId);
                    this.processMessages();
                    console.error('Error copying message:', error.message);
                    throw error;
                }
            });

    }

    shiftAllQueue() {
        this.botIds.forEach((botId) => {
            this.messageQueue[botId].shift()
        })
    }
 
    checkBot(availableBot) {
        const currentMinute = Math.floor(Date.now() / 1000 / 60);
        const msgCount = this.lastMinuteMsgCount.get(availableBot.botId) || 0;
        if (currentMinute === availableBot.lastMinute) {
            this.lastMinuteMsgCount.set(availableBot.botId, msgCount + 1);
        } else {
            this.lastMinuteMsgCount.set(availableBot.botId, 1);
            availableBot.lastMinute = currentMinute;
        }

        if (msgCount + 1 >= MAX_COPY_PER_MINUTE) {
            this.blockBot(availableBot.botId);
        }
        
    }

    // Block Bot trong một khoảng thời gian
    blockBot(botId) {
        this.blockedBots.add(botId);
        setTimeout(() => {
            this.unblockBot(botId);
        }, BLOCK_TIME * 1000);
    }

    // Unblock Bot sau khi hết thời gian block
    unblockBot(botId) {
        this.blockedBots.delete(botId);
        this.lastMinuteMsgCount.delete(botId);
        const botIndex = this.botStaffs.findIndex(bot => bot.botId === botId);
        if (botIndex !== -1) {
            this.botStaffs[botIndex].lastMinute = null; // Reset lastMinute
        }
    }

    getAvailableBot() {
        // Kiểm tra xem Bot nào có thể nhận tin nhắn
        const availableBot = this.botStaffs.find(bot => !this.blockedBots.has(bot.botId));
        if (!availableBot) {
            console.log("All Bot Staffs are blocked.");
            return;
        }

        return availableBot;
    }

    // Thêm Bot Staff vào danh sách
    addBotStaff(botToken) {
        const bot = new TelegramBot(botToken, { polling: { params: { limit: 10, timeout: 1 }} });
        bot.getMe().then((user) => { 
            const botId = user.id;
            this.botIds.push(botId);
            bot.on('message', (msg) => {
                this.handleMessage(msg, botId) 
            });
            
            this.botStaffs.push({ bot, token: botToken, lastMinute: null, botId});
        }).catch((error) => {
            console.log('TOKEN BOT::', botToken);
            console.log(error);
        })
    }

    setChatId(chatId) {
        if(this.chatIdFirst && this.chatIdSecond) {
            return;
        }

        if (!this.chatIdFirst) {
            this.chatIdFirst = chatId;
            console.log(`ID_GROUP_FIRST:: ${chatId}`);
        } else if(!this.chatIdSecond && this.chatIdFirst !== chatId) {
            this.chatIdSecond = chatId;
            console.log(`ID_GROUP_SECOND:: ${chatId}`);
        } else {
            console.log(`Error: User ${chatId} sent message from unexpected group`);
            return;
        }
    }

    processMessages() {
        const availableBot = this.getAvailableBot();
        const desiredLength = 10;
        this.processingMessages = true;
        if(this.messageQueue[availableBot.botId]) {
            const actualLength = Math.min(desiredLength,  this.messageQueue[availableBot.botId].length);
            const messagesToProcess = this.messageQueue[availableBot.botId].splice(0, actualLength);
    
            for (const msg of messagesToProcess) {
                try {
                    this.distributeMessage(msg, availableBot);
                } catch (error) {
                    break;
                }
            }
            if (this.messageQueue[availableBot.botId].length > 0) {
                setTimeout(() => {
                    this.processMessages();
                }, 5000);
            }
        }
        this.processingMessages = false;
    }
}
 module.exports = new BotManager()
