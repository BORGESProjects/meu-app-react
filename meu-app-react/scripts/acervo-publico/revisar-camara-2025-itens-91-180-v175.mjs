import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='2f89bd2efbbe4c8e'
const prova='https://cdn.cebraspe.org.br/concursos/CD_25_NS/arquivos/B2488E2CFFA8DFA75CFAE86B83860AACDF488497CC3A9C4E33E11FF7121A8490.pdf'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==91)throw Error('Catálogo da prova da Câmara dos Deputados diverge')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-enem-2025-dia1-caderno9-v174'))
if(start<0)throw Error('Base v174 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==91)throw Error(`Esperados 91 registros deste caderno, encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const topics=new Map([
 [91,['Direito Constitucional','Regimento parlamentar: requisitos de criação e manutenção de bloco partidário']],
 [92,['Direito Constitucional','Regimento parlamentar: efeitos da formação de bloco sobre as lideranças partidárias']],
 [93,['Direito Constitucional','Regimento parlamentar: duração dos blocos parlamentares e encerramento da legislatura']],
 [94,['Direito Constitucional','Regimento Interno da Câmara: competência presidencial para organização da pauta']],
 [95,['Direito Constitucional','Processo legislativo: promulgação de emenda constitucional']],
 [96,['Direito Constitucional','Regimento da Câmara: manutenção da ordem e atribuições da Mesa Diretora']],
 [97,['Direito Constitucional','Regimento parlamentar: composição partidária e distribuição de vagas nas comissões']],
 [98,['Direito Constitucional','Regimento parlamentar: agenda de proposições e atribuições da Presidência']],
 [99,['Direito Constitucional','Poder Legislativo: fiscalização e controle de entidades da administração federal']],
 [100,['Direito Constitucional','Poder Legislativo: convocação de ministros e pedidos de informação por comissão']],
 [101,['Direito Constitucional','Controle parlamentar: sustação de atos normativos do Poder Executivo']],
 [102,['Direito Constitucional','Processo decisório no Congresso: votação simbólica e orientação de bancada']],
 [103,['Direito Constitucional','Congresso Nacional: publicidade e hipóteses de sessão secreta']],
 [104,['Direito Constitucional','Ética parlamentar: conflito de interesses e decoro no exercício do mandato']],
 [105,['Direito Constitucional','Ética parlamentar: sigilo de debates e deveres dos membros de comissão']],
 [106,['Direito Constitucional','Comissão parlamentar de inquérito: legitimidade recursal e habeas corpus']],
 [107,['Direito Constitucional','Regime previdenciário de servidores: aposentadoria especial em atividade de risco']],
 [108,['Direito Constitucional','Segurança pública: natureza jurídica das funções de polícia judiciária']],
 [109,['Direito Constitucional','CPI e federalismo: limites de convocação de governador por comissão parlamentar']],
 [110,['Direito Constitucional','Ministério Público: subsídio, gratificações e teto remuneratório']],
 [111,['Direito Constitucional','Funções essenciais à Justiça: representação judicial da União e atribuições da Defensoria Pública']],
 [112,['Direito Constitucional','Organização dos Poderes: autonomia dos estados sobre reeleição de mesa diretora']],
 [113,['Direito Constitucional','Defensoria Pública: organização estadual e equiparação de dirigentes a secretários']],
 [114,['Direito Constitucional','Processo legislativo: iniciativa de projetos de lei em matéria penal']],
 [115,['Direito Constitucional','Processo legislativo: regime de urgência em projeto de iniciativa presidencial']],
 [116,['Direito Constitucional','Emenda à Constituição: iniciativa das assembleias legislativas estaduais']],
 [117,['Direito Constitucional','Processo legislativo tributário: iniciativa de projeto de lei da União']],
 [118,['Direito Constitucional','Medidas provisórias: limites materiais em direito civil e processual']],
 [119,['Direito Constitucional','Processo legislativo: reapresentação de projeto de lei rejeitado na mesma sessão']],
 [120,['Direito Constitucional','Processo legislativo: votação nominal e quórum especial']],
 [121,['Direito Constitucional','Processo legislativo na Câmara: voto do presidente de comissão']],
 [122,['Direito Constitucional','Processo legislativo: escrutínio secreto e sistema de votação eletrônica']],
 [123,['Direito Administrativo','Controle externo: registro de aposentadorias e eficácia do ato concessório']],
 [124,['Direito Administrativo','Tribunal de Contas da União: alcance do controle externo sobre atos do STF']],
 [125,['Administração Financeira e Orçamentária','Execução orçamentária: limitação de empenho e metas fiscais ao fim do bimestre']],
 [126,['Administração Financeira e Orçamentária','Orçamento público: emendas parlamentares ao projeto de lei orçamentária anual']],
 [127,['Ciência Política','Regimes políticos: autoritarismo, fascismo e concentração do poder']],
 [128,['Ciência Política','Democracia representativa e mecanismos de democracia direta']],
 [129,['Ciência Política','Democracia radical e representação por mandatos vinculados']],
 [130,['Ciência Política','Sistemas de governo e comparação entre presidencialismo e parlamentarismo']],
 [131,['Ciência Política','Presidencialismo de coalizão: dimensões partidária e regional da governabilidade']],
 [132,['Ciência Política','Presidencialismo de coalizão: estabilidade institucional e relação entre Poderes']],
 [133,['Ciência Política','Democracia: dimensões normativa, ideal e empírica']],
 [134,['Ciência Política','Democracia moderna: soberania popular e limites da definição etimológica']],
 [135,['Ciência Política','Democracia de consenso: bicameralismo, simetria e federalismo']],
 [136,['Ciência Política','Democracia de consenso: governos de coalizão e sistemas multipartidários']],
 [137,['Relações Internacionais','Governança climática: compromissos multilaterais e negociações da COP30']],
 [138,['Relações Internacionais','Organização Mundial do Comércio: negociações e acordos multilaterais']],
 [139,['Governança e Gestão de Riscos','Governança corporativa: apetite a risco, cultura organizacional e respostas a riscos']],
 [140,['Auditoria','Controles internos: responsabilidades da administração e dos auditores externos']],
 [141,['Governança Corporativa','Responsabilidade corporativa, função social e sustentabilidade organizacional']],
 [142,['Governança Corporativa','Teoria dos stakeholders: prestação de contas, poder e legitimidade']],
 [143,['Compliance','Funções de compliance, independência e aconselhamento regulatório']],
 [144,['Administração Estratégica','Estratégias corporativas e competitivas: diferença entre níveis estratégico e operacional']],
 [145,['Administração Estratégica','Capacidades organizacionais e vantagem competitiva sustentável']],
 [146,['Administração Estratégica','Capacidades dinâmicas e adaptação estratégica em ambientes instáveis']],
 [147,['Administração Estratégica','Indicadores de desempenho: integração entre indicadores antecedentes e de resultado']],
 [148,['Administração Estratégica','Análise SWOT: classificação de fatores internos e externos']],
 [149,['Administração Estratégica','Desdobramento da estratégia e alinhamento organizacional']],
 [150,['Administração Estratégica','Balanced Scorecard: relações de causa e efeito entre perspectivas']],
 [151,['Gestão de Pessoas','Desenvolvimento de equipes temporárias e modelo de equilíbrio pontuado']],
 [152,['Gestão de Pessoas','Motivação: teoria das necessidades de Maslow e relações entre esforço e desempenho']],
 [153,['Gestão de Pessoas','Conflito organizacional: conflito percebido e reações emocionais']],
 [154,['Gestão de Pessoas','Conflito organizacional: perspectivas tradicional e interacionista']],
 [155,['Gestão de Pessoas','Gestão da mudança: táticas de manipulação, cooptação e resistência']],
 [156,['Gestão de Pessoas','Mudança organizacional: primeira e segunda ordens e transformação de pressupostos']],
 [157,['Gestão de Projetos','Encerramento de projetos: registro de lições aprendidas e documentação']],
 [158,['Gestão de Projetos','Estruturas organizacionais de projeto: autonomia, escala e gestão do conhecimento']],
 [159,['Gestão de Projetos','Comunicação em projetos: canais síncronos e assíncronos e interação']],
 [160,['Gestão de Processos','Modelagem de processos: métricas, governança e geração de valor']],
 [161,['Gestão de Processos','Reengenharia e redesenho de processos organizacionais']],
 [162,['Gestão de Processos','Cadeia de valor no setor público: processos finalísticos, de gestão e de suporte']],
 [163,['Informática','Arquitetura de computadores: operações intensivas em entrada e saída e desempenho']],
 [164,['Informática','Hardware: armazenamento não volátil e unidades de estado sólido']],
 [165,['Informática','Sistemas operacionais: concorrência, threads e escalonamento em processador mononúcleo']],
 [166,['Informática','Microsoft Excel: funções SOMASE e SOMA aplicadas a uma planilha de saldos']],
 [167,['Informática','Windows 10: renomeação de arquivos em lote']],
 [168,['Informática','Microsoft Teams e Office 365: compartilhamento e edição colaborativa de arquivos']],
 [169,['Segurança da Informação','Navegação privada: privacidade local e rastreamento por sites e provedores']],
 [170,['Segurança da Informação','Computação em nuvem pública: isolamento e confidencialidade entre organizações']],
 [171,['Informática','Google Chrome: perfis de usuário e separação entre contas pessoais e profissionais']],
 [172,['Segurança da Informação','Antispyware: detecção por assinaturas, comportamento e correlação de evidências']],
 [173,['Segurança da Informação','Malware: diferenças entre vírus e worms e formas de propagação']],
 [174,['Segurança da Informação','Pharming: redirecionamento fraudulento e manipulação da resolução de endereços']],
 [175,['Segurança da Informação','Backup: estratégia 3-2-1, cópias offline e proteção contra ransomware']],
 [176,['Governança da Informação','Governança da informação: ciclo de vida, políticas, papéis e controles']],
 [177,['Inteligência Artificial','Modelos fundacionais: aprendizado a partir de dados e representação distribuída']],
 [178,['Ciência de Dados','Ciência de dados: estatística, aprendizado de máquina e modelagem preditiva']],
 [179,['Ética e Governo Digital','Ética digital no serviço público: rastreabilidade, transparência e justificativa de decisões automatizadas']],
 [180,['Ciência de Dados','Avaliação de classificadores: acurácia, desbalanceamento de classes e métricas adequadas']]
])

