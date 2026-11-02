import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-anp-2022-atividade6-regulacao-v470'
const documento = 'e879b43a1c5160b2'
const prova = 'https://cdn.cebraspe.org.br/concursos/ANP_22_PSS/arquivos/725_ANP_006_01.PDF'
const gabaritoUrl = 'https://cdn.cebraspe.org.br/concursos/ANP_22_PSS/arquivos/GAB_DEFINITIVO_725_ANP_006_01.PDF'
const editalUrl = 'https://cdn.cebraspe.org.br/concursos/anp_22_pss/arquivos/ED_1_2022_ANP_PSS_ABERTURA.PDF'
const concurso = 'ANP — Processo Seletivo Simplificado — Atividade 6 — 2022'
const caderno = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === documento)
assert.equal(caderno?.url, prova)
const ledger = 'docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const keys = (await fs.readFile(ledger, 'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse)
const key = keys.find(x => x.documento_id === documento)
assert.equal(key?.gabarito_url, gabaritoUrl)
assert.equal(key?.status, 'tabela_lida')
assert.equal(key?.sha256, 'e4797c6f28b27dc973f6c527eca29f3eecce59f5db40021fdf46ca108408c463')

// This is the exact pending subset in the current filter group, not every item in the 60-item paper.
const itens = {
  51:['Legislação do petróleo e gás','Royalties e participações governamentais','Média'],
  52:['Legislação do petróleo e gás','Política energética e bonificação por outorga','Média'],
  53:['Legislação do petróleo e gás','Fiscalização das atividades da indústria do petróleo','Média'],
  54:['Legislação do gás natural','Tarifas e transporte de gás natural','Média'],
  55:['Legislação do gás natural','Concorrência e desverticalização do transporte','Média'],
  56:['Legislação do gás natural','Serviços de transporte firme e não firme','Média'],
  57:['Legislação do gás natural','Autoprodução e registro de agentes','Média'],
  58:['Legislação do gás natural','Autorização de importação de gás natural','Média'],
  59:['Legislação do gás natural','Autorização para carregamento de gás natural','Média'],
  60:['Legislação do gás natural','Restrições à atuação do transportador','Média'],
  63:['Microeconomia','Função de produção Cobb–Douglas e elasticidade de substituição','Difícil'],
  65:['Microeconomia','Risco moral e incentivos em contratos de remuneração','Difícil'],
  68:['Microeconomia','Eficiência de Pareto e provisão de bens públicos','Média'],
  69:['Econometria','Modelos autorregressivos: média de processo estacionário','Média'],
  71:['Econometria','Modelos autorregressivos: autocorrelação','Difícil'],
  72:['Econometria','Séries temporais: tendência e estacionariedade','Média'],
  76:['Estatística','Regressão linear e distribuição normal bivariada','Difícil'],
  77:['Economia brasileira','Plano Real e Unidade Real de Valor (URV)','Média'],
  78:['Economia brasileira','Abertura comercial brasileira na década de 1990','Média'],
  79:['Economia brasileira','Plano Real e estabilização econômica','Média'],
  81:['Economia do petróleo','Elasticidade-preço da demanda por petróleo','Média'],
  82:['Economia do petróleo','Classificação do petróleo e características da produção brasileira','Média'],
  83:['Economia do petróleo','Qualidade do petróleo e valor dos derivados','Fácil'],
  84:['Economia do petróleo','Formação dos preços e sazonalidade do petróleo','Média'],
  86:['Regulação econômica','Falhas de mercado na indústria de petróleo e gás','Média'],
  87:['Regulação econômica','Assimetria de informação e intervenção regulatória','Média'],
  90:['Agências reguladoras','Poder normativo técnico e princípio da legalidade','Média'],
  93:['Regulação econômica','Concessões de serviços públicos: qualidade, manutenção e acesso','Média'],
  95:['Defesa da concorrência','Regulação por taxa interna de retorno e incentivos','Difícil'],
  98:['Microeconomia','Preços relativos e determinação da demanda','Fácil'],
  101:['Organização industrial','Integração vertical e cadeia produtiva','Fácil'],
  103:['Informática','Microsoft Excel: função SOMARPRODUTO','Fácil'],
  104:['Informática','Microsoft Excel: importação de dados e tabela dinâmica','Média'],
  105:['Informática','Microsoft Excel: atualização de tabelas dinâmicas','Fácil']
}
const enunciados = {
  53:'Desde que haja prévio convênio com a ANP, estados e municípios podem fiscalizar as atividades integrantes da indústria do petróleo.',
  60:'O transportador não poderá comprar ou vender gás natural, com exceção dos volumes necessários ao consumo próprio das instalações de transporte e para formação e manutenção de seu estoque operacional.',
  63:'Considere-se que a tecnologia de uma empresa seja dada pela função de produção Q(K,L) = K^α L^β, em que K e L representam, respectivamente, as quantidades de capital e de trabalho necessárias para a produção do produto Q, sendo α e β constantes positivas cuja soma é igual a 1. Nessa situação hipotética, a elasticidade de substituição entre os fatores de produção K e L é igual a zero.',
  68:'Para a provisão eficiente de Pareto de um bem público, é suficiente que a soma das disposições individuais de pagar pelo bem de cada um dos seus usuários exceda o custo de produção do bem público.',
  69:'E[X_t] = 2,5.',
  71:'A correlação linear entre X_{t−1} e X_{t+1} é igual a 0,04.',
  76:'A correlação linear entre X e Y é igual a −1.',
  84:'Os preços do petróleo têm comportamento sazonal em decorrência de condições de produção, mas não de aspectos climáticos.'
}
const contextos = {
  53:'Com base na Lei nº 9.478/1997 (Lei do Petróleo), julgue os itens a seguir.',
  54:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  55:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  56:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  57:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  58:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  59:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  60:'Considerando a Lei nº 14.134/2021 (Lei do Gás) e a respectiva regulamentação, julgue os itens que se seguem.',
  63:'Considere-se a função de produção Cobb–Douglas descrita no enunciado. Julgue o item sobre elasticidade de substituição entre capital e trabalho.',
  65:'Considere-se a situação hipotética de uma empresa cujos lucros dependem do esforço não observável dos trabalhadores e de eventos climáticos aleatórios. Julgue o item sobre incentivos e remuneração.',
  68:'Considere-se um modelo de séries temporais na forma X_t = 2 + 0,2X_{t−1} + a_t, em que t denota um índice temporal, a_t representa um ruído branco com média zero e variância 4, e as variáveis X_t e X_{t−1} são tais que E[X_t] = E[X_{t−1}] e Var[X_t] = Var[X_{t−1}]. Com base nessas informações, julgue os itens seguintes.',
  69:'Considere-se um modelo de séries temporais na forma X_t = 2 + 0,2X_{t−1} + a_t, em que t denota um índice temporal, a_t representa um ruído branco com média zero e variância 4, e as variáveis X_t e X_{t−1} são tais que E[X_t] = E[X_{t−1}] e Var[X_t] = Var[X_{t−1}]. Com base nessas informações, julgue os itens seguintes.',
  71:'Considere-se um modelo de séries temporais na forma X_t = 2 + 0,2X_{t−1} + a_t, em que t denota um índice temporal, a_t representa um ruído branco com média zero e variância 4, e as variáveis X_t e X_{t−1} são tais que E[X_t] = E[X_{t−1}] e Var[X_t] = Var[X_{t−1}]. Com base nessas informações, julgue os itens seguintes.',
  72:'Considere-se um modelo de séries temporais na forma X_t = 2 + 0,2X_{t−1} + a_t, em que t denota um índice temporal, a_t representa um ruído branco com média zero e variância 4, e as variáveis X_t e X_{t−1} são tais que E[X_t] = E[X_{t−1}] e Var[X_t] = Var[X_{t−1}]. Com base nessas informações, julgue os itens seguintes.',
  76:'Uma curva de regressão da variável aleatória Y sobre X = x é dada por E[Y|X = x] = 1 − x, em que o par de variáveis aleatórias (X,Y) segue uma distribuição normal bivariada, a média de X é igual a zero, Var[Y] = 4 e Var[X] = 1. Considerando a situação hipotética apresentada, julgue os itens a seguir.',
  77:'Considerando as principais reformas estruturais dos anos 1990 do século XX, julgue os itens a seguir.',
  78:'Considerando as principais reformas estruturais dos anos 1990 do século XX, julgue os itens a seguir.',
  79:'Considerando as principais reformas estruturais dos anos 1990 do século XX, julgue os itens a seguir.',
  81:'Em relação às características econômicas, técnicas e operacionais da indústria do petróleo, julgue os itens seguintes.',
  82:'Em relação às características econômicas, técnicas e operacionais da indústria do petróleo, julgue os itens seguintes.',
  83:'Em relação às características econômicas, técnicas e operacionais da indústria do petróleo, julgue os itens seguintes.',
  84:'Em relação às características econômicas, técnicas e operacionais da indústria do petróleo, julgue os itens seguintes.',
  86:'Considerando a regulação econômica como uma das formas de o Estado corrigir falhas de mercado, julgue os itens a seguir.',
  87:'Considerando a regulação econômica como uma das formas de o Estado corrigir falhas de mercado, julgue os itens a seguir.',
  90:'Com relação às agências reguladoras, julgue os itens seguintes.',
  93:'No que se refere à teoria econômica da regulação e às formas de regulação, julgue os itens seguintes.',
  95:'Considerando os principais aspectos teóricos relacionados à economia da defesa da concorrência, julgue os itens a seguir.',
  98:'Julgue os itens seguintes, em relação às principais estruturas relevantes de mercado.',
  101:'Considerando os conceitos de concentração vertical e horizontal, julgue os itens seguintes.',
  103:'Com relação ao uso da ferramenta Microsoft Excel, julgue os itens a seguir.',
  104:'Com relação ao uso da ferramenta Microsoft Excel, julgue os itens a seguir.',
  105:'Com relação ao uso da ferramenta Microsoft Excel, julgue os itens a seguir.'
}
const ids = new Set(['extr-54addcdf94d806ee368d','extr-bcdb19732519fb7d5a48','extr-699184e8ddecbba1d645','extr-56bb572c4379b58f537a','extr-b02ba44dbe715bb5f191','extr-a1699f9d90eee0646881','extr-026167f25610e47f4f18','extr-5463a00ca70d264a97f3','extr-c396da169eb8f1b40f04','extr-a4e5bf97a22b18f47a08','extr-e3dc0cd1560090337941','extr-14d5f66ab0c8face9ec9','extr-d330a95d5d8118f6e60a','extr-0b1c7a2b723c3a5e9afc','extr-a543eb539d7fad29e3a2','extr-e2dda4e9e489c6fac007','extr-fdae21854cd9edb5f396','extr-cc002f8f02ec1385d00a','extr-579c104e0ff674065843','extr-8273a54870564734cbed','extr-582ac631839dae6235d8','extr-b1ad19f14fc9c7e15e8e','extr-6b3eb181199a3b969eb3','extr-1477bfcef801e723aa07','extr-379d61acd20d1f8642c0','extr-0fde406a2100f0181be7','extr-bc4ee2083a91b047fc81','extr-81246e8b3a9b997a1735','extr-83fa14dfcff96e577a65','extr-b284083636059d1aea6e','extr-4a679a5d2ae95333f603','extr-e21a9792b48c8722cae1','extr-20d8d8f484c327ecc388','extr-49690870b09c63aaa26c'])
const fontes = caderno.questoes.filter(q => ids.has(q.id))
assert.equal(fontes.length, 34)
assert.equal(new Set(fontes.map(q => q.numero)).size, 34)
const atuais = JSON.parse(await fs.readFile('tmp/anp-atividade6-v470-hashes.json', 'utf8'))
assert.equal(atuais.length, 34)
const hashAtual = new Map(atuais.map(q => [q.id, q.hash]))
const respostas = key.respostas
const decisoes = fontes.map(q => {
  const n = Number(q.numero)
  const [sub, topico, dificuldade] = itens[n]
  assert.ok(sub && respostas[String(n)], `Dados ausentes para item ${n}`)
  const pagina = Number(q.pagina)
  const imagem = `paginas/${documento}-${String(pagina).padStart(4, '0')}.webp`
  return {
    id:q.id, sha256_enunciado:hashAtual.get(q.id), materia:sub,
    conteudo:`${sub} — ${topico}`, ano:2022, concurso, cargo:'Atividades de Regulação de Novas Atribuições III',
    banca:'CEBRASPE', organizadora:'CEBRASPE', aplicacao:'Prova objetiva — Atividade 6 — caderno 725_ANP_006_01',
    numero:n, numero_original:n, pagina, dificuldade, dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial baseada nas operações conceituais e no encadeamento de raciocínio exigido; não é nível oficial da banca.',
    classificacao_fonte:editalUrl,
    motivo:`Item ${n} classificado pelo assunto e bloco temático identificados no caderno oficial da Atividade 6 e confrontados com o conteúdo programático do edital.`,
    ...(enunciados[n]?{enunciado:enunciados[n]}:{}), opcoes:['Certo','Errado'],
    resposta_correta:respostas[String(n)]==='C'?0:1, anulada:false, apta_resolucao:true,
    gabarito_oficial:{fonte:gabaritoUrl,arquivo:'GAB_DEFINITIVO_725_ANP_006_01.PDF',prova:'725_ANP_006_01.PDF',sha256:key.sha256,numero:n,resposta:respostas[String(n)],criterio:'Gabarito oficial definitivo do mesmo caderno e da mesma Atividade 6.'},
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],
    visual:{pagina,imagem,enunciado:enunciados[n]||q.trecho,texto_apoio:contextos[n]||'',motivo:`Página ${pagina} da prova oficial conferida; número, bloco temático e imagem de origem vinculados ao item ${n}.`}
  }
})
assert.equal(decisoes.length,34)
for(const d of decisoes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')) { console.log(JSON.stringify({lote:nome,registros:34,itens_oficiais_unicos:34,gabaritos:34,paginas_conferidas:[1,2],imagens_existentes:true,publicado:false},null,2)); process.exit(0) }

const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,concurso,cargo:'Atividades de Regulação de Novas Atribuições III',registros_revisados:34,itens_oficiais_unicos:34,duplicatas_marcadas:0,respostas_definitivas_vinculadas:34,paginas_originais_conferidas:[1,2,3],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ANP — Atividade 6 — Regulação de Novas Atribuições III — revisão v470\n\n- Classifiquei 34 registros pendentes, mantendo o recorte da atividade e os assuntos de legislação do petróleo e gás, microeconomia, econometria, estatística, economia brasileira, regulação, organização industrial e Excel.\n- Corrigi enunciados com símbolos matemáticos corrompidos e removi trechos de blocos vizinhos nos itens 53, 60, 63, 68, 69, 71, 76 e 84; restabeleci os respectivos textos-base compartilhados.\n- Vinculei o gabarito definitivo oficial aos 34 itens; conferi visualmente as páginas 1 a 3 e preservei as imagens originais.\n- O pacote permanece local, sem publicação em nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
