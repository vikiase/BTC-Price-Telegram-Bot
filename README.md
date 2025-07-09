# BTC-Price-Telegram-Bot
![image](https://github.com/user-attachments/assets/4813fc24-9ce6-427a-84f7-e8cae70f06bd)

## Description
This project is a Telegram bot that provides Bitcoin (BTC) price updates and detailed information about its market performance. The bot allows users to:
- Retrieve current BTC prices in CZK, EUR, and USD.
- Get detailed BTC market data, including price changes, all-time high (ATH) information, and more.
- Set up periodic notifications to receive BTC updates at specified intervals and times.
- Stop receiving updates at any time.

The bot interacts with the [CoinGecko API](https://www.coingecko.com/) to fetch real-time Bitcoin data and uses the [Telegraf](https://telegraf.js.org/) library to manage Telegram bot commands and interactions.

## Where to try?
You can ty to interact yourself with the bot via telegram. Find him by username: @v_btcPrice_bot

## Features
- **Commands**:
  - `/help`: Displays available commands and usage instructions.
  - `/price`: Fetches and displays current BTC prices in CZK, EUR, and USD.
  - `/info {currency}`: Provides detailed BTC market data for the specified currency (CZK, EUR, or USD).
  - `/start`: Allows users to set up periodic notifications for BTC updates.
  - `/stop`: Stops periodic notifications for BTC updates.
- **Periodic Notifications**: Users can specify the interval (in days), currency, and hour for receiving BTC updates.
- **Error Handling**: The bot provides clear feedback for invalid inputs and handles API errors gracefully.

## Technologies Used
- **Programming Language**: JavaScript
- **Package Manager**: npm
- **Libraries**:
  - `telegraf`: For Telegram bot functionality.
  - `node-fetch`: For making HTTP requests to the CoinGecko API.
- **API**: CoinGecko API for real-time Bitcoin data.

## Knowledge Demonstrated
In this project, I demonstrated following skills:
- **JavaScript ES6+**:
  - Usage of `async/await` for asynchronous operations.
  - Modular code structure with `import` statements.
  - String manipulation and formatting.
- **Telegram Bot Development**:
  - Handling user commands and interactions using the Telegraf library.
  - Managing user-specific data with `Map` and `Set`.
- **API Integration**:
  - Fetching and processing data from the CoinGecko API.
  - Error handling for API requests.
- **Date and Time Management**
- **Regular Expressions**:
  - Formatting numbers for better readability.
- **User Input Validation**:
  - Validating user-provided intervals, currencies, and hours.

