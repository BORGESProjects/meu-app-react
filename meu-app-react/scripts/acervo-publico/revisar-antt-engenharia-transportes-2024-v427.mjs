import fs from 'node:fs/promises'
import path from 'node:path'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-antt-engenharia-transportes-2024-v427',doc='8099a3423efb5efe'
const prova='https://cdn.cebraspe.org.br/concursos/ANTT_23/arquivos/951_ANTT_004_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/ANTT_23/arquivos/GAB_DEFINITIVO_951_ANTT_004_01.PDF'
const concurso='ANTT 2024 — Especialista em Regulação — Cargo 4 — edital 2023'
const cargo='Especialista em Regulação de Serviços de Transportes Terrestres — Cargo 4 — Engenharias Civil, de Produção, de Transportes e Logística, Mecânica, Ambiental, Florestal e de Infraestrutura'
const aplicacao='14/04/2024'
const fontes=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8'))
const fonte=fontes.find(x=>x.id===doc)
if(!fonte||fonte.url!==prova||fonte.arquivo!=='951_ANTT_004_01.PDF')throw Error('Caderno não corresponde ao catálogo oficial da ANTT/CEBRASPE.')
const keyLines=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split(/\r?\n/).map(JSON.parse)
const official=keyLines.find(x=>x.documento_id===doc)
if(!official||official.status!=='tabela_lida'||official.gabarito_url!==gabarito||Object.keys(official.respostas||{}).length!==120)throw Error('Gabarito definitivo oficial incompleto ou de outro caderno.')

