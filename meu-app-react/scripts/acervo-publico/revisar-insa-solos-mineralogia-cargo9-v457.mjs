import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-insa-solos-mineralogia-cargo9-2025-lote-v457'
const doc='642592ad1ea943a0'
const prova='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/036_MCTIINSA_009_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/MCTI_INSA_24/arquivos/Gab_Definitivo_036_MCTIINSA_009_01.PDF'
const concurso='INSA/MCTI 2024 — Pesquisador Adjunto I — Solos e Mineralogia'
const cargo='Pesquisador Adjunto I — área Solos e Mineralogia (P09) — caderno 036_MCTIINSA_009_01'
const blocos=[
 'E E C E E C E C C E C C X E E C E C C C',
 'C E C E E C C E E E E X E C E C E X E C',
 'E E E C C E C C C E C C E C C E E C E E',
 'C C C X E E E E C C'
]
const seq=blocos.flatMap(x=>x.split(' '))
if(seq.length!==70)throw Error(`Gabarito esperado de 70 itens, recebido ${seq.length}`)
const respostas=Object.fromEntries(seq.map((v,i)=>[String(i+51),v]))

const arquivoCatalogo='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const linhas=(await fs.readFile(arquivoCatalogo,'utf8')).split(/\r?\n/).filter(Boolean)
const pos=linhas.findIndex(l=>l.startsWith(`{"documento_id":"${doc}"`))
const chave=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const registro={documento_id:doc,arquivo_prova:'036_MCTIINSA_009_01.PDF',prova_url:prova,gabarito_url:gabarito,arquivo_gabarito:'Gab_Definitivo_036_MCTIINSA_009_01.PDF',tipo:'Gabarito oficial definitivo — Cargo 9: Pesquisador Adjunto I — Solos e Mineralogia (P09)',criterio:'Identificador do caderno 036_MCTIINSA_009_01; aplicação oficial em 23/02/2025',status:'tabela_lida',sha256:chave,respostas,linhas:4}
if(pos>=0)linhas[pos]=JSON.stringify(registro);else linhas.push(JSON.stringify(registro))
await fs.writeFile(arquivoCatalogo,`${linhas.join('\n')}\n`)

