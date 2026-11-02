import fs from 'node:fs/promises'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='d348046ee21c8ff6'
const prova='https://cdn.cebraspe.org.br/concursos/ANP_22_PSS/arquivos/725_ANP_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/GAB_DEFINITIVO_725_ANP_002_01.PDF'
const concurso='ANP 2022 — Atividade 2: Fiscalização da Produção de Combustíveis II — prova aplicada em 09/10/2022'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='725_ANP_002_01.PDF')throw Error('Documento do Cargo 2 da ANP não confere')

// Sequência conferida na tabela oficial definitiva do CEBRASPE (linhas dos itens 51–120).
const respostaTexto=[
 'EEECCCEECEECECCECCCE',
 'CECEEEEECECECECECCEC',
 'CCCECCEEEECCCCCCCECC',
 'EEECCECEEC'
].join('')
if(respostaTexto.length!==70||/[^CEX]/.test(respostaTexto))throw Error('Sequência do gabarito oficial inválida')
const respostas=Object.fromEntries([...respostaTexto].map((v,i)=>[i+51,v]))
const temas={
51:['Engenharia Química','Produção de biodiesel: hidrogenação da matéria-prima e etapa limitante'],52:['Engenharia Química','Produção de biodiesel: água, ácidos graxos livres e escolha do catalisador'],53:['Engenharia Química','Produção de biodiesel: matérias-primas lipídicas e amidos'],54:['Engenharia Química','Produção de biodiesel: catálise ácida e básica na transesterificação'],55:['Engenharia Química','Produção de biodiesel: reversibilidade da transesterificação e separação do glicerol'],56:['Engenharia Química','Produção industrial de biodiesel: recuperação do álcool e remoção de água'],57:['Engenharia Química','Produção de biodiesel: temperaturas das etapas do processo'],58:['Engenharia Química','Produção de biodiesel: composição da fase glicerinosa'],59:['Engenharia Química','Produção de biodiesel em batelada e deslocamento do equilíbrio'],60:['Engenharia Química','Hidrogenação da matéria-prima e redução de ácidos graxos livres'],61:['Engenharia Química','Biocatálise: uso de lipases na produção industrial de biodiesel'],62:['Engenharia Química','Bioetanol de segunda geração: celulases e conversão da celulose'],63:['Engenharia Química','Biocombustíveis: matérias-primas para biodiesel e bioetanol'],64:['Engenharia Química','Produção de etanol: catálise ácida e enzimática'],65:['Engenharia Química','Bioetanol de segunda geração: matérias-primas lignocelulósicas'],
66:['Engenharia de Petróleo','Refino: diferenças entre destilação e craqueamento'],67:['Engenharia de Petróleo','Refino: craqueamento térmico e catalítico'],68:['Engenharia de Petróleo','Destilação fracionada e influência da composição do petróleo'],69:['Engenharia de Petróleo','Reforma catalítica e melhoria da qualidade de combustíveis'],70:['Engenharia de Petróleo','Reforma catalítica e conversão de biometano em combustíveis líquidos'],71:['Engenharia de Petróleo','Dessalgação do petróleo e prevenção de incrustações'],72:['Engenharia de Petróleo','Gás natural, biometano e origem dos combustíveis gasosos'],73:['Engenharia de Petróleo','Usos energéticos e petroquímicos do gás natural'],74:['Engenharia de Petróleo','Especificação do gás natural: limites para metano e etano'],75:['Engenharia de Petróleo','Gás natural: origem fóssil e fontes renováveis'],76:['Engenharia de Petróleo','Conversão de gás natural em combustíveis líquidos: processo GTL'],
77:['Segurança do Trabalho','Prevenção e proteção contra incêndios em instalações de combustíveis'],78:['Segurança do Trabalho','Saídas de emergência: dimensionamento e abandono seguro'],79:['Segurança do Trabalho','Saídas de emergência: desobstrução e acesso durante o trabalho'],80:['Segurança do Trabalho','Dever de informação e capacitação em prevenção de incêndios'],81:['Segurança do Trabalho','Ficha com dados de segurança: substâncias e limites de exposição'],82:['Segurança do Trabalho','Sinalização de segurança e uso das cores nos locais de trabalho'],83:['Segurança do Trabalho','Ficha com dados de segurança de produtos químicos'],84:['Segurança do Trabalho','NR 35: definição de trabalho em altura e risco de queda'],85:['Segurança do Trabalho','NR 35: medidas de prevenção antes do início do trabalho'],86:['Segurança do Trabalho','NR 35: análise de risco e permissão de trabalho'],87:['Segurança do Trabalho','NR 35: componentes do sistema individual de proteção contra quedas'],88:['Segurança do Trabalho','NR 35: talabarte e dispositivos de conexão'],89:['Segurança do Trabalho','NR 13: classificação de caldeiras por categoria'],90:['Segurança do Trabalho','NR 13: definição e finalidade de caldeiras a vapor'],91:['Segurança do Trabalho','NR 13: acesso da representação sindical ao estabelecimento'],92:['Segurança do Trabalho','NR 13: inspeção periódica e condição de risco grave e iminente'],93:['Segurança do Trabalho','NR 13: definição de vasos de pressão'],94:['Segurança do Trabalho','NR 13: parâmetros de categorização de vasos de pressão'],95:['Segurança do Trabalho','NR 33: definição e características de espaço confinado'],96:['Segurança do Trabalho','NR 33: deficiência de oxigênio em espaços confinados'],97:['Segurança do Trabalho','NR 33: inertização e prevenção de atmosferas explosivas'],98:['Segurança do Trabalho','NR 33: procedimentos e permissão de entrada e trabalho'],99:['Segurança do Trabalho','NR 33: responsabilidades do empregador e gestão de riscos'],100:['Segurança do Trabalho','Exposição ocupacional ao benzeno em abastecimento e transferência de combustíveis'],101:['Segurança do Trabalho','Líquidos inflamáveis e combustíveis: ponto de fulgor'],102:['Segurança de Processo','Análise de riscos: FMEA, árvore de falhas e árvore de eventos'],
103:['Legislação de Petróleo e Gás','Autorização da ANP: constituição de produtor de biocombustíveis no Brasil'],104:['Legislação de Petróleo e Gás','Autorização da ANP: hipóteses de dispensa para uso próprio'],105:['Legislação de Petróleo e Gás','Armazenamento de produtos de terceiros e enquadramento regulatório'],106:['Legislação de Petróleo e Gás','Autorização de produtor de biocombustíveis e discricionariedade regulatória'],107:['Legislação de Petróleo e Gás','Autorização para operação de instalação produtora de biocombustíveis'],108:['Legislação de Petróleo e Gás','Alteração de instalação produtora e autorização prévia da ANP'],109:['Legislação de Petróleo e Gás','Resolução ANP nº 734/2018: prestação de serviços de armazenagem'],110:['Legislação de Petróleo e Gás','Resolução ANP nº 734/2018: especificação dos biocombustíveis comercializados'],111:['Legislação de Petróleo e Gás','Resolução ANP nº 734/2018: serviços de produção entre agentes autorizados'],112:['Legislação de Petróleo e Gás','Resolução ANP nº 734/2018: certificação da qualidade de biocombustíveis'],113:['Legislação de Petróleo e Gás','Resolução ANP nº 734/2018: vistoria após paralisação da atividade'],114:['Legislação de Petróleo e Gás','Resolução ANP nº 734/2018: falência e cancelamento da autorização'],115:['Legislação de Petróleo e Gás','Definição regulatória de gás natural e composição dos derivados'],116:['Legislação de Petróleo e Gás','Autorização da ANP para atividades reguladas e requisitos cadastrais'],117:['Legislação de Petróleo e Gás','Autorização para exportação de gás natural e competência regulatória'],118:['Legislação de Petróleo e Gás','Construção de instalação produtora e comunicação à ANP'],119:['Legislação de Petróleo e Gás','Processamento e comercialização de derivados de gás natural'],120:['Legislação de Petróleo e Gás','Autorização de operação de instalação e natureza precária do ato']
}
const contextoPorNumero={
51:'A respeito do processo de produção de biodiesel, julgue os itens a seguir.',
56:'Acerca da produção industrial de biodiesel, julgue os itens que se seguem.',
62:'No que concerne ao processo produtivo do bioetanol, julgue os itens seguintes.',
66:'A respeito do processo de refino de petróleo, julgue os itens subsequentes.',
72:'Julgue os próximos itens em relação ao processamento de gás natural.',
77:'No que diz respeito à proteção contra incêndios, julgue os itens a seguir.',
81:'Julgue os itens que se seguem, relativos à sinalização de segurança.',
84:'No que se refere ao trabalho em altura, julgue os itens seguintes.',
89:'Em relação a caldeiras, vasos de pressão e tubulação, julgue os itens subsequentes.',
95:'Julgue os próximos itens, relativos à segurança e saúde nos trabalhos em espaços confinados.',
100:'No tocante à segurança e à saúde no trabalho com inflamáveis e combustíveis, julgue os itens.',
103:'A respeito dos requisitos necessários à autorização da produção de biocombustíveis e da operação da instalação produtora, julgue os itens a seguir.',
109:'Com base na Resolução ANP nº 734/2018, julgue os itens a seguir.',
115:'A respeito da produção, do armazenamento e da comercialização de derivados de petróleo e gás natural, julgue os itens seguintes.'
}
const contexto=n=>{let t='';for(const k of Object.keys(contextoPorNumero).map(Number).sort((a,b)=>a-b))if(k<=n)t=contextoPorNumero[k];return t}
const paginas=new Map(catalog.questoes.map(q=>[q.numero,q.pagina]))
if(Object.keys(temas).length!==70||new Set(catalog.questoes.map(q=>q.numero)).size!==70)throw Error('O mapa de conteúdo não cobre os 70 itens distintos 51–120')
for(let n=51;n<=120;n++)if(!temas[n]||!paginas.has(n)||!respostas[n])throw Error(`Item ${n}: classificação, página ou gabarito ausente`)

