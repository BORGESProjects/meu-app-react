import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const nome='revisao-ansa-2026-enfase25-mecanica-v538',doc='7d80f673a53954a0'
const base='tmp/revisao-profissional/revisao-fub-2020-psicologia-clinica-v537/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/ansa_26/arquivos/62D8A646857E67DB77182507ACB7A4BA6246760191714AEEB3CF405B2BC56231.pdf'
const edital='https://cdn.cebraspe.org.br/concursos/ANSA_26/arquivos/3969A00660D0B4D434998AC83CDA12E570D28CC2D67C47C6FDF6C58697C33FB1.html'
const pagina='https://www.cebraspe.org.br/concursos/ansa_26'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)
const classification=[
 [[31,34],'Soldagem','Soldagem por fusão: posições, simbologia e processos TIG/MIG-MAG'],
 [[35,41],'Caldeiras e Equipamentos Térmicos','Caldeiras flamotubulares: operação, segurança, fornalhas e inspeções'],
 [[42,45],'Máquinas de Fluxo','Bombas industriais, compressores e turbinas: princípios e rendimento'],
 [[46,48],'Tubulações Industriais','Válvulas, materiais de tubos e filtros de linha'],
 [[49,53],'Processos de Fabricação','Trefilação, retificação, metalurgia do pó, fundição e forjamento'],
 [[54,58],'Metrologia','Precisão, exatidão, erro fiducial, incerteza e rastreabilidade'],
 [[59,62],'Metrologia','Relógios comparadores: medição, histerese e procedimento de calibração'],
 [[63,68],'Elementos de Máquinas','Engrenagens, transmissões por correias, roscas e juntas parafusadas'],
 [[69,70],'Mecânica Técnica','Equilíbrio estático e reações em vigas simplesmente apoiadas'],
 [[71,75],'Resistência dos Materiais','Diagrama tensão × deformação, elasticidade, ductilidade e estricção'],
 [[76,79],'Sistemas Hidráulicos e Pneumáticos','Perdas de energia, controle de vazão, contaminação e falhas em circuitos'],
 [[80,82],'Ensaios Não Destrutivos','Inspeção de soldas, ensaios mecânicos e líquido penetrante'],
 [[83,88],'Materiais e Corrosão','Corrosão galvânica, proteção anticorrosiva e preparação de superfície'],
 [[89,92],'Segurança do Trabalho e Meio Ambiente','Gerenciamento de riscos, controle de ignição e destinação de resíduos'],
 [[93,97],'Eletrotécnica','Motores de indução trifásicos, partida, rotação, potência e SI'],
 [[98,100],'Desenho Técnico','Leitura de desenho mecânico, cotagem, rugosidade e simbologia de soldagem']
]
const contextos=[
 [[31,34],'Julgue os itens sobre processos de fabricação por soldagem, conforme o caderno oficial.'],
 [[35,41],'Julgue os itens relativos a equipamentos de caldeiraria e às características de caldeiras flamotubulares.'],
 [[42,45],'Julgue os itens sobre bombas industriais, compressores e turbinas.'],[[46,48],'Considerando tubulações industriais, julgue os itens.'],
 [[49,53],'Julgue os itens relativos a processos de fabricação.'],[[54,58],'Julgue os itens de metrologia.'],
 [[59,62],'Considerando relógios comparadores e sua calibração, julgue os itens.'],[[63,68],'Julgue os itens relativos a elementos de máquinas.'],
 [[69,70],'Considerando princípios de mecânica técnica, julgue os itens.'],
 [[71,75],'Acerca dos conceitos de resistência dos materiais, observe a figura da página da prova e julgue os itens.'],
 [[76,79],'Durante o comissionamento de uma máquina de embalagem, observaram-se movimentos irregulares e aquecimento do óleo no circuito hidráulico, além de falhas em atuadores pneumáticos com água na linha de ar comprimido. Julgue as assertivas sobre essa situação.'],
 [[80,82],'Durante a montagem de tubulação industrial, avaliou-se a integridade de juntas soldadas e a conformidade mecânica de chapas e suportes. Julgue os itens sobre inspeção e ensaios.'],
 [[83,88],'Na montagem de estrutura metálica em ambiente úmido e com exposição eventual a agentes químicos, foram observadas corrosão inicial e falhas de aderência da pintura. Julgue as assertivas.'],
 [[89,92],'Considerando atividade industrial de montagem com esmerilhadeira, extensão elétrica provisória, inflamáveis e geração de resíduos, julgue os itens sobre segurança e meio ambiente.'],
 [[93,97],'Considerando a instalação de motor de indução trifásico de quatro polos alimentado em 60 Hz, julgue os itens de eletrotécnica.'],
 [[98,100],'Considerando o desenho técnico mecânico apresentado na página original associada, julgue os itens sobre cotagem, rugosidade e simbologia de soldagem.']
]
const get=(arr,n)=>arr.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const duplicate='extr-d5ff4b01f40418e6340c',canonical='extr-c106e2f6d32890ba8701'
const decisions=[]
for(const q of raw){
 const n=+q.numero,[materia,conteudo]=get(classification,n)||[],texto=get(contextos,n),isDuplicate=q.id===duplicate
 assert.ok(materia&&conteudo&&texto,`Classificação ausente: ${n}`)
 let enunciado=q.enunciado.replace(/\s*(?:CEBRASPE\s*[–-]\s*ANSA\s*[–-]\s*Edital:\s*2025|Espaço livre)[\s\S]*$/,'').replace(/\s+/g,' ').trim()
 // O item 32 duplicado apresenta apenas normalização OCR diferente; conservar uma ocorrência canônica.
 if(isDuplicate)enunciado=raw.find(x=>x.id===canonical).enunciado.replace(/\s+/g,' ').trim()
 assert.ok(enunciado.length>25,`Enunciado insuficiente: ${n}/${q.id}`)
 const page=+q.pagina,img=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const dificuldade=(n===33||n>=59&&n<=62||n>=69&&n<=75||n>=98)?'Difícil':'Média'
 const motivo=isDuplicate?`Duplicata OCR do item 32, com a mesma proposição da ocorrência canônica ${canonical}; excluída da resolução para evitar repetição.`:`Item ${n} identificado no caderno oficial da ANSA, Ênfase 25 — Projetos, Construção e Montagem – Mecânica. Classificação individual pelo conteúdo técnico expresso no item e no contexto da prova.`
 const meta={materia,conteudo,ano:2026,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Araucária Nitrogenados S.A. (ANSA) — processo seletivo público — edital 2025',cargo:'Ênfase 25 — Projetos, Construção e Montagem – Mecânica (nível médio)',aplicacao:'26/04/2026',numero_original:n,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela aplicação de princípios de engenharia mecânica, leitura de diagramas ou procedimentos técnicos; a banca não publica nível individual.',classificacao_fonte:prova,motivo,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],texto_apoio:texto,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...meta,enunciado,pagina:+q.pagina,visual:{pagina:+q.pagina,imagem:img,motivo:n===33||n>=71&&n<=75||n>=98?'Imagem da página original preservada para consulta do gráfico/diagrama e dos detalhes visuais.':'Página correspondente do caderno oficial preservada para conferir contexto e formatação.'},apta_resolucao:!isDuplicate,correcao_automatica:false,...(isDuplicate?{inelegibilidade_motivo:'duplicata_ocr_item_32',duplicada_de:canonical}:{})})
}
assert.equal(decisions.length,71)
assert.deepEqual(decisions.filter(x=>x.id===duplicate).map(x=>x.duplicada_de),[canonical])
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,edital,pagina,concurso:'ANSA — Ênfase 25 — Projetos, Construção e Montagem – Mecânica',edital_publicado:'2025',aplicacao:'26/04/2026',nota:'71 registros analisados; itens 31–100 classificados por disciplina e conteúdo. Havia uma cópia OCR do item 32, que foi tornada inelegível, mantendo-se a ocorrência íntegra. O gráfico de tensão × deformação e o desenho técnico foram mantidos por meio das imagens originais associadas. O Cebraspe disponibiliza gabaritos definitivos das ênfases de engenharia apenas em consulta individual; por isso não foi inferida resposta nem habilitada correção automática neste pacote.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_revisados:71,itens_classificados:70,duplicatas_excluidas:1,gabarito_publico_disponivel:false,prova_oficial:prova,aplicacao:'26/04/2026'}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)

