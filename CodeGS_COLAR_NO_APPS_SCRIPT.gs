// ============================================================================
// PALMER IMÓVEIS — API DO APPS SCRIPT
// COLE ESTE BLOCO NO FINAL DO SEU Code.gs.
// NÃO COLE NO GITHUB.
// ============================================================================

function configurarApisPalmer() {
  var props = PropertiesService.getScriptProperties();

  props.setProperties({
    SUPABASE_URL: 'https://rfpepuqgnwxbgminqmfu.supabase.co',
    SUPABASE_API_KEY: 'COLE_AQUI_SUA_SUPABASE_API_KEY',
    TELEGRAM_BOT_TOKEN: 'COLE_AQUI_SEU_TELEGRAM_BOT_TOKEN',
    TELEGRAM_CHAT_ID: 'COLE_AQUI_SEU_TELEGRAM_CHAT_ID'
  });

  Logger.log('Configurações Palmer salvas.');
}

function doPost(e) {
  var saida = {
    sucesso: false,
    salvoPlanilha: false,
    salvoSupabase: false,
    telegram: false,
    erro: ''
  };

  try {
    var dados = extrairDadosPostPalmer_(e);

    if (!dados || Object.keys(dados).length === 0) {
      throw new Error('Nenhum dado recebido no doPost.');
    }

    dados.recebido_em = new Date().toISOString();
    dados.origem_sistema = dados.origem_sistema || 'github-pages';

    if (typeof salvarNovoLead === 'function') {
      saida.resultadoPlanilha = salvarNovoLead(dados) || {};
      saida.salvoPlanilha = true;
    } else {
      Logger.log('Aviso: salvarNovoLead(dados) não encontrada.');
    }

    try {
      var resSupabase = enviarSupabasePalmer_(dados);
      saida.salvoSupabase = !!resSupabase.sucesso;
      saida.supabase = resSupabase;
    } catch (erroSupabase) {
      saida.salvoSupabase = false;
      saida.erroSupabase = erroSupabase.message;
    }

    try {
      var resTelegram = enviarTelegramPalmer_(dados);
      saida.telegram = !!resTelegram.sucesso;
      saida.resultadoTelegram = resTelegram;
    } catch (erroTelegram) {
      saida.telegram = false;
      saida.erroTelegram = erroTelegram.message;
    }

    saida.sucesso = true;
    return respostaJsonPalmer_(saida);

  } catch (erro) {
    saida.sucesso = false;
    saida.erro = erro.message;
    return respostaJsonPalmer_(saida);
  }
}

function extrairDadosPostPalmer_(e) {
  if (!e) return {};

  if (e.parameter && e.parameter.data) {
    return JSON.parse(e.parameter.data);
  }

  if (e.postData && e.postData.contents) {
    var raw = e.postData.contents;

    if (raw.indexOf('data=') === 0) {
      var partes = raw.split('&');

      for (var i = 0; i < partes.length; i++) {
        var kv = partes[i].split('=');

        if (decodeURIComponent(kv[0]) === 'data') {
          return JSON.parse(decodeURIComponent((kv[1] || '').replace(/\+/g, ' ')));
        }
      }
    }

    return JSON.parse(raw);
  }

  return {};
}

function enviarSupabasePalmer_(dados) {
  var supabaseUrl = getConfigPalmer_('SUPABASE_URL');
  var supabaseKey = getConfigPalmer_('SUPABASE_API_KEY');

  if (!supabaseUrl || supabaseUrl.indexOf('COLE_AQUI') >= 0) {
    return { sucesso: false, erro: 'SUPABASE_URL não configurada.' };
  }

  if (!supabaseKey || supabaseKey.indexOf('COLE_AQUI') >= 0) {
    return { sucesso: false, erro: 'SUPABASE_API_KEY não configurada.' };
  }

  var endpoint = supabaseUrl.replace(/\/$/, '') + '/rest/v1/leads';

  var payload = {
    nome: String(dados.nome || ''),
    whatsapp: String(dados.whatsapp || ''),
    intencao: String(dados.intencao || '')
  };

  var resposta = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: {
      apikey: supabaseKey,
      Authorization: 'Bearer ' + supabaseKey,
      Prefer: 'return=representation'
    },
    payload: JSON.stringify(payload)
  });

  var code = resposta.getResponseCode();
  var body = resposta.getContentText();

  if (code >= 200 && code < 300) {
    return { sucesso: true, status: code, resposta: body };
  }

  return { sucesso: false, status: code, erro: body };
}

function enviarTelegramPalmer_(dados) {
  var token = getConfigPalmer_('TELEGRAM_BOT_TOKEN');
  var chatId = getConfigPalmer_('TELEGRAM_CHAT_ID');

  if (!token || token.indexOf('COLE_AQUI') >= 0) {
    return { sucesso: false, erro: 'TELEGRAM_BOT_TOKEN não configurado.' };
  }

  if (!chatId || chatId.indexOf('COLE_AQUI') >= 0) {
    return { sucesso: false, erro: 'TELEGRAM_CHAT_ID não configurado.' };
  }

  var texto =
    '🏠 Novo lead Palmer Imóveis\n\n' +
    'Nome: ' + String(dados.nome || '-') + '\n' +
    'WhatsApp: ' + String(dados.whatsapp || '-') + '\n' +
    'Intenção: ' + String(dados.intencao || '-') + '\n' +
    'Interesse: ' + String(dados.interesse_compra || dados.interesse || '-') + '\n' +
    'Valor: ' + String(dados.valor_desejado || dados.valor || '-') + '\n' +
    'Pagamento: ' + String(dados.forma_pagamento || '-') + '\n' +
    'Detalhes: ' + String(dados.detalhes_pagamento || dados.opiniao || '-') + '\n\n' +
    'Origem: ' + String(dados.origem || 'github-pages') + '\n' +
    'Campanha: ' + String(dados.campanha || 'sem campanha') + '\n' +
    'Data: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');

  var endpoint = 'https://api.telegram.org/bot' + token + '/sendMessage';

  var resposta = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    muteHttpExceptions: true,
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: texto
    })
  });

  var code = resposta.getResponseCode();
  var body = resposta.getContentText();

  if (code >= 200 && code < 300) {
    return { sucesso: true, status: code, resposta: body };
  }

  return { sucesso: false, status: code, erro: body };
}

function getConfigPalmer_(chave) {
  var props = PropertiesService.getScriptProperties();
  var valor = props.getProperty(chave);

  if (valor) {
    return valor;
  }

  try {
    if (typeof getConfig_ === 'function') {
      valor = getConfig_(chave);
      if (valor) return valor;
    }
  } catch (e) {}

  return '';
}

function respostaJsonPalmer_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function testarApisPalmer() {
  var dadosTeste = {
    nome: 'Teste Palmer',
    whatsapp: '(91) 99999-9999',
    intencao: 'Comprar',
    interesse_compra: 'Terreno ou lote',
    valor_desejado: 'R$ 36.000,00',
    forma_pagamento: 'À vista',
    detalhes_pagamento: 'Teste automático',
    origem: 'teste',
    campanha: 'teste_api'
  };

  Logger.log(enviarSupabasePalmer_(dadosTeste));
  Logger.log(enviarTelegramPalmer_(dadosTeste));
}
