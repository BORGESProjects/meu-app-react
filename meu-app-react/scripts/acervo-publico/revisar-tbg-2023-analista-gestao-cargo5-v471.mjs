import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-tbg-2023-analista-gestao-cargo5-v471', documento='e6221aecb518dfb5'
const prova='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/888_TBG_005_01.PDF'
const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/GAB_DEFINITIVO_888_TBG_005_01.PDF'
const editalUrl='https://cdn.cebraspe.org.br/concursos/TBG_23/arquivos/ED_1_2023_TBG_ABERTURA.PDF'
const concurso='TBG — Processo Seletivo Público — 2023', cargo='Analista Júnior — Ênfase: Gestão'
const caderno=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(caderno?.url,prova)
const ledger='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const keys=(await fs.readFile(ledger,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse)
const key=keys.find(x=>x.documento_id===documento)
assert.equal(key?.status,'tabela_lida');assert.equal(key.sha256,'0d5918ca1d73af8e0fb09f145f16b35304bc37f5debeb28998ab70453e34b455')
const respostas={...key.respostas,'91':'E','92':'E','93':'C','94':'C','95':'C','96':'C','97':'E','98':'E','99':'C','100':'E'}

const temas={
  32:['Administração','Planejamento estratégico: integração dos níveis organizacionais','Fácil'],
  36:['Administração','Estrutura organizacional: departamentalização funcional','Fácil'],
  37:['Administração','Estrutura matricial e gestão por projetos','Média'],
  38:['Administração','Estratégias organizacionais e análise ambiental','Média'],
  43:['Administração de Materiais','Gestão da cadeia de suprimentos: relacionamento com fornecedores e clientes','Fácil'],
  45:['Administração de Materiais','Gestão de estoques: política de reposição e compras','Média'],
  47:['Administração de Materiais','Reposição contínua e ponto de ressuprimento','Média'],
  48:['Administração de Materiais','Identificação por radiofrequência (RFID) e leitura de etiquetas','Fácil'],
  49:['Administração da Produção','Programa mestre de produção','Fácil'],
  52:['Gestão de Pessoas','Gestão estratégica de recursos humanos','Média'],
  54:['Gestão de Pessoas','Benefícios: Programa de Alimentação do Trabalhador (PAT)','Fácil'],
  55:['Gestão de Pessoas','Remuneração: incentivos e reconhecimento','Fácil'],
  57:['Gestão de Pessoas','Cultura organizacional e mudança gerenciada','Média'],
  58:['Gestão de Pessoas','Planejamento de sucessão e desenvolvimento de lideranças','Média'],
  59:['Gestão de Pessoas','Carreiras contemporâneas, flexibilidade e autodesenvolvimento','Média'],
  79:['Contabilidade de Custos','Classificação e apropriação de custos diretos','Média'],
  80:['Contabilidade de Custos','Comportamento dos custos variáveis','Fácil'],
  82:['Contabilidade de Custos','Formação de preço e mark-up divisor','Média'],
  84:['Gestão Ambiental','Desenvolvimento sustentável: dimensões da sustentabilidade','Fácil'],
  85:['Gestão Ambiental','Desenvolvimento sustentável: origem e objetivos','Média'],
  86:['Matemática','Função afim aplicada à formação do preço de transporte','Fácil'],
  87:['Matemática','Progressão aritmética em modelo linear de preços','Média'],
  88:['Matemática','Princípio fundamental da contagem em conjuntos finitos','Fácil'],
  89:['Matemática','Função afim: interpretação de preço e tempo','Média'],
  90:['Matemática','Função afim: cálculo de preço em data determinada','Fácil'],
  93:['Estatística','Diagrama de caixa (box plot): intervalo interquartil','Fácil'],
  94:['Gestão de Pessoas','Planos de cargos e salários: equilíbrio interno e externo','Média'],
  95:['Gestão de Pessoas','Avaliação de cargos e estrutura salarial','Média'],
  96:['Administração','Planejamento organizacional: integração funcional e operacional','Fácil'],
  97:['Gestão de Pessoas','Incentivos, reconhecimento e custos organizacionais','Média'],
  98:['Gestão de Pessoas','Remuneração e formas de compensação','Fácil'],
  99:['Administração','Processo decisório: modelo racional','Média'],
  100:['Administração','Processo decisório: decisões estruturadas e não estruturadas','Média']
}
const correcoes={
  43:'A construção e(ou) o aprofundamento da relação com fornecedores e clientes.',
  48:'A tecnologia RFID permite a leitura instantânea e simultânea de vários tags em um mesmo palete.',
  49:'O programa mestre de produção refere-se ao programa executado para fornecimento de produtos aos clientes.',
  86:'O gráfico no plano cartesiano entre as variáveis n, no eixo horizontal, e P_n, no eixo vertical, será uma curva crescente, quaisquer que sejam os valores das constantes A e B.',
  87:'Uma vez fixados os valores de A e B, a sequência numérica formada pelos preços P_1, P_2, P_3, P_4, ... constitui uma progressão aritmética, quaisquer que sejam os sinais das constantes A e B.',
  88:'Se A e B somente podem assumir valores, respectivamente, nos conjuntos {−0,4; −0,1; 0; 0,3; 0,5} e {2; 5; 7; 8; 11; 12}, então é correto afirmar que há mais de 25 maneiras de se definir o modelo de precificação mencionado.',
  90:'Se A = 0,3 e B = 7, conclui-se que o preço a ser cobrado no quinto dia será superior a R$ 900,00.',
  100:'As decisões estruturadas destinam-se àqueles problemas que tendem a ser singulares e que não se prestam aos procedimentos sistêmicos ou rotineiros.'
}
const bases={
  32:'Acerca do planejamento estratégico empresarial, julgue os itens a seguir.',
  36:'Julgue os itens seguintes, que dizem respeito à estratégia empresarial.',37:'Julgue os itens seguintes, que dizem respeito à estratégia empresarial.',38:'Julgue os itens seguintes, que dizem respeito à estratégia empresarial.',
  43:'As etapas da gestão da cadeia de suprimentos incluem as assertivas a seguir.',
  45:'Julgue os itens relativos a planejamento e controle da produção, gestão de estoque e administração de compras.',47:'Julgue os itens relativos a planejamento e controle da produção, gestão de estoque e administração de compras.',48:'Julgue os itens relativos a planejamento e controle da produção, gestão de estoque e administração de compras.',49:'Julgue os itens relativos a planejamento e controle da produção, gestão de estoque e administração de compras.',
  52:'No que se refere à administração de recursos humanos, julgue os itens a seguir.',
  54:'No âmbito da gestão de benefícios institucionais, julgue o item.',55:'No âmbito da remuneração de empregados, julgue o item.',
  57:'Acerca da administração de recursos humanos, julgue os itens subsequentes.',58:'Acerca da administração de recursos humanos, julgue os itens subsequentes.',59:'Acerca da administração de recursos humanos, julgue os itens subsequentes.',
  79:'No que tange ao planejamento e ao orçamento, julgue os itens seguintes.',80:'No que tange ao planejamento e ao orçamento, julgue os itens seguintes.',82:'No que tange ao planejamento e ao orçamento, julgue os itens seguintes.',
  84:'Em relação ao desenvolvimento sustentável, julgue os itens a seguir.',85:'Em relação ao desenvolvimento sustentável, julgue os itens a seguir.',
  86:'O preço por metro cúbico P_n, em centenas de reais, cobrado no dia n pelo serviço de transporte de gás em determinado gasoduto segue o modelo P_n = A × n + B, em que A e B são constantes que refletem as condições do mercado. A partir dessa situação hipotética, julgue os itens seguintes.',87:'O preço por metro cúbico P_n, em centenas de reais, cobrado no dia n pelo serviço de transporte de gás em determinado gasoduto segue o modelo P_n = A × n + B, em que A e B são constantes que refletem as condições do mercado. A partir dessa situação hipotética, julgue os itens seguintes.',88:'O preço por metro cúbico P_n, em centenas de reais, cobrado no dia n pelo serviço de transporte de gás em determinado gasoduto segue o modelo P_n = A × n + B, em que A e B são constantes que refletem as condições do mercado. A partir dessa situação hipotética, julgue os itens seguintes.',89:'O preço por metro cúbico P_n, em centenas de reais, cobrado no dia n pelo serviço de transporte de gás em determinado gasoduto segue o modelo P_n = A × n + B, em que A e B são constantes que refletem as condições do mercado. A partir dessa situação hipotética, julgue os itens seguintes.',90:'O preço por metro cúbico P_n, em centenas de reais, cobrado no dia n pelo serviço de transporte de gás em determinado gasoduto segue o modelo P_n = A × n + B, em que A e B são constantes que refletem as condições do mercado. A partir dessa situação hipotética, julgue os itens seguintes.',
  93:'A figura da página da prova mostra um diagrama esquemático (box plot) de uma variável quantitativa x. Julgue o item sobre o intervalo interquartil.',
  94:'Julgue os itens a seguir, relativos a carreira, remuneração e aspectos correlatos.',95:'Julgue os itens a seguir, relativos a carreira, remuneração e aspectos correlatos.',96:'Julgue os itens a seguir, relativos a carreira, remuneração e aspectos correlatos.',97:'Julgue os itens a seguir, relativos a carreira, remuneração e aspectos correlatos.',98:'Julgue os itens a seguir, relativos a carreira, remuneração e aspectos correlatos.',
  99:'No que se refere ao processo decisório, julgue os itens a seguir.',100:'No que se refere ao processo decisório, julgue os itens a seguir.'
}

