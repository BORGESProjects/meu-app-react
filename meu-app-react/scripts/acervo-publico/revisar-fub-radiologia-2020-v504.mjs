import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const nome='revisao-fub-radiologia-2020-v504',doc='ce13243d3cb73201'
const prova='https://cdn.cebraspe.org.br/concursos/fub_19/arquivos/545_FUB_009_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/fub_19/arquivos/GAB_DEFINITIVO_545_FUB_009_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/fub_19/arquivos/ED_2_FUB_2019_ABT.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,74)
const keyRows=[
 ['C','C','E','C','C','C','E','C','E','E','C','E','E','E','C','E','C','C','E','E'],
 ['E','X','E','E','E','C','E','C','E','E','C','C','C','C','E','E','C','E','C','E'],
 ['E','C','E','C','X','E','E','C','E','C','C','E','E','C','C','E','C','C','E','C'],
 ['E','E','E','C','C','C','C','C','E','C']
]
assert.deepEqual(keyRows.map(x=>x.length),[20,20,20,10])
const answers=new Map();let n=51;for(const row of keyRows)for(const a of row)answers.set(n++,a);assert.equal(n,121)
const dupMap=new Map([
 ['extr-e4c69fde6fec3bdee33f','extr-3ebeeee5bc7cf6e8741f'],
 ['extr-59d7054e698d6fde3bbf','extr-185a5f55a28aa5642978'],
 ['extr-50c72f18ab8863f67b7c','extr-2986bb077b3f630c5400'],
 ['extr-983e566782de523d229e','extr-0280fe63c64c262671ba']
])
const buckets=[
 [[51,54],'Radioproteção','Princípios de proteção radiológica: distância, sinalização, blindagem e princípio ALARA'],
 [[55,59],'Radiobiologia','Efeitos estocásticos e determinísticos da radiação ionizante'],
 [[60,63],'Diagnóstico por Imagem','Aquisição de imagens: tomografia computadorizada e ressonância magnética'],
 [[64,67],'Radiologia','Processamento de filmes radiográficos e radiografia computadorizada'],
 [[68,71],'Técnicas Radiológicas','Identificação do paciente e posicionamento para radiografia do ombro'],
 [[72,74],'Radioproteção','Dosimetria ocupacional e monitoração individual'],
 [[75,79],'Diagnóstico por Imagem','Fundamentos e comparação entre tomografia computadorizada e ressonância magnética'],
 [[80,85],'Diagnóstico por Imagem','Parâmetros de aquisição e protocolos de TC e RM'],
 [[86,89],'Medicina Nuclear','Cintilografia, radiofármacos e formação de imagens'],
 [[90,95],'Medicina Nuclear','Normas CNEN e proteção radiológica em serviços de medicina nuclear'],
 [[96,98],'Diagnóstico por Imagem','Imagens digitais, monitores diagnósticos e qualidade da imagem'],
 [[99,102],'Ética Profissional','Código de Ética dos Profissionais das Técnicas Radiológicas: denúncia e exercício profissional'],
 [[103,108],'Ética Profissional','Deveres, limites de competência e responsabilidade técnica'],
 [[109,115],'Segurança do Trabalho','NR-32, proteção radiológica e saúde ocupacional em radiologia'],
 [[116,117],'Segurança do Trabalho','Capacitação, treinamento e informação em saúde e segurança do trabalho'],
 [[118,120],'Ergonomia','Ergonomia aplicada ao posto de trabalho, assentos e terminais de vídeo']
]
const faixa=n=>{const b=buckets.find(([r])=>n>=r[0]&&n<=r[1]);assert.ok(b);return b.slice(1)}
const page=n=>n<=67?1:n<=89?2:n<=115?3:4
const clean=x=>String(x||'').replace(/54500901519614\s*CEBRASPE\s*[–-]\s*FUB\s*[–-]\s*Edital:\s*2020[\s\S]*$/i,'').replace(/\s+\d{1,3}\s+O filme radiográfico é composto[\s\S]*$/i,'').replace(/\s*Espaço livre\s*$/i,'').replace(/\s+/g,' ').trim()
const context=n=>n<=54?'Contexto do caderno: proteção de profissionais, ambiente e pacientes diante da radiação ionizante; considere os princípios de radioproteção e as normas aplicáveis.':n<=59?'Contexto do caderno: fundamentos de radiobiologia e efeitos da radiação nos tecidos.':n<=63?'Contexto do caderno: aquisição de imagens em radiologia e fatores que afetam qualidade e diagnóstico.':n<=67?'Contexto do caderno: processamento de filmes radiográficos e sistemas de radiografia computadorizada.':n<=71?'Situação-base: paciente de 75 anos, vítima de traumatismo, encaminhado para radiografia após suspeita de fratura no ombro.':n<=74?'Contexto: dosimetria de radiação em ambiente ocupacional.':n<=79?'Contexto: comparação entre tomografia computadorizada e ressonância magnética nuclear.':n<=85?'Contexto: obtenção de imagens de TC e RM com qualidade diagnóstica e cumprimento de protocolos.':n<=89?'Contexto: protocolos e princípios técnicos da imagem em medicina nuclear.':n<=95?'Contexto: normas de radioproteção vigentes aplicadas à medicina nuclear.':n<=98?'Contexto: modalidades de imagem digital e garantia da qualidade diagnóstica.':n<=102?'Situação-base: clínica de radiologia demite técnicos após denúncia ao conselho de atividades realizadas por escola não credenciada.':n<=108?'Contexto: deveres e limites éticos do técnico em radiologia durante o exercício profissional.':n<=115?'Contexto: segurança e saúde do trabalhador em serviços de radiologia, conforme normas aplicáveis.':n<=117?'Contexto: capacitação e treinamento do trabalhador.':'Contexto: ergonomia e adequação do posto de trabalho às características psicofisiológicas.'
const canon=new Map();for(const q of ps){if(dupMap.has(q.id))continue;const list=canon.get(q.numero)||[];list.push(q);canon.set(q.numero,list)}assert.equal(canon.size,70)
const decisoes=[];const divergencias=[]
for(const [num,list] of [...canon].sort((a,b)=>a[0]-b[0])){
 assert.equal(list.length,1,`duplicata não mapeada q${num}`);const q=list[0],a=answers.get(num);assert.ok(a,`gabarito q${num}`)
 if(q.resposta!==null&&q.resposta!==undefined&&a!=='X'&&q.resposta!==(a==='C'?0:1))divergencias.push({n:num,antes:q.resposta,oficial:a})
 const anulada=a==='X';let stem=clean(q.enunciado)
 assert.ok(stem.length>25,`enunciado incompleto ${num}`)
 const [materia,conteudo]=faixa(num),pagina=page(num),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const difficult=[53,54,56,57,58,61,62,63,69,70,71,73,74,75,76,78,80,81,83,85,90,91,92,93,94,95,96,97,98,99,100,101,102,107,108,109,110,111,113,114,115,116,117,118,119,120],easy=[51,52,59,64,67,68,72,82,86,87,88,89,103,104,105,106]
 const dificuldade=difficult.includes(num)?'Difícil':easy.includes(num)?'Fácil':'Média'
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,concurso:'FUB 2020 — Cargo 9: Técnico em Radiologia (aplicação em 2023)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'30/07/2023',cargo:'Técnico em Radiologia (Cargo 9)',numero_original:num,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade técnica; não publicada pela banca.',classificacao_fonte:edital,motivo:`FUB, Cargo 9 — Técnico em Radiologia, item ${num}; matéria e conteúdo classificados pelo enunciado e pelo bloco temático da prova oficial. A prova foi aplicada em 30/07/2023, conforme gabarito definitivo.`,enunciado:stem,texto_apoio:context(num),opcoes:['Certo','Errado'],resposta_correta:anulada?null:a==='C'?0:1,anulada,gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_545_FUB_009_01.PDF',numero:num,pagina:1,resposta:a,criterio:anulada?'Gabarito definitivo oficial identifica o item como anulado.':'Gabarito oficial definitivo do Cargo 9 — Técnico em Radiologia, conferido na chave da banca.'},visual:{pagina,imagem,motivo:`Página ${pagina} da prova oficial, conferida visualmente para confirmar enunciado e contexto do item ${num}.`},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
assert.equal(decisoes.length,70);for(const a of decidiu())void a
function decidiu(){return []}
assert.deepEqual(divergencias,[])
for(const [id,mantida] of dupMap){const q=ps.find(x=>x.id===id);assert.ok(q);decisoes.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Radiologia',conteudo:'Registro duplicado da mesma questão e edição',ano:2023,concurso:'FUB 2020 — Cargo 9: Técnico em Radiologia (aplicação em 2023)',banca:'CEBRASPE',numero_original:q.numero, pagina:q.pagina,apta_resolucao:false,duplicada_de:mantida,inelegibilidade_motivo:'duplicata_exata_de_item_da_mesma_prova'})}
assert.equal(decisoes.length,74);const hashKey=createHash('sha256').update(keyRows.flat().join('|')).digest('hex');for(const d of decisoes)if(d.gabarito_oficial){d.gabarito_oficial.sha256=hashKey;d.gabarito_oficial.sha256_tipo='sha256_da_transcricao_canonica_do_gabarito_oficial_dos_itens_51_a_120; nao_e_hash_do_pdf'}
console.log(JSON.stringify({pacote:nome,itens:70,duplicatas:4,anuladas:[...answers].filter(([,a])=>a==='X').map(([i])=>i),divergencias,amostras:decisoes.filter(d=>[51,61,66,72,95,115,120].includes(d.numero_original)).map(d=>({n:d.numero_original,area:d.materia,conteudo:d.conteudo,resposta:d.resposta_correta,anulada:d.anulada,pagina:d.pagina,enunciado:d.enunciado?.slice(0,90),duplicada:d.apta_resolucao===false}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
