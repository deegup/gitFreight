import { config } from "./config";

export async function sendDriverNotification(phone: string, body: string) {
  if (!config.WHATSAPP_ACCESS_TOKEN || !config.WHATSAPP_PHONE_NUMBER_ID) return { status: "preview", phone, body };
  const response = await fetch(`https://graph.facebook.com/v20.0/${config.WHATSAPP_PHONE_NUMBER_ID}/messages`, { method: "POST", headers: { Authorization: `Bearer ${config.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: phone.replace(/^\+/, ""), type: "template", template: { name: config.WHATSAPP_TEMPLATE_NAME, language: { code: "en" }, components: [{ type: "body", parameters: [{ type: "text", text: body }] }] } }) });
  if (!response.ok) throw new Error(`WhatsApp request failed: ${response.status}`);
  return { status: "sent", response: await response.json() };
}
