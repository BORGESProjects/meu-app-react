import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-tbg-2023-tecnico-seguranca-pendencias-v412'
const doc='b893e0dc37a703c6'
const concurso='TBG — Processo Seletivo Público 2023 — Cargo 18: Técnico de Segurança Júnior'
const prova='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/888_TBG_018_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/tbg_23/arquivos/GAB_DEFINITIVO_888_TBG_018_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==80||new Set(records.map(q=>q.id)).size!==80||new Set(records.map(q=>q.numero)).size!==70)throw Error('A fila mudou; reexporte antes de aplicar.')

const grupos={
31:['Segurança do Trabalho','Prevenção e controle de riscos em máquinas: deveres de informação, capacitação e responsabilidade'],
32:['Segurança do Trabalho','NR-12: dispositivos de segurança e condições de utilização'],
33:['Segurança do Trabalho','NR-13: inspeção de caldeiras e vasos de pressão'],
34:['Segurança do Trabalho','NR-13: dispositivos de segurança e válvulas de alívio'],
35:['Segurança do Trabalho','Movimentação de cargas: seleção e características de cintas têxteis'],
36:['Segurança do Trabalho','Segurança elétrica: dispositivo diferencial residual (DR)'],
37:['Engenharia Mecânica','Usinagem: ferramentas de metal duro e propriedades dos materiais'],
38:['Segurança do Trabalho','Soldagem: zona termicamente afetada, fusão e tensões residuais'],
39:['Segurança do Trabalho','NR-33: atmosfera perigosa e concentração de oxigênio'],
40:['Segurança do Trabalho','NR-35: ancoragem e sistemas de proteção contra quedas'],
41:['Segurança do Trabalho','Escavações: dimensionamento de escoramento e cargas no solo'],
42:['Segurança do Trabalho','NR-33: ventilação e controle atmosférico em espaço confinado'],
43:['Higiene Ocupacional','Agentes químicos: propriedades e efeitos do monóxido de carbono'],
44:['Higiene Ocupacional','Aerodispersoides: mecanismos de deposição e fatores de eficiência'],
45:['Segurança do Trabalho','Comunicação de perigos: FISPQ e atribuições regulatórias'],
46:['Higiene Ocupacional','Poluentes atmosféricos: dióxido de enxofre e efeitos à saúde'],
47:['Higiene Ocupacional','Acústica: velocidade de propagação do som nos meios'],
48:['Higiene Ocupacional','Ruído: nível sonoro e escala logarítmica em decibéis'],
49:['Higiene Ocupacional','Exposição ao calor: temperatura de bulbo úmido natural'],
50:['Higiene Ocupacional','Sobrecarga térmica: IBUTG, metabolismo e limites de tolerância'],
51:['Prevenção e Combate a Incêndio','Extintores: capacidade extintora e classe de fogo'],
52:['Prevenção e Combate a Incêndio','Classes de incêndio e riscos associados a combustíveis'],
53:['Prevenção e Combate a Incêndio','Agentes extintores e incêndios envolvendo líquidos inflamáveis'],
54:['Prevenção e Combate a Incêndio','Extintores portáteis e sobre rodas: massa do equipamento'],
55:['Prevenção e Combate a Incêndio','Proteção por chuveiros automáticos em postos de combustíveis'],
56:['Prevenção e Combate a Incêndio','Plano de emergência: elaboração e equipe multidisciplinar'],
57:['Prevenção e Combate a Incêndio','Plano de emergência: caracterização de edificações e áreas'],
58:['Prevenção e Combate a Incêndio','Classificação da magnitude de emergências industriais'],
59:['Prevenção e Combate a Incêndio','Brigada de incêndio: equipamentos de proteção individual'],
60:['Prevenção e Combate a Incêndio','Brigadas de emergência: dimensionamento e distribuição por risco'],
61:['Legislação de Segurança do Trabalho','CLT: deveres do empregador em segurança e medicina do trabalho'],
62:['Legislação de Segurança do Trabalho','Constituição Federal e exame médico admissional'],
63:['Legislação de Segurança do Trabalho','Deveres do trabalhador: utilização de EPI'],
64:['Legislação de Segurança do Trabalho','CLT: conforto térmico e acústico no ambiente de trabalho'],
65:['Legislação de Segurança do Trabalho','Constituição Federal: seguro contra acidentes de trabalho'],
66:['Legislação de Segurança do Trabalho','Normas Regulamentadoras e obrigações previstas em instrumentos coletivos'],
67:['Gerenciamento de Riscos','PGR: elaboração e abrangência por estabelecimento, setor ou atividade'],
68:['Legislação de Segurança do Trabalho','CIPA na administração pública direta e indireta'],
69:['Legislação de Segurança do Trabalho','NR-20: segurança em operações com inflamáveis'],
70:['Legislação de Segurança do Trabalho','CIPA: capacitação e prevenção do assédio e da violência'],
71:['Gerenciamento de Riscos','Técnicas qualitativas: análise de árvore de falhas'],
72:['Gerenciamento de Riscos','NR-3: embargo, interdição e avaliação de risco grave e iminente'],
73:['Gerenciamento de Riscos','Dispositivos de segurança e caracterização de risco grave e iminente'],
74:['Segurança do Trabalho','Estatística de acidentes: taxa de gravidade e dias debitados'],
75:['Legislação Previdenciária','Acidente do trabalho e incapacidade laborativa'],
76:['Gerenciamento de Riscos','Identificação de perigos: distinção entre perigo e risco'],
77:['Gerenciamento de Riscos','PGR: medidas de prevenção para MEI em organização contratante'],
78:['Gerenciamento de Riscos','Avaliação de riscos ocupacionais: severidade e probabilidade'],
79:['Legislação de Segurança do Trabalho','CLT: recusa justificada ao uso de EPI'],
80:['Gerenciamento de Riscos','PGR: responsabilidades pela implementação do gerenciamento'],
81:['Gerenciamento de Riscos','PGR: revisão e atualização do inventário de riscos'],
82:['Legislação Previdenciária','Acidente do trabalho por agressão, sabotagem ou terrorismo'],
83:['Legislação Previdenciária','Acidente de trajeto: caracterização do percurso'],
84:['Segurança do Trabalho','Estatística de acidentes: taxa de frequência'],
85:['Legislação Previdenciária','Comunicação de acidente de trabalho (CAT): prazo legal'],
86:['Saúde Ocupacional','PCMSO: vigilância ativa e passiva da saúde'],
87:['Saúde Ocupacional','PCMSO: custeio de exames ocupacionais e complementares'],
88:['Saúde Ocupacional','NR-7: exame de retorno ao trabalho e afastamentos'],
89:['Saúde Ocupacional','PCMSO: incapacidade laborativa, reabilitação e readaptação'],
90:['Saúde Ocupacional','Atestado de Saúde Ocupacional: conteúdo e exames complementares'],
91:['Saúde Ocupacional','Exposição ocupacional ao chumbo e vigilância médica'],
92:['Saúde Ocupacional','Saúde mental no trabalho: avaliação e prevenção do risco de suicídio'],
93:['Saúde Ocupacional','Conservação auditiva: audiometria e exposição ocupacional ao ruído'],
94:['Saúde Ocupacional','PCMSO e PGR: comunicação de exposição a xileno e tolueno'],
95:['Higiene Ocupacional','Vibração ocupacional: efeitos vasculares e medidas preventivas'],
96:['Saúde Ocupacional','Exposição ao calor: prevenção da intermação'],
97:['Gerenciamento de Riscos','Modelos de causalidade: erros latentes e prevenção de acidentes'],
98:['Gerenciamento de Riscos','Causalidade de acidentes: atos inseguros e fatores organizacionais'],
99:['Saúde Ocupacional','Toxicologia ocupacional: tetracloreto de carbono e efeitos hepatorrenais'],
100:['Higiene Ocupacional','Agentes químicos carcinogênicos: controle da exposição ao benzeno']
}
const comandos={
31:'Acerca dos princípios de prevenção e controle de riscos em máquinas, equipamentos e instalações, julgue os itens a seguir.',
33:'Em relação à operação e manutenção de caldeiras e vasos de pressão, julgue os itens seguintes.',
35:'Julgue os itens subsequentes, acerca de movimentação de cargas, instalações elétricas, máquinas e ferramentas.',
37:'Julgue os itens a seguir, relacionados a trabalhos a quente.',
39:'No que diz respeito a trabalhos em espaços confinados, com escavação e em altura, julgue os próximos itens.',
43:'Em relação à exposição a gases e vapores, a aerodispersoides e à ficha de informação de segurança de produtos químicos (FISPQ), julgue os itens que se seguem.',
47:'No que se refere à exposição ao ruído, julgue os próximos itens.',
49:'Julgue os itens subsecutivos, relativos à exposição ao calor.',
51:'Em um posto de gasolina, há um princípio de incêndio em uma das bombas de combustível. A respeito dessa situação hipotética, e considerando os fundamentos de proteção contra incêndios, julgue os seguintes itens.',
56:'Um plano de emergência e a utilização de brigadas de incêndio são condições importantes para a garantia da segurança de uma planta. A respeito disso, julgue os itens subsequentes.',
61:'Com referência à legislação e às normas técnicas voltadas para a segurança e a saúde do trabalhador, julgue os itens a seguir.',
66:'As normas regulamentadoras (NRs) são disposições complementares da Consolidação das Leis do Trabalho (CLT) e buscam garantir trabalho seguro e sadio, prevenindo a ocorrência de doenças e acidentes de trabalho. No que diz respeito às NRs, julgue os seguintes itens.',
71:'Considerando a situação hipotética apresentada e aspectos a ela relacionados e que o referido trabalhador tenha utilizado a técnica adequada para inspeção, julgue os itens seguintes.',
76:'A respeito de análise, avaliação e gerenciamento de riscos, julgue os itens que se seguem.',
82:'Acerca de comunicação, registro, investigação e análise de acidentes, julgue os itens a seguir.',
86:'No que se refere ao programa de controle médico de saúde ocupacional (PCMSO), julgue os itens a seguir.',
91:'Julgue os itens subsequentes, a respeito da prevenção de doenças relacionadas ao trabalho.',
97:'No que concerne à resposta à contingência em acidentes com hidrocarbonetos líquidos e gasosos e ao sistema de comando de incidentes, julgue os itens a seguir.'
}
const canonical=new Map([[35,'extr-7efced00f80241eb5649'],[38,'extr-a2f6aac01bd462e496ad'],[41,'extr-4fa7972e8384114b4916'],[42,'extr-6d5f6d93e60e9ec6f56b'],[44,'extr-591c1dd399832a0eea04'],[45,'extr-8aca5490456bf92a306d'],[46,'extr-f33faaa5e8ebd74a758e'],[48,'extr-2202584c0522687a8eae'],[50,'extr-aaa3a60d68a0080076da'],[55,'extr-57da5e4e54376f6586c2']])
const fixes={
38:'Na soldagem por arco elétrico, a zona termicamente afetada é a região mais crítica da solda, pois nela o calor é aplicado ao material base e ao metal de adição, o que leva à fusão e subsequente solidificação, com grandes tensões residuais.',
42:'Em espaços confinados, a ventilação natural jamais será suficiente para garantir a qualidade do ar a ser respirado pelos trabalhadores, mesmo quando houver diferenças positivas nas pressões manométricas a jusante e a montante do ambiente alvo.',
44:'As partículas aerodispersoides podem ser depositadas em superfícies devido a várias forças, incluindo-se gravidade, sedimentação por difusão e eletrostática, e a eficiência dessa deposição depende do tamanho da partícula, da velocidade do ar e das características da superfície.',
45:'No Brasil, a elaboração e a regulamentação da FISPQ são atribuições diretas da Agência Nacional de Vigilância Sanitária (ANVISA).',
46:'O dióxido de enxofre (SO2) é um poluente atmosférico que contribui para a formação de chuva ácida e pode causar irritação nos olhos, nariz e garganta, além de agravar problemas respiratórios, como a asma.',
50:'Para a avaliação de sobrecarga térmica, deve-se encontrar o índice de bulbo úmido termômetro de globo (IBUTG) e metabolismo ponderados no tempo, para, na sequência, verificar o atendimento dos limites de tolerância.',
55:'Em um posto de combustíveis, o uso de chuveiros automáticos comuns é obrigatório na área das bombas de combustível.'
}
const respostas=[
 ...'EEEEECCEECECCCECECCC',
 ...['C','E','C','C','E','C','C','E','E','E','E','E','C','E','C','E','C','E','C','C'],
 ...['E','E','C','C','C','E','C','C','C','E','E','C','C','E','E','E','E','C','E','E'],
 ...['C','E','X','C','C','C','C','E','E','C']
]
if(respostas.length!==70)throw Error(`Gabarito transcrito com ${respostas.length} itens, esperado 70.`)
const annulled=new Set([93])
const easy=new Set([43,47,51,54,61,63,69,83,85])
const hard=new Set([33,41,44,50,71,74,78,80,90,91,95,99,100])
const keyDigest=createHash('sha256').update(respostas.join('')).digest('hex')
const pendenciasRemover=['classificacao_especifica_pendente','ano_sem_evidencia','integridade_visual_pendente','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']
const decisions=records.map(q=>{
 const n=Number(q.numero),cls=grupos[n],page=Number(q.pagina),dup=canonical.has(n)&&q.id!==canonical.get(n)
 if(!cls||n<31||n>100)throw Error(`Item ${n} sem classificação.`)
 let stem=fixes[n]||q.enunciado.replace(/\s+/g,' ').trim()
 if(!fixes[n]){
  const tails=['\nEm um posto de gasolina,','\nJulgue os itens subsecutivos,','\nNo que diz respeito à exposição','\nEm relação à exposição a gases','\n88801801749433','\nUm plano de emergência']
  for(const tail of tails){const i=stem.indexOf(tail);if(i>0){stem=stem.slice(0,i).trim();break}}
  stem=stem.replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 }
 if(n===42)stem=fixes[42]
 const key=respostas[n-31],anulada=annulled.has(n),command=[...Object.keys(comandos).map(Number)].filter(x=>x<=n).at(-1)
 const image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const out={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:cls[0],conteudo:cls[1],ano:2023,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'15/10/2023',cargo:'Técnico de Segurança Júnior',numero_original:n,numero:n,pagina:page,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na especificidade normativa, técnica e inferencial do item; a banca não publicou índice psicométrico de dificuldade.',classificacao_fonte:prova,motivo:`Classificação individual derivada do conteúdo do item e do comando do bloco no caderno oficial CEBRASPE do Cargo 18. Ano e data confirmados na folha oficial de gabarito definitivo. Página original preservada para conferência visual.`,resposta_correta:anulada?null:key==='C'?0:1,anulada,gabarito_oficial:{valor:anulada?'X':key,fonte:gabarito,arquivo:'GAB_DEFINITIVO_888_TBG_018_01.PDF',prova:'888_TBG_018_01.PDF',sha256:keyDigest,sha256_tipo:'SHA-256 da sequência canônica dos 70 gabaritos definitivos C/E/X transcritos da tabela oficial',numero:n,pagina:1,criterio:anulada?'Tabela oficial definitiva marca X: item anulado.':'Gabarito oficial definitivo CEBRASPE do cargo 18, matriz 888_TBG_018_01.'},texto_apoio:comandos[command],apoio:[{pagina:page,imagem:image,texto:comandos[command]}],visual:{pagina:page,imagem:image,texto_apoio:comandos[command],motivo:'Caderno oficial consultado item a item; página renderizada original preservada e associada.'},apta_resolucao:!dup,remover_pendencias:pendenciasRemover,...(dup?{inelegibilidade_motivo:'Duplicata de extração do mesmo item e da mesma edição; desativada para impedir repetição no banco.',duplicada_de:canonical.get(n)}:{})}
 if(!out.visual.texto_apoio)throw Error(`Item ${n} sem texto-base do bloco.`)
 return out
})
if(decisions.length!==80||decisions.filter(x=>x.apta_resolucao).length!==70)throw Error('Cobertura inesperada do lote.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:80,itensUnicos:70,duplicatas:10,edicao:concurso,ano:2023,gabarito:'oficial definitivo',anuladas:[...annulled],contextos:[...new Set(decisions.map(x=>x.visual.texto_apoio))].length,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,edicao:concurso,documento_id:doc,prova,gabarito,tipo_resposta:'certo_errado',registros_revisados:80,itens_unicos:70,duplicatas_desativadas:10,anuladas:[...annulled],gabarito_definitivo_vinculado:true,imagens_origem_preservadas:true,publicado:false,observacao:'A revisão cobre os itens 31–100 do cargo 18, com texto-base por bloco recuperado do caderno oficial. Dez registros repetidos foram desativados; o item 92 é anulado conforme o gabarito definitivo. Imagens originais das páginas 1–3 mantidas.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — TBG 2023 — Técnico de Segurança Júnior — revisão v412\n\n- 80 registros revisados para os itens 31–100 (70 itens únicos); 10 duplicatas de extração desativadas.\n- Classificação individual por matéria e conteúdo, ano 2023, data 15/10/2023, dificuldade estimada e modalidade certo/errado.\n- Textos-base por bloco recuperados do caderno oficial; correções OCR em itens com texto contaminado e imagens das páginas 1–3 preservadas.\n- Gabarito definitivo oficial associado; item 92 anulado.\n- Alterações locais; publicação na nuvem pendente.\n`)
console.log(JSON.stringify({...result,edicao:concurso,itens_unicos:70,duplicatas_desativadas:10,publicado:false}))
