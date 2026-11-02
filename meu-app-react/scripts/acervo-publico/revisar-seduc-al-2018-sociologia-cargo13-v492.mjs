import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import zlib from 'node:zlib'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-seduc-al-2018-sociologia-cargo13-v492'
const documento='a25bcc969c164477'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/MATRIZ_376_SEDUCAL013__PAG_3.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/GAB_DEFINITIVO_376_SEDUCAL013.PDF'
const concurso='SEDUC/AL — Concurso para Professor — Cargo 13: Sociologia (edital 2017; prova aplicada em 2018)'
const cargo='Professor — Especialidade: Sociologia — Cargo 13'
const catalogo=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(catalogo?.url,prova)
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const nums=pendentes.map(q=>Number(q.numero)).sort((a,b)=>a-b)
assert.equal(pendentes.length,61)
assert.deepEqual(nums,[51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120])

// Gabarito oficial definitivo do mesmo caderno/cargo.
const respostas={51:'E',52:'E',53:'C',54:'C',55:'E',56:'E',57:'C',58:'E',59:'C',60:'C',61:'E',62:'E',63:'C',64:'C',65:'C',66:'E',67:'E',68:'C',69:'C',70:'E',71:'E',72:'C',73:'E',75:'C',76:'E',77:'E',78:'E',79:'C',80:'E',81:'C',82:'C',83:'C',84:'C',85:'E',86:'E',87:'E',88:'C',89:'C',90:'E',91:'C',92:'C',93:'E',94:'C',95:'E',96:'E',97:'C',106:'C',107:'C',108:'C',109:'C',110:'E',111:'C',112:'E',113:'C',114:'C',115:'C',116:'C',117:'E',118:'C',119:'E',120:'C'}
assert.equal(Object.keys(respostas).length,61)
const hashGabarito=hashRevisao(Object.entries(respostas).sort(([a],[b])=>Number(a)-Number(b)).map(([n,r])=>`${n}:${r}`).join('|'))

const conteudos={
51:['Fundamentos de Sociologia','Constituição da Sociologia: abordagens positivistas e críticas','Média'],52:['Sociologia Clássica','Karl Marx: obras e unidade de sua teoria','Média'],53:['Pensamento Social Brasileiro','Florestan Fernandes: investigação empírica e objetividade','Difícil'],54:['Sociologia Clássica','Auguste Comte: física social e positivismo','Fácil'],55:['Pensamento Social Brasileiro','Florestan Fernandes: conhecimento científico da realidade social','Difícil'],56:['Sociologia Clássica','Max Weber: objetividade e tipo ideal','Média'],57:['Sociologia Clássica','W. E. B. Du Bois: raça e sociologia clássica','Média'],58:['Sociologia Clássica','Karl Marx: produção e consumo','Difícil'],59:['Sociologia Clássica','Émile Durkheim: autonomia da Sociologia e método científico','Média'],60:['Sociologia Clássica','Karl Marx: práxis e Teses sobre Feuerbach','Média'],
61:['Sociologia Clássica','Durkheim: solidariedade social e divisão do trabalho','Difícil'],62:['Sociologia Clássica','Instituições sociais e coerção','Média'],63:['Sociologia Clássica','Marx: produção material, produção intelectual e sociedade','Média'],64:['Sociologia Clássica','Weber: dominação carismática','Fácil'],65:['Sociologia Clássica','Weber: burocracia, autoridade e dominação legal','Média'],66:['Sociologia Clássica','Weber: tipos puros de dominação','Média'],67:['Sociologia Clássica','Marx: classes sociais e ação política','Difícil'],68:['Sociologia Clássica','Marx e Weber: classe e dominação','Média'],69:['Sociologia Clássica','Weber: classes e ação de classe','Difícil'],70:['Sociologia Clássica','Marx: consciência de classe, política e economia','Difícil'],71:['Sociologia Clássica','Weber: ética protestante e capitalismo','Média'],
72:['Sociologia Contemporânea','Classes sociais e estilos de vida no Brasil','Média'],73:['Sociologia Contemporânea','Diferenciação social e estrutura de classes','Média'],75:['Sociologia Contemporânea','Luhmann: sistemas sociais, inclusão e exclusão','Difícil'],76:['Sociologia da Educação','Bourdieu: capital cultural e aprendizagem escolar','Média'],77:['Sociologia da Educação','Bourdieu: equidade escolar e reprodução das desigualdades','Difícil'],78:['Sociologia Contemporânea','Bourdieu: capital econômico e desigualdade social','Média'],79:['Sociologia da Educação','Bourdieu: escola e reprodução das desigualdades','Média'],80:['Sociologia da Educação','Bourdieu: rendimento escolar e capital cultural','Média'],81:['Sociologia da Educação','Bourdieu: avaliação escolar e capital cultural','Difícil'],
82:['Sociologia Brasileira','Violência de gênero e pensamento social brasileiro','Média'],83:['Sociologia Brasileira','Patriarcado e formação da família brasileira','Média'],84:['Sociologia','Gênero, desigualdade social e educação','Fácil'],85:['Sociologia','Gênero: análise sociológica e individualização','Média'],86:['Sociologia','Gênero, diversidade e educação','Média'],87:['Sociologia','Violência de gênero e desigualdades interseccionais','Média'],88:['Sociologia Urbana','Mobilidade urbana, consumo e desigualdade','Média'],89:['Sociologia Urbana','Transporte público, inclusão e acesso a serviços','Média'],90:['Sociologia Urbana','Planejamento viário e mobilidade sustentável','Média'],91:['Sociologia Urbana','Mobilidade, saúde pública e desigualdade urbana','Média'],92:['Sociologia Clássica','Durkheim: fato social e violência no trânsito','Média'],93:['Sociologia dos Movimentos Sociais','Movimentos sociais urbanos e mobilidade','Difícil'],
94:['Sociologia Brasileira','Discriminação racial e violência institucional','Média'],95:['Sociologia Brasileira','Desigualdade racial e encarceramento','Média'],96:['Sociologia Brasileira','Racismo e violência letal no Brasil','Média'],97:['Sociologia Brasileira','Racismo e violência institucional','Fácil'],
106:['Sociologia Ambiental','Unidades de conservação, biodiversidade e uso sustentável','Média'],107:['Sociologia Ambiental','Desenvolvimento sustentável: dimensões ambiental, econômica e social','Fácil'],108:['Sociologia do Trabalho','Desemprego e precarização das relações de trabalho','Média'],109:['Sociologia do Trabalho','Estado, regulação e fiscalização das relações de trabalho','Fácil'],110:['Demografia','Transição demográfica e estrutura populacional','Média'],111:['Sociologia do Trabalho','Transformações demográficas, tecnológicas e mercado de trabalho','Média'],112:['Sociologia da Religião','Estado laico e liberdade religiosa','Fácil'],113:['Sociologia da Religião','Weber: calvinismo e capitalismo','Difícil'],114:['Sociologia da Religião','Constituição Federal: liberdade religiosa e de crença','Média'],115:['Sociologia da Religião','Weber, Durkheim e o estudo sociológico da religião','Fácil'],116:['Sociologia Brasileira','Ações afirmativas e desigualdade social','Média'],117:['Sociologia da Cultura','Multiculturalismo e diversidade linguística no Brasil','Média'],118:['Sociologia da Comunicação','Meios de comunicação, ideologia e classes sociais','Difícil'],119:['Sociologia da Comunicação','Internet, confiança e circulação de informação','Média'],120:['Sociologia da Comunicação','Redes sociais, apoio em crises e circulação de informação','Média']
}

