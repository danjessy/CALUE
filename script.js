const coefficients = {
  C11: { UE3: 6, UE5: 15, UE6: 11 },
  D11: { UE4: 18 },
  D12: { UE4: 18 },
  E11: { UE4: 6, UE6: 11 },
  E12: { UE5: 27, UE6: 11 },
  L11: { UE1: 6, UE3: 12, UE6: 11 },
  M11: { UE2: 15, UE4: 18 },
  M12: { UE2: 15 },
  P11: { UE1: 42, UE2: 24 },
  S11: { UE2: 3, UE3: 21 },
  S12: { UE2: 3, UE3: 21 },
  W11: { UE1: 12, UE5: 18, UE6: 5 },
  PPP: { UE6: 11 },
  SAE11: { UE1: 40 },
  SAE12: { UE2: 40 },
  SAE13: { UE3: 40 },
  SAE14: { UE4: 40 },
  SAE15: { UE5: 40 },
  SAE16: { UE6: 40 },
};

// ----------------------------------------------------
//      1. Générer le tableau des modules
// ----------------------------------------------------
const table = document.getElementById("notesTable");

Object.keys(coefficients).forEach(module => {
  const row = table.insertRow(-1);
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  cell1.textContent = module;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "ex: 12, 15, 13";
  input.dataset.module = module;
  input.classList.add("note-input");

  cell2.appendChild(input);
});

// ----------------------------------------------------
//              2. Chargement automatique
// ----------------------------------------------------
function loadNotes() {
  const saved = JSON.parse(localStorage.getItem("notes")) || {};
  document.querySelectorAll(".note-input").forEach(input => {
    const mod = input.dataset.module;
    if (saved[mod]) input.value = saved[mod];
  });
}

loadNotes();

// ----------------------------------------------------
//             3. Sauvegarde automatique
// ----------------------------------------------------
function saveNotes() {
  const data = {};
  document.querySelectorAll(".note-input").forEach(input => {
    if (input.value.trim() !== "") {
      data[input.dataset.module] = input.value;
    }
  });
  localStorage.setItem("notes", JSON.stringify(data));
}

// Sauvegarder à chaque changement
document.addEventListener("input", saveNotes);

// ----------------------------------------------------
//              4. Calcul des UE
// ----------------------------------------------------
document.getElementById("calculate").addEventListener("click", function() {
  const ueResults = {
    UE1:{somme:0,coef:0}, UE2:{somme:0,coef:0}, UE3:{somme:0,coef:0},
    UE4:{somme:0,coef:0}, UE5:{somme:0,coef:0}, UE6:{somme:0,coef:0}
  };

  document.querySelectorAll(".note-input").forEach(input => {
    const module = input.dataset.module;
    const notes = input.value.split(",").map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    if (notes.length > 0) {
      const moyenne = notes.reduce((a,b)=>a+b,0) / notes.length;

      for (const ue in coefficients[module]) {
        const coef = coefficients[module][ue];
        ueResults[ue].somme += moyenne * coef;
        ueResults[ue].coef += coef;
      }
    }
  });

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  for (const ue in ueResults) {
    const res = ueResults[ue];
    const p = document.createElement("p");

    if (res.coef > 0) {
      const m = res.somme / res.coef;
      p.textContent = `${ue} : ${m.toFixed(2)} / 20`;

      // Couleurs
      if (m < 8) p.style.background = "#ffb3b3";
      else if (m < 10) p.style.background = "#ffd9b3";
      else p.style.background = "#b3ffb3";

    } else {
      p.textContent = `${ue} : aucune donnée`;
      p.style.background = "#e6e6e6";
    }

    p.style.padding = "8px";
    p.style.borderRadius = "5px";
    p.style.margin = "5px 0";
    resultsDiv.appendChild(p);
  }
});

// -----------------------------------------------
//         GRAPHIC RADAR AVEC CHART.JS
// -----------------------------------------------

let radarChart = null;

function updateRadarChart(ueResults) {
    const labels = ["UE1", "UE2", "UE3", "UE4", "UE5", "UE6"];
    const data = labels.map(ue => {
        if (ueResults[ue].coef > 0)
            return (ueResults[ue].somme / ueResults[ue].coef).toFixed(2);
        return 0;
    });

    const ctx = document.getElementById("radarChart").getContext("2d");

    // Détruire l’ancien graphique pour éviter les doublons
    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels,
            datasets: [{
                label: "Moyennes des UE",
                data,
                fill: true,
                borderWidth: 2,
            }]
        },
        options: {
            scales: {
                r: {
                    suggestedMin: 0,
                    suggestedMax: 20,
                    ticks: { stepSize: 5 }
                }
            }
        }
    });
}

// Modification dans ton code existant :
document.getElementById("calculate").addEventListener("click", function() {

  const ueResults = {
    UE1:{somme:0,coef:0}, UE2:{somme:0,coef:0}, UE3:{somme:0,coef:0},
    UE4:{somme:0,coef:0}, UE5:{somme:0,coef:0}, UE6:{somme:0,coef:0}
  };

  document.querySelectorAll(".note-input").forEach(input => {
    const module = input.dataset.module;
    const notes = input.value.split(",").map(n => parseFloat(n.trim())).filter(n => !isNaN(n));

    if (notes.length > 0) {
      const moyenne = notes.reduce((a,b)=>a+b,0) / notes.length;

      for (const ue in coefficients[module]) {
        const coef = coefficients[module][ue];
        ueResults[ue].somme += moyenne * coef;
        ueResults[ue].coef += coef;
      }
    }
  });

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  for (const ue in ueResults) {
    const res = ueResults[ue];
    const p = document.createElement("p");

    if (res.coef > 0) {
      const m = res.somme / res.coef;
      p.textContent = `${ue} : ${m.toFixed(2)} / 20`;

      if (m < 8) p.style.background = "#ffb3b3";
      else if (m < 10) p.style.background = "#ffd9b3";
      else p.style.background = "#b3ffb3";

    } else {
      p.textContent = `${ue} : aucune donnée`;
      p.style.background = "#e6e6e6";
    }

    p.style.padding = "8px";
    p.style.borderRadius = "5px";
    p.style.margin = "5px 0";
    resultsDiv.appendChild(p);
  }

  // 🔥 Mise à jour du graphique radar ici
  updateRadarChart(ueResults);
});
