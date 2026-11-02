import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cti-renato-archer-cargo4-nanotecnologia-fotonica-energia-2024-lote-v459'
const doc='a7ae1fbbcbaf158f'
const prova='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/922_MCTI_RENATO_ARCHER_004_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_004_01.PDF'
const concurso='CTI Renato Archer/MCTI 2023 — Tecnologista — Tecnologias Habilitadoras'
const cargo='Tecnologista Pleno 2-I (Emprego 4) / Tecnologista Júnior (Emprego 13) — Nanotecnologia e Materiais Avançados aplicados à Fotônica ou Energia — caderno 922_MCTI_RENATO_ARCHER_004_01'
const blocos=[
 'E E C E C C C C E C E E E X E E C E C C',
 'C E C C E C C C E E E E E C C E C C E E',
 'C C E E C C C C E E E C E E C E E C C E',
 'C C E E C C E C E C'
]
const seq=blocos.flatMap(x=>x.split(' '))
if(seq.length!==70)throw Error(`Gabarito esperado de 70 itens, recebido ${seq.length}`)
const respostas=Object.fromEntries(seq.map((v,i)=>[String(i+51),v]))

const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
const pos=linhas.findIndex(l=>l.startsWith(`{"documento_id":"${doc}"`))
const chave=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const registro={documento_id:doc,arquivo_prova:'922_MCTI_RENATO_ARCHER_004_01.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_004_01.PDF',tipo:'Gabarito oficial definitivo — conhecimentos específicos para os cargos 4 e 13',criterio:'Identificador do caderno 922_MCTI_RENATO_ARCHER_004_01; aplicação em 28/01/2024',status:'tabela_lida',sha256:chave,respostas,linhas:4}
if(pos>=0)linhas[pos]=JSON.stringify(registro);else linhas.push(JSON.stringify(registro))
await fs.writeFile(arquivoCatalogo,`${linhas.join('\n')}\n`)

