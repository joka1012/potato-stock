let isLoggedIn = false;
const BASE_URL = "https://userservice-g9np.onrender.com";

function updateAuthButton(button, popup) {
  const token = localStorage.getItem("token");

  if (token && isTokenValid(token)) {
    // Wenn eingeloggt & Token gültig → Logout-Button
    button.textContent = "Log out";
    isLoggedIn = true;
    button.onclick = () => {
      localStorage.removeItem("token");
      isLoggedIn = false;
      button.textContent = "Log in";
      const event = new CustomEvent('logout');
      window.dispatchEvent(event);
      button.onclick = () => {
        popup.style.display = "flex";
      };
    };
  } else {
    // Kein oder ungültiger Token → Login-Button
    localStorage.removeItem("token"); // Falls ungültig, sicherheitshalber löschen
    button.textContent = "Log in";
    button.onclick = () => {
      popup.style.display = "flex";
    };
  }
}

export function setupPopup(openBtnId) {
  const popup = document.getElementById("login-popup");
  if (!popup) {
    console.error("Popup-Element nicht gefunden!");
    return;
  }

  const closeBtn = popup.querySelector("#closePopup");
  const openBtn = document.getElementById(openBtnId);
  if (!openBtn) {
    console.error("Öffnen-Button nicht gefunden!");
    return;
  }

  // Login-/Logout-Umschaltung
  updateAuthButton(openBtn, popup);

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

  if (isLoggedIn) {
    const event = new CustomEvent("login-success");
    window.dispatchEvent(event);
  }

  document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Verhindert das Neuladen der Seite

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;

    console.log("Benutzername:", username);
    console.log("Passwort:", password);

    // Hier könntest du die Daten an den Server schicken
    fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          updateAuthButton(
            document.getElementById("openLoginPopupButton"),
            document.getElementById("login-popup")
          );
          isLoggedIn = true;
          alert("Register successful");
          const event = new CustomEvent('register-success');
          window.dispatchEvent(event);
          // Popup schließen
          document.getElementById("login-popup").style.display = "none";
        } else {
          alert("Registration failed: " + data.error);
        }
      })
      .catch((error) => {
        console.error("Registration failed:", error);
      });
  });

document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Verhindert das Neuladen der Seite

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  console.log("Benutzername:", username);
  console.log("Passwort:", password);

  // Hier könntest du die Daten an den Server schicken
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        updateAuthButton(
          document.getElementById("openLoginPopupButton"),
          document.getElementById("login-popup")
        );
        isLoggedIn = true;
        alert("Login sucessfull");
        const event = new CustomEvent('login-success');
        window.dispatchEvent(event);
        // Popup schließen
        document.getElementById("login-popup").style.display = "none";
      } else {
        alert("Login failed: " + data.error);
      }
    })
    .catch((error) => {
      console.error("Login failed:", error);
    });
});
}

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch (e) {
    return false; // Ungültiges Token
  }
}


export function getLoginStatus() {
  return isLoggedIn;
}
