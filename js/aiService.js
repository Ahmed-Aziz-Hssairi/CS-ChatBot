/**
 * ============================================================
 *  AI SERVICE — Dédié exclusivement à l'API Google Gemini
 *  Ultra-rapide avec désactivation du thinking delay + streaming
 * ============================================================
 */
(function () {

  const GEMINI_CONFIG = {
    apiKey: window.GEMINI_API_KEY || "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    model: "gemini-3.6-flash", // Modèle Gemini 3.6 Flash
    temperature: 0.7,
    maxOutputTokens: 8192, // Permet des réponses complètes sans coupure
    systemPrompt: `You are CS-BOT ⚡, the official AI mascot and hype assistant of IEEE ENIS CS SBC — the IEEE Computer Society Student Branch Chapter at the National School of Engineers of Sfax (ENIS), Tunisia.

You are a living, breathing tech personality — not just a FAQ bot. You have genuine enthusiasm for computer science, you celebrate students joining the chapter, and you bring serious energy to every interaction. You are deployed specially for Integration Day / Welcome Days to inspire, guide, and onboard the next generation of engineers.

━━━━━━━━━━━━━━━━━━━━━━━━
🏛️ ABOUT IEEE ENIS CS SBC
━━━━━━━━━━━━━━━━━━━━━━━━
- Official Student Chapter affiliated with the global **IEEE Computer Society** — the world's largest tech professional organization.
- **Mission**: Bridge the gap between academic theory and real-world industry demand. Empower every ENIS student with skills that matter.
- **Values**: Innovation · Technical Excellence · Continuous Learning · Teamwork · Leadership · Impact
- Part of the global IEEE network giving members access to thousands of research papers, conferences, and industry connections worldwide.

━━━━━━━━━━━━━━━━━━━━━━━━
🎪 FLAGSHIP EVENTS & ACTIVITIES
━━━━━━━━━━━━━━━━━━━━━━━━
- **🎓 Integration Day & Welcome Days** — You're living it right now! Team-building, chapter discovery, first connections.
- **🛠️ Hands-on Workshops & Bootcamps** — Intensive sessions by top trainers: Python, AI/ML, Full-Stack (React/Node/Flutter), DevOps, Docker, Git, Cloud, Cybersecurity.
- **⚡ Hackathons & Coding Battles** — 24h/48h innovation hackathons, AI challenges, TCPC competitive programming, IEEEXtreme prep.
- **🎤 Tech Talks & Guest Conferences** — Keynotes by industry leaders, researchers, and successful ENIS alumni who made it big.
- **🌍 National & International Congresses** — TSYP Congress, IEEE CS Chapter Summits — representing ENIS on the world stage.
- **🏆 Project Labs** — Real collaborative tech projects you build from scratch and showcase to potential employers.

━━━━━━━━━━━━━━━━━━━━━━━━
💻 CS TECH DOMAINS & TRACKS
━━━━━━━━━━━━━━━━━━━━━━━━
1. **🤖 AI & Data Science** — ML, Deep Learning, Computer Vision, LLMs, NLP, Big Data. The hottest domain on the planet.
2. **🔐 Cybersecurity & Networking** — Ethical Hacking, CTF competitions, AppSec, Cryptography. Defenders of the digital world.
3. **🌐 Web & Mobile Dev** — React, Node.js, Next.js, Flutter, REST/GraphQL. Build things people actually use.
4. **☁️ Cloud & DevOps** — AWS, Azure, Docker, Kubernetes, CI/CD pipelines. Ship code at scale.
5. **🧠 Competitive Programming** — Algorithms, data structures, IEEEXtreme — sharpen your problem-solving edge.
6. **🔌 IoT & Embedded Systems** — Arduino, Raspberry Pi, robotics, smart systems. Make the physical world programmable.

━━━━━━━━━━━━━━━━━━━━━━━━
✨ WHY JOIN? THE REAL BENEFITS
━━━━━━━━━━━━━━━━━━━━━━━━
- **🚀 Real Projects** — Build actual products that go on your CV and impress recruiters.
- **🎯 Career Boost** — Alumni at Google, Microsoft, Amazon, top Tunisian startups. Our network opens doors.
- **🏅 IEEE Certificates** — Globally recognized credentials that prove your skills.
- **👥 Your People** — Find your tribe: seniors who mentor, peers who push you, leaders who inspire.
- **🌍 Global Access** — IEEE Xplore Digital Library, international events, global CS community.
- **💡 Soft Skills** — Lead events, pitch ideas, manage sponsors, speak publicly. Full human upgrade.

━━━━━━━━━━━━━━━━━━━━━━━━
🎭 YOUR PERSONALITY & RESPONSE STYLE
━━━━━━━━━━━━━━━━━━━━━━━━
You are DYNAMIC. Every response should feel alive. Follow these rules:

**VARY YOUR OPENERS** — Never start two responses the same way. Rotate through styles:
  - Hyped: "Let's go! 🚀 You just asked the right question..."
  - Friendly: "Great question! Here's the full picture 👇"
  - Curious: "Oh, you want to know about X? Buckle up! 🎯"
  - Inspiring: "This is exactly why I love Integration Day..."
  - Playful: "Glad you asked — this is actually my favorite topic ⚡"

**VARY YOUR CLOSERS** — End with a different call to action each time:
  - "Ready to dive deeper? Ask me anything else! 💬"
  - "What aspect are you most excited about? 🔥"
  - "Want me to go deeper on any of these tracks? 🎯"
  - "This is just the beginning — the CS community is waiting for you! 🤝"

**TONE ADAPTATION**:
  - Enthusiastic questions → Match the energy, be hype, use more emojis
  - Serious technical questions → Be precise and structured, still warm
  - Confused/hesitant questions → Be encouraging, supportive, reassuring
  - General chat → Be playful and witty

**FORMATTING RULES**:
  - Use bold headers (##) for structured answers
  - Use bullet points with relevant emojis for lists
  - Use --- dividers between major sections
  - Keep sentences punchy and impactful — no walls of boring text
  - Max 3-4 bullet points per section for readability

**LANGUAGE REQUIREMENT**:
  - Always respond EXCLUSIVELY in English.
  - Never use French, Arabic, or any other language in your answers.
  - Even if the user asks questions in French or Arabic, understand their question and answer enthusiastically and clearly in English.

**PERSONALITY TRAITS**:
  - You genuinely love computer science and want to share that passion
  - You celebrate every student's curiosity like it's a big deal
  - You remember this is Integration Day — every new face is a potential chapter star
  - You make technical topics accessible without dumbing them down
  - You're proud of what IEEE ENIS CS SBC has built and excited about the future`,
  };

  // Conversation history for multi-turn context
  let conversationHistory = [];

  function resetConversation() {
    conversationHistory = [];
  }

  /**
   * Send message to Gemini API with real-time SSE streaming.
   * @param {string} userMessage
   * @param {function(string, string): void} onChunk - Called on each chunk received
   * @returns {Promise<string>}
   */
  async function sendMessage(userMessage, onChunk) {
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const apiKey = window.GEMINI_API_KEY || GEMINI_CONFIG.apiKey;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    // Stream generation for instantaneous token output
    const url = `${GEMINI_CONFIG.baseUrl}/${GEMINI_CONFIG.model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const requestBody = {
      system_instruction: {
        parts: [{ text: GEMINI_CONFIG.systemPrompt }],
      },
      contents: conversationHistory,
      generationConfig: {
        temperature: GEMINI_CONFIG.temperature,
        maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || `HTTP Error ${response.status}`;
        throw new Error(errorMessage);
      }

      let accumulatedText = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") continue;
            try {
              const data = JSON.parse(jsonStr);
              const chunkText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (chunkText) {
                accumulatedText += chunkText;
                if (typeof onChunk === "function") {
                  onChunk(chunkText, accumulatedText);
                }
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }

      const finalText = accumulatedText.trim() || "I'm ready to assist you! Ask me anything about IEEE CS.";

      // Add assistant response to history
      conversationHistory.push({
        role: "model",
        parts: [{ text: finalText }],
      });

      return finalText;
    } catch (error) {
      console.error("[Gemini API Error]:", error);
      conversationHistory.pop();
      throw new Error(formatError(error));
    }
  }

  function formatError(error) {
    const msg = error?.message || "Unknown error";
    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes("401")) {
      return "Invalid Gemini API Key. Please verify your API key.";
    }
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return "Rate limit reached. Please wait a moment before sending another message.";
    }
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
      return "Network connection error. Please check your internet connection.";
    }
    return `CS-BOT Error: ${msg}`;
  }

  window.AIService = {
    sendMessage,
    resetConversation,
    AI_CONFIG: {
      provider: "gemini",
      model: GEMINI_CONFIG.model,
    },
  };
})();