const temas={
 51:['Nanotecnologia','Síntese de nanomateriais: abordagens bottom-up e top-down'],52:['Nanotecnologia','Fundamentos, escala de atuação e impactos tecnológicos'],53:['Nanotecnologia','Efeitos de escala e propriedades de nanomateriais'],54:['Nanotecnologia','Estabilidade química, degradação e oxidação de nanomateriais'],55:['Nanotoxicologia','Exposição, absorção e riscos de nanomateriais'],56:['Nanocompósitos','Nanomateriais inorgânicos em matrizes poliméricas'],57:['Nanomateriais','Relação área superficial/volume e reatividade'],58:['Física de Nanomateriais','Confinamento quântico e propriedades ópticas'],59:['Semicondutores','Condutividade elétrica em nanoestruturas'],60:['Nanofotônica','Ressonância de plasmon de superfície'],61:['Caracterização de Nanomateriais','Potencial zeta e carga superficial'],62:['Caracterização de Nanomateriais','Dimensão e caracterização completa de nanoestruturas'],63:['Caracterização de Nanomateriais','Espectroscopia de infravermelho e fotoelétrons por raios X'],64:['Caracterização Elétrica','Resistividade, condutividade e instrumentos de medição'],65:['Microscopia Eletrônica','Microscopia óptica e eletrônica: resolução e formação de imagem'],66:['Microscopia Eletrônica de Varredura','Contraste e espalhamento eletrônico em amostras orgânicas'],67:['Microscopia Eletrônica de Varredura','Detecção e processamento de sinais de elétrons e fótons'],68:['Microscopia Eletrônica de Varredura','Geração de elétrons retroespalhados e imagem'],69:['Microscopia Eletrônica de Varredura','Interação do feixe de elétrons com a amostra'],70:['Microscopia Eletrônica de Varredura','Carregamento eletrostático em amostras não condutoras'],71:['Física de Semicondutores','Éxcitons: aprisionamento e mecanismos de formação'],72:['Física de Semicondutores','Éxcitons, transporte de energia e analogia com positrônio'],73:['Física de Semicondutores','Raio de Bohr do éxciton e confinamento quântico'],74:['Física de Semicondutores','Éxciton de Frenkel e localização elétron-buraco'],75:['Física de Semicondutores','Éxcitons de Frenkel e Mott-Wannier'],76:['Optoeletrônica','LED: polarização direta e emissão de luz'],77:['Optoeletrônica','LED: cor emitida e estrutura de bandas'],78:['Física de Semicondutores','LED: energia de recombinação e cor'],79:['Optoeletrônica','LEDs e materiais semicondutores'],80:['Eletrônica','LED: curva corrente-tensão e resistência dinâmica'],81:['Optoeletrônica','Fotodetectores em receptores ópticos'],82:['Optoeletrônica','Fotodetectores e faixa espectral de resposta'],83:['Optoeletrônica','Ruído Johnson-Nyquist e fotomultiplicadores'],84:['Física de Semicondutores','Difusão de portadores em fotodetectores'],85:['Optoeletrônica','Fotodetecção por variação de resistência'],86:['Física de Lasers','Divergência e intensidade de feixes laser'],87:['Física de Lasers','Inversão de população e emissão estimulada'],88:['Física de Lasers','Emissão espontânea e coerência da radiação'],89:['Física de Lasers','Comprimento de onda e propriedades da radiação laser'],90:['Física de Lasers','Condição de ressonância para emissão estimulada'],91:['Fotônica em Silício','Limites de frequência e aplicações em telecomunicações'],92:['Fotônica em Silício','Dispersão da luz em materiais'],93:['Fotônica em Silício','Transparência do silício e integração fotônica'],94:['Fotônica em Silício','Junção p-n integrada a guia de onda e modulação de fase'],95:['Fotônica em Silício','Integração fotônica e estabilidade térmica de lasers'],96:['Energia Solar Fotovoltaica','Células fotovoltaicas: entrada óptica e conversão de energia'],97:['Energia Solar Fotovoltaica','Junção p-n, geração e coleta de portadores'],98:['Energia Solar Fotovoltaica','Modelo de diodo fotovoltaico: correntes e queda de tensão na carga'],99:['Energia Solar Fotovoltaica','Curva corrente-tensão e raízes de célula fotovoltaica'],100:['Energia Solar Fotovoltaica','Silício intrínseco, dopagem e níveis de energia'],101:['Filmes Finos','Efeitos quânticos em filmes semicondutores'],102:['Filmes Finos','Dopagem e propriedades elétricas de semicondutores'],103:['Filmes Finos','Deposição por evaporação térmica'],104:['Filmes Finos','Aplicações em energia, sensores e administração de fármacos'],105:['Optoeletrônica','Filmes finos orgânicos e inorgânicos em dispositivos'],106:['Perovskitas','Estrutura cristalina e classificação de perovskitas de haleto'],107:['Energia Solar Fotovoltaica','Perovskitas: recombinação de éxcitons e coleta de carga'],108:['Energia Solar Fotovoltaica','Perovskitas de haleto e absorção de radiação UV'],109:['Energia Solar Fotovoltaica','Células solares tandem e junção dupla'],110:['Ciência dos Materiais','Estrutura cristalina e estabilidade de perovskitas 3D'],111:['Armazenamento de Energia','Tecnologias de supercapacitores'],112:['Armazenamento de Energia','Capacitância de dupla camada elétrica'],113:['Eletroquímica','Armazenamento de energia em capacitores e baterias'],114:['Armazenamento de Energia','Supercapacitores: capacitâncias em série e associação'],115:['Armazenamento de Energia','Densidade de energia e potência: baterias versus supercapacitores'],116:['Baterias','Resistência interna e tensão terminal de baterias de íon-lítio'],117:['Baterias','Densidade de energia e taxa de descarga'],118:['Eletroquímica','Equilíbrio químico em baterias de íon-lítio'],119:['Baterias','Densidade energética de baterias de níquel-cádmio e íon-lítio'],120:['Baterias','Reação global de intercalação em bateria de íon-lítio']
}
const fotovoltaico='A figura apresenta o circuito simplificado de um diodo fotovoltaico de silício. A fotoexcitação gera a corrente i_gen; R_S é a resistência série da célula; R_SH, a resistência interna shunt; i_d, a corrente do diodo; i_sh, a corrente que percorre o ramo shunt; e i_L, a corrente na carga resistiva R_L.'
const perovskita='Perovskitas têm fórmula ABX₃: A e B são cátions de tamanhos distintos e X é um ânion. CaTiO₃ é um representante natural. Células solares de perovskita já superaram 25% de eficiência; a expansão em larga escala ainda enfrenta desafios de estabilidade e durabilidade.'
const supercapacitor='Em supercapacitores eletrostáticos de dupla camada, o eletrólito fica entre os eletrodos. Sob diferença de potencial, cátions se aproximam da placa negativa e ânions da placa positiva. A camada interna separa cargas opostas por distâncias da ordem do tamanho dos íons.'
const bateria='Baterias de íon-lítio são recarregáveis e operam pela transferência de íons de lítio entre cátodo e ânodo. Em comparação com tecnologias como níquel-cádmio e níquel-hidreto, apresentam maior densidade de energia, menor efeito de memória e menor perda de carga em uso.'
const contextos=[
 [51,55,'Em relação aos fundamentos da nanotecnologia, julgue os itens a seguir.'],
 [56,60,'Julgue os itens seguintes, a respeito das propriedades dos nanomateriais.'],
 [61,65,'Julgue os próximos itens acerca da caracterização de nanomateriais.'],
 [66,70,'Julgue os seguintes itens, a respeito da técnica de microscopia eletrônica de varredura.'],
 [71,75,'Julgue os itens que se seguem, relacionados ao éxciton.'],
 [76,80,'Em relação a diodos emissores de luz (LED), julgue os itens que se seguem.'],
 [81,85,'Acerca dos fotodetectores, julgue os itens a seguir.'],
 [86,90,'No que se relaciona ao laser e aos fenômenos responsáveis por seu funcionamento, julgue os itens subsequentes.'],
 [91,95,'Em relação à fotônica em silício, julgue os itens que se seguem.'],
 [96,100,fotovoltaico],
 [101,105,'Julgue os itens subsequentes, a respeito de filmes finos inorgânicos.'],
 [106,110,perovskita],
 [111,115,supercapacitor],
 [116,120,bateria]
]
const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const canonicas=new Map([[51,'extr-e4fe93281a52c438c5be'],[53,'extr-5453aac712fa987de614'],[54,'extr-784255b5e82814fc802f'],[55,'extr-75b4cd098bf3389cdb01'],[56,'extr-9ed8060926238b28509c'],[57,'extr-84799d2928e0794ba201'],[60,'extr-4b8d2916f1cfe2265ed5']])
const exportado=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(exportado.length!==77||new Set(exportado.map(q=>Number(q.numero))).size!==70)throw Error(`Exportação diferente do esperado: ${exportado.length} registros`)
const anulados=new Set([64])
const facil=new Set([51,53,54,56,59,62,63,65,67,69,70,72,74,76,78,80,81,82,84,86,87,88,90,92,96,97,100,101,104,106,109,111,112,115,116,118,120])
const dificil=new Set([52,55,57,58,60,61,64,66,68,71,73,75,77,79,83,85,89,91,93,94,95,98,99,102,103,105,107,108,110,113,114,117,119])
const correcoes={
 'extr-e2b1fc5b24267f1ab458':'Os métodos bottom-up consistem na obtenção de nanomateriais a partir do material na escala macroscópica, ao passo que os métodos top-down consistem na produção de nanoestruturas construídas átomo a átomo, molécula por molécula ou por aglomerados de átomos ou moléculas.',
 'extr-784255b5e82814fc802f':'Dadas as particularidades físico-químicas dos nanomateriais, eles raramente se degradam ou oxidam quando expostos, por exemplo, à luz, à temperatura e a outros compostos químicos.',
 'extr-855883ed7e1145225f98':'Dadas as particularidades físico-químicas dos nanomateriais, eles raramente se degradam ou oxidam quando expostos, por exemplo, à luz, à temperatura e a outros compostos químicos.',
 'extr-75b4cd098bf3389cdb01':'Um dos grandes riscos dos nanomateriais é sua elevada capacidade de absorção pelos seres vivos; eles podem chegar à corrente sanguínea e a praticamente qualquer órgão do corpo por contato direto com a pele, inalação ou ingestão.',
 'extr-9ed8060926238b28509c':'Uma estratégia para melhorar as propriedades mecânicas de matrizes poliméricas é a adição de nanomateriais inorgânicos, formando nanocompósitos.',
 'extr-84799d2928e0794ba201':'Os nanomateriais apresentam elevada razão entre área superficial e volume e, consequentemente, maior densidade de átomos na superfície do que no interior, o que implica maior reatividade e menor estabilidade química; por isso, são amplamente empregados como catalisadores.',
 'extr-4b8d2916f1cfe2265ed5':'Quando uma partícula metálica ou semicondutora apresenta dimensões menores que o comprimento de onda da radiação incidente, pode-se observar o fenômeno óptico denominado ressonância de plasmon de superfície.',
 'extr-9649fdffe04ac8e9575d':'No circuito apresentado, a queda de tensão nos terminais da carga resistiva Rₗ pode ser expressa por: Rₗ · {i_gen − i₀ · [e^(qVₗ/(n k T)) − 1] − i_sh}, em que i₀ é a corrente de saturação reversa, n é o fator de idealidade do diodo, k é a constante de Boltzmann, T é a temperatura e q é a carga do elétron.',
 'extr-cc0aaf6113c50c7311b5':'O LED é um dispositivo tipicamente não ôhmico; portanto, a resistência elétrica observada em determinado ponto de operação não pode ser calculada pela razão entre a tensão aplicada e a corrente que flui pelos terminais.',
 'extr-210b9b3949f5330b02f5':'Embora apresentem densidade de energia menor que algumas baterias, os supercapacitores usualmente têm maior densidade de potência de pico.',
 'extr-542a66154a445d7459a1':'Somente filmes finos inorgânicos podem ser utilizados em optoeletrônica em razão da natureza condutora que sempre exibem, distinta dos materiais orgânicos, que são isolantes por natureza.',
 'extr-bfc89eb6132ba8455e98':'A célula unitária de perovskitas 3D é sempre de face centrada, sendo altamente estável em relação a esforços externos.',
 'extr-b4cd551116d4d86732a6':'Em um modelo simplificado para uma bateria de íon-lítio com ânodo de grafite e cátodo com substrato de cobalto dopado com lítio, o processo pode ser descrito pela equação global LiC₆ + CoO₂ ⇌ C₆ + LiCoO₂; a reação direta corresponde à descarga e a inversa, à carga.'
}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const gabHash=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const manter=new Map()
for(const q of exportado){const n=Number(q.numero);if(!manter.has(n)||q.id===canonicas.get(n))manter.set(n,q.id)}
const decisoes=exportado.map(q=>{
 const n=Number(q.numero),tema=temas[n],g=respostas[String(n)],canonica=manter.get(n)===q.id
 if(!tema||!g)throw Error(`Sem classificação/gabarito do item ${n}`)
 const anulada=anulados.has(n)
 let enunciado=correcoes[q.id]||q.enunciado
 enunciado=enunciado.split(/\n(?=Ao contrário de capacitores|Baterias de íon-lítio|Perovskitas são compostos|Julgue os itens|Julgue os próximos itens|Em relação à|No que se relaciona|Acerca dos|A respeito dos)/)[0].replace(/\s+/g,' ').trim()
 const pagina=n<=70?1:n<=97?2:3
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2024,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 28/01/2024; edital publicado em 2023',numero_original:n,numero:n,pagina,dificuldade:dificil.has(n)?'Difícil':facil.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência de física, materiais, instrumentação e modelagem; não é índice psicométrico.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo técnico do caderno oficial 922_MCTI_RENATO_ARCHER_004_01, aplicado aos empregos 4 e 13.`,enunciado,texto_apoio:contexto(n),imagem_pagina:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',remover_pendencias:pendencias,apta_resolucao:true,resposta_correta:anulada?null:g==='C'?0:1,anulada,gabarito_oficial:{valor:g,fonte:gabarito,fontes:[gabarito],arquivo:'GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_004_01.PDF',prova,sha256:gabHash,sha256_tipo:'transcricao_canonica_da_tabela_oficial; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito definitivo oficial dos empregos 4 e 13, itens 51 a 120.',numero:n,resposta:g,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Gabarito definitivo oficial CEBRASPE.'}}
 if(!canonica){d.apta_resolucao=false;d.inelegibilidade_motivo='Duplicata OCR do mesmo número e caderno; preservada a versão mais íntegra.';d.duplicada_de=manter.get(n)}
 if([98,99,100].includes(n))d.imagens_contexto=[{pagina:2,imagem:`paginas/${doc}-0002.webp`,texto:fotovoltaico}]
 return d
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,edital:2023,aplicacao:'28/01/2024',empregos:[4,13],registros_brutos:77,itens_unicos:70,questoes_elegiveis:70,itens_anulados:[...anulados],duplicatas:7,paginas_origem_conferidas:[1,2,3],imagens_ou_graficos_especiais:1,formula_transcrita:'Item 98 — modelo elétrico de diodo fotovoltaico',publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
