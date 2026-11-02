import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-inpi-eletronica-2023-lote-v443'
const doc='2458619ef9100822'
const prova='https://cdn.cebraspe.org.br/concursos/INPI_23/arquivos/930_INPI_015_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/INPI_23/arquivos/GAB_DEFINITIVO_930_INPI_015_01.PDF'
const concurso='INPI — Pesquisador em Propriedade Industrial, Cargo 15 (2023)'
const cargo='Pesquisador em Propriedade Industrial — P4: Processamento de sinais e processamento de dados de imagem, áudio ou voz'

const areas=new Map()
const add=(nums,materia,conteudo,dificuldade='Média')=>{for(const n of nums)areas.set(n,{materia,conteudo,dificuldade})}
add([51,52],'Matemática','Sistemas de numeração: conversão entre bases binária e hexadecimal')
add([53,54,55,57],'Eletrônica Digital','Álgebra booleana: funções, simplificação e teoremas de De Morgan')
add([56,58,59,60,61,62,63,64],'Eletrônica Digital','Circuitos lógicos, famílias lógicas, flip-flops, conversores, multiplexadores e demultiplexadores')
add([65,66,67,68,69,70],'Microprocessadores e Microcontroladores','Temporizadores, multivibradores, PWM, contadores e comunicação serial')
add([71,72,73,74,75],'Instrumentação Eletrônica','Geradores de função, analisadores, osciloscópios e instrumentação de teste')
add([76,77,78,79],'Processamento de Sinais','Amostragem, aliasing, quantização, conversão A/D e reconstrução de sinais','Difícil')
add([80,81,82,83],'Processamento de Sinais','Filtros analógicos: função de transferência, resposta em frequência, ganho e classificação','Difícil')
add([84,85,86],'Processamento de Sinais','Transformada Z: polos, zeros e região de convergência','Difícil')
add([87,88,89,90],'Processamento de Sinais','Transformada discreta de Fourier, convolução e propriedades de sinais','Difícil')
add([91,92,93,94,95],'Processamento de Sinais','Filtros digitais: função de transferência, estabilidade, estruturas FIR/IIR e resposta ao impulso','Difícil')
add([96,97,98,99,100],'Telecomunicações','Televisão digital: OFDM, MPEG, middleware, ATSC e arquiteturas de transmissão')
add([101,102,103,104,105],'Processamento de Áudio','Codificação de áudio com e sem perdas, redundância, percepção auditiva e sub-bandas')
add([106,107,108,109,110],'Processamento de Áudio','Amostragem, decomposição por sub-bandas, sobreamostragem e conversores Sigma-Delta','Difícil')
add([111,112,113,114,115],'Processamento Digital de Imagens','Representação de imagens, captura, pré-processamento, segmentação e cores')
add([116,117,118,119,120],'Processamento de Vídeo','Varredura entrelaçada, padrões MPEG, subamostragem de cor e pixels')

