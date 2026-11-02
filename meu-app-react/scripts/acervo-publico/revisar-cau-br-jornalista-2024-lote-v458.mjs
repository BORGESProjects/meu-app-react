import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cau-br-jornalista-2024-lote-v458'
const doc='f3e66b76aff5b7b9'
const prova='https://cdn.cebraspe.org.br/concursos/cau_br_23/arquivos/921_CAU_BR_008_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cau_br_23/arquivos/GAB_DEFINITIVO_921_CAU_BR_008_01.PDF'
const concurso='CAU/BR 2023 — Emprego 8: Jornalista'
const cargo='Jornalista — caderno 921_CAU_BR_008_01'
const blocos=[
 'C E C X E E C E E C C C C E E C E C C C',
 'C C E C E E C C E C C E E E E C E E C E',
 'E E C E C E E E E C E E C E C E E E C C',
 'E C C E E E E C E C'
]
const seq=blocos.flatMap(x=>x.split(' '))
if(seq.length!==70)throw Error(`Gabarito esperado de 70 itens, recebido ${seq.length}`)
const respostas=Object.fromEntries(seq.map((v,i)=>[String(i+51),v]))

const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
const pos=linhas.findIndex(l=>l.startsWith(`{"documento_id":"${doc}"`))
const chave=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const registro={documento_id:doc,arquivo_prova:'921_CAU_BR_008_01.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'GAB_DEFINITIVO_921_CAU_BR_008_01.PDF',tipo:'Gabarito oficial definitivo — Emprego 8: Jornalista',criterio:'Identificador do caderno 921_CAU_BR_008_01; aplicação em 21/01/2024',status:'tabela_lida',sha256:chave,respostas,linhas:4}
if(pos>=0)linhas[pos]=JSON.stringify(registro);else linhas.push(JSON.stringify(registro))
await fs.writeFile(arquivoCatalogo,`${linhas.join('\n')}\n`)

const temas={
 51:['Jornalismo','História do rádio e comunicação de massa no Brasil'],52:['Jornalismo','História do rádio: Revolução Constitucionalista e A hora do Brasil'],53:['Jornalismo','História da televisão brasileira: TV Tupi'],54:['Jornalismo','História da radiodifusão pública: Programa Nacional e A voz do Brasil'],55:['Legislação e Políticas de Comunicação','Radiodifusão: obrigatoriedade de transmissão em cadeia nacional'],56:['Redação Jornalística','Lead: perguntas fundamentais da notícia'],57:['Redação Jornalística','Gêneros jornalísticos: estrutura narrativa e argumentativa'],58:['Redação Jornalística','Notícia e reportagem: diferenças de finalidade e abordagem'],59:['Redação Jornalística','Texto dissertativo: características discursivas'],60:['Redação Jornalística','Editorial, artigo e resenha crítica: texto dissertativo-argumentativo'],61:['Redação Jornalística','Gêneros jornalísticos: estrutura das notas'],62:['Jornalismo','Grande reportagem: apuração, planejamento e produção'],63:['Jornalismo','Fontes de informação: fontes oficiais'],64:['Redação Jornalística','Editorial: publicação, autoria e linha editorial'],65:['Redação Jornalística','Editorial: opinião institucional e opinião do leitor'],66:['Jornalismo Institucional','Ética e compromisso social no jornalismo institucional'],67:['Jornalismo Institucional','Valor-notícia: atualidade e seleção de notícias institucionais'],68:['Jornalismo Institucional','Notícia institucional e construção de imagem organizacional'],69:['Redação Jornalística','Lead: estrutura sintática e proposição informativa'],70:['Assessoria de Imprensa','Comunicação de crise e relacionamento com jornalistas'],71:['Assessoria de Imprensa','Funções estratégicas contemporâneas da assessoria'],72:['Assessoria de Imprensa','Release: título, assunto e critérios de aproveitamento editorial'],73:['Assessoria de Imprensa','Entrevistas exclusivas e relacionamento com veículos'],74:['Assessoria de Imprensa','Pauta institucional e autonomia editorial das redações'],75:['Assessoria de Imprensa','Sala de imprensa digital e materiais de divulgação'],76:['Comunicação Organizacional','Comunicação interna: canais e públicos internos'],77:['Jornalismo Empresarial','Publicações organizacionais: formato, objetivos e públicos'],78:['Metodologia da Pesquisa em Comunicação','Método científico: fundamentos epistemológicos e técnicas de pesquisa'],79:['Jornalismo Empresarial','História das publicações empresariais'],80:['Jornalismo Empresarial','Objetividade e critérios de redação institucional'],81:['Redação Jornalística','Editorial: opinião do veículo de comunicação'],82:['Redação Jornalística','Artigo de opinião e crônica: características dos gêneros'],83:['Redação Jornalística','Reportagem: extensão, apuração e lead'],84:['Redação Jornalística','Nariz de cera: função e posição no texto'],85:['Assessoria de Imprensa','Release: tratamento jornalístico e perguntas básicas'],86:['Jornalismo','Revista e jornal: interpretação, análise e lead'],87:['Jornalismo Digital','Hipertexto, extensão e leitura não linear'],88:['Teorias do Jornalismo','Newsmaking: rotinas e produção de notícias'],89:['Teorias do Jornalismo','Gatekeeping: seleção e filtragem de notícias'],90:['Produção Gráfica','Impressão: sistemas de cor RGB e CMYK'],91:['Produção Gráfica','Serigrafia: processo e suportes de impressão'],92:['Produção Gráfica','Impressão offset: processo e aplicação'],93:['Produção Gráfica','Impressão digital e ausência de matriz física'],94:['Redação Jornalística','Pirâmide invertida: organização do lead e sequência narrativa'],95:['Redação Jornalística','Pirâmide invertida: ritmo e contraponto temporal'],96:['Redação Jornalística','Lead: síntese das informações prioritárias'],97:['Redação Jornalística','Lead e sublead: hierarquia da informação'],98:['Redação Jornalística','Lead: ordem direta e clareza sintática'],99:['Jornalismo','Entrevista: ética e uso de declarações off the record'],100:['Jornalismo','Entrevista: mediação e interpretação jornalística'],101:['Jornalismo Digital','Redes sociais e construção da narrativa jornalística'],102:['Pesquisa em Comunicação','Pesquisa quantitativa e qualitativa: adequação ao problema'],103:['Jornalismo Digital','Redes sociais, conexões e circulação de informação'],104:['Pesquisa em Comunicação','Amostragem por conveniência e validade metodológica'],105:['Teorias do Jornalismo','Gatekeeping no jornalismo digital'],106:['Assessoria de Imprensa','Press kit e distribuição de informações à imprensa'],107:['Comunicação Organizacional','Marketing institucional e integração de áreas'],108:['Assessoria de Imprensa','Entrevista coletiva e gestão de questionamentos'],109:['Comunicação Organizacional','Gamificação e engajamento institucional'],110:['Comunicação Organizacional','Stakeholders e gestão de públicos'],111:['Planejamento de Comunicação','Análise SWOT aplicada ao diagnóstico organizacional'],112:['Comunicação de Crise','Transparência e comunicação em situações críticas'],113:['Comunicação Organizacional','Comunicação dirigida e segmentação de públicos'],114:['Comunicação Organizacional','Adaptação da comunicação a públicos internos e externos'],115:['Comunicação Organizacional','Teoria do caos e planejamento comunicacional'],116:['Planejamento de Comunicação','Storytelling e construção de narrativas institucionais'],117:['Comunicação Organizacional','Teoria da contingência e adaptação estratégica'],118:['Relações Públicas','Métricas e avaliação contínua da comunicação interna'],119:['Comunicação Interna','Fluxo de informação e públicos prioritários'],120:['Comunicação de Crise','Gestão interdepartamental e resposta a crises']
}
const contextos=[
 [51,55,'Em relação aos veículos de comunicação de massa no Brasil, sua implantação, suas fases e sua importância, julgue os itens a seguir.'],
 [56,60,'Considerando as técnicas de redação em jornalismo e os princípios de clareza e estilo relacionados ao discurso jornalístico, julgue os próximos itens.'],
 [61,65,'Com referência aos fundamentos do discurso jornalístico, às técnicas de redação e às características dos diversos tipos de produção no meio impresso, julgue os itens seguintes.'],
 [66,69,'A respeito do jornalismo institucional e de seus produtos, julgue os itens a seguir.'],
 [70,75,'Tendo em vista o contexto contemporâneo de atuação dos profissionais de assessoria de imprensa, julgue os itens que se seguem.'],
 [76,76,'A respeito de estratégias de comunicação interna, julgue o próximo item.'],
 [77,80,'Acerca de publicações jornalísticas empresariais, métodos e técnicas de pesquisa, julgue os itens a seguir.'],
 [81,84,'Julgue os itens a seguir, relativos aos gêneros jornalísticos.'],
 [85,85,'Item sobre release e técnicas de assessoria de imprensa.'],
 [86,87,'Os tipos de mídia diferem entre si por características particulares. Em relação aos meios impresso, televisivo e digital, julgue os itens seguintes.'],
 [88,89,'Julgue os próximos itens, relativos aos critérios de seleção, redação e edição de notícias.'],
 [90,93,'Entre os métodos de impressão estão a serigrafia, a tipografia, a impressão digital e o offset. Acerca dessas técnicas, julgue os itens subsequentes.'],
 [94,98,'Tendo em vista que a pirâmide invertida é estilo usual de elaboração de textos jornalísticos e constitui padrão em meios de comunicação ocidentais, julgue os itens relativos a esse tema.'],
 [99,100,'Julgue os itens que se seguem, relativos à entrevista jornalística.'],
 [101,105,'Acerca das interfaces digitais do jornalismo e das pesquisas de comunicação, julgue os itens a seguir.'],
 [106,110,'No que se refere às práticas e estratégias de assessoria de imprensa e ao marketing institucional, julgue os itens seguintes.'],
 [111,114,'Considerando a complexidade do cenário de comunicação contemporâneo e a importância da interação entre jornalismo, relações públicas e comunicação dirigida, julgue os itens subsequentes.'],
 [115,120,'Com relação ao planejamento de comunicação organizacional, às interfaces entre relações públicas e administração empresarial e aos instrumentos de comunicação interna, julgue os itens seguintes.']
]
const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const canonicas=new Map([[51,'extr-5a7f07bad2054fb145f7'],[53,'extr-d8643dd2f18d727e3cfa'],[55,'extr-19efc1487f136f592548'],[61,'extr-3bd2c9e58cfdd073d0a4'],[65,'extr-1db3e192c4703c4e14da'],[72,'extr-ab0f16b8f5e86737445c'],[75,'extr-e349d5ada67064cfb74d'],[76,'extr-aeff8c81914d5674c41f']])
const exportado=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(exportado.length!==78||new Set(exportado.map(q=>Number(q.numero))).size!==70)throw Error(`Exportação diferente do esperado: ${exportado.length} registros`)
const anulados=new Set([54])
const facil=new Set([51,53,54,56,57,58,60,61,63,64,66,67,70,71,72,73,74,76,77,78,81,86,87,90,91,93,96,97,99,100,101,106,108,110,111,112,113,118,119,120])
const dificil=new Set([52,55,59,62,65,68,69,75,78,82,83,84,88,89,92,94,95,98,102,104,105,107,109,114,115,116,117])
const correcoes={
 'extr-4f5a5d632ea7a7d2432d':'Nos anos 30 do século passado, a programação radiofônica passou por mudanças, evidenciando-se seu potencial comercial a partir de aportes financeiros provenientes de publicidade, e o rádio tornou-se o primeiro meio de comunicação de massa no Brasil, no lugar do jornalismo impresso, devido ao alto índice de analfabetismo da população no início do século XX.',
 'extr-5a7f07bad2054fb145f7':'Nos anos 30 do século passado, a programação radiofônica passou por mudanças, evidenciando-se seu potencial comercial a partir de aportes financeiros provenientes de publicidade, e o rádio tornou-se o primeiro meio de comunicação de massa no Brasil, no lugar do jornalismo impresso, devido ao alto índice de analfabetismo da população no início do século XX.',
 'extr-161522a55e9bca4048cb':'A invasão dos estudantes à Rádio Record durante a Revolução Constitucionalista de 1932 evidenciou o reconhecimento da abrangência e da persuasão do rádio, levando o então presidente Juscelino Kubitschek a criar o programa A Hora do Brasil.',
 'extr-d8643dd2f18d727e3cfa':'O Brasil foi o primeiro país da América Latina a ter uma emissora de televisão, a denominada TV Tupi, criada por Assis Chateaubriand, em 1950.',
 'extr-1942d12095fbbdbb1d62':'Os editoriais, nos grandes veículos de comunicação, geralmente são publicados e assinados nas últimas páginas.',
 'extr-7050acedac01a8df75a3':'O editorial é um texto opinativo que apresenta, explicitamente, a opinião do leitor sobre fatos e assuntos da atualidade abordados no jornal da comunidade.',
 'extr-13b84da86be2815ea5b7':'Na estrutura clássica de uma notícia impressa, o lead pode ser considerado uma proposição completa no sentido aristotélico, ao apresentar um sintagma nominal, um sintagma verbal e sintagmas circunstanciais.',
 'extr-92fda00e0573c686b346':'Em situações de crise institucional, é importante que a assessoria de imprensa atenda às demandas dos jornalistas e se prepare para fornecer informações completas, com dados e números atualizados sobre o ocorrido, a fim de esclarecer os fatos e informar as providências adotadas pela organização.',
 'extr-aeff8c81914d5674c41f':'Entre as ações mais importantes de comunicação interna, destacam-se a criação de canais de comunicação dirigidos a clientes, como e-mail marketing, e postagens em perfis de redes sociais.',
 'extr-78e105a68cad6b8e':'A operação denominada álgebra de mapas permite corrigir erros de armazenamento de dados, como duplicidade de linhas, polígonos sem fechamento e sobreposição de bordas de dois polígonos adjacentes. Justificativa: correção topológica é a operação que permite corrigir erros de armazenamento de dados.'
}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const gabHash=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const manter=new Map()
for(const q of exportado){const n=Number(q.numero);if(!manter.has(n)||q.id===canonicas.get(n))manter.set(n,q.id)}
const decisoes=exportado.map(q=>{
 const n=Number(q.numero),tema=temas[n],g=respostas[String(n)],canonica=manter.get(n)===q.id
 if(!tema||!g)throw Error(`Sem classificação/gabarito do item ${n}`)
 const anulada=anulados.has(n)
 const enunciado=(correcoes[q.id]||q.enunciado).split(/\n(?=CEBRASPE\s*[–—-]|Considerando as técnicas|Com referência aos fundamentos|A respeito do jornalismo|Tendo em vista o contexto|A respeito de estratégias|Acerca de publicações|Julgue os itens|Os tipos de mídia|Entre os métodos|Tendo em vista que|Acerca das interfaces|No que se refere às práticas|Considerando a complexidade|Com relação ao planejamento)/)[0].replace(/\s+/g,' ').trim()
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2024,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 21/01/2024; edital publicado em 2023',numero_original:n,numero:n,pagina:Number(q.pagina||q.contexto?.[0]?.pagina||1),dificuldade:dificil.has(n)?'Difícil':facil.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade de conceitos, teorias e práticas jornalísticas; não é índice psicométrico.',classificacao_fonte:prova,motivo:`Item ${n} classificado conforme o conteúdo específico do caderno oficial do Emprego 8 — Jornalista.`,enunciado,texto_apoio:contexto(n),imagem_pagina:q.imagem||`paginas/${doc}-${String(q.pagina||1).padStart(4,'0')}.webp`,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',remover_pendencias:pendencias,apta_resolucao:true,resposta_correta:anulada?null:g==='C'?0:1,anulada,gabarito_oficial:{valor:g,fonte:gabarito,fontes:[gabarito],arquivo:'GAB_DEFINITIVO_921_CAU_BR_008_01.PDF',prova,sha256:gabHash,sha256_tipo:'transcricao_canonica_da_tabela_oficial; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito definitivo oficial do Emprego 8 — Jornalista, itens 51 a 120.',numero:n,resposta:g,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Gabarito definitivo oficial CEBRASPE.'}}
 if(!canonica){d.apta_resolucao=false;d.inelegibilidade_motivo='Duplicata OCR do mesmo item e caderno; foi mantida a cópia mais íntegra.';d.duplicada_de=manter.get(n)}
 return d
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,edital:2023,aplicacao:'21/01/2024',registros_brutos:78,itens_unicos:70,questoes_elegiveis:70,itens_anulados:[...anulados],duplicatas:8,paginas_origem_conferidas:[1,2,3],imagens_ou_graficos_especiais:0,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
