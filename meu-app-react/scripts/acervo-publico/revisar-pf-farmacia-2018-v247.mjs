import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='c911d9c85c9c0faf'
const fonte='https://cdn.cebraspe.org.br/concursos/PF_18/arquivos/MATRIZ_408_DGPPF011__PAG_4.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/pf_18/arquivos/ED_1_DPF_2018___ABT.PDF'
const concurso='Polícia Federal 2018 — Perito Criminal Federal, Cargo 11, Área 14: Farmácia'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70||catalog.url!==fonte)throw Error('Catálogo PF 2018 — Farmácia — divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-cbmal-combatente-2017-v246'))
if(start<0)throw Error('Base v246 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const l of manifest.lotes.filter(x=>x.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==70)throw Error(`Esperados 70 itens PF/Farmácia, encontrados ${active.size}`)

const topics=new Map([
 [51,['Farmacologia','Farmacodinâmica: receptores acoplados à proteína G e sinalização metabotrópica']],
 [52,['Farmacologia','Farmacodinâmica: canais iônicos como alvos e receptores farmacológicos']],
 [53,['Farmacologia','Farmacologia endócrina: receptores intracelulares de glicocorticoides']],
 [54,['Farmacologia','Farmacocinética: administração oral e metabolismo de primeira passagem']],
 [55,['Farmacologia','Farmacocinética: efeito de primeira passagem sobre biodisponibilidade']],
 [56,['Farmacologia','Farmacocinética: biotransformação de fármacos, reações de fase I e fase II']],
 [57,['Farmacologia','Farmacocinética: função renal, excreção e depuração de fármacos']],
 [58,['Farmacologia','Farmacodinâmica: antagonismo e interação fármaco–receptor']],
 [59,['Farmacologia','Farmacodinâmica: antagonista competitivo reversível e curva dose–resposta']],
 [60,['Farmacologia','Farmacodinâmica: eficácia, potência e concentração efetiva de fármacos']],
 [61,['Farmacologia','Farmacologia do sistema nervoso central: opioides e analgesia da dor intensa']],
 [62,['Farmacologia','Interações farmacológicas entre depressores do sistema nervoso central']],
 [63,['Farmacologia','Psicofarmacologia: antipsicóticos atípicos e efeitos sedativos da quetiapina']],
 [64,['Farmacologia','Interações medicamentosas: risco da associação de analgésicos e depressores do SNC']],
 [65,['Farmacologia','Farmacologia geral: tolerância após administração repetida de fármacos']],
 [66,['Farmacologia','Psicofarmacologia: estimulantes, dopamina e circuito cerebral de recompensa']],
 [67,['Farmacologia','Psicofarmacologia: antidepressivos tricíclicos e inibição da recaptação de monoaminas']],
 [68,['Farmacologia','Toxicologia de drogas de abuso: cocaína e bloqueio de transportadores monoaminérgicos']],
 [69,['Farmacognosia','Extração de princípios ativos vegetais: infusão, decocção e maceração']],
 [70,['Toxicologia','Toxicologia de metais: chumbo, neurotoxicidade e barreira hematoencefálica']],
 [71,['Toxicologia','Avaliação toxicológica pré-clínica e desenho de estudos de dose']],
 [72,['Toxicologia','Intoxicação por etanol e barbitúricos: sinergismo farmacológico e depressão do SNC']],
 [73,['Toxicologia','Intoxicação combinada por álcool e benzodiazepínicos']],
 [74,['Química','Química orgânica: identificação de grupos funcionais amida na cafeína']],
 [75,['Química','Equilíbrio ácido–base: ionização e comportamento da cafeína em água']],
 [76,['Química Analítica','Cromatografia em camada delgada: identificação e quantificação de cafeína']],
 [77,['Química Analítica','Espectroscopia no infravermelho: bandas de carbonila e transições eletrônicas']],
 [78,['Química','Estrutura molecular, solubilidade e polaridade da cafeína']],
 [79,['Química','Química heterocíclica: comparação estrutural de cafeína e guanina']],
 [80,['Bioquímica','Lipogênese: estrutura de glicerol, ácidos graxos e ligações éster em triglicerídeos']],
 [81,['Química','Geometria molecular: estrutura e ângulo de ligação da amônia']],
 [82,['Química Orgânica','Reações de lipídios: esterificação, hidrólise e saponificação']],
 [83,['Química','Cinética química: catálise ácida e mecanismo de formação de triglicerídeos']],
 [84,['Bioquímica','Lipogênese: reação de condensação e formação de água na síntese de triglicerídeos']],
 [85,['Química','Equilíbrio químico e cinética reversível: formação e hidrólise de triglicerídeos']],
 [86,['Bioquímica','Enzimas: energia de ativação e catálise de reações metabólicas']],
 [87,['Físico-Química','Termodinâmica: ciclo pressão–volume, calor absorvido e calor liberado']],
 [88,['Química Inorgânica','Química de coordenação: íon cobalto e número de coordenação na vitamina B12']],
 [89,['Química Orgânica','Estereoquímica: atividade óptica e centros quirais do ácido ascórbico']],
 [90,['Química Orgânica','Geometria molecular e hibridização dos átomos de carbono no ácido ascórbico']],
 [91,['Química Analítica','Calibração multivariada: regressão por mínimos quadrados parciais (PLS)']],
 [92,['Química Analítica','Métodos analíticos: comparação de PLS com análise gravimétrica']],
 [93,['Química Analítica','Validação de método: curva analítica, correlação e linearidade de resposta']],
 [94,['Físico-Química','Soluções iônicas: raio do ânion e comparação com o átomo neutro']],
 [95,['Físico-Química','Eletrólise de solução aquosa de cloreto de sódio e produtos nos eletrodos']],
 [96,['Físico-Química','Equilíbrio líquido–vapor e pressão parcial em recipiente fechado']],
 [97,['Físico-Química','Soluções: interações íon–íon, hidratação e dissolução de cloreto de sódio']],
 [98,['Microbiologia','Bacteriologia: morfologia microbiana e interpretação de imagem de líquor']],
 [99,['Imunologia','Citologia do líquor e resposta imune em infecção bacteriana do sistema nervoso']],
 [100,['Microbiologia','Bacteriologia: vias de transmissão de bactérias e formas microbianas']],
 [101,['Microbiologia','Diagnóstico microbiológico de meningite bacteriana e coloração de Gram']],
 [102,['Microbiologia','Bacteriologia: Bacillus anthracis, morfologia e agente etiológico do antraz']],
 [103,['Microbiologia','Bacteriologia: parede celular de bactérias Gram-positivas e Gram-negativas']],
 [104,['Imunologia','Imunidade adaptativa: antígeno, célula dendrítica e apresentação antigênica']],
 [105,['Imunologia','Regulação da resposta imune por linfócitos T regulatórios']],
 [106,['Imunologia','Apresentação de antígenos por MHC e diferenciação de linfócitos T auxiliares Th1']],
 [107,['Imunologia','Imunidade humoral: diferenciação de linfócitos B em plasmócitos']],
 [108,['Imunologia','Resposta imune celular: reconhecimento de patógenos intracelulares e fungos']],
 [109,['Imunologia','Resposta imune: patógenos extracelulares, bactérias e fungos']],
 [110,['Gestão da Qualidade','ABNT NBR ISO/IEC 17025: validação de métodos analíticos não normalizados']],
 [111,['Gestão da Qualidade','Validação analítica: adequação de substâncias químicas de trabalho']],
 [112,['Gestão da Qualidade','Métodos cromatográficos: identidade, seletividade e pureza do sinal analítico']],
 [113,['Gestão da Qualidade','Laboratórios: fatores ambientais que afetam validade e rastreabilidade de resultados']],
 [114,['Gestão da Qualidade','ABNT NBR ISO/IEC 17025: contratação externa de atividades de laboratório']],
 [115,['Gestão da Qualidade','ABNT NBR ISO/IEC 17025: análise independente de reclamações']],
 [116,['Legislação Sanitária','ANVISA: licenciamento de importação e autorização de embarque de produtos sob vigilância sanitária']],
 [117,['Legislação Sanitária','ANVISA: entrada no país de tecidos humanos para uso terapêutico']],
 [118,['Legislação Sanitária','Regulamento de alimentos para atletas: suplementos hidroeletrolíticos']],
 [119,['Legislação Sanitária','Regulamento de alimentos para atletas: composição de suplementos de cafeína']],
 [120,['Legislação Sanitária','Fitoterápicos: evidência de tradicionalidade de uso e comprovação de eficácia e segurança']],
])
if(topics.size!==70)throw Error(`Conteúdos classificados: ${topics.size}/70`)
const removable=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente']
for(const page of new Set(catalog.questoes.map(x=>x.pagina)))await fs.access(`public/acervo-extraido/paginas/${doc}-${String(page).padStart(4,'0')}.webp`)
const decisions=[...active.values()].map(q=>{
 const e=catalog.questoes.find(x=>x.id===q.id),n=Number(q.numero_original),page=e?.pagina
 if(!e||!page||!topics.has(n))throw Error(`Registro sem mapeamento temático/página: ${q.id}`)
 const stem=String(q.enunciado||'').replace(/[ \t\r\n]+/g,' ').trim()
 if(stem.length<20||/�|\ufffd/.test(stem))throw Error(`Enunciado OCR suspeito em ${q.id}`)
 const image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 const context=(e.paginas||[]).filter(p=>p!==page).map(p=>({pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto:'Página contígua do caderno oficial que preserva estrutura química, diagrama, imagem microscópica ou outro contexto visual do item.'}))
 const [materia,conteudo]=topics.get(n)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,concurso,numero_original:n,pagina:page,dificuldade:[56,59,60,64,67,68,71,73,76,77,83,85,87,88,91,93,95,97,101,103,106,110,112,116,117,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela integração de farmacologia, química, microbiologia e interpretação de elementos visuais; a banca não publica faixa individual de dificuldade.',classificacao_fonte:fonte,motivo:`Cebraspe, Polícia Federal 2018, Cargo 11 — Perito Criminal Federal, Área 14: Farmácia. Questão ${n}, página ${page}. Matéria e tópico definidos pelo conteúdo técnico e conferidos com o edital oficial e a página original.`,visual:{pagina:page,imagem:image,texto_apoio:q.texto_apoio||'',motivo:'Página original do caderno vinculada para manter fórmulas, estruturas químicas, diagramas e imagens necessários à resolução.'},...(context.length?{imagens_contexto:context}:{}),apta_resolucao:true,remover_pendencias:removable}
})
if(decisions.length!==70||new Set(decisions.map(x=>x.id)).size!==70)throw Error('Cobertura/IDs inválidos')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:70,novasClassificacoes:decisions.filter(x=>active.get(x.id).classificacao_pendente&&!active.get(x.id).classificacao_revisada).length,porMateria:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length])),paginasOriginais:[...new Set(decisions.map(x=>x.pagina))],referenciasVisuais:70,concurso,fonte,edital},null,2));process.exit(0)}
const name='revisao-pf-farmacia-2018-v247'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,registros:70,porMateria:Object.fromEntries([...new Set(decisions.map(x=>x.materia))].map(m=>[m,decisions.filter(x=>x.materia===m).length])),paginasOriginais:[...new Set(decisions.map(x=>x.pagina))],referenciasVisuais:70,concurso,fonte,edital,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Revisão Polícia Federal 2018 — Cargo 11, Área 14: Farmácia — v247\n\n- Revisei os 70 itens específicos (51–120) do caderno. O edital confirma a aplicação como Cargo 11 — Perito Criminal Federal, Área 14: Farmácia. Substituí o rótulo genérico por matérias e conteúdos específicos de farmacologia, farmacognosia, toxicologia, química, química analítica, bioquímica, microbiologia, imunologia, gestão da qualidade e legislação sanitária.\n- Conferi visualmente as páginas do PDF que contêm a estrutura da cafeína e da vitamina B12, o diagrama pressão–volume, a estrutura do ácido ascórbico, o esquema de lipogênese, a imagem microscópica, o diagrama de imunidade e as questões de regulamentação. Fórmulas e imagens seguem vinculadas à página original; o gabarito preexistente foi preservado.\n- Validação local: ${result.classificadas} registros revistos, ${result.novas_classificacoes} novas classificações, ${result.contextos_visuais} referências visuais, ${result.total} registros totais, ${result.disponiveis} elegíveis e ${result.pendentes} pendências. Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno de Farmácia](https://cdn.cebraspe.org.br/concursos/PF_18/arquivos/MATRIZ_408_DGPPF011__PAG_4.PDF), [edital — Cargo 11, Área 14: Farmácia](https://cdn.cebraspe.org.br/concursos/pf_18/arquivos/ED_1_DPF_2018___ABT.PDF), [página oficial do concurso](https://www.cebraspe.org.br/concursos/PF_18).\n`)
console.log(JSON.stringify(out,null,2))
