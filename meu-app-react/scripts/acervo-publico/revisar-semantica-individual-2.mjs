import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const b=await fs.readFile('docs/acervo/revisao-profissional/apos-delimitacao-candidatos.json.gz')
assert.equal(hashRevisao(b),'5d77db39c14e0a4e8a2a2d3bd6b911c3dc42b8de1183f6ced42d1372f4796d76')
const candidatas=JSON.parse(zlib.gunzipSync(b)).filter(q=>q.enunciado.length<=350&&!/\n\s*\n/u.test(q.enunciado))
const alteradas={
 220:['Contabilidade Pública','Mensuração e recuperabilidade de ativos','Comando original menciona explicitamente a redução a valor recuperável no setor público.'],
 225:['Português','Pontuação: dois-pontos e substituição de sinais','Substituição de dois-pontos por vírgula no fim do parágrafo.'],
 230:['Informática','Dados e informação: dados estruturados, semiestruturados e não estruturados','A cobrança é a natureza da estrutura dos dados; HTML é o exemplo.'],
 235:['Economia','Mercado financeiro: títulos públicos e renda fixa','Remuneração dos títulos do Tesouro e indexação ao IPCA; bloco Finanças.'],
 247:['Contabilidade Pública','Orçamento e finanças públicas','Confronto patrimonial, superávit e recursos para despesas; a referência à LOA é incidental.'],
 251:['Informática','Bancos de dados: Big Data e processamento de dados','Dimensão variedade do Big Data e comparação com bancos tradicionais.'],
 252:['Administração','Gestão de pessoas: processos e subsistemas','Classificação de atividades nos processos de aplicar ou manter pessoas.'],
 259:['Administração','Processo administrativo: planejamento, organização, direção e controle','Atividades da função controle; não avaliação individual de pessoal.'],
 264:['Segurança do Trabalho','Saúde ocupacional: PCMSO e exames médicos','Indicação de seleção de pessoal por médico no PCMSO; não recrutamento em RH.'],
 265:['Educação','Legislação e políticas educacionais','Funcionamento e financiamento do Programa Caminho da Escola; pregão é apenas o instrumento.'],
 270:['Administração','Gestão de projetos: PMBOK, escopo e ciclo de vida','Condições de execução e entrega de um projeto; cultura citada como fator.'],
 274:['Administração','Gestão de pessoas: liderança e gestão de conflitos','Papel do líder diante de opiniões divergentes, conflitos e confiança.'],
 275:['Administração Financeira e Orçamentária','Orçamento público: princípios orçamentários','Exceção ao princípio da exclusividade na LOA.'],
 278:['Informática','Bancos de dados: transações e controle de concorrência','Bloqueio otimista e pessimista no Hibernate.'],
 285:['Engenharia Civil','Orçamento de obras: custos, BDI e orçamento de referência','Comando original trata da composição do BDI no orçamento de obras.'],
 286:['Contabilidade Pública','Patrimônio e demonstrações contábeis','Reconhecimento de variação patrimonial aumentativa e natureza do fato contábil.'],
 287:['Informática','Inteligência de negócios: data warehouse, OLAP e ETL','Comparação de arquiteturas ROLAP, MOLAP e HOLAP.'],
 291:['Arquivologia','Princípios arquivísticos: proveniência e organicidade','Origem e fundamento da teoria dos fundos.'],
 298:['Educação','Gestão educacional e planejamento pedagógico','Administração educacional e ação pedagógica; não metodologia geral PMBOK.'],
 315:['Engenharia Civil','Planejamento e controle de obras: cronogramas e acompanhamento','Comando original delimita planejamento e controle de obras de engenharia.'],
 324:['Agronomia','Nutrição vegetal e fertilidade do solo','Exigências de macronutrientes da cultura agrícola; não referenciação de termos de um texto.'],
}
const visuais={
 304:{pagina:1,imagem:'paginas/53767c32d15fdd51-0001.webp',
 enunciado:'Constitui um aspecto importante da cultura organizacional da ANVISA a sua forte relação com organismos internacionais.',
 texto_apoio:'Julgue o item a seguir, relativo à cultura institucional.',
 motivo:'Espaçamento artificial entre letras removido conforme a página; apoio delimitado ao comando do item 2.'},
 305:{pagina:2,imagem:'paginas/9e07da17ce00d312-0002.webp',
 texto_apoio:'A área responsável pela gestão de serviços de tecnologia da informação e comunicação (TIC) da ANVISA deverá atender às duas necessidades apresentadas a seguir, por meio da aplicação da ITIL v4:\n\nI melhorar a gestão de projetos de TIC na ANVISA, a fim de assegurar que os resultados esperados da execução de um projeto sejam atingidos;\nII gerir riscos afetos aos serviços de TIC, minimizando possíveis danos que decorram de eventos indesejáveis ou, ainda, que prejudiquem a ANVISA no alcance dos objetivos com a execução do serviço.\n\nA partir da situação hipotética apresentada, julgue os itens a seguir, referentes à ITIL v4.',
 motivo:'Texto-base com necessidades I e II delimitado à coluna direita da página, sem incorporar item 110 ou bloco COBIT.'},
 316:{pagina:2,imagem:'paginas/a3e949a008f75dd6-0002.webp',
 texto_apoio:'Determinada organização conta com diversos cargos em sua estrutura, distribuídos tanto nas filiais quanto na matriz. Em cada filial, há funções que envolvem a realização dos serviços prestados pela empresa; na matriz estão as funções que correspondem às áreas responsáveis pelo funcionamento do negócio. Todas as vagas são primeiramente divulgadas por meio de um aplicativo denominado Conectize, que pode ser acessado por todos os empregados. Em relação à seleção e ao desenvolvimento de lideranças, a organização busca indivíduos que possuam um bom relacionamento em equipe e interpessoal, boa comunicação e facilidade para negociação. Podem ser selecionados profissionais que já trabalham na organização ou que não fazem parte do quadro de funcionários. Com o intuito de acompanhar o desempenho dos funcionários, a organização adota um processo periódico de avaliação de desempenho: são avaliados, quadrimestralmente (e, de maneira mais informal, diariamente), quesitos como comprometimento, satisfação, respeito às normas e aos procedimentos organizacionais, assiduidade, relacionamento interpessoal, proatividade e produtividade. Os funcionários reclamam de conflitos entre as áreas e de superiores que não dão a devida atenção para agressões verbais entre colegas de áreas diferentes. Além disso, há rivalidade entre equipes de vendas quanto ao alcance das metas estipuladas pela empresa. Os funcionários avaliam que a organização parece incentivar esses atritos, afirmando que a competição é benéfica para as vendas.\n\nA partir da situação hipotética apresentada, julgue os itens a seguir.',
 motivo:'Cenário organizacional dos itens 81 a 85 delimitado, sem incorporar as assertivas anteriores nem a coluna de psicopatologia.'},
}
export const decisoes=candidatas.slice(220,330).map((p,j)=>{const i=j+220;const [materia,conteudo,motivo]=alteradas[i]||[p.depois.materia,p.depois.conteudo,'Objeto cobrado confirmado pela leitura individual do enunciado.'];return {id:p.id,sha256_enunciado:p.sha256_enunciado,indice_revisao:i,materia,conteudo,motivo,visual:visuais[i]}})
const extras=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/falsos-positivos-restantes.json.gz')))
for(const q of extras){
 const m=q.id==='extr-35893fd29bb4c8904df8'?['Educação Física','Legislação e políticas educacionais','LDB e prática facultativa da educação física; não legislação da jornada laboral.']:q.id==='extr-dedba7b02460140a904d'?['Economia','Macroeconomia: política fiscal e sustentabilidade das contas públicas','Premissas macroeconômicas do teto de gastos e trajetória da despesa primária; não concorrência e regulação.']:null
 assert.ok(m);decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:m[0],conteudo:m[1],motivo:m[2]})
}
assert.equal(decisoes.length,112)
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await aplicarRevisoesIndividuais({nome:'revisao-semantica-v2',base:'tmp/revisao-profissional/revisao-semantica-v1/acervo-extraido',decisoes})
