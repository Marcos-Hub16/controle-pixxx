let total = 0;
let tempo = 20;
let contando = false;

function iniciarPagamento(botao) {
  if (contando) return;

  contando = true;
  tempo = 20;
  botao.disabled = true;

  const intervalo = setInterval(() => {
    botao.textContent = `Aguarde ${tempo}s`;
    tempo--;

    if (tempo < 0) {
      clearInterval(intervalo);
      botao.textContent = "Já paguei";
      botao.disabled = false;
      contando = false;

      botao.onclick = function () {
        registrar();
        botao.textContent = "Pagar";
        botao.onclick = function () {
          iniciarPagamento(botao);
        };
      };
    }
  }, 1000);
}

function registrar() {
  const nome = document.getElementById("nome").value;
  const valor = parseFloat(document.getElementById("valor").value);

  if (!nome || !valor) {
    alert("Preencha todos os campos!");
    return;
  }

  const lista = document.getElementById("lista");
  const item = document.createElement("li");

  item.textContent = `${nome} pagou R$ ${valor.toFixed(2)}`;
  lista.appendChild(item);

  total += valor;
  document.getElementById("total").textContent = total.toFixed(2);

  document.getElementById("nome").value = "";
  document.getElementById("valor").value = "";
}
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  installBtn.style.display = "none";
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
});

