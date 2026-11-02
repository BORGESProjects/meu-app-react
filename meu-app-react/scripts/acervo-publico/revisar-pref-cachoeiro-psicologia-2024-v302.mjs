import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pref-cachoeiro-psicologia-2024-v302',doc='524a1b7266fae0ad'
const prova='https://cdn.cebraspe.org.br/concursos/PREF_CACHOEIRO_24/arquivos/936_PCI_SAUDE_PROFESSOR_021_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/PREF_CACHOEIRO_24/arquivos/GAB_DEFINITIVO_936_PCI_SAUDE_PROFESSOR_021_01.PDF'
const base=raizesAtuais.find(x=>x.includes('revisao-fnde-2024-arquitetura-v301'))
if(!base)throw Error('Base local v301 não encontrada')
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='936_PCI_SAUDE_PROFESSOR_021_01.PDF'||catalog.questoes.length!==40)throw Error('Caderno Cachoeiro — Cargo 21 divergente')
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==39)throw Error(`Esperados 39 registros pendentes atuais, recebidos ${records.length}`)
const key=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).trim().split(/\r?\n/).map(JSON.parse).find(x=>x.documento_id===doc)
if(!key||key.status!=='tabela_lida'||!key.sha256||key.prova_url!==prova||key.gabarito_url!==gabarito)throw Error('Gabarito oficial não validado para este caderno')

