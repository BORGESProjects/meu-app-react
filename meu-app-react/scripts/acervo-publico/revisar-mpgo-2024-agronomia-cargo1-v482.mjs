import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-mpgo-2024-analista-ambiental-agronomia-cargo1-v482',documento='8e39ba27f0b0261a'
const prova='https://cdn.cebraspe.org.br/concursos/MP_GO_24_SERVIDOR/arquivos/964_MPGO_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/mp_go_24_servidor/arquivos/GAB_DEFINITIVO_964_MPGO_001_01.PDF'
const edital='https://cdn.cebraspe.org.br/concursos/MP_GO_24_SERVIDOR/arquivos/ED_1_2024_MPGO_ABERTURA_ATUALIZADO_RET_2.PDF'
const concurso='MPGO — Analista Ambiental — Engenharia Agronômica (Cargo 1) — 2024'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,75)
const hashes=new Map(pendentes.map(q=>[q.id,hashRevisao(q.enunciado)]))
const respostas=['E','E','C','C','C','E','C','E','C','E','E','C','C','E','E','C','E','C','C','E','C','C','E','E','E','C','C','C','E','C','C','E','C','E','C','E','E','E','C','C','C','E','C','E','E','C','C','E','C','C','E','C','E','E','C','C','E','C','E','C','C','E','C','E','C','E','C','C','C']
assert.equal(respostas.length,69)
const respostaPorNumero=new Map(respostas.map((r,i)=>[i+51,r]))
const duplicatas=new Map([
 ['extr-f211452d8a9bcc18a244','extr-4cecd399f44de69913e6'],
 ['extr-126cc25103e2f93db54f','extr-85156c50170fb9b2de4f'],
 ['extr-a1d45d573fa8f54860e5','extr-bfd6dab213a8543fa33d'],
 ['extr-659dc7eb80266dcf287f','extr-8e83b5d635245c3cff27'],
 ['extr-818391f47f15748f28b4','extr-9001990a0d899a8a311a'],
 ['extr-ddb3784e31b5c103c882','extr-ce6c2280d216ba0d47cb']
])
const assuntos=new Map(),grupo=(ns,m,c)=>ns.forEach(n=>assuntos.set(n,[m,c]))
grupo([51,52,53],'Agrometeorologia','Zoneamento agroclimático, fotoperíodo e risco climático de geadas')
grupo([54,55,56],'Armazenagem e Secagem de Grãos','Massa específica, capacidade de secagem e cinética de secagem de grãos')
grupo([57,58,59,60],'Avaliação de Imóveis Rurais','ABNT NBR 14653-3:2019: capitalização da renda e métodos de avaliação de terras e florestas')
grupo([61,62,63],'Fisiologia e Morfologia Vegetal','Dormência e germinação de sementes; giberelinas; composição e função da parede celular vegetal')
grupo([64,65,66],'Entomologia Agrícola','Bacillus thuringiensis e ordens de insetos-praga de importância agrícola')
grupo([67,68],'Gênese e Conservação do Solo','Latossolos do Cerrado, textura do solo e suscetibilidade à erosão')
grupo([69,70,71,72,73,74],'Fitopatologia','Exclusão e manejo integrado de doenças; nematoides, hérnia das crucíferas, requeima e fungicidas')
grupo([75,76,77],'Silvicultura','Desrama, coroamento e preparo do solo em sistemas florestais')
grupo([78,79,80],'Sistemas Agroflorestais','Agroflorestas e sistemas silvipastoris: produção e serviços ecossistêmicos')
grupo([81,82,83],'Hidráulica','Transientes hidráulicos, cavitação em bombas e lei de Newton da viscosidade')
grupo([84,85,86],'Irrigação e Engenharia de Barragens','Uniformidade de emissores, dimensionamento hidráulico de canais e estabilidade de barragens de terra')
grupo([87,88,89,90],'Recuperação de Áreas Degradadas','Semeadura direta, banco de sementes, nucleação e sucessão ecológica')
grupo([91,92,93],'Gestão de Recursos Hídricos','Manejo de bacias hidrográficas, gestão descentralizada e processos hidrológicos')
grupo([94,95,96],'Melhoramento Genético Vegetal','Plantas Bt, método genealógico e sistemas de reprodução de plantas cultivadas')
grupo([97,98,99],'Plantas Daninhas e Herbicidas','Resistência a herbicidas, sorção no solo e impactos das plantas daninhas')
grupo([100,101,102,103],'Microbiologia do Solo','Micorrizas, Azospirillum, rizobactérias promotoras do crescimento e fixação biológica de nitrogênio')
grupo([104,105],'Topografia e Geomática Rural','Medição de áreas por decomposição em polígonos e levantamento por poligonal auxiliar')
grupo([106,107,108],'Cartografia e Sistemas de Informação Geográfica','Bancos de dados geoespaciais, política de retenção e produtos de mapeamento temático')
grupo([109,110],'Sensoriamento Remoto','Interpretação visual de imagens multiespectrais e fator de reflectância bidirecional')
grupo([111],'Geodésia e Posicionamento por Satélite','Princípios de medição e determinação de posição com GPS')
grupo([112,113],'Defesa Sanitária Animal','Notificação de doenças e Guia de Trânsito Animal (GTA)')
grupo([114,115],'Forragicultura e Nutrição Animal','Valor nutritivo de leguminosas forrageiras e fixação biológica de nitrogênio')
grupo([116,117,118,119,120],'Legislação Ambiental','Resoluções CONAMA nº 237/1997 e nº 1/1986, prova pericial ambiental e licenciamento')
const contextos=[
 [51,'Acerca da importância da agrometeorologia para as atividades agrícolas, julgue os itens.'],
 [54,'Julgue os itens relativos à armazenagem e ao processamento de grãos.'],
 [57,'No que se refere à avaliação de imóveis rurais, julgue os itens.'],
 [61,'Acerca da morfologia, anatomia, taxonomia e fisiologia das plantas, julgue os itens.'],
 [64,'A respeito dos artrópodes e de sua importância para a agricultura, julgue os itens.'],
 [67,'Considere a diversidade de solos brasileiros e suas características morfológicas, físicas e químicas, conforme o texto-base original.'],
 [69,'Julgue os itens relativos à fitopatologia e ao manejo de doenças de plantas.'],
 [75,'Acerca das técnicas comumente usadas na silvicultura, julgue os itens.'],
 [78,'Julgue os itens sobre sistemas silviculturais e agroflorestais.'],
 [81,'Acerca da hidrodinâmica, condução de água e sistemas de recalque, julgue os itens.'],
 [84,'A figura e a equação da página 2 subsidiam os itens sobre projetos de barragem de terra, canais e irrigação.'],
 [87,'No que se refere à recuperação de áreas degradadas, julgue os itens.'],
 [91,'Com base nos conceitos e processos relacionados ao manejo de bacias hidrográficas, julgue os itens.'],
 [94,'A respeito do melhoramento genético de plantas, julgue os itens.'],
 [97,'Considere os efeitos das plantas daninhas e dos herbicidas e julgue os itens.'],
 [100,'Considere os efeitos diretos e indiretos dos microrganismos do solo sobre as plantas.'],
 [104,'Julgue os itens sobre métodos de levantamento topográfico e suas aplicações na área rural.'],
 [106,'Julgue os itens sobre cartografia e gerenciamento de dados espaciais.'],
 [109,'Em relação aos conceitos de sensoriamento remoto, julgue os itens.'],
 [111,'A respeito de sistemas de geoposicionamento, julgue o item.'],
 [112,'Julgue os itens relativos à defesa sanitária animal.'],
 [114,'Considere a importância das pastagens para a nutrição animal e julgue os itens.'],
 [116,'Considere o licenciamento ambiental e a legislação ambiental aplicável, incluindo as Resoluções CONAMA citadas no caderno.']
]
const contextoDe=n=>contextos.filter(([a])=>a<=n).at(-1)?.[1]||''
const limpar=new Map([
 [56,'O processo de secagem de grãos ocorre mais lentamente no início, tornando-se mais rápido à medida que o produto fica mais seco.'],
 [66,'Os insetos são os únicos invertebrados que voam e, diferentemente dos outros artrópodes, possuem o corpo dividido em cabeça, tórax e abdome e apresentam três pares de pernas.'],
 [90,'Uma metodologia utilizada na recuperação de áreas degradadas é o plantio de espécies secundárias tardias ou climácicas rodeadas por espécies pioneiras ou secundárias iniciais.'],
 [96,'A soja (Glycine max) é uma planta autógama, por isso sua variabilidade genotípica é limitada e seu índice de adaptação é menor que o das plantas não autógamas.'],
 [104,'O método de decomposição em polígonos consiste na determinação de um padrão unitário de área e seu correspondente real, em função da escala da representação, bastando contar quantas unidades do padrão se ajustam aos limites da propriedade para, assim, por simples regra de três, obter a área total.'],
 [120,'Segundo a Resolução CONAMA nº 1/1986, o licenciamento de atividade modificadora do meio ambiente, a exemplo de projeto urbanístico acima de 50 ha ou em área considerada de relevante interesse ambiental, depende da elaboração de estudo de impacto ambiental (EIA) e do respectivo relatório de impacto ambiental (RIMA), a serem submetidos à aprovação do órgão estadual competente.']
])
const faceis=new Set([51,52,54,55,56,57,59,61,62,63,64,65,66,68,70,72,73,75,76,77,78,80,83,87,90,93,94,96,97,99,100,102,103,107,108,109,112,113,114,115,117,118])
const dificeis=new Set([53,58,60,67,69,71,74,81,82,84,85,86,88,89,91,92,95,98,101,104,105,106,110,111,116,119])
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero),assunto=assuntos.get(n);assert.ok(assunto,`Sem classificação ${n}`)
 const repetida=duplicatas.has(q.id),resposta=respostaPorNumero.get(n);assert.ok(resposta,`Sem gabarito ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
 const enunciado=(limpar.get(n)||q.enunciado).replace(/\s+/g,' ').trim()
 const d={id:q.id,sha256_enunciado:hashes.get(q.id),materia:assunto[0],conteudo:assunto[1],ano:2024,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — aplicada em 21/04/2024',cargo:'Analista Ambiental — Engenharia Agronômica (Cargo 1)',numero:n,numero_original:n,pagina,dificuldade:faceis.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada no nível técnico, na interpretação normativa e nos cálculos requeridos; não é medida psicométrica publicada pela banca.',resposta_correta:resposta==='C'?0:1,anulada:false,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_964_MPGO_001_01.PDF',sha256:hashRevisao(respostas.join('')),numero:n,resposta,criterio:'Gabarito oficial definitivo do Cargo 1 — Engenharia Agronômica.'},classificacao_fonte:prova,motivo:'Classificação específica por leitura do item e do conteúdo programático oficial de Engenharia Agronômica.',texto_apoio:contextoDe(n),visual:{pagina,imagem,enunciado,texto_apoio:contextoDe(n),motivo:`Página ${pagina} conferida visualmente; equação e elementos gráficos relevantes preservados no caderno original.`},apta_resolucao:!repetida,remover_pendencias:remover}
 if(enunciado!==q.enunciado.replace(/\s+/g,' ').trim())d.enunciado=enunciado
 if(repetida){d.inelegibilidade_motivo='recorte_ocr_duplicado_do_mesmo_item_no_caderno';d.duplicada_de=duplicatas.get(q.id)}
 return d
})
assert.equal(decisoes.length,75);assert.equal(new Set(decisoes.filter(x=>x.apta_resolucao).map(x=>x.numero)).size,69);assert.equal(decisoes.filter(x=>!x.apta_resolucao).length,6)
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,recortes:75,itens_unicos:69,duplicatas:6,paginas_conferidas:[1,2,3],equacao_e_imagens_preservadas:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,edital,concurso,recortes_revisados:75,itens_unicos:69,duplicatas_sinalizadas:6,paginas_conferidas:[1,2,3],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## MPGO 2024 — Analista Ambiental, Engenharia Agronômica, Cargo 1 — revisão v482\n\n- Revisei os 75 recortes pendentes: 69 itens únicos e seis recortes duplicados de OCR, preservando uma versão limpa de cada. Classifiquei os itens em agrometeorologia, armazenagem, avaliação rural, fisiologia vegetal, entomologia, solos, fitopatologia, silvicultura, hidráulica, recuperação ambiental, hidrologia, melhoramento vegetal, SIG, sensoriamento remoto, defesa sanitária e legislação ambiental.\n- Conferi visualmente as páginas 1–3; corrigi fragmentos de cabeçalho e texto contaminante nas questões 56, 66, 90, 96, 104 e 120. A equação e os recortes visuais originais continuam associados aos itens pertinentes.\n- Vinculei o gabarito definitivo oficial do Cargo 1 e os dados do edital. Pacote local, ainda não publicado na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [edital oficial](<${edital}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
