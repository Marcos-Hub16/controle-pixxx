import { collection, addDoc, onSnapshot, doc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tabelaBody = document.querySelector("#tabelaPagamentos tbody");
const totalSpan = document.getElementById("total");
const nomeLogadoSpan = document.getElementById("nomeLogado");

// Recupera saldo da verba salvo ou inicializa com 0
let saldoVerba = parseFloat(localStorage.getItem("saldoVerba")) || 0;
document.getElementById("saldoADM").textContent = saldoVerba.toFixed(2);

// ------------------ LOGIN SIMULADO ------------------
if(!localStorage.getItem("nomeUsuario")) {
  let nome = prompt("Digite seu nome:");
  if(nome) localStorage.setItem("nomeUsuario", nome);
}
nomeLogadoSpan.textContent = localStorage.getItem("nomeUsuario");

// ------------------ PAGAMENTO ------------------
function iniciarPagamento(botao) {
  const valorInput = document.getElementById("valor");
  let valor = parseFloat(valorInput.value);

  // Bloquear números negativos ou zero
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
          nome: localStorage.getItem("nomeUsuario"),
          valor: valor,
          data: new Date()
        });

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

  // Ordenar do mais recente para o mais antigo
  pagamentos.sort((a,b) => new Date(b.data.seconds * 1000) - new Date(a.data.seconds * 1000));

  pagamentos.forEach(data => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = data.nome || "Anônimo";

    const tdValor = document.createElement("td");
    tdValor.textContent = data.valor.toFixed(2);

    const tdData = document.createElement("td");
    tdData.textContent = new Date(data.data.seconds * 1000).toLocaleString();

    // Botão remover com senha ADM
    const tdRemover = document.createElement("td");
    const btnRemover = document.createElement("button");
    btnRemover.textContent = "X";
    btnRemover.style.color = "red";
    btnRemover.style.cursor = "pointer";
    btnRemover.onclick = async () => {
      const senha = prompt("Digite a senha ADM para remover:");
      if(senha === "GCM2026") {
        await deleteDoc(doc(window.db,"pagamentos",data.id));
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

  totalSpan.textContent = total.toFixed(2);

  // Mostrar saldo da verba sem sobrescrever
  document.getElementById("saldoADM").textContent = saldoVerba.toFixed(2);
});

// ------------------ ABAS ------------------
function openTab(tabName, event) {
  const tabs = document.querySelectorAll('.tabcontent');
  tabs.forEach(tab => tab.style.display = 'none');

  const buttons = document.querySelectorAll('.tablink');
  buttons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName).style.display = 'block';
  if(event) event.currentTarget.classList.add('active');
}

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
  let valor = parseFloat(document.getElementById("retirarValor").value);
  if(isNaN(valor) || valor <= 0) {
    alert("Digite um valor positivo!");
    return;
  }
  saldoVerba -= valor;
  if(saldoVerba < 0) saldoVerba = 0;
  document.getElementById("saldoADM").textContent = saldoVerba.toFixed(2);
  localStorage.setItem("saldoVerba", saldoVerba);
  document.getElementById("retirarValor").value = "";
}

// ------------------ EXPORTAR PARA HTML ------------------
window.iniciarPagamento = iniciarPagamento;
window.openTab = openTab;
window.entrarADM = entrarADM;
window.retirarVerba = retirarVerba;

// ------------------ ABRIR ABA ENVIAR PIX POR PADRÃO ------------------
document.getElementById('enviar').style.display = 'block';










