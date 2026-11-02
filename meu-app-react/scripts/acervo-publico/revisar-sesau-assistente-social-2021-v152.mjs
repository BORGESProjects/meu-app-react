import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='939387a702d57b53'
const prova='https://cdn.cebraspe.org.br/concursos/SESAU_AL_21/arquivos/603_SESAU_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SESAU_AL_21/arquivos/GAB_DEFINITIVO_603_SESAU_001_01.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))

const verifiedLine=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(line=>line.includes(`"documento_id": "${doc}"`))
if(!verifiedLine)throw new Error('Transcrição local do gabarito oficial não encontrada')
const key=new Map(Object.entries(JSON.parse(verifiedLine).respostas).map(([n,v])=>[Number(n),v]))
for(const [n,v] of Object.entries({111:'E',112:'C',113:'C',114:'E',115:'E',116:'C',117:'E',118:'C',119:'C',120:'E'}))key.set(Number(n),v)
if(key.size!==70)throw new Error(`Gabarito incompleto: ${key.size} itens`)
const keyHash=hashRevisao([...key].sort((a,b)=>a[0]-b[0]).map(([n,v])=>`${n}:${v}`).join('|'))

const topics=new Map([
 [51,['Serviço Social','Fundamentos históricos — renovação e ruptura com o conservadorismo']],
 [52,['Serviço Social','Projeto ético-político e pluralismo teórico-metodológico']],
 [53,['Políticas Sociais','LOAS — participação profissional na elaboração e implementação']],
 [54,['Legislação e normas','Código de Ética — suspensão profissional e inadimplência']],
 [55,['Legislação e normas','Código de Ética — sigilo profissional e depoimento como testemunha']],
 [56,['Legislação e normas','Lei nº 8.662/1993 — interdição do exercício profissional']],
 [57,['Legislação e normas','Código de Ética — penalidades disciplinares e regularização de débito']],
 [58,['Legislação e normas','Lei nº 8.662/1993 — revalidação de diploma estrangeiro']],
 [59,['Serviço Social','Competências profissionais — coordenação de núcleos de estudo e pesquisa']],
 [60,['Legislação e normas','Processo ético no CRESS — Resolução CFESS nº 660/2013']],
 [61,['Legislação e normas','Processo ético no CRESS — admissibilidade e análise de denúncias']],
 [62,['Legislação e normas','Processo ético no CRESS — fase pré-processual e cancelamento de inscrição']],
 [63,['Legislação e normas','Processo ético no CRESS — forma e apresentação de denúncia']],
 [64,['Legislação e normas','Processo ético no CRESS — apuração e prova documental']],
 [65,['Serviço Social','Planejamento — processo político e ciclo decisório']],
 [66,['Serviço Social','Planejamento — mediação de interesses institucionais contraditórios']],
 [67,['Serviço Social','Planejamento — crítica à racionalidade gerencial instrumental']],
 [68,['Serviço Social','Planejamento — método e processo técnico-político']],
 [69,['Serviço Social','Pesquisa social — dimensão investigativa e parecer profissional']],
 [70,['Serviço Social','Pesquisa social — produção de conhecimento e teoria social']],
 [71,['Serviço Social','Pesquisa social — reflexividade e posição do pesquisador']],
 [72,['Serviço Social','Pesquisa social — investigação como dimensão do trabalho profissional']],
 [73,['Serviço Social','Instrumentos e técnicas — perícia, laudo, relatório e parecer social']],
 [74,['Serviço Social','Instrumental técnico-operativo — finalidade, técnicas e procedimentos']],
 [75,['Serviço Social','Instrumental técnico-operativo — meios e finalidades da ação']],
 [76,['Serviço Social','Instrumental técnico-operativo — escolha e uso de recursos profissionais']],
 [77,['Serviço Social','Instrumental técnico-operativo — recursos e operacionalização da ação']],
 [78,['Serviço Social','Entrevista social — abordagens e condições de realização']],
 [79,['Serviço Social','Entrevista social — escuta qualificada e relação dialógica']],
 [80,['Serviço Social','Entrevista social — objetivos e comunicação com o usuário']],
 [81,['Serviço Social','Entrevista social — conhecimento da realidade e garantia de direitos']],
 [82,['Serviço Social','Entrevista social — diálogo, intenção e condução profissional']],
 [83,['Serviço Social','Interdisciplinaridade — compartilhamento de saberes']],
 [84,['Serviço Social','Interdisciplinaridade — articulação entre áreas do conhecimento']],
 [85,['Serviço Social','Interdisciplinaridade — preservação das especificidades profissionais']],
 [86,['Serviço Social','Interdisciplinaridade — fundamentos e marcos profissionais']],
 [87,['Serviço Social','Estudo social, perícia e parecer — natureza e finalidade']],
 [88,['Serviço Social','Estudo social, laudo e parecer — registro e análise']],
 [89,['Serviço Social','Estudo social — objeto e análise socioeconômica']],
 [90,['Serviço Social','Relatório social — análise, opinião técnica e instrumentos']],
 [91,['Serviço Social','Visita domiciliar — abordagem, consentimento e direitos']],
 [92,['Serviço Social','Visita domiciliar — limites entre garantia de direitos e controle']],
 [93,['Serviço Social','Visita domiciliar — consentimento e proteção da privacidade']],
 [94,['Serviço Social','Visita domiciliar — observação e registro profissional']],
 [95,['Serviço Social','Visita domiciliar — apresentação, finalidade e confidencialidade']],
 [96,['Políticas Sociais','Política social brasileira após a Constituição de 1988']],
 [97,['Políticas Sociais','Seletividade, focalização e acesso a direitos sociais']],
 [98,['Políticas Sociais','Estado, proteção social e ambiguidade das políticas brasileiras']],
 [99,['Políticas Sociais','Transferência de renda e crítica da política econômica']],
 [100,['Políticas Sociais','Neoliberalismo e transformações da agenda progressista']],
 [101,['Políticas Sociais','Direito à alimentação e determinantes sociais da saúde']],
 [102,['Saúde Coletiva','Iniquidades sociais, saúde, doença e morbidade']],
 [103,['Saúde Coletiva','Programa Mais Médicos — objetivos e níveis de atenção']],
 [104,['Saúde Coletiva','Política Nacional de Atenção Integral à Saúde do Homem']],
 [105,['Políticas Sociais','SUAS — residências inclusivas e proteção social']],
 [106,['Direitos Humanos','Gênero, raça, encarceramento feminino e política de drogas']],
 [107,['Direitos Humanos','Atendimento a mulheres em situação de violência e revitimização']],
 [108,['Políticas Sociais','PAIF, povos indígenas e vulnerabilidade territorial']],
 [109,['Legislação e normas','ECA — programa de apadrinhamento afetivo']],
 [110,['Legislação e normas','ECA — critérios e prioridade no apadrinhamento']],
 [111,['Legislação e normas','ECA — pobreza, poder familiar e medidas de proteção']],
 [112,['Legislação e normas','ECA — poder familiar e violência contra a mulher']],
 [113,['Serviço Social','Concepções contemporâneas de família e vínculos socioafetivos']],
 [114,['Legislação e normas','Registro civil e reconhecimento de vínculo socioafetivo']],
 [115,['Serviço Social','Análise sócio-histórica, ética profissional e avaliação de risco']],
 [116,['Legislação e normas','ECA — evasão escolar e atuação do Conselho Tutelar']],
 [117,['Legislação e normas','ECA — competências do Conselho Tutelar e garantia de direitos']],
 [118,['Políticas Sociais','Programa Cisternas — acesso à água e tecnologias sociais']],
 [119,['Previdência Social','Segurado facultativo de baixa renda e contribuição previdenciária']],
 [120,['Saúde Coletiva','HIV/AIDS — vigilância epidemiológica e impactos sociais']],
])
const contexts=[
 [[51,53],'Considere os fundamentos históricos e teórico-metodológicos do Serviço Social brasileiro e sua trajetória de renovação profissional. Julgue os itens.'],
 [[54,58],'Ana, assistente social, atua em hospital público e foi intimada a depor sobre situação sigilosa conhecida no atendimento. Juan é assistente social graduado no exterior, trabalha no Brasil e possui débito com o CRESS. Julgue os itens à luz do Código de Ética Profissional e da Lei nº 8.662/1993.'],
 [[59,59],'Ana dirige núcleo de estudo e pesquisa em Serviço Social.'],
 [[60,64],'O CRESS recebeu denúncias sobre o exercício profissional de assistente social. Um dia após o início das denúncias, o profissional solicitou o cancelamento da inscrição. Os relatos referem-se a suposta violação do Código de Ética em uma secretaria de saúde. À luz da Resolução CFESS nº 660/2013, julgue os itens.'],
 [[65,68],'Acerca do processo técnico-político do planejamento, julgue os itens.'],
 [[69,72],'Na instituição onde trabalha, a assistente social Amanda posiciona-se e atua frente à realidade, produz pesquisas e conhecimentos teóricos; realiza entrevistas, elabora estudos e pareceres relacionados aos atendimentos e os encaminha, quando necessário, a setores de sua rede. Julgue os itens sobre pesquisa e dimensão investigativa.'],
 [[73,77],'Acerca dos instrumentais técnico-operativos do Serviço Social, julgue os itens.'],
 [[78,82],'A entrevista é um instrumental técnico-operativo fundamental no trabalho do assistente social; é necessário que o profissional tenha clareza quanto a seu uso, suas características e significados. Julgue os itens.'],
 [[83,86],'No Serviço Social, são frequentes a interdisciplinaridade e a multidisciplinaridade. Julgue os itens sobre a atuação em equipe multiprofissional e as relações entre saberes.'],
 [[87,90],'No cotidiano profissional do assistente social, no âmbito das políticas sociais, são relevantes o estudo social, o relatório, o laudo, a perícia e o parecer social. Julgue os itens.'],
 [[91,95],'A necessidade de compreender a realidade social e as relações familiares pode levar o assistente social a realizar visita domiciliar. Julgue os itens sobre sua condução profissional.'],
 [[96,98],'A respeito dos fundamentos, da história e das políticas referentes à política social, julgue os itens.'],
 [[99,100],'Considerando a seguridade social no Brasil, a relação Estado-sociedade e o contexto atual do neoliberalismo, julgue os itens.'],
 [[101,103],'A respeito das políticas de saúde, julgue os itens.'],
 [[104,107],'Julgue os itens a respeito das políticas e dos programas sociais dirigidos a segmentos.'],
 [[108,108],'No âmbito do Serviço de Proteção e Atendimento Integral à Família, considere a situação da população indígena e sua relação com vulnerabilidade territorial.'],
 [[109,112],'À luz da legislação social sobre os direitos das crianças e dos adolescentes, julgue os itens.'],
 [[113,115],'Considerando as concepções e modalidades de família, bem como as estratégias de atendimento e acompanhamento, julgue os itens.'],
 [[116,117],'Considerando políticas, diretrizes, ações e desafios na área da família, da criança e do adolescente, julgue os itens.'],
 [[118,120],'A respeito de políticas e programas sociais setoriais, julgue os itens.']
]
const contextFor=n=>contexts.find(([[a,b]])=>n>=a&&n<=b)[1]
const corrections=new Map([
 [53,'A maturidade profissional do Serviço Social, que seguiu avançando no início do atual milênio, ganhou visibilidade na sociedade brasileira, entre outros motivos, pela intervenção dos assistentes sociais, por intermédio de seus organismos representativos, nos processos de elaboração e implementação da Lei Orgânica da Assistência Social.'],
 [58,'Profissionais graduados no exterior, como Juan, estão aptos a exercer a profissão de assistente social no Brasil, sendo-lhes dispensável o procedimento de revalidação do diploma caso o estabelecimento de ensino no qual se graduaram possua convênio com o governo brasileiro.'],
 [59,'É uma competência de Ana, como assistente social, dirigir e coordenar núcleos de estudo e de pesquisa em Serviço Social.'],
 [68,'O planejamento, enquanto método e processo técnico-político, possibilita pensar e agir sobre uma realidade, para se obterem soluções alternativas.'],
 [72,'A pesquisa é uma atividade eventual e, com isso, não tem condições de constituir o fazer profissional do assistente social, motivo por que poucos são os assistentes sociais que, como Amanda, conseguem realizar investigações e pesquisas nos seus espaços de atuação.'],
 [82,'A entrevista é um processo de diálogo entre duas ou mais pessoas; a diferenciação em seu uso é dada pelo modo de agir e pela intenção de quem a pratica.'],
 [86,'A interdisciplinaridade é um direcionamento dos órgãos da categoria profissional, estando presente em seus aparatos normativos e legais.'],
 [90,'O relatório social deve ser conclusivo quanto à opinião do profissional sobre a situação analisada, devendo indicar os elementos analíticos relevantes e os instrumentos utilizados nas dimensões investigativa e interventiva.'],
 [93,'O profissional deve solicitar autorização para entrar na residência do usuário; caso não haja aceitação, a abordagem pode ser realizada nas imediações, respeitando-se o direito das famílias de não permitirem a presença de profissionais em seus domicílios.'],
 [94,'Devido à importância da observação das condições de moradia e das relações ali estabelecidas, o assistente social não deve se preocupar quanto ao registro de dados, pois o usuário pode comparecer posteriormente à instituição para registrá-los.'],
 [95,'A abordagem deve iniciar com a apresentação, se ainda não houver vínculo. Os usuários devem ser esclarecidos quanto à finalidade da visita e sobre seu caráter confidencial.'],
 [98,'Logo após a Constituição Federal de 1988, as políticas sociais brasileiras se tornaram ainda mais ambíguas, embora o Estado passasse, naquele momento, a ocupar, nas expectativas sociais, a função central de proteção social até então pertencente à instituição familiar.'],
 [99,'Programas que transferem recursos públicos sob a denominação de transferência de renda, renda básica ou renda mínima são estratégias político-econômicas para conter o fluxo de consumo, potencializar a rotação do capital e, assim, erradicar a pobreza.'],
 [100,'A face ultraneoliberal vigente é resultante das transformações sofridas pelo neoliberalismo, que se apoderou da agenda progressista em determinado momento do ciclo histórico, sem, entretanto, romper com seus principais fundamentos.'],
 [103,'O Programa Mais Médicos para o Brasil tem a finalidade de garantir a prestação de assistência de média e alta complexidade em regiões mais longínquas e com alta vulnerabilidade social, o que o fez referência no Sistema Único de Saúde, no contexto da pandemia do novo coronavírus.'],
 [105,'As residências inclusivas, no âmbito do Sistema Único de Assistência Social, são destinadas ao acolhimento de crianças, adolescentes e adultos com diferentes tipos de deficiência, beneficiários do benefício de prestação continuada e cujas famílias encontram-se em situação de vulnerabilidade socioeconômica e sem condições de autossustentabilidade.'],
 [106,'No Brasil, as mulheres brancas, em decorrência da grande vulnerabilidade social e baixa escolaridade, são maioria entre as mulheres presas por tráfico de drogas, mesmo que cumprindo penas relativas a tipos penais de baixa periculosidade.'],
 [107,'O acolhimento às mulheres vítimas de violência deve ser humanizado e conduzido, preferencialmente, por uma profissional mulher, a qual deverá resguardar o sigilo, evitar o julgamento moral e, consequentemente, coibir a revitimização.'],
 [108,'No âmbito do Serviço de Proteção e Atendimento Integral à Família, deve-se considerar que a proteção do território pela população indígena pode interferir na vulnerabilidade, sobretudo se consideradas questões como a realização de práticas laborais sem remuneração para sua subsistência e de autonomia cultural e produtiva.'],
 [111,'A constatação de insuficiência de recursos materiais dos detentores do poder familiar deverá ser reportada ao Conselho Tutelar para a decretação de medidas de proteção e de encaminhamento das crianças e dos adolescentes para os serviços de acolhimento temporário.'],
 [112,'O autor de um crime de feminicídio contra a genitora de seus filhos, por ato judicial, será destituído do poder familiar.'],
 [115,'As condutas dos profissionais de Serviço Social devem ser precedidas de uma análise sócio-histórica e, quando necessário, de uma averiguação sociocriminal da vida pregressa dos sujeitos ou das famílias para a apreensão dos riscos sociais e dos fatores que resultam em seu desenraizamento social.'],
 [117,'É competência do Conselho Tutelar a articulação com os órgãos jurisdicionados, em se tratando, por exemplo, das requisições de acesso ao sistema de saúde e outras medidas perante as violações de direitos, desde que haja expressa concordância da família da criança ou do adolescente em atendimento.'],
 [118,'O Programa Nacional de Apoio à Captação de Água de Chuva e outras Tecnologias Sociais de Acesso à Água — Programa Cisternas — tem como uma das finalidades intervir nos problemas relacionados ao acesso à água que afetam, sobretudo, as famílias pobres da zona rural de todo o país, com destaque para indígenas, quilombolas e comunidades tradicionais, geralmente localizadas em territórios mais isolados.'],
 [119,'Homens ou mulheres com renda familiar de até dois salários mínimos que empenharem unicamente o trabalho doméstico na própria residência e não possuírem renda de qualquer tipo poderão contribuir ao Instituto Nacional do Seguro Social (INSS) com o valor reduzido de 5% do salário mínimo.'],
 [120,'No Brasil, em relação ao vírus da imunodeficiência humana (HIV) e à síndrome da imunodeficiência adquirida (AIDS), observa-se curva epidêmica com tendência decrescente, mas impactos significativos na economia, pelos elevados custos do tratamento, além de onerar os cofres da previdência social em decorrência dos benefícios usufruídos pelas pessoas vivendo com HIV/AIDS.']
])

