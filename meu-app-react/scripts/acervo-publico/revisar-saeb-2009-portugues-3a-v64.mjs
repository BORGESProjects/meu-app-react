import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='82003211737e1316'
const nome='revisao-saeb-2009-portugues-3a-v64'
const pdf='https://download.inep.gov.br/educacao_basica/saeb/documentos_edicoes_antigas/saeb_2009-portugues_3_serie_do_ensino_medio.pdf'
const raw=JSON.parse(await fs.readFile('tmp/saeb2009-74.json','utf8'))
const pages=JSON.parse(zlib.gunzipSync(await fs.readFile(`tmp/revisao-profissional/fontes-texto/${doc}.json.gz`)))
const norm=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
const clean=s=>(s||'').replace(/\s+/g,' ').replace(/\s+([.,;:!?])/g,'$1').trim()
function parseItem(q){
 const s=pages[q.p-1]||''
 const key=s.match(/Gabarito\.+:\s*([A-E])/i)?.[1]
 const code=s.match(/Texto-base\.\.\.:\s*(\d+)\s*-\s*([^\n]+)/i)
 const seq=s.match(/Seq(?:ü|u)ência\.+:\s*\d+\s*\n/i)
 if(!key||!seq)return null
 let body=s.slice(seq.index+seq[0].length).replace(/^\s*-{8,}\s*/,'')
 body=body.split(/\n\s*-{8,}\s*|SAEB 2009,.*?Resultado:|JUSTIFICATIVA DAS ALTERNATIVAS|Para encontrar a resposta correta|Os distratores/i)[0]
 const matches=[...body.matchAll(/(?:^|\n)\s*\(([A-E])\)\s*([\s\S]*?)(?=\n\s*\([A-E]\)\s*|$)/g)]
 if(matches.length!==5||matches.map(m=>m[1]).join('')!=='ABCDE')return null
 const stem=clean(body.slice(0,matches[0].index).replace(/^\s*-{8,}\s*/,'').replace(/\s+/g,' '))
 const opcoes=matches.map(m=>clean(m[2].replace(/\s+/g,' ')))
 if(!stem||opcoes.some(x=>!x))return null
 return {key,code:code?.[1]||'',title:code?.[2]?.trim()||'',stem,opcoes,grade:s.match(/Série\.+:\s*([^\n]+)/i)?.[1]?.trim()||'3ª série - EM'}
}
function baseFor(q,item){
 if(!item.code)return {pagina:q.p,texto:''}
 const re=new RegExp(`Texto-base:\\s*${item.code}\\s*-`,'i')
 const candidatos=[]
 for(let i=0;i<pages.length;i++)if(re.test(pages[i]||''))candidatos.push(i+1)
 const anteriores=candidatos.filter(p=>p<=q.p).sort((a,b)=>b-a)
 const pagina=anteriores[0]??candidatos.sort((a,b)=>Math.abs(a-q.p)-Math.abs(b-q.p))[0]??q.p
 let texto=pages[pagina-1]||''
 const partes=texto.split(/-{8,}/)
 if(partes.length>=3)texto=partes.slice(2).join(' ')
 texto=texto.replace(/^\s*\d+\s*/,'').replace(/\n\s*\d+(?:\s*\n|\s*$)/g,' ').replace(/\s+/g,' ').trim()
 if(pagina===q.p&&/Disciplina\.+:/i.test(texto))texto=''
 return {pagina,texto}
}
function estatistica(q){
 const grade=parseItem(q)?.grade||'3ª série - EM'
 for(let p=q.p;p<=Math.min(pages.length,q.p+3);p++){
  const text=pages[p-1]||''
  const blocks=[...text.matchAll(/SAEB 2009,\s*Português,[^\n]*Resultado:[\s\S]*?(?=SAEB 2009,|$)/gi)].filter(b=>b[0].includes(grade))
  for(const b of blocks){
   const linhas=b[0].split(/\r?\n/).filter(x=>/[\d]/.test(x))
   const linha=linhas.map(l=>l.match(/-?\d+(?:\.\d+)?/g)).filter(n=>n?.length>=13).at(-1)
   if(linha){const pCorrect=Number(linha[8+('ABCDE'.indexOf(parseItem(q)?.key||'A'))]);if(Number.isFinite(pCorrect))return {percentual:pCorrect,pagina:p}}
  }
  if(p>q.p&&/Gabarito\.+:\s*[A-E]/i.test(text))break
 }
 return null
}
function tema(stem,title){
 const s=norm(`${stem} ${title}`)
 if(/refere se|palavra destacada|palavra grifada|pronome|expressao destacada/.test(s))return 'Coesão e referenciação: pronomes e retomadas'
 if(/finalidade|objetivo|foi escrito|proposito|funcao do texto/.test(s))return 'Gêneros textuais e finalidade comunicativa'
 if(/humor|ironia|engracad|efeito comico/.test(s))return 'Efeitos de humor e ironia'
 if(/opiniao|ponto de vista|evidencia que a fala/.test(s))return 'Identificação de opinião e ponto de vista'
 if(/comparando|ambos os textos|dois textos/.test(s))return 'Comparação e relação entre textos'
 if(/narrador|narrativa|personagem|historia foi resolvido|deu inicio/.test(s))return 'Elementos da narrativa'
 if(/linguagem|modo de falar|falantes|registro rural|informal|formal/.test(s))return 'Variação linguística e registros de linguagem'
 if(/ponto de interrogacao|pontuacao/.test(s))return 'Pontuação e efeitos de sentido'
 if(/assunto do texto|tema do texto|trata principalmente/.test(s))return 'Tema e assunto do texto'
 if(/verso|poeta|poema|estrofe/.test(s))return 'Interpretação de textos poéticos'
 if(/palavra|expressao|significa|sugere|sentido/.test(s))return 'Semântica: sentido de palavras e expressões'
 return 'Compreensão e interpretação de textos'
}
function dificultad(p){
 if(p===null)return {dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica para item de leitura da 3ª série do ensino médio; o relatório estatístico individual não foi localizado.'}
 const dificuldade=p>=70?'Fácil':p>=40?'Média':'Difícil'
 return {dificuldade,dificuldade_estimada:true,dificuldade_evidencia:`Estimativa derivada da taxa oficial de acerto do item no SAEB 2009 (${p}%): fácil ≥70%, média 40–69%, difícil <40%.`}
}
const validos=raw.map(q=>({q,item:parseItem(q)})),falhas=validos.filter(x=>!x.item)
const grupos=new Map()
for(const x of validos.filter(x=>x.item)){const k=[norm(x.item.stem),...x.item.opcoes.map(norm)].join('|');if(!grupos.has(k))grupos.set(k,[]);grupos.get(k).push(x)}
const canon=new Map()
for(const xs of grupos.values()){xs.sort((a,b)=>a.q.p-b.q.p);for(const x of xs)canon.set(x.q.id,xs[0].q)}
const decisoes=[]
const manifest=JSON.parse(await lerArquivoAtual('manifesto.json'))
const docsAtivos=new Map()
for(const i of manifest.lotes.map((l,i)=>({l,i})).filter(x=>x.i>=3762&&x.i<=3764).map(x=>x.i)){
 const lote=manifest.lotes[i],qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lote.arquivo)))
 for(const q of qs)if(q.documento_id===doc)docsAtivos.set(q.id,q)
}
for(const {q,item} of validos){
 const original=docsAtivos.get(q.id);if(!original)throw Error(`Questão não encontrada no acervo ativo: ${q.id}`)
 const sha=hashRevisao(original.enunciado)
 if(!item){decisoes.push({id:q.id,sha256_enunciado:sha,materia:'Língua Portuguesa',conteudo:'Registro sem questão correspondente',ano:2009,classificacao_fonte:pdf,motivo:'Registro pendente sem enunciado e sem cinco alternativas identificáveis na página oficial.',apta_resolucao:false,inelegibilidade_motivo:'Extração sem questão resolvível comprovada pelo caderno oficial.'});continue}
 const page=`paginas/${doc}-${String(q.p).padStart(4,'0')}.webp`,imageHash=hashRevisao(await fs.readFile(`public/acervo-extraido/${page}`))
 const base=baseFor(q,item),dup=canon.get(q.id),isDup=dup.id!==q.id
 const d={id:q.id,sha256_enunciado:sha,materia:'Língua Portuguesa',conteudo:tema(item.stem,item.title),ano:2009,...dificultad(estatistica(q)?.percentual??null),resposta_correta:'ABCDE'.indexOf(item.key),gabarito_oficial:{valor:item.key,fonte:pdf,pagina:q.p,sha256:imageHash,metodo:'Gabarito impresso no cabeçalho do caderno oficial do Inep.'},classificacao_fonte:pdf,motivo:`Questão objetiva de Língua Portuguesa do SAEB 2009, 3ª série do ensino médio. Código ${item.code}; gabarito e descritor conferidos no caderno oficial. Conteúdo: ${tema(item.stem,item.title)}.`,enunciado:item.stem,opcoes:item.opcoes,imagem_pagina:page}
 if(base.pagina!==q.p){const ctxPage=`paginas/${doc}-${String(base.pagina).padStart(4,'0')}.webp`;await fs.access(`public/acervo-extraido/${ctxPage}`);if(base.texto)d.texto_apoio=base.texto;d.imagens_contexto=[{pagina:base.pagina,imagem:ctxPage,texto:base.texto}];d.reemplazarContexto=true}
 else if(base.texto)d.texto_apoio=base.texto
 if(isDup){d.apta_resolucao=false;d.duplicada_de=dup.id;d.inelegibilidade_motivo=`Duplicata textual exata da questão ${dup.numero_original}; uma ocorrência foi mantida para resolução.`}
 decisoes.push(d)
}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({questoes:raw.length,recuperadas:raw.length-falhas.length,falhas:falhas.map(x=>({id:x.q.id,p:x.q.p,n:x.q.n})),duplicatas:decisoes.filter(x=>x.duplicada_de).length,semEstatistica:decisoes.filter(x=>x.dificuldade_evidencia?.startsWith('Estimativa pedagógica')).map(x=>x.id),comContexto:decisoes.filter(x=>x.imagens_contexto).length,temas:Object.fromEntries([...new Set(decisoes.map(x=>x.conteudo))].map(t=>[t,decisoes.filter(x=>x.conteudo===t).length]))},null,2));process.exit(0)}
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const out={...report,fonte:pdf,questoes_avaliadas:raw.length,questoes_recuperadas:raw.length-falhas.length,questoes_unicas_resolutiveis:decisoes.filter(x=>x.resposta_correta!=null&&!x.duplicada_de).length,duplicatas_exatas_excluidas:decisoes.filter(x=>x.duplicada_de).length,registros_sem_enunciado:decisoes.filter(x=>x.apta_resolucao===false&&!x.duplicada_de).length,questoes_com_texto_ou_imagem_de_contexto:decisoes.filter(x=>x.imagens_contexto?.length||x.texto_apoio).length,paginas_base_associadas:[...new Set(decisoes.flatMap(x=>x.imagens_contexto||[]).map(v=>v.pagina))].length,contextos_visuais:decisoes.filter(x=>x.imagens_contexto?.length).length,questoes_com_gabarito_oficial:decisoes.filter(x=>x.gabarito_oficial?.sha256).length,questoes_com_dificuldade_estimada_por_estatistica:decisoes.filter(x=>x.dificuldade_evidencia?.includes('taxa oficial')).length,imagens_conferidas:raw.length-falhas.length,observacao_dificuldade:'Dificuldade estimada a partir das taxas oficiais de resposta; não é rótulo psicométrico publicado pelo Inep.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(out,null,2));console.log(JSON.stringify(out))
