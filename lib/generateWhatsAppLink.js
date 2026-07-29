export function generateWhatsAppLink(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}