const temas={
 51:['Ciência do Solo','Gênese e classificação: Cambissolos, caráter plíntico e concreções'],52:['Ciência do Solo','Intemperismo químico: oxidação de minerais'],53:['Ciência do Solo','Intemperismo químico: hidratação mineral'],54:['Ciência do Solo','Classificação brasileira de solos: Neossolos'],55:['Ciência do Solo','Fertilidade e caráter distrófico dos solos'],56:['Ciência do Solo','Morfologia: Gleissolos e hidromorfismo'],57:['Ciência do Solo','Morfologia e classificação: Argissolos e gradiente textural'],58:['Ciência do Solo','Mineralogia: caulinita e argilas 1:1'],59:['Ciência do Solo','Solos tropicais: óxidos de ferro e alumínio'],60:['Ciência do Solo','Solos salinos: correção e manejo'],61:['Ciência do Solo','Mineralogia de solos tropicais: goethita, hematita e gibbsita'],62:['Ciência do Solo','Classes de solos e distribuição na Caatinga'],63:['Ciência do Solo','Classificação de solos: Luvissolos na Caatinga'],64:['Ciência do Solo','Distribuição de Latossolos e transições fitogeográficas'],65:['Ciência do Solo','Horizontes do solo e distribuição da matéria orgânica'],66:['Ciência do Solo','Fatores de formação do solo: clima, organismos e relevo'],67:['Ciência do Solo','Conceito de solo: sistema trifásico'],68:['Ciência do Solo','Conceito e composição do solo'],69:['Física do Solo','Óxidos de ferro, microporosidade e disponibilidade de água'],70:['Física do Solo','Manejo conservacionista e porosidade do solo'],71:['Gênese e Morfologia do Solo','Cor do solo, horizontes, matéria orgânica e drenagem'],72:['Física do Solo','Textura, infiltração, erosão e formação de voçorocas'],73:['Física do Solo','Superfície específica de argilas e matéria orgânica'],74:['Física do Solo','Água disponível e capacidade de armazenamento dos solos'],75:['Química do Solo','Minerais 2:1, expansão e capacidade de troca catiônica'],76:['Gênese e Classificação do Solo','Latolização e remoção de sílica e bases'],77:['Mineralogia do Solo','Caulinita: estrutura 1:1 e camadas de sílica e alumina'],78:['Gênese e Classificação do Solo','Latolização, dessilicação e propriedades físicas dos Latossolos'],79:['Agrometeorologia','Evapotranspiração potencial: método de Thornthwaite'],80:['Agrometeorologia','Balanço hídrico climatológico sequencial'],81:['Irrigação','Coeficiente de cultura e fases de desenvolvimento'],82:['Agrometeorologia','Balanço hídrico: deficiência hídrica'],83:['Relações Solo-Água-Planta','Capacidade de campo e evapotranspiração'],84:['Irrigação','Capacidade de água disponível e profundidade radicular'],85:['Agrometeorologia','Evapotranspiração de referência e método de Penman-Monteith'],86:['Química do Solo','Matéria orgânica e capacidade de troca catiônica'],87:['Física do Solo','Matéria orgânica, infiltração e eficiência de irrigação'],88:['Física do Solo','Matéria orgânica, agregação e estabilidade estrutural'],89:['Química do Solo','Matéria orgânica e acidez do solo'],90:['Microbiologia do Solo','Matéria orgânica e fixação biológica de nitrogênio'],91:['Química do Solo','Relação carbono/nitrogênio e disponibilidade de nutrientes'],92:['Física do Solo','Matéria orgânica, porosidade e textura'],93:['Microbiologia do Solo','Supressividade do solo e interações planta-patógeno'],94:['Microbiologia do Solo','Diversidade microbiana e interações ecológicas'],95:['Microbiologia do Solo','Parasitismo e fitopatógenos'],96:['Microbiologia do Solo','Comensalismo, micorrizas e bactérias diazotróficas'],97:['Microbiologia do Solo','Antagonismo microbiano e inibição por metabólitos'],98:['Microbiologia do Solo','Rizosfera, exsudatos radiculares e comunidades microbianas'],99:['Microbiologia do Solo','Exsudatos radiculares e biomassa microbiana'],100:['Biologia do Solo','Decomposição de matéria orgânica e atividade enzimática'],101:['Ciência do Solo','Ciclo do carbono e reservatórios da biosfera'],102:['Biologia do Solo','Decomposição: papéis de microrganismos e macro-organismos'],103:['Ciclo do Carbono','Carbono orgânico e fotossíntese'],104:['Biologia do Solo','Lignina, lacases e peroxidases na decomposição'],105:['Biologia do Solo','Degradabilidade e composição química de resíduos'],106:['Biologia do Solo','Decomposição da celulose por microrganismos'],107:['Fertilidade do Solo','Adubação localizada em sulcos e exploração radicular'],108:['Manejo e Conservação do Solo','Plantio direto, micorrizas e redes de hifas'],109:['Fertilidade do Solo','Imobilização e mineralização de nutrientes'],110:['Manejo e Conservação do Solo','Matéria orgânica e estabilidade de agregados'],111:['Manejo e Conservação do Solo','Plantio direto e estoque de carbono orgânico'],112:['Microbiologia do Solo','Microrganismos solubilizadores, amonificadores e nitrificadores'],113:['Fitossanidade','Rotação de culturas, crotalária e controle de nematoides'],114:['Química do Solo','Contaminação por metais pesados e calagem'],115:['Química do Solo','Adsorção de metais em solos tropicais'],116:['Química do Solo','Textura do solo, retenção e lixiviação de metais'],117:['Química do Solo','Condições redutoras, quelação e disponibilidade de metais'],118:['Química do Solo','pH, cargas superficiais e retenção de metais'],119:['Química Ambiental','Fontes geoquímicas de contaminação por metais pesados'],120:['Recuperação de Áreas Degradadas','Fitorremediação: fitoextração e fitoestabilização']
}
const contextos=[
 [51,57,'Julgue os itens a seguir, no que se refere à gênese e à classificação de solos.'],
 [58,64,'Acerca das características e das principais classes de solos tropicais, julgue os itens que se seguem.'],
 [65,68,'Acerca de conceitos relacionados às definições de solo, julgue os itens a seguir.'],
 [69,74,'Julgue os itens que se seguem, relativos aos atributos morfológicos e físicos do solo.'],
 [75,78,'Com relação às principais classes de solos tropicais, julgue os itens seguintes.'],
 [79,85,'Diversos conceitos estão envolvidos no balanço hídrico, tais como coeficiente de cultura (Kc), capacidade de campo (CC), capacidade de água disponível no solo (CAD), evapotranspiração real (ETr) e evapotranspiração potencial (ETp). Julgue os itens relativos a esse tema.'],
 [86,92,'Com relação aos efeitos da matéria orgânica nas propriedades físicas, químicas e biológicas dos solos, julgue os itens a seguir.'],
 [93,97,'Acerca de conceitos relacionados às interações microbianas no solo, julgue os itens a seguir.'],
 [98,99,'Julgue os itens a seguir, relativos à rizosfera das plantas.'],
 [100,103,'Julgue os itens subsequentes, a respeito das transformações de carbono no solo.'],
 [104,106,'Julgue os itens seguintes, referentes à decomposição dos resíduos orgânicos do solo.'],
 [107,113,'Acerca do manejo do solo e da nutrição de plantas, julgue os itens subsequentes.'],
 [114,120,'Com relação à contaminação do solo por metais pesados, julgue os itens a seguir.']
]
const contexto=n=>contextos.find(([a,b])=>n>=a&&n<=b)?.[2]||''
const canonicas=new Map([[55,'extr-08a723495325630ceee0'],[59,'extr-acc555667dca8bb839f0'],[64,'extr-310e67497666ff0ce8d3'],[79,'extr-544aa7bc01658894e62c'],[80,'extr-deb76c8e8d2419741f29'],[81,'extr-98dc9336623ec15b9af8'],[85,'extr-48d4d11802af18e13965']])
const exportado=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
if(exportado.length!==77||new Set(exportado.map(q=>Number(q.numero))).size!==70)throw Error(`Exportação diferente do esperado: ${exportado.length} registros`)
const anulados=new Set([63,82,88,114])
const facil=new Set([51,52,53,54,56,58,59,62,63,64,66,67,68,70,71,73,74,77,78,79,80,81,82,83,86,89,90,91,94,97,99,101,107,108,111,112,113,119,120])
const dificil=new Set([55,57,60,61,65,69,72,75,76,84,85,87,88,92,93,95,96,98,100,104,105,106,109,110,114,115,116,117,118])
const correcoes={
 'extr-41cdc75299dc7a502c89':'O clima e os organismos vivos transformam materiais minerais e orgânicos, formando diferentes solos sob várias condições de relevo.',
 'extr-0e33f497705d8dfa1a41':'A caulinita faz parte do grupo de minerais de argila do tipo 1:1 mais comuns em solos tropicais.',
 'extr-603c41fec0aca720be50':'Em um projeto de irrigação, os valores do coeficiente de cultura (Kc) não são constantes ao longo de todo o ciclo da cultura, sendo maiores nas fases iniciais do ciclo.',
 'extr-98dc9336623ec15b9af8':'Em um projeto de irrigação, os valores do coeficiente de cultura (Kc) não são constantes ao longo de todo o ciclo da cultura, sendo maiores nas fases iniciais do ciclo.',
 'extr-4d6e83ae0b63897c7d2f':'O cálculo da evapotranspiração potencial (ETp) de determinado ponto no terreno pelo método de Thornthwaite é feito apenas com dados de temperatura média mensal.',
 'extr-544aa7bc01658894e62c':'O cálculo da evapotranspiração potencial (ETp) de determinado ponto no terreno pelo método de Thornthwaite é feito apenas com dados de temperatura média mensal.',
 'extr-a3f487d3d699ae5a3ce1':'O balanço hídrico climatológico sequencial mensal utiliza médias mensais históricas de dados climatológicos de determinado período, como, por exemplo, de 2000 a 2024.',
 'extr-deb76c8e8d2419741f29':'O balanço hídrico climatológico sequencial mensal utiliza médias mensais históricas de dados climatológicos de determinado período, como, por exemplo, de 2000 a 2024.',
 'extr-48d4d11802af18e13965':'A evapotranspiração real (ETr) pode ser estimada pelo método de Penman-Monteith, desde que estejam disponíveis dados de temperatura e umidade relativa do ar, velocidade do vento, radiação solar global, temperatura e umidade do solo.',
 'extr-8ec02bc4f80971dc99d0':'A evapotranspiração real (ETr) pode ser estimada pelo método de Penman-Monteith, desde que estejam disponíveis dados de temperatura e umidade relativa do ar, velocidade do vento, radiação solar global, temperatura e umidade do solo.',
 'extr-48d4d11802af18e13965':'A evapotranspiração real (ETr) pode ser estimada pelo método de Penman-Monteith, desde que estejam disponíveis dados de temperatura e umidade relativa do ar, velocidade do vento, radiação solar global, temperatura e umidade do solo.',
 'extr-6230a524711cf4580b9b':'Quanto maior for a capacidade de campo do solo, maior será a evapotranspiração de uma planta.',
 'extr-85a918c4274b9ff1aa0e':'Nas relações simbióticas comensalistas, os organismos se auxiliam mutuamente, como ocorre entre bactérias diazotróficas ou fungos micorrízicos arbusculares e plantas, resultando em ganho mútuo de nutrientes.',
 'extr-13feb3a78d6c64b42d85':'Na decomposição de materiais orgânicos no solo, microrganismos transformam a matéria, enquanto macro-organismos regulam o processo.',
 'extr-4b0179eec7c94e818d58':'O cultivo da crotalária em rotação de culturas beneficia o crescimento radicular da cultura subsequente pela ação inibitória sobre a população de nematoides fitopatogênicos no solo.'
}
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const gabHash=hashRevisao(Object.entries(respostas).map(([n,v])=>`${n}:${v}`).join('\n'))
const manter=new Map()
for(const q of exportado){const n=Number(q.numero);if(!manter.has(n)||q.id===canonicas.get(n))manter.set(n,q.id)}
const decisoes=exportado.map(q=>{
 const n=Number(q.numero),tema=temas[n],g=respostas[String(n)],canonica=manter.get(n)===q.id
 if(!tema||!g)throw Error(`Sem classificação/gabarito do item ${n}`)
 const anulada=anulados.has(n)
 const enunciado=(correcoes[q.id]||q.enunciado).split(/\n(?=CEBRASPE\s*[–—-]|Julgue os itens|Diversos conceitos|Acerca de conceitos|Com relação aos efeitos|Acerca do manejo|Com relação à contaminação)/)[0].replace(/\s+/g,' ').trim()
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2025,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 23/02/2025; edital publicado em 2024',numero_original:n,numero:n,pagina:Number(q.pagina||q.contexto?.[0]?.pagina||1),dificuldade:dificil.has(n)?'Difícil':facil.has(n)?'Fácil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual, pedológica, bioquímica ou de manejo; não é índice psicométrico.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo conteúdo técnico e pela seção temática do caderno oficial do cargo P09.`,enunciado,texto_apoio:contexto(n),imagem_pagina:q.imagem||`paginas/${doc}-${String(q.pagina||1).padStart(4,'0')}.webp`,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',remover_pendencias:pendencias,apta_resolucao:canonica,resposta_correta:anulada?null:g==='C'?0:1,anulada,gabarito_oficial:{valor:g,fonte:gabarito,fontes:[gabarito],arquivo:'Gab_Definitivo_036_MCTIINSA_009_01.PDF',prova,sha256:gabHash,sha256_tipo:'transcricao_canonica_da_tabela_oficial; nao_e_hash_do_pdf',metodo:'Transcrição do gabarito definitivo oficial do cargo P09, itens 51 a 120.',numero:n,resposta:g,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Gabarito definitivo oficial CEBRASPE.'}}
 if(!canonica){d.inelegibilidade_motivo='Duplicata OCR do mesmo item e caderno; preservada a versão mais íntegra do enunciado.';d.duplicada_de=manter.get(n)}
 return d
})
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
const resumo={...resultado,documento_id:doc,prova,gabarito,edital:2024,aplicacao:'23/02/2025',registros_brutos:77,itens_unicos:70,questoes_elegiveis:70,itens_anulados:[...anulados],duplicatas:7,paginas_origem_conferidas:[1,2],imagens_ou_graficos_especiais:0,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(resumo,null,2))
console.log(JSON.stringify(resumo,null,2))
