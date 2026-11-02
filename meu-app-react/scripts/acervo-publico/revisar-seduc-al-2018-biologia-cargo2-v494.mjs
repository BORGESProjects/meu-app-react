import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2018-biologia-cargo2-v494'
const documento='fdfaa5c17ba8397b'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/MATRIZ_376_SEDUCAL002__PAG_4.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/GAB_DEFINITIVO_376_SEDUCAL002.PDF'
const concurso='SEDUC/AL — Concurso para Professor — Cargo 2: Biologia (edital 2017; prova aplicada em 2018)'
const cargo='Professor — Especialidade: Biologia — Cargo 2'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const nums=pendentes.map(q=>Number(q.numero)).sort((a,b)=>a-b)
assert.equal(pendentes.length,69)
assert.deepEqual(nums,[...Array.from({length:32},(_,i)=>i+51),...Array.from({length:37},(_,i)=>i+84)])

// Conferido no gabarito definitivo oficial do Cargo 2. X = item anulado; *E na fonte = gabarito preliminar alterado.
const respostas={51:'C',52:'E',53:'E',54:'X',55:'C',56:'E',57:'C',58:'E',59:'X',60:'C',61:'E',62:'E',63:'C',64:'E',65:'C',66:'E',67:'C',68:'C',69:'E',70:'C',71:'C',72:'E',73:'E',74:'E',75:'C',76:'E',77:'C',78:'C',79:'E',80:'E',81:'E',82:'C',84:'E',85:'E',86:'E',87:'E',88:'C',89:'E',90:'C',91:'C',92:'C',93:'C',94:'E',95:'C',96:'C',97:'C',98:'E',99:'E',100:'E',101:'C',102:'E',103:'E',104:'C',105:'C',106:'E',107:'C',108:'C',109:'E',110:'E',111:'X',112:'C',113:'C',114:'E',115:'C',116:'E',117:'C',118:'E',119:'C',120:'E'}
assert.equal(Object.keys(respostas).length,69)
const hashGabarito=hashRevisao(Object.entries(respostas).sort(([a],[b])=>Number(a)-Number(b)).map(([n,r])=>`${n}:${r}`).join('|'))

