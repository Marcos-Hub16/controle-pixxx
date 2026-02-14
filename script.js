import { collection, addDoc, onSnapshot, doc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos
const tabelaBody = document.querySelector("#tabelaPagamentos tbody");
const totalSpan = document.getElementById("total");
const nomeLogadoSpan = document.getElementById("nomeLogado");
let saldoVerba = 0;

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

  if(isNaN(valor) || valor <= 0) {
    alert("Digite um valor positivo!");
    return;
  }

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
        // Salva no Firestore
        await addDoc(collection(window.db,"pagamentos"), {
          nome: localStorage.getItem("nomeUsuario"),
          valor: valor,
          data: new Date()
        });

        // Mostra chave PIX
        document.getElementById("pixChave").style.display = "block";

        // Limpa input e botão
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
  pagamentos.sort((a,b) => a.nome.localeCompare(b.nome));

  pagamentos.forEach(data => {
    const tr = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = data.nome;

    const tdValor = document.createElement("td");
    tdValor.textContent = data.valor.toFixed(2);

    const tdData = document.createElement("td");
    tdData.textContent = new Date(data.data.seconds * 1000).toLocaleString();

    tr.appendChild(tdNome);
    tr.appendChild(tdValor);
    tr.appendChild(tdData);

    tabelaBody.appendChild(tr);

    total += data.valor;
  });

  totalSpan.textContent = total.toFixed(2);
  saldoVerba = total;
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

async function removerPessoa() {
  const nome = document.getElementById("removerNome").value;
  if(!nome) return alert("Digite o nome!");
  const pagamentosRef = collection(window.db,"pagamentos");
  const snapshot = await window.db.getDocs(pagamentosRef);
  snapshot.forEach(async docSnap => {
    if(docSnap.data().nome === nome) await deleteDoc(doc(window.db,"pagamentos",docSnap.id));
  });
  document.getElementById("removerNome").value = "";
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
  document.getElementById("retirarValor").value = "";
}

// ------------------ EXPORTAR PARA HTML ------------------
window.iniciarPagamento = iniciarPagamento;
window.openTab = openTab;
window.entrarADM = entrarADM;
window.retirarVerba = retirarVerba;
window.removerPessoa = removerPessoa;

// ------------------ ABRIR ABA ENVIAR PIX POR PADRÃO ------------------
document.getElementById('enviar').style.display = 'block';







