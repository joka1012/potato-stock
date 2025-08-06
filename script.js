import { getLoginStatus } from "./login/login.js";
import { getActiveTheme } from "./shop/shop.js";
import { potatoShower } from "./potatoShower.js";

// Set BASE_URL in .env for backend connection
import { BASE_URL } from "./config.js";

// Default ingame values
let price = 2.5;
let cash = 1000;
let potatoes = 0;
let priceHistory = [];
let timeLabels = [];
let currentTime = 0;
let percentageChangeBool = false;
let turns = 0;
// Variable for doubletouch zoom prevention
let lastTouchEnd = 0;
let activeTheme = "default";

const infoIcon = document.getElementById("info-icon");
const tooltip = document.getElementById("tooltip");

const priceElement = document.getElementById("price");
const cashElement = document.getElementById("cash");
const potatoesElement = document.getElementById("potatoes");
const newsElement = document.getElementById("news");
const turnsElement = document.getElementById("turns");
const tickerMove = document.querySelector(".ticker-move");
const potatoBtn = document.getElementsByClassName("potatoBtn");

const buyOneEl = document.getElementById("buyOne");
const buyTenEl = document.getElementById("buyTen");
const buyHundredEl = document.getElementById("buyHundred");
const sellOneEl = document.getElementById("sellOne");
const sellTenEl = document.getElementById("sellTen");
const sellHundredEl = document.getElementById("sellHundred");
const sellAllEl = document.getElementById("sellAll");

// Load Login Popup HTML
fetch("login/login-popup.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("popup-container").innerHTML = data;

    // Popup-Setup after HTML has been loaded
    import("./login/login.js").then((module) => {
      module.setupPopup("openLoginPopupButton");
    });
  });

// Load Popup HTML
fetch("shop/shop.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("shop-container").innerHTML = data;

    // Popup-Setup after HTML has been loaded
    import("./shop/shop.js").then((module) => {
      module.setupShopPopup("openShopPopupButton");
    });
  });

