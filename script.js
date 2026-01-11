
let audioOn = true;
let lastStudied = "";
let level = "";
let index = 0;
let show = false;

// DATA FLASHCARD (AKAN DIISI DARI REST API)
let data = {
  part1: [],
  part2: [],
  part3: []
};


/**
 * Fetch flashcard data from API and distribute to all parts
 */
async function fetchFlashcardData() {
  try {
    console.log("🔄 Fetching data from API...");
    
    const response = await fetch("https://pabcl.codelabspace.or.id/flashcards");
    const result = await response.json();

    if (!result.success) {
      console.error("❌ API returned error");
      alert("Failed to load flashcard data");
      return;
    }

    const apiData = result.data;
    console.log(`✅ Loaded ${apiData.length} cards from API`);

    // Reset data
    data = {
      part1: [],
      part2: [],
      part3: []
    };

    // DISTRIBUSI DATA KE 3 PART SECARA MERATA
    apiData.forEach((item, index) => {
      const card = [
        item.question,
        item.question + " — " + item.answer
      ];

      // Bagi rata dengan modulo (sisa bagi)
      // 0,3,6,9... -> part1
      // 1,4,7,10... -> part2  
      // 2,5,8,11... -> part3
      const partIndex = index % 3;
      
      if (partIndex === 0) {
        data.part1.push(card);
      } else if (partIndex === 1) {
        data.part2.push(card);
      } else {
        data.part3.push(card);
      }
    });

    console.log("\n📊 Final Distribution:");
    console.log(`  📚 Part 1: ${data.part1.length} cards`);
    console.log(`  📚 Part 2: ${data.part2.length} cards`);
    console.log(`  📚 Part 3: ${data.part3.length} cards`);
    console.log(`  📝 Total: ${data.part1.length + data.part2.length + data.part3.length} cards`);

    // Tampilkan sample dari setiap part
    console.log("\n📋 Sample Cards:");
    console.log("Part 1:", data.part1.slice(0, 5).map(c => c[0]).join(", "));
    console.log("Part 2:", data.part2.slice(0, 5).map(c => c[0]).join(", "));
    console.log("Part 3:", data.part3.slice(0, 5).map(c => c[0]).join(", "));

  } catch (error) {
    console.error("❌ Error fetching flashcards:", error);
    alert("Failed to connect to API. Please check your internet connection.");
  }
}

// Load data saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", () => {
  fetchFlashcardData();
});

// ========== AUDIO & BGM ELEMENTS ==========
let bgmOn = true;
const bgmHome = document.getElementById("bgmHome");
const clickSound = document.getElementById("clickSound");
const celebrationSound = document.getElementById("celebrationSound");

// ========== NAVIGATION FUNCTIONS ==========

function goTo(screen) {
  document.querySelectorAll(".screen")
    .forEach(s => s.style.display = "none");

  document.getElementById(screen).style.display = "block";

  // Handle background music
  if (screen === "home" && bgmOn === true) {
    document.body.classList.remove("bg-easy", "bg-medium", "bg-hard");
    bgmHome.play();
  } else {
    bgmHome.pause();
    bgmHome.currentTime = 0;
  }
}

function openIntro(lv) {
  level = lv;
  setBackground(level);

  // Ubah display dari level ke part
  const partNumber = lv.replace('part', '');
  document.getElementById("introTitle").innerText = `PART ${partNumber}`;

  // Update description dengan jumlah kartu yang sebenarnya
  const cardCount = data[level].length;

  if (level === "part1") {
    document.getElementById("introDesc").innerText =
      `There are ${cardCount} flashcards in Part 1. Users can click on a card to view its meaning.`;
  }

  if (level === "part2") {
    document.getElementById("introDesc").innerText =
      `Part 2 contains ${cardCount} flashcards to help you learn more verbs.`;
  }

  if (level === "part3") {
    document.getElementById("introDesc").innerText =
      `Part 3 contains ${cardCount} flashcards to complete your learning.`;
  }

  goTo("intro");
}

/**
 * Start flashcard session
 */
