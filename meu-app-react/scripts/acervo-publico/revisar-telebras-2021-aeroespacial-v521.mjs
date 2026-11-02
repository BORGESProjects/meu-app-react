import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-telebras-2021-aeroespacial-v521'
const doc='3e1c1743be7d9201'
const prova='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/657_TELEBRAS_011_01.PDF'
const chavePreliminar='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/GAB_PRELIMINAR_657_TELEBRAS_011_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/telebras_21/arquivos/TELE_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,72)

const groups=[
 [[51,58],'Física','Mecânica newtoniana, energia e movimento orbital','Difícil'],
 [[59,62],'Física','Eletrostática, lei de Gauss e movimento de cargas em campos elétrico e magnético','Difícil'],
 [[63,73],'Física','Mecânica celeste, leis de Kepler e manobras orbitais','Difícil'],
 [[74,78],'Engenharia Aeroespacial','Dinâmica de voo, cinemática vetorial e sistemas de referência','Difícil'],
 [[79,83],'Engenharia Aeroespacial','Sensores, giroscópios e controle de atitude de satélites','Difícil'],
 [[84,84],'Engenharia Aeroespacial','Acústica e efeitos de ruído em veículos lançadores','Média'],
 [[85,88],'Física','Estática, equilíbrio e cinemática aplicada','Média'],
 [[89,91],'Engenharia Mecânica','Vibrações mecânicas e sistemas massa-mola-amortecedor','Difícil'],
 [[92,93],'Engenharia Mecânica','Análise de vibrações, valor RMS e balanceamento de máquinas','Média'],
 [[94,96],'Engenharia Mecânica','Cinemática de mecanismos: biela-manivela e came-seguidor','Média'],
 [[97,100],'Engenharia Aeroespacial','Ciclo de vida, planejamento, integração e lançamento de missões espaciais','Média'],
 [[101,101],'Engenharia de Telecomunicações','Radiofrequência e enlaces de comunicação por satélite','Média'],
 [[102,107],'Engenharia Aeroespacial','Arquitetura, subsistemas, energia e ambiente espacial de satélites','Média'],
 [[108,108],'Física','Gravitação e problema restrito de três corpos: pontos de Lagrange','Média'],
 [[109,112],'Matemática','Programação linear, função objetivo e região viável','Média'],
 [[113,116],'Química','Cinética química e equações diferenciais de reação','Difícil'],
 [[117,120],'Matemática','Análise combinatória e probabilidade','Média'],
]
const group=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return {materia:g[1],conteudo:g[2],dificuldade:g[3]}}

// Capturas que repetem o mesmo número foram conferidas contra a página original.
const byNumber=new Map()
for(const q of ps){const n=Number(q.numero),v=byNumber.get(n)||[];v.push(q);byNumber.set(n,v)}
assert.equal(byNumber.size,69)
assert.deepEqual([...byNumber].filter(([,v])=>v.length>1).map(([n,v])=>[n,v.length]),[[56,2],[57,2],[58,2]])
const canonical=new Map([...byNumber].map(([n,v])=>[n,[...v].sort((a,b)=>a.enunciado.length-b.enunciado.length)[0]]))
const duplicates=[...byNumber.values()].filter(v=>v.length>1).flatMap(v=>{const keep=[...v].sort((a,b)=>a.enunciado.length-b.enunciado.length)[0];return v.filter(q=>q.id!==keep.id).map(q=>[q.id,keep.id])})

