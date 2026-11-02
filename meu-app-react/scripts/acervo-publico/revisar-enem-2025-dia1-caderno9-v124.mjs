import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const documento='cea6ddfd9367ced8'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const origem='tmp/revisao-profissional/revisao-pcse-delegado-formacao-2020-v123/acervo-extraido'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2025_Dia_1_P1_LC_CH_Caderno_09_Laranja_NVDA.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2025_GB_impresso_D1_CD9.pdf'

const ingles=['E','A','D','D','D']
const espanhol=['D','C','B','A','D']
const linguagens=['C','E','E','D','C','A','E','B','C','A','E','C','B','E','B','A','B','A','C','E','D','B','D','E','B','C','B','C','A','D','D','C','A','B','D','E','B','C','A','D']
const humanas=['A','D','B','D','E','E','D','E','C','E','E','D','C','C','A','D','B','A','D','A','B','B','C','B','B','A','C','A','D','E','B','B','A','B','B','D','C','D','A','A','A','A','B','C','C']
if(linguagens.length!==40||humanas.length!==45)throw Error('Gabarito incompleto')
const canonicalKey=JSON.stringify({ingles,espanhol,linguagens,humanas})
const keySha=hashRevisao(`${gabarito}\n${canonicalKey}`)

const temas={
 6:['Língua Portuguesa','Crônica — memória pessoal e reflexão sobre práticas de escrita','Média'],
 7:['Língua Portuguesa','Gêneros textuais — usos cotidianos do bilhete','Fácil'],
 8:['Língua Portuguesa','Coesão e argumentação — síntese da tese em texto crônico','Média'],
 9:['Língua Portuguesa','Tecnologias da escrita — relação entre manuscrito e tipografia digital','Fácil'],
 10:['Língua Portuguesa','Argumentação — coexistência de tecnologias de escrita','Fácil'],
 11:['Educação Física','Esporte de alto rendimento — inclusão, limites e trabalho do atleta','Média'],
 12:['Educação Física','Esporte e saúde — saúde emocional de atletas de alto rendimento','Fácil'],
 13:['Língua Portuguesa','Variação linguística — léxico ritual de matriz africana','Difícil'],
 14:['Literatura','Literatura brasileira contemporânea — representação da vulnerabilidade social','Média'],
 15:['Artes','Retrato e representação — identidade e visibilidade social','Média'],
 16:['Literatura','Poesia — metáfora e conflito amoroso','Média'],
 17:['Literatura','Narrativa — organização temporal e ressignificação da memória','Média'],
 18:['Literatura','Romantismo brasileiro — gênero, casamento e representação feminina','Média'],
 19:['Educação Física','Esporte adaptado — política pública e inclusão de pessoas com deficiência','Fácil'],
 20:['Língua Portuguesa','Gênero jurídico-normativo — função social da legislação educacional','Fácil'],
 21:['Artes','Cartaz publicitário — leitura de imagem e valorização da leitura','Fácil'],
 22:['Língua Portuguesa','Campanha de conscientização — educação e combate ao racismo','Média'],
 23:['Língua Portuguesa','Humor e metalinguagem — reflexão sobre usos linguísticos','Média'],
 24:['Artes','Arte popular — ressignificação de materiais e produção artesanal','Média'],
 25:['Artes','Arte brasileira contemporânea — colonialismo e violência na cultura visual','Difícil'],
 26:['Língua Portuguesa','Variação lexical — regionalismos e diversidade linguística','Fácil'],
 27:['Educação Física','Luta e esporte — regras, respeito e oposição à violência','Média'],
 28:['Literatura','Poesia brasileira — morte, repetição e expressividade sonora','Média'],
 29:['Literatura','Narrativa brasileira contemporânea — memória social e trabalho','Difícil'],
 30:['Língua Portuguesa','Semântica — ambiguidade e efeito de sentido em manchete','Média'],
 31:['Língua Portuguesa','Artigo de opinião — padrões de beleza e representação do corpo','Média'],
 32:['Língua Portuguesa','Oralidade — marcas de fala e adequação comunicativa','Média'],
 33:['Língua Portuguesa','Narrativa indígena — cosmovisão e saberes tradicionais','Difícil'],
 34:['Língua Portuguesa','Texto de opinião — tecnologias digitais e interação social','Média'],
 35:['Literatura','Gêneros narrativos — distinção entre conto e crônica','Média'],
 36:['Língua Portuguesa','Campanha educativa — mobilização escolar contra a violência de gênero','Fácil'],
 37:['Língua Portuguesa','Gêneros midiáticos — continuidade do rádio no formato podcast','Média'],
 38:['Literatura','Romance brasileiro — relações de gênero e crítica social','Difícil'],
 39:['Artes','Arte indígena — representação animal e patrimônio cultural Tukano','Média'],
 40:['Língua Portuguesa','Variação de registro — linguagem jurídica e tradução para o público geral','Média'],
 41:['Língua Portuguesa','Texto jornalístico — liderança feminina e protagonismo indígena','Fácil'],
 42:['Língua Portuguesa','Argumentação — operadores discursivos e corresponsabilidade','Média'],
 43:['Língua Portuguesa','Semântica lexical — palavras intraduzíveis e relação texto-imagem','Média'],
 44:['Literatura','Intertextualidade — releitura de mito em narrativa contemporânea','Média'],
 45:['Língua Portuguesa','Coesão referencial — retomada e introdução de referentes no texto','Média'],
 46:['Sociologia','Memória social — trabalho, família e pertencimento cultural','Média'],
 49:['Filosofia','Ética econômica — empatia, julgamento moral e responsabilidade','Difícil'],
 50:['Filosofia','Filosofia política — formas de governo em Aristóteles','Média'],
 51:['Geografia','Geopolítica europeia — disputas identitárias e integração regional','Média'],
 52:['Geografia','Climatologia — circulação atmosférica e transporte de aerossóis','Difícil'],
 53:['Filosofia','Filosofia moderna — ceticismo, credulidade e retórica','Difícil'],
 55:['História','Cristianismo medieval — controle eclesiástico das práticas culturais','Média'],
 56:['Geografia','Geografia da população — seletividade do êxodo urbano','Média'],
 57:['Sociologia','Poder e sociedade — disciplina e capilaridade do controle social','Difícil'],
 58:['Geografia','Geografia econômica — hidrovias, logística e atividade industrial','Média'],
 59:['História','Renascimento — humanismo e sociabilidade urbana','Média'],
 60:['Filosofia','Filosofia do direito — justiça, lei e desobediência civil','Difícil'],
 61:['Sociologia','Sociabilidade urbana — vínculos interpessoais e vida cotidiana','Média'],
 62:['Geografia','Geomorfologia — dissolução de rochas e formação de dolinas','Média'],
 63:['História','Memória e patrimônio — preservação de símbolos históricos','Fácil'],
 64:['Filosofia','Filosofia pré-socrática — unidade dos contrários em Heráclito','Média'],
 65:['História','Colonização da América — etnocentrismo e interpretação dos rituais indígenas','Difícil'],
 66:['Sociologia','Religiões afro-brasileiras — racismo religioso e reconhecimento da alteridade','Difícil'],
 67:['Geografia','Agricultura e meio ambiente — agrotóxicos e biodiversidade','Média'],
 68:['Filosofia','Direitos humanos — historicidade e transformação dos direitos','Média'],
 69:['Geografia','Energia e ambiente — impactos materiais da transição para veículos elétricos','Média'],
 70:['História','Brasil colonial — assistência caritativa e instituições religiosas','Média'],
 71:['Filosofia','Ética utilitarista — punição e princípio da felicidade coletiva','Difícil'],
 72:['Geografia','Geografia urbana — sustentabilidade e gestão de cursos hídricos','Fácil'],
 73:['Filosofia','Filosofia política contemporânea — utopia e transformação social','Média'],
 74:['Geografia','Geografia agrária — agronegócio e inserção do capital no campo','Média'],
 75:['História','Brasil republicano — crise política e atentado contra Carlos Lacerda','Difícil'],
 76:['Filosofia','Ética — altruísmo e ação orientada ao bem comum','Fácil'],
 77:['Filosofia','Teoria crítica — sociedade unidimensional em Herbert Marcuse','Difícil'],
 78:['Geografia','Geografia agrária — função social da propriedade e desigualdade fundiária','Difícil'],
 79:['Geografia','Geografia urbana — verticalização e transformação da paisagem','Fácil'],
 80:['História','Cristandade medieval — religiosidade leiga e práticas de devoção','Difícil'],
 81:['Geografia','Matriz energética — energia geotérmica e climatização de edifícios','Média'],
 82:['História','Roma Antiga — conflitos entre patrícios e plebeus','Média'],
 83:['Sociologia','Povos indígenas — direitos culturais e diversidade dos saberes tradicionais','Média'],
 84:['História','História cultural — conhecimento, formação e práticas de trabalho','Média'],
 85:['História','Imperialismo — expedições científicas e expansão europeia','Média'],
 86:['Sociologia','Gênero e cidadania — políticas públicas de proteção às mulheres','Média'],
 87:['Filosofia','Filosofia política — justiça, ética e organização da pólis em Platão','Difícil'],
 88:['História','Brasil colonial — imprensa régia e integração político-administrativa','Média'],
 89:['Geografia','Sensoriamento remoto — monitoramento ambiental e prevenção de incêndios','Média'],
 90:['Sociologia','Indústria cultural — cinema, lazer e moralidade social','Média']
}
const respostas=new Map()
for(let n=1;n<=5;n++){
 respostas.set(`${n}:en`,ingles[n-1]);respostas.set(`${n}:es`,espanhol[n-1])
}
for(let n=6;n<=45;n++)respostas.set(`${n}:pt`,linguagens[n-6])
for(let n=46;n<=90;n++)respostas.set(`${n}:pt`,humanas[n-46])

