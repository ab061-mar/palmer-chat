
window.PALMER_SUPABASE = (function () {

  "use strict";



  var SUPABASE_URL = "https://rfpepuqgnwxbgminqmfu.supabase.co";

  var SUPABASE_ANON_KEY = "";



  function uuid() {

    if (window.crypto && typeof window.crypto.randomUUID === "function") {

      return window.crypto.randomUUID();

    }



    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {

      var r = Math.random() * 16 | 0;

      var v = c === "x" ? r : (r & 0x3 | 0x8);

      return v.toString(16);

    });

  }



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

      id: uuid(),

      nome: String(dados.nome || "").trim(),

      whatsapp: String(dados.whatsapp || "").trim(),

      whatsapp_limpo: somenteNumeros(dados.whatsapp || ""),

      intencao: String(dados.intencao || "Não informado").trim(),

      interesse: String(dados.interesse_compra || dados.interesse || "").trim(),

      status_lead: "novo",

      etapa_atendimento: "finalizado",

      valor_desejado: String(dados.valor_desejado || dados.valor || "").trim(),

      origem: String(dados.origem || getParam("origem") || getParam("utm_source") || "github-pages").trim(),

      campanha: String(dados.campanha || getParam("campanha") || getParam("utm_campaign") || "sem_campanha").trim(),

      pagina_origem: window.location.href,

      user_agent: navigator.userAgent,

      origem_sistema: "github-pages",

      dados_json: dados

    };

  }



  function normalizarDetalhes(leadId, dados) {

    dados = dados || {};



    return {

      lead_id: leadId,

      tipo_aluguel: String(dados.tipo_aluguel || "").trim(),

      dias_temporada: String(dados.dias_temporada || "").trim(),

      quantidade_pessoas: String(dados.quantidade_pessoas || "").trim(),

      tem_crianca: String(dados.tem_crianca || "").trim(),

      detalhes_criancas: String(dados.detalhes_criancas || "").trim(),

      tem_pet: String(dados.tem_pet || "").trim(),

      detalhes_pet: String(dados.detalhes_pet || "").trim(),

      forma_pagamento: String(dados.forma_pagamento || "").trim(),

      detalhes_pagamento: String(dados.detalhes_pagamento || "").trim(),

      credito_aprovado: String(dados.credito_aprovado || "").trim(),

      preferencia_area_terreno: String(dados.preferencia_area_terreno || "").trim(),

      opiniao: String(dados.opiniao || "").trim()

    };

  }



  function inserir(tabela, payload) {

    return fetch(SUPABASE_URL + "/rest/v1/" + tabela, {

      method: "POST",

      headers: {

        "apikey": SUPABASE_ANON_KEY,

        "Authorization": "Bearer " + SUPABASE_ANON_KEY,

        "Content-Type": "application/json",

        "Prefer": "return=minimal"

      },

      body: JSON.stringify(payload)

    }).then(function (res) {

      if (!res.ok) {

        return res.text().then(function (txt) {

          throw new Error("Erro Supabase " + tabela + ": " + res.status + " - " + txt);

        });

      }



      return {

        sucesso: true,

        tabela: tabela

      };

    });

  }



  function salvarLead(dados, callbacks) {

    callbacks = callbacks || {};



    var lead = normalizarLead(dados);

    var detalhes = normalizarDetalhes(lead.id, dados);



    if (!lead.nome) {

      var erroNome = new Error("Nome obrigatório.");

      if (typeof callbacks.erro === "function") callbacks.erro(erroNome);

      return Promise.reject(erroNome);

    }



    if (!lead.whatsapp) {

      var erroWhatsapp = new Error("WhatsApp obrigatório.");

      if (typeof callbacks.erro === "function") callbacks.erro(erroWhatsapp);

      return Promise.reject(erroWhatsapp);

    }



    return inserir("palmer_leads_01_principal", lead)

      .then(function () {

        return inserir("palmer_leads_02_detalhes", detalhes);

      })

      .then(function () {

        if (typeof callbacks.sucesso === "function") {

          callbacks.sucesso({

            lead: lead,

            detalhes: detalhes

          });

        }



        return {

          sucesso: true,

          lead: lead,

          detalhes: detalhes

        };

      })

      .catch(function (erro) {

        console.error("Erro ao salvar no Supabase:", erro);



        if (typeof callbacks.erro === "function") {

          callbacks.erro(erro);

        }



        return {

          sucesso: false,

          erro: erro

        };

      });

  }



  function testar() {

    return salvarLead({

      nome: "Teste Supabase Direto",

      whatsapp: "(91) 99999-9999",

      intencao: "Comprar",

      interesse_compra: "Terreno ou lote",

      valor_desejado: "R$ 36.000,00",

      forma_pagamento: "À vista",

      detalhes_pagamento: "Teste direto GitHub para Supabase",

      origem: "teste_github",

      campanha: "fase_2_supabase"

    }, {

      sucesso: function (res) {

        console.log("Teste salvo no Supabase:", res);

      },

      erro: function (erro) {

        console.error("Falha no teste Supabase:", erro);

      }

    });

  }



  return {

    salvarLead: salvarLead,

    testar: testar,

    normalizarLead: normalizarLead,

    normalizarDetalhes: normalizarDetalhes

  };

})();

