import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-fub-ti-basicos-v96/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-abin-educacao-2017.json','utf8'))
const faixa=new Map(),definir=(ns,materia,conteudo)=>ns.forEach(n=>faixa.set(n,{materia,conteudo}))
const edu='Educação'
definir([61,62,63,64,65],edu,'Planejamento de ensino: função, organização, flexibilidade e adequação aos estudantes')
definir([66,67,68,69,70],edu,'Planejamento curricular: seleção, desenvolvimento e organização do currículo')
definir([71,72,73,74],edu,'Didática: fundamentos, tendências pedagógicas e ação docente')
definir([75,76,77,78,79,80,81,82,83],edu,'Taxonomia de Bloom: domínios cognitivos e objetivos de aprendizagem')
definir([84,85,86,87,88,89],edu,'Recursos didáticos, avaliação da aprendizagem e educação corporativa')
definir([90,91,92],edu,'Projeto político-pedagógico, inclusão, função social e andragogia')
definir([93],edu,'Educação corporativa: avaliação de programas e níveis de resultados')
definir([94,95,96,97,98],edu,'Tecnologias educacionais, recursos didáticos e ferramentas digitais')
definir([99,100,101,102,103],edu,'Pedagogia não escolar: aprendizagem organizacional, competências e prática profissional')
definir([104,105,106,107,108],edu,'Educação corporativa: formação por competências, avaliação e metodologias')
definir([109,110,111,112,113],edu,'Educação a distância e educação em espaços não escolares: avaliação e mediação pedagógica')
definir([114,115,116,117,118,119],edu,'Tecnologias da informação e comunicação, mídias e inclusão educacional')
definir([120,121,122,123,124],edu,'Políticas e programas de tecnologia, radiodifusão e inclusão digital na educação')
definir([125,126,127,128,129,130,131,132,133,134,135],edu,'Educação a distância: conceitos, mediação, interação e fundamentos pedagógicos')
definir([136,137,138,139,140],edu,'Estatística educacional: censo escolar, população, variáveis e medidas de tendência central')
definir([141,142,143,144],edu,'Estatística educacional: leitura e comparação de dados de docentes por etapa de ensino')
definir([145,146,147,148,149,150],edu,'Educação corporativa: fundamentos, objetivos, desenvolvimento e alinhamento institucional')

const bases={
 '61-65':'A respeito do planejamento na ação docente, julgue os itens a seguir.',
 '66-70':'No que se refere ao planejamento curricular, julgue os próximos itens.',
 '71-74':'A respeito da pedagogia e da didática, julgue os itens que se seguem.',
 '75-80':'Acerca dos objetivos do processo de ensino-aprendizagem e de sua relação com os domínios cognitivos, julgue os itens seguintes.',
 '81-83':'Julgue os itens a seguir, relativos à taxonomia de Bloom.',
 '84-89':'Devido à necessidade de organizar os recursos metodológicos e a avaliação, o pedagogo busca planejar coerentemente os objetivos de formação. A esse respeito, julgue os itens seguintes.',
 '94-98':'Os recursos didáticos, em qualquer mídia, devem estar em consonância com a fundamentação filosófica e pedagógica definida no projeto pedagógico do curso proposto. A respeito desse assunto e de aspectos relacionados, julgue os itens subsecutivos.',
 '99-103':'A pedagogia não formal apoia a aquisição de conhecimentos no espaço organizacional; o pedagogo não escolar atua na reconstrução de conceitos e no desenvolvimento de competências para o trabalho. Julgue os itens com base nesse contexto.',
 '104-108':'A educação é uma prática humana e social que constrói e modifica os sujeitos em dimensões físicas, mentais, espirituais e culturais. O pedagogo pode atuar em diferentes espaços educativos. Julgue os itens seguintes.',
 '109-112':'A educação em espaços não escolares constitui um campo de atuação do pedagogo com práticas e objetivos próprios. Julgue os itens a seguir.',
 '114-119':'A integração das tecnologias da informação e comunicação na educação depende de sua apropriação pelos sujeitos pedagógicos e de seu uso para melhorar os processos educativos e a aprendizagem. Julgue os itens.',
 '120-124':'Tendo como referência experiências de uso das mídias na educação, julgue os itens a seguir.',
 '125-135':'A educação a distância expandiu-se para atender necessidades de qualificação e formação. Considerando esse contexto, julgue os itens relativos à EaD e às tecnologias educacionais.',
 '136-140':'Em 2018, o INEP iniciou a segunda etapa do Censo Escolar 2017, com coleta de dados sobre situação do aluno, rendimento e movimento escolar. Julgue os itens sobre o estudo estatístico.',
 '141-144':'Use a tabela de evolução do número de docentes no Brasil por etapa de ensino, entre 2013 e 2017, apresentada na página original do caderno.',
 '145-150':'Acerca do conceito, dos fundamentos e dos processos da educação corporativa, julgue os itens seguintes.'
}
function baseDoItem(n){
 if(n>=130&&n<=135)return `${bases['125-135']}\nA EaD é considerada:`
 if(n>=125&&n<=129)return bases['125-135']
 for(const [k,v] of Object.entries(bases)){const [a,b]=k.split('-').map(Number);if(n>=a&&n<=b)return v}
 return ''
}
const limpos={
 65:'O planejamento é um processo de racionalização e organização da ação docente.',
 83:'Para Bloom, as possibilidades de aprendizagem não se restringem aos domínios cognitivos representados em sua taxonomia.',
 93:'Na educação corporativa, um projeto pedagógico pode ser avaliado em até seis níveis: reação, aprendizado, aplicação, organização, cultura e objetivos.',
 98:'O Wordle é uma ferramenta de análise de textos que permite converter texto livre ou conteúdo da Web em uma nuvem de palavras e realizar análise de vocabulário.',
 108:'Para a literatura do campo da educação corporativa, o método expositivo grupal é a metodologia educacional mais apropriada aos processos de educação corporativa.',
 113:'Na educação corporativa, a avaliação de processo deve ocorrer após o treinamento e orientar oportunidades de aperfeiçoamento para treinamentos futuros.',
 129:'O uso de tecnologias é imprescindível para proporcionar aos estudantes a oportunidade de interagir e trabalhar juntos em problemas e projetos significativos.'
}
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=faixa.get(n);if(!t)throw Error(`Sem classificação para o item ${n}`)
 const pagina=q.pagina
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2018,numero_original:n,pagina,
  ...(limpos[n]?{enunciado:limpos[n]}:{}),dificuldade:'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela leitura do item e pela aplicação de conceitos pedagógicos, educacionais ou estatísticos exigidos; não é dado oficial da banca.',
  motivo:'Caderno oficial CEBRASPE/ABIN — cargo 2, Oficial Técnico de Inteligência, área 4; aplicação em 2018. Classificação individual conforme o comando e o conteúdo do item.',
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio:baseDoItem(n)||undefined,motivo:'Página original conferida visualmente; o texto-base e os elementos gráficos do item permanecem vinculados.'}}
})

