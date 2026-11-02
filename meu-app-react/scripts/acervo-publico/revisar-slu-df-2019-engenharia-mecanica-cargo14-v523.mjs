import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-slu-df-2019-engenharia-mecanica-cargo14-v523'
const doc='6659e1925079b821'
const prova='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/14_449_SLUDF_014_00_COM_JUST.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/14_GAB_DEFINITIVO_449_SLUDF_014_00_PAG_5.PDF'
const base='tmp/revisao-profissional/revisao-telebras-cargo11-duplicatas-antigas-v522/acervo-extraido'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(ps.length,72)

const classificacoes=[
 [[51,55],'Engenharia Mecânica','Ciência dos materiais: diagrama de equilíbrio ferro-carbono, eutético, eutetoide e microestruturas','Média'],
 [[56,60],'Engenharia Mecânica','Mecânica dos materiais: ensaio de tração, elasticidade, tenacidade, tensão verdadeira e critério de Tresca','Difícil'],
 [[61,65],'Engenharia Mecânica','Processos de fabricação: soldagem SMAW, TIG e GMAW, consumíveis e tensões residuais','Média'],
 [[66,69],'Engenharia Mecânica','Mecânica dos sólidos: equilíbrio, esforços internos, atrito, flexão e energia','Difícil'],
 [[70,70],'Engenharia Mecânica','Mecânica dos fluidos: quantidade de movimento e força em esteira transportadora','Média'],
 [[71,74],'Engenharia Mecânica','Mecânica dos fluidos: equação de Bernoulli, tubo de Pitot e número de Reynolds','Média'],
 [[75,79],'Engenharia Mecânica','Projeto mecânico: confiabilidade, tolerâncias, propriedades dos materiais e fator de segurança','Média'],
 [[80,85],'Engenharia Mecânica','Elementos de máquinas: parafusos, molas, engrenagens, mancais e rolamentos','Média'],
 [[86,89],'Engenharia Mecânica','Processos de fabricação: soldagem TIG, arco elétrico, segurança e alívio de tensões','Média'],
 [[90,93],'Engenharia Mecânica','Termodinâmica: ciclos de refrigeração, Brayton e Rankine','Média'],
 [[94,97],'Engenharia Mecânica','Sistemas pneumáticos e hidráulicos: umidade, válvulas, controle e pressão','Média'],
 [[98,99],'Engenharia Mecânica','Gestão de ativos: terotecnologia, ciclo de vida, disponibilidade e confiabilidade','Média'],
 [[100,107],'Engenharia Mecânica','Gestão da manutenção: MPT, MCC, manutenção preventiva, preditiva e confiabilidade','Média'],
 [[108,109],'Engenharia Mecânica','Gestão da qualidade e confiabilidade: FMEA e análise de causa raiz de falhas (RCFA)','Média'],
 [[110,111],'Administração','Gestão da qualidade e manutenção: programa 5S e custos de manutenção','Média'],
 [[112,112],'Legislação e Normas','Resíduos de serviços de saúde: acondicionamento segundo a ABNT NBR 13463:1995','Média'],
 [[113,114],'Segurança do Trabalho','Ergonomia: avaliação de riscos e movimentação manual de cargas','Média'],
 [[115,117],'Desenho Técnico','Sistemas CAD, AutoCAD e normas brasileiras de desenho técnico mecânico','Média'],
 [[118,119],'Engenharia Mecânica','Sistemas CAx, integração com BI e automação de tarefas no AutoCAD/AutoLISP','Média'],
 [[120,120],'Administração','Gestão de projetos: diagramas Gantt, PERT/CPM e redes de Petri','Média'],
]
const faixa=n=>{const f=classificacoes.find(([[a,b]])=>n>=a&&n<=b);assert.ok(f,`sem classificação para o item ${n}`);return f}
const porNumero=new Map()
for(const q of ps){const n=Number(q.numero),arr=porNumero.get(n)||[];arr.push(q);porNumero.set(n,arr)}
assert.equal(porNumero.size,67)
assert.deepEqual([...porNumero].filter(([,v])=>v.length>1).map(([n,v])=>[n,v.length]),[[51,2],[52,2],[53,2],[54,2],[55,2]])
const escolhida=new Map([...porNumero].map(([n,v])=>[n,[...v].sort((a,b)=>a.enunciado.length-b.enunciado.length)[0]]))
const duplicadas=[...porNumero].flatMap(([n,v])=>v.length<2?[]:v.filter(q=>q.id!==escolhida.get(n).id).map(q=>({q,canonica:escolhida.get(n)})))

