import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-enem-reaplicacao-ppl-2024-v79'
const base='tmp/revisao-profissional/revisao-tjpa-jornalismo-v78/acervo-extraido'
const doc='84d3c74be8ce13f0'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_reaplicacao_PPL_D2_CD11_braile_e_ledor.pdf'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-enem-bio-2024.json','utf8'))
const temas={
96:['Física','Termologia: transferência de calor por radiação e absorção térmica'],
97:['Biologia','Saúde pública: doenças tropicais negligenciadas e epidemiologia'],
99:['Biologia','Imunologia e biotecnologia: desenvolvimento de vacinas'],
100:['Biologia','Botânica: gramíneas e biodiversidade do bioma Pampa'],
101:['Biologia','Ecologia: mata ciliar, ciclo hidrológico e conservação de bacias'],
104:['Biologia','Ecotoxicologia: bioindicadores e poluição aquática'],
105:['Biologia','Genética e biotecnologia: modificação gênica e xenotransplante'],
106:['Biologia','Ecologia aquática: impactos de barragens em ecossistemas'],
107:['Física','Eletrodinâmica: circuito elétrico e efeito Joule'],
108:['Biologia','Botânica e sistemática: grupos vegetais e fungos'],
109:['Química','Química inorgânica: extração e obtenção de titânio'],
110:['Biologia','Ecologia: fixação de carbono e compensação de emissões'],
113:['Física','Oscilações: sistema massa-mola amortecido'],
115:['Física','Energia: fontes primárias e conversão em energia elétrica'],
116:['Física','Eletrodinâmica: associação de lâmpadas em paralelo'],
117:['Biologia','Virologia e farmacologia: profilaxia pré-exposição ao HIV'],
118:['Biologia','Evolução: variação, adaptação e formação de espécies'],
119:['Biologia','Botânica e microbiologia: crescimento vegetal, solo e nitrogênio'],
120:['Física','Gravitação: órbitas geoestacionárias e comunicação por satélite'],
121:['Física','Mecânica dos fluidos e atmosfera: balão meteorológico em grande altitude'],
122:['Biologia','Fisiologia humana e saúde: sódio na alimentação e hipertensão'],
123:['Física','Cinemática: queda livre e movimento uniformemente acelerado'],
124:['Química','Eletroquímica: eletrodo de armazenamento de cloreto e dessalinização'],
126:['Biologia','Ecologia urbana: impermeabilização do solo e ciclo hidrológico'],
127:['Biologia','Genética molecular: transformação bacteriana no experimento de Griffith'],
128:['Biologia','Imunologia: interpretação de IgM, IgG e avidez de anticorpos'],
130:['Física','Eletrodinâmica: fusíveis, corrente elétrica e efeito Joule'],
131:['Biologia','Ecologia: polinização e interação entre abelhas e plantas'],
132:['Química','Nanotecnologia: polímeros e nanocápsulas em anestésicos tópicos'],
133:['Química','Química orgânica e ambiental: reciclagem química do PET'],
134:['Biologia','Genética: herança, ambiente e expressão fenotípica'],
135:['Biologia','Fisiologia e ecologia: poluição luminosa e mamíferos noturnos'],
136:['Matemática','Estatística: leitura e comparação de dados em gráfico'],
137:['Matemática','Análise de dados: contagem de combinações e preços de apartamentos'],
138:['Matemática','Razões e proporções: equivalência entre idade animal e humana'],
139:['Matemática','Geometria e escala: representação de planta baixa'],
140:['Matemática','Matemática financeira: comparação de preços e decisão de compra'],
142:['Matemática','Escala e proporcionalidade: reprodução de obra em tela'],
144:['Matemática','Estatística: comparação de resultados e medidas de tendência central'],
147:['Matemática','Porcentagem: comparação de ofertas e descontos comerciais'],
148:['Matemática','Matemática financeira: custo de aquisição e margem de revenda'],
149:['Matemática','Razão, proporção e tempo: taxas de transmissão de dados'],
150:['Matemática','Probabilidade: sorteio e distribuição de funcionários por número de filhos'],
154:['Matemática','Estatística: razão entre precipitação e dias chuvosos'],
155:['Matemática','Estatística: interpretação de gráfico e diferença média entre salários'],
158:['Matemática','Funções afins e sistemas lineares: comparação de propostas de locação'],
159:['Matemática','Proporcionalidade: excesso de carga e consumo de combustível'],
160:['Matemática','Geometria plana: dimensões de tijolos e área de parede'],
162:['Matemática','Progressões: crescimento anual de área reflorestada'],
163:['Matemática','Funções exponenciais e porcentagem: depreciação de automóvel'],
164:['Matemática','Otimização: escolha de alimentos sob restrições nutricionais e de custo'],
167:['Matemática','Geometria espacial: cilindros, volume e otimização de embalagem'],
169:['Matemática','Funções e comparação de custos: alternativas de treinamento profissional'],
170:['Matemática','Grandezas digitais: resolução e densidade de pixels de imagem'],
171:['Matemática','Estatística: comparação de preços de combustíveis em diferentes regiões'],
172:['Matemática','Sistemas de equações: determinação do preço de um prato e consumo total'],
173:['Matemática','Proporcionalidade inversa: produtividade de equipes de trabalho'],
174:['Matemática','Regra de três composta: voluntários, estandes e tempo de trabalho'],
176:['Matemática','Função afim: controle de nível mínimo de reservatório por sensor'],
177:['Matemática','Geometria plana: transformações e dobras de folha retangular'],
178:['Matemática','Logaritmos: relação entre pressão sonora e nível em decibéis'],
}
const dificuldadeAlta=new Set([99,105,107,109,113,117,119,121,124,127,128,132,133,134,135,137,140,144,149,150,155,158,160,162,163,164,167,169,172,173,174,176,177,178])
const limpos={
  126:'Nas últimas décadas, a população dos centros urbanos tem requerido a pavimentação das vias públicas para aumentar o conforto e minimizar o desgaste de veículos. A impermeabilização impede a infiltração da água no solo e pode carrear poluentes para os cursos de água. Qual ação poderia mitigar os efeitos danosos da contaminação dos cursos de água em virtude da impermeabilização das vias públicas?',
}
if(qs.length!==61)throw Error(`Esperados 61 itens; encontrados ${qs.length}`)
const decisoes=qs.map(q=>{
 const id=q.id,n=Number(q.numero_original),numeroCorrigido=id==='extr-6aa8dcaee26a6edd6571'?155:n
 const [materia,conteudo]=temas[numeroCorrigido]||[]
 if(!materia)throw Error(`Sem classificação específica para ${id}, questão ${n}`)
 const pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`
 const d={id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2024,pagina,dificuldade:dificuldadeAlta.has(numeroCorrigido)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial segundo as operações, conceitos e etapas de raciocínio exigidas; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`ENEM 2024, reaplicação PPL, segundo dia, caderno 11 adaptado para Braille e ledor; item ${numeroCorrigido}. Disciplina e assunto conferidos pelo enunciado e pela identificação da área no caderno oficial.`,visual:{pagina,imagem,motivo:'Página original conferida visualmente; imagem preservada para gráficos, fórmulas, figuras e dados de apoio.'}}
 if(limpos[numeroCorrigido])d.visual.enunciado=limpos[numeroCorrigido]
 if(numeroCorrigido!==n)d.numero_original=numeroCorrigido
 return d
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'ENEM 2024 — Reaplicação PPL — 2º dia — Caderno 11 — Braille e ledor',documento_id:doc,registros_revisados:61,questoes_unicas_classificadas:61,correcoes_de_disciplina:61,numero_original_corrigido:[{id:'extr-6aa8dcaee26a6edd6571',de:142,para:155}],paginas_origem_conferidas:61,gabarito_hash_pendente:true,observacao:'O lote estava inteiramente classificado como Biologia, mas reúne itens de Ciências da Natureza e Matemática. Reclassifiquei individualmente por disciplina e conteúdo, mantendo páginas originais com fórmulas, gráficos e figuras. Corrigi também o número original do item de diferença salarial, que aparece como questão 155 no caderno. Gabarito não foi vinculado sem arquivo binário verificável; não habilitei correção automática.',fontes:[prova]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
