export const STEPS_TO_FINISH = 5;

export const DRIVERS = [
  { id: "mario", name: "Mario", speed: 4, handling: 3, power: 3, color: "#e64739" },
  { id: "peach", name: "Peach", speed: 3, handling: 4, power: 2, color: "#ec79a4" },
  { id: "yoshi", name: "Yoshi", speed: 2, handling: 4, power: 3, color: "#54a968" },
  { id: "bowser", name: "Bowser", speed: 5, handling: 2, power: 5, color: "#d48a32" },
  { id: "luigi", name: "Luigi", speed: 3, handling: 4, power: 4, color: "#48a96a" },
  { id: "dk", name: "Donkey Kong", speed: 2, handling: 2, power: 5, color: "#a76642" },
];

const BLOCKS = [
  { name: "Reta", icon: "⚡", attribute: "speed", label: "velocidade" },
  { name: "Curva", icon: "↪", attribute: "handling", label: "manobra" },
  { name: "Confronto", icon: "🥊", attribute: "power", label: "poder" },
];

const rollDice = () => Math.floor(Math.random() * 6) + 1;

export function createRace(drivers) {
  return { drivers, round: 0, scores: [0, 0], positions: [0, 0], winner: null };
}

// Só quem vence a rodada avança; no confronto, quem perde também perde 1 ponto.
export function playRound(race) {
  race.round += 1;

  const block = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
  const dice = [rollDice(), rollDice()];
  const totals = race.drivers.map((driver, i) => driver[block.attribute] + dice[i]);
  const detail = race.drivers
    .map((driver, i) => `${driver.name}: ${dice[i]} + ${driver[block.attribute]} ${block.label}`)
    .join(" · ");

  let message = "Empate na rodada: ninguém avançou.";

  if (totals[0] !== totals[1]) {
    const winner = totals[0] > totals[1] ? 0 : 1;
    const loser = 1 - winner;
    const winnerName = race.drivers[winner].name;

    race.positions[winner] += 1;

    if (block.name === "Confronto") {
      const lostPoint = race.scores[loser] > 0;
      if (lostPoint) race.scores[loser] -= 1;
      message = `${winnerName} venceu o confronto!${
        lostPoint ? ` ${race.drivers[loser].name} perdeu 1 ponto.` : ""
      }`;
    } else {
      race.scores[winner] += 1;
      message = `${winnerName} venceu a rodada e marcou 1 ponto!`;
    }
  } else if (block.name === "Confronto") {
    message = "Confronto empatado: ninguém perdeu pontos.";
  }

  const finisher = race.positions.findIndex((position) => position >= STEPS_TO_FINISH);
  race.winner = finisher === -1 ? null : race.drivers[finisher];

  return { block, detail, message };
}
