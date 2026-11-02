import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='e1dc239e90339f9d'
const prova='https://cdn.cebraspe.org.br/concursos/see_pe_22_especial_musica/arquivos/781_SEE_PE_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/see_pe_22_especial_musica/arquivos/GAB_DEFINITIVO_781_SEE_PE_003_01.PDF'
const alteracoes='https://cdn.cebraspe.org.br/concursos/see_pe_22_especial_musica/arquivos/SEE_PE_22_ESPECIAL_MUSICA_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-slu-servico-social-2019-v163'))
if(start<0)throw Error('Base v163 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||active.size!==57)throw Error(`Esperados 57 registros da prova SEE/PE Música, recebidos ${active.size}`)
const canonical=new Map(),pages=new Map()
for(const q of catalog.questoes){if(!canonical.has(q.numero))canonical.set(q.numero,q.id);pages.set(q.id,q.pagina)}
const answers=new Map(Object.entries({51:'C',52:'E',53:'E',54:'C',55:'C',56:'E',57:'C',58:'C',59:'C',60:'E',61:'E',62:'C',63:'E',64:'C',65:'C',66:'E',67:'E',68:'C',69:'C',70:'C',71:'C',72:'E',73:'C',74:'C',75:'E',76:'E',77:'X',78:'C',79:'E',80:'E',81:'C',82:'E',83:'C',84:'C',85:'E',86:'C',87:'C',88:'C',89:'E',90:'C',91:'E',92:'E',93:'E',94:'C',95:'E',96:'C',97:'E',98:'C',99:'E',100:'C',101:'E',102:'C',103:'E',104:'E',105:'C',106:'C',107:'C',108:'E',109:'C',110:'E',111:'E',112:'C',113:'C',114:'E',115:'E',116:'C',117:'C',118:'E',119:'E',120:'C'}).map(([n,v])=>[Number(n),v]))
if(answers.size!==70)throw Error('Gabarito oficial incompleto')

const music='Música',education='Educação'
const ranges=[
 [[51,55],music,'Teoria musical: tonalidades e armaduras de clave','A figura apresenta armaduras de clave numeradas de 1 a 6. Com base nela, julgue os itens.'],
 [[56,60],music,'Teoria musical: modos litúrgicos e escalas','A figura apresenta notas identificadas por letras em um teclado/registro musical. Considere as notas indicadas e julgue os itens sobre os modos litúrgicos.'],
 [[61,65],music,'Análise musical: leitura de partitura, tonalidade, ritmo e harmonia','Considere o trecho musical escrito para piano apresentado na página original e julgue os itens sobre tonalidade, compassos, intervalos e acordes.'],
 [[66,70],music,'Harmonia: série harmônica, intervalos e formação de acordes','A figura apresenta os onze primeiros harmônicos da série harmônica a partir de uma nota fundamental. Julgue os itens de harmonia.'],
 [[71,75],music,'Teoria musical: transposição de melodias','O trecho musical 3A1-II, em si maior, é uma transposição do trecho 3A1-I, em ré maior. Considere as partituras e julgue os itens sobre a transposição.'],
 [[76,80],music,'Análise de partitura orquestral: compasso, tonalidade, subdivisão, articulação e andamento','Considere o trecho orquestral da página original, com as partes de violino I, violino II, viola e violoncelo, e julgue os itens.'],
 [[81,89],music,'Teoria e percepção musical: ritmo, quiálteras, ornamentos, articulação e andamento','Considere o trecho musical indicado na página original e julgue os itens de leitura rítmica, ornamentos, articulação e andamento.'],
 [[90,96],music,'Harmonia: leitura de acordes e inversões','Considere os trechos musicais A, B e C reproduzidos na página original e julgue os itens sobre identificação de acordes, tonalidades e inversões.'],
 [[97,100],music,'Análise de partitura e orquestração: sinfonia, instrumentos, síncope e ligaduras','Considere o trecho da Sinfonia nº 1, de Brahms, reproduzido na página original; as expressões instrumentais indicadas referem-se a contrafagote, tímpanos, violino I, violino II, viola, violoncelo e contrabaixo. Julgue os itens.'],
 [[101,104],education,'Projeto político-pedagógico e currículo escolar','Caso: a professora Gabriela recorreu ao projeto político-pedagógico (PPP) da escola para compreender os pressupostos de sua ação docente. Julgue os itens sobre o PPP e o currículo.'],
 [[105,108],education,'Educação e diversidade: multiculturalismo e direitos humanos','Acerca da educação e da diversidade, julgue os itens sobre multiculturalismo, direitos humanos, ações afirmativas e reconhecimento das diferenças culturais.'],
 [[109,112],education,'Educação especial e inclusiva: AEE e Plano Nacional de Educação','Considere as políticas públicas de educação especial e inclusiva e o Plano Nacional de Educação; julgue os itens sobre o atendimento educacional especializado.'],
 [[113,116],education,'Currículo integrado, interdisciplinaridade, projetos e avaliação','Caso: a escola ABC avalia estudantes por pesquisas e vivências em temas desenvolvidos em projetos integradores. Julgue os itens sobre metodologia, organização curricular e avaliação.'],
 [[117,120],education,'Tendências pedagógicas: tradicional, tecnicista e renovada não diretiva','Acerca das tendências pedagógicas na prática escolar, julgue os itens.']
]
const range=i=>ranges.find(([[a,b]])=>i>=a&&i<=b)
const clean=s=>(s||'').replace(/\s+/g,' ').replace(/(?:Espaço livre|CEBRASPE\s*[–-]\s*SEE\s*\/?PE[\s\S]*$)/iu,'').trim()
const stems={54:'As armaduras das tonalidades de ré sustenido menor e dó sustenido maior são representadas, respectivamente, pelos números 5 e 1.',55:'A tonalidade representada por 6 está uma quarta justa acima da tonalidade representada por 2.',75:'No terceiro compasso, não há notas erradas.',96:'O acorde do quarto compasso do trecho musical B é um acorde de ré aumentado com sétima maior na segunda inversão.'}
const decisions=[...active.values()].map(q=>{
 const i=Number(q.numero_original??q.numero??q.numero_questao),r=range(i),answer=answers.get(i)
 if(!r||!answer)throw Error(`Sem classificação/gabarito oficial para o item ${i} (${q.id})`)
 const [[,],materia,conteudo,contexto]=r,canonicalId=canonical.get(i),dup=q.id!==canonicalId,pg=pages.get(q.id)|| (i<=75?1:i<=96?2:3)
 if(!canonicalId)throw Error(`Sem registro canônico no catálogo para item ${i}`)
 const stem=stems[i]||clean(q.enunciado)
 if(!stem||stem.length<18)throw Error(`Enunciado ausente/incompleto no item ${i}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,concurso:'SEE/PE — Professor de Música, Cargos 3 a 47; prova aplicada em 02/04/2023',numero_original:i,pagina:pg,dificuldade:[52,54,55,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,90,91,92,93,94,95,96].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme complexidade de leitura musical, análise harmônica ou aplicação pedagógica; a banca não publicou nível de dificuldade.',resposta_correta:answer==='X'?null:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_781_SEE_PE_003_01.PDF',numero:i,resposta:answer,metodo:'Gabarito oficial definitivo CEBRASPE; alterações e anulações conferidas no documento oficial de justificativas.'},classificacao_fonte:prova,motivo:`Classificação por conteúdo do item e cabeçalho do respectivo bloco, conferidos na página ${pg} do caderno oficial.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:`Página original conferida visualmente; partitura, figura ou situação-base vinculada ao item.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:canonicalId,inelegibilidade_motivo:`Duplicata OCR do item ${i}; preservada para auditoria e excluída da resolução.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.filter(x=>x.apta_resolucao===false).length!==3||decisions.filter(x=>x.anulada).length!==1)throw Error('Quantidade de duplicatas/anulações divergente')
const presentes=new Set(decisions.map(x=>x.numero_original)),faltantes=[101,102,103,105,106,107,109,110,111,113,114,115,117,118,119,120]
if(faltantes.some(n=>presentes.has(n))||faltantes.length+presentes.size!==70)throw Error('Cobertura do caderno não fecha em 70 itens; revisar lacunas')
const transcricoes={
 101:'Embora seja importante conhecer o PPP, as ideias apresentadas nele não devem interferir nos planos de aula elaborados pela professora.',
 102:'Ao estudar o PPP, Gabriela poderá entender as formas de participação na construção coletiva do planejamento escolar e poderá engajar-se nesse processo.',
 103:'Era desnecessário que Gabriela recorresse ao PPP, pois sua formação inicial já lhe dera conhecimentos necessários para compreender e planejar sua ação docente.',
 105:'A ideia de multiculturalismo na democracia envolve o reconhecimento de diferentes conjuntos culturais que formam a sociedade.',
 106:'A educação em direitos humanos é parte de um plano nacional que abrange vários níveis de educação e visa ao exercício da solidariedade e ao respeito à diversidade.',
 107:'O sistema de cotas raciais e sociais para ingresso no ensino superior é caracterizado como parte das práticas de educação em direitos humanos.',
 109:'O atendimento educacional especializado (AEE) na educação básica se define de forma complementar ou suplementar à formação dos alunos no ensino regular.',
 110:'O Plano Nacional de Educação (PNE) vigente coloca como meta a universalização do acesso à educação em instituições especializadas no atendimento de pessoas com deficiência.',
 111:'As novas diretrizes da educação especial determinaram que, a partir de 2011, o ensino inclusivo deve ocorrer exclusivamente na educação básica.',
 113:'A metodologia adotada pela escola ABC é ativa, pois os estudantes aprendem por meio da pesquisa.',
 114:'A escola ABC adota a metodologia multidisciplinar.',
 115:'A avaliação adotada pela escola ABC é somativa.',
 117:'Quando as ações docentes não são reduzidas à exposição verbal dos conteúdos e à recordação de matérias passadas, evita-se a tendência pedagógica tradicional.',
 118:'A tendência tecnicista defende que o papel da escola é a difusão de conteúdos associados à realidade social dos estudantes.',
 119:'Conforme a tendência pedagógica tradicional, o papel do professor é ser mediador entre os conhecimentos científicos e o processo de aprendizagem do estudante.',
 120:'Segundo a tendência renovada não diretiva, as ações docentes deveriam ser mais voltadas aos problemas psicológicos do que aos problemas pedagógicos.'
}
const bloco=n=>range(n),adicoes=faltantes.map(n=>{
 const [[,],materia,conteudo,texto_apoio]=bloco(n),answer=answers.get(n),pagina=n<=120?3:0
 if(!answer||!texto_apoio)throw Error(`Dados incompletos no item ausente ${n}`)
 return {id:`extr-${doc}-q${n}`,documento_id:doc,documento_origem:'781_SEE_PE_003_01.PDF',fonte:prova,origem:'CEBRASPE — SEE/PE, prova objetiva de Conhecimentos Específicos — Música, aplicação em 02/04/2023',banca:'CEBRASPE',banca_original:'CEBRASPE',aplicacao:'SEE/PE',concurso:'SEE/PE — Professor de Música, Cargos 3 a 47',organizadora:'CEBRASPE',ano:2023,numero_original:n,materia,conteudo,tipo_documento:'Prova objetiva — conhecimentos específicos',tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],enunciado:transcricoes[n],texto_apoio,pagina,paginas_origem:[pagina],pagina_imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,imagens_paginas:[`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`],contexto_paginas:[{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto:texto_apoio}],resposta_correta:answer==='X'?null:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_781_SEE_PE_003_01.PDF',numero:n,resposta:answer,metodo:'Gabarito oficial definitivo CEBRASPE; verificado também o documento oficial de alterações.'},classificacao_fonte:prova,classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.95,classificacao_metodo:'Leitura individual do item e comparação com a página oficial',classificacao_evidencia:`Item ${n} transcrito da página 3 do caderno oficial e classificado pelo tema.`,status_revisao:'revisado',dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; não publicada pela banca.',integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:false,verificada_individualmente:true,pendencias:['hash_do_gabarito_oficial_nao_validado_localmente']},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:false,apontamentos:['hash_do_gabarito_oficial_nao_validado_localmente']}}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicosExistentes:presentes.size,duplicatas:decisions.filter(x=>x.duplicada_de).length,novasQuestoes:faltantes.length,coberturaFinal:presentes.size+adicoes.length,anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero_original),pendentesAntes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,classificacoes:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-see-pe-musica-2022-v164',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,alteracoes,registros_revistos:57,itens_unicos_antes:presentes.size,adicionados:faltantes,duplicatas_inelegiveis:3,anuladas:[77],paginas_originais:3,cobertura_itens_caderno_51_a_120:70,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
