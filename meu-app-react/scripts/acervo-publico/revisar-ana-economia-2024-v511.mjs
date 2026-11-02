import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-ana-especialista-economia-2024-v511',doc='7a7f8a27ac9df676'
const prova='https://cdn.cebraspe.org.br/concursos/ana_24/arquivos/957_ANA_001_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/ana_24/arquivos/GAB_DEFINITIVO_957_ANA_001_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)

const rows=[
 ['C','E','E','C','E','E','E','E','E','C','C','C','E','C','E','C','C','E','E','E'],
 ['C','E','C','E','C','E','C','C','C','E','E','C','E','C','E','E','C','C','C','E'],
 ['C','E','E','E','X','E','C','C','E','E','E','C','E','E','E','C','C','C','E','C'],
 ['C','C','E','C','C','C','E','E','E','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)

const byNumber=new Map();for(const q of ps){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const canonical=new Map([...byNumber].map(([n,a])=>[n,a[0]]))
assert.equal(canonical.size,69)
assert.deepEqual([...byNumber].filter(([,a])=>a.length>1).map(([n,a])=>[n,a.length]),[[53,2],[54,2],[56,2],[57,2]])
assert.ok(!canonical.has(109),'q. 109 já estava resolvida e não deve ser recriada')
const duplicates=new Map([...byNumber.values()].filter(a=>a.length>1).flatMap(a=>a.slice(1).map(q=>[q.id,a[0].id])))

const groups=[
 [[51,53],'Microeconomia','Teoria da firma e fronteira de possibilidades de produção','Teoria da firma; gráfico da fronteira de produção, insumos, produção e padrões tecnológicos.'],
 [[54,57],'Microeconomia','Demanda: deslocamentos da curva e expectativas de preços','Curva de demanda do bem x deslocada de D1 para D2; o gráfico original da página é parte do contexto.'],
 [[58,61],'Microeconomia','Oferta e demanda de alimentos: deslocamentos e equilíbrio de mercado','Contexto: evolução da produção e da demanda de alimentos no Brasil entre 1970 e 2022; gráfico com D1/D2, S1/S2/S3 e pontos de equilíbrio.'],
 [[62,63],'Microeconomia','Produção, custos e maximização de lucros','Isolucro, função de produção, isocusto e multiplicador de Lagrange.'],
 [[64,65],'Teoria dos Jogos','Dilema do prisioneiro e estratégias dominantes','Matriz de payoffs de duas firmas que escolhem cooperar ou não cooperar.'],
 [[66,70],'Matemática Financeira','Juros, inflação, SAC e sistema Price','Taxa real e nominal, equivalência financeira, juros compostos, amortização e sistema de prestação constante.'],
 [[71,75],'Análise de Investimentos','Payback descontado, ROE, VPL, TIR e ROIC','Indicadores de retorno e critérios de decisão de investimentos.'],
 [[76,77],'Economia Ambiental','Externalidades negativas e taxa de emissão','Contexto: fábrica lança efluente em rio de acesso público; moradores usam a água e a empresa avalia instalar filtros.'],
 [[78,79],'Economia dos Recursos Naturais','Recursos de uso comum e tragédia dos comuns','Contexto: lago de água potável de acesso livre usado por famílias e por fazendeiro, com redução da área por sobreuso.'],
 [[80,83],'Economia Ambiental','Valoração econômica: valoração contingente, preços hedônicos e produtividade','Métodos de valoração de recursos ambientais e valores de uso e não uso.'],
 [[84,85],'Economia dos Recursos Hídricos','Cobrança pelo uso da água e tarifas de saneamento','Alocação da demanda hídrica e critérios econômicos de tarifa de água e esgoto.'],
 [[86,87],'Economia da Regulação','Teoria agente-principal, auditoria e supervisão','Relação entre regulador, governo e concessionária; assimetria de informação e qualidade do serviço.'],
 [[88,90],'Economia da Regulação','Tarifação de serviços públicos: preço-teto e custo do serviço','Reajuste tarifário, fator de eficiência e taxa de retorno regulatória.'],
 [[91,97],'Economia da Regulação','Concessões, subsídios e tarifas de saneamento','Revisão tarifária, tributos, contratos de concessão e avaliação da qualidade do serviço.'],
 [[98,100],'Economia da Regulação','Agências reguladoras: competências e processo regulatório','ANA, poder normativo e de polícia e regulação de serviços prestados por entidades públicas e privadas.'],
 [[101,108],'Contabilidade Aplicada','Escrituração, contas patrimoniais e mensuração de ativos','Plano de contas, partidas dobradas, estoques, imobilizado, impairment e ativos intangíveis.'],
 [[110,110],'Administração Financeira e Orçamentária','Classificação institucional da despesa pública','Órgão e unidade orçamentária responsáveis pelo crédito na execução das ações.'],
 [[111,116],'Econometria','Modelo clássico de regressão linear e heterocedasticidade','MQO, viés, consistência, R², variável omitida e inferência estatística.'],
 [[117,118],'Econometria','Séries temporais: ARCH, GARCH e raiz unitária','Modelagem da volatilidade condicional, estacionariedade e regressão espúria.'],
 [[119,120],'Econometria','Dados em painel: efeitos fixos e pooled OLS','Regressores invariantes no tempo e correlação entre regressores e efeitos não observados.'],
]
const grupo=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
for(const n of canonical.keys())assert.ok(answers.has(n),`gabarito ${n}`)

const fonte=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`),'utf8')).map(String)
const cabecalho=/^(?:Em relação|Com base|Acerca|No que se refere|No que se relaciona|No que tange|No que diz respeito|No que concerne|A respeito|Com relação|Julgue|A partir|Considerando|No tocante|No âmbito|No contexto|Sobre|Relativamente|Tendo em vista|No que respeita|Ainda considerando)\b/i
const titulo=/^[A-ZÁÉÍÓÚÃÕÇ0-9\s/–-]{8,}$/
function textoOficial(n,page){
 const t=fonte[page-1]||'',m=new RegExp(`(?:^|\\n)\\s*${n}\\s+`).exec(t);assert.ok(m,`item ${n} não localizado na página ${page}`)
 let s=t.slice(m.index+m[0].length).split(/\n\s*(?=(?:5[1-9]|6\d|7\d|8\d|9\d|1[01]\d|120)\s+)/)[0]
 s=s.split(/\n\s*Espaço livre\b/i)[0]
 const linhas=s.split(/\n/),limpa=[]
 for(const linha of linhas){const x=linha.trim();if(!x)continue;if(cabecalho.test(x)||titulo.test(x))break;limpa.push(x)}
 return limpa.join(' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()
}
const hard=new Set([63,64,67,69,71,72,74,76,78,80,82,83,86,88,90,91,95,96,98,99,101,102,105,107,111,113,114,115,117,118,119,120])
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const answer=answers.get(n),[materia,conteudo,contexto]=grupo(n).slice(1),page=Number(q.pagina),imagem=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 let enunciado=textoOficial(n,page);assert.ok(enunciado.length>20,`enunciado ${n}`)
 if(n===63)enunciado='Se a função de produção é dada por z = x^(1/2)y^(1/2) e o isocusto é dado por x + y = 4, então, o multiplicador de Lagrange, que resolve o problema de maximização da produção, dado o custo, é igual a 2.'
 if(n===74)enunciado='Considere que a variável i represente a taxa interna de retorno correspondente a um empréstimo de R$ 15.000 a ser liquidado em seis pagamentos mensais iguais de R$ 3.250. Nesse caso, essa taxa interna de retorno pode ser corretamente obtida por meio da solução da equação polinomial 15i^6(i − 1) − 3,25(i^6 − 1) = 0.'
 const annulled=answer==='X'
 const contextImage=([51,52,53,54,55,56,57,58,59,60,61].includes(n)||[64,65].includes(n))?{pagina:n<=57?1:2,imagem:`paginas/${doc}-${String(n<=57?1:2).padStart(4,'0')}.webp`,texto:contexto}:(n>=76&&n<=77)?{pagina:3,imagem:`paginas/${doc}-0003.webp`,texto:contexto}:(n>=78&&n<=79)?{pagina:4,imagem:`paginas/${doc}-0004.webp`,texto:contexto}:null
 patches.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,
  concurso:'ANA 2024 — Especialista em Regulação de Recursos Hídricos e Saneamento Básico, Cargo 1 — Especialidade 1',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'28/04/2024',cargo:'Especialista em Regulação de Recursos Hídricos e Saneamento Básico — Cargo 1, Especialidade 1',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo conteúdo e nível da prova; a banca não divulga dificuldade individual por item.',
  classificacao_fonte:prova,motivo:'Classificação individual por conteúdo do item e sua seção temática; redação e gabarito conferidos no caderno e na chave oficial definitiva.',
  enunciado,texto_apoio:contexto,opcoes:['Certo','Errado'],
  ...(annulled?{resposta_correta:null,anulada:true}:{resposta_correta:answer==='C'?0:1,anulada:false}),
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_957_ANA_001_01.PDF',numero:n,pagina:1,resposta:answer,criterio:annulled?'Item anulado conforme gabarito oficial definitivo.':'Gabarito oficial definitivo do Cargo 1 — Especialidade 1, aplicação em 28/04/2024.'},
  visual:{pagina:page,imagem,motivo:contextImage?.texto||`Página ${page} do caderno oficial, vinculada para preservar o contexto original.`},
  ...(contextImage?{imagens_contexto:[contextImage]}:{}),...(annulled?{comentario:'Item anulado no gabarito oficial definitivo; mantido sem resposta correta e sem correção automática.'}:{}),apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']
 })
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Economia',conteudo:'Captura duplicada do mesmo item no mesmo caderno',ano:2024,concurso:'ANA 2024 — Especialista em Regulação de Recursos Hídricos e Saneamento Básico, Cargo 1 — Especialidade 1',banca:'CEBRASPE',numero_original:Number(q.numero),pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const hash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=hash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_oficial_51_a_120; nao_e_hash_do_pdf'}
const divergencias=[]
for(const p of patches){const q=ps.find(x=>x.id===p.id);if(p.gabarito_oficial&&q?.resposta!=null&&p.resposta_correta!=null&&q.resposta!==p.resposta_correta)divergencias.push({numero:p.numero_original,id:p.id,anterior:q.resposta,oficial:p.gabarito_oficial.resposta})}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anulados:patches.filter(p=>p.anulada).map(p=>p.numero_original),divergencias,figuras_e_contextos:patches.filter(p=>p.imagens_contexto).map(p=>({n:p.numero_original,imagem:p.imagens_contexto[0].imagem,pagina:p.imagens_contexto[0].pagina})),resumo:patches.filter(p=>p.gabarito_oficial).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,90)}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
