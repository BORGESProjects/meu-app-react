import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'

const nome='revisao-slu-df-2019-engenharia-mecanica-cargo14-v523'
const doc='6659e1925079b821'
const dir=`tmp/revisao-profissional/${nome}/acervo-extraido`
const hash=x=>createHash('sha256').update(x).digest('hex')
const imagens={
  51:['diagrama-fe-c',1,'Diagrama de equilíbrio ferro-carbono'],52:['diagrama-fe-c',1,'Diagrama de equilíbrio ferro-carbono'],53:['diagrama-fe-c',1,'Diagrama de equilíbrio ferro-carbono'],54:['diagrama-fe-c',1,'Diagrama de equilíbrio ferro-carbono'],55:['diagrama-fe-c',1,'Diagrama de equilíbrio ferro-carbono'],
  66:['sistema-frenagem-tambor',3,'Esquema do sistema de frenagem por tambor'],67:['sistema-frenagem-tambor',3,'Esquema do sistema de frenagem por tambor'],68:['sistema-frenagem-tambor',3,'Esquema do sistema de frenagem por tambor'],69:['sistema-frenagem-tambor',3,'Esquema do sistema de frenagem por tambor'],
  70:['esteira-transportadora',4,'Esquema da esteira e do alimentador de resíduos'],
  71:['tubo-pitot-manometro',4,'Esquema do tubo de Pitot e do manômetro diferencial'],72:['tubo-pitot-manometro',4,'Esquema do tubo de Pitot e do manômetro diferencial'],73:['tubo-pitot-manometro',4,'Esquema do tubo de Pitot e do manômetro diferencial'],74:['tubo-pitot-manometro',4,'Esquema do tubo de Pitot e do manômetro diferencial'],
  93:['ciclo-rankine',6,'Diagrama T–s do ciclo de Rankine'],95:['simbolo-valvula-direcional',6,'Símbolo pneumático da válvula direcional']
}
const m=JSON.parse(await fs.readFile(path.join(dir,'manifesto.json'),'utf8'))
const arquivos=[...new Set(m.lotes.map(l=>path.basename(l.arquivo)).filter(f=>f.startsWith(`${nome}-`)&&f.endsWith('.json.gz')))]
let atualizados=0,limpos=0,afetados=[]
for(const original of arquivos){
 const bytes=await fs.readFile(path.join(dir,'lotes',original))
 const qs=JSON.parse(zlib.gunzipSync(bytes));let mudou=false
 for(const q of qs){
  if(q.documento_id!==doc)continue
  const n=Number(q.numero_original??q.numero),info=imagens[n]
  if(q.integridade_profissional?.apta_resolucao===false||!info){
   const tinhaImagem=Boolean(q.pagina_imagem||q.imagens_paginas?.length||q.contexto_paginas?.length||q.apoio?.length)
   q.apoio=[];q.imagens_paginas=[];q.paginas_origem=[];q.contexto_paginas=[];delete q.pagina_imagem
   if(tinhaImagem){mudou=true;limpos++}
   continue
  }
  const [slug,pagina,descricao]=info,imagem=`ilustracoes/${doc}-${slug}.png`,abs=path.join('public','acervo-extraido',imagem)
  const conteudo=await fs.readFile(abs)
  q.apoio=[{pagina,imagem,texto:descricao}]
  q.imagens_paginas=[imagem]
  q.paginas_origem=[pagina]
  q.contexto_paginas=[{pagina,imagem}]
  delete q.pagina_imagem
  q.revisao_semantica_visual={imagem,pagina,sha256:hash(conteudo),motivo:'Recorte fiel da figura original, isolado do texto da justificativa para manter o apoio visual necessário sem mostrar o gabarito.',metodo:'Recorte determinístico da página original; pixels da ilustração preservados.'}
  mudou=true;atualizados++
 }
 if(!mudou)continue
 const compactado=zlib.gzipSync(JSON.stringify(qs),{level:9}),indice=m.lotes.findIndex(l=>l.arquivo===`lotes/${original}`)
 assert.ok(indice>=0,`lote referenciado: ${original}`)
 const novo=`lotes/${nome}-${indice}-${hash(compactado).slice(0,12)}.json.gz`
 await fs.writeFile(path.join(dir,novo),compactado)
 m.lotes[indice].arquivo=novo
 afetados.push({indice,arquivo_anterior:original,arquivo_novo:novo,questoes:qs.filter(q=>q.documento_id===doc&&q.integridade_profissional?.apta_resolucao!==false&&imagens[Number(q.numero_original??q.numero)]).map(q=>q.numero_original??q.numero)})
}
assert.equal(atualizados,16,'Quantidade de imagens associadas')
m.gerado_em=new Date().toISOString()
await fs.writeFile(path.join(dir,'manifesto.json'),JSON.stringify(m))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-visuais.json`,JSON.stringify({atualizado_em:m.gerado_em,recortes:afetados,imagens_unicas:[...new Set(Object.values(imagens).map(x=>x[0]))],questoes_com_apoio_visual:atualizados,registros_sem_imagem_de_pagina_inteira:limpos},null,2))
console.log(JSON.stringify({questoes_com_apoio_visual:atualizados,registros_sem_imagem_de_pagina_inteira:limpos,lotes_atualizados:afetados.length,arquivos:afetados}))
