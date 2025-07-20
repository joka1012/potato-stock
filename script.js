let price = 2.50;
let cash = 1000;
let potatoes = 0;
const priceHistory = [];
const timeLabels = [];
let currentTime = 0;
let trend = 0;
let percentageChangeBool = false;
let turns = 0;
let turnBool = false;

const priceElement = document.getElementById("price");
const cashElement = document.getElementById("cash");
const potatoesElement = document.getElementById("potatoes");
const newsElement = document.getElementById("news");
const turnsElement = document.getElementById("turns");

const ctx = document.getElementById("priceChart").getContext("2d");

const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: timeLabels,
        datasets: [{
            data: priceHistory,
            borderColor: "rgba(255, 165, 0 , 1)",
            backgroundColor: "rgba(255, 165, 0, 0.2",
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                title: {
                    display: true,
                    text: "Price ($)"
                },
                min: 0
            }
        }
    }
})

function updateDisplayData() {
    priceElement.textContent = `$${price.toFixed(2)}`;
    cashElement.textContent = `$${cash.toFixed(2)}`;
    potatoesElement.textContent = potatoes;
    turnsElement.textContent = turns;
}

const potatoMarketHeadlines = [
  // Negative Movement
  { headline: "Potato Futures Drop 30% as Harvest Forecast Improves in Idaho", change: -0.30 },
  { headline: "Shares in FryCorp Fall 44% After Potato Blight Spreads in Europe", change: -0.44 },
  { headline: "Global Potato Index Slides 21% on Lower French Fry Demand", change: -0.21 },
  { headline: "Mashed Holdings Dips 35% After Q2 Revenue Miss Linked to Tater Tots Oversupply", change: -0.35 },
  { headline: "Potato ETF (SPUD) Sinks 49% Amid Cold Storage Glut", change: -0.49 },

  // Positive Movement
  { headline: "Potato Commodity Prices Jump 42% After Late Season Frost Wipes Out Yields", change: 0.42 },
  { headline: "ChipCo Stock Surges 38% on News of New Ultra-Crispy Line Launch", change: 0.38 },
  { headline: "SPUD Index Gains 23% as McDonald's Announces Larger Fry Portions", change: 0.23 },
  { headline: "TuberTech Rises 35% After AI-Powered Farming Boosts Output Efficiency", change: 0.35 },
  { headline: "Potato Market Soars 48% as EU Bans Imports from Major Competitor", change: 0.48 },

  // Funny/Satirical Headlines
  { headline: "MashedCoin Plunges 50% After Investors Realize It's Just a Sack of Potatoes", change: -0.50 },
  { headline: "FryChain Rockets 45% Following Elon Musk Tweet: 'All In on Potatoes 🍟'", change: 0.45 },
  { headline: "Wall Street Peels Off 20% as Potato Prices Outpace Oil", change: -0.20 },
  { headline: "SPUD ETF Pops 29% After Reddit Group Declares: 'We Like Tubers'", change: 0.29 },
  { headline: "Analysts Warn: Potato Bubble May Burst — Valuations Up 47% This Week Alone", change: 0.47 }
];

function randomNews() {
    const news = potatoMarketHeadlines[Math.floor(Math.random() * potatoMarketHeadlines.length)];
    newsElement.textContent = news.headline;
    return news;
}

function updatePrice() {
    if (turnBool == true) {
        turns++;
    }
    if (potatoes > 100 && turns > 30) {
        const tax = potatoes * price * 0.15; // 15% of hoarded value
        cash -= tax;
        turns = 0;
        showEvent("Potato Board imposes hoarding tax! You lose $" + tax.toFixed(2));
    }
    if (turns > 30) {
        turns = 0;
    }
    let change = (Math.random() - 0.5) * 1.5;
    if(Math.random() < 0.1) {
        change += (Math.random() - 0.5) * 10;
    }

    if (Math.random() < 0.1) {
        const newChange = randomNews();
        if (price < 1 & newChange.change > 0) {
            change = newChange.change + Math.floor(Math.random() * (10 - 3 + 1)) + 3;
        } else {
            change = newChange.change;
        }
        percentageChangeBool = true;
    }

    if (percentageChangeBool == true) {
        percentageChangeBool = false;
        price *= change
    } else {
        price += change;
    }
    price = Math.max(0.25, price);
    updateDisplayData();

    currentTime++;
    timeLabels.push(currentTime);
    priceHistory.push(price.toFixed(2));
    if (priceHistory.length > 40) {
        timeLabels.shift();
        priceHistory.shift();
    }
    chart.update();
}

//-------------Buttons------------------

function buyPotato() {
    if(cash >= price) {
        potatoes++;
        cash -= price;
        updateDisplayData();
        turnBool = true;
    } else {
        alert("Not enough cash");
    }
}

function buyTenPotatoes() {
    if(cash >= price*10) {
        potatoes+= 10;
        cash -= price*10;
        updateDisplayData();
        turnBool = true;
    } else {
        alert("Not enough cash");
    }
}

function buyHundredPotatoes() {
    if(cash >= price*100) {
        potatoes+= 100;
        cash -= price*100;
        updateDisplayData();
        turnBool = true;
    } else {
        alert("Not enough cash");
    }
}

function sellPotato() {
    if(potatoes > 0) {
        turns = 0;
        potatoes--;
        cash += price;
        updateDisplayData();
        turnsBool = false;
    } else {
        alert("Not enough potatoes");
    }
}

function sellTenPotatoes() {
    if(potatoes >= 10) {
        turns = 0;
        potatoes-= 10;
        cash += price*10;
        updateDisplayData();
        turnsBool = false;
    } else {
        alert("Not enough potatoes");
    }
}

function sellHundredPotatoes() {
    if(potatoes >= 100) {
        turns = 0;
        potatoes-= 100;
        cash += price*100;
        updateDisplayData();
        turnsBool = false;
    } else {
        alert("Not enough potatoes");
    }
}

function sellAll() {
    if(potatoes > 0) {
        turns = 0;
        cash += potatoes * price;
        potatoes = 0;
        updateDisplayData();
        turnsBool = false;
    } else {
        alert("You have no potatoes");
    }
}

// automatic price update
setInterval(updatePrice, 2000)

updateDisplayData();