const duplicadas={
 'extr-0e467318274e5553f42f':'extr-58c8ffd430a958e7e2b6',
 'extr-3ce959035f2920673558':'extr-a836a8c89d6351e5e315',
 'extr-5d9794ea731643be5463':'extr-a028d708212902ec7345',
 'extr-314e91fba36dadee33e5':'extr-eb1886832c6ac814c32a',
 'extr-bc08d45e5e6c1c586880':'extr-8052aa6a75ed0ffb9883',
 'extr-4e0499f624dd8d891e26':'extr-f6542bfaf5039fbb0179',
 'extr-bdb4aa91910b86502a29':'extr-4aaa57d833ea78097ebb',
 'extr-76c649d86d115c29f444':'extr-8b7b93e8ff352550a656'
}
const correcoes={
 51:'O binário 1111010101111001110 é igual a F579E em hexadecimal.',
 52:'O número 25 em decimal é igual a 11001 na base binária.',
 53:'Se L1 e L2 forem variáveis booleanas que representem duas lâmpadas em uma sala, então a sala estará iluminada apenas quando ambas as lâmpadas estiverem acesas se, e somente se, F = L1 ∧ L2.',
 54:'Considere que, para ser patenteada, uma invenção deve satisfazer as seguintes características, representadas pelas variáveis booleanas A, B e C: se a invenção é uma novidade, A é verdadeiro; se apresenta atividade inventiva, B é verdadeiro; e, se possui aplicação industrial, C é verdadeiro. Nessa situação, a expressão booleana F que representa a condição para que uma patente seja aprovada, com base nessas características, é F = (A ∧ B) ∨ (A ∧ C) ∨ (B ∧ C).',
 55:'Conforme o primeiro teorema de De Morgan, o complemento do produto de duas variáveis é igual à soma dos complementos das variáveis individuais: ¬(A ∧ B) = (¬A) ∨ (¬B).',
 56:'Em comparação com outras tecnologias de circuitos integrados digitais, uma das vantagens dos dispositivos lógicos programáveis é gerar um ciclo de projeto com menor tempo de execução e custos reduzidos.',
 59:'Um circuito combinacional caracteriza-se pela dependência do valor atual: nele, o valor da saída no instante t depende exclusivamente da combinação dos valores das entradas nesse instante, e os estados anteriores não têm relevância. Já o circuito sequencial caracteriza-se pela influência de entradas anteriores: nele, o valor da saída no instante t não depende apenas dos valores das entradas nesse instante, mas também da sequência das entradas anteriores.',
 60:'Considere um sistema digital, composto por flip-flops e portas lógicas, que opere de acordo com a equação de estado Qₙ₊₁ = D ⊕ Qₙ, em que D é a entrada e Qₙ é o estado atual. Nesse caso, o próximo estado Qₙ₊₁ será o resultado da operação OU entre a entrada D e o estado atual Qₙ.',
 61:'O flip-flop é um dispositivo adequado para a transformação de dados de série para dados em paralelo, enquanto o decodificador é apropriado para a conversão do código BCD para um display de sete segmentos.',
 62:'Um conversor digital-analógico de 5 bits que produz 0,3 V na saída quando a entrada é 00001 produzirá 9,3 V de saída se a entrada for 11111.',
 63:'Para a multiplexação de 32 canais de entrada por meio da associação de 4 multiplexadores de 8 canais cada, é correto conectar, em cada multiplexador, os mesmos sinais de controle (select) e conectar às entradas correspondentes de cada multiplexador os sinais de dados dos 32 canais.',
 64:'Um demultiplexador é um circuito lógico que aceita uma entrada de dados e a distribui por várias saídas, com base em linhas de seleção, ao passo que o decodificador utiliza as linhas de seleção como linhas de entrada.',
 65:'Uma das premissas do temporizador com tempo de retardo é que a carga seja acionada antes desse tempo e agilize a velocidade de resposta.',
 66:'Multivibradores monoestáveis apresentam um estado estável e um estado não estável na saída; por sua vez, os multivibradores astáveis apresentam dois estados não estáveis na saída.',
 68:'Um contador de ondulação de oito estágios que use flip-flops com atraso de propagação de 45 ns e largura de pulso do estroboscópio de 40 ns terá operação adequada se a frequência do sinal de entrada for de aproximadamente 2,5 MHz.',
 70:'Em programas para armazenar valores nos microcontroladores, apenas variáveis do tipo inteiro fixo (int) podem ser utilizadas.',
 74:'Em um osciloscópio, o botão DC OFFSET permite somar ao sinal de saída um sinal alternado cujo valor pode ser variado continuamente entre −x V e +x V, dependendo do fabricante.',
 75:'Para minimizar a interferência das pontas de prova de um osciloscópio, é correto elevar a resistência de entrada do osciloscópio de 10 MΩ para 100 MΩ, o que significa uma atenuação de dez vezes no sinal detectado pela ponta de prova.',
 76:'A amostragem deve ser realizada a uma taxa de, no mínimo, 10.000 amostras por segundo, de modo a evitar aliasing.',
 77:'Caso a amostragem seja realizada a uma taxa de 5.000 amostras por segundo, uma eventual componente de 3 kHz presente no sinal analógico de voz será reconstruída, no sistema receptor, como uma soma de componentes de 2 kHz, 3 kHz, 7 kHz e 8 kHz.',
 78:'A conversão A/D deve ser realizada usando-se, no mínimo, uma profundidade de 9 bits para codificar cada amostra do sinal.',
 79:'O efeito do circuito sample-and-hold equivale a uma filtragem passa-altas.',
 80:'O ganho do filtro descrito pela equação diferencial exibida no caderno oficial, para a frequência angular ω = 10 rad/s, é de aproximadamente −20 dB.',
 81:'A resposta em frequência da função de transferência do filtro descrito no caderno oficial é dada por H(jω) = jω/(10 + jω).',
 82:'O módulo da função de transferência do filtro descrito no caderno oficial é |H(jω)| = ω/√(ω² + 100).',
 83:'O filtro descrito no caderno oficial é um filtro passa-baixas de primeira ordem.',
 84:'Considere o sinal discreto x[n] = (2/5)ⁿu[n], cuja transformada Z é X(z). O item afirma que X(z) = 1/(1 − (2/5)z⁻¹).',
 85:'Para o sinal x[n] = (2/5)ⁿu[n], X(z) tem um zero em z = 0 e um polo em z = 2/5.',
 86:'Para o sinal x[n] = (2/5)ⁿu[n], a região de convergência de X(z) é |z| > 0.',
 87:'O item afirma que x₃[n] corresponde à convolução linear de x₁[n] com x₂[n], isto é, x₃[n] = Σₘ₌₋∞^∞ x₁[m]x₂[n − m].',
 88:'Considere os sinais discretos e suas transformadas de Fourier definidos no caderno oficial. O item afirma que x₄[n] corresponde a um deslocamento no tempo do sinal x₁[n], isto é, x₄[n] = x₁[n − m].',
 89:'Se X₁[k] for calculado usando-se a transformada rápida de Fourier, então a complexidade computacional será reduzida pela metade em comparação com a complexidade computacional do cálculo de X₁[k] pela transformada discreta de Fourier tradicional.',
 90:'Com as relações entre X₁[k], X₂[k] e X₅[k] definidas no caderno oficial, o item afirma que X₅[k] = 8X₁[k] + 9X₂[k].',
 91:'O item considera o filtro digital cuja equação de diferenças é y[n] − (3/7)y[n − 1] = x[n] e afirma uma função de transferência H(z) com região de convergência |z| > 3/7.',
 92:'O filtro digital considerado no caderno oficial é um passa-baixas de primeira ordem, com zero em z = 0 e polo em z = 3/7.',
 93:'Em uma implantação em tempo real do filtro descrito no caderno oficial, serão necessárias, no mínimo, duas operações MAC (multiply-accumulate) para calcular cada amostra do sinal de saída.',
 94:'O filtro em apreço é do tipo FIR (finite impulse response), e sua resposta ao impulso é h[n] = (3/7)ⁿu[n].',
 95:'O filtro descrito no caderno oficial é causal e estável.',
 96:'A modulação OFDM envia múltiplos sinais em uma mesma frequência através da multiplexação por divisão de frequência.',
 97:'O protocolo MPEG-2 é utilizado na camada de modulação do modelo de TV digital presente no Brasil.',
 98:'Uma das vantagens da camada de middleware é permitir a portabilidade de aplicações para diferentes receptores que adotem o middleware.',
 99:'O ATSC evoluiu para uma arquitetura de sistema em camada única.',
 100:'A técnica SISO possui melhor desempenho para a redução de interferências destrutivas que a técnica MISO.',
 101:'Nos codificadores lossless, não há perdas geradas no momento da compressão.',
 102:'Nos codificadores lossless, quanto maior for a quantidade de informação redundante no áudio, maior será o tamanho do arquivo ao final da compressão.',
 103:'Os codificadores com perda consideram as características da audição humana para detectar informações ignoradas pelo ouvido humano.',
 104:'Os codificadores de sub-banda exploram as redundâncias do sinal de áudio no domínio do tempo.',
 105:'Uma das desvantagens da codificação por transformação é a capacidade de trabalhar somente com áudio de baixa fidelidade.',
 106:'Se a banda do sinal de áudio de um CD for de 20 kHz, então, para que ele possa ser perfeitamente reconstruído, a frequência de amostragem deverá ser de, no mínimo, 30 kHz.',
 107:'Um dos problemas encontrados na decomposição por sub-bandas de um sinal de áudio é a resposta imperfeita em frequência dos filtros digitais.',
 108:'A utilização de sobreamostragem simplifica o hardware analógico utilizado em um sistema de som, mas, por outro lado, aumenta a taxa de dados.',
 109:'Os algoritmos de codificação de áudio operam sobre o sinal contínuo no tempo.',
 110:'O uso de conversor analógico-digital Sigma-Delta dificulta a utilização de sobreamostragem em sistemas de alta fidelidade.',
 111:'Uma imagem colorida é uma função bidimensional discreta cujas variáveis são espaciais, e o valor da função em qualquer ponto é inversamente proporcional à intensidade luminosa.',
 112:'O processamento digital de imagens se inicia com a captura da imagem, a qual pode ser considerada como a iluminação refletida na superfície dos objetos.',
 113:'O pré-processamento envolve a filtragem de ruídos introduzidos por sensores e a correção das distorções advindas do próprio sensor.',
 114:'Para separar o objeto do pano de fundo, podem ser utilizadas técnicas como segmentação, regularização e modelagem.',
 115:'Combinando-se três a três e em diferentes intensidades as cores primárias do modelo cromático RGB, obtêm-se as cores secundárias ciano, magenta e amarelo.',
 116:'Em um sinal de vídeo entrelaçado, a varredura das linhas da tela percorre primeiro as linhas ímpares e depois as pares.',
 117:'Os padrões MPEG especificam o processo de codificação, mas não estabelecem os requisitos de sintaxe e semântica das sequências de bits e o processo de decodificação.',
 118:'O MPEG utiliza subamostragem de cor, considerando as características do sistema visual humano.',
 119:'Uma fonte de sinal de vídeo colorido deve ter três componentes: uma de luminância e duas de crominância, que, combinadas, definem a tonalidade da cor.',
 120:'Os valores de pixels são independentes, sem correlação com seus vizinhos tanto no mesmo quadro quanto entre quadros consecutivos.'
}
const contextos={
 76:'Contexto da prova: a digitalização do sinal é composta por filtragem anti-aliasing, amostragem e quantização, nessa ordem. A filtragem utiliza filtro passa-baixas ideal com frequência de corte de 10 kHz; a quantização usa conversor A/D de 512 níveis.',
 80:'Contexto da prova: o filtro analógico é descrito pela equação diferencial d/dt y(t) + 10y(t) = d/dt x(t), em que x(t) é a entrada, y(t) é a saída e t está em segundos.',
 84:'Contexto da prova: x[n] = (2/5)ⁿu[n]; considere X(z) como sua transformada Z.',
 87:'Contexto da prova: considere os cinco sinais discretos x₁[n]…x₅[n], nulos para 0 ≤ n < N e para n < 0 ou n ≥ N, e suas transformadas de Fourier discreta X₁[k]…X₅[k]. O caderno define X₃[k] = X₁[k] · X₂[k], X₄[k] = WₙᵏᵐX₁[k], Wₙ = e^(−j2π/N) e x₅[n] = 8x₁[n] + 9x₂[n]; essas relações dão base aos itens 87 a 90.',
 91:'Contexto da prova: o filtro digital é definido pela equação de diferenças y[n] − (3/7)y[n − 1] = x[n], em que x[n] é a entrada e y[n] é a saída.'
}
const pagina=n=>n<=75?1:n<=100?2:3
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==78)throw Error(`Esperados 78 registros pendentes exportados; recebido ${exportado.length}`)
const decisoes=exportado.map(q=>{
 const n=q.numero,meta=areas.get(n)
 if(!meta)throw Error(`Questão sem classificação: ${q.id} / ${n}`)
 const dup=duplicadas[q.id]
 const contexto=Object.entries(contextos).filter(([inicio])=>n>=Number(inicio)&&n<=(Number(inicio)===76?79:Number(inicio)===80?83:Number(inicio)===84?86:Number(inicio)===87?90:95)).map(([,v])=>v).join('\n\n')
 const limpar=(correcoes[n]||q.enunciado).replace(/\s*(?:Espaço livre|CEBRASPE\s*[–-]\s*INPI\s*[–-]\s*Edital:\s*2023|--\s*CONHECIMENTOS ESPECÍFICOS\s*--)[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:limpar,materia:meta.materia,conteudo:meta.conteudo,ano:2023,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — conhecimentos específicos — Cargo 15 — caderno 1 — aplicada em 2024',numero_original:n,numero:n,pagina:pagina(n),dificuldade:meta.dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência conceitual, matemática e técnica do item; não é índice psicométrico publicado pela banca.',classificacao_fonte:prova,motivo:`Classificação individual conforme o bloco e o conteúdo do item ${n} no caderno oficial do Cargo 15; a área do cargo consta no edital oficial do INPI.`,texto_apoio:contexto||'',apoio:[],imagem_pagina:`paginas/${doc}-${String(pagina(n)).padStart(4,'0')}.webp`,apta_resolucao:!dup,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],...(dup?{inelegibilidade_motivo:'duplicata_de_questao_reconstruida_a_partir_do_caderno_oficial',duplicada_de:dup}:{})}
})
if(decisoes.length!==78||decisoes.filter(x=>x.apta_resolucao===false).length!==8)throw Error('A contagem de registros ou duplicatas não confere')
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({nome,documento_id:doc,prova,gabarito,questoes_revisadas:decisoes.length,questoes_unicas_classificadas:70,duplicatas_inelegiveis:8,gabarito_automatico:'não vinculado: o PDF oficial está listado, mas não foi possível inspecionar seu conteúdo neste ambiente; respostas automáticas permanecem desativadas',resultado},null,2))
console.log(JSON.stringify({nome,questoes_revisadas:decisoes.length,questoes_unicas_classificadas:70,duplicatas_inelegiveis:8,materias:[...new Set(decisoes.filter(x=>x.apta_resolucao).map(x=>x.materia))],resultado},null,2))
