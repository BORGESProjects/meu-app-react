import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-inpi-2024-cargo14-redes-v298',doc='dcaff975c55912e5'
const prova='https://cdn.cebraspe.org.br/concursos/inpi_23/arquivos/930_INPI_014_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/inpi_23/arquivos/GAB_DEFINITIVO_930_INPI_014_01.PDF'
const base=raizesAtuais.find(x=>x.includes('revisao-tcerj-2021-cargo2-v297'))
if(!base)throw Error('Base local v297 não encontrada')
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='930_INPI_014_01.PDF')throw Error('Caderno INPI Cargo 14 divergente')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==71)throw Error(`Esperados 71 registros pendentes, recebidos ${records.length}`)
const topics={
  '51-55':['Telecomunicações','Comutação digital: comutação espacial e temporal, tráfego e bloqueio'],
  '56-70':['Telecomunicações','Comunicações digitais: relação sinal-ruído, modulação, PCM, ruído e codificação'],
  '71-72':['Telecomunicações','Teoria da informação: códigos de bloco, peso de Hamming e capacidade de canal'],
  '73-75':['Telecomunicações','Multiplexação por divisão de frequência e de tempo; PCM'],
  '76-82':['Telecomunicações','Comunicações ópticas: fibras, propagação, atenuação e dispersão'],
  '83-85':['Telecomunicações','Radiodifusão digital: IBOC e transmissão híbrida'],
  '86-100':['Redes de Computadores','Ethernet, IPv4, redes locais, Wi-Fi e endereçamento IP'],
  '101-109':['Telecomunicações','Redes móveis 5G: numerologia, quadro NR e protocolos da interface de rádio'],
  '110-117':['Telecomunicações','Redes móveis 3G e 4G: UMTS, HSPA, EVDO, núcleo LTE e NB-IoT']
}
const details={
86:['Redes de Computadores','Ethernet: colisões em meio compartilhado'],87:['Redes de Computadores','Ethernet: domínios de colisão em hubs'],88:['Redes de Computadores','IPv4: ECN e notificação explícita de congestionamento'],89:['Redes de Computadores','IPv4: tamanho e campo IHL do cabeçalho'],90:['Redes de Computadores','Redes locais: compartilhamento de conexão, arquivos e impressoras'],91:['Redes de Computadores','IPv4: capacidade de endereçamento de uma rede local'],92:['Redes de Computadores','Wi-Fi 6: compatibilidade entre IEEE 802.11ax e 802.11ac'],93:['Redes de Computadores','Wi-Fi 6: OFDMA, latência e eficiência espectral'],94:['Redes de Computadores','Ethernet: preâmbulo e sincronização de quadros'],95:['Redes de Computadores','Ethernet: funcionamento do CSMA/CD'],96:['Redes de Computadores','Wi-Fi 4: largura de canal no IEEE 802.11n'],97:['Redes de Computadores','Wi-Fi: bandas de 2,4 GHz e 5 GHz'],100:['Redes de Computadores','IPv4: sub-redes CIDR e domínios de broadcast'],101:['Telecomunicações','5G NR: numerologia e espaçamento entre subportadoras'],102:['Telecomunicações','5G NR: numerologia, latência e requisitos de serviço'],103:['Telecomunicações','5G NR: estrutura de quadros e duração de slots'],104:['Telecomunicações','5G NR: modulação e escalonamento de recursos'],105:['Telecomunicações','OFDM: intervalo de guarda e interferência intersimbólica'],106:['Telecomunicações','5G: camada física, escalonamento e protocolo RLC'],107:['Telecomunicações','5G: protocolo SDAP e plano de usuário'],108:['Telecomunicações','5G: protocolo RRC e plano de controle'],109:['Telecomunicações','LTE/5G: protocolo PDCP, compressão e proteção de dados'],110:['Telecomunicações','Redes móveis: HSPA, EVDO e taxas de transmissão'],111:['Telecomunicações','UMTS/W-CDMA e evolução HSPA'],112:['Telecomunicações','LTE: núcleo EPC, MME, SGW e interface S1'],113:['Telecomunicações','LTE: OFDM, espalhamento espectral e desempenho'],114:['Telecomunicações','LTE: PGW, bearers e QoS'],115:['Telecomunicações','LTE: virtualização de funções e redes definidas por software'],116:['Telecomunicações','Propagação móvel: frequência da portadora e cobertura celular'],117:['Telecomunicações','NB-IoT: suporte a comunicação do tipo máquina em LTE']
}
const rangeFor=n=>n<=55?'51-55':n<=70?'56-70':n<=72?'71-72':n<=75?'73-75':n<=82?'76-82':n<=85?'83-85':n<=100?'86-100':n<=109?'101-109':'110-117'
const quality=q=>{const s=q.enunciado||'';return s.length-Math.max(0,(s.match(/\|\||[\/]/g)||[]).length*40)-Math.max(0,(s.match(/CEBRASPE|Julgue os itens|Espaço livre|CONHECIMENTOS ESPECÍFICOS/gi)||[]).length*25)}
const byNumber=new Map();for(const q of records){const a=byNumber.get(Number(q.numero))||[];a.push(q);byNumber.set(Number(q.numero),a)}
const duplicates=[];const decisions=[]
for(const [n,group] of byNumber){group.sort((a,b)=>quality(b)-quality(a));const keeper=group[0]
 for(const q of group.slice(1))decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Telecomunicações',conteudo:'Registro OCR duplicado do item '+n,ano:2024,concurso:'INPI 2024 — Pesquisador em Propriedade Industrial — Cargo 14 — Redes de Comunicação',numero_original:n,pagina:Number(q.pagina),classificacao_fonte:prova,motivo:'Duplicata do mesmo número e caderno, identificada pela comparação do enunciado com o registro preservado.',apta_resolucao:false,inelegibilidade_motivo:'Duplicata OCR do mesmo item; preservado o registro textual de melhor qualidade.',duplicada_de:keeper.id})
 if(n===56){decisions.push({id:keeper.id,sha256_enunciado:hashRevisao(keeper.enunciado),materia:'Telecomunicações',conteudo:'Item anulado no gabarito definitivo',ano:2024,concurso:'INPI 2024 — Pesquisador em Propriedade Industrial — Cargo 14 — Redes de Comunicação',numero_original:n,pagina:Number(keeper.pagina),classificacao_fonte:prova,motivo:'Item 56 consta anulado no gabarito definitivo oficial do Cargo 14.',anulada:true,apta_resolucao:false,inelegibilidade_motivo:'Questão anulada pela banca organizadora.'});continue}
 const topic=details[n]||topics[rangeFor(n)];if(!topic)throw Error(`Falta classificação para ${n}`)
 let stem=(qStem(keeper)).replace(/\s+/g,' ').trim()
 stem=stem.replace(/\s+(?:CEBRASPE\s*[–-]\s*INPI.*|Julgue os itens subsequentes,[\s\S]*|Julgue os próximos itens,[\s\S]*)$/i,'').trim()
 decisions.push({id:keeper.id,sha256_enunciado:hashRevisao(keeper.enunciado),materia:topic[0],conteudo:topic[1],ano:2024,concurso:'INPI 2024 — Pesquisador em Propriedade Industrial — Cargo 14 — Redes de Comunicação',numero_original:n,pagina:Number(keeper.pagina),dificuldade:[58,68,71,72,75,77,81,88,89,100,101,102,105,106,109,112,113].includes(n)?'Difícil':[51,54,60,63,69,70,73,78,82,86,90,91,92,94,95,96,97,108,110,116,117].includes(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo a exigência conceitual ou de cálculo do item; não é classificação publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do Cargo 14; matéria e conteúdo identificados pelo enunciado e pelo bloco temático do caderno.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_930_INPI_014_01.PDF',prova:catalog.arquivo,numero:n,pagina:1,criterio:'Referência ao gabarito oficial definitivo do Cargo 14. A chave local não inclui cópia nem hash do PDF.'}})
 }
function qStem(q){return q.enunciado||''}
if(decisions.length!==records.length)throw Error(`Esperados ${records.length} decisões, geradas ${decisions.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,cargo:'Pesquisador em Propriedade Industrial — Cargo 14 — Redes de Comunicação',ano_aplicacao:2024,registros_revistos:records.length,questoes_unicas_classificadas:byNumber.size-1,duplicatas_inelegiveis:records.length-byNumber.size,questao_anulada_no_gabarito:56,prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
const section=`\n\n## Revisão INPI 2024 — Cargo 14, Redes de Comunicação — v298\n\n- Classifiquei individualmente os itens pendentes do caderno em Telecomunicações e Redes de Computadores, com conteúdo por assunto, ano de aplicação, concurso e dificuldade estimada.\n- Comparei registros repetidos pelo número original e preservei a versão de melhor qualidade; versões OCR duplicadas foram marcadas inelegíveis. O item 56 consta anulado no gabarito definitivo e foi mantido fora do conjunto classificável.\n- O acervo local ficou com ${out.total} registros, ${out.disponiveis} disponíveis para resolução e ${out.pendentes} pendentes. Referenciei o gabarito oficial definitivo; sem cópia e hash locais, não ativei correção automática nova. Publicação na nuvem: não realizada.\n- Fontes: [caderno oficial](${prova}); [gabarito definitivo do Cargo 14](${gabarito}).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
