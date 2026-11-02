import fs from 'node:fs/promises'
import path from 'node:path'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='61f95739c3c34aab'
const prova='https://cdn.cebraspe.org.br/concursos/STM_25/arquivos/072_STM_004_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/STM_25/arquivos/Gab_Definitivo_072_STM_004_01.pdf'
const concurso='STM 2025 — Analista Judiciário — Área: Apoio Especializado — Especialidade: Comunicação Social — Cargo 4'
const cargo='Analista Judiciário — Área: Apoio Especializado — Especialidade: Comunicação Social — Cargo 4'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='072_STM_004_01.pdf'||catalog.url!==prova||catalog.ano_catalogo!=='2025'||catalog.questoes.length!==74)throw Error('Caderno divergente do catálogo documental')
const base=raizesAtuais[0]
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(records.length!==74||new Set(records.map(q=>q.id)).size!==74)throw Error('Esperados 74 registros OCR únicos por ID')
const answers={51:'C',52:'E',53:'X',54:'E',55:'E',56:'E',57:'C',58:'C',59:'C',60:'E',61:'C',62:'E',63:'C',64:'E',65:'E',66:'C',67:'C',68:'E',69:'C',70:'C',71:'C',72:'C',73:'E',74:'E',75:'E',76:'C',77:'C',78:'X',79:'E',80:'C',81:'C',82:'E',83:'E',84:'X',85:'E',86:'C',87:'C',88:'E',89:'E',90:'C',91:'C',92:'E',93:'C',94:'E',95:'C',96:'E',97:'C',98:'E',99:'C',100:'C',101:'E',102:'E',103:'C',104:'E',105:'E',106:'X',107:'C',108:'C',109:'E',110:'C',111:'E',112:'C',113:'E',114:'C',115:'C',116:'C',117:'C',118:'E',119:'E',120:'C'}
if(Object.keys(answers).length!==70||Object.keys(answers).some(n=>Number(n)<51||Number(n)>120))throw Error('Tabela de respostas incompleta')
const gabaritoRecord=fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8').then(s=>s.split('\n').filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc))
const official=await gabaritoRecord
if(!official||official.status!=='tabela_lida'||official.prova_url!==prova||official.gabarito_url!==gabarito||official.sha256!=='854e34de0320e55ec4af4feb421ba540ae1f17898e67e41bc6363eda533b787f')throw Error('Registro do gabarito definitivo oficial não confere')
for(let n=51;n<=110;n++)if(official.respostas[String(n)]!==answers[n])throw Error(`Divergência entre tabela local e chave oficial no item ${n}`)
for(const n of Object.keys(answers))if(!catalog.questoes.some(q=>Number(q.numero)===Number(n)))throw Error(`Item ${n} ausente do catálogo`)

