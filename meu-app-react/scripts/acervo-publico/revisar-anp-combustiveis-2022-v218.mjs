import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-anp-combustiveis-2022-v218',doc='8934a552b36346fb'
const prova='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/725_ANP_001_01.PDF'
const gabaritoPreliminar='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/GAB_PRELIMINAR_725_ANP_001_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/ANP_22_PSS_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const concurso='ANP 2022 — Atividade 1: Fiscalização da Produção de Combustíveis I'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='725_ANP_001_01.PDF'||catalog.questoes.length!==76)throw Error('Caderno ANP Atividade 1 diverge do inventário')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-petrobras-eletrica-2022-v217'))
if(start<0)throw Error('Base anterior v217 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const byId=new Map(),wanted=new Set(catalog.questoes.map(x=>x.id))
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==76||wanted.size)throw Error(`Esperados 76 registros OCR ANP; encontrados ${byId.size}; ausentes ${wanted.size}`)

const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)))
const officialText=pages.join('\n')
const matches=[...officialText.matchAll(/(?:^|\n)\s*(5[1-9]|[6-9]\d|1[01]\d|120)\s+([\s\S]*?)(?=\n\s*(?:5[1-9]|[6-9]\d|1[01]\d|120)\s+|$)/g)]
const clean=s=>s.replace(/CEBRASPE\s*[–-]\s*ANP\s*[–-]\s*Edital:\s*2022/g,'').replace(/-\s*\n\s*/g,'-').replace(/\s+/g,' ').trim()
const stems=new Map(matches.map(m=>[Number(m[1]),clean(m[2])]))
if(stems.size!==70||Array.from({length:70},(_,i)=>51+i).some(n=>!stems.get(n)))throw Error(`Transcrição oficial incompleta: ${stems.size}/70 itens`)

