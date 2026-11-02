import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-taxidermista-2016-v225',doc='1deda52304d7edf3'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_011_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_011_01.pdf'
const concurso='FUB — Concurso Público 2016 — Cargo 11: Taxidermista — aplicação em 18/12/2016'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
const numeros=catalog?.questoes.map(x=>x.numero)||[]
if(numeros.length!==74||new Set(numeros).size!==70||Math.min(...numeros)!==51||Math.max(...numeros)!==120)throw Error('Caderno FUB diverge do inventário esperado (74 registros, 70 itens únicos, 51–120)')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-petrobras-edificacoes-2023-v224'))
if(start<0)throw Error('Base v224 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const wanted=new Set(catalog.questoes.map(x=>x.id)),byId=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==74||wanted.size)throw Error(`Esperados 74 registros FUB; encontrados ${byId.size}; ausentes ${wanted.size}`)

// Transcrição do gabarito definitivo oficial, na ordem impressa para os itens 51–120.
const keyGroups=[
 'C E E C C C E E E E C C E E C E E C C C',
 'C C C E E E E C E C C E E C C E C C E E',
 'C E C C E C C E E C E E C C C E C E C E',
 'C C C C E E E C E E'
]
const keys=keyGroups.flatMap(x=>x.split(' '))
if(keys.length!==70||keys.some(x=>!['C','E','X'].includes(x)))throw Error(`Gabarito definitivo incompleto: ${keys.length}/70`)
const keyByNumber=new Map(keys.map((k,i)=>[51+i,k]))

// Matéria e tópico foram atribuídos pela leitura de cada enunciado no caderno oficial.
const topics={
51:['Zoologia','Anatomia comparada de aves: pulmões e topografia celômica'],52:['Zoologia','Anatomia comparada de aves: trato digestório'],53:['Zoologia','Anatomia comparada: laringe, siringe e fonação em aves'],54:['Zoologia','Anatomia comparada de aves: timo e distribuição cervical'],55:['Zoologia','Anatomia comparada de aves: rins e simetria topográfica'],56:['Zoologia','Anatomia comparada de aves: esqueleto apendicular e tibiotarso'],57:['Zoologia','Anatomia comparada de aves: sinsacro e fusão vertebral'],58:['Zoologia','Anatomia comparada de aves: ovário funcional e reprodução'],
59:['Zoologia','Anatomia de mamíferos: peritônio e cavidades serosas'],60:['Zoologia','Anatomia e fisiologia de mamíferos: glândula mamária'],61:['Zoologia','Anatomia dentária de mamíferos: fórmula dental dos felinos'],62:['Zoologia','Anatomia craniana: seios paranasais'],63:['Zoologia','Anatomia comparada: osso coxal e ísquio'],64:['Zoologia','Anatomia comparada: laringe e cartilagens laríngeas'],65:['Zoologia','Tegumento de vertebrados: derivados epidérmicos'],66:['Zoologia','Anatomia cardiovascular: pericárdio e grandes vasos'],
67:['Taxidermia','Preparação de aves: retirada da pele e preservação das falanges'],68:['Taxidermia','Preparação de peles: materiais absorventes e retenção de fluidos'],69:['Taxidermia','Morfometria externa e manutenção das proporções do espécime'],70:['Taxidermia','Preparação de esqueletos: limpeza por dermestídeos'],71:['Zoologia','Anatomia de anfíbios: corpos adiposos associados às gônadas'],72:['Zoologia','Anatomia de anfíbios: uróstilo e vértebras caudais'],73:['Zoologia','Zoologia comparada: características diagnósticas de répteis'],74:['Zoologia','Anatomia reprodutiva de serpentes: oviduto e infundíbulo'],75:['Zoologia','Anatomia de quelônios: esqueleto do membro torácico'],
76:['Zoologia','Coleta de vertebrados: redes de neblina e captura de primatas'],77:['Zoologia','Amostragem de aves: métodos ativos e passivos de captura'],78:['Zoologia','Amostragem de aves: atração acústica e playback'],79:['Zoologia','Amostragem de répteis: armadilhas fotográficas'],80:['Zoologia','Levantamento de fauna: vestígios indiretos e rastros'],81:['Zoologia','Amostragem de répteis: armadilhas de queda e captura'],82:['Taxidermia','Preparação de vertebrados: aproveitamento de crânios em coleções'],83:['Taxidermia','Preparação de répteis: uso de Dermestes e limpeza de peles'],84:['Taxidermia','Conservação em via úmida: fixação de répteis em formalina'],85:['Taxidermia','Dissecação de mamíferos: instrumental cirúrgico'],
86:['Zoologia','Coleta de peixes: pesca elétrica e seletividade amostral'],87:['Zoologia','Coleta de peixes: puçás, peneiras e amostragem marginal'],88:['Zoologia','Coleta de peixes: covos e captura de espécies bentônicas'],89:['Zoologia','Coleta de peixes: redes de emalhar e métodos passivos'],90:['Taxidermia','Preparação de peixes: montagem em via seca e material de enchimento'],91:['Curadoria de Coleções Biológicas','Conservação de peixes em coleções científicas: lotes e álcool'],92:['Taxidermia','Fixação de peixes: formalina e preservação de estruturas internas'],93:['Zoologia','Técnicas anatômicas: diafanização e visualização do esqueleto'],94:['Taxidermia','Fixação e conservação de peixes de pequeno porte'],95:['Zoologia','Fisiologia sensorial: quimiorrecepção e visão'],96:['Zoologia','Fisiologia animal: termorregulação comportamental e agrupamento'],97:['Zoologia','Fisiologia digestiva de ruminantes: fermentação e gases'],98:['Zoologia','Fisiologia de peixes: flutuabilidade em elasmobrânquios'],99:['Zoologia','Fisiologia excretora: produtos nitrogenados por grupo zoológico'],100:['Zoologia','Fisiologia respiratória de peixes: respiração aquática'],
101:['Curadoria de Coleções Biológicas','Curadoria de coleções didáticas: conservação e avaliação de danos'],102:['Curadoria de Coleções Biológicas','Gestão de acervos zoológicos: curadoria e identificação taxonômica'],103:['Curadoria de Coleções Biológicas','Expografia científica: dioramas e comunicação didática'],104:['Curadoria de Coleções Biológicas','Nomenclatura zoológica: espécimes-tipo e coleções científicas'],105:['Curadoria de Coleções Biológicas','Gestão de acervos: durabilidade e finalidade das coleções didáticas'],106:['Curadoria de Coleções Biológicas','Legislação e gestão de acervos: empréstimo e intercâmbio de material biológico'],107:['Conservação de Coleções Biológicas','Conservação preventiva: higienização de espécimes taxidermizados'],108:['Conservação de Coleções Biológicas','Conservação preventiva: limpeza de plumagem e direção das hastes'],109:['Conservação de Coleções Biológicas','Conservação preventiva: fotodegradação e deterioração de materiais orgânicos'],110:['Conservação de Coleções Biológicas','Conservação preventiva: umidade relativa, temperatura e biodeterioração'],
111:['Zoologia','Nomenclatura zoológica: gênero, epíteto específico e binômio'],112:['Zoologia','Taxonomia zoológica: posição hierárquica de família e ordem'],113:['Zoologia','Taxonomia zoológica: inclusão e exclusão entre táxons'],114:['Zoologia','Classificação zoológica: filo Chordata e vertebrados'],115:['Zoologia','Taxonomia zoológica: família Characidae e ordem dos peixes'],116:['Biossegurança','Biossegurança em taxidermia: uso de luvas e avaliação de risco biológico'],117:['Biossegurança','Biossegurança: descarte e reprocessamento de luvas de procedimento'],118:['Biossegurança','Gerenciamento de resíduos de serviços de saúde: tratamento e descarte de carcaças'],119:['Biossegurança','Segurança química: riscos e propriedades do bórax'],120:['Biossegurança','Avaliação de risco e níveis de biossegurança em laboratório']
}
if(Object.keys(topics).length!==70)throw Error('Classificação não cobre os 70 itens únicos')

// Seleciona os registros que melhor preservam a leitura; as demais quatro versões OCR serão inelegíveis como cópias.
const canonical={54:'extr-838dbbaa7e0aaeb14f56',61:'extr-ef4a54de78a9cb804703',65:'extr-b34066d39a36f232b532',66:'extr-436c0767dda8c9624e1e'}
const dups=[]
for(const n of [54,61,65,66]){const entries=catalog.questoes.filter(e=>e.numero===n);if(entries.length!==2||!entries.some(e=>e.id===canonical[n]))throw Error(`Duplicata ${n} divergente`);dups.push(entries.find(e=>e.id!==canonical[n]))}
const contexts={
51:'Bloco: anatomia das aves (itens 51–58). Julgue cada afirmação com base na anatomia comparada de aves.',
59:'Bloco: anatomia dos mamíferos (itens 59–62). No item 61, a fórmula dental impressa no caderno original é 2 (I3/3 – C1/1 – P3/2 – M1/1), com I = incisivos, C = caninos, P = pré-molares e M = molares.',
63:'Bloco: anatomia dos mamíferos (itens 63–66).',67:'Bloco: taxidermia e preparação de aves (itens 67–70).',
71:'Bloco: anatomia de répteis e anfíbios (itens 71–75).',76:'Bloco: métodos de coleta e amostragem de vertebrados terrestres (itens 76–81).',
82:'Bloco: preparação de vertebrados terrestres para coleções científicas (itens 82–85).',86:'Bloco: coleta de vertebrados aquáticos (itens 86–89).',
90:'Bloco: preparação de vertebrados aquáticos (itens 90–94).',95:'Bloco: fisiologia de vertebrados (itens 95–100).',
101:'Bloco: coleções biológicas didáticas e científicas (itens 101–106).',107:'Bloco: curadoria, conservação e preservação de coleções biológicas (itens 107–110).',
111:'Bloco: etiqueta da coleção de ictiologia do Museu Paraense Emílio Goeldi, mostrada na página 3 do caderno. A etiqueta identifica Characidae, gênero Moenkhausia, epíteto collettii, localidade Porto Trombetas, Oriximiná–PA, bacia Amazônica; use também a imagem original anexada.',
116:'Bloco: texto sobre a história do sabão arsenical e o uso atual do tetraborato de sódio deca-hidratado (bórax), página 3. Julgue os itens sobre biossegurança em taxidermia usando esse contexto.'
}
const contextStart=n=>Object.keys(contexts).map(Number).filter(x=>x<=n).at(-1)
const allPages=[1,2,3].map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:''}))
for(const p of allPages)await fs.access(`public/acervo-extraido/${p.imagem}`)
const digest=hashRevisao(keys.join(',')),decisoes=[]
for(const e of catalog.questoes){
 const n=e.numero,q=byId.get(e.id),isDuplicate=dups.some(x=>x.id===e.id)
 if(isDuplicate){const winner=canonical[n];decisoes.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topics[n][0],conteudo:topics[n][1],ano:2016,concurso,numero_original:n,pagina:e.pagina,apta_resolucao:false,inelegibilidade_motivo:'Registro OCR duplicado do mesmo item oficial; versão canônica preservada separadamente.',duplicada_de:winner,motivo:`Revisão v225: duplicata OCR do item ${n}; não é uma questão independente.`});continue}
 const [materia,conteudo]=topics[n],k=keyByNumber.get(n),ctx=contexts[contextStart(n)]
 if(!q||!materia||!conteudo||!ctx||!k)throw Error(`Item ${n}: faltou registro, classificação, contexto ou chave oficial`)
 const fixed=n===54?'O timo consiste de uma série de lobos separados, com formatos irregulares e posicionados lateralmente ao pescoço, ao longo de cada veia jugular.':n===61?'Os gatos domésticos possuem trinta dentes permanentes, quantidade representada pela seguinte fórmula: 2 (I3/3 – C1/1 – P3/2 – M1/1), em que I corresponde aos dentes incisivos, C aos caninos, P aos pré-molares e M aos molares.':undefined
 const pages=e.pagina===1?[allPages[0]]:e.pagina===2?[allPages[1]]:[allPages[2]]
 const anulada=k==='X'
 decisoes.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,concurso,numero_original:n,pagina:e.pagina,
  dificuldade:([51,52,55,56,59,60,62,65,71,72,73,74,75,78,80,82,83,84,85,87,90,91,94,95,96,101,103,104,105,108,109,110,111,114,116,117,118,119,120].includes(n)?'Fácil':[53,57,61,63,64,66,67,68,70,74,76,77,79,81,86,88,89,92,93,97,98,99,100,102,106,107,112,113,115].includes(n)?'Difícil':'Média'),
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme precisão anatômica, técnica de preparação/conservação e integração de conceitos de zoologia; a banca não divulga dificuldade psicométrica por item.',
  opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],resposta_correta:anulada?null:k==='C'?0:1,anulada,
  texto_apoio:ctx,gabarito_oficial:{valor:k,fonte:gabarito,arquivo:'Gab_Definitivo_281FUB_011_01.pdf',prova,numero:n,pagina:1,sha256:digest,hash_metodo:'SHA-256 da sequência de 70 valores do gabarito oficial definitivo, itens 51–120; não é hash do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE — FUB 2016, Cargo 11: Taxidermista.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura individual do enunciado, contexto e página do caderno oficial; comparação com o gabarito definitivo.'},
  visual:{pagina:e.pagina,imagem:pages[0].imagem,texto_apoio:ctx,motivo:`Página ${e.pagina} do caderno oficial associada ao item ${n}; contexto em bloco preservado.${n>=111&&n<=115?' A etiqueta taxonômica original da página 3 permanece visível.':''}`},
  imagens_contexto:pages.filter(x=>x.pagina!==e.pagina),
  ...(fixed?{enunciado:fixed}:{}),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v225 do item ${n}: banca, órgão, concurso/cargo, ano, matéria, assunto específico, contexto, página original e gabarito definitivo conferidos.${anulada?' Item anulado oficialmente.':''}`})
}
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,itens_unicos:70,registros_ocr_duplicados:4,duplicatas:dups.map(x=>({id:x.id,numero:x.numero,canonica:canonical[x.numero]})),anuladas:keys.map((k,i)=>k==='X'?51+i:null).filter(Boolean),paginas_originais:3,publicado:false},null,2))
