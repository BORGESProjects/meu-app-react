import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'
const documento='6802fd1b6dbc3862'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const origem='tmp/revisao-profissional/corrigir-antt-cargo3-formulas-v122/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/pc_se_18_delegado/arquivos/523_pcse_001_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/PC_SE_18_DELEGADO/arquivos/GAB_DEFINITIVO_523_PCSE_001_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/PC_SE_18_DELEGADO/arquivos/ED_36_2018_PC_SE_DELEGADO___RESULTADO_FINAL_CURSO_FORMACAO.PDF'
const chaves=[
 ...'C X E C E E C E E E C E C C E C E E C C'.split(' '),
 ...'E E C C E C E C E E C E E E C E C C C E'.split(' '),
 ...'E E E E C C E C E E E C C E E C C C E E'.split(' '),
 ...'E C C E C C C E E E E C E C C C C E E C'.split(' '),
 ...'E E C E C C E E E C C E C C E C E C C E'.split(' '),
 ...'C E E C X C E E C E E C C E C C E E E X'.split(' '),
]
if(chaves.length!==120)throw Error(`Gabarito com ${chaves.length} itens`)
const materia=[
 [[1,6],'Armamento e Tiro'],[[7,12],'Legislação Penal Especial'],[[13,17],'Criminalística'],[[18,19],'Informática'],
 [[20,23],'Direito Penal'],[[24,25],'Criminalística'],[[26,27],'Medicina Legal'],[[28,31],'Criminalística'],
 [[32,35],'Informática'],[[36,37],'Direito Processual Penal'],[[38,42],'Gestão de Crises'],[[43,47],'Legislação Estadual'],
 [[48,48],'Direito Constitucional'],[[49,53],'Criminalística'],[[54,59],'Inteligência Policial'],[[60,64],'Direito Processual Penal'],
 [[65,70],'Criminalística'],[[71,73],'Inteligência Policial'],[[74,76],'Direito Processual Penal'],[[77,81],'Direito Penal'],
 [[82,86],'Gestão de Conflitos'],[[87,89],'Medicina Legal'],[[90,95],'Criminalística'],[[96,96],'Direito Penal'],
 [[97,98],'Legislação Penal Especial'],[[99,102],'Primeiros Socorros'],[[103,108],'Criminologia e Psicopatologia Forense'],
 [[109,110],'Comunicação Operacional'],[[111,114],'Uso Diferenciado da Força'],[[115,118],'Legislação Penal Especial'],[[119,120],'Uso Diferenciado da Força'],
]
const conteudo=[
 [[1,6],'Armamento, munições, classificação de armas, funcionamento e acidentes de tiro'],[[7,12],'Lei Maria da Penha, violência doméstica, Estatuto da Pessoa com Deficiência e Estatuto da Pessoa Idosa'],
 [[13,17],'Balística forense — lesões de entrada e saída, classificação de distância, trajetória e raiamento'],[[18,19],'Computação forense — preservação de dispositivos eletrônicos e resposta a incidente'],
 [[20,23],'Crimes contra a administração pública e as finanças públicas; crimes contra a ordem tributária'],
 [[24,25],'Identificação de vítimas em desastres de massa — desastre fechado e métodos primários de identificação'],
 [[26,27],'Genética forense — coleta, acondicionamento e análise de vestígios biológicos'],[[28,31],'Documentoscopia — documentos de segurança, moeda e exame de documento de identidade'],
 [[32,35],'Crimes cibernéticos — URL, endereço IP, phishing, cache e identificação de provedores'],[[36,37],'Prova digital — logs, conteúdo de contas e documentação de evidências eletrônicas'],
 [[38,42],'Gerenciamento de crises policiais — alternativas táticas, perímetros e fases de resposta'],
 [[43,47],'Organização e disciplina da Polícia Civil de Sergipe — conselhos, remoção, lotação e deveres funcionais'],
 [[48,48],'Direitos fundamentais — segurança pública e direitos de brasileiros e estrangeiros residentes'],
 [[49,53],'Identificação veicular — VIN, etiquetas e adulteração de caracteres identificadores'],
 [[54,59],'Inteligência policial — busca, disfarce, vigilância, plano de segurança orgânica e assessoramento'],
 [[60,64],'Direito probatório — meios de prova, inquérito, valoração, perícia e prova ilícita'],
 [[65,70],'Investigação pericial — vestígios, local de crime, relatório, recognição visuográfica e exame pericial'],
 [[71,73],'Inteligência e investigação — recrutamento de informantes, finalidade investigativa e vigilância'],
 [[74,76],'Investigação criminal — meios de prova e de obtenção, elementos informativos e declarações do ofendido'],
 [[77,81],'Lavagem de dinheiro — normas internacionais, ocultação, competência, dolo e afastamento cautelar'],
 [[82,86],'Gestão de conflitos — processos construtivos e destrutivos, informação e cooperação'],
 [[87,89],'Medicina Legal — violência sexual, cadeia de vestígios, exame sexológico e coleta de material biológico'],
 [[90,95],'Criminalística e identificação humana — local de crime, acionamento pericial, antropologia, odontologia e comparação facial'],
 [[96,96],'Direito Penal — lesão corporal grave e art. 129 do Código Penal'],[[97,98],'Identificação criminal — Lei nº 12.037/2009 e perfil genético'],
 [[99,102],'Primeiros socorros — hipoglicemia, convulsões, segurança do local e movimentação da vítima'],
 [[103,108],'Criminologia e psicopatologia forense — transtornos, associação diferencial, delírios, alucinações e percepção'],
 [[109,110],'Radiocomunicação operacional — código Q e clareza de mensagens entre policial e CIOSP'],
 [[111,114],'Tecnologias menos letais — incapacitação, agentes OC/CS, análise de multidões e reversibilidade'],
 [[115,118],'Lei de Drogas — competência, medicamentos sem registro, laudo preliminar e apreensão de objetos'],
 [[119,120],'Uso diferenciado da força — advertência, risco a terceiros e apresentação de arma em abordagem'],
]
const ctx=[
 [[1,6],'Situação: atirador esportivo usa revólver Taurus RT 38 calibre .38 com munição canto vivo e passa a treinar com pistola IMBEL TC MD6 calibre .40; ocorre falha de percussão e ele extrai o cartucho não deflagrado.'],
 [[7,12],'Comando: julgue os itens sobre atendimento policial a grupos vulneráveis, violência doméstica, violência virtual e proteção de pessoas idosas e com deficiência.'],
 [[13,17],'Situação: projétil de 7,62 mm × 51 mm, disparado por fuzil, atravessa a vítima das costas para o peito após trajetória superior a 200 m.'],
 [[18,19],'Situação: em local de crime, delegado encontra celular ligado e desbloqueado e computador desligado; avalie os procedimentos de computação forense.'],
 [[20,23],'Comando: julgue os itens sobre crimes contra a ordem tributária, administração pública e finanças públicas.'],
 [[24,25],'Situação: queda de avião Fokker 100 em Sergipe, com 128 mortos; o texto-base completo sobre localização, recuperação e identificação das vítimas está na página original 2.'],
 [[26,27],'Situação: mulher encontrada morta com indícios de violência sexual, vestes rasgadas, marcas de mordida e substância semelhante a sêmen na região genital.'],
 [[28,31],'Situação: Mário é preso ao usar identidade falsa e cédulas suspeitas; a autoridade solicita exames periciais de documentoscopia.'],
 [[32,35],'Situação: ofício a provedora registra URL legítima https://suaconta.com.br/suaconta.html, URL apresentada https://crazyserver.com.uk/suaconta.html e endereço 191.125.13.1; usuário foi redirecionado a página que solicitava credenciais.'],
 [[36,37],'Comando: julgue os itens sobre investigação de crimes cibernéticos, logs e documentação de conteúdo digital.'],
 [[38,42],'Comando: julgue os itens com base na doutrina de gerenciamento de crises do FBI (Federal Bureau of Investigation).'],
 [[43,47],'Comando: julgue os itens segundo as normas de organização policial e disciplina da Polícia Civil de Sergipe e da ACADEPOL.'],
 [[48,48],'Comando: julgue a afirmação sobre o direito fundamental à segurança pública previsto na Constituição Federal de 1988.'],
 [[49,51],'Comando: julgue os critérios técnicos e legais de identificação veicular e conferência de caracteres e etiquetas.'],
 [[52,53],'Comando: julgue os métodos de adulteração dos caracteres identificadores de veículos automotores.'],
 [[54,59],'Comando: julgue os itens sobre atividade e técnicas de inteligência policial, vigilância e planejamento de segurança orgânica.'],
 [[60,64],'Comando: julgue os itens sobre meios de prova, investigação criminal, inquérito policial, valoração e laudo pericial.'],
 [[65,70],'Comando: julgue os itens sobre investigação em local de crime, vestígios, coleta, relatório pericial e recognição visuográfica.'],
 [[71,73],'Comando: julgue as técnicas de ações de busca utilizadas no contexto de uma investigação policial.'],
 [[74,76],'Comando: julgue os princípios, meios e conceitos da investigação criminal.'],
 [[77,81],'Comando: julgue os itens sobre normas e investigação de crimes de lavagem de dinheiro.'],
 [[82,86],'Base: conflitos intrapessoais, intracoletivos e intercoletivos; motivações, valores e objetivos podem representar ganhos ou perdas. Julgue os processos construtivos e destrutivos segundo Morton Deutsch.'],
 [[87,89],'Situação: Maria, 26 anos, sofreu violência sexual; foi socorrida, tomou banho, recebeu roupas limpas e levou à delegacia as vestes usadas e uma garrafa encontrada no local, ambas dentro de saco plástico.'],
 [[90,91],'Comando: julgue os objetivos da investigação pericial em locais de crime contra a vida e o acionamento do órgão pericial via CIOSP.'],
 [[92,95],'Comando: julgue a aplicação pericial e a identificação de cadáveres, membros em putrefação, pessoa sem identidade informada e comparação facial. No item 92, documentos e sete chaves foram encontrados no bolso de cadáver parcialmente carbonizado.'],
 [[96,96],'Situação: vítima sofreu fratura mandibular alinhada, recuperada após seis semanas de bloqueio intermaxilar; julgue a classificação legal da lesão.'],
 [[97,98],'Situação: José, civilmente identificado, foi submetido a identificação criminal por despacho judicial; julgue a aplicação da Lei nº 12.037/2009.'],
 [[99,102],'Situação: pessoa desmaiou e caiu desorientada ao atravessar a faixa de pedestres; julgue condutas de primeiros socorros.'],
 [[103,108],'Comando: julgue os itens de criminologia e psicopatologia forense.'],
 [[109,110],'Base: comunicação hipotética por rádio entre policial em operação e CIOSP: “QTI, câmbio”; o trecho com a localidade não foi compreendido.'],
 [[111,114],'Comando: julgue os itens sobre técnicas e tecnologias menos letais.'],
 [[115,118],'Comando: julgue os itens sobre tóxicos, entorpecentes e procedimentos de apreensão.'],
 [[119,120],'Comando: julgue os fundamentos técnicos e legais do uso diferenciado da força por profissionais de segurança pública.'],
]
const itens={
 8:'Se uma mulher sofrer violência moral em ambiente virtual, por meio de aplicativo de mensagem, ela deverá juntar aos autos do processo prints das mensagens ofensivas e comparecer ao cartório para lavratura da correspondente ata notarial, relativa às ofensas; em seguida, a equipe de investigadores deverá confeccionar auto de verificação e constatação.',
 16:'O estudo da trajetória do projétil especificado na situação, desde o momento em que saiu do cano da arma até o repouso final, bem como a determinação de parâmetros como velocidade, alcance útil e velocidade inicial, são atribuições da balística terminal.',
 31:'O perito deve observar determinadas características de segurança para verificar a autenticidade de uma carteira de identidade, entre elas: tarja em talho doce na cor verde, fundo numismático, perfuração mecânica da sigla do órgão de identificação sobre a fotografia do titular e numeração tipográfica sequencial no verso para controle do órgão expedidor.',
 74:'Documento público que comprove determinado fato delituoso sob investigação e que seja apreendido no cumprimento de mandado de prisão funcionará como meio de prova, enquanto o mandado de busca será caracterizado como meio de obtenção de fontes materiais de prova.',
 84:'O ambiente social não influencia a resolução cooperativa de conflitos, porque nesse contexto não há características de encorajamento ou de desestímulo para o desenvolvimento destes, em razão das normas sociais e formas institucionais que regulamentam esse ambiente.',
 91:'Nos casos de perícia de local de crime contra pessoa, o acionamento do órgão pericial deverá ser solicitado via central de radiocomunicação da segurança do centro integrado de operações em segurança pública (CIOSP), com posterior envio da requisição formal ao órgão pericial.',
 92:'Situação hipotética: no bolso da vestimenta de um cadáver não identificado e parcialmente carbonizado, foram encontrados documentos e sete chaves — uma delas era de um veículo e as demais eram chaves de portas residenciais. Assertiva: esses objetos são suficientes para que a identificação do cadáver seja confirmada, desde que as chaves abram as fechaduras.',
 96:'Situação hipotética: vítima de lesão corporal dolosa apresentou, como resultado da agressão, somente uma fratura mandibular alinhada, perfeitamente recuperada após seis semanas de bloqueio intermaxilar. Assertiva: segundo o art. 129 do Código Penal, nesse caso ocorreu lesão corporal grave.',
}
const duplicatas=new Map([
 ['extr-e939b74b6dd6b63de7c8','extr-bb9dc2775a155e27fcb4'],['extr-e6981d4a6f890d0e1fca','extr-35f356745865317c7ded'],
 ['extr-e63d12ee6923ce6f1087','extr-6500d83bff215ebc9b22'],['extr-c811dcb1931cb8e306df','extr-529389161384a8c17aa5'],
 ['extr-7db3fe0b50f495b281d8','extr-d04c9b5180a53d37b3ef'],
])
const faixa=(lista,n)=>lista.find(([[a,b]])=>n>=a&&n<=b)?.[1]
if(pendentes.length!==94)throw Error(`A lista viva mudou: esperado 94, obtido ${pendentes.length}`)
const ids=new Set(),decisoes=pendentes.map(q=>{
 const n=Number(q.numero),mat=faixa(materia,n),top=faixa(conteudo,n),apoio=faixa(ctx,n),v=chaves[n-1],anulada=v==='X'
 if(!mat||!top||!apoio||!v)throw Error(`Questão ${n} sem classificação/gabarito`)
 if(ids.has(q.id))throw Error(`ID repetido ${q.id}`);ids.add(q.id)
 if(duplicatas.has(q.id))return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:`Duplicata OCR do item ${n} — não é questão adicional`,ano:2020,numero_original:n,pagina:q.pagina,apta_resolucao:false,inelegibilidade_motivo:`Extração duplicada e corrompida do item ${n}; mantida a versão íntegra ${duplicatas.get(q.id)}.`,duplicada_de:duplicatas.get(q.id),motivo:'Comparação com a página original do caderno oficial PC-SE 2020.'}
 let enun=itens[n]||q.enunciado.trim()
 if([1,2,3,4,5].includes(n)&&q.id===({1:'extr-bb9dc2775a155e27fcb4',2:'extr-35f356745865317c7ded',3:'extr-6500d83bff215ebc9b22',4:'extr-529389161384a8c17aa5',5:'extr-d04c9b5180a53d37b3ef'})[n])enun=enun.replace(/\s+/g,' ').trim()
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:mat,conteudo:top,ano:2020,numero_original:n,pagina:q.pagina,enunciado:enun,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova objetiva do curso de formação de Delegado; não publicada psicometricamente pela banca.',resposta_correta:anulada?null:v==='C'?0:1,anulada,gabarito_oficial:{valor:v,fonte:gabarito,metodo:'Gabarito oficial definitivo PC-SE, caderno 523_PCSE_001_01; X marca item anulado.'},classificacao_fonte:prova,visual:{pagina:q.pagina,imagem:`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:apoio,motivo:`Página ${q.pagina} do caderno oficial PC-SE/Cebraspe, prova objetiva do curso de formação aplicada em 12/02/2020; item ${n} associado à página original.`},motivo:`PC-SE — Delegado de Polícia Substituto, prova objetiva do Curso de Instrução e Preparação Técnico-Profissional, aplicada em 2020. Matéria e conteúdo atribuídos pelo tema da assertiva e do bloco.`}
})
const nome='revisao-pcse-delegado-formacao-2020-v123'
const rel=await aplicarRevisoesIndividuais({nome,base:origem,decisoes})
const raiz=`tmp/revisao-profissional/${nome}/acervo-extraido`;raizesAtuais.unshift(raiz)
const arquivo='scripts/acervo-publico/acervo-atual.mjs';let atual=await fs.readFile(arquivo,'utf8');if(!atual.includes(`raizesAtuais.unshift('${raiz}')`))atual=atual.replace('export async function lerArquivoAtual',`raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`);await fs.writeFile(arquivo,atual)
const reportPath='docs/acervo/revisao-profissional/RELATORIO.md';let report=await fs.readFile(reportPath,'utf8')
report+=`\n\n## Revisão do caderno v123 — PC-SE, Delegado, curso de formação, aplicação 2020\n\n- Revisei ${rel.classificadas} registros ainda pendentes: ${decisoes.filter(x=>x.apta_resolucao!==false).length} itens únicos receberam matéria, conteúdo, ano de aplicação e gabarito; ${decisoes.filter(x=>x.apta_resolucao===false).length} extrações duplicadas/corrompidas dos itens 1–5 foram retiradas da resolução e apontam para os registros íntegros.\n- Classifiquei as áreas conforme a assertiva: armamento e tiro, legislação penal especial, Criminalística, Medicina Legal, informática, Direito Penal e Processual Penal, gestão de crises, legislação estadual, inteligência policial, gestão de conflitos, primeiros socorros, criminologia e comunicação operacional.\n- Corrigi trechos OCR incompletos nos itens 8, 16, 31, 74, 84, 91, 92 e 96; associei os seis visuais originais por página e os textos-base de situações compartilhadas. Vinculei o gabarito oficial definitivo, respeitando os itens anulados 2, 105 e 120. Dificuldade média estimada editorialmente.\n- Validação local: total ${rel.total}, disponíveis ${rel.disponiveis}, pendências elegíveis ${rel.pendentes}; ${rel.lotes_alterados} lotes alterados e facetas recalculadas.\n- Fontes oficiais: [caderno da prova](https://cdn.cebraspe.org.br/concursos/pc_se_18_delegado/arquivos/523_pcse_001_01.pdf), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/PC_SE_18_DELEGADO/arquivos/GAB_DEFINITIVO_523_PCSE_001_01.PDF) e [histórico do concurso CEBRASPE](https://www.cebraspe.org.br/concursos/PC_SE_18_DELEGADO).\n- Estado: v123 integrado localmente; não publicado no Cloudflare. A revisão integral do corpus continua.\n`
await fs.writeFile(reportPath,report);console.log(JSON.stringify({...rel,questoesUnicas:decisoes.filter(x=>x.apta_resolucao!==false).length,duplicatas:decisoes.filter(x=>x.apta_resolucao===false).length,anuladas:decisoes.filter(x=>x.anulada).length}))
