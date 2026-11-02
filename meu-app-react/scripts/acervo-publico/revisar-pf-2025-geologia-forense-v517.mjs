import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pf-2025-geologia-forense-v517',doc='ef1e981b5d8cf750'
const prova='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/106_PF_005_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/PF_25/arquivos/9E550CE72E70B14514C5A47A7A0F3CD30B56607FF45010612931D046BBA96D23.pdf'
const ps=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'));assert.equal(ps.length,73)
const rows=[
 ['E','X','C','X','C','C','E','E','E','E','C','C','E','C','C','X','C','E','E','C'],
 ['C','C','C','C','E','E','C','E','C','E','E','C','C','E','E','C','C','C','E','E'],
 ['C','E','C','E','X','E','C','C','E','C','E','C','E','E','C','C','C','C','E','E'],
 ['C','C','C','E','E','E','C','C','C','E'],
]
assert.deepEqual(rows.map(r=>r.length),[20,20,20,10])
const answers=new Map();let number=51;for(const row of rows)for(const answer of row)answers.set(number++,answer);assert.equal(number,121)
const byNumber=new Map();for(const q of ps){const list=byNumber.get(Number(q.numero))||[];list.push(q);byNumber.set(Number(q.numero),list)}
assert.equal(byNumber.size,70)
assert.deepEqual([...byNumber].filter(([,list])=>list.length>1).map(([n,list])=>[n,list.length]),[[51,2],[53,2],[55,2]])
const canonical=new Map([...byNumber].map(([n,list])=>[n,list.at(-1)]))
for(let n=51;n<=120;n++)assert.ok(answers.has(n),`gabarito ${n}`)
const anuladas=new Set([...answers].filter(([,a])=>a==='X').map(([n])=>n));assert.deepEqual([...anuladas],[52,54,66,95])
const duplicates=new Map([...byNumber.values()].filter(list=>list.length>1).flatMap(list=>list.slice(0,-1).map(q=>[q.id,list.at(-1).id])))

