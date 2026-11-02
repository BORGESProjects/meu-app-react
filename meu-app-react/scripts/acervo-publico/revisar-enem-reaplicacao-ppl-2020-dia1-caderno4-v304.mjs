import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='a76456efad37c83a'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2020_PV_reaplicacao_PPL_D1_CD4_superampliada.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2020_GB_reaplicacao_PPL_D1_CD4.pdf'
const concurso='ENEM 2020 — Reaplicação/PPL — 1º dia — Caderno 4 Rosa (superampliada)'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova||catalog.questoes.length!==87)throw Error('Caderno INEP divergente do catálogo de fontes')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-trf6-2025-direito-cargo23-v303'))
if(start<0)throw Error('Base local v303 não encontrada')
const base=raizesAtuais[start]
const exported=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8')),records=new Map(exported.map(q=>[q.id,q]))
if(exported.length!==85||records.size!==85)throw Error(`Esperadas 85 pendências exportadas do caderno; encontrados ${exported.length} linhas e ${records.size} ids únicos`)

const invalidos=new Set(['extr-159dd70897339fb0d42c','extr-7f5d2ddd5316ba1dc49c'])
const espanhol=new Set(['extr-c5f40405779ecdb5d724','extr-72838578363ffcdb8f15','extr-db479667bb219e432a88'])
const idiomas={
  '1-en':['Língua Inglesa','Interpretação de rap e cultura popular negra em texto contemporâneo'],
  '1-es':['Língua Espanhola','Interpretação de texto sobre memória, resistência e cultura maia'],
  '2-en':['Língua Inglesa','Compreensão de notícia sobre desigualdade de gênero na crítica literária'],
  '3-en':['Língua Inglesa','Compreensão de texto informativo sobre identidade cultural e representação'],
  '4-en':['Língua Inglesa','Interpretação de dados sobre diversidade e uso de línguas'],
  '4-es':['Língua Espanhola','Interpretação de poema e recursos expressivos'],
  '5-en':['Língua Inglesa','Variação linguística, globalização e propósito comunicativo'],
  '5-es':['Língua Espanhola','Interpretação de texto multimodal e sentido de expressão idiomática']
}
const linguagens=new Map(Object.entries({
  6:['Língua Portuguesa','Conto contemporâneo: relações afetivas e concepções sobre animais'],
  7:['Literatura Brasileira','Canção popular: projeto de vida, escolhas e recursos expressivos'],
  8:['Língua Portuguesa','Leitura de texto sobre transformação urbana e usos do espaço'],
  9:['Língua Portuguesa','Campanha social: articulação de linguagem verbal e visual'],
  10:['Língua Portuguesa','Leitura multimodal: saúde, imagem e conceito ampliado de saúde'],
  11:['Língua Portuguesa','Coesão referencial: retomada lexical por pronome'],
  12:['Língua Portuguesa','Interpretação de reportagem e efeitos da solidão na saúde'],
  14:['Língua Portuguesa','Leitura de gráfico e texto: participação feminina em ciência e tecnologia'],
  15:['Língua Portuguesa','Variação linguística regional na canção popular'],
  16:['Língua Portuguesa','Gêneros digitais e efeitos do uso de linguagem informal'],
  17:['Língua Portuguesa','Variação linguística em diálogo: marcas de oralidade e contexto social'],
  18:['Língua Portuguesa','Comunicação digital e relações entre empresas e consumidores'],
  19:['Língua Portuguesa','Biografia: construção narrativa e informação sobre Isaac Newton'],
  20:['Língua Portuguesa','Função metalinguística e construção do conceito de refúgio'],
  21:['Língua Portuguesa','Leitura de capa de livro: imagem, tema e inferência'],
  22:['Educação Física','Esporte, gênero e ruptura de estereótipos nas artes marciais'],
  23:['Língua Portuguesa','Texto de campanha: argumentação para reduzir desperdício de alimentos'],
  24:['Língua Portuguesa','Perfil biográfico e divulgação cultural: trajetória de Roberto Segre'],
  25:['Literatura Brasileira','Prosa poética: metáfora, imagem e materialidade da linguagem'],
  26:['Literatura Brasileira','Romantismo: representação da mulher e relação entre emoção e natureza'],
  27:['Educação Física','Ética esportiva: antidopagem, credibilidade e fair play'],
  28:['Língua Portuguesa','Música popular: identidade, trajetória artística e contexto de produção'],
  29:['Literatura Brasileira','Poesia modernista: intertextualidade e leitura em contexto digital'],
  30:['Língua Portuguesa','Gêneros digitais: centralidade da escrita e comunicação virtual'],
  31:['Língua Portuguesa','Texto argumentativo: princípios de sustentabilidade e cidadania global'],
  32:['Literatura Brasileira','Poema contemporâneo: metalinguagem e construção do sujeito lírico'],
  33:['Língua Portuguesa','Autobiografia: identidade civil e efeitos dos documentos oficiais'],
  34:['Língua Portuguesa','Argumentação: interpelação do leitor e problematização do descarte de resíduos'],
  35:['Língua Portuguesa','Variação linguística: estereótipos sobre o português brasileiro'],
  36:['Língua Portuguesa','Variação linguística e adequação ao contexto de circulação'],
  37:['Língua Portuguesa','Leitura de texto argumentativo sobre envelhecimento populacional'],
  38:['Artes','Modernismo brasileiro: composição e elementos visuais em O mamoeiro'],
  42:['Língua Portuguesa','Interpretação de texto de divulgação sobre uso de smartphones'],
  44:['Artes','Música popular: intercâmbio cultural e formação da musicalidade brasileira']
}))
const humanas=new Map(Object.entries({
  46:['Filosofia','Aristóteles: linguagem, razão e distinção entre humanos e animais'],
  47:['Sociologia','Indústria cultural: padronização e previsibilidade dos produtos culturais'],
  48:['Filosofia','Platão: filosofia, poder político e governo da cidade'],
  49:['Geografia','Segregação socioespacial e desigualdade no espaço urbano'],
  50:['Filosofia','Pré-socráticos: explicação racional da origem e transformação da physis'],
  51:['Sociologia','Reestruturação produtiva e flexibilização do trabalho'],
  52:['Sociologia','Racismo no Brasil: classificação social por cor e gradações de pertencimento'],
  53:['Geografia','Impermeabilização urbana, infiltração e escoamento superficial'],
  54:['Filosofia','Rousseau: crítica ao progresso das artes e das ciências'],
  55:['História','Cidadania política e exclusão do voto na história do Brasil'],
  56:['Geografia','Globalização tecnológica, lixo eletrônico e divisão internacional do trabalho'],
  57:['Geografia','Transição demográfica e envelhecimento da população brasileira'],
  58:['Geografia','Revolução Verde e modernização da agricultura'],
  59:['Geografia','Geopolítica: Rússia, Ucrânia e tensões entre Rússia e OTAN'],
  60:['Geografia','Modernização agrícola e transformação territorial do Centro-Oeste'],
  61:['Filosofia','Conceito de humanidade e reflexão filosófica sobre o ser humano'],
  62:['História','Religiosidade medieval: culto às relíquias e práticas cristãs'],
  63:['Geografia','Relações sociedade-natureza e impactos da ação humana'],
  65:['Filosofia','Ética ambiental: produtividade ecológica, tecnologia e sustentabilidade'],
  68:['Filosofia','Ética da alteridade e responsabilidade perante o outro'],
  69:['Geografia','Expansão da soja, produtividade agrícola e transformação do espaço rural'],
  70:['História','Escravidão no Brasil: música, representação e cultura afro-brasileira'],
  71:['Geografia','Conflitos fundiários, grilagem e concentração da terra'],
  72:['História','Segunda Guerra Mundial: divisão e reorganização territorial da Alemanha'],
  73:['História','Brasil Colonial: mineração aurífera e controle da Coroa portuguesa'],
  74:['História','Absolutismo português e patrimonialismo estatal'],
  75:['Sociologia','Civilização, cultura e construção de identidades coletivas'],
  76:['Filosofia','Marx: trabalho, produção humana e alienação'],
  77:['Geografia','Redes urbanas, serviços avançados e articulação de mercados'],
  78:['Geografia','Interações climáticas entre Antártica, Amazônia e Brasil'],
  79:['História','Revolução Industrial inglesa e expansão dos mercados'],
  80:['Geografia','Horário de verão, hora legal e organização territorial do Brasil'],
  82:['História','Bossa Nova e transformação da música popular brasileira'],
  83:['História','Civilizações antigas: cidades-Estado da Mesopotâmia e sociedade egípcia'],
  84:['Sociologia','Marx e Engels: antagonismo de classes na sociedade burguesa'],
  85:['Geografia','Erosão laminar e conservação do solo'],
  86:['Sociologia','Participação política e ampliação da cidadania eleitoral'],
  87:['História','Brasil Imperial: escravidão, policiamento e conflitos urbanos'],
  88:['Geografia','Conservação ambiental e uso racional dos recursos naturais'],
  89:['Sociologia','Política cultural, memória urbana e acesso à poesia na escola pública'],
  90:['Geografia','Segurança hídrica, saneamento e desigualdades na América Latina']
}))

