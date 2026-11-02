import fs from 'node:fs/promises'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='78b8016d5ba4453f'
const prova='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/394_EBSERHASSISTENCIAL040__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL/arquivos/GAB_DEFINITIVO_394_EBSERHASSISTENCIAL040.PDF'
const concurso='EBSERH Área Assistencial 2018 — Cargo 40: Fisioterapeuta, Terapia Intensiva Pediátrica — aplicação em 06/05/2018'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.arquivo!=='394_EBSERHASSISTENCIAL040__PAG_3.PDF')throw Error('Caderno oficial do Cargo 40 da EBSERH não confere')

// Gabarito definitivo CEBRASPE para os itens 41–100; não há itens anulados.
const respostaTexto=[
 'C','C','E','E','C','C','E','E','C','C','E','E','C','E','C','E','E','C','C','E',
 'E','C','C','E','E','C','E','E','E','C','C','C','C','C','E','E','C','C','E','E',
 'E','C','E','C','E','C','E','C','E','C','E','C','E','E','C','C','E','C','E','C'
].join('')
if(respostaTexto.length!==60||/[^CE]/.test(respostaTexto))throw Error('Sequência do gabarito definitivo inválida')
const respostas=Object.fromEntries([...respostaTexto].map((v,i)=>[i+41,v]))
const temas={
41:['Fisioterapia','Músculos respiratórios pediátricos: composição das fibras do diafragma'],42:['Fisioterapia','Paralisia diafragmática infantil e movimento paradoxal na inspiração'],43:['Fisioterapia','Inervação do diafragma e raízes do nervo frênico'],44:['Fisioterapia','Mecânica respiratória do lactente e movimento de alça de balde'],45:['Fisioterapia','Biomecânica diafragmática e inserção horizontal no lactente'],
46:['Fisioterapia Respiratória','Oxigenoterapia: toxicidade, atelectasia e depressão ciliar'],47:['Fisioterapia Respiratória','Oxigenoterapia e ventilação não invasiva: fatores de risco para displasia broncopulmonar'],48:['Fisioterapia Respiratória','Sistemas de oxigenoterapia de baixo fluxo e demanda inspiratória'],
49:['Fisioterapia Respiratória','SDRA pediátrica: ventilação protetora e volume corrente'],50:['Fisioterapia Respiratória','SDRA: hipercapnia permissiva e prevenção de lesão ventilatória'],51:['Fisioterapia Respiratória','Ventilação oscilatória de alta frequência na SDRA pediátrica'],52:['Fisioterapia Respiratória','SDRA pediátrica: critérios de gravidade e índices de oxigenação'],53:['Fisioterapia Respiratória','SDRA pediátrica: posição prona e melhora da oxigenação'],
54:['Fisioterapia Pediátrica','Hérnia diafragmática congênita: anatomia e lateralidade'],55:['Fisioterapia Pediátrica','Hérnia diafragmática: efeitos da pressão intratorácica'],56:['Fisioterapia Respiratória','Desobstrução brônquica: hiperinsuflação manual e aumento do fluxo expiratório'],57:['Fisioterapia Pediátrica','Hérnia diafragmática: suporte ventilatório e risco de complicações'],58:['Fisioterapia Pediátrica','Posicionamento terapêutico em criança com hérnia diafragmática'],
59:['Fisioterapia Pediátrica','Humanização hospitalar: atividades lúdicas e estresse infantil'],60:['Fisioterapia Pediátrica','Humanização hospitalar: integração da criança, família e equipe'],61:['Ética em Saúde','Decisões de não reanimar em pediatria e comunicação com a família'],62:['Ética em Saúde','Autonomia progressiva e participação de crianças e adolescentes nas decisões'],
63:['Epidemiologia Clínica','Acurácia diagnóstica: sensibilidade, especificidade e razões de verossimilhança'],64:['Epidemiologia Clínica','Ensaios clínicos de efetividade e validade externa'],
65:['Fisioterapia Neurológica','Pressão de perfusão cerebral e pressão intracraniana'],66:['Fisioterapia Neurológica','Hipertensão intracraniana pediátrica e mecanismos compensatórios'],67:['Fisioterapia Neurológica','Hipertensão intracraniana: manifestações clínicas'],68:['Fisioterapia Neurológica','Hipertensão intracraniana aguda e riscos da hiperventilação profilática'],
69:['Fisioterapia Respiratória','Desmame ventilatório pediátrico: índices preditivos'],70:['Fisioterapia Respiratória','Falha de extubação e desmame ventilatório em pediatria'],71:['Fisioterapia Respiratória','Ventilação não invasiva: escolha de interface em pediatria'],72:['Controle de Infecção','Infecção hospitalar pediátrica: antibioticoterapia prévia e internação prolongada'],73:['Controle de Infecção','Dermatite e fatores de risco para infecção cutânea em crianças'],
74:['Fisioterapia Respiratória','Oxigenoterapia nasal de alto fluxo: aquecimento, umidificação e pressão positiva'],75:['Fisioterapia Respiratória','Cânula nasal de alto fluxo: ajuste, vazamento e eficiência'],76:['Fisioterapia Respiratória','Alto fluxo nasal, espaço morto e eliminação de dióxido de carbono'],77:['Fisioterapia Respiratória','Oxigenoterapia nasal de alto fluxo: limites de fluxo em pediatria'],
78:['Fisioterapia Neuromuscular','Distrofia muscular de Duchenne e ventilação não invasiva'],79:['Fisioterapia Neuromuscular','Atrofia muscular espinhal tipo I e repercussões respiratórias'],80:['Fisioterapia Neuromuscular','Distrofia de Duchenne: critérios para ventilação invasiva'],81:['Fisioterapia Neuromuscular','Treinamento muscular inspiratório na distrofia muscular de Duchenne'],82:['Fisioterapia Respiratória','Respiração glossofaríngea e assistência à tosse'],
83:['Fisioterapia Neurológica','Lesão medular cervical C5: função dos extensores do punho'],84:['Fisioterapia Respiratória','Lesão medular cervical e padrão respiratório paradoxal'],85:['Fisioterapia Respiratória','Lesão medular cervical e controle autonômico do tônus brônquico'],86:['Fisioterapia Respiratória','Lesão medular cervical: cinta abdominal e capacidade vital'],
87:['Fisioterapia Respiratória','Pós-operatório torácico pediátrico: técnicas manuais de desobstrução'],88:['Fisioterapia Respiratória','Plaquetopenia e segurança de manobras de higiene brônquica'],89:['Fisioterapia Respiratória','Máscara de Venturi e classificação do sistema de oxigenoterapia'],90:['Fisioterapia Respiratória','Dreno torácico: borbulhamento e fístula broncopleural'],91:['Fisioterapia Pediátrica','Mobilização precoce e dreno torácico no pós-operatório'],
92:['Cuidados Paliativos','Princípios bioéticos e dignidade no processo de morrer'],93:['Cuidados Paliativos','Objetivos do cuidado paliativo pediátrico'],
94:['Fisioterapia Respiratória','Monitorização ventilatória: pressão média das vias aéreas'],95:['Fisioterapia Respiratória','Mecânica respiratória: cálculo da resistência das vias aéreas'],96:['Fisioterapia Respiratória','Complacência estática do sistema respiratório e pressão de distensão'],97:['Fisioterapia Respiratória','Curva pressão-volume e avaliação mecânica respiratória'],98:['Fisioterapia Respiratória','Curvas ventilatórias e identificação de auto-PEEP'],
99:['Fisioterapia Pediátrica','Desospitalização de crianças dependentes de suporte à vida'],100:['Fisioterapia Pediátrica','Planejamento de alta: preparo de cuidadores e retaguarda de urgência']
}
const contextoPorNumero={
41:'No que se refere aos músculos respiratórios, julgue os itens subsequentes.',
46:'Julgue os itens a seguir, com relação à oxigenoterapia.',
49:'Julgue os próximos itens, acerca da síndrome da angústia respiratória aguda (SDRA).',
54:'A respeito da hérnia diafragmática, julgue os itens que se seguem.',
59:'Texto-base: a internação hospitalar pode causar preocupação, tristeza, ansiedade, medo e estresse em crianças; humanizar o ambiente hospitalar pode reduzir esses efeitos. Julgue os itens.',
61:'No que tange à decisão de realizar ressuscitação cardiopulmonar em pediatria, julgue os itens subsequentes.',
63:'Em relação à epidemiologia clínica, julgue os itens seguintes.',
65:'A respeito da pressão intracraniana, julgue os itens subsecutivos.',
69:'Acerca do desmame da ventilação mecânica em pediatria, julgue os próximos itens.',
71:'Em relação à interface para ventilação não invasiva, julgue o próximo item.',
72:'No que se refere à infecção hospitalar em pediatria, julgue os próximos itens.',
74:'Acerca do sistema de terapia de alto fluxo, julgue os itens que se seguem.',
78:'Julgue os itens a seguir, com relação às doenças neuromusculares em crianças e adolescentes.',
80:'Texto-base: João, 12 anos, com distrofia muscular de Duchenne, apresenta piora pulmonar, capacidade vital de 600 mL (14% do previsto), episódios de infecção respiratória e hipoventilação; usa ventilação não invasiva durante o sono e em episódios de desconforto. Julgue os itens.',
83:'Texto-base: menino de 8 anos, tetraplégico após lesão medular traumática em C5, ASIA A, com bradicardia. Julgue os itens relativos ao quadro.',
87:'Texto-base: menino de 10 anos, amputação do membro superior esquerdo por osteossarcoma, metástase pulmonar e pós-operatório de ressecção de nódulos com dreno torácico; em oxigenoterapia Venturi com FiO₂ de 40%, SpO₂ de 96% e dor à inspiração profunda. Julgue os itens.',
92:'Julgue os próximos itens, em relação aos cuidados paliativos em terapia intensiva pediátrica.',
94:'Acerca da monitorização do sistema respiratório, julgue os itens seguintes.',
99:'No que diz respeito à desospitalização de crianças com doenças crônicas, julgue os itens que se seguem.'
}
const contexto=n=>{let t='';for(const k of Object.keys(contextoPorNumero).map(Number).sort((a,b)=>a-b))if(k<=n)t=contextoPorNumero[k];return t}
const paginas=new Map(catalog.questoes.map(q=>[Number(q.numero),Number(q.pagina)]))
if(Object.keys(temas).length!==60||new Set(catalog.questoes.map(q=>Number(q.numero))).size!==60)throw Error('Classificação não cobre os 60 itens oficiais 41–100')
for(let n=41;n<=100;n++)if(!temas[n]||!paginas.has(n)||!respostas[n])throw Error(`Item ${n}: classificação, página ou gabarito ausente`)
const registros=[]
for await(const {questoes} of lotesAtuais())for(const q of questoes)if(q.documento_id===doc)registros.push(q)
if(registros.length!==60||new Set(registros.map(q=>Number(q.numero_original))).size!==60)throw Error(`Esperava 60 registros OCR para 60 itens; encontrei ${registros.length} e ${new Set(registros.map(q=>q.numero_original)).size}`)
const correcoes={
48:'A oxigenoterapia de baixo fluxo é caracterizada quando o fluxo inspiratório do paciente é inferior ao fluxo ofertado pelo sistema.',
58:'Para otimizar a função pulmonar, o posicionamento mais indicado para a criança é o decúbito elevado e homolateral à hérnia diafragmática.',
60:'Realizar festividades — como aniversariantes do mês e festas regionais — é uma estratégia de integração entre paciente, família e equipe. No entanto, a equipe deve ser rígida e reforçar aos familiares e pacientes as regras do setor, para não haver perda do respeito.',
61:'Quando a criança se encontra em estado terminal de vida, a equipe multidisciplinar deve discutir com a família a decisão de não reanimá-la. Havendo incertezas, deve-se registrar em prontuário e manter a decisão da equipe.',
62:'Os pais são os defensores dos interesses de seus filhos. No entanto, a participação da criança e do adolescente nas decisões referentes ao seu tratamento de saúde deve ser considerada.',
64:'O ensaio clínico aleatorizado é o melhor método para testar uma intervenção terapêutica. No caso de um ensaio clínico de efetividade, pretende-se responder se o tratamento funciona em condições controladas, isto é, em condições ideais.',
68:'Em caso de crianças com hipertensão intracraniana aguda, é fortemente recomendada a hiperventilação (PaCO₂ – 25 mmHg) profilática.',
70:'São causas mais frequentes da falha no desmame em pediatria o desequilíbrio entre a capacidade dos músculos respiratórios e o trabalho respiratório, a obstrução das vias aéreas superiores, o excesso de secreção brônquica e a tosse ineficaz.',
71:'A máscara facial total é a melhor alternativa para criança acima de seis anos de idade com desconforto respiratório agudo por infecção e com hipoxemia.',
78:'A ventilação não invasiva aumentou a sobrevida dos pacientes com distrofia muscular do tipo Duchenne e diminuiu as taxas de óbito por causas respiratórias; no entanto, a insuficiência cardíaca, as causas abdominais e as infecções tornaram-se as causas mais frequentes de óbito.',
79:'A principal repercussão da atrofia muscular espinhal do tipo I sobre o sistema respiratório ocorre no parênquima pulmonar, que causa redução da SpO₂ em razão do déficit de oxigenação.',
82:'A respiração glossofaríngea deve ser instituída e pode ser um recurso para otimizar a tosse.',
86:'Especificamente nesse caso, a cinta abdominal aumenta a capacidade vital.',
92:'Proporcionar dignidade no processo de morrer é respeitar as decisões da equipe de saúde, do paciente e da família em relação à vida, não abreviar ou prolongar artificialmente a vida, promover a beneficência, a não maleficência e a justiça.',
98:'No gráfico fluxo versus tempo, é facilmente identificável a presença da auto-PEEP, porque esta eleva o trabalho respiratório em razão da sobrecarga no disparo inspiratório.',
99:'Para que uma criança com doença crônica e dependente de aparelho para suporte de vida retorne ao lar, são fundamentais a atuação da equipe interdisciplinar, o desejo da família em recebê-la e a garantia de que os aparelhos a serem utilizados estejam disponíveis. No entanto, a estrutura do domicílio é questão secundária, uma vez que as necessidades são ajustadas conforme as condições familiares.',
100:'Para uma desospitalização efetiva, a família e/ou os cuidadores devem estar treinados em relação aos cuidados básicos, orientados para situações emergenciais e, de preferência, estar de acordo com o serviço de urgência como retaguarda.'
}
const digest=hashRevisao(respostaTexto)
const decisoes=registros.map(q=>{
 const n=Number(q.numero_original),t=temas[n],pagina=paginas.get(n),ctx=contexto(n),resposta=respostas[n],c=catalog.questoes.find(x=>x.id===q.id)
 if(!t||!pagina||!ctx)throw Error(`Item ${n}: classificação, página ou contexto ausente`)
 const imagensContexto=(c.paginas||[]).filter(p=>Number(p)!==pagina).map(p=>({pagina:Number(p),imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Continuação do item na página seguinte do caderno oficial.'}))
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2018,concurso,numero_original:n,pagina,dificuldade:[43,49,50,51,52,53,56,57,63,64,65,66,67,68,69,70,74,75,76,78,80,81,82,83,84,86,87,88,90,92,94,95,96,97,98,99].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela aplicação clínica e especificidade dos conceitos de fisioterapia intensiva pediátrica; a banca não publicou dificuldade por item.',motivo:`Item ${n}: matéria e conteúdo individualizados pela leitura do enunciado, do cenário clínico quando existente e do Cargo 40 oficial.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura integral do caderno oficial e inspeção visual das três páginas'},resposta_correta:resposta==='C'?0:1,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_394_EBSERHASSISTENCIAL040.PDF',criterio:'Gabarito oficial definitivo CEBRASPE — Cargo 40: Fisioterapeuta, Terapia Intensiva Pediátrica.',numero:n,pagina:1,resposta,sha256:digest,hash_metodo:'SHA-256 da sequência oficial dos 60 itens 41–100; não é hash do PDF.'},visual:{pagina,imagem:`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${pagina} do caderno original; o texto-base compartilhado foi associado ao item.`}}
 if(correcoes[n])d.enunciado=correcoes[n]
 if(imagensContexto.length)d.imagens_contexto=imagensContexto
 return d
})
for(let p=1;p<=3;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const base=raizesAtuais.find(x=>x.includes('revisao-inoversasul-comunicacao-2025-v212'))
if(!base)throw Error('Raiz v212 não encontrada')
const nome='revisao-ebserh-terapia-intensiva-pediatrica-2018-v213'
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,documento_id:doc,registros_revistos:decisoes.length,itens_oficiais_no_caderno:60,itens_unicos_classificados:60,duplicatas_ocr_excluidas:0,gabaritos_definitivos_associados:60,paginas_originais_conferidas:[1,2,3],itens_com_continuacao_visual:decisoes.filter(x=>x.imagens_contexto).length,data_aplicacao:'2018-05-06',prova,gabarito,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão EBSERH — Fisioterapeuta, Terapia Intensiva Pediátrica — v213\n\n- Revisei os 60 itens oficiais, de 41 a 100. Atribuí matéria e conteúdo por tema clínico, cargo, ano, dificuldade estimada e gabarito definitivo; associei cenários pediátricos compartilhados e as páginas originais, inclusive continuações entre páginas.\n- Corrigi transcrições OCR que incorporavam cabeçalhos e questões seguintes nos itens 48, 58, 60–62, 64, 68, 70–71, 78–79, 82, 86, 92 e 98–100.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [prova do Cargo 40](<${prova}>), [gabarito definitivo](<${gabarito}>), [concurso EBSERH 2018](https://www.cebraspe.org.br/concursos/EBSERH_18_ASSISTENCIAL).\n`)
console.log(JSON.stringify(out))
