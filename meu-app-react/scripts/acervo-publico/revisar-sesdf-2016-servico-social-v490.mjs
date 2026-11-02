import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-sesdf-2016-residencia-multiprofissional-servico-social-v490'
const documento='d95d618460526e2c'
const prova='https://cdn.cebraspe.org.br/concursos/SES_DF_16_MULTIPROFISSIONAL_2/arquivos/241RESMULT_007_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/SES_DF_16_MULTIPROFISSIONAL_2/arquivos/Gab_Preliminar_241RESMULT_007_01.pdf'
const justificativas='https://cdn.cebraspe.org.br/concursos/SES_DF_16_MULTIPROFISSIONAL_2/arquivos/SES_DF_16_MULTIPROFISSIONAL_2_JUSTIFICATIVAS_DE_ALTERA____ES_DE_GABARITO.PDF'
const concurso='SES/DF — Residência Multiprofissional em Atenção Oncológica e Oncologia — Área: Serviço Social'
const cargo='Residência Multiprofissional — Serviço Social'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const numeros=pendentes.map(q=>Number(q.numero)).sort((a,b)=>a-b)
assert.equal(pendentes.length,43)
assert.deepEqual(numeros,[1,2,3,4,5,6,7,8,9,10,17,18,19,20,21,22,23,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50])

// Gabarito oficial preliminar por caderno. As justificativas oficiais publicadas
// para itens 33, 43, 47 e 49 pertencem a outras áreas profissionais, não a Serviço Social.
const respostas={1:'C',2:'E',3:'C',4:'E',5:'C',6:'C',7:'C',8:'C',9:'E',10:'C',17:'E',18:'E',19:'E',20:'E',21:'C',22:'E',23:'E',25:'E',26:'C',27:'E',28:'E',29:'C',30:'E',31:'E',32:'C',33:'C',34:'E',35:'C',36:'C',37:'C',38:'E',39:'C',40:'E',41:'C',42:'C',43:'E',44:'E',45:'C',46:'E',47:'C',48:'C',49:'E',50:'C'}
assert.equal(Object.keys(respostas).length,43)
const hashGabarito=hashRevisao(Object.entries(respostas).sort(([a],[b])=>Number(a)-Number(b)).map(([n,r])=>`${n}:${r}`).join('|'))

