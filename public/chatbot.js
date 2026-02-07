
const chatbot = document.getElementById("ws-chatbot");
const openBtn = document.getElementById("ws-open-btn");
const closeBtn = document.getElementById("ws-close");
const input = document.getElementById("ws-input");
const sendBtn = document.getElementById("ws-send");
const body = document.getElementById("ws-body");

const API_KEY = 'AIzaSyCWujraZuKviV1aGPJw2ksSD0GDcBro5wg';

// Chatbot Training Dataset: Q&A pairs based on We-hub website details
const chatbotDataset = [
  {
    question: "what is we-hub",
    answer: "We-hub is a comprehensive women safety platform designed to empower women with tools for personal security, emergency response, and community support. It provides instant access to safety features, emergency contacts, and resources to help users feel safer during daily activities."
  },
  {
    question: "how does the sos button work",
    answer: "The one-tap SOS button triggers immediate alerts to saved emergency contacts via SMS. It includes your location data and a Google Maps link for precise coordinates. You can save and manage emergency contact numbers in the popup interface."
  },
  {
    question: "what are the emergency helpline numbers",
    answer: "Verified helpline numbers include: Women Helpline: 1091, Emergency Services: 112, Domestic Violence Helpline: 181, Child Helpline: 1098. These are available in the Safety Resources popup."
  },
  {
    question: "how do i share my location",
    answer: "Use the 'Share Location' button to start real-time GPS tracking. Your location will be shared with trusted contacts or emergency services. It can also activate automatically during an SOS alert."
  },
  {
    question: "what safety tips do you have",
    answer: "Stay aware of your surroundings, maintain strong body posture, learn simple blocking and escape moves, know your rights under IPC Section 354, and have emergency contacts saved. Download our Emergency Guide PDF for more details."
  },
  {
    question: "how do i report an emergency",
    answer: "You can report emergencies via the dedicated form or one-tap SOS button. Include your name, location (GPS detected), description, and contact number. Alerts are sent to emergency services and stored for admin review."
  },
  {
    question: "what is the community support feature",
    answer: "Connect with a network of women who share experiences, provide help, and offer safety tips. It's designed to create stronger, safer communities through mutual support."
  },
  {
    question: "how do i sign up for we-hub",
    answer: "Click the 'Signup' button and fill in your personal details, email, phone, password, and emergency contacts. Your information is securely stored and passwords are hashed for protection."
  },
  {
    question: "what is the self-defense page",
    answer: "The self-defense page provides guidance on awareness, body posture, blocking moves, and legal rights. You can submit a form to express interest in training or get more information."
  },
  {
    question: "how does the chatbot work",
    answer: "I'm the Women Safety Assistant, powered by AI. I can provide advice on emergencies, helplines, reporting, self-defense, and safety tips. If I can't answer directly, I'll use external resources."
  },
  {
    question: "what features does we-hub have",
    answer: "Key features include: Live Location Sharing, One-Tap SOS, Alert Contacts, Safety Resources with helplines, Community Support, Emergency Reporting, Self-Defense Guidance, and a built-in Chatbot."
  },
  {
    question: "how do i contact support",
    answer: "Use the Contact form on the website to send inquiries, feedback, or support requests. You can also email support@We-hub.com or call +1 (555) 123-SAFE for 24/7 support."
  },
  {
    question: "is my data safe",
    answer: "Yes, We-hub prioritizes privacy and security. Passwords are hashed, location data is shared only with consent during emergencies, and all information complies with safety standards."
  },
  {
    question: "what is the emergency guide pdf",
    answer: "The downloadable Emergency Guide PDF contains detailed safety tips, legal information, self-defense techniques, and emergency procedures. Click the download button in the Resources section."
  },
  {
    question: "how does the map work",
    answer: "The integrated Google Maps shows your current location and nearby safe zones. It helps you identify secure areas and provides directions if needed."
  }
];

openBtn.onclick = () => chatbot.style.display = "flex";
closeBtn.onclick = () => chatbot.style.display = "none";

sendBtn.onclick = sendMsg;
input.addEventListener("keydown", e => e.key === "Enter" && sendMsg());

async function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  addMsg(text, "user-msg");
  input.value = "";

  setTimeout(async () => {
    const reply = await getBotReply(text.toLowerCase());
    addMsg(reply, "bot-msg");
  }, 400);
}

function addMsg(text, cls) {
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

async function getBotReply(msg) {
  // First, check the local dataset for a matching question
  const matchedQA = chatbotDataset.find(qa =>
    msg.includes(qa.question) || qa.question.includes(msg)
  );
  if (matchedQA) {
    return matchedQA.answer;
  }

  // If no match in dataset, fall back to Gemini API for dynamic responses
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful safety chatbot for women, providing advice on emergencies, helplines, reporting, self-defense,always ans in under 30 words and safety tips. Use the provided dataset for accurate responses about We-hub features when relevant. For general questions, provide smart, context-aware answers. Always prioritize safety and accuracy.\n\nDataset: ${JSON.stringify(chatbotDataset)}\n\nUser: ${msg}`
          }]
        }]
      })
    });

    if (!response.ok) {
      console.error('API response status:', response.status, response.statusText);
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error fetching bot reply:', error);
    return "Sorry, I'm having trouble responding right now. Please try again later or contact emergency services if needed.";
  }
}
