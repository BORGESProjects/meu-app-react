import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='50de6b36e2d223c7'
const prova='https://cdn.cebraspe.org.br/concursos/TC_DF_20_PROCURADOR/arquivos/536_TCDF_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/TC_DF_20_PROCURADOR/arquivos/GAB_DEFINITIVO_536_TCDF_002_01.PDF'
const concurso='TCDF — Procurador — 2020'
const cargo='Procurador do Ministério Público junto ao Tribunal de Contas do Distrito Federal'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.url!==prova)throw Error('A prova oficial diverge do catálogo documental')
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const keyRecord=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc)
if(!keyRecord||keyRecord.gabarito_url!==gabarito||keyRecord.status!=='tabela_lida')throw Error('Gabarito definitivo oficial não confirmado no índice')
// O índice local estava truncado no item 190. Itens 191–200 foram cotejados
// com a tabela oficial definitiva do CEBRASPE para o mesmo caderno.
const suplementoOficial={191:'C',192:'E',193:'C',194:'C',195:'E',196:'E',197:'C',198:'E',199:'C',200:'E'}
Object.assign(keyRecord.respostas,suplementoOficial)
if(Object.keys(keyRecord.respostas).length!==130)throw Error('Gabarito oficial do caderno deve cobrir os itens 71–200')

