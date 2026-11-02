import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='2d785ed1a2b3b451'
const prova='https://cdn.cebraspe.org.br/concursos/CPNUJE_24/arquivos/988_CPNUJE_007_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cpnuje_24/arquivos/GAB_DEFINITIVO_988_CPNUJE_007_01.PDF'
const concurso='CPNUJE/TSE 2024 — Cargo 7: Analista Judiciário, Apoio Especializado, Engenharia Civil'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==65||catalog.url.toLowerCase()!==prova.toLowerCase())throw Error('Caderno oficial do Cargo 7 diverge do catálogo esperado')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-cnj-judiciaria-2024-v248'))
if(start<0)throw Error('Base v248 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==65)throw Error(`Esperados 65 recortes OCR do Cargo 7; encontrados ${active.size}`)

const topics=new Map([
 [51,['Engenharia Civil','Segurança do trabalho e planejamento de escavações: solo, cargas, riscos e prevenção']],
 [52,['Engenharia Civil','Estruturas de madeira: ligações com cavilhas em coberturas']],
 [53,['Engenharia Civil','Fundações superficiais: emprego e condições de uso de radier']],
 [54,['Engenharia Civil','Alvenaria não estrutural: juntas a prumo e armaduras de assentamento']],
 [55,['Engenharia Civil','Impermeabilização de vigas baldrames e instalações prediais de esgoto']],
 [56,['Engenharia Civil','Instalações prediais de esgoto sanitário: ventilação']],
 [57,['Engenharia Civil','Instalações prediais: dimensionamento e traçado de tubulações de drenagem']],
 [58,['Engenharia Civil','Materiais de construção: inchamento da areia']],
 [59,['Engenharia Civil','Materiais de construção: pega e endurecimento do cimento']],
 [60,['Engenharia Civil','Geotecnia: solo grampeado e estabilização de taludes']],
 [61,['Engenharia Civil','Fundações profundas: execução de estacas escavadas com trado']],
 [62,['Engenharia Civil','Mecânica dos solos: resistência ao cisalhamento']],
 [63,['Engenharia Civil','Análise estrutural: reações de apoio em vigas']],
 [64,['Engenharia Civil','Análise estrutural: estruturas hiperestáticas']],
 [65,['Engenharia Civil','Concreto protendido: armaduras pré-tracionadas e pós-tracionadas']],
 [66,['Engenharia Civil','Concreto armado: detalhamento e armadura de lajes']],
 [67,['Engenharia Civil','Patologia das construções: reação álcali-agregado']],
 [68,['Engenharia Civil','Avaliação de imóveis: método da renda']],
 [69,['Engenharia Civil','Patologia das construções: fissuração em alvenarias']],
 [70,['Engenharia Civil','Engenharia de avaliações: depreciação de edificações']],
 [71,['Engenharia Ambiental','Licenciamento ambiental de empreendimentos: licença prévia']],
 [72,['Engenharia Civil','Orçamentação de obras: composições de custos']],
 [73,['Engenharia Civil','Projeto de edificações: etapas e conteúdo do projeto arquitetônico']],
 [74,['Engenharia Civil','Obras públicas: recebimento definitivo e responsabilidade técnica do projetista']],
 [75,['Administração Pública','Contratos de obras públicas: critérios de medição e pagamento']],
 [76,['Administração Pública','Contratação integrada e semi-integrada de obras e serviços de engenharia']],
 [77,['Administração Pública','Licitações de obras: qualificação técnica e capacidade operacional']],
 [78,['Engenharia Civil','Fundações: tubulões a ar comprimido e segurança na execução']],
 [79,['Administração Pública','Licitações: diálogo competitivo e hipóteses de cabimento']],
 [80,['Administração Pública','Contratos administrativos: sobrepreço e superfaturamento']],
 [81,['Engenharia Civil','Projeto executivo de obra: elementos e nível de detalhamento']],
 [82,['Administração Pública','Contratação integrada: desenvolvimento e responsabilidade pelos projetos']],
 [83,['Engenharia Civil','Orçamento de obras: orçamento sintético']],
 [84,['Engenharia Civil','Orçamento de obras: composição analítica de custos unitários']],
 [85,['Engenharia Civil','Orçamentação: curva ABC de insumos e serviços']],
 [86,['Engenharia Civil','Orçamento de obras: encargos sociais e trabalhistas']],
 [87,['Engenharia Civil','Orçamento de obras: cálculo e componentes do BDI']],
 [88,['Engenharia Civil','Referenciais de custos de obras: séries e composição do SINAPI']],
 [89,['Engenharia Civil','Orçamentação: aplicação de índices de atualização de custos']],
 [90,['Engenharia Civil','Planejamento de obras: elaboração e atualização de cronogramas em software']],
 [91,['Engenharia Civil','Gestão da qualidade em obras: atribuições e controle de qualidade']],
 [92,['Engenharia Civil','Gerenciamento de projetos: valor agregado e medição de desempenho']],
 [93,['Engenharia Civil','Planejamento e controle de obras: cronograma físico-financeiro']],
 [94,['Engenharia Civil','Planejamento de obras: alocação de recursos e programação']],
 [95,['Engenharia Civil','Planejamento de obras: diagramas de Gantt']],
 [96,['Engenharia Civil','Planejamento de obras: método do caminho crítico (CPM)']],
 [97,['Engenharia Civil','Planejamento de obras: método PERT e estimativa de duração']],
 [98,['Engenharia Civil','Fiscalização e medição de obras: documentação comprobatória']],
 [99,['Engenharia Civil','Fiscalização de obras: medição, avanço físico e pagamento']],
 [100,['Engenharia Civil','Medição de obras e serviços: atribuições e responsabilidade profissional']],
 [101,['Engenharia Civil','Gestão de contratos: medição e prevenção de antecipação ou atraso de pagamentos']],
 [102,['Engenharia Civil','Fiscalização e controle de qualidade: inspeção visual de serviços estruturais']],
 [103,['Engenharia Civil','Gestão de obras: comunicação e coordenação entre equipes']],
 [104,['Engenharia Civil','Gestão de contratos: conferência documental de faturas de obra']],
 [105,['Engenharia Civil','Gestão de contratos: automação do fluxo de faturas e pagamentos']],
 [106,['Engenharia Civil','Fiscalização de obras: diário de obra, registros e assinatura do responsável técnico']],
 [107,['Engenharia Civil','Fiscalização de obras: segurança do trabalho e autoridade para interromper serviços']],
 [108,['Engenharia Civil','Instalações prediais de esgoto sanitário: ABNT NBR 8160 e separação de sistemas']],
 [109,['Engenharia Civil','Estruturas de concreto: requisitos de projeto e execução da ABNT NBR 14931']],
 [110,['Engenharia Civil','Acessibilidade em edificações: sanitários acessíveis conforme ABNT NBR 9050']],
 [111,['Engenharia Civil','Acessibilidade: tecnologia assistiva, autonomia e inclusão em espaços públicos']],
 [112,['Engenharia Civil','Acessibilidade: sinalização, informação e princípio dos dois sentidos']],
 [113,['Administração Pública','Estrutura organizacional: departamentalização funcional e conflitos entre áreas']],
 [114,['Administração Pública','Processo decisório: dimensão racional do planejamento estratégico']],
 [115,['Administração','Comportamento organizacional: teoria da expectativa, valência e instrumentalidade']],
 [116,['Administração','Comportamento organizacional: melhoria contínua e inconformismo construtivo']],
 [117,['Administração','Inteligência emocional: autogestão, tolerância à frustração e controle emocional']],
 [118,['Administração','Comportamento organizacional: viés de autoconveniência e atribuição de resultados']],
 [119,['Administração Pública','Gestão de conflitos: abordagem estrutural e colaboração entre as partes']],
 [120,['Administração Pública','Gestão de conflitos: estilo de transigência e equilíbrio de interesses']],
])
if(topics.size!==70)throw Error(`Classificação incompleta: ${topics.size}/70`)
const answers=['C','X','E','E','C','C','E','C','E','C','E','C','E','E','C','E','E','C','E','C','E','C','E','C','E','E','E','C','C','E','C','E','E','C','C','E','E','C','E','C','E','C','E','E','C','E','C','E','C','E','C','E','C','E','C','E','C','C','E','E','C','C','E','E','C','C','C','E','E','C']
if(answers.length!==70)throw Error('Gabarito oficial deve cobrir os itens 51–120')
const answerMap=new Map(answers.map((x,i)=>[i+51,x])),keyDigest=hashRevisao(answers.join(''))
const byNumber=new Map()
for(const e of catalog.questoes){const a=byNumber.get(Number(e.numero))||[];a.push(e);byNumber.set(Number(e.numero),a)}
if(byNumber.size!==65||[...byNumber.keys()].some(n=>n<51||n>120))throw Error('Numeração OCR divergente')
let decisions=[...active.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!page||!topics.has(n))throw Error(`Registro sem matéria, número ou página oficial: ${q.id}`)
 const k=answerMap.get(n),anulada=k==='X',materia=topics.get(n)[0],conteudo=topics.get(n)[1],image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 for(const p of e.paginas||[page])if(!catalog.questoes.some(x=>x.pagina===p))throw Error(`Página contextual ausente no catálogo: ${p}`)
 const context=(e.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua do caderno oficial, vinculada para preservar comando ou contexto compartilhado.'}))
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,concurso,numero_original:n,pagina:page,dificuldade:[51,60,62,64,65,67,68,74,76,77,79,80,82,85,87,88,92,96,97,100,108,109,110,112].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no domínio técnico, integração de conceitos e interpretação exigidos pelo item; a banca não publica dificuldade individual.',resposta_correta:anulada?null:k==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência oficial definitiva de respostas dos itens 51–120; X identifica item anulado.'},classificacao_fonte:prova,motivo:`Cebraspe/CPNUJE-TSE 2024, Cargo 7, Engenharia Civil. Item ${n}, página ${page}; conteúdo individualizado conforme o enunciado e o contexto do caderno. Gabarito definitivo oficial conferido.`,visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Página do caderno oficial vinculada para manter a conferência visual do texto, símbolos e elementos do item.'},...(context.length?{imagens_contexto:context}:{}),...(anulada?{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']})}
})
const missing=[
 [113,'A departamentalização funcional potencializa o surgimento de atrito entre os colaboradores do departamento, o que é considerado uma desvantagem em relação a outros tipos de departamentalização.'],
 [115,'A teoria comportamental da expectativa está baseada em três construtos básicos: a valência, a expectativa e a instrumentalidade.'],
 [117,'No campo da inteligência emocional, a autogestão correlaciona-se com o desenvolvimento de maior tolerância à frustração, bem como com o controle da raiva e de possíveis comportamentos agressivos.'],
 [118,'O viés de autoconveniência ocorre, por exemplo, quando o colaborador atribui a si mesmo tanto os sucessos e os acertos quanto os erros e as falhas do trabalho.'],
 [119,'A abordagem estrutural no gerenciamento de conflitos abarca as fases de desativação, confrontação direta e colaboração entre as partes envolvidas.'],
]
let additions=missing.map(([n,enunciado])=>{const k=answerMap.get(n),page=3,image=`paginas/${doc}-0003.webp`,[materia,conteudo]=topics.get(n);return {id:`extr-cpnuje24-cargo7-q${n}`,ano:2024,banca:'CEBRASPE',banca_original:'CEBRASPE',organizadora:'CEBRASPE',concurso,aplicacao:concurso,numero_original:n,pagina:page,documento_id:doc,materia,conteudo,enunciado,opcoes:['Certo','Errado'],resposta_correta:k==='C'?0:1,origem:'Cebraspe — CPNUJE/TSE, Cargo 7, Analista Judiciário — Engenharia Civil',fonte:prova,documento_origem:catalog.arquivo,tipo_documento:'Prova objetiva — conhecimentos específicos',tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.99,classificacao_metodo:'Transcrição conferida diretamente na imagem da página oficial; matéria e conteúdo classificados individualmente pelo enunciado',classificacao_evidencia:`Item ${n}, página 3 do caderno oficial; cargo, aplicação e gabarito definitivo confirmados pela banca.`,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; a banca não publica nível individual por item.',gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência oficial definitiva de respostas dos itens 51–120; X identifica item anulado.'},pagina_imagem:image,imagens_paginas:[image],paginas_origem:[page],contexto_paginas:[{pagina:page,imagem:image}],integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]}}})
for(const page of new Set([...decisions.map(x=>x.visual.pagina),3]))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
const addTexts=new Map(additions.map(q=>[norm(q.enunciado),q]))
const existingDuplicateIds=[]
for await(const {questoes} of lotesAtuais(bases))for(const q of questoes){const candidate=addTexts.get(norm(q.enunciado));if(!candidate)continue;const n=candidate.numero_original,k=answerMap.get(n),[materia,conteudo]=topics.get(n);existingDuplicateIds.push({numero:n,id:q.id});decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,resposta_correta:k==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência oficial definitiva de respostas dos itens 51–120; X identifica item anulado.'},classificacao_fonte:prova,motivo:`Item ${n} do Cargo 7 já existia no acervo em outro caderno da mesma aplicação. Registro existente reaproveitado para evitar duplicata; classificação específica e gabarito definitivo conferidos.`});addTexts.delete(norm(q.enunciado))}
additions=[...addTexts.values()]
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,recortesOCR:65,questoesRecuperadas:additions.length,duplicatasReaproveitadas:existingDuplicateIds,questoesCobertas:70,novasClassificacoes:decisions.filter(x=>{const q=active.get(x.id);return q?.classificacao_pendente&&!q?.classificacao_revisada}).length,anuladas:decisions.filter(x=>x.anulada).length,gabarito:'70 itens do definitivo oficial',materias:[...new Set([...decisions.map(x=>x.materia),...additions.map(x=>x.materia)])],fonte:prova,gabaritoFonte:gabarito},null,2));process.exit(0)}
const name='revisao-cpnuje-cargo7-engenharia-civil-2024-v249'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:additions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,recortesOCR:65,questoesRecuperadas:additions.length,duplicatasReaproveitadas:existingDuplicateIds,questoesUnicasFinais:70,anuladas:decisions.filter(x=>x.anulada).length+additions.filter(x=>x.anulada).length,gabaritoOficial:'70/70 itens definitivos cobertos',fonte:prova,gabaritoFonte:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CPNUJE/TSE 2024 — Cargo 7: Engenharia Civil — v249\n\n- Classifiquei individualmente os 65 recortes disponíveis em Engenharia Civil, Engenharia Ambiental, Administração Pública e Administração, com assunto específico por item, aplicação, ano, dificuldade estimada e página visual de origem.\n- Conferi o caderno oficial: itens 51–120. Cinco itens (113, 115, 117, 118 e 119) estavam ausentes dos recortes. Quatro foram localizados em outros cadernos já presentes e reaproveitados sem duplicar; o item 115 foi transcrito da imagem oficial da página 3.\n- Vinculei as 70 respostas do gabarito definitivo oficial, incluindo a anulação do item 52, que ficou sem correção automática.\n- Validação local: ${result.classificadas} registros revisados, ${result.adicionadas} item novo, quatro registros duplicados reaproveitados, ${result.contextos_visuais} referências de página, ${result.total} registros, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, ainda não publicada na nuvem.\n- Fontes: [caderno oficial](https://cdn.cebraspe.org.br/concursos/CPNUJE_24/arquivos/988_CPNUJE_007_01.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/cpnuje_24/arquivos/GAB_DEFINITIVO_988_CPNUJE_007_01.PDF), [página do concurso](https://www.cebraspe.org.br/concursos/CPNUJE_24).\n`)
console.log(JSON.stringify(out,null,2))