const decisoes=pendentes.map(q=>{
 const n=Number(q.numero)
 if(q.id==='extr-ad692a7070484b6872e5')return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Linguagens, Códigos e suas Tecnologias',conteudo:'Instruções do caderno — registro administrativo, não é questão',ano:2025,numero_original:0,pagina:q.pagina,apta_resolucao:false,inelegibilidade_motivo:'Instruções gerais de aplicação do caderno, sem comando avaliativo ou alternativas respondíveis.',motivo:'A página 2 do caderno oficial contém instruções gerais para o participante, não uma questão.'}
 const idioma=n<=5?(q.pagina>=9?'es':'en'):'pt'
 const tema=n<=5?[
  idioma==='en'?['Inglês','Compreensão leitora — resiliência e crítica à expressão “snowflake generation”','Média']:['Espanhol','Variação linguística — marcas de oralidade na representação da fala','Média'],
  idioma==='en'?['Inglês','Compreensão de texto multimodal — sono e consumo de café','Fácil']:['Espanhol','Compreensão leitora — tecnologia digital e geração Alfa','Média'],
  idioma==='en'?['Inglês','Compreensão leitora — apropriação cultural e identidade indígena','Média']:['Espanhol','Interpretação de canção — desigualdade social e relações de trabalho','Média'],
  idioma==='en'?['Inglês','Compreensão leitora — filosofia e problemas sociais','Média']:['Espanhol','Variação lexical — circulação e origem da palavra “guagua”','Média'],
  idioma==='en'?['Inglês','Poesia — interdependência entre seres humanos e natureza','Média']:['Espanhol','Compreensão de canção — pretérito imperfeito e relato de memória','Média']
 ][n-1]:temas[n]
 if(!tema)throw Error(`Sem classificação temática para questão ${n}: ${q.id}`)
 const letra=respostas.get(`${n}:${idioma}`)
 if(!letra||!Array.isArray(q.opcoes)||q.opcoes.length!==5)throw Error(`Alternativas/gabarito inválido em ${q.id}`)
 let opcoes=[...q.opcoes]
 if(n===5&&idioma==='en')opcoes[4]=opcoes[4].replace(/\s*Questões de 01 a 05 \(opção espanhol\)\s*$/iu,'').trim()
 if(n===5&&idioma==='es')opcoes[4]=opcoes[4].replace(/\s*Texto para as Questões de 6 a 10[\s\S]*$/iu,'').trim()
 if(n===45)opcoes[4]=opcoes[4].replace(/\s*PROPOSTA DE REDAÇÃO[\s\S]*$/u,'').trim()
 if(n===90)opcoes[4]=opcoes[4].replace(/\s*\(Fim da prova\)\s*$/iu,'').trim()
 if(opcoes.some(x=>!x)||opcoes.length!==5)throw Error(`Alternativa vazia em ${q.id}`)
 const enunciado=n===45?q.enunciado.replace(/^(?:[1-9]\s*\n){9}/u,'').trim():q.enunciado.trim()
 const imagensContexto=n===45?[]:(q.contexto||[]).filter(x=>Number(x.pagina)!==Number(q.pagina)).map(x=>({pagina:Number(x.pagina),imagem:x.imagem,texto:x.texto||''}))
 const [materia,conteudo,dificuldade]=tema
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2025,numero_original:n,pagina:q.pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada nas operações de leitura, nos conceitos mobilizados e nas etapas de raciocínio; não é índice psicométrico publicado pelo INEP.',resposta_correta:letra.charCodeAt(0)-65,gabarito_oficial:{valor:letra,fonte:gabarito,sha256:keySha,sha256_tipo:'transcricao_canonica_da_tabela_oficial',metodo:'Resposta conferida na tabela do gabarito oficial INEP do 1º dia, caderno 9 Laranja. O SHA-256 identifica a transcrição canônica das tabelas oficiais, não o arquivo PDF.'},classificacao_fonte:prova,visual:{pagina:q.pagina,imagem:`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,motivo:`Página original do item ${n} vinculada ao registro. A classificação foi feita pelo enunciado e pelo texto acessível; a imagem preserva o caderno para conferência de elementos gráficos.`},...(n===45?{enunciado,opcoes,texto_apoio:'O texto-base completo está no enunciado. A proposta de redação que aparecia anexada ao final da quinta alternativa foi removida deste registro objetivo.'}:{...(opcoes.some((x,i)=>x!==q.opcoes[i])?{opcoes}:{})}),...(n===5&&idioma==='es'?{enunciado:q.enunciado.replace(/\s*Texto para as Questões de 6 a 10[\s\S]*$/iu,'').trim(),opcoes}:{}),imagens_contexto:imagensContexto,reemplazarContexto:n===45,motivo:`ENEM 2025, aplicação regular, 1º dia, caderno 9 Laranja (Braille e ledor/NVDA), questão ${n}${idioma==='en'?' — opção Inglês':idioma==='es'?' — opção Espanhol':''}. Ano e numeração conferidos no caderno oficial; matéria e conteúdo classificados individualmente pelo tema do item.`}
})

