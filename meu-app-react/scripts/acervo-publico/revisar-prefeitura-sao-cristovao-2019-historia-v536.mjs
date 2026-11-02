import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const nome='revisao-prefeitura-sao-cristovao-2019-historia-v536',doc='3db631606b188fcf'
const base='tmp/revisao-profissional/revisao-fub-2016-equipamentos-odontologicos-cargo15-v535/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/PREF_SAO_CRISTOVAO_SE_19_PROF/arquivos/MATRIZ_494_PREFSCSE006.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/pref_sao_cristovao_se_19_prof/arquivos/GAB_DEFINITIVO_MATRIZ_494_PREFSCSE006_PAG_3.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(raw.length,71)
const answers='50:E|51:C|52:E|53:C|54:C|55:E|56:E|57:C|58:E|59:C|60:E|61:C|62:E|63:C|64:E|65:E|66:C|67:C|68:E|69:C|70:C|71:E|72:C|73:E|74:C|75:E|76:C|77:C|78:C|79:X|80:E|81:E|82:C|83:E|84:E|85:C|86:E|87:C|88:E|89:C|90:C|91:E|92:C|93:E|94:E|95:C|96:C|97:E|98:E|99:C|100:C|101:C|102:E|103:C|104:C|105:E|106:E|107:E|108:C|109:C|110:E|111:C|112:E|113:E|114:C|115:C|116:C|117:E|118:C|119:C|120:E'
const key=new Map(answers.split('|').map(s=>{const[n,a]=s.split(':');return[+n,a]}))
const groups=[
 [[50,50],'História do Brasil e história regional de Sergipe: patrimônio histórico e memória de São Cristóvão.'],
 [[51,56],'Historiografia, memória, direitos humanos, consciência socioambiental e recursos no ensino de História.'],
 [[57,62],'Pré-história, evolução humana e civilizações da Antiguidade: Egito, Mesopotâmia e Fenícia.'],
 [[63,68],'Antiguidade clássica: civilizações minoica e grega, democracia ateniense, Roma e cristianismo.'],
 [[69,72],'História da África e conexões afro-europeias; comércio transaariano e presença islâmica na Península Ibérica.'],
 [[73,76],'Europa medieval: feudalismo, servidão, economia camponesa, Companhia de Jesus e crises demográficas.'],
 [[77,82],'Baixa Idade Média: comércio, crédito e bancos, relações de propriedade e concepções cosmológicas.'],
 [[83,86],'História da África medieval: costa suaíli, islamização, comunidades coptas e organização política.'],
 [[87,92],'Idade Moderna europeia: mercantilismo, absolutismo, Iluminismo, Revolução Gloriosa e Reforma/Contrarreforma.'],
 [[93,98],'Imperialismo e colonialismo na África e na Ásia; resistências e movimentos de descolonização.'],
 [[99,103],'BNCC e ensino de História: pensamento crítico, consciência histórica e competências da área.'],
 [[104,108],'História do Brasil colonial: povos indígenas, escravização africana, culturas e resistência.'],
 [[109,115],'Independência e Brasil Império: imprensa, Primeiro Reinado, escravidão, revoltas regenciais e abolição.'],
 [[116,120],'Brasil República: conflitos sociais no século XIX, federalismo, eleições de 1950 e redemocratização.']
]
const gruposTexto=[
 [[50,50],'A respeito da cultura sergipana e do município de São Cristóvão, julgue o item.'],
 [[51,56],'Com relação à dinâmica historiográfica e sua influência no ensino da História, julgue os itens.'],
 [[57,62],'Acerca do processo de humanização, da dinâmica da formação das sociedades humanas e de características de civilizações da Antiguidade, julgue os itens.'],
 [[63,68],'A respeito das dinâmicas política, social e cultural das sociedades greco-romanas do mundo antigo, julgue os itens.'],
 [[69,72],'Considerando os contatos entre povos de diferentes continentes e as trocas entre africanos e europeus anteriores aos séculos XV e XVI, julgue os itens.'],
 [[73,76],'Considerando a vida rural europeia entre os séculos V e XV, julgue os itens.'],
 [[77,82],'No que se refere às instituições sociais, econômicas e culturais da Europa medieval, julgue os itens.'],
 [[83,86],'A respeito da história da África entre os séculos V e XV, julgue os itens.'],
 [[87,92],'Com relação às transformações da Europa na Idade Moderna, entre os séculos XV e XVIII, julgue os itens.'],
 [[93,98],'A respeito do colonialismo e da descolonização de territórios africanos e asiáticos, julgue os itens.'],
 [[99,103],'Considerando os objetivos e as competências de História previstos na BNCC para o ensino fundamental, julgue os itens.'],
 [[104,108],'Sobre povos indígenas, escravização, culturas africanas e sociedades coloniais no Brasil, julgue os itens.'],
 [[109,115],'A respeito da independência e da formação política e social do Brasil nos períodos imperial e regencial, julgue os itens.'],
 [[116,120],'A respeito de conflitos sociais, federalismo e movimentos políticos no Brasil dos séculos XIX e XX, julgue os itens.']
]
const get=(arr,n)=>arr.find(([[a,b]])=>n>=a&&n<=b)?.[1]
const decisions=[]
for(const q of raw){
 const n=+q.numero,answer=key.get(n),conteudo=get(groups,n),apoio=get(gruposTexto,n)
 assert.ok(answer&&conteudo&&apoio,`Classificação/gabarito ausente: ${n}`)
 const page=+q.pagina,img=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,annulled=answer==='X'
 let enunciado=q.enunciado.replace(/\s*\|\|Matriz_[^|]+\|\|[\s\S]*$/,'').replace(/\s*CEBRASPE\s*[–-]\s*PREFSCSE\s*[–-]\s*Aplicação:\s*2019[\s\S]*$/,'').replace(/\s*Espaço livre[\s\S]*$/,'').replace(/\s+/g,' ').trim()
 // Item 50 shares the common block; discard the following 2019 history-specific command inadvertently appended by OCR.
 if(n===50) enunciado=enunciado.replace(/\s*Com relação à dinâmica historiográfica[\s\S]*$/,'').trim()
 assert.ok(enunciado.length>20,`Enunciado insuficiente: ${n}`)
 const meta={materia:'História',conteudo,ano:2019,banca:'CEBRASPE',organizadora:'CEBRASPE',concurso:'Prefeitura Municipal de São Cristóvão — Professor de Educação Básica',cargo:'Professor de Educação Básica — História',aplicacao:'24/11/2019',numero_original:n,dificuldade:n<57?'Média':n<99?'Média':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela especificidade historiográfica e pela complexidade do conteúdo; a banca não publicou dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} identificado no caderno oficial CEBRASPE da matriz 006 (História), aplicação em 24/11/2019. Classificação baseada no conteúdo efetivamente cobrado; resposta confrontada com o gabarito definitivo da matriz 006.`,tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,texto_apoio:apoio,gabarito_oficial:{verificada:true,url:gabarito,edicao:'Gabarito definitivo — Matriz 494 PREFSCSE006 (História), aplicação em 24/11/2019',item:n,resposta:annulled?'Anulada':answer,fonte:'CEBRASPE; conferência textual do quadro definitivo por matriz'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']}
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),...meta,enunciado,pagina:page,visual:{pagina:page,imagem:img,motivo:'Página correspondente do caderno oficial preservada para consulta do contexto integral e conferência visual.'},apta_resolucao:!annulled,correcao_automatica:!annulled})
}
assert.equal(decisions.length,71)
assert.deepEqual(decisions.filter(x=>x.anulada).map(x=>x.numero_original),[79])
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabarito,concurso:'Prefeitura Municipal de São Cristóvão — Professor de Educação Básica — História',aplicacao:'24/11/2019',nota:'71 itens pendentes classificados e vinculados à matriz oficial 006. Item 79 anulado. Item 50 pertence à parte comum do caderno e foi mantido como História regional; itens 51–120 são da prova específica de História. Caderno original e imagem de cada página mantidos.'},null,2))
console.log(JSON.stringify({...result,documento:doc,registros_revisados:71,anuladas:1,prova_oficial:prova,gabarito:gabarito}))
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)