const topics={
61:['Psicologia','Avaliação psicológica: psicodiagnóstico e formulação de hipóteses'],62:['Psicologia','Avaliação psicológica: entrevista e modalidades de entrevista'],63:['Psicologia','Abordagens humanistas: terapia centrada na pessoa de Carl Rogers'],64:['Psicologia','Terapia cognitivo-comportamental: origem e desenvolvimento'],65:['Psicologia','Psicanálise: inconsciente e realidade psíquica'],66:['Psicologia','Psicopatologia: critérios diagnósticos do transtorno do espectro autista'],67:['Psicologia','Psicopatologia: transtorno da personalidade narcisista'],
68:['Psicologia da Saúde','Atenção Primária à Saúde: atuação do psicólogo e cuidado compartilhado'],69:['Psicologia da Saúde','Apoio matricial: trabalho interdisciplinar e cuidado em saúde'],70:['Psicologia da Saúde','Apoio matricial: composição multiprofissional das equipes'],71:['Psicologia da Saúde','Atenção psicossocial a pessoas com necessidades decorrentes do uso de álcool e outras drogas'],72:['Psicologia da Saúde','Clínica ampliada, projeto terapêutico singular e humanização'],73:['Psicologia da Saúde','Acolhimento e escuta no apoio matricial'],74:['Psicologia da Saúde','Intervenção breve: prevenção e cuidado relacionado ao álcool'],
75:['Psicologia Organizacional','Cultura organizacional: comunicação, socialização e integração de trabalhadores'],77:['Psicologia Organizacional','Treinamento e desenvolvimento: aprendizagem e desenvolvimento profissional'],78:['Psicologia Organizacional','Aprendizagem organizacional e processos de treinamento'],79:['Psicologia Organizacional','Diagnóstico de necessidades de treinamento'],
80:['Direito da Criança e do Adolescente','Estatuto da Criança e do Adolescente: adoção e nome do adotado'],81:['Direito da Criança e do Adolescente','Estatuto da Criança e do Adolescente: consentimento para adoção'],82:['Direito da Criança e do Adolescente','Escuta especializada e proteção de criança vítima ou testemunha de violência'],83:['Mediação e Conciliação','Impedimento de mediador após audiência'],84:['Direito da Pessoa Idosa','Notificação de violência contra pessoa idosa'],85:['Direito da Criança e do Adolescente','Alienação parental: definição legal'],86:['Direito da Pessoa Idosa','Notificação compulsória de violência pelos serviços de saúde'],
87:['Psicologia da Educação','Motivação: necessidades, barreiras e frustração'],88:['Psicologia da Educação','Jerome Bruner: aprendizagem por descoberta'],89:['Psicologia da Educação','Edgar Morin: pensamento complexo e aprendizagem'],90:['Psicologia da Educação','Jean Piaget: epistemologia genética e adaptação'],91:['Psicologia da Educação','Lev Vygotsky: zona de desenvolvimento proximal'],92:['Psicologia','Psicanálise e dificuldades de aprendizagem: sintoma e resposta da criança'],93:['Psicologia','Psicanálise: sintoma da criança e dinâmica familiar'],94:['Psicologia Escolar','Dificuldades de aprendizagem, avaliação e inclusão escolar'],95:['Educação Especial','Atendimento educacional especializado: atribuições docentes'],96:['Educação Especial','Direito à educação e ao atendimento educacional especializado'],97:['Educação Especial','Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva'],
98:['Ética Profissional em Psicologia','Sigilo profissional e divulgação de informações sobre pessoas atendidas'],99:['Pedagogia','Projetos pedagógicos e organização curricular por temas'],100:['Políticas Públicas de Educação','Política Nacional de Atenção Psicossocial nas Comunidades Escolares: responsabilidades federativas']
}
const pageFor=n=>n<=79?1:n<=97?2:3
const hard=new Set([61,63,64,65,66,67,69,72,79,82,83,85,89,90,91,92,93,97,98,100])
const easy=new Set([62,70,73,74,77,80,81,84,86,88,96,99])
const clean={
 'extr-a3e6355e3cf7f09e5462':'Freud, ao desenvolver a teoria psicanalítica, concluiu que o inconsciente funciona de forma tal que possibilita tornar verdade a ficção investida de afeto; dessa maneira, ele transformou o que poderia ser um impasse em uma abertura para o campo da psicanálise.',
 'extr-ea588c0dc0e37ca180d6':'A pessoa com transtorno da personalidade narcisista apresenta um padrão de grandiosidade, necessidade de admiração e falta de empatia.',
 'extr-65ff8b59d7e121349351':'A intervenção breve não é uma estratégia recomendada para tratamento e prevenção secundária da dependência do álcool.',
 'extr-37a862112876831abdf5':'Os autores da literatura pertinente indicam o uso mais recorrente de dois termos relacionados aos métodos de diagnóstico de necessidades de treinamento: levantamento de necessidades de treinamento e análise de necessidades de treinamento.',
 'extr-dabef8db7fcf4b260a45':'A adoção só poderá ocorrer sob o consentimento do adotando.',
 'extr-50f7627d997632caec46':'Os casos de suspeita ou confirmação de violência praticada contra idosos terão de ser objeto de notificação compulsória pelos serviços de saúde públicos e facultativa pelos serviços de saúde privados.',
 'extr-e767b966445c4648e254':'Bruner é defensor da proposta de que o aluno seja desafiado, para que deseje saber, e crê que uma forma de criar esse interesse é dar ao aluno a possibilidade de descobrir.',
 'extr-72fda6ab2f7dbc847501':'A partir da concepção de que a relação entre aprendizagem e desenvolvimento é indissociável, Vygotsky construiu o conceito de zona de desenvolvimento proximal, entendida como a distância entre o nível de desenvolvimento real, que se costuma determinar a partir da solução independente de problemas pela criança, e o nível de desenvolvimento potencial, determinado pela solução de problemas sob a orientação de um adulto ou em colaboração com companheiros.',
 'extr-eb7fa67ed835f4b5bcc1':'Segundo Lacan, as manifestações sintomáticas na criança podem apresentar-se de duas formas: uma ocorre quando o sintoma representa na criança a verdade do casal familiar; outra condição de manifestação ocorre quando o sintoma que vem a prevalecer decorre da subjetividade da mãe; o sintoma, como resposta dessa relação, impõe ao sujeito, no processo analítico, a necessidade de modificá-lo.',
 'extr-1f303a8465644962277a':'A Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva tem como objetivo um conjunto de medidas planejadas e implementadas com vistas a orientar as práticas necessárias para desenvolver, facilitar o desenvolvimento, supervisionar a efetividade e reorientar, sempre que necessário, as estratégias, os procedimentos, as ações, os recursos e os serviços que promovem a inclusão social, intelectual, profissional, política e os demais aspectos da vida humana, da cidadania e da cultura.',
 'extr-c99952399785d76cd59c':'Devido ao dever de sigilo profissional, ao psicólogo é vedada a publicação, em suas redes sociais e por qualquer outra forma de publicidade, dos diagnósticos psicológicos, das análises de caso, dos aconselhamentos ou das orientações psicológicas que identifiquem a pessoa atendida.',
 'extr-256b87b4766bce0900e4':'O fomento e a promoção de ações para a execução dos objetivos e das diretrizes da citada lei caberão às secretarias de Estado de educação das unidades da Federação.'
}
const contexts={
 61:'Acerca de instrumentos de avaliação psicológica e técnicas de entrevista, julgue os itens seguintes.',
 63:'Julgue os próximos itens acerca de abordagens teóricas de psicologia.',
 66:'O Manual Diagnóstico e Estatístico de Transtornos Mentais (DSM — Diagnostic and Statistical Manual of Mental Disorders) foi criado para padronizar os critérios diagnósticos das desordens que afetam a mente e as emoções. À luz da quinta edição do documento (DSM-5), julgue os itens subsequentes a respeito de psicopatologias.',
 68:'No que se refere à psicologia da saúde, à atuação do psicólogo na equipe de cuidados básicos à saúde e à intervenção psicológica em problemas específicos, julgue os itens seguintes.',
 75:'Julgue os itens seguintes acerca de cultura organizacional e seus desdobramentos.',
 77:'Acerca de treinamento e desenvolvimento e seus desdobramentos, julgue os itens seguintes.',
 80:'Com base no Estatuto da Criança e do Adolescente, julgue os próximos itens relativos à adoção de adolescente com 13 anos de idade.',
 82:'Situação hipotética: Márcia, de dez anos, relatou à mãe que o padrasto a espionava durante o banho, expunha as partes íntimas e tentou tocá-la, além de ameaçar a mãe. A mãe buscou ajuda imediatamente. Acerca dessa situação, julgue o item.',
 83:'Julgue os itens relativos à alienação parental, à violência contra a pessoa idosa e à mediação entre particulares como meio de solução de controvérsias e autocomposição de conflitos.',
 87:'Tendo em vista que motivar o aluno é um dos desafios do trabalho educacional, julgue os itens seguintes.',
 89:'Julgue os itens seguintes relativos a teorias da aprendizagem.',
 92:'Segundo a psicanálise, a dificuldade de aprendizagem de uma criança ou adolescente pode ser um sintoma no campo educacional. Acerca desse tema, julgue os itens seguintes.',
 94:'Julgue o item seguinte, considerando a atuação do psicólogo escolar na identificação das causas de evasão e repetência na educação básica.',
 95:'Julgue os itens subsequentes relativos a aspectos pertinentes às necessidades especiais na aprendizagem.',
 98:'Com base na Lei nº 14.819/2024, que institui a Política Nacional de Atenção Psicossocial nas Comunidades Escolares, e considerando dificuldades, problemas e potencialidades no cotidiano escolar e o Código de Ética Profissional do Psicólogo, julgue os itens seguintes.'
}
const contextFor=n=>Object.entries(contexts).filter(([start])=>n>=Number(start)).at(-1)?.[1]||''
const decisions=[]
for(const q of records){
 const n=Number(q.numero),topic=topics[n],answer=key.respostas[String(n)]
 if(!topic||!answer)throw Error(`Falta classificação ou gabarito oficial para item ${n}`)
 const page=pageFor(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,decision={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2024,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Prefeitura de Cachoeiro de Itapemirim — Saúde e Magistério 2024',aplicacao:'Prefeitura de Cachoeiro de Itapemirim — Profissional da Saúde — Psicólogo (Cargo 21)',cargo:'Psicólogo — Cargo 21',numero:n,numero_original:n,pagina:page,classificacao_fonte:prova,motivo:`Item ${n} identificado no caderno oficial do Cargo 21; tema delimitado pelo conteúdo do enunciado e bloco de comando.`,resposta_correta:answer==='C'?0:1,anulada:answer==='X',gabarito_oficial:{fonte:gabarito,arquivo:key.arquivo_gabarito,prova:key.arquivo_prova,sha256:key.sha256,numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo CEBRASPE para o Cargo 21; tabela conferida contra o identificador exato do caderno.'},dificuldade:hard.has(n)?'Difícil':easy.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na profundidade conceitual, integração de teorias e aplicação normativa; não publicada pela banca.',apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],visual:{pagina:page,imagem:image,motivo:'Página original conferida visualmente; preserva o contexto impresso e a redação integral.'}}
 const stem=clean[q.id];if(stem)decision.visual.enunciado=stem
 const context=contextFor(n);if(context)decision.visual.texto_apoio=context
 if(answer==='X'){decision.resposta_correta=null;decision.apta_resolucao=false;decision.inelegibilidade_motivo='Item anulado no gabarito definitivo oficial.';decision.motivo=decision.inelegibilidade_motivo}
 decisions.push(decision)
}
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,cargo:'Psicólogo — Cargo 21',ano_aplicacao:'2024-03-24',registros_revistos:records.length,questoes_unicas:records.length,itens_com_contexto_preservado:Object.keys(contexts).length,paginas_visuais_conferidas:[1,2,3],prova_oficial:prova,gabarito_oficial:gabarito,gabarito_sha256:key.sha256,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
const section=`\n\n## Revisão Prefeitura de Cachoeiro 2024 — Psicólogo, Cargo 21 — v302\n\n- Reexportei da raiz ativa e revisei ${records.length} pendências atuais do caderno oficial. Classifiquei individualmente por banca, concurso, cargo, matéria e conteúdo, incluí gabarito definitivo validado por hash e registrei dificuldade estimada.\n- Corrigi enunciados que haviam incorporado cabeçalhos e comandos do item seguinte; preservei os textos-base dos blocos e associei a página original a cada questão. Conferi visualmente as páginas 1–3.\n- Resultado local: ${out.total} questões, ${out.disponiveis} disponíveis e ${out.pendentes} pendentes. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno](${prova}); [gabarito definitivo](${gabarito}); [edital e cronograma](${ 'https://cdn.cebraspe.org.br/concursos/PREF_CACHOEIRO_24/arquivos/ED_1_PREF_CACHOEIRO_DE_ITAPEMIRIM_SAUDE_MAGISTERIO_ABERTURA_ATUALIZADO_RET_9.PDF' }).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
