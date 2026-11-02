import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='71754357fa8d65f8'
const prova='https://cdn.cebraspe.org.br/concursos/DEPEN_20/arquivos/MATRIZ_541_DEPEN_006_00.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/DEPEN_20/arquivos/GAB_DEFINITIVO_MATRIZ_541_DEPEN_006_00.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==51)throw Error('Catálogo do DEPEN 2020, Cargo 6, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-udesc-jornalista-2026-v176'))
if(start<0)throw Error('Base v176 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==51)throw Error(`Esperados 51 itens, encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const topics=new Map([
 [40,['Execução Penal','Lei de Execução Penal: competências do Conselho Nacional de Política Criminal e Penitenciária']],
 [41,['Serviço Social','Atribuições privativas: coordenação e avaliação de programas, estudos e projetos sociais']],
 [42,['Serviço Social','Competências profissionais: assessoria e consultoria em matéria de Serviço Social']],
 [43,['Serviço Social','Gestão do trabalho do assistente social: planejamento e administração de programas e projetos']],
 [44,['Serviço Social','Estudo socioeconômico: finalidade e atuação profissional na concessão de benefícios']],
 [45,['Ética Profissional em Serviço Social','Código de Ética: sigilo profissional e comunicação mínima necessária em equipe']],
 [46,['Ética Profissional em Serviço Social','Sigilo profissional: proteção de informações pessoais e familiares dos usuários']],
 [47,['Ética Profissional em Serviço Social','Quebra de sigilo: limites, justa causa e proteção de direitos']],
 [48,['Planejamento Social','Instrumentos de planejamento: plano como conjunto de ações específicas']],
 [49,['Planejamento Social','Instrumentos de gestão: programa, projetos e objetivos de políticas públicas']],
 [50,['Planejamento Social','Instrumentos de planejamento: projeto, diagnóstico e definição de intervenções']],
 [51,['Serviço Social','Dimensão investigativa: constituição do exercício profissional']],
 [52,['Serviço Social','Pesquisa e produção de conhecimento na prática profissional contemporânea']],
 [53,['Serviço Social','Entrevista social e dimensão investigativa do trabalho profissional']],
 [54,['Planejamento Social','Projeto de intervenção: demandas sociais, objetivos e participação dos usuários']],
 [55,['Serviço Social','Trabalho profissional: autonomia técnica e relação entre demandas institucionais e projeto ético-político']],
 [56,['Teoria Social','Método dialético-crítico e interpretação da questão social no capitalismo']],
 [57,['Serviço Social','Regulamentação profissional e Código de Ética como referências do trabalho']],
 [58,['Teoria Social','Questão social: crítica às interpretações positivistas e individualizantes']],
 [59,['Teoria Social','Marx e questão social: processos sociais e contradições do capitalismo']],
 [60,['Teoria Social','Desigualdade de classes e interpretação coletiva da questão social']],
 [61,['Políticas Sociais','Neoliberalismo, direitos sociais e implementação de políticas públicas']],
 [62,['Políticas Sociais','Enfrentamento da questão social e universalidade das políticas públicas']],
 [63,['Serviço Social','Processo de entrevista: planejamento como mediação teórico-metodológica']],
 [64,['Serviço Social','Entrevista social: definição de objetivos e seleção de instrumentos de coleta']],
 [65,['Serviço Social','Estudo social: atribuição profissional e produção de conhecimento técnico']],
 [66,['Serviço Social','Relatório social, informe e laudo: finalidade e distinções documentais']],
 [67,['Serviço Social','Instrumentos técnico-operativos: visita domiciliar no campo sociojurídico']],
 [68,['Serviço Social','Documentos técnicos: contralaudo e análise crítica de laudo social']],
 [69,['Serviço Social','Instrumentalidade: mediação entre instrumentos, técnicas e objetivos profissionais']],
 [70,['Serviço Social','Dimensão técnico-operativa e debate profissional contemporâneo']],
 [71,['Serviço Social','Instrumentalidade e transformação da realidade na intervenção profissional']],
 [72,['Serviço Social','Prática profissional reflexiva e relação entre teoria e intervenção']],
 [73,['Serviço Social','Trabalho interdisciplinar e diálogo entre áreas profissionais']],
 [74,['Serviço Social','Trabalho multiprofissional: definição de papéis e responsabilidades']],
 [75,['Políticas de Saúde','Política Nacional de Atenção Integral à Saúde do Homem: acesso e cuidado integral']],
 [76,['Políticas de Saúde','Política de saúde do homem: integralidade e níveis de atenção']],
 [77,['Políticas Sociais','População em situação de rua: acesso a direitos e programas de transferência de renda']],
 [78,['Direitos da Pessoa com Deficiência','Estatuto da Pessoa com Deficiência: inclusão, atendimento prioritário e acessibilidade']],
 [79,['Direitos dos Povos Indígenas','Estatuto do Índio: terras indígenas, patrimônio da União e recursos naturais']],
 [80,['Assistência Social','BPC/LOAS: critérios de elegibilidade e cálculo de renda familiar']],
 [81,['Assistência Social','BPC: uso indevido de cartão magnético e responsabilização penal']],
 [82,['Assistência Social','Benefício de Prestação Continuada e auxílio-inclusão: requisitos legais']],
 [83,['Assistência Social','BPC e aprendizagem profissional: efeitos da atividade remunerada sobre o benefício']],
 [84,['Assistência Social','BPC: critério de renda familiar e avaliação de vulnerabilidade socioeconômica']],
 [85,['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: medidas protetivas e acompanhamento psicossocial em violência familiar']],
 [86,['Direitos da Pessoa Idosa','Direito à saúde da pessoa idosa: medicamentos, próteses e reabilitação']],
 [87,['Direitos da Pessoa Idosa','Prioridade processual especial para pessoas com idade igual ou superior a 80 anos']],
 [88,['Direito Previdenciário','Benefício por incapacidade temporária: carência, qualidade de segurado e duração do afastamento']],
 [89,['Políticas Educacionais','Plano Nacional de Educação: universalização do ensino fundamental e atendimento a populações itinerantes']],
 [90,['Políticas Educacionais','Plano Nacional de Educação: alfabetização de adultos e responsabilidades federativas']]
])
const context={
 privativas:'Contexto: o enunciado do caderno apresenta as atribuições privativas do assistente social e distingue essas atribuições das competências compartilhadas com outras profissões.',
 sigilo:'Contexto: cada item descreve uma situação hipotética de atendimento e afirma uma conduta relacionada ao sigilo profissional do assistente social.',
 investigativa:'A dimensão investigativa no âmbito do Serviço Social:',
 quote:'Texto-base: “Um dos grandes desafios hoje colocados aos assistentes sociais consiste em formular projetos que materializarão o trabalho a ser desenvolvido. Cada vez mais, é imperativo ao assistente social identificar aquilo que requer a intervenção profissional, bem como reconhecer de que forma essa intervenção irá responder às necessidades sociais que, transformadas em demandas, serão privilegiadas nos processos de trabalho nos quais a profissão é requerida.” — Berenice Rojas Couto (2009).',
 social:'Contexto: itens sobre questão social e direitos de cidadania, com referência às desigualdades de classe e à organização das políticas sociais.',
 entrevista:'Contexto: itens referentes aos instrumentais técnico-operativos utilizados pelo assistente social.',
 operativa:'Contexto: itens sobre dimensão técnico-operativa do Serviço Social e debates sobre instrumentos e técnicas profissionais.',
 equipe:'Contexto: itens sobre atuação em equipes multiprofissionais e interdisciplinares.',
 politicas:'Contexto: itens sobre políticas e programas sociais destinados a populações específicas.',
 mario:'Situação-base: Mário, pessoa com deficiência de 14 anos, vive em São Paulo com os pais e os irmãos João e Antônio, de 17 e 19 anos, respectivamente. A renda familiar vem do emprego do pai e corresponde a um salário mínimo. Considere que Mário tem direito ao Benefício de Prestação Continuada (BPC).',
 familia:'Situação-base: Marina, de 70 anos, e Marcos, de 81, são casados e vivem com o filho Luís. Marcos é servidor público federal aposentado; Luís, após quatro anos desempregado, foi admitido em uma empresa privada e tem carteira assinada há cinco meses.',
 pne:'Contexto: itens relativos ao Plano Nacional de Educação do Brasil.'
}
const repairs=new Map([
 ['extr-4a3cd44545e504450f67','Cabe ao Conselho Nacional de Política Criminal e Penitenciária, entre outras incumbências, representar à autoridade competente quanto à interdição, no todo ou em parte, de estabelecimento penal.'],
 ['extr-534b25097f9b0876fd30','Realizar estudos socioeconômicos com os usuários para fins de benefícios e serviços sociais junto a órgãos da administração pública direta e indireta, empresas privadas e outras entidades.'],
 ['extr-ec1f37ba137107f4846a','A dimensão investigativa no âmbito do Serviço Social deve ser compreendida como parte constitutiva do exercício profissional.'],
 ['extr-c79ea7f926d49bf4db78','A dimensão investigativa no âmbito do Serviço Social passou a ser requisitada com maior ênfase, a partir do início dos anos 2000, como exigência para construção da prática profissional.'],
 ['extr-715db00ff6d0c64c8351','A dimensão investigativa no âmbito do Serviço Social é exercida sempre que o assistente social realiza entrevistas.'],
 ['extr-534b25097f9b0876fd30','Realizar estudos socioeconômicos com os usuários para fins de benefícios e serviços sociais junto a órgãos da administração pública direta e indireta, empresas privadas e outras entidades.'],
 ['extr-691d032f2af9f2b74367','O assistente social avaliou ser pertinente quebrar o sigilo profissional em determinado caso e, ao fazê-lo, tomou as devidas cautelas. Nessa situação, o assistente social deverá revelar todo o conteúdo abordado à equipe técnica, para demonstrar que não oculta nenhuma informação que possa ser considerada relevante.'],
 ['extr-a68add7231baf329a7b2','A escolha do referencial dialético-crítico indica que o profissional está pautado por uma visão de mundo que compreende as manifestações da questão social como consequências do capitalismo.'],
 ['extr-a5b9edbd6a43643f0390','Apresentado por assistentes sociais que atuam na Defensoria Pública, o contralaudo visa apresentar elementos que reafirmem o laudo apresentado pelo assistente social perito.'],
 ['extr-6694900095413cd7b35d','Considera-se prática irrefletida aquela que não ultrapassa o nível da imediaticidade, estabelecendo uma radical distância entre a elaboração teórica e a intervenção profissional.'],
 ['extr-83a6a95954943568aa3e','O Estatuto do Índio define como patrimônio da União os bens e as terras povoadas pelos índios, sendo considerado um bem alienável e, portanto, passível de exploração de riquezas naturais.'],
 ['extr-23f3624948cf331dabf9','Dada a situação de pandemia de covid-19, o critério para a medição da renda mensal per capita da família de Mário em relação ao BPC poderá ser aumentado para até meio salário mínimo.']
])

