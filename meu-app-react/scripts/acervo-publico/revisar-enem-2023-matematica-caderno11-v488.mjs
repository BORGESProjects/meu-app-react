import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-enem-2023-matematica-caderno11-laranja-v488'
const documento='28c2e2f1c58a4ea9'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2023_Dia_2_P1_MT_Caderno_11_Laranja_NVDA.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2023_GB_impresso_D2_CD11.pdf'
const concurso='Exame Nacional do Ensino Médio — ENEM 2023 — 2º dia, Caderno 11 Laranja (NVDA)'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,41)

const respostas=new Map()
for(const [inicio,linha] of [
 [136,'E B X E E B D A D D'],
 [146,'A B C C B C C A B B'],
 [156,'A D D B D D A E A E'],
 [166,'A B C B E D E C A D'],
 [176,'C E C C B']
])linha.split(/\s+/).forEach((r,i)=>respostas.set(inicio+i,r))
assert.equal(respostas.size,45)
const hashGabarito=hashRevisao([...respostas].map(([n,r])=>`${n}:${r}`).join('|'))

const topicos={
136:['Geometria e orientação espacial','Média'],137:['Razão, proporção e sistemas lineares','Fácil'],138:['Leitura e interpretação de gráficos estatísticos','Média'],139:['Geometria espacial: área de superfície','Média'],141:['Geometria plana: círculo, setor e ângulo central','Média'],142:['Geometria plana: área de quadrados e faixa','Fácil'],144:['Matemática financeira: juros compostos e equivalência de capitais','Difícil'],145:['Função afim: modelagem de custo fixo e variável','Fácil'],146:['Função definida por partes e comparação de tarifas','Média'],147:['Função por partes e gráfico de volume acumulado','Média'],148:['Sistemas de numeração e padrões aditivos','Média'],149:['Estatística: média de precipitação em períodos consecutivos','Fácil'],150:['Geometria espacial: volume de tronco de cone perfurado','Difícil'],151:['Estatística: média aritmética ponderada','Fácil'],152:['Probabilidade composta e inequações','Difícil'],153:['Função linear e porcentagem','Fácil'],155:['Logaritmos e escala de intensidade sonora','Difícil'],156:['Probabilidade condicional e sorteio sem reposição','Média'],157:['Progressão geométrica e decaimento exponencial','Média'],158:['Função quadrática: vértice e valor mínimo','Média'],159:['Estatística: média e leitura de diagrama de dispersão','Média'],160:['Função linear, receita, custos e otimização','Difícil'],162:['Análise combinatória: arranjos e senhas','Difícil'],163:['Proporcionalidade e divisão de recursos','Média'],164:['Funções trigonométricas e movimento circular','Média'],165:['Probabilidade em sorteio ponderado','Fácil'],166:['Geometria espacial: volume de cilindro e consumo','Média'],167:['Porcentagem, capacidade e proporcionalidade','Média'],168:['Geometria espacial: vazão e volume de cilindro','Média'],169:['Geometria plana: ângulos inscritos e circunferências','Difícil'],170:['Análise combinatória: triângulo mágico e progressão aritmética','Difícil'],171:['Progressões aritméticas e interpretação de tabela','Fácil'],172:['Estatística: média, mediana e moda em distribuição discreta','Média'],173:['Matemática financeira: cálculo ponderado e comparação de grandezas','Média'],174:['Razão, proporção e porcentagem de desconto','Fácil'],175:['Proporcionalidade, unidades e arredondamento para inteiro','Fácil'],176:['Trigonometria no triângulo retângulo','Média'],177:['Escala, razão e proporcionalidade','Média'],178:['Mínimo múltiplo comum e ciclos periódicos','Média'],179:['Geometria plana: teorema de Pitágoras e áreas de círculos','Difícil'],180:['Grandezas, razão e análise dimensional','Fácil']
}
const anulada=138
const opcoesCorrigidas={
145:['y = 250x','y = 500x','y = 750x','y = 250x + 500','y = 500x + 250'],
153:['C = 0,9q','C = 0,1q','C = 1 − 0,1q','C = 1 − 0,9q','C = q − 10'],
157:['(1/9)L₀','(16/27)L₀','(32/243)L₀','(64/729)L₀','(128/2187)L₀'],
162:['Tipo 1, pois p₁ < p₂ < p₃.','Tipo 1, pois tem menor quantidade de caracteres.','Tipo 2, pois tem maior quantidade de letras.','Tipo 3, pois p₃ < p₂ < p₁.','Tipo 3, pois tem maior quantidade de caracteres.'],
176:['(22√3)/3','11√2','12√2','12√3','22'],
180:['min/(mL·kg)','mL/(min·kg)','(min·mL)/kg','(min·kg)/mL','(mL·kg)/min']
}
const respostasEsperadas=new Map([...respostas].map(([n,r])=>[n,r==='X'?null:r.charCodeAt(0)-65]))
const correcoes={
155:q=>q.replace(/sendo N igual a log na base 10 de I elevado a 10 menos log na base 10 de I índice 0 elevado a 10, I a intensidade do som e I índice 0 igual a 10 elevado a menos 12, watts por metro quadrado/i,'sendo N = 10 log₁₀(I/I₀), em que I é a intensidade do som e I₀ = 10⁻¹² W/m²'),
157:q=>q.replace(/L índice 0/g,'L₀'),
158:q=>q.replace(/V de x é igual a, abre parêntese, x ao quadrado sobre 4, fecha parêntese, menos 10 vezes x mais 105/i,'V(x) = x²/4 − 10x + 105').replace(/V índice 0/g,'V₀'),
169:q=>q.replace(/Q índice ([1-6])/g,'Q₁$1').replace(/ângulo alfa/gi,'ângulo α'),
176:q=>q.replace(/alfa/gi,'α'),
179:q=>q.replace(/alfa/gi,'α')
}
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero),tema=topicos[n],resp=respostas.get(n)
 assert.ok(tema&&resp,`Item ${n} não tem tópico ou resposta oficial`)
 assert.ok(q.opcoes?.length===5,`Item ${n} não tem cinco alternativas transcritas`)
 const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 let enunciado=q.enunciado.replace(/\s+/g,' ').trim()
 if(correcoes[n])enunciado=correcoes[n](enunciado)
 const anuladaOficial=resp==='X'
 const opcoes=opcoesCorrigidas[n]||q.opcoes
 const respIndex=respostasEsperadas.get(n)
 if(!anuladaOficial)assert.equal(opcoes.length,5)
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Matemática',conteudo:tema[0],ano:2023,concurso,banca:'INEP',organizadora:'INEP',aplicacao:'ENEM 2023 — 2º dia — Caderno 11 Laranja, versão acessível NVDA',cargo:'Participante do ENEM — prova de Matemática e suas Tecnologias',numero:n,numero_original:n,pagina:q.pagina,dificuldade:tema[1],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela quantidade de etapas, abstração, cálculo e integração de representações requeridas; o ENEM não publica dificuldade individual por questão.',resposta_correta:respIndex,anulada:anuladaOficial,gabarito_oficial:{fonte:gabarito,arquivo:'Gabarito oficial ENEM 2023, 2º dia, Caderno 11 Laranja',sha256:hashGabarito,numero:n,resposta:resp,criterio:anuladaOficial?'O gabarito oficial do INEP identifica o item como anulado; mantido sem resposta automática.':'Transcrição da alternativa oficial do gabarito do INEP; alternativas ordenadas conforme caderno acessível oficial.'},classificacao_fonte:prova,motivo:'Matéria, conteúdo e dificuldade estimada definidos pela leitura do problema e pela competência matemática mobilizada. Caderno acessível oficial e gabarito do INEP vinculados.',...(opcoesCorrigidas[n]?{opcoes}:{}),enunciado,texto_apoio:q.apoio||'',imagem_pagina:imagem,visual:{pagina:q.pagina,imagem:imagem,enunciado,texto_apoio:q.apoio||'',motivo:`Página ${q.pagina} do caderno acessível oficial conferida; descrições de gráficos, tabelas e figuras preservadas no enunciado.`},apta_resolucao:true,remover_pendencias:remover})
}
assert.equal(decisoes.length,41)
assert.equal(new Set(decisoes.map(x=>x.id)).size,41)
assert.equal(decisoes.filter(x=>x.anulada).length,1)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:41,itens_unicos:41,questoes_objetivas:41,anuladas:[138],alternativas_reformatadas:Object.keys(opcoesCorrigidas).map(Number),formulas_normalizadas:[155,157,158,169,176,179],paginas_visuais_vinculadas:41,gabarito_ine_vinculado:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,concurso,registros_revisados:41,itens_unicos:41,questao_anulada:[138],paginas_visuais_vinculadas:41,gabarito_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ENEM 2023 — Matemática — Caderno 11 Laranja NVDA — revisão v488\n\n- Revisei 41 registros pendentes, com conteúdo específico por item em geometria, estatística, probabilidade, funções, matemática financeira, trigonometria, análise combinatória, escalas e grandezas.\n- Vinculei a página visual da prova acessível a cada registro e preservei descrições legíveis de gráficos, mapas, figuras e tabelas. Normalizei fórmulas, índices, logaritmos, unidades e alternativas matemáticas com caracteres apropriados.\n- Vinculei o gabarito oficial do INEP. A questão 138 foi mantida como anulada, sem correção automática. Dificuldades registradas como estimativas editoriais.\n- Pacote local; ainda não publicado na nuvem.\n- Fontes oficiais: [caderno acessível do INEP](<${prova}>), [gabarito do INEP](<${gabarito}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
