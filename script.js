import { collection, addDoc, onSnapshot, doc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos
const tabelaBody = document.querySelector("#tabelaPagamentos tbody");
const totalSpan = document.getElementById("total");

// ------------------ SALDO DA VERBA ------------------
let retirado = parseFloat(localStorage.getItem("saldoVerbaRetirada")) || 0;
let adicionada = parseFloat(localStorage.getItem("saldoVerbaAdicionada")) || 0;

// ------------------ PAGAMENTO ------------------
function iniciarPagamento(botao) {
  const nomeInput = document.getElementById("nome");
  const valorInput = document.getElementById("valor");

  let nome = nomeInput.value.trim();
  let valor = parseFloat(valorInput.value.replace(",", "."));

  if(!nome) {
    alert("Digite seu nome!");
    return;
  }

  if(isNaN(valor) || valor <= 0) {
    alert("Digite um valor positivo!");
    return;
  }

  // Mostrar PIX imediatamente
  document.getElementById("pixChave").style.display = "block";

  botao.disabled = true;
  let tempo = 5;
  botao.textContent = `Aguardando ${tempo}s`;

  const intervalo = setInterval(() => {
    tempo--;
    botao.textContent = `Aguardando ${tempo}s`;

    if(tempo <= 0) {
      clearInterval(intervalo);
      botao.textContent = "Confirmar pagamento";
      botao.disabled = false;

      botao.onclick = async () => {
        await addDoc(collection(window.db,"pagamentos"), {
          nome: nome,
          valor: valor,
          data: new Date()
        });

        nomeInput.value = "";
        valorInput.value = "";
        botao.textContent = "Pagar novamente";
        botao.onclick = () => iniciarPagamento(botao);
      };
    }
  },1000);
}

// ------------------ LISTA DE PAGAMENTOS ------------------
onSnapshot(collection(window.db,"pagamentos"), snapshot => {
  tabelaBody.innerHTML = "";
  let total = 0;

  const pagamentos = [];
  snapshot.forEach(doc => pagamentos.push({id: doc.id, ...doc.data()}));

  // Ordena por data decrescente
  pagamentos.sort((a,b) => new Date(b.data.seconds * 1000) - new Date(a.data.seconds * 1000));

  pagamentos.forEach(data => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = data.nome || "Anônimo";

    const tdValor = document.createElement("td");
    tdValor.textContent = data.valor.toFixed(2).replace(".", ",");

    const tdData = document.createElement("td");
    tdData.textContent = new Date(data.data.seconds*1000).toLocaleString();

    // Botão remover
    const tdRemover = document.createElement("td");
    const btnRemover = document.createElement("button");
    btnRemover.textContent = "X";
    btnRemover.style.color = "red";
    btnRemover.style.cursor = "pointer";
    btnRemover.onclick = async () => {
      const senha = prompt("Digite a senha ADM para remover:");
      if(senha === "GCM2026") {
        await deleteDoc(doc(window.db,"pagamentos",data.id));
        atualizarSaldoVerba();
      } else {
        alert("Senha incorreta!");
      }
    };
    tdRemover.appendChild(btnRemover);

    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdData);
    tr.appendChild(tdRemover);

    tabelaBody.appendChild(tr);
    total += data.valor;
  });

  totalSpan.textContent = total.toFixed(2).replace(".", ",");
  atualizarSaldoVerba();
});

// ------------------ FUNÇÃO PARA ATUALIZAR SALDO DA VERBA ------------------
function atualizarSaldoVerba() {
  const total = parseFloat(totalSpan.textContent.replace(",", ".")) || 0;
  const saldoVerba = total + adicionada - retirado;
  document.getElementById("saldoADM").textContent = saldoVerba.toFixed(2).replace(".", ",");
}

// ------------------ ABAS ------------------
document.addEventListener("DOMContentLoaded", () => {
  function openTab(tabName, event) {
    document.querySelectorAll('.tabcontent').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tablink').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabName).style.display = 'block';
    if(event) event.currentTarget.classList.add('active');
  }

  // Abre a aba "Enviar Pix" por padrão
  openTab('enviar');

  window.openTab = openTab;
});

// ------------------ ADM ------------------
function entrarADM() {
  const senha = document.getElementById("senhaADM").value;
  if(senha === "GCM2026") {
    document.getElementById("painelADM").style.display = "block";
  } else {
    alert("Senha incorreta!");
  }
}

function retirarVerba() {
  let valor = parseFloat(document.getElementById("retirarValor").value.replace(",", "."));
  if(isNaN(valor) || valor <= 0) {
    alert("Digite um valor positivo!");
    return;
  }

  const total = parseFloat(totalSpan.textContent.replace(",", ".")) || 0;
  if(valor > (total + adicionada - retirado)) {
    alert("Você não pode retirar mais do que o saldo disponível!");
    return;
  }

  retirado += valor;
  localStorage.setItem("saldoVerbaRetirada", retirado);
  atualizarSaldoVerba();
  document.getElementById("retirarValor").value = "";
}

function adicionarVerba() {
  let valor = parseFloat(document.getElementById("adicionarValor").value.replace(",", "."));
  if(isNaN(valor) || valor <= 0) {
    alert("Digite um valor positivo!");
    return;
  }

  adicionada += valor;
  localStorage.setItem("saldoVerbaAdicionada", adicionada);
  atualizarSaldoVerba();
  document.getElementById("adicionarValor").value = "";
}

// ------------------ EXPORTAR PARA HTML ------------------
window.iniciarPagamento = iniciarPagamento;
window.entrarADM = entrarADM;
window.retirarVerba = retirarVerba;
window.adicionarVerba = adicionarVerba;