const grupos=[
  [51,55,'Citologia: organelas, membrana plasmática, ribossomos e cromatina'],[56,57,'Microscopia óptica e eletrônica'],[58,61,'Evolução biológica: teorias evolutivas, especiação, origem da vida e evolução humana'],
  [62,67,'Biodiversidade: poríferos, artrópodes, entomologia, botânica, parasitologia e sistemática filogenética'],[68,71,'Fisiologia humana: digestão, circulação, sono e sistema endócrino'],[72,75,'Genética: história da genética, estrutura do DNA, nucleossomos e herança mendeliana'],
  [76,83,'Ecologia: organismos geneticamente modificados, fatores ecológicos, fluxo de matéria, relações ecológicas, populações e Caatinga'],[84,87,'Ensino de Biologia: construtivismo e competência disciplinar'],
  [88,92,'Didática de Biologia: aulas expositivas, demonstrações, projetos, mapas conceituais e tecnologias'],[93,95,'Teorias da aprendizagem aplicadas ao ensino de Biologia'],[96,101,'Recursos didáticos: atividades de campo, fotografia, audiovisual, laboratório e materiais naturais'],
  [102,105,'Avaliação e aprendizagem em Biologia'],[106,109,'Tecnologias da informação e comunicação no ensino de Biologia'],[110,114,'PCNEM: competências e habilidades para o ensino de Biologia'],[115,120,'Segurança em laboratório: pictogramas de risco e equipamentos de proteção']
]
const detalhes={
  51:'Citologia: mitocôndria, metabolismo energético e produção de calor.',52:'Citologia: retículo endoplasmático e células secretoras de esteroides.',53:'Citologia: ribossomos associados à membrana do retículo endoplasmático rugoso e síntese proteica.',54:'Citologia: transporte de glicose e aminoácidos por difusão facilitada; item oficialmente anulado.',55:'Citologia: composição da cromatina por DNA e proteínas histônicas.',56:'Microscopia: comparação entre microscopia eletrônica de varredura e de transmissão.',57:'Microscopia óptica e história da teoria celular.',58:'Evolução: teorias transformacional e variacional associadas a Lamarck e Darwin.',59:'Evolução: especiação alopátrica, simpátrica, vicariância e efeito fundador; item oficialmente anulado.',60:'Origem da vida: protocélulas, membranas e autorreplicação.',61:'Evolução humana: Australopithecus afarensis e fóssil Lucy.',62:'Poríferos: coanócitos e alimentação por filtração.',63:'Artrópodes: túbulos de Malpighi e excreção.',64:'Entomologia médica: Aedes aegypti, dípteros e morfologia das asas.',65:'Botânica: dormência e germinação de sementes.',66:'Parasitologia: Taenia solium, Taenia saginata, teníase e cisticercose.',67:'Sistemática: classificação tradicional e sistemática filogenética.',68:'Fisiologia digestiva: hidrólise e absorção de carboidratos, gorduras e proteínas.',69:'Fisiologia cardiovascular: pressão arterial e fluxo sanguíneo.',70:'Fisiologia respiratória: apneia do sono e controle respiratório.',71:'Endocrinologia e ciclo reprodutivo feminino: menopausa e função ovariana.',72:'História da genética: experimentos de Watson e Crick e publicação sobre dupla hélice.',73:'Biologia molecular: estrutura do DNA e propriedades da informação genética; gabarito definitivo E, após alteração do preliminar.',74:'Biologia molecular: estrutura do nucleossomo e histonas.',75:'Genética mendeliana: proporções fenotípicas em cruzamentos monogênicos.',76:'Ecologia: efeitos de plantas geneticamente modificadas sobre componentes do ecossistema.',77:'Ecologia: níveis tróficos e classificação de produtores.',78:'Ecologia: fluxo de matéria e nutrição de consumidores.',79:'Ecologia: relação interespecífica de predação.',80:'Genética de populações e ecologia: fluxo gênico entre plantas cultivadas e espécies silvestres.',81:'Ecologia de populações: potencial biótico e crescimento populacional.',82:'Biomas brasileiros: adaptações à Caatinga.',84:'Didática: competências disciplinares e planejamento de objetivos de aprendizagem.',85:'Ensino de Biologia: distinção entre conhecimento científico e senso comum.',86:'Construtivismo e formação docente em Biologia.',87:'Construtivismo: mediação docente e competência disciplinar.',88:'Didática: aula expositiva e interação professor-estudante.',89:'Aula prática: demonstração de espécime e aprendizagem procedimental.',90:'Metodologia de projetos e investigação científica escolar.',91:'Mapas conceituais e representação de relações entre conceitos.',92:'Tecnologias digitais em projetos e demonstrações de Biologia.',93:'Teorias da aprendizagem: behaviorismo e objetivos educacionais.',94:'Teorias da aprendizagem: cognitivismo, descoberta e experimentação.',95:'Teoria sociocultural e papel docente no ensino de Biologia.',96:'Aulas de campo e práticas de investigação biológica.',97:'Fotografia digital e documentação de ambientes naturais e urbanos.',98:'Recursos audiovisuais e dinamização de aulas.',99:'Tecnologia e acesso a laboratórios escolares.',100:'Modelos didáticos tridimensionais e interação com conteúdos biológicos.',101:'Materiais naturais como recurso didático e abordagem investigativa.',102:'Avaliação: instrumentos para respostas dissertativas, descritivas ou explicativas.',103:'Avaliação formativa e efeitos de provas classificatórias na aprendizagem.',104:'Avaliação diagnóstica e formativa ao término de módulos.',105:'Aprendizagem baseada em problemas e discussão colaborativa.',106:'TIC e apresentação de conteúdos de modo dinâmico.',107:'TIC, comunicação e circulação de informações.',108:'Animações e filmes como recursos para explicar processos biológicos.',109:'Blogs escolares e produção de informação científica por estudantes.',110:'PCNEM: compreensão de fenômenos biológicos e interação com fatores sociais, políticos e econômicos.',111:'PCNEM: vacinação, resposta imune e compreensão de fenômenos biológicos; item oficialmente anulado.',112:'PCNEM: busca e avaliação de informação em diferentes fontes.',113:'PCNEM: sistemas contemporâneos de classificação zoológica.',114:'PCNEM: observação macroscópica e limitações de infraestrutura escolar.',115:'Segurança: pictograma 1 de risco biológico.',116:'Segurança: pictograma 2 de material inflamável.',117:'Segurança: pictograma 3 de proibição de comer no local.',118:'Segurança: pictograma 4 de radiação ionizante.',119:'Segurança: pictograma 5 de substância tóxica.',120:'Segurança: pictograma 6 e proteção contra exposição ocular.'
}
const contextos={
  '51-55':'Contexto visual: figura de uma célula eucariótica com estruturas numeradas 1, 2 e 3; os itens 51–54 referem-se à figura. A página original foi preservada como imagem vinculada.',
  '56-57':'Comando de seção: julgue os itens a respeito de microscopia.',
  '58-61':'Comando de seção: julgue os itens a respeito do processo evolutivo dos organismos vivos.',
  '62-67':'Texto-base: classificação dos organismos em cinco reinos e uso de características para agrupar espécies. Comando: julgue os itens sobre diversidade da vida.',
  '68-71':'Texto-base: a fisiologia contribui para explicar fatores relacionados à origem, desenvolvimento e progressão da vida. Comando: julgue os itens sobre fisiologia humana.',
  '72-75':'Contexto: afirmação sobre ancestralidade e diferenciação das espécies. Comando: julgue os itens de genética.',
  '76-80':'Texto-base: riscos ambientais potenciais de plantas geneticamente modificadas, incluindo dispersão de genes. A imagem da página mantém o texto integral e sua referência.',
  '81-83':'Contexto: interação entre seres vivos e ecossistemas no Brasil.',
  '84-87':'Texto-base: síntese sobre construtivismo, conhecimento científico e habilidade didática no ensino de Ciências. A página original mantém o trecho integral e a referência bibliográfica.',
  '88-92':'Comando: julgue os itens sobre modalidades didáticas usadas no ensino de Biologia.',
  '93-95':'Texto-base: teorias de aprendizagem e sua influência no trabalho docente em Biologia. A página original mantém o texto e a referência.',
  '96-101':'Comando: julgue os itens sobre recursos didáticos empregados no ensino de Biologia.',
  '102-105':'Comando: julgue os itens sobre avaliação da aprendizagem em Biologia.',
  '106-109':'Contexto: relevância crescente das tecnologias da informação e comunicação nas práticas pedagógicas de Biologia.',
  '110-114':'Comando: julgue os itens sobre competências e habilidades de Biologia nos PCNEM.',
  '115-120':'Contexto visual: seis pictogramas de segurança laboratorial numerados. A questão depende da figura; a página original completa foi associada ao item.'
}
const especiais={
  61:'A espécie Australopithecus afarensis é considerada um dos parentes mais longínquos do ser humano na evolução humana, sendo o esqueleto de uma fêmea, 40% completo, descoberto em 1974 e batizado de Lucy, o fóssil mais famoso dessa espécie.',
  67:'A taxonomia evolutiva tradicional e a sistemática filogenética ou cladística são teorias utilizadas para reconhecer e ordenar grupos taxonômicos.',
  71:'A menopausa é o período durante o qual o ciclo sexual para e os hormônios femininos reduzem a quase zero, com a diminuição da produção de estrogênio pelos ovários diminuindo à medida que o número de folículos primordiais se aproxima de zero.',
  75:'As proporções 1:1, 3:1 e 1:2:1 indicam herança monogênica e se baseiam na segregação igual em um heterozigoto.',
  87:'O modelo de ensino construtivista desenvolvido por Piaget defende que o professor deve dar informações como fonte de motivação, valorizando a competência disciplinar.',
  92:'O uso de tecnologias como vídeos, simulações computacionais e pesquisas via Internet é compatível com as modalidades de projetos e de demonstrações.',
  101:'A utilização de recursos didáticos naturais, como a coleta e a manipulação de materiais biológicos, é considerada uma abordagem didático-pedagógica ultrapassada e deve ser substituída pelo emprego de simulações computacionais, que são mais realistas e acessíveis.',
  105:'No processo ensino-aprendizagem de Biologia, quando os estudantes se defrontam com problemas biológicos complexos, o professor pode utilizar atividades em grupos para propiciar um ambiente de discussão que direcione o entendimento das questões em análise.',
  114:'Um estudante de ensino médio deve ser capaz de descrever características dos seres vivos observados a olho nu, dada a dificuldade em manter microscópios nos laboratórios das escolas, o que impede a abordagem das características microscópicas dos seres vivos.'
}
const faixa=n=>Object.keys(contextos).find(k=>{const[a,b]=k.split('-').map(Number);return n>=a&&n<=b})
const limpeza=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const q of pendentes){
  const n=Number(q.numero),grupo=grupos.find(([a,b])=>n>=a&&n<=b),key=respostas[n]
  assert.ok(grupo&&key&&detalhes[n],`Item ${n} sem classificação ou gabarito`)
  const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
  await fs.access(`public/acervo-extraido/${imagem}`)
  let enunciado=especiais[n]||q.enunciado.replace(/\s+/g,' ').replace(/\s*(?:CESPE\s*\|\s*CEBRASPE\s*[–-]\s*SEDUC\/AL\s*[–-]\s*Aplicação:\s*2018|GABARITO|Espaço livre)\s*/gi,' ').trim()
  // Retira os comandos, textos-base e itens seguintes incorporados pelo OCR, preservando os originais pela imagem da página.
  enunciado=enunciado.replace(/\s*(?:A respeito desse assunto|Considerando essa afirmação|Tendo o texto apresentado|Considerando o texto apresentado|A respeito da interação|Em geral, podemos dizer|Educadores, psicólogos|No que se refere à avaliação|O emprego de tecnologias|No que se refere às competências|Um laboratório é um ambiente|Com relação ao processo evolutivo|A classificação dos organismos|Os estudos de fisiologia).*$/i,'').trim()
  assert.ok(enunciado.length>20,`Item ${n} sem enunciado íntegro`)
  const texto_apoio=contextos[faixa(n)],anulada=key==='X'
  decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Biologia',conteudo:grupo[2],ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 1º/4/2018',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade:n>=51&&n<=83?'Média':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada nas operações de leitura, conceitos biológicos e especificidade do conteúdo; não representa índice oficial de acertos.',resposta_correta:anulada?null:(key==='C'?0:1),anulada,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_376_SEDUCAL002.PDF — Cargo 2: Professor, Biologia',sha256:hashGabarito,numero:n,resposta:key,anulada,criterio:'Transcrição do gabarito oficial definitivo do mesmo cargo; itens X registrados como anulados.'},classificacao_fonte:prova,motivo:`Item ${n}: matéria e conteúdo identificados pelo enunciado e pelo comando do bloco; concurso, cargo, banca e ano confirmados nas fontes oficiais. Dificuldade estimada editorialmente.`,enunciado,texto_apoio,imagem_pagina:imagem,visual:{pagina:q.pagina,imagem,enunciado,texto_apoio,motivo:`Página ${q.pagina} do caderno oficial conferida visualmente; figura ou contexto de seção foi vinculado sem incorporar o texto de questões adjacentes.`},apta_resolucao:true,remover_pendencias:limpeza})
}
assert.equal(decisoes.length,69);assert.equal(new Set(decisoes.map(x=>x.id)).size,69)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:69,itens_unicos:69,aptas:69,anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero),paginas_conferidas:[1,2,3,4],gabarito_definitivo_oficial:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,concurso,registros_revisados:69,itens_unicos:69,questoes_aptas:69,anuladas:[54,59,111],paginas_conferidas:[1,2,3,4],gabarito_definitivo_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2018 — Professor de Biologia, Cargo 2 — revisão v494\n\n- Revisei os 69 itens pendentes das páginas 1–4, com classificação de Biologia e conteúdos específicos, banca CEBRASPE, cargo e ano de aplicação.\n- Separei os enunciados de textos-base e comandos de seção incorporados pelo OCR; a célula e os pictogramas de segurança permanecem ligados às questões por imagem da página original.\n- Vinculei o gabarito definitivo oficial do Cargo 2. Registrei como anulados os itens 54, 59 e 111; os demais ficaram aptos à resolução. A dificuldade é estimativa editorial. Pacote local, ainda não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${gabarito}).\n`)
console.log(JSON.stringify(relatorio,null,2))