// Save game in database
async function saveGameState() {
  if (!getLoginStatus()) return;
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/me/game`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      price: price,
      cash: cash,
      potato: potatoes,
      turns: turns,
      activeTheme: activeTheme,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Fehler beim Speichern:", data.error);
  } else {
    console.log("Spielstand gespeichert:", data.message);
  }
}

//Creates chart by chart.js
const ctx = document.getElementById("priceChart").getContext("2d");
Chart.defaults.font.family = "'Hachi Maru Pop', sans-serif";
let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: timeLabels,
    datasets: [
      {
        data: priceHistory,
        borderColor: "rgba(255, 165, 0, 1)",
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Price ($)",
        },
        min: 0,
      },
    },
  },
});

// Create chart function for when the chart is destroyed after login/logout
function createChart() {
  const ctx = document.getElementById("priceChart").getContext("2d");
  Chart.defaults.font.family = "'Hachi Maru Pop', sans-serif";
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          data: priceHistory,
          borderColor: "rgba(255, 165, 0, 1)",
          backgroundColor: "rgba(255, 165, 0, 0.2)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Price ($)",
          },
          min: 0,
        },
      },
    },
  });
}

// Updates the text in the UI
function updateDisplayData() {
  priceElement.textContent = `$${price.toFixed(2)}`;
  cashElement.textContent = `$${cash.toFixed(2)}`;
  potatoesElement.textContent = potatoes;
  turnsElement.textContent = turns;

  if (price >= 2.5) {
    priceElement.style.color = "#27ae60";
  } else if (price < 2.5 && price >= 1) {
    priceElement.style.color = "#f1c40f";
  } else {
    priceElement.style.color = "#e74c3c";
  }
  if (cash > 0) {
    cashElement.style.color = "#27ae60";
  } else if (cash < 0) {
    cashElement.style.color = "#e74c3c";
  } else {
    cashElement.style.color = "#999999";
  }
  if (potatoes != 0) {
    potatoesElement.style.color = "#e67e22";
  }
  if (turns > 20) {
    turnsElement.style.color = "#e74c3c";
  } else if (turns > 10) {
    turnsElement.style.color = "#f1c40f";
  } else {
    turnsElement.style.color = "#27ae60";
  }
}

const potatoMarketHeadlines = [
  // Negative Movement
  {
    headline: "Potato Futures Drop 30% as Harvest Forecast Improves in Idaho",
    change: -0.3,
  },
  {
    headline:
      "Shares in FryCorp Fall 44% After Potato Blight Spreads in Europe",
    change: -0.44,
  },
  {
    headline: "Global Potato Index Slides 21% on Lower French Fry Demand",
    change: -0.21,
  },
  {
    headline:
      "Mashed Holdings Dips 35% After Q2 Revenue Miss Linked to Tater Tots Oversupply",
    change: -0.35,
  },
  {
    headline: "Potato ETF (SPUD) Sinks 49% Amid Cold Storage Glut",
    change: -0.49,
  },

  // Positive Movement
  {
    headline:
      "Potato Commodity Prices Jump 42% After Late Season Frost Wipes Out Yields",
    change: 0.42,
  },
  {
    headline: "ChipCo Stock Surges 38% on News of New Ultra-Crispy Line Launch",
    change: 0.38,
  },
  {
    headline:
      "SPUD Index Gains 23% as McDonald's Announces Larger Fry Portions",
    change: 0.23,
  },
  {
    headline:
      "TuberTech Rises 35% After AI-Powered Farming Boosts Output Efficiency",
    change: 0.35,
  },
  {
    headline:
      "Potato Market Soars 48% as EU Bans Imports from Major Competitor",
    change: 0.48,
  },

  // Funny/Satirical Headlines
  {
    headline:
      "MashedCoin Plunges 50% After Investors Realize It's Just a Sack of Potatoes",
    change: -0.5,
  },
  {
    headline:
      "FryChain Rockets 45% Following Elon Musk Tweet: 'All In on Potatoes 🍟'",
    change: 0.45,
  },
  {
    headline: "Wall Street Peels Off 20% as Potato Prices Outpace Oil",
    change: -0.2,
  },
  {
    headline: "SPUD ETF Pops 29% After Reddit Group Declares: 'We Like Tubers'",
    change: 0.29,
  },
  {
    headline:
      "Analysts Warn: Potato Bubble May Burst — Valuations Up 47% This Week Alone",
    change: 0.47,
  },
];

// Chooses new headline
function randomNews() {
  const news =
    potatoMarketHeadlines[
      Math.floor(Math.random() * potatoMarketHeadlines.length)
    ];

  // Reset animation on the scrolling container
  tickerMove.style.animation = "none";
  void tickerMove.offsetWidth;
  newsElement.textContent = news.headline;
  tickerMove.style.animation = "ticker 12s linear infinite";

  return news;
}

// Determines price for next iteration
function updatePrice() {
  // Adds a turn for the hoarding tax
  if (potatoes != 0) {
    turns++;
  }
  // Taxation after 30 turns
  if (turns > 30) {
    const tax = potatoes * price * 0.15; // 15% of hoarded value
    cash -= tax;
    turns = 0;
  }
  // Calculates change
  let change = (Math.random() - 0.5) * 1.5;
  // Random jump/fall 10% of the time
  if (Math.random() < 0.1) {
    change += (Math.random() - 0.5) * 10;
  }
  // 10% a time a new headline with a jump/fall
  if (Math.random() < 0.1) {
    const newChange = randomNews();
    if ((price < 1) & (newChange.change > 0)) {
      change = newChange.change + Math.floor(Math.random() * (10 - 3 + 1)) + 3;
    } else {
      change = newChange.change;
    }
    percentageChangeBool = true;
  }

  if (percentageChangeBool == true) {
    percentageChangeBool = false;
    price *= change;
  } else {
    price += change;
  }
  price = Math.max(0.25, price);
  updateDisplayData();

  // Pushes data onto chart
  currentTime++;
  timeLabels.push(currentTime);
  priceHistory.push(price.toFixed(2));
  if (priceHistory.length > 40) {
    timeLabels.shift();
    priceHistory.shift();
  }
  chart.update();
}

//-------------Buying/Selling Buttons------------------

function buyPotato() {
  if (cash >= price) {
    potatoes++;
    cash -= price;
    updateDisplayData();
    UpdateButton();
  } else {
    alert("Not enough cash");
  }
}

function buyTenPotatoes() {
  if (cash >= price * 10) {
    potatoes += 10;
    cash -= price * 10;
    updateDisplayData();
    UpdateButton();
  } else {
    alert("Not enough cash");
  }
}

function buyHundredPotatoes() {
  if (cash >= price * 100) {
    potatoes += 100;
    cash -= price * 100;
    updateDisplayData();
    UpdateButton();
  } else {
    alert("Not enough cash");
  }
}

function sellPotato() {
  if (potatoes > 0) {
    potatoes--;
    if (potatoes == 0) {
      turns = 0;
    }
    cash += price;
    updateDisplayData();
    potatoShower(1);
    UpdateButton();
  } else {
    alert("Not enough potatoes");
  }
}

function sellTenPotatoes() {
  if (potatoes >= 10) {
    potatoes -= 10;
    if (potatoes == 0) {
      turns = 0;
    }
    cash += price * 10;
    updateDisplayData();
    potatoShower(10);
    UpdateButton();
  } else {
    alert("Not enough potatoes");
  }
}

function sellHundredPotatoes() {
  if (potatoes >= 100) {
    potatoes -= 100;
    if (potatoes == 0) {
      turns = 0;
    }
    cash += price * 100;
    updateDisplayData();
    potatoShower(100);
    UpdateButton();
  } else {
    alert("Not enough potatoes");
  }
}

function sellAll() {
  if (potatoes > 0) {
    turns = 0;
    cash += potatoes * price;
    potatoShower(potatoes);
    potatoes = 0;
    updateDisplayData();
    UpdateButton();
  } else {
    alert("You have no potatoes");
  }
}

// Logic for determining if button is clickable/not clickable
function UpdateButton() {
  const buyButtons = [buyOneEl, buyTenEl, buyHundredEl];

  if (cash < price) {
    buyButtons.forEach((btn) => setButtonState(btn, false));
  } else if (cash < price * 10) {
    setButtonState(buyOneEl, true);
    [buyTenEl, buyHundredEl].forEach((btn) => setButtonState(btn, false));
  } else if (cash < price * 100) {
    [buyOneEl, buyTenEl].forEach((btn) => setButtonState(btn, true));
    setButtonState(buyHundredEl, false);
  } else {
    buyButtons.forEach((btn) => setButtonState(btn, true));
  }

  const sellButtons = [sellOneEl, sellTenEl, sellHundredEl, sellAllEl];

  if (potatoes == 0) {
    sellButtons.forEach((btn) => setButtonState(btn, false));
  } else if (potatoes < 10) {
    [sellOneEl, sellAllEl].forEach((btn) => setButtonState(btn, true));
    [sellTenEl, sellHundredEl].forEach((btn) => setButtonState(btn, false));
  } else if (potatoes < 100) {
    [sellOneEl, sellTenEl, sellAllEl].forEach((btn) =>
      setButtonState(btn, true)
    );
    setButtonState(sellHundredEl, false);
  } else {
    sellButtons.forEach((btn) => setButtonState(btn, true));
  }
}

// If action is possile/not possile the button will be lighter/grey to signal clickable/not clickable
function setButtonState(button, enabled) {
  button.disabled = !enabled;
}

//---------------------------------Event listeners------------------------------------------------

// Event listener for every action button. (By event listener because script is a module)
document.getElementById("buyOne")?.addEventListener("click", buyPotato);
document.getElementById("buyTen")?.addEventListener("click", buyTenPotatoes);
document
  .getElementById("buyHundred")
  ?.addEventListener("click", buyHundredPotatoes);

document.getElementById("sellOne")?.addEventListener("click", sellPotato);
document.getElementById("sellTen")?.addEventListener("click", sellTenPotatoes);
document
  .getElementById("sellHundred")
  ?.addEventListener("click", sellHundredPotatoes);
document.getElementById("sellAll")?.addEventListener("click", sellAll);

infoIcon.addEventListener("click", () => {
  if (tooltip.style.display === "none") {
    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
});

// After successful login get the game progress of the user and change the game variables accordingly. Restart chart.
window.addEventListener("login-success", () => {
  console.log("Login erfolgreich – Spielstand laden oder AutoSave starten");
  const token = localStorage.getItem("token");

  fetch(`${BASE_URL}/me`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen des Spielstands");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Spielstand geladen:", data);
      cash = data.cash;
      potatoes = data.potato;
      turns = data.turns;
      const event = new CustomEvent("game-progress-loaded", {
        detail: {
          themes: data.themes,
          activeTheme: data.activeTheme,
        },
      });

      window.dispatchEvent(event);
    })
    .catch((error) => {
      console.error("Fehler:", error.message);
    });
  updateDisplayData();
  chart.destroy();
  createChart();
});

// Prevents zooming by double tap onto a mobile screen. Allows fast buying and selling of potatoes.
document.addEventListener(
  "touchend",
  function (event) {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

// If user log outs the game progress will be saved and reset to default and chart by chart.js will be destroyed and restarted.
window.addEventListener("logout", () => {
  console.log("Logout");
  saveGameState();
  price = 2.5;
  cash = 1000;
  potatoes = 0;
  priceHistory = [];
  timeLabels = [];
  currentTime = 0;
  percentageChangeBool = false;
  turns = 0;
  updateDisplayData();
  chart.destroy();
  createChart();
});

// After registration game progress will be saved
window.addEventListener("register-success", () => {
  console.log("Registration successful");
  saveGameState();
});

// Save game progress before closing the site
window.addEventListener("beforeunload", () => {
  saveGameState();
});

window.addEventListener("new-active-theme", () => {
  activeTheme = getActiveTheme();
});

export function getCash() {
  return cash;
}

export function setCash(value) {
  cash = value;
}

export function getLoadedTheme() {
  activeTheme;
}

// Saving game progress every 15 seconds
setInterval(() => {
  saveGameState();
}, 15000);

UpdateButton();
// automatic price update
setInterval(updatePrice, 2000);

updateDisplayData();
