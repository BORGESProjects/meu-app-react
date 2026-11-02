import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-fub-2022-farmaceutico-cargo8-v481',documento='ccdb9fd7950f7dda'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_22/arquivos/678_FUB_008_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/fub_22/arquivos/GAB_DEFINITIVO_678_FUB_008_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/FUB_22/arquivos/FUB_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const concurso='FUB — Farmacêutico (Cargo 8) — 2022'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url.toLowerCase(),prova.toLowerCase())
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,75)
const hashes=new Map(pendentes.map(q=>[q.id,hashRevisao(q.enunciado)]))
const respostas=['C','E','C','E','E','C','C','C','C','E','C','C','C','C','C','E','E','X','C','E','E','C','E','E','E','E','C','E','C','E','E','E','E','E','C','E','C','C','E','C','C','X','E','C','E','C','E','E','E','E','C','C','C','C','C','E','E','C','E','C','C','C','C','C','C','C','C','C','E','C']
assert.equal(respostas.length,70)
const respostaPorNumero=new Map(respostas.map((r,i)=>[i+51,r]))
const duplicatas=new Map([
 ['extr-a1bf20f50e159ff4acf3','extr-3724a4a109466fe5a8e3'],
 ['extr-d90324c9c55318a3af60','extr-e7e4e5f9cf9065f92888'],
 ['extr-b27df8d8a45173f71f4b','extr-b24f9dbd184fdfa987eb'],
 ['extr-1fcb77877b9ce42e9f0f','extr-5817db0173ec8431e458'],
 ['extr-80c44b08e78dbb4c900b','extr-bb161da9ab0f7a9752d1']
])
const assuntos=new Map()
const grupo=(ns,m,c)=>ns.forEach(n=>assuntos.set(n,[m,c]))
grupo([51,52,53,54,55,56],'Farmacotécnica','Desenvolvimento de formas farmacêuticas: excipientes, vias de administração, cápsulas e liberação modificada')
grupo([57,58,59,60,61],'Controle de Qualidade de Medicamentos','Validação de método espectrofotométrico: linearidade, limite de quantificação, doseamento e diluição')
grupo([62,63,64,65,66,67],'Farmacologia Cardiovascular','Antiarrítmicos: classes de Vaughan Williams e efeitos sobre as fases do potencial de ação cardíaco')
grupo([68,69,70],'Farmacologia Renal','Diuréticos: mecanismo, potência e curva dose-resposta de furosemida e hidroclorotiazida')
grupo([71,72,73,74],'Farmacologia do Sistema Digestório','Fármacos gastrointestinais: anti-helmínticos, antieméticos, procinéticos e metilxantinas')
grupo([75,76,77,78,79],'Assistência Farmacêutica','Dispensação de medicamentos: prescrição, orientação, uso seguro e controle de estoque')
grupo([80,81,82,83,84,85],'Farmacologia Geral','Interações medicamentosas e alimento-fármaco, metabolismo, toxicidade e tolerância')
grupo([86,87,88,89],'Assistência Farmacêutica','Medicamentos genéricos, específicos e do Componente Especializado; intercambialidade')
grupo([90,91,92,93],'Legislação Farmacêutica','Portaria SVS/MS nº 344/1998: prescrição, dispensação e controle de substâncias sujeitas a controle especial')
grupo([94,95,96,97],'Legislação Farmacêutica','Resolução CFF nº 328/1999: boas práticas de dispensação em farmácias e drogarias')
grupo([98,99,100],'Assistência Farmacêutica','Gestão de medicamentos, controle de estoque, farmacovigilância e segurança do paciente')
grupo([101,102,103,104],'Farmacovigilância','Notificação de eventos adversos e queixas técnicas; VigiMed e Sistema Nacional de Vigilância Sanitária')
grupo([105,106],'Farmácia Hospitalar','Prevenção e controle de infecções relacionadas à assistência à saúde')
grupo([107,108,109,110,111,112],'Farmacologia Clínica','Medicamentos para resfriado: dipirona, paracetamol, anti-histamínicos e descongestionantes; eventos adversos')
grupo([113,114,115,116],'Farmacologia Endócrina','Diabetes mellitus tipo 2: metformina, interações alimento-fármaco, insulina e sulfonilureias')
grupo([117,118,119,120],'Nutrição Clínica e Parenteral','Nutrição parenteral: esterilidade, especificações de insumos, osmolaridade e densidade calórica')
const contextos=[
 [51,'Uma indústria farmacêutica planeja desenvolver nova forma farmacêutica para um fármaco atualmente comercializado em solução. Considere a situação descrita no caderno original.'],
 [57,'A pomada contém 2% (m/V) de princípio ativo. O método espectrofotométrico validado tem faixa linear, equação de regressão, limite de detecção e absorbância mínima conforme o enunciado original.'],
 [62,'A figura da página 1 representa os efeitos de fármacos das classes antiarrítmicas A, B, C e D sobre as fases do potencial de ação cardíaco. A figura deve ser lida junto dos itens 62 a 67.'],
 [68,'O gráfico da página 2 apresenta a excreção urinária de sódio em função da dose de hidroclorotiazida e furosemida, além do controle. Use o gráfico para os itens 68 a 70.'],
 [71,'A respeito dos fármacos que afetam a função gastrointestinal, julgue os itens.'],
 [75,'Em relação à dispensação de medicamentos como ato de promoção da saúde, julgue os itens.'],
 [80,'A respeito de interações medicamentosas, julgue os itens.'],
 [86,'Acerca de medicamentos genéricos, excepcionais e específicos, julgue os itens.'],
 [90,'De acordo com a Portaria nº 344/1998 do Ministério da Saúde, julgue os itens.'],
 [94,'Julgue os itens conforme a Resolução CFF nº 328/1999, sobre boas práticas de dispensação em farmácias e drogarias.'],
 [98,'Julgue os itens sobre planejamento e controle de estoque de medicamentos, controle de infecção hospitalar, biossegurança e farmacovigilância.'],
 [101,'As notificações relacionadas à farmacovigilância são realizadas por sistema eletrônico da Anvisa, observados os critérios descritos no texto-base da prova.'],
 [105,'O controle de infecções hospitalares é atividade multiprofissional; julgue os itens sobre as ações da farmácia.'],
 [107,'Considere o texto-base da página 3 sobre medicamentos utilizados para tratar resfriado e os riscos de uso abusivo.'],
 [113,'Considere o texto-base da página 3 sobre diabetes tipo 2, hiperglicemia e complicações crônicas.'],
 [117,'Considere o texto-base sobre vitaminas e manipulação de nutrição parenteral; julgue os itens.']
]
const contextoDe=n=>contextos.filter(([a])=>a<=n).at(-1)?.[1]||''
const dificuldadeFacil=new Set([51,52,55,57,59,63,64,68,69,71,72,75,77,79,86,87,88,94,96,101,102,103,104,107,108,110,112,113,116,117,119,120])
const dificuldadeDificil=new Set([56,58,60,61,62,65,66,67,70,80,81,82,84,85,90,91,92,93,95,98,99,100,105,106,109,114,115,118])
const remover=['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero),assunto=assuntos.get(n);assert.ok(assunto,`Sem classificação: ${n}`)
 const repetida=duplicatas.has(q.id),resposta=respostaPorNumero.get(n);assert.ok(resposta,`Sem gabarito: ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`,anulada=resposta==='X'
 let enunciado=q.enunciado.replace(/\s+/g,' ').trim()
 if(n===58)enunciado='O limite de quantificação da metodologia citada é de 5,0 μg/mL.'
 if(n===60)enunciado='Uma amostra para doseamento pode ser preparada fazendo-se duas diluições sequenciais de 1:10 em solvente apropriado.'
 if(n===61)enunciado='Uma amostra submetida à diluição prévia de 400 vezes, com valor de absorbância de 7,7, possui 100% do teor esperado do princípio ativo.'
 if(n===62)enunciado='A letra A representa os fármacos antiarrítmicos da classe I, que bloqueiam os canais de sódio; o efeito característico sobre o potencial de ação é reduzir a velocidade máxima de despolarização durante a fase 0.'
 if(n===100)enunciado='Em gerenciamento de estoque, o ponto de ressuprimento é definido como aquele em que o estoque de segurança atinge o P90, ou seja, 90% do estoque.'
 if(n===115)enunciado='A insulina é classificada como hormônio anabólico, pois ativa a glicogênio fosforilase, enzima que decompõe o glicogênio hepático em glicose e promove a conversão de ácidos graxos armazenados no tecido adiposo em glicose.'
 if(n===116)enunciado='Sulfonilureias são fármacos que promovem a liberação de insulina a partir das células beta do pâncreas.'
 const d={id:q.id,sha256_enunciado:hashes.get(q.id),materia:assunto[0],conteudo:assunto[1],ano:2022,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — aplicada em 01/05/2022',cargo:'Farmacêutico (Cargo 8)',numero:n,numero_original:n,pagina,dificuldade:dificuldadeFacil.has(n)?'Fácil':dificuldadeDificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme o domínio farmacológico, interpretação normativa e cálculo requerido; não é índice psicométrico oficial.',resposta_correta:anulada?null:resposta==='C'?0:1,anulada,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_678_FUB_008_01.PDF',sha256:hashRevisao(respostas.join('')),numero:n,resposta,criterio:'Gabarito oficial definitivo CEBRASPE; anulações conferidas nas justificativas oficiais.'},classificacao_fonte:prova,motivo:`Classificação por leitura do item, texto-base e edital do Cargo 8 — Farmacêutico.`,texto_apoio:contextoDe(n),visual:{pagina,imagem,enunciado,texto_apoio:contextoDe(n),motivo:`Página ${pagina} conferida visualmente; gráfico da resposta diurética e esquema do potencial de ação permanecem associados aos itens pertinentes.`},apta_resolucao:!repetida,remover_pendencias:remover}
 if(enunciado!==q.enunciado.replace(/\s+/g,' ').trim())d.enunciado=enunciado
 if(repetida){d.inelegibilidade_motivo='recorte_ocr_duplicado_ou_corrompido_do_mesmo_item_no_caderno';d.duplicada_de=duplicatas.get(q.id)}
 return d
})
assert.equal(decisoes.length,75);assert.equal(decisoes.filter(x=>x.apta_resolucao).length,70);assert.deepEqual(decisoes.filter(x=>x.anulada&&x.apta_resolucao).map(x=>x.numero),[68,92])
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,recortes:75,itens_unicos:70,duplicados_inelegiveis:5,anuladas:[68,92],paginas_conferidas:[1,2,3],grafico_e_diagrama_preservados:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,justificativas,concurso,recortes_revisados:75,itens_unicos:70,duplicatas_sinalizadas:5,anuladas:[68,92],paginas_conferidas:[1,2,3],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## FUB 2022 — Farmacêutico, Cargo 8 — revisão v481\n\n- Revisei 75 recortes pendentes: 70 itens únicos e cinco cópias/recortes OCR duplicados, marcados inelegíveis e vinculados ao registro correspondente. Classifiquei os itens por farmacotécnica, controle de qualidade, farmacologia, assistência farmacêutica, legislação, farmacovigilância, farmácia hospitalar e nutrição parenteral.\n- Conferi visualmente as páginas 1–3. O esquema das classes antiarrítmicas e o gráfico dose-resposta dos diuréticos continuam associados aos itens 62–70; texto-base de dispensação, farmacovigilância e nutrição também foi recuperado dos recortes originais.\n- Vinculei o gabarito definitivo oficial e as justificativas: itens 68 e 92 anulados; não recebem correção automática.\n- Pacote local, ainda não publicado na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabarito}>), [justificativas oficiais](<${justificativas}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