const atuais=JSON.parse(await fs.readFile('tmp/tbg-cargo5-v471-pendentes.json','utf8'))
assert.equal(atuais.length,34)
const hashAtual=new Map(atuais.map(q=>[q.id,q.hash]))
const ids=new Set(atuais.map(q=>q.id)), fontes=caderno.questoes.filter(q=>ids.has(q.id))
assert.equal(fontes.length,34)
const duplicateId='extr-35fd83b5904bb0770070', canonicalId='extr-35c7ae4f725d46d52b8d'
assert.ok(ids.has(duplicateId)&&ids.has(canonicalId))
const paginaBox=3
const decisoes=fontes.map(q=>{
  const n=Number(q.numero),[materia,topico,dificuldade]=temas[n]
  assert.ok(materia&&respostas[String(n)],`Classificação ou chave ausente no item ${n}`)
  const anulada=respostas[String(n)]==='X', duplicada=q.id===duplicateId
  const pagina=Number(q.pagina),imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
  const enunciado=correcoes[n]||q.trecho.replace(/\s+/g,' ').trim()
  const decisao={id:q.id,sha256_enunciado:hashAtual.get(q.id),materia,conteudo:`${topico}`,ano:2023,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — conhecimentos específicos — Cargo 5 — caderno 888_TBG_005_01',numero:n,numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela operação conceitual e pelo número de etapas de raciocínio; não é classificação oficial da banca.',classificacao_fonte:editalUrl,motivo:`Item ${n} classificado pela seção temática e pelo enunciado do caderno oficial do Cargo 5 — Gestão.`,enunciado,opcoes:['Certo','Errado'],resposta_correta:anulada?null:respostas[String(n)]==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabaritoUrl,arquivo:'GAB_DEFINITIVO_888_TBG_005_01.PDF',prova:'888_TBG_005_01.PDF',sha256:key.sha256,numero:n,resposta:respostas[String(n)],criterio:'Gabarito oficial definitivo do mesmo cargo e caderno.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],visual:{pagina,imagem,enunciado,texto_apoio:bases[n]||'',motivo:`Página ${pagina} do caderno oficial conferida visualmente; enunciado, seção, número e contexto vinculados ao item ${n}.`}}
  if(duplicada){decisao.apta_resolucao=false;decisao.inelegibilidade_motivo='duplicata_de_extracao';decisao.duplicada_de=canonicalId}
  return decisao
})
assert.equal(decisoes.filter(d=>d.apta_resolucao!==false).length,33)
assert.equal(decisoes.filter(d=>d.anulada).length,2)
assert.equal(new Set(fontes.filter(q=>q.id!==duplicateId).map(q=>q.numero)).size,33)
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:34,itens_oficiais_unicos:33,elegiveis:31,duplicadas:1,anuladas:[52,85],gabaritos:34,paginas:[1,2,3],imagens:true,publicado:false},null,2));process.exit(0)}