const cuts={
 58:'Considere duas placas planas',60:'657011_01N884891 CEBRASPE',62:'Julgue os próximos itens, relativos à mecânica celeste.',
 72:'Julgue o item subsecutivo, em relação ao encontro de naves',73:'Julgue os itens que se seguem, relativos à dinâmica de voo',
 78:'A respeito de sistemas de controle de atitude utilizados',83:'Julgue o item subsequente, com relação a veículos lançadores',
 88:'Julgue os itens seguintes, considerando que, no sistema',90:'Julgue o item subsequente, considerando que, no sistema',
 91:'A respeito de máquinas rotativas e análise de defeitos',93:'657011_01N884891 CEBRASPE',
}
const replacements={
 51:'Até o foguete atingir o ponto A, a força resultante sobre ele será tal que |Fᵣₑₛ| = |F| − |P| − |R|.',
 52:'O módulo da velocidade v do foguete nos estágios 2 e 3 será |v| = 200√70 m/s.',
 53:'No estágio 2, a aceleração do foguete é nula, o que implica que |F| = |P| e que, portanto, o módulo de F seja constante.',
 54:'O trabalho W realizado pela força F entre os pontos A e C é dado por W = mgR(100√50 − 10²)/(10²√50).',
 55:'A energia mecânica E do foguete no ponto C é dada por E = mgR(2/100 − 1/√50), e a órbita do satélite em torno do centro da Terra tem a forma de uma elipse.',
 56:'Para o módulo da aceleração a no estágio 1, deve existir um valor que implique que o foguete descreva uma órbita circular em torno do centro da Terra a partir do ponto C.',
 57:'A condição para que o foguete escape de uma órbita fechada em torno da Terra e se afaste indefinidamente dela é dada pela velocidade de escape indicada na fórmula da página original.',
 58:'A conservação do momento angular implica que a velocidade angular ω = |θ̇| seja dada pela relação orbital apresentada na página original, quando o foguete sai do estágio 3.',
 59:'Com fundamento na lei de Gauss, demonstra-se que o campo elétrico entre as placas pode ser descrito por E⃗ = −Q/(ε₀S) x̂.',
 60:'Pela lei de Gauss, demonstra-se que o campo elétrico na região x < 0 é dado por E⃗ = Q/(ε₀S) x̂.',
 61:'Considerando-se E⃗ uniforme na região 0 < x < d entre as placas, as coordenadas do ponto A são (xA, yA, 0), com xA = d e yA conforme a expressão exibida na página original.',
 62:'Depois de atravessar a placa positiva no ponto A, a carga q descreverá um movimento circular cujo raio é dado pela expressão exibida na página original.',
 74:'Para um ponto P que se move ao longo de uma órbita determinada pelo vetor posição r(x,y,z) e por um ângulo orbital θ, o vetor aceleração a, com componentes transversal e radial, será corretamente escrito conforme a expressão da página original: a = (d²r/dt² − r(dθ/dt)²) r̂ + (r d²θ/dt² + 2(dr/dt)(dθ/dt)) θ̂.',
 75:'No caso geral do movimento de um corpo rígido, como um veículo espacial, a aceleração é dada pela expressão da página original, em que ω é a velocidade angular e são usadas as coordenadas do ponto P(x,y,z) e do sistema inercial (X,Y,Z); nessa análise, as acelerações de Coriolis são desconsideradas.',
 76:'Na determinação dos parâmetros orbitais de veículos espaciais, para analisar a rotação do veículo em relação à Terra, adota-se o referencial inercial R(X,Y,Z); a aceleração do veículo em relação ao sistema inercial é expressa pela equação apresentada na página original.',
 77:'A dinâmica da atitude de um veículo espacial baseia-se principalmente nas equações da dinâmica orbital de corpos rígidos. Movimentos, posições e atitudes podem ser representados por sistemas de coordenadas fixados no eixo do veículo e/ou por sistemas inerciais; a partir deles é possível prever e avaliar acelerações e rotações do veículo.',
 78:'Os ângulos de Euler formam três quantidades independentes capazes de definir a posição do eixo do corpo em relação a um sistema inercial. A matriz de transformação que representa a rotação do corpo em torno do eixo z, expressa em termos das velocidades angulares e dos ângulos de Euler, é equivalente à matriz de rotação do corpo em torno do eixo z.',
 91:'O sistema apresenta as frequências naturais ωn₁ = √(k/m) e ωn₂ = √(3k/m), conforme indicado na página original.',
 92:'No monitoramento de equipamentos, uma indicação de deterioração é o aumento do valor RMS (Root Mean Square) durante a operação; o valor é calculado a partir do sinal no domínio do tempo pela equação exibida na página original.',
 95:'O mecanismo possui três graus de liberdade: a rotação da manivela m em torno do pivô O, a rotação da biela b e o deslocamento linear do ponto B ao longo do eixo x.',
 113:'Se f(0) = 0, então a concentração de Y ao longo do tempo é dada pela solução apresentada na página original para a equação diferencial dcY/dt = k(cA − cY)(cB − cY).',
 114:'Dada a presença da parcela cY² na expansão da equação diferencial apresentada, tal equação classifica-se como linear não homogênea de segunda ordem.',
 115:'Para uma constante C₂ adequadamente escolhida, a decomposição em frações parciais da expressão 1/[(cA − cY)(cB − cY)] é a igualdade exibida na página original, com C₁ = 1/(cB − cA).',
 116:'Uma primitiva da função g(cY) = 1/[(cA − cY)(cB − cY)] é dada pela expressão logarítmica apresentada na página original.',
}
replacements[61]='Considerando-se que E⃗ seja uniforme na região 0 < x < d entre as placas, as coordenadas do ponto A são (xA, yA, 0), com xA = d e yA = v₀√(2md/(|q|E)).'
replacements[62]='Depois de atravessar a placa positiva no ponto A, a carga q descreverá movimento circular de raio R = [m/(|q|B)]√(v₀² + 2|q|Ed/m).'
replacements[57]='A condição para que o foguete escape de uma órbita fechada em torno da Terra e se afaste indefinidamente dela é |v⃗| ≥ √(2gR/√50).'
replacements[58]='A conservação do momento angular implica que, quando o foguete sai do estágio 3, sua velocidade angular é ω = |θ̇| = 7|v⃗|/(50R).'
replacements[113]='Se f(0) = 0, então a concentração de Y ao longo do tempo é f(t) = cA cB [e^(k(cA−cB)t) − 1]/[cA e^(k(cA−cB)t) − cB].'
replacements[115]='Para uma constante C₂ adequadamente escolhida, vale C₁/(cA−cY) + C₂/(cB−cY) = 1/[(cA−cY)(cB−cY)], com C₁ = 1/(cB−cA).'
replacements[116]='Uma primitiva da função g(cY) = 1/[(cA−cY)(cB−cY)] é G(cY) = ln[(cA−cY)/(cB−cY)]/(cA−cB).'
const clean=(n,s)=>{
 let t=String(s||'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 if(cuts[n]){const i=t.indexOf(cuts[n]);if(i>=0)t=t.slice(0,i).trim()}
 if(replacements[n])t=replacements[n]
 if(n===86)t=t.replace('ângulo θ. Nessa situação','ângulo θ. Nessa situação')
 if(n===88)t=t.replace('aceleração minima','aceleração mínima')
 if(n===93)t='Em um sistema rotativo totalmente balanceado, as reações de apoio devidas às forças aplicadas são nulas, mas as devidas aos momentos não são.'
 if(n===94)t='Na reversão do movimento da biela-manivela, quando θ = 0° ou θ = 180°, a aceleração e a velocidade instantânea da articulação B são nulas.'
 if(n===95)t=replacements[95]
 if(n===108)t='Lagrange mostrou a existência de pontos de equilíbrio gravitacional no problema restrito de três corpos. Os pontos lagrangianos têm aplicação no posicionamento estratégico de sondas e telescópios espaciais, como SOHO e James Webb, situados, respectivamente, nos pontos L2 (SOHO, voltado à observação solar) e L1 (James Webb, voltado à observação de estrelas e galáxias).'
 if(n===110)t='As restrições da situação hipotética impõem à região viável uma estrutura de espaço vetorial de, no mínimo, quatro dimensões.'
 if(n===112)t='Considerando, além das restrições da situação hipotética, que os valores investidos em cada empresa sejam não negativos, o conjunto dos pares ordenados (xA, xB) que satisfaz todas as restrições forma uma região hexagonal.'
 return t
}
const apoioFor=n=>{
 if(n>=51&&n<=58)return 'Um foguete é lançado da superfície da Terra em três estágios. No estágio 1, é acelerado uniformemente até A, à altura hA, com aceleração de módulo g. No estágio 2, sobe verticalmente em movimento retilíneo uniforme até B, à altura hB. No estágio 3, percorre um arco circular de raio RC até C, alterando a direção do movimento em 90°, com módulo da velocidade constante e igual ao do estágio 2. Nos três estágios atuam a força de propulsão F⃗ e o peso P⃗; no estágio 1 atua também a resistência do ar R⃗, oposta ao movimento. Depois do estágio 3, atua apenas a gravidade. A massa da Terra mT está uniformemente distribuída numa esfera de raio R; as distâncias são hA = 0,02R, hB = 5R e RC = R. Considere massa do foguete constante, g = 10 m/s² e R = 6.500 km. O esquema e as fórmulas estão na imagem da página 1.'
 if(n>=59&&n<=62)return 'Duas placas planas, paralelas, de área S e distância d, têm cargas uniformes −Q e +Q (Q > 0). A origem O está na placa negativa, o eixo x é perpendicular às placas e aponta para a positiva. À direita da placa positiva há campo magnético uniforme B⃗ = B ẑ. No instante inicial t = 0, uma carga negativa q, próxima de O, tem velocidade inicial v₀ na direção ŷ e move-se sob a ação do campo elétrico até atingir a placa positiva em A; depois entra na região de campo magnético. Considere placas suficientemente grandes para serem tratadas como infinitas e continuidade do estado dinâmico ao atravessar a placa. Figuras e demais expressões estão nas páginas 1 e 2.'
 if(n>=89&&n<=90)return 'Considere o sistema massa-mola-amortecedor ilustrado na página 3, com massa m = 25 kg, rigidez k = 3.025 N/m e amortecimento viscoso c = 715 N·s/m.'
 if(n===91)return 'Considere o sistema mecânico de duas massas e três molas ilustrado na página 3, com c₁ = c₂ = c₃ = 0, k₁ = k₂ = k₃ = k e m₁ = m₂ = m.'
 if(n===94||n===95)return 'Considere o mecanismo biela-manivela representado na página 4, no qual a manivela m gira com velocidade angular constante ω; os pontos O, A e B e o eixo x estão indicados na figura.'
 if(n===96)return 'O mecanismo de came ilustrado na página 4 eleva caixas entre correias transportadoras. O seguidor percorre: elevação de 50 mm em 1,2 s; permanência de 0,4 s; descida de 25 mm em 0,9 s; permanência de 0,6 s; e descida de 25 mm em 0,9 s.'
 if(n>=109&&n<=112)return 'Arnaldo dispõe de R$ 10.000,00 para investir nas empresas A e B. A empresa A paga dividendos anuais de 10% e tem maior volatilidade; a empresa B paga 7%. Ele não investirá mais de 60% do capital em A, nem menos de 20% em B, e não investirá em A menos do que em B. Busca maximizar os dividendos anuais, respeitando as restrições.'
 if(n>=113&&n<=116)return 'Em uma reação A + B → Y, as concentrações iniciais dos reagentes são cA e cB. No instante t, a concentração do produto Y é cY = f(t), e as concentrações de A e B são cA − f(t) e cB − f(t). A taxa de produção é proporcional ao produto das concentrações: dcY/dt = k(cA − cY)(cB − cY), com k > 0.'
 if(n>=117&&n<=120)return 'Uma empresa selecionará quatro de seus dez funcionários para uma equipe, todos com a mesma função. Márcio e Marcos são muito amigos e, quando trabalham juntos, conversam em excesso, prejudicando a produtividade. Pedro e Paulo são desafetos e não trocam nem as comunicações essenciais ao trabalho, também prejudicando a produtividade.'
 return ''
}
const paginas=n=>n<=58?[1]:n<=62?[1,2]:n<=83?[2]:n<=93?[3]:n<=96?[3,4]:n<=108?[4]:[5]
const motivos='Concurso, cargo, aplicação, numeração e conteúdo foram conferidos no caderno oficial CEBRASPE do Cargo 11; a dificuldade é estimativa editorial baseada na natureza e complexidade do item.'
const patches=[]
for(const[n,q]of [...canonical].sort((a,b)=>a[0]-b[0])){
 const {materia,conteudo,dificuldade}=group(n),pagina=Number(q.pagina),enunciado=clean(n,q.enunciado)
 assert.ok(enunciado.length>20,`enunciado ${n}`)
 assert.ok(!/\/g\d{3,}/.test(enunciado),`OCR residual ${n}`)
 const imgs=paginas(n).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:''}))
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,
  concurso:'Concurso Público da Telecomunicações Brasileiras S.A. (TELEBRAS) — Especialista em Gestão de Telecomunicações — Engenheiro — Subatividade Aeroespacial (Cargo 11)',
  banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'20/02/2022',cargo:'Especialista em Gestão de Telecomunicações — Engenheiro — Subatividade Aeroespacial (Cargo 11)',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na exigência conceitual, matemática e técnica do item; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:motivos,enunciado,texto_apoio:apoioFor(n),opcoes:['Certo','Errado'],
  resposta_correta:null,anulada:false,
  visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,motivo:`Página ${pagina} do caderno oficial. Fórmulas, esquemas e figuras necessários à resolução permanecem acessíveis na imagem original.`},
  imagens_contexto:imgs.filter(x=>x.pagina!==pagina),apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','visual_ausente','enunciado_incompleto']})
}