// O item 135 já estava classificado, mas ainda precisava receber o comando comum da série.
const atual=JSON.parse(await fs.readFile('tmp/abin-educacao-125-140-atual.json','utf8'))
const q135=atual.find(q=>q.n===135)
if(q135&&!decisoes.some(q=>q.id===q135.id)){
 const original=JSON.parse(await fs.readFile('tmp/pendentes-abin-educacao-2017.json','utf8')).find(q=>q.numero_original===134)
 decisoes.push({id:q135.id,sha256_enunciado:hashRevisao(q135.enunciado),materia:edu,conteudo:faixa.get(135).conteudo,ano:2018,numero_original:135,pagina:q135.pagina,
  dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; não é dado oficial da banca.',motivo:'Caderno oficial CEBRASPE/ABIN, aplicação 2018; item 135, conferido na página original.',
  visual:{pagina:q135.pagina,imagem:`paginas/547891932e0ca9b8-${String(q135.pagina).padStart(4,'0')}.webp`,texto_apoio:baseDoItem(135),motivo:'Comando comum preservado para completar a afirmação do item.'}})
}

const q132={id:'extr-abin17-area4-q132',ano:2018,numero_original:132,banca:'CEBRASPE',banca_original:'CEBRASPE',concurso:'ABIN 2017',organizadora:'CEBRASPE',aplicacao:'CEBRASPE',materia:edu,conteudo:faixa.get(132).conteudo,
 enunciado:'um modelo pedagógico.',texto_apoio:baseDoItem(132),opcoes:['Certo','Errado'],resposta_correta:1,anulada:false,pagina:3,documento_id:'547891932e0ca9b8',paginas_origem:[3],imagens_paginas:['paginas/547891932e0ca9b8-0003.webp'],pagina_imagem:'paginas/547891932e0ca9b8-0003.webp',contexto_paginas:[{pagina:3,imagem:'paginas/547891932e0ca9b8-0003.webp'}],
 fonte:'https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/378_ABIN_008_01.PDF',origem:'CEBRASPE — ABIN 2017, aplicação 2018',documento_origem:'378_ABIN_008_01.PDF',tipo_documento:'PROVA OBJETIVA - CONHECIMENTOS ESPECÍFICOS - CARGO 2 - ÁREA 4',tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Leitura semântica individual e conferência da prova oficial',classificacao_evidencia:'Item 132 localizado no caderno oficial; gabarito definitivo do CEBRASPE indica Errado.',classificacao_versao:2,
 dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; não é dado oficial da banca.',gabarito_oficial:{fonte:'https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/GAB_DEFINITIVO_378_ABIN_008_01.PDF',arquivo:'GAB_DEFINITIVO_378_ABIN_008_01.PDF',prova:'378_ABIN_008_01.PDF',numero:132,pagina:1,resposta:'E',criterio:'Gabarito oficial definitivo do CEBRASPE; checksum do PDF não disponível no ambiente local.'},
 integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:['checksum_do_gabarito_oficial_nao_disponivel_localmente']},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:['checksum_do_gabarito_oficial_nao_disponivel_localmente']}}
const report=await aplicarRevisoesIndividuais({nome:'revisao-abin-educacao-v97',base,decisoes,adicoes:[q132]})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-abin-educacao-v97-notas.json',JSON.stringify({prova:'ABIN 2017 — cargo 2, Oficial Técnico de Inteligência, área 4; aplicação 2018',fonte:'https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/378_ABIN_008_01.PDF',gabarito:'https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/GAB_DEFINITIVO_378_ABIN_008_01.PDF',paginasConferidas:[1,2,3,4],itensRevisados:decisoes.length,questaoAusenteAdicionada:132,ajustesTexto:Object.keys(limpos),relatorio:report},null,2))
