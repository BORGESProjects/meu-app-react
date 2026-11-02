import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-ebserh-enfermagem-cardiologia-2018-v228',doc='b26474eef9888bed'
const prova='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL008__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL008.PDF'
const concurso='EBSERH Área Assistencial 2018 — Cargo 8: Enfermeiro, área de Cardiologia'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='394_EBSERHASSISTENCIAL008__PAG_3.PDF'||catalog.questoes.length!==60)throw Error('Inventário oficial divergente: eram esperadas 60 questões do caderno específico')
const previous=raizesAtuais.findIndex(x=>x.includes('revisao-sesdf-psiquiatria-2016-v227'))
if(previous<0)throw Error('Base anterior v227 não encontrada')
const bases=raizesAtuais.slice(previous),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),want=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(want.has(q.id)){byId.set(q.id,q);want.delete(q.id)}
 if(!want.size)break
}
if(want.size)throw Error(`Questões ausentes do manifesto: ${want.size}`)

const key=[
 'E E C E C C E C E C C X C E C E E E C C',
 'C E C C C C E E C E E C E C E E C E C C',
 'C C E E E C C C C C E E E E C C E C E E'
].flatMap(x=>x.split(' '))
if(key.length!==60)throw Error(`Gabarito esperado com 60 posições, recebido ${key.length}`)
const topics={
41:'Lei do Exercício Profissional: participação em bancas e seleção de profissionais',42:'Lei do Exercício Profissional: competências privativas e assistência obstétrica',43:'Lei do Exercício Profissional: prescrição de medicamentos em programas e rotinas institucionais',44:'Lei do Exercício Profissional: direção e chefia dos serviços de enfermagem',45:'Código de Ética: dever de assistência a pacientes graves',
46:'Ética profissional: aborto, deontologia e hipóteses legais',47:'Ética profissional: eutanásia e cuidados no fim da vida',48:'Ética em saúde: reprodução humana e respeito à vida',49:'Ética em pesquisa: participação de profissionais e sujeitos de pesquisa',50:'Responsabilidade profissional: limites da responsabilização civil e penal',51:'Código de Ética: infrações éticas e normas dos conselhos',52:'Código de Ética: infrações disciplinares e deveres profissionais',53:'Exercício profissional: delegação de atividades de enfermagem',54:'Exercício profissional: recusa de prescrição e exceções de urgência',
55:'Avaliação clínica: sinais vitais e funções orgânicas básicas',56:'Responsabilidade técnica: anotação e registro perante o conselho profissional',57:'Responsabilidade técnica: habilitação e indicação do profissional responsável',58:'Responsabilidade técnica: exercício em empresas e instituições de saúde',59:'Ética e gestão de serviços: continuidade assistencial em movimentos reivindicatórios',60:'Liderança e exercício profissional: atuação do enfermeiro em emergências',
61:'Ética profissional: responsabilidade por atos praticados pela equipe',62:'Humanização da assistência: acolhimento e condições de cuidado',63:'Humanização: trabalho multiprofissional e comunicação transparente',64:'Protocolos clínicos: segurança, padronização e individualização do cuidado',65:'Planejamento assistencial: atenção a usuários em situação de vulnerabilidade',66:'Processo de enfermagem: sistematização da assistência',67:'Processo de enfermagem: consulta e cuidado domiciliar',68:'Processo de enfermagem: etapas e planejamento de resultados',69:'Processo de enfermagem: referenciais teóricos e avaliação de resultados',70:'Registros de enfermagem: documentação da execução do processo',
71:'Rede de Atenção às Urgências: organização dos níveis assistenciais',72:'Política Nacional de Atenção às Urgências: perfil epidemiológico',73:'Política Nacional de Atenção às Urgências: desigualdades e diferenças regionais',74:'Rede de Atenção às Urgências: critérios de implantação e densidade populacional',75:'Rede de Atenção às Urgências: linhas prioritárias de cuidado',76:'Sistema Único de Saúde: integralidade e evolução histórica',77:'Atenção Primária à Saúde: integralidade e perfil profissional',78:'Reforma Sanitária: contexto econômico e previdenciário dos anos 1980',79:'Gestão do SUS: planejamento e organização dos serviços',80:'Sistema Único de Saúde: mercado de trabalho em enfermagem',
81:'Cardiologia: isquemia miocárdica, dor torácica e alterações eletrocardiográficas',82:'Hemodinâmica: hematoma retroperitoneal e complicações vasculares',83:'Hemodinâmica: pseudoaneurisma, fístula arteriovenosa e perfusão distal',84:'Hemodinâmica: comparação entre acessos radial e femoral',85:'Hemodinâmica: escolha e anatomia do acesso braquial',86:'Hemodinâmica: avaliação da circulação colateral ulnar antes do acesso radial',87:'Angiografia coronariana: lesão renal aguda associada a contraste',88:'Segurança do paciente: fatores de risco para nefrotoxicidade por contraste',89:'Angiografia coronariana: manejo da metformina após exposição a contraste',90:'Intervenção coronariana: espasmo arterial induzido por cateter',
91:'Hemodinâmica: cateter pigtail e ventriculografia/coronariografia',92:'Processo de enfermagem em hemodinâmica: resultado esperado após retirada do introdutor',93:'Intervenção coronariana: terapia antitrombótica perioperatória',94:'Cuidados pós-procedimento: acesso femoral, curativo e avaliação neurovascular',95:'Intervenção coronariana percutânea: implante de stent e balão',96:'Controle de infecção: organização e esterilidade dos materiais de hemodinâmica',97:'Segurança ocupacional: organização de agulhas, lâminas e materiais perfurocortantes',98:'História da cardiologia intervencionista: coronariografia seletiva',99:'Anatomia coronariana: tronco da coronária esquerda e seus ramos',100:'Anatomia coronariana: irrigação do nó sinoatrial'
}
const hard=new Set([46,49,50,52,54,56,57,59,64,67,69,73,76,78,82,83,86,87,88,89,90,92,93,94,95,96,97,99,100])
const keysHash=hashRevisao(key.join(',')),decisions=[]
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero,answer=key[n-41],conteudo=topics[n]
 if(!q||n<41||n>100||!conteudo)throw Error(`Item sem revisão específica: ${n}`)
 const anulada=answer==='X'
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Enfermagem',conteudo,ano:2018,concurso,numero_original:n,pagina:e.pagina,
  dificuldade:hard.has(n)?'Difícil':n>=81?'Média':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade de aplicação normativa, decisão clínica e integração de cuidados; não é parâmetro psicométrico publicado pela banca.',
  opcoes:['Certo','Errado'],resposta_correta:anulada?null:answer==='C'?0:1,anulada,
  gabarito_oficial:{valor:answer,fonte:gabarito,arquivo:'GAB_DEFINITIVO_394_EBSERHASSISTENCIAL008.PDF',prova,numero:n,pagina:1,sha256:keysHash,hash_metodo:'SHA-256 da sequência dos gabaritos definitivos oficiais para os itens 41–100 do Cargo 8.',criterio:anulada?'Item anulado no gabarito oficial definitivo.':'Gabarito definitivo oficial do Cargo 8 — Enfermeiro, área de Cardiologia.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Classificação por leitura individual do enunciado e do comando anterior; chave conferida com o gabarito definitivo do Cargo 8.'},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],
  motivo:`Revisão v228: conteúdo individual do item ${n} classificado com referência ao cargo de Enfermagem em Cardiologia; chave definitiva oficial conferida${anulada?'; item anulado':''}.`})
}
if(decisions.length!==60)throw Error('Cobertura de 60 itens divergente')
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[previous],decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,registros_revisados:60,gabaritos_definitivos:60,itens_anulados:decisions.filter(x=>x.anulada).map(x=>x.numero_original),publicado:false},null,2))
