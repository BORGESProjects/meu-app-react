import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const audit=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-semantica-v4-alteracoes.json.gz')))
const q=audit.find(x=>x.id==='extr-3637dc3f8b2734eac70f').depois
await aplicarRevisoesIndividuais({nome:'revisao-semantica-v5',base:'tmp/revisao-profissional/revisao-semantica-v4/acervo-extraido',decisoes:[{
 id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:q.materia,conteudo:q.conteudo,
 motivo:'Integração e edição colaborativa no Microsoft Teams, confirmada também na interface publicada.',
 visual:{pagina:4,imagem:'paginas/2f89bd2efbbe4c8e-0004.webp',texto_apoio:'Acerca do Windows 10 e de programas e aplicações do Microsoft Office 365, julgue os próximos itens.',motivo:'Conferência em produção identificou apoio com itens 153 a 167; página original confirma que o item 168 pertence ao comando de Office. Removidas apenas as questões vizinhas do apoio.'}
}]})