const registros=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc)registros.push(q)
if(registros.length!==75||new Set(registros.map(q=>q.numero_original)).size!==70)throw Error(`Esperava 75 registros OCR para 70 itens oficiais; encontrei ${registros.length} registros e ${new Set(registros.map(q=>q.numero_original)).size} números distintos`)
const digest=hashRevisao(respostaTexto)
const duplicadas=new Map([
 ['extr-ad5c2bcbd202d44df87b','extr-a8712e068ff501fa7266'],
 ['extr-2cee6a4fda37f9add2f7','extr-7bca7787d8e82b2fc76a'],
 ['extr-f989fcaf1fc123d35e13','extr-997e18cf07dfcbbc9884'],
 ['extr-d8dc53d9350e547d7c94','extr-a5569e31589865f00851'],
 ['extr-9e6455645160fc5dbc62','extr-08a1201aff1d2c41072c']
])
const decisoes=registros.map(q=>{
 const n=Number(q.numero_original),t=temas[n],pagina=paginas.get(n),contextoItem=contexto(n),resposta=respostas[n]
 if(!t||!pagina||!contextoItem)throw Error(`Item ${n}: classificação, página ou texto de contexto ausente`)
 const correcoes={
  57:'Na planta de produção de biodiesel, são aplicadas diferentes condições de temperatura em processos distintos, devendo a temperatura mínima ser superior a 180 °C.',
  61:'O uso de lipases como catalisadores apresenta vantagens econômicas em escala industrial.',
  65:'Matérias-primas ricas em celulose podem ser usadas para a produção de etanol de 2.ª geração.',
  83:'O fabricante deve elaborar e tornar disponível a ficha com dados de segurança do produto químico, mesmo que este seja classificado como não perigoso, desde que seus usos previstos ou recomendados gerem riscos à saúde dos trabalhadores.',
  88:'Denomina-se talabarte o dispositivo de conexão de um sistema de segurança, regulável ou não, para sustentar, posicionar e(ou) limitar a movimentação do trabalhador.'
 }
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2022,concurso,numero_original:n,pagina,dificuldade:[51,52,55,56,57,59,60,61,65,67,69,71,74,77,78,81,82,83,84,86,89,92,94,95,96,97,98,100,101,102,104,106,107,108,110,112,113,114,115,117,118,120].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnica, normativa e operacional; a banca não publicou nível de dificuldade por item.',motivo:`Item ${n}: matéria e assunto atribuídos pela leitura do enunciado e da seção correspondente do caderno oficial.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do item, inspeção visual das duas páginas e correspondência com o programa da Atividade 2'},resposta_correta:resposta==='X'?null:resposta==='C'?0:1,anulada:resposta==='X',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_725_ANP_002_01.PDF',criterio:'Gabarito oficial definitivo CEBRASPE — Atividade 2: Fiscalização da Produção de Combustíveis II.',numero:n,pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 da sequência dos 70 itens, numerados de 51 a 120, lida na tabela oficial; não é hash do PDF.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio:contextoItem,motivo:`Página ${pagina} do caderno oficial; a imagem mantém o item e sua instrução compartilhada visíveis para conferência.`}}
 if(correcoes[n]&&!duplicadas.has(q.id))d.enunciado=correcoes[n]
 if(duplicadas.has(q.id)){d.apta_resolucao=false;d.duplicada_de=duplicadas.get(q.id);d.inelegibilidade_motivo=`Cópia OCR duplicada do item ${n}; mantida para histórico, retirada da resolução para evitar repetição.`}
 return d
})
for(let p=1;p<=2;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-telebras-advogado-2022-v208'))
if(!base)throw Error('Raiz v208 não encontrada')
const nome='revisao-anp-combustiveis-ii-2022-v209'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,itens_oficiais_no_caderno:70,itens_unicos_classificados:70,duplicatas_ocr_excluidas:duplicadas.size,gabaritos_definitivos_associados:70,paginas_originais_conferidas:[1,2],data_aplicacao:'2022-10-09',prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão ANP — Fiscalização da Produção de Combustíveis II — v209\n\n- Revisei 75 registros OCR referentes aos 70 itens oficiais e classifiquei individualmente os 70 números de 51 a 120 por Engenharia Química, Engenharia de Petróleo, Segurança do Trabalho, Segurança de Processo e Legislação de Petróleo e Gás, com assunto específico, cargo, ano de aplicação e dificuldade estimada.\n- Excluí da resolução cinco cópias OCR literais ou contaminadas pelos cabeçalhos e itens seguintes. Corrigi a temperatura “180 °C” e transcrições contaminadas nos itens 57, 61, 65, 83 e 88; associei as instruções compartilhadas aos grupos e vinculei as duas páginas originais. Associei o gabarito definitivo oficial aos 70 números.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno da Atividade 2](<${prova}>), [gabarito definitivo da Atividade 2](<${gabarito}>), [edital ANP 2022](https://cdn.cebraspe.org.br/concursos/ANP_22_PSS/arquivos/ED_1_2022_ANP_PSS_ABERTURA.PDF).\n`)
console.log(JSON.stringify(out))
