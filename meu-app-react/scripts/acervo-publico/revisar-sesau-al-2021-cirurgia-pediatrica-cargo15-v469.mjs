import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-sesau-al-2021-cirurgia-pediatrica-cargo15-v469'
const documento = 'd05edab0bcf1974d'
const prova = 'https://cdn.cebraspe.org.br/concursos/SESAU_AL_21/arquivos/603_SESAU_015_01.PDF'
const gabaritoUrl = 'https://cdn.cebraspe.org.br/concursos/SESAU_AL_21/arquivos/GAB_DEFINITIVO_603_SESAU_015_01.PDF'
const editalUrl = 'https://cdn.cebraspe.org.br/concursos/SESAU_AL_21/arquivos/ED_SESAU_AL_21_ABERTURA.PDF'
const concurso = 'SESAU/AL — Médico — Cirurgia Pediátrica — 2021'
const caderno = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === documento)
assert.equal(caderno?.url, prova)
const ledger = 'docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl'
const keys = (await fs.readFile(ledger, 'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse)
const key = keys.find(x => x.documento_id === documento)
assert.equal(key?.gabarito_url, gabaritoUrl)
assert.equal(key?.status, 'tabela_lida')
assert.equal(key?.sha256, '9d242fb8d49344289e4aa3410eede1d39f45d7893ee264fe4d418c817c74184b')

const assuntos = {
  55: ['Neonatologia e prematuridade', 'Transferência placentária de cálcio e hipocalcemia neonatal', 'Média'],
  56: ['Anomalias congênitas da face e do pescoço', 'Cisto do ducto tireoglosso: conduta e seguimento', 'Média'],
  57: ['Anomalias congênitas da face e do pescoço', 'Cisto branquial: origem embriológica', 'Média'],
  58: ['Anomalias congênitas da face e do pescoço', 'Cisto do ducto tireoglosso: técnica de Sistrunk e recorrência', 'Média'],
  59: ['Anomalias congênitas da face e do pescoço', 'Cistos branquiais: localização e apresentação clínica', 'Média'],
  60: ['Cirurgia da tireoide na criança', 'Nódulo tireoidiano pediátrico: risco de malignidade', 'Média'],
  61: ['Cirurgia da tireoide na criança', 'Indicações e extensão da tireoidectomia', 'Difícil'],
  62: ['Torciolo congênito', 'Indicação de tratamento operatório por faixa etária', 'Média'],
  63: ['Torciolo congênito', 'Histopatologia do músculo esternocleidomastoideo', 'Média'],
  64: ['Afecções da parede torácica', 'Pectus excavatum: técnicas corretivas', 'Média'],
  65: ['Afecções da parede torácica', 'Pectus excavatum: morfologia e classificação', 'Média'],
  66: ['Hérnias do diafragma', 'Hérnia diafragmática congênita e suporte por ECMO', 'Difícil'],
  67: ['Hérnias do diafragma', 'Hipertensão pulmonar neonatal e indicação de ECMO', 'Difícil'],
  68: ['Anomalias cirúrgicas do esôfago', 'Atresia esofágica: diagnóstico pré-natal', 'Média'],
  69: ['Anomalias cirúrgicas do esôfago', 'Acalasia: alterações histoquímicas dos plexos esofágicos', 'Difícil'],
  76: ['Anomalias da parede abdominal', 'Gastrosquise: associação com outras anomalias', 'Média'],
  77: ['Anomalias da parede abdominal', 'Gastrosquise: localização e hipóteses embriológicas', 'Difícil'],
  78: ['Trauma pediátrico', 'Trauma abdominal fechado e lesão esplênica', 'Fácil'],
  79: ['Trauma pediátrico', 'Epidemiologia e mecanismo do trauma infantil', 'Média'],
  80: ['Doenças das vias biliares', 'Atresia biliar: achados histopatológicos', 'Média'],
  81: ['Doenças das vias biliares', 'Atresia biliar e hipertensão portal na infância', 'Difícil'],
  82: ['Doenças das vias biliares', 'Colelitíase pediátrica: etiologia', 'Média'],
  83: ['Cirurgia do pâncreas na criança', 'Pancreatite aguda pediátrica: causas e diagnóstico', 'Média'],
  105: ['Neurocirurgia pediátrica', 'Meningomielocele e hidrocefalia: associação com nível da lesão', 'Média'],
  106: ['Oncologia cirúrgica pediátrica', 'Neuroblastoma de alto risco: imunoterapia anti-GD2', 'Difícil'],
  107: ['Neurocirurgia pediátrica', 'Malformação de Chiari: classificação', 'Média'],
  108: ['Urologia pediátrica', 'Rim displásico multicístico: nefrectomia e seguimento', 'Média'],
  109: ['Oncologia cirúrgica pediátrica', 'Tumor de Wilms e neuroblastoma: origem e apresentação renal', 'Média'],
  110: ['Hemangiomas infantis', 'Epidemiologia e fatores associados', 'Fácil'],
  111: ['Hemangiomas infantis', 'Betabloqueadores: uso do propranolol e eventos adversos', 'Média'],
  112: ['Hemangiomas infantis', 'Hemangiomas viscerais e associações com lesões cutâneas', 'Média'],
  113: ['Hemangiomas infantis', 'Fase proliferativa e evolução natural', 'Fácil'],
  114: ['Hemangiomas infantis', 'Ultrassonografia e padrão vascular', 'Média'],
  115: ['Hemangiomas infantis', 'Tratamento farmacológico e inibição da angiogênese', 'Média']
}

const enunciados = {
  55: 'O cálcio é transportado ativamente pela placenta, e, da quantidade total de cálcio transferido através da placenta, a maior parte ocorre após 28 semanas de gestação, o que explica parcialmente a elevada incidência de hipocalcemia em recém-nascidos prematuros.',
  56: 'A conduta médica é expectante para os cistos tireoglossos pequenos, devendo-se fazer acompanhamento anual e intervir cirurgicamente apenas se houver quadros infecciosos.',
  57: 'O cisto branquial mais comum é derivado do primeiro arco branquial.',
  58: 'A excisão do ducto tireoglosso juntamente com o cisto diminui a recorrência deste último.',
  59: 'Cistos do segundo arco branquial comumente se apresentam como massa próxima do polo superior da glândula parótida e são mais comumente vistos em crianças maiores e adultos jovens.',
  60: 'Nódulos solitários da tireoide em crianças apresentam uma taxa muito maior de risco de câncer, em comparação com a população adulta.',
  61: 'A tireoidectomia total é o procedimento mais recomendado em pacientes que apresentam nódulos solitários da tireoide que estejam causando sintomas de compressão e (ou) tireotoxicose ou que sejam suspeitos de malignidade.',
  62: 'Em se tratando de torcicolo congênito, a intervenção operatória é necessária em mais de 90% dos recém-nascidos e lactentes de até três meses de vida.',
  63: 'A avaliação por microscopia óptica comum do músculo esternocleidomastoideo envolvido no torcicolo congênito demonstra substituição de feixes musculares por tecido fibroso denso.',
  64: 'A rotação do esterno (sternal turnover) geralmente é o procedimento preconizado para crianças com pectus excavatum.',
  65: 'A configuração mais comum do pectus excavatum é uma combinação de depressão ipsilateral e protrusão carinada contralateral.',
  66: 'A toracoscopia é o procedimento indicado em recém-nascido com hérnia diafragmática congênita em uso de ECMO (membrana de oxigenação extracorpórea).',
  67: 'Recém-nascido com hipertensão pulmonar importante e algum grau de hipoplasia pulmonar refratária à terapia convencional deverá ser transferido para reanimação com ECMO (membrana de oxigenação extracorpórea).',
  68: 'A combinação de polihidrâmnio com estômago fetal pequeno ou ausente não apresenta valor preditivo positivo para atresia esofágica.',
  69: 'A avaliação histoquímica de biópsia do esôfago de pacientes com acalasia demonstra uma redução significativa em todos os neuropeptídeos, particularmente polipeptídeo intestinal vasoativo, galanina e neuropeptídeo Y.',
  76: 'Na gastrosquise há incidência muito maior de anomalias e defeitos cromossômicos associados.',
  77: 'A gastrosquise normalmente ocorre à esquerda da haste umbilical, sendo a hipótese prevalecente a de que o defeito ocorre no local da involução da segunda veia umbilical (esquerda).',
  78: 'O baço é o órgão intra-abdominal mais comumente lesado em crianças.',
  79: 'O trauma é a principal causa de morte e incapacidade em crianças: mais de 90% das admissões de trauma pediátrico em todo o mundo são o resultado de um mecanismo contuso.',
  80: 'O aspecto histológico do fígado na atresia biliar é caracterizado por edema do trato portal, obstrução e proliferação do ducto biliar, um pequeno infiltrado de células e quantidade variável de formação de células gigantes.',
  81: 'Em crianças, a hipertensão portal é causada principalmente por cirrose hepática secundária a atresia de vias biliares em até 50% dos casos.',
  82: 'Em cirurgia pediátrica, o diagnóstico de colelitíase é comum, e a maioria dos cálculos biliares tem como causa as anomalias congênitas do trato biliar.',
  83: 'A causa mais comum de pancreatite na infância e adolescência é o trauma contuso, cujo diagnóstico pode ser confirmado pela elevação da amilase sérica.',
  105: 'Em crianças portadoras de meningomielocele, a hidrocefalia é bastante comum, sendo aquelas de localização torácica as que têm a maior incidência dessa associação, quando comparadas às de localizações sacrais inferiores.',
  106: 'Anticorpos quiméricos recombinantes, apesar de promissores no tratamento de neuroblastomas de alto risco em crianças, ainda não são recomendados como opção terapêutica in vivo.',
  107: 'O encontro de herniação anormal das tonsilas cerebelares abaixo do nível do forame magno e espinha bífida aberta em recém-nascidos classifica-se como malformação de Chiari grau I.',
  108: 'Em crianças com rim displásico multicístico, devido à eventual malignidade, a nefrectomia profilática não se justifica, sendo recomendado o acompanhamento ultrassonográfico até por volta dos 4 anos de idade, para decisão cirúrgica ou não.',
  109: 'O tumor de Wilms, de maneira geral, invade o rim, enquanto o neuroblastoma surge do interior do rim e distorce sua configuração interna.',
  110: 'A incidência de hemangiomas infantis é maior em bebês nascidos a termo, de cor negra e do sexo masculino.',
  111: 'Os betabloqueadores, como o propranolol, são usados raramente e com muita cautela no tratamento dos hemangiomas infantis, pois são muito pouco tolerados por crianças, por causarem bradicardia, hipoglicemia e hipotensão arterial.',
  112: 'Lesões internas viscerais são comuns em associação com hemangiomas cutâneos, acometendo principalmente o fígado e o trato gastrintestinal.',
  113: 'A fase proliferativa do hemangioma infantil é marcada por um crescimento rápido durante os primeiros 6 a 8 meses de vida, e geralmente atinge o platô com a idade de 10 a 12 meses.',
  114: 'A ultrassonografia dos hemangiomas na fase proliferativa demonstra massa com parênquima denso e vascularização de fluxo rápido.',
  115: 'A inibição da angiogênese pelos corticosteroides é uma ótima opção de tratamento, quando necessário, dos hemangiomas infantis, com altas taxas de boa resposta terapêutica.'
}

const contextos = {
  55: 'Sabendo que, para a realização de procedimentos cirúrgicos e hospitalização pediátrica, é necessário conhecer a fisiologia do crescimento e do desenvolvimento, julgue os itens sobre fisiologia neonatal e prematuridade.',
  56: 'Defeitos congênitos da face e do pescoço são frequentes e têm impacto na saúde pública. Julgue os itens sobre anomalias congênitas da face e do pescoço.',
  57: 'Defeitos congênitos da face e do pescoço são frequentes e têm impacto na saúde pública. Julgue os itens sobre anomalias congênitas da face e do pescoço.',
  58: 'Defeitos congênitos da face e do pescoço são frequentes e têm impacto na saúde pública. Julgue os itens sobre anomalias congênitas da face e do pescoço.',
  59: 'Defeitos congênitos da face e do pescoço são frequentes e têm impacto na saúde pública. Julgue os itens sobre anomalias congênitas da face e do pescoço.',
  60: 'Em qualquer idade, a tireoide pode apresentar alterações com repercussões clínicas. Julgue os itens sobre alterações e cirurgia da tireoide na criança.',
  61: 'Em qualquer idade, a tireoide pode apresentar alterações com repercussões clínicas. Julgue os itens sobre alterações e cirurgia da tireoide na criança.',
  62: 'O torcicolo congênito é uma contratura unilateral do músculo esternocleidomastoideo que, em geral, se manifesta no período neonatal ou em lactentes. Julgue os itens subsequentes.',
  63: 'O torcicolo congênito é uma contratura unilateral do músculo esternocleidomastoideo que, em geral, se manifesta no período neonatal ou em lactentes. Julgue os itens subsequentes.',
  64: 'A correção de alterações da parede torácica, principalmente do pectus excavatum, pode ser necessária para melhorar a performance respiratória. Julgue os itens sobre esse assunto.',
  65: 'A correção de alterações da parede torácica, principalmente do pectus excavatum, pode ser necessária para melhorar a performance respiratória. Julgue os itens sobre esse assunto.',
  66: 'Um recém-nascido apresentou, imediatamente ao nascimento, dificuldade respiratória, taquipneia, grunhido e cianose. A hipótese diagnóstica foi anomalia congênita do diafragma. Julgue os itens relacionados ao caso.',
  67: 'Um recém-nascido apresentou, imediatamente ao nascimento, dificuldade respiratória, taquipneia, grunhido e cianose. A hipótese diagnóstica foi anomalia congênita do diafragma. Julgue os itens relacionados ao caso.',
  68: 'Na infância, vômitos, disfagia, dor torácica, infecções respiratórias recorrentes e perda de peso podem indicar anomalias cirúrgicas do esôfago. Julgue os itens subsequentes.',
  69: 'Na infância, vômitos, disfagia, dor torácica, infecções respiratórias recorrentes e perda de peso podem indicar anomalias cirúrgicas do esôfago. Julgue os itens subsequentes.',
  76: 'A avaliação ultrassonográfica pré-natal permite diagnosticar anomalias da parede abdominal da criança. Julgue os itens seguintes.',
  77: 'A avaliação ultrassonográfica pré-natal permite diagnosticar anomalias da parede abdominal da criança. Julgue os itens seguintes.',
  78: 'A orientação de pais e cuidadores para prevenir acidentes na infância é fundamental para evitar mortes e sequelas. Julgue os itens sobre trauma pediátrico.',
  79: 'A orientação de pais e cuidadores para prevenir acidentes na infância é fundamental para evitar mortes e sequelas. Julgue os itens sobre trauma pediátrico.',
  80: 'O diagnóstico precoce de patologias das vias biliares é fundamental para evitar repercussões clínicas irreversíveis. Julgue os itens subsequentes.',
  81: 'O diagnóstico precoce de patologias das vias biliares é fundamental para evitar repercussões clínicas irreversíveis. Julgue os itens subsequentes.',
  82: 'No que se refere a patologias pediátricas do trato gastrointestinal, julgue o item sobre colelitíase.',
  83: 'No que se refere à abordagem cirúrgica de patologias do pâncreas e assuntos correlacionados, julgue o item.',
  105: 'Em relação às patologias, aos métodos diagnósticos e aos tratamentos recomendados em cirurgia pediátrica, julgue os itens subsequentes.',
  106: 'Em relação às patologias, aos métodos diagnósticos e aos tratamentos recomendados em cirurgia pediátrica, julgue os itens subsequentes.',
  107: 'Em relação às patologias, aos métodos diagnósticos e aos tratamentos recomendados em cirurgia pediátrica, julgue os itens subsequentes.',
  108: 'Em relação às patologias, aos métodos diagnósticos e aos tratamentos recomendados em cirurgia pediátrica, julgue os itens subsequentes.',
  109: 'Em relação às patologias, aos métodos diagnósticos e aos tratamentos recomendados em cirurgia pediátrica, julgue os itens subsequentes.',
  110: 'Acerca de hemangiomas em cirurgia pediátrica, julgue os itens a seguir.',
  111: 'Acerca de hemangiomas em cirurgia pediátrica, julgue os itens a seguir.',
  112: 'Acerca de hemangiomas em cirurgia pediátrica, julgue os itens a seguir.',
  113: 'Acerca de hemangiomas em cirurgia pediátrica, julgue os itens a seguir.',
  114: 'Acerca de hemangiomas em cirurgia pediátrica, julgue os itens a seguir.',
  115: 'Acerca de hemangiomas em cirurgia pediátrica, julgue os itens a seguir.'
}

const gabarito111a120 = { 111: 'E', 112: 'E', 113: 'C', 114: 'C', 115: 'C', 116: 'E', 117: 'C', 118: 'C', 119: 'C', 120: 'E' }
const respostas = { ...key.respostas, ...Object.fromEntries(Object.entries(gabarito111a120).map(([n, r]) => [String(n), r])) }
assert.equal(Object.keys(respostas).filter(n => Number(n) >= 51 && Number(n) <= 120).length, 70)

const ids = new Set([
  'extr-738affc4c50da57026a6','extr-1612cc3b8f4c2d91997e','extr-0215b2ad27a532796a6a','extr-ca20b952f50b51170289',
  'extr-45b52a1a833db74bf093','extr-a0b7cf3e9fde69bf5ee9','extr-c5cae05ac37ebba37d26','extr-a7ca3740332a8e0346e0',
  'extr-ad2741887dc4bd57543e','extr-16f5d01bc41d42d3a3c3','extr-39eb8aa8dfbf3a21b323','extr-74e611c245eef5b638f8',
  'extr-32e146ff44d6c9c1fcd8','extr-038c3a961c3ee8ddd131','extr-e7a2a1d0056db613b1ac','extr-31b085e2f8212d4cdb95',
  'extr-14fed64b65ee61703383','extr-0408ea9387cb5bbc54dd','extr-ee9a32b20cd6615b0b31','extr-6629fe22535d9d03e30c',
  'extr-74559f8efeeda9fb7dfc','extr-19b0d711d5197e305dee','extr-aca660a3c92d13e9a8f0','extr-d6d5a1428de6f4b543b8',
  'extr-d1aee68a0bfd5f0c352e','extr-018fe525652659985cd1','extr-70c362c3eedf8a9ac855','extr-3f7388bb0c915f132ac9',
  'extr-9577743e83f709b340ea','extr-a4c21d93ab952668d004','extr-17ac8403061246ce5d6d','extr-423e810f738caac72e6f',
  'extr-b01baec75d7fbb3136c6','extr-54de6d56b4bdb744487a'
])
const fontes = caderno.questoes.filter(q => ids.has(q.id))
assert.equal(fontes.length, 34, 'A lista de itens oficiais não corresponde ao pacote pendente')
assert.equal(new Set(fontes.map(q => q.numero)).size, fontes.length, 'Há numeração repetida no caderno oficial')
const atuais = JSON.parse(await fs.readFile('tmp/sesau-al-cirurgia-pediatrica-v469-hashes.json', 'utf8'))
assert.equal(atuais.length, 34)
assert.equal(atuais.filter(q => q.classificacao_pendente).length, 34, 'O conjunto ativo mudou desde a extração dos hashes')
const hashAtual = new Map(atuais.map(q => [q.id, q.hash]))

const decisoes = fontes.map(q => {
  const n = Number(q.numero)
  const [sub, topico, dificuldade] = assuntos[n]
  assert.ok(sub && enunciados[n] && respostas[String(n)], `Dados incompletos para o item ${n}`)
  const pagina = Number(q.pagina)
  const imagem = `paginas/${documento}-${String(pagina).padStart(4, '0')}.webp`
  return {
    id: q.id,
    sha256_enunciado: hashAtual.get(q.id),
    materia: 'Medicina',
    conteudo: `Cirurgia Pediátrica — ${sub}: ${topico}`,
    ano: 2021,
    concurso,
    cargo: 'Médico — Especialidade: Cirurgia Pediátrica',
    banca: 'CEBRASPE',
    organizadora: 'CEBRASPE',
    aplicacao: 'Prova objetiva — conhecimentos específicos — Cargo 15 — caderno 603_SESAU_015_01',
    numero: n,
    numero_original: n,
    pagina,
    dificuldade,
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pelo grau de integração clínica, diagnóstico e decisão cirúrgica; não é classificação oficial da banca.',
    classificacao_fonte: editalUrl,
    motivo: `Item ${n} classificado por subtema de Cirurgia Pediátrica conforme o enunciado, a seção correspondente do caderno oficial e o conteúdo programático do Cargo 15.`,
    enunciado: enunciados[n],
    opcoes: ['Certo', 'Errado'],
    resposta_correta: respostas[String(n)] === 'C' ? 0 : 1,
    anulada: false,
    apta_resolucao: true,
    gabarito_oficial: { fonte: gabaritoUrl, arquivo: 'GAB_DEFINITIVO_603_SESAU_015_01.PDF', prova: '603_SESAU_015_01.PDF', sha256: key.sha256, numero: n, resposta: respostas[String(n)], criterio: 'Gabarito oficial definitivo do mesmo cargo e caderno; itens 111–120 conferidos diretamente no documento oficial, complementando o índice local anteriormente truncado no item 110.' },
    remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente', 'dificuldade_nao_informada', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao', 'texto_de_outro_bloco', 'enunciado_incompleto', 'gabarito_oficial_nao_vinculado'],
    visual: { pagina, imagem, enunciado: enunciados[n], texto_apoio: contextos[n] || '', motivo: `Página ${pagina} do caderno oficial conferida visualmente; numeração, enunciado e bloco clínico do item ${n} confirmados.` }
  }
})

for (const d of decisoes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ lote: nome, registros: decisoes.length, itens_unicos: fontes.length, respostas_oficiais: decisoes.filter(x => x.gabarito_oficial).length, itens_sem_contexto_adicional: decisoes.filter(x => !x.visual.texto_apoio).map(x => x.numero), paginas_conferidas: [...new Set(decisoes.map(x => x.pagina))], imagens_existentes: true, publicado: false }, null, 2))
  process.exit(0)
}

