import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-codevasf-2024-analista-geologia-cargo8-v474', documento='1d348c56df99003f'
const prova='https://cdn.cebraspe.org.br/concursos/CODEVASF_24/arquivos/989_CODEVASF_008_01.PDF'
const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/CODEVASF_24/arquivos/GAB_DEFINITIVO_989_CODEVASF_008_01.PDF'
const editalUrl='https://cdn.cebraspe.org.br/concursos/codevasf_24/arquivos/ED_1_2024_CODEVASF_ABERTURA_VERSAO_ATUALIZADA_ATE_RET_5.PDF'
const concurso='CODEVASF — Concurso Público — 2024'
const cargo='Analista em Desenvolvimento Regional — Área: Geologia (Cargo 8)'
const caderno=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(caderno?.url,prova)
const ledger=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(String.fromCharCode(10)).filter(Boolean).map(JSON.parse)
const key=ledger.find(x=>x.documento_id===documento)
assert.equal(key?.gabarito_url,gabaritoUrl);assert.equal(key?.status,'tabela_lida');assert.equal(key?.sha256,'31df13fa78ccd2c08645936ce8a9aab1c558ea9014b45d9750f4c914a2ae500a')
const atual=JSON.parse(await fs.readFile('tmp/codevasf-cargo8-v474-pendentes.json','utf8'))
assert.equal(atual.length,34)
const hashes=new Map(atual.map(q=>[q.id,q.hash])),ids=new Set(hashes.keys())
const fontes=caderno.questoes.filter(q=>ids.has(q.id));assert.equal(fontes.length,34)