const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
// Preserve the official key source and fill the local answer index that stopped at item 90.
const atualizados=keys.map(x=>x.documento_id===documento?{...x,respostas}:x)
await fs.writeFile(ledger,atualizados.map(x=>JSON.stringify(x)).join('\n')+'\n')
const relatorio={...resultado,documento,concurso,cargo,registros_revisados:34,itens_oficiais_unicos:33,elegiveis:31,duplicata_marcada:duplicateId,anuladas:[52,85],respostas_definitivas_vinculadas:34,paginas_originais_conferidas:[1,2,3],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## TBG — Analista Júnior, Ênfase em Gestão, Cargo 5 — revisão v471\n\n- Revisei 34 registros: 33 números oficiais únicos, uma cópia duplicada do item 48 e os itens 52 e 85 anulados pela banca.\n- Classifiquei os itens pendentes em Administração, Materiais, Produção, Gestão de Pessoas, Custos, Gestão Ambiental, Matemática e Estatística, conforme os blocos do caderno.\n- Corrigi trechos truncados ou concatenados nos itens 43, 48, 49, 90 e 100; normalizei a notação do modelo de preço dos itens 86–90 e associei o box plot ao contexto do item 93.\n- Vinculei o gabarito definitivo a todos os registros e completei o índice local dos itens 91–100 a partir do gabarito oficial. Conferi visualmente as páginas 1 a 3.\n- Pacote local; não publicado na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))

