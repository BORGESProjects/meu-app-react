import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-boa-vista-guarda-2024-formacao-itens1-80-v385',doc='6d35aa1da3b3942f'
const prova='https://cdn.cebraspe.org.br/concursos/PREF_BOA_VISTA_23_GUARDA/arquivos/971_PREFBVCF_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/PREF_BOA_VISTA_23_GUARDA/arquivos/GAB_DEFINITIVO_971_PREFBVCF_001_01.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const keyRows=[
 [1,'E C E C E C C E C C C E E C C C X C E C'],
 [21,'C C E E E C C E C E C E E E C C C C C E'],
 [41,'C C E C E E C C C E E C C E E C E E C C'],
 [61,'C C C E C C C C E C E E E E C C E E C C']
]
const answers=new Map()
for(const [start,row] of keyRows){
 const vals=row.split(/\s+/)
 if(vals.length!==20)throw Error(`Linha inválida do gabarito a partir do item ${start}`)
 vals.forEach((v,i)=>answers.set(start+i,v))
}
const classifications={
1:['Segurança Pública','Guardas municipais: competências do grupo municipal de trânsito'],
2:['Segurança Pública','Sistema Único de Segurança Pública: cooperação entre órgãos'],
3:['Direito Constitucional','Segurança pública na Constituição Federal: guardas municipais e SUSP'],
4:['Direito Administrativo','Poder discricionário: conveniência e oportunidade'],
5:['Segurança Pública','Gestão da segurança pública: competências operativas'],
6:['Segurança Pública','Sistema Único de Segurança Pública: participação dos municípios'],
7:['Segurança Pública','Sistema Único de Segurança Pública: conselhos de segurança pública'],
8:['Direito Penal','Abuso de autoridade: elemento funcional e conduta praticada na vida privada'],
9:['Criminologia','Segurança pública: organização criminosa e limites da ação policial'],
10:['Direito Processual Penal','Prisão em flagrante: flagrante obrigatório e facultativo'],
11:['Direito Penal','Crimes contra a liberdade individual: constrangimento ilegal'],
12:['Direito Processual Penal','Prisão em flagrante: apresentação à autoridade e condução de envolvidos'],
13:['Segurança Pública','Abordagem e busca pessoal: sequência dos procedimentos'],
14:['Segurança Pública','Abordagem de veículos: avaliação de risco e superioridade numérica'],
15:['Segurança Pública','Ronda escolar: comunicação com a direção e registro de ocorrências'],
16:['Segurança Pública','Procedimentos táticos: atendimento a agente ferido durante confronto'],
17:['Segurança Pública','Policiamento comunitário: proteção de mulheres e Patrulha Maria da Penha'],
18:['Segurança Pública','Policiamento comunitário: função educativa e integração com a comunidade'],
19:['Segurança Pública','Policiamento comunitário: descentralização e proximidade com a população'],
20:['Direito Administrativo','Poder de polícia municipal: fiscalização do Código de Posturas'],
21:['Direitos Humanos','Violência doméstica e familiar: contexto relacional e âmbito de ocorrência'],
22:['Direitos Humanos','Violência sexual: exposição de pessoa à nudez'],
23:['Conhecimentos Gerais','Drogas: classificação de substâncias naturais, semissintéticas e sintéticas'],
24:['Sociologia','Movimentos sociais: história dos movimentos feminista e negro'],
25:['Sociologia','Movimentos sociais: origem e desenvolvimento do conceito'],
26:['Direitos Humanos','Cidadania: direitos civis e exercício de liberdades'],
27:['Direitos Humanos','Dignidade da pessoa humana: ética e atuação da guarda municipal'],
28:['Segurança Pública','Uso diferenciado da força: avaliação do risco e capacidade de agressão'],
29:['Educação','Práticas sociopedagógicas: jogos cooperativos para crianças'],
31:['Comunicação','Apresentações educativas: clareza, concisão e legibilidade de slides'],
32:['Educação','Proteção de crianças: abordagem pedagógica de sexualidade e abuso'],
33:['Legislação de Trânsito','Sinalização de emergência: posicionamento e implantação na via'],
34:['Legislação de Trânsito','Acidentes sem vítimas: registro e procedimentos da guarda municipal'],
35:['Direito Ambiental','Fiscalização ambiental municipal: desmatamento, resíduos, caça e áreas protegidas'],
36:['Direito Ambiental','Poluição sonora: atribuições de fiscalização ambiental municipal'],
37:['Segurança contra Incêndio','Princípios de combate a incêndio: abafamento de fogo em óleo'],
38:['Segurança contra Incêndio','Propagação do fogo: transferência de calor por convecção'],
39:['Educação Física','Aptidão física: resistência cardiorrespiratória'],
40:['Educação Física','Atividade física e exercício físico: conceitos e diferenças'],
41:['Educação Física','Aptidão física: resistência muscular e prevenção de lesões'],
42:['Educação Física','Corrida: fases do ciclo da passada e fase aérea'],
43:['Educação Física','Corrida: impacto, superfície de apoio e risco de lesões'],
44:['Direito Penal','Excludentes de ilicitude: legítima defesa própria ou de terceiros'],
45:['Segurança Pública','Defesa pessoal profissional: controle do oponente e tomada de decisão'],
46:['Segurança Pública','Uso da força: resposta proporcional a ameaça extrema'],
47:['Segurança Pública','Defesa pessoal: dor, controle e segurança da técnica'],
48:['Segurança Pública','Defesa pessoal: versatilidade e adaptação de técnicas'],
49:['Tecnologia da Informação','Videomonitoramento: leitura automática de placas veiculares (LPR)'],
50:['Segurança Pública','Radiocomunicação e gestão de incidentes: escolha do canal de comunicação'],
51:['Segurança Pública','Radiocomunicação: códigos QTA e QRT'],
52:['Ética no Serviço Público','Ética profissional: legalidade democrática e proteção do bem público'],
53:['Saúde Pública','Saúde do trabalhador: assistência municipal e participação do SUS'],
54:['Segurança do Trabalho','Acidente de trabalho: eventos ocorridos no ambiente e horário de serviço'],
55:['Segurança Pública','Instrumentos de menor potencial ofensivo: carregamento de dispositivo elétrico'],
56:['Segurança Pública','Agentes químicos: efeitos do CS e do OC'],
57:['Segurança Pública','Espargidores: formas de dispersão de agentes químicos'],
58:['Segurança Pública','Dispositivo elétrico incapacitante: áreas de impacto e segurança'],
59:['Segurança Pública','Munição de impacto controlado: efeitos e risco de letalidade'],
60:['Segurança Pública','Dispositivo elétrico incapacitante: regras de segurança operacional'],
61:['Segurança Pública','Instrumentos de menor potencial ofensivo: efeitos físico-químicos'],
62:['Segurança Pública','Uso da força: princípio da conveniência'],
63:['Armamento e Tiro','Armas de fogo: características da submetralhadora'],
64:['Armamento e Tiro','Dispositivo elétrico incapacitante: funcionamento e corrente elétrica'],
65:['Armamento e Tiro','Balística interna: calibre real e raiamento'],
66:['Armamento e Tiro','Armas de fogo: sistema de abertura por corrediça'],
67:['Armamento e Tiro','Balística interna: etapas do processo de disparo'],
68:['Armamento e Tiro','Munições: conceito e finalidade'],
69:['Armamento e Tiro','Munições de manejo: características e ausência de carga funcional'],
70:['Armamento e Tiro','Balística externa: comparação de cartuchos da família .22'],
71:['Armamento e Tiro','Balística externa: linha de tiro, linha de mira e trajetória'],
72:['Armamento e Tiro','Manuseio de armas: carregamento por meio do carregador'],
73:['Armamento e Tiro','Balística externa: ângulo de mira e trajetória'],
74:['Armamento e Tiro','Funcionamento de pistolas: abertura, extração e ejeção'],
75:['Armamento e Tiro','Segurança no transporte de espingarda calibre 12'],
76:['Armamento e Tiro','Pistola Taurus .380 ACP: sistema de carregamento'],
77:['Primeiros Socorros','Queimaduras e inalação de fumaça: conduta inicial'],
78:['Primeiros Socorros','Queimaduras: suspeita de lesão por inalação e avaliação respiratória'],
79:['Primeiros Socorros','Atendimento pré-hospitalar: manobra de elevação do queixo (chin-lift)'],
80:['Primeiros Socorros','Via aérea: indicação e uso de cânula orofaríngea']
}
const cleanStems={
3:'Com a entrada em vigor da Constituição Federal de 1988, as guardas municipais passaram a integrar expressamente o Sistema Único de Segurança Pública (SUSP).',
8:'Comete o crime de abuso de autoridade o guarda civil municipal que, fora do seu horário de expediente, se envolve em briga física com seu vizinho de condomínio, em virtude de problemas pessoais de convivência.',
18:'No policiamento comunitário, o policial tem o dever de, além de garantir a segurança da comunidade, exercer função didático-pedagógica, visando orientá-la nos aspectos da educação e da solidariedade social.',
51:'Os códigos QTA e QRT significam, respectivamente, horário exato e parar, terminar.'
}
const mismatches=records.filter(q=>q.resposta!=null&&answers.has(Number(q.numero))&&answers.get(Number(q.numero))!=='X'&&q.resposta!==(answers.get(Number(q.numero))==='C'?0:1))
if(mismatches.length)throw Error(`Gabarito oficial diverge do banco nos itens: ${mismatches.map(q=>q.numero+':'+q.id).join(', ')}`)
const decisions=records.map(q=>{
 const n=Number(q.numero),c=classifications[n],answer=answers.get(n)
 if(!c||!answer)throw Error(`Sem classificação ou resposta oficial para item ${n}`)
 if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato inesperado no item ${n}`)
 const anulada=answer==='X'
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:c[0],conteudo:c[1],ano:2024,concurso:'Prefeitura de Boa Vista 2023 — Guarda Civil Municipal — Curso de Formação Profissional',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva do curso de formação aplicada em 23/06/2024',cargo:'Guarda Civil Municipal — Curso de Formação Profissional',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[8,10,11,23,24,25,33,35,38,44,49,55,58,61,63,65,66,67,69,70,71,73,74,76,78].includes(n)?'Difícil':[1,2,6,7,17,21,22,26,27,31,37,39,40,42,44,51,52,56,57,60,62,68,72,75,79,80].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e técnica do item; a banca não publica escala individual de dificuldade.',classificacao_fonte:prova,motivo:`Item ${n} da prova oficial do Curso de Formação da Guarda Civil Municipal; assunto específico atribuído pelo enunciado e pelo bloco temático do caderno.`,resposta_correta:anulada?null:(answer==='C'?0:1),anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_971_PREFBVCF_001_01.PDF',prova:'971_PREFBVCF_001_01.PDF',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado.':'Gabarito oficial definitivo identificado pelo mesmo número de caderno e pelo item.'},...(cleanStems[n]?{enunciado:cleanStems[n]}:{})}
})
if(decisions.length!==83)throw Error(`Esperados 83 registros pendentes; encontrados ${decisions.length}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,questoesUnicas:[...new Set(decisions.map(x=>x.numero))].length,duplicatas:records.length-new Set(records.map(q=>q.numero)).size,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero),prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — Prefeitura de Boa Vista 2023 — Guarda Civil Municipal — Curso de Formação Profissional',itens:decisions.map(d=>({numero:d.numero,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,anulada:d.anulada,pagina:d.pagina,duplicata:records.filter(q=>Number(q.numero)===d.numero).length>1})),prova,gabarito,publicado:false,nota:'83 registros (79 números únicos pendentes; há cópias duplicadas no banco) revisados. Classificação específica, gabarito definitivo e dificuldade estimada associados. Foram corrigidos enunciados contaminados por OCR em registros repetidos dos itens 3, 8, 18 e no item 51. O item 17 foi marcado anulado conforme o gabarito definitivo.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — Prefeitura de Boa Vista 2023 — Guarda Civil Municipal, Curso de Formação — revisão v385\n\n- 83 registros pendentes classificados, cobrindo 79 números únicos (duplicatas preexistentes não foram removidas).\n- Matéria, conteúdo, ano, concurso, cargo, aplicação e dificuldade estimada especificados item a item.\n- Gabarito definitivo oficial do mesmo caderno vinculado; item 17 assinalado como anulado.\n- Registros com texto de itens vizinhos colado ao enunciado foram saneados; páginas originais preservadas no acervo.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
