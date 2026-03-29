const startSelect = document.getElementById("startRoom");
const endSelect = document.getElementById("endRoom");
const button = document.getElementById("yolu-bulma-tuşu");
const map_area = document.getElementsByClassName("map-area")[0];
const themeSwitch = document.getElementById("theme-switch");
let darkmode = localStorage.getItem("darkmode");
const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");

const startIcon = new Image();
startIcon.src = "/static/start.png";

const endIcon = new Image();
endIcon.src = "/static/end.png";

const nodePositions = {
  "Kat2": {
    "Lobby_Top": { x: 530, y: 65 },
    "Lobby_Mid": { x: 530, y: 270 },
    "Lobby_Bottom": { x: 530, y: 410 },
    "Lobby_Corridor_R2": { x: 990, y: 270 },
    "Lobby_Corridor_R3": { x: 415, y: 65 },
    "Lobby_Corridor_R4": { x: 415, y: 200 },
    "Lobby_Corridor_R5": { x: 415, y: 330 },
    "R3": { x: 300, y: 65 },
    "R2": { x: 990, y: 130 },
    "R4": { x: 250, y: 200 },
    "R1": { x: 700, y: 390 },
    "R5": { x: 330, y: 330 },
    "E": { x: 415, y: 425 }
  },
  "Kat3": {
    "E_Kat3": { x: 130, y: 440 },
    "Living_Quarters_First": { x: 265, y: 440 },
    "Living_Quarters_Mid": { x: 575, y: 440 },
    "Living_Quarters_Last": { x: 890, y: 440 },
    "BALCONY1": { x: 380, y: 55 },
    "BALCONY2": { x: 690, y: 55 },
    "BALCONY3": { x: 1010, y: 55 },
    "KITCHEN1": { x: 200, y: 160 },
    "KITCHEN2": { x: 490, y: 160 },
    "KITCHEN3": { x: 830, y: 160 },
    "LIVINGROOM1.1": { x: 265, y: 320 },
    "LIVINGROOM2.1": { x: 575, y: 320 },
    "LIVINGROOM3.1": { x: 890, y: 320 },
    "LIVINGROOM1.2": { x: 380, y: 160 },
    "LIVINGROOM2.2": { x: 690, y: 160 },
    "LIVINGROOM3.2": { x: 1010, y: 160 },
    "BEDROOM1": { x: 200, y: 290 },
    "BEDROOM2": { x: 490, y: 290 },
    "BEDROOM3": { x: 830, y: 290 },
    "BATHROOM1": { x: 360, y: 345 },
    "BATHROOM2": { x: 660, y: 345 },
    "BATHROOM3": { x: 990, y: 345 },
  }
};

const floorImages = {
  "Kat2": "/static/floor 2.png",
  "Kat3": "/static/floor 3.png"
};

let floorImage = new Image();
let completedSegments = [];
let completedArrows = []; // Çizilen okları biriktirdiğimiz yer

// dark mode kısmı
const enableDarkMode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
}
const disableDarkMode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkmode", null);
}
if (darkmode === "active") enableDarkMode();

themeSwitch.addEventListener("click", () => {
  darkmode = localStorage.getItem("darkmode");
  if (darkmode !== "active") enableDarkMode();
  else disableDarkMode();
});

button.addEventListener("click", () => {
  const start = startSelect.value;
  const end = endSelect.value;
  map_area.style.display = "block";
  map_area.scrollIntoView({ behavior: "smooth" });

  if (!start || !end) {
    alert("Başlangıç ve bitiş seç");
    return;
  }
  
  fetch("http://127.0.0.1:5000/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end })
  })
  .then(res => res.json())
  .then(path => animatePath(path));
});

