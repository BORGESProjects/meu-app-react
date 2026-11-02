import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='694222a25a72d963'
const prova='https://cdn.cebraspe.org.br/concursos/cnmp_23/arquivos/814_CNMP_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cnmp_23/arquivos/GAB_DEFINITIVO_814_CNMP_002_01.PDF'
const concurso='CNMP — Analista — Apoio Técnico Especializado — Arquivologia — 2023'
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='814_CNMP_002_01.PDF'||catalog.ano_catalogo!=='2023'||!catalog.tipo_catalogo.includes('CARGO 2'))throw Error('O catálogo não identifica o caderno do Cargo 2')
const keyRecord=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc&&x.arquivo_gabarito==='GAB_DEFINITIVO_814_CNMP_002_01.PDF')
if(!keyRecord||keyRecord.status!=='tabela_lida'||Object.keys(keyRecord.respostas).length!==60||keyRecord.respostas['51']!=='C'||keyRecord.respostas['110']!=='E')throw Error('Gabarito definitivo ou faixa 51–110 ausente')
const topics={
'extr-fc399128b35f12323ffd':[51,'Arquivologia','Arquivos digitais — preservação do contexto de criação','Média',1],
'extr-607b10bdd0b035f120de':[52,'Arquivologia','Arquivos digitais — organização por fundos e novas bases conceituais','Média',1],
'extr-845af6460bc78074614b':[53,'Arquivologia','Records continuum e ciclo de vida documental','Média',1],
'extr-50a428a2ce668f1fa067':[54,'Arquivologia','Princípios arquivísticos — pertinência e organização por assunto','Média',1],
'extr-3a2f994a56c843189658':[55,'Arquivologia','Funções sociais dos arquivos no ambiente digital','Média',1],
'extr-5763f05c8504be2689c4':[58,'Arquivologia','Sistema Nacional de Arquivos — composição e âmbito de atuação','Média',1],
'extr-60481aef939f27093d85':[59,'Arquivologia','SINAR — custódia e acesso a documentos permanentes','Fácil',1],
'extr-d3681f1376a242be8d33':[64,'Arquivologia','Descrição arquivística — registros de autoridade','Média',1],
'extr-6a935cc0c8d406f727e4':[66,'Arquivologia','ISAAR-CPF — descrição de produtores de arquivo','Fácil',1],
'extr-ecf8dd45bcde7cb904d8':[67,'Arquivologia','ISAAR-CPF — áreas e elementos de descrição','Média',1],
'extr-681d98ed969b914ff7e1':[68,'Arquivologia','Sistemas e redes de arquivos — conceitos e ambiente digital','Média',1],
'extr-4989d75714d75f84289a':[69,'Arquivologia','Gestão documental — programas de documentos vitais','Média',1],
'extr-0d2943ecefa5825d65a9':[70,'Arquivologia','Gestão documental — produção e ciclo de vida','Fácil',1],
'extr-3718a1696fba0979248e':[73,'Arquivologia','Protocolo — quantificação de documentos especiais','Fácil',1],
'extr-76163a1ebed041b737e1':[74,'Arquivologia','Protocolo — tramitação documental','Fácil',1],
'extr-5eea969d4f24ca729d63':[75,'Arquivologia','Protocolo — tratamento de correspondência pessoal','Média',1],
'extr-8d0459a33e3e489cb726':[79,'Arquivologia','Funções arquivísticas — criação e padronização documental','Fácil',1],
'extr-2a08b83dbc99f04fa235':[80,'Arquivologia','Funções arquivísticas — reprodução e difusão','Fácil',1],
'extr-67c8dcefdd001c0c54f3':[81,'Arquivologia','Análise tipológica — classificação e avaliação documental','Média',1],
'extr-6bfb2bc70493b381e9fa':[82,'Arquivologia','Análise tipológica — espécie e elementos internos do documento','Média',1],
'extr-bc4036aaef45d397df1f':[83,'Arquivologia','Análise tipológica — abordagens arquivística e diplomática','Média',1],
'extr-a5a27896f94319cc5f9e':[84,'Arquivologia','Classificação documental — tipologia e estrutura de fundos','Média',1],
'extr-196be95e830c1d102fa5':[85,'Arquivologia','Classificação documental — uso da análise tipológica','Média',1],
'extr-70ba6c95326678fd179c':[86,'Arquivologia','Acesso a documentos — tramitação de material sigiloso','Média',2],
'extr-f172360b78066650ea52':[87,'Direito de Acesso à Informação','Acesso parcial a documentos sigilosos e dados não sigilosos','Média',2],
'extr-97ab6e338dffdc357dd5':[88,'Arquivologia','Sistemas informatizados — acesso a processos eletrônicos','Média',2],
'extr-d6477fd713290f72b409':[96,'Arquivologia','Microfilmagem — segurança e preservação documental','Fácil',2],
'extr-6628fcf29229716c09ec':[97,'Arquivologia','Microfilmagem — avaliação e destinação documental','Média',2],
'extr-4f465d1cf864e45159b4':[98,'Arquivologia','Microfilmagem — acesso e difusão de imagens','Média',2],
'extr-8c71826cb6fbff482fd4':[99,'Arquivologia','Microfilmagem — filmes e extração de cópias','Média',2],
'extr-04528fad0ecbb98d5206':[100,'Arquivologia','Microfilmagem — tratamento de documentos fragilizados','Média',2],
'extr-e70aec36289c6f84c657':[104,'Direito Constitucional','Processo legislativo — reedição de medida provisória','Média',2],
'extr-bdba796f5496b4c26cac':[105,'Direito Constitucional','Conselho Nacional do Ministério Público — composição','Média',2],
'extr-ea90eed066cdd92afc58':[106,'Direito Constitucional','Conselho Nacional do Ministério Público — escolha do corregedor','Difícil',2],
'extr-78d1e2319254546eb4dd':[108,'Direito Constitucional','Eficácia das normas constitucionais — normas plenas','Média',2],
'extr-0c93905ca69a28cf2074':[109,'Direito Constitucional','Eficácia das normas constitucionais — normas contidas','Média',2]
}
const support={
51:'Acerca dos princípios e conceitos arquivísticos, julgue os itens seguintes.',52:'Acerca dos princípios e conceitos arquivísticos, julgue os itens seguintes.',53:'Acerca dos princípios e conceitos arquivísticos, julgue os itens seguintes.',54:'Acerca dos princípios e conceitos arquivísticos, julgue os itens seguintes.',55:'Acerca dos princípios e conceitos arquivísticos, julgue os itens seguintes.',
58:'Julgue os itens relativos às políticas públicas de arquivo e à legislação arquivística. Considere CONARQ como Conselho Nacional de Arquivos e SINAR como Sistema Nacional de Arquivos.',59:'Julgue os itens relativos às políticas públicas de arquivo e à legislação arquivística. Considere CONARQ como Conselho Nacional de Arquivos e SINAR como Sistema Nacional de Arquivos.',
64:'Considere a Norma Brasileira de Descrição Arquivística (NOBRADE) e a Norma Internacional de Registro de Autoridade Arquivística para Entidades Coletivas, Pessoas e Famílias (ISAAR-CPF).',66:'Considere a Norma Brasileira de Descrição Arquivística (NOBRADE) e a Norma Internacional de Registro de Autoridade Arquivística para Entidades Coletivas, Pessoas e Famílias (ISAAR-CPF).',67:'Considere a Norma Brasileira de Descrição Arquivística (NOBRADE) e a Norma Internacional de Registro de Autoridade Arquivística para Entidades Coletivas, Pessoas e Famílias (ISAAR-CPF).',
68:'A respeito de sistemas e redes de arquivo e da gestão de documentos, julgue os itens seguintes.',69:'A respeito de sistemas e redes de arquivo e da gestão de documentos, julgue os itens seguintes.',70:'A respeito de sistemas e redes de arquivo e da gestão de documentos, julgue os itens seguintes.',
73:'Com relação ao diagnóstico da situação arquivística e ao protocolo, julgue os itens seguintes.',74:'Com relação ao diagnóstico da situação arquivística e ao protocolo, julgue os itens seguintes.',75:'Com relação ao diagnóstico da situação arquivística e ao protocolo, julgue os itens seguintes.',
79:'Acerca das funções arquivísticas, julgue os itens seguintes.',80:'Acerca das funções arquivísticas, julgue os itens seguintes.',
81:'A respeito da análise tipológica de documentos de arquivo, julgue os itens subsequentes.',82:'A respeito da análise tipológica de documentos de arquivo, julgue os itens subsequentes.',83:'A respeito da análise tipológica de documentos de arquivo, julgue os itens subsequentes.',84:'A respeito da análise tipológica de documentos de arquivo, julgue os itens subsequentes.',85:'A respeito da análise tipológica de documentos de arquivo, julgue os itens subsequentes.',
86:'Considerando as políticas de acesso aos documentos de arquivo, julgue os itens seguintes.',87:'Considerando as políticas de acesso aos documentos de arquivo, julgue os itens seguintes.',88:'Considerando as políticas de acesso aos documentos de arquivo, julgue os itens seguintes.',
96:'No que se refere à microfilmagem de documentos de arquivo, julgue os itens seguintes.',97:'No que se refere à microfilmagem de documentos de arquivo, julgue os itens seguintes.',98:'No que se refere à microfilmagem de documentos de arquivo, julgue os itens seguintes.',99:'No que se refere à microfilmagem de documentos de arquivo, julgue os itens seguintes.',100:'No que se refere à microfilmagem de documentos de arquivo, julgue os itens seguintes.',
104:'De acordo com as disposições constitucionais e o entendimento do STF sobre organização político-administrativa do Estado, Poder Legislativo e atribuições do presidente da República, julgue os itens.',105:'De acordo com as disposições constitucionais acerca do Conselho Nacional do Ministério Público (CNMP), julgue os itens.',106:'De acordo com as disposições constitucionais acerca do Conselho Nacional do Ministério Público (CNMP), julgue os itens.',
108:'Julgue os itens sobre aplicabilidade das normas constitucionais, direitos e garantias fundamentais e competências legislativas dos entes da Federação.',109:'Julgue os itens sobre aplicabilidade das normas constitucionais, direitos e garantias fundamentais e competências legislativas dos entes da Federação.'
}
const duplicateId='extr-f7263357211b81e7f41f'
const targets=records.filter(q=>q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao===true&&q.materia==='Conhecimentos Específicos'&&q.conteudo==='Conteúdos gerais de Conhecimentos Específicos')
if(targets.length!==37)throw Error(`Esperadas 37 pendências, encontradas ${targets.length}`)
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']
const decisions=[]
for(const q of targets){
 if(q.id===duplicateId){decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),apta_resolucao:false,inelegibilidade_motivo:'Duplicata OCR do item 55. O mesmo enunciado está preservado no registro extr-3a2f994a56c843189658, que contém a página original e o contexto arquivístico.',duplicada_de:'extr-3a2f994a56c843189658'});continue}
 const entry=topics[q.id]
 if(!entry)throw Error(`Registro sem classificação explícita: ${q.id}`)
 const [n,materia,conteudo,dificuldade,pagina]=entry,answer=keyRecord.respostas[String(n)]
 if(Number(q.numero)!==n||!answer||!['C','E','X'].includes(answer))throw Error(`Item ${n}: número ou gabarito incompatível`)
 if(q.opcoes?.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Item ${n}: alternativas C/E inválidas`)
 if(Number(q.pagina)!==pagina||!String(q.imagem||'').endsWith(`-${String(pagina).padStart(4,'0')}.webp`))throw Error(`Item ${n}: referência de página divergente`)
 const anulada=answer==='X';let enunciado=q.enunciado
 if(n===55)enunciado=enunciado.split('\nJulgue os seguintes itens, relativos às políticas públicas')[0].trim()
 if(n===80)enunciado=enunciado.split('\nA respeito da análise tipológica')[0].trim()
 if(n===85)enunciado=enunciado.split('\n81400201758857 CEBRASPE')[0].trim()
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — Cargo 2 — Analista do CNMP, Apoio Técnico Especializado, Arquivologia',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo a especificidade arquivística, normativa ou constitucional exigida; não é classificação oficial da banca.',classificacao_fonte:prova,motivo:`Classificação individual pela área técnica e pelo comando do caderno oficial; resposta confrontada com o gabarito definitivo do Cargo 2, item ${n}.`,enunciado,texto_apoio:support[n]||'',resposta_correta:anulada?null:answer==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabarito,arquivo:keyRecord.arquivo_gabarito,prova:keyRecord.arquivo_prova,sha256:keyRecord.sha256,numero:n,resposta:answer,criterio:'Gabarito definitivo CEBRASPE, caderno 814_CNMP_002_01, Cargo 2 — Arquivologia; item 108 anulado.'},remover_pendencias:pendencias}
 if(n===85)d.imagem_pagina=`paginas/${doc}-0001.webp`
 decisions.push(d)
}
if(decisions.length!==37||decisions.filter(d=>d.apta_resolucao!==false).length!==36||decisions.filter(d=>d.anulada).length!==1)throw Error('Contagem de classificações, duplicata ou item anulado incorreta')
for(const d of decisions.filter(x=>x.apta_resolucao!==false))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({avaliadas:37,classificadas:36,duplicataDesativada:1,comGabaritoDefinitivo:36,anulada:108,correcoesDeOCR:[55,80,85],paginaExtraRemovida:{questao:85,pagina:2},textosDeContexto:decisions.filter(d=>d.texto_apoio).length,publicado:false},null,2));process.exit(0)}
const nome='revisao-cnmp-arquivologia-cargo2-2023-pendentes-v334'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,itensClassificados:36,itensComGabaritoDefinitivo:36,itemAnulado:108,duplicatasDesativadas:1,correcoesDeOCR:[55,80,85],referenciaExtraRemovida:{questao:85,pagina:2},fonteProva:prova,fonteGabarito:gabarito,sha256Gabarito:keyRecord.sha256,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CNMP 2023 — Cargo 2 — Arquivologia — revisão v334\n\n- Classifiquei 36 itens distintos em arquivologia, direito de acesso à informação e direito constitucional e associei todos ao gabarito definitivo do mesmo caderno. O item 108 está anulado.\n- Desativei uma duplicata do item 55; removi comandos de blocos seguintes que haviam sido anexados às questões 55, 80 e 85.\n- O item 85 tinha uma imagem extra da página 2, que inicia o bloco seguinte; removi essa associação. Recompus os comandos comuns necessários para interpretar cada grupo de itens.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências. Não publicado na nuvem.\n- Fontes: [caderno oficial do Cargo 2](<${prova}>), [gabarito definitivo do Cargo 2](<${gabarito}>).\n`)
console.log(JSON.stringify(report,null,2))
