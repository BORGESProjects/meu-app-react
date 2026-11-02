import fs from 'node:fs/promises'
const gs=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/pendencias-compactas.json','utf8'))
const mapa=new Map()
for(const g of gs){const [banca,documento,ano,materia,conteudo]=g.grupo.split('\t');const x=mapa.get(documento)||{documento,banca,ano,total:0,grupos:0,amostras:[]};x.total+=g.total;x.grupos++;if(x.amostras.length<3)x.amostras.push(g.amostras[0]?.stem);mapa.set(documento,x)}
console.log(JSON.stringify([...mapa.values()].sort((a,b)=>b.total-a.total).slice(0,40),null,2))
