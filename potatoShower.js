import { getLoadedTheme } from "./script.js";
import { getActiveTheme } from "./shop/shop.js";

let activeTheme = "default";

let potatoPic = "pictures/potato.webp";

function setPotatoPic() {
  if (activeTheme == "default") {
    potatoPic = "pictures/potato.webp";
  } else if (activeTheme == "LaRatte") {
    potatoPic = "pictures/La ratte.png";
  } else if (activeTheme == "Vitelotte") {
    potatoPic = "pictures/Vitelotte.png";
  } else if (activeTheme == "Bleue-d-Artois") {
    potatoPic = "pictures/Bleue d'Artois.png";
  }
}

// POTATOO SHOWERRRRRRRR
export function potatoShower(amount) {
  for (let i = 0; i < amount; i++) {
    setTimeout(() => {
      const potato = document.createElement("img");
      potato.src = potatoPic;
      potato.className = "potato";
      potato.style.left = Math.random() * window.innerWidth + "px";
      potato.style.animationDuration = 2 + Math.random() * 3 + "s";

      document.body.appendChild(potato);

      setTimeout(() => {
        potato.remove();
      }, 5000);
    }, i * 25);
  }
}

window.addEventListener("game-progress-loaded", () => {
  activeTheme = getLoadedTheme();
  setPotatoPic();
});

window.addEventListener("new-active-theme", () => {
    activeTheme = getActiveTheme();
    setPotatoPic();
});
