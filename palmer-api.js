window.PALMER_API = (function () {
  "use strict";

  var APPS_SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbzqYgi0Ka0aIo4nU_399ozR7dr5sS2KrC4fD45uPfbPoq3fNHO7NG64ayQxqxG7gJikPA/exec";

  function getParam(nome) {
    try {
      var url = new URL(window.location.href);
      return url.searchParams.get(nome) || "";
    } catch (e) {
      return "";
    }
  }

  function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
  }

  function normalizarLead(dados) {
    dados = dados || {};

    return {
      nome: String(dados.nome || "").trim(),
      whatsapp: String(dados.whatsapp || "").trim(),
      whatsapp_limpo: somenteNumeros(dados.whatsapp || ""),
      intencao: String(dados.intencao || "").trim(),
      interesse_compra: String(dados.interesse_compra || dados.interesse || "").trim(),
      valor_desejado: String(dados.valor_desejado || dados.valor || "").trim(),
      tipo_aluguel: String(dados.tipo_aluguel || "").trim(),
      quantidade_pessoas: String(dados.quantidade_pessoas || "").trim(),
      tem_crianca: String(dados.tem_crianca || "").trim(),
      detalhes_criancas: String(dados.detalhes_criancas || "").trim(),
      tem_pet: String(dados.tem_pet || "").trim(),
      detalhes_pet: String(dados.detalhes_pet || "").trim(),
      forma_pagamento: String(dados.forma_pagamento || "").trim(),
      detalhes_pagamento: String(dados.detalhes_pagamento || "").trim(),
      credito_aprovado: String(dados.credito_aprovado || "").trim(),
      preferencia_area_terreno: String(dados.preferencia_area_terreno || "").trim(),
      dias_temporada: String(dados.dias_temporada || "").trim(),
      opiniao: String(dados.opiniao || "").trim(),
      origem: String(dados.origem || getParam("origem") || getParam("utm_source") || "instagram").trim(),
      campanha: String(dados.campanha || getParam("campanha") || getParam("utm_campaign") || "bio").trim(),
      pagina: window.location.href,
      origem_sistema: "github-pages",
      user_agent: navigator.userAgent,
      enviado_em: new Date().toISOString()
    };
  }

  function enviarLead(dados, callbacks) {
    callbacks = callbacks || {};

    var lead = normalizarLead(dados);
    var body = new URLSearchParams();
    body.append("data", JSON.stringify(lead));

    return fetch(APPS_SCRIPT_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: body.toString()
    }).then(function () {
      if (typeof callbacks.sucesso === "function") {
        callbacks.sucesso(lead);
      }

      return {
        sucesso: true,
        lead: lead
      };
    }).catch(function (erro) {
      console.error("Erro ao enviar lead Palmer:", erro);

      if (typeof callbacks.erro === "function") {
        callbacks.erro(erro, lead);
      }

      return {
        sucesso: false,
        erro: erro,
        lead: lead
      };
    });
  }

  function testar() {
    return enviarLead({
      nome: "Teste GitHub Pages",
      whatsapp: "(91) 99999-9999",
      intencao: "Comprar",
      interesse_compra: "Terreno ou lote",
      valor_desejado: "R$ 36.000,00",
      forma_pagamento: "À vista",
      detalhes_pagamento: "Teste enviado pelo GitHub Pages",
      origem: "teste_github",
      campanha: "teste_api"
    }, {
      sucesso: function (lead) {
        console.log("Lead teste enviado:", lead);
      },
      erro: function (erro, lead) {
        console.error("Falha no teste:", erro, lead);
      }
    });
  }

  return {
    enviarLead: enviarLead,
    testar: testar,
    normalizarLead: normalizarLead
  };
})();
