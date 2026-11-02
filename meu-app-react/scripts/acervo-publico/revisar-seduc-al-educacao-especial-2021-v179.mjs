import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='191a70b604b78b56'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_21/arquivos/606_SEDUC_AL_001_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_al_21/arquivos/GAB_DEFINITIVO_606_SEDUC_AL_CG1_01.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70)throw Error('Catálogo SEDUC-AL, Educação Especial, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-polc-al-tecnico-forense-2022-v178'))
if(start<0)throw Error('Base v178 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==70)throw Error(`Esperados 70 registros; encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const topics=new Map([
 [51,'Profissional de apoio escolar e auxílio nas atividades de alimentação, higiene, locomoção e participação acadêmica'],
 [52,'Direito à educação inclusiva e vedação de cobrança adicional pelo apoio escolar'],
 [53,'Profissional de apoio escolar e articulação com o AEE e a classe comum'],
 [54,'Profissional de apoio escolar e avaliação das necessidades de apoio do estudante'],
 [55,'Orientação e mobilidade de pessoas com deficiência visual: função do guia vidente'],
 [56,'Orientação e mobilidade: técnicas para pessoas cegas e com baixa visão'],
 [57,'Orientação e mobilidade: autonomia, autoconfiança e participação social'],
 [58,'Orientação e mobilidade: uso da bengala e técnicas de deslocamento seguro'],
 [59,'AEE: caráter complementar ou suplementar segundo a Resolução CNE/CEB nº 4/2009'],
 [60,'AEE: local de oferta, sala de recursos multifuncionais e turno de atendimento'],
 [61,'AEE e adequação curricular: plano de atendimento e organização dos apoios'],
 [62,'Deficiência visual: distinção entre cegueira e baixa visão'],
 [63,'Deficiência visual: caracterização e impedimentos da função visual'],
 [64,'Deficiência intelectual: níveis de apoio e classificação do funcionamento intelectual'],
 [65,'Deficiência intelectual: potencial de aprendizagem e avaliação não reducionista'],
 [66,'Deficiência intelectual: domínio conceitual e habilidades adaptativas'],
 [67,'Deficiência intelectual: domínio conceitual e necessidades de apoio'],
 [68,'Educação especial como modalidade transversal aos níveis e etapas de ensino'],
 [69,'Deficiência intelectual: avaliação multidimensional e limites do quociente intelectual'],
 [70,'AAIDD: avaliação da deficiência intelectual e uso do QI'],
 [71,'Deficiência intelectual: avaliação psicométrica e critérios diagnósticos'],
 [72,'Deficiência intelectual: qualidade dos instrumentos, avaliadores e informantes'],
 [73,'Sorobã: recurso de tecnologia assistiva utilizável por pessoas videntes'],
 [74,'Sorobã: apoio ao desenvolvimento de concentração e memória'],
 [75,'Transtornos funcionais específicos e articulação entre educação especial e ensino comum'],
 [76,'Transtorno global do desenvolvimento: características e espectro de condições'],
 [77,'Transtorno global do desenvolvimento: interação social, comunicação e comportamento'],
 [78,'AEE para estudantes com TGD: natureza pedagógica e articulação curricular'],
 [79,'Educação de estudantes surdos: modalidades de comunicação e Libras'],
 [80,'AEE: estratégias acessíveis de avaliação e recursos para estudantes surdos'],
 [81,'Educação bilíngue de surdos: Libras e língua portuguesa escrita'],
 [82,'AEE: matrícula e articulação com a escolarização na classe comum'],
 [83,'Lei Brasileira de Inclusão: impedimentos de longo prazo, barreiras e participação'],
 [84,'Tecnologia assistiva no AEE: comunicação, informática, sorobã e mobilidade'],
 [85,'Altas habilidades e superdotação: concepção multidimensional de potencial elevado'],
 [86,'Altas habilidades e superdotação: criatividade, envolvimento e áreas de interesse'],
 [87,'Altas habilidades e superdotação: enriquecimento curricular e desenvolvimento do potencial'],
 [88,'Altas habilidades e superdotação: aceleração de estudos e legislação educacional'],
 [89,'Planejamento do AEE e parceria entre família, escola e estudante'],
 [90,'Planejamento pedagógico inclusivo: apoios individualizados e rejeição de agrupamentos diagnósticos'],
 [91,'Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva: acesso e continuidade escolar'],
 [92,'AEE: turno de atendimento e articulação com a classe comum'],
 [93,'Tecnologia assistiva: autonomia, independência, qualidade de vida e inclusão social'],
 [94,'Atribuições do professor do AEE: acompanhamento dos recursos na classe comum'],
 [95,'Surdocegueira: comunicação e aprendizagem com sentidos remanescentes'],
 [96,'Deficiência múltipla: avaliação funcional, comunicação e interação social'],
 [97,'Surdocegueira: condição combinada e necessidades específicas de apoio'],
 [98,'Avaliação na educação inclusiva: decisões pedagógicas e adaptações curriculares'],
 [99,'Avaliação inclusiva: identificação de barreiras e organização de recursos de acessibilidade'],
 [100,'Avaliação inclusiva: respeito à heterogeneidade e às necessidades individuais'],
 [101,'Avaliação inclusiva: repertórios culturais, linguísticos e sociais do estudante'],
 [102,'Avaliação inclusiva: potencialidades, competências, limitações e contexto'],
 [103,'Avaliação da aprendizagem: adequação ao contexto e às especificidades dos estudantes'],
 [104,'Trabalho docente inclusivo: planejamento, metas e metodologias de aprendizagem'],
 [105,'Trabalho docente inclusivo: mediação e investigação do conhecimento'],
 [106,'Avaliação da aprendizagem: coerência entre concepções e práticas pedagógicas'],
 [107,'Avaliação inclusiva: acompanhamento do processo e das aprendizagens do estudante'],
 [108,'Adaptações curriculares: necessidades de aprendizagem e acessibilidade pedagógica'],
 [109,'Avaliação inclusiva: dimensões ética, política, epistêmica e educativa'],
 [110,'Avaliação pedagógica: deficiência, barreiras e adequações curriculares'],
 [111,'Currículo inclusivo: equidade e respeito aos diferentes percursos de aprendizagem'],
 [112,'Sexualidade e deficiência: diversidade das expressões afetivas e sexuais'],
 [113,'Sexualidade e deficiência: autonomia, individualidade e combate a estereótipos'],
 [114,'Sexualidade e deficiência: barreiras sociais e construção de apoios'],
 [115,'Sexualidade e deficiência: enfrentamento do capacitismo e do preconceito'],
 [116,'Sexualidade e deficiência: construção social, história e cultura'],
 [117,'Direitos sexuais e afetivos: inclusão de pessoas com deficiência nas políticas públicas'],
 [118,'Direitos da pessoa com deficiência: educação, saúde, vida social e sexualidade'],
 [119,'Sexualidade e deficiência: identidade, estigma e relações sociais'],
 [120,'Sexualidade e deficiência: participação social, afetividade e enfrentamento de barreiras']
])
const decisions=[]
for(const [id,q] of active){
 const e=entries.get(id);if(!e)throw Error(`Item sem catálogo: ${id}`)
 const n=Number(e.numero),page=Number(e.pagina),content=topics.get(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 if(!content||n<51||n>120)throw Error(`Classificação ausente ou numeração inválida: ${n}`)
 await fs.access(`public/acervo-extraido/${image}`)
 if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Enunciado ou formato inesperado: ${id}`)
 decisions.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Educação Especial',conteudo:content,ano:2021,concurso:'SEDUC-AL 2021 — Professor de Educação Especial — prova objetiva, conhecimentos específicos',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e normativa do item; o Cebraspe não divulga dificuldade individual.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação específica pelo enunciado e pelo conteúdo programático de Educação Especial.`,visual:{pagina:page,imagem:image,texto_apoio:'',motivo:'Página original da prova conferida visualmente; preserva o contexto e o item integral.'},apta_resolucao:true})
}
const nums=new Set(decisions.map(d=>d.numero_original))
if(decisions.length!==70||nums.size!==70||![...Array(70)].every((_,i)=>nums.has(i+51)))throw Error('Cobertura dos itens 51–120 incompleta')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itens_unicos:decisions.length,paginas:[1,2,3],prova,gabarito,pendentes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length},null,2));process.exit(0)}
const name='revisao-seduc-al-educacao-especial-2021-v179'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:70,itens_unicos:70,cobertura_numerica:'51–120 sem lacunas',paginas_originais_conferidas:[1,2,3],dificuldade_estimativa:true,filtro_ano_corrigido_de:2022,filtro_ano_corrigido_para:2021,gabaritos_sem_alteracao:true,publicado:false,prova,gabarito,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
