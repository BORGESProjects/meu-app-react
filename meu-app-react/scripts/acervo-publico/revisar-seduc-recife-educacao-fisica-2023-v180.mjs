import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='2aa7ee882934a8c8'
const prova='https://cdn.cebraspe.org.br/concursos/seduc_recife_23_professor/arquivos/829_SEDUC_RECIFE_23_004_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/seduc_recife_23_professor/arquivos/GAB_DEFINITIVO_829_SEDUC_RECIFE_23_004_01.PDF'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==70)throw Error('Catálogo SEDUC Recife, Educação Física, divergente')
const start=raizesAtuais.findIndex(r=>r.includes('revisao-seduc-al-educacao-especial-2021-v179'))
if(start<0)throw Error('Base v179 não encontrada')
const bases=raizesAtuais.slice(start),base=raizesAtuais[start],manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const active=new Map()
for(const lot of manifest.lotes.filter(l=>l.arquivo))for(const q of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases))))if(q.documento_id===doc)active.set(q.id,q)
if(active.size!==70)throw Error(`Esperados 70 registros; encontrados ${active.size}`)
const entries=new Map(catalog.questoes.map(q=>[q.id,q]))
const topics=new Map([
 [51,'História da Educação Física: higienização, disciplina e formação dos corpos nos séculos XVIII e XIX'],[52,'História da Educação Física: dualismo entre corpo e mente na escola moderna'],[53,'História da Educação Física: difusão das práticas corporais em instituições sociais'],[54,'História da Educação Física: influência das revoluções políticas e econômicas nas concepções de corpo'],
 [55,'Avaliação em Educação Física: participação do estudante e acompanhamento do desenvolvimento'],[56,'Avaliação em Educação Física: limites da mensuração de desempenho e comparação corporal'],[57,'Avaliação formativa: uso contínuo dos resultados no planejamento docente'],[58,'Avaliação em Educação Física: dimensões conceitual, procedimental e atitudinal'],
 [59,'Educação Física escolar: corpo e expressão corporal como linguagem'],[60,'Cultura corporal: jogos, esportes, danças, lutas e ginásticas'],[61,'Currículo de Educação Física: progressão e retomada dos conteúdos ao longo da escolarização'],[62,'Ensino da Educação Física: técnica esportiva e abordagens pedagógicas não tecnicistas'],[63,'Saúde renovada: atividade física, aptidão física e saúde no ensino médio'],[64,'Abordagens pedagógicas da Educação Física: construtivismo e contribuições de Piaget'],
 [65,'Jogos na escola: desenvolvimento tático, técnico e julgamento na arbitragem'],[66,'Futebol escolar: ensino para além da reprodução da prática esportiva'],[67,'Ginástica geral: manifestações demonstrativas e possibilidades pedagógicas'],[68,'Atletismo escolar: diversidade de provas e superação de limitações materiais'],
 [69,'Currículo cultural da Educação Física: teorias pós-críticas e perspectiva cultural'],[70,'Currículo cultural: seleção de práticas corporais e relações de poder'],[71,'Currículo cultural: ressignificação da cultura corporal e justiça curricular'],[72,'Currículo cultural: reconhecimento das diferenças e relações de poder'],[73,'Estudos culturais: práticas corporais, textualidade e produção de significados'],
 [74,'Aprendizagem motora: percepção, prática e desenvolvimento de habilidades'],[75,'Processamento perceptivo-motor: estímulos sensoriais e respostas motoras'],[76,'Percepção e aprendizagem motora: organização da informação e formação de respostas'],[77,'Aprendizagem motora: estímulos ambientais e execução do movimento'],[78,'Controle motor: feedback sensorial e correção de erros em circuito fechado'],[79,'Controle motor: circuito aberto e execução de movimentos balísticos'],[80,'Aprendizagem motora: tempo de reação e intervalo entre estímulo e resposta'],[81,'Feedback motor: informação intrínseca e extrínseca na aprendizagem'],[82,'Feedback intrínseco: informação sensorial e controle do movimento'],
 [83,'História da Educação Física: higienismo, militarismo e concepção utilitarista do corpo'],[84,'História do esporte no Brasil: Reforma Couto Ferraz e institucionalização da Educação Física'],[85,'Esportivização: competição, mecanicismo e rendimento na Educação Física escolar'],[86,'Métodos ginásticos e esportivização: desenvolvimento da cooperação e solidariedade'],[87,'Educação Física esportivista: competição, democracia e inclusão'],
 [88,'Planejamento de jogos esportivos: desempenho motor, regras e organização tática'],[89,'Organização de equipes: composição, equilíbrio e justiça nas atividades esportivas'],[90,'Jogos cooperativos: objetivos comuns e cooperação entre participantes'],[91,'Intervenção pedagógica: abordagem crítico-emancipatória e análise do movimento'],[92,'Abordagens críticas da Educação Física: superação de condicionantes e opressões'],
 [93,'Educação Física escolar: vivências lúdicas e dimensões subjetivas das práticas corporais'],[94,'Desenvolvimento motor: participação, prazer e criatividade nas aulas'],[95,'Aprendizagem motora: experimentação e construção de habilidades'],[96,'Abordagens construtivistas: conflito cognitivo e aprendizagem na Educação Física'],
 [97,'BNCC: fruição e apreciação estética nas práticas corporais'],[98,'BNCC: Educação Física como componente da área de Linguagens'],[99,'LDB: obrigatoriedade da Educação Física na educação básica'],[100,'BNCC: decisões pedagógicas e desenvolvimento de competências'],[101,'LDB: obrigatoriedade da Educação Física e condições legais de dispensa'],
 [102,'Cultura corporal: relações entre Educação Física, sociedade e ciências humanas'],[103,'Abordagem desenvolvimentista: valorização da cultura popular'],[104,'Abordagem crítico-superadora: cultura corporal como linguagem e conhecimento'],[105,'Abordagem crítico-emancipatória: autonomia e emancipação nas práticas esportivas'],[106,'Abordagem construtivista-interacionista: cultura, sustentabilidade e práticas corporais'],
 [107,'Práticas corporais: conceito, atividade física e saúde'],[108,'Práticas corporais e políticas públicas educacionais'],[109,'Práticas corporais: reflexão crítica sobre aptidão física e movimento'],[110,'Finalidades das práticas corporais: estética, sensibilidade, saúde, lazer e sociabilidade'],
 [111,'Esporte escolar: gênero, participação e igualdade nas práticas esportivas'],[112,'Esporte cooperativo: dimensão coletiva, motricidade e significados do jogo'],[113,'Avaliação em Educação Física: rendimento físico e competição'],[114,'Pedagogia do esporte: aprendizagem da organização dos próprios jogos'],[115,'Cooperação e competição: desenvolvimento de valores altruístas no esporte escolar'],
 [116,'Cultura corporal: práticas humanas, conhecimento e realidade social'],[117,'Cultura corporal: conhecimentos produzidos historicamente por meio das práticas corporais'],[118,'Educação Física escolar: sentidos e significados culturais das práticas corporais'],[119,'História da cultura corporal no Brasil: crítica ao paradigma da aptidão física'],[120,'Cultura corporal: olimpismo, práticas clássicas e fair play']
])
const decisions=[]
for(const [id,q] of active){
 const e=entries.get(id);if(!e)throw Error(`Item sem catálogo: ${id}`)
 const n=Number(e.numero),page=Number(e.pagina),content=topics.get(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 if(!content||n<51||n>120)throw Error(`Classificação ausente ou número inválido: ${n}`)
 await fs.access(`public/acervo-extraido/${image}`)
 if(!q.enunciado?.trim()||q.tipo_resposta!=='certo_errado')throw Error(`Enunciado ou formato inesperado: ${id}`)
 decisions.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Educação Física',conteudo:content,ano:2023,concurso:'SEDUC-Recife 2023 — Professor II, Educação Física — prova objetiva, conhecimentos específicos',numero_original:n,pagina:page,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência conceitual e aplicação pedagógica; a banca não divulga faixa individual de dificuldade.',classificacao_fonte:prova,motivo:`Item ${n}, p. ${page}. Classificação pelo assunto específico e pelo programa oficial de Educação Física.`,visual:{pagina:page,imagem:image,texto_apoio:'',motivo:'Página original conferida visualmente; conserva o item e o contexto-base compartilhado.'},apta_resolucao:true})
}
const nums=new Set(decisions.map(d=>d.numero_original))
if(decisions.length!==70||nums.size!==70||![...Array(70)].every((_,i)=>nums.has(i+51)))throw Error('Cobertura dos itens 51–120 incompleta')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:active.size,itens_unicos:decisions.length,paginas:[1,2,3],prova,gabarito,pendentes:decisions.filter(d=>active.get(d.id).classificacao_pendente&&!active.get(d.id).classificacao_revisada).length},null,2));process.exit(0)}
const name='revisao-seduc-recife-educacao-fisica-2023-v180'
const result=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const out={...result,documento:catalog.arquivo,registros_revistos:70,itens_unicos:70,cobertura_numerica:'51–120 sem lacunas',paginas_originais_conferidas:[1,2,3],dificuldade_estimativa:true,gabaritos_sem_alteracao:true,publicado:false,prova,gabarito,fonte_catalogo:catalog.pagina_catalogo}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out,null,2))
