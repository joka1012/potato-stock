const potatoPic =
  "potato.webp";

function potatoShower(amount) {
    for (let i = 0; i < amount; i++) {
        setTimeout(() => {
        const potato = document.createElement("img");
        potato.src = potatoPic; // ← Dein Bildpfad, z. B. "kartoffel.webp"
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
