import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pf-perito-eletrica-2018-v222',doc='8262d211d2bf4345'
const prova='https://cdn.cebraspe.org.br/concursos/PF_18/arquivos/MATRIZ_408_DGPPF003__PAG_4.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/pf_18/arquivos/GAB_DEFINITIVO_408_DGPPF003__PAG_4.PDF'
const concurso='Polícia Federal 2018 — Perito Criminal Federal, Cargo 3, Área 2: Engenharia Elétrica e Eletrônica'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70||catalog.questoes[0].numero!==51||catalog.questoes.at(-1).numero!==120)throw Error('Caderno PF Cargo 3/Área 2 diverge do inventário')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-ebserh-necropsia-2018-v221'))
if(start<0)throw Error('Base anterior v221 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const byId=new Map(),wanted=new Set(catalog.questoes.map(x=>x.id))
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==70||wanted.size)throw Error(`Esperados 70 itens PF; encontrados ${byId.size}; ausentes ${wanted.size}`)
// Conferência explícita da sequência do PDF definitivo, itens 51–120.
const keys=['E','C','E','E','E','E','C','E','E','E','E','C','C','E','E','C','C','C','C','C','C','C','C','C','E','E','C','E','E','E','E','E','E','C','C','X','C','C','C','E','E','C','C','C','E','C','E','E','E','E','E','C','C','E','C','X','C','C','E','E','E','E','C','E','C','C','E','E','C','C']
if(keys.length!==70)throw Error(`Gabarito inválido: ${keys.length}/70`)
const contexts={
 51:'Considere que, para medir uma resistência elétrica de valor padrão 1.500 Ω, estão disponíveis dois ohmímetros digitais, A e B, cujos valores medidos são 1.600 Ω e 1.550 Ω, respectivamente. Julgue os itens sobre precisão, exatidão e medição.',
 55:'Julgue os itens a seguir sobre representação de sinais nos domínios do tempo e da frequência.',
 58:'Os circuitos A e B são filtros RC, com componentes R e C e entradas e saídas indicadas. O filtro A é passa-baixas; o filtro B é passa-altas. Considere os diagramas originais associados à página do item ao resolver as afirmações sobre topologia e frequência de corte.',
 63:'Considere as memórias da tabela do caderno: A — ROM, 2K × 8; B — EEPROM, 1K × 16; C — RAM, 4096 × 20. Julgue os itens sobre capacidade, escrita e tempo de acesso.',
 67:'Considere o circuito combinacional de verificação de paridade par mostrado na página original, formado por portas XOR em cascata e entradas P, B₃, B₂, B₁ e B₀. Julgue as afirmações sobre detecção de erros.',
 70:'Julgue os itens acerca de amplificadores operacionais e configuração cascode em circuitos com transistores.',
 73:'Julgue as afirmações sobre processamento digital de sinais, sistemas lineares invariantes no tempo, transformada de Fourier e FFT.',
 76:'Julgue os itens sobre codificação digital de sinais de voz, imagens e vídeo, compressão sem perdas e filtros FIR.',
 80:'Julgue os itens sobre propagação de ondas eletromagnéticas e linhas de transmissão de radiofrequência.',
 85:'Julgue as afirmações sobre antenas e elementos de sistemas de comunicação.',
 88:'Julgue os itens sobre técnicas de modulação analógica e digital, incluindo DPSK, QAM, AM, FM, PM, FSK, ASK, PSK e modulação delta.',
 95:'Julgue os itens sobre conversão analógico-digital, PCM, compansão pelas leis A e µ e multiplexação por divisão do tempo.',
 100:'Julgue os itens sobre telefonia celular de segunda geração, espalhamento espectral CDMA, codecs e arquitetura GSM.',
 105:'Julgue os itens sobre comutação de circuitos, comutação de pacotes, datagramas e circuitos virtuais.',
 107:'Julgue os itens sobre protocolos da arquitetura TCP/IP, transporte UDP/TCP, checksum, CRC e encapsulamento de sinalização SS-7.',
 110:'Julgue os itens sobre padrões de redes locais Ethernet (IEEE 802.3), CSMA/CD e redes sem fio IEEE 802.11.',
 112:'Julgue as afirmações sobre IEEE 802.11n, MIMO, agregação de canais e quadros A-MSDU/A-MPDU, além dos padrões 802.11ac e 802.11ad.',
 116:'Após o sequestro da esposa de um gerente, os autores fizeram ligações gravadas. Nas duas primeiras, um homem disfarçava a voz com fonação crepitante; foram observadas variações de frequência fundamental, fricativas alveolares [s] e alveolopalatais [ʃ], [ʒ], e a mulher foi amordaçada com uma vareta entre os caninos. As gravações dos suspeitos foram comparadas às ligações. Julgue os itens sobre fonética acústica, articulação e identificação forense da voz.'
}
const startFor=n=>Object.keys(contexts).map(Number).filter(x=>x<=n).at(-1)
const topics={
 51:['Engenharia Elétrica','Metrologia elétrica: precisão, exatidão e erro de medição'],52:['Engenharia Elétrica','Metrologia elétrica: erro absoluto e exatidão de instrumentos'],53:['Engenharia Elétrica','Metrologia elétrica: aferição, calibração e correção de erros'],54:['Engenharia Elétrica','Medições elétricas: procedimento de medição de resistência'],
 55:['Engenharia Elétrica','Sinais e sistemas: representação no domínio do tempo e da frequência'],56:['Engenharia Elétrica','Processamento de sinais: densidade espectral de potência'],57:['Engenharia Elétrica','Modulação: translação espectral por multiplicação no tempo'],58:['Engenharia Elétrica','Circuitos elétricos: convolução e filtragem no domínio da frequência'],59:['Engenharia Elétrica','Circuitos RC: filtros ativos e passivos'],60:['Engenharia Elétrica','Filtros analógicos: frequências de corte de circuitos RC'],61:['Engenharia Elétrica','Filtros analógicos: topologias passa-baixas e passa-altas'],62:['Engenharia Elétrica','Filtros RC: cálculo da frequência de corte'],
 63:['Sistemas Digitais','Memórias: capacidade de armazenamento e organização'],64:['Sistemas Digitais','Memórias EEPROM: apagamento e regravação'],65:['Sistemas Digitais','Memórias RAM: endereçamento e tempo de acesso'],66:['Sistemas Digitais','Memórias: cálculo e comparação de capacidade'],67:['Sistemas Digitais','Códigos de detecção de erros: paridade par'],68:['Sistemas Digitais','Código de paridade: detecção de erros simples e múltiplos'],69:['Sistemas Digitais','Circuitos lógicos: saída do verificador de paridade'],
 70:['Eletrônica Analógica','Amplificadores operacionais: amplificador ideal e tensão diferencial'],71:['Eletrônica Analógica','Amplificadores operacionais reais: tensão de offset de entrada'],72:['Eletrônica Analógica','Transistores: amplificador cascode e configurações emissor comum/base comum'],
 73:['Processamento Digital de Sinais','Sistemas LIT: funções exponenciais como autofunções'],74:['Processamento Digital de Sinais','Séries e transformada de Fourier: sinais periódicos de tempo contínuo'],75:['Processamento Digital de Sinais','Transformada rápida de Fourier: complexidade computacional'],76:['Processamento Digital de Sinais','PCM: amostragem e codificação de sinais analógicos'],77:['Processamento Digital de Sinais','Codificação de Huffman: compressão sem perdas'],78:['Processamento Digital de Sinais','Compressão de vídeo: MPEG-1 e MPEG-2'],79:['Processamento Digital de Sinais','Filtros digitais FIR: resposta ao impulso e equação de saída'],
 80:['Telecomunicações','Ondas eletromagnéticas: campos elétrico e magnético'],81:['Telecomunicações','Espectro eletromagnético: comparação entre infravermelho e ultravioleta'],82:['Telecomunicações','Linhas balanceadas: fase das correntes em condutores simétricos'],83:['Telecomunicações','Linhas de transmissão: impedância característica e coeficiente de onda estacionária'],84:['Telecomunicações','Linhas de transmissão: repetição de impedância em trecho de meia onda'],85:['Telecomunicações','Antenas: monopolo de quarto de onda e plano de terra'],86:['Telecomunicações','Antenas direcionais: comparação entre Yagi e log-periódica'],87:['Telecomunicações','Conversão analógico-digital: erro de quantização'],
 88:['Telecomunicações','Modulação digital: DPSK e codificação diferencial de fase'],89:['Telecomunicações','Modulação digital: QAM, constelação e quantidade de bits por símbolo'],90:['Telecomunicações','Modulações analógicas e digitais: AM, FM, PM, FSK, ASK, PSK e QAM'],91:['Telecomunicações','Modulação FM e AM: suscetibilidade a ruído'],92:['Telecomunicações','Modulação em amplitude: largura de banda de transmissão'],93:['Telecomunicações','Modulação delta: comparação com sinal de referência'],94:['Telecomunicações','PCM: amostragem, quantização e codificação'],
 95:['Telecomunicações','PCM de voz: taxa de amostragem, bits por amostra e taxa binária'],96:['Telecomunicações','Compansão: distribuição de amplitudes e faixa dinâmica do quantizador'],97:['Telecomunicações','ITU-T G.711: leis de compansão A e µ'],98:['Telecomunicações','Multiplexação TDM: hierarquia digital norte-americana DS0/T1'],99:['Telecomunicações','Telefonia digital: interoperabilidade entre leis A e µ'],100:['Telecomunicações','Telefonia celular: CDMA, TDMA e espalhamento espectral'],101:['Telecomunicações','GSM: codecs de voz e codificação preditiva linear LPC'],102:['Telecomunicações','GSM: acesso múltiplo FDMA/TDMA e salto lento em frequência'],103:['Telecomunicações','Arquitetura GSM: estação móvel, SIM e interface Um'],104:['Telecomunicações','Sinalização SS-7 sobre redes IP: transporte TCP e UDP'],
 105:['Redes de Computadores','Comutação de redes: eficiência de circuitos em tráfego em rajada'],106:['Redes de Computadores','Comutação de pacotes: datagramas e circuitos virtuais'],107:['Redes de Computadores','Arquitetura TCP/IP: protocolos de transporte TCP e UDP'],108:['Redes de Computadores','UDP: aplicações DNS, NFS, DHCP, SNMP, streaming e VoIP'],109:['Redes de Computadores','Detecção de erros em redes: checksum e CRC'],110:['Redes de Computadores','Ethernet IEEE 802.3: acesso ao meio CSMA/CD'],111:['Redes de Computadores','Ethernet e Wi-Fi: tamanho mínimo de quadro e detecção de colisão'],112:['Redes de Computadores','IEEE 802.11n: MIMO, ganho de diversidade e multiplexação espacial'],113:['Redes de Computadores','IEEE 802.11n: agregação A-MSDU e A-MPDU'],114:['Redes de Computadores','IEEE 802.11ac: faixa de frequência, canais e MIMO'],115:['Redes de Computadores','IEEE 802.11ad: ondas milimétricas em 60 GHz e beamforming'],
 116:['Fonética e Fonologia','Fonética forense: ponto de articulação e variação regional'],117:['Fonética e Fonologia','Fonética acústica: fonte glótica, filtro e articulação da fala'],118:['Fonética e Fonologia','Fonética acústica: frequência fundamental e formantes vocálicos'],119:['Fonética e Fonologia','Fonética acústica: formante F1 e efeitos vocais do grito'],120:['Fonética e Fonologia','Fonética articulatória: efeitos de mordaça sobre a produção de consoantes']
}
if(Object.keys(topics).length!==70)throw Error('Classificação não cobre os 70 itens')
const answerDigest=hashRevisao(keys.join(',')),annulled=new Set([86,106])
const corrections={
 62:'No filtro A, considerando-se R = 1/3 kΩ, C = 500 pF e π = 3, a frequência de corte será de 1 MHz.',
 64:'A memória B possui a capacidade de apagar e reescrever bits individuais em sua matriz.',
 74:'Sinais periódicos de tempo contínuo podem ser representados por meio da transformada de Fourier como uma integral ponderada de senoides complexas de tempo contínuo, cujas frequências variam continuamente de −∞ a ∞.',
 75:'Em comparação com a implementação direta da transformada de Fourier, o uso da transformada rápida de Fourier reduz o número de operações entre multiplicações e adições complexas de N² para (log₂ N)/N.',
 88:'A modulação DPSK (differential phase shift keying) consiste em variar a fase do sinal portador em 180 graus sempre que ocorre o bit zero.',
 89:'A técnica QAM (quadrature amplitude modulation) permite transmitir, simultaneamente, mais de 8 bits.',
 95:'Na digitalização de um sinal de voz para o padrão PCM, o sinal é amostrado a uma taxa de 8.000 amostras por segundo, seguido da codificação digital utilizando-se 8 bits por amostra, o que gera um sinal PCM de taxa igual a 56 kbps.',
 116:'A informação relativa ao ponto de articulação das consoantes da fala dos suspeitos pode levar à identificação de sua provável região de origem, pois a posição dos articuladores em certas consoantes, como [s] versus [ʃ] em palavras como “poste” e “mais”, é um dos aspectos que diferenciam as variedades regionais do português brasileiro.'
}
const pageFor=n=>catalog.questoes.find(x=>x.numero===n).pagina
for(let p=1;p<=4;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const decisions=[]
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero
 if(!q)throw Error(`Item ${n} ausente`)
 const [materia,conteudo]=topics[n],k=keys[n-51],ctx=contexts[startFor(n)],page=pageFor(n),anulada=annulled.has(n)
 if(!materia||!conteudo||!ctx||!k)throw Error(`Item ${n}: classificação, contexto ou gabarito ausente`)
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,concurso,numero_original:n,pagina:page,
  dificuldade:[62,73,74,75,83,88,89,97,98,102,106,109,113,116,117,118,119,120].includes(n)?'Difícil':[51,52,54,63,64,66,70,71,72,77,78,80,81,85,90,91,92,93,94,95,100,103,110,111,114,115].includes(n)?'Fácil':'Média',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela quantidade de conceitos e etapas técnicas cobrados; a banca não divulga dificuldade psicométrica por item.',
  enunciado:corrections[n]||q.enunciado,opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],texto_apoio:ctx,resposta_correta:anulada?null:k==='C'?0:1,anulada,
  gabarito_oficial:{valor:k,fonte:gabarito,arquivo:'GAB_DEFINITIVO_408_DGPPF003__PAG_4.PDF',prova,numero:n,pagina:1,sha256:answerDigest,hash_metodo:'SHA-256 da sequência dos 70 valores definitivos, itens 51–120; não é hash criptográfico do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE — Polícia Federal 2018, Perito Criminal Federal, Cargo 3/Área 2.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura temática item a item e conferência visual das páginas originais e do gabarito definitivo.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${page} do caderno oficial associada ao item ${n}; imagens de circuito, tabela e texto-base preservadas quando aplicáveis.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v222 do item ${n}: matéria e assunto específicos, concurso/área, ano, dificuldade estimada, contexto compartilhado e gabarito definitivo conferidos.${corrections[n]?' Texto corrigido pela página original.':''}${anulada?' Item anulado no gabarito definitivo.':''}`})
}
if(decisions.length!==70)throw Error(`Esperados 70 itens do caderno PF; encontrados ${decisions.length}`)
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,itens_revisados:decisions.length,itens_no_caderno:70,anuladas:[86,106],correcoes_ocr:Object.keys(corrections),paginas_originais:4,publicado:false},null,2))
