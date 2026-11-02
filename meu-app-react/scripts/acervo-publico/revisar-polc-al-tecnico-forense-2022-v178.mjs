import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='f26c614ca8a86de8'
const prova='https://cdn.cebraspe.org.br/concursos/POLC_AL_22/arquivos/701_POLC_AL_017_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/POLC_AL_22/arquivos/GAB_DEFINITIVO_701_POLC_AL_017_01_%28CARGO_17%29.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==52)throw Error('Catálogo POLC/AL 2022, Cargo 17, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-depen-servico-social-2021-v177'))
if(start<0)throw Error('Base v177 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==52)throw Error(`Esperados 52 registros, encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const duplicates=new Map([
 ['extr-4ed560f015de15f8610b','extr-f4b0bf21b3dfcf4468af'],
 ['extr-e9b8475a8702faa7a73c','extr-bad534aab9c28fe9c562']
])
const topics=new Map([
 [71,['Farmacologia','Anti-helmínticos: espectro de ação contra platelmintos, nematódeos e protozoários']],
 [72,['Farmacologia','Vias de administração: absorção de medicamentos pela mucosa oral e início do efeito']],
 [73,['Farmacologia','Antimicrobianos: espectro de ação e classificação da amoxicilina']],
 [74,['Microbiologia','Bactérias Gram-positivas e Gram-negativas: composição e espessura da parede celular']],
 [75,['Microbiologia','Microbiota do trato respiratório e mecanismos de defesa do hospedeiro']],
 [76,['Histologia','Tecido epitelial glandular e produção de secreções']],
 [77,['Anatomia e Fisiologia','Sistema reprodutor masculino: secreções das glândulas bulbouretrais']],
 [78,['Anatomia e Fisiologia','Sistema digestório: absorção de nutrientes no intestino delgado e grosso']],
 [79,['Anatomia e Fisiologia','Controle neural da respiração e centros respiratórios do tronco encefálico']],
 [80,['Anatomia','Coluna vertebral: características dos forames transversos nas vértebras lombares']],
 [81,['Anatomia e Fisiologia','Sistema cardiovascular: musculatura lisa vascular e músculo cardíaco']],
 [82,['Biossegurança','Níveis de biossegurança: classificação laboratorial diante de risco de vírus da hepatite B']],
 [83,['Legislação Sanitária','Resíduos de serviços de saúde: critérios de classificação de restos humanos']],
 [84,['Saúde e Segurança do Trabalho','Exposição ocupacional a agentes biológicos e medidas do Programa de Gerenciamento de Riscos']],
 [85,['Controle de Infecção','Vigilância epidemiológica de infecções hospitalares e consumo de antimicrobianos']],
 [86,['Enfermagem','Precauções padrão e uso de equipamento de proteção individual em assistência à saúde']],
 [87,['Enfermagem','Limpeza concorrente e terminal da unidade do paciente: princípios de controle de infecção']],
 [88,['Enfermagem','Registro de cuidados de enfermagem no prontuário e responsabilidade profissional']],
 [89,['Enfermagem','Higienização das mãos: enxágue e secagem após a lavagem']],
 [90,['Enfermagem','Sinais vitais: pressão arterial e interpretação da pressão de pulso']],
 [91,['Enfermagem','Segurança do paciente: contagem de compressas e gazes no procedimento cirúrgico']],
 [92,['Enfermagem','Sonda nasogástrica: contraindicação diante de suspeita de fístula liquórica']],
 [93,['Enfermagem','Urologia: resíduo pós-miccional e risco de infecção urinária']],
 [94,['Epidemiologia','Doença de Chagas: notificação compulsória nas fases aguda e crônica']],
 [95,['Saúde Mental','Intervenções psicossociais e uso de música no cuidado em saúde mental']],
 [96,['Sistema Único de Saúde','Princípios doutrinários: universalidade do acesso à saúde']],
 [97,['Sistema Único de Saúde','Princípios doutrinários: integralidade e acesso ao tratamento']],
 [98,['Sistema Único de Saúde','Equidade: resposta às necessidades e às diferenças entre pessoas']],
 [99,['Sistema Único de Saúde','Equidade: cuidado proporcional às necessidades individuais']],
 [100,['Sistema Único de Saúde','Integralidade: continuidade do cuidado da prevenção à reabilitação']],
 [101,['Epidemiologia','Cólera: agente etiológico, transmissão e reservatório']],
 [102,['Epidemiologia','Cólera: sazonalidade, chuva e fatores ambientais de transmissão']],
 [103,['Epidemiologia','Dengue: vetor e ciclo de transmissão entre seres humanos e Aedes aegypti']],
 [104,['Parasitologia','Esquistossomose mansoni: ciclo biológico e hospedeiro intermediário']],
 [105,['Epidemiologia','Dengue: período de viremia e transmissão do ser humano ao mosquito']],
 [106,['Parasitologia','Esquistossomose: eliminação de ovos, ciclo no caramujo e infecção humana']],
 [107,['Saúde Mental','Rede de Atenção Psicossocial: cuidado compartilhado nos transtornos de ansiedade']],
 [108,['Atenção Primária à Saúde','Linhas de cuidado: coordenação e gestão pela atenção básica']],
 [109,['Atenção Primária à Saúde','Hipertensão arterial: manejo de crises e atribuições da unidade básica']],
 [110,['Saúde Pública','Obesidade: doença crônica, recidivante e multifatorial']],
 [111,['Controle Social do SUS','Conselhos de saúde: natureza deliberativa, composição e paridade']],
 [112,['Controle Social do SUS','Conselhos de saúde: participação na gestão e no financiamento do sistema']],
 [113,['Controle Social do SUS','Autonomia, competências e vínculo institucional dos conselhos de saúde']],
 [114,['Controle Social do SUS','Conselho Nacional de Saúde: representação de CONASS e CONASEMS']],
 [115,['Controle Social do SUS','Representação paritária de usuários, trabalhadores e gestores nos conselhos de saúde']],
 [116,['Controle Social do SUS','Conferências de saúde: convocação, periodicidade e avaliação da política de saúde']],
 [117,['Humanização em Saúde','Política Nacional de Humanização: finalidade e inclusão de usuários, trabalhadores e gestores']],
 [118,['Humanização em Saúde','Clínica ampliada e compartilhada: cuidado interdisciplinar e corresponsabilidade']],
 [119,['Humanização em Saúde','Transversalidade: integração de saberes e corresponsabilidade na produção de saúde']],
 [120,['Humanização em Saúde','Acolhimento: escuta qualificada e garantia de acesso às tecnologias de cuidado']]
])
const contexts={
 farmacologia:'Contexto do caderno: julgue os itens sobre farmacologia, microbiologia e parasitologia.',
 anatomia:'Contexto do caderno: itens de anatomia, fisiologia e histologia humanas.',
 biosseg:'Contexto do caderno: itens sobre biossegurança e controle de infecção hospitalar, com base no arcabouço legal aplicável.',
 procedimentos:'Contexto do caderno: itens sobre orientações do Ministério da Saúde para organização do trabalho e procedimentos de saúde e enfermagem.',
 seguranca:'Contexto do caderno: itens sobre práticas validadas para assistência, segurança e atenção à coletividade.',
 sus:'Texto-base: o SUS deve garantir a todas as pessoas acesso à saúde e ao tratamento necessário, sem distinção, atendendo cada indivíduo de acordo com suas necessidades.',
 epidemiologia:'Contexto do caderno: itens sobre a contextualização ampla de problemas de saúde pública e doenças de interesse coletivo.',
 linhas:'Contexto do caderno: itens sobre linhas de cuidado para doenças crônicas, como hipertensão e diabetes, importantes fatores de risco à saúde no Brasil.',
 controle:'Contexto do caderno: a participação popular e o controle social no SUS são assegurados pela Constituição Federal e pelas Leis Orgânicas da Saúde.',
 humaniza:'Contexto do caderno: julgue os itens de acordo com as diretrizes e os princípios da Política Nacional de Humanização (HumanizaSUS).'
}
const repairs=new Map([
 ['extr-b353dcf7dd178761d52d','O trato respiratório superior e o inferior são praticamente livres de microrganismos potencialmente patogênicos em pessoas saudáveis.'],
 ['extr-f758d1b351c6f9e2aa4e','O diâmetro dos vasos sanguíneos é regulado por músculos lisos, ao passo que o sangue é bombeado por tecido muscular estriado.'],
 ['extr-f4b0bf21b3dfcf4468af','O enxágue e a secagem das mãos após a lavagem devem ser feitos a partir dos antebraços e punhos em direção às mãos, com vistas a assegurar que a umidade progressivamente se concentre nas extremidades dos dedos.'],
 ['extr-bad534aab9c28fe9c562','É necessário o controle da quantidade de compressas cirúrgicas e gazes apenas ao fim da cirurgia, já que o foco da equipe deve estar em outros cuidados mais importantes no transcorrer do ato cirúrgico.'],
 ['extr-100ddf304bccbbd85fd6','Atender a todas as demandas necessárias, da prevenção à reabilitação, corresponde ao princípio da integralidade.'],
 ['extr-c91128fe3a87125066b1','A obesidade é uma doença crônica recidivante, multifatorial, de herança poligênica e dependente da interação com o ambiente.']
])