const subjects={
 51:'Comunicação Social',52:'Comunicação Social',53:'Comunicação Social',54:'Comunicação Social',55:'Comunicação Social',
 56:'Comunicação Social',57:'Comunicação Social',58:'Comunicação Social',59:'Comunicação Organizacional',60:'Comunicação Organizacional',
 61:'Relações Públicas',62:'Relações Públicas',63:'Relações Públicas',64:'Assessoria de Comunicação',65:'Assessoria de Comunicação',66:'Assessoria de Comunicação',
 67:'Jornalismo',68:'Jornalismo',69:'Assessoria de Imprensa',70:'Jornalismo',71:'Jornalismo',72:'Jornalismo',73:'Relações Públicas',74:'Relações Públicas',
 75:'Comunicação Organizacional',76:'Comunicação Organizacional',77:'Comunicação Organizacional',78:'Comunicação Organizacional',79:'Comunicação Organizacional',80:'Assessoria de Imprensa',81:'Comunicação Organizacional',82:'Comunicação Organizacional',
 83:'Teoria da Comunicação',84:'Teoria da Comunicação',85:'Teoria do Jornalismo',86:'Jornalismo',87:'Jornalismo',88:'Jornalismo',89:'Fotojornalismo',90:'Fotojornalismo',
 91:'Radiojornalismo',92:'Jornalismo',93:'Telejornalismo',94:'Telejornalismo',95:'Telejornalismo',96:'Telejornalismo',97:'Telejornalismo',
 98:'Comunicação Social',99:'Comunicação Social',100:'Comunicação Social',101:'Comunicação Social',102:'Comunicação Social',
 103:'Comunicação Pública',104:'Comunicação Pública',105:'Comunicação Pública',106:'Linguagem Simples',107:'Linguagem Simples',108:'Linguagem Simples',109:'Linguagem Simples',110:'Linguagem Simples',111:'Linguagem Simples',
 112:'Jornalismo Jurídico',113:'Jornalismo Digital',114:'Jornalismo Digital',115:'Jornalismo Digital',116:'Jornalismo Digital',117:'Jornalismo Digital',118:'Jornalismo Digital',119:'Jornalismo',120:'Jornalismo'
}
const contents={
 51:'Comunicação pública: ouvidorias, audiências e serviços digitais',52:'Comunicação pública: instrumentos de diálogo e participação cidadã',53:'Comunicação pública: cidadania e participação política',54:'Comunicação pública: Estado, sociedade civil e setor privado',55:'Comunicação institucional: classificação de instrumentos por efeitos e públicos',
 56:'Lei de Acesso à Informação: publicidade como regra e sigilo como exceção',57:'Lei de Acesso à Informação: âmbito federativo e garantia constitucional',58:'Lei de Acesso à Informação: transparência ativa na Internet',59:'Comunicação organizacional integrada: cultura e identidade',60:'Estrutura da comunicação nas organizações: assessoria, staff e linha de autoridade',
 61:'Assessoria de comunicação: marketing de conteúdo e otimização para mecanismos de busca',62:'Assessoria de comunicação: midiatização e papel de mediação',63:'Assessoria de comunicação: relacionamento entre fontes e imprensa',64:'Assessoria de imprensa: pauta exclusiva e princípio da impessoalidade',65:'Assessoria de imprensa: levantamento e planejamento de pautas',66:'Release convencional e social media release: alcance e replicabilidade',
 67:'Auditoria de mídia: posicionamento, temas e fontes no noticiário',68:'Jornalismo: artigo como gênero opinativo',69:'Assessoria de imprensa: atendimento aos veículos e interesse público',70:'Clipping: coleta, organização, avaliação e circulação de notícias',71:'Entrevista coletiva: local, acesso e preparação técnica',72:'Entrevista coletiva: sequência, regras, fonte e organização posterior',73:'Comunicação de crise: transparência em situações graves',74:'Comunicação de crise: conteúdo e momento das informações ao público',
 75:'Comunicação interna: comunicação não verbal nas organizações',76:'Jornalismo institucional: integração com publicidade, propaganda e relações públicas',77:'Jornalismo institucional: públicos interno e externo',78:'Jornalismo institucional: heterogeneidade do público-alvo',79:'Comunicação interna: estruturação de canais e ações',80:'Assessoria de imprensa como atividade de comunicação institucional',81:'Jornalismo institucional: interesse e exposição dos públicos afetados',82:'Comunicação interna: públicos e vínculo organizacional',
 83:'Espiral do silêncio: opinião pública e influência dos meios de comunicação',84:'Agenda setting: influência da mídia sobre temas públicos',85:'Newsmaking: rotinas, autonomia profissional e organização das redações',86:'Entrevista jornalística: título e declaração de maior relevância',87:'Edição de entrevista: clareza, fidelidade e função noticiosa',88:'Entrevista em texto corrido: discurso direto e indireto',89:'Fotojornalismo: imagem, conflito e risco de sensacionalismo',90:'Fotojornalismo: função documental, histórica e antropológica',
 91:'Radiojornalismo: alcance e acesso em regiões remotas',92:'Telejornalismo: pré-produção e atribuições da equipe',93:'Radiojornalismo: gravação de off e decupagem',94:'Telejornalismo: checagem e verificação na pós-produção',95:'Telejornalismo: montagem do espelho e planejamento da produção',96:'Linguagem audiovisual: apelo sensorial e comparação com o rádio',97:'Produção jornalística: reavaliação de conteúdo e linha editorial',
 98:'Comitê de Comunicação Social do Poder Judiciário: periodicidade das reuniões',99:'Comitê de Comunicação Social do Poder Judiciário: composição',100:'Comitê de Comunicação Social do Poder Judiciário: propaganda institucional',101:'Comitê de Comunicação Social do Poder Judiciário: trabalho e remuneração dos membros',102:'Comitê de Comunicação Social do Poder Judiciário: competências e recomendações',
 103:'Resolução CNJ n.º 407/2021: canais para comunicação institucional',104:'Resolução CNJ n.º 407/2021: divulgação de demandas urgentes',105:'Resolução CNJ n.º 407/2021: canais digitais e comunicação interna',106:'Pacto Nacional do Judiciário pela Linguagem Simples: comunicação digital e transparência',107:'Pacto Nacional do Judiciário pela Linguagem Simples: formação de magistrados e servidores',108:'Linguagem simples: acessibilidade e recursos inclusivos',109:'Linguagem simples: simplificação, brevidade e objetividade',110:'Linguagem simples: manuais para compreensão de termos jurídicos',111:'Linguagem simples: brevidade em comunicações orais institucionais',
 112:'Jornalismo jurídico: domínio técnico e clareza para o público',113:'Webjornalismo: gêneros textuais e transformação da pirâmide invertida',114:'Jornalismo digital: formatos editoriais por grupos de usuários',115:'Jornalismo digital: interatividade e antecedentes pré-Internet',116:'Redes sociais: arquitetura informacional e conceito de micromídia',117:'Hipertexto: links e acesso a bases de dados',118:'Jornalismo digital: recursos visuais de hiperlinks',119:'Fake news: terminologia para desinformação e ataques de hackers',120:'Fake news: verificabilidade e interesse público no conceito de notícia'
}
if(Object.keys(subjects).length!==70||Object.keys(contents).length!==70)throw Error('Classificações específicas incompletas')
const groups=[
 [[51,55],'Bloco do caderno sobre comunicação pública, seus instrumentos, participação e direitos de acesso à informação.'],
 [[56,58],'Bloco sobre a Lei n.º 12.527/2011 (Lei de Acesso à Informação), transparência e acesso a dados públicos.'],
 [[59,60],'Bloco sobre comunicação organizacional, estrutura, cultura e identidade institucional.'],
 [[61,63],'Bloco sobre assessoria de comunicação e relacionamento com fontes, imprensa e públicos.'],
 [[64,66],'Bloco sobre sugestão de pauta, releases e relacionamento com jornalistas.'],
 [[67,70],'Bloco sobre produtos de assessoria, auditoria de mídia, atendimento à imprensa e clipping.'],
 [[71,72],'Bloco sobre organização, sequência e condução de entrevistas coletivas.'],
 [[73,74],'Bloco sobre comunicação de crise e dever de informar.'],
 [[75,82],'Bloco sobre jornalismo institucional, comunicação interna e públicos organizacionais.'],
 [[83,85],'Bloco sobre teorias do jornalismo e formação da agenda pública.'],
 [[86,88],'Bloco sobre entrevista jornalística, edição e formas de apresentação do discurso.'],
 [[89,90],'Bloco sobre fotojornalismo, documentação visual e representação da realidade.'],
 [[91,97],'Bloco sobre produção em rádio e televisão, etapas, equipes e linguagem audiovisual.'],
 [[98,102],'Bloco sobre o Comitê de Comunicação Social do Poder Judiciário, conforme Portaria CNJ n.º 198/2019.'],
 [[103,105],'Bloco sobre o Plano Complementar de Comunicação Interna dos Tribunais, Resolução CNJ n.º 407/2021.'],
 [[106,111],'Bloco sobre o Pacto Nacional do Judiciário pela Linguagem Simples e seus eixos de comunicação.'],
 [[112,116],'Bloco sobre novas tecnologias, jornalismo jurídico e comunicação digital.'],
 [[117,118],'Bloco sobre hiperlinks, arquitetura e recursos de navegação no jornalismo digital.'],
 [[119,120],'Bloco sobre desinformação, fake news e critérios para caracterizar notícia.']
]
const contextFor=n=>groups.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const fixes={
 53:'O objetivo principal da comunicação pública é estimular a sociedade a participar ativamente da vida política para garantir que todos tenham acesso àquilo a que têm direito como cidadãos.',
 55:'A partir do efeito pretendido e do público a ser atingido, é possível classificar os instrumentos de comunicação institucionalizados em três tipos: medianos, superficiais e indiretos.',
 58:'A transparência ativa da Lei de Acesso à Informação pressupõe a disponibilidade pública de dados e informações pela Internet.',
 60:'Ao apresentar-se na estrutura organizacional, a área de comunicação deve sempre adotar a forma de assessoria ou staff, não devendo jamais seguir uma linha de autoridade.',
 62:'O cenário de midiatização das assessorias de comunicação tem transformado a função do assessor de comunicação em mero facilitador entre as organizações e os meios de comunicação de massa.',
 66:'A principal vantagem do social media release em relação ao release convencional é oferecer um conteúdo mais completo e abrangente, que pode ser replicado pelo público de interesse alcançado.',
 70:'O clipping consiste na identificação rotineira de citações sobre a organização ou determinados temas nos veículos de comunicação, seguida da organização das informações, sua avaliação e encaminhamento ou disponibilização para ciência dos interessados.',
 90:'O fotojornalismo, ao documentar visualmente a realidade, aproxima-se da função histórica e antropológica da fotografia, ainda que seu compromisso primeiro seja com a atualidade dos fatos.',
 97:'Durante todas as etapas de produção jornalística, o conteúdo pode ser reavaliado para se adequar à linha editorial da emissora.',
 102:'Entre as atribuições desse comitê está o acompanhamento da aplicação das diretrizes da comunicação social instituídas pelo CNJ, porém não cabe ao comitê sugerir ao CNJ medidas corretivas, porque isso está fora de sua competência.',
 111:'Segundo o pacto em tela, o eixo relativo à brevidade nas comunicações não se aplica aos pronunciamentos orais realizados durante os eventos promovidos no Poder Judiciário.',
 120:'Segundo estudiosos da área jornalística, o termo fake news, traduzido como notícias falsas, deve ser evitado, porque a palavra notícia pressupõe uma informação verificável de interesse público; logo, conteúdos que não atendam a esses padrões não devem ser considerados notícias.'
}
const duplicates=new Map([
 ['extr-0a8a295439513e7ff209','extr-16b2e6620b1d6bec2c72'],
 ['extr-ac55477d996e92ef731b','extr-8180b3d50c029403bb9c'],
 ['extr-06de22948ab25a5930ae','extr-78d2e5da216923b24fd1'],
 ['extr-07b6beef7bd96e61d989','extr-2a312afb5f430f67e4ea']
])
const hard=new Set([54,55,60,61,62,64,67,73,74,76,78,80,83,84,85,87,89,95,98,100,102,103,105,106,108,111,112,113,114,116,118,119])
const easy=new Set([51,57,58,63,67,70,71,91,96,97,99,109,110,117,120])
const decisions=[]
for(const q of records){
 const n=Number(q.numero),id=q.id,info=[subjects[n],contents[n]],sourceQuestion=catalog.questoes.find(x=>x.id===id),page=Number(sourceQuestion?.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,answer=answers[n]
 if(!info[0]||!info[1]||!answer)throw Error(`Classificação ou gabarito ausente no item ${n}`)
 if(!sourceQuestion||!sourceQuestion.paginas.includes(page))throw Error(`Página de origem divergente no item ${n}`)
 await fs.access(path.join('public/acervo-extraido',image))
 const duplicate=duplicates.has(id),anulada=!duplicate&&answer==='X',context=contextFor(n)
 const d={id,sha256_enunciado:hashRevisao(q.enunciado),materia:info[0],conteudo:info[1],ano:2025,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'STM — Analista Judiciário — Comunicação Social — prova aplicada em 01/06/2025',cargo,numero_original:n,pagina:page,dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade conceitual, normativa ou de análise jornalística; a banca não publica dificuldade individual.',classificacao_fonte:prova,motivo:duplicate?`Duplicata OCR do item ${n}; versão canônica ${duplicates.get(id)} preservada.`:`Item ${n} conferido no caderno oficial e classificado pelo conteúdo específico, pelo enunciado e pelo comando do bloco.`,apta_resolucao:!duplicate,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','gabarito_oficial_nao_vinculado','texto_corrompido','texto_de_outro_bloco'],imagem_pagina:image,imagens_contexto:[{pagina:page,imagem:image,texto:context}],visual:{pagina:page,imagem:image,motivo:'Página original conferida visualmente; enunciado, número e contexto do bloco correspondem ao caderno oficial.'},texto_apoio:context,reemplazarContexto:true}
 if(fixes[n]&&!duplicate)d.enunciado=fixes[n]
 if(duplicate){d.inelegibilidade_motivo=`Duplicata OCR do item ${n}.`;d.duplicada_de=duplicates.get(id)}
 else {d.resposta_correta=anulada?null:answer==='C'?0:1;d.anulada=anulada;d.gabarito_oficial={fonte:gabarito,arquivo:official.arquivo_gabarito,prova:official.arquivo_prova,numero:n,pagina:1,resposta:answer,sha256:official.sha256,sha256_tipo:'SHA-256 do PDF oficial de gabarito definitivo, registrado no inventário local',criterio:'Chave definitiva identificada pelo código completo do caderno 072_STM_004_01; conferida com a tabela oficial dos itens 51–120.'}}
 decisions.push(d)
}
if(decisions.length!==74||new Set(decisions.map(x=>x.id)).size!==74||new Set(records.map(q=>Number(q.numero))).size!==70)throw Error('Esperados 74 registros OCR para 70 itens originais')
if(Object.keys(answers).length!==70||duplicates.size!==4)throw Error('Conjunto de itens/gabarito/duplicatas incompatível')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registrosOCR:records.length,itensUnicos:70,classificados:decisions.filter(d=>d.apta_resolucao).length,duplicatas:duplicates.size,anulados:Object.values(answers).filter(x=>x==='X').length,questoesComCorrecaoOCR:Object.keys(fixes).length,questoesComImagemOriginal:new Set(decisions.map(x=>x.pagina)).size,gabaritoCompleto:Object.keys(answers).length===70,publicado:false},null,2));process.exit(0)}

