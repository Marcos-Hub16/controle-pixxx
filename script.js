import { collection, addDoc, onSnapshot } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Elementos da lista e total
const lista = document.getElementById("listaPagamentos");
const totalSpan = document.getElementById("total");

// Função iniciar pagamento com contagem regressiva
function iniciarPagamento(botao) {
  let tempo = 5; // você pode aumentar para 20 segundos
  botao.disabled = true;
  botao.textContent = `Aguardando ${tempo}s`;

  const intervalo = setInterval(() => {
    tempo--;
    botao.textContent = `Aguardando ${tempo}s`;

    if (tempo <= 0) {
      clearInterval(intervalo);
      botao.textContent = "Já paguei";
      botao.disabled = false;
      botao.onclick = () => registrar(); // Após contagem, registra pagamento
    }
  }, 1000);
}

// Função para registrar pagamento no Firebase
async function registrar() {
  const nome = document.getElementById("nome").value;
  const valor = parseFloat(document.getElementById("valor").value);

  if (!nome || !valor) {
    alert("Preencha todos os campos!");
    return;
  }

  // Adiciona documento na coleção "pagamentos"
  await addDoc(collection(window.db, "pagamentos"), {
    nome: nome,
    valor: valor,
    data: new Date()
  });

  // Limpa campos
  document.getElementById("nome").value = "";
  document.getElementById("valor").value = "";
}

// Atualização em tempo real da lista + ordenação por nome
onSnapshot(collection(window.db, "pagamentos"), (snapshot) => {
  lista.innerHTML = "";
  let total = 0;

  const pagamentos = [];
  snapshot.forEach(doc => pagamentos.push(doc.data()));

  // Ordena alfabeticamente pelo nome
  pagamentos.sort((a, b) => a.nome.localeCompare(b.nome));

  pagamentos.forEach(data => {
    const item = document.createElement("li");
    item.textContent = `${data.nome} pagou R$ ${data.valor.toFixed(2)}`;
    lista.appendChild(item);
    total += data.valor;
  });

  totalSpan.textContent = total.toFixed(2);
});

// Função para alternar abas
function openTab(tabName, event) {
  // Esconde todas as abas
  const tabs = document.querySelectorAll('.tabcontent');
  tabs.forEach(tab => tab.style.display = 'none');

  // Remove active de todos os botões
  const buttons = document.querySelectorAll('.tablink');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Mostra a aba selecionada
  document.getElementById(tabName).style.display = 'block';
  if(event) event.currentTarget.classList.add('active');
}

// Mostrar aba "Enviar Pix" por padrão
document.getElementById('enviar').style.display = 'block';

// Tornar funções globais para HTML poder chamar
window.iniciarPagamento = iniciarPagamento;
window.openTab = openTab;