const groups=[
 [[51,53],'Geologia','Geoquímica: formações ferríferas, precipitados hidrotermais e espectroscopia Mössbauer','Contexto: métodos analíticos aplicados à geoquímica.'],
 [[54,55],'Geologia','Gemologia: lapidação, propriedades físicas e identificação de gemas','Contexto: ocorrência de ágata e ametista nos basaltos da Formação Serra Geral, em garimpos do sudoeste do Rio Grande do Sul.'],
 [[56,56],'Geologia','Geoprocessamento e fotointerpretação de derrames basálticos','Contexto: ocorrência de ágata e ametista nos basaltos da Formação Serra Geral, em garimpos do sudoeste do Rio Grande do Sul.'],
 [[57,58],'Geologia','Mineralogia e petrologia: difração de raios X, gemas e composição do basalto','Contexto: métodos de identificação de gemas e composição mineralógica de rochas basálticas.'],
 [[59,62],'Paleontologia','Registro fóssil brasileiro, Bacia do Araripe e conservação de sítios paleontológicos','Contexto: ocorrências brasileiras de fósseis.'],
 [[63,66],'Geologia','Intemperismo, formação de solos e laterização','Contexto: reações do intemperismo e evolução de perfis de solo.'],
 [[67,69],'Geoprocessamento','Sensoriamento remoto: radar, sensores hiperespectrais e resolução de imagens','Contexto: geoprocessamento e sensoriamento remoto.'],
 [[70,73],'Geologia','Geoestatística: krigagem, amostragem, incerteza e variabilidade espacial','Contexto: estimativas e interpretação de dados espaciais em estudos geológicos e ambientais.'],
 [[74,78],'Geologia Ambiental','Recuperação de áreas degradadas, avaliação de impacto e contaminação por metais','Contexto: geologia ambiental.'],
 [[79,81],'Mecânica dos Solos','Resistência ao cisalhamento, critério de Mohr-Coulomb e ensaio edométrico','Contexto: mecânica dos solos aplicada à geologia forense.'],
 [[82,84],'Geologia','Mecânica das Rochas: ensaio triaxial, critérios de ruptura e propriedades elásticas','Contexto: mecânica das rochas e aplicação pericial.'],
 [[85,86],'Geologia','Microscopia eletrônica de varredura (MEV): imagem e caracterização morfológica','Contexto: aplicação do MEV na caracterização de materiais geológicos.'],
 [[87,89],'Geologia','Microssonda eletrônica: análise química quantitativa e mapas elementares','Contexto: utilização da microssonda eletrônica na análise mineralógica.'],
 [[90,93],'Geologia','Raios X: interação com a matéria, detecção semicondutora e fluorescência','Contexto: princípios e aplicações dos raios X e dos sistemas de excitação e detecção na análise de materiais geológicos.'],
 [[94,103],'Geologia Econômica','Depósitos minerais brasileiros, agrominerais, províncias metalogenéticas e minerais de construção','Contexto: principais depósitos minerais do Brasil e minerais de uso imediato na construção civil.'],
 [[104,106],'Geologia Econômica','Cráton Amazônico, greenstone belts e sistemas mineralizadores de ouro','Contexto: geologia do Cráton Amazônico, sistemas mineralizadores auríferos e províncias auríferas brasileiras.'],
 [[107,108],'Engenharia de Minas','Geometalurgia do ouro, mineração industrial e garimpo','Contexto: geometalurgia e formas de extração do ouro.'],
 [[109,110],'Legislação Minerária','Permissão de Lavra Garimpeira: conceito, titulares e prazo','Contexto: legislação vigente sobre lavra garimpeira.'],
 [[111,115],'Legislação Minerária','Código de Mineração: pesquisa, recuperação ambiental, fósseis, barragens e bens integrantes da mina','Contexto: legislação minerária vigente.'],
 [[116,120],'Legislação Ambiental','Conservação in situ, servidão ambiental, unidades de conservação, APP urbana e perícia de dano','Contexto: legislação ambiental pertinente.'],
]
const group=n=>{const g=groups.find(([[a,b]])=>n>=a&&n<=b);assert.ok(g,`classificação ${n}`);return g}
const hard=new Set([51,53,55,56,60,63,64,65,70,71,72,73,77,78,79,80,82,83,87,88,89,90,92,94,96,97,98,99,100,101,102,103,104,105,106,109,110,111,112,113,114,116,117,119,120])
const normaliza=(n,s)=>{
 let t=String(s||'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().replace(/\s+([,.;:!?])/g,'$1')
 if(n===51)t='Sabendo-se que uma amostra de jaspilito da província mineral de Carajás exibe, na análise química, teores elevados de Fe₂O₃ (cerca de 80%), é correto afirmar que o diagrama de elementos Fe₂O₃ versus SiO₂ dessa amostra de jaspilito exibe uma correlação caracterizada pelo aumento progressivo de FeO₃ à medida que SiO₂ aumenta, sendo isso uma tendência característica de formações ferríferas bandadas.'
 if(n===53)t='A partir do método de espectroscopia Mössbauer, é possível determinar o estado de valência do ferro em minerais e os diferentes óxidos de ferro.'
 if(n===55)t='Na maioria dos casos, uma gema desconhecida pode ser identificada a partir de sua densidade relativa e de seu índice de refração.'
 return t
}
const patches=[]
for(const[n,q]of[...canonical].sort((a,b)=>a[0]-b[0])){
 const [materia,conteudo,texto_apoio]=group(n).slice(1),status=answers.get(n),anulada=status==='X',answer=status==='C'?'C':'E',page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,enunciado=normaliza(n,q.enunciado)
 assert.ok(enunciado.length>18,`enunciado ${n}`)
 const p={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,
  concurso:'Polícia Federal 2025 — Perito Criminal Federal, Área 5: Geologia Forense (Cargo 5)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'27/07/2025',cargo:'Perito Criminal Federal — Área 5: Geologia Forense (Cargo 5)',numero_original:n,pagina:page,
  dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por complexidade e integração de conceitos; não é classificação oficial da banca.',
  classificacao_fonte:prova,motivo:'Classificação conferida no caderno oficial do Cargo 5; gabarito comparado ao definitivo do mesmo cargo.',
  enunciado,texto_apoio,opcoes:['Certo','Errado'],resposta_correta:anulada?null:answer==='C'?0:1,anulada,
  visual:{pagina:page,imagem:image,motivo:`Página ${page} do caderno oficial, preservada como referência visual da questão.`},apta_resolucao:true,
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','enunciado_incompleto','texto_corrompido','texto_de_outro_bloco','visual_ausente']}
 if(!anulada)p.gabarito_oficial={fonte:chave,arquivo:'9E550CE72E70B14514C5A47A7A0F3CD30B56607FF45010612931D046BBA96D23.pdf',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 5 — Perito Criminal Federal, Área 5: Geologia Forense, aplicado em 27/07/2025.'}
 else {p.gabarito_oficial={fonte:chave,arquivo:'9E550CE72E70B14514C5A47A7A0F3CD30B56607FF45010612931D046BBA96D23.pdf',numero:n,pagina:1,resposta:'X',criterio:'Item anulado conforme gabarito oficial definitivo; resposta automática desativada.'};p.remover_pendencias.push('anulacao_oficial_nao_registrada')}
 patches.push(p)
}
for(const[id,keeper]of duplicates){const q=ps.find(x=>x.id===id),n=Number(q.numero),[materia,conteudo]=group(n);patches.push({id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo:`Captura duplicada do item ${n}; mantida a versão com OCR completo`,ano:2025,concurso:'Polícia Federal 2025 — Perito Criminal Federal, Área 5: Geologia Forense (Cargo 5)',banca:'CEBRASPE',numero_original:n,pagina:Number(q.pagina),apta_resolucao:false,duplicada_de:keeper,inelegibilidade_motivo:'captura_duplicada_do_mesmo_item'})}
assert.equal(patches.length,73)
const gabaritoHash=createHash('sha256').update([...answers].map(([n,a])=>`${n}:${a}`).join('|')).digest('hex')
for(const p of patches)if(p.gabarito_oficial){p.gabarito_oficial.sha256=gabaritoHash;p.gabarito_oficial.sha256_tipo='sha256_da_transcricao_do_gabarito_definitivo_51_a_120; nao_e_hash_do_pdf'}
console.log(JSON.stringify({pacote:nome,pendentes:ps.length,itens_unicos:canonical.size,duplicatas:duplicates.size,anuladas:[...anuladas],amostras:patches.filter(p=>p.gabarito_oficial&&[51,52,54,56,60,63,67,70,74,79,82,85,87,90,94,97,104,107,109,111,116,120].includes(p.numero_original)).map(p=>({n:p.numero_original,materia:p.materia,conteudo:p.conteudo,resposta:p.gabarito_oficial.resposta,enunciado:p.enunciado.slice(0,110),pagina:p.pagina}))},null,2))
if(process.argv.includes('--dry-run'))process.exit(0)
await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:patches})