function animatePath(path) {
  if (!path || path.length < 2) return;

  let index = 0;
  completedSegments = []; 
  completedArrows = []; // Okları sıfırla
  let currentFloor = getNodeFloor(path[0]);
  
  const htmlMap = document.getElementById("myMap");
  if(htmlMap) htmlMap.style.visibility = "hidden";

  floorImage.src = floorImages[currentFloor];
  floorImage.onload = () => drawSegment();

  function drawSegment() {
    if (index >= path.length - 1) {
      const startFloor = getNodeFloor(path[0]);
      const endFloor = getNodeFloor(path[path.length-1]);
      if(startFloor === currentFloor) drawPin("start", nodePositions[startFloor][path[0]].x, nodePositions[startFloor][path[0]].y);
      if(endFloor === currentFloor) drawPin("end", nodePositions[endFloor][path[path.length-1]].x, nodePositions[endFloor][path[path.length-1]].y);
      return;
    }

    const startNode = path[index];
    const endNode = path[index + 1];
    const f1 = getNodeFloor(startNode);
    const f2 = getNodeFloor(endNode);

    if (f1 !== f2) {
      completedSegments = [];
      completedArrows = [];
      index++;
      currentFloor = f2;
      floorImage.src = floorImages[currentFloor];
      floorImage.onload = () => setTimeout(drawSegment, 300);
      return;
    }

    const p1 = nodePositions[f1][startNode];
    const p2 = nodePositions[f1][endNode];

    // HIZ AYARI: Burayı değiştir (Örn: 30 hızlı, 60 yavaş, 100 çok yavaş)
    const hiz = 40; 

    animateLine(p1, p2, hiz, () => {
      // Çizgi bittiğinde okun koordinatlarını hesapla ve ekle
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      if (Math.sqrt(dx*dx + dy*dy) > 40) {
        completedArrows.push({
          x: p1.x + dx * 0.5,
          y: p1.y + dy * 0.5,
          angle: Math.atan2(dy, dx)
        });
      }
      completedSegments.push({ p1, p2 });
      index++;
      setTimeout(drawSegment, 50);
    });
  }
}

function animateLine(p1, p2, steps, callback) {
  let i = 0;
  function step() {
    if (i > steps) {
      callback(); 
      return;
    }

    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    ctx.drawImage(floorImage, 0, 0, myCanvas.width, myCanvas.height);
    const progress = i / steps;

    // --- 1. SİYAH KENARLIK ÇİZİMİ ---
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "black";
    
    completedSegments.forEach(seg => {
      ctx.beginPath(); ctx.moveTo(seg.p1.x, seg.p1.y); ctx.lineTo(seg.p2.x, seg.p2.y); ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p1.x + (p2.x - p1.x) * progress, p1.y + (p2.y - p1.y) * progress);
    ctx.stroke();

    // --- 2. MAVİ İÇ ÇİZGİ ÇİZİMİ ---
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#4285F4";
    
    completedSegments.forEach(seg => {
      ctx.beginPath(); ctx.moveTo(seg.p1.x, seg.p1.y); ctx.lineTo(seg.p2.x, seg.p2.y); ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p1.x + (p2.x - p1.x) * progress, p1.y + (p2.y - p1.y) * progress);
    ctx.stroke();

    // --- 3. OKLARIN ÇİZİMİ ---
    completedArrows.forEach(arrow => {
      ctx.save();
      ctx.translate(arrow.x, arrow.y);
      ctx.rotate(arrow.angle);
      ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, 0); ctx.lineTo(-5, 5);
      ctx.lineWidth = 2; ctx.strokeStyle = "white"; ctx.stroke();
      ctx.restore();
    });

    i++;
    requestAnimationFrame(step);
  }
  step();
}

function drawPin(type, x, y) {
  let img = (type === "start") ? startIcon : endIcon;
  let size = (type === "start") ? 36 : 48;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.3);
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fill();
  ctx.restore();
  ctx.drawImage(img, x - size / 2, y - size, size, size);
}

function getNodeFloor(nodeName) {
  if (nodePositions["Kat2"][nodeName]) return "Kat2";
  if (nodePositions["Kat3"][nodeName]) return "Kat3";
  return null;
}