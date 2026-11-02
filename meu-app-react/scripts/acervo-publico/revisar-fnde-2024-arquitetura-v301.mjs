import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fnde-2024-arquitetura-v301',doc='a4275f77510c3acc'
const prova='https://cdn.cebraspe.org.br/concursos/FNDE_24_PSS/arquivos/998_FNDEINFRA_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/fnde_24_pss/arquivos/GAB_DEFINITIVO_998_FNDEINFRA_001_01.PDF'
const base=raizesAtuais.find(x=>x.includes('revisao-cnj-2024-engenharia-eletrica-v300'))
if(!base)throw Error('Base local v300 não encontrada')
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='998_FNDEINFRA_001_01.PDF'||catalog.questoes.length!==76)throw Error('Caderno FNDE Cargo 1 divergente')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==73)throw Error(`Esperados 73 registros pendentes, recebidos ${records.length}`)

// A extração duplicou cinco itens e deslocou 60 e 62–64 para 80 e 82–84.
const correctedNumber={
 'extr-0279b65a3154b5edf148':60,
 'extr-07b0d3b3841418c7da49':61,
 'extr-0ad1d1bfa014a9bc03db':62,
 'extr-4cfce5518751e68ef542':63,
 'extr-963d4e899efffeca5aed':64
}
const duplicatePairs={
 'extr-b0386f0b3811f886d699':'extr-72a1950fde0fc4d23ac2',
 'extr-efe018d2cc0821f65fe0':'extr-9591ed3ad9d59abd9bba',
 'extr-ddf01f91e29119d9a30f':'extr-a6cd3251a9fc2d69cb43',
 'extr-b6b950eb147798254971':'extr-2c75d6d023f88994abac',
 'extr-07b0d3b3841418c7da49':'extr-1e72aad79d570bf99684'
}
const trueFalseAnswers={
 51:'C',52:'C',53:'C',54:'C',55:'E',56:'E',57:'E',58:'E',59:'E',60:'C',61:'C',62:'E',63:'C',64:'C',65:'C',66:'C',67:'E',68:'E',69:'C',70:'C',
 71:'E',72:'C',73:'C',74:'E',75:'C',76:'E',77:'C',78:'C',79:'E',80:'E',81:'E',82:'C',83:'E',84:'C',85:'E',86:'C',87:'E',88:'E',89:'E',90:'C',
 91:'C',92:'E',93:'E',94:'C',95:'E',96:'E',97:'E',98:'C',99:'E',100:'C',101:'E',102:'C',103:'E',104:'C',105:'C',106:'C',107:'E',108:'E',109:'C',110:'C',
 111:'E',112:'C',113:'C',114:'E',115:'C',116:'E',117:'E',118:'C',119:'E',120:'E'
}
const topics={
 51:['Urbanismo','Morfologia urbana: orientabilidade e identificabilidade'],52:['Urbanismo','Percepção da paisagem urbana: pregnância'],53:['Urbanismo','Percepção urbana: legibilidade e originalidade'],
 54:['Urbanismo','Brasília: patrimônio cultural e urbanismo moderno'],55:['História da Arquitetura e do Urbanismo','Brasília: autoria de obras e conjuntos urbanos'],56:['Urbanismo','Brasília: crescimento e classificação urbana'],57:['Urbanismo','Plano Piloto de Brasília: concepção urbanística'],
 58:['Patrimônio Histórico e Cultural','Cartas patrimoniais: Carta de Washington e patrimônio urbano'],59:['Patrimônio Histórico e Cultural','Carta de Veneza e conceito de monumento histórico'],60:['Patrimônio Histórico e Cultural','Jardins históricos: Cartas de Florença e de Juiz de Fora'],
 61:['Urbanismo','Parcelamento do solo: infraestrutura e saneamento'],62:['Urbanismo','Parcelamento do solo urbano: loteamento e sistema viário'],63:['Legislação Urbanística','Estatuto da Cidade: operações urbanas consorciadas'],64:['Legislação Urbanística','Estatuto da Cidade: instrumentos da política urbana'],
 65:['Projeto de Arquitetura','Documentação de projeto: memorial descritivo'],66:['Tecnologia da Construção','Componentes da edificação e sistemas prediais'],67:['Desenho Técnico','Convenções gráficas: tipos de linha'],68:['Desenho Assistido por Computador','Referenciamento por malha e coordenadas em CAD'],
 69:['Instalações Hidrossanitárias','Aquecimento solar: dimensionamento e pressão do reservatório'],70:['Instalações Hidrossanitárias','Aquecimento solar: componentes do coletor térmico'],71:['Instalações Hidrossanitárias','Aquecimento solar: circulação por termossifão'],72:['Instalações Hidrossanitárias','Aquecimento solar: reservatório térmico e boiler'],
 73:['Ergonomia','NR-17: apoio para os pés e adaptação antropométrica'],74:['Ergonomia','NR-17: alternância entre trabalho sentado e em pé'],75:['Ergonomia','Mobiliário de trabalho: regulagens e antropometria'],
 76:['Conforto Ambiental','Conforto térmico: proteção solar de fachadas'],77:['Conforto Ambiental','Paisagismo: vegetação, microclima e controle ambiental'],78:['Conforto Ambiental','Ventilação natural: posicionamento de aberturas'],79:['Conforto Ambiental','Ventilação natural: relação entre aberturas e velocidade do ar'],80:['Conforto Ambiental','Acústica arquitetônica: condicionamento e reverberação'],81:['Conforto Ambiental','Acústica arquitetônica: isolamento sonoro'],
 82:['Estruturas','Estruturas de madeira: ligações e mecanismos de conexão'],83:['Desenho Técnico','Representação arquitetônica: espessuras e tipos de traço'],84:['Estruturas','Concepção estrutural: projeto arquitetônico e sondagem geotécnica'],85:['Estruturas','Concreto armado: comportamento à tração e materiais'],86:['Estruturas','Estruturas de aço: perfis soldados'],
 87:['Instalações Elétricas','SPDA: integração de equipamentos instalados na cobertura'],88:['Instalações Mecânicas','Elevadores: casa de máquinas e componentes'],89:['Instalações Elétricas','Comandos de iluminação: interruptores paralelos'],90:['Instalações Hidrossanitárias','Reservatórios de água: estimativa de demanda'],
 91:['Tecnologia da Construção','Esquadrias: funcionamento de janela camarão'],92:['Tecnologia da Construção','Alvenaria estrutural: paredes, pilares e vigas'],93:['Tecnologia da Construção','Vidros na construção: vidro aramado e laminado'],94:['Tecnologia da Construção','Coberturas: platibandas e telhados embutidos'],
 95:['Acessibilidade','Acessibilidade em escolas: mobiliário acessível e espaços para cadeira de rodas'],96:['Acessibilidade','Acessibilidade escolar: acesso e circulação no entorno'],
 97:['Legislação Profissional','Direitos autorais e alteração de projeto arquitetônico'],98:['Legislação Profissional','Atribuições profissionais: estudos de viabilidade'],99:['Patrimônio Histórico e Cultural','Conservação e restauração de edificações'],100:['Perícias e Avaliações','Laudo técnico e atividade pericial'],101:['Legislação Profissional','Registro profissional e identidade civil'],102:['Legislação Profissional','Atribuições profissionais de arquitetura e urbanismo'],
 103:['Obras Públicas','Contratos administrativos: atraso e paralisação de obra'],104:['Orçamento de Obras','Contratação semi-integrada e orçamento sintético'],105:['Licenciamento Ambiental','Princípios aplicáveis ao licenciamento de obras'],106:['Obras Públicas','Recebimento provisório e definitivo do objeto'],107:['Fiscalização de Obras','Ensaios, provas e controle de qualidade contratual'],108:['Orçamento de Obras','Empreitada por preço unitário e medição'],
 109:['BIM','Legislação BIM: etapas e atividades de projeto'],110:['BIM','Contratações públicas: adoção do BIM em licitações'],111:['BIM','Estratégia BIM BR: disseminação e governança'],112:['Projeto de Arquitetura','Obras de arte especiais: requisitos de projeto'],113:['Gestão de Obras','Ciclo de vida da construção: execução e comissionamento'],114:['BIM','Decreto nº 10.306/2020: implementação gradual do BIM'],
 115:['BIM','Estratégia BIM BR: Grupo de Assessoramento Técnico'],116:['BIM','Estratégia BIM BR: reuniões do Comitê Gestor'],117:['BIM','Estratégia BIM BR: composição do Comitê Gestor'],118:['BIM','Estratégia BIM BR: capacitação profissional'],119:['Orçamento de Obras','Orçamento de referência: análise paramétrica em projetos padronizados'],120:['Orçamento de Obras','Orçamento de referência: preço global de referência']
}
const pageFor=n=>n<=64?1:n<=81?2:n<=108?3:4
const hard=new Set([51,53,58,60,62,63,64,68,69,71,76,78,79,80,81,84,87,90,92,95,97,99,103,104,105,108,109,110,114,119,120])
const easy=new Set([52,55,59,65,66,67,70,72,74,77,82,83,85,86,88,89,91,94,98,100,101,112,113,117,118])
const cleanStem={
 'extr-efe018d2cc0821f65fe0':'A relação entre a forma dos lugares e o sujeito que a observa pode ser investigada segundo qualidades semânticas como legibilidade e originalidade.',
 'extr-9591ed3ad9d59abd9bba':'A relação entre a forma dos lugares e o sujeito que a observa pode ser investigada segundo qualidades semânticas como legibilidade e originalidade.',
 'extr-7b00c28f6fa893eb2eb1':'As concepções originais do urbanista Lucio Costa para Brasília foram implementadas e até hoje vigoram de acordo com o partido urbanístico de 1950.',
 'extr-aa1b0beddd8ca3a267e6':'A escolha de um reservatório térmico em relação à alta ou baixa pressão depende da força exercida pela água sobre ele, que varia de acordo com a altura em metros da coluna d’água até o local onde o reservatório será instalado; se essa altura medir até 5 metros, pode-se usar um reservatório térmico para baixa pressão.',
 'extr-14fe12f64c2f33d0b79d':'No sistema representado na figura, a água circula entre os coletores e o reservatório pelo processo de termofissão, no qual a água dos coletores, que é mais quente que a água do reservatório e, portanto, mais densa que esta, é empurrada pela água fria, menos densa, para dentro do reservatório, o que gera a circulação do fluido.',
 'extr-102':'',
 'extr-db7f7a7bd0b3dc1382b4':'A elaboração e interpretação de levantamentos topográficos e a aplicação das técnicas de conforto ambiental são campos de atuação do setor de arquitetura e urbanismo.',
 'extr-7eae91dd2804063fcf4f':'Estimular a capacitação em BIM é um dos objetivos da Estratégia BIM BR.',
 'extr-3eb8445c92895c928feb':'O preço global de referência consiste no valor resultante do somatório dos custos totais de referência de todos os serviços necessários à plena execução da obra ou do serviço de engenharia.'
}
const contexts={
 51:'Considerando conceitos fundamentais em arquitetura e urbanismo, julgue os itens seguintes.',
 54:'Trecho de Lucio Costa, Relatório do Plano Piloto de Brasília, 4.ª edição, Brasília: IPHAN, 2018, p. 12 (com adaptações). A partir do texto apresentado, julgue os itens a seguir.',
 58:'Acerca das cartas patrimoniais e de sua relevância para a discussão do patrimônio cultural, julgue os itens subsequentes.',
 61:'Com referência ao parcelamento do solo no planejamento e projeto urbanos, julgue os itens seguintes.',
 65:'Julgue os itens subsequentes, em relação à representação, aos métodos e às técnicas de desenho.',
 69:'A figura da página 2 representa um sistema solar térmico. Com base nela, julgue os itens seguintes; mantenha visíveis a placa coletora (1), o reservatório térmico (2) e as setas de circulação.',
 73:'A respeito de ergonomia, julgue os itens a seguir.',
 76:'No que se refere ao conforto térmico, julgue os itens a seguir.',
 80:'Acerca do tratamento acústico em recintos fechados, julgue os itens seguintes.',
 82:'A respeito de cálculo estrutural e leitura, representação e detalhamento de projetos complementares em arquitetura, julgue os itens seguintes.',
 87:'Acerca de projetos complementares, instalações e equipamentos em arquitetura, julgue os itens seguintes.',
 91:'No que se refere a sistemas construtivos e detalhes da construção de um edifício, julgue os itens seguintes.',
 95:'A respeito da acessibilidade a edificações e ao mobiliário em ambientes escolares, julgue os itens a seguir, de acordo com a ABNT NBR 9050:2020.',
 97:'Com base nas normas e legislações pertinentes ao exercício, às atividades e atribuições profissionais do arquiteto e urbanista, julgue os itens a seguir.',
 103:'Com base na legislação pertinente às atividades de acompanhamento e fiscalização de obras públicas, julgue os itens seguintes.',
 109:'Julgue os itens seguintes com base na legislação pertinente ao BIM (building information modelling).',
 115:'Julgue os itens a seguir em relação à Estratégia Nacional de Disseminação do BIM no Brasil (Estratégia BIM BR), conforme o Decreto nº 11.888/2024.',
 119:'A respeito das regras e dos critérios para a elaboração do orçamento de referência de obras, julgue os itens seguintes com base no Decreto nº 7.983/2013.'
}
const contextFor=n=>Object.entries(contexts).filter(([start])=>n>=Number(start)).at(-1)?.[1]||''
const duplicateKeeper=new Map(Object.entries(duplicatePairs))
const decisions=[]
for(const q of records){
 const n=correctedNumber[q.id]||q.numero,topic=topics[n],answer=trueFalseAnswers[n]
 if(!topic||!answer)throw Error(`Falta classificação ou gabarito no item ${n} (${q.id})`)
 const page=pageFor(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,baseDecision={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2024,concurso:'FNDE 2024 — Arquiteto e Urbanista (Cargo 1)',numero:n,numero_original:n,pagina:page,classificacao_fonte:prova,resposta_correta:answer==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_998_FNDEINFRA_001_01.PDF',prova:catalog.arquivo,numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 1, conferido na tabela oficial.'},dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e normativa; não é classificação publicada pela banca.',classificacao_evidencia:`Item ${n}, conferido visualmente na página ${page} do caderno oficial e classificado pelo conteúdo específico.`,motivo:`FNDE 2024, Cargo 1 — item ${n}; fonte primária: caderno oficial e gabarito definitivo.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],visual:{pagina:page,imagem:image,motivo:'Página original revisada visualmente; mantém figuras e contexto da questão.'}}
 const corrected=cleanStem[q.id]
 if(corrected!==undefined)baseDecision.visual.enunciado=corrected
 const context=contextFor(n);if(context)baseDecision.visual.texto_apoio=context
 const keeperId=duplicateKeeper.get(q.id)
 if(keeperId){baseDecision.apta_resolucao=false;baseDecision.inelegibilidade_motivo=`Duplicata OCR do item ${n}; foi preservado o registro ${keeperId}.`;baseDecision.duplicada_de=keeperId;baseDecision.motivo=baseDecision.inelegibilidade_motivo}
 decisions.push(baseDecision)
}
if(decisions.length!==records.length)throw Error('Quantidade de decisões não confere')
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const unique=new Set(decisions.filter(x=>x.apta_resolucao).map(x=>x.numero))
if(unique.size!==68)throw Error(`Esperados 68 itens únicos elegíveis, encontrados ${unique.size}`)
const out={...result,documento:catalog.arquivo,documento_id:doc,cargo:'Arquiteto e Urbanista (Cargo 1)',ano_aplicacao:'2024-09-29',registros_revistos:records.length,questoes_unicas:unique.size,duplicatas_inelegiveis:records.length-unique.size,paginas_visuais_conferidas:[1,2,3,4],itens_com_contexto_preservado:Object.keys(contexts).length,prova_oficial:prova,gabarito_oficial:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
const section=`\n\n## Revisão FNDE 2024 — Arquiteto e Urbanista, Cargo 1 — v301\n\n- Revisei ${records.length} registros pendentes do caderno oficial. Corrigi a numeração OCR dos itens 60 e 62–64 e marquei ${records.length-unique.size} duplicatas OCR como inelegíveis; permaneceram ${unique.size} itens únicos disponíveis.\n- Classifiquei os itens por matéria e conteúdo, associei gabarito definitivo, ano, cargo e dificuldade estimada, e liguei cada item à página original. Preservei os enunciados compartilhados e o diagrama do sistema solar térmico como contexto visual.\n- Corrigi erros de OCR observados nos itens com texto contaminado e conferi as páginas 1–4. Resultado local: ${out.total} questões, ${out.disponiveis} disponíveis e ${out.pendentes} pendentes; ainda não publicado na nuvem.\n- Fontes oficiais: [caderno](${prova}); [gabarito definitivo](${gabarito}).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
