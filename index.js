import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';

const BOT_TOKEN = 'my bot token';
const bot = new Telegraf(BOT_TOKEN);

const userIntervals = new Map();
const awaitingIntervals = new Set();

async function getBTCPrice() {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=czk,eur,usd');
    const data = await res.json();
    return data.bitcoin;
}

async function getBTCInfo(currency) {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
    const data = await res.json();
    return {
        price: data.market_data.current_price[currency],
        change24: data.market_data.price_change_percentage_24h_in_currency[currency],
        change7: data.market_data.price_change_percentage_7d_in_currency[currency],
        change30: data.market_data.price_change_percentage_30d_in_currency[currency],
        changeY: data.market_data.price_change_percentage_1y_in_currency[currency],
        low_24h: data.market_data.low_24h[currency],
        high_24h: data.market_data.high_24h[currency],
        ath: data.market_data.ath[currency],
        ath_date: data.market_data.ath_date[currency],
        ath_change_percentage: data.market_data.ath_change_percentage[currency],
        last_updated: data.market_data.last_updated,
    };
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function getStartDate(interval, hour=22) {
    let startDate = new Date();
    startDate.setDate(startDate.getDate() + interval);
    startDate.setHours(hour, 0, 0, 0);
    return startDate;
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}

async function showHelp(ctx) {
    await ctx.reply(
        "*📖 Available Commands:*\n" +
        "*/help* - Show this help message\n" +
        "*/info {currency}* - Get information about price, changes, ATH and more.\n" +
        "  _Example:_ `/info usd`\n" +
        "*/price* - Get current BTC prices\n" +
        "*/start* - Start sending *info* in desired intervals\n" +
        "*/stop* - Stop sending *info* messages\n",
        { parse_mode: 'Markdown' }
    );
}

bot.command('help', (ctx) => {
    showHelp(ctx);
});

bot.command('price', async (ctx) => {
    try {
        const prices = await getBTCPrice();
        await ctx.reply(
            `💰 *BTC Prices:*\n` +
            `🇨🇿 ${formatPrice(prices.czk)} CZK\n` +
            `🇪🇺 ${formatPrice(prices.eur)} EUR\n` +
            `🇺🇸 ${formatPrice(prices.usd)} USD`,
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        await ctx.reply("⚠️ *Error loading prices...*", { parse_mode: 'Markdown' });
    }
});

bot.command('info', async (ctx) => {
    const text = ctx.message.text || '';
    const args = text.split(' ');
    const currency = (args[1] || 'usd').toLowerCase();

    if (!['czk', 'eur', 'usd'].includes(currency)) {
        await ctx.reply("❗ *Please specify a valid currency:* _czk_, _eur_, or _usd_.", { parse_mode: 'Markdown' });
        return;
    }

    try {
        const data = await getBTCInfo(currency);
        data.change24 = data.change24.toFixed(2);
        data.change7 = data.change7.toFixed(2);
        data.change30 = data.change30.toFixed(2);
        data.changeY = data.changeY.toFixed(2);
        data.ath_change_percentage = data.ath_change_percentage.toFixed(2);

        data.price = data.price.toFixed(0);
        data.low_24h = data.low_24h.toFixed(0);
        data.high_24h = data.high_24h.toFixed(0);
        data.ath = data.ath.toFixed(0);

        await ctx.reply(
            "📊 *BTC Info:*\n" +
            `*Current Price:* ${formatPrice(data.price)} ${currency.toUpperCase()}\n` +
            `*Changes:* ${data.change24}% (24h), ${data.change7}% (7d), ${data.change30}% (30d), ${data.changeY}% (1y)\n\n` +
            `*24h Low:* ${formatPrice(data.low_24h)} ${currency.toUpperCase()}  |  *24h High:* ${formatPrice(data.high_24h)} ${currency.toUpperCase()}\n\n` +
            `*ATH was on:* ${new Date(data.ath_date).toLocaleDateString()} at ${formatPrice(data.ath)} ${currency.toUpperCase()}\n` +
            `*Change since ATH:* ${data.ath_change_percentage}%\n\n` +
            `*Data Last Updated:* ${new Date(data.last_updated).toLocaleString()}`,
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        await ctx.reply("⚠️ *Error loading BTC info...*", { parse_mode: 'Markdown' });
    }
});

bot.command('start', (ctx) => {
    ctx.reply(
        "🕒 *Please enter the interval in days*, the fiat currency, and the hour when you want to receive BTC updates.\n\n" +
        "_Example:_ `7 usd 22`\n\n" +
        "This will send you BTC info every *7 days* at *22:00* in *USD*.\n\n" +
        "• Number of days must be greater than 0 and a whole number\n" +
        "• You can use *usd*, *eur*, or *czk* as the currency\n" +
        "• If you want to receive updates at a different hour, specify it as the third argument (default is 22 at market close). Must be a whole number.",
        { parse_mode: 'Markdown' }
    );
    awaitingIntervals.add(ctx.from.id);
});

bot.command('stop', (ctx) => {
    if (userIntervals.has(ctx.from.id)) {
        userIntervals.delete(ctx.from.id);
        ctx.reply("🛑 *You have stopped receiving BTC updates.*", { parse_mode: 'Markdown' });
    } else {
        ctx.reply("ℹ️ *You are not currently receiving BTC updates.*", { parse_mode: 'Markdown' });
    }
});

bot.on('text', async (ctx) => {
    if (!awaitingIntervals.has(ctx.from.id)) {
        await ctx.reply("❓ *Unknown command.*");
        showHelp(ctx);
        return;
    }
    try {
        const text = ctx.message.text || '';
        const args = text.split(' ');

        const interval = parseInt(args[0]);
        const currency = (args[1] || 'usd').toLowerCase();
        const hour = parseInt(args[2]) || 22;

        if (
            isNaN(interval) || interval <= 0 || !Number.isInteger(interval) ||
            !['usd', 'eur', 'czk'].includes(currency) ||
            isNaN(hour) || hour < 0 || hour > 23 || !Number.isInteger(hour)
        ) {
            console.log(`Invalid input: ${text}`);
            await ctx.reply(
                "❌ *Invalid input.* Please use the format:\n" +
                "`interval currency hour`\n\n" +
                "_Example:_ `7 usd 22`\n\n" +
                "• Number of days must be greater than 0 and a whole number\n" +
                "• You can use *usd*, *eur*, or *czk* as the currency\n" +
                "• Hour must be a whole number between 0 and 23",
                { parse_mode: 'Markdown' }
            );
            return;
        }

        let startDate = new Date();
        startDate.setHours(22, 0, 0, 0);
        const now = new Date();
        if (now >= startDate) {
            startDate = getStartDate(interval, hour);
            console.log(`Adjusted start date: ${formatDate(startDate)}`);
        }

        userIntervals.set(ctx.from.id, {
            interval: interval,
            startDate: startDate,
            currency: currency
        });

        awaitingIntervals.delete(ctx.from.id);
        await ctx.reply(
            `✅ You will receive BTC info every *${interval}* day(s) in *${currency}*.\n` +
            `To stop receiving updates, use the /stop command.\n` +
            `To edit the interval, use the /start command again.\n` +
            `First update will be sent on *${formatDate(startDate)}*.`,
            { parse_mode: 'Markdown' }
        );
    } catch (err) {
        console.log(`Error parsing input: ${err}`);
        await ctx.reply(
            "⚠️ *Error parsing input.* Please use the format:\n" +
            "`interval currency hour`\n\n" +
            "_Example:_ `7 usd 22`",
            { parse_mode: 'Markdown' }
        );
    }
});

bot.launch();

console.log('Bot is up...');
