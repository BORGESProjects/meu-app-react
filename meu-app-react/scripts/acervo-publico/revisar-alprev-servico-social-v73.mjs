import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-alprev-servico-social-v73'
const base='tmp/revisao-profissional/revisao-tjam-arquivologia-v72/acervo-extraido'
const doc='c568a369485f99b9'
const prova='https://www.cebraspe.org.br/concursos/ALPREV_26'
const qs=JSON.parse(await fs.readFile(`tmp/pendentes-${doc}.json`,'utf8'))
const tax={
 52:['Serviço Social','Instrumentos técnico-operativos: entrevista na política de assistência social'],
 53:['Serviço Social','Instrumentos técnico-operativos: visita domiciliar e direitos humanos'],
 54:['Serviço Social','Instrumentos técnico-operativos: visita institucional e articulação em rede'],
 55:['Serviço Social','Instrumentos técnico-operativos: comunicação oral e produção de documentos'],
 56:['Serviço Social','História do Serviço Social: perspectivas de renovação profissional'],
 57:['Serviço Social','Movimento de Reconceituação e Congresso da Virada'],
 58:['Serviço Social','Instrumentos e técnicas: dimensão técnico-operativa'],
 59:['Serviço Social','Instrumentos técnico-operativos: entrevista e processo dialógico'],
 60:['Serviço Social','História do Serviço Social: Mary Richmond e entrevista'],
 61:['Serviço Social','Instrumentalidade: natureza e direção da técnica profissional'],
 62:['Serviço Social','Código de Ética: dever de denunciar violações institucionais'],
 63:['Serviço Social','Código de Ética: penalidades e cassação do registro'],
 64:['Serviço Social','Regulamentação profissional: autonomia em perícias'],
 65:['Políticas Públicas','Avaliação de políticas: análise ex ante'],
 66:['Políticas Públicas','Avaliação de políticas: análise ex ante e ex post'],
 67:['Políticas Públicas','Modelos de análise da pobreza e políticas de renda mínima'],
 68:['Serviço Social','Formação profissional: mudanças sociotécnicas e educação continuada'],
 69:['Serviço Social','Trabalho profissional: teoria, realidade social e questão social'],
 70:['Serviço Social','Lei de Regulamentação Profissional: registro de entidades'],
 71:['Serviço Social','Lei de Regulamentação Profissional: competências profissionais'],
 72:['Serviço Social','Lei de Regulamentação Profissional: estudo socioeconômico'],
 73:['Serviço Social','Trabalho profissional: precarização e relações de trabalho'],
 74:['Serviço Social','Trabalho profissional: competências, atribuições e autonomia'],
 75:['Serviço Social','Trabalho profissional: espaços sócio-ocupacionais e transformações sociais'],
 76:['Legislação Social','Violência contra a mulher: violência reprodutiva'],
 77:['Legislação Social','Violência contra a mulher: violência vicária'],
 78:['Legislação Social','Violência contra a mulher: violência física e patrimonial'],
 79:['Legislação Social','Lei Maria da Penha: violência psicológica e moral'],
 80:['Direito da Criança e do Adolescente','Proteção ao trabalho do adolescente: idade mínima e aprendizagem'],
 81:['Direito da Criança e do Adolescente','Aprendizagem: direitos do adolescente aprendiz'],
 82:['Direito da Criança e do Adolescente','Aprendizagem: direitos trabalhistas e previdenciários'],
 83:['Política de Assistência Social','População em situação de rua: definição e caracterização'],
 84:['Política de Assistência Social','População em situação de rua: acolhimento e articulação de serviços'],
 85:['Política de Assistência Social','População em situação de rua: proteção social especial e unidades de atendimento'],
 86:['Direito Previdenciário','RGPS: prestações e benefícios devidos aos segurados'],
 87:['Direito Previdenciário','Princípios e objetivos da Previdência Social: reajuste e cálculo dos benefícios'],
 90:['Serviço Social','Família: arranjos, redes de apoio e estratégias de sobrevivência'],
 91:['Serviço Social','Família: vínculos socioafetivos e configurações familiares'],
 92:['Serviço Social','Família: configurações anaparental, monoparental e multiparental'],
 93:['Políticas Públicas','Proteção social brasileira: reformas e orientação neoliberal'],
 94:['Políticas Públicas','Política social: crise fiscal, gasto público e focalização'],
 95:['Políticas Públicas','Políticas para a juventude: Programa Pé-de-Meia'],
 96:['Políticas Públicas','Políticas para a juventude: Identidade Jovem (ID Jovem)'],
 97:['Política de Assistência Social','PNAS: proteção social básica e serviços territoriais'],
 98:['Política de Assistência Social','PNAS: público usuário, vulnerabilidade e riscos sociais'],
 99:['Política de Assistência Social','LOAS: descentralização, participação e cofinanciamento'],
 100:['Direito Previdenciário','BPC: requisitos etários e pessoa com deficiência'],
 101:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: transporte coletivo gratuito'],
 102:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: trabalho e acesso a cargos públicos'],
 103:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: direito ao respeito'],
 104:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: acompanhante em serviços de saúde'],
 105:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: benefício assistencial e idade mínima'],
 106:['Legislação Educacional','LDB: ensino religioso e matrícula facultativa'],
 107:['Legislação Educacional','LDB: composição da educação básica'],
 108:['Legislação Educacional','LDB: atribuições dos municípios'],
 109:['Legislação Educacional','LDB: finalidades da educação básica'],
 111:['Direito Previdenciário','Previdência Social: finalidade e contingências cobertas'],
 112:['Direito Previdenciário','Previdência Social: gestão democrática e descentralizada'],
 113:['Direito Previdenciário','Conselho Nacional de Previdência Social: competências'],
 114:['Direito Previdenciário','RGPS: categorias de beneficiários'],
 115:['Direito Previdenciário','Custeio da Seguridade Social: enquadramento previdenciário de empregado doméstico'],
 117:['Direito Previdenciário','RGPS: filiação em atividades remuneradas simultâneas'],
 118:['Direito Previdenciário','RGPS: segurado obrigatório contribuinte individual'],
 119:['Legislação Social','Lei Maria da Penha: auxílio-aluguel e proteção social da mulher'],
}
const contexto={
  52:'Bloco: dimensão técnico-operativa do Serviço Social. Julgue os itens sobre entrevista, visita domiciliar e institucional e comunicação profissional.',
  56:'Bloco: institucionalização e movimento de Reconceituação do Serviço Social na América Latina e no Brasil.',
  58:'Bloco: concepções e debates sobre instrumentos e técnicas do Serviço Social.',
  62:'Bloco: Código de Ética da(o) Assistente Social.',
  65:'Bloco: concepção, operacionalização e avaliação de planos, programas e projetos.',
  68:'Bloco: redimensionamento da profissão de assistente social diante das transformações societárias.',
  70:'Bloco: Lei de Regulamentação da Profissão de Assistente Social.',
  73:'Bloco: competências, atribuições e condições de trabalho profissional.',
  73:'Bloco: competências, atribuições e condições de trabalho profissional.',
  76:'Bloco: legislação de proteção às mulheres e formas de violência.',
  80:'Bloco: direitos à profissionalização e proteção no trabalho de crianças e adolescentes.',
  83:'Bloco: Política Nacional para a População em Situação de Rua.',
  86:'Bloco: benefícios e princípios do Regime Geral de Previdência Social.',
  90:'Bloco: família, relações sociais e configurações familiares.',
  93:'Bloco: reforma do sistema de proteção social e política social brasileira.',
  95:'Bloco: políticas públicas brasileiras voltadas à juventude.',
  97:'Bloco: Política Nacional de Assistência Social (PNAS).',
  101:'Bloco: Estatuto da Pessoa Idosa.',
  106:'Bloco: Lei de Diretrizes e Bases da Educação Nacional (Lei nº 9.394/1996).',
  111:'Bloco: legislação previdenciária e organização do RGPS.',
  115:'Bloco: Lei Orgânica da Seguridade Social (Lei nº 8.212/1991).',
  119:'Bloco: Lei Maria da Penha (Lei nº 11.340/2006).',
}
const correcoes={
  55:'A comunicação verbal feita no âmbito de entrevista realizada no locus de trabalho do assistente social, isto é, no atendimento direto ao usuário, expressa maior formalidade que a exigida na escrita de um relatório ou parecer decorrente de uma perícia em serviço social.',
  56:'As três perspectivas atreladas ao processo de renovação do Serviço Social no Brasil são a tendência modernizadora, a reatualização do conservadorismo e a intenção de ruptura.',
  58:'Os instrumentos e as técnicas do Serviço Social são definidos em um compêndio universal, no qual o assistente social consulta os procedimentos sequenciais a fim de executá-los de modo padronizado e ético.',
  61:'O instrumental técnico-operativo, inerente à prática do assistente social, é direcionado ao alcance dos objetivos postos pelo profissional, sendo, dessa forma, a técnica profissional classificada como de natureza neutra.',
  62:'É direito do assistente social abster-se de denunciar falhas regulatórias da instituição na qual exerce suas atividades laborais, ainda que essas falhas violem os princípios e as diretrizes do Código de Ética da(o) Assistente Social.',
  63:'O referido código estipula a aplicação de penalidades, conforme os fatos apurados, podendo, inclusive, ser deliberada a cassação do registro profissional.',
  64:'Uma vez que a práxis profissional do assistente social é regida pela autonomia e pela defesa intransigente dos direitos, as nomeações para atuar em perícias impõem o aceite compulsório do assistente social, em qualquer situação.',
  69:'Historicamente, é possível constatar um expressivo “voo teórico” no âmbito do Serviço Social, ainda que este tenha repercutido na dissociação da profissão em relação ao movimento da realidade concreta, assim como das inúmeras expressões da questão social.',
  78:'Caracteriza violência física a conduta de subtração e destruição de objetos e utensílios de trabalho da mulher.',
  119:'Suponha que uma mulher em situação de violência doméstica se encontre em condição de vulnerabilidade social e econômica e necessite deixar a residência em que vivia com o agressor. Nesse contexto, o juiz poderá conceder auxílio-aluguel, observada a situação de vulnerabilidade, pelo período previsto na lei.'
}
const hard=new Set([53,56,57,61,62,63,64,65,66,67,69,74,76,77,79,83,84,85,86,87,93,94,95,96,99,100,105,107,108,109,111,115,117,118,119])
const inicioContexto=Object.keys(contexto).map(Number).sort((a,b)=>a-b)
const decisoes=[]
for(const q of qs){
 const n=Number(q.n),t=tax[n]
 if(!t)throw Error('Sem taxonomia para '+n)
 const pg=Number(q.pagina),imagem=`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const bloco=inicioContexto.filter(x=>x<=n).at(-1)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2026,pagina:pg,dificuldade:hard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na densidade normativa ou conceitual e nas relações exigidas pelo item; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`ALPREV 2026 — Analista Previdenciário, área Serviço Social, CEBRASPE; questão ${n}. Identificação do assunto pelo enunciado e pelo cabeçalho temático da prova oficial.`,imagem_pagina:imagem,texto_apoio:contexto[bloco]}
 if(correcoes[n])d.enunciado=correcoes[n]
 decisoes.push(d)
}
if(decisoes.length!==64)throw Error(`Esperadas 64 questões, encontrei ${decisoes.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes})
const report={...result,prova:'ALPREV 2026 — Analista Previdenciário — Área Serviço Social — CEBRASPE',documento_id:doc,registros_revisados:64,questoes_unicas_classificadas:64,gabaritos_oficiais_transcritos:0,gabarito_pendente:true,observacao:'Classificação por conteúdo do caderno e separação dos comandos compartilhados por bloco. A prova foi disponibilizada no sistema oficial com consulta autenticada, mas a chave não foi obtida em formato local verificável nesta revisão; respostas não foram inferidas e a correção automática não foi habilitada.',fontes:[prova,'https://security.cebraspe.org.br/ALPREV_26/Recursos/Objetiva/GabaritoPreliminar_7C9D79BC-4A75-49B0-8860/default.aspx']}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
