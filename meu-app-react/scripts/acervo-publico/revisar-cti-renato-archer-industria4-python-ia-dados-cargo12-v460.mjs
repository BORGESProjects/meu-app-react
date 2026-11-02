import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cti-renato-archer-industria4-python-ia-dados-cargo12-2024-lote-v460'
const doc='b8d68eaad16e72ed'
const prova='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/922_MCTI_RENATO_ARCHER_006_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_006_01.PDF'
const concurso='CTI Renato Archer/MCTI 2023 — Tecnologista — Indústria 4.0 e Governo Digital'
const cargo='Tecnologista Pleno 1-I — Especialidade: Indústria 4.0 e Governo Digital — Sistemas Ciberfísicos e Cidades Inteligentes (Cargo 12); caderno 922_MCTI_RENATO_ARCHER_006_01'
const blocos=[
 'E C E E C C E C C C C C E E C E C E C C',
 'C C E C E E E C E C C C C E E E E C E E',
 'E E C C E C C C E E C C C C C E C C E E',
 'C E C C E C C C C E'
]
const seq=blocos.flatMap(x=>x.split(' '))
if(seq.length!==70)throw Error(`Gabarito esperado de 70 itens, recebido ${seq.length}`)
const respostas=Object.fromEntries(seq.map((v,i)=>[String(i+51),v]))
const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
const pos=linhas.findIndex(l=>l.startsWith(`{"documento_id":"${doc}"`))
const chave=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const registro={documento_id:doc,arquivo_prova:'922_MCTI_RENATO_ARCHER_006_01.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_006_01.PDF',tipo:'Gabarito oficial definitivo — Cargo 12: Indústria 4.0 e Governo Digital',criterio:'Identificador do caderno 922_MCTI_RENATO_ARCHER_006_01; aplicação em 28/01/2024',status:'tabela_lida_e_conferida_com_respostas_existentes_itens_51_a_110',sha256:chave,respostas,linhas:4}
if(pos>=0)linhas[pos]=JSON.stringify(registro);else linhas.push(JSON.stringify(registro))
await fs.writeFile(arquivoCatalogo,`${linhas.join('\n')}\n`)

