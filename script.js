import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("listaPagamentos");
const totalSpan = document.getElementById("total");
const chavePix = document.getElementById("chavePix");

// --- LOGIN LOCAL ---
function entrar() {
  const nome = document.getElementById("loginNome").value;
  const senha = document.getElementById("loginSenha").value;
  const msg = document.getElementById("loginMsg");

  if (!nome || !senha) {
    msg.textContent = "Preencha todos os campos!";
    return;
  }

  const userSalvo = JSON.parse(localStorage.getItem("usuarioApp"));

  if (userSalvo) {
    if (userSalvo.senha === senha) {
      iniciarApp(userSalvo.nome);
    } else {
      msg.textContent = "Senha incorreta!";
    }
  } else {
    localStorage.setItem("usuarioApp", JSON.stringify({ nome, senha }));
    iniciarApp(nome);
  }
}

function iniciarApp(nomeUsuario) {
  document.getElementById("login").style.display = "none";
  document.querySelector(".tabs").style.display = "flex";
  document.getElementById("enviar").style.display = "block";
  alert(`Bem-vindo(a), ${nomeUsuario}!`);
}

// --- PAGAMENTO ---
function iniciarPagamento(botao) {
  const valor = parseFloat(document.getElementById("valor").value);
  if (!valor || valor <= 0) {
    alert("Digite um valor válido!");
    return;
  }

  botao.disabled = true;
  let tempo = 5; // contagem regressiva
  botao.textContent = `Aguardando ${tempo}s`;
  chavePix.style.display = "none";

  const intervalo = setInterval(() => {
    tempo--;
    botao.textContent = `Aguardando ${tempo}s`;

    if (tempo <= 0) {
      clearInterval(intervalo);
      botao.textContent = "Já paguei";
      botao.disabled = false;
      chavePix.style.display = "block";

      // Salva no Firebase
      addDoc(collection(window.db, "pagamentos"), {
        nome: JSON.parse(localStorage.getItem("usuarioApp")).nome,
        valor: valor,
        data: new Date()
      });

      document.getElementById("valor").value = "";
    }
  }, 1000);
}

// --- LISTA DE PAGAMENTOS ---
onSnapshot(collection(window.db, "pagamentos"), (snapshot) => {
  lista.innerHTML = "";
  let total = 0;

  const pagamentos = [];
  snapshot.forEach(doc => pagamentos.push(doc.data()));
  pagamentos.sort((a,b)=> a.nome.localeCompare(b.nome));

  pagamentos.forEach(data => {
    const li = document.createElement("li");
    const dataHora = new Date(data.data.seconds*1000).toLocaleString("pt-BR");
    li.textContent = `${data.nome} pagou R$ ${data.valor.toFixed(2)} - ${dataHora}`;
    li.style.background = "white";
    li.style.margin = "5px 0";
    li.style.padding = "8px";
    li.style.borderRadius = "8px";
    lista.appendChild(li);

    total += data.valor;
  });

  totalSpan.textContent = total.toFixed(2);
});

// --- ABAS ---
function openTab(tabName, event) {
  const tabs = document.querySelectorAll(".tabcontent");
  tabs.forEach(tab => tab.style.display = "none");

  const buttons = document.querySelectorAll(".tablink");
  buttons.forEach(btn => btn.classList.remove("active"));

  document.getElementById(tabName).style.display = "block";
  if(event) event.currentTarget.classList.add("active");
}

document.getElementById("enviar").style.display = "block";

window.iniciarPagamento = iniciarPagamento;
window.openTab = openTab;
window.entrar = entrar;