const temas={
 1:['Legislação Previdenciária','Lei nº 8.212/1991: financiamento da seguridade social','Média'],
 2:['Legislação Previdenciária','Lei nº 8.212/1991: manutenção de benefícios e procuração','Média'],
 3:['Legislação Previdenciária','Lei nº 8.212/1991: comunicação e memória de cálculo de benefícios','Média'],
 4:['Legislação Previdenciária','Lei nº 8.212/1991: princípios da organização da seguridade social','Média'],
 5:['Legislação do SUS','Constituição Federal: saúde, integralidade e participação privada','Média'],
 6:['Legislação do SUS','Lei nº 8.080/1990: competências e financiamento do SUS','Média'],
 7:['Políticas de Saúde','Direito à saúde: universalidade e democratização do acesso','Fácil'],
 8:['Legislação do SUS','Lei nº 8.080/1990: composição e atribuições do SUS','Média'],
 9:['Legislação do SUS','Lei nº 8.080/1990: atendimento e internação domiciliar','Média'],
 10:['Legislação do SUS','Lei nº 8.080/1990: integração de hospitais universitários ao SUS','Média'],
 17:['Serviço Social','Serviço Social na saúde: projeto da reforma sanitária e demandas profissionais','Média'],
 18:['Serviço Social','Atuação interdisciplinar e intersetorialidade nas políticas de seguridade','Média'],
 19:['Serviço Social','Ações socioassistenciais na política de saúde','Média'],
 20:['Serviço Social','Avaliação socioeconômica e acesso a programas e serviços','Média'],
 21:['Serviço Social','Atribuições profissionais no contexto hospitalar','Média'],
 22:['Serviço Social','Atuação em equipe de saúde e notificação de violências','Média'],
 23:['Serviço Social','Instrumentos técnico-operativos: relatório social','Média'],
 25:['Serviço Social','Entrevista social: escuta e manejo do silêncio','Média'],
 26:['Serviço Social','Questão social e projetos universalista e privatista','Difícil'],
 27:['Serviço Social','Transformações do trabalho e espaços ocupacionais','Média'],
 28:['Serviço Social','Regulamentação profissional e desenvolvimento histórico da profissão','Média'],
 29:['Serviço Social','Intenção de ruptura e crítica à herança conservadora','Média'],
 30:['Serviço Social','Perspectiva de ruptura e concepção de liberdade','Difícil'],
 31:['Serviço Social','Projeto ético-político e formação histórica da hegemonia','Média'],
 32:['Serviço Social','Projeto ético-político, direitos sociais e neoliberalismo','Média'],
 33:['Serviço Social','Projeto ético-político: democracia, justiça e equidade social','Média'],
 34:['Ética Profissional','Ética marxista e emancipação humana','Difícil'],
 35:['Ética Profissional','Moral profissional e ação interventiva','Média'],
 36:['Ética Profissional','Ética, moral e cotidiano','Média'],
 37:['Serviço Social','Questão social: gênese e politização das desigualdades','Média'],
 38:['Serviço Social','Questão social: formação da sociedade burguesa','Média'],
 39:['Política Social','Proteção social e respostas públicas às necessidades sociais','Média'],
 40:['Serviço Social','Debate teórico sobre Serviço Social e questão social','Difícil'],
 41:['Legislação Profissional','Lei nº 8.662/1993: competências e atribuições privativas','Média'],
 42:['Legislação Profissional','Lei nº 8.662/1993: fóruns de deliberação profissional','Média'],
 43:['Legislação Profissional','Lei nº 8.662/1993: direitos e garantias profissionais','Média'],
 44:['Ética Profissional','Código de Ética: processos disciplinares e competências do CFESS','Média'],
 45:['Serviço Social','Reconhecimento do assistente social como profissional da saúde','Fácil'],
 46:['Legislação Profissional','Inscrição no CRESS e exercício das atribuições profissionais','Média'],
 47:['Ética Profissional','Código de Ética: liberdade e enfrentamento da discriminação','Média'],
 48:['Pesquisa em Serviço Social','Pesquisa-ação e relação entre conhecimento e intervenção','Difícil'],
 49:['Pesquisa em Serviço Social','Pesquisa básica e pesquisa aplicada','Média'],
 50:['Pesquisa em Serviço Social','Rigor teórico-metodológico e pluralismo','Fácil']
}