function startFlashcard() {
  index = 0;
  lastStudied = level;
  localStorage.setItem("lastStudied", level);
  loadCard();
  goTo("flashcard");
}
function loadCard() {
  // Cek apakah masih ada kartu
  if (index >= data[level].length) {
    goTo("congrats");
    return;
  }

  document.getElementById("word").innerText = data[level][index][0];
  document.getElementById("meaning").innerText = "Click for meaning";
  
  // Update count dengan total kartu di level ini
  const totalCards = data[level].length;
  document.getElementById("count").innerText = `${index + 1}/${totalCards}`;

  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("backBtn").style.display = "none";

  document.getElementById("lastStudiedText").innerText =
    "Last studied : PART " + level.replace('part', '').toUpperCase();

  document.getElementById("listenBtn").style.display =
    audioOn ? "inline-block" : "none";

  show = false;
}

/**
 * Show meaning of current card
 */
function showMeaning() {
  if (!show) {
    document.getElementById("meaning").innerText = data[level][index][1];

    document.getElementById("nextBtn").style.display = "block";
    document.getElementById("backBtn").style.display =
      index > 0 ? "inline-block" : "none";

    show = true;
  }
}

/**
 * Move to next card
 */
function nextCard() {
  index++;
  
  // Cek apakah masih ada kartu di level ini
  if (index < data[level].length) {
    loadCard();
  } else {
    // Play celebration sound sebelum pindah ke congrats
    playCelebrationSound();
    goTo("congrats");
  }
}

/**
 * Move to previous card
 */
function backcard() {
  if (index > 0) {
    index--;
    loadCard();
  }
}

function toggleAudio() {
  audioOn = document.getElementById("audioToggle").checked;
  
  if (!audioOn) {
    bgmHome.pause();
    bgmHome.currentTime = 0;
  }
}

/**
 * Play pronunciation using Web Speech API
 */
function playSound() {
  if (!audioOn) return;
  
  const word = data[level][index][0];
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = 'en-US';
  utter.rate = 0.9; // Slightly slower for clarity
  
  speechSynthesis.speak(utter);
}

/**
 * Play click sound effect
 */
function playClick() {
  if (!audioOn) return;
  
  clickSound.currentTime = 0;
  clickSound.play();
}

/**
 * Play celebration sound when completing a part
 */
function playCelebrationSound() {
  if (!audioOn) return;
  
  try {
    celebrationSound.currentTime = 0;
    celebrationSound.volume = 0.6; // Set volume 60%
    celebrationSound.play();
    console.log("🎉 Playing celebration sound!");
  } catch(e) {
    console.log("❌ Celebration sound file not found:", e);
    // Fallback: play simple beep jika file tidak ada
    playFallbackCelebration();
  }
}

/**
 * Fallback celebration sound jika file audio tidak tersedia
 */
function playFallbackCelebration() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.15 },
      { freq: 783.99, time: 0.3 },
      { freq: 1046.50, time: 0.45 }
    ];
    
    notes.forEach(note => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = note.freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + note.time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + note.time + 0.2);
      
      oscillator.start(audioContext.currentTime + note.time);
      oscillator.stop(audioContext.currentTime + note.time + 0.2);
    });
  } catch(e) {
    console.log("Audio not supported");
  }
}

// ========== BACKGROUND MUSIC CONTROLS ==========

function toggleBGM() {
  bgmOn = document.getElementById("bgmToggle").checked;

  if (!bgmOn) {
    bgmHome.pause();
    bgmHome.currentTime = 0;
  }
  
  localStorage.setItem("bgmOn", bgmOn);
}

// Load BGM status dari localStorage
bgmOn = localStorage.getItem("bgmOn") !== "false";

document.addEventListener("DOMContentLoaded", () => {
  const bgmToggle = document.getElementById("bgmToggle");
  if (bgmToggle) {
    bgmToggle.checked = bgmOn;
  }
});


/**
 * Reset all learning progress
 */
function resetProgress() {
  if (confirm("Are you sure you want to reset all learning progress?")) {
    localStorage.clear();
    alert("✅ Learning progress has been reset!");
  }
}

/**
 * Set background theme based on part
 */
function setBackground(level) {
  document.body.classList.remove("bg-easy", "bg-medium", "bg-hard");

  if (level === "part1") document.body.classList.add("bg-easy");
  if (level === "part2") document.body.classList.add("bg-medium");
  if (level === "part3") document.body.classList.add("bg-hard");
}

console.log("🎮 Flashcard App Loaded");
console.log("📡 API Endpoint: https://pabcl.codelabspace.or.id/flashcards");
console.log("📚 Using Part-based Distribution (Part 1, 2, 3)"); 