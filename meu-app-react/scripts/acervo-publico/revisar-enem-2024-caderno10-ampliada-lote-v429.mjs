import fs from 'node:fs/promises'
import path from 'node:path'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-enem-2024-caderno10-ampliada-lote-v429',doc='bd0aa14272cba87e'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_impresso_D1_CD10_ampliada.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_impresso_D1_CD10.pdf'
const concurso='ENEM 2024 — 1º dia — Caderno 10 Roxo (Libras ampliada)'
const aplicacao='ENEM 2024 — aplicação regular — 1º dia'
const fonte=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!fonte||fonte.url!==prova||fonte.arquivo!=='2024_PV_impresso_D1_CD10_ampliada.pdf')throw Error('O documento não corresponde ao caderno ampliado oficial do Inep.')

// Gabarito oficial: Caderno 10 Roxo; itens 1–5 têm chaves distintas por língua.
const keys={
 '1e':'A','1s':'D','2e':'A','2s':'A','3e':'C','4e':'E','4s':'D','5e':'A','5s':'D',
 6:'D',7:'B',8:'E',9:'D',10:'A',11:'D',12:'E',13:'E',14:'B',15:'D',16:'D',17:'B',18:'D',19:'B',20:'B',21:'C',22:'E',23:'E',24:'C',25:'B',26:'D',27:'C',28:'B',29:'A',30:'D',31:'D',32:'D',33:'C',34:'B',35:'D',36:'E',37:'D',38:'D',39:'C',40:'E',41:'C',42:'B',43:'E',44:'C',45:'E',
 46:'A',47:'C',48:'B',49:'C',50:'A',51:'D',52:'C',53:'E',54:'D',55:'B',56:'A',57:'E',58:'C',59:'E',60:'D',61:'A',62:'D',63:'B',64:'A',65:'D',66:'B',67:'E',68:'B',69:'C',70:'D',71:'A',72:'D',73:'A',74:'B',75:'C',76:'D',77:'E',78:'A',79:'B',80:'C',81:'A',82:'E',83:'D',84:'E',85:'B',86:'B',87:'C',88:'E',89:'C',90:'E'
}
const catalog={
 1:['Língua Inglesa','Leitura e interpretação: marcador discursivo “instead of” e contraste de ideias','Média'],
 2:['Língua Inglesa','Leitura multimodal: metáfora digital e alerta sobre desmatamento','Média'],
 3:['Língua Inglesa','Leitura de textos: interpretação de citações e adversidade','Fácil'],
 4:['Língua Inglesa','Gênero carta: intenção comunicativa e recusa editorial','Fácil'],
 5:['Língua Inglesa','Preconceito linguístico: sotaque, língua materna e identidade chicana','Média'],
 6:['Arte','Arte contemporânea: arte povera, materiais e crítica ao consumo'],
 7:['Língua Portuguesa','Poema: deslocamento, identidade e metáfora'],
 8:['Língua Portuguesa','Variação linguística: oralidade e composição musical de Adoniran Barbosa'],
 9:['Língua Portuguesa','Cultura popular: festival de Parintins e aproximação com o esporte'],
 10:['Língua Portuguesa','Gênero reportagem: finalidade e sinais de alerta sobre câncer de mama masculino'],
 11:['Língua Portuguesa','Gêneros textuais e literários: marcas do poema em uma receita versificada'],
 12:['Arte','Fotografia: acaso, experimentação e criação artística'],
 14:['Língua Portuguesa','Letramento midiático: leitura crítica de memes e desinformação'],
 15:['Literatura','Romantismo brasileiro: idealização amorosa em Senhora, de José de Alencar'],
 16:['Arte','História da arte: comparação de escultura antiga e moderna'],
 17:['Língua Portuguesa','Texto literário: lirismo, declínio físico e perspectiva narrativa'],
 18:['Língua Portuguesa','Leitura multimodal: finalidade de cartaz de prevenção e luto'],
 19:['Língua Portuguesa','Diversidade linguística: tecnologia e tradução para o tukano'],
 20:['Educação Física','Práticas corporais: gênero e participação de mulheres nas lutas'],
 21:['Língua Portuguesa','Estratégias argumentativas: empatia e aproximação com o leitor'],
 22:['Literatura','Intertextualidade e reescrita: apropriação de Dom Casmurro'],
 23:['Arte','Arte indígena: adornos, identidade e papéis comunitários'],
 24:['Língua Portuguesa','Canção e crítica social: representação da violência'],
 26:['Língua Portuguesa','Variação linguística e estilo: oralidade e revisão literária'],
 27:['Arte','Pintura brasileira: influência europeia e representação figurativa'],
 29:['Língua Portuguesa','Leitura de crônica: adoção, identidade e construção social'],
 30:['Língua Portuguesa','Intertextualidade e argumentação: diálogo entre literatura e artes plásticas'],
 31:['Educação Física','Atividade física e saúde: desigualdades sociais durante a pandemia'],
 33:['Língua Portuguesa','Coesão e progressão textual: referenciação pronominal'],
 34:['Língua Portuguesa','Argumentação: benefícios sociais da telemedicina'],
 36:['Língua Portuguesa','Gênero jornalístico: função de dado estatístico em texto de divulgação'],
 37:['Língua Portuguesa','Sociolinguística: preservação da língua da Tabatinga'],
 38:['Língua Portuguesa','Funções da linguagem: função referencial em texto informativo'],
 39:['Língua Portuguesa','Variação linguística: falares regionais do Maranhão'],
 40:['Língua Portuguesa','Variação linguística e identidade: repertório lexical do Amazonas'],
 41:['Arte','Cultura corporal: trajetória de atletas paralímpicas brasileiras'],
 42:['Arte','Música e cultura: circulação e adaptação de instrumentos de cordas'],
 44:['Língua Portuguesa','Gênero podcast: comparação entre mídias e divulgação de conhecimento'],
 45:['Língua Portuguesa','Variação linguística: registro profissional e estrangeirismos'],
 46:['Filosofia','Democracia: titularidade e exercício do poder público'],
 48:['Ciência Política','Organizações internacionais: composição e tomada de decisão no Conselho de Segurança da ONU'],
 49:['Sociologia','Capitalismo: divisão do trabalho, autonomia e contradições da produção'],
 50:['História','Guerra Fria e circulação internacional da telenovela brasileira'],
 52:['Filosofia','Epistemologia: indução, hábito e problema da generalização'],
 53:['Geografia','Cartografia: mapas, poder e dominação territorial'],
 55:['Sociologia','Religião e cultura: patrimônio e ritual do Círio de Nazaré'],
 57:['Filosofia','Filosofia contemporânea: rizoma e pluralidade de conexões'],
 61:['Sociologia','Ética e cidadania: vulnerabilidade e cuidado das pessoas com deficiência'],
 63:['Filosofia','Metafísica: relação entre alma, corpo e percepção'],
 65:['Sociologia','Espaço público: convivência, conflito e participação social'],
 66:['História','Colonização da América: Bartolomeu de Las Casas e crítica à violência colonial'],
 67:['Arte','Dança e cultura: origem popular da valsa e distinção social'],
 69:['Geografia','Hidrografia e riscos naturais: relevo e tipos de inundação'],
 70:['Geografia','Amazônia: comércio fluvial e redes de sociabilidade no século XIX'],
 71:['História','Ditadura argentina: Madres de Plaza de Mayo e direitos humanos'],
 74:['Sociologia','Indústria cultural: massificação e autonomia do indivíduo'],
 78:['História','Estado Novo: propaganda, turismo e representações nacionais pelo DIP'],
 80:['História','História social da saúde: contracepção e planejamento familiar no Brasil'],
 82:['Geografia','Amazônia: desmatamento, evapotranspiração e regime de chuvas'],
 84:['História','Idade Média: origem e legado das universidades'],
 85:['Geografia','Socioambientalismo: seringueiros e reservas extrativistas'],
 86:['Filosofia','Filosofia contemporânea: experiência do tempo e futuro'],
 88:['Sociologia','Políticas de saúde: divisão e hierarquia do trabalho em saúde pública'],
 90:['História','História intelectual: ciência, progresso e utopias na passagem ao século XX']
}
const areaContext={
 english:'ENEM 2024 — 1º dia, Caderno 10 Roxo. Questão de Linguagens em inglês; manter o texto-base e a imagem da página vinculados ao item.',
 spanish:'ENEM 2024 — 1º dia, Caderno 10 Roxo. Questão de Linguagens em espanhol; manter o texto-base e a imagem da página vinculados ao item.',
 language:'ENEM 2024 — 1º dia, Caderno 10 Roxo. Linguagens, Códigos e suas Tecnologias; texto-base e comando pertencem a este item.',
 humanities:'ENEM 2024 — 1º dia, Caderno 10 Roxo. Ciências Humanas e suas Tecnologias; texto-base, gráfico ou imagem da página pertence a este item.'
}
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==68||new Set(records.map(q=>q.id)).size!==68)throw Error('Fila alterada: esperados 68 registros únicos.')
const languageKeys=new Map([
 ['extr-6079f936b06b609b9810','1e'],['extr-03da985c4c6162ad3c3d','1s'],
 ['extr-2138b19519cfd837141f','2e'],['extr-671854bee06c8197d387','2s'],
 ['extr-4bf658ad9b79fea56254','3e'],['extr-85e702a85fc65fdaeb9d','4e'],
 ['extr-8761b7594fce0336f917','4s'],['extr-1be8981bbc59fdf430a7','5e'],['extr-ef265fdd3b67142a85c4','5s']
])
const correctedNumbers=new Map([['extr-55985cd2caaaf21f3068',10]])
const answerOrder='ABCDE'
function cleanText(s){return String(s||'').replace(/\*011775RX\d+\*[\s\S]*$/,'').replace(/\n\s*\d{1,2}\s*011775RX\.indb[\s\S]*$/,'').replace(/ENEM2024[\s\S]*$/,'').replace(/\s+([,.;:!?])/g,'$1').replace(/\s+/g,' ').trim().replace(/2\s+953/g,'2 953').replace(/1\s+000/g,'1 000')}
function cleanOption(s){return cleanText(s).replace(/^[A-E]\s*\n\s*/,'').replace(/^[A-E][.)]\s*/, '').trim()}
const correctedOptions=new Map([
 ['extr-90dd974ab2727f1d1dfa',['O afastamento da autoridade médica na regulação da fecundidade.','A superação do discurso da moralidade pela ação da mídia estatal.','A ampliação do debate público sobre o planejamento familiar.','A centralização da pesquisa científica pelo sistema privado de saúde.','O enrijecimento das doutrinas religiosas sobre a organização da vida doméstica.']]
])
const decisions=records.map(q=>{
 const n=correctedNumbers.get(q.id)??Number(q.numero),languageKey=languageKeys.get(q.id),meta=catalog[n]
 if(q.id==='extr-aedf51bd70d8bff6d1f2'){
  const p=Number(q.pagina),image=`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,stem=cleanText(q.enunciado)
  return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,opcoes:[],materia:'Registro auxiliar',conteudo:'Capa e instruções do caderno — não é questão avaliativa',ano:2024,concurso,banca:'INEP',organizadora:'INEP',aplicacao,numero_original:Number(q.numero),numero:Number(q.numero),pagina:p,dificuldade:'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Não se aplica: o registro corresponde à capa e às instruções, sem comando avaliativo.',classificacao_fonte:prova,motivo:'Registro extraído da capa do caderno, não corresponde a um item numerado de avaliação; desabilitado para resolução e retirado das facetas de questões elegíveis.',apta_resolucao:false,inelegibilidade_motivo:'Capa/instruções; não é questão',remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','classificacao_pendente'],visual:{pagina:p,imagem:image,enunciado:stem,motivo:'Página inicial conferida no caderno oficial; identificada como instruções, sem questão.'}}
 }
 if(!meta)throw Error(`Questão ${n} sem classificação por matéria/conteúdo.`)
 const key=languageKey?keys[languageKey]:keys[n]
 if(!key)throw Error(`Questão ${n} sem resposta no gabarito oficial do Caderno 10.`)
 let stem=cleanText(q.enunciado)
 if(q.id==='extr-55985cd2caaaf21f3068')stem='As informações dessa reportagem auxiliam no combate ao câncer de mama masculino por apresentarem um alerta sobre o(s).'
 let options=correctedOptions.get(q.id)||q.opcoes.map(cleanOption)
 if(options.length!==5||options.some(x=>!x||/\*011775RX|ENEM2024|011775RX\.indb/.test(x)))throw Error(`Alternativas contaminadas ou incompletas no item ${n} (${q.id}).`)
 const p=Number(q.pagina),image=`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,matter=meta[0],content=meta[1],difficulty=meta[2]||'Média'
 const isLanguage=n<=5,context=isLanguage?(languageKey?.endsWith('s')?areaContext.spanish:areaContext.english):(n<=45?areaContext.language:areaContext.humanities)
 const originalPages=(q.contexto||[{pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`}]).map(x=>({pagina:Number(x.pagina),imagem:x.imagem,text:context}))
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:stem,opcoes:options,materia:matter,conteudo:content,ano:2024,concurso,banca:'INEP',organizadora:'INEP',aplicacao,numero_original:n,numero:n,pagina:p,dificuldade:difficulty,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela quantidade de inferências, integração de fontes e domínio conceitual exigidos; o Inep não publica nível psicométrico individual.',classificacao_fonte:prova,motivo:q.id==='extr-55985cd2caaaf21f3068'?'Conferência no caderno oficial identifica este registro como questão 10 (o índice extraído indicava 4); número, matéria e alternativas foram corrigidos com base na página original.':`Questão ${n} classificada pelo comando, texto-base e recurso visual do caderno oficial. Para as questões 1–5, gabarito e classificação consideram a variante ${languageKey?.endsWith('s')?'espanhol':'inglês'} quando aplicável.`,resposta_correta:answerOrder.indexOf(key),anulada:false,gabarito_oficial:{valor:key,fonte:gabarito,arquivo:'2024_GB_impresso_D1_CD10.pdf',prova:'2024_PV_impresso_D1_CD10_ampliada.pdf',numero:n,pagina:1,criterio:languageKey?'Gabarito oficial do Inep, Caderno 10 Roxo; chave específica da opção de língua estrangeira.':'Gabarito oficial do Inep, Caderno 10 Roxo; tabela do respectivo dia e área.'},texto_apoio:context,imagens_contexto:originalPages,reemplazarContexto:true,visual:{pagina:p,imagem:image,enunciado:stem,texto_apoio:context,motivo:'Enunciado, comando e alternativas comparados com a página do caderno oficial; imagens originais preservadas, inclusive elementos gráficos.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','gabarito_oficial_nao_vinculado','classificacao_pendente']}
})
if(decisions.length!==68||decisions.filter(x=>x.apta_resolucao).length!==67)throw Error('Esperadas 67 questões e 1 capa inabilitada.')
const number10=decisions.find(x=>x.id==='extr-55985cd2caaaf21f3068')
if(number10.numero!==10||number10.gabarito_oficial.valor!=='A')throw Error('Correção da questão 10 falhou.')
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({documento:doc,registros:68,questoes:67,capa_inabilitada:1,questao_corrigida_de_4_para_10:true,opcoes_completas:decisions.filter(x=>x.apta_resolucao).every(x=>x.opcoes.length===5),gabarito_oficial_cobertura:90,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const rootLine=`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')`
const rootsFile='scripts/acervo-publico/acervo-atual.mjs',rootsSource=await fs.readFile(rootsFile,'utf8')
if(!rootsSource.includes(rootLine))await fs.appendFile(rootsFile,`\n${rootLine}\n`)
const report={...result,documento:doc,concurso,ano:2024,questoes_revisadas:67,capa_inabilitada:1,questao_com_numero_corrigido:{id:number10.id,numero_extraido:4,numero_oficial:10,pagina:number10.pagina},alternativas_conferidas:67,gabaritos_oficiais_vinculados:67,imagens_e_graficos_preservados:67,fonte_prova:prova,fonte_gabarito:gabarito,gabarito_oficial:{caderno:10,cor:'Roxo',respostas:keys},publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
