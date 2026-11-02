import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-inss-ledor-conteudos-v88'
const base='tmp/revisao-profissional/revisao-icmbio-administracao-v87/acervo-extraido'
const doc='3f9382d2f878ac40'
const prova='https://cdn.cebraspe.org.br/concursos/INSS_2015/arquivos/234INSS_001_04_LEDOR.PDF'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-inss-ledor-servico-social.json','utf8'))
const temas={
1:['Língua Portuguesa','Semântica: sentidos contextualizados do vocabulário e ambiguidade'],
2:['Língua Portuguesa','Interpretação de texto: inferência e informação não explicitada'],
3:['Língua Portuguesa','Tipologia textual: carta e marcas de gênero textual'],
5:['Língua Portuguesa','Sintaxe: valor semântico de preposições e relações entre orações'],
7:['Língua Portuguesa','Sintaxe de regência: complemento verbal introduzido por preposição'],
9:['Língua Portuguesa','Morfossintaxe: conjunção integrante e função sintática da oração subordinada'],
10:['Língua Portuguesa','Interpretação de texto: coerência e identificação de contradição argumentativa'],
12:['Língua Portuguesa','Semântica e sintaxe: substituição verbal, voz e preservação de sentido'],
13:['Redação Oficial','Manual de Redação da Presidência da República: concisão, clareza, objetividade e memorando'],
38:['Direitos da Criança e do Adolescente','ECA: acolhimento familiar e modalidades de medida de proteção'],
39:['Direitos da Pessoa com Deficiência','Lei Brasileira de Inclusão: acessibilidade em cobranças e serviços tributários'],
40:['Direitos da Pessoa com Deficiência','Lei Brasileira de Inclusão: vedação à cobrança adicional por escolas privadas'],
41:['Informática','Segurança da informação: malware, desempenho do computador e ferramentas antivírus'],
42:['Informática','Redes e sistemas: intranet, Internet e compatibilidade de aplicações web'],
50:['Raciocínio Lógico','Lógica proposicional: conectivos, implicação e equivalência lógica'],
51:['Serviço Social','Gênese do Serviço Social e questão social no capitalismo monopolista'],
52:['Serviço Social','Institucionalização do Serviço Social no Brasil e intervenção de entidades religiosas'],
53:['Serviço Social','Divisão sociotécnica do trabalho e mercantilização do trabalho profissional'],
54:['Serviço Social','Serviço Social e reprodução das relações sociais na sociedade capitalista'],
55:['Serviço Social','Contradição da prática profissional: reprodução do capital e respostas às necessidades sociais'],
56:['Serviço Social','Trabalho profissional: precarização, vínculos, insegurança e intensificação'],
57:['Serviço Social','Fundamentos teórico-metodológicos: pluralismo profissional'],
58:['Serviço Social','História do Serviço Social no Brasil e na América Latina na década de 1970'],
59:['Políticas Sociais','Institucionalização e desenvolvimento histórico da política social no Brasil'],
60:['Políticas Sociais','Estado brasileiro nos anos 1930: administração da questão social e políticas públicas'],
61:['Serviço Social','Profissão liberal e condição de trabalhador assalariado: autonomia profissional'],
62:['Serviço Social','Reconceituação: perspectiva de reatualização do conservadorismo'],
63:['Serviço Social','Renovação profissional: perspectiva modernizadora e seminários de Araxá e Teresópolis'],
64:['Serviço Social','Perspectiva modernizadora durante a ditadura militar e desenvolvimento capitalista'],
65:['Serviço Social','Renovação profissional: intenção de ruptura e crítica à herança conservadora'],
66:['Serviço Social','Intenção de ruptura: CBCISS, formação universitária e reconceituação profissional'],
67:['Serviço Social','Movimento de reconceituação latino-americano e crítica ao Serviço Social tradicional'],
68:['Serviço Social','Reatualização do conservadorismo: fenomenologia e ajuda psicossocial'],
69:['Serviço Social','Questão social: socialização da produção e apropriação privada da riqueza'],
70:['Movimentos Sociais','Classes subalternas, movimentos sociais e contradições do capitalismo'],
71:['Serviço Social','Conjuntura sócio-histórica e trabalho profissional contemporâneo'],
72:['Legislação Profissional','Lei nº 8.662/1993 e Código de Ética: materialização do projeto ético-político'],
73:['Serviço Social','Questão social: desigualdade, exploração coletiva e apropriação privada da riqueza'],
76:['Planejamento Social','Planejamento estratégico situacional: atores, motivações e viabilidade política'],
77:['Serviço Social','Socialização de informações e acesso a direitos e serviços sociais'],
78:['Serviço Social','Assessoria e consultoria: análise da realidade e demandas institucionais'],
79:['Serviço Social','Oficinas e trabalho com grupos: planejamento participativo e roteiro de intervenção'],
80:['Serviço Social','Entrevista social: técnica de clarificação e condução do diálogo'],
84:['Serviço Social','Trabalho interdisciplinar: avaliação social em equipe e elaboração de parecer'],
88:['Direitos da Pessoa com Deficiência','BPC e aposentadoria: avaliação da deficiência e atuação multiprofissional'],
89:['Previdência Social','Serviço Social previdenciário: matriz teórico-metodológica e trajetória histórica'],
90:['Previdência Social','Serviço Social no INSS: orientação sobre direitos e formas de exercício'],
91:['Previdência Social','Reabilitação profissional: órteses, próteses e tecnologia assistiva'],
92:['Previdência Social','Serviço Social previdenciário: conhecimento da realidade e defesa de direitos'],
93:['Ética Profissional','Código de Ética: articulação com movimentos de outras categorias profissionais'],
94:['Ética Profissional','Código de Ética: linguagem inclusiva e respeito à identidade de gênero'],
95:['Ética Profissional','Projeto ético-político: precarização, formação e enfrentamento do conservadorismo'],
96:['Ética Profissional','Projeto ético-político profissional e formação em Serviço Social'],
97:['Administração Pública','Burocracia estatal: racionalidade administrativa e potencial de transformação social'],
98:['Ciência Política','Estado: garantia de direitos, bem comum e instrumento de dominação de classe'],
99:['Ciência Política','Estado e governo: distinções conceituais e instituições políticas'],
100:['Administração Pública','Dominação racional-legal: burocracia, hierarquia e competências funcionais'],
}
const blocos=[
[1,12,'Texto-base literário: trecho de “Uma Obra-Prima”, de Machado de Assis, publicado em Contos Fluminenses; ver a página original.'],
[13,13,'Texto-base: memorando de convocação para reunião administrativa, reproduzido na página original.'],
[38,38,'Base normativa: Estatuto da Criança e do Adolescente (ECA), medidas de proteção e acolhimento.'],
[39,40,'Base normativa: Lei Brasileira de Inclusão da Pessoa com Deficiência (Lei nº 13.146/2015).'],
[41,42,'Contexto: uso de aplicativos, segurança do computador e acesso a sistemas por intranet e Internet.'],
[50,50,'Contexto: proposições p e q e sua relação lógica; enunciado integral na página original.'],
[51,61,'Contexto: Serviço Social como profissão, questão social, relações de produção e formação histórica brasileira.'],
[62,68,'Contexto: movimento de reconceituação e perspectivas de renovação do Serviço Social no Brasil.'],
[69,73,'Contexto: questão social, capitalismo, movimentos sociais, contemporaneidade e normativas profissionais.'],
[76,80,'Contexto: planejamento e técnicas de intervenção profissional nos diferentes espaços sócio-ocupacionais.'],
[84,84,'Contexto: parecer social no INSS, reconhecimento de direitos e avaliação em equipe.'],
[88,88,'Contexto: avaliação para concessão do Benefício de Prestação Continuada (BPC) e aposentadoria da pessoa com deficiência.'],
[89,92,'Contexto: trajetória e atribuições do Serviço Social na Previdência Social.'],
[93,96,'Contexto: Código de Ética Profissional e projeto ético-político do Serviço Social.'],
[97,100,'Contexto: Estado moderno, poder político e dominação racional-legal.'],
]
const ids=new Set(),decisoes=[]
if(qs.length!==57)throw Error(`Esperados 57 itens pendentes; encontrados ${qs.length}`)
for(const q of qs){const n=Number(q.numero_original),d=temas[n];if(!d)throw Error(`Item ${n} sem classificação específica`);if(ids.has(q.id))throw Error(`ID repetido ${q.id}`);ids.add(q.id);const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio=q.texto_apoio||blocos.find(([a,b])=>n>=a&&n<=b)?.[2]||'';decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:d[0],conteudo:d[1],ano:2016,dificuldade:['5','7','9','10','12','13','50','54','55','58','62','63','64','65','66','67','68','69','70','72','73','76','80','84','88','91','93','94','95','96','97','98','99','100'].includes(String(n))?'Difícil':(['1','2','3','38','39','40','41','42','57','77'].includes(String(n))?'Fácil':'Média'),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade linguística, normativa e teórico-metodológica; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`INSS — Edital 2015, prova aplicada em 2016 — Cargo 1: Analista do Seguro Social com Formação em Serviço Social, caderno LUA, versão ledor — CEBRASPE; item ${n}. Ano e cargo confirmados no cabeçalho e rodapé oficiais.`,visual:{pagina,imagem,texto_apoio,motivo:'Página original da versão acessível para ledor conferida visualmente; texto-base e elementos de contexto mantidos vinculados.'}})}
const relatorio=await aplicarRevisoesIndividuais({nome,base,decisoes})
const detalhe={...relatorio,banca:'CEBRASPE',concurso:'INSS — Edital 2015, prova aplicada em 2016 — Analista do Seguro Social com Formação em Serviço Social (caderno LUA, ledor)',ano:2016,documento:'234INSS_001_04_LEDOR.PDF',fonte:prova,paginas_origem_conferidas:[2,3,4,5,6,7],observacao:'Reclassifiquei 57 questões anteriormente rotuladas como Serviço Social. O lote inclui Língua Portuguesa, Redação Oficial, direitos da infância e da pessoa com deficiência, Informática, Raciocínio Lógico, Fundamentos e Política Social, Planejamento, Previdência, Ética Profissional, Administração Pública e Ciência Política. Ano e cargo foram conferidos no cabeçalho/rodapé do caderno: aplicação 2016, edital de 2015, Cargo 1. Preservei o texto-base literário de Machado de Assis, o memorando e as situações hipotéticas existentes, mantendo cada página original ligada aos itens. Gabaritos associados não foram alterados; dificuldade é estimativa editorial.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(detalhe,null,2));console.log(JSON.stringify(detalhe))
