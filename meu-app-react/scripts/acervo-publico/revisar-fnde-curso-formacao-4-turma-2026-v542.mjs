import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fnde-curso-formacao-4-turma-2026-v542'
const doc='b3e1168cdbae84d2'
const base='tmp/revisao-profissional/revisao-pcse-delegado-2018-conhecimentos-especificos-v541/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/FNDE_23_ESPECIALISTA/arquivos/1E27E622663AF7F0592AC9592888621388C17C896BAC31DB73A0BEF77B72F3FF.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FNDE_23_ESPECIALISTA/arquivos/CE09106EC9DE719C4B5427B650E2C0E86B435EF2BCE28624E35DCA97E3A9F69F.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)

// Gabarito definitivo da 4ª turma, lido no PDF oficial CEBRASPE.
const answers=['E','E','C','C','E','X','C','C','E','E','C','E','E','C','C','C','C','E','E','C','C','C','C','E','E','C','E','E','C','E','C','C','E','C','E','E','E','E','C','C','C','E','C','C','E','C','C','E','C','E','E','C','C','C','E','E','C','E','C','C','C','E','C','E','E','C','C','E','C','E','C','E','E','E','C','E','C','C','C','E','C','E','E','C','E','E','C','C','E','C','E','C','E','C','E','E','E','C','C','C']
assert.equal(answers.length,100)
const key=new Map(answers.map((a,i)=>[i+1,a]))

const groups={
  'Ciência Política':['Estado, governo e sociedade','Formas de governo e organização política','Políticas públicas: tipologias e ciclo de políticas','Políticas sociais e agenda governamental','Globalização e neoliberalismo'],
  'Políticas Educacionais':['Plano Nacional de Educação e regime de colaboração','Indicadores educacionais: IDEB e fluxo escolar','Legislação educacional: Constituição e LDB','BNCC e financiamento da educação básica'],
  'Administração Pública':['Finalidade, missão, valores e estrutura institucional do FNDE','Financiamento e assistência técnica do FNDE','Programas e ações federais de educação'],
  'Programas Educacionais':['PNAE: agricultura familiar e percentual mínimo','PNAE: orçamento e origem dos recursos','PNAE: atribuições das entidades executoras','PNAE: valores per capita por etapa de ensino','PNAE: parcelas, calendário e dias letivos'],
  'Gestão Educacional':['PDDE: assistência financeira e periodicidade','PDDE Básico: natureza e aplicação dos recursos','PDDE Básico: avaliação da aprendizagem e serviços'],
  'Políticas do Livro Didático':['PNLD: ciclo de atendimento e qualidade dos materiais','PNLD: materiais de apoio aos professores','PNLD: materiais impressos e digitais'],
  'Transporte Escolar':['Caminho da Escola: bicicleta e mobilidade estudantil','Caminho da Escola: aquisição de veículos e adesão a pregão'],
  'Planejamento Educacional':['PAR: etapas, diagnóstico e planejamento','SIMEC: operacionalização e acompanhamento do PAR','PAR: dimensões e ciclos de planejamento'],
  'Infraestrutura Educacional':['SIMEC: monitoramento de obras e prestação de informações','Análise de projetos e assistência técnica de engenharia','Proinfância: finalidade e itens financiados','Proinfância: habilitação e demanda por vagas'],
  'Financiamento da Educação':['Vinculação constitucional de receitas para manutenção e desenvolvimento do ensino','Transferências e programas educacionais do FNDE','FUNDEB: fontes, composição e caráter redistributivo','Responsabilização pelo descumprimento do mínimo constitucional','Competências federativas e atuação do FNDE'],
  'Prestação de Contas':['Sistemas de informação e prestação de contas','Modelos de controle: análise ex ante e ex post','Análise manual e análise automatizada de contas','Modalidades de transferência de recursos','Dever constitucional de prestar contas'],
  'Controle Externo':['TCU: julgamento e classificação das contas','Tomada de Contas Especial: finalidade e ressarcimento','TCE: condutas comissivas e omissivas','TCE: medidas administrativas prévias e instauração']
}
const assign={}
for(let n=1;n<=5;n++)assign[n]=['Ciência Política',groups['Ciência Política'][Math.min(n-1,4)]]
assign[6]=['Ciência Política','Políticas públicas: financiamento e atendimento de necessidades sociais']
assign[7]=['Ciência Política',groups['Ciência Política'][3]];assign[8]=['Ciência Política',groups['Ciência Política'][2]]
assign[9]=['Políticas Educacionais',groups['Políticas Educacionais'][0]];assign[10]=['Ciência Política',groups['Ciência Política'][4]];assign[11]=['Ciência Política',groups['Ciência Política'][4]]
for(let n=12;n<=15;n++)assign[n]=['Políticas Educacionais',groups['Políticas Educacionais'][n-12]]
for(let n=16;n<=30;n++)assign[n]=['Administração Pública',n<=23?groups['Administração Pública'][0]:n<=27?groups['Administração Pública'][1]:groups['Administração Pública'][2]]
for(let n=31;n<=37;n++)assign[n]=['Programas Educacionais',groups['Programas Educacionais'][Math.min(n-31,4)]]
for(let n=38;n<=42;n++)assign[n]=['Gestão Educacional',groups['Gestão Educacional'][Math.min(n-38,2)]]
for(let n=43;n<=45;n++)assign[n]=['Políticas do Livro Didático',groups['Políticas do Livro Didático'][n-43]]
assign[46]=['Transporte Escolar',groups['Transporte Escolar'][0]];assign[47]=['Transporte Escolar',groups['Transporte Escolar'][1]]
for(let n=48;n<=51;n++)assign[n]=['Planejamento Educacional',groups['Planejamento Educacional'][Math.min(n-48,2)]]
for(let n=52;n<=55;n++)assign[n]=['Infraestrutura Educacional',groups['Infraestrutura Educacional'][n-52]]
assign[56]=['Financiamento da Educação',groups['Financiamento da Educação'][0]];assign[57]=['Financiamento da Educação',groups['Financiamento da Educação'][1]];assign[58]=['Financiamento da Educação',groups['Financiamento da Educação'][2]];assign[60]=['Financiamento da Educação',groups['Financiamento da Educação'][3]];assign[61]=['Financiamento da Educação',groups['Financiamento da Educação'][4]]
for(let n=81;n<=85;n++)assign[n]=['Prestação de Contas',groups['Prestação de Contas'][n-81]]
for(let n=86;n<=89;n++)assign[n]=['Controle Externo',groups['Controle Externo'][n-86]]

