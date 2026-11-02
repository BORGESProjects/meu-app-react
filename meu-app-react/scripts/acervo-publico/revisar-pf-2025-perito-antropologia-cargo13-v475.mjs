import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-pf-2025-perito-antropologia-cargo13-v475', documento='12273ea2d15eeb74'
const prova='https://cdn.cebraspe.org.br/concursos/PF_25/arquivos/106_PF_013_01.pdf'
const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/2B1B28107AE0168F6AF795DF71CF83536A1AD39CBC1B405DA6BF3D261A1867CF.pdf'
const editalUrl='https://cdn.cebraspe.org.br/concursos/pf_25/arquivos/Ed_1_PF_25_Abertura_Atualizado_ate_ret_4.pdf'
const concurso='Polícia Federal — Concurso Policial — 2025'
const cargo='Perito Criminal Federal — Área 21: Antropologia Forense (Cargo 13)'
const caderno=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(caderno?.url,prova)
const ledger=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(String.fromCharCode(10)).filter(Boolean).map(JSON.parse)
const key=ledger.find(x=>x.documento_id===documento)
assert.equal(key?.gabarito_url,gabaritoUrl);assert.equal(key?.status,'transcrito_pdf_oficial');assert.equal(Object.keys(key.respostas).length,70)
const atual=JSON.parse(await fs.readFile('tmp/pf-cargo13-v475-pendentes.json','utf8'))
assert.equal(atual.length,34)
const hashes=new Map(atual.map(q=>[q.id,q.hash])),ids=new Set(hashes.keys())
const fontes=caderno.questoes.filter(q=>ids.has(q.id));assert.equal(fontes.length,34)

