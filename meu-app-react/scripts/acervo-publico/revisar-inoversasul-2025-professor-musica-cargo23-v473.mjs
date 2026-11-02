import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-inoversasul-2025-professor-musica-cargo23-v473'
const documento = '8695dad1ff7a7a04'
const prova = 'https://cdn.cebraspe.org.br/concursos/INOVERSASUL_24/arquivos/033_INOVERSASUL_023_01.PDF'
const gabaritoUrl = 'https://cdn.cebraspe.org.br/concursos/INOVERSASUL_24/arquivos/GAB_DEFINITIVO_033_INOVERSASUL_023_01.PDF'
const editalUrl = 'https://cdn.cebraspe.org.br/concursos/inoversasul_24/arquivos/Ed_1_Funda%C3%A7%C3%A3o_Inoversa_Sul_24_abertura_atualizado_ate_retificacao_6.pdf'
const concurso = 'Fundação InoversaSul — Concurso Público — 2025'
const cargo = 'Professor de Música — Ensino Fundamental e Médio (Cargo 23)'
const fonteCatalogo = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8'))
const caderno = fonteCatalogo.find(x => x.id === documento)
assert.equal(caderno?.url, prova)
const ledger = (await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl', 'utf8')).split(String.fromCharCode(10)).filter(Boolean).map(JSON.parse)
const key = ledger.find(x => x.documento_id === documento)
assert.equal(key?.gabarito_url, gabaritoUrl)
assert.equal(key?.status, 'tabela_lida')
assert.equal(key?.sha256, 'cecaa6432b76ae49e2596e9ae34eb8b52e3dbf22852b6f17bc921780052329fc')

const atual = JSON.parse(await fs.readFile('tmp/inoversasul-cargo23-v473-pendentes.json', 'utf8'))
assert.equal(atual.length, 34)
const hashes = new Map(atual.map(q => [q.id, q.hash]))
const ids = new Set(hashes.keys())
const fontes = caderno.questoes.filter(q => ids.has(q.id))
assert.equal(fontes.length, 34)
const duplicata = 'extr-051af7f107fdbca2f35c'
const canonica = 'extr-1a671dc9a15ccaa7b626'
assert.ok(ids.has(duplicata) && ids.has(canonica))

const temas = {
  41:['História da música: polifonia medieval e organum','Média'],
  42:['História da música: instrumentos e práticas musicais da Grécia antiga','Fácil'],
  43:['História da música: teoria musical grega e notação de Guido d’Arezzo','Média'],
  47:['História da música: temperamento e afinação no Barroco','Média'],
  48:['História da música: Renascimento musical europeu','Média'],
  50:['História da música: música sacra e instrumental no Barroco','Média'],
  52:['História da música: sinfonia romântica e linguagem harmônica de Brahms','Difícil'],
  53:['História da música: transição do Barroco ao Classicismo','Média'],
  59:['História da música: pós-romantismo e correntes do início do século XX','Difícil'],
  61:['Teoria musical: tonalidade menor harmônica e acidentes','Média'],
  62:['Análise musical: identificação de melodia popular','Fácil'],
  63:['Harmonia: transposição de progressões para Mi maior','Média'],
  64:['Harmonia funcional: análise de progressão tonal','Média'],
  65:['Teoria musical: quiálteras e organização rítmica','Média'],
  66:['Percepção musical: identificação e classificação de intervalos','Difícil'],
  67:['Análise musical: tonalidade e armadura de clave','Média'],
  68:['Teoria musical: escalas menores natural, harmônica e melódica','Média'],
  69:['Teoria musical: anacruse e início de frase','Fácil'],
  70:['Teoria musical: compasso e unidade de tempo','Fácil'],
  71:['Ritmo: padrões de acompanhamento em compasso binário','Média'],
  72:['Teoria musical: modos eclesiásticos e modo mixolídio','Média'],
  73:['Harmonia: formação de acordes com sétima','Média'],
  74:['Ritmo: anacruse, início acéfalo e início tético','Média'],
  75:['Expressão musical: dinâmica e equilíbrio entre vozes','Média'],
  76:['Ritmo: ligadura e equivalência de figuras','Média'],
  77:['Harmonia: inversões de tríades e acordes de sétima','Difícil'],
  78:['Harmonia funcional: graus e progressões harmônicas','Média'],
  79:['Teoria musical: modos eclesiásticos e característica do modo lídio','Média'],
  80:['Teoria musical: estrutura intervalar do modo dórico','Média'],
  81:['Harmonia: análise de acorde diminuto com sétima e inversão','Difícil'],
  82:['Harmonia: acorde maior com sétima maior e inversão','Difícil'],
  83:['Harmonia: acordes de sétima alterados e estrutura intervalar','Difícil'],
  84:['Harmonia: inversões de acordes de sétima','Média']
}
const limpar = {
  48:'No Renascimento da música, a mistura das formas tradicionais trazidas do norte da Europa com a música dançante e improvisada que existia na Itália influenciou as formas e as características da música europeia do século XVI.',
  53:'A mudança do período barroco para o período clássico se deu na primeira metade do século XVIII e ocorreu, principalmente, devido à modificação estrutural na forma da composição musical, saindo de um estilo contrapontístico para um estilo mais linear, ligado a um desenvolvimento harmônico da melodia com o auxílio do baixo.',
  61:'Para se tocar essa melodia na tonalidade de dó menor na forma harmônica, basta acrescentar um bemol à nota mi.',
  62:'Esse trecho musical corresponde à primeira frase da música Samba-lelê.',
  63:'Se a harmonia da música fosse transposta para mi maior, a sequência correta dos acordes seria: || E | Fm | B7 | E ||.',
  64:'A análise harmônica correta para o trecho musical apresentado é: || I | IIm | V7 | I ||.',
  65:'A configuração rítmica do primeiro tempo do primeiro compasso é denominada quiáltera.',
  70:'Na referida canção, o compasso é binário e a unidade de tempo é a semínima.',
  74:'O início rítmico dessa frase é acéfalo.',
  80:'O modo mi dórico é estruturado nas notas mi, fá sustenido, sol, lá, si, dó e ré.'
}
const bases = {
  41:'Julgue os itens a seguir, relacionados à música na Grécia antiga e no período medieval da história da música ocidental.',
  42:'Julgue os itens a seguir, relacionados à música na Grécia antiga e no período medieval da história da música ocidental.',
  43:'Julgue os itens a seguir, relacionados à música na Grécia antiga e no período medieval da história da música ocidental.',
  47:'Acerca da música nos períodos renascentista e barroco da história da música ocidental, julgue os itens seguintes.',
  48:'Acerca da música nos períodos renascentista e barroco da história da música ocidental, julgue os itens seguintes.',
  50:'Acerca da música nos períodos renascentista e barroco da história da música ocidental, julgue os itens seguintes.',
  52:'Julgue os próximos itens, relativos à música nos períodos clássico e romântico da história da música ocidental.',
  53:'Julgue os próximos itens, relativos à música nos períodos clássico e romântico da história da música ocidental.',
  59:'No que se refere à situação musical do século XX, julgue os itens que se seguem.',
  61:'A partir do trecho musical apresentado no caderno, julgue os itens subsecutivos.',
  62:'A partir do trecho musical apresentado no caderno, julgue os itens subsecutivos.',
  63:'A partir do trecho musical apresentado no caderno, julgue os itens subsecutivos.',
  64:'A partir do trecho musical apresentado no caderno, julgue os itens subsecutivos.',
  65:'A partir do trecho musical apresentado imediatamente antes dos itens 61 a 65, julgue o enunciado. A partitura original está preservada na imagem da página 2.',
  66:'Com base na partitura da música Tutu Marabá, apresentada no caderno, julgue os itens a seguir.',
  67:'Com base na partitura da música Tutu Marabá, apresentada no caderno, julgue os itens a seguir.',
  68:'Com base na partitura da música Tutu Marabá, apresentada no caderno, julgue os itens a seguir.',
  69:'Com base na partitura da música Tutu Marabá, apresentada no caderno, julgue os itens a seguir.',
  70:'Com base na partitura da música Tutu Marabá, apresentada no caderno, julgue os itens a seguir.',
  71:'Com base no trecho musical da canção Baião da Fortuna apresentado no caderno, julgue os itens seguintes.',
  72:'Com base no trecho musical da canção Baião da Fortuna apresentado no caderno, julgue os itens seguintes.',
  73:'Com base no trecho musical da canção Baião da Fortuna apresentado no caderno, julgue os itens seguintes.',
  74:'Com base no trecho musical da canção Baião da Fortuna apresentado no caderno, julgue os itens seguintes.',
  75:'Tendo como referência o fragmento da partitura da canção The Happy Farmer, de Schumann, julgue os itens seguintes.',
  76:'Tendo como referência o fragmento da partitura da canção The Happy Farmer, de Schumann, julgue os itens seguintes.',
  77:'Tendo como referência o fragmento da partitura da canção The Happy Farmer, de Schumann, julgue os itens seguintes.',
  78:'Tendo como referência o fragmento da partitura da canção The Happy Farmer, de Schumann, julgue os itens seguintes.',
  79:'A respeito dos modos litúrgicos, julgue os próximos itens.',
  80:'A respeito dos modos litúrgicos, julgue os próximos itens.',
  81:'Acerca do trecho de partitura precedente, extraído da obra Concerto para Piano e Orquestra n.º 2 em Dó Menor, Op. 18, de Rachmaninoff, julgue os itens a seguir.',
  82:'Acerca do trecho de partitura precedente, extraído da obra Concerto para Piano e Orquestra n.º 2 em Dó Menor, Op. 18, de Rachmaninoff, julgue os itens a seguir.',
  83:'No que se refere aos acordes de sétima, julgue os próximos itens.',
  84:'No que se refere aos acordes de sétima, julgue os próximos itens.'
}
const respostas = {41:'E',42:'C',43:'C',47:'C',48:'C',50:'C',52:'C',53:'C',59:'C',61:'C',62:'C',63:'E',64:'C',65:'E',66:'E',67:'E',68:'E',69:'C',70:'E',71:'C',72:'E',73:'C',74:'C',75:'E',76:'C',77:'C',78:'E',79:'C',80:'E',81:'E',82:'C',83:'C',84:'C'}
const decisoes = fontes.map(q => {
  const n = Number(q.numero)
  const item = Number(q.numero) === 43 && q.id === duplicata ? 43 : n
  const [conteudo, dificuldade] = temas[item]
  assert.ok(conteudo && respostas[item], `Sem análise/classificação para item ${item}`)
  const numeroPagina = Number(q.pagina)
  const imagem = `paginas/${documento}-${String(numeroPagina).padStart(4, '0')}.webp`
  const enunciado = limpar[item] || q.trecho.replace(/\s+/g, ' ').trim()
  const d = {
    id:q.id, sha256_enunciado:hashes.get(q.id), materia:'Música', conteudo, ano:2025,
    concurso, cargo, banca:'CEBRASPE', organizadora:'CEBRASPE',
    aplicacao:'Prova objetiva — Conhecimentos Específicos — Cargo 23 — caderno 033_INOVERSASUL_023_01',
    numero:n, numero_original:n, pagina:numeroPagina, dificuldade, dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial com base na interpretação de conceitos, leitura de partitura e análise harmônica; não é classificação oficial da banca.',
    classificacao_fonte:prova,
    motivo:`Item ${item} classificado a partir do bloco temático do caderno oficial e do conteúdo musical exigido.`,
    enunciado, opcoes:['Certo','Errado'], resposta_correta:respostas[item] === 'C' ? 0 : 1,
    anulada:false, apta_resolucao:true,
    gabarito_oficial:{fonte:gabaritoUrl,arquivo:'GAB_DEFINITIVO_033_INOVERSASUL_023_01.PDF',prova:'033_INOVERSASUL_023_01.PDF',sha256:key.sha256,numero:item,resposta:respostas[item],criterio:'Gabarito oficial definitivo do mesmo cargo e identificador de caderno.'},
    remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],
    visual:{pagina:numeroPagina,imagem,enunciado,texto_apoio:bases[item]||'',motivo:`Página ${numeroPagina} do caderno oficial conferida visualmente; enunciado e contexto musical vinculados ao item ${item}.`}
  }
  if(q.id===duplicata){d.apta_resolucao=false;d.inelegibilidade_motivo='duplicata_de_extracao';d.duplicada_de=canonica}
  return d
})
assert.equal(decisoes.filter(d=>d.apta_resolucao!==false).length,33)
assert.equal(new Set(decisoes.filter(d=>d.apta_resolucao!==false).map(d=>d.numero_original)).size,33)
assert.equal(decisoes.filter(d=>d.apta_resolucao===false).length,1)
for(const d of decisoes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:34,itens_oficiais_unicos:33,aptos_resolucao:33,duplicatas:1,anuladas:0,gabaritos:33,paginas:[1,2],imagens:true,publicado:false},null,2));process.exit(0)}

const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,concurso,cargo,registros_revisados:34,itens_oficiais_unicos:33,aptas_para_resolucao:33,duplicata_marcada:duplicata,respostas_definitivas_vinculadas:33,paginas_originais_conferidas:[1,2],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Fundação InoversaSul — Professor de Música, Cargo 23 — revisão v473\n\n- Revisei 34 registros do recorte pendente: 33 itens oficiais distintos e uma duplicata de extração do item 43, marcada como inelegível e vinculada ao registro canônico.\n- Classifiquei por História da Música, teoria, percepção, ritmo e harmonia, com tópicos individualizados, ano de aplicação 2025 e dificuldade editorial estimada.\n- Corrigi a concatenação dos itens 48/49, o século do item 53 (XVIII) e os enunciados 65, 70, 74 e 80, que tinham absorvido instruções de blocos seguintes. Associei os comandos compartilhados às partituras corretas.\n- Conferi visualmente as páginas 1 e 2 e preservei as imagens de partitura; vinculei a chave definitiva oficial do mesmo caderno aos 33 itens distintos.\n- Pacote local, sem publicação na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital atualizado](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
