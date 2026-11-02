import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-stj-2024-engenharia-mecanica-v520',doc='3b8307eede8ed8e7'
const prova='https://cdn.cebraspe.org.br/concursos/stj_24/arquivos/018_STJ_011_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/stj_24/arquivos/GAB_DEFINITIVO_018_STJ_011_01.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,72)
const rows=[
 ['C','C','E','C','E','X','E','C','C','C','E','C','E','C','E','E','E','E','E','E'],
 ['C','E','C','E','E','C','E','C','E','E','E','C','C','E','E','E','E','C','E','E'],
 ['E','C','E','E','C','E','C','C','C','E','C','C','E','C','C','E','E','C','C','E'],
 ['E','C','E','C','E','E','E','E','C','C'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)
const byNumber=new Map();for(const q of ps){const list=byNumber.get(Number(q.numero))||[];list.push(q);byNumber.set(Number(q.numero),list)}
assert.equal(byNumber.size,70)
assert.deepEqual([...byNumber].filter(([,list])=>list.length>1).map(([n,list])=>[n,list.length]),[[54,2],[62,2]])
const canonical=new Map([...byNumber].map(([n,list])=>[n,[...list].sort((a,b)=>a.enunciado.length-b.enunciado.length)[0]]))
const duplicates=new Map([...byNumber.values()].filter(list=>list.length>1).flatMap(list=>{const keep=[...list].sort((a,b)=>a.enunciado.length-b.enunciado.length)[0];return list.filter(q=>q.id!==keep.id).map(q=>[q.id,keep.id])}))
const groups=[
 [[51,53],'Termodinâmica','Ciclo de Rankine, eficiência térmica e superaquecimento','Difícil','Contexto: usina termelétrica em ciclo de Rankine ideal, entre 10 MPa na caldeira e 10 kPa no condensador; vapor saturado e condensação completa.'],
 [[54,57],'Transferência de Calor','Aquecimento de ar, regenerador, efetividade térmica e NTU','Difícil','Contexto: aquecedor elétrico e regenerador com área de 100 m²; ar de processo e ar ambiente, perdas consideradas desprezíveis; gráfico de efetividade em função do NTU preservado na página original.'],
 [[58,60],'Materiais de Engenharia','Tratamentos térmicos e termoquímicos dos aços','Média','Contexto: cementação, têmpera e revenimento de aços.'],
 [[61,64],'Conforto Ambiental','Índice PMV, temperatura operativa e conforto térmico','Média','Contexto: avaliação do conforto em escritório com climatização central e desconforto localizado; dados do cenário na página original.'],
 [[65,67],'Refrigeração e Ar-Condicionado','Carga térmica de resfriamento e renovação de ar','Difícil','Contexto: cálculo de carga térmica para auditório de 200 pessoas em região tropical, com janelas, iluminação, equipamentos e renovação do ar.'],
 [[68,69],'Mecânica dos Fluidos','Escoamento compressível e bocais convergentes','Difícil','Contexto: gases ideais em regime subsônico, Mach 0,4, descarregados por turbina a gás em bocal cônico convergente; figura original vinculada.'],
 [[70,70],'Aerodinâmica','Arrasto e sustentação de perfil simétrico','Média','Contexto: perfil aerodinâmico simétrico testado em túnel de vento; figura original vinculada.'],
 [[71,73],'Máquinas de Fluxo','Bombas centrífugas, leis de semelhança e associação em paralelo','Difícil','Contexto: bomba centrífuga de água gelada, motor de 25 cv, 1.750 rpm e potência medida de 21 cv; cenário completo na página original.'],
 [[74,77],'Vibrações Mecânicas','Oscilador massa-mola-amortecedor, fase, graus de liberdade e amortecimento crítico','Difícil','Contexto: sistema de um grau de liberdade com massa m, mola k e amortecedor viscoso c, submetido a força harmônica F(t); figura original vinculada.'],
 [[78,81],'Processos de Fabricação','Soldagem com eletrodo revestido, arco submerso, TIG, MIG, MAG e oxicorte','Média','Contexto: processos de soldagem e efeitos térmicos na junta e na zona termicamente afetada.'],
 [[82,83],'Mecânica dos Fluidos','Escoamento turbulento em tubulações e perda de carga','Média','Contexto: água em escoamento turbulento plenamente desenvolvido em tubo circular reto, horizontal e de seção constante.'],
 [[84,92],'Resistência dos Materiais','Estado plano de tensões, círculo de Mohr, flexão, torção, Tresca e von Mises','Difícil','Contexto: análise de tensões em vigas e barras sob flexão, compressão e torção; gráficos e figuras originais vinculados.'],
 [[93,97],'Dinâmica','Engrenagens planetárias, aceleração de Coriolis, energia e cinemática de rolamento','Difícil','Contexto: mecanismos em movimento, barra articulada, massa-mola e disco rolante; figuras originais vinculadas.'],
 [[98,99],'Corrosão e Proteção de Materiais','Proteção catódica e corrosão galvânica','Média','Contexto: pares de metais em contato em ambiente aquoso e proteção por ânodo de sacrifício.'],
 [[100,101],'Materiais de Engenharia','Ligas de alumínio e aços inoxidáveis','Média','Contexto: seleção de ligas metálicas segundo composição, tratamento térmico, conformação e resistência à corrosão.'],
 [[102,106],'Máquinas Elétricas','Motores de corrente alternada e contínua, fator de potência e indução eletromagnética','Média','Contexto: princípios de funcionamento e alimentação de motores elétricos.'],
 [[107,110],'Gestão de Projetos','Planejamento, documentação técnica, controle ambiental, prazo e custo de projeto','Média','Contexto: implantação de sistema central de ar-condicionado contratada sem projeto formal e com atraso de seis meses.'],
 [[111,120],'Sistemas de Transporte Vertical','Elevadores, plataformas elevatórias, cabos, polias, tração e requisitos da ABNT NBR 16858-2','Difícil','Contexto: projeto, eficiência, segurança e manutenção de elevadores de tração e plataformas elevatórias, conforme a norma indicada no caderno.'],
]
const group=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const cuts={53:'A seguir, é exibido o esquema',60:'Uma empresa localizada em região de clima subtropical',69:'Considerando que a figura anterior represente',70:'Uma bomba centrífuga utilizada',73:'Considerando o sistema ilustrado',77:'Julgue os próximos itens, em relação a aspectos pertinentes aos processos de soldagem',81:'CEBRASPE – STJ – Edital: 2024 Considerando',90:'Espaço livre',92:'Espaço livre',99:'CEBRASPE – STJ – Edital: 2024 Julgue',106:'Uma empresa resolveu implantar',110:'Em relação a elevadores e plataformas elevatórias'}
const clean=(n,s)=>{
 let t=String(s||'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 if(cuts[n]){const i=t.indexOf(cuts[n]);if(i>=0)t=t.slice(0,i).trim()}
 if(n===54)t=t.replace('a20kW','a 20 kW')
 if(n===74)t='Independentemente da frequência adotada para a força de excitação harmônica F(t), a amplitude do deslocamento da massa terá a mesma fase da força de excitação se c = 0, e fase oposta se c ≠ 0.'
 if(n===75)t='Se c ≠ 0, então o sistema possui dois graus de liberdade.'
 if(n===76)t='Se c = 0, então a frequência natural de vibração do sistema aumenta com o aumento da rigidez da mola.'
 if(n===77)t='Se c ≠ 0 e c < 2√(km), o sistema não oscila.'
 if(n===84)t='Suponha que, sob carga estática, um elemento de tensão em um ponto de um corpo submetido a um estado plano de tensões tenha tensões principais σ₁ e σ₂ com valores positivos. Nesse caso, a máxima tensão de cisalhamento τmáx equivale a (σ₁ − σ₂)/2.'
 if(n===87)t='A equação da linha elástica de uma viga submetida à flexão, expressa por 1/ρ = M/(EI), em que ρ é a curvatura, M é o momento fletor, E é o módulo de elasticidade e I é o momento de inércia, é aplicável a vigas de material não homogêneo, isotrópico e elástico linear, desde que as deformações, as rotações e os deslocamentos da viga sejam grandes.'
 if(n===88)t='O elemento de tensão na figura a seguir mostra as tensões atuantes no ponto C, equivalentes a σₓ = −4P/(πD²) − 32FL/(πD³) e τₓz = 16T/(πD³).'
 if(n===94)t='Considere que, no movimento da barra OA ilustrada na figura a seguir, os componentes da aceleração no ponto A sejam dados, em função de r, θ, ṙ, θ̇, r̈ e θ̈, por aᵣ = r̈ − rθ̇² = r̈ − vθ²/r e aθ = rθ̈ + 2ṙθ̇. Nesse caso, a parcela de aθ expressa em função de ṙ e θ̇ é denominada aceleração de Coriolis.'
 if(n===95)t='A compressão provocada em uma mola de constante k por uma esfera de massa M que se desloca sobre uma superfície plana sem fricção, com velocidade inicial V, até que V = 0, equivale a x = V√(M/k).'
 if(n===120)t='No dimensionamento de elevadores, o fator de segurança dos cabos de aço deve ser estabelecido, em regra, como 10 vezes a carga nominal máxima suportada pelo elevador.'
 return t
}
const answerHash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const[,materia,conteudo,dificuldade,textoApoio]=group(n),pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,enunciado=clean(n,q.enunciado),answer=answers.get(n),anulada=answer==='X'
 assert.ok(enunciado.length>15,`enunciado ${n}`);assert.ok(!enunciado.includes('/g18'),`símbolo OCR ${n}`)
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,
  concurso:'Concurso Público do Superior Tribunal de Justiça — Analista Judiciário, Apoio Especializado, Engenharia Mecânica (Cargo 11)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'01/12/2024',cargo:'Analista Judiciário — Apoio Especializado — Engenharia Mecânica (Cargo 11)',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada nos cálculos, nas fórmulas e na complexidade técnica do item; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Cargo, aplicação, numeração e conteúdo conferidos no caderno oficial e no gabarito oficial definitivo do Cargo 11.',
  enunciado,texto_apoio:textoApoio,opcoes:['Certo','Errado'],resposta_correta:anulada?null:(answer==='C'?0:1),anulada,
  gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_018_STJ_011_01.PDF',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 11 — Analista Judiciário, Engenharia Mecânica; aplicação em 01/12/2024.',sha256:answerHash,sha256_tipo:'sha256_da_transcricao_dos_itens_51_a_120; nao_e_hash_do_pdf'},
  visual:{pagina,imagem,motivo:`Página ${pagina} do caderno oficial vinculada para preservar figuras, gráficos, fórmulas e o contexto do item.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id),n=Number(q.numero),[,materia,conteudo]=group(n);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:`Captura duplicada do item ${n}; mantida a versão transcrita corretamente`,ano:2024,concurso:'Concurso Público do Superior Tribunal de Justiça — Analista Judiciário, Apoio Especializado, Engenharia Mecânica (Cargo 11)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'01/12/2024',cargo:'Analista Judiciário — Apoio Especializado — Engenharia Mecânica (Cargo 11)',numero_original:n,pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,72)
console.log(JSON.stringify({pacote:nome,capturas:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,prova,gabarito_definitivo:chave,anulada:[...answers].filter(([,a])=>a==='X').map(([n])=>n),formulas_reparadas:[74,75,76,77,84,87,88,94,95],amostras:patches.filter(p=>p.gabarito_oficial&&[51,56,62,68,71,74,84,88,92,94,98,107,111,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
