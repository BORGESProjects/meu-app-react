import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-embrapa-2025-tecnico-seguranca-trabalho-v472', documento='1b4f9b8df92464c2'
const prova='https://cdn.cebraspe.org.br/concursos/EMBRAPA_24/arquivos/043_EMBRAPA_002_01.pdf'
const gabaritoUrl='https://cdn.cebraspe.org.br/concursos/EMBRAPA_24/arquivos/Gab_Definitivo_043_EMBRAPA_002_01.PDF'
const editalUrl='https://www.embrapa.br/documents/10180/102397438/Edital%2Bde%2Babertura%2Batualizado.pdf/ccf62cdd-71d9-94db-ede6-e083b2094778'
const concurso='EMBRAPA — Concurso Público — 2025', cargo='Técnico — Área: Gestão de Pessoas — Subárea: Segurança e Saúde do Trabalho (Opção 40001814)'
const caderno=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===documento)
assert.equal(caderno?.url,prova)
const ledger='docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const keys=(await fs.readFile(ledger,'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse)
const key=keys.find(x=>x.documento_id===documento)
assert.equal(key?.gabarito_url,gabaritoUrl);assert.equal(key?.status,'tabela_lida');assert.equal(key.sha256,'f5d21b87ac092ef1a5de27e1740b2fde312db4af97d3e1cfae517da8bf33c358')
const temas={
  44:['SESMT e CIPA: coordenação, composição e atribuições','Média'],
  45:['Equipamentos de proteção coletiva: conceito e exemplos','Fácil'],
  46:['Equipamentos de proteção individual: dever de fornecimento do empregador','Fácil'],
  47:['Equipamentos de proteção individual: adaptação e certificado de aprovação','Média'],
  51:['Ergonomia: levantamento manual de cargas e alcance horizontal','Média'],
  53:['Ergonomia: pausas para recuperação psicofisiológica','Fácil'],
  54:['Acidente de trabalho: emissão de CAT e nexo técnico epidemiológico','Média'],
  57:['CIPA: acesso às comunicações de acidente de trabalho','Fácil'],
  59:['Acidente de trabalho: períodos de descanso no local de trabalho','Média'],
  60:['Acidente de trabalho: deslocamento em viagem a serviço ou para estudo','Média'],
  61:['NR 17: posto de trabalho com computador portátil','Média'],
  62:['NR 17: avaliação de desempenho e produtividade','Média'],
  63:['NR 17: postura sentada e adaptação do posto de trabalho','Fácil'],
  64:['NR 17: conforto acústico e térmico','Média'],
  65:['NR 17: avaliação ergonômica preliminar','Média'],
  74:['Trabalho em altura: aptidão e avaliação de saúde ocupacional','Média'],
  75:['Espaço confinado: avaliação atmosférica antes da entrada','Média'],
  76:['Gerenciamento de riscos ocupacionais: hierarquia de medidas preventivas','Média'],
  87:['PCMSO: relatório analítico e periodicidade','Média'],
  88:['SESMT: dimensionamento por grau de risco e número de empregados','Difícil'],
  89:['PCMSO: prontuário médico e responsabilidade de guarda','Média'],
  90:['PCMSO: guarda de prontuários após desligamento','Média'],
  91:['PGR: inventário de produtos químicos e resíduos','Média'],
  92:['Deveres do trabalhador: exames médicos ocupacionais','Fácil'],
  93:['EPI: responsabilidades do empregador e do trabalhador','Fácil'],
  94:['PCMSO: sigilo médico e acesso a resultados de exames','Média'],
  95:['Deveres do trabalhador em segurança e saúde no trabalho','Fácil'],
  96:['Insalubridade: umidade excessiva e laudo de inspeção','Média'],
  97:['PGR: exposição ao xileno como agente de risco químico','Fácil'],
  98:['Insalubridade: caracterização e adicional','Média'],
  99:['Insalubridade: risco biológico e coleta de lixo urbano','Média'],
  100:['LTCAT: descrição de técnica, aparelhagem e limites de exposição','Média']
}
const correcoes={
  44:'A coordenação do SESMT deve obrigatoriamente ser ocupada por um integrante deste serviço, podendo ser exercida por engenheiro do trabalho, por médico do trabalho ou por auxiliar de enfermagem do trabalho.',
  47:'O fabricante ou importador do EPI deverá promover, quando solicitado e tecnicamente viável, a adaptação do EPI detentor de certificado de aprovação para pessoas com deficiência, a fim de preservar sua eficácia.',
  51:'É vedado o levantamento não eventual de cargas que possa comprometer a segurança e a saúde do trabalhador quando a distância de alcance horizontal da pega for superior a 60 cm em relação ao corpo.',
  60:'Considere que um empregado realize, com meio de locomoção de sua propriedade, uma viagem para estudo financiada pelo seu empregador. Nesse caso, se o empregado sofrer um acidente na referida viagem, estará configurado um acidente de trabalho.',
  63:'Sempre que o trabalho puder ser executado na posição sentada, o posto de trabalho deve ser planejado ou adaptado para esta posição, a fim de se evitarem lesões osteomusculares inerentes à posição de pé.',
  75:'De acordo com a Norma Regulamentadora nº 33, as avaliações atmosféricas iniciais relativas à segurança do interior do espaço confinado devem ser realizadas imediatamente antes da entrada dos trabalhadores, visando verificar se o percentual de oxigênio, de dióxido de carbono e de outros gases potencialmente tóxicos está adequado.',
  76:'Situações de exposição ocupacional que coloquem em risco a saúde e a segurança do trabalhador, independentemente do uso de equipamentos de proteção individual, implicam obrigatória adoção de medidas de caráter preventivo.'
}
const bases={
  44:'Com base nas normas regulamentadoras de segurança do trabalho, julgue os itens relativos aos Serviços Especializados em Segurança e Medicina do Trabalho (SESMT) e à Comissão Interna de Prevenção de Acidentes (CIPA).',
  45:'A respeito dos equipamentos de proteção individual (EPI) e dos equipamentos de proteção coletiva (EPC), julgue os itens a seguir.',46:'A respeito dos equipamentos de proteção individual (EPI) e dos equipamentos de proteção coletiva (EPC), julgue os itens a seguir.',47:'A respeito dos equipamentos de proteção individual (EPI) e dos equipamentos de proteção coletiva (EPC), julgue os itens a seguir.',
  51:'Acerca de intervenções em ambiente de trabalho, julgue os itens seguintes.',53:'Acerca de intervenções em ambiente de trabalho, julgue os itens seguintes.',
  54:'Acerca da análise e da investigação de acidentes de trabalho, bem como da emissão da comunicação de acidente de trabalho (CAT), julgue os itens a seguir.',57:'Acerca da análise e da investigação de acidentes de trabalho, bem como da emissão da comunicação de acidente de trabalho (CAT), julgue os itens a seguir.',59:'Acerca da análise e da investigação de acidentes de trabalho, bem como da emissão da comunicação de acidente de trabalho (CAT), julgue os itens a seguir.',60:'Acerca da análise e da investigação de acidentes de trabalho, bem como da emissão da comunicação de acidente de trabalho (CAT), julgue os itens a seguir.',
  61:'Acerca de aspectos atinentes à ergonomia, julgue os itens a seguir, conforme as disposições da Norma Regulamentadora nº 17.',62:'Acerca de aspectos atinentes à ergonomia, julgue os itens a seguir, conforme as disposições da Norma Regulamentadora nº 17.',63:'Acerca de aspectos atinentes à ergonomia, julgue os itens a seguir, conforme as disposições da Norma Regulamentadora nº 17.',64:'Acerca de aspectos atinentes à ergonomia, julgue os itens a seguir, conforme as disposições da Norma Regulamentadora nº 17.',65:'Acerca de aspectos atinentes à ergonomia, julgue os itens a seguir, conforme as disposições da Norma Regulamentadora nº 17.',
  74:'Em relação à inspeção de rotina do local de trabalho em altura e em espaços confinados, julgue os itens a seguir.',75:'Em relação à inspeção de rotina do local de trabalho em altura e em espaços confinados, julgue os itens a seguir.',
  76:'Em relação ao gerenciamento de riscos ocupacionais e à metodologia de prevenção de acidentes de trabalho, julgue os itens seguintes.',
  87:'No que concerne ao dimensionamento adequado do SESMT e ao Programa de Controle Médico de Saúde Ocupacional (PCMSO), julgue os itens seguintes.',88:'No que concerne ao dimensionamento adequado do SESMT e ao Programa de Controle Médico de Saúde Ocupacional (PCMSO), julgue os itens seguintes.',89:'No que concerne ao dimensionamento adequado do SESMT e ao Programa de Controle Médico de Saúde Ocupacional (PCMSO), julgue os itens seguintes.',90:'No que concerne ao dimensionamento adequado do SESMT e ao Programa de Controle Médico de Saúde Ocupacional (PCMSO), julgue os itens seguintes.',
  91:'Julgue os itens subsequentes, que tratam do gerenciamento de riscos ocupacionais e dos direitos e deveres do trabalhador e do empregador em segurança e saúde no trabalho.',92:'Julgue os itens subsequentes, que tratam do gerenciamento de riscos ocupacionais e dos direitos e deveres do trabalhador e do empregador em segurança e saúde no trabalho.',93:'Julgue os itens subsequentes, que tratam do gerenciamento de riscos ocupacionais e dos direitos e deveres do trabalhador e do empregador em segurança e saúde no trabalho.',94:'Julgue os itens subsequentes, que tratam do gerenciamento de riscos ocupacionais e dos direitos e deveres do trabalhador e do empregador em segurança e saúde no trabalho.',95:'Julgue os itens subsequentes, que tratam do gerenciamento de riscos ocupacionais e dos direitos e deveres do trabalhador e do empregador em segurança e saúde no trabalho.',
  96:'Considerando os diversos aspectos relativos às condições ambientais do trabalho, julgue os itens subsequentes.',97:'Considerando os diversos aspectos relativos às condições ambientais do trabalho, julgue os itens subsequentes.',98:'Considerando os diversos aspectos relativos às condições ambientais do trabalho, julgue os itens subsequentes.',99:'Considerando os diversos aspectos relativos às condições ambientais do trabalho, julgue os itens subsequentes.',100:'Considerando os diversos aspectos relativos às condições ambientais do trabalho, julgue os itens subsequentes.'
}
const atuais=JSON.parse(await fs.readFile('tmp/embrapa-seguranca-v472-pendentes.json','utf8'))
assert.equal(atuais.length,34)
const hashAtual=new Map(atuais.map(q=>[q.id,q.hash])), ids=new Set(atuais.map(q=>q.id))
const fontes=caderno.questoes.filter(q=>ids.has(q.id));assert.equal(fontes.length,34)
const dupA='extr-6fe657f0436704da044f', canonA='extr-7e1657eb4056df7af90f',dupB='extr-efac11b7dc931d8db68d',canonB='extr-8a871b04c5b9748a8875'
assert.ok(ids.has(dupA)&&ids.has(canonA)&&ids.has(dupB)&&ids.has(canonB))
const decisoes=fontes.map(q=>{
  const n=Number(q.numero),[topico,dificuldade]=temas[n];assert.ok(topico&&key.respostas[String(n)],`Sem classificação/gabarito do item ${n}`)
  const anulada=key.respostas[String(n)]==='X', duplicada=[dupA,dupB].includes(q.id), pagina=Number(q.pagina), imagem=`paginas/${documento}-${String(pagina).padStart(4,'0')}.webp`
  const enunciado=correcoes[n]||q.trecho.replace(/\s+/g,' ').trim()
  const d={id:q.id,sha256_enunciado:hashAtual.get(q.id),materia:'Segurança do Trabalho',conteudo:topico,ano:2025,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — conhecimentos específicos — Opção 40001814 — caderno 043_EMBRAPA_002_01',numero:n,numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na aplicação e articulação das normas e dos conceitos de segurança e saúde no trabalho; não é nível oficial da banca.',classificacao_fonte:editalUrl,motivo:`Item ${n} classificado pela seção temática do caderno oficial da opção 40001814 e pelas normas de segurança e saúde no trabalho indicadas no enunciado.`,enunciado,opcoes:['Certo','Errado'],resposta_correta:anulada?null:key.respostas[String(n)]==='C'?0:1,anulada,apta_resolucao:true,gabarito_oficial:{fonte:gabaritoUrl,arquivo:'Gab_Definitivo_043_EMBRAPA_002_01.PDF',prova:'043_EMBRAPA_002_01.pdf',sha256:key.sha256,numero:n,resposta:key.respostas[String(n)],criterio:'Gabarito oficial definitivo da mesma opção e do mesmo caderno.'},remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado'],visual:{pagina,imagem,enunciado,texto_apoio:bases[n]||'',motivo:`Página ${pagina} do caderno oficial conferida visualmente; item ${n}, comando da seção e contexto associados.`}}
  if(duplicada){d.apta_resolucao=false;d.inelegibilidade_motivo='duplicata_de_extracao';d.duplicada_de=q.id===dupA?canonA:canonB}
  return d
})
assert.equal(decisoes.filter(d=>d.apta_resolucao!==false).length,32)
assert.equal(decisoes.filter(d=>d.anulada).length,2)
assert.equal(decisoes.filter(d=>d.apta_resolucao===false).length,2)
assert.equal(new Set(fontes.filter(q=>![dupA,dupB].includes(q.id)).map(q=>q.numero)).size,32)
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({lote:nome,registros:34,itens_oficiais_unicos:32,aptas_resolucao:32,correcao_automatica:30,duplicadas:2,anuladas:[63,75],gabaritos:34,paginas:[1,2,3],imagens:true,publicado:false},null,2));process.exit(0)}

