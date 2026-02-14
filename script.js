import { collection, addDoc, onSnapshot, doc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos
const tabelaBody = document.querySelector("#tabelaPagamentos tbody");
const totalSpan = document.getElementById("total");
let retirado = parseFloat(localStorage.getItem("saldoVerbaRetirada")) || 0;

// ------------------ PAGAMENTO ------------------
function iniciarPagamento(botao) {
  const nome = document.getElementById("nomePagador").value.trim();
  let valorText = document.getElementById("valor").value.trim();

  if(!nome) return alert("Digite o nome da pessoa!");
  if(!valorText) return alert("Digite o valor!");

  // Converte vírgula para ponto
  valorText = valorText.replace(",", ".");
  let valor = parseFloat(valorText);

  if(isNaN(valor) || valor <= 0) return alert("Digite um valor válido!");

  // Salvar no Firestore
  addDoc(collection(window.db,"pagamentos"), {
    nome: nome,
    valor: valor,
    data: new Date()
  });

  // Limpar inputs
  document.getElementById("nomePagador").value = "";
  document.getElementById("valor").value = "";
}

// ------------------ LISTA DE PAGAMENTOS ------------------
onSnapshot(collection(window.db,"pagamentos"), snapshot => {
  tabelaBody.innerHTML = "";
  let total = 0;

  const pagamentos = [];
  snapshot.forEach(doc => pagamentos.push({id: doc.id, ...doc.data()}));

  // Ordena por data decrescente
  pagamentos.sort((a,b) => new Date(b.data.seconds*1000) - new Date(a.data.seconds*1000));

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

// ------------------ SALDO DA VERBA ------------------
function atualizarSaldoVerba() {
  const total = parseFloat(totalSpan.textContent.replace(",", ".")) || 0;
  const saldo = total - retirado;
  document.getElementById("saldoADM").textContent = saldo.toFixed(2).replace(".", ",");
}

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
  if(isNaN(valor) || valor <= 0) return alert("Digite um valor positivo!");

  const total = parseFloat(totalSpan.textContent.replace(",", ".")) || 0;

  if(valor > (total - retirado)) return alert("Você não pode retirar mais do que o saldo disponível!");

  retirado += valor;
  localStorage.setItem("saldoVerbaRetirada", retirado);
  atualizarSaldoVerba();
  document.getElementById("retirarValor").value = "";
}

function adicionarVerba() {
  let valor = parseFloat(document.getElementById("adicionarValor").value);
  if(isNaN(valor) || valor <= 0) return alert("Digite um valor positivo!");

  retirado -= valor;
  if(retirado < 0) retirado = 0;

  localStorage.setItem("saldoVerbaRetirada", retirado);
  atualizarSaldoVerba();
  document.getElementById("adicionarValor").value = "";
}

// ------------------ EXPORTAR PARA HTML ------------------
window.iniciarPagamento = iniciarPagamento;
window.openTab = openTab;
window.entrarADM = entrarADM;
window.retirarVerba = retirarVerba;
window.adicionarVerba = adicionarVerba;

// ------------------ ABRIR ABA ENVIAR POR PADRÃO ------------------
document.getElementById('enviar').style.display = 'block';