const temas={
  51:['Mineralogia óptica: birrefringência e classificação biaxial','Média'],52:['Mineralogia: propriedades ópticas de substâncias cristalinas e amorfas','Média'],53:['Mineralogia óptica: minerais anisotrópicos, uniaxiais e biaxiais','Média'],54:['Cristalografia: anisotropia e sistemas cristalinos','Média'],
  55:['Petrologia: classificação de rochas metamórficas e esteatito','Média'],56:['Petrologia: migmatitos e rochas de origem mista','Média'],57:['Petrologia: carbonatitos e classificação de rochas','Média'],58:['Sedimentologia: varvitos e ambientes glaciais','Média'],
  89:['Geologia estrutural: direção e mergulho de camadas','Média'],91:['Pedologia e cartografia geoambiental: Neossolos Litólicos','Média'],92:['Geomorfologia e cartografia geoambiental: densidade de drenagem','Média'],93:['Legislação ambiental e áreas de preservação permanente em encostas','Média'],
  96:['Hidrogeologia ambiental: atenuação natural monitorada de aquíferos','Média'],98:['Contaminação de solos: bioacumulação de contaminantes','Média'],99:['Geoquímica ambiental: análise de metais pesados em solos','Média'],100:['Contaminação de solos e planejamento urbano','Média'],
  101:['Paleoclimatologia: períodos interglaciais','Média'],102:['Paleoclimatologia: glaciações pré-cambrianas','Média'],103:['Tectônica de placas e mudanças climáticas geológicas','Média'],104:['Paleoclimatologia: registros de CO₂ em testemunhos de gelo','Média'],
  105:['Geologia econômica: depósitos metálicos e faixas móveis','Média'],106:['Engenharia de minas: relação estéril/minério e viabilidade econômica','Média'],107:['Geologia econômica: depósitos de diamante e bauxita','Média'],108:['Geoquímica de exploração: concentração de ouro e unidades ppm','Média'],
  109:['Legislação mineral: participação do proprietário do solo','Média'],110:['Legislação mineral: autorização de pesquisa mineral','Média'],111:['Legislação mineral: órgão competente para autorizar pesquisa','Fácil'],
  112:['Engenharia de minas: métodos de lavra a céu aberto','Fácil'],113:['Engenharia de minas: lavra em tiras (strip mining)','Média'],114:['Engenharia de minas: seleção entre lavra a céu aberto e subterrânea','Média'],
  117:['Geologia de engenharia: revegetação de barragens de rejeitos','Média'],118:['Cartografia de riscos geológicos urbanos: escala cartográfica','Média'],119:['Cartografia de riscos geológicos: sistema de coordenadas e datum','Média'],120:['Geologia de engenharia: critérios de setorização de áreas de risco','Média']
}
const bases={
  51:'Julgue os seguintes itens, referentes à mineralogia.',52:'Julgue os seguintes itens, referentes à mineralogia.',53:'Julgue os seguintes itens, referentes à mineralogia.',54:'Julgue os seguintes itens, referentes à mineralogia.',
  55:'Acerca da classificação genérica das rochas sedimentares, ígneas e metamórficas, julgue os itens a seguir.',56:'Acerca da classificação genérica das rochas sedimentares, ígneas e metamórficas, julgue os itens a seguir.',57:'Acerca da classificação genérica das rochas sedimentares, ígneas e metamórficas, julgue os itens a seguir.',58:'Acerca da classificação genérica das rochas sedimentares, ígneas e metamórficas, julgue os itens a seguir.',
  89:'Situação-problema: um técnico identifica as unidades litológicas em uma transecção de 5 cm indicada na carta topográfica SF-24-V-A-IV-2 e registra o mergulho das camadas. O enunciado completo e a carta citada estão preservados na imagem da página 2 do caderno.',
  91:'Julgue os itens relativos à cartografia geoambiental.',92:'Julgue os itens relativos à cartografia geoambiental.',93:'Julgue os itens relativos à cartografia geoambiental.',
  96:'A respeito da contaminação de aquíferos, julgue os itens seguintes.',
  98:'Julgue os itens a seguir, no que se refere à contaminação de solos.',99:'Julgue os itens a seguir, no que se refere à contaminação de solos.',100:'Julgue os itens a seguir, no que se refere à contaminação de solos.',
  101:'Acerca das mudanças climáticas e atmosféricas na história geológica da Terra, julgue os itens subsequentes.',102:'Acerca das mudanças climáticas e atmosféricas na história geológica da Terra, julgue os itens subsequentes.',103:'Acerca das mudanças climáticas e atmosféricas na história geológica da Terra, julgue os itens subsequentes.',104:'Acerca das mudanças climáticas e atmosféricas na história geológica da Terra, julgue os itens subsequentes.',
  105:'Julgue os itens a seguir, no que se refere à geologia econômica.',106:'Julgue os itens a seguir, no que se refere à geologia econômica.',107:'Julgue os itens a seguir, no que se refere à geologia econômica.',108:'Julgue os itens a seguir, no que se refere à geologia econômica.',
  109:'Com base na legislação mineral e ambiental vigente no Brasil, julgue os itens subsequentes.',110:'Com base na legislação mineral e ambiental vigente no Brasil, julgue os itens subsequentes.',111:'Com base na legislação mineral e ambiental vigente no Brasil, julgue os itens subsequentes.',
  112:'Acerca da lavra de mina subterrânea e da lavra de mina a céu aberto, julgue os próximos itens.',113:'Acerca da lavra de mina subterrânea e da lavra de mina a céu aberto, julgue os próximos itens.',114:'Acerca da lavra de mina subterrânea e da lavra de mina a céu aberto, julgue os próximos itens.',
  117:'No que tange à cartografia de riscos geológicos urbanos e à segurança na mineração, julgue os itens seguintes.',118:'No que tange à cartografia de riscos geológicos urbanos e à segurança na mineração, julgue os itens seguintes.',119:'No que tange à cartografia de riscos geológicos urbanos e à segurança na mineração, julgue os itens seguintes.',120:'No que tange à cartografia de riscos geológicos urbanos e à segurança na mineração, julgue os itens seguintes.'
}
const limpar={
  93:'De acordo com a legislação ambiental vigente, áreas com declividade acima de 45° não podem ser ocupadas.',
  108:'Uma concentração de 20 ppm de ouro em uma amostra de sedimento de rio indica que há 20 gramas de ouro em uma tonelada de sedimento.',
  111:'A instituição pública que autoriza a pesquisa mineral de campo em determinada área de estudo é o Departamento Nacional de Produção Mineral (DNPM).',
  120:'As setorizações de áreas de risco geológico em zonas urbanas são desenvolvidas exclusivamente em regiões onde existem imóveis em que haja permanência humana, como casas, edifícios, hospitais, escolas e estabelecimentos comerciais.'
}
const respostas={51:'E',52:'E',53:'C',54:'E',55:'E',56:'C',57:'E',58:'C',89:'C',91:'E',92:'E',93:'C',96:'E',98:'E',99:'C',100:'E',101:'E',102:'C',103:'E',104:'C',105:'E',106:'E',107:'C',108:'C',109:'E',110:'X',111:'E',112:'C',113:'C',114:'E',117:'E',118:'E',119:'E',120:'C'}
const decisoes=fontes.map(q=>{
  const n=Number(q.numero),[conteudo,dificuldade]=temas[n];assert.ok(conteudo&&respostas[n],`Sem classificação ou gabarito do item ${n}`)
  const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`,anulada=respostas[n]==='X'
  const d={id:q.id,sha256_enunciado:hashes.get(q.id),materia:'Geologia',conteudo,ano:2024,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — Cargo 8 — caderno 989_CODEVASF_008_01',numero:n,numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo domínio técnico e pela integração de conceitos geológicos; não é nível oficial atribuído pela banca.',classificacao_fonte:prova,motivo:`Item ${n} classificado conforme o cabeçalho temático oficial do caderno e o conhecimento geológico específico avaliado.`,enunciado:limpar[n]||q.trecho.replace(/\s+/g,' ').trim(),opcoes:['Certo','Errado'],resposta_correta:anulada?null:respostas[n]==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabaritoUrl,arquivo:'GAB_DEFINITIVO_989_CODEVASF_008_01.PDF',prova:'989_CODEVASF_008_01.PDF',sha256:key.sha256,numero:n,resposta:respostas[n],criterio:'Gabarito oficial definitivo do mesmo cargo e do mesmo identificador de caderno.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],visual:{pagina,imagem,enunciado:limpar[n]||q.trecho.replace(/\s+/g,' ').trim(),texto_apoio:bases[n]||'',motivo:`Página ${pagina} conferida visualmente; texto-base e seção temática associados ao item ${n}, preservando mapa/figura quando aplicável.`}}
  return d
})
assert.equal(decisoes.length,34);assert.equal(decisoes.filter(d=>d.anulada).length,1);assert.equal(decisoes.filter(d=>d.gabarito_oficial.resposta!=='X').length,33)
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:34,itens_unicos:34,aptos_para_resolucao:34,correcao_automatica:33,anulada:[110],paginas:[1,2,3],imagens:true,publicado:false},null,2));process.exit(0)}
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,concurso,cargo,registros_revisados:34,itens_unicos:34,aptos_para_resolucao:34,elegiveis_correcao_automatica:33,anulada:[110],paginas_originais_conferidas:[1,2,3],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CODEVASF — Analista em Desenvolvimento Regional, Geologia, Cargo 8 — revisão v474\n\n- Revisei 34 itens pendentes, separando mineralogia, petrologia, geologia estrutural, pedologia/cartografia geoambiental, hidrogeologia e contaminação, paleoclimatologia, geologia econômica, legislação mineral, lavra e riscos geológicos.\n- Reparei os itens 93, 108, 111 e 120, removendo cabeçalhos e sobra de página concatenados; reconstruí o texto-base da situação cartográfica do item 89 e vinculei os demais aos blocos oficiais correspondentes.\n- Conferi visualmente as páginas 1 a 3, preservando o gráfico cartográfico da página 2; associei o gabarito definitivo do mesmo caderno. O item 110 foi anulado oficialmente e fica sem correção automática.\n- Dificuldade registrada como estimativa editorial, não como atributo oficial da banca. Pacote local; não publicado na nuvem.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital retificado](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
