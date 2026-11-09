import { launchConfetti, stopConfetti } from "./confetti.js";
import { createRace, DRIVERS, playRound, STEPS_TO_FINISH } from "./game.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const selects = $$(".driver-card select");
const previews = $$(".driver-preview");
const laneNames = $$(".lane-name");
const karts = $$(".kart-marker");
const raceButton = $("#race-button");
const winnerOverlay = $("#winner-overlay");

const MAX_FEED_ITEMS = 5;
const WINNER_DELAY_MS = 600;
const gif = (driver) => `/docs/${driver.id}.gif`;

let race;
let feed = [];
let winnerTimer;

function renderSelection() {
  race.drivers.forEach((driver, i) => {
    previews[i].innerHTML = `
      <img src="${gif(driver)}" alt="${driver.name}" />
      <div class="driver-stats">
        <span><b>Velocidade</b><strong>${driver.speed}</strong></span>
        <span><b>Manobra</b><strong>${driver.handling}</strong></span>
        <span><b>Poder</b><strong>${driver.power}</strong></span>
      </div>`;
    laneNames[i].textContent = driver.name;
    karts[i].style.setProperty("--driver-color", driver.color);
    karts[i].firstElementChild.src = gif(driver);
  });
}

function renderRace() {
  $("#lap-counter").innerHTML = `${race.round} <span>rodadas</span>`;

  $("#scoreboard").innerHTML = race.drivers
    .map(
      (driver, i) => `
        <div class="score-row">
          <div class="score-driver">
            <img src="${gif(driver)}" alt="" />
            <div><strong>${driver.name}</strong><span>JOGADOR ${i + 1}</span></div>
          </div>
          <strong class="score-value">${race.scores[i]}</strong>
        </div>`
    )
    .join("");

  karts.forEach((kart, i) => {
    kart.style.left = `${4 + (race.positions[i] / STEPS_TO_FINISH) * 87}%`;
  });

  $("#feed-list").innerHTML = feed.length
    ? feed.map(({ icon, message }) => `<li><span>${icon}</span>${message}</li>`).join("")
    : '<li class="feed-empty">A corrida ainda não começou.</li>';
}

function showResult(icon, title, detail) {
  $("#round-result").innerHTML = `
    <span class="result-icon" aria-hidden="true">${icon}</span>
    <div><strong>${title}</strong><span>${detail}</span></div>`;
}

function showWinner(winner) {
  const rounds = `${race.round} ${race.round === 1 ? "rodada" : "rodadas"}`;
  $("#winner-image").src = gif(winner);
  $("#winner-image").alt = winner.name;
  $("#winner-title").textContent = `${winner.name} venceu!`;
  $("#winner-detail").textContent = `${winner.name} cruzou a linha de chegada em ${rounds}.`;
  winnerOverlay.hidden = false;
  $("#winner-again").focus();
  launchConfetti();
}

function hideWinner() {
  clearTimeout(winnerTimer);
  winnerOverlay.hidden = true;
  stopConfetti();
}

function resetRace() {
  hideWinner();
  race = createRace(selects.map((select) => DRIVERS.find((d) => d.id === select.value)));
  feed = [];
  showResult("🏁", "A pista está pronta", "Os motores estão esperando por você.");
  raceButton.innerHTML = '<span aria-hidden="true">▶</span> Largar corrida';
  renderSelection();
  renderRace();
}

function nextRound() {
  const { block, detail, message } = playRound(race);

  feed = [{ icon: block.icon, message }, ...feed].slice(0, MAX_FEED_ITEMS);
  showResult(block.icon, `${block.icon} ${block.name}`, detail);

  if (race.winner) {
    const result = `${race.winner.name} cruzou a linha de chegada e é o grande campeão!`;
    feed = [{ icon: "🏆", message: result }, ...feed].slice(0, MAX_FEED_ITEMS);
    showResult("🏆", "🏆 Temos um campeão!", result);
    raceButton.innerHTML = '<span aria-hidden="true">↻</span> Correr de novo';
    winnerTimer = setTimeout(() => showWinner(race.winner), WINNER_DELAY_MS);
  } else {
    raceButton.innerHTML = '<span aria-hidden="true">▶</span> Próxima rodada';
  }

  renderRace();
}

function handleSelectionChange(changed) {
  const other = selects.find((select) => select !== changed);
  if (changed.value === other.value) {
    other.value = DRIVERS.find((driver) => driver.id !== changed.value).id;
  }
  resetRace();
}

selects.forEach((select, i) => {
  select.innerHTML = DRIVERS.map((d) => `<option value="${d.id}">${d.name}</option>`).join("");
  select.value = ["mario", "luigi"][i];
  select.addEventListener("change", () => handleSelectionChange(select));
});

raceButton.addEventListener("click", () => (race.winner ? resetRace() : nextRound()));
$("#winner-again").addEventListener("click", resetRace);
$("#winner-close").addEventListener("click", hideWinner);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !winnerOverlay.hidden) hideWinner();
});

resetRace();