const topics={
162:['Direito Constitucional','Monopólio da União sobre petróleo e transporte de petróleo','Média'],163:['Direito Econômico','Controle concorrencial no Sistema Financeiro Nacional: atribuições do Banco Central e do CADE','Difícil'],164:['Direito Tributário','Contribuição de intervenção no domínio econômico (CIDE): natureza e instituição','Média'],165:['Direito Constitucional','Ordem econômica: defesa do meio ambiente e tratamento diferenciado','Média'],166:['Direito Constitucional','Ordem econômica: livre iniciativa e regulação estatal','Média'],167:['Direito Constitucional','Ordem econômica: subsidiariedade e atuação reguladora do Estado','Difícil'],168:['Direito Constitucional','Intervenção direta do Estado na atividade econômica','Média'],169:['Direito Constitucional','Monopólios constitucionais: petróleo e atividades nucleares','Difícil'],170:['Direito Tributário','CIDE sobre petróleo e derivados: alíquotas e diferenciação','Média'],171:['Direito Econômico','Processo administrativo concorrencial e decisões do CADE','Difícil'],172:['Direito Civil','Desconsideração da personalidade jurídica por abuso e má administração','Média'],173:['Direito Econômico','Infração à ordem econômica: efeitos, causalidade e elemento subjetivo','Difícil'],
175:['Direito Financeiro','Controle externo: parecer prévio sobre as contas do governador do Distrito Federal','Difícil'],176:['Direito Administrativo','Processo de contas no TCDF: audiência do responsável e contraditório','Difícil'],177:['Direito Financeiro','Julgamento de contas: boa-fé, quitação do débito e ressalvas','Difícil'],178:['Direito Administrativo','Processo administrativo de controle: comunicação e validade da notificação','Média'],179:['Direito Administrativo','Ministério Público de Contas: participação em denúncias e representações','Média'],180:['Direito Administrativo','Processo nos Tribunais de Contas: sustentação oral','Média'],181:['Direito Administrativo','Processo de controle externo: produção de prova e inspeção','Difícil'],182:['Direito Constitucional','Controle externo: registro de aposentadoria, reforma e pensão; prazo de apreciação','Difícil'],183:['Direito Administrativo','Tutela cautelar e medidas preventivas no processo de contas','Difícil'],184:['Direito Administrativo','Sanções e multas do TCDF: débito, obstrução e devido processo','Difícil'],185:['Direito Administrativo','Processo de contas: recursos e efeitos suspensivos','Difícil'],186:['Direito Financeiro','Tomada de contas especial: fases interna e externa','Média'],
187:['Direito Processual Civil','Direito processual intertemporal e isolamento dos atos processuais','Média'],188:['Direito Processual Civil','Citação de pessoa jurídica estrangeira por estabelecimento no Brasil','Difícil'],189:['Direito Processual Civil','Litisconsórcio facultativo multitudinário na execução contra a Fazenda Pública','Média'],190:['Direito Processual Civil','Intervenção do Ministério Público em conflito de competência','Média'],191:['Direito Processual Civil','Precedentes judiciais: modulação temporal e segurança jurídica','Difícil'],192:['Direito Processual Civil','Apelação: insuficiência do preparo e oportunidade de complementação','Média'],193:['Direito Processual Civil','Prova testemunhal por videoconferência e registro audiovisual','Média'],194:['Direito Processual Civil','Execução contra a Fazenda Pública: obrigação de fazer e regime de precatórios','Difícil'],195:['Direito Processual Civil','Mandado de segurança: decadência em relação de trato sucessivo','Média'],196:['Direito Processual Civil','Reclamação e observância de precedente em recurso especial repetitivo','Difícil'],197:['Direito Processual Civil','Ação civil pública: coisa julgada secundum eventum probationis e nova ação coletiva','Difícil'],198:['Direito Processual Civil','Inventário e partilha: dívida tributária do espólio e garantia do juízo','Média'],199:['Direito Processual Civil','Procedimentos possessórios: oposição e intervenção de ente público','Difícil'],200:['Direito Civil','Sucessões: herança jacente, vacância e direitos do herdeiro','Média']
}
const OCR={
164:'Por serem tributos, as contribuições de intervenção no domínio econômico submetem-se às normas gerais em matéria tributária, podendo, todavia, ser instituídas por lei ordinária.',
165:'Entre os princípios que orientam a ordem econômica, está a defesa do meio ambiente, admitindo-se tratamento diferenciado a atividades econômicas conforme seu impacto ambiental quanto aos processos de elaboração dos produtos e de prestação dos serviços.',
167:'A subsidiariedade da atuação estatal à iniciativa privada na ordem econômica é princípio implícito do texto constitucional, uma vez que o principal papel reservado ao Estado é o de agente normativo e regulador da atividade econômica.',
168:'A exploração direta de atividade econômica pelo Estado somente é admitida quando necessária aos imperativos da segurança nacional ou a relevante interesse coletivo, cabendo ao chefe do Poder Executivo definir, por meio de decreto, as situações que caracterizem aquelas hipóteses.',
172:'O encerramento ou a inatividade da pessoa jurídica provocados por má administração podem ensejar a desconsideração da personalidade jurídica, suspendendo-lhe a eficácia do ato constitutivo.',
173:'A constatação de infração à ordem econômica que tenha por objeto o prejuízo à livre concorrência ou à livre iniciativa exige a ocorrência de dano efetivo ou potencial ao mercado, devendo ser verificados, ainda, o nexo de causalidade e a presença do elemento volitivo do infrator.',
175:'Cabe ao TCDF apreciar, por meio de parecer prévio, as contas anualmente prestadas pelo governador do Distrito Federal, devendo o relator das contas ser definido por meio de rodízio entre os conselheiros efetivos e substitutos, aplicando-se o critério da ordem decrescente de antiguidade.',
177:'Mesmo em caso de dano ao erário, o TCDF poderá deixar de julgar irregulares as contas de determinado responsável, caso reconheça que ele tenha agido de boa-fé e tenha liquidado tempestivamente o débito atualizado monetariamente que lhe fora imputado, situação em que as contas do responsável serão julgadas regulares com ressalvas.',
180:'No âmbito do TCDF, as partes poderão, pessoalmente ou por meio de procurador devidamente constituído nos autos, ainda que não seja advogado, produzir sustentação oral. Essa faculdade processual, no entanto, não poderá ser exercida quando a Corte estiver apreciando processo de consulta.',
186:'A tomada de contas especial destina-se a apurar os fatos, identificar os responsáveis e quantificar o débito, dividindo-se em fase interna e fase externa: na grande maioria das vezes, a fase interna ocorre no órgão ou entidade em que o dano ocorreu, podendo, em alguns casos, ocorrer no próprio TCDF; a fase externa sempre ocorre no TCDF.',
187:'Ao tratar do direito intertemporal, o ordenamento processual pátrio adota a teoria do isolamento dos atos processuais, segundo a qual, embora a nova lei seja aplicável imediatamente aos processos em curso, o juízo de regularidade do ato já praticado deve ser realizado em consonância com a lei vigente no momento da sua realização.',
188:'De acordo com a jurisprudência do Superior Tribunal de Justiça, é nula a citação de pessoa jurídica estrangeira por intermédio de seu entreposto no Brasil se for demonstrado que, do ponto de vista formal, o réu e o entreposto citado possuem personalidades jurídicas distintas.',
190:'O Ministério Público participa de todo e qualquer processo de conflito de competência que tramita nos tribunais porque, quando não atua como parte em conflito que suscitou, deve, obrigatoriamente, manifestar-se na qualidade de fiscal da ordem jurídica.',
193:'A oitiva de testemunha que não resida na comarca em que tramita o processo judicial durante audiência de instrução e julgamento pode ser realizada por videoconferência, sendo permitido que o depoimento seja documentado apenas por gravação.',
200:'No procedimento especial previsto para herança jacente, após a prolação de sentença que declare a vacância da herança, os bens deverão passar imediatamente ao domínio do poder público e, a partir desse momento, não será mais possível que eventual herdeiro reclame seu direito.'
}
const shared={
165:'A respeito da ordem econômico-financeira na Constituição Federal de 1988, julgue os itens a seguir.',
168:'Com relação às modalidades de intervenção do Estado na ordem econômica, julgue os itens subsequentes.',
175:'Acerca do direito processual de contas, julgue os itens a seguir.',
187:'Acerca de lei processual no tempo, litisconsórcio, Ministério Público e comunicação dos atos processuais, julgue os itens a seguir.',
191:'Julgue os itens a seguir, referentes aos processos nos tribunais, aos meios de impugnação das decisões judiciais, às provas e ao processo de execução.',
195:'Considerando a jurisprudência do Superior Tribunal de Justiça acerca de mandado de segurança, ação civil pública e reclamação, julgue os itens subsequentes.',
198:'Acerca de procedimentos especiais e de jurisdição voluntária, julgue os itens que se seguem.'
}
const decisions=[]
for(let n=162;n<=200;n++){
 if(n===174)continue
 const q=records.find(x=>Number(x.numero)===n)
 if(!q)throw Error(`Item ${n} ausente do caderno exportado`)
 const topic=topics[n],key=keyRecord.respostas[String(n)]
 if(!topic||!key)throw Error(`Item ${n} sem classificação ou gabarito oficial`)
 if(n<200&&!q.classificacao_pendente&&!q.classificacao_revisada)throw Error(`Estado inesperado do item ${n}`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2020,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos II — caderno 536_TCDF_002_01',numero_original:n,pagina:Number(q.pagina),dificuldade:topic[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela aplicação de normas, precedentes e conceitos jurídicos; não é nível oficial da banca.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo jurídico específico e pelo comando da página original do caderno de Procurador do TCDF 2020.`,resposta_correta:key==='C'?0:key==='E'?1:null,anulada:key==='X',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_536_TCDF_002_01.PDF',prova:'536_TCDF_002_01.PDF',sha256:keyRecord.sha256,numero:n,pagina:1,resposta:key,criterio:'Gabarito definitivo oficial CEBRASPE — Procurador do TCDF 2020, caderno Conhecimentos II.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto'],visual:{pagina:Number(q.pagina),imagem:`paginas/${doc}-${String(q.pagina).padStart(4,'0')}.webp`,motivo:`Conferido visualmente na página ${q.pagina} do PDF oficial; matéria, contexto e transcrição cotejados com o original.`}}
 if(OCR[n])d.enunciado=OCR[n]
 if(shared[n])d.texto_apoio=shared[n]
 if(n===186)d.texto_apoio='Acerca do direito processual de contas, julgue os itens a seguir.'
 if(n===194)d.texto_apoio='Julgue os itens a seguir, referentes aos processos nos tribunais, aos meios de impugnação das decisões judiciais, às provas e ao processo de execução.'
 if(n===197)d.enunciado='Situação hipotética: transitou em julgado sentença que, em razão da insuficiência de provas quanto às alegações do autor, julgou improcedente ação civil pública proposta para tutela de determinada espécie de direito individual homogêneo de consumidores. Assertiva: nessa situação, não será possível a propositura de nova ação coletiva, com o mesmo objeto, por outro legitimado coletivo.'
 decisions.push(d)
}
if(decisions.length!==38||decisions.filter(d=>d.anulada).map(d=>d.numero_original).join(',')!=='172')throw Error('Esperados os 37 itens pendentes mais o item 200 para corrigir texto-base; o item 172 é anulado')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,itensNovamenteClassificados:37,item200Limpo:true,gabaritosDefinitivos:38,anulados:decisions.filter(d=>d.anulada).map(d=>d.numero_original),comandoBaseReassociado:[165,168,175,187,191,195,198],imagensConferidas:38,publicado:false},null,2));process.exit(0)}