const decisions=[]
for(const q of active.values()){
 const e=entries.get(q.id);if(!e)throw Error(`Registro sem catálogo: ${q.id}`)
 const n=Number(q.numero_original||q.numero),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 const [materia,conteudo]=topics.get(n)||[]
 if(!materia||!conteudo)throw Error(`Classificação ausente: item ${n}`)
 let texto_apoio=''
 if(n>=41&&n<=44)texto_apoio=context.privativas
 if(n>=45&&n<=47)texto_apoio=context.sigilo
 if(n>=51&&n<=53)texto_apoio=context.investigativa
 if(n>=54&&n<=57)texto_apoio=context.quote
 if(n>=58&&n<=62)texto_apoio=context.social
 if(n>=63&&n<=68)texto_apoio=context.entrevista
 if(n>=69&&n<=72)texto_apoio=context.operativa
 if(n>=73&&n<=74)texto_apoio=context.equipe
 if(n>=75&&n<=79)texto_apoio=context.politicas
 if(n>=80&&n<=84)texto_apoio=context.mario
 if(n>=85&&n<=88)texto_apoio=context.familia
 if(n>=89&&n<=90)texto_apoio=context.pne
 const enunciado=repairs.get(q.id)||q.enunciado
 if(!enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Enunciado/tipo inesperado: item ${n}`)
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,concurso:'DEPEN 2020 — Cargo 6: Especialista Federal em Assistência à Execução Penal — Serviço Social (prova aplicada em 2021)',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo domínio normativo, conceitual e aplicado; o Cebraspe não divulga dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Matéria e conteúdo definidos pela leitura do item, de seu texto-base e do programa oficial do cargo de Serviço Social.`,visual:{pagina:page,imagem:image,texto_apoio,motivo:'Página original do caderno vinculada; textos-base comuns aos blocos foram transcritos e associados aos itens correspondentes.'},enunciado,texto_apoio,apta_resolucao:true})
}
const numbers=new Set(decisions.map(d=>Number(d.numero_original)))
if(decisions.length!==51||numbers.size!==51||![...Array(51)].every((_,i)=>numbers.has(i+40)))throw Error(`Cobertura esperada 40–90 divergente: ${decisions.length} itens, ${numbers.size} números`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,questoes_pendentes_antes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,paginas:[4,5,6,7],contextos_associados:decisions.filter(d=>d.texto_apoio).length,classes:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(s=>[s,decisions.filter(d=>d.materia===s).length])),prova,gabarito},null,2));process.exit(0)}
const name='revisao-depen-servico-social-2021-v177'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:decisions.length,itens_unicos:51,cobertura_numerica:'40–90 sem lacunas',contextos_textuais_associados:decisions.filter(d=>d.texto_apoio).length,paginas_originais_conferidas:[4,5,6,7],fonte_gabarito_oficial:gabarito,gabaritos_sem_alteracao:true,publicado:false,prova,fonte_catalogo:'https://www.cebraspe.org.br/concursos/depen_20'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
