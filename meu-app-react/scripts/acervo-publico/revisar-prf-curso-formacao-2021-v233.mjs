import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-prf-curso-formacao-2021-v233',doc='4e9f22592b647f90'
const prova='https://cdn.cebraspe.org.br/concursos/PRF_21/arquivos/091_PRFCF2_001_01.pdf'
const concurso='PRF 2021 — Curso de Formação Policial, 2.ª prova objetiva (3.ª turma)'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='091_PRFCF2_001_01.pdf'||catalog.questoes.length!==67)throw Error('Inventário incompatível: esperados 67 registros OCR, itens 1–60')
const porNumero=new Map();for(const e of catalog.questoes){const a=porNumero.get(e.numero)||[];a.push(e);porNumero.set(e.numero,a)}
if(porNumero.size!==60||[...porNumero.keys()].some(n=>n<1||n>60))throw Error('Esperados 60 itens únicos numerados de 1 a 60')
const prev=raizesAtuais.findIndex(x=>x.includes('revisao-mpcsc-controle-publico-2022-v232'))
if(prev<0)throw Error('Base anterior v232 ausente')
const bases=raizesAtuais.slice(prev),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
// Restringe a busca aos lotes da banca/ano/concurso documentados; o manifesto
// contém milhares de lotes e uma varredura global seria desnecessariamente lenta.
for(const lote of manifest.lotes.filter(x=>x.arquivo&&x.ano===2021&&/prf/i.test(x.concurso||''))){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Registros ausentes no acervo: ${want.size}`)

const temas={
1:['Direito Penal','Lei de Drogas: posse para consumo, tráfico e circunstâncias da abordagem'],
2:['Legislação Especial','Estatuto do Desarmamento: atiradores desportivos e registro de armas'],
3:['Legislação Especial','Estatuto do Desarmamento: omissão de cautela e guarda de arma de fogo'],
4:['Direito Penal','Crimes contra a fé pública: uso de documento falso em fiscalização'],
5:['Legislação Especial','Estatuto da Pessoa Idosa: termo circunstanciado e competência policial'],
6:['Direito Administrativo','Servidor público federal: gerência e administração de empresa privada'],
7:['Direito Administrativo','Regime disciplinar: remuneração durante suspensão'],
8:['Direito Administrativo','Regime disciplinar: infrações graves e penalidades expulsórias'],
9:['Direito Administrativo','Deveres funcionais: zelo, dedicação e avaliação de desempenho'],
10:['Direitos Humanos','Tráfico de pessoas: evolução e prevenção policial'],
11:['Direitos Humanos','Violência de gênero: atendimento policial e formação profissional'],
12:['Direitos Humanos','Uso da força em manifestações e proteção de direitos fundamentais'],
13:['Direitos Humanos','Direitos LGBTQIAPN+: homofobia e discriminação'],
14:['Direitos Humanos','Cultura da paz: violência, conflito e direitos humanos'],
15:['Direitos Humanos','Mediação de conflitos na segurança pública: justiça restaurativa'],
16:['Direito Ambiental','Documento de Origem Florestal: transporte e armazenamento de produtos nativos'],
17:['Direito Ambiental','Poluição veicular e emissão de gases na fiscalização rodoviária'],
18:['Legislação de Trânsito','Código de Trânsito Brasileiro: integração da proteção ambiental'],
19:['Direito Ambiental','PRF: planejamento e coordenação do combate a crimes ambientais'],
20:['Legislação de Trânsito','Fiscalização de passageiros em ônibus: efetivo operacional'],
21:['Direito Penal','Lei de Organizações Criminosas: finalidade econômica e estrutura'],
22:['Legislação Especial','Lei de Drogas: classificação jurídica de substâncias'],
23:['Legislação Especial','Farmacologia e drogas: anfetaminas e estimulantes do sistema nervoso central'],
24:['Legislação de Trânsito','Identificação veicular: remarcação do número de identificação do veículo'],
25:['Legislação de Trânsito','Identificação veicular: gravação e duplicidade do NIV em motocicletas'],
26:['Legislação de Trânsito','CNH: validade internacional e Convenção de Viena'],
27:['Legislação de Trânsito','Identificação veicular: padrões de gravação e verificação de autenticidade'],
28:['Legislação de Trânsito','Fraudes veiculares: identificação de veículo clonado'],
29:['Legislação de Trânsito','RENAVAM: pré-cadastramento dos dados identificadores do veículo'],
30:['Legislação de Trânsito','Medidas administrativas: retenção e remoção de veículos'],
31:['Legislação de Trânsito','Fiscalização de peso: pesagem e uso subsidiário de documentos'],
32:['Legislação de Trânsito','Produtos perigosos: painel de segurança e números ONU e de risco'],
33:['Legislação de Trânsito','Transporte de produtos perigosos: classificação de risco da carga'],
34:['Legislação de Trânsito','Produtos perigosos: substâncias da classe de risco 4'],
35:['Legislação de Trânsito','Transporte de passageiros: acondicionamento de cargas em ônibus'],
36:['Legislação de Trânsito','Fretamento contínuo: circuito fechado e programação de viagens'],
37:['Legislação de Trânsito','Cronotacógrafo: equipamentos obrigatórios por categoria de veículo'],
38:['Legislação de Trânsito','Dimensões veiculares: altura mínima e limites de circulação'],
39:['Legislação de Trânsito','Cronotacógrafo: identificação de condutor, veículo e registros'],
40:['Legislação de Trânsito','Transporte externo de carga: amarração, acondicionamento e visibilidade'],
41:['Legislação de Trânsito','Películas automotivas: transmitância luminosa e áreas envidraçadas'],
42:['Legislação de Trânsito','Capacete e viseira: requisitos para circulação noturna'],
43:['Legislação de Trânsito','Iluminação e retrorrefletores: infrações e sinalização veicular'],
44:['Legislação de Trânsito','Sinistro rodoviário com carga perigosa: isolamento e descontaminação'],
45:['Legislação de Trânsito','Atendimento a sinistros: fiscalização de alcoolemia e registro de testes'],
46:['Legislação de Trânsito','Perícia em sinistros: identificação de danos e prova fotográfica'],
47:['Legislação de Trânsito','Registro de sinistro: DAT, LPAT e critérios de relevância'],
48:['Legislação de Trânsito','Atendimento a sinistros: documentação e justificativa de fotografias'],
49:['Legislação de Trânsito','Levantamento de local de sinistro: vestígios e dinâmica do acidente'],
50:['Legislação de Trânsito','Fiscalização veicular: segurança, conservação e sistemas obrigatórios'],
51:['Direito Administrativo','Abuso de autoridade: identificação de passageiros durante abordagem policial'],
52:['Administração Pública','PRF: resposta a incidentes e gestão de eventos críticos'],
53:['Administração Pública','Comando situacional: acionamento e supervisão de unidades operacionais'],
54:['Administração Pública','Comunicação operacional via rádio: clareza, concisão e disciplina'],
55:['Legislação de Trânsito','Etilômetro: procedimento de teste evidencial e sequência de abordagem'],
56:['Direitos Humanos','Instrumentos de menor potencial ofensivo: Taser e incapacitação neuromuscular'],
57:['Direitos Humanos','Instrumentos de menor potencial ofensivo: oleorresina de capsicum e efeitos respiratórios'],
58:['Direitos Humanos','Uso da força: necessidade, precaução e ameaça concreta'],
59:['Direitos Humanos','Uso da força: doutrina e modelo operacional da PRF'],
60:['Direitos Humanos','Uso da força: finalidade e limites dos instrumentos menos letais']
}
const facil=new Set([1,2,4,5,6,8,9,10,12,13,14,15,16,18,19,20,21,22,23,24,26,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,47,48,50,52,53,54,55,57,60])
const dificil=new Set([3,7,11,17,25,27,44,45,46,49,51,56,58,59])
const comandos={
1:'Julgue o item a seguir, considerando a jurisprudência do STF relativa ao disposto na Lei Antidrogas (Lei n.º 11.343/2006).',
2:'Com base no Estatuto do Desarmamento, julgue os itens seguintes.',
4:'Acerca do uso de documento falso, julgue o item a seguir.',
5:'Com relação ao termo circunstanciado de ocorrência (TCO), julgue o próximo item.',
6:'Julgue os itens a seguir, referentes a deveres funcionais do servidor público e a infrações disciplinares.',
10:'Com relação à atuação policial diante de casos de violência de gênero, tráfico de pessoas e manifestações de movimentos sociais, julgue os itens a seguir.',
12:'Julgue os próximos itens, referentes à cultura da paz no contexto dos direitos humanos, à mediação de conflitos na segurança pública e à caracterização da homofobia.',
16:'Com relação à atuação da PRF na defesa do meio ambiente, julgue os itens que se seguem.',
20:'A respeito de aspectos relacionados ao tráfico de drogas, armas e munições e do seu enfrentamento, julgue os itens seguintes.',
24:'Julgue os itens subsequentes, relativos a normas e procedimentos adotados para o enfrentamento às fraudes veiculares no Brasil.',
30:'Julgue os itens que se seguem, a respeito da fiscalização de peso e dimensões de veículos.',
32:'Acerca de produtos perigosos e da sinalização dos veículos que os transportam, julgue os itens subsequentes.',
35:'Julgue os itens subsequentes acerca de conceitos de transporte, equipamentos obrigatórios e transporte de cargas em ônibus e micro-ônibus.',
38:'No que concerne à fiscalização de trânsito, julgue os itens seguintes.',
44:'No que se refere à atuação de policiais rodoviários federais em perícias de sinistros de trânsito, julgue os itens subsequentes, conforme procedimentos e normas legais aplicáveis.',
50:'Com relação ao roteiro de fiscalização de pessoas, documentação e veículos, julgue os itens seguintes.',
52:'Julgue os itens que se seguem a respeito de comando, controle e resposta a incidentes.',
54:'Acerca do uso de equipamentos operacionais, julgue os itens subsequentes.',
56:'A respeito de conceitos, instrumentos e procedimentos relacionados ao uso da força e às tecnologias de menor potencial ofensivo, julgue os itens subsequentes.'
}
const blocos=[1,2,4,5,6,10,12,16,20,24,30,32,35,38,44,50,52,54,56]
function contexto(n){return comandos[blocos.filter(x=>x<=n).at(-1)]}
const canon=new Map([[3,'extr-6318b1f9bf569af69bf3'],[7,'extr-f6010207dbb92d321f79'],[13,'extr-ba66a8fc11a01e496702'],[14,'extr-93cae0736ebf2d7c5de6'],[17,'extr-aadd2731e62442bf93a0'],[18,'extr-9a9f4ce2b275fb0c6f51'],[19,'extr-e2026d17e96ee43d3b48']])
const textoLimpo=new Map([[3,'O crime de omissão de cautela consuma-se com a simples negligência do proprietário da arma, ainda que não ocorra o apoderamento por menor de idade ou pessoa com deficiência mental.'],[7,'É devida a remuneração correspondente ao período de afastamento de suas atividades ao servidor público que tenha recebido a penalidade administrativa disciplinar de suspensão de até 90 dias.'],[13,'A manifestação de aversão à população LGBTQIAPN+ é uma característica da homofobia.'],[14,'No contexto dos direitos humanos, paz não se resume à ausência de guerra ou de violência física.'],[18,'O Código de Trânsito Brasileiro prevê a integração da proteção ambiental às ações de fiscalização de trânsito.']])
const decisoes=[]
for(const [n,entries] of porNumero){const [materia,conteudo]=temas[n],canonical=canon.get(n)||entries[0].id
 for(const e of entries){const q=byId.get(e.id),img=`paginas/${doc}-${String(e.pagina).padStart(4,'0')}.webp`,duplicate=e.id!==canonical
  if(!q||!materia||!conteudo)throw Error(`Item ${n} sem classificação`)
  if(q.pagina!==e.pagina)throw Error(`Página divergente no item ${n}`)
  await fs.access(`public/acervo-extraido/${img}`)
  const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,concurso,numero_original:n,pagina:e.pagina,
   dificuldade:facil.has(n)?'Fácil':dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,
   dificuldade_evidencia:'Estimativa editorial segundo a complexidade jurídica ou operacional e o número de regras que o item articula; não representa índice psicométrico oficial.',
   classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura do item e do comando temático na página oficial; classificação por matéria e conteúdo específico.'},
   visual:{pagina:e.pagina,imagem:img,motivo:`Página ${e.pagina} do caderno oficial conferida; texto, contextos e elementos gráficos da prova estão representados na imagem de origem.`},
   remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
   motivo:duplicate?`Duplicata OCR do item ${n}; versão canônica preserva o texto legível.`:`Classificação individual: ${conteudo}. Chave preexistente preservada.`}
  if(!duplicate){d.apta_resolucao=true;d.texto_apoio=contexto(n);if(textoLimpo.has(n))d.enunciado=textoLimpo.get(n)}
  else{d.apta_resolucao=false;d.inelegibilidade_motivo=`Cópia OCR do item ${n}; questão canônica ${canonical} mantida.`;d.duplicada_de=canonical}
  decisoes.push(d)
 }
}
if(decisoes.length!==67)throw Error(`Esperados 67 registros OCR, obtidos ${decisoes.length}`)
const out=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[prev],decisoes})
console.log(JSON.stringify({...out,documento:catalog.arquivo,registros_revisados:67,itens_unicos:60,duplicatas_inelegiveis:7,contextos_paginas:[1,2,3],publicado:false},null,2))