const taxonomia={
  51:['Medicina Legal','Antropologia forense e osteologia: estimativa de estatura por vértebras','Média'],
  52:['Medicina Legal','Antropologia forense: perfil biológico, intervalo post mortem e causa da morte','Difícil'],
  53:['Medicina Legal','Antropologia forense: estimativa sexual pela pelve','Média'],
  54:['Medicina Legal','Antropologia forense e osteologia: estimativa de estatura por ossos longos','Média'],
  55:['Medicina Legal','Antropologia forense: suturas cranianas e afinidade populacional','Difícil'],
  57:['Medicina Legal','Osteologia: tecido ósseo compacto e sistemas de Havers','Média'],
  59:['Medicina Legal','Antropologia forense: estimativa de idade em subadultos','Média'],
  60:['Medicina Legal','Osteologia: ossificação intramembranosa','Média'],
  61:['Medicina Legal','Antropologia forense: maturação epifisária e idade biológica','Fácil'],
  62:['Medicina Legal','Antropologia forense: classificação anatômica dos ossos e perfil biológico','Média'],
  63:['Medicina Legal','Osteologia: classificação da patela como osso sesamoide','Fácil'],
  64:['Medicina Legal','Antropologia forense: densidade trabecular e avaliação óssea','Média'],
  69:['Criminalística','Cadeia de custódia: isolamento e preservação do local','Fácil'],
  70:['Criminalística','Atendimento inicial e preservação do local de crime','Média'],
  71:['Criminalística','Local de crime: documentação, georreferenciamento e segurança','Média'],
  72:['Criminalística','Incêndios e vítimas carbonizadas: vestígios e estimativa térmica','Média'],
  73:['Criminalística','Local de crime: coleta, acondicionamento e conservação de material biológico','Média'],
  74:['Criminalística','Busca de vestígios: padrão em linhas cruzadas','Fácil'],
  75:['Criminalística','Busca e recuperação de vestígios: escolha de padrões de busca','Média'],
  76:['Criminalística','Cadeia de custódia: fixação e documentação de vestígios','Média'],
  77:['Criminalística','Arqueologia forense: inumação primária e secundária','Difícil'],
  78:['Criminalística','Vestígios latentes e busca em local de crime','Fácil'],
  79:['Criminalística','Arqueologia forense: geofísica e radar de penetração no solo','Média'],
  80:['Criminalística','Arqueologia forense: estratigrafia e cronologia de vestígios','Média'],
  81:['Medicina Legal','Entomologia forense: análise de larvas e estimativa do intervalo post mortem','Difícil'],
  82:['Medicina Legal','Antropologia forense: restos humanos misturados e associação de indivíduos','Difícil'],
  83:['Medicina Legal','Entomologia forense: coleópteros e intervalo post mortem','Média'],
  84:['Medicina Legal','Entomologia forense: intervalo post mortem e detecção de substâncias','Difícil'],
  85:['Medicina Legal','Antropologia forense: dimorfismo sexual pelo crânio e pela pelve','Média'],
  86:['Medicina Legal','Antropologia forense: diagnose sexual probabilística','Difícil'],
  87:['Medicina Legal','Antropologia forense: componentes do perfil biológico','Média'],
  88:['Medicina Legal','Antropologia forense: caracteres morfológicos da pelve','Média'],
  102:['Medicina Legal','Tanatologia forense: sequência de decomposição cadavérica','Média'],
  103:['Medicina Legal','Tanatologia forense: decomposição de cadáveres carbonizados e intervalo post mortem','Difícil']
}
const respostas={51:'E',52:'E',53:'C',54:'X',55:'E',57:'E',59:'C',60:'E',61:'C',62:'C',63:'C',64:'E',69:'E',70:'X',71:'C',72:'C',73:'C',74:'E',75:'E',76:'C',77:'E',78:'E',79:'C',80:'C',81:'E',82:'X',83:'E',84:'C',85:'C',86:'C',87:'C',88:'E',102:'E',103:'C'}
const bases={
  51:'Considerando que a antropologia forense aplica conhecimentos da antropologia física e biológica ao exame de remanescentes humanos, julgue os itens a seguir.',52:'Considerando que a antropologia forense aplica conhecimentos da antropologia física e biológica ao exame de remanescentes humanos, julgue os itens a seguir.',53:'Considerando que a antropologia forense aplica conhecimentos da antropologia física e biológica ao exame de remanescentes humanos, julgue os itens a seguir.',54:'Considerando que a antropologia forense aplica conhecimentos da antropologia física e biológica ao exame de remanescentes humanos, julgue os itens a seguir.',55:'Considerando que a antropologia forense aplica conhecimentos da antropologia física e biológica ao exame de remanescentes humanos, julgue os itens a seguir.',
  57:'Acerca das características gerais de esqueletos adultos e subadultos, julgue os itens seguintes.',59:'Acerca das características gerais de esqueletos adultos e subadultos, julgue os itens seguintes.',60:'Acerca das características gerais de esqueletos adultos e subadultos, julgue os itens seguintes.',61:'Acerca das características gerais de esqueletos adultos e subadultos, julgue os itens seguintes.',
  62:'Julgue os itens acerca da classificação dos ossos, de sua utilização na elaboração do perfil biológico e da identificação de fatores individualizantes.',63:'Julgue os itens acerca da classificação dos ossos, de sua utilização na elaboração do perfil biológico e da identificação de fatores individualizantes.',64:'Julgue os itens acerca da classificação dos ossos, de sua utilização na elaboração do perfil biológico e da identificação de fatores individualizantes.',
  69:'Com base na Lei nº 13.964/2019, julgue os itens subsequentes a respeito das etapas da cadeia de custódia.',70:'Em relação ao processamento de locais de crime com remanescentes humanos em condições especiais, julgue os itens a seguir.',
  71:'Em relação ao processamento de locais de crime com remanescentes humanos em condições especiais, julgue os itens a seguir.',72:'Em relação ao processamento de locais de crime com remanescentes humanos em condições especiais, julgue os itens a seguir.',73:'Em relação ao processamento de locais de crime com remanescentes humanos em condições especiais, julgue os itens a seguir.',74:'Em relação ao processamento de locais de crime com remanescentes humanos em condições especiais, julgue os itens a seguir.',
  75:'Considerando que a busca e a recuperação de remanescentes humanos são fases essenciais da investigação forense, julgue os itens a seguir.',76:'Considerando que a busca e a recuperação de remanescentes humanos são fases essenciais da investigação forense, julgue os itens a seguir.',77:'Considerando que a busca e a recuperação de remanescentes humanos são fases essenciais da investigação forense, julgue os itens a seguir.',78:'Considerando que a busca e a recuperação de remanescentes humanos são fases essenciais da investigação forense, julgue os itens a seguir.',79:'Considerando que a busca e a recuperação de remanescentes humanos são fases essenciais da investigação forense, julgue os itens a seguir.',80:'Considerando que a busca e a recuperação de remanescentes humanos são fases essenciais da investigação forense, julgue os itens a seguir.',
  81:'Julgue os itens relativos à entomologia forense e às metodologias para avaliação do número de indivíduos.',82:'Julgue os itens relativos à entomologia forense e às metodologias para avaliação do número de indivíduos.',83:'Julgue os itens relativos à entomologia forense e às metodologias para avaliação do número de indivíduos.',84:'Julgue os itens relativos à entomologia forense e às metodologias para avaliação do número de indivíduos.',
  85:'No que diz respeito à definição do perfil biológico, julgue os itens a seguir.',86:'No que diz respeito à definição do perfil biológico, julgue os itens a seguir.',87:'No que diz respeito à definição do perfil biológico, julgue os itens a seguir.',88:'No que diz respeito à definição do perfil biológico, julgue os itens a seguir.',
  102:'Um dos objetivos do exame inicial do cadáver é estimar o intervalo post mortem a partir do processo de decomposição cadavérica. A esse respeito, julgue os itens subsequentes.',103:'Um dos objetivos do exame inicial do cadáver é estimar o intervalo post mortem a partir do processo de decomposição cadavérica. A esse respeito, julgue os itens subsequentes.'
}
const limpar={64:'Os ossos longos, como o esterno, são essenciais para a análise de densidade trabecular em adultos.',81:fontes.find(q=>Number(q.numero)===81)?.trecho?.replace(/post mortem\s*,/i,'post mortem,')}
const decisoes=fontes.map(q=>{
  const n=Number(q.numero),[materia,conteudo,dificuldade]=taxonomia[n],resposta=respostas[n]
  assert.ok(materia&&conteudo&&resposta,`Classificação ou gabarito ausente para o item ${n}`)
  const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`,anulada=resposta==='X'
  const texto=(limpar[n]||q.trecho).replace(/\s+/g,' ').trim()
  return {id:q.id,sha256_enunciado:hashes.get(q.id),materia,conteudo,ano:2025,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — Cargo 13 — caderno 106_PF_013_01',numero:n,numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada em anatomia, osteologia, antropologia e procedimentos periciais; a banca não publica níveis de dificuldade por item.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo bloco temático e pela competência pericial exigida no caderno oficial.`,enunciado:texto,opcoes:['Certo','Errado'],resposta_correta:anulada?null:resposta==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabaritoUrl,arquivo:'2B1B28107AE0168F6AF795DF71CF83536A1AD39CBC1B405DA6BF3D261A1867CF.pdf',prova:'106_PF_013_01.pdf',sha256:key.sha256,numero:n,resposta,criterio:'Gabarito oficial definitivo do mesmo cargo e identificador 106_PF_013_01; transcrição conferida na tabela do Cebraspe.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],visual:{pagina,imagem,enunciado:texto,texto_apoio:bases[n]||'',motivo:`Página ${pagina} do caderno oficial conferida visualmente; comando/contexto e imagem de origem preservados.`}}
})
assert.equal(decisoes.length,34);assert.equal(decisoes.filter(d=>d.anulada).length,3);assert.equal(decisoes.filter(d=>d.gabarito_oficial.resposta!=='X').length,31)
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:34,itens_unicos:34,aptos_resolucao:34,correcao_automatica:31,anuladas:[54,70,82],paginas:[1,2,3],imagens:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,concurso,cargo,registros_revisados:34,itens_unicos:34,aptos_para_resolucao:34,elegiveis_correcao_automatica:31,anuladas:[54,70,82],paginas_originais_conferidas:[1,2,3],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false,hash_do_gabarito:null}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## Polícia Federal — Perito Criminal Federal, Área 21: Antropologia Forense, Cargo 13 — revisão v475\n\n- Revisei 34 itens pendentes e classifiquei anatomia/osteologia, estimativas do perfil biológico, cadeia de custódia, processamento de locais de crime, busca e recuperação, entomologia, decomposição e identificação humana.\n- Corrigi a sobra de cabeçalho no item 64 e preservei os textos-base compartilhados nos grupos 51–55, 57–61, 62–64, 69–74, 75–80, 81–84, 85–88 e 102–103, com imagens das páginas 1 a 3 conferidas visualmente.\n- Vinculei a chave definitiva oficial do caderno exato. Os itens 54, 70 e 82 foram anulados; os outros 31 recebem correção automática. A tabela oficial foi transcrita do PDF do Cebraspe, sem hash local do arquivo.\n- Dificuldades são estimativas editoriais. Pacote local; não publicado na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital atualizado](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