const resultado = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes })
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio = { ...resultado, documento, concurso, cargo: 'Médico — Especialidade: Cirurgia Pediátrica', registros_revisados: 34, itens_oficiais_unicos: 34, duplicatas_marcadas: 0, respostas_definitivas_vinculadas: 34, gabarito_local_complementado_itens: [111,112,113,114,115,116,117,118,119,120], paginas_originais_conferidas: [1,2,3], prova, gabarito: gabaritoUrl, edital: editalUrl, publicado: false }
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## SESAU/AL — Médico, Cirurgia Pediátrica, Cargo 15 — revisão v469\n\n- Classifiquei 34 itens pendentes em subtemas de neonatologia, anomalias congênitas, tireoide, torcicolo, parede torácica, hérnias diafragmáticas, esôfago, gastroenterologia, vias biliares, neurocirurgia e hemangiomas.\n- Corrigi enunciados concatenados com os blocos seguintes e restabeleci os textos-base compartilhados; conferi visualmente as páginas 1 a 3 e mantive suas imagens de origem.\n- Associei o gabarito definitivo oficial item a item. A leitura do PDF oficial completou localmente o índice que estava truncado em 110, acrescentando as respostas 111–120.\n- Validação e publicação na nuvem são etapas separadas; este pacote permanece local.\n- Fontes: [prova oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>), [edital e conteúdo do Cargo 15](<${editalUrl}>).\n`)
console.log(JSON.stringify(relatorio, null, 2))