const start=raizesAtuais.findIndex(r=>r.includes('revisao-sefaz-se-auditoria-2022-v151'))
if(start<0)throw new Error('Base v151 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)));for(const q of qs)if(q.documento_id===doc)active.set(q.id,q)}
if(raw.length!==70||active.size!==70||raw.some(x=>!active.has(x.id)))throw new Error(`Caderno incompleto ou inconsistente: exportados ${raw.length}, ativos ${active.size}`)
const decisions=raw.map(x=>{
 const n=Number(x.numero),q=active.get(x.id),ans=key.get(n),topic=topics.get(n),ctx=contextFor(n)
 if(!ans||!topic||!x.imagem?.startsWith(`paginas/${doc}-`))throw new Error(`Metadado, resposta ou imagem ausente no item ${n}`)
 const annulled=ans==='X',stem=(corrections.get(n)||x.enunciado).replace(/\u000c/g,' ').replace(/\s+/g,' ').trim()
 if(stem.length<45)throw new Error(`Enunciado curto no item ${n}`)
 return {id:x.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2021,concurso:'SESAU/AL — Assistente Social — edital 2021, aplicação em 12/09/2021',numero_original:n,pagina:Number(x.pagina),dificuldade:[53,58,61,62,67,71,72,84,85,97,99,100,106,111,114,115,117,119,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual e normativa; a banca não publicou nível oficial de dificuldade.',resposta_correta:annulled?null:ans==='C'?0:1,anulada:annulled,gabarito_oficial:{valor:ans,fonte:gabarito,sha256:keyHash,sha256_tipo:'hash_da_transcricao_canonica_dos_itens_51_a_120_do_gabarito_definitivo',numero:n,resposta:ans,metodo:'Gabarito definitivo oficial do Cargo 1 — Assistente Social; itens 51–110 conferidos na tabela local transcrita, e 111–120 conferidos na tabela oficial do PDF. Aplicação em 12/09/2021; o hash representa a transcrição, não o PDF.'},classificacao_fonte:prova,motivo:`Item ${n} revisto pela leitura semântica e visual da página ${x.pagina} do caderno oficial; classificação por matéria/conteúdo e gabarito definitivo do Cargo 1.`,visual:{pagina:Number(x.pagina),imagem:x.imagem,texto_apoio:ctx,motivo:`Página ${x.pagina} do caderno oficial conferida visualmente; transcrição corrigida quando necessário e contexto associado ao bloco do item ${n}.`},enunciado:stem,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:new Set(decisions.map(d=>d.numero_original)).size,gabaritos:key.size,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),classificacoes:Object.fromEntries([...new Set(decisions.map(d=>d.materia))].map(m=>[m,decisions.filter(d=>d.materia===m).length])),transcricoesCorrigidas:corrections.size,paginas:[...new Set(decisions.map(d=>d.pagina))],stemMinimo:Math.min(...decisions.map(d=>d.enunciado.length))},null,2));process.exit(0)}
const name='revisao-sesau-assistente-social-2021-v152',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const output={...report,fonte_prova:prova,fonte_gabarito:gabarito,registros_revistos:decisions.length,itens_unicos:decisions.length,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),transcricoes_corrigidas:corrections.size,paginas_originais:[...new Set(decisions.map(d=>d.pagina))].length,contextos_e_imagens_associados:true,publicada:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
