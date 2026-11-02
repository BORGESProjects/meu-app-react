import { API_URL } from './api'

(() => {
  const perguntas = [
    {
      subject: 'Matemática',
      exam: 'EsPCEx · 2024',
      statement: 'Seja a matriz A = [[2, 1], [4, x]]. Sabendo que o determinante da matriz A é igual a 6, o valor real da constante x é:',
      options: ['x = 3', 'x = 5', 'x = 6', 'x = 2', 'x = 4'],
      correct: 1,
      resolution: 'O determinante é (2 × x) − (1 × 4). Igualando a 6: 2x − 4 = 6, então x = 5.'
    },
    {
      subject: 'História do Brasil',
      exam: 'ESA · 2023',
      statement: 'A Revolta de Beckman, ocorrida no Maranhão em 1684, foi motivada principalmente por:',
      options: [
        'A cobrança do quinto nas casas de fundição de Minas Gerais.',
        'O descontentamento com o monopólio da Companhia de Comércio do Maranhão e conflitos sobre a mão de obra indígena.',
        'A invasão holandesa no litoral nordestino.',
        'A independência do Maranhão com apoio francês.',
        'A disputa pelo controle dos centros auríferos.'
      ],
      correct: 1,
      resolution: 'A revolta reuniu a insatisfação dos colonos com os abusos da Companhia de Comércio do Maranhão e o conflito em torno da escravização indígena.'
    }
  ];

  const byId = id => document.getElementById(id);
  let indice = 0;
  let respondida = false;

  function renderizarQuestao() {
    const questao = perguntas[indice];
    const materia = byId('demoSubject');
    const prova = byId('demoExam');
    const enunciado = byId('demoStatement');
    const opcoes = byId('demoOptions');
    const resolucao = byId('demoResolution');
    const textoResolucao = byId('demoResolutionText');
    const faixa = byId('demoStatsBar');
    if (!materia || !prova || !enunciado || !opcoes || !resolucao || !textoResolucao || !faixa) return;

    materia.textContent = questao.subject;
    prova.textContent = questao.exam;
    enunciado.textContent = questao.statement;
    textoResolucao.textContent = questao.resolution;
    resolucao.classList.remove('visible');
    faixa.style.visibility = 'hidden';
    respondida = false;
    opcoes.replaceChildren();
    questao.options.forEach((texto, opcaoIndice) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'demo-option';
      botao.setAttribute('role', 'radio');
      botao.setAttribute('aria-checked', 'false');
      botao.dataset.index = String(opcaoIndice);
      botao.innerHTML = `<span class="demo-option-content"><span class="demo-option-letter">${String.fromCharCode(65 + opcaoIndice)}</span><span></span></span>`;
      botao.querySelector('.demo-option-content > span:last-child').textContent = texto;
      botao.addEventListener('click', () => responder(opcaoIndice));
      opcoes.append(botao);
    });
  }

  function responder(escolhida) {
    if (respondida) return;
    respondida = true;
    const questao = perguntas[indice];
    byId('demoOptions').querySelectorAll('.demo-option').forEach((botao, i) => {
      botao.disabled = true;
      if (i === questao.correct) botao.classList.add('correct');
      else if (i === escolhida) botao.classList.add('wrong');
      botao.setAttribute('aria-checked', String(i === escolhida));
    });
    byId('demoResolution').classList.add('visible');
    byId('demoStatsBar').style.visibility = 'visible';
  }

  byId('btnToggleQuestion')?.addEventListener('click', () => {
    indice = (indice + 1) % perguntas.length;
    renderizarQuestao();
  });
  byId('btnResetDemo')?.addEventListener('click', renderizarQuestao);
  renderizarQuestao();

  const menu = byId('navMenu');
  const alternarMenu = byId('menuToggle');
  alternarMenu?.addEventListener('click', () => {
    const aberto = menu?.classList.toggle('open') ?? false;
    alternarMenu.setAttribute('aria-expanded', String(aberto));
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    alternarMenu?.setAttribute('aria-expanded', 'false');
  }));

  const navbar = byId('navbar');
  const voltarTopo = byId('btnBackTop');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
    voltarTopo?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  voltarTopo?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, atual) => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        atual.unobserve(entry.target);
      }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal-item').forEach(el => el.classList.add('revealed'));
  }

  const preco = byId('precoMensal');
  const statusPreco = byId('precoStatus');
  if (preco && statusPreco) {
    fetch(`${API_URL}/api/acesso/preco`)
      .then(resposta => {
        if (!resposta.ok) throw new Error('Preço indisponível');
        return resposta.json();
      })
      .then(dados => {
        const valor = Number(dados.valorMensal);
        if (!Number.isFinite(valor) || valor <= 0) throw new Error('Preço inválido');
        preco.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
        statusPreco.textContent = 'Assinatura mensal recorrente';
      })
      .catch(() => {
        preco.textContent = 'Confira no checkout';
        statusPreco.textContent = 'Valor indisponível neste momento';
      });
  }
})();
