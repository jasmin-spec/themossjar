import { ADMIN_WHATSAPP } from "../config";

const list = (a) => (a && a.length ? a.join(", ") : "none");

export function buildOrderMessage(order, user) {
  const owner = order.user && order.user.name ? order.user : user || {};
  const L = [];

  L.push("*New order - The Moss Jar*");
  L.push(`Order #${String(order._id).slice(-6)}`);
  L.push("");
  L.push(`Name: ${owner.name || ""}`);
  L.push(`WhatsApp: ${order.phone}`);
  if (owner.email) L.push(`Email: ${owner.email}`);
  L.push("");
  L.push("*Items*");

  order.items.forEach((item, i) => {
    const c = item.customisation || {};
    L.push(`${i + 1}. ${item.name} x ${item.quantity} = AED ${item.price * item.quantity}`);
    if (c.size === "ready-made") {
      L.push("   Ready-made (as shown in photo)");
    } else {
      L.push(`   Size: ${c.size}, Container: ${c.container}`);
      L.push(`   Plants: ${list(c.plants)}`);
      L.push(`   Theme: ${c.theme || "none"}`);
      L.push(`   Miniatures: ${list(c.miniatures)}`);
      L.push(`   Sculptures: ${list(c.sculptures)}`);
    }
    if (c.message) L.push(`   Gift message: ${c.message}`);
  });

  L.push("");
  L.push(`Items: AED ${order.itemsPrice}`);
  L.push(`Delivery fee: AED ${order.deliveryFee}`);
  L.push(`*Total: AED ${order.totalPrice}*`);
  L.push("");
  L.push(
    order.deliveryMode === "delivery"
      ? `Home delivery to: ${order.deliveryAddress}`
      : "Store pickup"
  );
  L.push(
    order.paymentStatus === "paid"
      ? "Payment: paid"
      : "Payment: pay on delivery / pickup"
  );

  return L.join("\n");
}

export const whatsappLink = (message) =>
  `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;