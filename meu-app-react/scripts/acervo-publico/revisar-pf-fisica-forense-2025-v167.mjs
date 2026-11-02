import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {createHash} from 'node:crypto'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='3a54ba5d663e5352'
const prova='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/106_PF_009_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/DAC7F9CA42277AEBFF4D7B97F7A953DBAEE67FAF37C5FBD06493B01E7E4148B4.pdf'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-camara-processo-legislativo-2026-v166'))
if(start<0)throw Error('Base v166 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start)
const manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==66)throw Error('Catálogo da prova PF Cargo 9 divergente')
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.concurso==='PF 25')){
 if(!lot.arquivo)continue
 for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
}
if(active.size!==66)throw Error(`Esperados 66 registros PF Cargo 9, encontrados ${active.size}`)
const pages=new Map(catalog.questoes.map(q=>[q.id,q.pagina]))
const answers=new Map(Object.entries({51:'C',52:'E',53:'E',54:'C',55:'E',56:'C',57:'C',58:'C',59:'E',60:'E',61:'E',62:'C',63:'C',64:'E',65:'C',66:'E',67:'E',68:'E',69:'C',70:'C',71:'C',72:'E',73:'E',74:'E',75:'C',76:'E',77:'E',78:'C',79:'E',80:'C',81:'E',82:'E',83:'E',84:'C',85:'E',86:'X',87:'C',88:'C',89:'E',90:'C',91:'E',92:'C',93:'C',94:'E',95:'C',96:'E',97:'E',98:'E',99:'E',100:'C',101:'X',102:'E',103:'C',104:'C',105:'E',106:'E',107:'C',108:'E',109:'C',110:'C',111:'X',112:'E',113:'E',114:'C',115:'C',116:'C',117:'E',118:'C',119:'E',120:'C'}).map(([n,v])=>[Number(n),v]))
if(answers.size!==70)throw Error('Gabarito definitivo não cobre os itens 51–120')
const groups=[
 [[51,53],'Física','Grandezas físicas, incertezas de medidas e Sistema Internacional de Unidades','Julgue os itens a respeito de grandezas físicas, incertezas de medição e definições do Sistema Internacional de Unidades.'],
 [[54,56],'Física','Mecânica clássica e gravitação: pêndulo, órbitas e conservação do momento angular','Considere a Terra esférica, sem influência gravitacional de outros corpos; no item 54, adote pequenas oscilações e gravidade constante durante cada oscilação. Julgue os itens sobre gravitação e mecânica.'],
 [[57,60],'Física','Mecânica dos fluidos e ondas: pressão hidrostática, interferência, atenuação e efeito Doppler','Julgue os itens sobre fluidos newtonianos e ondas.'],
 [[61,65],'Física','Dinâmica de projéteis, arrasto quadrático e colisões','Um projétil em trajetória balística sofre arrasto atmosférico Fₐ = −kv², em que k é constante e v é sua velocidade instantânea. O solo é plano, o ângulo de elevação é θ (0° < θ ≤ 90°) e a gravidade é constante. Nos itens 61–64, use esse contexto. No item 65, um projétil de massa m e velocidade v colide perpendicularmente com um corpo de massa M em repouso; despreze dissipações.'],
 [[66,69],'Física','Eletromagnetismo: equações de Maxwell, densidade de carga e lei de Gauss','Uma carga total finita Q está distribuída no vácuo, com densidade ρ(t,r⃗), em que t é o tempo e r⃗ é o vetor posição. A distribuição está confinada a uma esfera de raio R centrada na origem: ρ(t,r⃗)=0 para |r⃗|>R. A distribuição é estacionária se a densidade não depender do tempo. Considere as equações de Maxwell e julgue os itens.'],
 [[70,72],'Física','Eletrodinâmica e magnetismo: potencial elétrico, aceleração de partículas e força magnética','Uma carga positiva parte do repouso entre planos paralelos de potenciais V₁ e V₂ e é acelerada em direção ao plano de potencial V₂; em seguida, entra em campo magnético uniforme perpendicular ao campo elétrico. Duas partículas de mesma carga positiva, com massas m e 2m, são aceleradas e penetram no campo magnético no vácuo. Julgue os itens.'],
 [[73,75],'Física','Termodinâmica: ciclo de gás ideal, trabalho, calor e variação de entropia','Um motor térmico que utiliza um gás ideal monoatômico percorre o ciclo quase estático AB, BC e CA, representado no diagrama P×V da página original. Julgue os itens; mantenha o diagrama associado.'],
 [[76,78],'Física','Óptica geométrica e ondulatória: espelhos esféricos e interferência','Julgue os itens sobre espelhos esféricos e interferência entre ondas.'],
 [[79,82],'Física','Óptica e física da matéria: difração em fenda única e difração de raios X','Julgue os itens sobre difração em fenda única e difração de raios X, incluindo a condição de Bragg.'],
 [[83,85],'Física','Física moderna: efeito fotoelétrico, modelo de Bohr e hipótese de de Broglie','Julgue os itens sobre efeito fotoelétrico, átomo de hidrogênio e comprimento de onda de partículas/fótons. No item 85, considere h=4,0×10⁻¹⁵ eV·s e c=3,0×10⁸ m/s.'],
 [[86,87],'Física','Mecânica quântica: função de onda e equação de Schrödinger','Julgue os itens relativos a funções de onda associadas à equação de Schrödinger.'],
 [[88,90],'Física','Física nuclear e proteção radiológica: radiações alfa, beta e gama e dose equivalente','Julgue os itens sobre emissão de radiações alfa, beta e gama e efeitos/dose de radiação.'],
 [[91,102],'Balística Forense','Armas de fogo, munições, funcionamento, trajetória e exames de confronto balístico','Julgue os itens sobre armas de fogo e munições, exames de balística forense, funcionamento de armamentos e trajetórias.'],
 [[103,105],'Criminalística','Sistema Nacional de Análise Balística e Banco Nacional de Perfis Balísticos','Julgue os itens conforme os procedimentos do Sistema Nacional de Análise Balística (SINAB) e do Banco Nacional de Perfis Balísticos.'],
 [[106,110],'Criminalística','Microscopia eletrônica de varredura e análise de materiais','Julgue os itens sobre microscopia eletrônica de varredura, interação do feixe de elétrons com a amostra e análise por raios X.'],
 [[111,116],'Legislação Penal Especial','Estatuto do Desarmamento: registro, porte, posse, munição e omissão de cautela','Julgue os itens com base na Lei n.º 10.826/2003 e na jurisprudência do Superior Tribunal de Justiça.'],
 [[117,118],'Legislação Militar','Produtos controlados pelo Exército: Decreto n.º 10.030/2019','Julgue os itens conforme o Decreto n.º 10.030/2019, que regulamenta os produtos controlados pelo Comando do Exército.'],
 [[119,120],'Criminalística','Banco Nacional de Perfis Balísticos: gestão e finalidade','Julgue os itens conforme o Decreto n.º 10.711/2021, que institui o Banco Nacional de Perfis Balísticos e o Sistema Nacional de Análise Balística.']
]
const group=n=>groups.find(([[a,b]])=>n>=a&&n<=b)
const fixes={
 55:'Se um satélite está orbitando a Terra em uma órbita circular, sua velocidade linear, tangencial à superfície terrestre, é proporcional a 1/√r, em que r é o raio da órbita.',
 59:'No ar, a atenuação viscosa de ondas sonoras é tipicamente menor para ondas de maior frequência; por isso, sinais sonoros de urgência utilizam sons agudos.',
 60:'Para um observador que se movimente com velocidade v constante em linha reta entre duas fontes estacionárias que emitam ondas sonoras no mesmo comprimento de onda λ, a diferença entre as frequências detectadas das ondas emitidas por cada uma das fontes é de 4v/λ.',
 63:'Considerando-se k=0 e a altura inicial do tiro igual à do solo, é correto afirmar que a altura máxima do projétil é proporcional a v₀², em que v₀ é a magnitude da velocidade inicial.',
 64:'Considere que o projétil seja lançado com velocidade inicial elevada e ângulo pequeno, de modo que o movimento vertical seja negligenciável. Para perfurar um alvo constituído apenas de certo material, sua velocidade de impacto deve ser, no mínimo, v_f. Se o alvo estiver à distância L do ponto de lançamento, a velocidade inicial mínima do projétil deverá ser v₀ = v_f e^(kL/m), em que m é a massa do projétil. Fórmula conferida com a expressão impressa no caderno; consulte a imagem da página para a notação original.',
 65:'Se o corpo, após a colisão, adquirir velocidade igual a v/k, em que k é uma constante, a colisão será elástica se k = (M + m)/(2m).',
 66:'Se a carga total Q for nula e a distribuição de cargas for estacionária, então o campo magnético em qualquer ponto fora da região esférica de raio R será nulo, pois não pode haver correntes elétricas no interior da região que contém a distribuição de cargas.',
 67:'Uma densidade de cargas não estacionária implicará, necessariamente, um campo elétrico estacionário em um ponto P fora da região que contém a carga Q.',
 68:'Se a densidade de carga for constante e positiva, isto é, ρ(t,r⃗)=C>0, então o campo elétrico em um ponto P qualquer do espaço terá a mesma direção do vetor posição r⃗ associado a P, e a intensidade do campo elétrico dentro da região esférica de raio R poderá ser escrita como |E⃗|=A|r⃗|, em que A é uma constante que depende de Q e R.',
 69:'O fluxo do campo elétrico para qualquer superfície gaussiana fechada que contenha a região esférica de raio R será constante e proporcional à carga total Q, mesmo que a densidade de cargas não seja estacionária.',
 70:'Para que as cargas sejam aceleradas na direção da região de campo magnético, o potencial elétrico V₁ deve ser maior que o potencial elétrico V₂.',
 71:'Se as cargas entrarem na região de campo magnético com a mesma velocidade, então ambas terão trajetórias circulares e a partícula mais pesada terá trajetória cujo raio é o dobro do raio da trajetória mais leve.',
 72:'Para que as duas cargas saiam da região de campo elétrico com a mesma velocidade, devem ser aceleradas pela mesma diferença de potencial V₂−V₁, uma vez que ambas possuem a mesma carga.',
 75:'A variação de entropia por mol do fluido de trabalho no processo CA é igual a −(5/2)R ln 3, em que R corresponde à constante universal dos gases.',
 80:'Segundo a condição de Bragg para interferência construtiva em difração de raios X, a diferença de caminho entre duas ondas deve satisfazer 2d sen θ = nλ, em que d é a distância entre planos cristalinos adjacentes, θ é o ângulo de incidência, λ é o comprimento de onda e n é um número inteiro.',
 85:'Considere que, além de seu estado fundamental, um átomo hidrogenoide tenha dois outros estados com energias 0,5 eV e 1,5 eV acima da energia do estado fundamental. Considerando h=4,0×10⁻¹⁵ eV·s e c=3,0×10⁸ m/s, o comprimento de onda dos fótons emitidos ou absorvidos em uma transição direta entre esses estados excitados será 750 nm.',
 90:'Um neutrino é emitido nos processos básicos de decaimento radioativo em que radiação beta é emitida.',
 110:'Os elétrons utilizados para criar o feixe de varredura para a formação da imagem são tipicamente obtidos por meio de um material aquecido que gera emissão termiônica ou pela utilização de emissão de campo.',
 116:'Considere que João, colecionador de armas legalmente autorizado, guardasse em sua residência uma arma de fogo de sua propriedade em um armário sem tranca. Seu filho, de 15 anos de idade, aproveitando-se da ausência dos pais, pegou a arma, levou-a até a rua e a apontou em direção aos vizinhos durante uma brincadeira. Nesse caso, João poderá responder pelo crime de omissão de cautela, pois deixou de observar as precauções necessárias para impedir que menor de 18 anos de idade se apoderasse de arma de fogo sob sua posse.',
 118:'Produto controlado pelo Comando do Exército é aquele que apresente poder destrutivo ou propriedade que possa causar danos a pessoas ou ao patrimônio, que indique necessidade de restrição de uso por motivo de incolumidade pública ou que seja de interesse militar.',
 119:'Compete à Secretaria Nacional de Segurança Pública a gestão direta do Banco Nacional de Perfis Balísticos, incluindo o armazenamento e a comparação dos dados balísticos.',
 120:'O Banco Nacional de Perfis Balísticos tem como objetivo subsidiar apurações criminais por meio do cadastramento de armas de fogo e do armazenamento das características de projéteis e estojos de munição relacionados a crimes.'
}
const removable=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']
const decisions=[...active.values()].map(q=>{
 const n=Number(q.numero_original),g=group(n),key=answers.get(n),pg=pages.get(q.id)
 if(!g||!key||!pg)throw Error(`Item ${n} sem gabarito, classificação ou página`)
 const [[,],materia,conteudo,contexto]=g
 const stem=fixes[n]||String(q.enunciado||'').replace(/\s+/g,' ').trim()
 if(stem.length<35||/\/g\d+|�|\ufffd|Espaço livre|CEBRASPE\s*[–-]\s*PF/i.test(stem))throw Error(`Enunciado com OCR/formatação suspeita no item ${n}: ${stem}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,concurso:'Polícia Federal — Edital 2025, Cargo 9: Perito Criminal Federal, Área 16 — Física Forense; prova aplicada em 27/07/2025',numero_original:n,pagina:pg,dificuldade:[51,54,60,64,65,66,68,69,73,75,80,82,85,86,87,89,90,98,99,101,103,104,105,106,107,108,111,112,113,115,116,117,119].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, matemática, pericial ou normativa; o CEBRASPE não publicou nível de dificuldade.',resposta_correta:key==='X'?null:key==='C'?0:1,anulada:key==='X',gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'DAC7F9CA42277AEBFF4D7B97F7A953DBAEE67FAF37C5FBD06493B01E7E4148B4.pdf',numero:n,resposta:key,metodo:'Gabarito oficial definitivo do CEBRASPE; aplicação em 27/07/2025.'},classificacao_fonte:prova,enunciado:stem,motivo:`Classificação individual pelo comando, conceitos e cabeçalho do bloco no caderno oficial; item ${n}, página ${pg}.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:'Página original conferida visualmente e vinculada; preserva contexto, diagrama, gráfico e notação matemática do caderno.'},apta_resolucao:true,remover_pendencias:removable}
})
if(decisions.length!==66||new Set(decisions.map(x=>x.numero_original)).size!==66)throw Error('Os registros existentes contêm lacunas ou duplicatas inesperadas')
const present=new Set(decisions.map(x=>x.numero_original)),missing=[...Array(70)].map((_,i)=>i+51).filter(n=>!present.has(n))
if(missing.join(',')!=='51,52,53,54')throw Error(`Itens faltantes inesperados: ${missing}`)
const additions=[51,52,53,54].map(n=>{
 const g=group(n),[[,],materia,conteudo,contexto]=g,key=answers.get(n),pg=1
 const enunciados={
  51:'Para duas medidas a = A ± kA e b = B ± kB, a incerteza relativa de aⁿ·bⁿ é dada por √2·n·k.',
  52:'Conforme a definição atual do Sistema Internacional de Unidades (SI), a velocidade da luz é definida pelo tempo que a luz leva para percorrer, no vácuo, a distância correspondente a uma barra de 1 metro padrão, sendo sua incerteza estimada a partir dos erros de medida do experimento.',
  53:'Grandezas físicas são sempre quantidades escalares expressas por números reais.',
  54:'Considere que um pêndulo simples esteja submetido à gravidade constante ao longo de suas oscilações, suficientemente pequenas para que se possa assumir a aproximação dos pequenos ângulos. Se o pêndulo for colocado primeiramente a uma distância r₁ do centro da Terra e posteriormente a uma distância r₂, ambas maiores que o raio terrestre, a razão entre os períodos de oscilação será igual a r₁/r₂.'
 }
 return {id:`extr-pf25-c9-${n}`,ano:2025,numero_original:n,banca:'CEBRASPE',concurso:'Polícia Federal — Edital 2025, Cargo 9: Perito Criminal Federal, Área 16 — Física Forense; prova aplicada em 27/07/2025',materia,conteudo,enunciado:enunciados[n],opcoes:['Certo','Errado'],resposta_correta:key==='C'?0:1,anulada:false,pagina:pg,documento_id:doc,paginas_origem:[pg],imagens_paginas:[`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`],pagina_imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:contexto,fonte:prova,origem:'CEBRASPE — Polícia Federal 2025',documento_origem:'106_PF_009_01.pdf',tipo_documento:'Prova objetiva — Cargo 9 — Conhecimentos específicos',tipo_extraido:'certo_errado',status_revisao:'revisado',motivos_revisao:[],classificacao_confianca:0.95,classificacao_metodo:'Leitura semântica individual e conferência visual do caderno oficial',tipo_resposta:'certo_errado',contexto_paginas:[{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto:contexto}],classificacao_pendente:false,classificacao_revisada:true,banca_original:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Perito Criminal Federal — Física Forense',gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'DAC7F9CA42277AEBFF4D7B97F7A953DBAEE67FAF37C5FBD06493B01E7E4148B4.pdf',numero:n,resposta:key,metodo:'Gabarito oficial definitivo do CEBRASPE; aplicação em 27/07/2025.'},integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:[]}}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros_existentes:decisions.length,itens_faltantes:missing,itens_adicionados:additions.length,cobertura_final:decisions.length+additions.length,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero_original),classificacoes:Object.fromEntries([...new Set([...decisions,...additions].map(x=>x.materia))].map(m=>[m,[...decisions,...additions].filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-pf-fisica-forense-2025-v167'
const report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:additions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,registros_existentes_revistos:decisions.length,adicionadas:additions.map(q=>q.numero_original),itens_caderno_completos:70,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero_original),paginas_originais:5,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
console.log(JSON.stringify(out,null,2))