// Transcrição conferida com o caderno oficial; elimina a contaminação por itens vizinhos.
const stems={
1:'Uma das fontes de receita que compõem o orçamento da seguridade social são as contribuições sociais, entre as quais se destacam as das empresas — contribuições que incidem sobre o faturamento e o lucro — e as dos trabalhadores — que incidem sobre o salário de contribuição destes.',
2:'Os indivíduos que recebem benefícios da previdência social por intermédio de procuração devem revalidá-la a cada dois anos para serem dispensados da etapa de recadastramento.',
3:'Em atendimento à referida lei, o INSS deve enviar aos beneficiários o aviso de concessão de benefício, além da memória de cálculo do valor dos benefícios concedidos.',
4:'A previdência social, que conta com a contribuição e a representação prioritária de aposentados em diversos setores, obedece ao princípio da centralização da gestão administrativa.',
5:'As atividades de saúde devem contar não só com o atendimento integral voltado prioritariamente para as atividades preventivas, mas também com a participação da iniciativa privada na assistência à saúde, conforme os preceitos constitucionais.',
6:'Compete ao Ministério da Saúde, por meio do Fundo Nacional de Saúde, administrar os recursos financeiros, originários do orçamento da seguridade social e de outras fontes da União.',
7:'No estado democrático de direito, responsável pelas políticas sociais e, portanto, pela saúde, destacam-se como fundamentos a democratização do acesso e a universalização das ações.',
8:'O Sistema Único de Saúde (SUS) é constituído por ações e serviços de saúde prestados por órgãos e instituições públicas federais, estaduais e municipais, incluídos os destinados ao controle de qualidade, pesquisa e produção de insumos e medicamentos.',
9:'No âmbito do Sistema Único de Saúde (SUS), a assistência de atendimento e internação domiciliar inclui os procedimentos médicos e de enfermagem de natureza paliativa, excluindo-se o atendimento psicológico e o de assistência social.',
10:'Os serviços de saúde dos hospitais universitários e de ensino integram-se ao Sistema Único de Saúde (SUS), por meio de convênio, possuindo autonomia administrativa em relação a patrimônio, recursos humanos e financeiros, ensino, pesquisa e extensão.',
17:'Seleção socioeconômica dos usuários, atuação psicossocial por meio de aconselhamento e execução de práticas individuais são demandas apresentadas ao assistente social pelo projeto da reforma sanitária.',
18:'A intervenção competente e crítica do assistente social na área da saúde requer a busca de atuação em equipe interdisciplinar, além de estimular a intersetorialidade, no sentido de fortalecer a articulação entre as políticas de seguridade social.',
19:'As ações socioassistenciais realizadas por assistentes sociais no âmbito da saúde devem ser, prioritariamente, de natureza emergencial, em razão das necessidades de saúde dos usuários.',
20:'No âmbito da saúde, independentemente da natureza da instituição, a avaliação socioeconômica dos usuários deve funcionar como um instrumento para definir elegibilidade para a inclusão em determinado programa ou serviço.',
21:'Comunicação de óbitos, solicitação de autorização para consultas e exames, preenchimento de formulários para viabilização de tratamento fora de domicílio (TFD) e fornecimento de órteses e próteses não são atribuições dos assistentes sociais no contexto hospitalar.',
22:'Constitui atribuição específica do assistente social na atuação em equipe de saúde a notificação de casos de violência contra crianças e adolescentes, mulheres, idosos e pessoas com deficiências.',
23:'Ao realizar um relatório informativo, o assistente social deve descrever, com riqueza de detalhes, a situação vivenciada pelo usuário, sem indicar os procedimentos adotados para preservar a neutralidade no repasse da informação.',
25:'Na condução de entrevista de usuários com diagnóstico de doenças graves, o assistente social deve ter atenção e cuidado especial no que diz respeito ao silêncio do entrevistado. Caso ocorra, o profissional deve interromper e sugerir mudança de assunto.',
26:'As estratégias de enfrentamento da questão social são tensionadas entre um projeto social de caráter universalista e outro de caráter privatista, os quais são essencialmente distintos e antagônicos.',
27:'A reestruturação tecnológica e organizacional provoca diminuição da intensidade de trabalho do assistente social e da abrangência do campo de atuação dele.',
28:'A reconfiguração dos espaços ocupacionais e das demandas profissionais é resultante da regulamentação da profissão de serviço social e, posteriormente, da aprovação do Código de Ética Profissional do Assistente Social em 1986.',
29:'Para romper com a herança conservadora e alcançar novas bases de legitimidade da ação profissional, o assistente social deve prioritariamente compreender as implicações políticas de sua prática profissional.',
30:'Na perspectiva de ruptura, prevalece a concepção de liberdade subjetivada, que consiste no desenvolvimento de cada indivíduo de acordo com suas habilidades.',
31:'A conquista da hegemonia do projeto ético-político do serviço social foi alcançada a partir da promulgação da Constituição Federal de 1988 — denominada Constituição Cidadã.',
32:'O projeto ético-político hegemônico do serviço social opõe-se às políticas neoliberais por considerar os direitos sociais como privilégios.',
33:'A teleologia do projeto ético-político do serviço social ancora-se em uma postura política e profissional de compromisso com a construção de outra ordem social por intermédio da luta por justiça e equidade social, em defesa da democracia.',
34:'O conceito de ética fundamentado na teoria marxista orienta-se para uma reflexão desinteressada em busca da emancipação política da sociedade.',
35:'A moral profissional envolve a relação entre a ação profissional do indivíduo singular, os sujeitos nela envolvidos e o produto concreto da intervenção profissional.',
36:'A ética corresponde à abstração do cotidiano para uma reflexão crítica acerca da moral, a qual compreende as práticas sociais cotidianas.',
37:'O termo questão social surgiu para designar o processo de politização da desigualdade social resultante da constituição da sociedade burguesa.',
38:'A chamada questão social origina-se das transformações econômicas, sociais e políticas ocorridas no Brasil durante o início do século XIX.',
39:'As políticas de proteção social, apoiadas em direitos e garantias sociais, procedem das respostas públicas direcionadas a atender necessidades dos trabalhadores e de suas famílias.',
40:'O debate teórico a respeito da relação entre serviço social e questão social é registrado desde o período da chamada intenção de ruptura.',
41:'As competências profissionais são as ações que podem ser desenvolvidas pelos assistentes sociais, sem que lhes sejam exclusivas, enquanto as atribuições privativas dizem respeito diretamente à profissão de assistente social.',
42:'A citada lei estabelece como fórum máximo de deliberação da profissão de assistente social as reuniões do Conselho Federal de Serviço Social com os conselhos regionais de serviço social.',
43:'A referida lei assegura ao assistente social o direito à inviolabilidade do seu local de trabalho, de seus arquivos e de sua documentação.',
44:'Cabe ao CFESS a execução das decisões proferidas nos processos disciplinares.',
45:'Independentemente de atuar em equipe interdisciplinar, o assistente social é legalmente reconhecido como profissional da saúde.',
46:'O profissional contratado sob a denominação de cargo genérico, ainda que desempenhe atividades atribuídas ao assistente social, fica dispensado de se inscrever em conselho regional de serviço social de jurisdição da sua respectiva área de atuação.',
47:'É princípio fundamental do Código de Ética Profissional do Assistente Social o exercício da profissão sem discriminação de classe social, de etnia, de gênero, de religião, de nacionalidade, de orientação sexual, de identidade de gênero, de idade e(ou) de condição física.',
48:'A pesquisa em ação da intervenção profissional, embora não se atenha a um circuito analítico da ação que investiga, consiste em uma metodologia fundamentada no conhecimento rigoroso e científico e que desenvolve percursos independentes para a construção do conhecimento e para a operação da ação.',
49:'Optar por uma abordagem da pesquisa básica é preferível a uma da pesquisa aplicada, já que aquela apresenta maior potencial de aplicabilidade prática dos resultados que esta última.',
50:'O rigor teórico-metodológico e o pluralismo são princípios que norteiam o debate acerca da pesquisa no serviço social.'
}