// Item 95 está no acervo como inelegível, por isso não apareceu na extração de pendências.
const q95Original=JSON.parse(await fs.readFile('tmp/telebras-2021-cargo11-item95-original.json','utf8'))
const q95Id='extr-ead65a0a6a2c579d39b3'
assert.equal(q95Original.id,q95Id)
patches.push({id:q95Id,sha256_enunciado:hashRevisao(q95Original.enunciado),materia:'Engenharia Mecânica',conteudo:'Cinemática de mecanismos: biela-manivela e came-seguidor',ano:2021,
 concurso:'Concurso Público da Telecomunicações Brasileiras S.A. (TELEBRAS) — Especialista em Gestão de Telecomunicações — Engenheiro — Subatividade Aeroespacial (Cargo 11)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'20/02/2022',cargo:'Especialista em Gestão de Telecomunicações — Engenheiro — Subatividade Aeroespacial (Cargo 11)',numero_original:95,pagina:4,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na aplicação de cinemática de mecanismos; não é classificação oficial da banca.',classificacao_fonte:prova,motivo:motivos,
 enunciado:'O mecanismo possui três graus de liberdade: a rotação da manivela m em torno do pivô O, a rotação da biela b e o deslocamento linear do ponto B ao longo do eixo x.',texto_apoio:'O mecanismo de came mostrado na figura tem a função de elevar caixas de uma correia transportadora para outra repetidamente. A sequência do seguidor é: elevação de 50 mm em 1,2 s; permanência de 0,4 s; descida de 25 mm em 0,9 s; permanência de 0,6 s; descida de 25 mm em 0,9 s.',opcoes:['Certo','Errado'],resposta_correta:null,anulada:false,
 visual:{pagina:4,imagem:`paginas/${doc}-0004.webp`,motivo:'A página 4 contém a figura do mecanismo e o item 95; a página 3 foi ligada como contexto anterior.'},imagens_contexto:[{pagina:3,imagem:`paginas/${doc}-0003.webp`,texto:'Figura e enunciado do mecanismo biela-manivela do item anterior.'}],apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','visual_ausente','enunciado_incompleto']})
patches.at(-1).texto_apoio='Considere o mecanismo biela-manivela representado na página 4, no qual a manivela m gira com velocidade angular constante ω; os pontos O, A e B e o eixo x estão indicados na figura.'

for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id),n=Number(q.numero),{materia,conteudo}=group(n);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:`Captura duplicada do item ${n}; mantida a versão revisada`,ano:2021,concurso:'Concurso Público da Telecomunicações Brasileiras S.A. (TELEBRAS) — Cargo 11 — Engenheiro — Subatividade Aeroespacial',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'20/02/2022',cargo:'Especialista em Gestão de Telecomunicações — Engenheiro — Subatividade Aeroespacial (Cargo 11)',numero_original:n,pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
assert.deepEqual([...canonical.keys()].sort((a,b)=>a-b).filter(n=>!new Set([...canonical.keys(),95]).has(n)),[])
console.log(JSON.stringify({pacote:nome,capturas_pendentes:ps.length,itens_unicos:70,duplicatas:duplicates.length,item95_reparado:true,questoes_sem_gabarito_definitivo_vinculado:70,prova,gabarito_preliminar:chavePreliminar,justificativas_de_alteracao:justificativas,amostras:patches.filter(p=>p.apta_resolucao!==false&&[51,59,63,74,79,84,89,92,94,95,97,101,108,109,113,117,120].includes(p.numero_original)).map(p=>({numero:p.numero_original,materia:p.materia,conteudo:p.conteudo,pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
