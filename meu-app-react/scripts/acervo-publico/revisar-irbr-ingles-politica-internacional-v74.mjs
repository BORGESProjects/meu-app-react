import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-irbr-ingles-politica-internacional-v74'
const base='tmp/revisao-profissional/revisao-alprev-servico-social-v73/acervo-extraido'
const doc='49696f87fdaaa9c1'
const prova='https://cdn.cebraspe.org.br/concursos/irbr_26_diplomacia/arquivos/A74A4FFC747ECD4287A7D9745DEE6B9364AFA6CF3470FDA6C33FBC2DC689B590.pdf'
const gabarito='https://security.cebraspe.org.br/IRBR_26_DIPLOMACIA/Recursos/Objetiva/GabaritoPreliminar_0535639C-CF6D-4402/'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-ingles-cebraspe-2026.json','utf8'))
const englishRanges={
  121:['Língua Inglesa','Interpretação de texto: diplomacia cibernética e segurança internacional'],
  124:['Língua Inglesa','Interpretação de texto: direitos humanos e discriminação contra pessoas LGBT e intersexo'],
  131:['Língua Inglesa','Interpretação e gramática: cultura, sociedade e uso de conectivos'],
  141:['Língua Inglesa','Interpretação de texto: tradução e comunicação diplomática'],
  146:['Língua Inglesa','Interpretação, vocabulário e sintaxe: filosofia africana e colonialismo'],
}
const political={
  151:['Política Internacional','Teorias das relações internacionais: realismo ofensivo, segurança e hegemonia'],
  152:['Política Internacional','Governança digital: direitos humanos, integridade da informação e inteligência artificial'],
  153:['Política Internacional','Imperialismo: Lênin, exportação de capitais e desenvolvimento desigual'],
  154:['Política Internacional','Teoria crítica: hegemonia, consenso e coerção em Robert Cox'],
  155:['Política Internacional','Governança global: iniciativa chinesa e sistema das Nações Unidas'],
  156:['Política Internacional','China: Iniciativa da Civilização Global e Agenda 2030'],
  157:['Política Internacional','Organizações regionais: Organização para a Cooperação de Xangai'],
  158:['Política Internacional','Política externa dos Estados Unidos: Doutrina Monroe e hemisfério ocidental'],
  159:['Economia Internacional','Comércio exterior dos Estados Unidos: Seção 232 e efeitos no Brasil'],
  160:['Economia Internacional','Política comercial dos Estados Unidos: tarifas e poderes de emergência'],
  161:['Economia Internacional','Comércio internacional: tarifas recíprocas e princípio da nação mais favorecida'],
  162:['Economia Internacional','Acordo MERCOSUL–União Europeia: salvaguardas agrícolas'],
  163:['Economia Internacional','Acordo MERCOSUL–União Europeia: acordo provisório e tramitação'],
  164:['Economia Internacional','Acordo MERCOSUL–União Europeia: liberalização e estrutura comercial'],
  165:['História Mundial','Memória da Segunda Guerra Mundial: Santuário Yasukuni e diplomacia asiática'],
  166:['Política Internacional','Organizações internacionais: proposta de Conselho da Paz e sistema ONU'],
  167:['Política Internacional','Política externa brasileira: ZOPACAS e Zona de Paz da América Latina e Caribe'],
  168:['Direito Internacional Público','Uso da força, soberania e integridade territorial'],
  169:['Política Internacional','Oriente Médio: Israel, UNRWA e assistência a refugiados palestinos'],
  170:['Política Internacional','Cuba: embargo, sanções unilaterais e política externa brasileira'],
  171:['Política Internacional','Desarmamento nuclear: tratado New START e controle de armamentos'],
  172:['Direito Internacional Público','Desarmamento nuclear: Tratado de Tlatelolco'],
  173:['Política Internacional','ZOPACAS e zonas livres de armas nucleares no Atlântico Sul'],
  174:['Direito Internacional Público','Desarmamento nuclear: Tratado sobre a Proibição de Armas Nucleares'],
  175:['Direito Internacional Público','Cibercrime: convenção das Nações Unidas sobre crimes com TIC'],
  176:['Política Internacional','Governança e segurança internacional: proposta de Conselho da Paz'],
  177:['Política Internacional','Governança global da inteligência artificial'],
  178:['Política Internacional','América Latina e Caribe: Zona de Paz, não intervenção e solução pacífica'],
  179:['Direitos Humanos','Combate ao racismo: Declaração e Plano de Ação de Durban'],
  180:['Direitos Humanos','Década Internacional de Afrodescendentes e agenda da ONU'],
  181:['Política Internacional','Diplomacia climática: COP30 e racismo ambiental'],
  182:['Política Internacional','Povos indígenas e cooperação amazônica: OTCA e MAPI'],
  183:['Política Internacional','Nações Unidas: candidatura ao cargo de secretário-geral'],
  184:['Política Internacional','Diplomacia climática: multilateralismo e COP30'],
  185:['Política Internacional','Reforma da ONU: Iniciativa UN80'],
  186:['Direito Internacional Público','Carta das Nações Unidas: propósitos e competências do ECOSOC'],
  187:['Economia Internacional','Integração regional: MERCOSUL e ALADI'],
  188:['Economia Internacional','Organização Mundial do Comércio: solução de controvérsias'],
  189:['Economia Internacional','Comércio multilateral: posição brasileira e medidas unilaterais'],
  190:['Economia Internacional','Integração comercial: acordos extrarregionais do MERCOSUL'],
}
const contexts=[
  [121,123,'Texto-base em inglês sobre a centralidade crescente de temas cibernéticos nas relações internacionais, segurança, governança da internet e diplomacia. A página original com o texto integral está vinculada.'],
  [124,130,'Texto-base em inglês do Alto Comissariado das Nações Unidas para os Direitos Humanos sobre violência e discriminação contra pessoas LGBT e intersexo, respostas jurídicas e lacunas de implementação. A página original com o texto integral está vinculada.'],
  [131,134,'Texto-base em inglês de Raymond Williams, “Culture is Ordinary”, sobre cultura, sociedade, aprendizagem e significados comuns. A página original com o texto integral está vinculada.'],
  [141,145,'Texto-base em inglês sobre um episódio de tradução durante visita diplomática do presidente Jimmy Carter à Polônia em 1977. A página original com o texto integral está vinculada.'],
  [146,150,'Texto-base em inglês sobre filosofia africana, colonialismo, racionalidade e o conceito de Ubuntu. A página original com o texto integral está vinculada.'],
]
const clean={
  124:'In “issue characteristics” (second sentence of the first paragraph), the word “issue” can be correctly replaced with “key” without altering the meaning of this expression.'
}
const difficultEnglish=new Set([121,123,127,128,130,134,142,143,145,146,147,149,150])
const difficultPolitical=new Set([151,153,154,155,158,159,160,161,162,163,164,168,171,172,174,175,179,181,184,186,188,189,190])
const decisions=[]
for(const q of qs){
 const n=Number(q.n),t=n<=150?englishRanges[Object.keys(englishRanges).map(Number).filter(x=>x<=n).sort((a,b)=>b-a)[0]]:political[n]
 if(!t)throw Error('Sem classificação para '+n)
 const pg=Number(q.pagina),imagem=`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const context=contexts.find(([a,b])=>n>=a&&n<=b)?.[2]
 const diff=(n<=150?difficultEnglish:difficultPolitical).has(n)?'Difícil':'Média'
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2026,pagina:pg,dificuldade:diff,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade linguística, conceitual e pela quantidade de inferências exigidas; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`IRBr/CACD 2026 — prova objetiva CEBRASPE, questão ${n}; a matéria foi conferida no título e no bloco temático impresso no caderno oficial.`,imagem_pagina:imagem,texto_apoio:context}
 if(clean[n])d.enunciado=clean[n]
 decisions.push(d)
}
if(decisions.length!==64)throw Error(`Esperadas 64 questões, encontrei ${decisions.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'IRBr/CACD 2026 — prova objetiva — Língua Inglesa e Política Internacional',documento_id:doc,registros_revisados:64,questoes_unicas_classificadas:64,ingles:24,politica_internacional_e_areas_correlatas:40,gabaritos_oficiais_transcritos:0,gabarito_pendente:true,observacao:'O lote estava classificado como Inglês de forma homogênea. Reclassifiquei os itens 121–150 como Língua Inglesa e os itens 151–190 conforme os cabeçalhos Política Internacional e Economia, além de História Mundial, Direito Internacional Público e Direitos Humanos quando o conteúdo corresponde a essas áreas. A consulta oficial do gabarito é individual; não atribuí respostas por inferência nem habilitei correção automática.',fontes:[prova,'https://www.cebraspe.org.br/concursos/irbr_26_diplomacia','https://security.cebraspe.org.br/IRBR_26_DIPLOMACIA/Recursos/Objetiva/GabaritoPreliminar_0535639C-CF6D-4402/']}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
