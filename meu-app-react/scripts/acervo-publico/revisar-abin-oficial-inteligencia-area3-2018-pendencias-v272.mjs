import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='b349553f6bf71501',nome='revisao-abin-oficial-inteligencia-area3-2018-pendencias-v272'
const prova='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/378_ABIN_003_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/GAB_DEFINITIVO_378_ABIN_003_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/ABIN_17/arquivos/ABIN_17_JUSTIFICATIVAS_DE_ALTERA____O_DE_GABARITO_1.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==85)throw Error(`Esperava 85 itens pendentes; encontrei ${raw.length}`)

// Gabarito definitivo oficial para os 90 itens (61–150); X = anulado.
const answers=['E C C E C C E C X E E C C E E E E E C C','E C E C E C E E E C C E E C E C C E C E','C C C C E E C E E E C C C E C E C C C C','E C E C C E C C E E C E C C E E E E E C','E C C C E E C C C C'].flatMap(row=>row.split(' '))
if(answers.length!==90)throw Error(`Gabarito canônico: ${answers.length}/90`)
const keyFor=n=>answers[n-61]
const keyHash=createHash('sha256').update(answers.join('|')).digest('hex')
const exam='ABIN 2018 — Oficial de Inteligência (Cargo 1), Área 3 — prova de conhecimentos específicos'

