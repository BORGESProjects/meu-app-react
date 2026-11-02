import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='e396a9894fdbc169',ano=2024
const prova='https://cdn.cebraspe.org.br/concursos/petrobras_23_ntj/arquivos/950_PETROBRAS_23_012_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/petrobras_23_ntj/arquivos/GAB_DEFINITIVO_950_PETROBRAS_23_012_01.PDF'
const concurso='PETROBRAS PSP RH 2023.2 — Profissional de Nível Técnico Júnior — Ênfase 12: Projetos, Construção e Montagem — Instrumentação'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==60||catalog.arquivo!=='950_PETROBRAS_23_012_01.PDF')throw Error('Catálogo Petrobras Instrumentação divergente')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-polcal-papiloscopista-2023-v195'))
if(start<0)throw Error('Base local v195 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),wanted=new Set(catalog.questoes.map(q=>q.id)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){active.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(active.size!==60||wanted.size)throw Error(`Esperados 60 itens Petrobras Instrumentação; encontrados ${active.size}; ausentes ${wanted.size}`)
const theme={
41:['Instrumentação Industrial','Norma ISA S5.1: identificação e codificação de instrumentos'],42:['Instrumentação Industrial','Norma ISA S5.1: símbolos de linhas de sinal e transmissão hidráulica'],43:['Instrumentação Industrial','Norma ISA S5.1: símbolos de instrumentos de campo'],44:['Instrumentação Industrial','Norma ISA S5.1: codificação de indicadores de nível'],45:['Instrumentação Industrial','Diagramas P&ID: malha de controle de vazão'],46:['Instrumentação Industrial','Sinais elétricos em malha transmissor-controlador-atuador'],47:['Instrumentação Industrial','Medição de vazão e pressão diferencial por tubo de Venturi'],48:['Instrumentação Industrial','Elementos finais de controle: válvula e atuador mola-diafragma'],49:['Metrologia','Sistema de medição: sensor e elemento primário'],50:['Metrologia','Precisão, exatidão e qualidade de resultados de medição'],51:['Metrologia','Erro de medição e diferença entre valor de referência e medido'],52:['Instrumentação Industrial','Termopares, efeito termoelétrico e junção de medição'],53:['Instrumentação Industrial','Medição de vazão: placa de orifício e transdução'],54:['Instrumentação Industrial','Medição de pressão relativa com tubo de Bourdon'],55:['Física','Escalas termométricas e intervalos Celsius-Kelvin'],56:['Automação Industrial','Sinais analógicos e digitais em transmissão e processamento'],57:['Automação Industrial','Transmissores pneumáticos em controle de processos industriais'],58:['Automação Industrial','Acionamentos pneumáticos e hidráulicos de cilindros'],59:['Automação Industrial','Sinais analógicos contínuos e sinais digitais discretos'],60:['Automação Industrial','Sistemas pneumáticos: operação e manutenção'],61:['Metrologia','Calibração e relação com padrões metrológicos nacionais e internacionais'],62:['Metrologia','Rastreabilidade metrológica e calibração de instrumentos'],63:['Automação Industrial','Representação digital de sinais e sistemas discretos'],64:['Instrumentação Industrial','Válvulas industriais: funções e elementos de condicionamento'],65:['Instrumentação Industrial','Elementos finais de controle e regulação de variáveis de processo'],66:['Instrumentação Industrial','Válvulas pneumáticas, hidráulicas e motorizadas'],67:['Instrumentação Industrial','Atuadores e indicadores de posição'],68:['Instrumentação Industrial','Posicionadores, indicadores e filtros-reguladores'],69:['Automação Industrial','Controle pneumático de posição de válvulas e cilindros'],70:['Instrumentação Industrial','Válvulas solenoides e acionamento eletromagnético'],71:['Automação Industrial','SCADA: supervisão, historiador, alarmes e eventos'],72:['Tubulação Industrial','Desenho de tubulação: isométricos e plantas ortogonais'],73:['Automação Industrial','Sistemas digitais de controle distribuído (SDCD/DCS)'],74:['Automação Industrial','Sistemas de malha fechada e realimentação de processo'],75:['Automação Industrial','CLP: linguagem Ladder e lógica de relés'],76:['Instrumentação Industrial','Medição de vazão por placa de orifício'],77:['Automação Industrial','Redes industriais: protocolo PROFIBUS'],78:['Automação Industrial','HART: comunicação digital sobre sinal analógico 4–20 mA'],79:['Segurança de Processo','Sistemas instrumentados de segurança e camadas independentes de proteção'],80:['Instrumentação Industrial','Termopares: princípio de medição por diferença de potencial'],81:['Instrumentação Industrial','Sensores de processo e realimentação para ações de controle'],82:['Instrumentação Industrial','Analisadores de processo: medição de pH'],83:['Manutenção Industrial','Manutenção corretiva planejada e não planejada'],84:['Instalação de Instrumentos','Aterramento, proteção contra surtos e instalação de instrumentos'],85:['Comissionamento','Comissionamento de sistemas e verificação de prontidão operacional'],86:['Desenho Técnico','AutoCAD: círculo, aparar, deslocamento e construção geométrica'],87:['Mecânica dos Fluidos','Manometria diferencial: tubo em U e tubo inclinado'],88:['Mecânica dos Fluidos','Tubo de Pitot-estático: pressão estática e de estagnação'],89:['Segurança de Processo','SIS: redução de risco e confiabilidade operacional'],90:['Segurança de Processo','Nível de integridade de segurança (SIL) e fator de redução de risco'],91:['Gestão de Projetos','PERT: estimativas de duração otimista, provável e pessimista'],92:['Gestão de Projetos','CPM: caminho crítico, duração normal e duração acelerada'],93:['Segurança do Trabalho','CIPA: composição e prevenção de acidentes ocupacionais'],94:['Segurança do Trabalho','Proteção contra incêndio: classes de fogo e agentes extintores'],95:['Eletrônica Digital','Latch SR: estados lógicos de set e reset'],96:['Eletrônica Digital','Máquinas de estados síncronas e sinal de clock'],97:['Eletrônica Analógica','Transistor bipolar de junção (TBJ): polarização e ponto de operação'],98:['Materiais e Tubulação','Tubos de aço inoxidável sem costura e especificação ASTM A269'],99:['Materiais e Tubulação','Tubos para instrumentação: material e dimensões nominais'],100:['Tubulação Industrial','Tubulações de pequeno diâmetro: classe e aplicação em áreas de risco']
}
if(Object.keys(theme).length!==60)throw Error('Classificação temática não cobre os 60 itens')
const groups=[
 ['E','C','E','C','C','E','E','C','C','E','C','C','E','C','E','C','C','E','E','E'],
 ['E','E','C','E','C','C','C','C','C','C','E','E','C','C','C','C','E','E','E','C'],
 ['C','E','C','C','E','E','E','C','E','C','E','C','E','C','C','E','C','C','C','E']
]
const answers=groups.flat()
if(answers.length!==60)throw Error('Gabarito Petrobras deve conter 60 respostas')
const digest=hashRevisao(answers.join(','))
const contexts=[
 [41,44,'Os símbolos e códigos das figuras originais representam sistemas de controle de processos industriais segundo a norma ISA S5.1.'],
 [45,48,'O diagrama original mostra uma malha de controle industrial com transmissor, controlador, elemento final de controle e sinalização entre os componentes.'],
 [49,51,'Em processos industriais, o sistema de medição situa-se entre o processo e o observador da variável de interesse.'],
 [52,55,'As variáveis de processo mais medidas incluem pressão, vazão, nível e temperatura, além de concentração e massa.'],
 [56,60,'Contexto: transmissão e transmissores pneumáticos, eletrônicos analógicos, digitais e inteligentes.'],
 [61,63,'Contexto: calibração, rastreabilidade e manipulação de sinais digitais em sistemas de instrumentação.'],
 [64,70,'Contexto: elementos finais de controle e acessórios usados para regular variáveis de processos industriais.'],
 [71,75,'Contexto: projeto de tubulação industrial, supervisão e controle de processos.'],
 [76,81,'Contexto: protocolos de campo, sistemas instrumentados de segurança, elementos primários de medição e sensores.'],
 [82,85,'Contexto: instalação, manutenção de instrumentos, analisadores e comissionamento de sistemas.'],
 [87,88,'Contexto: medição de pressão e diferença de pressão em sistemas fluidos com líquidos e gases.'],
 [89,90,'Contexto: sistemas instrumentados de segurança (SIS), níveis SIL e redução de risco.'],
 [91,92,'Contexto: planejamento de projetos pelas técnicas PERT e CPM.'],
 [93,94,'Contexto: saúde e segurança do trabalho e prevenção de incêndios.'],
 [95,97,'As figuras originais representam circuito lógico latch SR e estágio com transistor bipolar (TBJ); consulte a página associada ao item.'],
 [98,100,'Contexto: características de tubulações para instrumentação, controle e automação, com figuras/tabelas da página original.']
]
const page=new Map(catalog.questoes.map(q=>[q.numero,q.pagina]))
const difficult=new Set([41,43,47,48,50,51,53,55,58,61,62,64,68,69,71,72,73,74,75,78,79,86,87,88,90,91,92,95,96,97,98,100])
const medium=new Set([42,44,45,46,49,52,54,56,57,59,60,63,65,66,67,70,76,77,80,81,82,83,84,85,89,93,94,99])
const decisions=catalog.questoes.map(e=>{
 const q=active.get(e.id),n=e.numero,p=page.get(n),t=theme[n],answer=answers[n-41]
 if(!t||!p||!q.enunciado||!answer)throw Error(`Item ${n}: classificação, enunciado, página ou resposta ausente`)
 const context=contexts.find(([a,b])=>n>=a&&n<=b)?.[2]
 return {id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano,concurso,numero_original:n,pagina:p,dificuldade:difficult.has(n)?'Difícil':medium.has(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no conhecimento técnico e no número de etapas de interpretação ou cálculo; não é faixa oficial da banca.',motivo:`Item ${n} conferido no caderno oficial da ênfase Instrumentação; assunto específico: ${t[1]}.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do enunciado e da seção técnica na prova oficial'},resposta_correta:answer==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_950_PETROBRAS_23_012_01.PDF',prova:catalog.arquivo,numero:n,pagina:1,resposta:answer,sha256:digest,hash_metodo:'SHA-256 da sequência normalizada de respostas C/E transcritas da tabela oficial; não é hash do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE para a Ênfase 12 — Instrumentação.'},imagem_pagina:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,...(context?{texto_apoio:context}:{})}
})
for(const p of [1,2,3])if(!await fs.stat(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`).catch(()=>null))throw Error(`Imagem original ausente: página ${p}`)
const result=await aplicarRevisoesIndividuais({nome:'revisao-petrobras-instrumentacao-2024-v196',base,decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-petrobras-instrumentacao-2024-v196/acervo-extraido')
const out={...result,documento:catalog.arquivo,registros_revistos:60,itens_classificados:60,gabaritos_oficiais_associados:60,paginas_originais_conferidas:[1,2,3],data_aplicacao:'2024-03-24',prova,gabarito,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-petrobras-instrumentacao-2024-v196.json',JSON.stringify(out,null,2))
const section=`\n\n## Revisão Petrobras — Instrumentação — v196\n\n- Revisei os 60 itens, números 41–100, da prova da Ênfase 12 — Projetos, Construção e Montagem — Instrumentação, aplicada em 24/03/2024. Corrigi a banca/aplicação, classifiquei cada questão por matéria e conteúdo técnico específico e registrei ano, cargo, página e dificuldade estimada.\n- Associei as 60 respostas do gabarito definitivo oficial. Vinculei as páginas originais e restabeleci os contextos compartilhados das figuras ISA, malhas de controle, sistema de medição, variáveis de processo, transmissão, válvulas, automação, comissionamento, PERT/CPM e tubulações. Diagramas de circuitos e instrumentos permanecem disponíveis pela imagem da página correspondente.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno da Ênfase 12](https://cdn.cebraspe.org.br/concursos/petrobras_23_ntj/arquivos/950_PETROBRAS_23_012_01.PDF), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/petrobras_23_ntj/arquivos/GAB_DEFINITIVO_950_PETROBRAS_23_012_01.PDF), [página oficial do processo seletivo](https://www.cebraspe.org.br/concursos/PETROBRAS_23_NTJ).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out,null,2))
