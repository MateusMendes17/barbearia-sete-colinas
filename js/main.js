/* ============================================================================
   BARBEARIA SETE COLINAS — js/main.js
   ----------------------------------------------------------------------------
   JavaScript vanilla, sem bibliotecas. Todos os blocos são independentes e
   degradam graciosamente se algum elemento não existir na página.

   Índice:
     00. Configuração (horário, serviços, contactos)  ← edita aqui
     01. Utilitários
     02. Navbar: fundo ao rolar + menu hambúrguer
     03. Link ativo na navegação
     04. Animações de entrada (reveal) + contadores
     05. Estado "Aberto / Fechado" + realce do dia atual
     06. Botão "voltar ao topo"
     07. Serviços: sincronizar cartões, <select> e botões "Marcar"
     08. Lightbox da galeria
     09. Carrossel de testemunhos
     10. Formulário de marcações (validação + confirmação simulada)
   ========================================================================== */

(function () {
  'use strict';

  /* ==========================================================================
     00. CONFIGURAÇÃO  →  mudanças aqui refletem-se em todo o site
     ========================================================================== */

  /** Horário de funcionamento por dia da semana (0 = domingo).
      `null` significa encerrado nesse dia. */
  var HORARIO = {
    0: null,                                    // domingo
    1: { abre: '10:00', fecha: '19:00' },       // segunda
    2: { abre: '09:00', fecha: '20:00' },       // terça
    3: { abre: '09:00', fecha: '20:00' },       // quarta
    4: { abre: '09:00', fecha: '20:00' },       // quinta
    5: { abre: '09:00', fecha: '20:00' },       // sexta
    6: { abre: '09:00', fecha: '20:00' }        // sábado
  };

  /** Lista de serviços — é a FONTE DE VERDADE dos preços.
      Depois de alterares aqui, os cartões em index.html são atualizados
      automaticamente (e o <select> do formulário é recriado). */
  var SERVICOS = [
    { nome: 'Corte clássico',                  preco: 15, duracao: 30 },
    { nome: 'Corte + Barba',                   preco: 25, duracao: 50 },
    { nome: 'Barba com toalha quente',         preco: 12, duracao: 30 },
    { nome: 'Degradê / Fade',                  preco: 18, duracao: 40 },
    { nome: 'Corte de criança (até 12 anos)',  preco: 10, duracao: 25 },
    { nome: 'Tratamento facial',               preco: 20, duracao: 30 },
    { nome: 'Pack Noivo',                      preco: 55, duracao: 90 }
  ];

  var WHATSAPP = '351912345678';            // número em formato internacional
  var PASSO_HORAS = 30;                     // intervalo entre horas (minutos)
  var DIAS_ANTICIPACAO = 60;                // dias máximos para marcar

  /** FORMULÁRIO REAL (opcional, Formspree) — passos:
        1. cria conta gratuita em https://formspree.io  (50 mensagens/mês)
        2. cria um formulário novo — ele mostra um ID tipo "f/abC123XyZ"
        3. copia só a parte depois de "f/" e coloca-a entre aspas em baixo.
      Com o ID preenchido, os pedidos de marcação chegam por e-mail à loja.
      Com o ID vazio, o site funciona em modo demonstração (confirmação
      simulada, sem envio). */
  var FORMSPREE_ID = '';

  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
              'quinta-feira', 'sexta-feira', 'sábado'];

  /* ==========================================================================
     01. UTILITÁRIOS
     ========================================================================== */
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /** true quando o utilizador pediu menos animações no sistema operativo */
  var mqMovimento = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  function semMovimento() { return mqMovimento ? mqMovimento.matches : false; }

  function comportamentoScroll() { return semMovimento() ? 'auto' : 'smooth'; }

  /** "09:00" → "9h00" */
  function formatarHora(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) + 'h' + (p[1] === '00' ? '00' : p[1]);
  }

  /** "09:00" → 540 (minutos desde a meia-noite) */
  function minutosDe(hhmm) {
    var p = hhmm.split(':');
    return (parseInt(p[0], 10) * 60) + parseInt(p[1], 10);
  }

  /** Data local em formato AAAA-MM-DD (para os atributos min/max) */
  function paraISO(d) {
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }

  /* ==========================================================================
     02. NAVBAR — fundo ao rolar + menu hambúrguer
     ========================================================================== */
  (function navbar() {
    var barra = $('#navbar');
    var btnTopo = $('#btnTopo');
    if (!barra) return;

    var emEspera = false;
    function aoRolar() {
      var y = window.scrollY || window.pageYOffset || 0;
      barra.classList.toggle('is-scrolled', y > 40);
      if (btnTopo) btnTopo.classList.toggle('is-visivel', y > 600);
      emEspera = false;
    }
    window.addEventListener('scroll', function () {
      if (!emEspera) { emEspera = true; window.requestAnimationFrame(aoRolar); }
    }, { passive: true });
    aoRolar();

    /* --- Menu móvel --- */
    var botao = $('#navToggle');
    var painel = $('#nav');
    if (!botao || !painel) return;

    function abrirMenu(abrir) {
      painel.classList.toggle('is-open', abrir);
      document.body.classList.toggle('menu-open', abrir);
      botao.setAttribute('aria-expanded', String(abrir));
      botao.setAttribute('aria-label', abrir ? 'Fechar menu de navegação'
                                             : 'Abrir menu de navegação');
      if (abrir) {
        var primeiro = $('.nav__link', painel);
        if (primeiro) primeiro.focus();
      }
    }
    function menuAberto() { return painel.classList.contains('is-open'); }

    botao.addEventListener('click', function () { abrirMenu(!menuAberto()); });

    // Fecha ao escolher qualquer ligação do painel
    painel.addEventListener('click', function (e) {
      if (e.target.closest('a')) abrirMenu(false);
    });

    // Fecha ao clicar fora
    document.addEventListener('click', function (e) {
      if (!menuAberto()) return;
      if (painel.contains(e.target) || botao.contains(e.target)) return;
      abrirMenu(false);
    });

    // Fecha com ESC e devolve o foco ao botão
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuAberto()) {
        abrirMenu(false);
        botao.focus();
      }
    });

    // Ao passar para desktop, repõe o estado normal
    var mqDesktop = window.matchMedia
      ? window.matchMedia('(min-width: 1100px)')
      : { matches: false, addEventListener: function () {} };
    var aoMudarEcrã = function () { if (mqDesktop.matches) abrirMenu(false); };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', aoMudarEcrã);
    else if (mqDesktop.addListener) mqDesktop.addListener(aoMudarEcrã);
  })();

  /* ==========================================================================
     03. LINK ATIVO CONFORME A SECÇÃO VISÍVEL
     ========================================================================== */
  (function linkAtivo() {
    var seccoes = $$('main section[id]');
    var links = $$('.nav__link');
    if (!seccoes.length || !links.length) return;

    function marcar(id) {
      links.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
      });
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) marcar(en.target.id);
        });
      }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
      seccoes.forEach(function (s) { obs.observe(s); });
    } else {
      marcar('inicio');
    }
  })();

  /* ==========================================================================
     04. ANIMAÇÕES DE ENTRADA + CONTADORES
     ========================================================================== */
  (function revelar() {
    var itens = $$('.reveal');
    if (!itens.length) return;

    if (semMovimento() || !('IntersectionObserver' in window)) {
      itens.forEach(function (el) { el.classList.add('is-visivel'); });
      return;
    }
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visivel');
        o.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    itens.forEach(function (el) { obs.observe(el); });
  })();

  (function contadores() {
    var contadores = $$('.counter');
    if (!contadores.length) return;

    function formatar(el, valor) {
      var prefixo = el.getAttribute('data-prefix') || '';
      if (el.getAttribute('data-group') === '1' && window.Intl) {
        return prefixo + new Intl.NumberFormat('pt-PT').format(valor);
      }
      return prefixo + valor;
    }

    function animar(el) {
      var alvo = parseInt(el.getAttribute('data-to'), 10);
      if (isNaN(alvo)) return;
      if (semMovimento()) { el.textContent = formatar(el, alvo); return; }

      var inicio = null;
      var duracao = 1500;
      function passo(momento) {
        if (inicio === null) inicio = momento;
        var p = Math.min((momento - inicio) / duracao, 1);
        var suave = 1 - Math.pow(1 - p, 3);           // ease-out cúbico
        el.textContent = formatar(el, Math.round(alvo * suave));
        if (p < 1) window.requestAnimationFrame(passo);
      }
      window.requestAnimationFrame(passo);
    }

    if (!('IntersectionObserver' in window)) {
      contadores.forEach(animar);
      return;
    }
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        animar(en.target);
        o.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    contadores.forEach(function (c) { obs.observe(c); });
  })();

  /* ==========================================================================
     05. "ABERTO AGORA / FECHADO" + realce do dia de hoje
     ========================================================================== */
  (function estadoLoja() {
    var alvos = [$('#statusHero'), $('#statusContactos')].filter(Boolean);
    if (!alvos.length) return;

    function planoDoDia(dia) { return HORARIO[dia] || null; }

    function calcular(agora) {
      var dia = agora.getDay();
      var plano = planoDoDia(dia);
      var min = agora.getHours() * 60 + agora.getMinutes();

      if (plano && min >= minutosDe(plano.abre) && min < minutosDe(plano.fecha)) {
        return { aberto: true,
                 texto: 'Aberto agora · fecha às ' + formatarHora(plano.fecha) };
      }
      if (plano && min < minutosDe(plano.abre)) {
        return { aberto: false,
                 texto: 'Fechado · abre hoje às ' + formatarHora(plano.abre) };
      }
      for (var i = 1; i <= 7; i++) {
        var d = (dia + i) % 7;
        var p = planoDoDia(d);
        if (!p) continue;
        var quando = (i === 1) ? 'amanhã' : DIAS[d];
        return { aberto: false,
                 texto: 'Fechado · abre ' + quando + ' às ' + formatarHora(p.abre) };
      }
      return { aberto: false, texto: 'Fechado' };
    }

    function atualizar() {
      var agora = new Date();
      var estado = calcular(agora);
      alvos.forEach(function (el) {
        el.classList.toggle('is-aberto', estado.aberto);
        var txt = $('.status__text', el);
        if (txt) txt.textContent = estado.texto;
        el.setAttribute('aria-label', estado.texto);
      });

      // Realça a linha do dia atual na tabela de horário
      var linha = $('#tabelaHorario tr[data-dia="' + agora.getDay() + '"]');
      $$('#tabelaHorario tr').forEach(function (tr) {
        tr.classList.remove('is-hoje');
        var tag = $('.hoje-tag', tr);
        if (tag) tag.remove();
      });
      if (linha) {
        linha.classList.add('is-hoje');
        var th = $('th', linha);
        if (th) {
          var s = document.createElement('span');
          s.className = 'hoje-tag';
          s.textContent = 'hoje';
          th.appendChild(s);
        }
      }
    }

    atualizar();
    window.setInterval(atualizar, 60000);   // repõe de minuto a minuto
  })();

  /* ==========================================================================
     06. BOTÃO "VOLTAR AO TOPO"
     ========================================================================== */
  (function voltarAoTopo() {
    var btn = $('#btnTopo');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: comportamentoScroll() });
      var logo = $('.navbar .logo');
      if (logo) logo.focus({ preventScroll: true });
    });
  })();

  /* ==========================================================================
     06b. ANO NO RODAPÉ — mantém-se sempre atualizado
     ========================================================================== */
  (function anoRodape() {
    var alvo = $('#anoAtual');
    if (alvo) alvo.textContent = new Date().getFullYear();
  })();

  /* ==========================================================================
     07. SERVIÇOS — cartões, <select> e botões "Marcar"
     ========================================================================== */
  (function servicos() {
    var sel = $('#fServico');

    // O array SERVICOS é a fonte de verdade: atualiza os cartões do HTML
    $$('.servico').forEach(function (cartao) {
      var nome = cartao.getAttribute('data-servico');
      var s = null;
      for (var i = 0; i < SERVICOS.length; i++) {
        if (SERVICOS[i].nome === nome) { s = SERVICOS[i]; break; }
      }
      if (!s) {
        if (window.console) {
          console.warn('[Sete Colinas] Cartão sem correspondência em SERVICOS:', nome);
        }
        return;
      }
      var preco = $('.servico__preco', cartao);
      var dur = $('.servico__duracao', cartao);
      if (preco) preco.textContent = s.preco + ' €';
      if (dur) dur.textContent = s.duracao + ' min';
    });

    // Reconstrói as opções do <select> a partir do array
    if (sel) {
      var escolhido = sel.value;
      var doc = document.createDocumentFragment();

      var vazio = document.createElement('option');
      vazio.value = '';
      vazio.textContent = 'Escolhe um serviço…';
      doc.appendChild(vazio);

      SERVICOS.forEach(function (s) {
        var o = document.createElement('option');
        o.value = s.nome;
        o.textContent = s.nome + ' — ' + s.preco + ' € · ' + s.duracao + ' min';
        doc.appendChild(o);
      });

      sel.innerHTML = '';
      sel.appendChild(doc);
      if (escolhido) sel.value = escolhido;
    }

    // Botões "Marcar" dos cartões → pré-selecionam o serviço
    $$('.js-marcar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nome = btn.getAttribute('data-servico');
        if (sel) {
          sel.value = nome;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        var sec = $('#marcacoes');
        if (sec) sec.scrollIntoView({ behavior: comportamentoScroll(), block: 'start' });
        window.setTimeout(function () {
          var campo = $('#fNome');
          if (campo) campo.focus({ preventScroll: true });
        }, semMovimento() ? 0 : 650);
      });
    });
  })();

  /* ==========================================================================
     08. LIGHTBOX DA GALERIA
     ========================================================================== */
  (function lightbox() {
    var itens = $$('.galeria__item');
    var caixa = $('#lightbox');
    if (!itens.length || !caixa) return;

    var img = $('#lbImg');
    var cap = $('#lbCap');
    var cont = $('#lbCont');
    var btnFechar = $('#lbFechar');
    var btnAnt = $('#lbPrev');
    var btnSeg = $('#lbNext');

    var atual = 0;
    var focoAnterior = null;

    function mostrar(i) {
      atual = (i + itens.length) % itens.length;
      var original = $('img', itens[atual]);
      if (!original) return;
      // Usa a versão já carregada (currentSrc) para abrir instantaneamente
      img.src = original.currentSrc || original.src;
      img.alt = original.alt;
      cap.textContent = itens[atual].getAttribute('data-caption') || original.alt;
      cont.textContent = (atual + 1) + ' / ' + itens.length;
    }

    function abrir(i) {
      focoAnterior = document.activeElement;
      mostrar(i);
      caixa.hidden = false;
      document.body.style.overflow = 'hidden';
      btnFechar.focus();
    }

    function fechar() {
      caixa.hidden = true;
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
    }

    itens.forEach(function (item, i) {
      item.addEventListener('click', function () { abrir(i); });
    });

    btnFechar.addEventListener('click', fechar);
    btnAnt.addEventListener('click', function () { mostrar(atual - 1); });
    btnSeg.addEventListener('click', function () { mostrar(atual + 1); });
    $('.lightbox__veu', caixa).addEventListener('click', fechar);

    document.addEventListener('keydown', function (e) {
      if (caixa.hidden) return;

      if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); mostrar(atual - 1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(atual + 1); return; }

      // Mantém o foco dentro da caixa de luz (foco preso)
      if (e.key === 'Tab') {
        var focaveis = [btnFechar, btnAnt, btnSeg];
        var pos = focaveis.indexOf(document.activeElement);
        e.preventDefault();
        var proximo = e.shiftKey
          ? (pos <= 0 ? focaveis.length - 1 : pos - 1)
          : (pos === focaveis.length - 1 ? 0 : pos + 1);
        focaveis[proximo].focus();
      }
    });

    // Toque lateral navega; arrastar para fora fecha (comum em telemóvel)
    caixa.addEventListener('touchstart', function (e) {
      caixa.dataset.x = e.changedTouches[0].clientX;
    }, { passive: true });
    caixa.addEventListener('touchend', function (e) {
      var inicial = parseFloat(caixa.dataset.x || 0);
      var delta = e.changedTouches[0].clientX - inicial;
      if (Math.abs(delta) < 50) return;
      mostrar(delta > 0 ? atual - 1 : atual + 1);
    }, { passive: true });
  })();

  /* ==========================================================================
     09. CARROSSEL DE TESTEMUNHOS
     ========================================================================== */
  (function carrossel() {
    var caixa = $('#testemunhosCarousel');
    var track = $('#testemunhosTrack');
    if (!caixa || !track) return;

    var slides = $$('.testemunho', track);
    var zonaDots = $('#tDots');
    var btnAnt = $('#tPrev');
    var btnSeg = $('#tNext');
    if (slides.length < 2) return;

    var indice = 0;
    var relogio = null;
    var ESPERAR = 6000;

    // Indicadores
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel__dot';
      b.setAttribute('aria-label', 'Ver testemunho ' + (i + 1));
      b.addEventListener('click', function () { irPara(i); arrancar(); });
      if (zonaDots) zonaDots.appendChild(b);
      return b;
    });

    function irPara(i) {
      indice = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (indice * 100) + '%)';
      dots.forEach(function (d, j) {
        if (j === indice) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function parar() {
      if (relogio) { window.clearInterval(relogio); relogio = null; }
    }
    function arrancar() {
      parar();
      if (semMovimento()) return;                    // sem autoplay com menos movimento
      relogio = window.setInterval(function () { irPara(indice + 1); }, ESPERAR);
    }

    btnAnt.addEventListener('click', function () { irPara(indice - 1); arrancar(); });
    btnSeg.addEventListener('click', function () { irPara(indice + 1); arrancar(); });

    // Pausa ao passar o rato ou ao focar qualquer controlo
    ['mouseenter', 'focusin'].forEach(function (ev) {
      caixa.addEventListener(ev, parar);
    });
    ['mouseleave', 'focusout'].forEach(function (ev) {
      caixa.addEventListener(ev, function () {
        // Não retoma se o foco ainda estiver dentro do carrossel
        if (ev === 'focusout' && caixa.contains(document.activeElement)) return;
        arrancar();
      });
    });

    // Pausa quando o separador não está visível
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) parar(); else arrancar();
    });

    // Setas no teclado enquanto o carrossel tem foco
    caixa.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); irPara(indice - 1); arrancar(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); irPara(indice + 1); arrancar(); }
    });

    irPara(0);
    arrancar();
  })();

  /* ==========================================================================
     10. FORMULÁRIO DE MARCAÇÕES
        Simulado: não envia nada para servidor (ver comentário no fim).
     ========================================================================== */
  (function marcacoes() {
    var form = $('#formMarcacao');
    if (!form) return;

    var fNome = $('#fNome');
    var fTel = $('#fTel');
    var fEmail = $('#fEmail');
    var fServico = $('#fServico');
    var fBarbeiro = $('#fBarbeiro');
    var fData = $('#fData');
    var fHora = $('#fHora');
    var fNotas = $('#fNotas');
    var erroGeral = $('#formErroGeral');

    var painelConfirmacao = $('#confirmacao');
    var resumo = $('#confirmacaoResumo');
    var linkWhats = $('#confirmacaoWhats');
    var btnNova = $('#novaMarcacao');

    /* --- Limites de data: hoje até 60 dias à frente --- */
    var hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    var ultimo = new Date(hoje.getTime());
    ultimo.setDate(ultimo.getDate() + DIAS_ANTICIPACAO);
    fData.min = paraISO(hoje);
    fData.max = paraISO(ultimo);

    /* --- Horas disponíveis consoante o dia escolhido --- */
    function horasDisponiveis(dataStr) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataStr || '')) return [];
      var p = dataStr.split('-').map(Number);
      var data = new Date(p[0], p[1] - 1, p[2]);

      // Datas passadas não têm horas disponíveis
      var comparar = new Date(data.getTime());
      comparar.setHours(0, 0, 0, 0);
      if (comparar < hoje) return [];

      var plano = HORARIO[data.getDay()];
      if (!plano) return [];                       // domingo

      var agora = new Date();
      var ehHoje = data.getTime() === hoje.getTime();
      var agoraMin = agora.getHours() * 60 + agora.getMinutes();

      var lista = [];
      var ini = minutosDe(plano.abre);
      var fim = minutosDe(plano.fecha);
      for (var m = ini; m + PASSO_HORAS <= fim; m += PASSO_HORAS) {
        // Para hoje, só mostra horas com pelo menos 30 minutos de aviso
        if (ehHoje && m < agoraMin + PASSO_HORAS) continue;
        lista.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' +
                   String(m % 60).padStart(2, '0'));
      }
      return lista;
    }

    function atualizarHoras() {
      var escolhida = fHora.value;
      var horas = horasDisponiveis(fData.value);

      var doc = document.createDocumentFragment();
      var vazio = document.createElement('option');
      vazio.value = '';

      if (!fData.value) {
        vazio.textContent = 'Escolhe primeiro a data…';
      } else if (HORARIO[weekday(fData.value)] === null || HORARIO[weekday(fData.value)] === undefined) {
        vazio.textContent = 'A loja está encerrada aos domingos';
      } else if (!horas.length) {
        vazio.textContent = 'Sem horas disponíveis neste dia';
      } else {
        vazio.textContent = 'Escolhe a hora…';
      }
      doc.appendChild(vazio);

      horas.forEach(function (h) {
        var o = document.createElement('option');
        o.value = h;
        o.textContent = formatarHora(h);
        doc.appendChild(o);
      });

      fHora.innerHTML = '';
      fHora.appendChild(doc);
      if (horas.indexOf(escolhida) !== -1) fHora.value = escolhida;
    }

    function weekday(dataStr) {
      var p = dataStr.split('-').map(Number);
      return new Date(p[0], p[1] - 1, p[2]).getDay();
    }

    // Dica sob o campo de data: quantos horários existem nesse dia
    function atualizarDicaData() {
      var dica = $('#dicaData');
      if (!dica) return;
      if (!fData.value) { dica.textContent = ''; return; }
      var dia = weekday(fData.value);
      var n = horasDisponiveis(fData.value).length;
      if (HORARIO[dia] === null || HORARIO[dia] === undefined) {
        dica.textContent = 'Domingo: encerrado — escolhe outro dia.';
      } else if (!n) {
        dica.textContent = 'Sem horas livres neste dia.';
      } else {
        dica.textContent = n + (n === 1 ? ' horário livre' : ' horários livres') + ' neste dia.';
      }
    }

    fData.addEventListener('change', function () {
      atualizarHoras();
      atualizarDicaData();
      validar('data');
      limparErro(fHora, 'eHora');
    });

    /* --- Máscara de telemóvel: formata enquanto se escreve --- */
    function mascaraTelemovel() {
      var bruto = fTel.value;
      var limpo = bruto.replace(/[^\d+]/g, '');
      var prefixo = '';
      if (/^\+351/.test(limpo)) { prefixo = '+351 '; limpo = limpo.slice(4); }
      else if (/^00351/.test(limpo)) { prefixo = '00351 '; limpo = limpo.slice(5); }
      else if (limpo.charAt(0) === '+') { return; }   // ainda a escrever o prefixo
      var digitos = limpo.replace(/\D/g, '').slice(0, 9);
      var grupos = digitos.match(/\d{1,3}/g) || [];
      var novo = prefixo + grupos.join(' ');
      if (novo !== bruto) fTel.value = novo;
    }
    fTel.addEventListener('input', mascaraTelemovel);

    /* --- Contador de caracteres das notas --- */
    var contadorNotas = $('#contadorNotas');
    if (fNotas && contadorNotas) {
      fNotas.addEventListener('input', function () {
        var n = fNotas.value.length;
        contadorNotas.textContent = n + '/300';
        contadorNotas.classList.toggle('is-perto', n >= 280);
      });
    }

    /* --- Resumo ao vivo + barra de progresso --- */
    var rv = {
      conta: $('#rvConta'),
      barra: $('#rvBarra'),
      fundo: $('#rvBarraFundo'),
      servico: $('#rlServico'),
      data: $('#rlData'),
      hora: $('#rlHora'),
      barbeiro: $('#rlBarbeiro')
    };

    function linhaResumo(el, texto, preenchido) {
      if (!el) return;
      var dd = el.querySelector('dd');
      if (!dd) return;
      var mudou = dd.textContent !== texto;
      if (mudou) dd.textContent = texto;
      el.classList.toggle('is-preenchido', !!preenchido);
      if (mudou) {
        el.classList.remove('is-mudou');
        void el.offsetWidth;                  // reinicia a animação CSS
        el.classList.add('is-mudou');
      }
    }

    function atualizarResumo() {
      if (!rv.conta) return;

      var s = null;
      for (var i = 0; i < SERVICOS.length; i++) {
        if (SERVICOS[i].nome === fServico.value) { s = SERVICOS[i]; break; }
      }
      linhaResumo(rv.servico, s
        ? s.nome + ' · ' + s.preco + ' € · ' + s.duracao + ' min'
        : 'Por escolher', !!s);

      var dataTxt = 'Por escolher';
      if (fData.value) {
        var p = fData.value.split('-').map(Number);
        var d = new Date(p[0], p[1] - 1, p[2]);
        if (!isNaN(d.getTime())) {
          var t = d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
          dataTxt = t.charAt(0).toUpperCase() + t.slice(1);
        }
      }
      linhaResumo(rv.data, dataTxt, !!fData.value);

      linhaResumo(rv.hora, fHora.value ? formatarHora(fHora.value) : 'Por escolher', !!fHora.value);
      linhaResumo(rv.barbeiro, fBarbeiro.value || 'Sem preferência', true);

      // Progresso: 5 campos obrigatórios (nome, telefone, serviço, data, hora)
      var conta = 0;
      if (fNome.value.trim().length >= 2) conta++;
      if (/^[29]\d{8}$/.test(normalizarTelemovel(fTel.value))) conta++;
      if (fServico.value) conta++;
      if (fData.value) conta++;
      if (fHora.value) conta++;

      rv.conta.textContent = conta;
      rv.barra.style.width = (conta / 5 * 100) + '%';
      rv.fundo.setAttribute('aria-valuenow', conta);

      // Tudo preenchido → a mensagem de erro geral deixa de fazer sentido
      if (conta === 5 && erroGeral && erroGeral.textContent) erroGeral.textContent = '';
    }

    // Todos os campos alimentam o resumo (delegação no formulário)
    form.addEventListener('input', atualizarResumo);
    form.addEventListener('change', atualizarResumo);

    /* --- Validação de cada campo --- */
    // A caixa ".campo" ganha estados visuais (✓ / !) além do aria-invalid
    function caixaDo(campo) {
      return campo && campo.closest ? campo.closest('.campo') : null;
    }
    function marcarEstado(campo, estado) {
      var caixa = caixaDo(campo);
      if (!caixa) return;
      caixa.classList.toggle('campo--ok', estado === 'ok');
      caixa.classList.toggle('campo--erro', estado === 'erro');
    }

    function mostrarErro(campo, msgId, texto) {
      var msg = $('#' + msgId);
      campo.setAttribute('aria-invalid', 'true');
      if (msg) msg.textContent = texto;
      marcarEstado(campo, 'erro');
      return false;
    }
    function limparErro(campo, msgId) {
      campo.removeAttribute('aria-invalid');
      if (msgId) {
        var msg = $('#' + msgId);
        if (msg) msg.textContent = '';
      }
      var temValor = campo.value && String(campo.value).trim() !== '';
      marcarEstado(campo, temValor ? 'ok' : null);
    }

    function normalizarTelemovel(v) {
      return (v || '')
        .replace(/[\s\-().]/g, '')
        .replace(/^\+351/, '')
        .replace(/^00351/, '');
    }

    function validar(campo) {
      switch (campo) {
        case 'nome': {
          var nome = fNome.value.trim();
          if (nome.length < 2) {
            return mostrarErro(fNome, 'eNome', 'Indica o teu nome (mínimo 2 caracteres).');
          }
          limparErro(fNome, 'eNome');
          return true;
        }
        case 'tel': {
          var t = normalizarTelemovel(fTel.value);
          if (!t) {
            return mostrarErro(fTel, 'eTel', 'O telemóvel é obrigatório.');
          }
          if (!/^[29]\d{8}$/.test(t)) {
            return mostrarErro(fTel, 'eTel',
              'Telemóvel inválido: são 9 dígitos e começa por 2 ou 9 (ex.: 912 345 678).');
          }
          limparErro(fTel, 'eTel');
          return true;
        }
        case 'email': {
          var e = fEmail.value.trim();
          if (!e) { limparErro(fEmail, 'eEmail'); return true; }   // opcional
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
            return mostrarErro(fEmail, 'eEmail', 'O e-mail não parece válido.');
          }
          limparErro(fEmail, 'eEmail');
          return true;
        }
        case 'servico': {
          if (!fServico.value) {
            return mostrarErro(fServico, 'eServico', 'Escolhe um dos serviços.');
          }
          limparErro(fServico, 'eServico');
          return true;
        }
        case 'data': {
          var v = fData.value;
          if (!v) {
            return mostrarErro(fData, 'eData', 'Escolhe a data da marcação.');
          }
          var p = v.split('-').map(Number);
          var data = new Date(p[0], p[1] - 1, p[2]);
          if (isNaN(data.getTime())) {
            return mostrarErro(fData, 'eData', 'Data inválida.');
          }
          var comparar = new Date(data.getTime());
          comparar.setHours(0, 0, 0, 0);
          if (comparar < hoje) {
            return mostrarErro(fData, 'eData', 'Não é possível marcar numa data passada.');
          }
          if (comparar > ultimo) {
            return mostrarErro(fData, 'eData',
              'Só aceitamos marcações até ' + DIAS_ANTICIPACAO + ' dias à frente.');
          }
          if (data.getDay() === 0) {
            return mostrarErro(fData, 'eData',
              'Estamos encerrados aos domingos. Escolhe outro dia, por favor.');
          }
          limparErro(fData, 'eData');
          return true;
        }
        case 'hora': {
          if (!fData.value) {
            return mostrarErro(fHora, 'eHora', 'Escolhe primeiro a data.');
          }
          if (!fHora.value) {
            return mostrarErro(fHora, 'eHora',
              horasDisponiveis(fData.value).length
                ? 'Escolhe a hora da marcação.'
                : 'Não há horas livres nesse dia — tenta outra data.');
          }
          limparErro(fHora, 'eHora');
          return true;
        }
        default:
          return true;
      }
    }

    // Valida ao sair do campo e limpa o erro ao escrever
    [
      [fNome, 'nome'], [fTel, 'tel'], [fEmail, 'email'],
      [fServico, 'servico'], [fData, 'data'], [fHora, 'hora']
    ].forEach(function (par) {
      par[0].addEventListener('blur', function () { validar(par[1]); });
      // Selects e datas confirmam a escolha de imediato (sem esperar pelo blur)
      par[0].addEventListener('change', function () { validar(par[1]); });
      par[0].addEventListener('input', function () {
        if (par[0].getAttribute('aria-invalid') === 'true') validar(par[1]);
      });
    });

    // O barbeiro tem valor por omissão — mostra sempre o estado "ok"
    function estadoBarbeiro() { marcarEstado(fBarbeiro, fBarbeiro.value ? 'ok' : null); }
    fBarbeiro.addEventListener('change', estadoBarbeiro);
    estadoBarbeiro();

    /* --- Submissão --- */
    var cartaoForm = form.closest('.form-card');
    if (cartaoForm) {
      cartaoForm.addEventListener('animationend', function (e) {
        if (e.target === cartaoForm) cartaoForm.classList.remove('is-erro');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      erroGeral.textContent = '';

      var ordem = ['nome', 'tel', 'email', 'servico', 'data', 'hora'];
      var primeiroErro = null;
      ordem.forEach(function (campo) {
        if (!validar(campo) && !primeiroErro) primeiroErro = campo;
      });

      if (primeiroErro) {
        erroGeral.textContent = 'Faltam dados por corrigir. Verifica os campos assinalados.';
        var el = {
          nome: fNome, tel: fTel, email: fEmail,
          servico: fServico, data: fData, hora: fHora
        }[primeiroErro];
        // O cartão do formulário "sacode" a avisar
        var cartao = form.closest('.form-card');
        if (cartao) {
          cartao.classList.remove('is-erro');
          void cartao.offsetWidth;
          cartao.classList.add('is-erro');
        }
        if (el) el.focus();
        return;
      }

      if (FORMSPREE_ID) enviarFormspree();
      else confirmar();
    });

    /* Envio real via Formspree (JSON) — ver FORMSPREE_ID na configuração */
    function enviarFormspree() {
      var botao = $('button[type="submit"]', form);
      var dados = {
        nome: fNome.value.trim(),
        telemovel: fTel.value.trim(),
        email: fEmail.value.trim() || '(não indicado)',
        servico: fServico.value,
        barbeiro: fBarbeiro.value,
        data: fData.value,
        hora: fHora.value,
        notas: fNotas.value.trim() || '(sem notas)'
      };

      if (botao) { botao.disabled = true; }
      erroGeral.classList.add('is-info');
      erroGeral.textContent = 'A enviar o teu pedido…';

      fetch('https://formspree.io/f/' + FORMSPREE_ID, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
        .then(function (resp) {
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          erroGeral.classList.remove('is-info');
          erroGeral.textContent = '';
          confirmar();
        })
        .catch(function () {
          erroGeral.classList.remove('is-info');
          erroGeral.textContent = 'Não foi possível enviar agora. Tenta outra vez ou marca pelo WhatsApp.';
        })
        .then(function () {
          if (botao) botao.disabled = false;
        });
    }

    function confirmar() {
      var data = (function () {
        var p = fData.value.split('-').map(Number);
        return new Date(p[0], p[1] - 1, p[2]);
      })();
      var dataTxt = data.toLocaleDateString('pt-PT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      var horaTxt = formatarHora(fHora.value);
      var barbeiro = fBarbeiro.value || 'Sem preferência';

      var linhas = [
        ['Nome', fNome.value.trim()],
        ['Serviço', fServico.value],
        ['Barbeiro', barbeiro],
        ['Data', dataTxt.charAt(0).toUpperCase() + dataTxt.slice(1)],
        ['Hora', horaTxt],
        ['Telemóvel', fTel.value.trim()]
      ];
      if (fEmail.value.trim()) linhas.push(['E-mail', fEmail.value.trim()]);
      if (fNotas.value.trim()) linhas.push(['Notas', fNotas.value.trim()]);

      resumo.innerHTML = '';
      linhas.forEach(function (par) {
        var dt = document.createElement('dt');
        dt.textContent = par[0];
        var dd = document.createElement('dd');
        dd.textContent = par[1];
        resumo.appendChild(dt);
        resumo.appendChild(dd);
      });

      // Mensagem de WhatsApp já preenchida com o resumo
      var msg = 'Olá! Gostaria de confirmar a marcação na Barbearia Sete Colinas:%0A' +
        '• Nome: ' + encodeURIComponent(fNome.value.trim()) + '%0A' +
        '• Serviço: ' + encodeURIComponent(fServico.value) + '%0A' +
        '• Data: ' + encodeURIComponent(linhas[3][1]) + ' às ' + encodeURIComponent(horaTxt) + '%0A' +
        '• Barbeiro: ' + encodeURIComponent(barbeiro);
      linkWhats.href = 'https://wa.me/' + WHATSAPP + '?text=' + msg;

      form.hidden = true;
      painelConfirmacao.hidden = false;
      painelConfirmacao.setAttribute('tabindex', '-1');
      painelConfirmacao.focus();
      painelConfirmacao.scrollIntoView({ behavior: comportamentoScroll(), block: 'center' });
    }

    btnNova.addEventListener('click', function () {
      form.reset();
      ['eNome', 'eTel', 'eEmail', 'eServico', 'eData', 'eHora'].forEach(function (id) {
        var m = $('#' + id);
        if (m) m.textContent = '';
      });
      $$('[aria-invalid]', form).forEach(function (el) {
        el.removeAttribute('aria-invalid');
      });
      $$('.campo', form).forEach(function (c) {
        c.classList.remove('campo--ok', 'campo--erro');
      });
      if (contadorNotas) contadorNotas.textContent = '0/300';
      atualizarHoras();
      atualizarDicaData();
      atualizarResumo();
      painelConfirmacao.hidden = true;
      form.hidden = false;
      form.scrollIntoView({ behavior: comportamentoScroll(), block: 'center' });
      fNome.focus({ preventScroll: true });
    });

    // Estado inicial do seletor de horas, da dica e do resumo
    atualizarHoras();
    atualizarDicaData();
    atualizarResumo();

    /* ------------------------------------------------------------------------
       COMO LIGAR ISTO A UM SERVIÇO REAL (escolhe um):

       1) Formspree — JÁ INTEGRADO. Basta preencher `FORMSPREE_ID` na
          configuração no topo deste ficheiro (a parte depois de "f/"
          no ID que o Formspree te dá). Nada mais é preciso alterar.

       2) EmailJS — envia por e-mail sem backend:
            <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js">
          Depois, dentro do handler de submit:
            emailjs.send('SEU_SERVICE', 'SEU_TEMPLATE', dadosDoFormulario)

       3) Calendly — substitui o formulário por um embed de agendamento:
            <div class="calendly-inline-widget"
                 data-url="https://calendly.com/barbeariasetecolinas"></div>

       4) Google Forms / Sheet.best / Airtable — recebem os mesmos campos
          (nome, telemovel, email, servico, barbeiro, data, hora, notas).
       ------------------------------------------------------------------------- */
  })();

})();
