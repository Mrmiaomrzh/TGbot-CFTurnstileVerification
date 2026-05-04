# Telegram Bot with Cloudflare Turnstile Verification

A serverless Telegram Bot solution deployed on **Cloudflare Workers** and **Pages**. It enforces human verification via **Cloudflare Turnstile** before executing specific actions (e.g., sending sensitive files or payloads).

## Architecture Overview

The system bypasses the limitation of Telegram's inability to render JavaScript by using a web-based bridge:

1.  **Telegram Bot (Worker):** Receives `/start`, generates a unique verification link, and sends it to the user.
2.  **Verification Page (Pages):** A static HTML page hosting the Cloudflare Turnstile widget.
3.  **Validation & Action (Worker):** Once the user passes the challenge, the frontend sends the token to the Worker. The Worker validates the token with Cloudflare API and executes the final "Packet Send" or "File Send" action.

---

## Prerequisites

*   **Telegram Bot Token:** Obtained from [@BotFather](https://t.me/botfather).
*   **Cloudstile Keys:** A **Site Key** and **Secret Key** from the [Cloudflare Dashboard](https://dash.cloudflare.com/).
*   **Cloudflare Account:** Access to Workers and Pages.

---

## Project Structure

*   `/frontend`: Contains `index.html` (Deploy to **Cloudflare Pages**).
*   `/worker`: Contains `index.js` (Deploy to **Cloudflare Workers**).

---

## Setup Instructions

### 1. Deploy the Frontend (Pages)
1.  Upload `index.html` to Cloudflare Pages.
2.  Update the `data-sitekey` in `index.html` with your **Turnstile Site Key**.
3.  Update the `fetch()` URL in the script to point to your deployed Worker URL.

### 2. Deploy the Backend (Worker)
1.  Create a new Worker in the Cloudflare Dashboard.
2.  Paste the provided `index.js` code.
3.  **Crucial:** Navigate to **Settings -> Variables** and add the following:
    *   `BOT_TOKEN`: Your Telegram Bot API Token.
    *   `TURNSTILE_SECRET`: Your Turnstile Secret Key.
4.  Bind a **KV Namespace** named `BOT_DATA` if you enabled duplicate request prevention.

### 3. Set the Telegram Webhook
Register your Worker URL with Telegram by visiting this URL in your browser:
```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<YOUR_WORKER_DOMAIN>/webhook
```

---

## Security Notes

*   **Domain Whitelisting:** Ensure your Pages domain (`*.pages.dev`) is added to the Turnstile whitelist in the Cloudflare Dashboard.
*   **CORS:** The Worker includes `OPTIONS` handling to allow cross-origin requests from your Pages frontend.
*   **Environment Variables:** Never hardcode your `TURNSTILE_SECRET` or `Bot_Token` in the script. Always use Cloudflare Worker Variables.

---

## 🛠 Usage
1.  User sends `/start` to the Bot.
2.  Bot replies with a "Verify" button.
3.  User completes the Turnstile challenge in the browser.
4.  Upon success, the Bot automatically sends the target file/packet to the user in Telegram.
