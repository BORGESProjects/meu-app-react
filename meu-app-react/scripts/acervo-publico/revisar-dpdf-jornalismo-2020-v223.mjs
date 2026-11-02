import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-dpdf-jornalismo-2020-v223',doc='3f395bfa664b52d3'
const prova='https://cdn.cebraspe.org.br/concursos/DPDF_20_ANALISTA/arquivos/548_DPDF_005_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/dpdf_20_analista/arquivos/GAB_DEFINITIVO_548_DPDF_005_01.PDF'
const concurso='DPDF — Edital 2020, prova aplicada em 13/02/2022 — Analista de Apoio à Assistência Judiciária, Cargo 5: Comunicação Social/Jornalismo'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==71||new Set(catalog.questoes.map(x=>x.numero)).size!==70||catalog.questoes[0].numero!==51||catalog.questoes.at(-1).numero!==120)throw Error('Caderno DPDF Cargo 5 diverge do inventário')
const dup55=catalog.questoes.filter(x=>x.numero===55)
if(dup55.length!==2||dup55.find(x=>x.id==='extr-06a16f072828bb9bc831')?.trecho.includes('58 O conceito'))throw Error('Duplicata do item 55 não corresponde ao registro catalogado')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-pf-perito-eletrica-2018-v222'))
if(start<0)throw Error('Base anterior v222 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases))
const byId=new Map(),wanted=new Set(catalog.questoes.map(x=>x.id))
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){byId.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(byId.size!==71||wanted.size)throw Error(`Esperados 71 registros do documento (70 itens e 1 duplicata); encontrados ${byId.size}; ausentes ${wanted.size}`)
const keys=['C','C','E','E','C','C','E','C','C','E','C','C','E','C','E','E','E','E','C','E','C','C','E','E','C','E','C','E','C','C','E','E','C','C','E','C','E','E','C','C','E','E','C','E','C','C','C','C','C','E','E','C','E','C','E','C','E','C','E','C','E','E','E','E','E','E','E','C','C','C']
if(keys.length!==70)throw Error(`Gabarito oficial não cobre 70 itens: ${keys.length}`)
const contexts={
 51:'Com relação a aspectos da comunicação social, julgue os itens seguintes.',
 54:'Julgue os próximos itens relativos à comunicação pública e aos instrumentos de comunicação segmentada.',
 56:'Considere os conceitos de opinião pública e esfera pública no contexto da comunicação mediada pela Internet.',
 57:'No que se refere à comunicação empresarial, ao planejamento, à identidade e à imagem organizacional, julgue os itens subsequentes.',
 61:'Julgue os itens sobre comunicação nas organizações, comunicação de crise, clima organizacional, sistemas internos e relacionamento com stakeholders.',
 65:'Acerca de temas emergentes da comunicação, incluindo wikis, comunicação viral, presença digital e redes sociais, julgue os itens.',
 69:'Texto-base da página 2: Antônio Carlos Fonseca Cintra, “A transcendência dos direitos humanos”, publicado na Revista da Defensoria Pública do Distrito Federal (2019). Os itens 69–74 avaliam compreensão, inferência, coesão e referenciação; consulte o texto integral na imagem original.',
 75:'Texto-base da página 2: artigo de Luis Felipe Miguel sobre a pluralidade da mídia e a democracia, reproduzido no caderno. Os itens 75–80 tratam da organização argumentativa, coesão e compreensão do texto; consulte a imagem original.',
 81:'Texto-base da página 3: artigo de Rogério Christofoletti sobre padrões de manipulação no jornalismo brasileiro. Os itens 81–85 avaliam interpretação, argumentação, semântica e conexão oracional; consulte a imagem original.',
 86:'Com base nas teorias da comunicação de massa, incluindo indústria cultural, cultural studies, teoria crítica e sociedade do espetáculo, julgue os itens.',
 91:'No que se refere à redação de texto jornalístico, julgue os itens sobre estilo, verossimilhança, clareza, uso de siglas e credibilidade.',
 97:'Julgue os itens sobre características, linguagens e técnicas de produção jornalística, incluindo entrevista, lide, notícia e reportagem.',
 101:'Acerca do jornalismo institucional, da ética profissional e das atribuições de assessoria de imprensa, julgue os itens.',
 104:'Julgue os itens acerca das características dos gêneros de redação, sua composição, classificação e elaboração de pauta.',
 109:'Texto-base da página 4: notícia “Defensorias públicas cobram retomada de transplantes de medula óssea”. Os itens 109–112 avaliam lide, gênero notícia, elementos de edição e valores-notícia; consulte o texto integral na imagem original.',
 113:'Texto-base da página 4: publicação institucional “DPDF atua em ação integrada para atender população em situação de rua”, com texto e elementos de interface reproduzidos no caderno. Os itens 113–116 tratam do formato de briefing, interesse editorial, webjornalismo e adaptação a redes sociais; consulte a imagem original.',
 117:'A respeito do planejamento editorial de produtos jornalísticos impressos e on-line, julgue os itens sobre projeto gráfico, diagramação, arquitetura da informação, gêneros digitais e infografia interativa.'
}
const contextStart=n=>Object.keys(contexts).map(Number).filter(x=>x<=n).at(-1)
const topic={
 51:['Comunicação Social','Teorias da comunicação: modelo matemático de Shannon'],52:['Comunicação Social','Teorias da comunicação: funções do processo segundo Lasswell'],53:['Comunicação Social','Comunicação organizacional: credibilidade e relacionamento com públicos'],54:['Comunicação Social','Comunicação pública: governo, sociedade e cidadania'],55:['Comunicação Social','Comunicação pública: instrumentos de comunicação segmentada'],56:['Comunicação Social','Opinião pública: esfera pública e interação em rede'],57:['Comunicação Social','Comunicação empresarial: análise do ambiente interno e setorial'],58:['Comunicação Social','Gestão de marcas: identidade organizacional'],59:['Comunicação Social','Imagem institucional: percepção dos públicos'],60:['Comunicação Social','Comunicação organizacional: ambiente interno e externo'],61:['Comunicação Social','Comunicação de crise: mensagens, clareza e conotação'],62:['Comunicação Social','Comunicação interna: clima organizacional, cultura e conteúdo de cargos'],63:['Comunicação Social','Comunicação interna formal e informal'],64:['Comunicação Social','Comunicação organizacional: engajamento de stakeholders'],65:['Comunicação Digital','Mídias sociais: wiki, produção colaborativa e publicação de conteúdo'],66:['Comunicação Digital','Comunicação viral: hashtags e propagação de mensagens'],67:['Comunicação Digital','Presença digital: mídia paga, própria e conquistada'],68:['Comunicação Digital','Teoria de redes sociais: nós, atores e laços'],
 69:['Língua Portuguesa','Interpretação textual: contexto de produção de texto sobre direitos humanos'],70:['Língua Portuguesa','Interpretação textual: fundamentos dos direitos humanos'],71:['Língua Portuguesa','Inferência e compreensão de texto'],72:['Língua Portuguesa','Inferência textual e transformação semântica de conceitos'],73:['Língua Portuguesa','Coesão referencial: retomada de termos e expressões'],74:['Língua Portuguesa','Coesão e progressão textual: expressão avaliativa'],75:['Língua Portuguesa','Estrutura do parágrafo: tópico frasal'],76:['Língua Portuguesa','Organização argumentativa e desenvolvimento do parágrafo'],77:['Língua Portuguesa','Coesão referencial: expressão demonstrativa'],78:['Língua Portuguesa','Reescrita, coerência e correção gramatical'],79:['Língua Portuguesa','Argumentação: exemplificação e progressão textual'],80:['Língua Portuguesa','Conectivos: concessão e relações argumentativas'],81:['Língua Portuguesa','Interpretação textual: valor semântico de “se”'],82:['Língua Portuguesa','Argumentação e ambiguidade lexical'],83:['Língua Portuguesa','Raciocínio argumentativo e construção do parágrafo'],84:['Língua Portuguesa','Argumentação: inferência e conclusão implícita'],85:['Língua Portuguesa','Sintaxe: coordenação e subordinação oracional'],
 86:['Comunicação Social','Teorias críticas da comunicação: indústria cultural'],87:['Comunicação Social','Estudos culturais: cultura e determinações econômicas'],88:['Comunicação Social','Teoria crítica: mídia, tecnologia e pensamento crítico'],89:['Comunicação Social','Sociedade do espetáculo: relações sociais e imagens'],90:['Comunicação Social','Teorias do jornalismo: agenda-setting e organização da imagem pública'],
 91:['Jornalismo','Redação jornalística: objetividade, concisão e linguagem referencial'],92:['Jornalismo','Apuração e verossimilhança: pesquisa e verificação de fatos'],93:['Jornalismo','Redação jornalística: clareza, concisão e síntese'],94:['Jornalismo','Redação jornalística: emprego e explicação de siglas'],95:['Jornalismo','Apuração jornalística: planejamento, pesquisa e pluralidade de fontes'],96:['Jornalismo','Redação jornalística: identificação de fontes e cargos'],97:['Jornalismo','Entrevista: procedimentos conforme a situação'],98:['Jornalismo','Entrevista: classificação segundo circunstâncias de realização'],99:['Jornalismo','Lide e técnicas de abertura: pirâmide invertida e nariz de cera'],100:['Jornalismo','Gêneros informativos: notícia e reportagem'],101:['Jornalismo','Ética jornalística: conflito de interesses e dupla função'],102:['Jornalismo','Assessoria de imprensa: divulgação e relacionamento com a mídia'],103:['Jornalismo','Assessoria de imprensa: posicionamento estratégico e comunicação institucional'],104:['Jornalismo','Gêneros discursivos: tema, estilo e composição'],105:['Jornalismo','Gêneros informativos: notícia e reportagem'],106:['Jornalismo','Gêneros opinativos: editorial'],107:['Jornalismo','Gêneros jornalísticos: classificação de formatos opinativos'],108:['Jornalismo','Produção jornalística: elaboração de pauta'],109:['Jornalismo','Texto noticioso: lide e perguntas fundamentais'],110:['Jornalismo','Gênero notícia: critérios de redação e edição'],111:['Jornalismo','Edição jornalística: chamada, título e subtítulo'],112:['Jornalismo','Critérios de noticiabilidade: proximidade, relevância, infração e escândalo'],113:['Jornalismo','Assessoria de imprensa: briefing e divulgação para redações'],114:['Jornalismo','Critérios de seleção editorial: interesse local e nacional'],115:['Jornalismo Digital','Webjornalismo: hiperlinks, compartilhamento e multimídia'],116:['Jornalismo Digital','Web 2.0: adaptação de conteúdo jornalístico a redes sociais'],117:['Jornalismo Digital','Projeto gráfico e diagramação de jornais e revistas'],118:['Jornalismo Digital','Arquitetura da informação e design de interfaces'],119:['Jornalismo Digital','Gêneros digitais: podcasts, newsgames e reportagens multimídia'],120:['Jornalismo Digital','Infografia interativa e recursos multimídia']
}
if(Object.keys(topic).length!==70||Object.keys(contexts).length<15)throw Error('Mapa temático/contextual incompleto')
for(let p=1;p<=5;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const keyHash=hashRevisao(keys.join(',')),decisions=[]
for(const e of catalog.questoes){
 const q=byId.get(e.id),n=e.numero,[materia,conteudo]=topic[n],k=keys[n-51],ctx=contexts[contextStart(n)],page=e.pagina
 if(!q||!materia||!conteudo||!ctx||!k)throw Error(`Item ${n}/${e.id}: dado essencial ausente`)
 const duplicate=e.id==='extr-2ff2ac2a8b50bf4ff61b'
 decisions.push({id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2020,concurso,numero_original:n,pagina:page,
  dificuldade:[51,52,55,58,59,65,66,67,68,69,71,72,75,77,78,80,82,83,86,89,90,92,93,94,96,97,99,100,104,105,106,107,109,110,111,113,114,115,117,119,120].includes(n)?'Fácil':[56,57,60,61,64,68,73,74,76,79,81,84,85,87,88,91,95,98,101,102,103,108,112,116,118].includes(n)?'Difícil':'Média',
  dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela leitura e integração de conceitos de comunicação, língua portuguesa e jornalismo; não é dado psicométrico publicado pela banca.',
  opcoes:q.opcoes?.length===2?q.opcoes:['Certo','Errado'],resposta_correta:k==='C'?0:1,anulada:false,texto_apoio:ctx,
  gabarito_oficial:{valor:k,fonte:gabarito,arquivo:'GAB_DEFINITIVO_548_DPDF_005_01.PDF',prova,numero:n,pagina:1,sha256:keyHash,hash_metodo:'SHA-256 da sequência dos 70 valores do gabarito definitivo, itens 51–120; não é hash criptográfico do PDF.',criterio:'Gabarito oficial definitivo CEBRASPE — DPDF, Cargo 5, Comunicação Social/Jornalismo.'},
  classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura temática de cada enunciado, contexto da questão e comando do bloco, com conferência visual das cinco páginas originais.'},
  visual:{pagina:page,imagem:`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,texto_apoio:ctx,motivo:`Página ${page} do caderno oficial vinculada ao item ${n}; contexto textual completo permanece visível na reprodução da página.`},
  remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia'],motivo:`Revisão v223 do item ${n}: classificação específica, ano do edital, cargo, contexto, dificuldade estimada e gabarito definitivo conferidos.${duplicate?' Registro OCR duplicado do item 55: preservado no histórico e marcado inelegível, com vínculo ao registro canônico.':''}`,
  ...(duplicate?{apta_resolucao:false,inelegibilidade_motivo:'Duplicata OCR do item 55; o registro canônico legível é extr-06a16f072828bb9bc831.',duplicada_de:'extr-06a16f072828bb9bc831'}:{})})
}
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
console.log(JSON.stringify({...report,documento:catalog.arquivo,concurso,itens_unicos:70,registros_catalogados:71,duplicatas_ineligiveis:1,anuladas:[],paginas_originais:5,publicado:false},null,2))