const name='revisao-stm-2025-cargo4-comunicacao-v307'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${name}/acervo-extraido')\n`)
const answersUpdate=await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')
const lines=answersUpdate.split('\n'),keyIndex=lines.findIndex(line=>line.includes(`"documento_id": "${doc}"`))
if(keyIndex<0)throw Error('Linha do gabarito no inventário desapareceu')
const updated=JSON.parse(lines[keyIndex]);updated.respostas={...updated.respostas,...answers};updated.linhas=4
lines[keyIndex]=JSON.stringify(updated)
await fs.writeFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl',lines.join('\n'))
const report={...result,documento:doc,edicao:concurso,registrosOCR:records.length,itensUnicos:70,duplicatasExcluidas:duplicates.size,itensAnulados:Object.entries(answers).filter(([,v])=>v==='X').map(([n])=>Number(n)),questoesCorrigidas:Object.keys(fixes).map(Number),paginasConferidas:[1,2,3,4],gabaritoDefinitivo:gabarito,gabaritoSHA256:official.sha256,publicado:false,fonte:prova}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## STM 2025 — Cargo 4, Comunicação Social — v307\n\n- Revisei os 74 registros OCR que correspondem a 70 itens oficiais (51–120). Classifiquei os itens em Comunicação Social, Comunicação Organizacional, Relações Públicas, assessoria de imprensa, Jornalismo e subáreas específicas, por conteúdo individual.\n- Marquei quatro registros como duplicatas OCR, preservando uma versão de cada item 53, 55, 58 e 62.\n- Corrigi enunciados com cabeçalhos de seção, trechos de questões seguintes ou paginação incorporados e reescrevi oito ocorrências de texto para restaurar a transcrição limpa. Vinculei a imagem original das páginas 1–4 e os contextos dos blocos.\n- Completei o inventário do gabarito definitivo, que estava limitado aos itens 51–110, acrescentando os itens 111–120 conforme a tabela oficial. Os itens anulados 53, 78, 84 e 106 ficaram sem resposta automática.\n- Validação local: ${result.total} registros, ${result.disponiveis} elegíveis, ${result.pendentes} pendências globais; publicação na nuvem não realizada.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [justificativas oficiais](<https://cdn.cebraspe.org.br/concursos/STM_25/arquivos/STM_25_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf>).\n`)
console.log(JSON.stringify(report,null,2))