const classify=n=>{
 const map={
 61:['Sociologia','Sociedade civil e movimentos sociais: autonomia e relações com Estado e mercado','Difícil'],
 62:['Sociologia','Participação social: conselhos e conferências de políticas públicas','Média'],
 63:['Sociologia','Movimentos sociais e interações socioestatais: permeabilidade das fronteiras institucionais','Difícil'],
 64:['Ciência Política','Liberalismo: mercado, ordem política e funcionamento econômico','Difícil'],
 65:['História','Liberalismo no Brasil imperial: propriedade, liberdade e escravidão','Difícil'],
 66:['Ciência Política','Liberalismo clássico: propriedade e ruptura com o Antigo Regime','Média'],
 67:['Ciência Política','Nacionalismo: formação histórica das identidades nacionais','Média'],
 68:['História','Estado moderno: burocratização e formação institucional','Média'],
 69:['Ciência Política','Nacionalismo, totalitarismo e autoritarismo na América do Sul','Difícil'],
 70:['Ciência Política','Representação política: accountability e vínculo entre representantes e eleitores','Difícil'],
 71:['Ciência Política','Teorias da representação e legitimidade democrática','Média'],
 72:['Ciência Política','Representação política, feminismo e democracia','Difícil'],
 73:['Ciência Política','Política de presença, representação de grupos e inclusão política','Média'],
 74:['Ciência Política','Presidencialismo de coalizão: poder de agenda e negociação legislativa','Difícil'],
 75:['Ciência Política','Presidencialismo de coalizão: cargos, orçamento e formação de apoio','Difícil'],
 76:['Ciência Política','Presidencialismo e parlamentarismo: comparação institucional','Média'],
 77:['Sociologia','Cidadania e desigualdade de renda no Brasil contemporâneo','Média'],
 78:['Sociologia','Cidadania, desigualdade racial e inclusão no ensino superior','Média'],
 79:['Sociologia','T. H. Marshall: direitos civis, políticos e sociais','Média'],
 80:['Ciência Política','Grupos de pressão, transparência e regimes democráticos','Média'],
 81:['Ciência Política','Grupos de interesse e grupos de pressão: distinções conceituais','Média'],
 82:['Ciência Política','Lobby: representação de interesses e influência em decisões públicas','Média'],
 83:['Ciência Política','Grupos de pressão e partidos políticos: organização e continuidade','Difícil'],
 84:['Ciência Política','Sistema partidário brasileiro: competição e predominância partidária (1945–1964)','Média'],
 85:['História','Ditadura militar brasileira: bipartidarismo e restrições legais (1965–1979)','Média'],
 86:['Ciência Política','Sistema partidário brasileiro após a Constituição de 1988','Média'],
 87:['História','Partidos Liberal e Conservador no Brasil imperial','Média'],
 88:['História','Abolicionismo, republicanismo e crise do Império','Difícil'],
 89:['História','Primeira República: política dos governadores e sistema partidário','Difícil'],
 90:['Ciência Política','Totalitarismo: ideologia, partido único, liderança e terror','Média'],
 91:['Ciência Política','Hannah Arendt: totalitarismo e destruição dos vínculos sociais','Difícil'],
 92:['Ciência Política','Totalitarismo: especificidade histórica e experiências pré-modernas','Difícil'],
 93:['Ciência Política','Conceitos de totalitarismo e regimes políticos do século XX','Difícil'],
 94:['Políticas Públicas','Abordagens estatista e multicêntrica de políticas públicas','Difícil'],
 95:['Políticas Públicas','Ciclo de políticas públicas e seus limites como modelo analítico','Média'],
 96:['Políticas Públicas','Extinção, avaliação e substituição de políticas públicas','Média'],
 97:['Políticas Públicas','Definição de política pública: intencionalidade e problema público','Média'],
 98:['Políticas Públicas','Identificação de problemas públicos: critérios objetivos e subjetivos','Média'],
 99:['Antropologia','Antropologia britânica: performance, ritos de passagem e simbolismo','Difícil'],
 100:['Sociologia','Marxismo: consciência, realidade material e relações sociais','Média'],
 101:['Sociologia','Durkheim: solidariedade social e construção do consenso','Média'],
 102:['Sociologia','Max Weber: sociologia compreensiva, sentido e contexto da ação social','Média'],
 103:['Sociologia','Pierre Bourdieu: habitus, agente e estrutura social','Difícil'],
 104:['Sociologia','Identidade cultural, globalização e fragmentação','Difícil'],
 105:['Sociologia','Durkheim e Weber: fato social e ação social como métodos de análise','Difícil'],
 106:['Sociologia','Funcionalismo de Talcott Parsons: estrutura, integração e mudança social','Difícil'],
 107:['Sociologia','Habermas: ação comunicativa, racionalidade e consenso','Difícil'],
 108:['Sociologia','Max Weber: tipo ideal e construção metodológica','Média'],
 109:['Ciência Política','Teoria das elites: circulação das elites e mudança política','Difícil'],
 110:['Sociologia','Política, poder e movimentos sociais nas ciências sociais contemporâneas','Difícil'],
 111:['Sociologia','Max Weber: dominação racional-legal, tradicional e carismática','Média'],
 112:['Ciência Política','Esquerda, direita e projetos políticos alternativos','Média'],
 113:['Políticas Públicas','Neoliberalismo, crise do Estado de bem-estar e políticas de austeridade','Média'],
 114:['Sociologia','Globalização e diversidade cultural na modernidade tardia','Difícil'],
 115:['Sociologia','Globalização, homogeneização cultural e particularismos','Média'],
 116:['Antropologia','Clifford Geertz: interpretação cultural e descrição densa','Média'],
 117:['Antropologia','Franz Boas: crítica ao evolucionismo e relativismo cultural','Média'],
 118:['Antropologia','Pensamento mágico, pensamento científico e evolucionismo cultural','Difícil'],
 119:['Antropologia','Lévi-Strauss: tabu do incesto e universalidade cultural','Média'],
 120:['Estatística','Distribuição normal e curva de Gauss em dados amostrais','Média'],
 121:['Metodologia de Pesquisa','Métodos quantitativos e qualitativos nas ciências sociais','Média'],
 122:['Estatística','Amostragem: representatividade e composição da população','Média'],
 124:['Estatística','Desigualdade de renda: limites das medidas de tendência central e Índice de Gini','Média'],
 128:['História','Primeira Guerra Mundial: neutralidade espanhola','Fácil'],
 129:['História','Primeira Guerra Mundial: tecnologia militar e equilíbrio entre alianças','Média'],
 130:['História','Revolução Russa e saída da Rússia da Primeira Guerra Mundial','Média'],
 131:['História','Tratado de Versalhes e ordem europeia no pós-Primeira Guerra','Difícil'],
 132:['História','Sociedade das Nações: desarmamento e segurança coletiva','Média'],
 133:['História','Pós-guerra: ocupação, desmilitarização e desnazificação da Alemanha','Média'],
 134:['História','Conferência de Potsdam e reorganização da Alemanha após 1945','Média'],
 135:['História','Conferência de Teerã e decisões dos Aliados sobre a Alemanha','Média'],
 136:['História','Descolonização africana e política externa brasileira nos anos 1950','Difícil'],
 137:['História','Descolonização e transformação da ordem internacional no pós-guerra','Média'],
 138:['História','Conferência de Bandung, descolonização e Guerra Fria','Difícil'],
 139:['Relações Internacionais','Doutrina Truman e política externa dos Estados Unidos','Média'],
 140:['História','Guerra Fria: dissidências e crise do bloco socialista','Difícil'],
 141:['Relações Internacionais','Guerra Fria: alinhamento internacional e autonomia dos Estados','Média'],
 142:['História','Doutrina Brejnev e fim dos regimes socialistas no Leste Europeu','Difícil'],
 143:['História','Crise política e econômica e dissolução da União Soviética','Média'],
 144:['Relações Internacionais','Realismo: Estado como ator unitário, racional e orientado pelo interesse nacional','Média'],
 145:['Relações Internacionais','Antecedentes clássicos do realismo: Tucídides e Maquiavel','Difícil'],
 146:['Relações Internacionais','Hans Morgenthau: poder, interesse nacional e paz','Difícil'],
 147:['Relações Internacionais','Teoria da dependência: matriz neomarxista e interdisciplinaridade','Difícil'],
 148:['Relações Internacionais','Construtivismo: identidades, normas e interesses na política internacional','Difícil'],
 149:['Relações Internacionais','Processo decisório de política externa e participação parlamentar','Difícil'],
 150:['Relações Internacionais','Modelo político-burocrático de Graham Allison e decisão de política externa','Difícil'],
 }
 if(!map[n])throw Error(`Sem classificação específica para o item ${n}`)
 return map[n]
}

