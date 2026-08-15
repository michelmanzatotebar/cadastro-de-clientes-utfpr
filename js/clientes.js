let filiaisCache = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarFiliaisNoFormulario();
  carregarClientes();

  document.getElementById("formCliente").addEventListener("submit", salvarCliente);
  document.getElementById("btnCancelarEdicao").addEventListener("click", cancelarEdicao);
});

async function carregarFiliaisNoFormulario() {
  const container = document.getElementById("filiaisCheckboxes");
  try {
    filiaisCache = await FiliaisAPI.listar();

    if (!filiaisCache.length) {
      container.innerHTML = '<span class="text-muted small">Nenhuma filial cadastrada ainda.</span>';
      return;
    }

    const filiaisOrdenadas = [...filiaisCache].sort((a, b) => {
      if (a.status === b.status) return a.nomeFilial.localeCompare(b.nomeFilial);
      return Number(b.status) - Number(a.status);
    });

    container.innerHTML = filiaisOrdenadas
      .map((filial) => {
        const inativa = filial.status === false;
        const nomeExibicao = inativa ? `${filial.nomeFilial} (Inativa)` : filial.nomeFilial;

        return `
        <div class="form-check ${inativa ? "form-check-inativa" : ""}">
          <input class="form-check-input filial-check" type="checkbox" value="${filial.id}" id="filial-${filial.id}" ${inativa ? "disabled" : ""}>
          <label class="form-check-label" for="filial-${filial.id}">${nomeExibicao}</label>
        </div>`;
      })
      .join("");
  } catch (erro) {
    container.innerHTML = '<span class="text-danger small">Não foi possível carregar as filiais.</span>';
  }
}

async function carregarClientes() {
  const tabela = document.getElementById("tabelaClientes");
  try {
    const clientes = await ClientesAPI.listar();

    if (!clientes.length) {
      tabela.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhum cliente cadastrado ainda.</td></tr>';
      return;
    }

    tabela.innerHTML = clientes.map((cliente) => linhaCliente(cliente)).join("");

    tabela.querySelectorAll("[data-editar]").forEach((btn) =>
      btn.addEventListener("click", () => editarCliente(btn.dataset.editar, clientes))
    );
    tabela.querySelectorAll("[data-excluir]").forEach((btn) =>
      btn.addEventListener("click", () => excluirCliente(btn.dataset.excluir))
    );
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="6" class="empty-state text-danger">Erro ao carregar clientes: ${erro.message}</td></tr>`;
  }
}

function linhaCliente(cliente) {
  const nomesFiliais = (cliente.filiais || [])
    .map((id) => filiaisCache.find((f) => f.id === id))
    .filter(Boolean)
    .map((f) => `<span class="filiais-chip">${f.nomeFilial}</span>`)
    .join("") || '<span class="text-muted small">Nenhuma</span>';

  return `
    <tr>
      <td>${cliente.nome}</td>
      <td>${cliente.idade}</td>
      <td>${cliente.email}</td>
      <td>${cliente.telefone}</td>
      <td>${nomesFiliais}</td>
      <td class="text-end">
        <div class="table-actions">
          <button class="btn btn-sm btn-outline-secondary" data-editar="${cliente.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-excluir="${cliente.id}">Excluir</button>
        </div>
      </td>
    </tr>`;
}

function editarCliente(id, clientes) {
  const cliente = clientes.find((c) => c.id === id);
  if (!cliente) return;

  document.getElementById("clienteId").value = cliente.id;
  document.getElementById("nome").value = cliente.nome;
  document.getElementById("idade").value = cliente.idade;
  document.getElementById("sexo").value = cliente.sexo;
  document.getElementById("email").value = cliente.email;
  document.getElementById("telefone").value = cliente.telefone;
  document.getElementById("logradouro").value = cliente.logradouro;

  document.querySelectorAll(".filial-check").forEach((chk) => {
    chk.checked = (cliente.filiais || []).includes(chk.value);
  });

  document.getElementById("tituloFormCliente").textContent = "Editar cliente";
  document.getElementById("btnCancelarEdicao").classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelarEdicao() {
  document.getElementById("formCliente").reset();
  document.getElementById("clienteId").value = "";
  document.getElementById("tituloFormCliente").textContent = "Novo cliente";
  document.getElementById("btnCancelarEdicao").classList.add("d-none");
  document.querySelectorAll(".filial-check").forEach((chk) => (chk.checked = false));
}

async function salvarCliente(evento) {
  evento.preventDefault();

  const id = document.getElementById("clienteId").value;
  const filiaisSelecionadas = Array.from(document.querySelectorAll(".filial-check:checked")).map(
    (chk) => chk.value
  );

  const cliente = {
    nome: document.getElementById("nome").value.trim(),
    idade: Number(document.getElementById("idade").value),
    sexo: document.getElementById("sexo").value,
    email: document.getElementById("email").value.trim(),
    telefone: document.getElementById("telefone").value.trim(),
    logradouro: document.getElementById("logradouro").value.trim(),
    filiais: filiaisSelecionadas,
  };

  try {
    if (id) {
      await ClientesAPI.atualizar(id, cliente);
      mostrarAlerta("alertaClientes", "Cliente atualizado com sucesso.", "success");
    } else {
      await ClientesAPI.criar(cliente);
      mostrarAlerta("alertaClientes", "Cliente cadastrado com sucesso.", "success");
    }

    cancelarEdicao();
    carregarClientes();
  } catch (erro) {
    mostrarAlerta("alertaClientes", erro.message, "danger");
  }
}

async function excluirCliente(id) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

  try {
    await ClientesAPI.excluir(id);
    mostrarAlerta("alertaClientes", "Cliente excluído.", "success");
    carregarClientes();
  } catch (erro) {
    mostrarAlerta("alertaClientes", erro.message, "danger");
  }
}