const temas={
51:['Indústria 4.0','Processamento local e armazenamento de dados industriais'],52:['Cibersegurança Industrial','Conectividade, proteção de dados e segredos industriais'],53:['Indústria 4.0','Integração de processos automatizados e bancos de dados'],54:['Banco de Dados','Arquitetura de dados para a indústria 4.0'],55:['Sistemas Operacionais','Identificação de usuários e isolamento de processos'],56:['Sistemas Operacionais','Multithreading e execução concorrente'],57:['Sistemas Operacionais','Entrada e saída: requisições, buffers e acesso à memória'],58:['Sistemas Operacionais','Memória virtual e paginação para memória secundária'],59:['Internet das Coisas','Sensores RFID e prateleiras inteligentes para gestão de estoque'],60:['Internet das Coisas','Assistentes conversacionais e automação residencial'],61:['Internet das Coisas','Controle remoto de máquinas por aplicações em nuvem'],62:['Internet das Coisas','Sensores em nuvem e análise com aprendizado de máquina'],63:['Python','Portabilidade e paradigmas de programação'],64:['Python','Palavras-chave, compilação e gerenciamento automático de memória'],65:['Python','Identificadores: regras sintáticas para nomes de variáveis'],66:['Python','Sintaxe de atribuição e validade de identificadores'],67:['Programação C++','Declaração e instanciação de objetos'],68:['Programação C++','Acesso a membros privados e execução de métodos'],69:['Programação C++','Função main e ponto de entrada do programa'],70:['Programação C++','Diretivas de pré-processamento e macros'],71:['Interação Humano-Robô','Robôs de serviço e aplicações de interação humano-robô'],72:['Interação Humano-Robô','Modalidades vocal, visual e tátil'],73:['Interação Humano-Robô','Projeto centrado no robô e aceitabilidade para pessoas'],74:['Interação Humano-Robô','Personas como ferramenta de desenvolvimento'],75:['Robótica','Unidades de medição inercial e sensoriamento'],76:['Robótica','Servo-controle visual e rastreamento de objetos móveis'],77:['Robótica','Configurações eye-in-hand e eye-to-hand de câmeras'],78:['Robótica','Estimação de postura e calibração em servo-controle visual'],79:['Robótica','Servo-controle visual baseado em imagem e estimação de postura'],80:['Robótica','Controle em malha fechada com realimentação visual'],81:['Robótica','Transformações homogêneas entre referenciais'],82:['Visão Computacional','Segmentação de imagens por regiões de significado'],83:['Processamento Digital de Imagens','Filtro de mediana para remoção de ruído impulsivo'],84:['Visão Computacional','Transformada de Hough e detecção de formas'],85:['Processamento Digital de Imagens','Filtros convolucionais e detecção de bordas'],86:['Aprendizado de Máquina','Identificação e validação de padrões em dados'],87:['Aprendizado de Máquina','Diferenças entre aprendizado de máquina e mineração de dados'],88:['Aprendizado de Máquina','Modelos aprendidos a partir de dados'],89:['Aprendizado de Máquina','Algoritmos e relações entre variáveis'],90:['Aprendizado de Máquina','Sobreajuste e capacidade de generalização'],91:['Aprendizado de Máquina','Sobreajuste e subajuste de modelos'],92:['Aprendizado de Máquina','Overfitting e desempenho em dados de treinamento e teste'],93:['Aprendizado de Máquina','Classificação, agrupamento e regras de associação'],94:['Aprendizado de Máquina','Aprendizado supervisionado e conjunto de treinamento'],95:['Estatística','Regressão e aprendizado supervisionado'],96:['Aprendizado de Máquina','Classificador Naive Bayes e teorema de Bayes'],97:['Mineração de Dados','Agrupamento (clustering) e categorias de algoritmos'],98:['Web Semântica','Identificadores IRI e equivalência estrutural'],99:['Web Semântica','OWL e validação de ontologias'],100:['Ontologias','Ontologias leves e representação taxonômica'],101:['Web Semântica','Semântica RDF e OWL 2'],102:['Ontologias','Entidades, vocabulário e assinatura de ontologias'],103:['Web Semântica','OWL, classes, propriedades e inferência lógica'],104:['Web Semântica','Processamento semântico do conteúdo informacional'],105:['Ontologias','Representação formal de domínios do conhecimento'],106:['Indicadores Urbanos','Normalização por população e indicadores urbanos ABNT'],107:['Indicadores Urbanos','Taxa de desemprego como indicador urbano'],108:['Indicadores Urbanos','Indicadores essenciais, de apoio e de perfil'],109:['Mineração de Dados','Análise de sequência e descoberta de associações'],110:['Análise de Dados','Análise preditiva e análise prescritiva'],111:['Mineração de Dados','Descoberta de padrões e relação com análise de dados'],112:['Mineração de Dados','Tarefas preditivas e descritivas'],113:['Aprendizado de Máquina','Modelagem preditiva: árvores, redes neurais e regressão'],114:['Mineração de Dados','Agrupamento não supervisionado e detecção de desvios'],115:['Big Data','Análises descritiva, diagnóstica, preditiva e prescritiva'],116:['Big Data','Volume e complexidade de dados e limites do processamento tradicional'],117:['Big Data','Características e dimensões do Big Data'],118:['Análise Exploratória de Dados','Pré-processamento e identificação de problemas nos dados'],119:['Análise Exploratória de Dados','Gráficos multivariados e relação entre variáveis'],120:['Análise Exploratória de Dados','Descoberta de padrões, hipóteses e exploração de dados']
}
const python='aluno1 = “Maria”\n2aluno = “Jose”\nnota final = 9.50\naprovado = True'
const cpp='#define PI 3.14159\nStruct CalculoCircunf{\n  private:\n    int raio;\n    int circunf;\n    int fcalcula (){\n      circunf = 2*PI*raio;\n      return circunf;\n    }\n};\nint main (){\n  CalculoCircunf p;\n  printf("%d", p.fcalcula( ) );\n  return 0;\n}'
const contextos=[
 [51,54,'Em relação às tecnologias para a indústria 4.0, julgue os itens a seguir.'],
 [55,58,'Julgue os itens subsequentes, que versam acerca de sistemas operacionais.'],
 [59,62,'Em relação às características da tecnologia IoT (Internet das coisas), julgue os itens que se seguem.'],
 [63,64,'Julgue os itens subsecutivos, a respeito da linguagem Python.'],
 [65,66,`Trecho de código Python: \n${python}\nCom base nesse trecho, julgue os itens. **Os nomes e valores são reproduzidos como aparecem no caderno.**`],
 [67,70,`Trecho de código C++:\n${cpp}\nCom base no código precedente, julgue os itens. **A transcrição mantém a grafia e a estrutura exibidas no caderno.**`],
 [71,75,'Acerca da interação humano-robô (IHR), julgue os itens subsequentes.'],
 [76,81,'O servo-controle visual ajusta a posição e a orientação da ferramenta de um robô em relação a um objeto-alvo de referência a partir da extração de características de imagens. A respeito desse método, julgue os itens.'],
 [82,85,'Com relação a técnicas de processamento digital de imagens em visão computacional aplicada à robótica, julgue os próximos itens.'],
 [86,97,'Julgue os próximos itens, relativos a aprendizado de máquina.'],
 [98,105,'Julgue os próximos itens, relativos à extração e representação de conhecimento, ontologias, tecnologias semânticas e OWL (Ontology Web Language).'],
 [106,108,'Com base nos padrões estabelecidos pelas normas ABNT NBR ISO 37120:2017 e NBR ISO 37122:2019, julgue os itens a seguir.'],
 [109,114,'No que se refere à análise e à mineração de dados, julgue os próximos itens.'],
 [115,117,'Com relação a Big Data, julgue os itens seguintes.'],
 [118,120,'No que se refere à análise exploratória de dados e ao pré-processamento de dados, julgue os próximos itens.']
]
const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const canonicas=new Map([[54,'extr-4fb359384a09b885423a'],[58,'extr-7409e67a45452557123c'],[60,'extr-0db959b4ad0eb92cb331'],[63,'extr-c03afe57aa8be28395dd'],[64,'extr-ce4179e7458852a499f1'],[65,'extr-c9d42a1360d89cfc77ae'],[66,'extr-18d7246847a8a4c03210']])
const exportado=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(exportado.length!==77||new Set(exportado.map(q=>Number(q.numero))).size!==70)throw Error(`Exportação diferente do esperado: ${exportado.length} registros`)
const facil=new Set([51,53,54,55,56,59,60,61,63,65,67,69,71,72,74,76,82,83,86,88,93,94,98,102,104,105,108,111,116,117,118,120])
const dificil=new Set([52,57,62,64,68,73,78,79,81,84,87,89,90,91,92,96,97,99,101,103,106,107,109,110,112,113,114,115,119])
const correcao={
 'extr-ce4179e7458852a499f1':'São vantagens da linguagem Python: o grande número de palavras-chave associadas com compilação e um coletor de lixo para gerenciar automaticamente o uso de memória.',
 'extr-18d7246847a8a4c03210':'A variável de nome nota final está declarada corretamente.',
 'extr-a597cf1de5c3f1e60d40':'Unidades de medição inercial são utilizadas para sensoriamento de informações acústicas provenientes do usuário.',
 'extr-dd0a59a60359b7a77473':'Em servo-controle visual, transformações entre sistemas de referência distintos podem ser caracterizadas por matrizes de transformação homogênea, que contemplam ações de translação, rotação e escalonamento.'
}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const gabHash=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const manter=new Map()
for(const q of exportado){const n=Number(q.numero);if(!manter.has(n)||q.id===canonicas.get(n))manter.set(n,q.id)}
const decisoes=exportado.map(q=>{
 const n=Number(q.numero),tema=temas[n],g=respostas[String(n)],canonica=manter.get(n)===q.id
 if(!tema||!g)throw Error(`Sem classificação/gabarito do item ${n}`)
 const pagina=n<=75?1:n<=105?2:3
 let enunciado=correcao[q.id]||q.enunciado
 if(!correcao[q.id])enunciado=enunciado.split(/\n(?=CEBRASPE – CTI|Julgue os itens|Julgue os próximos|No que se refere|Com relação a|Em relação a)/)[0].replace(/\s+/g,' ').trim()
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2024,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 28/01/2024; edital publicado em 2023',numero_original:n,numero:n,pagina,dificuldade:dificil.has(n)?'Difícil':facil.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e técnica do item; não é índice psicométrico.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo e pelo caderno oficial 922_MCTI_RENATO_ARCHER_006_01, Cargo 12.`,enunciado,texto_apoio:contexto(n),imagem_pagina:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',remover_pendencias:pendencias,apta_resolucao:true,resposta_correta:g==='C'?0:1,anulada:false,gabarito_oficial:{valor:g,fonte:gabarito,fontes:[gabarito],arquivo:'GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_006_01.PDF',prova,sha256:gabHash,sha256_tipo:'transcricao_canonica_da_tabela_oficial; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito definitivo oficial do Cargo 12, itens 51 a 120.',numero:n,resposta:g,criterio:'Gabarito definitivo oficial CEBRASPE.'}}
 if(!canonica){d.apta_resolucao=false;d.inelegibilidade_motivo='Duplicata OCR do mesmo número e caderno; preservada a versão mais íntegra.';d.duplicada_de=manter.get(n)}
 return d
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,edital:2023,aplicacao:'28/01/2024',cargo:12,registros_brutos:77,itens_unicos:70,questoes_elegiveis:70,itens_anulados:[],duplicatas:7,paginas_origem_conferidas:[1,2,3],blocos_de_codigo_transcritos:['Python, itens 65–66','C++, itens 67–70'],contaminacao_de_pagina_ou_enunciado_corrigida:[64,66,75,81],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
