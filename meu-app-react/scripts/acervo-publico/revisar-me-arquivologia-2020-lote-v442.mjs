import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-me-arquivologia-2020-lote-v442'
const doc='b6cd5052b1f140cd'
const prova='https://cdn.cebraspe.org.br/concursos/ME_20_PSS_2/arquivos/MATRIZ_555_ME_001.PDF'
const gabaritoGeral='https://cdn.cebraspe.org.br/concursos/me_20_pss_2/arquivos/GAB_DEFINITIVO_MATRIZ_555_ME_CG1_00_PAG_4.PDF'
const gabaritoEspecifico='https://cdn.cebraspe.org.br/concursos/me_20_pss_2/arquivos/GAB_DEFINITIVO_MATRIZ_555_ME_001_00_PAG_3.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/me_20_pss_2/arquivos/ME_20_PSS_2JUSTIFICATIVAS_DE_ALTERAO_DE_GABARITO.PDF'
const concurso='Ministério da Economia — Processo Seletivo Simplificado — Perfil Profissional 1: Arquivologia (2020)'
const cargo='Profissional de nível superior — Perfil profissional 1: Arquivologia'
const geral='C E C E C C E C C E C E C E E E E C C E E C E C X E C C E E C C E E C E C C C E C E E C C C E C C E'.split(' ')
const especifico=[
 'C X C E C E C E C E C C C E E E E C C C',
 'E C E E C C E C E C E C E C C E C E E C',
 'E C E E E E C C E C E E C C E E E C C E',
 'E C E C E C C C E C'
].flatMap(x=>x.split(' '))
if(geral.length!==50||especifico.length!==70)throw Error(`Gabaritos com contagem inválida: ${geral.length}+${especifico.length}`)
const anuladas=new Set([25,52])
const areas=new Map()
const add=(nums,materia,conteudo,dificuldade='Média')=>{for(const n of nums)areas.set(n,{materia,conteudo,dificuldade})}
add([1,2],'Português','Interpretação de texto: cidadania, bens públicos e cidade inteligente','Fácil')
add([5,6,9,10,13,14,19,20,24,25],'Português','Interpretação textual, coesão, semântica, sintaxe e pontuação')
add([26,29],'Ética no Serviço Público','Conceitos de ética, moral e deveres da função pública','Média')
add([27,28],'Direito Constitucional','Princípios da administração pública, democracia e participação cidadã','Média')
add([30,31,32,33],'Direito Administrativo','Improbidade administrativa: atos, agentes, sanções e dano ao erário','Média')
add([34,35,36],'Direito Administrativo','Lei Anticorrupção (Lei nº 12.846/2013): responsabilidade e acordo de leniência','Média')
add([37,38],'Direito Administrativo','Lei de Acesso à Informação (Lei nº 12.527/2011): transparência e acesso parcial','Média')
add([39,40],'Ética no Serviço Público','Código de Ética Profissional do Servidor Público Federal (Decreto nº 1.171/1994)','Média')
add([44],'Informática','Navegadores e complementos (plugins)','Fácil')
add([46,47],'Segurança da Informação','Malware, roubo de identidade e verificação de informação na internet','Média')
add([49,50],'Informática','Cópias de segurança: backup completo e diferencial','Média')
add([53,54],'Arquivologia','Princípios arquivísticos: ordem original e pertinência','Média')
add([56],'Arquivologia','Legislação arquivística: arquivos públicos municipais','Média')
add([57,58],'Arquivologia','Políticas públicas e legislação de arquivos; arquivos públicos e privados','Média')
add([60,61],'Arquivologia','Normas de descrição arquivística: CODEARQ e ISDIAH','Média')
add([63,65],'Arquivologia','Sistemas e redes de arquivos: SIGA, Arquivo Nacional e CONARQ','Média')
add([66],'Arquivologia','Gestão de documentos: classificação e temporalidade no Poder Executivo Federal','Média')
add([69,70,71],'Arquivologia','Diagnóstico da situação arquivística e realidade arquivística brasileira','Média')
add([72,73,74,75],'Arquivologia','Protocolo: autuação, NUP, recebimento e expedição de documentos','Média')
add([76,77,79],'Arquivologia','Classificação de documentos: métodos, planos e macroavaliação','Média')
add([80],'Arquivologia','Avaliação documental: teoria dos valores e avaliação funcional','Média')
add([82,83,84],'Arquivologia','Descrição arquivística, normas de descrição e relação com a classificação','Média')
add([85,86,87,88],'Arquivologia','Funções arquivísticas: criação, aquisição, difusão e preservação','Média')
add([89,90,91,92,93],'Arquivologia','Análise tipológica: diplomática, proveniência, tipos documentais e contexto de criação','Média')
add([95,99,100],'Arquivologia','SIGAD, políticas de acesso e microfilmagem de documentos','Média')
add([102,103,104,105,106,107,108,109,110,111],'Direito Administrativo','Lei nº 13.681/2018 e Decreto nº 9.324/2018: transposição e quadro em extinção dos ex-territórios','Difícil')
add([112],'Direito Constitucional','Emendas Constitucionais nº 60/2009, nº 79/2014 e nº 98/2017: servidores dos ex-territórios','Difícil')
add([113,114,115,116,117,118,119,120],'Direito Administrativo','CEEXT: organização, competência, quórum, decisões e procedimentos sobre os ex-territórios','Difícil')
const correcoes={
  1:'O economista Albert O. Hirschman contribuiu para a definição de cidadão como consumidor de serviços, cujas necessidades devem ser atendidas pelas organizações, tanto governamentais quanto empresariais.',
  2:'Para o autor do texto, os bens públicos são bens de consumo e seu acesso deve ser controlado pelo preço, regulado por oferta e demanda.',
  5:'O emprego do sinal indicativo de crase em “à possibilidade” (último período do texto) é exigido pela palavra “subscrita”, subentendida logo após o “não”, e pela presença do artigo definido “a”.',
  6:'Uma estrutura de centro e periferia surge, com frequência, por razões e fatores bem diversos, conforme o texto.',
  9:'No trecho “Em torno de uma grande cidade (de uma megalópole)”, os parênteses foram empregados para isolar um trecho de caráter explicativo.',
  10:'De acordo com as ideias do texto, as distâncias a serem percorridas entre as periferias são menores que as distâncias a serem percorridas entre as periferias e os centros.',
  13:'No trecho “E já estava devidamente grandezinho, pois devia contar uns trinta anos”, há um efeito surpresa decorrente da explicação oferecida pelo autor ao que ele considera “devidamente grandezinho”.',
  14:'No texto, a letra maiúscula é empregada em todos os substantivos que nomeiam aquilo que o autor personificava, seja quando criança, seja já adulto, para indicar tratar-se de nome próprio.',
  19:'O texto contrapõe duas formas distintas de entender o uso da língua portuguesa: a do “amigo oculto”, que preza pelas regras de gramática e de grafia, e a do autor, que preza pelas formas da linguagem popular.',
  20:'Em “Acontece que eu, acostumado a conversar com a gente das Minas Gerais, falei em ‘varreção’ — do verbo ‘varrer’”, o sujeito da oração iniciada com “Acontece” é indeterminado.',
  24:'Considerando-se os sentidos do texto, é correto afirmar que, nos dois últimos períodos, o autor faz uma reflexão sobre a dicotomia forma e conteúdo, a partir da opinião de seu amigo sobre seu texto.',
  25:'A supressão da forma pronominal “me”, em “E se eles rirem de mim não vai me adiantar mostrar-lhes o xerox da página do dicionário”, manteria o sentido original do texto.',
  39:'Servidor público federal em férias publicou mensagem em suas redes sociais sobre o comportamento de outro colega de trabalho, de forma ofensiva e antipática. Nessa situação hipotética, embora a mensagem não tenha partido do local de trabalho e tenha sido feita fora do horário de serviço, a conduta do servidor fere o código de ética profissional.',
  40:'Raul é visto habitualmente embriagado fora de seu horário de expediente, sendo, inclusive, conhecido pelas pessoas mais próximas como “pé inchado”; porém, cumpre suas atividades com zelo durante o horário de trabalho, não se atrasa e tampouco falta ao serviço. Nesse caso, a conduta de Raul não fere a ética do serviço público.',
  50:'No backup diferencial, é realizada apenas a cópia dos arquivos alterados e que estiverem diferentes em relação ao último backup.',
  58:'Não são considerados arquivos públicos os conjuntos de documentos produzidos e recebidos por organizações sociais reconhecidas pelo Poder Executivo.',
  61:'A adoção da Norma Internacional para Descrição de Instituições com Acervo Arquivístico (ISDIAH) possibilita a produção de estatísticas de instituições com acervo arquivístico, nos níveis regional, nacional ou internacional.',
  75:'É obrigatória a autuação do documento avulso para a formação de processo se o assunto tratado requerer análises ou pareceres.',
  84:'A descrição de documentos de arquivo depende da classificação, que auxilia na manutenção do contexto de criação dos documentos.',
  89:'A análise tipológica pode ser feita a partir da análise diplomática e da análise de proveniência.',
  93:'Abaixo-assinado, carta precatória, cédula de identidade e diretriz orçamentária são exemplos de tipos documentais.',
  100:'A microfilmagem de série de documentos deve ser precedida por uma folha de abertura.',
  102:'Carla foi contratada pelo estado de Rondônia em 3/3/1986 para o cargo de professora. Em 1988, fez concurso e passou a ser estatutária. Em 2000, pediu exoneração e mudou-se para o Paraná, onde até hoje exerce o cargo de professora estadual. Nessa situação, Carla possui requisitos para optar pela transposição assegurada na Lei nº 13.681/2018.',
  106:'Leda, servidora pública efetiva do Ministério Público do Estado de Roraima, encontrava-se no exercício regular de suas funções, prestando serviço a esse ex-território federal na data em que ele foi transformado em estado. Nessa situação, Leda poderá optar pela sua inclusão nos quadros em extinção da União.',
  107:'A lei prevê o ingresso, nos quadros em extinção da União, de pessoas que comprovem que tiveram vínculo empregatício ou de trabalho, ainda que precário, com o governo dos estados e respectivos municípios dos ex-territórios federais de Roraima, Amapá e Rondônia, no período estabelecido na lei, mesmo que tais pessoas não tenham mais vínculo com nenhum desses estados ou seus municípios.',
  109:'Empregado do estado de Rondônia admitido em quadro da União e enquadrado em cargo e função equivalentes àqueles que ocupava na estrutura estadual, com remuneração e plano de cargos e competências para o referido cargo, deve ser submetido ao regime jurídico disciplinado pela Consolidação das Leis do Trabalho.',
  111:'O direito de opção pela inclusão nos quadros em extinção da União, nos termos do citado decreto, é ato personalíssimo; logo, só pode ser exercido pelo próprio interessado.',
  112:'A Emenda Constitucional nº 60/2009, que regulamenta direitos dos servidores e empregados do estado de Rondônia, não permite que aposentados e pensionistas sejam optantes da transposição; no entanto, com a publicação da Emenda Constitucional nº 79/2014, dispôs-se que os proventos de aposentadorias, pensões, reformas e reservas remuneradas passam a ser mantidos pela União.',
  113:'A estrutura da CEEXT constitui-se de duas câmaras de julgamento e uma recursal para cada ex-território, cada qual composta por quatro membros, todas instaladas na estrutura do Ministério da Economia.',
  114:'As câmaras de julgamento da CEEXT não possuem discricionariedade em sua competência para analisar requerimentos de opção e documentação apresentados por servidores e empregados dos ex-territórios, porém podem agir de ofício, por exemplo, no reexame de requerimentos indeferidos até a data de publicação do Decreto nº 9.823/2019, cujos fundamentos tenham sido alterados.',
  115:'O presidente-geral da CEEXT e seu substituto são escolhidos e designados pelo secretário especial de desburocratização, gestão e governo digital do Ministério da Economia, enquanto os presidentes de cada câmara da CEEXT e seus substitutos são escolhidos por eleição entre seus pares.',
  116:'Servidor público federal em exercício no Distrito Federal que seja escolhido e designado como membro da CEEXT se dedicará integralmente às atividades dessa comissão enquanto a integrar, sendo sua participação considerada prestação de serviço público relevante, não remunerada.',
  117:'Em caso de impedimento ou afastamento de membros de uma das câmaras de julgamento da CEEXT em número que impeça a formação do quórum mínimo para a sessão, o presidente da CEEXT poderá designar, alternadamente, um dos membros de outra câmara de julgamento para compor o quórum mínimo.',
  118:'Cada câmara de julgamento da CEEXT é responsável por analisar e decidir sobre requerimentos relacionados a cada um dos ex-territórios de Rondônia, de Roraima e do Amapá.',
  119:'As decisões das câmaras de julgamento da CEEXT terão caráter terminativo, esgotando definitivamente a análise dos requerimentos de opção no âmbito da comissão.',
  120:'Cabe ao presidente da CEEXT convocar as reuniões das câmaras de julgamento e providenciar as notificações, aos requerentes, das decisões das câmaras de julgamento.'
}
const pageFor=n=>n<=5?2:n<=18?3:n<=33?4:n<=50?5:n<=75?6:n<=105?7:8
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==79)throw Error(`Esperadas 79 questões pendentes; recebido ${exportado.length}`)
const shaGeral=hashRevisao(geral.map((x,i)=>`${i+1}:${x}`).join('\n'))
const shaEspecifico=hashRevisao(especifico.map((x,i)=>`${i+51}:${x}`).join('\n'))
const decisions=exportado.map(q=>{
 const n=q.numero,meta=areas.get(n)
 if(!meta)throw Error(`Questão sem matéria/conteúdo: ${n}`)
 const ans=n<=50?geral[n-1]:especifico[n-51],anulada=anuladas.has(n)
 const fonteGabarito=n<=50?gabaritoGeral:gabaritoEspecifico
 const sha=n<=50?shaGeral:shaEspecifico
 const stem=correcoes[n]||q.enunciado.replace(/\s*(?:Espaço livre|CEBRASPE\s*[–-]\s*ME\s*[–-]\s*Edital:\s*2020|--\s*CONHECIMENTOS ESPECÍFICOS\s*--|Acerca das funções arquivísticas[\s\S]*|Considerando o Decreto nº?\s*10\.020\/2019[\s\S]*)$/i,'').replace(/\s+/g,' ').trim()
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,opcoes:['Certo','Errado'],materia:meta.materia,conteudo:meta.conteudo,ano:2020,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva do perfil profissional 1, aplicada em 2020',numero_original:n,numero:n,pagina:q.pagina,dificuldade:meta.dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica pelo tipo de interpretação, raciocínio normativo ou conhecimento técnico exigido; não é índice psicométrico publicado pela banca.',classificacao_fonte:prova,motivo:`Classificação individual pelo comando, tema e seção visíveis no caderno oficial; perfil profissional de Arquivologia, item ${n}.`,imagem_pagina:`paginas/${doc}-${String(pageFor(n)).padStart(4,'0')}.webp`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],resposta_correta:anulada?null:ans==='C'?0:1,anulada,gabarito_oficial:{valor:ans,fonte:fonteGabarito,fontes:[fonteGabarito,justificativas],arquivo:'Gabarito oficial definitivo CEBRASPE — conhecimentos gerais ou perfil profissional 1: Arquivologia; conferido com justificativas oficiais',prova:'Caderno objetivo do processo seletivo do Ministério da Economia — perfil profissional 1',sha256:sha,sha256_tipo:'transcricao_canonica_do_gabarito_definitivo; nao_e_hash_dos_pdfs',metodo:`Transcrição da tabela oficial de gabarito definitivo (${n<=50?'conhecimentos gerais, itens 1 a 50':'perfil de Arquivologia, itens 51 a 120'}), conferida com as justificativas oficiais de alterações e anulações.`,numero:n,resposta:anulada?'Anulado':ans,criterio:anulada?'Item anulado no gabarito definitivo oficial; sem correção automática.':'Gabarito definitivo oficial CEBRASPE.'}}
})
if(decisions.filter(d=>d.anulada).map(d=>d.numero).join(',')!=='25')throw Error('A anulação pendente do item 25 não confere com o gabarito oficial')
if(decisions.some(d=>!d.enunciado||d.enunciado.length>1500))throw Error('Enunciado vazio ou longo demais após limpeza')
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({nome,documento_id:doc,fonte:prova,gabaritos:[gabaritoGeral,gabaritoEspecifico],justificativas,questoes_revisadas:decisions.length,questoes_anuladas:[25],questoes_com_imagem_pagina_corrigida:decisions.length,resultado:result},null,2))
console.log(JSON.stringify({nome,questoes:decisions.length,anuladas:[25],materias:[...new Set(decisions.map(x=>x.materia))],resultado:result},null,2))
