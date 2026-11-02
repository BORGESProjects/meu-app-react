import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-seduc-recife-2023-cargo9-matematica-v287'
const base = 'tmp/revisao-profissional/revisao-capes-2024-cargo1-administracao-v286/acervo-extraido'
const doc = '7af973bc9e8b56ba'
const prova = 'https://cdn.cebraspe.org.br/concursos/SEDUC_RECIFE_23_PROFESSOR/arquivos/829_SEDUC_RECIFE_23_009_01.PDF'
const gabarito = 'https://cdn.cebraspe.org.br/concursos/SEDUC_RECIFE_23_PROFESSOR/arquivos/GAB_DEFINITIVO_829_SEDUC_RECIFE_23_009_01.PDF'
const registro = JSON.parse((await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl', 'utf8')).split(/\r?\n/).find(x => x.includes(`"documento_id": "${doc}"`)))
if (registro.status !== 'tabela_lida' || registro.arquivo_prova !== '829_SEDUC_RECIFE_23_009_01.PDF' || registro.sha256 !== 'b5827caab3ec6dac125467df2ef31f534e2efb57c5efd7be4558d6c570afb857') throw Error('Identificação ou digest do gabarito definitivo não confere')

const temas = {
  51:['Matemática','Divisibilidade, máximo divisor comum e mínimo múltiplo comum'],
  52:['Matemática','Mínimo múltiplo comum aplicado a ciclos e horários'],
  53:['Matemática','Divisibilidade: critério de divisibilidade por 11'],
  54:['Matemática','Números primos e compostos'],
  55:['Matemática','Grandezas e medidas: conversão de unidades de área'],
  56:['Matemática','Grandezas e medidas: contagem de dias e ciclos semanais'],
  57:['Matemática','Grandezas e medidas: capacidade e conversão entre litros e mililitros'],
  58:['Matemática','Grandezas e medidas: área e custo de superfícies'],
  59:['Matemática','Operações com números naturais e racionais: consumo e custo'],
  60:['Matemática','Operações com frações: divisão e medida'],
  61:['Matemática','Porcentagem: aumentos sucessivos e variação acumulada'],
  62:['Matemática','Sistema de numeração decimal: contagem de algarismos'],
  63:['Matemática','Potenciação de números decimais'],
  64:['Matemática','Números racionais: representação decimal de frações'],
  65:['Matemática','Radiciação e propriedades de potências com expoentes fracionários'],
  66:['Matemática','Multiplicação de números decimais e casas decimais'],
  71:['Educação','Educação matemática na infância: classificação e construção do conceito de número'],
  72:['Educação','Educação matemática na infância: inclusão de classes e conservação'],
  73:['Educação','Educação matemática na infância: seriação e conservação de grandezas'],
  74:['Matemática','Padrões e sequências: contagem de peças em figuras'],
  75:['Matemática','Padrões e sequências: crescimento de figuras e contagem'],
  76:['Matemática','Padrões e sequências: soma de termos e contagem de triângulos'],
  77:['Matemática','Padrões e sequências: soma de termos e contagem de quadrados'],
  78:['Matemática','Geometria plana: transformações geométricas e rotação'],
  79:['Matemática','Geometria plana: transformações geométricas e translação'],
  80:['Matemática','Geometria plana: transformações geométricas e reflexão'],
  81:['Matemática','Geometria espacial: área total de paralelepípedo retângulo'],
  82:['Matemática','Geometria espacial: volume de prisma de base trapezoidal'],
  83:['Matemática','Geometria espacial: volume de paralelepípedo retângulo'],
  84:['Matemática','Geometria plana: área do círculo'],
  85:['Matemática','Geometria plana: área de setores e regiões circulares'],
  86:['Matemática','Geometria plana: área de coroa circular e cálculo de raio'],
  87:['Matemática','Geometria plana: ângulos entre retas e setores circulares'],
  88:['Matemática','Trigonometria no triângulo retângulo: tangente'],
  89:['Matemática','Geometria plana: distância entre pontos e teorema de Pitágoras'],
  90:['Matemática','Geometria plana: distância entre pontos e teorema de Pitágoras'],
  91:['Matemática','Equações e sistemas lineares: modelagem de quantidades'],
  92:['Matemática','Equações e sistemas lineares: razões e comparação de quantidades'],
  93:['Matemática','Equações e sistemas lineares: relações entre quantidades'],
  94:['Matemática','Funções: avaliação de função e modelagem de receita e investimento'],
  95:['Matemática','Funções: igualdade entre modelos e interpretação de gráficos'],
  96:['Matemática','Funções: domínio, imagem e análise de valores'],
  97:['Estatística','Estatística descritiva: amplitude total'],
  98:['Estatística','Estatística descritiva: média aritmética'],
  99:['Estatística','Estatística descritiva: mediana'],
  100:['Estatística','Estatística descritiva: média após inclusão de novo valor'],
  101:['Estatística','Estatística descritiva: moda'],
  102:['Estatística','Distribuição de frequências: média estimada para dados agrupados'],
  103:['Estatística','Distribuição de frequências: frequência relativa'],
  104:['Estatística','Distribuição de frequências: intervalos de classe e contagem'],
  105:['Matemática','Grandezas proporcionais: proporcionalidade direta e inversa'],
  106:['Matemática','Grandezas proporcionais: variação direta entre horas de estudo e nota'],
  107:['Matemática Financeira','Juros simples: capital, montante e juros pagos']
}

const enunciados = {
  51:'Considere que uma diretora deseje preparar brindes para a premiação de um evento escolar e que, para tanto, planeje comprar 416 balas de caramelo, 544 pirulitos e 288 chocolates. Nessa situação hipotética, ela conseguirá montar 39 saquinhos de lembranças, com 32 doces em cada um deles.',
  52:'Considere que dois ônibus saiam do mesmo ponto de partida e façam suas viagens de ida e volta ao referido ponto de partida em 35 minutos e 45 minutos, respectivamente. Nessa situação hipotética, caso os ônibus comecem a rodar às 6 h da manhã, eles se encontrarão novamente no ponto de partida às 11 h 15 min da manhã.',
  53:'O número 5.267.922 é múltiplo de 11.',
  54:'O número 2023 é primo.',
  55:'A medida de área 13 dam² − 13 m² + 13 cm² é igual a 128.700,13 dm².',
  56:'Se hoje fosse domingo, seria correto afirmar, então, que daqui a 101 dias seria uma terça-feira.',
  57:'Se, em uma festa de despedida de ano de uma escola, houver 12 garrafas de 1,5 L de refrigerante, então será possível encher 72 copos de 250 mL de refrigerante.',
  58:'Considere que uma escola esteja fazendo orçamentos para novos quadros brancos de 3 m de comprimento e 1,50 m de altura. Considere, ainda, que a empresa X cobre R$ 126,50 por metro quadrado do quadro branco. Nessa situação hipotética, caso a escola compre os quadros dessa empresa, o valor pago será superior a R$ 3.000,00.',
  59:'Considere que Jussara tenha decidido passar férias em João Pessoa e, por isso, tenha de percorrer 140 km de carro de sua residência até essa cidade. Considere, ainda, que o carro consuma, em média, 16 km/L. Nessa situação hipotética, caso o preço do litro da gasolina seja R$ 4,90, então Jussara gastará R$ 85,75 com combustível no percurso de ida e de volta.',
  60:'Se 3/4 kg de granola forem preparados e embalados em sacos que comportem 1/8 kg de granola, então serão necessárias 8 embalagens para armazenar a quantidade total preparada.',
  61:'Se a produção de carros de certa empresa tiver crescido 10% em cada um dos últimos três anos, então o crescimento acumulado durante esse período será de 30%.',
  62:'Caso os números de 1 a 68 sejam impressos de tal forma que cada algarismo seja impresso em uma folha, então o algarismo 5 será impresso 16 vezes.',
  63:'A diferença entre 1,1³ e 0,9³ é 0,2³.',
  64:'A representação decimal do número 3530/125 tem três casas decimais.',
  65:'O número ⁷√(³√(√7)) pode ser reescrito na forma ¹⁰⁵√(7⁷¹).',
  66:'O produto dos números 1,32 e 4,753 é um número com cinco casas decimais.',
  71:'O professor Júlio propôs uma atividade em que os alunos tiveram de agrupar os brinquedos espalhados em uma mesa de acordo com determinada característica. Nessa situação hipotética, o professor trabalhou o conceito de classificação.',
  72:'Maria pediu aos alunos que pegassem uma jarra de água sobre a mesa e distribuíssem seu conteúdo em vários copos plásticos. Em seguida, pediu que devolvessem o conteúdo dos copos à jarra. Nessa situação, a professora trabalhou o conceito de inclusão de classes, já que a água foi distribuída em classes diferentes de compartimentos.',
  73:'Ana pediu aos alunos que colocassem algumas figuras em ordem crescente de tamanho. Nessa situação hipotética, ela trabalhou o conceito de conservação de grandezas.',
  74:'A figura F₂₂₃ dessa sequência tem menos de 460 peças do tipo quadrado.',
  75:'A figura F₃₀₀ dessa sequência tem mais de 1.600 peças do tipo triângulo.',
  76:'O número total de triângulos do tipo T₂ que aparecem nas primeiras 40 figuras é inferior a 1.700.',
  77:'O número total de quadrados do tipo Q₂ que aparecem nas primeiras 20 figuras dessa sequência é superior a 300.',
  78:'A figura 9A2-IV foi obtida por meio de uma rotação de 90° no sentido horário, com centro de rotação no ponto C.',
  79:'A figura 9A2-II foi obtida por meio de uma translação.',
  80:'A figura 9A2-III foi obtida por meio de uma reflexão, tomando como eixo de reflexão a reta horizontal que passa pelo ponto C.',
  81:'A área total do bloco B, considerando suas seis faces, é superior a 290 m².',
  82:'O volume do bloco A é superior a 22 m³.',
  83:'O volume do bloco B é inferior a 130 m³.',
  84:'A área do círculo C₂ é inferior a 14 m².',
  85:'A área entre os eixos 1 e 7 é superior a 310 m².',
  86:'Se a área entre os círculos C₄ e C₆ for igual a 63π m², então o raio R₆ do círculo C₆ será inferior a 14 m.',
  87:'O ângulo entre as retas que passam pelos eixos 4 e 5 é superior a 47°.',
  88:'A tangente do ângulo θ indicado na figura é superior a 1,7.',
  89:'A distância em linha reta entre Petrolina e Ouricuri é superior a 170 km.',
  90:'A distância em linha reta entre Serra Talhada e Arcoverde é inferior a 110 km.',
  91:'O número de foliões que seguiu o bloco Solar foi superior a 7 mil.',
  92:'O número de foliões que seguiu o bloco Gato Preto foi superior a 5 mil.',
  93:'O número de foliões que seguiu o bloco Bola da Vez foi inferior a 3 mil.',
  94:'O investimento a ser feito no início de 2034 é superior a 120 milhões de reais.',
  95:'O estudo revela que, em algum momento de 2042, o valor investido em infraestrutura será igual à receita obtida com turismo.',
  96:'De acordo com o estudo, as projeções de receitas com turismo serão sempre inferiores a 200 milhões de reais.',
  97:'A amplitude total das idades dos estudantes da turma é igual a 20.',
  98:'A idade média dos estudantes da turma é igual a 10,5 anos.',
  99:'A mediana das idades dos estudantes da turma é igual a 10 anos.',
  100:'Se um estudante for acrescentado à turma sem alterar a idade média, então a idade desse novo estudante deverá ser superior a 12 anos.',
  101:'A moda das idades dos estudantes da turma é igual a 12 anos.',
  102:'A média das alturas dos estudantes da turma é inferior a 1,5 metro.',
  103:'A frequência relativa simples da categoria de altura de 1,61 m a 1,70 m é inferior a 0,3.',
  104:'Se Paulo e Maria, estudantes dessa sala, têm alturas iguais a 1,53 m e 1,50 m, respectivamente, então pelo menos metade dos estudantes da sala tem altura inferior a 1,55 m.',
  105:'Se um estudante que faltou a 5 aulas no trimestre tirou nota 80, então um estudante que faltou a 8 aulas no trimestre terá tirado nota superior a 60.',
  106:'Se um estudante que estudou 100 horas semanais tirou nota 90, então um estudante que estudou 80 horas semanais terá tirado nota superior a 70.',
  107:'Se a pessoa pagar às instituições financeiras A e B, respectivamente, R$ 5.400,00 e R$ 3.400,00, então os juros pagos às duas instituições terão sido exatamente iguais.'
}

const apoios = {
  '51-54':'Com relação aos conceitos de divisibilidade, máximo divisor comum e mínimo múltiplo comum, julgue os itens a seguir.',
  '55-58':'Julgue os itens seguintes, relativos a grandezas e medidas.',
  '59-62':'A respeito de problemas que envolvam operações elementares com números naturais, inteiros e racionais, julgue os itens que se seguem.',
  '63-66':'No que se refere a operações com números decimais, julgue os próximos itens.',
  '71-73':'Em cada item é apresentada uma situação hipotética e uma assertiva a ser julgada sobre o conceito de número na educação infantil.',
  '74-77':'As figuras F₁, F₂, F₃, F₄ e as peças Q₁, Q₂, T₁ e T₂ aparecem no diagrama da página original. As figuras seguintes obedecem à mesma lei de formação. Use o diagrama para contar os tipos de peças.',
  '78-80':'As casas e os prédios de Olinda apresentam azulejos, gradis e cobogós. A figura 9A2-I mostra um detalhe de gradil; as figuras 9A2-II, 9A2-III e 9A2-IV foram obtidas por transformações geométricas aplicadas a essa figura. Consulte os diagramas originais nas páginas indicadas.',
  '81-83':'A figura 9A2-V apresenta a ponte Maurício de Nassau e suas seis colunas. A figura 9A2-VI detalha uma coluna formada por dois sólidos: o bloco A é um prisma reto de base trapezoidal e o bloco B é um paralelepípedo retângulo. As dimensões estão no diagrama original.',
  '84-87':'A figura representa a Rosa dos Ventos no centro da praça Barão de Rio Branco (Marco Zero), em Recife. Há oito círculos concêntricos C₁ a C₈, de raios R₁ a R₈, e oito eixos igualmente espaçados. Dados: R₁ = 0,6 m, R₂ = 2 m, R₄ = 9 m e R₈ = 20 m. Consulte o diagrama da página original para os eixos.',
  '88-90':'O mapa esquemático mostra distâncias aproximadas entre cidades pernambucanas. Petrolina, Cabrobó e Ouricuri formam um triângulo retângulo, com ângulo θ em Ouricuri; Cabrobó, Serra Talhada e Arcoverde também formam um triângulo retângulo. As medidas e a posição dos vértices estão na figura original.',
  '91-93':'Três blocos de carnaval — Gato Preto, Solar e Bola da Vez — reuniram 12 mil foliões ao todo. O Gato Preto recebeu o dobro de foliões da Bola da Vez; o Solar recebeu tantos quanto os outros dois juntos. Nenhum folião seguiu mais de um bloco.',
  '94-96':'O estudo compara receitas de turismo R(t) e investimentos em infraestrutura I(t) ao longo de 30 anos. Ambas as funções são dadas no caderno original, em milhões de reais; t = 0 corresponde ao início de 2023, t = 1 ao início de 2024, e assim sucessivamente. Consulte as expressões matemáticas na imagem da página 3.',
  '97-101':'Em uma turma de 20 estudantes, 5 têm 9 anos, 11 têm 10 anos, 3 têm 11 anos e 1 tem 12 anos.',
  '102-104':'A tabela de alturas de 20 estudantes apresenta frequências: 1,31–1,40 m: 2; 1,41–1,50 m: 6; 1,51–1,60 m: 8; 1,61–1,70 m: 4.',
  '105-106':'A nota final da prova de matemática é diretamente proporcional às horas estudadas e inversamente proporcional ao número de faltas.',
  '107':'Uma pessoa tomou empréstimos nas instituições A e B nos valores de R$ 5.000,00 e R$ 3.000,00, respectivamente.'
}
const apoioFaixa = n => Object.entries(apoios).find(([faixa]) => {const [a,b]=faixa.split('-').map(Number);return n>=a&&n<=(b||a)})?.[1]||''
const dificuldadeDificil = new Set([52,54,55,61,65,74,75,76,77,81,82,83,85,86,88,94,95,100,104,107])
const chaves = registro.respostas
const canonical = {59:'extr-c53baae5275c1eae88f4',60:'extr-44819742a6d3e4d2d506',61:'extr-52ac03a23cbbac50b875',63:'extr-e85809bf9ccd2190e698',64:'extr-33284ccfa8c45bf95652',65:'extr-4e8069613e6dc7594c23'}
const qs = JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`, 'utf8'))
if (qs.length !== 59) throw Error(`Esperados 59 registros pendentes no documento, recebidos ${qs.length}`)
const letras = {C:0,E:1}
const decisōes = qs.map(q => {
  const n=Number(q.numero),tema=temas[n],resposta=chaves[n]
  if(!tema||!enunciados[n]) throw Error(`Falta revisão individual da questão ${n}`)
  if(!['C','E','X'].includes(resposta)) throw Error(`Falta gabarito oficial para questão ${n}`)
  const duplicada=canonical[n]&&canonical[n]!==q.id
  const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
  const anulada=resposta==='X'
  const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:tema[0],conteudo:tema[1],ano:2023,concurso:'SME Recife — Professor II, Matemática (Cargo 9), aplicação em 11/06/2023',numero_original:n,pagina,cargo:'Professor II — Matemática, Cargo 9',dificuldade:dificuldadeDificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial por operações, abstração e quantidade de etapas; não é taxa estatística oficial.',classificacao_fonte:prova,motivo:`Item ${n} do caderno oficial 829_SEDUC_RECIFE_23_009_01, prova de conhecimentos específicos do Cargo 9 (Professor II — Matemática). O tópico foi identificado pelo comando e pelo conteúdo matemático do item.`,visual:{pagina,imagem,enunciado:enunciados[n],texto_apoio:apoioFaixa(n),motivo:'Imagem da página do caderno oficial conferida e mantida para fórmulas, tabelas, figuras e elementos gráficos.'},gabarito_oficial:{fonte:gabarito,sha256:registro.sha256,numero:n,pagina:1,resposta:anulada?null:resposta,criterio:anulada?'Gabarito definitivo oficial marca X; item anulado.':'Gabarito definitivo oficial do caderno 829_SEDUC_RECIFE_23_009_01.'},resposta_correta:anulada?null:letras[resposta],anulada,apta_resolucao:!duplicada,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado']}
  if(duplicada){d.inelegibilidade_motivo='Cópia OCR duplicada do mesmo item e edição; mantida apenas para auditoria.';d.duplicada_de=canonical[n]}
  return d
})
for(const d of decisōes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes:decisōes})
const relatorio={...resultado,prova:'SME Recife — Professor II, Matemática (Cargo 9), aplicação em 11/06/2023',documento_id:doc,registros_revisados:decisōes.length,questoes_unicas_classificadas:new Set(decisōes.filter(x=>x.apta_resolucao).map(x=>x.numero_original)).size,questoes_duplicadas:decisōes.filter(x=>!x.apta_resolucao).map(x=>({numero:x.numero_original,id:x.id,duplicada_de:x.duplicada_de})),questoes_anuladas:decisōes.filter(x=>x.anulada).map(x=>x.numero_original),fontes:[prova,gabarito],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
