import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { raizesAtuais, lerArquivoAtual } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='reparacao-classificacao-fub-ti-item84-v267',doc='32355c159a9feefa',base=raizesAtuais[0]
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_013_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_013_01.pdf'
const m=JSON.parse(await lerArquivoAtual('manifesto.json'));let q
for(const l of m.lotes.filter(x=>x.arquivo.includes('correcao-gabarito-fub-ti-item84-v266'))){for(const v of JSON.parse(zlib.gunzipSync(await lerArquivoAtual(l.arquivo))))if(v.id==='extr-e1f9c63509594eea59d6')q=v}
if(!q)throw Error('Item 84 não localizado')
const answers='51:C|52:E|78:C|79:C|80:E|81:C|82:C|83:E|84:E|85:C|86:C|87:E|88:C|90:C|92:C|110:C|111:E|113:C|114:E|115:C'
const keyHash=createHash('sha256').update(answers).digest('hex')
const decision={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Estruturas de Dados',conteudo:'Pilha: operações LIFO e extremidade de acesso',ano:2016,concurso:'FUB 2016 — Cargo 13, Técnico de Tecnologia da Informação (aplicação em 18/12/2016)',numero_original:84,pagina:2,dificuldade:'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na compreensão da regra LIFO e das extremidades de operação.',classificacao_fonte:prova,motivo:'CEBRASPE — FUB 2016, Cargo 13, item 84. Classificação temática cotejada com o caderno; gabarito corrigido conforme a chave definitiva.',enunciado:'Nas estruturas de pilhas, a inserção de um novo item ou a remoção de um item já existente ocorre tanto na extremidade de baixo quanto no topo da pilha.',texto_apoio:'Estruturas de pilhas, filas e árvores binárias são amplamente utilizadas para a construção de algoritmos e programas de computador. Acerca dessas estruturas, julgue o item.',opcoes:['Certo','Errado'],resposta_correta:1,anulada:false,gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_281FUB_013_01.pdf',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_20_itens_revisados; nao_e_hash_do_pdf',numero:84,pagina:1,resposta:'E',criterio:'Gabarito oficial definitivo do Cargo 13 — Técnico de Tecnologia da Informação.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],visual:{pagina:2,imagem:`paginas/${doc}-0002.webp`,motivo:'Página 2 do caderno oficial vinculada e conferida visualmente.'}}
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:[decision]})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n### Retificação final FUB 2016 — item 84 — v267\n\n- Completei matéria e conteúdo específicos do item 84 e mantive o gabarito oficial “Errado”, página de prova e imagem vinculadas.\n- Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno](<${prova}>), [gabarito](<${chave}>).\n`)
console.log(JSON.stringify({...report,item:84,publicacao:'local'},null,2))
