import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='efc925aea8cd5802'
const prova='https://cdn.cebraspe.org.br/concursos/anm_24/arquivos/038_ANM_007_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/anm_24/arquivos/Gab_Definitivo_038_ANM_007_01.PDF'
const alteracoes='https://cdn.cebraspe.org.br/concursos/anm_24/arquivos/ANM_24_Justificativas_de_altera%C3%A7%C3%B5es_de_gabarito.pdf'
const start=raizesAtuais.findIndex(r=>r.includes('revisao-see-pe-musica-2022-v164'))
if(start<0)throw Error('Base v164 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||active.size!==72)throw Error(`Esperados 72 registros do Cargo 7 da ANM, recebidos ${active.size}`)
const canonical=new Map(),pages=new Map()
for(const q of catalog.questoes){if(!canonical.has(q.numero))canonical.set(q.numero,q.id);pages.set(q.id,q.pagina)}
const answers=new Map(Object.entries({51:'X',52:'E',53:'C',54:'C',55:'E',56:'C',57:'E',58:'C',59:'E',60:'C',61:'C',62:'E',63:'C',64:'C',65:'C',66:'E',67:'C',68:'E',69:'C',70:'C',71:'C',72:'E',73:'E',74:'E',75:'C',76:'E',77:'C',78:'C',79:'C',80:'E',81:'C',82:'E',83:'E',84:'C',85:'C',86:'E',87:'E',88:'C',89:'E',90:'C',91:'E',92:'C',93:'C',94:'E',95:'C',96:'C',97:'E',98:'C',99:'E',100:'E',101:'C',102:'E',103:'C',104:'C',105:'E',106:'E',107:'E',108:'C',109:'E',110:'E',111:'C',112:'E',113:'E',114:'E',115:'C',116:'E',117:'E',118:'E',119:'C',120:'E'}).map(([n,v])=>[Number(n),v]))
if(answers.size!==70)throw Error('Gabarito oficial incompleto')
const ranges=[
 [[51,53],'Engenharia Elétrica','Proteção de instalações: sobrecargas, curto-circuito, choque elétrico e DPS','Julgue os itens sobre dispositivos de manobra e proteção contra sobrecargas, curtos-circuitos e choques elétricos.'],
 [[54,55],'Engenharia Elétrica','Proteção de sistemas em média tensão: funções ANSI e seletividade','Acerca de sistemas de proteção em média tensão, julgue os itens.'],
 [[56,57],'Engenharia Elétrica','Transformadores em paralelo: compartilhamento de carga e correntes circulantes','Considere dois transformadores operando em paralelo e julgue os itens sobre divisão de carga.'],
 [[58,60],'Engenharia Elétrica','Eficiência energética: geração eólica, aquecimento solar e climatização','Julgue os itens relativos a eficiência energética em sistemas eólicos, solares e de climatização.'],
 [[61,62],'Engenharia Elétrica','Máquinas elétricas: geradores de indução e síncronos','Em relação ao funcionamento de geradores elétricos, julgue os itens.'],
 [[63,64],'Engenharia Elétrica','Redes de distribuição: transferência automática e topologia spot network','Consoante a projetos de redes de distribuição e sua proteção, julgue os itens.'],
 [[65,67],'Engenharia Elétrica','Instalações elétricas: dimensionamento e seleção de condutores','Com referência ao dimensionamento e à seleção de condutores de instalações elétricas, julgue os itens.'],
 [[68,70],'Engenharia Elétrica','Comandos elétricos: partida, intertravamento e reversão de motores','Considere o diagrama de comando para partida de motor de indução mostrado na página original e julgue os itens.'],
 [[71,73],'Engenharia Elétrica','Sistemas elétricos de potência: rede básica, qualidade de energia e interrupções','No que diz respeito a padrões de desempenho e requisitos para instalação da rede básica, julgue os itens.'],
 [[74,76],'Engenharia Elétrica','Iluminação: emergência, iluminância e fator de manutenção','Julgue os itens sobre dimensionamento, distribuição e especificação de equipamentos de iluminação.'],
 [[77,82],'Engenharia Elétrica','Instalações prediais: climatização, automação, operação e manutenção','Considere projetos de ar-condicionado, ventilação, elevadores e automação predial, bem como sua gestão e manutenção; julgue os itens.'],
 [[83,86],'Engenharia Elétrica','Segurança contra incêndio: sistemas de detecção e alarme','Acerca de sistemas de detecção e alarme de incêndios, julgue os itens.'],
 [[87,93],'Engenharia Elétrica','Instalações de baixa e média tensão, fornecimento, aterramento e SPDA','Julgue os itens sobre sistemas de fornecimento de energia, instalações de baixa e média tensão e proteção contra descargas atmosféricas.'],
 [[94,95],'Engenharia Elétrica','Contratos de fornecimento de energia: termo de referência e demanda contratada','Em relação a contratos de fornecimento de energia elétrica, julgue os itens.'],
 [[96,96],'Engenharia Civil','Planejamento e controle de obras: cronograma físico-financeiro','Julgue o item sobre os requisitos de um cronograma físico-financeiro de obra.'],
 [[97,100],'Segurança do Trabalho','Segurança em instalações e serviços de eletricidade: NR 10 e prontuário','Julgue os itens sobre segurança em instalações e serviços de eletricidade.'],
 [[101,104],'Informática','Softwares de engenharia: Revit, AutoCAD, IFC e interoperabilidade BIM','No que se refere a softwares de engenharia, julgue os itens.'],
 [[105,108],'Administração Pública','Processo eletrônico: funcionalidades do Sistema Eletrônico de Informações (SEI)','Em relação ao Sistema Eletrônico de Informações (SEI), julgue os itens. Os ícones de atualização e exclusão são reproduzidos na imagem da página original.'],
 [[109,112],'Segurança do Trabalho','Segurança ocupacional: sinalização, máquinas e equipamentos, periculosidade e comandos','Julgue os itens subsequentes relativos à segurança do trabalho.'],
 [[113,116],'Engenharia Civil','Obras públicas: medição, cronograma, alterações contratuais e reajuste','Considere a construção de um edifício público com prazo estimado de três anos e julgue os itens sobre execução e gestão contratual.'],
 [[117,120],'Engenharia Civil','Perícias e avaliações: vícios redibitórios, benfeitorias e responsabilidade técnica','Considerando a normatização de perícias de engenharia na construção civil e a engenharia de avaliações, julgue os itens.']
]
const range=i=>ranges.find(([[a,b]])=>i>=a&&i<=b)
const clean=s=>(s||'').replace(/\s+/g,' ').replace(/(?:Espaço livre|CEBRASPE\s*[–-]\s*ANM[\s\S]*$)/iu,'').trim()
const stems={
 51:'Se ocorrer curto-circuito monofásico nos terminais de motores de indução, um disjuntor motor atua abrindo a fase envolvida na falta.',
 55:'A curva 50/51 de proteção de sobrecorrente de um consumidor deve estar à direita da curva 50/51 correspondente à proteção do alimentador ao qual esse consumidor está conectado.',
 101:'No REVIT, caso existam objetos sobrepostos, para selecionar um específico, deve-se posicionar o cursor sobre sua linha e, sem clicar, pressionar a tecla Tab até que ele surja; após isso, basta clicá-lo.',
 105:'Ao ser pressionado, o botão [ícone de atualização] atualiza a tela do processo aberto, permitindo que sejam apresentados andamentos posteriores ao acesso do usuário.',
 107:'Caso o botão [ícone de exclusão] seja pressionado, após a confirmação do usuário por senha e se este tiver privilégios para isso, exclui-se automaticamente o processo do SEI.'
}
const decisions=[...active.values()].map(q=>{
 const n=Number(q.numero_original??q.numero??q.numero_questao),r=range(n),answer=answers.get(n)
 if(!r||!answer)throw Error(`Sem classificação/gabarito para o item ${n} (${q.id})`)
 const [[,],materia,conteudo,contexto]=r,canonicalId=canonical.get(n),dup=q.id!==canonicalId,pg=pages.get(q.id)|| (n<=70?1:n<=96?2:3)
 if(!canonicalId)throw Error(`Item ${n} não consta no catálogo documental`)
 const stem=stems[n]||clean(q.enunciado)
 if(!stem||stem.length<25)throw Error(`Enunciado incompleto no item ${n}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,concurso:'Agência Nacional de Mineração — ANM/2024, Cargo 7: Analista Administrativo, Engenharia Elétrica com especialização em Segurança do Trabalho; prova aplicada em 16/02/2025',numero_original:n,pagina:pg,dificuldade:[54,55,56,57,61,62,68,69,70,71,72,73,77,78,79,80,83,84,85,87,88,89,90,91,92,93,96,113,114,115,116,117,118,119,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade de normas, análise de diagramas e aplicação de conceitos técnicos; a banca não publicou nível de dificuldade.',resposta_correta:answer==='X'?null:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'Gab_Definitivo_038_ANM_007_01.PDF',numero:n,resposta:answer,metodo:'Gabarito oficial definitivo do CEBRASPE; anulação do item 51 confirmada nas justificativas oficiais.'},classificacao_fonte:prova,motivo:`Classificação pelo conteúdo do item e cabeçalho oficial do bloco, conferidos na página ${pg} do caderno.`,visual:{pagina:pg,imagem:`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`,texto_apoio:contexto,motivo:`Página original conferida visualmente e associada para preservar diagramas, ícones e demais elementos de referência.`},enunciado:stem,...(dup?{apta_resolucao:false,duplicada_de:canonicalId,inelegibilidade_motivo:`Duplicata OCR do item ${n}; preservada para auditoria e excluída da resolução.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.filter(x=>x.apta_resolucao===false).length!==2||new Set(decisions.filter(x=>x.anulada).map(x=>x.numero_original)).size!==1||new Set(decisions.map(x=>x.numero_original)).size!==70)throw Error('Cobertura, duplicatas ou anulações divergentes')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:new Set(decisions.map(x=>x.numero_original)).size,duplicatas:decisions.filter(x=>x.duplicada_de).map(x=>x.numero_original),anuladas:[...new Set(decisions.filter(x=>x.anulada).map(x=>x.numero_original))],pendentesAntes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,classificacoes:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length]))},null,2));process.exit(0)}
const name='revisao-anm-eletrica-2025-v165',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...report,prova,gabarito,alteracoes,registros_revistos:72,itens_unicos:70,duplicatas_inelegiveis:2,anuladas:[51],paginas_originais:3,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
