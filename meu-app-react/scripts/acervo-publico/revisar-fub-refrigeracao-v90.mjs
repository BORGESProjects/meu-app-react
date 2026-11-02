import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const base='tmp/revisao-profissional/revisao-mpto-servico-social-v89/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fub2016-especificos.json','utf8'))
const assunto=new Map()
const definir=(numeros,materia,conteudo)=>numeros.forEach(n=>assunto.set(n,{materia,conteudo}))
const refr='Refrigeração e Climatização'
definir([51,52,53,54,55,56],refr,'Componentes do ciclo frigorífico: filtro secador, válvulas, visor de líquido, compressor e tubo capilar')
definir([57,58,59,60,61],refr,'Eficiência energética, consumo elétrico e conservação de refrigeradores domésticos')
definir([62,63,64,65,66],refr,'Diagnóstico de falhas em freezers: condensador, vedação, isolamento, compressor e carga de refrigerante')
definir([67,68,69,70,71,72],refr,'Procedimentos de manutenção: vácuo, teste de vazamento, ferramentas e carga de refrigerante')
definir([73,74,75],refr,'Recuperação, reciclagem e destinação ambiental de fluidos refrigerantes')
definir([76,77,78,79,80],refr,'Sistemas de água gelada: fan-coils, controle, expansão indireta e atendimento de zonas')
definir([81,82],refr,'Aditivos anticongelantes e termoacumulação em sistemas de climatização')
definir([83,84,86,87],refr,'Princípios e ciclos de refrigeração: compressão de vapor, absorção e efeito termoelétrico')
definir([88,89,90,91,92,93,94,95,96],refr,'Instalação e manutenção: tubulações, óleo, vácuo, alimentação elétrica e superaquecimento')
definir([97,98,99],refr,'Dispositivos auxiliares: pump-down, controle de condensação e acumulador de sucção')
definir([101,102,103,104,105,106],refr,'Equipamentos self-contained: ventilação, troca térmica, congelamento e desidratação')
definir([107,108],refr,'Resfriadores de líquido (chillers): vazão, perda de carga e sequência de fases')

const decisoes=pendentes.map(q=>{
 const n=q.numero_original,topico=assunto.get(n)
 if(!topico)throw Error(`Sem classificação temática para o item ${n}`)
 const pagina=q.pagina
 return {
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topico.materia,conteudo:topico.conteudo,ano:2016,numero_original:n,pagina,
  dificuldade:'Média',dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na leitura do item, na especificidade técnica exigida e no nível de aplicação de conceitos esperado para Técnico em Refrigeração; não é dado oficial da banca.',
  motivo:`Caderno oficial CEBRASPE/FUB 2016, cargo 18 (Técnico em Refrigeração); classificação individual por enunciado e seção temática da prova.`,
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; mantém figuras, esquema e contexto associados ao item.'}
 }
})

const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-refrigeracao-v90',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-refrigeracao-v90-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 18, Técnico em Refrigeração',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_018_01.pdf',paginasConferidas:[1,2,3,4,5],itensRevisados:decisoes.length,itens:[...assunto.keys()].sort((a,b)=>a-b),relatorio:report},null,2))
