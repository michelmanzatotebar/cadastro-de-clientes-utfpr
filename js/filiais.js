let filialSelecionadaId = null;
let modalClientesFilial;

document.addEventListener("DOMContentLoaded", () => {
  carregarFiliais();

  document.getElementById("formFilial").addEventListener("submit", salvarFilial);
  document.getElementById("btnCancelarEdicaoFilial").addEventListener("click", cancelarEdicaoFilial);
  document.getElementById("btnSalvarClientesFilial").addEventListener("click", salvarClientesDaFilial);

  modalClientesFilial = new bootstrap.Modal(document.getElementById("modalClientesFilial"));
});

async function carregarFiliais() {
  const tabela = document.getElementById("tabelaFiliais");
  try {
    const filiais = await FiliaisAPI.listar();
    const clientes = await ClientesAPI.listar();

    if (!filiais.length) {
      tabela.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhuma filial cadastrada ainda.</td></tr>';
      return;
    }

    tabela.innerHTML = filiais.map((filial) => linhaFilial(filial, clientes)).join("");

    tabela.querySelectorAll("[data-editar]").forEach((btn) =>
      btn.addEventListener("click", () => editarFilial(btn.dataset.editar, filiais))
    );
    tabela.querySelectorAll("[data-excluir]").forEach((btn) =>
      btn.addEventListener("click", () => excluirFilial(btn.dataset.excluir))
    );
    tabela.querySelectorAll("[data-toggle-status]").forEach((chk) =>
      chk.addEventListener("change", () => alternarStatus(chk.dataset.toggleStatus, chk.checked))
    );
    tabela.querySelectorAll("[data-clientes]").forEach((btn) =>
      btn.addEventListener("click", () => abrirModalClientes(btn.dataset.clientes, filiais))
    );
  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="7" class="empty-state text-danger">Erro ao carregar filiais: ${erro.message}</td></tr>`;
  }
}

function linhaFilial(filial, clientes) {
  const totalClientes = clientes.filter((c) => (c.filiais || []).includes(filial.id)).length;

  return `
    <tr>
      <td>${filial.nomeFilial}</td>
      <td>${filial.logradouro}</td>
      <td>${filial.emailFilial}</td>
      <td>${filial.telefone}</td>
      <td>
        <div class="form-check form-switch mb-0">
          <input class="form-check-input" type="checkbox" data-toggle-status="${filial.id}" ${filial.status ? "checked" : ""}>
          <label class="form-check-label small">${filial.status ? "Ativa" : "Inativa"}</label>
        </div>
      </td>
      <td>${totalClientes} cliente(s)</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary" data-clientes="${filial.id}">Clientes</button>
        <button class="btn btn-sm btn-outline-secondary" data-editar="${filial.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-excluir="${filial.id}">Excluir</button>
      </td>
    </tr>`;
}

function editarFilial(id, filiais) {
  const filial = filiais.find((f) => f.id === id);
  if (!filial) return;

  document.getElementById("filialId").value = filial.id;
  document.getElementById("nomeFilial").value = filial.nomeFilial;
  document.getElementById("emailFilial").value = filial.emailFilial;
  document.getElementById("telefoneFilial").value = filial.telefone;
  document.getElementById("logradouroFilial").value = filial.logradouro;

  document.getElementById("tituloFormFilial").textContent = "Editar filial";
  document.getElementById("btnCancelarEdicaoFilial").classList.remove("d-none");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelarEdicaoFilial() {
  document.getElementById("formFilial").reset();
  document.getElementById("filialId").value = "";
  document.getElementById("tituloFormFilial").textContent = "Nova filial";
  document.getElementById("btnCancelarEdicaoFilial").classList.add("d-none");
}

async function salvarFilial(evento) {
  evento.preventDefault();

  const id = document.getElementById("filialId").value;
  const filial = {
    nomeFilial: document.getElementById("nomeFilial").value.trim(),
    emailFilial: document.getElementById("emailFilial").value.trim(),
    telefone: document.getElementById("telefoneFilial").value.trim(),
    logradouro: document.getElementById("logradouroFilial").value.trim(),
  };

  try {
    if (id) {
      await FiliaisAPI.atualizar(id, filial);
      mostrarAlerta("alertaFiliais", "Filial atualizada com sucesso.", "success");
    } else {
      await FiliaisAPI.criar(filial);
      mostrarAlerta("alertaFiliais", "Filial cadastrada com sucesso.", "success");
    }

    cancelarEdicaoFilial();
    carregarFiliais();
  } catch (erro) {
    mostrarAlerta("alertaFiliais", erro.message, "danger");
  }
}

async function excluirFilial(id) {
  if (!confirm("Excluir esta filial? Os clientes vinculados perderão esse vínculo.")) return;

  try {
    await FiliaisAPI.excluir(id);
    mostrarAlerta("alertaFiliais", "Filial excluída.", "success");
    carregarFiliais();
  } catch (erro) {
    mostrarAlerta("alertaFiliais", erro.message, "danger");
  }
}

async function alternarStatus(id, status) {
  try {
    await FiliaisAPI.atualizarStatus(id, status);
    carregarFiliais();
  } catch (erro) {
    mostrarAlerta("alertaFiliais", erro.message, "danger");
    carregarFiliais();
  }
}

async function abrirModalClientes(filialId, filiais) {
  filialSelecionadaId = filialId;
  const filial = filiais.find((f) => f.id === filialId);
  document.getElementById("nomeFilialModal").textContent = filial ? filial.nomeFilial : "";

  const lista = document.getElementById("listaClientesModal");
  lista.innerHTML = "Carregando clientes...";

  try {
    const clientes = await ClientesAPI.listar();

    if (!clientes.length) {
      lista.innerHTML = '<p class="text-muted mb-0">Nenhum cliente cadastrado ainda.</p>';
    } else {
      lista.innerHTML = clientes
        .map((cliente) => {
          const vinculado = (cliente.filiais || []).includes(filialId);
          return `
          <div class="form-check">
            <input class="form-check-input cliente-modal-check" type="checkbox" value="${cliente.id}" id="modal-cliente-${cliente.id}" ${vinculado ? "checked" : ""}>
            <label class="form-check-label" for="modal-cliente-${cliente.id}">${cliente.nome} (${cliente.email})</label>
          </div>`;
        })
        .join("");
    }

    modalClientesFilial.show();
  } catch (erro) {
    lista.innerHTML = `<p class="text-danger mb-0">Erro ao carregar clientes: ${erro.message}</p>`;
  }
}

async function salvarClientesDaFilial() {
  try {
    const clientes = await ClientesAPI.listar();
    const selecionados = Array.from(document.querySelectorAll(".cliente-modal-check:checked")).map(
      (chk) => chk.value
    );

    const atualizacoes = clientes
      .filter((cliente) => {
        const estavaVinculado = (cliente.filiais || []).includes(filialSelecionadaId);
        const deveEstarVinculado = selecionados.includes(cliente.id);
        return estavaVinculado !== deveEstarVinculado;
      })
      .map((cliente) => {
        const novasFiliais = selecionados.includes(cliente.id)
          ? [...new Set([...(cliente.filiais || []), filialSelecionadaId])]
          : (cliente.filiais || []).filter((id) => id !== filialSelecionadaId);

        return ClientesAPI.atualizar(cliente.id, { ...cliente, filiais: novasFiliais });
      });

    await Promise.all(atualizacoes);

    modalClientesFilial.hide();
    mostrarAlerta("alertaFiliais", "Vínculos de clientes atualizados.", "success");
    carregarFiliais();
  } catch (erro) {
    mostrarAlerta("alertaFiliais", erro.message, "danger");
  }
}
