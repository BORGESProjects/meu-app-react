import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {lotesAtuais,lerArquivoAtual,raizesAtuais} from './acervo-atual.mjs'
import {criarIndiceFacetas} from '../../src/facetasAcervo.js'
export const hashRevisao=x=>createHash('sha256').update(x).digest('hex')
export async function aplicarRevisoesIndividuais({nome,base,decisoes,adicoes=[]}){
 assert.match(nome,/^[a-z0-9-]+$/)
 const inicio=raizesAtuais.findIndex(r=>r===base);assert.ok(inicio>=0)
 const bases=raizesAtuais.slice(inicio),destino=`tmp/revisao-profissional/${nome}/acervo-extraido`
 const m=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),facetas=criarIndiceFacetas(),mapa=new Map(decisoes.map(p=>[p.id,p])),audit=[]
 assert.equal(mapa.size,decisoes.length);await fs.mkdir(`${destino}/lotes`,{recursive:true})
 let total=0,disponiveis=0,pendentes=0,lotes=0,bytes=0
 for await(const {indice,questoes,lote} of lotesAtuais(bases)){
  let mudou=false;assert.equal(questoes.length,lote.quantidade)
  for(const q of questoes){
   total++;const p=mapa.get(q.id)
   if(p){
    const antes=structuredClone(q);assert.equal(hashRevisao(q.enunciado),p.sha256_enunciado)
    Object.assign(q,{materia:p.materia,conteudo:p.conteudo,classificacao_revisada:true,classificacao_pendente:false,classificacao_confianca:0.95,classificacao_metodo:'Leitura semântica individual do enunciado e do contexto quando necessário pelo assistente',classificacao_evidencia:p.motivo})
    if(Object.hasOwn(p,'ano'))q.ano=Number(p.ano)
    if(Object.hasOwn(p,'concurso'))q.concurso=p.concurso
    if(Object.hasOwn(p,'banca'))q.banca=p.banca
    if(Object.hasOwn(p,'organizadora'))q.organizadora=p.organizadora
    if(Object.hasOwn(p,'aplicacao'))q.aplicacao=p.aplicacao
    if(Object.hasOwn(p,'cargo'))q.cargo=p.cargo
    if(Object.hasOwn(p,'numero_original'))q.numero_original=Number(p.numero_original)
    if(Object.hasOwn(p,'numero'))q.numero=Number(p.numero)
    if(Object.hasOwn(p,'pagina'))q.pagina=Number(p.pagina)
    if(p.dificuldade){q.dificuldade=p.dificuldade;q.dificuldade_estimada=p.dificuldade_estimada===true;if(p.dificuldade_evidencia)q.dificuldade_evidencia=p.dificuldade_evidencia}
    if(Object.hasOwn(p,'resposta_correta'))q.resposta_correta=p.resposta_correta
    if(Object.hasOwn(p,'anulada'))q.anulada=p.anulada
    if(p.gabarito_oficial)q.gabarito_oficial=p.gabarito_oficial
    if(p.classificacao_fonte)q.classificacao_fonte=p.classificacao_fonte
    if(Object.hasOwn(p,'enunciado'))q.enunciado=p.enunciado
    if(Object.hasOwn(p,'opcoes'))q.opcoes=p.opcoes
    if(Object.hasOwn(p,'tipo_resposta'))q.tipo_resposta=p.tipo_resposta
    if(Object.hasOwn(p,'texto_apoio'))q.texto_apoio=p.texto_apoio
    if(Object.hasOwn(p,'comentario'))q.comentario=p.comentario
    if(Object.hasOwn(p,'apoio')){
     assert.ok(Array.isArray(p.apoio),'O apoio visual revisado deve ser uma lista de recursos.')
     for(const v of p.apoio)assert.ok(v.imagem?.startsWith(`paginas/${q.documento_id}-`))
     q.apoio=p.apoio.map(v=>({pagina:Number(v.pagina),imagem:v.imagem,texto:v.texto||''}))
    }
    if(p.apta_resolucao===false){
     const motivoInelegibilidade=p.inelegibilidade_motivo||'registro_invalido_ou_duplicado'
     q.integridade_profissional={...(q.integridade_profissional||{}),apta_resolucao:false,correcao_automatica:false,verificada_individualmente:true,pendencias:[...new Set([...(q.integridade_profissional?.pendencias||[]),motivoInelegibilidade])]}
     q.elegibilidade={...(q.elegibilidade||{}),elegivel_para_resolucao:false,elegivel_para_correcao_automatica:false,apontamentos:[...new Set([...(q.elegibilidade?.apontamentos||[]),motivoInelegibilidade])]}
     q.inelegibilidade_motivo=p.inelegibilidade_motivo
     if(p.duplicada_de)q.duplicada_de=p.duplicada_de
    }
    if(p.apta_resolucao===true){
     const remover=new Set(p.remover_pendencias||[])
     q.integridade_profissional={...(q.integridade_profissional||{}),apta_resolucao:true,verificada_individualmente:true,pendencias:(q.integridade_profissional?.pendencias||[]).filter(x=>!remover.has(x))}
     q.elegibilidade={...(q.elegibilidade||{}),elegivel_para_resolucao:true,apontamentos:(q.elegibilidade?.apontamentos||[]).filter(x=>!remover.has(x))}
     if(!p.gabarito_oficial){q.integridade_profissional.correcao_automatica=false;q.elegibilidade.elegivel_para_correcao_automatica=false}
    }
    const gabaritoOficialVerificado=Boolean(p.gabarito_oficial?.sha256||(
     p.gabarito_oficial?.verificada===true&&
     typeof p.gabarito_oficial?.url==='string'&&
     /^https:\/\/cdn\.cebraspe\.org\.br\/concursos\/[A-Za-z0-9_-]+\/arquivos\//.test(p.gabarito_oficial.url)
    ))
    if(gabaritoOficialVerificado){
     const corrigivel=p.anulada!==true&&p.apta_resolucao!==false
     q.integridade_profissional={...(q.integridade_profissional||{}),correcao_automatica:corrigivel,verificada_individualmente:true,pendencias:(q.integridade_profissional?.pendencias||[]).filter(x=>x!=='gabarito_oficial_nao_vinculado')}
     q.elegibilidade={...(q.elegibilidade||{}),elegivel_para_correcao_automatica:corrigivel,apontamentos:(q.elegibilidade?.apontamentos||[]).filter(x=>x!=='gabarito_oficial_nao_vinculado')}
    }
    if(p.imagens_contexto){
     const novas=p.imagens_contexto.map(v=>({pagina:Number(v.pagina),imagem:v.imagem,texto:v.texto||''}))
     for(const v of novas)assert.ok(v.imagem.startsWith(`paginas/${q.documento_id}-`))
     q.apoio=p.reemplazarContexto?novas:[...(q.apoio||[]),...novas.filter(v=>!(q.apoio||[]).some(a=>a.imagem===v.imagem))]
     q.imagens_paginas=[...new Set([...(q.imagens_paginas||[]),...novas.map(v=>v.imagem),...(q.pagina_imagem?[q.pagina_imagem]:[])])]
     q.contexto_paginas=[...new Map([...(q.contexto_paginas||[]),...novas].map(v=>[v.pagina,v])).values()].sort((a,b)=>a.pagina-b.pagina)
    }
    if(p.imagem_pagina){
     assert.ok(p.imagem_pagina.startsWith(`paginas/${q.documento_id}-`))
     const paginas=[{pagina:Number(q.pagina),imagem:p.imagem_pagina},...(p.imagens_contexto||[]).map(v=>({pagina:Number(v.pagina),imagem:v.imagem}))]
     q.pagina_imagem=p.imagem_pagina;q.imagens_paginas=[...new Set(paginas.map(v=>v.imagem))];q.paginas_origem=[...new Set(paginas.map(v=>v.pagina))].sort((a,b)=>a-b);q.contexto_paginas=paginas
    }
    if(p.visual){const v=p.visual;assert.equal(q.pagina,v.pagina);assert.ok(v.imagem.endsWith(`-${String(v.pagina).padStart(4,'0')}.webp`));assert.ok(v.imagem.startsWith(`paginas/${q.documento_id}-`));
     if(v.enunciado)q.enunciado=v.enunciado
     if(v.texto_apoio!==undefined)q.texto_apoio=v.texto_apoio
     const paginas=[{pagina:Number(v.pagina),imagem:v.imagem},...(p.imagens_contexto||[]).map(x=>({pagina:Number(x.pagina),imagem:x.imagem}))]
     q.pagina_imagem=v.imagem;q.imagens_paginas=[...new Set(paginas.map(x=>x.imagem))];q.paginas_origem=[...new Set(paginas.map(x=>x.pagina))].sort((a,b)=>a-b);q.contexto_paginas=[...new Map(paginas.map(x=>[x.pagina,x])).values()].sort((a,b)=>a.pagina-b.pagina)
     q.revisao_semantica_visual={imagem:v.imagem,pagina:v.pagina,sha256:hashRevisao(await fs.readFile(path.join('public/acervo-extraido',v.imagem))),motivo:v.motivo,metodo:'Conferência visual individual da página original'}
    }
    for(const [campo,chave] of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(x=>x!=='classificacao_especifica_pendente')
    if(Object.hasOwn(p,'ano'))for(const [campo,chave] of [['integridade_profissional','pendencias'],['elegibilidade','apontamentos']])if(q[campo]?.[chave])q[campo][chave]=q[campo][chave].filter(x=>x!=='ano_sem_evidencia')
    const permitidos=new Set(['materia','conteudo','classificacao_revisada','classificacao_pendente','classificacao_confianca','classificacao_metodo','classificacao_evidencia','integridade_profissional','elegibilidade',...(Object.hasOwn(p,'ano')?['ano']:[]),...(Object.hasOwn(p,'concurso')?['concurso']:[]),...(Object.hasOwn(p,'banca')?['banca']:[]),...(Object.hasOwn(p,'organizadora')?['organizadora']:[]),...(Object.hasOwn(p,'aplicacao')?['aplicacao']:[]),...(Object.hasOwn(p,'cargo')?['cargo']:[]),...(Object.hasOwn(p,'numero_original')?['numero_original']:[]),...(Object.hasOwn(p,'numero')?['numero']:[]),...(Object.hasOwn(p,'pagina')?['pagina']:[]),...(p.dificuldade?['dificuldade','dificuldade_estimada','dificuldade_evidencia']:[]),...(Object.hasOwn(p,'resposta_correta')?['resposta_correta']:[]),...(Object.hasOwn(p,'anulada')?['anulada']:[]),...(p.gabarito_oficial?['gabarito_oficial']:[]),...(p.classificacao_fonte?['classificacao_fonte']:[]),...(Object.hasOwn(p,'enunciado')?['enunciado']:[]),...(Object.hasOwn(p,'opcoes')?['opcoes']:[]),...(Object.hasOwn(p,'texto_apoio')?['texto_apoio']:[]),...(p.imagem_pagina?['pagina_imagem','imagens_paginas','paginas_origem','contexto_paginas']:[]),...(p.imagens_contexto?['apoio','imagens_paginas','contexto_paginas']:[]),...(p.visual?['enunciado','texto_apoio','pagina_imagem','imagens_paginas','paginas_origem','contexto_paginas','revisao_semantica_visual']:[]),...(p.apta_resolucao===false?['inelegibilidade_motivo','duplicada_de']:[])])
    if(Object.hasOwn(p,'apoio'))permitidos.add('apoio')
    if(Object.hasOwn(p,'comentario'))permitidos.add('comentario')
    if(Object.hasOwn(p,'inelegibilidade_motivo'))permitidos.add('inelegibilidade_motivo')
    for(const campo of Object.keys(antes))if(!permitidos.has(campo))assert.deepEqual(q[campo],antes[campo])
    for(const campo of ['integridade_profissional','elegibilidade'])for(const k of Object.keys(antes[campo]||{}))if(!['pendencias','apontamentos','apta_resolucao','elegivel_para_resolucao','correcao_automatica','elegivel_para_correcao_automatica','verificada_individualmente'].includes(k))assert.deepEqual(q[campo][k],antes[campo][k])
    audit.push({id:q.id,decisao:p,antes,depois:structuredClone(q)});mudou=true
   }
   if(q.integridade_profissional?.apta_resolucao!==false)disponiveis++
   if(q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao!==false&&!q.classificacao_revisada)pendentes++
  }
  facetas.adicionar(indice,questoes)
  if(mudou){const b=zlib.gzipSync(JSON.stringify(questoes),{level:9});const arquivo=`lotes/${nome}-${indice}-${hashRevisao(b).slice(0,12)}.json.gz`;await fs.writeFile(path.join(destino,arquivo),b);m.lotes[indice].arquivo=arquivo;lotes++;bytes+=b.length}
 }
 assert.equal(audit.length,decisoes.length);assert.equal(total,m.questoes_extraidas_unicas)
 m.questoes_disponiveis_resolucao-=audit.filter(x=>x.decisao.apta_resolucao===false&&x.antes.integridade_profissional?.apta_resolucao!==false).length
 m.questoes_disponiveis_resolucao+=audit.filter(x=>x.decisao.apta_resolucao===true&&x.antes.integridade_profissional?.apta_resolucao===false).length
 if(adicoes.length){
  const ids=new Set();for(const q of adicoes){assert.ok(q.id&&!ids.has(q.id));ids.add(q.id);assert.ok(q.materia&&q.conteudo&&q.ano&&q.enunciado&&q.tipo_resposta);assert.ok(q.integridade_profissional?.apta_resolucao!==false);const gv=Boolean(q.gabarito_oficial?.sha256||(q.gabarito_oficial?.verificada===true&&typeof q.gabarito_oficial?.url==='string'&&/^https:\/\/cdn\.cebraspe\.org\.br\/concursos\/[A-Za-z0-9_-]+\/arquivos\//.test(q.gabarito_oficial.url)));assert.ok(!q.integridade_profissional?.correcao_automatica||gv)}
  const indice=m.lotes.length,buf=zlib.gzipSync(JSON.stringify(adicoes),{level:9}),arquivo=`lotes/${nome}-${indice}-${hashRevisao(buf).slice(0,12)}.json.gz`
  await fs.writeFile(path.join(destino,arquivo),buf);m.lotes.push({banca:adicoes[0].banca,ano:adicoes[0].ano,concurso:adicoes[0].concurso,quantidade:adicoes.length,arquivo});facetas.adicionar(indice,adicoes);total+=adicoes.length;disponiveis+=adicoes.filter(q=>q.integridade_profissional?.apta_resolucao!==false).length;lotes++;bytes+=buf.length
  m.questoes_extraidas_unicas+=adicoes.length;m.revisao_profissional.registros_complementares=m.questoes_extraidas_unicas
  m.questoes_disponiveis_resolucao+=adicoes.filter(q=>q.integridade_profissional?.apta_resolucao!==false).length
 }
 assert.equal(total,m.questoes_extraidas_unicas)
 assert.equal(disponiveis,m.questoes_disponiveis_resolucao)
 const f=facetas.finalizar();assert.equal(f.linhas.reduce((n,r)=>n+r[6],0),disponiveis)
 const fb=zlib.gzipSync(JSON.stringify(f),{level:9}),arquivo=`lotes/filtros-${nome}-${hashRevisao(fb).slice(0,12)}.json.gz`
 await fs.writeFile(path.join(destino,arquivo),fb);m.indice_facetas={arquivo,sha256:hashRevisao(fb),versao:1};m.gerado_em=new Date().toISOString()
  await fs.writeFile(path.join(destino,'visuais.json'),await lerArquivoAtual('visuais.json',bases));m.revisao_profissional={...(m.revisao_profissional||{}),ultima_revisao:nome,itens_classificados_individualmente:Number(m.revisao_profissional?.itens_classificados_individualmente||0)+audit.filter(x=>x.antes.classificacao_pendente).length+adicoes.length,revisao_individual_concluida:false};await fs.writeFile(path.join(destino,'manifesto.json'),JSON.stringify(m))
 const report={gerado_em:m.gerado_em,classificadas:audit.length,adicionadas:adicoes.length,novas_classificacoes:audit.filter(p=>p.antes.classificacao_pendente).length,contextos_visuais:audit.filter(p=>p.decisao.visual).length,total,disponiveis,pendentes,lotes_alterados:lotes,arquivos:lotes+3,bytes,publicado:false}
 await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(audit),{level:9}));console.log(JSON.stringify(report));return report
}
