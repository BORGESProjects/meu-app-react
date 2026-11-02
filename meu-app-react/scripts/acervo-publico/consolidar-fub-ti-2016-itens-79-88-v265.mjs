import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='32355c159a9feefa',nome='consolidacao-fub-ti-2016-itens-79-88-v265'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_013_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_013_01.pdf'
const base=raizesAtuais[0],root=path.join(base)
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifesto.json'),'utf8'))
const wanted=new Map([[79,'extr-2a8ba3c0f27b3b94be0c'],[80,'extr-fca9a7bc4bea9ad994ad'],[82,'extr-12c809dbcbbf851d4a0d'],[86,'extr-b656c6b85f8e5b851851'],[87,'extr-88ca87645974ae6d00e4'],[88,'extr-69c7110ba0b6db322915']])
const current=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo.includes('correcao-gabarito-fub-ti-2016-v264'))){const qs=JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(root,lot.arquivo))));for(const q of qs)if(wanted.get(q.numero_original)===q.id)current.set(q.numero_original,q)}
if(current.size!==6)throw Error(`Esperava 6 itens do lote retificado, encontrei ${current.size}`)
const map={
  79:['C','Arquitetura de Computadores','GPU e processamento paralelo de tarefas gráficas','Fácil','Uma GPU reduz o uso do processador principal do computador relacionado às tarefas de geração e processamento de imagens.','Com relação a placas de vídeo modernas, julgue o item acerca de GPU (graphics processing unit).',2],
  80:['E','Hardware e Periféricos','Comunicação serial assíncrona: formato 8/N/1, paridade e bit de parada','Média','A notação 8/N/1 em portas seriais determina que sejam transmitidos oito bites de dados, com paridade ímpar e um bite de CRC.','Com relação às principais diferenças entre portas paralelas e seriais, assim como ao seu uso, julgue o item.',2],
  82:['C','Redes de Computadores','Interface serial RS-232: equipamentos DTE e DCE','Média','Dispositivos RS-232 normalmente são classificados em DTE e DCE, o que permite definir quais fios em portas seriais irão enviar sinais de dados.','Com relação às principais diferenças entre portas paralelas e seriais, assim como ao seu uso, julgue o item.',2],
  86:['C','Redes de Computadores','DNS: servidores raiz, delegação e resolução de nomes','Difícil','Caso precise ser consultado em uma requisição DNS, um root server deverá indicar corretamente o servidor responsável por determinado domínio e seu endereço IP.','Julgue o item relativo ao DNS (domain name system), amplamente utilizado na Internet para resolução de nomes.',2],
  87:['E','Redes de Computadores','DNS e protocolos de resolução de nomes','Fácil','Sendo um sistema de nome centralizado e hierárquico, o DNS faz uso do protocolo WWW para resolver um nome em um endereço IP.','Julgue o item relativo ao DNS (domain name system), amplamente utilizado na Internet para resolução de nomes.',2],
  88:['C','Redes de Computadores','DNS: registro do tipo A e associação de nome a endereço IPv4','Fácil','Registro DNS do tipo A (address) indica o endereço IP atribuído a determinado nome.','Julgue o item relativo ao DNS (domain name system), amplamente utilizado na Internet para resolução de nomes.',2],
}
const answersText='51:C|52:E|78:C|79:C|80:E|81:C|82:C|83:E|84:E|85:C|86:C|87:E|88:C|90:C|92:C|110:C|111:E|113:C|114:E|115:C'
const keyHash=createHash('sha256').update(answersText).digest('hex')
const decisoes=[...wanted].map(([n,id])=>{
  const q=current.get(n),[answer,materia,conteudo,dificuldade,enunciado,texto_apoio,pagina]=map[n]
  const imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
  return {id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2016,concurso:'FUB 2016 — Cargo 13, Técnico de Tecnologia da Informação (aplicação em 18/12/2016)',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual; não é classificação oficial da banca.',classificacao_fonte:prova,motivo:`CEBRASPE — FUB 2016, Cargo 13, item ${n}; numeração, conteúdo e resposta cotejados com o caderno e o gabarito definitivos.`,enunciado,texto_apoio,opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_281FUB_013_01.pdf',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_20_itens_revisados; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 13 — Técnico de Tecnologia da Informação.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],visual:{pagina,imagem,motivo:`Página ${pagina} do caderno oficial vinculada; conferida para texto, contexto e imagem.`}}
})
for(const d of decisoes)await fs.access(path.join('public/acervo-extraido',d.visual.imagem))
const report=await aplicarRevisoesIndividuais({nome,base,decisoes})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`

### Consolidação FUB 2016 — itens 79, 80, 82, 86, 87 e 88 — v265

- Reapliquei de forma consolidada matéria, conteúdo, ano, dificuldade estimada, gabarito definitivo, texto de apoio e vínculo visual dos seis itens, corrigindo as respostas conforme o documento oficial. O item 82 e o item 88 mantêm os enunciados limpos de trechos de OCR alheios.
- Alteração local, não publicada na nuvem.
- Fontes oficiais: [caderno do Cargo 13](<${prova}>), [gabarito definitivo](<${chave}>).
`)
console.log(JSON.stringify({...report,itens_consolidados:[...wanted.keys()],publicacao:'local'},null,2))
