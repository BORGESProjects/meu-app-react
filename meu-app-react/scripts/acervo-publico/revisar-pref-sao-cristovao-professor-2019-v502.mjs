import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pref-sao-cristovao-professor-2019-v502'
const documento='b916b630a2ea99ae'
const provaBasica='https://cdn.cebraspe.org.br/concursos/pref_sao_cristovao_se_19_prof/arquivos/MATRIZ_494_PREFSCSECB1.PDF'
const provaEspecifica='https://cdn.cebraspe.org.br/concursos/pref_sao_cristovao_se_19_prof/arquivos/MATRIZ_494_PREFSCSE001.PDF'
const gabaritoBasico='https://cdn.cebraspe.org.br/concursos/pref_sao_cristovao_se_19_prof/arquivos/GAB_DEFINITIVO_MATRIZ_494_PREFSCSECB1__PAG_3.PDF'
const gabaritoEspecifico='https://cdn.cebraspe.org.br/concursos/pref_sao_cristovao_se_19_prof/arquivos/GAB_DEFINITIVO_MATRIZ_494_PREFSCSE001__PAG_4.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/pref_sao_cristovao_se_19_prof/arquivos/PREF_SAOCRIST_JUSTIFICATIVAS_DE_ALTERAO_DE_GABARITO.PDF'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
assert.equal(pendentes.length,74)
const paginas=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${documento}.json.gz`)))
assert.equal(paginas.length,8)

const respostasBasicas=['E','C','C','E','C','C','C','C','C','E','C','E','C','C','C','E','E','C','E','E','C','C','C','E','E','C','E','E','E','E','C','X','C','C','C','E','E','C','C','E','E','C','C','C','E','E','C','C','C','E']
const respostasEspecificas=['C','E','C','E','E','E','C','C','E','E','C','C','E','C','E','E','E','C','C','C','E','E','C','E','E','C','E','C','C','X','C','E','E','C','C','E','C','C','E','E','C','E','C','E','E','C','E','C','E','C','C','E','C','E','C','C','E','E','E','C','C','E','E','E','E','E','E','E','E','C']
assert.equal(respostasBasicas.length,50);assert.equal(respostasEspecificas.length,70)
const hashBasico=createHash('sha256').update(respostasBasicas.map((x,i)=>`${i+1}:${x}`).join('|')).digest('hex')
const hashEspecifico=createHash('sha256').update(respostasEspecificas.map((x,i)=>`${i+51}:${x}`).join('|')).digest('hex')
const limpa=x=>x.replace(/\s+/g,' ').trim()
const normaliza=x=>limpa(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
const similar=(a,b)=>{const A=new Set(normaliza(a).split(' ').filter(x=>x.length>2)),B=new Set(normaliza(b).split(' ').filter(x=>x.length>2));if(!A.size||!B.size)return 0;let comum=0;for(const x of A)if(B.has(x))comum++;return comum/Math.min(A.size,B.size)}
const iniciosDeProximoBloco=new Map([
 [10,'O professor que realmente ensina'],[24,'Os professores de matemática'],[42,'A ocupação do território onde se situa o estado de Sergipe'],[46,'A respeito da cultura sergipana e do município de São Cristóvão'],[64,'Com relação ao planejamento e à avaliação educacionais'],[68,'Eliane, Josefa e Cláudia são professoras'],[84,'Em uma escola de anos iniciais do ensino fundamental'],[89,'Baixa autoestima e outros problemas emocionais'],[108,'Com relação a acesso, permanência e sucesso do aluno na escola'],[112,'A respeito de gestão, planejamento e avaliação no âmbito educacional'],[118,'Julgue os próximos itens, conforme a BNCC'],[120,'Espaço livre']
])
function textoDoItem(q){
 const fonte=paginas[Number(q.pagina)-1];assert.ok(fonte,`Página textual ausente no item ${q.numero}`)
 const re=/(?:^|\n)\s*(\d{1,3})\s+([\s\S]*?)(?=\n\s*\d{1,3}\s+|$)/g
 const candidatos=[...fonte.matchAll(re)].filter(m=>Number(m[1])===Number(q.numero)).map(m=>m[2].replace(/\s+/g,' ').trim()).filter(Boolean)
 assert.ok(candidatos.length,`Item ${q.numero} não localizado na página-fonte ${q.pagina}`)
 let texto=candidatos.sort((a,b)=>similar(q.enunciado,b)-similar(q.enunciado,a))[0]
 assert.ok(similar(q.enunciado,texto)>0.60,`Baixa correspondência OCR no item ${q.numero}`)
 const proximo=iniciosDeProximoBloco.get(Number(q.numero));if(proximo){const i=texto.indexOf(proximo);if(i>0)texto=texto.slice(0,i).trim()}
 texto=texto.replace(/\s*Espaço livre\s*$/i,'').replace(/\s*\|\|Matriz_[^|]+\|\|.*$/i,'').trim()
 assert.ok(texto.length>15,`Texto insuficiente no item ${q.numero}`)
 return texto.replace(/\s+([,.;:!?])/g,'$1').replace(/\s+([”’])/g,'$1')
}
function classificacao(n){
 if([1,3,4,5,7,10].includes(n))return ['Língua Portuguesa','Interpretação e compreensão de textos']
 if(n===8)return ['Língua Portuguesa','Sintaxe: sujeito e termos da oração']
 if([11,12,13].includes(n))return ['Língua Portuguesa','Interpretação e compreensão de textos']
 if(n===15)return ['Língua Portuguesa','Sintaxe e pontuação']
 if(n===18)return ['Língua Portuguesa','Semântica e relações de sentido']
 if([21,22,23,24].includes(n))return ['Educação','Função social da escola e concepções educacionais']
 if([25,26,27,28].includes(n))return ['Educação','Tendências pedagógicas liberais e progressistas']
 if(n===40)return ['Educação','Legislação e políticas educacionais: Plano Nacional de Educação']
 if(n===41)return ['Educação','Organização do trabalho pedagógico: transversalidade e interdisciplinaridade']
 if(n===42)return ['Educação','Legislação educacional: deveres da escola e comunicação ao conselho tutelar']
 if([43,44,45].includes(n))return ['História','História de Sergipe: colonização e ocupação do território']
 if(n===46)return ['Conhecimentos Gerais','Sergipe: economia regional']
 if(n===47)return ['Conhecimentos Gerais','Sergipe: cultura e formação histórica']
 if(n===49)return ['Conhecimentos Gerais','Patrimônio histórico e arquitetura de São Cristóvão']
 if(n===50)return ['História','Sergipe e o cangaço']
 if(n===51)return ['Educação','História da educação brasileira: Manifesto dos Pioneiros da Educação Nova']
 if(n===52)return ['Educação','Tendências pedagógicas: tecnicismo']
 if(n===53)return ['Educação','Tendência liberal tradicional: ensino e aprendizagem']
 if(n===64)return ['Educação','Metodologias de ensino e aprendizagem']
 if([65,66,67,68].includes(n))return ['Educação','Planejamento e avaliação educacional']
 if([69,70,71,72,73].includes(n))return ['Educação','Teorias da aprendizagem: behaviorismo, sociointeracionismo e concepções inatistas']
 if(n===77)return ['Educação','Teorias do desenvolvimento cognitivo: Piaget e Gardner']
 if([78,79].includes(n))return ['Educação','Teorias do desenvolvimento e da aprendizagem: Vygotsky e Wallon']
 if([80,81].includes(n))return ['Educação','Teoria das inteligências múltiplas de Gardner']
 if([82,83,84].includes(n))return ['Educação','Construtivismo e mediação pedagógica']
 if(n===85)return ['Educação','BNCC: participação, cultura regional e pensamento crítico']
 if([87,88,89].includes(n))return ['Educação','Bullying, convivência escolar e prevenção da violência']
 if([90,91,92].includes(n))return ['Educação','Adolescência, imagem corporal e transtornos alimentares']
 if([104,105,106].includes(n))return ['Educação','Teorias do currículo e currículo prescrito']
 if([107,108].includes(n))return ['Educação','Currículo escolar e Base Nacional Comum Curricular']
 if(n===109)return ['Educação','BNCC: competências gerais e desenvolvimento integral']
 if(n===110)return ['Educação','Finalidades da educação básica e preparação para o trabalho']
 if(n===111)return ['Educação','BNCC: alfabetização matemática']
 if(n===112)return ['Educação','Educação especial na perspectiva inclusiva']
 if([113,117].includes(n))return ['Educação','Planejamento educacional: níveis, intencionalidade e dimensões políticas']
 if(n===114)return ['Educação','Avaliação da aprendizagem: elaboração de instrumentos']
 if(n===116)return ['Educação','Avaliação diagnóstica e acompanhamento da aprendizagem']
 if(n===118)return ['Educação','Implementação curricular da BNCC']
 if([119,120].includes(n))return ['Educação','BNCC: direitos de aprendizagem e desenvolvimento na educação infantil']
 throw Error(`Classificação ausente no item ${n}`)
}
function contexto(n){
 const ranges=[
  [[1,10],'Quando se educa alguém ou se é educado por alguém','A educação tem que nos tirar dessa superficialidade.'],
  [[11,20],'O professor que realmente ensina','do que a razão mesma da discordância.'],
  [[21,24],'Determinada escola iniciou o processo','julgue os itens seguintes.'],
  [[25,29],'Os professores de matemática, de história e de língua portuguesa','julgue os itens a seguir.'],
  [[30,33],'O inciso V do art. 24','suas implicações pedagógicas.'],
  [[34,36],'Com base nas disposições da Constituição Federal de 1988','julgue os itens a seguir.'],
  [[37,39],'Com base na Lei Orgânica da Prefeitura Municipal de São Cristóvão','julgue os itens subsecutivos.'],
  [[40,42],'Com base na Lei n.o 13.005/2014','julgue os itens que se seguem.'],
  [[43,45],'A ocupação do território onde se situa o estado de Sergipe','julgue os itens seguintes.'],
  [[47,50],'A respeito da cultura sergipana e do município de São Cristóvão','julgue os itens que se seguem.'],
  [[51,54],'Com relação à história do pensamento pedagógico brasileiro','julgue os itens a seguir.'],
  [[55,57],'A respeito das competências e habilidades propostas pela BNCC','julgue os itens que se seguem.'],
  [[58,61],'Depois de perceber o grande interesse de uma turma','julgue os itens subsequentes.'],
  [[62,64],'A sala de aula é o lugar em que há uma reunião de seres','que tenha.'],
  [[65,68],'Com relação ao planejamento e à avaliação educacionais','julgue os itens subsecutivos.'],
  [[69,73],'Eliane, Josefa e Cláudia são professoras','julgue os itens a seguir.'],
  [[77,81],'A respeito de concepções teóricas da aprendizagem','julgue os itens subsequentes.'],
  [[82,84],'Acerca dos pressupostos do construtivismo no campo educacional','julgue os próximos itens.'],
  [[85,86],'Em uma escola de anos iniciais do ensino fundamental','julgue os itens seguintes.'],
  [[87,89],'Quando L.B., de 15 anos de idade','Internet: <veja.abril.com.br> (com adaptações).'],
  [[90,92],'Baixa autoestima e outros problemas emocionais','julgue os itens que se seguem.'],
  [[104,108],'Julgue os itens a seguir, acerca de currículo','julgue os itens que se seguem.'],
  [[109,112],'Com relação a acesso, permanência e sucesso do aluno na escola','julgue os itens que se seguem.'],
  [[113,118],'A respeito de gestão, planejamento e avaliação no âmbito educacional','julgue os itens seguintes.'],
  [[119,120],'Julgue os próximos itens, conforme a BNCC','Julgue os próximos itens, conforme a BNCC']
 ]
 const bloco=ranges.find(([faixa])=>n>=faixa[0]&&n<=faixa[1]);if(!bloco)return ''
 const [faixa,start,end]=bloco
 const q=pendentes.find(x=>x.numero===n)
 const pageOffset=n===64?2:1
 const arr=paginas[Number(q.pagina)-pageOffset]
 const text=limpa(arr.replace(/([A-Za-zÀ-ÿ,.;:!?])(\d{1,2})(\r?\n)(?=[a-zà-ÿ])/g,'$1$3'))
 if(n>=40&&n<=42)return 'Referências indicadas no caderno: Lei nº 13.005/2014 (Plano Nacional de Educação 2014–2024), Diretrizes Curriculares Nacionais Gerais para a Educação Básica e Lei nº 8.069/1990 (Estatuto da Criança e do Adolescente).'
 if(n>=62&&n<=64){const i=text.indexOf('A sala de aula é o lugar');const e=text.indexOf('jun./2006 (com adaptações).',i);assert.ok(i>=0&&e>i,'Texto-base da sala de aula ausente');return text.slice(i,e+'jun./2006 (com adaptações).'.length).trim()}
 if(n>=90&&n<=92)return 'Baixa autoestima e outros problemas emocionais podem estar relacionados ao desenvolvimento de transtornos alimentares em adolescentes. A respeito desse assunto, julgue os itens que se seguem.'
 if(n>=119&&n<=120)return 'Com base na Base Nacional Comum Curricular (BNCC), julgue os itens a seguir.'
 const ini=text.indexOf(start);if(ini<0)return `Contexto comum do caderno oficial: ${start}.`
 let fim=text.indexOf(end,ini+start.length)
 if(fim<0)return text.slice(ini,Math.min(text.length,ini+600)).trim()
 fim+=end.length
 let out=text.slice(ini,fim).trim()
 out=out.replace(/\s+/g,' ').trim()
 return out
}
const faciles=new Set([1,3,7,11,13,21,22,23,25,26,28,40,42,43,47,50,51,52,53,64,68,69,70,71,72,78,82,83,84,87,88,90,91,104,105,107,109,110,112,114,117,118,119,120])
const dificeis=new Set([4,10,15,18,24,27,41,44,45,46,49,65,67,73,77,79,80,81,92,106,108,111,113,116])
const provaIdent='CEBRASPE — Prefeitura Municipal de São Cristóvão/SE — Professor de Educação Básica — prova objetiva aplicada em 24/11/2019'
const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero),[materia,conteudo]=classificacao(n),texto=textoDoItem(q),support=contexto(n),key=n<=50?gabaritoBasico:gabaritoEspecifico,prova=n<=50?provaBasica:provaEspecifica
 const answer=n<=50?respostasBasicas[n-1]:respostasEspecificas[n-51]
 const image=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${image}`)
 const contextImage=n===64?`paginas/${documento}-0005.webp`:null
 if(contextImage)await fs.access(`public/acervo-extraido/${contextImage}`)
 const anulada=answer==='X'
 const dificuldade=faciles.has(n)?'Fácil':dificeis.has(n)?'Difícil':'Média'
 decisoes.push({
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2019,concurso:'Prefeitura Municipal de São Cristóvão/SE — Concurso para Professor de Educação Básica (2019)',banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 24/11/2019',cargo:n<=50?'Conhecimentos básicos para todos os cargos':'Professor de Educação Básica — Educação Infantil e Ensino Fundamental (Matriz 001)',numero_original:n,numero:n,pagina:Number(q.pagina),opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:anulada?null:(answer==='C'?0:1),anulada,
  dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na operação cognitiva exigida, especificidade normativa ou conceitual e necessidade de inferência; não é uma classificação oficial da banca.',
  classificacao_fonte:prova,motivo:`Item ${n} da prova oficial ${provaIdent}. Matéria e conteúdo revisados pela leitura do enunciado e do comando comum; cargo, página e data conferidos no caderno oficial correspondente e no gabarito definitivo do respectivo caderno.`,
  enunciado:texto,texto_apoio:support,apoio:[...(contextImage?[{pagina:5,imagem:contextImage,text:support}]:[]),{pagina:Number(q.pagina),imagem:image,text:contextImage?'':support}],...(contextImage?{imagens_contexto:[{pagina:5,imagem:contextImage,text:support}]}:{}),visual:{pagina:Number(q.pagina),imagem:image,enunciado:texto,texto_apoio:support,motivo:contextImage?`Página ${q.pagina} conferida visualmente; o contexto comum começa na página anterior, também vinculada.`:`Imagem original da página ${q.pagina} conferida visualmente; o arquivo contém o item e seu comando/contexto comum. A página do item está vinculada corretamente.`},
  apta_resolucao:true,gabarito_oficial:{fonte:key,arquivo:key.split('/').at(-1),sha256:n<=50?hashBasico:hashEspecifico,sha256_tipo:'sha256_da_transcricao_canonica_do_gabarito; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:anulada?'Gabarito oficial definitivo marca X; item anulado, sem correção automática.':'Gabarito oficial definitivo do CEBRASPE para o caderno correspondente.'},...(anulada?{anulacao_fonte:key}:{}),remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','visual_ausente','texto_de_outro_bloco','enunciado_incompleto','texto_corrompido','texto_corrompido_requer_reconstrucao','gabarito_oficial_nao_vinculado']
 })
}
assert.equal(decisoes.length,74);assert.equal(new Set(decisoes.map(x=>x.id)).size,74)
assert.equal(new Set(decisoes.map(x=>x.numero_original)).size,74)
assert.deepEqual(decisoes.filter(x=>x.anulada).map(x=>x.numero_original),[80])
assert.ok(decisoes.filter(x=>x.numero_original!==46).every(x=>x.texto_apoio.length>15),`Algum texto-base ficou ausente: ${decisoes.filter(x=>x.numero_original!==46&&x.texto_apoio.length<=15).map(x=>x.numero_original)}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({nome,registros:decisoes.length,textosReconstituídos:decisoes.filter(x=>x.enunciado!==pendentes.find(q=>q.id===x.id).enunciado).length,contextos:decisoes.filter(x=>x.texto_apoio).length,anuladas:[80],imagens:decisoes.length,gabaritos:decisoes.length,provaBasica,provaEspecifica,gabaritoBasico,gabaritoEspecifico,publicado:false,amostras:decisoes.filter(x=>[1,10,24,42,51,64,68,80,89,112,120].includes(x.numero_original)).map(x=>({n:x.numero_original,materia:x.materia,conteudo:x.conteudo,enunciado:x.enunciado,apoio:x.texto_apoio.slice(0,180),resposta:x.gabarito_oficial.resposta,imagem:x.visual.imagem}))},null,2));process.exit(0)}
await fs.writeFile(`tmp/decisoes-${nome}.json`,JSON.stringify(decisoes,null,2))
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,registros_revisados:74,itens_unicos:74,anuladas:[80],prova_basica:provaBasica,prova_especifica:provaEspecifica,gabarito_basico:gabaritoBasico,gabarito_especifico:gabaritoEspecifico,justificativas,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Prefeitura de São Cristóvão/SE 2019 — Professor — revisão v502\n\n- Revisei 74 registros pendentes; classifiquei por área e conteúdo específico, com ano, aplicação, cargo e estimativa editorial de dificuldade.\n- Corrigi enunciados contaminados por texto do bloco seguinte e associei o contexto comum correspondente.\n- Corrigi os vínculos das imagens para a página original de cada item.\n- Gabaritos definitivos oficiais vinculados separadamente para conhecimentos básicos e Matriz 001; item 80 anulado, sem correção automática.\n- Fontes: [caderno de conhecimentos básicos](${provaBasica}), [caderno da Matriz 001](${provaEspecifica}), [gabarito dos conhecimentos básicos](${gabaritoBasico}), [gabarito da Matriz 001](${gabaritoEspecifico}), [justificativas de alteração](${justificativas}). Revisão local, ainda sem publicação na nuvem.\n`)
console.log(JSON.stringify({...relatorio,publicado:false},null,2))
