import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const lista = document.getElementById("lista");
const totalSpan = document.getElementById("total");

function iniciarPagamento(botao) {
  let tempo = 5; // ou 20 segundos

  botao.disabled = true;
  botao.textContent = `Aguardando ${tempo}s`;

  const intervalo = setInterval(() => {
    tempo--;
    botao.textContent = `Aguardando ${tempo}s`;

    if (tempo <= 0) {
      clearInterval(intervalo);
      botao.textContent = "Já paguei";
      botao.disabled = false;
      botao.onclick = () => registrar();
    }
  }, 1000);
}

async function registrar() {
  const nome = document.getElementById("nome").value;
  const valor = parseFloat(document.getElementById("valor").value);

  if (!nome || !valor) {
    alert("Preencha todos os campos!");
    return;
  }

  await addDoc(collection(window.db, "pagamentos"), {
    nome: nome,
    valor: valor,
    data: new Date()
  });

  document.getElementById("nome").value = "";
  document.getElementById("valor").value = "";
}

onSnapshot(collection(window.db, "pagamentos"), (snapshot) => {
  lista.innerHTML = "";
  let total = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const item = document.createElement("li");
    item.textContent = `${data.nome} pagou R$ ${data.valor.toFixed(2)}`;
    lista.appendChild(item);
    total += data.valor;
  });

  totalSpan.textContent = total.toFixed(2);
});

window.iniciarPagamento = iniciarPagamento;


