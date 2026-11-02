import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-insa-ciencia-alimentos-cargo2-2025-lote-v456'
const doc='5d517cc681adc63b'
const prova='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/036_MCTIINSA_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/Gab_Definitivo_036_MCTIINSA_002_01.PDF'
const concurso='INSA/MCTI 2024 — Pesquisador Adjunto I — Ciência e Tecnologia de Alimentos'
const cargo='Pesquisador Adjunto I — área Ciência e Tecnologia de Alimentos (P02) — caderno 036_MCTIINSA_002_01'
const blocos=[
 'E E C E E E C C E C E E C E C E E C C C',
 'E E C C C E E E C E C C E E C E X E C E',
 'C C E C C E C E C E C E E C C E C X C E',
 'C C C X E E C C E E'
]
const seq=blocos.flatMap(x=>x.split(' '))
if(seq.length!==70)throw Error(`Gabarito esperado de 70 itens, recebido ${seq.length}`)
const respostas=Object.fromEntries(seq.map((v,i)=>[String(i+51),v]))

const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
const pos=linhas.findIndex(l=>l.startsWith(`{"documento_id":"${doc}"`))
const chave=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const registro={documento_id:doc,arquivo_prova:'036_MCTIINSA_002_01.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'Gab_Definitivo_036_MCTIINSA_002_01.PDF',tipo:'Gabarito oficial definitivo — Cargo 2: Pesquisador Adjunto I — Ciência e Tecnologia de Alimentos (P02)',criterio:'Identificador do caderno 036_MCTIINSA_002_01; aplicação oficial em 23/02/2025',status:'tabela_lida',sha256:chave,respostas,linhas:4}
if(pos>=0)linhas[pos]=JSON.stringify(registro);else linhas.push(JSON.stringify(registro))
await fs.writeFile(arquivoCatalogo,`${linhas.join('\n')}\n`)

const temas={
 51:['Ciência e Tecnologia de Alimentos','Amidos: estrutura e aplicações tecnológicas'],52:['Ciência e Tecnologia de Alimentos','Pós-colheita: respiração e amadurecimento de frutos'],53:['Ciência e Tecnologia de Alimentos','Composição centesimal e química da carne'],54:['Ciência e Tecnologia de Alimentos','Fisiologia pós-colheita: frutos climatéricos e não climatéricos'],55:['Ciência e Tecnologia de Alimentos','Concentração a vácuo de sucos e polpas'],56:['Ciência e Tecnologia de Alimentos','Tecnologia do leite: padronização do teor de gordura'],57:['Ciência e Tecnologia de Alimentos','Desidratação de leite: concentração e secagem por atomização'],58:['Ciência e Tecnologia de Alimentos','Escurecimento enzimático: sulfitação'],59:['Ciência e Tecnologia de Alimentos','Branqueamento e controle do escurecimento enzimático'],60:['Ciência e Tecnologia de Alimentos','Secagem solar de alimentos'],61:['Ciência e Tecnologia de Alimentos','Secagem por atomização e liofilização'],62:['Ciência e Tecnologia de Alimentos','Liofilização: sublimação e transferência de massa'],63:['Ciência e Tecnologia de Alimentos','Fermentação alcoólica e produção de cerveja'],64:['Ciência e Tecnologia de Alimentos','Fermentação alcoólica e acética na produção de vinagre'],65:['Ciência e Tecnologia de Alimentos','PANC: identificação e partes comestíveis'],66:['Ciência e Tecnologia de Alimentos','PANC: composição nutricional e segurança de consumo'],67:['Ciência e Tecnologia de Alimentos','Aproveitamento de resíduos cítricos'],68:['Ciência e Tecnologia de Alimentos','Resíduos agroindustriais como substratos fermentativos'],69:['Ciência e Tecnologia de Alimentos','Extração de pectina de resíduos de frutas'],70:['Ciência e Tecnologia de Alimentos','Compostos antioxidantes de resíduos vegetais'],71:['Ciência e Tecnologia de Alimentos','Valorização de subprodutos de origem animal'],72:['Ciência e Tecnologia de Alimentos','Aproveitamento de subprodutos da indústria de laticínios'],73:['Ciência e Tecnologia de Alimentos','Desenvolvimento de produtos do semiárido: maracujá-da-caatinga'],74:['Ciência e Tecnologia de Alimentos','Fermentação mista e kombucha de frutas regionais'],75:['Ciência e Tecnologia de Alimentos','Clarificação de bebidas alcoólicas'],76:['Ciência e Tecnologia de Alimentos','Alimentos funcionais e alegações de propriedades funcionais'],77:['Legislação de Alimentos','Identidade e definição legal de suco ou sumo'],78:['Ciência e Tecnologia de Alimentos','Biorreatores e produção sustentável de bebidas'],79:['Microbiologia de Alimentos','Clostridium botulinum, esporos e conservação de alimentos'],80:['Microbiologia de Alimentos','Microrganismos de importância em alimentos'],81:['Microbiologia de Alimentos','Branqueamento e redução da carga microbiana'],82:['Microbiologia de Alimentos','Toxinfecção alimentar por Staphylococcus aureus'],83:['Análise Sensorial de Alimentos','Propriedades sensoriais e percepção olfativa'],84:['Análise Sensorial de Alimentos','Análise descritiva quantitativa'],85:['Análise Sensorial de Alimentos','Testes discriminativos: método duo-trio'],86:['Ciência e Tecnologia de Alimentos','Congelamento e formação de cristais de gelo'],87:['Ciência e Tecnologia de Alimentos','Conservação por salga e fermentação lática'],88:['Ciência e Tecnologia de Alimentos','Pasteurização e alimentos termossensíveis'],89:['Ciência e Tecnologia de Alimentos','Esterilização comercial de frutas e conservas'],90:['Ciência e Tecnologia de Alimentos','Transferência de calor e esterilização de alimentos'],91:['Ciência e Tecnologia de Alimentos','Pasteurização do leite: binômio tempo-temperatura'],92:['Ciência e Tecnologia de Alimentos','Liofilização: sublimação da água congelada'],93:['Ciência e Tecnologia de Alimentos','Salga de queijos e transferência de massa'],94:['Segurança de Alimentos','APPCC: identificação de perigos e medidas preventivas'],95:['Segurança de Alimentos','Higiene, manipulação e contaminação microbiológica'],96:['Segurança de Alimentos','APPCC: resfriamento de frango e ponto crítico de controle'],97:['Segurança de Alimentos','Boas práticas: definição de manipulador de alimentos'],98:['Segurança de Alimentos','Saúde dos manipuladores e qualidade higiênico-sanitária'],99:['Embalagens de Alimentos','Materiais de embalagem: inocuidade e compatibilidade'],100:['Embalagens de Alimentos','Embalagem primária, secundária e contato com o alimento'],101:['Segurança de Alimentos','Ocratoxina A e contaminantes em produtos de origem animal'],102:['Microbiologia de Alimentos','Endotoxinas e intoxicação alimentar'],103:['Segurança de Alimentos','Persistência de micotoxinas em alimentos'],104:['Segurança de Alimentos','Estabilidade térmica de toxinas e micotoxinas'],105:['Segurança de Alimentos','Adulteração do leite: detecção de peróxido de hidrogênio'],106:['Segurança de Alimentos','Resíduos de antibióticos no leite e risco à saúde'],107:['Segurança de Alimentos','APPCC: controle de perigos biológicos, químicos e físicos'],108:['Segurança de Alimentos','Higienização e boas práticas de fabricação'],109:['Segurança de Alimentos','Fluxo de produção e prevenção de contaminação cruzada'],110:['Ciência e Tecnologia de Alimentos','Economia circular: bioinsumos e aproveitamento de resíduos'],111:['Ciência e Tecnologia de Alimentos','Sustentabilidade e valorização de resíduos agrícolas'],112:['Biotecnologia de Alimentos','Biorreatores e produção sustentável de bioinsumos'],113:['Biotecnologia de Alimentos','Proteínas alternativas e carne cultivada'],114:['Ciência e Tecnologia de Alimentos','Valorização integral de matérias-primas e resíduos'],115:['Marketing de Alimentos','Embalagem: informação e comunicação ao consumidor'],116:['Marketing de Alimentos','Alegações nutricionais e funcionais na comercialização'],117:['Marketing de Alimentos','Cor da embalagem e comportamento do consumidor'],118:['Embalagens de Alimentos','PET: propriedades e aplicações em embalagens'],119:['Marketing de Alimentos','Marketing digital e relacionamento com o consumidor'],120:['Marketing de Alimentos','Estratégias de lançamento e escassez temporal']
}
const contextos=[
 [51,54,'Em relação a matérias-primas de origem animal e vegetal e assuntos correlatos, julgue os itens subsecutivos.'],
 [55,56,'A respeito de processos de transformação do leite e de frutas, julgue os itens que se seguem.'],
 [57,57,'A respeito de processos de transformação do leite e de frutas, julgue os itens que se seguem.'],
 [58,59,'A presença da enzima polifenoloxidase, ativada pela exposição das partes internas do vegetal ao oxigênio, causa escurecimento. Em processos de desidratação com fatiamento ou descascamento, medidas de pré-tratamento devem prevenir esse escurecimento.'],
 [60,62,'No que se refere aos processos de secagem utilizados nas agroindústrias para prolongar a vida útil dos alimentos, julgue os próximos itens.'],
 [63,64,'Acerca da produção de alimentos por fermentação, julgue os itens a seguir.'],
 [65,66,'Julgue os itens subsequentes, a respeito de plantas alimentícias não convencionais (PANC).'],
 [67,70,'Em relação aos resíduos vegetais gerados por agroindústrias e ao seu aproveitamento, julgue os itens a seguir.'],
 [71,72,'Acerca dos resíduos de matéria-prima animal gerados por agroindústrias e de seu aproveitamento, julgue os itens seguintes.'],
 [73,77,'A respeito do desenvolvimento de novos alimentos e bebidas que valorizem a sociodiversidade do semiárido, de processos de transformação e do controle de qualidade no setor alimentício brasileiro, julgue os itens a seguir.'],
 [78,78,'Item independente sobre biorreatores e produção de bebidas.'],
 [79,82,'Julgue os itens a seguir, relativos à microbiologia de alimentos.'],
 [83,85,'Em relação à análise sensorial de alimentos, julgue os próximos itens.'],
 [86,88,'A respeito de conservação e embalagem de alimentos, julgue os seguintes itens.'],
 [89,92,'A respeito dos métodos de conservação de alimentos e de suas aplicações, julgue os itens que se seguem.'],
 [93,93,'Item independente sobre salga de queijos e transferência de massa.'],
 [94,98,'Em relação ao controle de qualidade dos alimentos, às boas práticas de manipulação e às análises de perigos e pontos críticos de controle, julgue os itens seguintes.'],
 [99,100,'No que se refere às embalagens para alimentos, julgue os itens a seguir.'],
 [101,104,'Com relação a substâncias tóxicas em alimentos oriundas de contaminação microbiana, julgue os itens a seguir.'],
 [105,106,'A respeito de contaminantes alimentares e da qualidade do leite, julgue os itens subsequentes.'],
 [107,109,'Em relação à higiene e à vigilância sanitária de alimentos, julgue os itens que se seguem.'],
 [110,111,'Julgue os itens a seguir, quanto à economia circular em propriedades rurais.'],
 [112,114,'Com relação à inovação em sustentabilidade na ciência e na tecnologia de alimentos, julgue os itens que se seguem.'],
 [115,120,'No que se refere à comercialização e ao marketing de produtos alimentícios, julgue os itens subsequentes.']
]
const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const canonicas=new Map([[52,'extr-0af57e5e79b44213bc54'],[53,'extr-f9e1408d2e379978531d'],[57,'extr-6a96b32a547f8ecd08b6'],[58,'extr-07411c7e2adf56ec8613'],[62,'extr-15cfa5397eff5c102371'],[72,'extr-f94177a3963a1fb0ca30'],[76,'extr-b36d41362ef578ccdc74']])
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==77||new Set(exportado.map(q=>Number(q.numero_original))).size!==70)throw Error(`Exportação diferente do esperado: ${exportado.length} registros`)
const anulados=new Set([87,108,114])
const facil=new Set([51,52,55,56,58,60,63,65,67,68,70,71,73,77,78,80,81,83,85,88,89,91,92,94,97,99,100,107,110,112,115,117,119,120])
const dificil=new Set([53,54,57,59,61,62,64,66,69,74,76,79,82,84,86,87,90,93,96,101,102,103,104,105,106,108,109,113,114,116,118])
const correcoes={
 'extr-05242b86fdf9be378e7e':'Na carne fresca (parte muscular) que se destina como matéria-prima para a indústria de derivados cárneos, há uma pequena quantidade de carboidrato, que não é considerada na composição centesimal.',
 'extr-f3969b02dd1e81ef51dd':'A classificação dos frutos em climatéricos e não climatéricos tem importância prática na pós-colheita: os últimos podem ser colhidos imaturos, quando seu processo de maturação não está completo, pois completarão a maturação e o amadurecimento fora da planta.',
 'extr-6a96b32a547f8ecd08b6':'A produção de leite em pó e de soro de leite em pó pode seguir as mesmas etapas de concentração por evaporação, seguida por atomização e envase.',
 'extr-11c674564fb920a1f845':'A operação de branqueamento não é recomendada como pré-tratamento do vegetal, por acelerar o escurecimento enzimático.',
 'extr-a5c9cca51eeb8d783125':'Em uma secagem natural ao Sol, para melhorar características do produto, como maciez e retenção de aromas, o processo deve ser realizado em duas fases: a primeira, com exposição à luz solar até uma perda de umidade de 50% a 70%; e a segunda, à sombra.',
 'extr-15cfa5397eff5c102371':'A atomização da solução líquida a ser desidratada no processo de liofilização permite a rápida evaporação da água, o que mantém baixa a temperatura das partículas do produto submetido à secagem.',
 'extr-f94177a3963a1fb0ca30':'Fábricas queijeiras são um tipo de agroindústria que não trabalha com aproveitamento de resíduos, pois não possuem subproduto aproveitável.',
 'extr-b36d41362ef578ccdc74':'No Brasil, os alimentos funcionais são formalmente chamados de nutracêuticos.',
 'extr-8ddc85f767ba921886e8':'Suco ou sumo é a bebida não fermentada, não concentrada e não diluída, destinada ao consumo, obtida da fruta madura e sã, ou de parte do vegetal de origem, por processamento tecnológico adequado, submetida a tratamento que assegure sua apresentação e conservação até o momento do consumo, sem acréscimo de conservantes e/ou adoçantes.',
 'extr-9f3c7edc0d28b865ac46':'A tecnologia de proteínas alternativas envolve pesquisas sobre proteínas vegetais, fungos comestíveis e carne celular. Quando vegetais são empregados na extração de ingredientes no meio de cultivo para a produção de carne celular, o processo se torna significativamente mais sustentável.',
 'extr-80b573969d8b4262d299':'A utilização integral da matéria-prima no desenvolvimento de produtos alimentícios, juntamente com o uso de extratores químicos para obter compostos bioativos a partir dos resíduos, é considerada processo sustentável.',
 'extr-9a82b7f6bdfbfb65cd94':'Polímeros, como o poli(tereftalato de etileno), têm sido amplamente utilizados como material de embalagem pela indústria de alimentos e bebidas, por apresentarem alta resistência mecânica e química, boa barreira a gases e odores, potencial de reciclagem, baixo peso, maleabilidade e elevada transparência.',
 'extr-262558d853cb001af93e':'A técnica de lançamento de produtos alimentícios por tempo limitado é uma estratégia de marketing não recomendada por especialistas.'
}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const gabHash=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const manter=new Map()
for(const q of exportado){const n=Number(q.numero_original);if(!manter.has(n)||q.id===canonicas.get(n))manter.set(n,q.id)}
const decisoes=exportado.map(q=>{
 const n=Number(q.numero_original),tema=temas[n],g=respostas[String(n)],canonica=manter.get(n)===q.id
 if(!tema||!g)throw Error(`Sem classificação/gabarito do item ${n}`)
 const anulada=anulados.has(n)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2025,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 23/02/2025; edital publicado em 2024',numero_original:n,numero:n,pagina:Number(q.pagina),dificuldade:dificil.has(n)?'Difícil':facil.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade técnico-científica ou normativa; não é índice psicométrico.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo enunciado e pela seção temática da prova oficial do cargo P02.`,enunciado:(correcoes[q.id]||q.enunciado).replace(/\s+/g,' ').trim(),texto_apoio:contexto(n),imagem_pagina:q.pagina_imagem,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',remover_pendencias:pendencias,apta_resolucao:canonica,resposta_correta:anulada?null:g==='C'?0:1,anulada,gabarito_oficial:{valor:g,fonte:gabarito,fontes:[gabarito],arquivo:'Gab_Definitivo_036_MCTIINSA_002_01.PDF',prova,sha256:gabHash,sha256_tipo:'transcricao_canonica_da_tabela_oficial; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito definitivo oficial do cargo P02, itens 51 a 120.',numero:n,resposta:g,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Gabarito definitivo oficial CEBRASPE.'}}
 if(!canonica){d.inelegibilidade_motivo='Duplicata OCR do mesmo número e caderno; preservada a cópia textual mais limpa.';d.duplicada_de=manter.get(n)}
 return d
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,edital:2024,aplicacao:'23/02/2025',registros_brutos:77,itens_unicos:70,questoes_elegiveis:70,itens_anulados:[...anulados],duplicatas:7,paginas_origem_conferidas:[1,2,3],imagens_ou_graficos_especiais:0,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
