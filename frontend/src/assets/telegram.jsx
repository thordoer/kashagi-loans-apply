export async function sendToTelegram(message) {
  const token = import.meta.env.VITE_TG_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TG_CHAT_ID;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
}
