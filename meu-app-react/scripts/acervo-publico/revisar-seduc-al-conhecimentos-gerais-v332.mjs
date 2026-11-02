import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='e60cf00511c427c6'
const prova='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/606_SEDUC_AL_CG1_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_CG1_01.PDF'
const concurso='SEDUC/AL — Professor — Conhecimentos Gerais — 2021'
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='606_SEDUC_AL_CG1_01.PDF'||!catalog.url.endsWith('/606_SEDUC_AL_CG1_01.PDF'))throw Error('Prova oficial não confere com o catálogo')
const keyPath='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const keyLines=(await fs.readFile(keyPath,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse)
const keyRecord=keyLines.find(x=>x.documento_id===doc&&x.arquivo_gabarito==='GAB_DEFINITIVO_606_SEDUC_AL_CG1_01.PDF')
if(!keyRecord||keyRecord.status!=='tabela_lida'||Object.keys(keyRecord.respostas||{}).length!==40)throw Error('A transcrição local do gabarito não é a esperada')
const officialAnswers={...keyRecord.respostas,'41':'C','42':'E','43':'E','44':'E','45':'C','46':'E','47':'C','48':'X','49':'C','50':'E'}
const topics={
'extr-098e1c9810526ecd1d43':[2,'Língua Portuguesa','Interpretação de textos — inferência e saúde mental','Média',1],
'extr-70ec1b7c919c06455e8b':[5,'Língua Portuguesa','Interpretação de textos — tese e argumento','Média',1],
'extr-9b375663c6239145b4a2':[10,'Língua Portuguesa','Morfossintaxe — concordância verbal','Fácil',1],
'extr-cbb99f3488f32375746e':[13,'Língua Portuguesa','Semântica — sentido de conjunções e conectivos','Média',1],
'extr-750364cd1195f0536b93':[15,'Língua Portuguesa','Interpretação de textos — valor argumentativo de “como se”','Média',1],
'extr-d42e72272ae6c35ae4c0':[17,'Língua Portuguesa','Interpretação de textos — relação de causa e motivação','Média',2],
'extr-b763f126041b0307cde8':[18,'Língua Portuguesa','Interpretação de textos — sentido de “ninharias”','Média',2],
'extr-b6a2f7e67737167fc732':[20,'Língua Portuguesa','Interpretação de textos — interlocução e apóstrofe','Fácil',2],
'extr-b76490d2efedc3dd807f':[21,'Língua Portuguesa','Interpretação de textos — finalidade e relação de propósito','Média',2],
'extr-83852479f575be452255':[24,'Língua Portuguesa','Interpretação de textos — inferência e construção concessiva','Média',2],
'extr-9d088382b2505cdd0a31':[25,'Língua Portuguesa','Interpretação de textos — inferência sobre o narrador','Média',2],
'extr-464417d4506acc43d525':[27,'Língua Portuguesa','Morfossintaxe — adjetivo e advérbio','Média',2],
'extr-c22dabb8b986573e4443':[28,'Língua Portuguesa','Interpretação de textos — atribuição de negligência','Fácil',2],
'extr-76b40640ae62e09cbeca':[30,'Língua Portuguesa','Semântica e reescrita — equivalência de sentido','Média',2],
'extr-79fb5fa2a2ac9ca1c631':[31,'Direito Administrativo','Regime jurídico — formas de provimento','Média',2],
'extr-a43a7c681829031d659e':[32,'Direito Administrativo','Regime jurídico — vencimento e remuneração','Média',2],
'extr-84a875b1ef4173097064':[33,'Direito Administrativo','Regime jurídico — responsabilidade disciplinar e prescrição','Difícil',2],
'extr-73694bc1193118631e39':[34,'Legislação Educacional','Gestão democrática do ensino público em Alagoas','Média',2],
'extr-7d552d93e00fdee58d7f':[36,'Ética no Serviço Público','Código de Ética Funcional do Servidor Civil de Alagoas','Média',2],
'extr-1af25b7cb36b655e9b38':[37,'Legislação Educacional','Plano de cargos do magistério — gratificação de função','Média',2],
'extr-009cb7c1392fcf4375ea':[38,'Legislação Educacional','Plano Estadual de Educação de Alagoas — metas e diretrizes','Média',2],
'extr-814e4b92ab02c44caa4f':[39,'Legislação Educacional','LDB — história e cultura afro-brasileira e indígena','Média',2],
'extr-ac09bd7bf6983b595bb8':[40,'Legislação Educacional','LDB — recuperação da aprendizagem e proposta pedagógica','Média',2],
'extr-56d003513e8530587769':[11,'Língua Portuguesa','Pontuação — emprego dos dois-pontos','Média',1],
'extr-0006fdba536140894b39':[41,'Legislação Educacional','Referencial Curricular de Alagoas — organização curricular','Média',3],
'extr-f3e46dc73e89b54cb547':[42,'Legislação Educacional','Referencial Curricular de Alagoas — organização das aprendizagens','Média',3],
'extr-3c120929dada14ed21df':[43,'Legislação Educacional','Referencial Curricular de Alagoas — implementação das orientações','Média',3],
'extr-0f39476ea285e921ceff':[44,'Legislação Educacional','Ensino Fundamental — transição dos anos iniciais','Média',3],
'extr-975174ef585bc997354c':[46,'Educação','Educação básica — violência simbólica e diversidade','Média',3],
'extr-39751058432a332e0265':[47,'Legislação Educacional','Currículo do Ensino Fundamental — continuidade das aprendizagens','Média',3],
'extr-e546be38e015c9bcb736':[48,'Legislação da Criança e do Adolescente','ECA e idade mínima para o trabalho do adolescente','Fácil',3],
'extr-54b699b36422c046a444':[49,'Legislação da Criança e do Adolescente','ECA — participação da família na proposta pedagógica','Fácil',3],
'extr-2cb0de99c6d423f62404':[50,'Legislação da Criança e do Adolescente','ECA — comunicação de faltas e evasão ao Conselho Tutelar','Média',3]
}
const duplicated={
'extr-09d050589e4503ede771':['extr-098e1c9810526ecd1d43','Duplicata OCR do item 2, já mantido com texto idêntico e a mesma referência visual.'],
'extr-b798678d81c3f8f57e9c':['extr-70ec1b7c919c06455e8b','Duplicata OCR do item 5; além de duplicar o item, incorporava o cabeçalho do bloco seguinte ao enunciado.'],
'extr-17a3fd1636fab5c94b84':['extr-9b375663c6239145b4a2','Registro rotulado como item 40, mas o texto reproduz o item 10; o item 10 já está presente com a numeração correta.'],
'extr-fc178a0c249adead4bd9':['extr-cbb99f3488f32375746e','Registro rotulado como item 43, mas o texto reproduz o item 13; o item 13 já está presente com a numeração correta.']
}
const targets=records.filter(q=>q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao===true&&q.materia==='Português'&&q.conteudo==='Fundamentos de Português')
if(targets.length!==37)throw Error(`Esperadas 37 pendências, encontradas ${targets.length}`)
const decisions=[]
for(const q of targets){
 const duplicate=duplicated[q.id]
 if(duplicate){decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),apta_resolucao:false,inelegibilidade_motivo:duplicate[1],duplicada_de:duplicate[0]});continue}
 const entry=topics[q.id]
 if(!entry)throw Error(`Registro sem decisão explícita: ${q.id}`)
 const [n,materia,conteudo,dificuldade,pagina]=entry,answer=officialAnswers[String(n)]
 if(!answer||!['C','E','X'].includes(answer))throw Error(`Sem chave oficial para o item corrigido ${n}`)
 if(q.opcoes?.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Alternativas Certo/Errado divergentes no item ${n}`)
 const anulada=answer==='X'
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Gerais — caderno 606CG1_01N129143',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo a complexidade textual, gramatical, normativa e inferencial; a banca não divulga dificuldade individual.',classificacao_fonte:prova,motivo:`Classificação pelo enunciado, seção e comando impressos no caderno oficial; resposta conferida na tabela definitiva do caderno CG1_01, item ${n}.`,resposta_correta:anulada?null:answer==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabarito,arquivo:keyRecord.arquivo_gabarito,prova:keyRecord.arquivo_prova,sha256:keyRecord.sha256,numero:n,resposta:answer,criterio:'Gabarito oficial definitivo CEBRASPE para o caderno CG1_01, confronto por numeração original. Item 48 anulado.'},remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']}
 if(Number(q.pagina)!==pagina||!String(q.imagem||'').endsWith(`-${String(pagina).padStart(4,'0')}.webp`))d.imagem_pagina=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 decisions.push(d)
}
if(decisions.length!==37||decisions.filter(x=>x.apta_resolucao!==false).length!==33||decisions.filter(x=>x.anulada).length!==1)throw Error('Contagens de classificações, duplicatas ou anulação divergentes')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({avaliadas:37,classificadas:33,duplicatasDesativadas:4,paginasCorrigidas:decisions.filter(d=>d.imagem_pagina).map(d=>d.numero_original),itensComGabarito:33,anulada:48,novasRespostasNoMapa:Object.keys(officialAnswers).filter(n=>!keyRecord.respostas[n]),publicado:false},null,2));process.exit(0)}
const nome='revisao-seduc-al-conhecimentos-gerais-v332'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
keyRecord.respostas=officialAnswers
keyRecord.gabarito_url=gabarito
keyRecord.observacao='Transcrição ampliada para os itens 1–50 após conferência da tabela oficial definitiva; o item 48 está anulado.'
const keyIndex=keyLines.findIndex(x=>x.documento_id===doc&&x.arquivo_gabarito===keyRecord.arquivo_gabarito);keyLines[keyIndex]=keyRecord
await fs.writeFile(keyPath,keyLines.map(x=>JSON.stringify(x)).join('\n')+'\n')
const report={...result,documento:doc,edicao:concurso,itensClassificados:33,duplicatasOuRotulosIncorretosDesativados:4,itensComGabaritoDefinitivo:33,questaoAnulada:48,paginasCorrigidas:decisions.filter(d=>d.imagem_pagina).map(d=>({questao:d.numero_original,pagina:d.pagina})),gabaritoAmpliadoAte:50,fonteProva:prova,fonteGabarito:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL — Conhecimentos Gerais — revisão v332\n\n- Reclassifiquei 33 itens distintos das questões de Português, legislação do servidor, legislação educacional, ECA e educação. Quatro registros duplicados ou rotulados com número incorreto foram desativados para resolução.\n- Corrigi a numeração de um item OCR identificado como 41, mas que é o item 11, e corrigi páginas de imagem divergentes nos itens 18, 21, 24, 25, 27, 30, 40 e 43.\n- A transcrição local do gabarito definitivo foi conferida e ampliada para os itens 1–50; o item 48 está anulado. As 33 questões resolvíveis receberam gabarito oficial e dificuldade estimada.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências. Não publicado na nuvem.\n- Fontes oficiais: [caderno SEDUC/AL 2021](<${prova}>), [gabarito definitivo CG1 — itens 1–50](<${gabarito}>).\n`)
console.log(JSON.stringify(report,null,2))
