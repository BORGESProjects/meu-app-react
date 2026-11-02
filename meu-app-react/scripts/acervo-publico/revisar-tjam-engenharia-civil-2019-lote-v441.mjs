import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-tjam-engenharia-civil-2019-lote-v441'
const doc='000424f537b2678e'
const prova='https://cdn.cebraspe.org.br/concursos/tj_am_19_servidor/arquivos/481_TJAM006__MATRIZ.PDF'
const gabaritoPdf='https://cdn.cebraspe.org.br/concursos/TJ_AM_19_SERVIDOR/arquivos/GAB_DEFINITIVO_MATRIZ_481_TJAM006__PAG_4.PDF'
const concurso='TJAM — Analista Judiciário — Engenharia Civil (2019)'
const cargo='Analista Judiciário — Especialidade: Engenharia Civil'
const key=[
 'C C E C E E E C E E C E E C C C E E C C',
 'E X C E E C E E C C E E E E C C E C C E',
 'E C E C C E E E C C E C E E E E C C C C',
 'C C E E C C E E E C C C C C E E C C E C'
].flatMap(x=>x.split(' '))
if(key.length!==80)throw Error(`Esperados 80 gabaritos específicos, recebidos ${key.length}`)
const anuladas=new Set([62])
const conteudos=new Map()
const add=(nums,conteudo,dificuldade='Média')=>{for(const n of nums)conteudos.set(n,{materia:'Engenharia Civil',conteudo,dificuldade})}
add([42,43,44,45,46,47,48,49,50,51,52],'Obras públicas: licitações, contratos, fiscalização, medição e alterações contratuais','Difícil')
add([53,54,55],'Orçamentação de obras: custos diretos e indiretos, BDI e formação de preços','Média')
add([56,58,59,60],'Contratação integrada, RDC, habilitação e gestão de riscos em obras públicas','Difícil')
add([61,62,63,64,65],'Tecnologia do concreto: propriedades no estado fresco e ensaios de resistência','Média')
add([66,67,68,69,70,71],'Materiais de construção: cimento Portland de alta resistência inicial','Média')
add([72,73,74,75],'Orçamento de edificações: SINAPI, custos diretos e indiretos, BDI e risco','Média')
add([76,77,78,79,80],'Avaliação de bens: conceitos, métodos e depreciação segundo a NBR 14653','Média')
add([81,82,83,84],'Obras hidráulicas: condutos forçados, barragens e estruturas de canais','Média')
add([85,86,87],'Engenharia portuária: arranjo, proteção e acesso de terminais','Média')
add([88,89,90,91],'Engenharia sanitária: coleta e tratamento de esgotos','Média')
add([92,93],'Abastecimento de água: níveis de reservação e pressões na rede','Média')
add([94,95],'Irrigação: sistemas superficiais por inundação','Média')
add([96,97],'Aproveitamento hidrelétrico: circuito hidráulico e equipamentos da casa de força','Média')
add([98,99,100],'Drenagem urbana e controle de inundações','Média')
add([101],'Geotecnia: sondagem SPT e caracterização dos solos','Média')
add([102,103,104],'Pavimentação: agregados, solos e ensaios de materiais','Difícil')
add([105,106,107],'Terraplenagem: locação, desmatamento, cortes, aterros e diagrama de Brückner','Média')
add([108,109,110,111],'Drenagem rodoviária: sarjetas, drenos e conservação','Média')
add([112,113],'Obras de arte especiais: concreto protendido e fundações profundas','Difícil')
add([114,115,116,117],'Pavimentação: reforço do subleito, sub-base, imprimação e controle de revestimentos','Média')
add([118,119,120],'Orçamento e fiscalização rodoviária: SICRO, medição e reajustamento contratual','Média')
const correcoes={
 40:'Quando for inviável realizar citação, intimação ou notificação por meio eletrônico, deve-se obedecer às regras ordinárias aplicáveis aos documentos físicos, devendo-se digitalizá-los e, posteriormente, destruí-los.',
  42:'No processo de licitação em exame, não poderá ocorrer a participação simultânea de uma mesma empresa isoladamente e em consórcio, em razão de impedimento legal.',
  45:'A orientação dada pela fiscalização, ainda que tenha sido apenas falada, deve ser considerada uma comunicação formal entre a fiscalização e a contratada, caso esteja comprovada por testemunhas.',
  48:'A contratada deve buscar justificar adequadamente o motivo pelo qual a obra não foi iniciada à luz da legislação vigente, pois o desatendimento das determinações da fiscalização enseja rescisão contratual.',
  55:'Um objetivo do BDI é permitir o cálculo do preço unitário de venda a partir do custo unitário direto do serviço.',
  56:'A falta de atendimento dos requisitos de habilitação pela empresa é um vício insanável, e o contrato deve ser anulado.',
  58:'Deve-se elaborar um orçamento detalhado da obra.',
  59:'Deve-se incluir no anteprojeto a estética do projeto arquitetônico.',
  60:'Pode-se considerar taxa de risco compatível com as contingências atribuídas ao contratado no valor de referência da contratação, caso o anteprojeto contemple matriz de alocação de riscos entre a administração pública e o contratado.',
  65:'No caso de uma amostra de corpos de prova que represente todo o concreto de uma estrutura, os resultados dos ensaios de resistência à compressão mostrarão uma curva de distribuição de frequência característica com a forma de uma distribuição Weibull.',
  67:'Esse tipo de cimento é classificado, pelas normas brasileiras, como cimento CP IV.',
  70:'A resistência desse cimento se desenvolve rapidamente devido ao alto teor de silicato tricálcico (C₃S).',
  80:'A depreciação de uma edificação por decrepitude consiste no desgaste de suas partes em razão de uso inadequado ou falta de manutenção.',
  84:'Nas obras de barragens, a construção de galerias ou túneis pode ser efetuada para desviar temporariamente os cursos d’água.',
  100:'É necessário limpar frequentemente a bacia subterrânea ou enterrada, que deve possuir dispositivos para evitar a poluição e a entrada de sedimentos e lixo.',
  101:'Apesar de ser um tipo de ensaio de campo, o SPT possibilita, sem necessidade de teste de laboratório, a avaliação in loco de informações como a origem e a granulometria dos solos.',
  104:'Por meio do equipamento Marshall, é possível, para diferentes tensões aplicadas, determinar os valores do módulo de resiliência de uma brita graduada tratada com cimento (BGTC), a ser utilizada como camada de sub-base de um pavimento de concreto.',
  107:'Em situações de relevo plano, dispensam-se muitas vezes não só o cumprimento do plano de ataque de obras para os serviços de escavação dos cortes, mas também a atualização do diagrama de Brückner.',
  111:'Para remoção de entulho e desobstrução de sarjetas triangulares sem revestimento, é recomendável o uso de motoniveladora, por não ser possível a limpeza por desagregação hidráulica.',
  113:'Caso seja necessário arrancar uma estaca especificada em projeto como elemento de fundação de um viaduto rodoviário, mas que tenha sido danificada durante sua cravação, deverá ser preenchido com areia o furo proveniente desse processo, mesmo que uma nova estaca seja cravada no mesmo local.',
  120:'Reajustamentos contratuais, muito comuns nesse tipo de obra e resultantes principalmente da dinâmica de seu objeto, podem ser formalizados por meio de apostilamento, desde que haja previsão contratual.'
}
const contextos={
  40:'Lei nº 11.419/2006: comunicação eletrônica dos atos processuais; quando inviável a prática eletrônica, aplicam-se as regras ordinárias, com posterior digitalização do documento físico.',
  42:'Situação-problema: edital de obra pública admite consórcio e permite a participação de empresas nacionais e estrangeiras.',
  43:'Situação-problema: durante a execução de obra pública, o fiscal paralisa assentamento de pisos em desacordo com o projeto; a contratada alega que a fiscalização auxiliou na interpretação das especificações e que orientações verbais seriam formais.',
  44:'Situação-problema: durante a execução de obra pública, o fiscal paralisa assentamento de pisos em desacordo com o projeto.',
  45:'Situação-problema: durante a execução de obra pública, o fiscal paralisa assentamento de pisos; a contratada alega que orientações verbais da fiscalização deveriam ser consideradas formais.',
  46:'Situação-problema: obra pública não iniciada no prazo da ordem de serviço; a contratada aguarda licenças e aprovação da substituição do responsável técnico.',
  47:'Situação-problema: obra pública não iniciada no prazo da ordem de serviço; a contratada aguarda licenças e aprovação da substituição do responsável técnico.',
  48:'Situação-problema: obra pública não iniciada no prazo da ordem de serviço; a contratada aguarda licenças e aprovação da substituição do responsável técnico.',
  49:'Situação-problema: em contrato de empreitada por preço unitário, o fiscal antecessor media serviços do cronograma físico ainda não executados e compensava quantitativos de serviços excedentes, sem aditivo contratual.',
  50:'Situação-problema: em contrato de empreitada por preço unitário, o fiscal antecessor media serviços do cronograma físico ainda não executados e compensava quantitativos de serviços excedentes, sem aditivo contratual.',
  51:'Situação-problema: em contrato de empreitada por preço unitário, o fiscal antecessor media serviços do cronograma físico ainda não executados e compensava quantitativos de serviços excedentes, sem aditivo contratual.',
  52:'Situação-problema: em contrato de empreitada por preço unitário, o fiscal antecessor media serviços do cronograma físico ainda não executados e compensava quantitativos de serviços excedentes, sem aditivo contratual.',
  56:'Situação-problema: em contrato de obra de estrutura metálica, constata-se que a contratada não atendia aos requisitos de habilitação previstos no edital e que a solução estrutural foi alterada para concreto após mudanças de preço.',
  58:'Situação-problema: obra atende aos requisitos legais para licitação pelo Regime Diferenciado de Contratações (RDC); pretende-se adotar contratação integrada.',
  59:'Situação-problema: obra atende aos requisitos legais para licitação pelo Regime Diferenciado de Contratações (RDC); pretende-se adotar contratação integrada.',
  60:'Situação-problema: obra atende aos requisitos legais para licitação pelo Regime Diferenciado de Contratações (RDC); pretende-se adotar contratação integrada.',
  61:'Julgue os itens sobre concreto fresco e ensaios de resistência à compressão.',
  62:'Julgue os itens sobre concreto fresco e ensaios de resistência à compressão.',
  63:'Julgue os itens sobre concreto fresco e ensaios de resistência à compressão.',
  64:'Julgue os itens sobre concreto fresco e ensaios de resistência à compressão.',
  65:'Julgue os itens sobre concreto fresco e ensaios de resistência à compressão.',
  66:'Contexto: cimento Portland de alta resistência inicial, comparado ao cimento Portland comum.',
  67:'Contexto: cimento Portland de alta resistência inicial, comparado ao cimento Portland comum.',
  68:'Contexto: cimento Portland de alta resistência inicial, comparado ao cimento Portland comum.',
  69:'Contexto: cimento Portland de alta resistência inicial, comparado ao cimento Portland comum.',
  70:'Contexto: cimento Portland de alta resistência inicial, comparado ao cimento Portland comum.',
  71:'Contexto: cimento Portland de alta resistência inicial, comparado ao cimento Portland comum.',
  72:'Referência: estrutura de orçamento de edificação pública e Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI).',
  73:'Referência: estrutura de orçamento de edificação pública e Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI).',
  74:'Referência: estrutura de orçamento de edificação pública e Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI).',
  75:'Referência: estrutura de orçamento de edificação pública e Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI).',
  76:'Referência: normas de avaliação de bens NBR 14653.',
  77:'Referência: normas de avaliação de bens NBR 14653.',
  78:'Referência: normas de avaliação de bens NBR 14653.',
  79:'Referência: normas de avaliação de bens NBR 14653.',
  80:'Referência: normas de avaliação de bens NBR 14653.',
  85:'Imagem vinculada: arranjo geral do terminal portuário de Ponta Ubu, em Anchieta (ES); a figura original é necessária para responder aos itens 85 a 87.',
  86:'Imagem vinculada: arranjo geral do terminal portuário de Ponta Ubu, em Anchieta (ES); a figura original é necessária para responder aos itens 85 a 87.',
  87:'Imagem vinculada: arranjo geral do terminal portuário de Ponta Ubu, em Anchieta (ES); a figura original é necessária para responder aos itens 85 a 87.',
  88:'Julgue os itens sobre coleta e tratamento de esgotos sanitários.',
  89:'Julgue os itens sobre coleta e tratamento de esgotos sanitários.',
  90:'Julgue os itens sobre coleta e tratamento de esgotos sanitários.',
  91:'Julgue os itens sobre coleta e tratamento de esgotos sanitários.',
  92:'Dados do projeto de reservação e distribuição: pressão dinâmica mínima de 100 kPa (10 mca); pressão estática máxima de 500 kPa (50 mca); nó mais desfavorável a 440 m; perdas de carga de 15 m; nó mais baixo a 430 m.',
  93:'Dados do projeto de reservação e distribuição: pressão dinâmica mínima de 100 kPa (10 mca); pressão estática máxima de 500 kPa (50 mca); nó mais desfavorável a 440 m; perdas de carga de 15 m; nó mais baixo a 430 m.',
  94:'Julgue os itens sobre irrigação por inundação.',
  95:'Julgue os itens sobre irrigação por inundação.',
  96:'Julgue os itens sobre componentes de uma instalação hidrelétrica.',
  97:'Julgue os itens sobre componentes de uma instalação hidrelétrica.',
  98:'Contexto: obras de defesa contra inundação e macrodrenagem.',
  99:'Contexto: obras de defesa contra inundação e macrodrenagem.',
  100:'Contexto: obras de defesa contra inundação e macrodrenagem.',
  101:'Referência: especificação de materiais para implantação de rodovia, com dados geotécnicos obtidos por sondagem SPT e ensaios de laboratório.',
  102:'Referência: especificações e controle de materiais de pavimento flexível.',
  103:'Referência: especificações e controle de materiais de pavimento flexível.',
  104:'Referência: especificações e controle de materiais de pavimento flexível.',
  105:'Referência: serviços de terraplenagem, incluindo atividades preliminares, áreas de empréstimo, cortes e aterros.',
  106:'Referência: serviços de terraplenagem, incluindo atividades preliminares, áreas de empréstimo, cortes e aterros.',
  107:'Referência: serviços de terraplenagem, incluindo atividades preliminares, áreas de empréstimo, cortes e aterros.',
  108:'Contexto: implantação, limpeza e desobstrução de dispositivos de drenagem rodoviária.',
  109:'Contexto: implantação, limpeza e desobstrução de dispositivos de drenagem rodoviária.',
  110:'Contexto: implantação, limpeza e desobstrução de dispositivos de drenagem rodoviária.',
  111:'Contexto: implantação, limpeza e desobstrução de dispositivos de drenagem rodoviária.',
  112:'Referência: obras de arte especiais (OAEs) em obras rodoviárias, com características estruturais, construtivas e funcionais específicas.',
  113:'Referência: obras de arte especiais (OAEs) em obras rodoviárias, com características estruturais, construtivas e funcionais específicas.',
  114:'Referência: materiais e controle de pavimento flexível.',
  115:'Referência: materiais e controle de pavimento flexível.',
  116:'Referência: materiais e controle de pavimento flexível.',
  117:'Referência: materiais e controle de pavimento flexível.',
  118:'Referência: análise orçamentária, acompanhamento e fiscalização de obras rodoviárias; sistema SICRO.',
  119:'Referência: análise orçamentária, acompanhamento e fiscalização de obras rodoviárias; sistema SICRO.',
  120:'Referência: análise orçamentária, acompanhamento e fiscalização de obras rodoviárias; sistema SICRO.'
}
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==79)throw Error(`Esperadas 79 questões pendentes, recebidas ${exportado.length}`)
const keyHash=hashRevisao(key.map((x,i)=>`${i+41}:${x}`).join('\n'))
const decisions=exportado.map(q=>{
 const n=q.numero,meta=conteudos.get(n)
 if(n===40){
  const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:correcoes[n],materia:'Informática',conteudo:'Processo judicial eletrônico: comunicações e digitalização de documentos (Lei nº 11.419/2006)',ano:2019,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 13 de outubro de 2019',numero_original:n,numero:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na interpretação da regra legal e do procedimento eletrônico.',classificacao_fonte:prova,motivo:'Item 40 conferido no caderno oficial; a matéria e o recorte seguem o bloco de Noções de Informática e Processo Digital. A assertiva é compatível com o art. 9º, § 2º, da Lei 11.419/2006; a correção oficial do cargo 6 não foi localizada na tabela específica consultada.',texto_apoio:contextos[40],imagem_pagina:q.imagem,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],resposta_correta:0}
  return d
 }
 if(!meta||n<41||n>120)throw Error(`Questão sem classificação validada: ${n}`)
 const ans=key[n-41],anulada=anuladas.has(n)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:correcoes[n]||q.enunciado.replace(/\s*(?:RASCUNHO\s*A|Espaço livre|CEBRASPE\s*[–-]\s*TJAM\s*[–-]\s*Aplicação:\s*2019|(?:OBRAS DE EDIFICAÇÕES|OBRAS HÍDRICAS|OBRAS RODOVIÁRIAS|CONHECIMENTOS ESPECÍFICOS))\s*[\s\S]*$/i,'').replace(/\s+/g,' ').trim(),opcoes:['Certo','Errado'],materia:meta.materia,conteudo:meta.conteudo,ano:2019,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 13 de outubro de 2019',numero_original:n,numero:n,pagina:q.pagina,dificuldade:meta.dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica pela complexidade técnica, normativa e de cálculo do item; não é índice psicométrico publicado pela banca.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo assunto específico e pelo bloco identificado no caderno oficial; prova do cargo de Engenharia Civil.`,texto_apoio:contextos[n]||'',imagem_pagina:q.imagem,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],resposta_correta:anulada?null:ans==='C'?0:1,anulada,gabarito_oficial:{valor:ans,fonte:gabaritoPdf,fontes:[gabaritoPdf],arquivo:'Gabarito definitivo oficial — TJAM, cargo 6 — Engenharia Civil',prova:'Caderno oficial de prova objetiva — TJAM 2019, cargo 6',sha256:keyHash,sha256_tipo:'transcricao_canonica_dos_itens_41_a_120_do_gabarito_definitivo; nao_e_hash_do_pdf',metodo:'Transcrição individual dos itens 41 a 120 na tabela oficial de gabarito definitivo do cargo 6.',numero:n,resposta:anulada?'Anulado':ans,criterio:anulada?'Item anulado no gabarito definitivo; sem correção automática.':'Gabarito definitivo oficial CEBRASPE.'}}
})
if(decisions.filter(d=>d.anulada).map(d=>d.numero).join(',')!=='62')throw Error('Anulação específica divergente do gabarito oficial')
if(decisions.some(d=>!d.enunciado||d.enunciado.length>1500))throw Error('Enunciado inválido após reparo')
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({nome,documento_id:doc,fonte:prova,gabarito:gabaritoPdf,questoes_revisadas:decisions.length,questoes_sem_gabarito_oficial:[40],questoes_anuladas:[62],resultado:result},null,2))
console.log(JSON.stringify({nome,questoes:decisions.length,anuladas:[62],sem_gabarito_oficial:[40],materias:[...new Set(decisions.map(x=>x.materia))],resultado:result},null,2))
