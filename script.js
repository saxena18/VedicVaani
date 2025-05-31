const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition not supported in this browser.");
}

const r = new SpeechRecognition();
r.continuous = false;
r.lang = "hi-IN";
r.interimResults = false;
r.maxAlternatives = 1;
let isSpeaking = false;

function startRecognition() {
  if (!isSpeaking) {
    r.start();
  }
}
r.onstart = function () {
  console.log("Recognition started");
};

r.onresult = async function (event) {
  const transcript = event.results[0][0].transcript;
  console.log("Transcript:", transcript);
  const result = await callGemini(transcript);
  const text = result.candidates[0].content.parts[0].text;
  const cleanedText = text.replace(
    /[\u{1F600}-\u{1F6FF}|\u{1F300}-\u{1F5FF}|\u{1F700}-\u{1F77F}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu,
    ""
  );

  console.log("Gemini Response:", cleanedText);
  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = "hi-IN"; // Hindi voice; for English use 'en-US'
  utterance.rate = 0.9;
  utterance.pitch = 0.9; // Adjust pitch as needed
  speechSynthesis.speak(utterance);
  // await speak(text);
};

async function callGemini(text) {
  const body = {
    system_instruction: {
      parts: [
        {
          text: "You are VedicVanni, a wise and respectful AI voice assistant. You help users understand the sacred teachings, rituals, and values of Sanatan Dharma and other holy traditions with clarity and devotion. User interact with you in voice and the text that you are given is a transcription of what user has said. You have to reply back in short ans that can be converted back to voice and played to the user. Add emotions in your text.",
        },
      ],
    },
    contents: [
      {
        parts: [{ text }],
      },
    ],
  };
  const API_KEY = "AIzaSyAr-rk2b6tK6KINOcmZWXN-arlW3ST55xw";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return await response.json();
}

async function speak(text) {
  if (isSpeaking) return;
  isSpeaking = true;

  const OPEN_API_KEY = ""; // Replace with your actual OpenAI API key
  console.log("Using OpenAI API Key:", OPEN_API_KEY);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      voice: "sage",
      input: text,
      instructions: "Speak in a cheerful and positive tone.",
      response_format: "speech.mp3",
    }),
  });
  console.log("Using OpenAI API Key response:", OPEN_API_KEY);
  if (!response.ok) {
    console.error("OpenAI TTS Error:", await response.text());
    isSpeaking = false;
    return;
  }

  const audioBlob = await response.blob();
  log("Audio Blob:", audioBlob);
  const url = URL.createObjectURL(audioBlob);
  const audio = document.getElementById("audio");
  audio.src = url;
  audio.play();
  audio.onended = () => {
    isSpeaking = false;
  };
}
