import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-fub-libras-v95/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fub-ti-basicos.json','utf8'))
const topicos=new Map(),definir=(ns,m,c)=>ns.forEach(n=>topicos.set(n,{materia:m,conteudo:c}))
definir([6,7],'Português','Interpretação de textos, sentido de palavras e recursos de pontuação')
definir([10,11,14,17,18],'Português','Morfossintaxe, semântica, tempos verbais, pontuação e funções sintáticas')
definir([21,22,23],'Redação Oficial','Comunicação oficial, fechos, atas e registro de reuniões')
definir([29],'Direitos da Pessoa com Deficiência','Reserva de vagas em concursos públicos e inclusão')
definir([31],'Direito Administrativo','Improbidade administrativa: responsabilidade e efeitos da morte do agente')
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=topicos.get(n);if(!t)throw Error(`Sem classificação para o item ${n}`)
 const pagina=q.pagina
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2016,numero_original:n,pagina,
  dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade de leitura, análise linguística e aplicação normativa; não é dado oficial da banca.',
  motivo:'Caderno oficial CEBRASPE/FUB 2016, conhecimentos básicos do cargo 13 — Técnico de Tecnologia da Informação; tópico identificado pelo enunciado e pelo bloco da prova.',
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; mantém texto-base literário, documento hipotético e comandos associados.'}}
})
const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-ti-basicos-v96',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-ti-basicos-v96-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 13, Técnico de Tecnologia da Informação (Conhecimentos Básicos)',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_CB3_01.pdf',paginasConferidas:[1,2,3],itensRevisados:decisoes.length,relatorio:report},null,2))
