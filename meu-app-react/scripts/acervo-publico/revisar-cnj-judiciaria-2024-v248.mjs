import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='f5bdc3aeec187720'
const prova='https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/979_CNJ_006_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/GAB_DEFINITIVO_979_CNJ_006_01.PDF'
const concurso='CNJ 2024 — Cargo 6: Analista Judiciário, Área Judiciária'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==73||catalog.url.toLowerCase()!==prova.toLowerCase())throw Error('Catálogo oficial CNJ 2024, Cargo 6, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-pf-farmacia-2018-v247'))
if(start<0)throw Error('Base v247 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==73)throw Error(`Esperados 73 recortes OCR do Cargo 6, encontrados ${active.size}`)

const topics=new Map([
 [51,['Direito Administrativo','Princípios constitucionais da administração pública e alcance sobre os Poderes e entes federativos']],
 [52,['Direito Constitucional','Regime próprio de previdência social e agentes ocupantes exclusivamente de cargo em comissão']],
 [53,['Direito Constitucional','Eficácia das normas constitucionais sobre prazo de validade de concurso público']],
 [54,['Direito Constitucional','Competências constitucionais do Conselho Nacional de Justiça e controle de constitucionalidade']],
 [55,['Direito Constitucional','Competência originária dos tribunais regionais federais em habeas data']],
 [56,['Direito Constitucional','Mandado de segurança coletivo: legitimidade e requisito temporal das associações']],
 [57,['Direito Constitucional','Competência originária do STJ para mandado de segurança contra ministro de Estado']],
 [58,['Direito Constitucional','Regime constitucional de precatórios e cessão de créditos']],
 [59,['Direito Administrativo','Cargo público vitalício, perda do cargo e aposentadoria compulsória']],
 [60,['Direito Administrativo','Poder de autoexecutoriedade dos atos administrativos']],
 [61,['Direito Administrativo','Regime jurídico das autarquias e princípio da especialidade']],
 [62,['Direito Administrativo','Desapropriação, finalidade pública e desvio de finalidade']],
 [63,['Direito Administrativo','Princípio da motivação e fundamentação dos atos administrativos']],
 [64,['Direito Administrativo','Princípio da impessoalidade e teoria do órgão na responsabilidade estatal']],
 [65,['Direito Administrativo','Processo administrativo federal: juízo de retratação em recurso']],
 [66,['Direito Administrativo','Improbidade administrativa: aplicação temporal da Lei 14.230/2021 e coisa julgada']],
 [67,['Direito Civil','Negócio jurídico solene e forma convencional além da exigência legal']],
 [68,['Direito Civil','LINDB: desuso, tolerância social e revogação de norma jurídica']],
 [69,['Direito Civil','Antinomias jurídicas: conflito entre critérios cronológico e da especialidade']],
 [70,['Direito Civil','Direitos da personalidade post mortem e legitimidade dos herdeiros para dano moral']],
 [71,['Direito Civil','Direitos da personalidade: alteração de prenome e gênero no registro civil']],
 [72,['Direito Civil','Prescrição civil: impedimento, suspensão, interrupção e prescrição intercorrente']],
 [73,['Direito Civil','Abuso de direito e responsabilidade civil objetiva']],
 [74,['Direito Civil','Responsabilidade civil e teoria da perda de uma chance']],
 [75,['Direito Processual Civil','Tutela provisória de urgência e distinção entre tutela cautelar e antecipada']],
 [76,['Direito Processual Civil','Competência do STF para controle de decisões do Conselho Nacional de Justiça']],
 [77,['Direito Processual Civil','Capacidade processual de órgãos e entes constitucionais despersonalizados']],
 [78,['Direito Processual Civil','Medidas executivas atípicas, efetividade e devido processo legal']],
 [79,['Direito Processual Civil','Tutela coletiva de direitos individuais homogêneos e liquidação excepcional']],
 [80,['Direito Processual Civil','Mediação e conciliação: confidencialidade e dever de sigilo']],
 [81,['Direito Processual Civil','Honorários recursais e majoração em grau de recurso']],
 [82,['Direito Processual Civil','Recursos contra decisão monocrática do relator e recurso ordinário']],
 [83,['Direito Penal','Abuso de autoridade: penas restritivas de direitos']],
 [84,['Direito Penal','Abuso de autoridade: reparação de danos e fixação de valor mínimo na sentença']],
 [85,['Direito Penal','Culpabilidade funcionalista e prevenção na teoria de Günther Jakobs']],
 [86,['Direito Penal','Excesso na legítima defesa: modalidades acidental e exculpante']],
 [87,['Direito Penal','Teoria finalista: dolo natural e culpabilidade normativa']],
 [88,['Direito Penal','Ilicitude, culpabilidade e potencial consciência da ilicitude']],
 [89,['Direito Penal','Prescrição da pena de multa e critérios de contagem']],
 [90,['Direito Penal','Lei penal no tempo: irretroatividade da lei mais gravosa e retroatividade benéfica']],
 [91,['Direito Processual Penal','Lavagem de capitais: fiança e atribuições do Ministério Público']],
 [92,['Direito Processual Penal','Competência jurisdicional em crime de lavagem de capitais']],
 [93,['Direito Processual Penal','Autonomia do crime de lavagem e prescrição do delito antecedente']],
 [94,['Direito Processual Penal','Suspensão do processo e da prescrição por não comparecimento do acusado']],
 [95,['Direito Processual Penal','Revelia no processo penal e ônus probatório da acusação']],
 [96,['Direito Processual Penal','Prova ilícita por derivação e teoria da fonte independente']],
 [97,['Direito Processual Penal','Laudo pericial e livre convencimento motivado na sentença penal']],
 [98,['Direito Processual Penal','Citação no processo penal e comparecimento espontâneo do acusado']],
 [99,['Direitos Humanos','Proteção judicial suficiente dos direitos humanos e limites da atuação legislativa']],
 [100,['Direito Constitucional','Hierarquia constitucional dos tratados internacionais de direitos humanos']],
 [101,['Direito Ambiental','Imprescritibilidade da reparação civil por dano ambiental']],
 [102,['Direito Constitucional','Ações afirmativas e igualdade material']],
 [103,['Direito Constitucional','Liberdade religiosa e neutralidade do poder público municipal']],
 [104,['Direito Penal','Homotransfobia e enquadramento penal conforme entendimento do STF']],
 [105,['Direito Constitucional','Reserva de vagas étnico-raciais e finalidade das ações afirmativas']],
 [106,['Direito Eleitoral','Financiamento eleitoral e percentual mínimo de recursos para candidaturas femininas']],
 [107,['Direito Notarial e Registral','Registro eletrônico: emissão de certidões por serventia diversa da origem']],
 [108,['Direito Notarial e Registral','Emolumentos: vedação de cobrança percentual sobre o valor do negócio']],
 [109,['Direito Notarial e Registral','Serviços notariais e registrais: finalidade, autenticidade, segurança e eficácia']],
 [110,['Direito Notarial e Registral','Escrituração, publicidade e conservação eletrônica dos registros públicos']],
 [111,['Direito Notarial e Registral','Reorganização e extinção de serventias extrajudiciais por lei formal']],
 [112,['Direito Notarial e Registral','Concurso de remoção e provimento de serventias extrajudiciais']],
 [113,['Direito Notarial e Registral','Contratação de escreventes e designação de substitutos em serventias']],
 [114,['Direito Notarial e Registral','Vacância e designação de responsável interino por serventia']],
 [115,['Direito Administrativo','Prescrição disciplinar aplicável a magistrados e infração também tipificada como crime']],
 [116,['Direito Administrativo','Responsabilidade disciplinar de magistrado e proporcionalidade das sanções']],
 [117,['Direito Administrativo','Impedimento e afastamento de magistrado membro de comissão de concurso']],
 [118,['Direito Notarial e Registral','Código Nacional de Normas do CNJ: designação interina e repasse do excedente de subsídio']],
 [119,['Direito Notarial e Registral','Incompatibilidade entre mandato eletivo e exercício de delegação notarial ou registral']],
 [120,['Direito Notarial e Registral','Apostilamento de documentos públicos para uso no exterior conforme Convenção da Haia']],
])
if(topics.size!==70)throw Error(`Mapeamento de conteúdo incompleto: ${topics.size}/70`)
const answers=['C','E','E','E','C','E','C','C','E','C','E','C','X','E','C','X','C','E','C','C','E','C','E','E','E','C','C','E','C','X','E','E','E','C','C','E','C','E','C','E','C','E','E','E','C','C','E','C','E','E','C','E','E','C','C','C','C','C','E','C','E','C','E','C','E','C','E','C','C','X']
if(answers.length!==70)throw Error('Chave oficial deve conter 70 respostas (51–120)')
const answerMap=new Map(answers.map((x,i)=>[i+51,x])),keyDigest=hashRevisao(answers.join(''))
const byNumber=new Map()
for(const e of catalog.questoes){const a=byNumber.get(Number(e.numero))||[];a.push(e);byNumber.set(Number(e.numero),a)}
const canonicalByNumber=new Map()
for(const [n,es] of byNumber){let chosen=es[0];if(n===63)chosen=es.find(e=>/princípios implícitos/.test(e.trecho||''))||es[1]||es[0];canonicalByNumber.set(n,chosen.id)}
const duplicateToCanonical=new Map()
for(const [n,es] of byNumber)for(const e of es)if(e.id!==canonicalByNumber.get(n))duplicateToCanonical.set(e.id,canonicalByNumber.get(n))
if(duplicateToCanonical.size!==6||byNumber.size!==67)throw Error(`OCR duplication profile changed: ${duplicateToCanonical.size} duplicates, ${byNumber.size} item numbers`)
for(const page of new Set(catalog.questoes.map(x=>x.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
const decisions=[...active.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!page||!topics.has(n))throw Error(`Registro sem mapeamento/página: ${q.id}`)
 const k=answerMap.get(n),anulada=k==='X',materia=topics.get(n)[0],conteudo=topics.get(n)[1]
 const image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const context=(e.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua do caderno oficial que preserva o comando ou contexto compartilhado.'}))
 const duplicate=duplicateToCanonical.has(q.id)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,concurso,numero_original:n,pagina:page,dificuldade:[53,56,57,62,66,69,73,74,78,82,85,87,90,92,94,96,97,100,103,104,106,111,112,115,118,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade normativa, articulação jurisprudencial e técnica processual; não é faixa oficial divulgada pela banca.',classificacao_fonte:prova,motivo:`Cebraspe/CNJ 2024, Cargo 6 — Analista Judiciário, Área Judiciária. Item ${n}, página ${page}; matéria e tópico atribuídos pela seção do caderno e pelo comando, com conferência do edital e do gabarito definitivos.`,resposta_correta:anulada?null:k==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência dos 70 valores oficiais dos itens 51–120; X representa item anulado.'},visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Página do caderno oficial vinculada e conferida para preservar o enunciado e sua apresentação original.'},...(context.length?{imagens_contexto:context}:{}),...(duplicate?{apta_resolucao:false,duplicada_de:duplicateToCanonical.get(q.id),inelegibilidade_motivo:'Recorte OCR repetido do mesmo item e da mesma edição; o registro canônico permanece disponível.'}:{apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']})}
})
const add=(n,enunciado)=>{const k=answerMap.get(n),anulada=k==='X',page=4,image=`paginas/${doc}-0004.webp`,materia=topics.get(n)[0],conteudo=topics.get(n)[1];return {id:`extr-cnj24-cargo6-q${n}`,ano:2024,banca:'CEBRASPE',banca_original:'CEBRASPE',organizadora:'CEBRASPE',concurso,aplicacao:concurso,numero_original:n,pagina:page,documento_id:doc,materia,conteudo,enunciado,opcoes:['Certo','Errado'],resposta_correta:anulada?null:k==='C'?0:1,anulada,origem:'Cebraspe — Conselho Nacional de Justiça, Cargo 6, Analista Judiciário — Área Judiciária',fonte:prova,documento_origem:catalog.arquivo,tipo_documento:'Prova objetiva — conhecimentos específicos',tipo_extraido:'certo_errado',tipo_resposta:'certo_errado',status_revisao:'revisado',classificacao_pendente:false,classificacao_revisada:true,classificacao_confianca:0.99,classificacao_metodo:'Transcrição conferida visualmente na página oficial e classificação pelo tema e pelo comando',classificacao_evidencia:`Item ${n}, página 4 do caderno oficial; aplicação e cargo confirmados no gabarito definitivo do Cebraspe.`,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial; a banca não publica nível individual por item.',gabarito_oficial:{fonte:gabarito,numero:n,pagina:1,resposta:k,sha256:keyDigest,hash_metodo:'SHA-256 da sequência dos 70 valores oficiais 51–120; X representa item anulado.'},pagina_imagem:image,imagens_paginas:[image],paginas_origem:[page],contexto_paginas:[{pagina:page,imagem:image}],integridade_profissional:{versao:1,apta_resolucao:true,correcao_automatica:!anulada,verificada_individualmente:true,pendencias:[]},elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:!anulada,apontamentos:[]}}}
const additions=[
 add(118,'Suponha que Antônio tenha sido designado para responder interinamente por um ofício de registro de imóveis. Nessa situação, se for constatado em procedimento administrativo que ele não tem efetuado o repasse ao respectivo tribunal de justiça do excedente a 90,25% do subsídio de ministro do Supremo Tribunal Federal, a designação de Antônio deverá ser revogada.'),
 add(119,'Considere que um notário tenha sido eleito deputado federal e pretenda exercer o seu mandato eletivo. Nesse caso, ele deve afastar-se do serviço delegado desde a sua diplomação e tem direito à percepção integral dos emolumentos gerados em decorrência da atividade notarial que lhe tiver sido delegada.'),
 add(120,'A legalização de documentos públicos produzidos em território nacional e destinados a produzir efeitos em países partes da Convenção sobre a Eliminação da Exigência de Legalização de Documentos Públicos Estrangeiros é realizada por meio da aposição de apostila que, emitida em meio físico, será afixada no documento pela autoridade apostilante e entregue de forma avulsa ao solicitante do serviço.')
]
if(decisions.length!==73||new Set(decisions.map(x=>x.id)).size!==73||additions.length!==3)throw Error('Quantidade de recortes ou itens faltantes inconsistente')
// Confirm that the three recovered original items do not duplicate any question already in the active bank.
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
const additionTexts=new Map(additions.map(q=>[norm(q.enunciado),q.id]))
for await(const {questoes} of lotesAtuais(bases))for(const q of questoes){const k=norm(q.enunciado);if(additionTexts.has(k))throw Error(`Questão recuperada já existe no acervo: ${additionTexts.get(k)} ↔ ${q.id}`)}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({recortesOCR:73,questoesExistentesUnicas:67,duplicatasOCR:6,questoesRecuperadas:3,questoesUnicasFinais:70,novasClassificacoes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,anuladas:decisions.filter(x=>answerMap.get(x.numero_original)==='X'&&!duplicateToCanonical.has(x.id)).length+additions.filter(x=>x.anulada).length,gabarito:'70/70 itens oficiais cobertos',porMateria:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m&&!duplicateToCanonical.has(x.id)).length+additions.filter(x=>x.materia===m).length])),fonte:prova,gabaritoFonte:gabarito},null,2));process.exit(0)}
const name='revisao-cnj-judiciaria-2024-v248'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions,adicoes:additions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,recortesOCR:73,questoesExistentesUnicas:67,duplicatasOCR:6,questoesRecuperadas:3,questoesUnicasFinais:70,anuladas:decisions.filter(x=>answerMap.get(x.numero_original)==='X'&&!duplicateToCanonical.has(x.id)).length+additions.filter(x=>x.anulada).length,porMateria:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m&&!duplicateToCanonical.has(x.id)).length+additions.filter(x=>x.materia===m).length])),gabaritoOficial:'70/70 itens cobertos',fonte:prova,gabaritoFonte:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão CNJ 2024 — Cargo 6: Analista Judiciário, Área Judiciária — v248\n\n- Revisei os 73 recortes OCR dos itens 51–117 e corrigi o falso rótulo concentrado em Direito Civil. O caderno oficial reúne Direito Constitucional, Administrativo, Civil, Processual Civil, Penal, Processual Penal, Direitos Humanos, Ambiental, Eleitoral e Notarial/Registral; atribuí matéria e conteúdo específico a cada item.\n- A comparação com o PDF oficial mostrou seis cópias OCR dos itens 55, 60, 61, 63, 64 e 73; sinalizei-as como inelegíveis e mantive uma versão canônica por item. A página 4 contém ainda os itens 118–120, ausentes do acervo: transcrevi-os e adicionei-os após conferir que não havia enunciados equivalentes no banco. O gabarito definitivo oficial cobre os 70 itens; preservei as anulações (63, 66, 80 e 120) e não habilitei correção automática para elas.\n- Validação local: ${result.classificadas} registros revisados, ${result.adicionadas} questões recuperadas, seis duplicatas sinalizadas, ${result.contextos_visuais} referências visuais, ${result.total} registros no banco, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno Cargo 6](https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/979_CNJ_006_01.PDF), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/cnj_24/arquivos/GAB_DEFINITIVO_979_CNJ_006_01.PDF), [página oficial do concurso](https://www.cebraspe.org.br/concursos/CNJ_24).\n`)
console.log(JSON.stringify(out,null,2))
