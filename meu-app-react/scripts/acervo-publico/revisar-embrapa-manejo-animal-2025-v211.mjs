import fs from 'node:fs/promises'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='2c245f3a159371ea'
const prova='https://cdn.cebraspe.org.br/concursos/EMBRAPA_24/arquivos/044_EMBRAPA_002_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/embrapa_24/arquivos/Gab_Definitivo_044_EMBRAPA_002_01.pdf'
const concurso='EMBRAPA 2024/2025 — Opção 40000007: Assistente, Área Laboratório e Campos Experimentais, Subárea Manejo Animal — aplicação em 23/03/2025'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='044_EMBRAPA_002_01.pdf')throw Error('Documento da EMBRAPA — Manejo Animal não confere')

// Gabarito oficial definitivo para os itens 41–100.
const respostaTexto=[
 ['C','C','E','C','E','C','C','E','C','E','E','E','C','X','C','C','C','E','C','E',
  'E','C','C','C','E','E','E','E','C','C','C','E','E','E','E','C','E','C','C','C',
  'C','E','E','C','C','E','E','E','C','C','C','E','E','C','E','C','E','E','C','X']
].flat().join('')
if(respostaTexto.length!==60||/[^CEX]/.test(respostaTexto))throw Error(`Gabarito oficial inválido: ${respostaTexto.length} respostas`)
const respostas=Object.fromEntries([...respostaTexto].map((v,i)=>[i+41,v]))
const temas={
41:['Anatomia e Fisiologia Animal','Sistema digestório dos suínos: órgãos e trajeto alimentar'],42:['Zootecnia','Apreensão de forragem por bovinos'],43:['Zootecnia','Apreensão de forragem por ovinos e caprinos e anatomia dentária'],44:['Zootecnia','Ruminantes: regurgitação e ruminação'],
45:['Manejo Animal','Cercas e segurança em instalações pecuárias'],46:['Sanidade Animal','Limpeza e desinfecção de equipamentos e prevenção de zoonoses'],47:['Sanidade Animal','Biossegurança em granjas de suínos: controle de acesso'],48:['Avicultura','Segurança ocupacional no aquecimento de aviários'],49:['Avicultura','Proteção respiratória e exposição à amônia em granjas'],50:['Bovinocultura','Higiene do curral e gestão de resíduos do manejo'],
51:['Bovinocultura de Leite','Ordenha mecânica: uso de luvas e controle de mastite'],52:['Bovinocultura de Leite','Higiene do úbere e preparação dos tetos para ordenha'],53:['Bovinocultura de Leite','Ordenha mecânica: posicionamento das teteiras e entrada de ar'],54:['Bovinocultura de Leite','Mastite clínica: ordem de ordenha e descarte do leite'],55:['Bovinocultura de Leite','Bem-estar durante a ordenha e liberação de ocitocina'],
56:['Sanidade Animal','Avicultura: higienização de aviários e controle de parasitas'],57:['Sanidade Animal','Poedeiras: sinais clínicos de doença e redução de postura'],58:['Suinocultura','Conservação de vacinas para suínos e cadeia de frio'],59:['Bovinocultura','Controle de mosca-dos-chifres por brincos mosquicidas'],60:['Sanidade Animal','Vacinação: prevenção de contaminação cruzada e troca de agulhas'],
61:['Forragicultura','Seleção de forrageiras para bovinos, caprinos e ovinos'],62:['Bovinocultura de Leite','Ordenha, alimentação pós-ordenha e prevenção de mastite'],63:['Nutrição Animal','Estratégias de manejo para estimular o consumo de ração por bovinos'],64:['Ovinocultura e Caprinocultura','Avaliação clínica e sanitária de ovinos e caprinos'],65:['Reprodução Animal','Ciclo estral e momento da ovulação'],66:['Reprodução Animal','Estro: sinais de receptividade e comportamento de monta'],67:['Avicultura','Manejo alimentar de galinhas poedeiras'],68:['Bovinocultura de Corte','Nutrição de bovinos de corte por fase de crescimento'],
69:['Sanidade Animal','Primeiros socorros: acidentes ofídicos em bovinos'],70:['Reprodução Animal','Assistência ao parto e tração obstétrica em bovinos'],71:['Sanidade Animal','Primeiros socorros: hemostasia em animais'],72:['Sanidade Animal','Intoxicação por ureia em ruminantes e intervenção emergencial'],
73:['Ovinocultura e Caprinocultura','Pastejo em período chuvoso e prevenção de parasitoses'],74:['Ovinocultura e Caprinocultura','Seleção de reprodutores e manejo de animais mochos'],75:['Bovinocultura','Manejo neonatal: identificação, pesagem e cura do umbigo'],76:['Bem-Estar Animal','Manejo racional de bovinos e redução do uso de instrumentos aversivos'],77:['Bem-Estar Animal','Manejo pré-abate: formação de lotes e embarque de bovinos'],78:['Avicultura','Ambiência em aviários: cortinas laterais e ventilação'],79:['Bem-Estar Animal','Manejo de bovinos em grupo durante o embarque'],80:['Avicultura','Biossegurança: limpeza, desinfecção e vazio sanitário entre lotes'],
81:['Bovinocultura de Leite','Higiene pessoal e ordenha mecânica'],82:['Sanidade Animal','Vacinação: aplicação em animais debilitados'],83:['Bovinocultura de Corte','Rastreabilidade e registros de manejo de bovinos para abate'],84:['Bovinocultura','Manejo neonatal: vermifugação, pesagem e vínculo materno'],85:['Bovinocultura','Identificação animal: posicionamento de brincos em bovinos'],
86:['Ovinocultura e Caprinocultura','Manejo e contenção de caprinos e ovinos'],87:['Ovinocultura e Caprinocultura','Contenção segura de pequenos ruminantes'],88:['Ovinocultura e Caprinocultura','Condução de caprinos e ovinos em grupo'],89:['Ovinocultura e Caprinocultura','Cuidados neonatais: colostro e mamada após o parto'],90:['Ovinocultura e Caprinocultura','Sinais comportamentais do parto em ovelhas'],
91:['Gestão de Pessoas','Papéis de manutenção e coesão de equipes'],92:['Gestão de Pessoas','Etapas de formação de equipes: turbulência e pertencimento'],93:['Gestão de Pessoas','Etapas de formação de equipes: definição de papéis e normatização'],94:['Gestão de Pessoas','Papéis de tarefa e alcance dos objetivos do grupo'],95:['Gestão de Pessoas','Etapas de desenvolvimento de equipes: desempenho e coesão'],96:['Gestão de Pessoas','Conflitos interpessoais e estilos de administração de conflitos'],97:['Gestão de Pessoas','Gestão de conflitos: acomodação e comportamento prestativo'],98:['Gestão de Pessoas','Gestão de conflitos: evitação e retirada passiva'],99:['Gestão de Pessoas','Negociação colaborativa e criação de valor agregado'],100:['Gestão de Pessoas','Conflitos em equipe: colaboração e construção de soluções']
}
const contextoPorNumero={
41:'Acerca da diferenciação entre bovinos, caprinos, ovinos e suínos, julgue os itens subsequentes.',
45:'Em relação à higiene e à segurança individual, coletiva e das instalações dos animais, julgue os itens seguintes.',
51:'No que diz respeito ao manejo da ordenha mecânica de bovinos leiteiros, julgue os itens próximos.',
56:'Julgue os itens acerca da identificação de sinais de doenças, do controle de parasitas e da vacinação de animais.',
61:'Julgue os itens de acordo com técnicas de manejo reprodutivo, sanitário e nutricional de aves, bovinos, ovinos e caprinos.',
69:'Acerca dos primeiros socorros em animais, julgue os itens a seguir.',
73:'Considerando os princípios de bem-estar e manejo animal, julgue os itens a seguir.',
81:'Com relação aos cuidados com bovinos, julgue os itens seguintes.',
86:'Considerando as atividades diárias com caprinos e ovinos, julgue os itens a seguir.',
91:'Considerando o processo de formação de grupos e equipes e os diferentes papéis necessários ao trabalho em equipe, julgue os itens a seguir.',
96:'Julgue os itens subsequentes, relativos às relações humanas e ao trabalho em equipe.'
}
const contexto=n=>{let t='';for(const k of Object.keys(contextoPorNumero).map(Number).sort((a,b)=>a-b))if(k<=n)t=contextoPorNumero[k];return t}
const paginas=new Map(catalog.questoes.map(q=>[q.numero,q.pagina]))
if(Object.keys(temas).length!==60||new Set(catalog.questoes.map(q=>q.numero)).size!==60)throw Error('Classificação não cobre os 60 itens oficiais 41–100')
for(let n=41;n<=100;n++)if(!temas[n]||!paginas.has(n)||!respostas[n])throw Error(`Item ${n}: classificação, página ou gabarito ausente`)
const registros=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc)registros.push(q)
if(registros.length!==65||new Set(registros.map(q=>q.numero_original)).size!==60)throw Error(`Esperava 65 registros OCR de 60 itens; encontrei ${registros.length} registros e ${new Set(registros.map(q=>q.numero_original)).size} números distintos`)
const duplicadas=new Map([
 ['extr-1df416e7e4e9b7ea919f','extr-71e5ba70e854dc921faf'],['extr-c0ed93ec26a2d74a325e','extr-5d00e35be171737a498c'],
 ['extr-80e4619b63c332c0549e','extr-73471a4ea7b6550d2ac3'],['extr-57bd00a5aa8821ce8081','extr-5a6e9560aac0b8e25dae'],
 ['extr-39a61f314ddfab9de617','extr-61df4556f735c385bdd9']
])
const correcoes={
44:'Os bovinos, os ovinos e os caprinos regurgitam o alimento para a boca, a fim de mastigá-lo e prepará-lo para a digestão.',
50:'Na higiene do curral de manejo de bovinos, recomenda-se realizar a limpeza periódica do tronco e da balança, bem como manter um recipiente para todos os tipos de lixo produzidos durante o manejo dos animais.',
55:'Condutas que causam dor ou estresse nas vacas, como gritar ou bater, inibem a ação da ocitocina e, com isso, reduzem a quantidade de leite ordenhado.',
60:'Na vacinação, deve-se retirar a vacina do frasco com uma agulha e utilizar uma agulha para cada aplicação nos animais.',
71:'Em situações de sangramento, é essencial aplicar pressão na área do ferimento, utilizando panos limpos, para conter a perda de sangue.',
72:'Em casos de intoxicação causada por ureia, é recomendado o fornecimento forçado de álcool anidro para o animal.',
80:'Antes da chegada de um novo lote, os galpões destinados à criação das pintainhas devem ser lavados, desinfetados e passar por período de vazio sanitário.',
85:'O brinco de identificação de bovinos deve ser posicionado na parte central da orelha, entre as duas nervuras principais.',
90:'No preparo para o parto, a ovelha fica inquieta e vocaliza frequentemente.',
95:'A etapa de desempenho é baseada na coesão, representada pelo sentimento coletivo que interliga os integrantes da equipe.',
100:'Suponha que uma equipe de trabalho tenha recebido a seguinte orientação para situações de conflito: “Vamos adotar uma abordagem de dar e receber e nos preocupar com os outros para solucionarmos o conflito”. Nesse caso, ilustra-se uma estratégia em que as pessoas ponderam e integram soluções alternativas para resolver os conflitos no trabalho.'
}
const digest=hashRevisao(respostaTexto)
const decisoes=registros.map(q=>{
 const n=Number(q.numero_original),t=temas[n],pagina=paginas.get(n),ctx=contexto(n),resposta=respostas[n]
 if(!t||!pagina||!ctx)throw Error(`Item ${n}: classificação, página ou contexto ausente`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2025,concurso,numero_original:n,pagina,dificuldade:[43,44,46,47,49,50,51,52,54,56,58,59,60,61,64,65,66,69,70,72,73,74,75,77,79,80,82,83,84,85,86,87,88,89,90,92,93,94,95,96,97,98,99,100].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela especificidade de manejo, sanidade, reprodução e relações de trabalho; o CEBRASPE não publicou nível por item.',motivo:`Item ${n}: matéria e conteúdo atribuídos pela leitura individual do enunciado e do bloco temático do caderno oficial da Opção 40000007.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura semântica individual e inspeção visual das duas páginas oficiais'},resposta_correta:resposta==='X'?null:resposta==='C'?0:1,anulada:resposta==='X',gabarito_oficial:{fonte:gabarito,arquivo:'Gab_Definitivo_044_EMBRAPA_002_01.pdf',criterio:'Gabarito oficial definitivo CEBRASPE — Opção 40000007: Assistente, Subárea Manejo Animal.',numero:n,pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 da sequência oficial dos 60 itens 41–100; não é hash do PDF.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${pagina} do caderno oficial vinculada ao item para preservar texto, instrução e contexto compartilhado.`}}
 if(correcoes[n]&&!duplicadas.has(q.id))d.enunciado=correcoes[n]
 if(duplicadas.has(q.id)){d.apta_resolucao=false;d.duplicada_de=duplicadas.get(q.id);d.inelegibilidade_motivo=`Cópia OCR do item ${n}; preservada no histórico e retirada da resolução para evitar duplicidade.`}
 return d
})
for(let p=1;p<=2;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-tbg-inspecao-2023-v210'))
if(!base)throw Error('Raiz v210 não encontrada')
const nome='revisao-embrapa-manejo-animal-2025-v211'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,itens_oficiais_no_caderno:60,itens_unicos_classificados:60,duplicatas_ocr_excluidas:duplicadas.size,itens_anulados_oficiais:[54,100],gabaritos_definitivos_associados:60,paginas_originais_conferidas:[1,2],data_aplicacao:'2025-03-23',prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão EMBRAPA — Assistente, Manejo Animal — v211\n\n- Revisei 65 registros OCR correspondentes aos 60 itens oficiais de 41 a 100. Classifiquei os itens por Anatomia e Fisiologia Animal, Zootecnia, Manejo Animal, Sanidade Animal, Bovinocultura, Ordenha, Avicultura, Suinocultura, Nutrição e Reprodução Animal, Bem-Estar Animal e Gestão de Pessoas, com assunto específico, opção/cargo, ano e dificuldade estimada.\n- Excluí cinco cópias OCR da resolução, corrigi enunciados contaminados por cabeçalhos e itens seguintes, associei os contextos compartilhados e vinculei as duas páginas oficiais. Associei o gabarito definitivo; itens 54 e 100 anulados.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno Opção 40000007](<${prova}>), [gabarito definitivo](<${gabarito}>), [edital EMBRAPA 2024](https://cdn.cebraspe.org.br/concursos/embrapa_24/arquivos/ED_1_2024_EMBRAPA_ABERTURA.PDF).\n`)
console.log(JSON.stringify(out))
