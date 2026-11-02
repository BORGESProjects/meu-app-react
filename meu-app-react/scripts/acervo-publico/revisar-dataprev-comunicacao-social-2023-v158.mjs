import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='94e5a1f0567c4621',prova='https://cdn.cebraspe.org.br/concursos/dataprev_23/arquivos/893_DATAPREV_005_01.PDF',gabarito='https://cdn.cebraspe.org.br/concursos/dataprev_23/arquivos/GAB_DEFINITIVO_893_DATAPREV_005_01.PDF',justificativas='https://cdn.cebraspe.org.br/concursos/dataprev_23/arquivos/DATAPREV_23_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8')),start=raizesAtuais.findIndex(r=>r.includes('adicao-see-pe-educacao-fisica-itens-omitidos-v157'))
if(start<0)throw new Error('Base v157 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)}
if(raw.length!==75||active.size!==75||raw.some(q=>!active.has(q.id))||new Set(raw.map(q=>q.numero)).size!==70)throw new Error(`Caderno incompleto: ${raw.length} registros, ${active.size} ativos, ${new Set(raw.map(q=>q.numero)).size} itens únicos`)
const duplicates=new Map([
 ['extr-0c866d1ec971e2af30e5','extr-2b951bd7346b98bc30d8'],['extr-e60b17eb6ec4f28ac04e','extr-95cfa1cf19f32a8d6ae4'],['extr-71ee48d394408fcfb0bb','extr-ed828c309fcdb0908879'],['extr-e1eb8418a61d9617880f','extr-8386e5213015655fb01e'],['extr-b111155ba34821eb8297','extr-7724f33df360c9f9b9f6']
])
const answerGroups=[
 ['C','E','C','E','E','C','C','C','E','E','C','E','E','C','C','C','C','C','E','C'],
 ['C','E','C','C','C','C','C','C','E','C','E','C','C','C','C','C','C','C','E','E'],
 ['C','C','C','C','E','C','C','C','E','E','X','X','E','C','E','C','E','C','C','C'],
 ['E','X','X','C','C','E','E','C','X','E']
]
const key=new Map();let n=51;for(const group of answerGroups)for(const a of group)key.set(n++,a)
if(n!==121||key.size!==70)throw new Error(`Gabarito incompleto: ${key.size} respostas`)
const keyHash=hashRevisao([...key].map(([i,a])=>`${i}:${a}`).join('|'))
const matter=i=>i<=61?'Assessoria de Imprensa':i<=65?'Jornalismo':i<=75?'Comunicação Organizacional':i<=84?'Jornalismo Digital':i<=90?'Design Gráfico':i<=95?'Produção Audiovisual':i<=100?'Relações Públicas':i<=106?'Assessoria de Imprensa':i<=110?'Mídias Sociais':i<=118?'Planejamento Estratégico':'Planejamento de Relações Públicas'
const topic=i=>{
 if(i<=52)return 'Assessoria de imprensa — comunicados, releases e relacionamento com a mídia'
 if(i<=55)return 'Assessoria de imprensa — funções, circulação de informação e ética profissional'
 if(i<=61)return 'Assessoria de imprensa — gestão de crises e relacionamento com jornalistas'
 if(i<=63)return 'Teorias da comunicação de massa — agenda setting e teoria hipodérmica'
 if(i<=65)return 'Jornalismo — valor-notícia, opinião pública e espiral do silêncio'
 if(i<=70)return 'Comunicação organizacional digital — planejamento editorial e comunicação integrada'
 if(i<=75)return 'Comunicação organizacional — engajamento, linguagem, storytelling e curadoria de conteúdo'
 if(i<=80)return 'Jornalismo — noticiabilidade, critérios de seleção e valores-notícia'
 if(i<=84)return 'Jornalismo digital — gerações, pirâmide deitada, instantaneidade e hipertexto'
 if(i===85)return 'Design gráfico — ilustração vetorial no Adobe Illustrator'
 if(i<=88)return 'Design gráfico — Adobe Illustrator e Photoshop'
 if(i<=90)return 'Design editorial — Adobe InDesign e atalhos de teclado'
 if(i<=95)return 'Produção audiovisual — After Effects, Premiere Pro, edição e renderização'
 if(i<=100)return 'Relações públicas — comunicação dirigida e relacionamento com públicos'
 if(i<=104)return 'Assessoria de imprensa — press kit, release e clipping'
 if(i<=106)return 'Assessoria de imprensa — entrevistas coletivas e convocação de jornalistas'
 if(i<=110)return 'Mídias sociais — comunicação digital, conteúdo, stories e mídia paga'
 if(i<=114)return 'Planejamento estratégico de comunicação — níveis, decisões e cronograma'
 if(i===115)return 'Planejamento estratégico — análise SWOT e diagnóstico organizacional'
 if(i<=118)return 'Planejamento estratégico — identidade organizacional, visão, missão e valores'
 if(i===119)return 'Relações públicas — etapas do planejamento e avaliação'
 return 'Planejamento de comunicação — avaliação de resultados e indicadores'
}
const contexts=[[[51,55],'Com relação às atribuições do assessor de imprensa e à rotina da assessoria de imprensa, julgue os itens.'],[[56,61],'Julgue os itens relativos à gestão de crises e ao relacionamento entre os canais de comunicação de uma empresa e os jornalistas.'],[[62,65],'A respeito do jornalismo e dos meios de comunicação de massa, julgue os próximos itens.'],[[66,70],'No que se refere a planejamento editorial, julgue os itens a seguir.'],[[71,75],'Acerca dos recursos visuais e textuais que auxiliam a empresa no estabelecimento de conexão e engajamento com seu público, julgue os itens.'],[[76,80],'Em relação ao sistema de valores-notícia e aos critérios de seleção, redação e edição, julgue os itens a seguir.'],[[81,84],'Julgue os próximos itens, relativos ao webjornalismo.'],[[85,85],'Acerca das ilustrações vetoriais criadas no Adobe Illustrator, na versão CC e configuração padrão, julgue o item.'],[[86,88],'Acerca das possibilidades do Adobe Illustrator e do Adobe Photoshop, julgue os próximos itens.'],[[89,90],'No que se refere ao Adobe InDesign, julgue os itens a seguir.'],[[91,95],'Acerca das funções do Adobe Premiere Pro e do After Effects, julgue os itens.'],[[96,100],'A respeito da comunicação dirigida, necessária nas relações públicas devido à variedade de públicos (stakeholders) ligados às organizações, julgue os itens.'],[[101,104],'Julgue os itens relativos às rotinas das assessorias de imprensa.'],[[105,106],'Itens sobre entrevistas coletivas e convocação de jornalistas pela assessoria de imprensa.'],[[107,110],'No que diz respeito à comunicação digital aplicada às redes sociais, julgue os itens.'],[[111,114],'Julgue os itens relativos ao planejamento da comunicação nas organizações.'],[[115,115],'Item sobre a análise SWOT como ferramenta de diagnóstico do planejamento estratégico.'],[[116,118],'Itens sobre diagnóstico estratégico, identidade organizacional e definição de visão, missão e valores.'],[[119,119],'Item sobre as etapas do planejamento de relações públicas.'],[[120,120],'Item sobre avaliação e mensuração de resultados no planejamento de comunicação.']]
const contextFor=i=>contexts.find(([[a,b]])=>i>=a&&i<=b)[1]
const corrections=new Map([
 [57,'O media training, processo contínuo e complexo que demanda um longo período de treinamento e aprendizagem, é essencial para o planejamento de comunicação de uma organização, e o seu maior benefício é o fortalecimento da marca.'],
 [58,'No que se refere à gestão de crises em uma empresa, é importante que haja manuais de orientação, planejamento de comunicação e comitê responsável pelo gerenciamento de problemas.'],
 [61,'De acordo com a dimensão da crise na organização, pode ser necessário recorrer a parcerias com agências de publicidade ou à contratação de consultoria externa.'],
 [67,'Para uma comunicação eficaz, a elaboração da mensagem comunicativa deve considerar características específicas de seu público-alvo, além de se adequar a preceitos de arquitetura da informação, usabilidade, hipermídia e design.'],
 [73,'Uma narrativa eficiente envolve o uso de imagens, principalmente, vídeos.'],
 [75,'Para intensificar a confiança junto aos clientes, uma estratégia comunicacional é reunir, selecionar e distribuir o conteúdo por vários canais da Web, a fim de facilitar a participação dos usuários.'],
 [90,'No trabalho com documentos no InDesign, os atalhos possibilitam realizar tarefas sem usar o mouse. Assim, a combinação de teclas que serve de atalho para alternar entre as ferramentas Seleção e Seleção direta é indicada pelos dois pictogramas de teclas no caderno original.']
])
const page=i=>i<=75?1:i<=104?2:3,clean=s=>(s||'').replace(/\u000c/g,' ').replace(/\s+89300501428107\s+CEBRASPE[\s\S]*$/iu,'').replace(/\s+Espaço livre\s*$/iu,'').replace(/\s+/g,' ').trim()
const decisions=raw.map(x=>{
 const i=Number(x.numero),q=active.get(x.id),p=page(i),imagem=`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,answer=key.get(i),dupe=duplicates.get(x.id),anulada=answer==='X',stem=corrections.get(i)||clean(x.enunciado)
 if(!answer||!stem||stem.length<25)throw new Error(`Item ${i} sem gabarito ou enunciado completo`)
 return {id:x.id,sha256_enunciado:hashRevisao(q.enunciado),materia:matter(i),conteudo:topic(i),ano:2023,concurso:'DATAPREV — Analista de Tecnologia da Informação, Cargo 5: Comunicação Social; aplicação em 01/10/2023',numero_original:i,pagina:p,dificuldade:[51,55,57,60,62,63,65,67,69,72,76,78,79,81,85,87,89,92,95,99,101,102,105,107,111,112,113,115,116,117,119,120].includes(i)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência conceitual e técnica; o CEBRASPE não publicou níveis de dificuldade.',resposta_correta:anulada?null:answer==='C'?0:1,anulada,gabarito_oficial:{valor:answer,fonte:gabarito,sha256:x.gabarito?.sha256||keyHash,sha256_tipo:x.gabarito?.sha256?'sha256_registrado_na_fonte_documental':'hash_da_transcricao_canonica_dos_itens_51_a_120',numero:i,resposta:answer,metodo:'Gabarito definitivo oficial do Cargo 5, aplicação em 01/10/2023; itens anulados conferidos na chave oficial.'},classificacao_fonte:prova,motivo:`Item ${i} conferido na página ${p} do caderno oficial; classificado pelo enunciado e pelo assunto específico do bloco.`,visual:{pagina:p,imagem,texto_apoio:contextFor(i),motivo:`Página ${p} do caderno oficial conferida visualmente; imagem e comando compartilhado associados à questão.`},enunciado:stem,...(dupe?{apta_resolucao:false,duplicada_de:dupe,inelegibilidade_motivo:`Cópia OCR duplicada do item ${i}; a versão canônica permanece no acervo sob o ID ${dupe}.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(decisions.filter(d=>d.duplicada_de).length!==5||new Set(decisions.map(d=>d.numero_original)).size!==70)throw new Error('Duplicatas ou quantidade de itens divergentes')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:70,duplicatas:5,anuladas:[...key].filter(([,a])=>a==='X').map(([i])=>i),classificacoes:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),paginas:[1,2,3],transcricaoVisualItens:[57,58,61,67,73,75,90]},null,2));process.exit(0)}
const name='revisao-dataprev-comunicacao-social-2023-v158',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const output={...report,prova,gabarito,justificativas,registros_revistos:75,itens_unicos:70,duplicatas_inelegiveis:5,anuladas:[...key].filter(([,a])=>a==='X').map(([i])=>i),questao90_referenciada_na_imagem_original:true,paginas_originais:3,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