const metadata={
 1:['Engenharia Civil','Concessões rodoviárias: obras condicionadas ao tráfego e gatilho volumétrico','Média'],
 2:['Engenharia Civil','Concessões rodoviárias: execução de obras previstas no PER','Média'],
 3:['Direito Administrativo','Concessões de serviços públicos: termo inicial do prazo contratual','Fácil'],
 4:['Direito Administrativo','Concessões rodoviárias: contratação de bens para prestação do serviço','Média'],
 5:['Engenharia Civil','Sinalização temporária em obras rodoviárias','Média'],
 6:['Engenharia Civil','Segurança viária: desnível entre pista e acostamento','Fácil'],
 7:['Engenharia Civil','Planejamento rodoviário: contornos e travessias urbanas','Média'],
 8:['Engenharia Civil','Engenharia de tráfego: interconexões do tipo diamante','Média'],
 9:['Engenharia Civil','Engenharia de tráfego: fluxograma de hora-pico em interseções','Média'],
 10:['Engenharia Civil','Engenharia de tráfego: volumes médios diários e horários de projeto','Fácil'],
 11:['Engenharia Civil','Capacidade e nível de serviço em rodovia de pista simples','Média'],
 12:['Direito Administrativo','Concessões rodoviárias: desconto para usuário frequente','Média'],
 13:['Direito Administrativo','Política tarifária de concessões: diferenciação de tarifas','Média'],
 14:['Legislação de Trânsito','Código de Trânsito Brasileiro: evasão de pedágio','Fácil'],
 15:['Direito Administrativo','Concessões rodoviárias: implantação de sistema free flow','Média'],
 16:['Direito Ambiental','Licenciamento ambiental em rodovias concedidas','Média'],
 17:['Direito Administrativo','Faixa de domínio: regularização de acessos e segurança viária','Média'],
 18:['Direito Administrativo','Autorização de projetos de terceiros em rodovias concedidas','Média'],
 19:['Engenharia Civil','Conservação rodoviária: limpeza de dispositivos de drenagem','Fácil'],
 20:['Engenharia Civil','Conservação rodoviária: manutenção de acessos a obras de arte','Fácil'],
 21:['Engenharia Civil','Níveis de serviço de sistemas rodoviários','Fácil'],
 22:['Engenharia Civil','Níveis de serviço: utilização e qualidade operacional da via','Fácil'],
 23:['Economia','Avaliação socioeconômica de projetos de infraestrutura','Média'],
 24:['Economia','Análise custo-benefício: custo de oportunidade','Fácil'],
 25:['Economia','Estudos de viabilidade técnica, econômica e ambiental (EVTEA)','Fácil'],
 26:['Economia','Análise custo-benefício de políticas e projetos públicos','Média'],
 27:['Direito Administrativo','Política tarifária: free flow e desconto a usuário frequente','Média'],
 28:['Direito Administrativo','Faixa de domínio rodoviária: ocupações irregulares','Média'],
 29:['Direito Ambiental','Avaliação ambiental integrada à análise custo-benefício','Média'],
 30:['Direito Administrativo','Concessões: recomposição do equilíbrio econômico-financeiro','Média'],
 31:['Direito Administrativo','Regulação de transportes: prevalência do contrato de concessão','Média'],
 32:['Engenharia Civil','Manutenção de obras de arte especiais: guarda-corpos','Fácil'],
 33:['Engenharia Civil','Conservação rodoviária: níveis de esforço de limpeza','Média'],
 34:['Engenharia Civil','Pavimentação: manutenção preventiva e controle de cargas','Média'],
 35:['Engenharia Civil','Pavimentação: patologias de revestimentos asfálticos','Média'],
 36:['Engenharia Civil','Manutenção emergencial de rodovias','Fácil'],
 37:['Direito Administrativo','Regulação de transportes: inovação e certificação de projetos','Média'],
 38:['Administração Pública','Pesquisa e desenvolvimento tecnológico em concessões rodoviárias','Fácil'],
 39:['Direito Administrativo','Regulação responsiva: sandbox regulatório da ANTT','Média'],
 40:['Direito Administrativo','Concessões: sanções por emissão de valores mobiliários sem anuência','Média'],
 41:['Direito Administrativo','Sistema Nacional de Viação: competências da ANTT','Média'],
 65:['Engenharia Ferroviária','Sinalização, comunicação e controle operacional ferroviário','Média'],
 66:['Engenharia Ferroviária','Material rodante: composição de trens de carga','Fácil'],
 67:['Engenharia Ferroviária','Via permanente: sistemas de fixação de trilhos','Média'],
 68:['Engenharia Ferroviária','Via permanente: componentes de fixação ferroviária','Fácil'],
 69:['Engenharia Ferroviária','Manutenção mecanizada de vias férreas','Média'],
 70:['Engenharia Ferroviária','Via permanente: degradação e colmatação do sublastro','Média'],
 71:['Engenharia Ferroviária','Manutenção ferroviária: confiabilidade e periodicidade','Média'],
 73:['Engenharia Ferroviária','Operação ferroviária: grade de trens e capacidade','Fácil'],
 74:['Engenharia Ferroviária','Sinalização ferroviária: seções de bloqueio','Média'],
 75:['Engenharia Ferroviária','Programação de trens e janelas de manutenção','Média'],
 76:['Engenharia Ferroviária','Dimensionamento de frota de vagões','Difícil'],
 77:['Engenharia Ferroviária','Pátios ferroviários: capacidade e permanência de vagões','Média'],
 78:['Engenharia Ferroviária','Custos unitários de manutenção: aparelho de mudança de via','Média'],
 79:['Administração','Gestão de ativos ferroviários: estado de conservação de imóveis','Média'],
 80:['Administração','Gestão de ativos ferroviários: controle, manutenção e conformidade patrimonial','Fácil'],
 81:['Logística','Plano Nacional de Logística 2035: participação modal e externalidades','Difícil'],
 82:['Logística','Plano Nacional de Logística 2035: cenários e matriz de transportes','Média'],
 83:['Administração Pública','Plano Nacional de Logística 2035: integração e governança de transportes','Média'],
 84:['Logística','Plano Nacional de Logística 2035: dados de origem e destino de cargas','Média'],
 85:['Logística','Plano Nacional de Logística 2035: cenários de capacidade','Média'],
 86:['Logística','Transporte multimodal de cargas: documentação fiscal e atuação da ANTT','Média'],
 87:['Direito dos Transportes','Transporte multimodal e intermodal: operador e contrato único','Média'],
 88:['Logística','Transporte multimodal de cargas: habilitação de operadores','Fácil'],
 89:['Logística','Transporte multimodal: gargalos de infraestrutura','Fácil'],
 90:['Direito dos Transportes','Transporte multimodal: responsabilidade do operador por subcontratados','Média'],
 91:['Logística','Matriz de transportes: multimodalidade e eficiência logística','Média'],
 93:['Direito Administrativo','Transporte rodoviário de passageiros: avaliação de termos de autorização','Média'],
 95:['Engenharia de Transportes','Transporte semiurbano: cálculo de frequência mínima de viagens','Média'],
 96:['Logística','Planejamento de transportes: eixos e corredores de integração','Média'],
 97:['Geografia','Integração sul-americana: rotas de desenvolvimento e infraestrutura','Fácil'],
 99:['Logística','Matriz de transporte de cargas e densidade da malha rodoviária','Média'],
 102:['Raciocínio Lógico','Lógica de regras: agrupamento de proposições','Média'],
 105:['Estatística','Regressão logística e variáveis categóricas','Média'],
 109:['Tecnologia da Informação','Aprendizado de máquina: gradiente descendente e backpropagation','Difícil'],
 115:['Estatística','Regressão linear em análise preditiva','Fácil'],
 120:['Tecnologia da Informação','Plataforma SAS: arquitetura e ciclo de análise de dados','Fácil']
}
const headings=[
 [1,4,'Um contrato, com prazo de 30 anos, tem como objeto a concessão de determinado sistema rodoviário para a exploração da infraestrutura e a prestação do serviço público de recuperação, operação, manutenção, monitoração, conservação, implantação de melhorias, ampliação de capacidade e manutenção do nível de serviço. A concessão é remunerada, principalmente, pela cobrança de tarifa de pedágio. A partir das informações precedentes, julgue os itens a respeito do controle da execução desse contrato.'],
 [5,7,'Em relação ao Programa de Exploração da Rodovia (PER), bem como aos projetos e às obras de componentes do sistema rodoviário, julgue os itens subsecutivos.'],
 [8,11,'Julgue os itens a seguir, a respeito de engenharia de tráfego, cujo principal objetivo é proporcionar que o trânsito de veículos e pedestres seja realizado com segurança, fluidez e comodidade.'],
 [12,13,'No que concerne às tarifas de pedágio, julgue os itens seguintes.'],
 [14,15,'À luz do Código de Trânsito Brasileiro (CTB) e demais legislações de trânsito para rodovias concedidas, julgue os itens que se seguem.'],
 [16,18,'Julgue os itens subsequentes, a respeito de projetos de interesse de terceiros, da utilização da faixa de domínio e do licenciamento ambiental em rodovias concedidas.'],
 [19,20,'Julgue os próximos itens, em relação à conservação da infraestrutura rodoviária.'],
 [21,22,'Julgue os itens a seguir, a respeito de níveis de serviço de sistemas rodoviários.'],
 [23,26,'No que concerne às relações de custo-benefício e custo-eficácia na avaliação de concessões rodoviárias, julgue os próximos itens.'],
 [27,29,'No que se refere à avaliação de impactos das concessões nas comunidades lindeiras e às políticas tarifárias, julgue os itens subsequentes.'],
 [30,31,'Acerca do controle da execução dos contratos de outorga e das diretrizes gerais da ANTT, julgue os itens que se seguem.'],
 [32,33,'No que diz respeito à manutenção de obras de arte correntes e especiais, julgue os itens subsecutivos.'],
 [34,36,'Com referência às intervenções emergenciais, aos efeitos das cargas no pavimento, à patologia e à terapia de pavimentos rodoviários, julgue os próximos itens.'],
 [37,38,'Acerca de políticas de inovação e regulação dos contratos de concessão, bem como do recurso de desenvolvimento tecnológico (RDT), julgue os itens seguintes.'],
 [39,39,'A instituição do sandbox regulatório é uma iniciativa que, por meio de ambiente controlado pelos reguladores, permite que startups testem projetos inovadores e produtos ou serviços experimentais em mercado real. A esse respeito, julgue o item.'],
 [40,40,'Uma concessionária emitiu títulos e valores mobiliários dando como garantia direitos emergentes da concessão, bens integrantes da concessão ou ações do grupo controlador, sem anuência da ANTT. Com base na Resolução ANTT n.º 4.071/2013, julgue o item.'],
 [41,45,'A respeito da outorga de serviços e do controle da execução dos contratos de outorga, julgue os itens a seguir.'],
 [46,49,'Com base no Decreto n.º 1.832/1996, julgue os próximos itens.'],
 [50,57,'De acordo com a Lei n.º 14.273/2021, julgue os itens que se seguem.'],
 [58,60,'Julgue os itens seguintes, a respeito da operação e do compartilhamento de infraestruturas ferroviárias e do projeto urbanístico do entorno à implantação de ferrovias.'],
 [61,63,'Julgue os itens a seguir, referentes ao modelo de carregamento dinâmico do veículo em sistema massa-mola em via permanente.'],
 [64,64,'Acerca da concepção da marcha de trens, julgue o item.'],
 [65,66,'A respeito do material rodante, da sinalização e da comunicação em vias permanentes, julgue os itens subsequentes.'],
 [67,68,'No que se refere aos acessórios de fixação na ferrovia, julgue os itens a seguir.'],
 [69,71,'Acerca da conservação e manutenção da via ferroviária, julgue os itens subsequentes.'],
 [72,75,'Julgue os próximos itens, relativos à operação ferroviária.'],
 [76,77,'No que se refere a projetos ferroviários, julgue os itens subsequentes.'],
 [78,78,'Julgue o item a respeito de custos em manutenção para ferrovias.'],
 [79,80,'Acerca da administração de ativos ferroviários, julgue os itens seguintes.'],
 [81,85,'Julgue os itens seguintes, relativos ao Plano Nacional de Logística 2035 (PNL 2035).'],
 [86,91,'Julgue os itens a seguir, referentes ao transporte multimodal de cargas (TMC) e ao intermodal de cargas.'],
 [92,95,'Com base na legislação vigente sobre o transporte rodoviário interestadual e internacional de passageiros, regulado pela ANTT, julgue os itens subsequentes.'],
 [96,97,'Considerando que infraestrutura e serviços de transportes adequados e eficientes são fundamentais para a efetiva integração entre as regiões de um país ou entre países, julgue os itens que se seguem.'],
 [98,100,'No que diz respeito aos aspectos físicos, operacionais, econômicos, institucionais e tecnológicos do setor de transportes, julgue os itens seguintes.'],
 [101,105,'Julgue os itens seguintes, em relação a aprendizado supervisionado e não supervisionado.'],
 [106,109,'A respeito de redes neurais artificiais, redes neurais convolucionais e processamento de linguagem natural, julgue os itens a seguir.'],
 [110,111,'Acerca do processo ETL (extrair, transformar, carregar) e da manipulação, tratamento e visualização de dados, julgue os itens que se seguem.'],
 [112,115,'Em relação à inteligência artificial e a suas técnicas, bem como aos sistemas de recomendação, julgue os itens subsequentes.'],
 [116,117,'No que se refere a deep learning e mineração de dados, julgue os itens subsecutivos.'],
 [118,120,'Julgue os itens a seguir, relativos à ferramenta SAS (Statistical Analysis Software).']
]
const annulled=new Set(Object.entries(official.respostas).filter(([,v])=>v==='X').map(([n])=>Number(n)))
const pending=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(pending.length!==77||new Set(pending.map(q=>q.id)).size!==77||new Set(pending.map(q=>q.numero)).size!==77)throw Error('A fila mudou: esperados 77 registros únicos.')
const semPendencias=['classificacao_especifica_pendente','ano_sem_evidencia','integridade_visual_pendente','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']
function textFor(q){
 const n=Number(q.numero)
 if(n===95)return 'Considere os dados de uma ligação de transporte rodoviário interestadual semiurbano de passageiros. Demanda média aferida em um sentido, nos dias úteis, nos últimos 12 meses completos: janeiro 363; fevereiro 405; março 501; abril 770; maio 650; junho 512; julho 413; agosto 743; setembro 655; outubro 667; novembro 708; dezembro 333 passageiros. Considere também a capacidade do veículo de 70 passageiros, somados os passageiros em pé e sentados. Nessa situação, a frequência mínima a ser oferecida por dia útil é de 8 viagens por sentido para a referida ligação.'
 if(n===102)return 'No modelo a seguir, que contém regras envolvendo os itens A, B, C, D, E, F, G e H, as regras 1 e 2 pertencem a um mesmo grupo de regras. Regras: 1. [A] + [B] → [C]; 2. [D] → [E]; 3. [D] → [A]; 4. [F] → [G]; 5. [F] → [H].'
 let s=q.enunciado.replace(/\s+/g,' ').trim()
 const cuts={13:'À luz do Código de Trânsito Brasileiro',15:'CEBRASPE – ANTT – Edital',38:'A esse respeito, julgue o item',39:'A respeito da situação hipotética apresentada',77:'Julgue o item a seguir, a respeito de custos',91:'Com base na legislação vigente sobre o transporte rodoviário',93:'Considerando que infraestrutura e serviços de transportes',95:'Considerando que infraestrutura e serviços de transportes'}
 const cut=cuts[n];if(cut&&s.includes(cut))s=s.slice(0,s.indexOf(cut)).trim()
 if(n===109)s=s.replace(/^Umas das principais/,'Uma das principais')
 return s
}
const decisions=pending.map(q=>{
 const n=Number(q.numero),meta=metadata[n],group=headings.find(([a,b])=>n>=a&&n<=b),key=official.respostas[String(n)]
 if(!meta||!group||!key)throw Error(`Questão ${n} sem classificação, contexto ou gabarito oficial.`)
 const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,annul=key==='X',stem=textFor(q)
 if(stem.length<20)throw Error(`Enunciado incompleto no item ${n}.`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,materia:meta[0],conteudo:meta[1],ano:2024,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao,cargo,numero_original:n,numero:n,pagina:page,dificuldade:meta[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; a banca não publicou parâmetro psicométrico de dificuldade. Atribuída pela especificidade técnica e inferência necessária.',classificacao_fonte:prova,motivo:`Classificação individual pelo conteúdo do item e pelo comando correspondente no caderno oficial ANTT, Cargo 4. Aplicação em 14/04/2024, conforme gabarito definitivo.`,resposta_correta:annul?null:key==='C'?0:1,anulada:annul,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'GAB_DEFINITIVO_951_ANTT_004_01.PDF',prova:'951_ANTT_004_01.PDF',sha256:official.sha256,numero:n,pagina:1,criterio:'Gabarito oficial definitivo CEBRASPE, Cargo 4, itens 1–120; anulados indicados como X.'},texto_apoio:group[2],imagens_contexto:[{pagina:page,imagem:image,text:group[2]}],reemplazarContexto:true,visual:{pagina:page,imagem:image,enunciado:stem,texto_apoio:group[2],motivo:'Transcrição e contexto conferidos com a página correspondente do caderno oficial; imagem original preservada, incluindo tabela e diagrama nos itens 95 e 102.'},apta_resolucao:true,remover_pendencias:semPendencias}
})
if(decisions.length!==77||decisions.filter(d=>d.anulada).length!==5)throw Error('Esperados 77 itens, dos quais 5 anulados oficialmente.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:decisions.length,itens_unicos:77,anulados:decisions.filter(x=>x.anulada).map(x=>x.numero),gabarito_oficial_cobertura:Object.keys(official.respostas).length,textos_base_revisados:77,imagens_com_tabela_e_diagrama_preservadas:true,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const report={...result,documento:doc,concurso,aplicacao,itens_unicos:77,registros_revisados:77,itens_anulados_conforme_gabarito:decisions.filter(d=>d.anulada).map(d=>d.numero),gabaritos_definitivos_vinculados:77,transcricoes_conferidas_visualmente:77,tabela_e_diagrama_transcritos:true,fonte_prova:prova,fonte_gabarito:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