const decisions=raw.map(q=>{
 const n=Number(q.numero),[materia,conteudo,dificuldade]=classify(n),key=keyFor(n),page=Number(q.pagina)
 if(!key)throw Error(`Sem gabarito definitivo para ${n}`)
 let stem=String(q.enunciado||'').split(/JUSTIFICATIVA\s*[:\-–—]\s*(?:CERTO|ERRADO|ANULADO)/i)[0]
 stem=stem.replace(/(?:\/R\*Cargo:[\s\S]*|\|\|IdentificaPDF\|\|[\s\S]*)$/i,'').replace(/\s+/g,' ').trim()
 if(!stem)throw Error(`Enunciado vazio no item ${n}`)
 const anulada=key==='X',image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2018,concurso:exam,cargo:'Oficial de Inteligência — Área 3',numero_original:n,pagina:page,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial pela abstração teórica, variedade conceitual e etapas de interpretação; não é classificação publicada pela banca.',
  classificacao_fonte:prova,motivo:`Classificado pelo cabeçalho de seção e pelo conteúdo do item ${n} no caderno oficial de conhecimentos específicos do Cargo 1, Área 3. Aplicação em 11/03/2018.`,
  enunciado:stem,texto_apoio:q.apoio||null,opcoes:['Certo','Errado'],resposta_correta:anulada?null:key==='C'?0:1,anulada,
  gabarito_oficial:{fonte:gabarito,sha256:keyHash,sha256_tipo:'sha256_da_transcricao_dos_90_itens_do_gabarito_definitivo; nao_e_hash_do_pdf',arquivo:'GAB_DEFINITIVO_378_ABIN_003_01.PDF',numero:n,pagina:1,resposta:key,criterio:anulada?'Item anulado no gabarito definitivo oficial.':'Resposta cotejada com o gabarito oficial definitivo do Cargo 1, Área 3; o item 89 incorpora a alteração publicada pela banca.',fontes_complementares:[justificativas]},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
  visual:{pagina:page,imagem:image,motivo:`Página ${page} da prova oficial; imagem e contexto preservados.`}}
})
if(decisions.length!==85||new Set(decisions.map(x=>x.id)).size!==85)throw Error('Contagem ou unicidade inconsistentes')
if(decisions.filter(x=>x.anulada).map(x=>x.numero_original).join(',')!=='69')throw Error('Anulação divergente do gabarito oficial')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const base='tmp/revisao-profissional/revisao-seec-df-auditor-2019-pendencias-v271/acervo-extraido'
const report=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ABIN 2018 — Oficial de Inteligência, Área 3 — v272\n\n- Classifiquei os 85 itens pendentes deste documento com matéria e conteúdo específicos, corrigindo os rótulos incompatíveis (entre eles, itens de cidadania marcados como Serviço Social e tópicos de história, sociologia e relações internacionais marcados como Direito Constitucional ou Conhecimentos Específicos genéricos).\n- Corrigi o identificador do certame para ABIN 2018, Cargo 1 — Oficial de Inteligência, Área 3, e o ano de aplicação para 2018. Limpei resíduos de OCR sem remover textos-base nem as imagens de página já vinculadas.\n- Vinculei o gabarito oficial definitivo dos itens 61–150; o item 69 está anulado e o item 89 incorpora a alteração de gabarito registrada pela banca. Os itens 123–127 já estavam revisados e não foram duplicados.\n- Alteração local, não publicada na nuvem.\n- Fontes oficiais: [caderno específico](<${prova}>), [gabarito definitivo](<${gabarito}>), [justificativas de alteração e anulação](<${justificativas}>).\n`)
console.log(JSON.stringify({...report,documento:doc,revisadas:85,anuladas:1,semGabarito:decisions.filter(x=>x.resposta_correta===null&&!x.anulada).map(x=>x.numero_original),publicacao:'local'},null,2))
