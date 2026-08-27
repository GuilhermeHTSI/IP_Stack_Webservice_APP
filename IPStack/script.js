/**
 * IP Stack API — Script principal
 * 
 * Responsável por:
 *  - Controle do modal da chave API (abrir, fechar, salvar)
 *  - Consulta de IP via API IPStack
 *  - Detecção automática do IP do usuário
 *  - Exibição dos resultados, loading e erros
 */

// =============================================
// Seleção de elementos do DOM
// =============================================

const elements = {
    // Input da chave API (dentro do modal)
    apiKey: document.querySelector("#in_api"),

    // Consulta por IP
    inputIp: document.querySelector("#in_ip"),
    btnBuscar: document.querySelector("#btn_ip"),

    // Detecção automática
    btnDetectar: document.querySelector("#btn_ip_check"),

    // Resultados
    resultado: document.querySelector("#txt_info"),

    // Modal
    overlay: document.querySelector("#modal_overlay"),
    btnAbrirModal: document.querySelector("#btn_open_modal"),
    btnFecharModal: document.querySelector("#btn_close_modal"),
    btnSalvar: document.querySelector("#btn_save_api"),
    statusChave: document.querySelector("#api_key_status"),
};


// =============================================
// Modal — Abrir / Fechar / Salvar
// =============================================

/**
 * Abre o modal com animação de entrada.
 */
function abrirModal() {
    elements.overlay.classList.remove("hidden", "fade-out");
    elements.overlay.classList.add("fade-in");
    elements.overlay.setAttribute("aria-hidden", "false");

    // Foca no input após a animação iniciar
    setTimeout(() => elements.apiKey.focus(), 150);
}

/**
 * Fecha o modal com animação de saída.
 */
function fecharModal() {
    elements.overlay.classList.remove("fade-in");
    elements.overlay.classList.add("fade-out");
    elements.overlay.setAttribute("aria-hidden", "true");

    setTimeout(() => {
        elements.overlay.classList.add("hidden");
        elements.overlay.classList.remove("fade-out");
    }, 250);
}

/**
 * Atualiza o visual do botão para refletir se a chave está configurada.
 */
function atualizarStatusChave() {
    const temChave = elements.apiKey.value.trim().length > 0;

    if (temChave) {
        elements.statusChave.textContent = "✓ Chave configurada";
        elements.btnAbrirModal.classList.add("has-key");
    } else {
        elements.statusChave.textContent = "Configurar Chave API";
        elements.btnAbrirModal.classList.remove("has-key");
    }
}

/**
 * Salva a chave (atualiza status) e fecha o modal.
 */
function salvarChave() {
    atualizarStatusChave();
    fecharModal();
}

// Eventos do modal
elements.btnAbrirModal.addEventListener("click", abrirModal);
elements.btnFecharModal.addEventListener("click", fecharModal);
elements.btnSalvar.addEventListener("click", salvarChave);

// Fechar ao clicar fora do modal
elements.overlay.addEventListener("click", (e) => {
    if (e.target === elements.overlay) fecharModal();
});

// Fechar com a tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !elements.overlay.classList.contains("hidden")) {
        fecharModal();
    }
});

// Salvar ao pressionar Enter no input
elements.apiKey.addEventListener("keydown", (e) => {
    if (e.key === "Enter") salvarChave();
});


// =============================================
// Exibição de estados (resultado, loading, erro)
// =============================================

/**
 * Exibe os dados de geolocalização retornados pela API.
 */
function exibirResultado(dados) {
    elements.resultado.classList.remove("hidden");
    elements.resultado.innerHTML = `
        <h2>📍 Informações do IP ${dados.ip}</h2>
        <p><strong>Hostname:</strong> ${dados.hostname || "—"}</p>
        <p><strong>Tipo:</strong> ${dados.type || "—"}</p>
        <p><strong>País:</strong> ${dados.country_name || "—"}</p>
        <p><strong>Cidade:</strong> ${dados.city || "—"}</p>`;
}

/**
 * Exibe o spinner de carregamento.
 */
function exibirLoading() {
    elements.resultado.classList.remove("hidden");
    elements.resultado.innerHTML = '<div class="loading"></div>';
}

/**
 * Exibe uma mensagem de erro.
 */
function exibirErro(mensagem) {
    elements.resultado.classList.remove("hidden");
    elements.resultado.innerHTML = `
        <p style="color: #ff6b6b; text-align: center;">⚠️ ${mensagem}</p>`;
}


// =============================================
// Validação & Requisições à API
// =============================================

/**
 * Verifica se a chave API foi preenchida.
 * Se não, abre o modal automaticamente.
 * @returns {boolean}
 */
function validarChave() {
    if (!elements.apiKey.value.trim()) {
        abrirModal();
        return false;
    }
    return true;
}

/**
 * Faz a requisição à API e trata o retorno.
 * @param {string} url — URL completa da requisição
 * @param {string} erroMsg — Mensagem exibida em caso de falha
 */
function consultarApi(url, erroMsg) {
    exibirLoading();

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error("Erro HTTP");
            return response.json();
        })
        .then((dados) => {
            exibirResultado(dados);
        })
        .catch((error) => {
            console.error(erroMsg, error.message);
            exibirErro(erroMsg);
        });
}


// =============================================
// Eventos de consulta
// =============================================

// Consultar IP informado manualmente
elements.btnBuscar.addEventListener("click", () => {
    if (!validarChave()) return;

    const ip = elements.inputIp.value.trim();
    const chave = elements.apiKey.value.trim();
    const url = `https://api.ipstack.com/${ip}?access_key=${chave}`;

    consultarApi(url, "Erro ao buscar pelo IP. Verifique a chave e o IP informado.");
});

// Detectar IP automaticamente
elements.btnDetectar.addEventListener("click", () => {
    if (!validarChave()) return;

    const chave = elements.apiKey.value.trim();
    const url = `https://api.ipstack.com/check?access_key=${chave}&hostname=1`;

    consultarApi(url, "Erro ao detectar seu IP. Verifique a chave de API.");
});
