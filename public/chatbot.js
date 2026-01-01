
const chatbot = document.getElementById("ws-chatbot");
const openBtn = document.getElementById("ws-open-btn");
const closeBtn = document.getElementById("ws-close");
const input = document.getElementById("ws-input");
const sendBtn = document.getElementById("ws-send");
const body = document.getElementById("ws-body");

openBtn.onclick = () => chatbot.style.display = "flex";
closeBtn.onclick = () => chatbot.style.display = "none";

sendBtn.onclick = sendMsg;
input.addEventListener("keydown", e => e.key === "Enter" && sendMsg());

function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user-msg");
  input.value = "";

  setTimeout(() => {
    addMsg(getBotReply(text.toLowerCase()), "bot-msg");
  }, 400);
}

function addMsg(text, cls) {
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function getBotReply(msg) {
  msg = (msg || "").toLowerCase();
  msg = msg.replace(/[^a-z0-9\s]/g, " "); // keep letters and numbers

  // Expanded keywords and datasets
  const dangerWords = ["danger", "unsafe", "help now", "help now!", "attacked", "attack"];
  const emergencyWords = ["emergency", "urgent", "immediate" ];
  const helplineWords = ["helpline", "hotline", "number", "contact number", "call"];
  const harassmentWords = ["harassment", "stalking", "molest", "harass", "harassed"];
  const domesticWords = ["domestic", "violence", "abuse", "husband", "partner", "boyfriend"];
  const lawWords = ["law", "rights", "legal", "police", "FIR", "report"];
  const selfDefWords = ["self defense", "self-defence", "self defense", "defend", "protect myself", "selfdefence"];
  const safetyWords = ["safety", "tips", "precaution", "secure", "stay safe"];
  const aboutWords = ["about", "what is this", "what is this site", "site", "website", "purpose"];
  const featuresWords = ["features", "what can this site do", "capabilities", "services"];
  const reportHowWords = ["how to report", "report", "file a complaint", "file an FIR", "how to register"];
  const contactWords = ["contact", "email", "reach", "support"];
  const resourcesWords = ["resources", "help", "ngo", "shelter", "counseling", "support group"];

  // Helper for matching
  function hasAny(list) {
    return list.some(w => msg.includes(w));
  }

  // Immediate danger / emergency
  if (hasAny(dangerWords) || hasAny(emergencyWords)) {
    return "🚨 If you are in immediate danger:\n• Call your local emergency number (India: 112).\n• Move to a safe, populated area if possible.\n• Share your live location with someone you trust.\n• If possible, call the helpline below for support.";
  }

  // Helplines
  if (hasAny(helplineWords) || hasAny(resourcesWords)) {
    return "📞 Helplines & support:\n• Emergency (India): 112\n• Women helpline (India): 181\n• Anti-human trafficking: 1091\nIf you are outside India, please call your country's emergency services. You can also visit the 'Self Defence' page or contact local NGOs listed on this site.";
  }

  // Harassment / stalking
  if (hasAny(harassmentWords) || hasAny(domesticWords)) {
    return "Harassment or abuse is a crime. Steps you can take:\n• Preserve evidence (messages, photos).\n• File a police report or FIR.\n• Contact a local NGO or shelter for confidential support.\n• Call helplines listed here for immediate assistance.";
  }

  // Legal / reporting
  if (hasAny(lawWords) || hasAny(reportHowWords)) {
    return "To report an incident:\n• Note date/time/location and any witness names.\n• Keep copies of messages or evidence.\n• Visit your local police station to file a complaint (FIR in India).\n• If you want confidential help, contact a local NGO for guidance.";
  }

  // Self-defence
  if (hasAny(selfDefWords) || msg.includes("selfdefence")) {
    return `🥋 Self-defence resources and tips are available on this site: ${window.location.origin + window.location.pathname.replace(/[^\/]+$/, '')}selfdefence.html\nBasic tips: aim for eyes/nose/throat, use loud voice, run to safety.`;
  }

  // Safety tips
  if (hasAny(safetyWords)) {
    return "💡 Safety tips:\n• Keep your phone charged and carry a power bank.\n• Share your trip details with someone trusted.\n• Avoid isolated places at night.\n• Learn basic escape moves and trust your instincts.";
  }

  // About the website / features
  if (hasAny(aboutWords) || hasAny(featuresWords)) {
    return "This website helps with personal safety for women: safety tips, self-defence guidance, helpline numbers, a reporting mechanism, and an admin dashboard for alerts. You can view the Self Defence page and use the chatbot for quick help.";
  }

  // Contact / support
  if (hasAny(contactWords)) {
    return "Contact & support:\n• For technical site issues, check the admin section if you are an admin.\n• For safety support, use the helplines above or reach local NGOs.\n• This site does not replace emergency services.";
  }

  // Greetings
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) return "Hello 👋 I’m here to help you stay safe. Ask about helplines, reporting, or self-defence.";

  // If user asks about pages directly
  if (msg.includes("selfdefence") || msg.includes("self defence")) return `See self-defence resources: ${window.location.origin + window.location.pathname.replace(/[^\/]+$/, '')}selfdefence.html`;
  if (msg.includes("admin") || msg.includes("dashboard")) return "Admin pages: use the Admin Login (if you have credentials) to manage alerts and users.";

  // Default fallback with suggestions
  return "I can help with:\n• Emergency help and helplines\n• Safety tips and self-defence resources\n• How to report incidents\n• Where to find shelters and NGOs\nPlease ask clearly (for example: 'How do I report harassment?' or 'Show self defence tips').";
}