const decisions=[]
for(const q of active.values()){
 const e=entries.get(q.id);if(!e)throw Error(`Registro sem catálogo: ${q.id}`)
 const n=Number(q.numero_original||q.numero),page=Number(e.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 if(duplicates.has(q.id)){
  decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:n===89?'Enfermagem':'Enfermagem',conteudo:'Cópia OCR duplicada do mesmo item da prova',ano:2022,concurso:'POLC/AL 2022 — Cargo 17: Técnico Forense — prova objetiva, conhecimentos específicos',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,classificacao_fonte:prova,motivo:'Comparação das páginas oficiais confirmou repetição OCR do mesmo número de item.',visual:{pagina:page,imagem:image,texto_apoio:'',motivo:'Página original preservada para auditoria da cópia OCR.'},apta_resolucao:false,inelegibilidade_motivo:'Duplicata OCR de item canônico mantido.',duplicada_de:duplicates.get(q.id)})
  continue
 }
 const [materia,conteudo]=topics.get(n)||[]
 if(!materia||!conteudo)throw Error(`Classificação ausente para item ${n}`)
 let texto_apoio=''
 if(n>=71&&n<=74)texto_apoio=contexts.farmacologia
 if(n>=76&&n<=81)texto_apoio=contexts.anatomia
 if(n>=82&&n<=85)texto_apoio=contexts.biosseg
 if(n>=86&&n<=89)texto_apoio=contexts.procedimentos
 if(n>=90&&n<=95)texto_apoio=contexts.seguranca
 if(n>=96&&n<=100)texto_apoio=contexts.sus
 if(n>=101&&n<=106)texto_apoio=contexts.epidemiologia
 if(n>=107&&n<=110)texto_apoio=contexts.linhas
 if(n>=111&&n<=116)texto_apoio=contexts.controle
 if(n>=117&&n<=120)texto_apoio=contexts.humaniza
 const enunciado=repairs.get(q.id)||q.enunciado
 if(!enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Enunciado ou tipo inesperado no item ${n}`)
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,concurso:'POLC/AL 2022 — Cargo 17: Técnico Forense — prova objetiva, conhecimentos específicos',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência conceitual e aplicação profissional; o Cebraspe não divulga faixa individual por item.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação específica pelo conteúdo cobrado e pelo programa oficial do cargo de Técnico Forense.`,visual:{pagina:page,imagem:image,texto_apoio,motivo:'Página original verificada e texto-base comum associado aos itens do bloco.'},enunciado,texto_apoio,apta_resolucao:true})
}
const unique=decisions.filter(d=>d.apta_resolucao!==false),numbers=new Set(unique.map(d=>Number(d.numero_original)))
if(unique.length!==50||numbers.size!==50||![...Array(50)].every((_,i)=>numbers.has(i+71)))throw Error(`Cobertura esperada 71–120 divergente: ${unique.length} únicos e ${numbers.size} números`)
if(decisions.filter(d=>d.apta_resolucao===false).length!==2)throw Error('Esperadas duas duplicatas OCR')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itens_unicos:unique.length,duplicatas:2,questoes_pendentes_antes:unique.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length,contextos_associados:unique.filter(d=>d.texto_apoio).length,paginas:[1,2],prova,gabarito,disciplinas:Object.fromEntries([...new Set(unique.map(d=>d.materia))].map(s=>[s,unique.filter(d=>d.materia===s).length]))},null,2));process.exit(0)}
const name='revisao-polc-al-tecnico-forense-2022-v178'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:52,itens_unicos:50,duplicatas_inelegiveis:2,cobertura_numerica:'71–120 sem lacunas',contextos_textuais_associados:unique.filter(d=>d.texto_apoio).length,corrigidos_ocr:repairs.size,paginas_originais_conferidas:[1,2],fonte_gabarito_oficial:gabarito,gabaritos_sem_alteracao:true,publicado:false,prova,fonte_catalogo:'https://www.cebraspe.org.br/concursos/polc_al_22'}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
