import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'

const origem = raizesAtuais.find(r => r.includes('revisao-excecoes-pcdf-ebserh-v141'))
if (!origem) throw new Error('Base v141 não encontrada')
const documento = '1a4545b15e45f1aa'
const questoes = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${documento}.json`, 'utf8'))
if (questoes.length !== 75 || questoes.some(q => q.concurso !== 'ANSA 26')) throw new Error('Exportação ANSA inesperada ou desatualizada')

const prova = 'https://cdn.cebraspe.org.br/concursos/ansa_26/arquivos/23D430B11EE71FF37B03F178DBF35181906255CFDE112A70D1B2CCE14AF7CABB.pdf'
for (const q of questoes) for (const img of new Set([q.imagem, ...(q.contexto || []).map(x => x.imagem)].filter(Boolean))) await fs.access(`public/acervo-extraido/${img}`)
const grupos = [
  { de: 35, ate: 35, materia: 'Eletromagnetismo', conteudo: 'Grandezas magnéticas: relutância e circuito magnético' },
  { de: 36, ate: 40, materia: 'Circuitos Elétricos', conteudo: 'Circuitos de corrente alternada: regime senoidal, fasores, impedância e potência' },
  { de: 41, ate: 45, materia: 'Circuitos Elétricos', conteudo: 'Circuitos trifásicos: medição de potência, tensão e corrente' },
  { de: 46, ate: 50, materia: 'Eletromagnetismo', conteudo: 'Circuitos magnéticos, força entre condutores, materiais ferromagnéticos e indução' },
  { de: 51, ate: 55, materia: 'Máquinas Elétricas', conteudo: 'Transformadores trifásicos: rendimento, perdas, correntes e relação de transformação' },
  { de: 56, ate: 59, materia: 'Máquinas Elétricas', conteudo: 'Máquinas de corrente contínua, síncronas e de indução' },
  { de: 60, ate: 67, materia: 'Acionamentos Elétricos', conteudo: 'Partida de motores, conjugado, corrente de partida e inversores de frequência' },
  { de: 68, ate: 71, materia: 'Eletrônica Analógica', conteudo: 'Amplificadores operacionais, transistores, diodos e fontes retificadoras' },
  { de: 72, ate: 75, materia: 'Eletrônica Digital', conteudo: 'Circuitos sequenciais, portas universais e famílias lógicas TTL e CMOS' },
  { de: 76, ate: 79, materia: 'Instalações Elétricas', conteudo: 'Nobreaks, baterias, aterramento TN-C-S e proteção de motores' },
  { de: 80, ate: 81, materia: 'Iluminação', conteudo: 'Iluminação industrial: lâmpadas, eficiência e grandezas fotométricas' },
  { de: 82, ate: 83, materia: 'Eletrônica de Potência', conteudo: 'Retificadores controlados e tiristores SCR' },
  { de: 84, ate: 85, materia: 'Automação e Controle', conteudo: 'Redes industriais CANBus e sistemas de malha aberta e fechada' },
  { de: 86, ate: 88, materia: 'Instalações Elétricas', conteudo: 'Aterramento: medição de resistência, proteção e eletrodos' },
  { de: 89, ate: 91, materia: 'Proteção contra Descargas Atmosféricas', conteudo: 'SPDA: descarga piloto, método de Franklin e níveis de proteção' },
  { de: 92, ate: 94, materia: 'Segurança em Instalações Elétricas', conteudo: 'Equipamentos de proteção individual e coletiva' },
  { de: 95, ate: 97, materia: 'Segurança do Trabalho', conteudo: 'NR-10: capacitação, desenergização e planejamento de serviços' },
  { de: 98, ate: 100, materia: 'Medidas Elétricas', conteudo: 'Instrumentos e ferramentas para instalações e serviços de eletricidade' }
]
const comandos = new Map([
  [35, 'Julgue os itens a seguir, acerca das grandezas elétricas e magnéticas.'],
  [36, 'Julgue os itens subsequentes, a respeito da operação em regime permanente senoidal do circuito elétrico ilustrado na figura da página da prova, no qual v(t) = 100·cos(t + 30°).'],
  [41, 'Julgue os itens que se seguem, acerca da operação em regime permanente senoidal do circuito elétrico trifásico ilustrado na página da prova, em que Z = 6 + j8 Ω.'],
  [46, 'No que se refere aos conceitos básicos de eletromagnetismo, julgue os itens subsequentes.'],
  [51, 'Uma subestação industrial alimenta uma planta de médio porte por meio de um transformador trifásico de potência nominal igual a 300 kVA, que transforma uma rede de 10 kV para 380 V, com ligação delta-estrela aterrada. As perdas no núcleo são de 8 kW e as perdas no cobre, a plena carga, são de 12 kW. Com base nessa situação hipotética, julgue os itens a seguir.'],
  [56, 'Acerca de diferentes tipos de máquinas elétricas, julgue os itens seguintes.'],
  [60, 'Em uma cooperativa de reciclagem, um motor de indução trifásico aciona uma esteira de transporte de itens para reciclagem. O conjugado nominal do motor é 300 N·m, o conjugado resistente da carga acoplada é 400 N·m e o conjugado de partida é 1,5 vez o conjugado nominal. Considerando esse cenário, julgue os itens seguintes.'],
  [64, 'No que se refere a acionamentos e controles elétricos, julgue os itens subsequentes.'],
  [68, 'Julgue os itens a seguir, relativos a conceitos e características de dispositivos de eletrônica analógica.'],
  [72, 'Considerando conceitos e características de dispositivos e famílias de circuitos integrados de eletrônica digital, julgue os próximos itens.'],
  [76, 'Acerca de nobreaks, de instalações elétricas de baixa tensão e da proteção de sistemas elétricos industriais, julgue os itens a seguir.'],
  [80, 'No que se refere à iluminação industrial, julgue os próximos itens.'],
  [82, 'Julgue os itens subsequentes, que versam a respeito de eletrônica de potência. A figura da questão 82, com fonte alternada, SCR e carga resistiva, permanece vinculada à página 2 da prova.'],
  [84, 'Com relação à automação industrial, julgue os itens subsecutivos.'],
  [86, 'Em relação ao princípio de funcionamento de sistemas de aterramento e aos procedimentos de implantação desses sistemas, julgue os itens a seguir.'],
  [89, 'Em relação às descargas atmosféricas e ao sistema de proteção em edificações, julgue os itens que se seguem.'],
  [92, 'No que diz respeito à utilização dos equipamentos de proteção individual e coletiva, julgue os seguintes itens.'],
  [95, 'Acerca das diretrizes definidas na NR-10, relacionada à segurança em instalações elétricas, julgue os itens subsecutivos.'],
  [98, 'Julgue os itens a seguir, relativos a materiais e ferramentas utilizados em instalações e serviços de eletricidade.']
])
const duplicatas = new Map([
  ['extr-1b1d46cb64547774daf7', 'extr-a640a314e4ee4dbc1261'],
  ['extr-02a6bc078ee339b1e4ef', 'extr-dce8895177bdc1a7b7e5'],
  ['extr-bf48b5fefd4e1a0126c8', 'extr-638ab41f62391f09cf0d'],
  ['extr-8351ff28ad65d04a6605', 'extr-51f2bd01ede819f2ef9b'],
  ['extr-06d79440f65f5c0faa0c', 'extr-7f8ff821f436c01546ea'],
  ['extr-18567eaf8742bdee39ac', 'extr-585502d1caaf57473984'],
  ['extr-7135e3bb645b247eb0c4', 'extr-040eeb2c0d5d2e04ef2d'],
  ['extr-e58bcb32409353899dfd', 'extr-1fe430ae1a5b083f4c6e'],
  ['extr-b6a62ec351287becd40b', 'extr-8343627c97a07fbb46f6']
])
const facil = new Set([35, 38, 47, 49, 52, 56, 65, 66, 71, 72, 73, 77, 83, 87, 92, 93, 98])
const dificil = new Set([37, 40, 41, 44, 51, 54, 60, 62, 64, 67, 69, 82, 91])
function corrigirEnunciado(q) {
  const n = Number(q.numero)
  let s = q.enunciado.replace(/\s+/g, ' ').trim()
  const cortes = new Map([
    [39, '49 O módulo da impedância'], [40, 'Espaço livre'], [45, 'No que se refere aos conceitos básicos'],
    [50, 'Uma subestação industrial alimenta'], [59, 'Em uma cooperativa de reciclagem'],
    [71, 'Considerando conceitos e características'], [79, 'No que se refere à iluminação industrial'],
    [85, 'CEBRASPE – ANSA – Edital: 2026'], [100, 'Espaço livre']
  ])
  const corte = cortes.get(n)
  if (corte && s.includes(corte)) s = s.slice(0, s.indexOf(corte)).trim()
  const fixes = [
    [/Zp\s*=\s*j1\s*O/iu, 'Z_{cap} = -j1 Ω'], [/Zcap\s*=\s*j1\s*Ω/iu, 'Z_{cap} = -j1 Ω'],
    [/wattimetros/iu, 'wattímetros'], [/amperimetro/iu, 'amperímetro'],
    [/paralelo\s+s/iu, 'paralelos'], [/paralelo s/iu, 'paralelos'],
    [/10\s*√\s*V/iu, '10√3 V'], [/10\s*3\s*V/iu, '10√3 V'],
    [/7\s*/u, '7 Ω'],
    [/invertendo\s*-\s*se/iu, 'invertendo-se'], [/estrela\s*-\s*triângulo/iu, 'estrela-triângulo'],
    [/t\s+ensão/iu, 'tensão'], [/digitai\s+s/iu, 'digitais'], [/não\s*-\s*e/iu, 'não-e'],
    [/não\s*-\s*ou/iu, 'não-ou'], [/integ\s+rados/iu, 'integrados'],
    [/TN\s*-\s*C\s*-\s*S/iu, 'TN-C-S'], [/insta\s+lação/iu, 'instalação'],
    [/trabal\s+hadores/iu, 'trabalhadores'], [/manu\s+al/iu, 'manual'],
    [/10\s*kV/iu, '10 kV'], [/380\s*V/iu, '380 V']
  ]
  for (const [re, replacement] of fixes) s = s.replace(re, replacement)
  return s
}

const decisoes = questoes.map(q => {
  const n = Number(q.numero), grupo = grupos.find(g => n >= g.de && n <= g.ate)
  if (!grupo) throw new Error(`Item ANSA fora da taxonomia: ${n}`)
  const isDuplicate = duplicatas.has(q.id)
  return {
    id: q.id, sha256_enunciado: hashRevisao(q.enunciado), materia: grupo.materia, conteudo: grupo.conteudo,
    concurso: 'ANSA 2026 — Ênfase 24: Projetos, Construção e Montagem – Elétrica', ano: 2026,
    numero_original: n, pagina: q.pagina,
    dificuldade: facil.has(n) ? 'Fácil' : dificil.has(n) ? 'Difícil' : 'Média', dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial baseada no raciocínio técnico e na integração de conceitos exigidos; não é escala psicométrica da banca.',
    classificacao_fonte: prova,
    motivo: `Classificação individual pelo item ${n}, bloco temático, edital oficial e página correspondente do caderno ANSA 2026.` ,
    texto_apoio: [...comandos].filter(([inicio]) => n >= inicio).at(-1)?.[1] || comandos.get(35),
    ...(n === 40 ? { apta_resolucao: true, remover_pendencias: ['texto_corrompido_requer_reconstrucao'] } : {}),
    ...(!isDuplicate ? { enunciado: corrigirEnunciado(q) } : {}),
    ...(isDuplicate ? { apta_resolucao: false, duplicada_de: duplicatas.get(q.id), inelegibilidade_motivo: 'Cópia OCR do mesmo item da mesma edição; versão redundante mantida apenas para auditoria.' } : {})
  }
})
if (new Set(questoes.map(q => Number(q.numero))).size !== 66 || decisoes.length !== 75) throw new Error('Contagem inesperada de itens ou cópias OCR')
for (const [id, destino] of duplicatas) if (!questoes.some(q => q.id === destino)) throw new Error(`Destino de duplicata não exportado: ${id} -> ${destino}`)

const rel = await aplicarRevisoesIndividuais({ nome: 'revisao-ansa-eletrica-2026-v142', base: origem, decisoes })
const raiz = 'tmp/revisao-profissional/revisao-ansa-eletrica-2026-v142/acervo-extraido'
if (!raizesAtuais.includes(raiz)) raizesAtuais.unshift(raiz)
const atualPath = 'scripts/acervo-publico/acervo-atual.mjs'
let atual = await fs.readFile(atualPath, 'utf8')
if (!atual.includes(`raizesAtuais.unshift('${raiz}')`)) atual = atual.replace('export async function lerArquivoAtual', `raizesAtuais.unshift('${raiz}')\nexport async function lerArquivoAtual`)
await fs.writeFile(atualPath, atual)
const reportPath = 'docs/acervo/revisao-profissional/RELATORIO.md'
let report = await fs.readFile(reportPath, 'utf8')
const marcadorRelatorio = '\n\n## Revisão ANSA — Ênfase 24, elétrica — v142\n'
const secaoAnterior = report.indexOf(marcadorRelatorio)
if (secaoAnterior >= 0) report = report.slice(0, secaoAnterior)
report += `\n\n## Revisão ANSA — Ênfase 24, elétrica — v142\n\n- Revisei 75 registros pendentes/inaptos da prova de 26/04/2026, cobrindo 66 itens distintos (35–100). Classifiquei circuitos CA e trifásicos, eletromagnetismo, transformadores, máquinas e acionamentos, eletrônica analógica/digital/de potência, instalações, automação, iluminação, SPDA, proteção e NR-10.\n- Corrigi o órgão, edição e ano para ANSA 2026 — Ênfase 24: Projetos, Construção e Montagem – Elétrica. Reorganizei os comandos e textos-base por bloco, retirei contaminação de questões vizinhas e corrigi OCR inequívoco em símbolos, unidades, acentos e palavras. Reconstruí o item 40 diretamente da página original e removi seus marcadores de corrupção após conferência visual. As três páginas e a figura do retificador da questão 82 foram verificadas e continuam vinculadas.\n- Desativei nove cópias OCR repetidas, preservando os registros e ligando cada um ao item mantido. Dificuldade é estimativa editorial. Não associei gabarito definitivo nem correção automática nesta etapa; o gabarito oficial definitivo específico precisa ser vinculado antes de registrar respostas automáticas.\n- Resultado: ${rel.total} registros; ${rel.disponiveis} elegíveis para resolução; ${rel.pendentes} pendências elegíveis. Revisão local, não publicada na nuvem.\n- Fontes oficiais: [caderno específico da ANSA, itens 31–100](https://cdn.cebraspe.org.br/concursos/ansa_26/arquivos/23D430B11EE71FF37B03F178DBF35181906255CFDE112A70D1B2CCE14AF7CABB.pdf), [edital e conteúdo da Ênfase 24](https://cdn.cebraspe.org.br/concursos/ANSA_26/arquivos/3969A00660D0B4D434998AC83CDA12E570D28CC2D67C47C6FDF6C58697C33FB1.html).\n`
await fs.writeFile(reportPath, report)
console.log(JSON.stringify({ ...rel, revisados: decisoes.length, itens_distintos: 66, duplicatas_desativadas: duplicatas.size, publicado: false }, null, 2))
