// URL base do back-end (server Express rodando em http://localhost:3000)
const API_BASE = "http://localhost:3000";

/**
 * Wrapper simples para chamadas à API, já tratando JSON e erros.
 */
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const mensagem = (data && data.erro) || "Erro ao comunicar com o servidor";
    throw new Error(mensagem);
  }

  return data;
}

const ClientesAPI = {
  listar: () => apiRequest("/api/clientes"),
  criar: (cliente) =>
    apiRequest("/api/clientes", { method: "POST", body: JSON.stringify(cliente) }),
  atualizar: (id, cliente) =>
    apiRequest(`/api/clientes/${id}`, { method: "PUT", body: JSON.stringify(cliente) }),
  excluir: (id) => apiRequest(`/api/clientes/${id}`, { method: "DELETE" }),
};

const FiliaisAPI = {
  listar: () => apiRequest("/api/filiais"),
  criar: (filial) =>
    apiRequest("/api/filiais", { method: "POST", body: JSON.stringify(filial) }),
  atualizar: (id, filial) =>
    apiRequest(`/api/filiais/${id}`, { method: "PUT", body: JSON.stringify(filial) }),
  atualizarStatus: (id, status) =>
    apiRequest(`/api/filiais/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  excluir: (id) => apiRequest(`/api/filiais/${id}`, { method: "DELETE" }),
};

/**
 * Testa a conexão com o back-end e atualiza o indicador visual (usado no index.html).
 */
async function checarConexao() {
  const indicador = document.getElementById("statusConexao");
  if (!indicador) return;

  indicador.innerHTML = '<span class="status-dot pending"></span>Verificando conexão...';

  try {
    await apiRequest("/conexao");
    indicador.innerHTML = '<span class="status-dot ok"></span>Servidor conectado';
  } catch (erro) {
    indicador.innerHTML =
      '<span class="status-dot fail"></span>Sem conexão com o servidor (verifique se ele está rodando em ' +
      API_BASE +
      ")";
  }
}

function mostrarAlerta(containerId, mensagem, tipo = "danger") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>`;
}
