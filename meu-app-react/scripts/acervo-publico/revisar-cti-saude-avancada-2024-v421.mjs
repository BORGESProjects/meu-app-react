import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cti-saude-avancada-2024-v421',documento='277ee486251b8535'
const prova='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/922_MCTI_RENATO_ARCHER_002_01.PDF'
const chave='https://cdn.cebraspe.org.br/concursos/cti_23/arquivos/GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_002_01.PDF'
const respostas=new Map(`51:C 52:C 53:E 54:E 55:C 56:E 57:E 58:C 59:C 60:E 61:C 62:E 63:C 64:E 65:E 66:E 67:C 68:E 69:C 70:E 71:E 72:C 73:E 74:C 75:C 76:C 77:E 78:C 79:C 80:E 81:E 82:E 83:C 84:E 85:C 86:E 87:E 88:C 89:E 90:E 91:C 92:C 93:C 94:E 95:E 96:E 97:E 98:C 99:C 100:C 101:E 102:X 103:X 104:E 105:E 106:X 107:E 108:C 109:E 110:E 111:X 112:E 113:C 114:E 115:E 116:C 117:C 118:C 119:C 120:E`.split(' ').map(s=>{const [n,a]=s.split(':');return [Number(n),a]}))
if(respostas.size!==70)throw Error(`Esperados 70 itens definitivos; encontrados ${respostas.size}`)
const temas=new Map([
 [51,['Computação Gráfica 3D','Formatos de arquivo 3D: estrutura de vértices e faces no PLY']],
 [52,['Manufatura Aditiva','Formatos STL: compatibilidade com CAD/CAM e impressão 3D']],
 [53,['Manufatura Aditiva','Formatos de malha 3D: cabeçalho do STL binário']],
 [54,['Computação Gráfica 3D','Formato PLY: atributos de cor, textura e material']],
 [55,['Computação Gráfica 3D','Formato OBJ: geometria tridimensional e coordenadas de textura']],
 [56,['Computação Gráfica 3D','Ray tracing e síntese de imagens fotorrealistas com POV-Ray']],
 [57,['Computação Gráfica 3D','Transformações afins: determinante, singularidade, rotação e escala']],
 [58,['Computação Gráfica 3D','Modelagem geométrica por NURBS e superfícies complexas']],
 [59,['Computação Gráfica 3D','Transformações afins em coordenadas homogêneas: matriz de translação']],
 [60,['Computação Gráfica 3D','Projeção tridimensional e sistema de referência da câmera']],
 [61,['Computação Gráfica 3D','Renderização: conversão de modelos 3D em imagens 2D']],
 [62,['Computação Gráfica 3D','Bump mapping e representação visual de relevo sem alteração da malha']],
 [63,['Computação Gráfica 3D','Otimização de renderização: descarte de faces não visíveis']],
 [64,['Computação Gráfica 3D','Renderização: iluminação, sombras, reflexão e custo computacional']],
 [65,['Computação Gráfica 3D','Malhas poligonais: nível de detalhe e custo de renderização']],
 [66,['Simulação Computacional','Modelos matemáticos: simplificação, representação e objetivos']],
 [67,['Simulação Computacional','Modelagem determinística e variáveis aleatórias']],
 [68,['Simulação Computacional','Modelos estáticos e dinâmicos: dependência temporal e eventos']],
 [69,['Simulação Computacional','Simulações terminantes: intervalo de tempo definido']],
 [70,['Simulação Computacional','Métodos de simulação: abordagens analíticas e empíricas']],
 [71,['Gêmeos Digitais','Sistema gêmeo: integração e interação entre componentes físicos e digitais']],
 [72,['Gêmeos Digitais','Taxonomia de gêmeos digitais: componentes, ativos, sistemas e processos']],
 [73,['Gêmeos Digitais','IoT, sensores conectados e monitoramento de ativos digitais']],
 [74,['Gêmeos Digitais','Modelo virtual, simulação, diagnóstico e melhoria de ativos físicos']],
 [75,['Gêmeos Digitais','Internet das Coisas como fonte de dados de funcionamento do ativo']],
 [76,['Manufatura Aditiva em Saúde','Biomodelos médicos: qualidade da imagem e do processamento de imagens']],
 [77,['Manufatura Aditiva','Precisão dimensional e acabamento superficial comparados à usinagem CNC']],
 [78,['Manufatura Aditiva','Fabricação por deposição sucessiva de camadas a partir de modelo 3D']],
 [79,['Manufatura Aditiva em Saúde','Biomodelos para planejamento e referência cirúrgica']],
 [80,['Manufatura Aditiva','Porosidade e propriedades mecânicas em peças fabricadas por adição']],
 [81,['Imagens Médicas','Ultrassonografia Doppler: estimativa de velocidade a partir do deslocamento de frequência']],
 [82,['Imagens Médicas','Interação da radiação com a matéria: espalhamento Rayleigh e efeito fotoelétrico']],
 [83,['Imagens Médicas','Radiografia: endurecimento do feixe e filtração de raios X']],
 [84,['Ressonância Magnética','Relaxação T1 e T2: recuperação longitudinal e decaimento transversal']],
 [85,['Tomografia Computadorizada','Sinograma: projeções em diferentes ângulos de incidência']],
 [86,['Tomografia Computadorizada','Reconstrução tomográfica: retroprojeção filtrada e ruído']],
 [87,['Medicina Nuclear','Tomografia por emissão: eficiência e sensibilidade de detectores em SPECT']],
 [88,['Ressonância Magnética','Gradientes magnéticos e codificação espacial do sinal']],
 [89,['Tomografia Computadorizada','Tomografia helicoidal: movimento do paciente e aquisição volumétrica']],
 [90,['Ressonância Magnética','Aquisição de imagens tridimensionais e codificação espacial']],
 [91,['Tomografia Computadorizada','Tomografia volumétrica de feixe cônico e detectores em fileiras']],
 [92,['Ultrassonografia','Aquisição tridimensional com transdutor unidimensional e varredura espacial']],
 [93,['Ultrassonografia','Transdutor bidimensional e aquisição volumétrica sem varredura mecânica']],
 [94,['Tomografia Computadorizada','Tomografia axial: intervalo entre cortes e largura do feixe']],
 [95,['Processamento de Imagens','Segmentação por watershed e uso de marcadores ou sementes']],
 [96,['Processamento de Imagens','Watershed: linhas de divisão, bacias e mínimos locais']],
 [97,['Processamento de Imagens','Filtros gaussianos: suavização e realce de contraste']],
 [98,['Processamento de Imagens','Detecção e realce de bordas por operadores diferenciais']],
 [99,['Processamento de Imagens','Segmentação por limiarização de níveis de cinza']],
 [100,['Processamento de Imagens Médicas','Classificação estatística de pixels por tecido e características de imagem']],
 [101,['Manufatura Aditiva','Fusão em leito de pó: controle de atmosfera, temperatura e parâmetros de processo']],
 [102,['Manufatura Aditiva','Atomização de pós metálicos para processos de fabricação aditiva']],
 [103,['Manufatura Aditiva','Fusão seletiva a laser e por feixe de elétrons em leito de pó']],
 [104,['Manufatura Aditiva','Pós-processamento de peças: remoção de suportes por eletroerosão a fio']],
 [105,['Manufatura Aditiva','Deformação por curl e tratamento térmico pós-processamento']],
 [106,['Manufatura Aditiva','Fabricação por filamento fundido: comportamento térmico de polímeros']],
 [107,['Manufatura Aditiva','Fabricação por filamento fundido: anisotropia e propriedades direcionais']],
 [108,['Manufatura Aditiva','Fusão em leito de pó de polímeros: poliamida e materiais reforçados']],
 [109,['Manufatura Aditiva','Estruturas de suporte em peças poliméricas fabricadas por adição']],
 [110,['Manufatura Aditiva','Jateamento de material e fotopolimerização em cuba: distinção entre processos']],
 [111,['Nanotoxicologia','Caracterização físico-química de nanomateriais para avaliação toxicológica']],
 [112,['Projeto Generativo','Design paramétrico: restrições, objetivos e otimização algorítmica']],
 [113,['Projeto Generativo','Design generativo aplicado a implantes personalizados e manufatura aditiva']],
 [114,['Biomateriais','Biocompatibilidade de ligas de titânio e aços para próteses']],
 [115,['Biomateriais','Biocompatibilidade: resposta alérgica, tóxica e irritante de tecidos']],
 [116,['Engenharia Biomédica','Estruturas de treliça: sensibilidade da resposta mecânica a detalhes geométricos']],
 [117,['Engenharia Biomédica','Manufatura aditiva: ensaios de fadiga em estruturas reticuladas']],
 [118,['Engenharia Biomédica','Elementos finitos e custo computacional da simulação de treliças']],
 [119,['Engenharia Biomédica','Concentração local de tensões e transferência de carga em treliças']],
 [120,['Engenharia Biomédica','Propriedades de materiais e correlação entre parâmetros de fabricação e microestrutura']]
])
const duplicadas=new Map([
 ['extr-ae4bcd09e80b42503b49',{mantida:'extr-6b53692a7327dedb205a',n:51}],['extr-27163aeb7d4dbb8ac08a',{mantida:'extr-7beb50677f0ee47926d2',n:52}],
 ['extr-0745a63312ddebcf9116',{mantida:'extr-4b43b6a44ea2ad97fcb1',n:54}],['extr-ee15b1539eedcec0c2df',{mantida:'extr-6c5c336f54e46d8592f4',n:55}],
 ['extr-90be91281ff0c2cc7d9d',{mantida:'extr-76f00881b320466069de',n:57}],['extr-bf81fbd387ac31fabffd',{mantida:'extr-4ef53838ab52de98e7f6',n:58}],
 ['extr-bc19df6a561d6abfb9a5',{mantida:'extr-43be002e88fa55e49dfd',n:59}],['extr-02c8aeba70fc443c1c29',{mantida:'extr-6d405b6d2c255736c6e2',n:63}],
 ['extr-238a3beaf26730520a37',{mantida:'extr-85f207051c918128d382',n:74}],['extr-ee2b0c2c9984d914f92f',{mantida:'extr-5dec60c8a481662e27af',n:75}]
])
const exportados=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
if(exportados.length!==80)throw Error(`Esperados 80 registros brutos; encontrados ${exportados.length}`)
const nums=new Set(exportados.map(q=>Number(q.numero)));if(nums.size!==70||[...nums].some(n=>!respostas.has(n)))throw Error('Números da extração diferem dos itens 51–120 do caderno oficial')
const canonical=[...respostas].map(([n,a])=>`${n}:${a}`).join('\n'),hashGabarito=createHash('sha256').update(canonical).digest('hex')
const limpa=s=>String(s||'').replace(/\s+/g,' ').replace(/\s+([,.;:!?])/g,'$1').replace(/\s*\|\|922_MCTI_RENATO_ARCHER_002_01N[\s\S]*$/,'').trim()
const decisoes=[]
for(const q of exportados){
 const n=Number(q.numero),[materia,conteudo]=temas.get(n)||[];if(!materia)throw Error(`Item ${n} sem classificação`)
 const a=respostas.get(n),dup=duplicadas.get(q.id),pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${imagem}`)
 let enunciado=limpa(q.enunciado),texto_apoio=''
 if(n===51)enunciado='Os dados 3D armazenados no formato PLY (polygon file format) são organizados como uma lista simples de triplas (x, y, z) para os vértices e uma lista de faces descritas por índices em uma lista de vértices.'
 if(n===57)enunciado=enunciado.replace('afjine transformation','affine transformation')
 if(n===59){enunciado='A transformação afim (affine transformation) representada pela equação matricial a seguir descreve uma translação em coordenadas homogêneas de tₓ e tᵧ unidades nas direções das coordenadas x e y, respectivamente.';texto_apoio='Equação transcrita da figura original: [x′, y′, 1]ᵀ = [[1, 0, tₓ], [0, 1, tᵧ], [0, 0, 1]] · [x, y, 1]ᵀ. A imagem original da página permanece vinculada para conferência.'}
 if(n===82)enunciado=enunciado.replace(/c o m/gi,'com')
 if(n===105)enunciado='O efeito curl do material pode ser reduzido com tratamento térmico subsequente ao processo de manufatura aditiva.'
 if(n===110)enunciado='No processo de jateamento de material, os materiais são submetidos à fotopolimerização em uma cuba por meio de feixes de energia no formato de seções transversais da peça.'
 if(n===111)enunciado=enunciado.replace(/superficial solubilidade/,'superficial, solubilidade')
 const anulada=a==='X',opcoes=['Certo','Errado'],ctx=[]
 const resposta=a==='C'?0:a==='E'?1:null,dificuldade=[53,57,59,63,64,65,68,70,73,82,85,86,90,94,95,96,100,101,102,103,111,116,118,119].includes(n)?'Difícil':'Média'
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,concurso:'CTI Renato Archer 2024 — Cargo 16: Tecnologista Júnior I — Saúde Avançada',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'28/01/2024',edital:'Edital nº 1 — CTI, de 06/10/2023',cargo:'Tecnologista Júnior I — Saúde Avançada — Manufatura Aditiva, Simulação Computacional e Processamento de Imagens Aplicados à Saúde',numero_original:n,numero:n,pagina,opcoes,resposta_correta:resposta,anulada,tipo_resposta:'certo_errado',dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela especialização técnica e pela quantidade de etapas conceituais exigidas; a banca não publicou nível de dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo enunciado, seção temática e programa do Cargo 16. A data da prova (28/01/2024), cargo e especialidade foram cotejados com o edital e o gabarito oficial definitivo do CEBRASPE.`,enunciado,texto_apoio,imagens_contexto:ctx,reemplazarContexto:true,visual:{pagina,imagem,texto_apoio,motivo:`Página ${pagina} do caderno oficial conferida visualmente; figuras, equação matricial e elementos gráficos foram mantidos vinculados ao item.`},apta_resolucao:!dup,gabarito_oficial:{fonte:chave,arquivo:'GAB_DEFINITIVO_922_MCTI_RENATO_ARCHER_002_01.PDF',prova:'CTI Renato Archer — Cargo 16, caderno 002 — gabarito definitivo',sha256:hashGabarito,sha256_tipo:'sha256_da_transcricao_canonica_das_respostas_51_a_120; nao_e_hash_do_pdf',numero:n,resposta:a,criterio:'Gabarito oficial definitivo CEBRASPE para os cargos 2, 7, 11 e 16; itens 51 a 120. Itens X permanecem anulados e sem correção automática.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']}
 if(dup){d.apta_resolucao=false;d.inelegibilidade_motivo='registro_duplicado_com_ocr_inconsistente';d.duplicada_de=dup.mantida;d.motivo=`Duplicata do item ${n}; foi preservado o registro canônico com transcrição conferida no caderno. Esta cópia fica fora da resolução e da contagem elegível.`}
 decisoes.push(d)
}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const final={...report,documento,questoes_revisadas:80,questoes_unicas:70,duplicatas_inelegiveis:10,questoes_elegiveis:70,questoes_com_gabarito_definitivo:70,itens_anulados:[102,103,106,111],prova_oficial:prova,gabarito_oficial:chave,checksum_gabarito:hashGabarito,ano:2024,data_aplicacao:'2024-01-28',edital:2023,ocr_corrigido:[51,57,59,82,105,110,111]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(final,null,2));console.log(JSON.stringify(final,null,2))
