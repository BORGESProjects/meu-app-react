import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-fub-medicina-v93/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fub-adm-arquivo.json','utf8'))
const topicos=new Map(),definir=(ns,m,c)=>ns.forEach(n=>topicos.set(n,{materia:m,conteudo:c}))
definir([51,52,53,54,55,56,57,58,59,60],'Arquivologia','Gestão de documentos, arquivos correntes, classificação, destinação, princípios e documentos digitais')
definir([61,62,63,64],'Comunicação Organizacional','Processo de comunicação, canais, mensagem, emissor, receptor e ruídos')
definir([65,66,67,68,69,70],'Administração Geral','Liderança, teorias da administração, funções administrativas, eficiência e eficácia')
definir([71,72,73,74,75,76],'Administração Pública','Ética, modelos patrimonial e gerencial, governança e transparência')
definir([77,78,79,80,81],'Atendimento ao Público','Qualidade de atendimento, serviços, autosserviço e experiência do usuário')
definir([82,83,84,85],'Gestão de Pessoas','Comportamento organizacional, valores, cultura e relações interpessoais')
definir([86,87,88,89,90],'Redação Oficial','Atos normativos, artigos, parágrafos, ofícios, memorandos, fechos e endereçamento')
definir([91,92,93,94,95],'Redação Oficial','Identificação, estrutura, finalidade e classificação de documentos oficiais')
definir([96,97,98,99,100,101],'Ética no Serviço Público','Deveres, conduta, moralidade, responsabilidade, atendimento e comissões de ética')
definir([102,103,104,105,106,107,108],'Direito Administrativo','Lei 8.112/1990: vantagens, licenças, investidura, posse, estabilidade, acumulação e sanções')
definir([115,116,117,118,119],'Licitações e Contratos','Lei 8.666/1993: consórcios, natureza do procedimento, participantes, objeto, modalidades, nulidade e vinculação ao edital')
const duplicados=new Map([
 ['extr-6c26cf7a06e3823b0395','extr-e1b7f07d6f787a1ebabe'],
 ['extr-202481d90109502117a8','extr-ebbb890f725fb7d0b45e'],
])
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=topicos.get(n);if(!t)throw Error(`Sem classificação para o item ${n}`)
 const pagina=q.pagina,dup=duplicados.get(q.id)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2016,numero_original:n,pagina,
  dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo nível de aplicação dos conceitos administrativos e arquivísticos; não é classificação oficial da banca.',
  motivo:'Caderno oficial CEBRASPE/FUB 2016, cargo 20 — Auxiliar em Administração; classificação individual pelo enunciado e seção da prova.',
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; preserva modelos de documentos e contextos compartilhados.'},
  ...(dup?{apta_resolucao:false,inelegibilidade_motivo:'Duplicata do mesmo item e caderno; cópia canônica preservada.',duplicada_de:dup}:{})
 }
})
const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-administracao-arquivo-v94',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-administracao-arquivo-v94-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 20, Auxiliar em Administração',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_020_01.pdf',paginasConferidas:[1,2,3],itensRevisados:decisoes.length,duplicatasExcluidas:[...duplicados.keys()],relatorio:report},null,2))