const stems={
60:'Conforme se pode observar nas Teses sobre Feuerbach, a relevância da crítica para a perspectiva teórica de Karl Marx marca a intenção de garantir um espaço para o pensamento, sem dissociá-lo da prática.',
71:'Em A ética protestante e o espírito do capitalismo, Max Weber afirma que a Reforma protestante foi o fator mais relevante para a consolidação do capitalismo, na medida em que disseminou uma nova ética que visava ao acúmulo de riquezas materiais.',
81:'Parte da desigualdade social se reproduz na escola porque o professor avalia positivamente o capital cultural adquirido fora de sala de aula.',
87:'Na sociedade brasileira, a violência atinge a todas as mulheres de maneira uniforme, com índices semelhantes independentemente da raça ou condição econômica das vítimas e dos agressores.',
93:'O movimento social contra o aumento das tarifas de ônibus que se expressou em 2013 desencadeou uma série de grandes manifestações de bases sociais semelhantes às dos movimentos sociais tradicionais.',
105:'A adoção de fontes de energia eólica e solar, menos impactantes ao meio ambiente, depende de novas tecnologias ainda indisponíveis no Brasil.',
111:'Ao longo do século XX, o Brasil passou por mudanças demográficas, inovações tecnológicas e transformações econômicas que alteraram a conformação do mercado de trabalho, criaram novas profissões e extinguiram outras.'
}
const contextos={
 '51-55':'Comando: considerando as discussões sobre a constituição da Sociologia e seu estabelecimento como conhecimento científico, julgue os itens.',
 '56-60':'Comando: julgue os itens sobre as contribuições de Durkheim, Marx, Max Weber e W. E. B. Du Bois à Sociologia clássica.',
 '61-66':'Comando: julgue os itens sobre estrutura e organização da sociedade, divisão do trabalho e dominação social.',
 '67-71':'Comando: com base nas análises de Marx e Weber sobre classes sociais, produção, desigualdades e estratificação, julgue os itens.',
 '72-75':'Texto-base: síntese das teorias contemporâneas de estilos de vida e classes sociais, com referências a Giddens, Dahrendorf, Parkin, Bourdieu e Lepsius. Referência bibliográfica consta da página original.',
 '76-81':'Comando: com base em Bourdieu e em seus estudos sobre reprodução das desigualdades sociais no ambiente escolar, julgue os itens.',
 '82-87':'Texto-base: análise sociológica da violência doméstica fatal, dos estereótipos sobre vítimas e autores e da desigualdade de gênero; referência bibliográfica preservada na página original.',
 '88-93':'Comando: considerando a mobilidade urbana como problema das cidades brasileiras, julgue os itens.',
 '94-97':'Comando: julgue os itens sobre discriminação racial.',
 '106-107':'Comando: julgue os itens sobre a relação entre desenvolvimento científico, meio ambiente e vida humana.',
 '108-111':'Comando: julgue os itens sobre sociedade, trabalho, emprego e transformações das relações de trabalho.',
 '112-115':'Comando: julgue os itens sobre relações entre religião e sociedade.',
 '116-117':'Comando: julgue os itens relativos à diversidade cultural.',
 '118-120':'Comando: julgue os itens sobre a influência dos meios de comunicação de massa nas ideias e nas relações sociais.'
}
const faixa=n=>Object.keys(contextos).find(k=>{const [a,b]=k.split('-').map(Number);return n>=a&&n<=b})
const limpar=['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente']
const decisoes=[]
for(const q of pendentes){
 const n=Number(q.numero),meta=conteudos[n],key=respostas[n]
 assert.ok(meta&&key,`Item ${n} sem classificação ou gabarito`)
 const imagem=`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const enunciado=stems[n]||q.enunciado.replace(/\s+/g,' ').replace(/\s*CESPE \| CEBRASPE – SEDUC\/AL – Aplicação: 2018\s*/g,' ').replace(/\s+(?:Considerando as reflexões acerca da estrutura|Com base nas análises de Karl Marx|A teoria dos estilos de vida|Com base na perspectiva do sociólogo|Ainda existe uma resistência muito grande|Considerando que a mobilidade urbana|No que se refere à discriminação racial|A respeito do processo de globalização|No que tange à relação entre o desenvolvimento científico|A respeito de sociedade, trabalho e emprego|No que se refere às relações entre religião|Julgue os itens seguintes, relativos à diversidade cultural|Acerca da influência dos meios de comunicação).*/,'').replace(/\s*Espaço livre\s*$/,'').trim()
 assert.ok(enunciado.length>20,`Item ${n} sem enunciado íntegro`)
 const anulada=key==='X',texto_apoio=contextos[faixa(n)]
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:meta[0],conteudo:meta[1],ano:2018,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 1º/4/2018',cargo,numero:n,numero_original:n,pagina:q.pagina,dificuldade:meta[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual, no referencial sociológico e na articulação teórica exigida; não é estatística de desempenho.',resposta_correta:anulada?null:(key==='C'?0:1),anulada,gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_376_SEDUCAL013.PDF — Cargo 13: Professor, Sociologia',sha256:hashGabarito,numero:n,resposta:key,criterio:'Gabarito oficial definitivo do mesmo cargo e caderno; não há itens anulados entre os registros revisados.'},classificacao_fonte:prova,motivo:`Item ${n}: classificação baseada no conteúdo do enunciado e no comando da seção; aplicação, cargo e banca conferidos nas fontes oficiais. Dificuldade estimada editorialmente.`,enunciado,texto_apoio,imagem_pagina:imagem,visual:{pagina:q.pagina,imagem,enunciado,texto_apoio,motivo:`Página ${q.pagina} do caderno oficial comparada visualmente; o texto do item foi separado do comando e das questões adjacentes.`},apta_resolucao:true,remover_pendencias:limpar})
}
assert.equal(decisoes.length,61);assert.equal(new Set(decisoes.map(x=>x.id)).size,61)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:61,itens_unicos:61,aptas:61,paginas_conferidas:[1,2,3],gabarito_definitivo_oficial:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,prova,gabarito,concurso,registros_revisados:61,itens_unicos:61,questoes_aptas:61,paginas_conferidas:[1,2,3],gabarito_definitivo_oficial_vinculado:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-alteracoes.json.gz`,zlib.gzipSync(JSON.stringify(decisoes),{level:9}))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## SEDUC/AL 2018 — Professor de Sociologia, Cargo 13 — revisão v492\n\n- Revisei os 61 itens pendentes deste caderno; classifiquei teoria sociológica, Sociologia clássica e contemporânea, Sociologia da Educação, gênero, mobilidade urbana, raça, meio ambiente, trabalho, religião, diversidade cultural e comunicação.\n- Separei enunciados de comandos de seção e texto-base que a extração havia agregado às questões; associei páginas originais 1–3.\n- Vinculei o gabarito definitivo oficial do Cargo 13. Dificuldade editorial estimada. Pacote local, ainda não publicado na nuvem.\n- Fontes: [caderno oficial](${prova}), [gabarito definitivo oficial](${gabarito}).\n`)
console.log(JSON.stringify(relatorio,null,2))
