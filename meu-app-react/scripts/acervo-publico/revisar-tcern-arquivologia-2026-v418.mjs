import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-tcern-arquivologia-2026-v418'
const documento='346e9fb95534b7af'
const prova='https://cdn.cebraspe.org.br/concursos/TCE_RN_25/arquivos/F6F8E219D4369E9CE0A7ECF6923F21ADE4A1B990089F11285DE70623BF02FA8E.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/tce_rn_25/arquivos/5D5C51F9015303C2FA5C127D43C75FD29611FBA39832986EA9E08E6309DF6AC5.pdf'
const respostas=new Map([...`51:E 52:C 53:E 54:E 55:C 56:E 57:E 58:C 59:C 60:C 61:C 62:E 63:C 64:C 65:E 66:C 67:C 68:C 69:E 70:E 71:C 72:E 73:C 74:C 75:E 76:C 77:E 78:C 79:C 80:C 81:C 82:E 83:E 84:C 85:E 86:C 87:E 88:X 89:C 90:E 91:C 92:E 93:E 94:C 95:E 96:E 97:C 98:E 99:X 100:C 101:E 102:E 103:C 104:E 105:C 106:C 107:C 108:C 109:E 110:E 111:C 112:E 113:C 114:E 115:E 116:C 117:E 118:C 119:E 120:C`.split(' ').map(s=>{const [n,a]=s.split(':');return [Number(n),a]})])
if(respostas.size!==70)throw Error(`Gabarito incompleto: ${respostas.size}`)
const topicos=new Map([
 [51,['Arquivologia','Instrumentos de pesquisa: guias de fundos, inventários e catálogos']],
 [52,['Arquivologia','Teoria das três idades e ciclo de vida documental']],
 [53,['Arquivologia','Princípios arquivísticos: ordem original']],
 [54,['Arquivologia','Valores documentais: fase corrente e valor primário']],
 [55,['Arquivologia','Relação orgânica entre documento e contexto de produção']],
 [56,['Arquivologia','Fundo arquivístico e atividades finalísticas e meio']],
 [57,['Arquivologia','Fundo arquivístico, produtor e unidade administrativa']],
 [58,['Arquivologia','Princípio da proveniência']],
 [59,['Arquivologia','Arranjo em arquivo permanente e avaliação documental']],
 [60,['Arquivologia','Descrição arquivística e instrumentos de pesquisa']],
 [61,['Arquivologia','Recolhimento e autenticidade de documentos digitais']],
 [62,['Arquivologia','Destinação de documentos após extinção de entidade pública']],
 [64,['Proteção de Dados','LGPD: dados pessoais sensíveis e origem racial ou étnica']],
 [67,['Arquivologia','ISDF: descrição de funções e proveniência']],
 [68,['Arquivologia','ISAD(G): descrição multinível em ambientes manuais e digitais']],
 [69,['Arquivologia','ISAAR(CPF): descrição de entidades produtoras e custodiadoras']],
 [70,['Arquivologia','NOBRADE e descrição de documentos em diferentes fases']],
 [71,['Arquivologia','Política de gestão documental como política pública e direito à informação']],
 [72,['Arquivologia','Avaliação e eliminação regular de documentos digitais']],
 [73,['Arquivologia','Política institucional de gestão e preservação documental']],
 [74,['Arquivologia','Diagnóstico institucional para política de gestão documental']],
 [75,['Arquivologia','Política, programa e sistema de gestão de documentos']],
 [77,['Arquivologia','SIGAD e requisitos de gestão arquivística']],
 [78,['Arquivologia','Plano de classificação e estrutura funcional']],
 [80,['Arquivologia','Classificação funcional de documentos e séries']],
 [81,['Arquivologia','Classificação de acesso e segurança da informação']],
 [85,['Arquivologia','SIGAD: produção e controle de metadados']],
 [86,['Arquivologia','Gestão documental: percurso, uso e destinação']],
 [87,['Arquivologia','Produção documental e prevenção de documentos desnecessários']],
 [88,['Arquivologia','Destinação documental: guarda permanente, eliminação e prazos']],
 [89,['Arquivologia','Preservação digital: confiabilidade de custodiante e tecnologia']],
 [90,['Arquivologia','Preservação digital e metadados de documentos permanentes']],
 [91,['Arquivologia','Forma fixa e identidade de documentos digitais']],
 [92,['Arquivologia','Trilha de auditoria e gestão documental ao longo do ciclo de vida']],
 [94,['Arquivologia','Cadeia de preservação digital e registro de eventos']],
 [95,['Direito Administrativo','LAI: contagem de prazo após reclassificação de sigilo']],
 [96,['Direito Administrativo','LAI: acesso à informação de interesse público']],
 [97,['Direito Administrativo','Âmbito de aplicação da Lei de Acesso à Informação']],
 [98,['Direito Administrativo','LAI: graus e prazos de classificação da informação']],
 [99,['Direito Administrativo','LAI: recurso contra negativa de acesso não sigiloso']],
 [100,['Direito Administrativo','LAI: direito à decisão integral em negativa de acesso']],
 [101,['Proteção de Dados','LGPD: tratamento de dados pessoais sensíveis']],
 [102,['Proteção de Dados','LGPD: relatório de impacto e papéis de controlador, operador e encarregado']],
 [103,['Proteção de Dados','LGPD: autodeterminação informativa']],
 [104,['Proteção de Dados','LGPD: hipótese de tratamento para fins particulares']],
 [105,['Proteção de Dados','LGPD: aplicação territorial a empresas estrangeiras']],
 [106,['Proteção de Dados','LGPD: tratamento para cumprimento de obrigação legal']],
 [108,['Licitações e Contratos Administrativos','IN SEGES nº 5/2017: limites à ingerência em contratos de serviços']],
 [109,['Licitações e Contratos Administrativos','Governança das contratações e gestão de riscos']],
 [110,['Licitações e Contratos Administrativos','Credenciamento na Lei nº 14.133/2021']],
 [111,['Licitações e Contratos Administrativos','Fiscalização de obras e acompanhamento informatizado']],
 [112,['Licitações e Contratos Administrativos','Responsabilidade do contratado e atuação de preposto']],
 [113,['Licitações e Contratos Administrativos','Apoio de terceiros ao fiscal e responsabilidade funcional']],
 [114,['Licitações e Contratos Administrativos','Avaliação de desempenho contratual e indicadores']],
 [115,['Licitações e Contratos Administrativos','Deveres do fiscal na identificação de defeitos contratuais']],
 [116,['Licitações e Contratos Administrativos','Reabilitação de licitante e sanções administrativas']],
 [117,['Administração Pública','Planejamento estratégico: avaliação e acompanhamento contínuos']],
 [118,['Administração Pública','Gestão do conhecimento tácito e explícito']],
 [119,['Administração Pública','Avaliação de desempenho individual e trabalho em equipe']],
 [120,['Administração Pública','Ciclo PDCA: verificação, análise e ação corretiva']]
])
const grupos=new Map([
 [[51,60],'Princípios, teoria e descrição arquivística'],[[61,66],'Legislação arquivística, acesso e proteção de dados'],
 [[67,70],'Normas brasileiras e internacionais de descrição arquivística'],[[71,75],'Políticas de gestão documental'],
 [[77,85],'SIGAD e instrumentos de gestão arquivística'],[[86,88],'Fases e destinação da gestão documental'],
 [[89,94],'Preservação digital e cadeia de custódia'],[[95,100],'Lei de Acesso à Informação (LAI)'],
 [[101,106],'Lei Geral de Proteção de Dados (LGPD)'],[[108,116],'Licitações, contratos e fiscalização contratual'],
 [[117,120],'Planejamento, avaliação e gestão do conhecimento']
])
const normalizarOcr=t=>t.replace(/\s+/g,' ').replace(/fund os/giu,'fundos').replace(/ini cial/giu,'inicial').replace(/públic a/giu,'pública').replace(/proveni ência/giu,'proveniência').replace(/arquiv os/giu,'arquivos').replace(/ar quivística/giu,'arquivística').replace(/sistem ática/giu,'sistemática').replace(/it ens/giu,'itens').replace(/document os/giu,'documentos').replace(/d e políticas/giu,'de políticas').replace(/Controladoria\s*-\s*Geral/giu,'Controladoria-Geral').replace(/deve -se/giu,'deve-se').replace(/Bras il/giu,'Brasil').replace(/sujeitam -se/giu,'sujeitam-se').replace(/pesso ais/giu,'pessoais').replace(/contrataç ão/giu,'contratação').replace(/contrato s/giu,'contratos').replace(/document os/giu,'documentos')
const exportados=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
if(exportados.length!==44)throw Error(`Esperadas 44 questões; export trouxe ${exportados.length}`)
const canonical=[...respostas].sort((a,b)=>a[0]-b[0]).map(([n,a])=>`${n}:${a}`).join('\n')
const hashGabarito=createHash('sha256').update(canonical).digest('hex')
const decisoes=[]
for(const q of exportados){
 const n=Number(q.numero),pagina=Number(q.pagina),[materia,conteudo]=topicos.get(n)||[]
 if(!materia)throw Error(`Questão ${n} sem matéria/conteúdo`)
 const answer=respostas.get(n);if(!answer)throw Error(`Questão ${n} sem chave definitiva`)
 const anulada=answer==='X',imagem=q.imagem||`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const texto=normalizarOcr(q.enunciado)
 const corrigido=n===87?texto.replace('não são apresentados de mecanismos','não são apresentados mecanismos'):
   n===88?texto.replace('bem como ao tempo','bem como o tempo'):
   n===89?'A confiabilidade de um custodiante de documentos digitais não deve ser fundamentada no uso de determinadas tecnologias.':texto
 const textoApoio=String(q.apoio||'').replace(/\s+/g,' ').trim()
 const bloco=[...grupos].find(([[a,b]])=>n>=a&&n<=b)?.[1]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2026,
   concurso:'TCE/RN 2026 — Cargo 1: Analista Administrativo, Especialidade Arquivologia',banca:'CEBRASPE',organizadora:'CEBRASPE',
   aplicacao:'Concurso TCE/RN — aplicação em 12/04/2026; edital publicado em 2025',cargo:'Analista Administrativo — Especialidade Arquivologia',
   numero_original:n,numero:n,pagina,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:anulada?null:answer==='C'?0:1,anulada,
   dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade conceitual e normativa; não publicada pela banca.',
   classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial TCE/RN — Cargo 1, Arquivologia. Matéria e conteúdo classificados pelo enunciado e pelo bloco “${bloco}”; ano registrado pela aplicação em 2026, embora o edital seja de 2025.`,
   ...(corrigido!==texto?{enunciado:corrigido}:{}),texto_apoio:textoApoio,
   visual:{pagina,imagem,texto_apoio:textoApoio,motivo:`Página ${pagina} do caderno oficial associada ao item ${n}; conferência visual de texto e contexto feita no PDF original.`},apta_resolucao:true,
   gabarito_oficial:{fonte:chave,arquivo:'5D5C51F9015303C2FA5C127D43C75FD29611FBA39832986EA9E08E6309DF6AC5.pdf',prova:'TCE/RN Cargo 1 — Arquivologia',sha256:hashGabarito,sha256_tipo:'sha256_da_transcricao_canonica_dos_70_itens; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito definitivo marca X; item anulado sem correção automática.':'Gabarito oficial definitivo do CEBRASPE, Cargo 1 — Analista Administrativo — Arquivologia.'},
   ...(anulada?{anulacao_fonte:chave}:{}),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']})
}
const anuladas=decisoes.filter(x=>x.anulada).map(x=>x.numero_original)
if(anuladas.length!==2||!anuladas.includes(88)||!anuladas.includes(99))throw Error(`Anulações do lote divergentes: ${anuladas}`)
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const final={...report,documento,questoes_revisadas:44,questoes_unicas:44,itens_anulados:anuladas,questoes_com_correcao:42,prova_oficial:prova,gabarito_definitivo:chave,checksum_gabarito:hashGabarito,aplicacao_ano:2026,edital_ano:2025,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(final,null,2))
console.log(JSON.stringify(final,null,2))
