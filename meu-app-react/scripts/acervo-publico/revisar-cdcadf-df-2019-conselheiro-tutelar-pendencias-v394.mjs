import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cdcadf-df-2019-conselheiro-tutelar-pendencias-v394'
const doc='977c15e26dffcdf3'
const prova='https://cdn.cebraspe.org.br/concursos/ct_df_19/arquivos/479_CDCADF_001_00_PAG_4.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/ct_df_19/arquivos/GAB_DEFINITIVO_MATRIZ_479_CDCADF_001_00.PDF'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)).toString('utf8'))
const source=new Map()
for(const page of pages){
  let current=null,parts=[]
  const save=()=>{if(current!==null)source.set(current,parts.join(' ').replace(/\s+/g,' ').trim())}
  for(const raw of page.split(/\r?\n/)){
    const line=raw.trim(),m=line.match(/^\s*(?:([1-9]|[1-6]\d|70))\s+(.+)$/)
    if(m){save();current=Number(m[1]);parts=[m[2]];continue}
    if(current!==null&&/^(?:Com base|Tendo como|Tendo a|Considerando|Acerca|À luz|Julgue|A partir|João,|José,|Ana,|Carla,|Paulo,|CEBRASPE\s*[|–—-]|Espaço livre|-- PROVA)/i.test(line)){save();current=null;parts=[];continue}
    if(current!==null&&line)parts.push(line)
  }
  save()
}
const keyRows=[
  [1,'C C E C E C E E C E E C C E C C E C E C'],
  [21,'E E E C E C C C E C E E C E E C E C E C'],
  [41,'E E C C C E C E C C E E C E C E C C C E'],
  [61,'C E E C C C E C E C']
]
const answers=new Map()
for(const [start,row] of keyRows){const values=row.split(/\s+/),expected=start===61?10:20;if(values.length!==expected||values.some(v=>!['C','E','X'].includes(v)))throw Error(`Gabarito oficial inválido no item ${start}`);values.forEach((v,i)=>answers.set(start+i,v))}
const topics={
1:['Direito Constitucional','Organização constitucional da assistência social'],2:['Direito Constitucional','Direitos sociais: educação de adolescentes e jovens'],
3:['Direitos Humanos','Declaração Universal dos Direitos Humanos: proteção à maternidade e à infância'],4:['Direitos Humanos','DUDH: direito dos pais à escolha da educação dos filhos'],5:['Direitos Humanos','Declaração dos Direitos da Criança: prioridade de proteção e socorro'],6:['Direitos Humanos','Direitos da criança: igualdade e não discriminação'],
7:['Direito da Criança e do Adolescente','ECA: tutela e guarda'],8:['Direito da Criança e do Adolescente','ECA: revogação judicial da guarda'],9:['Direito da Criança e do Adolescente','ECA: irrevogabilidade da adoção'],10:['Direito da Criança e do Adolescente','ECA: atribuições do conselho tutelar e poder familiar'],11:['Direitos Humanos','Convenção sobre os Direitos da Criança: direito à educação'],12:['Direito da Criança e do Adolescente','Convenção sobre os Direitos da Criança: proteção estatal'],
13:['Assistência Social','LOAS e BPC: avaliação da deficiência'],14:['Assistência Social','LOAS e BPC: renda familiar e elegibilidade'],15:['Assistência Social','LOAS e BPC: critério de renda per capita'],16:['Assistência Social','LOAS e BPC: valor do benefício'],17:['Assistência Social','BPC e contrato de aprendizagem: suspensão e continuidade'],
18:['Direito da Criança e do Adolescente','SINASE: direito à visita familiar e social'],19:['Direito da Criança e do Adolescente','SINASE: visita de filhos a adolescentes internados'],20:['Direito da Criança e do Adolescente','SINASE: visita íntima'],21:['Direito da Criança e do Adolescente','ECA: adoção internacional'],22:['Direito da Criança e do Adolescente','ECA: adoção por procuração'],
23:['Direito da Criança e do Adolescente','Marco Legal da Primeira Infância: acompanhante no pré-natal, parto e pós-parto'],24:['Direito da Criança e do Adolescente','Direito à permanência de pais com recém-nascido hospitalizado'],25:['Direito da Criança e do Adolescente','Entrega voluntária para adoção e assistência psicológica'],26:['Direito da Criança e do Adolescente','Entrega voluntária para adoção: encaminhamento à Justiça'],
27:['Direito da Criança e do Adolescente','Lei 13.431/2017: dever de comunicar violência contra crianças'],28:['Direito da Criança e do Adolescente','Lei 13.431/2017: escuta especializada e depoimento especial'],29:['Direito da Criança e do Adolescente','Lei 13.431/2017: proteção contra constrangimento por suspeito'],30:['Direito da Criança e do Adolescente','Lei 13.431/2017: medidas protetivas'],
31:['Serviço Social','Atendimento socioassistencial de crianças e adolescentes em situação de rua'],32:['Serviço Social','Escuta qualificada, vínculos familiares e atendimento intersetorial'],33:['Direito da Criança e do Adolescente','Lei Distrital 5.294/2014: medidas de proteção e atuação do conselho tutelar'],34:['Direito da Criança e do Adolescente','Lei Distrital 5.294/2014: impedimentos para candidatura a conselho tutelar'],35:['Direito da Criança e do Adolescente','Lei Distrital 5.294/2014: eleição de conselheiros tutelares'],36:['Direito da Criança e do Adolescente','Regimento dos Conselhos Tutelares do DF: atendimento descentralizado'],37:['Direito da Criança e do Adolescente','Regimento dos Conselhos Tutelares do DF: controle de frequência'],38:['Direito da Criança e do Adolescente','Acolhimento emergencial e competência do conselho tutelar'],39:['Direito da Criança e do Adolescente','Conselho tutelar: acesso e sigilo de registros'],40:['Direito da Criança e do Adolescente','Resolução CONANDA 170/2014: atribuições e requisição de serviços'],41:['Direito da Criança e do Adolescente','Resolução CONANDA 170/2014: cumprimento e revisão judicial de decisões'],42:['Direito da Criança e do Adolescente','Conselho tutelar: incompatibilidade de atividades profissionais'],
43:['Serviço Social','Serviços de acolhimento: orientações técnicas CNAS/CONANDA'],44:['Serviço Social','Convivência familiar e comunitária: política nacional'],45:['Direito da Criança e do Adolescente','Sistema de Garantia de Direitos: eixo de defesa e acesso à justiça'],46:['Direito da Criança e do Adolescente','Sistema de Garantia de Direitos: autonomia normativa dos conselhos tutelares'],47:['Direito da Criança e do Adolescente','SINASE: diversidade e princípios das medidas socioeducativas'],48:['Direito da Criança e do Adolescente','Conselho tutelar e limites para aplicação de medidas socioeducativas'],49:['Direito da Criança e do Adolescente','Resolução CONANDA 139/2010: acessibilidade da sede do conselho tutelar'],50:['Direito da Criança e do Adolescente','Resolução CONANDA 139/2010: acesso a registros e proteção do sigilo'],51:['Direito da Criança e do Adolescente','Natureza e âmbito de atuação dos conselhos tutelares'],52:['Direito da Criança e do Adolescente','Eleição e composição de conselhos tutelares'],
53:['Serviço Social','SUAS: natureza pública, não contributiva e descentralizada'],54:['Serviço Social','Política de assistência social: proteção, vigilância e defesa de direitos'],55:['Serviço Social','SUAS: princípios organizativos'],56:['Serviço Social','SUAS: serviços de acolhimento e permanência'],57:['Serviço Social','SUAS: acesso do usuário a registros e prontuários'],58:['Serviço Social','Benefícios eventuais: natalidade e funeral no Distrito Federal'],59:['Serviço Social','Tipificação Nacional: serviços de proteção social básica'],60:['Serviço Social','Tipificação Nacional: serviços de proteção social especial'],61:['Direitos Humanos','Direitos sexuais como direitos humanos'],62:['Direitos Humanos','Declaração dos Direitos Sexuais: conceito de saúde sexual'],63:['Direitos Humanos','Direitos humanos, identidade e expressão de gênero'],64:['Direitos Humanos','Autonomia e liberdade sexual'],65:['Direitos Humanos','Liberdade de associação e defesa de direitos sexuais'],66:['Direitos Humanos','Sexualidade: dimensões sociais, culturais, psicológicas e biológicas'],67:['Serviço Social','Políticas de enfrentamento à exploração sexual infantojuvenil'],68:['Serviço Social','Socialização, cultura e construção de gênero'],69:['Serviço Social','Participação de adolescentes em decisões sobre gravidez na adolescência'],70:['Serviço Social','Exploração sexual de crianças e adolescentes: vulnerabilidade e exclusão social']
}
const contexts={
constitution:'À luz da Constituição Federal de 1988, julgue o item. O enunciado aborda direitos e diretrizes constitucionais relacionados à educação e à assistência social.',
dudh:'Considere a Declaração Universal dos Direitos Humanos. O item trata da proteção à infância e à maternidade ou do direito dos pais relativo à educação dos filhos.',
childDeclaration:'Considere a Declaração Universal dos Direitos da Criança. O item aborda os princípios de proteção, prioridade e não discriminação.',
eca:'Com base no Estatuto da Criança e do Adolescente, julgue o item sobre tutela, guarda, adoção e atribuições do conselho tutelar.',
crc:'Considere a Convenção sobre os Direitos da Criança e as obrigações de proteção e garantia de direitos assumidas pelos Estados.',
joao:'João, 15 anos, mora no Distrito Federal com os pais e três irmãos adultos. O pai recebe aposentadoria de um salário mínimo e os demais familiares estão desempregados há mais de dois anos. A família possui casa própria e recebe cesta básica semanal. João é considerado pessoa com deficiência por avaliação psicopedagógica e recebe apoio escolar. A escola orientou a família a requerer o BPC ao INSS. Os itens aplicam a LOAS a esse caso.',
jose:'José, 17 anos, mora no DF, vive em união estável com Joana e tem com ela um filho de um ano. Cumpre medida socioeducativa de internação no SINASE. Os itens tratam de visitas familiares e direitos durante a internação.',
ana:'Ana, 27 anos, gestante de alto risco, busca orientação sobre acompanhante no pré-natal, parto e pós-parto, permanência junto ao filho em eventual UTI neonatal e entrega voluntária para adoção. Os itens aplicam o ECA e o Marco Legal da Primeira Infância.',
sofia:'Carla, professora da rede pública do DF, suspeita que Sofia, 6 anos, sofreu violência sexual do pai. A conselheira Elaine ouve a criança, impede contato visual do suspeito durante o depoimento e encaminha relatório ao Ministério Público. Os itens tratam da Lei 13.431/2017.',
paulo:'Paulo, 15 anos, vive em situação de rua com os pais no DF. Após atendimento, o conselho tutelar requisita serviços de saúde, educação e assistência social. O bloco aborda a Resolução CNAS/CONANDA 1/2017, legislação distrital e regimento dos conselhos tutelares.',
general:'Julgue o item com base na norma, resolução ou política pública indicada no próprio comando da prova; a imagem original da página continua vinculada ao registro.',
sexualRights:'Considere a Declaração dos Direitos Sexuais da World Association for Sexual Health. Os itens abordam saúde sexual, autonomia, liberdade de associação e reconhecimento dos direitos humanos.',
sexualPolicy:'Considere o caderno temático “Direitos Sexuais São Direitos Humanos”, do Comitê Nacional de Enfrentamento à Violência Sexual contra Crianças e Adolescentes (2008). Os itens abordam dimensões da sexualidade, gênero, participação juvenil e políticas contra exploração sexual.'
}
const contextFor=n=>n<=2?contexts.constitution:n<=4?contexts.dudh:n<=6?contexts.childDeclaration:n<=10?contexts.eca:n<=12?contexts.crc:n<=17?contexts.joao:n<=20?contexts.jose:n<=22?contexts.eca:n<=26?contexts.ana:n<=30?contexts.sofia:n<=32?contexts.paulo:n<=60?contexts.general:n<=65?contexts.sexualRights:contexts.sexualPolicy
const duplicated={
  'extr-696f605e7694fc904bf2':'extr-75bdae22c5eb1c5e553d',
  'extr-a7cf2003a722afd99077':'extr-ad7a1d9352eed6102c2d'
}
if(records.length!==71)throw Error(`Esperados 71 pendências, recebidas ${records.length}`)
if(records.some(q=>q.resposta!=null))throw Error('Há respostas preexistentes; não sobrescrever sem confronto.')
const decisions=records.map(q=>{
  const n=Number(q.numero),topic=topics[n],answer=answers.get(n),stem=source.get(n)
  if(!topic||!answer||!stem)throw Error(`Item ${n}: falta classificação, gabarito oficial ou enunciado fonte.`)
  if(!Array.isArray(q.opcoes)||q.opcoes.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Formato inesperado no item ${n}`)
  const duplicatedDe=duplicated[q.id]
  const p={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,texto_apoio:contextFor(n),materia:topic[0],conteudo:topic[1],ano:2019,concurso:'CDCA/DF 2019 — Processo Seletivo de Conselheiros Tutelares — Quadriênio 2020/2023',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 14/07/2019',cargo:'Conselheiro Tutelar',numero_original:n,numero:n,pagina:q.pagina,dificuldade:[3,7,9,10,13,14,17,20,22,25,26,27,28,29,31,32,34,38,41,46,48,50,52,55,57,60,62,67,70].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela leitura normativa e aplicação de legislação e políticas públicas; não é faixa publicada pela banca.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial do processo seletivo de Conselheiros Tutelares do DF; tópico específico classificado pelo diploma e conceito jurídico-social testado.`,resposta_correta:answer==='C'?0:1,anulada:false,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado'],gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_MATRIZ_479_CDCADF_001_00.PDF',prova:'479_CDCADF_001_00',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do cargo Conselheiro Tutelar; nenhuma das questões 1–70 foi marcada como anulada na tabela oficial.'}}
  if(duplicatedDe){p.apta_resolucao=false;p.inelegibilidade_motivo='duplicacao_de_extracao_mesmo_item';p.duplicada_de=duplicatedDe}
  else p.apta_resolucao=true
  return p
})
if(decisions.some(d=>!d.enunciado||!d.texto_apoio))throw Error('Há registro sem enunciado ou contexto.')
const duplicateDecisions=decisions.filter(d=>d.apta_resolucao===false)
if(duplicateDecisions.length!==2||duplicateDecisions.some(d=>!d.duplicada_de))throw Error('Revisão dos duplicados não está completa.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({itens:decisions.length,duplicatas:duplicateDecisions.map(d=>({numero:d.numero,id:d.id,duplicadaDe:d.duplicada_de})),semFonte:records.filter(q=>!source.has(Number(q.numero))).map(q=>q.numero),respostasC:decisions.filter(d=>d.resposta_correta===0).length,respostasE:decisions.filter(d=>d.resposta_correta===1).length,prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:'CEBRASPE — CDCA/DF 2019 — Conselheiro Tutelar — quadriênio 2020/2023',itens:decisions.map(d=>({numero:d.numero,id:d.id,materia:d.materia,conteudo:d.conteudo,resposta:d.gabarito_oficial.resposta,duplicadaDe:d.duplicada_de||null,pagina:d.pagina,textoBase:Boolean(d.texto_apoio)})),prova,gabarito,publicado:false,nota:'71 registros pendentes revisados com classificação específica e gabarito definitivo oficial. Dois registros eram cópias de extração do mesmo item dentro do documento; foram preservados no pacote local para auditoria, marcados inelegíveis e vinculados ao registro canônico, sem remoção destrutiva. Textos-base de casos e legislação foram reassociados.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — CDCA/DF 2019 — Conselheiro Tutelar — revisão v394\n\n- 71 registros classificados em Direito Constitucional, Direitos Humanos, Direito da Criança e do Adolescente e Serviço Social, com subtópicos, data, aplicação, cargo e dificuldade editorial estimada.\n- Textos-base dos casos João/BPC, José/SINASE, Ana/primeira infância, Sofia/violência e Paulo/situação de rua foram reassociados; os demais comandos normativos foram explicitados.\n- Gabarito definitivo do cargo vinculado item a item.\n- Dois duplicados de extração nos itens 3 e 8 foram preservados para rastreabilidade, marcados inelegíveis e ligados aos registros canônicos; não foram apagados.\n- Fontes: [caderno oficial](${prova}) e [gabarito definitivo oficial](${gabarito}).\n- Alterações locais; não publicadas na nuvem.\n`)
console.log(JSON.stringify(report,null,2))