const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio={...resultado,documento,concurso,cargo,registros_revisados:34,itens_oficiais_unicos:32,aptas_para_resolucao:32,elegiveis_para_correcao_automatica:30,duplicatas_marcadas:[dupA,dupB],anuladas:[63,75],respostas_definitivas_vinculadas:34,paginas_originais_conferidas:[1,2,3],prova,gabarito:gabaritoUrl,edital:editalUrl,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## EMBRAPA — Técnico em Segurança e Saúde do Trabalho, Opção 40001814 — revisão v472\n\n- Revisei 34 registros: 32 itens oficiais únicos, duas cópias duplicadas da extração e duas questões anuladas oficialmente (63 e 75).\n- Classifiquei os itens em subtemas de SESMT/CIPA, EPI/EPC, avaliação de riscos, ergonomia, CAT e investigação de acidentes, doenças ocupacionais, trabalho em altura/espaço confinado, PCMSO, PGR, deveres legais e agentes ambientais.\n- Reparei enunciados concatenados e erro de unidade no item 51; associei cada texto-base ao comando certo, e conferi visualmente as páginas 1 a 3.\n- Vinculei o gabarito definitivo do mesmo caderno. As anuladas ficam acessíveis, sem correção automática; duplicatas são inelegíveis para resolução.\n- Pacote local, sem publicação na nuvem.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital da EMBRAPA](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio,null,2))
