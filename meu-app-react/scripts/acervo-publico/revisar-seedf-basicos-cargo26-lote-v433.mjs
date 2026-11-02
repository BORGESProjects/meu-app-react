import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisar-seedf-basicos-cargo26-lote-v433'
const doc='2561e8b7000df39a'
const prova='https://cdn.cebraspe.org.br/concursos/SEE_16_DF/arquivos/290_SEEDF_CB1_01.pdf'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEE_16_DF/arquivos/Gab_Definitivo_290_SEEDF_CB1_01.pdf'
const concurso='SEE/DF 2016 — Conhecimentos Básicos — aplicação 2017 — cargo 26 (Sociologia)'
const mapa={
 'extr-5556ba62aca4b5c34c64':['Língua Portuguesa','Interpretação de texto: alcance da metáfora “sensibilidade” e desenvolvimento da escrita','Média'],
 'extr-02aef55d59d6226fbdae':['Língua Portuguesa','Sintaxe: identificação do sujeito em oração com verbo na terceira pessoa do plural','Média'],
 'extr-bd866b3e8fe4914eeacf':['Língua Portuguesa','Morfossintaxe: substantivação de adjetivos','Média'],
 'extr-5e571d9bf92a234a75f8':['Língua Portuguesa','Pontuação e sintaxe: intercalação parentética e efeito de sentido','Média'],
 'extr-6630c87771aa08f7cf84':['Língua Portuguesa','Semântica e morfossintaxe: posição do adjetivo “certo” e mudança de sentido','Difícil'],
 'extr-8c56a4d70712f4285a5e':['Língua Portuguesa','Sintaxe: oração subordinada substantiva e função sintática','Difícil'],
 'extr-2336504b4fd57bd1bc9a':['Língua Portuguesa','Coesão e argumentação: oposição entre variedades linguísticas','Média'],
 'extr-4c35da296de855d346a9':['Língua Portuguesa','Semântica: escopo da negação e posição do advérbio “não”','Difícil'],
 'extr-9ee5477dcacb852e506b':['Língua Portuguesa','Interpretação de texto: argumento sobre leitura, estilo e aprendizagem da escrita','Média'],
 'extr-c4f2a9ef8d45cbd71908':['Língua Portuguesa','Sintaxe: sujeito oculto e sujeito indeterminado em contexto','Média'],
 'extr-bfb66825fd078be4c565':['Legislação Educacional','Normas do CEDF: oferta de cursos de língua estrangeira na educação básica','Média'],
 'extr-180b291fa00af0413265':['Legislação Educacional','Currículo: definição da parte diversificada pelo sistema de ensino','Média'],
 'extr-c9b084699d397ba16e08':['Legislação Educacional','Currículo: avaliação, carga horária e registro escolar da parte diversificada','Média'],
 'extr-44047f5ad4c7eb18d9d1':['Legislação Educacional','LDB e normas do DF: oferta obrigatória de língua espanhola','Média'],
 'extr-74e6ec3a43f10d4721c3':['Legislação Educacional','LDB: obrigatoriedade do ensino de Arte na educação básica','Média'],
 'extr-d1540498e61f924d8297':['Direito Administrativo','Agentes públicos: concurso anterior vigente e direito à nomeação','Difícil'],
 'extr-ef955a8274157c8883d3':['Direito Administrativo','Regime jurídico dos servidores: reintegração e readaptação','Média'],
 'extr-fa927e963e7847bc89d4':['Direito Constitucional','Organização político-administrativa do DF: criação e extinção de regiões administrativas','Difícil'],
 'extr-83398a52aa2001e43311':['Direito Constitucional','Direitos e garantias fundamentais: direito de petição e gratuidade','Fácil'],
 'extr-71c8c83f3779bdcad2f1':['Direito Constitucional','Lei Orgânica do DF: limites e relação entre remunerações de servidores','Média']
}
const duplicatas=new Map([['extr-5556ba62aca4b5c34c64','extr-9ee5477dcacb852e506b'],['extr-02aef55d59d6226fbdae','extr-c4f2a9ef8d45cbd71908']])
const records=JSON.parse(await fs.readFile('tmp/proxima-fila-revisao.json','utf8'))
if(records.length!==20||new Set(records.map(q=>q.id)).size!==20)throw Error('Fila alterada: esperados 20 registros únicos.')
const comando={
 educacao:'Julgue os itens conforme a legislação sobre a educação brasileira e as normas do Conselho de Educação do Distrito Federal (CEDF).',
 agentes:'Com base na Constituição Federal de 1988 e na Lei Complementar distrital n.º 840/2011, julgue o item sobre agentes públicos.',
 lodf:'Tendo como referência as disposições da Lei Orgânica do Distrito Federal, julgue o item.'
}
const decisions=records.map(q=>{
 const c=mapa[q.id];if(!c)throw Error(`Item sem classificação: ${q.id}`)
 const base={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:c[0],conteudo:c[1],ano:2017,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'29/01/2017',numero_original:q.numero,dificuldade:c[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência de interpretação, análise sintática ou aplicação normativa; não é uma métrica psicométrica publicada pela banca.',classificacao_fonte:prova,motivo:`Questão ${q.numero} confrontada com o caderno oficial do cargo 26. A matéria foi atribuída conforme a habilidade ou norma examinada; o caderno identifica aplicação em 2017.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']}
 if(duplicatas.has(q.id)){base.apta_resolucao=false;base.duplicada_de=duplicatas.get(q.id);base.inelegibilidade_motivo=`Duplicata do item ${q.numero}; o registro ${base.duplicada_de} preserva o mesmo enunciado com contexto textual mais completo.`;base.motivo=`Duplicata comprovada no mesmo caderno: número e assertiva repetem o item ${q.numero}. Mantida uma única versão resolvível, com o contexto mais completo.`}
 if(q.numero>=16&&q.numero<=20)base.texto_apoio=comando.educacao
 if(q.numero===21)base.texto_apoio=comando.agentes
 if(q.numero>=37&&q.numero<=40)base.texto_apoio=comando.lodf
 if(q.id==='extr-5e571d9bf92a234a75f8'){
  base.enunciado='Em “Disseram que escrever, para eles, aconteceu naturalmente” (linhas 3 e 4), a supressão das vírgulas preservaria a correção gramatical do período, mas prejudicaria seu sentido original.'
  base.texto_apoio='Trecho do texto-base de Steven Pinker: “Disseram que escrever, para eles, aconteceu naturalmente.” O item examina o valor da expressão parentética “para eles”.'
 }
 return base
})
if(decisions.filter(x=>x.apta_resolucao===false).length!==2||decisions.filter(x=>x.apta_resolucao===true).length!==18)throw Error('Esperadas 18 questões únicas e 2 duplicatas desativadas.')
if(decisions.some(x=>!x.materia||!x.conteudo||!x.ano||!x.dificuldade))throw Error('Classificação incompleta.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:20,questoes_unicas:18,duplicatas_desativadas:2,materias:[...new Set(decisions.filter(x=>x.apta_resolucao).map(x=>x.materia))],ano:2017,prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2017,registros_revisados:20,questoes_unicas:18,duplicatas_desativadas:[...duplicatas.entries()].map(([id,duplicada_de])=>({id,duplicada_de})),questao_com_enunciado_limpo:'item 14',fonte_prova:prova,fonte_gabarito:gabarito,gabarito_preservado_sem_alteracoes:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
