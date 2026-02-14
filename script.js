import { collection, addDoc, onSnapshot, doc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tabelaBody = document.querySelector("#tabelaPagamentos tbody");
const totalSpan = document.getElementById("total");

let retirado = parseFloat(localStorage.getItem("saldoVerbaRetirada")) || 0;

// ------------------ PAGAMENTO ------------------
function iniciarPagamento(botao) {
  const nomeInput = document.getElementById("nomeUsuario");
  const valorInput = document.getElementById("valor");
  let nome = nomeInput.value.trim();
  let valor = parseFloat(valorInput.value.replace(",", "."));

  if(!nome) return alert("Digite seu nome!");
  if(isNaN(valor) || valor <= 0) return alert("Digite um valor positivo!");

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
  pagamentos.sort((a,b) => new Date(b.data.seconds*1000) - new Date(a.data.seconds*1000));

  pagamentos.forEach(data => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = data.nome;

    const tdValor = document.createElement("td");
    tdValor.textContent = data.valor.toFixed(2).replace(".", ",");

    const tdData = document.createElement("td");
    tdData.textContent = new Date(data.data.seconds*1000).toLocaleString();

    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdData);

    tabelaBody.appendChild(tr);
    total += data.valor;
  });

  totalSpan.textContent = total.toFixed(2).replace(".", ",");
  atualizarSaldoVerba();
});

// ------------------ SALDO VERBA ------------------
function atualizarSaldoVerba() {
  const total = parseFloat(totalSpan.textContent.replace(",", ".")) || 0;
  const saldoVerba = total - retirado;
  document.getElementById("saldoADM").textContent = saldoVerba.toFixed(2).replace(".", ",");
}

// ------------------ ABAS ------------------
function openTab(tabName, event) {
  document.querySelectorAll('.tabcontent').forEach(tab => tab.style.display = 'none');
  document.querySelectorAll('.tablink').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).style.display = 'block';
  if(event) event.currentTarget.classList.add('active');
}

// ------------------ ADM ------------------
function entrarADM() {
  const senha = document.getElementById("senhaADM").value;
  if(senha === "GCM2026") document.getElementById("painelADM").style.display = "block";
  else alert("Senha incorreta!");
}

function retirarVerba() {
  let valor = parseFloat(document.getElementById("retirarValor").value);
  const total = parseFloat(totalSpan.textContent.replace(",", ".")) || 0;
  if(isNaN(valor) || valor <= 0) return alert("Digite um valor positivo!");
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

// ------------------ ABRIR ABA ENVIAR PIX POR PADRÃO ------------------
document.getElementById('enviar').style.display = 'block';














