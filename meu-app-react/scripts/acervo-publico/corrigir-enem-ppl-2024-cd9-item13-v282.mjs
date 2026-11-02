import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const documento='662232e925825462'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_reaplicacao_PPL_D1_CD9_braile_e_ledor.pdf'
const qs=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`,'utf8'))
const q=qs.find(x=>x.id==='extr-2dc84f6802d5deabbd88')
if(!q)throw Error('Questão 13 não localizada na extração de referência')
const pagina=Number(q.pagina)
const decisoes=[{id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Língua Portuguesa',conteudo:'Contato linguístico em região de fronteira: variação lexical e formação do portunhol',ano:2024,numero_original:13,pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial conforme a interpretação de fenômeno sociolinguístico e evidências do texto.',classificacao_fonte:prova,motivo:'O texto descreve comunidades de fronteira e identifica “camiáu” como forma resultante do contato entre português e espanhol.',visual:{pagina,imagem:`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página do caderno oficial conferida; texto-base e item preservados.'}}]
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome:'correcao-enem-ppl-2024-cd9-item13-v282',base:'tmp/revisao-profissional/revisao-enem-reaplicacao-ppl-2024-d1-cd9-v281/acervo-extraido',decisoes})
console.log(JSON.stringify({...resultado,documento_id:documento,item_corrigido:13,publicado:false}))
