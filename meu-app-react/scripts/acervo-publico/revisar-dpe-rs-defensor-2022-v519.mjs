import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-dpe-rs-defensor-2022-v519',doc='fa1a69c952df437e'
const prova='https://cdn.cebraspe.org.br/concursos/dpe_rs_21_defensor/arquivos/615_DPERS_001_01.PDF'
const chavePreliminar='https://www.defensoria.rs.def.br/upload/arquivos/202201/11140925-12-01-2022-edital-n-08-gabaritos.pdf'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)
const grupos=[
 [[1,10],'Língua Portuguesa','Interpretação de texto e linguagem digital','Média'],
 [[11,20],'Língua Portuguesa','Compreensão textual, coesão e análise morfossintática','Média'],
 [[21,28],'Língua Portuguesa','Interpretação de texto e aspectos gramaticais','Média'],
 [[29,40],'Língua Portuguesa','Interpretação de texto e análise linguística','Média'],
 [[41,57],'Direito Constitucional','Organização do Estado, direitos fundamentais, processo legislativo e segurança pública','Difícil'],
 [[58,61],'Direito Administrativo','Administração pública e parcerias com organizações da sociedade civil','Difícil'],
 [[62,64],'Direito Administrativo','Lei Anticorrupção e responsabilização administrativa e judicial de pessoas jurídicas','Difícil'],
 [[65,70],'Direito Administrativo','Serviços públicos, equilíbrio econômico-financeiro e responsabilidade civil do Estado','Difícil'],
 [[71,80],'Direito Tributário','Sistema tributário, obrigação tributária, fato gerador e crédito tributário','Média'],
 [[81,87],'Direito Civil','Negócio jurídico, defeitos, invalidade e fraude contra credores','Média'],
 [[88,90],'Direito Civil','Prescrição e causas de impedimento ou suspensão','Difícil'],
 [[91,93],'Direito Civil','Condomínio edilício, locação e direitos do condômino','Média'],
 [[94,96],'Direito das Famílias','União estável, regime de bens, guarda e alimentos','Média'],
 [[97,112],'Direito Processual Civil','Incidentes processuais, ação rescisória e tutela provisória','Difícil'],
 [[113,120],'Direito do Consumidor','Responsabilidade por serviço bancário, superendividamento e vinculação da oferta','Média'],
 [[121,130],'Direito Penal','Teoria do crime, erro, omissão e aplicação da lei penal','Difícil'],
 [[131,138],'Direito Processual Penal','Prisões, recursos e cooperação jurídica internacional','Difícil'],
 [[139,149],'Direito Processual Penal','Acordo de não persecução penal, colaboração premiada, júri e recursos','Difícil'],
 [[150,160],'Direito das Execuções Penais','Dosimetria, execução penal, remição e progressão de regime','Difícil'],
 [[161,168],'Direitos Humanos','Direito internacional penal e competência do Tribunal Penal Internacional','Difícil'],
 [[169,184],'Direito da Criança e do Adolescente','Escuta protegida, depoimento especial, processo socioeducativo e direito à educação','Difícil'],
 [[185,200],'Direito Institucional','Atribuições, organização, autonomia e assistência jurídica da DPE/RS','Média'],
]
const group=n=>{const g=grupos.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const byNumber=new Map();for(const q of ps){const list=byNumber.get(Number(q.numero))||[];list.push(q);byNumber.set(Number(q.numero),list)}
assert.equal(byNumber.size,72)
assert.deepEqual([...byNumber].filter(([,list])=>list.length>1).map(([n,list])=>[n,list.length]),[[2,2]])
const canonical=new Map([...byNumber].map(([n,list])=>[n,[...list].sort((a,b)=>b.enunciado.length-a.enunciado.length)[0]]))
const duplicate=new Map([...byNumber.values()].filter(list=>list.length>1).flatMap(list=>{const keep=[...list].sort((a,b)=>b.enunciado.length-a.enunciado.length)[0];return list.filter(q=>q.id!==keep.id).map(q=>[q.id,keep.id])}))
const clean=(n,s)=>{
 let t=String(s||'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 const cuts={20:'Para falar de racismo, é preciso',28:'Espaço livre CEBRASPE',40:'BLOCO II',115:'Maria procurou a Defensoria Pública',140:'A respeito da colaboração premiada'}
 if(cuts[n]){const i=t.indexOf(cuts[n]);if(i>=0)t=t.slice(0,i).trim()}
 if(n===191)t=t.replace('assi stência','assistência')
 if(n===9)t=t.replace('“ Há','“Há')
 return t
}
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const[,materia,conteudo,dificuldade]=group(n),pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,enunciado=clean(n,q.enunciado)
 assert.ok(enunciado.length>15,`enunciado ${n}`)
 patches.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2022,
  concurso:'VI Concurso Público da Defensoria Pública do Estado do Rio Grande do Sul — Defensor Público (Edital 2021)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'09/01/2022',cargo:'Defensor Público',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na extensão do enunciado e na complexidade conceitual; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Identificação conferida no caderno oficial da prova objetiva; matéria e conteúdo enquadrados pelo bloco e pelo assunto específico do item, conforme edital de abertura.',
  enunciado,texto_apoio:`Consulte o texto-base e o contexto visual na página ${pagina} do caderno oficial.`,
  visual:{pagina,imagem,motivo:`Página ${pagina} do caderno oficial vinculada ao item para preservar texto-base, contexto e elementos visuais.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']})
}
for(const[id,keeper]of duplicate){const q=ps.find(x=>x.id===id),n=Number(q.numero),[,materia,conteudo]=group(n);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:`Captura duplicada do item ${n}; mantida a transcrição mais completa`,ano:2022,concurso:'VI Concurso Público da Defensoria Pública do Estado do Rio Grande do Sul — Defensor Público (Edital 2021)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'09/01/2022',cargo:'Defensor Público',numero_original:n,pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
console.log(JSON.stringify({pacote:nome,registros:ps.length,itens_unicos:canonical.size,duplicatas:duplicate.size,prova,gabarito_consultado:chavePreliminar,amostras:patches.filter(p=>p.apta_resolucao!==false).slice(0,8).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