const opcoes=new Map([
 ['extr-c5f40405779ecdb5d724',['trabalho minucioso e incansável para manter sua cultura viva ao longo da história.','tradição de enterrar o umbigo dos recém-nascidos para vinculá-los à terra.','conformismo ao lidar com os eventos traumáticos pelos quais passou.','resistência aos processos de dominação aos quais foi submetido.','busca por reconhecimento após uma história de dificuldades.']],
 ['extr-fbcf1b9a36146e2a467b',['quantidade de produções literárias de homens e mulheres.','predominância de produções masculinas na crítica literária.','papel das associações na produção literária das mulheres.','resultado da produção literária de homens e mulheres em 2014.','prestígio das mulheres no desenvolvimento da produção literária.']],
 ['extr-581373cfba070e0c0df6',['necessidade de uniformização linguística.','tendência de simplificação de enunciados longos.','preservação do emprego de estruturas formais da língua.','valorização de um modo de expressão em detrimento de outro.','variação na forma de falar para atingir um propósito comunicativo.']],
 ['extr-75a4ebe9ab5ae4308b63',['sensibilidade adquirida com a lida no campo.','banalização da morte em função de sua recorrência.','expectativa do sofrimento na visão do destino humano.','certeza da efemeridade da vida como fator de pessimismo.','empatia gerada pela interseção entre o homem e seu ambiente.']],
 ['extr-74a1ad4fc0d020090700',['convidam a pensar sobre o conceito ampliado de saúde.','criticam a relação entre a prática de exercícios e a saúde.','coadunam-se com o conceito de saúde construído na Conferência.','exemplificam a conquista do estado de saúde em um sentido amplo.','reproduzem a relação de causalidade entre fazer exercício e ter saúde.']],
 ['extr-6af6fc02c0da3c237e89',['apresenta taxas de crescimento significativas em relação às dos homens.','superou a produção masculina na construção de projetos ao longo dos anos.','vem sendo estimulada por meio de ações educativas em diferentes setores.','tem se transformado seja pela iniciativa feminina, seja pelo incentivo de organizações.','dobrou em relação à atuação de pesquisadores do outro gênero, no intervalo de 16 anos.']],
 ['extr-13d09b4c3e58ca96c7be',['construção de relações sociais mais responsáveis.','garantia das informações propiciadas pelas redes sociais.','promoção de relações mercadológicas pautadas em interesses pessoais.','propagação de relações interpessoais mediadas por interesses de mercado.','divulgação de informações para atingir a reputação de empresas.']],
 ['extr-35f59ccc17dbc7cee1fd',['criticar a alienação das crianças promovida pela forte presença das mídias de massa em seu cotidiano.','alertar os pais sobre a má influência das tecnologias para o desenvolvimento infantil.','satirizar o nível de criatividade de meninos isolados do convívio com seu grupo.','condenar o uso recorrente de aparatos eletrônicos pelos jovens na atualidade.','censurar o comportamento dos pais em relação à educação dada aos filhos.']],
 ['extr-b42b27a690e2610c8b9d',['masculiniza-se em função das características necessárias a essa prática esportiva.','aproveita-se do padrão estético para conquistar patrocínios e manter-se no esporte.','submete-se aos elementos da identidade masculina para se manter no esporte.','cruza uma fronteira de gênero ao se inserir numa área de reserva masculina.','mantém sua feminilidade em detrimento de um alto desempenho esportivo.']],
 ['extr-1e7e3721d4282d45c056',['fazer referência a ações governamentais, em andamento, de combate ao desperdício de alimentos.','quantificar o desperdício ocorrido no campo como superior a um terço da produção mundial de alimentos.','utilizar a expressão figurada “perde-se no caminho” como referência ao desperdício de alimentos.','apontar uma vantagem financeira para o consumidor engajar-se em práticas de combate ao desperdício de alimentos.','recomendar medidas de distribuição mais eficazes com vistas à diminuição do desperdício de alimentos.']],
 ['extr-e182dbbca4a38edfc809',['incentivo a novas formas de doping por parte dos atletas.','descaso com a performance esportiva das várias modalidades do atletismo.','uso favorável dos produtos da indústria farmacêutica nos torneios oficiais de atletismo.','procedimento prejudicial para a credibilidade da modalidade e do fair play nos esportes.','aumento na utilização do doping para a melhora na performance dos atletas.']],
 ['extr-2928372c751550bdd085',['a sua entrada na escola aos sete anos de idade.','a alusão a uma planta no nome da família.','o problema de identidade originado desde o berço.','a isenção da multa por falta de declaração do nascimento.','o seu nascimento em uma aldeia de camponeses.']],
 ['extr-4e0e10abd7f5bad23da3',['típica de pessoas despreocupadas em seguir as regras de escrita.','usada como recurso para atrair a atenção de interlocutores e consumidores.','transposta de situações de interação típicas de ambientes rurais do interior do Brasil.','incompatível com ambientes frequentados por usuários da norma-padrão da língua.','condenável em produtos voltados para uma clientela exigente e interessada em novidades.']],
 ['extr-158cf43b2347d053a980',['apropriação de gêneros e estilos estrangeiros na criação da música tradicional maranhense.','inexpressividade das manifestações nordestinas em relação às novas referências estéticas.','coexistência de referenciais culturais díspares na construção da musicalidade brasileira.','diluição de modelos estéticos internacionais na criação de novos referenciais musicais.','sobreposição de ideias musicais caribenhas na música autenticamente nacional.']],
 ['extr-6365bc669d538f9eb203',['abordagem epistemológica sobre o lógos e a fundamentação da metafísica.','teoria crítica sobre a essência e o método do conhecimento científico.','justificação religiosa sobre a existência e as contradições humanas.','elaboração poética sobre os mitos e as narrativas cosmogônicas.','explicação racional sobre a origem e a transformação da physis.']]
])
const observadas=new Set(['extr-c5f40405779ecdb5d724','extr-fbcf1b9a36146e2a467b','extr-581373cfba070e0c0df6','extr-75a4ebe9ab5ae4308b63','extr-74a1ad4fc0d020090700','extr-6af6fc02c0da3c237e89','extr-13d09b4c3e58ca96c7be','extr-35f59ccc17dbc7cee1fd','extr-b42b27a690e2610c8b9d','extr-1e7e3721d4282d45c056','extr-e182dbbca4a38edfc809','extr-2928372c751550bdd085','extr-4e0e10abd7f5bad23da3','extr-158cf43b2347d053a980','extr-6365bc669d538f9eb203'])
const dificeis=new Set([14,19,24,26,28,29,38,42,46,47,48,50,52,54,59,60,61,65,68,72,75,76,77,78,83,84,86,89,90])
const decisions=[]
for(const [id,q] of records){
 const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const isSpanish=espanhol.has(id),langKey=`${Number(q.numero)}-${isSpanish?'es':'en'}`
 let materia,conteudo
 if(invalidos.has(id)){materia='Registro administrativo';conteudo='Capa e instruções do caderno; não corresponde a item avaliativo'}
 else if(Number(q.numero)<=5){[materia,conteudo]=idiomas[langKey]||['Língua Inglesa',`Compreensão de texto em inglês: tema, intenção e recursos expressivos (questão ${q.numero})`]}
 else {const item=(Number(q.numero)<=45?linguagens:humanas).get(String(q.numero));if(!item)throw Error(`Classificação sem análise definida para o item ${q.numero} (${id})`);[materia,conteudo]=item}
 const paginas=[...(q.contexto||[]),{pagina:page,imagem:image}]
 for(const ref of paginas)await fs.access(`public/acervo-extraido/${ref.imagem}`)
 const aplicacao=Number(q.numero)<=5?`ENEM 2020 — Reaplicação/PPL — prova de Linguagens — opção ${isSpanish?'espanhol':'inglês'}`:'ENEM 2020 — Reaplicação/PPL — 1º dia — Caderno 4 Rosa'
 const decision={id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2020,concurso,banca:'INEP',organizadora:'INEP',aplicacao,numero_original:Number(q.numero),pagina:page,dificuldade:dificeis.has(Number(q.numero))?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela leitura, abstração, integração de fontes e operação conceitual exigidas; o INEP não publica dificuldade individual.',classificacao_fonte:prova,motivo:invalidos.has(id)?'Página de capa e instruções identificada na imagem oficial; não apresenta comando avaliativo nem alternativas de resposta.':`ENEM 2020, reaplicação/PPL, 1º dia, Caderno 4 Rosa. Classificação por leitura do enunciado, área da prova e contexto original; item ${q.numero}.`,apta_resolucao:!invalidos.has(id),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']}
 if(invalidos.has(id))decision.inelegibilidade_motivo='Registro de capa/instruções, não é questão avaliativa.'
 if(opcoes.has(id))decision.opcoes=opcoes.get(id)
 decision.imagem_pagina=image
 decision.imagens_contexto=[...new Map(paginas.map(x=>[Number(x.pagina),{pagina:Number(x.pagina),imagem:x.imagem,texto:''}])).values()]
 if(observadas.has(id))decision.visual={pagina:page,imagem:image,motivo:'Leitura visual da página original em alta resolução; alternativas transcritas ou conferidas contra a imagem do caderno INEP.'}
 decisions.push(decision)
}
if(decisions.length!==85)throw Error(`Esperadas 85 decisões pendentes (incluindo 2 capas inelegíveis); encontradas ${decisions.length}`)
if(!process.argv.includes('--dry-run')){
 const name='revisao-enem-reaplicacao-ppl-2020-dia1-caderno4-v304'
 const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
 raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
 const report={...result,documento:doc,edicao:concurso,pendenciasDoDocumento:85,capasInelegiveis:2,alternativasTranscritas:opcoes.size,paginasConferidasVisualmente:observadas.size,publicado:false,fonte:prova,gabaritoOficial:gabarito,gabaritoVinculadoParaCorrecaoAutomatica:false}
 await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
 await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ENEM 2020 — Reaplicação/PPL, 1º dia, Caderno 4 Rosa (superampliada) — v304\n\n- Revisei as 85 pendências exportadas deste caderno: classifiquei 83 questões válidas por banca/organização INEP, edição, ano, língua de aplicação, matéria, conteúdo e dificuldade estimada; marquei 2 registros de capa como inelegíveis para resolução.\n- Corrigi a estrutura e transcrevi as alternativas de ${opcoes.size} questões cujo OCR havia fundido opções ou rótulos. Conferi visualmente ${observadas.size} páginas/questões e vinculei as imagens e páginas de contexto originais às questões para preservar textos-base, imagens, gráfico e mapas associados.\n- Não alterei as respostas corretas: a chave oficial está identificada, mas não foi vinculada à correção automática sem validação do arquivo e de sua integridade.\n- Validação local: ${result.classificadas} registros tratados, ${result.novas_classificacoes} novas classificações, ${result.contextos_visuais} referências visuais, ${result.total} registros no acervo, ${result.disponiveis} elegíveis e ${result.pendentes} pendências restantes no conjunto total. Ainda não publicado na nuvem.\n- Fontes: [caderno oficial INEP](<${prova}>), [gabarito oficial INEP](<${gabarito}>), [página de provas e gabaritos do ENEM 2020](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2020).\n`)
 console.log(JSON.stringify(report,null,2))
}else console.log(JSON.stringify({documento:doc,registros:records.size,decisoes:decisions.length,questoesValidas:decisions.filter(x=>x.apta_resolucao).length,capasInelegiveis:decisions.filter(x=>!x.apta_resolucao).length,alternativasTranscritas:opcoes.size,paginasConferidasVisualmente:observadas.size,referenciasContexto:decisions.reduce((n,x)=>n+x.imagens_contexto.length,0),publicado:false},null,2))