const contexts={
 51:'Acerca da produção de etanol, julgue os itens a seguir.',
 56:'Em relação à produção de biodiesel, julgue os itens seguintes.',
 62:'No que se refere à produção de combustíveis comercializados em território nacional, julgue os itens subsequentes.',
 66:'Julgue os itens que se seguem, em relação à produção de biometano.',
 71:'A respeito do processamento de gás natural, julgue os próximos itens.',
 77:'À luz da norma ABNT NBR n.º 17.505/2015, julgue os itens a seguir, a respeito de armazenamento de líquidos inflamáveis e combustíveis.',
 83:'De acordo com a Norma Regulamentadora n.º 10 (NR-10), uma empresa com carga elétrica instalada de 100 kW:',
 86:'Julgue os itens subsequentes, conforme a Norma Regulamentadora n.º 13 (NR-13), que dispõe a respeito de serviços com caldeiras e vasos de pressão.',
 90:'Julgue os itens que se seguem, de acordo com a Norma Regulamentadora n.º 20 (NR-20), que dispõe sobre segurança e saúde no trabalho com inflamáveis e combustíveis.',
 93:'Em referência à Norma Regulamentadora n.º 23 (NR-23), que trata da proteção contra incêndios, julgue os itens seguintes.',
 95:'Julgue os itens subsequentes, à luz da Norma Regulamentadora n.º 26 (NR-26), que prevê o uso de cores e rotulagens de produtos químicos para segurança em estabelecimentos ou locais de trabalho com o fim de indicar e advertir acerca dos riscos existentes.',
 98:'Julgue os itens a seguir, conforme as disposições da Norma Regulamentadora n.º 33 (NR-33) sobre a segurança e a saúde nos trabalhos em espaços confinados.',
 101:'Julgue os próximos itens, em referência a trabalhos em altura, à luz da Norma Regulamentadora n.º 35 (NR-35).',
 103:'A respeito do regulamento técnico do sistema de gerenciamento da segurança operacional para refinarias de petróleo, julgue os itens a seguir.',
 109:'Em relação ao procedimento para comunicação de incidentes, bem como à distribuição, revenda e outras atividades características da indústria do petróleo, do gás natural e dos biocombustíveis, julgue os itens que se seguem.',
 115:'A respeito do procedimento para a verificação de incidentes em instalações e atividades relativas às indústrias do petróleo, do gás natural e dos biocombustíveis, e ao abastecimento nacional de combustíveis, julgue os próximos itens.'
}
const contextFor=n=>Object.entries(contexts).reverse().find(([start])=>n>=Number(start))?.[1]||''
const topics={
 51:['Engenharia Química','Etanol: matérias-primas amiláceas e açucaradas'],52:['Engenharia Química','Etanol: conversão bioquímica de açúcares e fermentação'],53:['Engenharia Química','Etanol: microrganismos da fermentação alcoólica'],54:['Engenharia Química','Etanol: operações unitárias de produção'],55:['Engenharia Química','Combustíveis: produção de etanol e derivados de petróleo'],
 56:['Engenharia Química','Biodiesel: transesterificação de materiais graxos'],57:['Engenharia Química','Biodiesel: uso em motores diesel e mistura de combustíveis'],58:['Engenharia Química','Biodiesel: processos de produção e hidrogenação'],59:['Engenharia Química','Biodiesel: álcoois empregados na esterificação e transesterificação'],60:['Engenharia Química','Biodiesel: craqueamento e etapas de processo'],61:['Engenharia Química','Biodiesel: separação de ésteres e glicerol'],
 62:['Engenharia de Petróleo e Gás','Refino de petróleo e continuidade das operações'],63:['Engenharia de Petróleo e Gás','Origem fóssil do gás natural e do GLP'],64:['Engenharia de Petróleo e Gás','Combustíveis veiculares: gás natural e motores diesel'],65:['Engenharia Química','Destilação na produção de etanol e no refino'],
 66:['Engenharia Química','Biometano: purificação do biogás e remoção de contaminantes'],67:['Engenharia Química','Biometano: gaseificação de biomassa e metanação'],68:['Regulação do Setor de Petróleo e Gás','Produção e comercialização de biometano: Resolução ANP n.º 685/2017'],69:['Engenharia Química','Biogás: origem da matéria orgânica'],70:['Engenharia de Petróleo e Gás','Composição do GLP e distinção em relação ao biometano'],
 71:['Engenharia de Petróleo e Gás','Processamento de gás natural e obtenção de GLP'],72:['Engenharia de Petróleo e Gás','Composição química do gás natural'],73:['Engenharia de Petróleo e Gás','Usos não energéticos do gás natural'],74:['Engenharia de Petróleo e Gás','Tratamento de gás natural: nitrogênio e dióxido de carbono'],75:['Engenharia de Petróleo e Gás','Ocorrência de gás natural em campos onshore e offshore'],76:['Engenharia de Petróleo e Gás','Fontes de energia renováveis e não renováveis'],
 77:['Segurança do Trabalho','Armazenamento de inflamáveis: respiros de tanques'],78:['Segurança do Trabalho','Armazenamento de inflamáveis: tanques verticais em áreas inundáveis'],79:['Segurança do Trabalho','Proteção contra incêndio: água e formação de espuma'],80:['Segurança do Trabalho','Eletricidade estática: aterramento de vagões e caminhões-tanque'],81:['Segurança do Trabalho','Plano de emergência: exercícios e treinamento periódico'],82:['Segurança do Trabalho','Sistemas fixos de combate a incêndio: dimensionamento por risco'],
 83:['Segurança do Trabalho','NR-10: trabalho individual em instalações elétricas de alta tensão'],84:['Segurança do Trabalho','NR-10: diagrama unifilar, aterramento e dispositivos de proteção'],85:['Segurança do Trabalho','NR-10: prioridade das medidas de proteção coletiva'],
 86:['Segurança do Trabalho','NR-13: dispositivos de controle de nível em caldeiras'],87:['Segurança do Trabalho','NR-13: controle de nível e prevenção de superaquecimento'],88:['Segurança do Trabalho','NR-13: manual de operação de caldeiras e procedimentos de segurança'],89:['Segurança do Trabalho','NR-13: identificação e placa de caldeiras'],
 90:['Segurança do Trabalho','NR-20: permissão de trabalho para atividades não rotineiras'],91:['Segurança do Trabalho','NR-20: requisitos de segurança de contratante e prestadores'],92:['Segurança do Trabalho','NR-20: gestão das recomendações da análise de riscos'],93:['Segurança do Trabalho','NR-23: medidas de prevenção contra incêndio'],94:['Segurança do Trabalho','NR-23: saídas de emergência e rotas de fuga'],
 95:['Segurança do Trabalho','NR-26: ficha com dados de segurança de produtos químicos'],96:['Segurança do Trabalho','NR-26: rotulagem preventiva de saneantes'],97:['Segurança do Trabalho','NR-26: sinalização de riscos e medidas de prevenção'],
 98:['Segurança do Trabalho','NR-33: avaliação atmosférica antes da entrada em espaço confinado'],99:['Segurança do Trabalho','NR-33: plano de emergência, resgate e simulados'],100:['Segurança do Trabalho','NR-33: identificação de espaços confinados e seus riscos'],
 101:['Segurança do Trabalho','NR-35: hierarquia de medidas de prevenção de queda'],102:['Segurança do Trabalho','NR-35: aptidão médica e fatores psicossociais em trabalho em altura'],
 103:['Regulação do Setor de Petróleo e Gás','Segurança operacional de refinarias: fiscalização da ANP'],104:['Regulação do Setor de Petróleo e Gás','Segurança operacional: equipe de auditoria e auditor líder'],105:['Regulação do Setor de Petróleo e Gás','Regime de Segurança Operacional estabelecido pela ANP'],106:['Segurança do Trabalho','Investigação de incidentes: classificação de ferimento grave'],107:['Regulação do Setor de Petróleo e Gás','Segurança operacional: identificação de sistemas críticos'],108:['Regulação do Setor de Petróleo e Gás','Treinamento em segurança operacional para empregados'],
 109:['Regulação do Setor de Petróleo e Gás','Comunicação de incidentes: dano ambiental'],110:['Regulação do Setor de Petróleo e Gás','Incidentes e riscos: dano ao patrimônio de terceiros'],111:['Regulação do Setor de Petróleo e Gás','Substâncias nocivas ou perigosas: risco e dano à saúde'],112:['Regulação do Setor de Petróleo e Gás','Comunicação à ANP de interrupção de operações de revenda'],113:['Regulação do Setor de Petróleo e Gás','Investigação de incidentes com dano à saúde humana'],114:['Regulação do Setor de Petróleo e Gás','Atividades econômicas da indústria do petróleo e biocombustíveis'],
 115:['Regulação do Setor de Petróleo e Gás','Investigação de incidentes e finalidade da apuração regulatória'],116:['Regulação do Setor de Petróleo e Gás','Relatório de investigação: registro de evidências e sigilo'],117:['Regulação do Setor de Petróleo e Gás','Medidas mitigatórias e prevenção de incidentes'],118:['Regulação do Setor de Petróleo e Gás','Competência da ANP na investigação de incidentes de perfuração e produção'],119:['Regulação do Setor de Petróleo e Gás','Prazo para início de investigação de incidentes'],120:['Regulação do Setor de Petróleo e Gás','Designação da equipe de investigação de incidentes']
}
if(Object.keys(topics).length!==70)throw Error('Classificação não cobre os 70 itens')
// Gabarito preliminar oficial e nenhuma mudança/anulação foi publicada para a Atividade 1 no documento oficial de justificativas; portanto, permanece como definitivo.
const key=['C','E','C','E','E','C','E','E','E','E','C','E','C','E','C','C','C','C','E','E','C','E','C','C','E','C','E','C','C','C','E','E','C','C','E','C','C','E','C','C','E','C','E','E','C','E','E','E','E','C','E','C','E','C','C','E','E','C','C','E','C','E','E','C','E','E','E','C','C','C']
if(key.length!==70)throw Error('Gabarito não contém 70 respostas')
const answerDigest=hashRevisao(key.join(',')),pageFor=n=>n<=85?1:n<=108?2:3
for(let p=1;p<=3;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const norm=s=>s.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(Boolean)
const overlap=(a,b)=>{const A=new Set(norm(a)),B=new Set(norm(b));let n=0;for(const x of A)if(B.has(x))n++;return n/Math.max(1,new Set([...A,...B]).size)}
const candidatesByNumber=new Map()
for(const e of catalog.questoes){const v=candidatesByNumber.get(e.numero)||[];v.push(e);candidatesByNumber.set(e.numero,v)}
const canonical=new Map()
for(const [n,entries] of candidatesByNumber){canonical.set(n,[...entries].sort((a,b)=>overlap(b.trecho,stems.get(n))-overlap(a.trecho,stems.get(n))||b.trecho.length-a.trecho.length)[0].id)}
const diffHard=new Set([58,59,60,66,67,68,71,74,77,78,82,84,87,88,89,92,98,99,101,102,103,104,106,107,108,111,112,113,115,116,118,120])
const diffEasy=new Set([51,53,55,63,69,70,73,76,79,80,83,85,90,93,95,97,100,105,109,110,114,117,119])
const decisions=[]
for(const e of catalog.questoes){
 const n=e.numero,q=byId.get(e.id),[materia,conteudo]=topics[n],page=pageFor(n),answer=key[n-51],winner=canonical.get(n),isDuplicate=e.id!==winner
 if(!q||!stems.has(n)||!materia||!conteudo||!contextFor(n)||!answer)throw Error(`Item ${n}, registro ${e.id}: campo ausente`)
 const enunciado=stems.get(n),apoio=contextFor(n),isCrossing=(e.paginas||[]).some(p=>p!==page)
 const pagesContext=isCrossing?(e.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Continuação da página original do caderno.'})):[]
 const difficulty=diffHard.has(n)?'Difícil':diffEasy.has(n)?'Fácil':'Média'
 const pageImage=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,concurso,numero_original:n,pagina:page,
  dificuldade:difficulty,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na extensão do raciocínio técnico ou normativo exigido; não é índice psicométrico publicado pela banca.',
  enunciado,opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],texto_apoio:apoio,resposta_correta:answer==='C'?0:1,anulada:false,
  gabarito_oficial:{valor:answer,fonte:gabaritoPreliminar,arquivo:'GAB_PRELIMINAR_725_ANP_001_01.PDF',fonte_definitiva:justificativas,prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da sequência ordenada de 70 respostas no gabarito oficial preliminar; o documento oficial de justificativas registra as alterações/anulações por atividade e não lista alteração para a Atividade 1.',criterio:'Gabarito CEBRASPE da Atividade 1; conferido com o documento oficial de justificativas de alterações/anulações, sem mudança publicada para esta atividade.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Transcrição conferida com o texto oficial do caderno e classificação individual pelo enunciado e pelo contexto normativo/técnico.'},
  visual:{pagina:page,imagem:pageImage,texto_apoio:apoio,motivo:`Página ${page} do caderno oficial ligada ao item ${n}; o contexto compartilhado foi separado no campo de apoio para leitura contínua.`},imagens_contexto:pagesContext,
  apta_resolucao:!isDuplicate,inelegibilidade_motivo:isDuplicate?'Registro duplicado por segmentação de OCR; preservado no histórico, com a cópia canônica identificada e mantida para resolução.':undefined,duplicada_de:isDuplicate?winner:undefined,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v218 do item ${n}: transcrição corrigida pelo caderno oficial, contexto normativo associado, matéria/conteúdo/ano/certame/dificuldade classificados e gabarito conferido com documentos oficiais.`})
}
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,itens_unicos:70,registros_ocr:76,duplicatas_excluidas:decisions.filter(x=>x.apta_resolucao===false).length,paginas_originais:3,gabarito_validacao:'Gabarito preliminar oficial comparado ao documento oficial de justificativas; sem alterações para Atividade 1.',publicado:false},null,2))
