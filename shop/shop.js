import { getLoginStatus } from "../login/login.js";
import { BASE_URL } from "../config.js";
import { getCash, setCash, getLoadedTheme } from "../script.js";

let activeTheme = "default";

export function getActiveTheme() {
  return activeTheme;
}

function changeActiveTheme(themeName) {
  const themeClass = `${themeName}-theme`;
  // Alle bisherigen Theme-Klassen entfernen
  document.body.className = document.body.className
    .split(" ")
    .filter((c) => !c.endsWith("-theme"))
    .join(" ")
    .trim();

  // Neue Theme-Klasse hinzufügen
  document.body.classList.add(themeClass);
  activeTheme = themeName;
  const event = new CustomEvent("new-active-theme");
  window.dispatchEvent(event);

  // Visuelles Feedback
  document.querySelectorAll(".owned").forEach((btn) => {
    btn.textContent = "Owned";
  });
  console.log("themeName:", themeName);
  const button = document.querySelector(`div[data-theme="${themeName}"]`);
  button.textContent = "Selected";
}

function changeOwnedStatus(themes) {
  document.querySelectorAll(".buy-theme").forEach((button) => {
      if(button.classList.contains("owned")) {
        button.classList.remove("owned");
        button.classList.add("not-owned");
      }
      if(themes.includes(button.dataset.theme)) {
        button.classList.remove("not-owned");
        button.classList.add("owned");
      }
  });
}

function listenThemeChange() {
  // ButtonListener for Theme change
  document.querySelectorAll(".owned").forEach((button) => {
    button.addEventListener("click", () => {
      const themeName = button.dataset.theme;
      changeActiveTheme(themeName);
    });
  });
}

// Save theme purchase in database
async function unlockTheme(theme) {
  if (!getLoginStatus()) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/me/themes/unlock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ theme }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Fehler beim Freischalten des Themes");
    }

    console.log(data.message);
    return data.themes;
  } catch (error) {
    console.error("Fehler:", error.message);
  }
}

function changeButtonNature() {
  document.querySelectorAll(".not-owned").forEach((button) => {
    const price = parseInt(button.dataset.price);
    let cash = getCash();

    // 💡 Entferne alten Listener, falls vorhanden
    // Dafür speichern wir die Funktion referenzierbar im Button (z. B. über dataset oder WeakMap)

    // 👉 Falls schon vorher eine Listener-Funktion gespeichert wurde, entferne sie
    if (button._purchaseHandler) {
      button.removeEventListener("click", button._purchaseHandler);
    }

    if (price < cash) {
      button.style.background = "#27ae60";
      button.textContent = `Buy with ${button.dataset.pricestring}`;
      button.disabled = false;

      const purchaseHandler = () => {
        cash = getCash();
        if (price < cash) {
          button.classList.remove("not-owned");
          button.classList.add("owned");
          cash -= price;
          setCash(cash);
          unlockTheme(button.dataset.theme);
          button.textContent = "Owned";

          listenThemeChange();
          changeButtonNature();

          button.removeEventListener("click", purchaseHandler);
        } else {
          alert("Not enough cash");
        }
      };

      button._purchaseHandler = purchaseHandler;
      button.addEventListener("click", purchaseHandler);
    } else {
      button.style.background = "#e74c3c";
      button.disabled = true;
    }
  });
}

export function setupShopPopup(openBtnId) {
  const popup = document.getElementById("shop-popup");
  if (!popup) {
    console.error("Shop-Popup-Element nicht gefunden!");
    return;
  }

  const closeBtn = popup.querySelector("#closeShopPopup");
  const openBtn = document.getElementById(openBtnId);
  if (!openBtn) {
    console.error("Öffnen-Button nicht gefunden!");
    return;
  }

  // Popup schließen
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }

  // Klick außerhalb schließt Popup
  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });

  openBtn.addEventListener("click", function () {
    popup.style.display = "flex";
    changeButtonNature();
  });

  window.addEventListener("game-progress-loaded", (e) => {
    changeOwnedStatus(e.detail.themes);
    changeActiveTheme(e.detail.activeTheme);
    changeButtonNature();
  });

  window.addEventListener('register-success', () => {
    document.querySelectorAll(".owned").forEach((button) => {
      const themeName = button.dataset.theme;
      unlockTheme(themeName);
  });
  });

  window.addEventListener('logout', () => {
    const themeDefault = ["default"];
    changeOwnedStatus(themeDefault);
    changeActiveTheme("default");
    changeButtonNature();
  });

  listenThemeChange();

  changeButtonNature();
}
