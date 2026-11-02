import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-stj-enfermagem-2018-lote-v452'
const doc='370828992415c4ed'
const prova='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/MATRIZ_385_STJ011__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/STJ_18/arquivos/GAB_DEFINITIVO_385_STJ011.PDF'
const concurso='STJ 2018 — Técnico Judiciário — Enfermagem'
const cargo='Técnico Judiciário — Apoio Especializado — Enfermagem — cargo 11 — caderno 385_STJ011'
const blocos=[
 'E E C E C C E E C C C C E C E C C E E E',
 'E C C E C E C E E C E E E C X C E C C C',
 'C C E E C E C C E C E E E E C C C E C E',
 'C E C E C E E E E C E E E C E C C E C C'
]
const sequencia=blocos.flatMap(x=>x.split(' '))
if(sequencia.length!==80)throw Error(`Gabarito com ${sequencia.length} itens; esperado 80`)
const respostas=Object.fromEntries(sequencia.map((x,i)=>[String(i+41),x]))
const hashGabarito=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
if(!linhas.some(x=>x.startsWith(`{"documento_id":"${doc}"`))){
 const linha={documento_id:doc,arquivo_prova:'MATRIZ_385_STJ011__PAG_3.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'GAB_DEFINITIVO_385_STJ011.PDF',tipo:'Gabarito oficial definitivo — cargo 11 — Técnico Judiciário — Enfermagem',criterio:'Caderno 385_STJ011, cargo 11, identificado na prova e no gabarito oficiais CEBRASPE',status:'tabela_lida',sha256:hashGabarito,respostas,linhas:4}
 await fs.appendFile(arquivoCatalogo,`${linhas.length?'\n':''}${JSON.stringify(linha)}\n`)
}
const temas={
41:['Enfermagem','Central de material e esterilização: classificação de artigos e desinfecção'],42:['Enfermagem','Central de material e esterilização: limpeza de artigos críticos com lúmen'],43:['Enfermagem','Central de material e esterilização: artigos semicríticos e esterilização química'],44:['Enfermagem','Anatomia humana: músculos da face e função do bucinador'],45:['Enfermagem','Anatomia humana: músculos da região glútea e locais de aplicação intramuscular'],46:['Enfermagem','Anatomia humana: músculo bíceps femoral e movimentos do joelho'],47:['Enfermagem','Fisiologia respiratória: contração do diafragma e inspiração'],48:['Enfermagem','Microbiologia: morfologia e organização celular de bactérias'],49:['Enfermagem','Parasitologia: protozoários de interesse médico e localização'],50:['Enfermagem','Parasitologia: trematódeos, cestódeos e doenças associadas'],51:['Enfermagem','Microbiologia: fungos e micoses de interesse clínico'],52:['Enfermagem','Biossegurança: classificação de risco de agentes biológicos'],53:['Enfermagem','Prevenção de infecções: troca de equipos de infusão em neonatologia'],54:['Enfermagem','Controle de infecção: precauções de contato e microrganismos multirresistentes'],55:['Enfermagem','Histologia: músculo esquelético, miofibrilas e discos intercalares'],56:['Enfermagem','Histologia: fibras musculares cardíacas e tecido muscular'],57:['Enfermagem','Neuroanatomia: córtex cerebelar e células de Purkinje'],58:['Enfermagem','Farmacologia: insulina, hipoglicemiantes e vias de administração'],59:['Enfermagem','Farmacologia: enoxaparina e anticoagulantes'],60:['Enfermagem','Terapia intravenosa: solução, fator de gotejamento e cálculo de infusão'],61:['Enfermagem','Imunização: vacina inativada contra poliomielite e via de administração'],62:['Enfermagem','Imunização: vacina contra HPV na gestação'],63:['Enfermagem','Imunização: calendário da vacina contra febre amarela'],64:['Enfermagem','Imunização: vacina BCG em crianças com HIV'],65:['Enfermagem','Saúde mental: serviços comunitários, CAPS e cuidado coletivo'],66:['Enfermagem','Saúde mental: reforma psiquiátrica, território e desinstitucionalização'],67:['Enfermagem','Saúde mental: organização da rede e políticas públicas'],68:['Enfermagem','Saúde mental: reforma psiquiátrica e modelo assistencial'],69:['Saúde Coletiva','Epidemiologia: transmissão do vírus da hepatite C'],70:['Saúde Coletiva','Epidemiologia: transmissão sexual do vírus da hepatite B'],71:['Saúde Coletiva','Epidemiologia: transmissão do vírus da hepatite A'],72:['Enfermagem','Administração de medicamentos: higiene e antissepsia de superfícies'],73:['Enfermagem','Procedimentos: punção venosa periférica e antissepsia da pele'],74:['Enfermagem','Biossegurança: precauções padrão na assistência à saúde'],75:['Enfermagem','Procedimentos: curativo de ferida operatória e coberturas'],76:['Enfermagem','Processo de trabalho em saúde: vínculo profissional-paciente e acesso'],77:['Enfermagem','Processo de trabalho: informação e atribuições do técnico de enfermagem'],78:['Enfermagem','Processo de enfermagem: sistematização e cuidado integral'],79:['Enfermagem','Assistência musculoesquelética: dor após amputação e controle multimodal'],80:['Enfermagem','Assistência musculoesquelética: síndrome de embolia gordurosa'],81:['Enfermagem','Saúde da criança e do adolescente: vacinação contra HPV'],82:['Enfermagem','Saúde da criança: avaliação de queimaduras e suspeita de violência'],83:['Enfermagem','Saúde da criança e do adolescente: classificação etária'],84:['Enfermagem','Aleitamento materno e alimentação complementar'],85:['Enfermagem','Saúde da mulher: climatério e menopausa'],86:['Enfermagem','Saúde da mulher: dispareunia e orientação de cuidado'],87:['Enfermagem','Saúde da mulher: manifestações do climatério'],88:['Enfermagem','Enfermagem obstétrica: sinais e evolução do trabalho de parto'],89:['Enfermagem','Puerpério: ingurgitamento mamário e manejo do aleitamento'],90:['Enfermagem','Saúde da mulher: identificação de violência durante o pré-natal'],91:['Enfermagem','Imunização da gestante: vacina dTpa'],92:['Enfermagem','Atenção obstétrica: amniorrexe e sinais de urgência'],93:['Enfermagem','Suporte básico de vida: sequência de ressuscitação cardiopulmonar'],94:['Enfermagem','Suporte básico de vida: avaliação do pulso em adulto'],95:['Enfermagem','Suporte básico de vida: desfibrilação e atividade elétrica cardíaca'],96:['Enfermagem','Avaliação neurológica: escala de coma e nível de consciência'],97:['Enfermagem','Urgência e trauma: ferida com exposição óssea e curativo'],98:['Enfermagem','Urgência: avaliação e classificação de queimaduras'],99:['Enfermagem','Urgência: controle inicial da epistaxe'],100:['Enfermagem','Urgência cardiovascular: definição de urgência hipertensiva'],101:['Saúde Coletiva','Doença de Chagas: achados eletrocardiográficos e radiológicos'],102:['Saúde Coletiva','Doenças infecciosas: tratamento da difteria'],103:['Saúde Coletiva','Imunização: BCG e proteção contra hanseníase'],104:['Saúde Coletiva','Imunização: vacina contra HPV em pessoas com HIV/AIDS'],105:['Saúde Coletiva','Determinantes sociais da saúde: transporte e educação'],106:['Saúde Coletiva','SUS: níveis de atenção e coordenação do cuidado'],107:['Enfermagem','Ética assistencial: informação clínica, privacidade e doenças transmissíveis'],108:['Saúde Coletiva','Estratégia Saúde da Família: população adscrita'],109:['Enfermagem','Ética profissional: direito a desagravo público'],110:['Enfermagem','Ética profissional: aprimoramento técnico como direito e dever'],111:['Enfermagem','Administração de medicamentos: responsabilidade profissional'],112:['Enfermagem','Legislação profissional: competências do COFEN e penalidades'],113:['Enfermagem','Saúde do trabalhador: agentes biológicos e risco ocupacional'],114:['Enfermagem','Biossegurança e higiene em serviços de saúde: transporte de materiais'],115:['Enfermagem','Processamento de produtos para saúde e lavanderia hospitalar'],116:['Enfermagem','Infecção neonatal: ruptura de membranas e classificação epidemiológica'],117:['Saúde Coletiva','Política Nacional de Humanização: padrões de adesão e ouvidoria'],118:['Saúde Coletiva','Política Nacional de Humanização: princípios norteadores'],119:['Saúde Coletiva','Política Nacional de Humanização: acesso, filas e acolhimento'],120:['Saúde Coletiva','Política Nacional de Humanização: ambiência e financiamento de projetos']
}
const dupes={
 'extr-b87019c6834f8b39eaf3':'extr-446a399ab32abc3d1a5c',
 'extr-12b3d1460477a029a338':'extr-452e703b3b0dedde19f5',
 'extr-73fe9150b3292e0e761d':'extr-57a1556d9b45b270850a',
 'extr-912608cb7618f20eaa84':'extr-60df0c83551da4e19553',
 'extr-7115652f95fadca4bd5d':'extr-93a6c22e681fb7f7768e',
 'extr-2a4830760891ec982ca8':'extr-42d37d0b93e4a7aab05f'
}
const corrigidos={
 'extr-b87019c6834f8b39eaf3':'Máscaras para inaloterapia são consideradas artigos semicríticos e não devem ser submetidas à esterilização por imersão química no formaldeído.',
 'extr-446a399ab32abc3d1a5c':'Máscaras para inaloterapia são consideradas artigos semicríticos e não devem ser submetidas à esterilização por imersão química no formaldeído.',
 'extr-12b3d1460477a029a338':'O músculo bucinador localiza-se na margem orbital medial e atua como esfíncter da órbita, fechando as pálpebras.',
 'extr-452e703b3b0dedde19f5':'O músculo bucinador localiza-se na margem orbital medial e atua como esfíncter da órbita, fechando as pálpebras.',
 'extr-57a1556d9b45b270850a':'Os protozoários que parasitam o homem podem habitar diferentes tecidos ou órgãos, como o Trypanosoma cruzi, presente no sangue, a Giardia lamblia, no intestino, ou as Trichomonas, nos genitais e nas vias urinárias.',
 'extr-73fe9150b3292e0e761d':'Os protozoários que parasitam o homem podem habitar diferentes tecidos ou órgãos, como o Trypanosoma cruzi, presente no sangue, a Giardia lamblia, no intestino, ou as Trichomonas, nos genitais e nas vias urinárias.',
 'extr-912608cb7618f20eaa84':'A classe Trematoda, representada pelo Schistosoma mansoni, e a classe Cestoda, representada pela Taenia solium, ambas do filo platelminto, são importantes parasitos humanos, capazes de causar doenças como a esquistossomose e a cisticercose, respectivamente.',
 'extr-60df0c83551da4e19553':'A classe Trematoda, representada pelo Schistosoma mansoni, e a classe Cestoda, representada pela Taenia solium, ambas do filo platelminto, são importantes parasitos humanos, capazes de causar doenças como a esquistossomose e a cisticercose, respectivamente.',
 'extr-7115652f95fadca4bd5d':'Os agentes biológicos que podem causar danos à saúde do ser humano distribuem-se em classes de risco, que vão da classe 1 a 4, de menor risco até a de alto risco individual.',
 'extr-93a6c22e681fb7f7768e':'Os agentes biológicos que podem causar danos à saúde do ser humano distribuem-se em classes de risco, que vão da classe 1 a 4, de menor risco até a de alto risco individual.',
 'extr-42d37d0b93e4a7aab05f':'Os equipos utilizados para a infusão de sangue nos recém-nascidos internados em unidades de neonatologia devem ser trocados a cada 72 horas.',
 'extr-2a4830760891ec982ca8':'Os equipos utilizados para a infusão de sangue nos recém-nascidos internados em unidades de neonatologia devem ser trocados a cada 72 horas.',
 'extr-06456c318f14dc43be55':'O músculo glúteo mínimo tem inserção no trocanter maior do fêmur e origem no ílio, sendo um dos músculos da região glútea utilizados para injeções intramusculares.',
 'extr-97dbfcc3b2338bebe09d':'Ao se contrair, o diafragma, um dos músculos mais importantes para a respiração, se eleva, o que permite a entrada de ar na cavidade torácica; esse processo é conhecido como inspiração.',
 'extr-87d5ae80c78cd1053af8':'Os organismos do reino Fungi podem causar doenças conhecidas como micoses, infecções muitas vezes crônicas, como esporotricose e candidíase.',
 'extr-db6d0e4bb70394812de4':'O cerebelo é formado por uma camada superficial de substância cinzenta, o córtex cerebelar, onde são encontrados os neurônios de Purkinje.',
 'extr-d9cd88d9147a85dd5a0c':'Crianças infectadas por HIV que estiverem assintomáticas e sem sinais de imunodepressão não podem receber a vacina BCG.',
 'extr-b0c640cd15b15d82da2f':'A reforma psiquiátrica forneceu subsídios para que a enfermagem construísse um modelo definitivo de assistência e cuidados a pacientes com transtornos mentais.',
 'extr-4c42b9fa0082d2e9c21f':'São consideradas manifestações transitórias do climatério: calafrios, parestesias e menstruações abundantes e com maior período de duração.',
 'extr-fd9718bf42bc58d7219c':'Configuram sinais de violência contra a mulher o início tardio do pré-natal, lesões físicas que não se expliquem como acidentes e parceiro demasiadamente atento e controlador, que reage negativamente se for separado da mulher.',
 'extr-540b5ef6647272482288':'Na avaliação neurológica simplificada, que tem como objetivo descrever rapidamente o estado de consciência e detectar alterações neurológicas precoces no paciente, deve-se considerar que o paciente está inconsciente se não apresentar abertura ocular nem resposta aos estímulos verbal e doloroso.',
 'extr-1e08ab968b385e67cf15':'Cada equipe de Saúde da Família deve ser responsável por, no máximo, 4.000 pessoas.',
 'extr-05c6d9897a9d5bdd3c3a':'Entre as orientações estratégicas para a implementação da PNH inclui-se a oferta de financiamento de projetos que busquem melhorar a experiência do usuário no espaço físico das unidades de saúde, como, por exemplo, a introdução de salas de conversa e espaços de conforto.'
}
const apoio={
41:'Comando dos itens 41 a 43: julgue os itens acerca da classificação e do processamento de artigos utilizados nos serviços de saúde.',
44:'Comando dos itens 44 a 47: julgue os itens sobre anatomia e fisiologia muscular.',
48:'Comando dos itens 48 a 51: julgue os itens acerca de agentes infecciosos e parasitários.',
52:'Comando dos itens 52 a 54: julgue os itens referentes à biossegurança em saúde.',
55:'Comando dos itens 55 a 57: julgue os itens sobre histologia dos tecidos.',
58:'Caso clínico dos itens 58 a 60: mulher de 39 anos, hipertensa e diabética, internada em clínica médica, recebe insulina NPH 30 unidades pela manhã, enoxaparina 40 mg e solução fisiológica 0,9% por via intravenosa a 30 mL/h. Para o item 60, considere equipo com fator de gotejamento de 20 gotas/mL.',
61:'Comando dos itens 61 a 64: julgue os itens sobre administração de vacinas previstas no Programa Nacional de Imunizações (PNI).',
65:'Comando dos itens 65 a 68: julgue os itens sobre assistência de enfermagem em saúde mental.',
69:'Comando dos itens 69 a 71: julgue os itens sobre meios de transmissão das hepatites virais.',
72:'Comando dos itens 72 a 75: julgue os itens sobre procedimentos técnicos de enfermagem.',
76:'Comando dos itens 76 a 78: julgue os itens sobre organização do processo de trabalho em saúde e enfermagem.',
79:'Comando dos itens 79 e 80: julgue os itens sobre assistência a pacientes com disfunções musculoesqueléticas.',
81:'Comando dos itens 81 a 84: julgue os itens sobre assistência de enfermagem a crianças e adolescentes.',
85:'Comando dos itens 85 a 87: julgue os itens sobre climatério.',
88:'Comando dos itens 88 a 92: julgue os itens sobre assistência de enfermagem à mulher no ciclo gravídico-puerperal.',
93:'Comando dos itens 93 a 96: julgue os itens sobre suporte básico de vida.',
97:'Comando dos itens 97 a 100: julgue os itens sobre assistência de enfermagem em emergência, urgência e trauma.',
101:'Comando dos itens 101 a 104: julgue os itens acerca de doenças de interesse da saúde pública.',
105:'Comando dos itens 105 a 108: julgue os itens sobre o SUS e a legislação que o rege.',
109:'Comando dos itens 109 a 112: julgue os itens sobre ética e legislação em enfermagem.',
113:'Comando dos itens 113 a 116: julgue os itens à luz das normas de segurança e saúde para trabalhadores dos serviços de saúde.',
117:'Comando dos itens 117 a 120: julgue os itens sobre a Política Nacional de Humanização (PNH) no cuidado do paciente/cliente.'
}
const duplicatas={'extr-b87019c6834f8b39eaf3':'extr-446a399ab32abc3d1a5c','extr-12b3d1460477a029a338':'extr-452e703b3b0dedde19f5','extr-73fe9150b3292e0e761d':'extr-57a1556d9b45b270850a','extr-912608cb7618f20eaa84':'extr-60df0c83551da4e19553','extr-7115652f95fadca4bd5d':'extr-93a6c22e681fb7f7768e','extr-2a4830760891ec982ca8':'extr-42d37d0b93e4a7aab05f'}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==77)throw Error(`Esperados 77 registros pendentes; recebido ${exportado.length}`)
const facil=new Set([41,43,47,54,56,58,59,61,62,63,67,70,74,76,78,83,85,89,91,95,97,99,101,103,105,109,110,117,119])
const dificil=new Set([42,48,50,52,57,60,64,66,71,75,80,82,84,87,90,92,93,94,96,98,100,102,104,106,107,112,113,115,116,118,120])
const decisoes=exportado.map(q=>{
 const n=Number(q.numero),[materia,conteudo]=temas[n]||[],valor=respostas[String(n)]
 if(!materia||!conteudo)throw Error(`Sem classificação para item ${n}`)
 if(!valor)throw Error(`Sem gabarito oficial para item ${n}`)
 const anulada=valor==='X',duplicada=Object.hasOwn(duplicatas,q.id)
 const enunciado=corrigidos[q.id]??q.enunciado.replace(/\s+/g,' ').trim()
 const texto=apoio[n]||''
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado,materia,conteudo,ano:2018,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 08/04/2018 — caderno 385_STJ011',numero_original:n,numero:n,pagina:Number(q.pagina),dificuldade:dificil.has(n)?'Difícil':facil.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade clínica, técnica, normativa ou de cálculo; não é índice psicométrico oficial.',classificacao_fonte:prova,motivo:`Item ${n}: classificação pela leitura do enunciado e do comando temático do caderno oficial do cargo 11; cargo, banca, data e edição conferidos na prova e no gabarito oficiais CEBRASPE.`,texto_apoio:texto,imagem_pagina:q.imagem,opcoes:['Certo','Errado'],apta_resolucao:!duplicada,...(duplicada?{inelegibilidade_motivo:'duplicata_de_extracao_mesmo_item_no_caderno_oficial',duplicada_de:duplicatas[q.id]}:{}),remover_pendencias:pendencias,resposta_correta:anulada?null:(valor==='C'?0:1),anulada,gabarito_oficial:{valor,fonte:gabarito,fontes:[gabarito],arquivo:'Gabarito definitivo CEBRASPE — STJ — cargo 11 — Enfermagem',prova,sha256:hashGabarito,sha256_tipo:'transcricao_canonica_do_gabarito_oficial; nao_e_hash_do_pdf',metodo:'Transcrição da tabela do gabarito definitivo oficial CEBRASPE, itens 41 a 120.',numero:n,resposta:valor,criterio:anulada?'Item anulado no gabarito oficial definitivo.':'Gabarito oficial definitivo CEBRASPE.'}}
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,caderno:cargo,registros_brutos:decisoes.length,itens_unicos:new Set(decisoes.map(x=>x.numero)).size,duplicatas:decisoes.filter(x=>!x.apta_resolucao).length,questoes_elegiveis:decisoes.filter(x=>x.apta_resolucao).length,itens_anulados:decisoes.filter(x=>x.anulada).map(x=>x.numero),contextos_compartilhados:decisoes.filter(x=>x.texto_apoio).length,publicado:false,observacao:'Duplicatas de extração permanecem auditáveis e inelegíveis; o item 75 segue disponível para estudo, mas identificado como anulado no gabarito definitivo e sem correção automática.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
