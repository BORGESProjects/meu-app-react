import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-fub-administracao-arquivo-v94/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-unb-libras.json','utf8'))
const topicos=new Map(),definir=(ns,m,c)=>ns.forEach(n=>topicos.set(n,{materia:m,conteudo:c}))
definir([51,52,53,54,55,56,57,58,59,60,61,62],'Linguística das Línguas de Sinais','Parâmetros fonológicos, unidades lexicais, morfologia, expressões não manuais, fonologia e sintaxe da Libras')
definir([64,65,66],'Tradução e Interpretação de Libras','Modalidade linguística, tradução de expressões idiomáticas e recursos lexicais/espaciais')
definir([67,68,69,70],'Educação Bilíngue de Surdos','Direitos linguísticos, terminologia acadêmica e definição legal de escolas bilíngues')
definir([71,72,73,74,75,76,77,78,79],'Estudos Surdos e Cultura','Movimentos sociais, identidade, cultura surda, língua de sinais e artefatos culturais')
definir([80,81,82,83,84,85,86,87,88],'Educação de Surdos e Surdocegueira','Bilinguismo, aprendizagem, aquisição da Libras, classificadores e estratégias de comunicação')
definir([89,90,91,92,93,94],'Ética e Atuação Profissional do Intérprete','Proficiência, competência, limites éticos e atuação em contextos educacionais')
definir([95,96,97,98,99,100,101,102,103,104],'Direitos da Pessoa com Deficiência','Acessibilidade, educação inclusiva, convenções e direitos linguísticos')
definir([105,106,107,108,109,110,111,112,113,114,115,116,117,118],'Legislação de Libras e Educação Especial','Lei 10.436/2002, Decreto 5.626/2005, formação de intérpretes, Libras e organização da educação bilíngue')
definir([119,120],'Atendimento Educacional Especializado','Objetivos e público do AEE conforme o Decreto 7.611/2011')
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=topicos.get(n);if(!t)throw Error(`Sem classificação para o item ${n}`)
 const pagina=q.pagina
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2016,numero_original:n,pagina,
  dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo conhecimento linguístico, educacional e jurídico específico sobre Libras exigido no item; não é dado oficial da banca.',
  motivo:'Caderno oficial CEBRASPE/FUB 2016, cargo 19 — Tradutor e Intérprete de Linguagem de Sinais; classificação pelo conteúdo do item e pelo bloco temático.',
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; mantém sinais ilustrados, textos-base e comandos normativos.'}}
})
const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-libras-v95',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-libras-v95-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 19, Tradutor e Intérprete de Linguagem de Sinais',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_019_01.pdf',paginasConferidas:[1,2,3],itensRevisados:decisoes.length,relatorio:report},null,2))
