import { collection, addDoc, onSnapshot, deleteDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("listaPagamentos");
const totalSpan = document.getElementById("total");

// Função de login simulado
function entrar() {
  const nome = document.getElementById("loginNome").value;
  const senha = document.getElementById("loginSenha").value;
  const msg = document.getElementById("loginMsg");

  if(!nome || !senha) {
    msg.textContent = "Preencha todos os campos!";
    return;
  }

  // Salva usuário localmente (simulação)
  localStorage.setItem("usuarioApp", JSON.stringify({nome, senha}));

  // Esconde login, mostra abas e Enviar Pix
  document.getElementById("login").style.display = "none";
  document.querySelector(".tabs").style.display = "flex";
  openTab("enviar");
}

window.entrar = entrar;

// Função iniciar pagamento
function iniciarPagamento(botao) {
  const usuario = JSON.parse(localStorage.getItem("usuarioApp"));
  if(!usuario) { alert("Faça login primeiro!"); return; }

  const valor = parseFloat(document.getElementById("valor").value);
  if(!valor || valor <= 0) { alert("Digite um valor válido!"); return; }

  const chavePix = document.getElementById("chavePix");
  botao.disabled = true;
  chavePix.style.display = "none";

  let tempo = 5;
  botao.textContent = `Aguardando ${tempo}s`;

  const intervalo = setInterval(() => {
    tempo--;
    botao.textContent = `Aguardando ${tempo}s`;

    if(tempo <= 0) {
      clearInterval(intervalo);
      botao.textContent = "Confirmar Pagamento";
      botao.disabled = false;

      botao.onclick = async () => {
        chavePix.style.display = "block";
        botao.style.display = "none";

        await addDoc(collection(window.db, "pagamentos"), {
          nome: usuario.nome,
          valor: valor,
          data: new Date()
        });

        document.getElementById("valor").value = "";
      };
    }
  }, 1000);
}

window.iniciarPagamento = iniciarPagamento;

// Atualização lista de pagamentos
onSnapshot(collection(window.db, "pagamentos"), snapshot => {
  lista.innerHTML = "";
  let total = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    const dataHora = new Date(data.data.seconds*1000).toLocaleString("pt-BR");
    li.textContent = `${data.nome} - R$ ${data.valor.toFixed(2)} - ${dataHora}`;
    lista.appendChild(li);
    total += data.valor;
  });
  totalSpan.textContent = total.toFixed(2);
});

// Aba ADM
const listaADM = document.getElementById("listaADM");
const totalADM = document.getElementById("totalADM");

onSnapshot(collection(window.db, "pagamentos"), snapshot => {
  listaADM.innerHTML = "";
  let total = 0;

  const pagamentos = [];
  snapshot.forEach(doc => pagamentos.push({id: doc.id, ...doc.data()}));
  pagamentos.sort((a,b)=> a.nome.localeCompare(b.nome));

  pagamentos.forEach(data => {
    const li = document.createElement("li");
    const dataHora = new Date(data.data.seconds*1000).toLocaleString("pt-BR");
    li.textContent = `${data.nome} - R$ ${data.valor.toFixed(2)} - ${dataHora}`;

    const btnRemover = document.createElement("button");
    btnRemover.textContent = "Remover";
    btnRemover.onclick = async () => {
      await deleteDoc(doc(window.db, "pagamentos", data.id));
    };
    li.appendChild(btnRemover);

    listaADM.appendChild(li);
    total += data.valor;
  });

  totalADM.textContent = total.toFixed(2);
});

// Função abas
function openTab(tabName, event) {
  const tabs = document.querySelectorAll(".tabcontent");
  tabs.forEach(tab => tab.style.display = "none");

  const buttons = document.querySelectorAll(".tablink");
  buttons.forEach(btn => btn.classList.remove("active"));

  const el = document.getElementById(tabName);
  if(el) el.style.display = "block";
  if(event) event.currentTarget.classList.add("active");
}

window.openTab = openTab;