const respostas={51:'C',52:'E',53:'E',54:'C',55:'E',56:'C',57:'E',58:'E',59:'E',60:'C',61:'C',62:'C',63:'E',64:'C',65:'E',66:'E',67:'E',68:'E',69:'E',70:'C',71:'C',72:'E',73:'E',74:'C',75:'C',76:'C',77:'E',78:'C',79:'C',80:'E',81:'E',82:'E',83:'E',84:'E',85:'C',86:'E',87:'C',88:'C',89:'E',90:'E',91:'C',92:'C',93:'C',94:'E',95:'C',96:'E',97:'C',98:'C',99:'E',100:'C',101:'E',102:'C',103:'E',104:'E',105:'X',106:'E',107:'C',108:'C',109:'E',110:'C',111:'E',112:'E',113:'C',114:'E',115:'C',116:'E',117:'E',118:'C',119:'E',120:'E'}
assert.equal(Object.keys(respostas).length,70)

const apoioMetais='As ligas de ferro (Fe) e carbono (C) são utilizadas na fabricação de equipamentos. Suas propriedades metalúrgicas e mecânicas dependem do teor de carbono e de outros elementos de liga e residuais. O diagrama de equilíbrio Fe–C para teores de carbono de até 6,7% representa a formação de cementita (Fe₃C); 2,11% corresponde à máxima solubilidade do carbono na austenita (fase γ) e separa, teoricamente, aços de ferros fundidos. No resfriamento lento, formam-se ferrita e/ou cementita e perlita. Consulte o diagrama Fe–C associado ao item para as fases e temperaturas.'
const apoioEnsaios='Materiais metálicos submetidos a tensões podem sofrer deformação plástica. O planejamento de processos de conformação requer o conhecimento das propriedades do material, caracterizadas por ensaios mecânicos, como o ensaio de tração simples, cujos resultados descrevem os regimes elástico e plástico.'
const apoioSoldagem='Julgue os itens sobre processos de soldagem, seus consumíveis, aplicações, limitações e efeitos sobre os materiais.'
const apoioFreio='A figura mostra um sistema de frenagem manual de tambor com R₂ = 50 cm. O atrito de Coulomb atua entre o tambor e uma sapata fixada no ponto C de uma barra articulada em A; μd = 0,8. A força P é aplicada em D. No tambor há um carretel de raio R₁ = 20 cm, cuja corda sustenta a massa B = 20 kg. As distâncias são LCD = 80 cm e LAC = 40 cm. O tambor tem massa MT = 60 kg e raio de giração k₀ = 40 cm. A figura do sistema está associada ao item.'
const apoioEsteira='Em uma usina de tratamento de lixo, uma esteira horizontal transporta resíduos sólidos leves triturados até um incinerador. A esteira move-se a ve = 2 m/s. O alimentador despeja os resíduos verticalmente a vr = 4 m/s, com vazão mássica de 250 kg/s; considere densidade ρ = 400 kg/m³ e atrito desprezível quando indicado. A figura mostra a esteira e o alimentador.'
const apoioFluidos='Para medir a vazão volumétrica de água em uma tubulação, usa-se um dispositivo semelhante a um tubo de Pitot. A tomada de pressão de estagnação fica alinhada ao escoamento, no centro do tubo circular; a tomada de pressão estática fica na parede, na mesma seção. Um manômetro de mercúrio mede a diferença entre as pressões. Considere ρH₂O = 1.000 kg/m³, ρHg = 13.600 kg/m³, νH₂O = 1 × 10⁻⁶ m²/s e g = 10 m/s². A figura apresenta a montagem do tubo de Pitot e do manômetro.'
const textosApoio=n=>{
 if(n>=51&&n<=55)return apoioMetais
 if(n>=56&&n<=60)return apoioEnsaios
 if(n>=61&&n<=65)return apoioSoldagem
 if(n>=66&&n<=69)return apoioFreio
 if(n===70)return apoioEsteira
 if(n===71||n===72||n===74)return apoioFluidos
 if(n>=75&&n<=79)return 'Julgue os itens sobre metodologia de projeto, dimensionamento de componentes mecânicos, propriedades dos materiais, confiabilidade e fator de segurança.'
 if(n>=80&&n<=85)return 'Julgue os itens relativos a elementos de máquinas.'
 if(n>=86&&n<=89)return 'Julgue os itens sobre processos de soldagem.'
 if(n>=90&&n<=93)return 'Julgue os itens a respeito de ciclos termodinâmicos.'
 if(n>=94&&n<=97)return 'Julgue os itens sobre características de sistemas de automação hidráulicos e pneumáticos.'
 if(n>=98&&n<=99)return 'Julgue os itens relativos à terotecnologia e à gestão do ciclo de vida de equipamentos.'
 if(n>=100&&n<=104)return 'Julgue os itens relativos à manutenção e à sua gestão estratégica.'
 if(n>=105&&n<=107)return 'Julgue os itens sobre manutenção centrada na confiabilidade (MCC) e manutenção produtiva total (MPT).'
 if(n>=108&&n<=109)return 'Julgue os itens sobre análise de causa raiz de falhas (RCFA) e análise de modos e efeitos de falhas (FMEA).'
 if(n===110)return 'Julgue o item a respeito do programa 5S.'
 if(n===111)return 'Julgue o item relativo à organização dos serviços e à contabilidade de custos de manutenção.'
 if(n===112)return 'Considere a ABNT NBR 13463:1995, citada no item, sobre acondicionamento de resíduos de serviços de saúde.'
 if(n===113||n===114)return 'Julgue os itens relativos à ergonomia, aos riscos e à movimentação manual de cargas.'
 if(n>=115&&n<=117)return 'Julgue os itens sobre sistemas CAD e normas brasileiras de desenho técnico.'
 if(n===118||n===119)return 'Julgue os itens sobre sistemas CAD/CAx, integração de dados industriais e automação de projetos no AutoCAD.'
 return 'Julgue o item relativo a ferramentas e métodos de gestão de projetos.'
}
const correcoes={
 51:'A liga eutética corresponde a um teor de 4,3% de carbono no composto binário Fe–C.',
 52:'Aços hipoeutetoides apresentam teor de carbono superior a 0,77%.',
 53:'O carbono tem alta solubilidade no retículo cristalino do ferro, tanto na fase γ quanto na fase α.',
 54:'Uma liga com teor de carbono abaixo de 0,77%, ao ser resfriada lentamente até a temperatura ambiente, a partir de uma temperatura em que somente a fase γ exista, forma uma estrutura composta de ferrita e perlita.',
 55:'Após resfriamento lento desde a fase γ até a temperatura ambiente, as ligas Fe–C com teor de carbono entre 0,77% e 2,11% apresentam ferrita pura em sua microestrutura (fora da estrutura perlítica).',
 60:'Na relação entre tensão verdadeira (σ) e deformação verdadeira (ε) representativa do comportamento mecânico de um material elasto-plástico encruável, σ = Kεⁿ, obtida a partir dos resultados de um ensaio de tração simples, o coeficiente de resistência K corresponde à tensão verdadeira necessária para produzir deformação verdadeira unitária.',
 61:'Nos reparos de grandes estruturas por soldagem, o martelamento do metal depositado e de suas adjacências, durante ou após a soldagem, é um procedimento indicado para reduzir as tensões residuais, mas é inadequado para materiais de baixa ductilidade.',
 67:'Se a barra AD tiver perfil retangular uniforme, com face de 2 cm junto à sapata e a outra face de 4 cm, e for aplicada em D uma carga P = 100 N, a tensão máxima ocorrerá na vizinhança de C, no trecho AC, e será superior a 50 MPa.',
  73:'Admitindo-se que, na situação apresentada, a velocidade de escoamento da água dentro do tubo cilíndrico, medida por meio de um tubo de Pitot localizado no centro do tubo, seja de 2 m/s, então, se o tubo tiver 1 m de diâmetro, o escoamento será considerado laminar.',
  92:'Um sistema de expansão indireta dispõe de torres de resfriamento a água ou ar para condensação do gás refrigerante e produz água fria para trocadores de calor.',
  93:'A figura apresentada ilustra um ciclo de Rankine cujo trabalho é representado pela área 1–2–2′–3–4–1.',
  95:'O símbolo apresentado representa uma válvula direcional de três posições e quatro vias, com acionamento manual.'
}
const limpar=s=>String(s||'').replace(/JUSTIFICATIVA\s*[-–].*$/is,'').replace(/CEBRASPE\s*[–-]\s*SLUDF\s*[–-]\s*Aplica(?:ção|c|çã)o:?\s*2019.*$/is,'').replace(/Espaço livre.*$/is,'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim()

const decisoes=[]
for(const [n,v] of [...escolhida].sort((a,b)=>a[0]-b[0])){
 const q=v,g=faixa(n),resposta=respostas[n]
 assert.ok(resposta,`gabarito oficial ausente para ${n}`)
 let enunciado=correcoes[n]||limpar(q.enunciado)
 assert.ok(enunciado.length>25,`enunciado curto ${n}`)
 if(n===105)assert.equal(resposta,'X')
 const dificuldade=g[3]
 decisoes.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g[1],conteudo:g[2],ano:2019,
  concurso:'Concurso público do Serviço de Limpeza Urbana do Distrito Federal (SLU/DF) — Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica (Cargo 14)',
  banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'19/05/2019',cargo:'Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica (Cargo 14)',
  numero_original:n,pagina:q.pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada no conhecimento técnico e no raciocínio exigidos; a banca não publicou nível de dificuldade por item.',
  classificacao_fonte:prova,
  motivo:`Aplicação, cargo e número do item conferidos no caderno oficial do CEBRASPE; a classificação de matéria e conteúdo foi feita pelo tema efetivamente cobrado e pelo programa do Cargo 14. Gabarito definitivo conferido na fonte oficial. Dificuldade estimada editorialmente.`,
  enunciado,texto_apoio:textosApoio(n),apoio:[],opcoes:['Certo','Errado'],resposta_correta:resposta==='C'?0:resposta==='E'?1:null,
  anulada:resposta==='X',
  gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabaritos oficiais definitivos — aplicação de 19/05/2019 — Cargo 14',item:n,resposta,fonte:'CEBRASPE'},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','gabarito_oficial_nao_vinculado','banca_nao_identificada']
 })
}
// Os itens 73, 92 e 93 já estavam no banco, fora da fila de pendências; foram
// encontrados na varredura integral do documento e também precisavam do gabarito,
// do texto limpo e do conteúdo específico.
const bases=[base,...raizesAtuais]
const mBase=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const loteBase=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(mBase.lotes[894].arquivo,bases)))
for(const n of [73,92,93]){
 const q=loteBase.find(x=>x.documento_id===doc&&Number(x.numero_original??x.numero)===n)
 assert.ok(q,`registro existente ${n}`)
 const g=faixa(n),resposta=respostas[n]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g[1],conteudo:g[2],ano:2019,concurso:'Concurso público do Serviço de Limpeza Urbana do Distrito Federal (SLU/DF) — Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica (Cargo 14)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'19/05/2019',cargo:'Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica (Cargo 14)',numero_original:n,pagina:q.pagina,dificuldade:g[3],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no conhecimento técnico e no raciocínio exigidos; a banca não publicou nível de dificuldade por item.',classificacao_fonte:prova,motivo:'Item localizado na varredura integral do caderno oficial, classificado pelo tema específico e conferido com o gabarito definitivo do CEBRASPE.',enunciado:correcoes[n],texto_apoio:textosApoio(n),apoio:[],opcoes:['Certo','Errado'],resposta_correta:resposta==='C'?0:1,anulada:false,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabaritos oficiais definitivos — aplicação de 19/05/2019 — Cargo 14',item:n,resposta,fonte:'CEBRASPE'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','gabarito_oficial_nao_vinculado','banca_nao_identificada']})
}
for(const {q,canonica} of duplicadas){
 const n=Number(q.numero),g=faixa(n)
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g[1],conteudo:g[2],ano:2019,concurso:'Concurso público do Serviço de Limpeza Urbana do Distrito Federal (SLU/DF) — Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica (Cargo 14)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'19/05/2019',cargo:'Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica (Cargo 14)',numero_original:n,pagina:q.pagina,dificuldade:g[3],dificuldade_estimada:true,classificacao_fonte:prova,motivo:'Captura repetida do mesmo número do item no mesmo caderno. A captura mais limpa e completa foi preservada como canônica.',enunciado:limpar(q.enunciado),texto_apoio:'',apoio:[],opcoes:['Certo','Errado'],resposta_correta:null,apta_resolucao:false,inelegibilidade_motivo:'captura_duplicada_no_mesmo_caderno',duplicada_de:canonica.id})
}
assert.equal(decisoes.length,75)
assert.equal(decisoes.filter(x=>x.apta_resolucao!==false).length,70)
const r=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,edital:'https://cdn.cebraspe.org.br/concursos/SLU_DF_19/arquivos/ED_1_SLU_DF__ABT.PDF',cargo:'Cargo 14: Analista de Gestão de Resíduos Sólidos — Especialidade: Engenharia Mecânica',aplicacao:'19/05/2019',nota:'Os itens 73, 92 e 93 já existiam e foram classificados no lugar; nenhuma cópia foi adicionada. As capturas repetidas dos itens 51 a 55 foram marcadas como duplicatas. O item 67 tem gabarito definitivo Errado após alteração; o 105 foi anulado.'},null,2))
console.log(JSON.stringify({...r,duplicatas:duplicadas.length,questoes_encontradas_fora_da_fila:[73,92,93],anuladas:1,fonte_gabarito:gabarito}))
