import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='2ce03b9712abd746',prova='https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/658_PETROBRAS_023_01.PDF',gabarito='https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/GAB_DEFINITIVO_658_PETROBRAS_023_01.PDF',justificativas='https://cdn.cebraspe.org.br/concursos/petrobras_21_ns/arquivos/PETRO_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO_V_6_4.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const start=raizesAtuais.findIndex(r=>r.includes('revisao-seduc-al-filosofia-2018-v154'))
if(start<0)throw new Error('Base v154 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)));for(const q of qs)if(q.documento_id===doc)active.set(q.id,q)}
if(raw.length!==70||active.size!==70||raw.some(q=>!active.has(q.id)))throw new Error(`Caderno incompleto: extraídos ${raw.length}, ativos ${active.size}`)
const subject=n=>n<=99?'Geologia':n<=112?'Física':'Matemática'
const topic=n=>{
 if(n<=53)return 'Geologia estrutural e classificação tectônica de bacias sedimentares'
 if(n<=56)return 'Geologia estrutural — falhas transcorrentes e estruturas en échelon'
 if(n<=59)return 'Estratigrafia de bacias marginais — sequências e ambientes deposicionais'
 if(n<=62)return 'Tectônica de placas e evolução das bacias sedimentares brasileiras'
 if(n<=65)return 'Classificação tectônica de bacias sedimentares'
 if(n<=69)return 'Geologia estrutural — interpretação de mapa geológico e relações de idade'
 if(n<=72)return 'Sedimentologia — precipitação e dissolução de carbonatos marinhos'
 if(n===73)return 'Sedimentologia — evaporitos e evolução das bacias marginais'
 if(n<=76)return 'Sedimentologia — processos e rochas siliciclásticas'
 if(n<=78)return 'Petrologia sedimentar — diagênese'
 if(n<=82)return 'Geologia do petróleo — rochas geradoras, reservatórios, migração e armadilhas'
 if(n<=84)return 'Geologia sedimentar — bacias intracratônicas brasileiras'
 if(n<=86)return 'Tectônica e evolução das bacias da margem equatorial brasileira'
 if(n<=88)return 'Geologia do petróleo — bacias de Campos e Santos'
 if(n<=90)return 'Geologia do petróleo — seção pré-sal da Bacia de Santos'
 if(n<=93)return 'Estratigrafia e sistemas petrolíferos de bacias brasileiras'
 if(n<=99)return 'Geologia histórica — datação, tectônica e estratigrafia das bacias costeiras'
 if(n<=102)return 'Mecânica — trabalho, dinâmica e atrito em sistemas de blocos'
 if(n<=104)return 'Oscilações — movimento harmônico simples e energia'
 if(n<=106)return 'Ondas eletromagnéticas — velocidade e espectro'
 if(n<=108)return 'Ondulatória — refração, difração e princípio de Huygens'
 if(n<=110)return 'Geofísica — ondas sísmicas longitudinais e transversais'
 if(n<=112)return 'Geofísica — métodos gravimétrico e magnetométrico'
 if(n<=115)return 'Números complexos — forma polar, potências, raízes e lugar geométrico'
 if(n<=117)return 'Geometria e geometria analítica — lei dos cossenos e elipse'
 if(n===118)return 'Funções exponenciais e logaritmos — decaimento exponencial'
 if(n===119)return 'Probabilidade — eventos independentes e contagem'
 return 'Álgebra linear — sistemas lineares e matriz singular'
}
const block=n=>{
 if(n<=53)return 'Kingston et al. classificam bacias sedimentares segundo sua relação tectônica: sinéclise de margem continental (MS), sinéclise interior (IS), fratura interior (IF) e sinéclise de margem continental/sinéclise interior (MSIS). A figura do caderno compara duas bacias.'
 if(n<=56)return 'Movimentos distensional, compressional, transtensional, transpressional e transcorrente podem gerar estruturas acumuladoras de petróleo. A figura do caderno ilustra um desses movimentos. Fonte citada na prova: P. V. Zalán, “A tectônica transcorrente na exploração de petróleo: uma revisão”, Revista Brasileira de Geologia, v. 16, 1986, p. 249.'
 if(n<=59)return 'Tabela de sequências deposicionais, subsequências, ambientes deposicionais e evolução tectônica das bacias sedimentares da margem continental brasileira. Fonte citada na prova: Chang e Kowsmann, Revista Brasileira de Geociências, v. 17, n. 2, 1987, p. 75.'
 if(n<=62)return 'Itens sobre origem, evolução e contexto tectônico das bacias sedimentares brasileiras.'
 if(n<=65)return 'Segundo Nichols, bacias sedimentares podem ser classificadas, conforme o ambiente tectônico, como antepaís, retroarco, antearco, intracratônica, rifte terrestre, margem passiva ou oceânica. A figura associa três tipos a esquemas de tectônica de placas. Fonte citada na prova: Nichols, Sedimentology and Stratigraphy, 2.ª ed., Wiley-Blackwell, 2009, p. 419.'
 if(n<=69)return 'Mapa geológico com litologias, contatos, mergulhos e curvas de nível, apresentado como base para interpretar relações de idade e deformação.'
 if(n<=72)return 'Itens sobre limites das zonas de precipitação e dissolução de carbonatos em ambientes marinhos, incluindo a profundidade de compensação de carbonatos (CCD).'
 if(n===73)return 'Item sobre a formação de evaporitos no litoral brasileiro durante a separação das placas Sul-Americana e Africana.'
 if(n<=76)return 'Itens sobre transporte, erosão, deposição e abundância de sedimentos siliciclásticos.'
 if(n<=78)return 'Diagênese: processos posteriores à deposição de sedimentos que promovem a formação e transformação de rochas sedimentares.'
 if(n<=82)return 'Itens sobre os elementos e processos que controlam a geração, migração, armazenamento e acumulação comercial de petróleo.'
 if(n<=84)return 'Itens sobre ambientes, formações e rochas geradoras das bacias intracratônicas brasileiras.'
 if(n<=86)return 'Itens sobre a evolução tectônica e a classificação das bacias da margem equatorial brasileira.'
 if(n<=88)return 'Itens sobre potencial petrolífero e depósitos sedimentares das bacias de Campos e Santos.'
 if(n<=90)return 'Esquema de acumulação de hidrocarbonetos na seção rifte e nos depósitos pré-sal da Bacia de Santos. Legenda: V, rocha vulcânica; G, rocha geradora; R, reservatório de hidrocarbonetos; depósitos de sal. Fonte citada na prova: Riccomini et al., Revista USP, n. 95, 2012, p. 40.'
 if(n<=93)return 'Itens sobre sequência deposicional e sistemas petrolíferos das bacias sedimentares brasileiras.'
 if(n<=99)return 'Itens sobre datação geológica, tectônica e sequência estratigráfica das bacias costeiras brasileiras.'
 if(n<=102)return 'Três blocos, de massas m₁=60 kg, m₂=35 kg e m₃=15 kg, estão ligados por fios ideais e uma polia ideal. Há atrito entre a superfície e os blocos 2 e 3, e o conjunto está acelerado. A figura da questão mostra a disposição dos blocos.'
 if(n<=104)return 'Um bloco de massa m preso a uma mola de constante k realiza movimento harmônico simples entre as posições A e −A, conforme a figura.'
 if(n<=106)return 'Ondas eletromagnéticas propagam-se no vácuo à velocidade da luz e transportam energia cuja intensidade varia em função do comprimento de onda.'
 if(n<=108)return 'Figuras A e B ilustram, respectivamente, refração e difração de ondas eletromagnéticas; a figura B apresenta frentes de onda e um obstáculo.'
 if(n<=110)return 'As figuras mostram uma cerca antes e depois das deformações produzidas por ondas sísmicas longitudinais e transversais, originadas no mesmo epicentro.'
 if(n<=112)return 'Itens sobre correções de campo em levantamentos gravimétricos e magnetométricos, incluindo efeitos topográficos e variações temporais do campo geomagnético.'
 if(n<=115)return 'Itens sobre representação polar, raízes, potências e lugar geométrico de números complexos.'
 if(n<=117)return 'Itens de geometria e geometria analítica envolvendo triângulo e equação de elipse.'
 if(n===118)return 'Uma quantidade p obedece à lei de decaimento exponencial p(t)=4e^(−0,5t), com t medido em anos; use ln(5)≈1,6.'
 if(n===119)return 'Três moedas não viciadas são lançadas uma vez cada; cada lançamento tem resultados cara ou coroa.'
 return 'Item sobre as soluções de sistemas lineares homogêneos e não homogêneos representados por matrizes quadradas.'
}
const corrected=new Map([
 [53,'A figura B representa a bacia do tipo IS.'],
 [56,'A bacia de Taubaté é um exemplo típico da bacia ilustrada na figura em questão.'],
 [57,'A subsequência indicada pela letra A corresponde tipicamente ao evento marinho transgressivo.'],
 [58,'A evolução tectônica indicada pela letra C é tipicamente rifte.'],
 [59,'O ambiente deposicional indicado pela letra B é tipicamente fluviolacustre.'],
 [88,'Nessas bacias, normalmente são encontrados os seguintes depósitos sedimentares, do mais novo para o mais antigo: pré-rifte, rifte, transição, mar raso e mar aberto.'],
 [99,'Em termos paleozoogeográficos, os ostracodes mostraram-se inconclusivos para a compreensão dos processos de formação do Oceano Atlântico e de separação das placas africana e sul-americana.'],
 [112,'Entre as diversas correções que são aplicadas às medições gravimétricas realizadas no campo, a correção de Bouguer é realizada para compensar os efeitos de gravidade decorrentes da diferença topográfica entre os pontos de medição e a superfície de referência.'],
 [113,'As raízes cúbicas do número complexo z = −2√3 − 2i são w₁ = ∛4 e^(7πi/18), w₂ = ∛4 e^(19πi/18) e w₃ = ∛4 e^(31πi/18).'],
 [114,'O número (1 + √3 i)^k, com k ∈ ℤ, será um número real sempre que k for um múltiplo de 3.'],
 [115,'Sendo z = x + iy um número complexo, então o lugar geométrico dos números complexos z que satisfazem à equação |(z − 1)/(z + i)| = √2 é uma circunferência com centro em z₀ = 1 + 2i e raio r = 2.'],
 [116,'Em um triângulo ABC tem-se que AB = √3, BC = (√2 + √6)/2 e ∠ABC = 45°. Nessa situação, é correto concluir que o lado AC = √2.'],
 [117,'A excentricidade da elipse dada pela equação x² − 4x + 4y² − 8y + 4 = 0 é e = √3/2.'],
 [118,'Considere que certa quantidade p obedeça a uma lei de decaimento exponencial na forma p(t) = 4e^(−0,5t), com t medido em anos. Nessa situação, considerando-se a aproximação ln(5) = 1,6, conclui-se que levará mais de 4 anos para que a quantidade seja reduzida a 1/5 da quantidade inicial.'],
 [119,'Cada uma de três moedas não viciadas, quando lançada, apresenta como resultado “cara” ou “coroa”. Ao se lançarem essas três moedas, uma de cada vez, a probabilidade de se obter “cara” em duas delas e “coroa” em uma delas é superior a 0,4.'],
 [120,'Se A é uma matriz quadrada e se o sistema linear Ax = 0 tem infinitas soluções, então o sistema linear não homogêneo Ax = b, com b ≠ 0, terá infinitas soluções.']
])
const page=n=>n<=59?1:n<=76?2:n<=99?3:n<=108?4:5
const clean=s=>(s||'').replace(/\u000c/g,' ').replace(/\s+CESPE\s*[|–-]\s*CEBRASPE[\s\S]*$/iu,'').replace(/\s+Espaço livre\s*$/iu,'').replace(/\s+/g,' ').replace(/\s+([.,;:!?])/g,'$1').trim()
const answers=new Map(raw.map(x=>[Number(x.numero),x.gabarito?.resposta]))
for(const [n,a] of [[111,'E'],[112,'E'],[113,'C'],[114,'C'],[115,'E'],[116,'C'],[117,'C'],[118,'E'],[119,'E'],[120,'E']])answers.set(n,a)
const keyHash=hashRevisao([...answers].map(([n,a])=>`${n}:${a}`).join('|'))
if(answers.size!==70||[...answers.values()].some(a=>!['C','E','X'].includes(a)))throw new Error('Transcrição do gabarito definitivo incompleta')
const decisions=raw.map(x=>{
 const n=Number(x.numero),q=active.get(x.id),p=page(n),image=`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,answer=answers.get(n),annulled=answer==='X'||x.anulada===true||n===69,stem=corrected.get(n)||clean(x.enunciado)
 if(!stem||stem.length<20)throw new Error(`Item ${n}: enunciado ausente`)
 return {id:x.id,sha256_enunciado:hashRevisao(q.enunciado),materia:subject(n),conteudo:topic(n),ano:2022,concurso:'PETROBRAS — Processo Seletivo Público 2021, Ênfase 23: Geofísica — Geologia; aplicação em 20/02/2022',numero_original:n,pagina:p,dificuldade:[51,52,54,57,58,63,66,67,69,70,71,73,80,81,82,85,87,88,89,91,93,95,97,98,100,101,102,107,108,109,110,111,112,113,115,116,117,118,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela exigência conceitual e de cálculo; não é classificação oficial da banca.',resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,gabarito_oficial:{valor:annulled?'X':answer,fonte:gabarito,sha256:x.gabarito?.sha256||keyHash,sha256_tipo:x.gabarito?.sha256?'sha256_registrado_na_fonte_documental':'hash_da_transcricao_dos_itens_51_a_120',numero:n,resposta:annulled?'X':answer,metodo:'Gabarito definitivo oficial do Cargo 23, aplicação em 20/02/2022; justificativas oficiais de alteração e anulação conferidas.'},classificacao_fonte:prova,motivo:`Item ${n} conferido visualmente na página ${p} do caderno oficial; conteúdo classificado pelo enunciado, figura e comando do bloco.`,visual:{pagina:p,imagem:image,texto_apoio:block(n),motivo:`Conferência visual da página ${p} do caderno oficial; imagens, diagramas e texto de apoio do bloco associados ao item.`},enunciado:stem,...(annulled?{anulada:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:new Set(decisions.map(d=>d.numero_original)).size,materias:Object.fromEntries(['Geologia','Física','Matemática'].map(m=>[m,decisions.filter(d=>d.materia===m).length])),anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),formulasRestauradas:[113,114,115,116,117,118,120],paginas:[...new Set(decisions.map(d=>d.pagina))]},null,2));process.exit(0)}
const name='revisao-petrobras-geologia-fisica-matematica-2022-v155',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions});raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const output={...report,fonte_prova:prova,fonte_gabarito:gabarito,fonte_justificativas:justificativas,registros_revistos:70,itens_unicos:70,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),materias:{Geologia:49,Física:13,Matemática:8},formulas_restauradas:[113,114,115,116,117,118,120],publicada:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
