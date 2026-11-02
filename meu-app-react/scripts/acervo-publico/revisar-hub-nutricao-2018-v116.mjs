import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const documento='34e8bd0026e48ee5'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-${documento}.json`,'utf8'))
const origem='tmp/revisao-profissional/revisao-mpsc-promotor-2023-p1-v115/acervo-extraido'
const topicos=[
 [[1,5],'Vitaminas e minerais — vitamina A e prevenção de carências nutricionais'],[[6,10],'Política Nacional de Alimentação e Nutrição (PNAN)'],[[11,15],'Guia Alimentar — classificação e processamento de alimentos'],
 [[16,20],'Dietoterapia no diabetes mellitus'],[[21,25],'Aleitamento materno — composição, benefícios e manejo'],[[26,30],'Avaliação clínica e prescrição dietética em risco cardiometabólico e constipação'],[[31,34],'Obesidade — tratamento dietético, fisiopatologia e risco metabólico'],[[35,37],'Diabetes mellitus — controle glicêmico e dietoterapia'],[[38,39],'Cirurgia bariátrica — complicações e manejo nutricional'],
 [[40,45],'Terapia nutricional em oncologia'],[[46,48],'Nutrição no envelhecimento — sarcopenia e composição corporal'],[[49,52],'Nutrição em doenças gastrointestinais e hepáticas'],[[53,54],'Avaliação nutricional subjetiva e exame físico'],[[55,56],'Terapia nutricional na doença renal crônica'],[[57,60],'Nutrição em doenças cardiovasculares e dislipidemias'],[[61,70],'Suporte nutricional enteral e parenteral em disfagia e doença esofágica grave'],[[71,75],'Terapia nutricional em pessoas vivendo com HIV'],[[76,80],'Nutrição oncológica pediátrica e risco nutricional'],[[81,83],'Imunonutrição no paciente crítico'],[[84,86],'Interação entre nutrientes e medicamentos; administração por via enteral'],
 [[87,90],'Obesidade — determinantes sociais, tratamento e risco clínico'],[[91,96],'Avaliação antropométrica, obesidade e estado nutricional'],[[97,102],'Alimentação e prevenção de câncer e doenças crônicas não transmissíveis'],[[103,106],'Aleitamento materno e alimentação complementar'],[[107,110],'Políticas de alimentação e nutrição e ética profissional'],[[111,115],'Alimentação, diabetes, dislipidemia e fibras'],[[116,116],'Avaliação do consumo alimentar — recordatório de 24 horas e QFA'],[[117,120],'Guia Alimentar para a População Brasileira — princípios e classificação dos alimentos'],
]
const contextos=[
 [[1,5],'Texto-base: deficiências de micronutrientes, especialmente de vitamina A, permanecem como problema de saúde pública no Brasil, sobretudo entre crianças e mulheres em idade fértil. Os itens abordam prevenção, fontes alimentares, carotenoides e leite materno.'],
 [[6,10],'Texto-base: a Política Nacional de Alimentação e Nutrição (PNAN) busca melhorar as condições de alimentação, nutrição e saúde por meio de práticas alimentares adequadas, vigilância alimentar e nutricional, prevenção e cuidado integral.'],
 [[11,15],'Texto-base — alimentos e ingredientes: (1) macarrão: sêmola de farinha de trigo e água; (2) barra de cereal: xarope de glicose, cereais e flocos de cereais (farinha de arroz, milho, trigo enriquecido com ferro e ácido fólico, cevada e aveia), açúcar, extrato de malte, polidextrose, sal, carbonato de cálcio, fosfato dissódico, aveia, mel, açúcar mascavo, gordura de palma, açúcar invertido, polpa de banana, óleo de milho, lecitina de soja, corantes e aromatizante; (3) iogurte grego tradicional: leite integral, xarope de açúcar, preparado de fruta (água, xaropes, açúcar, suco de maçã concentrado, ácido cítrico, sorbato de potássio e goma xantana) e fermento lácteo; (4) granola: aveia, açúcar mascavo, trigo, gordura de palma, malte, uva-passa, maçã, mel, arroz, farelo de trigo, linhaça, castanhas, coco, gergelim e aromas; (5) compota de figo: figo e açúcar em calda. Julgue a classificação segundo o Guia Alimentar para a População Brasileira.'],
 [[16,20],'Comando: julgue os itens sobre diabetes mellitus e condutas dietoterápicas. O item 16 contém situação clínica própria, transcrita integralmente no enunciado; não é pressuposto clínico dos itens 17–20.'],
 [[21,25],'Texto-base: considere as recomendações sobre qualidade do leite humano, composição ao longo da mamada, amamentação e alimentação infantil.'],
 [[26,30],'Situação clínica comum: homem de 45 anos, IMC 27,9 kg/m², circunferência da cintura 110 cm, pressão arterial 140 × 90 mmHg, glicemia de jejum 89 mg/dL, hemoglobina glicada 6,4%, colesterol total 145 mg/dL, LDL-c 63 mg/dL e triglicerídeos 122 mg/dL; relata dificuldade para evacuar. Julgue a prescrição dietética adequada.'],
 [[31,34],'Comando: julgue os itens sobre obesidade, balanço energético, mecanismos reguladores e opções de tratamento.'],
 [[35,37],'Comando: julgue os itens sobre acompanhamento clínico e dietoterápico do diabetes mellitus.'],
 [[38,39],'Comando: julgue os itens sobre complicações tardias e manejo nutricional após cirurgia bariátrica.'],
 [[40,45],'Base técnica indicada no caderno: diretrizes da Sociedade Europeia de Nutrição Clínica e Metabolismo (ESPEN) sobre nutrição de pacientes com câncer.'],
 [[46,48],'Comando: julgue os itens sobre alterações musculoesqueléticas e composição corporal associadas ao envelhecimento.'],
 [[49,52],'Comando: julgue os itens sobre fisiopatologia e terapia nutricional nas doenças do aparelho digestório e anexos.'],
 [[53,54],'Comando: julgue a avaliação do estado nutricional por métodos subjetivos e exame físico.'],
 [[55,56],'Comando: considere a terapia nutricional na doença renal crônica, nas fases dialítica e não dialítica.'],
 [[57,60],'Comando: considere recomendações nutricionais para doenças cardiovasculares, dislipidemia e hipertensão arterial.'],
 [[61,70],'Situação clínica comum: paciente A, 50 anos, 52 kg e 165 cm, com megaesôfago chagásico; paciente B, 50 anos, 58,2 kg e 175 cm, com câncer de esôfago. Ambos estão há quatro dias sem alimentação por disfagia grave. Julgue avaliação nutricional e prescrição de nutrição enteral/parenteral; os itens 67–70 consideram adulto de 55 kg em nutrição parenteral.'],
 [[71,75],'Texto-base: pessoas vivendo com HIV podem apresentar efeitos nutricionais da doença ou do tratamento. Julgue as recomendações nutricionais para esses pacientes.'],
 [[76,80],'Referência indicada no caderno: Consenso Nacional de Nutrição Oncológica do Instituto Nacional de Câncer; assistência nutricional pré e pós-operatória em pacientes pediátricos.'],
 [[81,83],'Base técnica indicada no caderno: diretrizes ESPEN sobre fórmulas com arginina e outros nutrientes para pacientes críticos, inclusive com complicações infecciosas.'],
 [[84,86],'Comando: julgue as interações entre alimentos, fármacos e estado nutricional, incluindo administração de medicamentos por sonda enteral.'],
 [[87,90],'Situação clínica comum: homem de 40 anos, 84,5 kg, 160 cm, analfabeto e com renda de um salário mínimo procura ambulatório de nutrição para perder peso. Julgue diagnóstico, determinantes sociais e tratamento da obesidade.'],
 [[91,96],'Texto-base: o excesso de peso é tratado como problema mundial de saúde pública. Julgue os itens sobre IMC, avaliação da adiposidade, adolescentes, obesidade e síndrome metabólica.'],
 [[97,102],'Texto-base: câncer e outras doenças crônicas não transmissíveis estão entre as principais causas de morte no Brasil. Julgue os fatores de risco e proteção nutricional.'],
 [[103,106],'Comando: julgue os itens sobre aleitamento materno e alimentação de lactentes, incluindo técnica de pega, alimentação complementar, tabagismo e colostro.'],
 [[107,110],'Comando: considere políticas, diretrizes e normas que orientam a prática profissional do nutricionista, inclusive a legislação ética e as atribuições profissionais.'],
 [[111,115],'Comando: julgue os itens sobre hábitos alimentares, consumo alimentar e tratamento dietoterápico.'],
 [[116,116],'Item sobre recordatório alimentar de 24 horas e questionário de frequência alimentar (QFA).'],
 [[117,120],'Texto-base: a segunda edição do Guia Alimentar para a População Brasileira (2014) orienta práticas alimentares saudáveis e subsidia políticas de saúde e segurança alimentar.'],
]
function faixa(n,lista){return lista.find(([[a,b]])=>n>=a&&n<=b)?.[1]}
const limpeza={
 5:/\nA Política Nacional de Alimentação e Nutrição \(PNAN\) objetiva[\s\S]*$/i,
 10:/\nA tabela a seguir mostra[\s\S]*$/i,
 20:/\nO aleitamento materno deve ser a primeira prática alimentar[\s\S]*$/i,
 25:/\nUm paciente do sexo masculino, com quarenta e[\s\S]*$/i,
 34:/\n\|\|370_RMULT[\s\S]*$/i,
 60:/\nO paciente A, com cinquenta anos de idade[\s\S]*$/i,
 70:/\nPacientes infectados com HIV[\s\S]*$/i,
 75:/\nDe acordo com o consenso nacional de nutrição oncológica[\s\S]*$/i,
 86:/\nCom o objetivo de perder peso, um homem com quarenta[\s\S]*$/i,
 106:/\nConsiderando as políticas, as diretrizes e as normas[\s\S]*$/i,
 116:/\nA segunda edição do Guia Alimentar da População Brasileira[\s\S]*$/i,
}
const q10=pendentes.filter(q=>q.numero_original===10)
if(q10.length!==2)throw Error(`Esperadas duas capturas do item 10, encontradas ${q10.length}`)
const simples=q10.find(q=>q.id==='extr-dd48871574f157b223a3')
const mesclada=q10.find(q=>q.id==='extr-024bc474e382beef4b13')
if(!simples||!mesclada)throw Error('Identidade das duas capturas do item 10 mudou')
const decisoes=pendentes.map(q=>{
 const n=Number(q.numero_original),topic=faixa(n,topicos),contexto=faixa(n,contextos)
 if(!topic||!contexto)throw Error(`Sem classe/contexto para questão ${n}`)
 let enunciado=q.enunciado.trim();if(limpeza[n])enunciado=enunciado.replace(limpeza[n],'').trim()
 if(q.id===mesclada.id){enunciado=limpeza[10]?enunciado.replace(limpeza[10],'').trim():enunciado}
 const p={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Nutrição',conteudo:topic,ano:2018,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial para prova objetiva de residência multiprofissional; não é nível declarado pelo CEBRASPE.',texto_apoio:contexto,...(enunciado!==q.enunciado.trim()?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${documento}-${String(q.pagina).padStart(4,'0')}.webp`,motivo:`Página ${q.pagina} do caderno oficial HUB/CEBRASPE 2018; conferência visual do item ${n}, de seu comando e dos recursos de apoio.`},motivo:`Concurso de Residência Multiprofissional do HUB, área de Nutrição, CEBRASPE, aplicação em 21/01/2018; tema conferido pelo comando e pelo enunciado no caderno oficial.`}
 if(q.id===mesclada.id){p.apta_resolucao=false;p.duplicada_de=simples.id;p.inelegibilidade_motivo='Duplicata OCR do item 10: captura mesclada repete o enunciado e o gabarito da captura íntegra e ainda agrega tabela, itens 11–13 e cabeçalho da prova. Mantida a captura íntegra.'}
 return p
})
const nome='revisao-hub-nutricao-2018-v116'
const rel=await aplicarRevisoesIndividuais({nome,base:origem,decisoes})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
const arq='scripts/acervo-publico/acervo-atual.mjs';await fs.writeFile(arq,(await fs.readFile(arq,'utf8')).replace('export async function lerArquivoAtual',`raizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\nexport async function lerArquivoAtual`))
const relatorio='docs/acervo/revisao-profissional/RELATORIO.md';let texto=await fs.readFile(relatorio,'utf8')
texto+=`\n\n## Revisão do caderno v116 — HUB, Residência Multiprofissional em Nutrição, 2018\n\n- Revisei ${rel.classificadas} registros pendentes e apliquei a classificação Nutrição com temas específicos (PNAN, dietoterapia, avaliação nutricional, terapia enteral/parenteral, oncologia, alimentação infantil, entre outros).\n- Conferi visualmente as seis páginas do caderno oficial. Separei cabeçalhos e textos-base que o OCR havia anexado ao fim de itens anteriores e reassociei os contextos de alimentos, casos clínicos e comandos comuns às questões correspondentes. O item 10 tinha duas capturas: preservei a íntegra e marquei a versão OCR mesclada como inelegível/duplicada. O gabarito definitivo já vinculado permaneceu intacto.\n- Ano 2018, aplicação em 21/01/2018; dificuldade média estimada editorialmente. Validação: ${rel.classificadas} registros classificados, ${rel.total} questões no acervo, ${rel.disponiveis} disponíveis e ${rel.pendentes} pendências elegíveis; ${rel.lotes_alterados} lotes alterados e facetas recalculadas.\n- Fontes primárias: [caderno oficial CEBRASPE/HUB — Nutrição](https://cdn.cebraspe.org.br/concursos/HUB_18_MULTIPROFISSIONAL/arquivos/370_RMULT_002_01.PDF), [gabarito definitivo oficial](https://cdn.cebraspe.org.br/concursos/HUB_18_MULTIPROFISSIONAL/arquivos/GAB_DEFINITIVO_370_RMULT_002_01.PDF).\n- Estado: v116 integrado localmente; não publicado no Cloudflare. Revisão integral do corpus continua.\n`
await fs.writeFile(relatorio,texto);console.log(JSON.stringify(rel))