const clean=(s,n)=>{
  let t=String(s||'').replace(/\r/g,'').trim()
  // OCR sometimes appended neighboring items and the next block's command.
  const marker=/(?:\n\s*(?:[1-9]\d{0,2}|MN|M|IN)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ]))|(?:\n\s*(?:A respeito|No que|Em relação|Acerca|Quanto|Sobre|CEBRASPE\s*[–-]))/g
  const hits=[...t.matchAll(marker)].filter(m=>m.index>45)
  if(hits.length)t=t.slice(0,hits[0].index)
  t=t.replace(/\s+/g,' ').replace(/\bdi\s+stributivas\b/gi,'distributivas').replace(/\bcofre\s+s\b/gi,'cofres').replace(/\bEd\s+u cação\b/gi,'Educação').replace(/\b2007\s*-\s*2017\b/g,'2007–2017').replace(/\bmed idas\b/gi,'medidas').replace(/\bgestão\s+educacional\b/gi,'gestão educacional').trim()
  return t
}
const dupeKeep={4:'extr-93792a5e6c4798e49a12',5:'extr-50e8d3c5bb43c3068e98'}
const contextFor=n=>{
  if(n<=4)return 'No que concerne aos conceitos de sociedade, Estado e governo e à finalidade dos programas do FNDE, julgue os itens subsequentes.'
  if(n<=8)return 'A respeito de políticas públicas, julgue os próximos itens.'
  if(n<=11)return 'No que se refere ao Plano Nacional de Educação (PNE) e aos conceitos de globalização e neoliberalismo, julgue os itens a seguir.'
  if(n<=15)return 'No que diz respeito às políticas educacionais, aos seus embasamentos legais e ao panorama da educação brasileira, julgue os itens a seguir.'
  if(n<=30)return 'Acerca do Fundo Nacional de Desenvolvimento da Educação (FNDE), bem como de suas atribuições e ações, julgue os itens a seguir.'
  if(n<=37)return 'Acerca do Programa Nacional de Alimentação Escolar (PNAE), julgue os itens a seguir.'
  if(n<=39)return 'No que diz respeito ao Programa Dinheiro Direto na Escola (PDDE), julgue os seguintes itens.'
  if(n<=42)return 'No que concerne às finalidades dos recursos do PDDE Básico, julgue os próximos itens.'
  if(n<=45)return 'A respeito do Programa Nacional do Livro e do Material Didático (PNLD), julgue os itens subsequentes.'
  if(n<=47)return 'Em relação ao Programa Caminho da Escola, julgue os itens subsequentes.'
  if(n<=51)return 'Acerca do Plano de Ações Articuladas (PAR), julgue os itens a seguir.'
  if(n<=55)return 'No que concerne à ação Infraestrutura Educacional e ao programa Proinfância, julgue os itens a seguir.'
  if(n<=60)return 'Em relação ao financiamento da educação básica pública, julgue os itens subsequentes.'
  if(n<=64)return 'No que diz respeito à organização da educação no Brasil, julgue os seguintes itens.'
  if(n<=68)return 'No que concerne ao FUNDEB, julgue os itens a seguir.'
  if(n<=72)return 'Em relação ao salário-educação, julgue os itens a seguir.'
  if(n<=76)return 'Acerca dos programas suplementares, bolsas e auxílios operacionalizados pelo FNDE, julgue os itens que se seguem.'
  if(n<=80)return 'No que diz respeito ao Fundo de Financiamento Estudantil (FIES), julgue os itens subsecutivos.'
  if(n<=85)return 'Acerca da prestação de contas e dos tipos de transferências realizadas pelo FNDE, julgue os itens subsequentes.'
  return 'A respeito da tomada de contas especial (TCE), julgue os itens a seguir.'
}
const decisions=[]
for(const q of raw){
  const n=Number(q.numero),[materia,conteudo]=assign[n]||[]
  assert.ok(materia&&conteudo,`Sem classificação para item ${n}`)
  const a=key.get(n);assert.ok(a,`Sem chave oficial para item ${n}`)
  const duplicate=Object.hasOwn(dupeKeep,n)&&q.id!==dupeKeep[n]
  let enunciado=clean(q.enunciado,n)
  if(n===4)enunciado='A sociedade pode ser compreendida como um conjunto de indivíduos que se organizam a partir de objetivos, valores e normas comuns, e que se relacionam para produzir seus meios e condições de vida, em um processo dinâmico, em contínua transformação.'
  if(n===5)enunciado='O enfrentamento das desigualdades sociais depende prioritariamente da implementação de políticas distributivas, pois políticas regulatórias, redistributivas e constitutivas possuem funções secundárias e não interferem diretamente na organização das relações sociais e no acesso a direitos.'
  assert.ok(enunciado.length>35,`Texto insuficiente no item ${n} (${q.id})`)
  const annulled=a==='X',page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  decisions.push({
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,banca:'CEBRASPE',organizadora:'CEBRASPE',
    concurso:'FNDE — Especialista em Financiamento e Execução de Programas e Projetos Educacionais — Curso de Formação, 4ª turma',
    cargo:'Especialista em Financiamento e Execução de Programas e Projetos Educacionais — 4ª turma',aplicacao:'12/07/2026',numero_original:n,
    dificuldade:n<=15?'Média':n>=81?'Média':'Média',dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial pela abstração conceitual e especificidade técnico-normativa; a banca não publica dificuldade individual.',
    classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo específico e contexto do caderno oficial da 4ª turma; ano e aplicação conferidos no documento oficial.`,
    tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:annulled?null:a==='C'?0:1,anulada:annulled,
    gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito definitivo — Curso de Formação — 4ª turma',item:n,resposta:annulled?'Anulada':a,aplicacao:'12/07/2026',fonte:'CEBRASPE'},
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada'],
    enunciado,texto_apoio:contextFor(n),pagina:page,visual:{pagina:page,imagem:image,motivo:'Página da prova oficial preservada para conferência do texto e do contexto.'},
    apta_resolucao:!annulled&&!duplicate,correcao_automatica:!annulled&&!duplicate,
    ...(duplicate?{inelegibilidade_motivo:'duplicata_de_extracao_ocr',duplicada_de:dupeKeep[n]}:{})
  })
}
assert.equal(decisions.length,71)
assert.deepEqual(decisions.filter(x=>x.anulada&&!x.inelegibilidade_motivo).map(x=>x.numero_original),[6])
assert.equal(decisions.filter(x=>x.inelegibilidade_motivo==='duplicata_de_extracao_ocr').length,2)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,concurso:'FNDE — Especialista — Curso de Formação, 4ª turma',aplicacao:'12/07/2026',nota:'71 registros foram confrontados com o caderno e o gabarito definitivos oficiais. Itens duplicados por OCR (4 e 5) foram mantidos apenas como registros inelegíveis, vinculados ao registro canônico. Item 6 anulado pela banca.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_analisados:71,duplicatas_inelegiveis:2,anuladas:[6],prova_oficial:prova,gabarito_oficial:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