const nome='revisao-tcdf-procurador-2020-direito-itens-162-199-v324'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const indexPath='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const indexLines=(await fs.readFile(indexPath,'utf8')).split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line))
const indexAt=indexLines.findIndex(x=>x.documento_id===doc)
indexLines[indexAt]={...indexLines[indexAt],respostas:keyRecord.respostas,linhas:7,criterio:'Gabarito definitivo oficial do CEBRASPE — caderno Conhecimentos II; itens 71–190 do índice anterior e itens 191–200 cotejados diretamente com a tabela oficial do mesmo PDF.'}
await fs.writeFile(indexPath,indexLines.map(x=>JSON.stringify(x)).join('\n')+'\n')
const report={...result,documento:doc,edicao:concurso,itensClassificados:37,item200RevisadoParaTextoBase:1,itensComGabaritoDefinitivo:38,itensAnulados:[172],gabaritoLocalComplementadoItens:[191,192,193,194,195,196,197,198,199,200],contextosReassociados:[165,168,175,187,191,195,198],paginasOriginaisConferidas:38,fonteProva:prova,fonteGabarito:gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## TCDF — Procurador 2020 — itens 162–199 — revisão v324\n\n- Reclassifiquei 37 itens em Direito Constitucional, Econômico, Tributário, Civil, Financeiro, Administrativo e Processual Civil, com temas específicos. O item 174 já tinha classificação apropriada e foi preservado.\n- Vinculei os gabaritos definitivos dos 37 itens e do item 200; o item 172 consta como anulado no gabarito e não recebe correção automática.\n- Conferi as páginas 6 e 7 do caderno. Reparei palavras separadas pelo OCR, removi do item 186 o comando do bloco seguinte, separei os comandos dos itens 187–190, 191–194, 195–196 e 198–200 e limpei o rodapé capturado após o item 200.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências. Nuvem não publicada.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabarito}>).\n`)
console.log(JSON.stringify(report,null,2))
