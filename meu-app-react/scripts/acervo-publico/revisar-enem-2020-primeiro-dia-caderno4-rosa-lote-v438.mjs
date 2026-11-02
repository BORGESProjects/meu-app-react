import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-enem-2020-primeiro-dia-caderno4-rosa-lote-v438'
const doc='42880c2a17374828'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2020_PV_impresso_D1_CD4.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2020_GB_impresso_D1_CD4.pdf'
const concurso='Exame Nacional do Ensino Médio (ENEM) 2020 — 1º dia — Caderno 4 Rosa'
const catalogo=new Map([
 [1,['Língua Inglesa','Leitura e interpretação de campanha multimodal em língua inglesa','Fácil']],
 [2,['Língua Inglesa','Leitura de pôster de campanha e inferência de finalidade comunicativa','Fácil']],
 [3,['Língua Inglesa','Compreensão de diálogo literário e construção de identidade racial','Média']],
 [4,['Língua Inglesa','Interpretação de poema e identificação do eu lírico','Média']],
 [5,['Língua Inglesa','Leitura de poema: representação da maternidade e da experiência de refugiados','Média']],
 [6,['Língua Portuguesa','Leitura crítica: viés algorítmico e reprodução de desigualdades','Média']],
 [7,['Língua Portuguesa','Linguagem publicitária: articulação de elementos verbais e visuais','Fácil']],
 [8,['Literatura Brasileira','Crônica urbana: perspectiva narrativa e representação de Curitiba','Média']],
 [9,['Literatura Brasileira','Gênero lírico: imagens, símbolos e construção de identidade nacional','Fácil']],
 [10,['Língua Portuguesa','Gêneros textuais e marcas de oralidade em diálogo narrativo','Média']],
 [15,['Língua Portuguesa','Publicidade e multimodalidade: construção de proposta de intervenção social','Média']],
 [18,['Língua Portuguesa','Relato de viagem: marcas de gênero e organização da experiência','Fácil']],
 [19,['Língua Portuguesa','Publicidade de interesse público: denúncia do assédio e leitura da imagem','Média']],
 [20,['Língua Portuguesa','Divulgação científica: finalidade, público e recursos de notícia','Fácil']],
 [21,['Literatura Brasileira','Narrativa regionalista: caracterização de personagens e relações sociais','Média']],
 [22,['Língua Portuguesa','Intersemiose: poesia urbana e intervenção no espaço público','Média']],
 [23,['Literatura Brasileira','Crônica e metáfora: interpretação de narrativa sobre a vida como jogo','Média']],
 [24,['Educação Física','Esporte, gênero e representação do futebol feminino na mídia','Fácil']],
 [25,['Literatura Brasileira','Canção de protesto: linguagem, contexto histórico e efeitos de sentido','Média']],
 [26,['Língua Portuguesa','Variação linguística e circulação de gêneros musicais populares','Média']],
 [28,['Língua Portuguesa','Crônica: ironia, migração e crítica às relações de consumo','Média']],
 [29,['Língua Portuguesa','Humor e metalinguagem: uso expressivo do gerúndio','Média']],
 [30,['Artes','Arte conceitual: representação, objeto e linguagem visual','Média']],
 [31,['Língua Portuguesa','Tecnologias digitais: função comunicativa da realidade virtual','Fácil']],
 [32,['Artes','Música popular brasileira: construção poética por enumeração e imagens','Média']],
 [33,['Educação Física','Práticas corporais e sociabilidade: tecnologia de organização do futebol amador','Fácil']],
 [34,['Artes','Arte contemporânea: materialidade, instalação e relação entre vida e morte','Média']],
 [36,['Literatura Brasileira','Poesia contemporânea: imagens urbanas, estrutura e campo semântico','Média']],
 [37,['Literatura Brasileira','Poesia e cultura popular: defesa da expressão musical e crítica social','Média']],
 [38,['Artes','Performance poética e acessibilidade: encontro entre Libras, corpo e voz','Média']],
 [40,['Língua Portuguesa','Texto de divulgação científica: organização de informação sobre terras-raras','Fácil']],
 [41,['Literatura Brasileira','Prosa naturalista: descrição, focalização e construção de atmosfera','Média']],
 [42,['Educação Física','Esporte e sociedade: desigualdade de gênero na remuneração esportiva','Média']],
 [43,['Língua Portuguesa','Literatura e trabalho: discurso narrativo e conflito nas relações laborais','Média']],
 [44,['Literatura Brasileira','Modernismo: projeto de evasão e construção de Pasárgada','Média']],
 [46,['Geografia','Urbanização brasileira: metropolização e expansão das cidades','Média']],
 [47,['Geografia','Geografia agrária: sazonalidade do trabalho e calendário agrícola','Média']],
 [48,['Geografia','Agricultura e recursos hídricos: uso da água e produtividade','Média']],
 [49,['Sociologia','Estado, segurança e poder: doutrina preventiva nas relações internacionais','Difícil']],
 [50,['Geografia','Urbanização: planejamento urbano e produção capitalista do espaço','Média']],
 [51,['Geografia','Geologia do Brasil: escudos cristalinos e estruturas pré-cambrianas','Fácil']],
 [52,['Literatura','Romance moderno: representação da morte em A morte de Ivan Ilitch','Média']],
 [53,['História','Colonização da América: cartografia europeia e apagamento de saberes indígenas','Média']],
 [54,['Sociologia','Democracia e sociedade: igualdade social na formação da Nova Inglaterra','Média']],
 [55,['Filosofia','Filosofia política de Aristóteles: comunidade, finalidade e bem comum','Média']],
 [56,['Sociologia','Sociologia do trabalho: toyotismo e reestruturação produtiva','Média']],
 [57,['História','História da escravidão: tráfico de trabalhadores chineses no século XIX','Média']],
 [60,['Filosofia','Filosofia política contemporânea: justiça como equidade em John Rawls','Difícil']],
 [61,['História','Roma Antiga: crise da República e disputas pelo poder','Média']],
 [62,['História do Brasil','Revolução Pernambucana de 1817 e disputa pela opinião pública','Média']],
 [63,['Filosofia','Iluminismo e direitos humanos: princípios da Declaração de 1789','Média']],
 [64,['História','Grécia Antiga: cidadania e limites da democracia ateniense','Média']],
 [65,['História','Reforma e cultura escrita: imprensa, leitura e circulação de ideias','Difícil']],
 [66,['Filosofia','Epistemologia: limites da inferência e conhecimento do mundo externo','Difícil']],
 [68,['Filosofia','Ceticismo: realidade externa, sonho e justificação do conhecimento','Difícil']],
 [69,['Geografia','Problemas ambientais urbanos: poluição e degradação do rio Tietê','Fácil']],
 [70,['Filosofia','Empirismo de David Hume: causalidade e limites da indução','Difícil']],
 [71,['Geografia','Impactos ambientais e saúde: relações entre desastre de Mariana e febre amarela','Difícil']],
 [73,['História do Brasil','Brasil colonial: escravidão e trabalho nas missões jesuíticas','Média']],
 [74,['Geografia','Riscos naturais: localização urbana e vulnerabilidade a terremotos','Média']],
 [75,['História','Reforma Protestante: comunidades religiosas e circulação de cartas','Média']],
 [76,['Geografia','Tectônica de placas: subducção e formação de arcos magmáticos','Média']],
 [77,['Literatura Brasileira','Poesia de Cora Coralina: voz lírica, trabalho e pertencimento','Média']],
 [78,['Filosofia','Filosofia moderna: Montaigne, ensaio e escrita de si','Média']],
 [79,['Sociologia','Educação inclusiva: direito à aprendizagem e diversidade escolar','Fácil']],
 [80,['Filosofia','Epistemologia: experiência sensível e produção do conhecimento','Média']],
 [81,['Geografia','Economia mundial: divisão internacional do trabalho e dependência latino-americana','Média']],
 [82,['História','Mesopotâmia: Código de Hamurábi e organização do poder político','Fácil']],
 [84,['Sociologia','Estado e políticas públicas: emprego e proteção social no Brasil','Média']],
 [85,['Geografia','Comércio internacional: relações Brasil–China e assimetria comercial','Média']],
 [86,['Geografia','Espaço rural brasileiro: emprego agrícola e dinâmica demográfica','Média']],
 [87,['Sociologia','Gênero e trabalho: feminização da população economicamente ativa','Média']],
 [88,['Geografia','Questão agrária: propriedade da terra e função social','Média']],
 [89,['Geografia','Agronegócio: fluxos, redes e organização territorial','Média']],
 [90,['Artes','Cultura popular: quadrilha junina e ressignificação de referências francesas','Fácil']]
])
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==79||new Set(records.map(q=>q.id)).size!==79)throw Error('Fila mudou: esperados 79 registros únicos.')
const langIds=new Map([
 ['extr-20aa5003905d920297eb',['Língua Inglesa','Leitura de pôster de campanha e inferência de finalidade comunicativa','Fácil']],
 ['extr-7f2cb214bafcb897d625',['Língua Espanhola','Compreensão de conto e inferência de sentidos em língua espanhola','Média']],
 ['extr-351e6198728aa83f56e0',['Língua Inglesa','Leitura de pôster de campanha e inferência de finalidade comunicativa','Fácil']],
 ['extr-87b271d20a960b9dfc54',['Língua Espanhola','Poesia chicana: identidade, território e memória em língua espanhola','Difícil']],
 ['extr-960ab71fbd1277b411d3',['Língua Inglesa','Compreensão de diálogo literário e construção de identidade racial','Média']],
 ['extr-13a65aa0dc7e0ce6dbfc',['Língua Espanhola','Crítica cinematográfica: violência, arte e argumentação em língua espanhola','Média']],
 ['extr-2d6144249bb90b81943c',['Língua Inglesa','Interpretação de poema e identificação do eu lírico','Média']],
 ['extr-48cefd098a8a21cb5906',['Língua Espanhola','Artigo de opinião: liberdade, discurso e interpretação em língua espanhola','Difícil']],
 ['extr-87abd675ce310eab9131',['Língua Inglesa','Leitura de poema: representação da maternidade e da experiência de refugiados','Média']]
])
const urlKey='https://download.inep.gov.br/enem/provas_e_gabaritos/2020_GB_impresso_D1_CD4.pdf'
const decisions=records.map(q=>{
 const meta=langIds.get(q.id)||catalogo.get(Number(q.numero))
 if(!meta)throw Error(`Sem classificação específica para ${q.numero} / ${q.id}`)
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:meta[0],conteudo:meta[1],ano:2020,concurso,banca:'INEP',organizadora:'INEP',aplicacao:'Aplicação regular impressa — 1º dia — Caderno 4 Rosa',numero_original:Number(q.numero),numero:Number(q.numero),pagina:Number(q.pagina),dificuldade:meta[2],dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial individual a partir da densidade conceitual, inferências e etapas de raciocínio; o Inep não publica dificuldade psicométrica por item.',classificacao_fonte:prova,motivo:`Questão ${q.numero} classificada pelo objeto e habilidade efetivamente avaliados no enunciado/contexto; edição, caderno e página conferidos no catálogo oficial do Inep.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','dificuldade_nao_informada','classificacao_pendente']}
})
if(decisions.length!==79||new Set(decisions.map(d=>d.id)).size!==79)throw Error('Cobertura incorreta do lote.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,classificacoes:[...new Set(decisions.map(x=>x.materia))],imagens_preservadas:records.every(q=>q.imagem),prova,gabarito_oficial_catalogado:urlKey,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`,rootFile='scripts/acervo-publico/acervo-atual.mjs',rootText=await fs.readFile(rootFile,'utf8')
if(!rootText.includes(rootLine))await fs.appendFile(rootFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2020,registros_revisados:79,questoes_classificadas:79,prova_oficial:prova,gabarito_oficial_catalogado:urlKey,gabaritos_vinculados:0,observacao_gabarito:'O catálogo oficial confirma o gabarito, mas o arquivo do Inep retornou 502 nesta sessão; as respostas permanecem sem vínculo e sem correção automática até a conferência do arquivo.',imagens_e_contextos_preservados:true,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report))