const comandos={
 '1-4':'Comando: De acordo com a Lei nº 8.212/1991, que dispõe sobre a organização da seguridade social, julgue os itens.',
 '5-10':'Comando: A respeito das condições para promoção, proteção e recuperação da saúde e da organização e funcionamento dos serviços correspondentes, julgue os itens.',
 '17-22':'Comando: Julgue os itens com relação à atuação de assistentes sociais na política de saúde.',
 '23-23':'Comando: A propósito da dimensão técnico-operativa do Serviço Social, julgue o item.',
 '25-25':'Comando: A propósito da dimensão técnico-operativa do Serviço Social, julgue o item.',
 '26-28':'Comando: Acerca do redimensionamento do trabalho do assistente social ante as transformações sociais, julgue os itens.',
 '29-30':'Comando: Julgue os itens referentes à análise crítica das influências teórico-metodológicas e às formas de intervenção relativas ao Serviço Social.',
 '31-33':'Comando: Com relação ao projeto ético-político do Serviço Social, julgue os itens.',
 '34-36':'Comando: No que se refere aos fundamentos éticos que orientam o exercício profissional do assistente social, julgue os itens.',
 '37-40':'Comando: Julgue os itens relativos à questão social e aos direitos de cidadania.',
 '41-43':'Comando: Em relação à Lei nº 8.662/1993, que regulamenta a profissão de assistente social, julgue os itens.',
 '44-47':'Comando: Com base no Código de Ética Profissional do Assistente Social e nas resoluções do CFESS, julgue os itens.',
 '48-50':'Comando: Julgue os itens relativos à investigação na prática profissional do assistente social.'
}
const faixa=n=>Object.keys(comandos).find(k=>{const [a,b]=k.split('-').map(Number);return n>=a&&n<=b})
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero),tema=temas[n],key=respostas[n]
 assert.ok(tema&&key&&stems[n],`Item ${n} sem conteúdo revisado`)
 const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const enunciado=stems[n],texto_apoio=comandos[faixa(n)]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2016,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 6/3/2016',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade:tema[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na especificidade da legislação, dos referenciais profissionais e da interpretação conceitual; não representa índice estatístico de acertos.',resposta_correta:key==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'Gabarito oficial preliminar — caderno 241RESMULT_007_01, Área Serviço Social',sha256:hashGabarito,numero:n,resposta:key,status:'Gabarito preliminar oficial. As justificativas públicas de alteração consultadas abrangem itens de outras áreas profissionais; não foi localizado aviso de alteração para esta área.'},classificacao_fonte:prova,motivo:`Item ${n}: classificação atribuída pelo conteúdo real, pelo comando do caderno e pelo recorte profissional. Ano, concurso, área e banca conferidos na documentação oficial; dificuldade estimada.`,enunciado,texto_apoio,imagem_pagina:imagem,visual:{pagina:q.pagina,imagem,enunciado,texto_apoio,motivo:`Página ${q.pagina} do caderno oficial comparada visualmente com a transcrição; enunciado e comando foram separados de itens adjacentes.`},apta_resolucao:true,remover_pendencias:remover})
}
assert.equal(decisoes.length,43);assert.equal(new Set(decisoes.map(x=>x.id)).size,43)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:43,itens_unicos:43,aptas:43,paginas_conferidas:[2,3,4],ocr_corrigido:[10,21,22,33,36,39,40,43,48,49],gabaritos_oficiais_preliminares:43,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,justificativas,concurso,registros_revisados:43,itens_unicos:43,questoes_aptas:43,paginas_conferidas:[2,3,4],gabarito_preliminar_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SES/DF 2016 — Residência Multiprofissional, Serviço Social — revisão v490\n\n- Revisei os 43 itens pendentes deste caderno, classificando legislação previdenciária, legislação e políticas do SUS, Serviço Social, ética profissional, legislação profissional, política social e pesquisa em Serviço Social.\n- Recompus enunciados afetados por OCR e removi comandos de seção e trechos de itens vizinhos que haviam sido incorporados aos itens 10, 22, 36, 40 e 43.\n- Vinculei as páginas visuais 2–4 e o gabarito preliminar oficial do caderno. A classificação de dificuldade é estimativa editorial.\n- Os quatro itens anulados encontrados nas justificativas oficiais são de outras áreas profissionais; não foram aplicados a este caderno de Serviço Social.\n- Pacote local validado; não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}), [gabarito preliminar oficial](${gabarito}), [justificativas oficiais](${justificativas}).\n`)
console.log(JSON.stringify(relatorio,null,2))
