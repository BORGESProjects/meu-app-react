import fs from 'node:fs/promises'
import {hashRevisao, aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-enem-2024-libras-caderno10-item10-v360'
const doc='ecf0c023091e9a7e'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_impresso_D1_CD10_superampliada.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D1_CD10.pdf'
const id='extr-053072b359e3a9b815e8'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
const q=records.find(x=>x.id===id)
if(!q)throw Error('Registro pendente não encontrado')
const apoio='O Brasil somou cerca de 60 mil novos casos de câncer de mama até o final de 2019, número que corresponde a 25% de todos os diagnósticos da condição registrados no país, segundo dados do Instituto Nacional do Câncer (Inca). Apesar de o Outubro Rosa ser o mês de conscientização sobre a questão voltada para as mulheres, é muito importante lembrar que um dos grandes mitos da medicina é o de que o câncer de mama não afeta o sexo masculino.\n\nFatores importantes para detectar o câncer de mama masculino:\n1. Genética: se houver casos na família, as chances são um pouco mais elevadas.\n2. Hormônios: homens podem desenvolver tecido real das glândulas mamárias por tomarem certos medicamentos ou apresentarem níveis hormonais anormais.\n3. Caroços: é necessário que os médicos se atentem a alguns sintomas suspeitos, como um caroço na área do tórax.\n4. Retração na pele: em situações mais graves do câncer de mama masculino, é possível também ocorrer uma retração do mamilo.\n\nDisponível em: https://pebmed.com.br. Acesso em: 24 nov. 2021 (adaptado).'
const enunciado='As informações dessa reportagem auxiliam no combate ao câncer de mama masculino por apresentarem um alerta sobre o(s)'
const opcoes=['sinais indicadores da doença.','índice de crescimento de casos.','exames para diagnóstico do tumor.','mitos a respeito da herança genética.','período de campanhas de conscientização.']
const decisao={
 id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Língua Portuguesa',conteudo:'Compreensão e interpretação de texto: finalidade e informação explícita',
 ano:2024,concurso:'ENEM 2024 — 1º dia, Caderno 10 Roxo (Libras), superampliada',banca:'INEP',organizadora:'INEP',
 aplicacao:'ENEM 2024 — 1º dia — Caderno 10 Roxo — aplicação regular',numero_original:10,numero:10,pagina:17,
 dificuldade:'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Localização de informação explícita e identificação da finalidade de um texto informativo.',
 classificacao_fonte:prova,motivo:'Página 17 do caderno oficial identifica o item como questão 10; transcrição visual do texto-base completo, comando e alternativas. O registro anterior estava numerado como 4 e classificado como Espanhol. Gabarito A confirmado no documento oficial do Inep.',
 enunciado,opcoes,texto_apoio:apoio,resposta_correta:0,anulada:false,apta_resolucao:true,
 gabarito_oficial:{fonte:gabarito,arquivo:'2024_GB_impresso_D1_CD10.pdf',prova:'2024_PV_impresso_D1_CD10_superampliada.pdf',numero:10,pagina:1,resposta:'A',criterio:'Gabarito oficial do Inep para o Caderno 10 Roxo, item 10.'},
 visual:{pagina:17,imagem:`paginas/${doc}-0017.webp`,enunciado,texto_apoio:apoio,motivo:'Conferência visual da questão 10 na página oficial; texto-base restaurado integralmente, alternativa E limpa do rodapé OCR e número corrigido.'}
}
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({id,numeroAnterior:q.numero,numeroCorrigido:10,pagina:17,materia:decisao.materia,opcoes:opcoes.length,resposta:'A',publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:[decisao]})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,id,edicao:'ENEM 2024 — 1º dia, Caderno 10 Roxo (Libras), superampliada',numeroAnterior:q.numero,numeroCorrigido:10,pagina:17,resposta:'A',publicado:false,prova,gabarito,nota:'A página 17 mostra a questão 10. Corrigidas a numeração e a matéria, restaurado o texto-base completo, limpas as alternativas e conferido o gabarito oficial.'}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## INEP/ENEM 2024 — 1º dia, Caderno 10 Roxo (Libras), questão 10 — revisão v360\n\n- Corrigida a numeração 4 para 10 e a classificação incorreta de Espanhol para Língua Portuguesa.\n- Restaurado o texto-base sobre câncer de mama masculino e retirado o rodapé OCR da alternativa E.\n- Conferido o gabarito A no documento oficial do Inep. Publicação em nuvem não realizada.\n- Fontes: [caderno oficial](${prova}) e [gabarito oficial](${gabarito}).\n`)
console.log(JSON.stringify(report,null,2))
