import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-codevasf-jornalismo-v69'
const base='tmp/revisao-profissional/revisao-bcb-economia-v68/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/989_CODEVASF_009_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/GAB_DEFINITIVO_989_CODEVASF_009_01.PDF'
const doc='4efbf59a3089ce53'
const pendentes=JSON.parse(await fs.readFile('tmp/codevasf-jornalismo-pendentes.json','utf8'))
const topicos={
 51:'Reportagem: estilo narrativo de João do Rio',52:'Reportagem: obra e produção de João do Rio',53:'Gênero reportagem: humanização, contexto e reconstrução histórica',54:'História do jornalismo: reportagem “As religiões no Rio”',55:'História do jornalismo: inovação narrativa de João do Rio',
 56:'Notícia: ruptura da normalidade e valor-notícia',57:'Notícia: valores-notícia do inusitado',58:'Notícia: interesse público e banalidade',59:'Notícia: critérios de noticiabilidade',60:'Notícia: relevância e proeminência das fontes',
 61:'Lead: hierarquia das informações',62:'Lead: factualidade e criatividade narrativa',63:'Lead: perguntas essenciais e organização cronológica',64:'Lead: clareza e construção da frase',65:'Reportagem: abertura por personagem ou cena',
 66:'Ética jornalística: sigilo da fonte e responsabilidade',67:'Comunicação: legitimação e circulação da informação',68:'Rotinas produtivas: apuração e liberdade de imprensa',69:'Teorias da comunicação: cultura de massa',70:'Noticiabilidade: seleção e mediação editorial',
 71:'Notícia impressa: valores profissionais e rotinas organizacionais',72:'Jornalismo digital: personalização e estrutura da notícia',73:'Lead: história e influências da técnica',74:'Título jornalístico: síntese e hierarquia',75:'Notícia: pirâmide invertida e organização em blocos',
 76:'Assessoria de imprensa: release segmentado',77:'Assessoria de imprensa: atendimento às fontes',78:'Assessoria de imprensa: preparação e avaliação de entrevistas',79:'Assessoria de imprensa: planejamento e gestão de crise',80:'Assessoria de imprensa: mediação entre organização e redações',81:'Assessoria de imprensa: relacionamento com veículos e exclusividade',
 82:'Entrevista: preparação de gestores e fontes',83:'Entrevista coletiva: critérios de convocação',84:'Entrevista pingue-pongue: aprofundamento e edição',85:'Jornalismo audiovisual: local e condições da entrevista',
 86:'Comunicação organizacional: comunicação interna',87:'Assessoria de imprensa: origem do press release',88:'Pesquisa em jornalismo: amostragem e análise de conteúdo',89:'Análise pragmática da narrativa jornalística',90:'Comunicação organizacional: publicações empresariais',
 91:'Lead e pirâmide invertida: estrutura da notícia',92:'Lead: abertura e síntese informativa',93:'Lead e pirâmide invertida: hierarquia decrescente',94:'Lead: perguntas fundamentais do fato',
 95:'Gêneros jornalísticos: características da notícia',96:'Gêneros jornalísticos: crônica',97:'Gêneros jornalísticos: crônica e marcas de linguagem',98:'Reportagem: profundidade, apuração e fontes',99:'Reportagem: retrancas e textos complementares',100:'Gêneros jornalísticos: editorial',101:'Notícia: pirâmide invertida',102:'Rotina jornalística: pauta e release',
 103:'Editoração: preparação de originais',104:'Editoração: preparação e revisão textual',105:'Projeto gráfico: planejamento e diagramação',106:'Projeto gráfico: tipografia, fotografia e espaço em branco',107:'Projeto gráfico: tipografia e hierarquia visual',108:'Projeto gráfico: entrelinha e legibilidade',109:'Projeto gráfico: harmonia e contraste',110:'Projeto gráfico: ênfase, contraste e navegação',
 111:'Webjornalismo: escaneabilidade e experiência de leitura',112:'Webjornalismo: resolução semântica da notícia',113:'Webjornalismo: atualização e precisão semântica',114:'Webjornalismo: hipertexto e navegação',115:'Webjornalismo: narrativa multimídia',116:'Webjornalismo: circulação em redes sociais',117:'Webjornalismo: atualização em tempo real e precisão',118:'Webjornalismo: convergência de mídias',119:'Webjornalismo: métricas, audiência e independência editorial',120:'Webjornalismo: participação do leitor e narrativa'
}
const assuntos={
 51:'Reportagem e jornalismo literário',56:'Notícia e valores-notícia',61:'Lead e pirâmide invertida',66:'Ética e legislação jornalística',71:'Jornalismo impresso e digital',76:'Assessoria de imprensa',82:'Entrevista jornalística',86:'Comunicação organizacional',91:'Lead e pirâmide invertida',95:'Gêneros jornalísticos',103:'Editoração',105:'Projeto gráfico e diagramação',111:'Webjornalismo'
}
const porNumero=new Map()
for(const q of pendentes){const n=Number(q.numero_original);if(!porNumero.has(n))porNumero.set(n,[]);porNumero.get(n).push(q)}
const invalidos=new Set(['extr-d550beb19330ac7ce7b0','extr-39f6834f8ec4ace8dcc0','extr-6929fcdc38f5eec5e5b3','extr-bfe20283a77c9cdf8d06'])
const dupePairos={
 'extr-d550beb19330ac7ce7b0':'extr-3c51d4e00f6bbd65dfba',
 'extr-39f6834f8ec4ace8dcc0':'extr-654387403d5898fd505d',
 'extr-6929fcdc38f5eec5e5b3':'extr-61820b6aefa35ff590ff',
 'extr-bfe20283a77c9cdf8d06':'extr-7b3f55a8a1e8f4f57237'
}
const pageFor=n=>n<=81?1:n<=104?2:3
const answerCodes=['X','X','X','X','X','C','C','E','E','C','C','C','E','E','C','C','C','E','C','E','C','E','C','C','C','E','X','C','E','C','X','C','X','E','E','C','E','C','X','C','E','C','C','E','C','C','E','C','X','C','C','E','C','E','C','C','E','E','E','C','C','E','C','E','C','C','E','E','E','C']
if(answerCodes.length!==70)throw Error('Gabarito oficial incompleto')
const answers=Object.fromEntries(answerCodes.map((v,i)=>[String(i+51),v]))
const difficulty=(n)=>[52,54,58,61,65,67,69,72,74,77,81,83,88,91,94,97,102,104,108,112,113,117,119].includes(n)?'Difícil':[51,53,56,59,60,66,70,73,75,76,79,80,82,85,87,90,92,95,96,100,103,106,107,110,111,114,116,118,120].includes(n)?'Fácil':'Média'
const decisions=[]
for(const q of pendentes){
 const n=Number(q.numero_original),page=pageFor(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 const invalid=invalidos.has(q.id),answer=answers[String(n)]
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Jornalismo',conteudo:`${assuntos[[...Object.keys(assuntos)].map(Number).filter(x=>x<=n).at(-1)]||'Fundamentos do jornalismo'}: ${topicos[n]}`,ano:2024,pagina:page,dificuldade:difficulty(n),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial considerando densidade conceitual, necessidade de distinguir conceitos próximos e número de etapas de raciocínio; não representa índice publicado pela banca.',classificacao_fonte:prova,motivo:`CODEVASF 2024 — Analista em Comunicação, área Jornalismo, caderno 1, item ${n}. Identificação do cargo confirmada no caderno e no gabarito oficial; matéria e assunto definidos pelo conteúdo do item e pela seção oficial.` ,imagem_pagina:image}
 if(invalid){d.apta_resolucao=false;d.inelegibilidade_motivo='Registro duplicado ou agregado, confirmado pela comparação com o caderno oficial; preservado no histórico de auditoria.';d.duplicada_de=dupePairos[q.id]}
 if(n===55&&!invalid){d.enunciado='João do Rio inovou o jornalismo, ao introduzir um texto ágil, com muitos detalhes e diálogos.';d.texto_apoio='O jornalista João Paulo Alberto Coelho Barreto, que adotou o pseudônimo de João do Rio, é considerado o inventor da reportagem. Em relação a esse jornalista e ao gênero reportagem, julgue os itens a seguir.'}
 if(n===104)d.enunciado='A preparação e a revisão de textos ocorrem na mesma etapa do processo editorial.'
 if(n===115)d.enunciado='A integração de elementos multimídia na notícia online dispensa a criação de uma estrutura narrativa específica que ajude o leitor a entender e a interagir com a notícia, dada a sua liberdade de escolha de como e por qual caminho seguir a leitura.'
 if(n===120)d.enunciado='A criação de espaços de comentário e fóruns de discussão em plataformas de webjornalismo enfraquece a narrativa jornalística ao favorecer diferentes perspectivas dos leitores, prejudicando a qualidade do conteúdo jornalístico.'
 if([51,52,53,54,55].includes(n))d.texto_apoio='O jornalista João Paulo Alberto Coelho Barreto, que adotou o pseudônimo de João do Rio, é considerado o inventor da reportagem. Em relação a esse jornalista e ao gênero reportagem, julgue os itens a seguir.'
 if([56,57,58,59,60].includes(n))d.texto_apoio='O fato de um cão morder uma pessoa não vira notícia, mas, se uma pessoa morder um cão, aí, então, é notícia. A partir dessa afirmação, julgue os itens sobre os fatores que envolvem o conceito de notícia.'
 if([61,62,63,64,65].includes(n))d.texto_apoio='Julgue os itens a respeito do lead como estratégia jornalística para prender a atenção do leitor.'
 if([66,67,68,69,70].includes(n))d.texto_apoio='Acerca do processo de produção do noticiário, julgue os itens subsequentes.'
 if([71,72,73,74,75].includes(n))d.texto_apoio='Acerca das características das notícias publicadas em mídia impressa, julgue os itens a seguir.'
 if([76,77,78,79,80,81].includes(n))d.texto_apoio='Em relação ao trabalho de uma assessoria de imprensa, julgue os itens subsequentes.'
 if([82,83,84,85].includes(n))d.texto_apoio='Julgue os itens a respeito da organização de entrevistas.'
 if([111,112,113,114,115].includes(n))d.texto_apoio='No que se refere à composição semântica e aos princípios da redação e narrativa jornalística na web, julgue os itens a seguir.'
 if([116,117,118,119,120].includes(n))d.texto_apoio='Em relação à produção de notícias e recursos interativos no webjornalismo, julgue os itens seguintes.'
 if(!invalid){
  const val=answer
  d.anulada=val==='X';d.resposta_correta=val==='X'?null:val==='C'?0:1
  d.gabarito_oficial={valor:val,fonte:gabarito,metodo:'Conferência dos itens 51–120 na tabela de gabarito oficial definitivo publicada pelo CEBRASPE; X corresponde a item anulado.'}
 }
 decisions.push(d)
}
if(decisions.length!==73||new Set(decisions.map(x=>x.id)).size!==73)throw Error(`Esperava 73 registros únicos; recebi ${decisions.length}`)
if(Object.keys(topicos).length!==70)throw Error('Mapeamento de tópicos incompleto')
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'CODEVASF 2024 — Analista em Comunicação — Jornalismo',documento_id:doc,registros_revisados:73,questoes_unicas_classificadas:69,registros_invalidos_preservados:4,anuladas:[51,52,53,54,55,77,81,83,89,99],gabarito_conferido_itens:'51–120',paginas_origem_corrigidas:73,fonte_oficial_prova:prova,fonte_oficial_gabarito:gabarito,observacao:'A questão 64 já estava classificada antes deste pacote; quatro registros duplicados/agregados foram desativados e preservados para auditoria.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