const decisions=[]
for(const q of active.values()){
 const e=entries.get(q.id);if(!e)throw Error(`Registro sem catálogo: ${q.id}`)
 const n=Number(q.numero_original||q.numero),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 if(q.id==='extr-58af09ae32e1dab8da6e'){
  decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Informática',conteudo:'Texto-base de planilha eletrônica da questão 166; não é item autônomo',ano:2025,concurso:'Câmara dos Deputados 2025 — prova objetiva, itens 91–180',numero_original:7,pagina:page,dificuldade:'Média',dificuldade_estimada:true,classificacao_fonte:prova,motivo:'Conferência da página 4 mostra apenas a tabela Cliente/Saldo e a instrução geral do bloco, sem enunciado autônomo. É o texto-base visual da questão 166.',visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Página original conferida; o registro representa uma tabela de apoio, não uma questão independente.'},apta_resolucao:false,inelegibilidade_motivo:'Registro OCR contém somente a tabela-base e o cabeçalho do bloco, sem item autônomo; contexto incorporado à questão 166.'})
  continue
 }
 if(!topics.has(n))continue
 let [materia,conteudo]=topics.get(n)||[]
 if(!materia||!conteudo)throw Error(`Classificação temática ausente: ${q.id}, item ${n}`)
 const decision={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,concurso:'Câmara dos Deputados 2025 — prova objetiva, itens 91–180',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial a partir da densidade conceitual e das etapas de aplicação; não publicada oficialmente por item.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Matéria e conteúdo específicos definidos pela leitura do enunciado e pelo contexto do caderno oficial da Câmara dos Deputados.`,visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Página original do caderno associada para preservar a prova e seus elementos visuais.'},apta_resolucao:true}
 if(n===166)decision.texto_apoio='Tabela-base da questão 166 (cliente — saldo): André — R$ 250,00; Carla — R$ 537,00; Eduardo — R$ 721,00; Leonardo — R$ 136,00; Mariana — R$ 17,00; Patrícia — R$ 1.406,00. A tabela também permanece visível na página original vinculada.'
 decisions.push(decision)
}
if(!decisions.some(d=>d.id==='extr-58af09ae32e1dab8da6e'))throw Error('Registro espúrio da tabela não encontrado')
if(!decisions.some(d=>Number(d.numero_original)===166))throw Error('Questão 166 não foi recuperada/revisada')
const canonical=decisions.filter(d=>d.apta_resolucao!==false)
const numbers=new Set(canonical.map(d=>Number(d.numero_original)))
if(canonical.length!==90||numbers.size!==90||![...Array(90)].every((_,i)=>numbers.has(i+91)))throw Error(`Cobertura esperada de 90 itens (91–180) divergente: ${canonical.length} registros, ${numbers.size} números`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itens_reclassificados:canonical.length,questoes_pendentes_antes:canonical.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,ajustes_de_integridade:decisions.filter(d=>d.apta_resolucao===false).length,questao_com_tabela_reconstruida:decisions.some(d=>d.numero_original===166),disciplinas:Object.fromEntries([...new Set(canonical.map(d=>d.materia))].map(s=>[s,canonical.filter(d=>d.materia===s).length])),prova},null,2));process.exit(0)}
const name='revisao-camara-2025-itens-91-180-v175'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_no_documento:active.size,itens_reclassificados:canonical.length,correcao_extracao:'A tabela da questão 166 foi transcrita para o texto-base; o fragmento OCR da tabela foi preservado como inelegível, sem duplicar uma questão.',questoes_contextualizadas:1,paginas_origem_conferidas:[1,2,3,4,5],publicado:false,prova,fonte_catalogo:'https://www.cebraspe.org.br/concursos/cd_25_ns'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