const paginas=new Set(decisoes.filter(x=>x.apta_resolucao!==false).flatMap(x=>[x.pagina,...(x.imagens_contexto||[]).map(c=>c.pagina)]))
for(const p of paginas){const f=`public/acervo-extraido/paginas/${documento}-${String(p).padStart(4,'0')}.webp`;await fs.access(f)}
const rel=await aplicarRevisoesIndividuais({nome:'revisao-enem-2025-dia1-caderno9-v124',base:origem,decisoes})
const raiz='tmp/revisao-profissional/revisao-enem-2025-dia1-caderno9-v124/acervo-extraido'
if(!raizesAtuais.includes(raiz))raizesAtuais.unshift(raiz)
const arq='scripts/acervo-publico/acervo-atual.mjs';let atual=await fs.readFile(arq,'utf8');if(!atual.includes(`raizesAtuais.unshift('${raiz}')`))atual=atual.replace('export async function lerArquivoAtual',`raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`);await fs.writeFile(arq,atual)
const reportPath='docs/acervo/revisao-profissional/RELATORIO.md';let report=await fs.readFile(reportPath,'utf8')
if(!report.includes('## Revisão do caderno v124 — ENEM 2025'))report+=`\n\n## Revisão do caderno v124 — ENEM 2025, 1º dia, caderno 9 Laranja (NVDA)\n\n- Revisei ${rel.classificadas} registros pendentes: ${decisoes.filter(x=>x.apta_resolucao===false).length} registro de instruções gerais foi marcado inelegível; ${decisoes.filter(x=>x.apta_resolucao!==false).length} questões objetivas foram classificadas por matéria e conteúdo. Mantive Inglês e Espanhol como versões distintas dos itens 1–5 e atribuí às demais a área correspondente.\n- Corrigi o item 45: removi a proposta de redação e textos motivadores que haviam sido anexados ao enunciado e à quinta alternativa; preservei as cinco opções objetivas. No item 5 em Inglês, removi o cabeçalho de seção contaminante da alternativa E. As imagens das páginas e contextos existentes foram vinculadas às questões; a questão 45 mantém apenas sua própria página para não exibir as páginas da redação como se fossem parte dela.\n- O gabarito foi transcrito das tabelas oficiais do caderno 9. O campo SHA-256 identifica a transcrição canônica das respostas, não o PDF original, cujo download direto foi bloqueado no ambiente. Dificuldade é estimativa editorial, não dado psicométrico do INEP.\n- Validação local: total ${rel.total}, disponíveis ${rel.disponiveis}, pendências elegíveis ${rel.pendentes}; ${rel.lotes_alterados} lotes alterados, facetas recalculadas.\n- Fontes primárias: [prova oficial INEP — caderno 9 Laranja, 1º dia](https://download.inep.gov.br/enem/provas_e_gabaritos/2025_Dia_1_P1_LC_CH_Caderno_09_Laranja_NVDA.pdf), [gabarito oficial INEP — caderno 9](https://download.inep.gov.br/enem/provas_e_gabaritos/2025_GB_impresso_D1_CD9.pdf), [página oficial do ENEM 2025](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2025).\n- Estado: v124 integrado localmente; não publicado no Cloudflare. A revisão integral do corpus continua.\n`
await fs.writeFile(reportPath,report)
console.log(JSON.stringify({...rel,itens_objetivos:decisoes.filter(x=>x.apta_resolucao!==false).length,registro_inelegivel:decisoes.filter(x=>x.apta_resolucao===false).length,questao45Alternativas:decisoes.find(x=>x.numero_original===45)?.opcoes.length}))
