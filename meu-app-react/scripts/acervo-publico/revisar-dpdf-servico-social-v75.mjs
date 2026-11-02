import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome='revisao-dpdf-servico-social-v75'
const base='tmp/revisao-profissional/revisao-irbr-ingles-politica-internacional-v74/acervo-extraido'
const doc='d696ad186f938132'
const prova='https://cdn.cebraspe.org.br/concursos/dpdf_20_analista/arquivos/548_DPDF_013_01.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/dpdf_20_analista/arquivos/DPDF_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const qs=JSON.parse(await fs.readFile('tmp/pendentes-dpdf-servico-social-2020.json','utf8'))
const tax={
  51:['Serviço Social','Assessoria e consultoria: estratégias participativas'],
  52:['Serviço Social','Assessoria e consultoria: intervenção e supervisão profissional'],
  53:['Serviço Social','Assessoria e consultoria: formação e análise da realidade'],
  54:['Serviço Social','Assessoria e consultoria: orientação e proposição de estratégias'],
  55:['Serviço Social','Assessoria e consultoria: competências e atribuições profissionais'],
  56:['Serviço Social','Código de Ética: intervenção e legitimidade profissional'],
  57:['Serviço Social','Código de Ética: defesa da cidadania e princípios fundamentais'],
  58:['Serviço Social','Ética profissional: condições de trabalho e qualidade dos serviços'],
  59:['Serviço Social','Ética profissional: reflexão crítica sobre a vida cotidiana'],
  60:['Serviço Social','Dimensão investigativa: relação entre investigação e intervenção'],
  61:['Serviço Social','Dimensão investigativa: pesquisa e respostas profissionais'],
  62:['Serviço Social','Lei de Regulamentação: pesquisa como componente do trabalho profissional'],
  63:['Serviço Social','Dimensão investigativa: saberes interventivos e procedimentais'],
  64:['Serviço Social','Pesquisa e produção do conhecimento: mediação entre teoria e realidade'],
  65:['Serviço Social','Estudo social: finalidade, análise institucional e planejamento'],
  66:['Serviço Social','Estudo social: acesso a benefícios e subsídios sociojurídicos'],
  68:['Serviço Social','Dimensão técnico-operativa: instrumentos, técnicas e estratégias'],
  69:['Serviço Social','Trabalho interdisciplinar: diálogo e ética profissional'],
  70:['Serviço Social','Instrumentos técnico-operativos: entrevista'],
  71:['Serviço Social','Mobilização social: participação em conselhos e disputa política'],
  72:['Serviço Social','Mobilização social: atuação profissional em espaços conselhistas'],
  73:['Serviço Social','Mobilização e organização social: práticas profissionais'],
  74:['Serviço Social','Práticas educativas: organização e mobilização de classes'],
  75:['Política de Assistência Social','PNAS: seguranças de sobrevivência, acolhida e convívio'],
  76:['Política de Assistência Social','PNAS: matricialidade sociofamiliar'],
  77:['Política de Assistência Social','PNAS: usuários, vulnerabilidade e riscos sociais'],
  78:['Política de Assistência Social','Proteção social básica: acolhimento e atendimento a famílias'],
  79:['Direito da Criança e do Adolescente','ECA: direitos da gestante e da parturiente'],
  80:['Direito da Criança e do Adolescente','ECA: entrega voluntária para adoção e escuta qualificada'],
  81:['Direito da Criança e do Adolescente','ECA: comunicação de violência e maus-tratos'],
  82:['Direito da Criança e do Adolescente','ECA: internação e acompanhamento de crianças e adolescentes'],
  83:['Política de Saúde','Política Nacional de Saúde da Pessoa Idosa: população atendida'],
  84:['Política de Saúde','Política Nacional de Saúde da Pessoa Idosa: autonomia e independência'],
  85:['Política de Saúde','Política Nacional de Saúde da Pessoa Idosa: prioridades de atendimento'],
  86:['Serviço Social','HIV/AIDS: discriminação e direitos da pessoa usuária'],
  87:['Serviço Social','Ética e sigilo profissional: comunicação de diagnóstico à família'],
  88:['Direito Previdenciário','RGPS: filiação e aposentadoria por incapacidade permanente'],
  89:['Políticas Públicas','Políticas sociais: direitos, cidadania e ação estatal'],
  90:['Políticas Públicas','Proteção social brasileira: condicionantes econômicos, políticos e sociais'],
  91:['Políticas Públicas','Proteção social pública: integralidade e articulação das políticas'],
  92:['Política de Assistência Social','Seguridade Social: proteção contributiva e previdência'],
  93:['Políticas Públicas','Proteção social: universalidade e acumulação capitalista'],
  94:['Seguridade Social','Previdência e assistência social: cobertura e princípios'],
  95:['Políticas Públicas','Proteção social brasileira: descontinuidade e desigualdade de acesso'],
  96:['Política de Saúde','SUS: diretrizes da atenção básica e territorialização'],
  97:['Política de Saúde','Atenção Primária à Saúde: Estratégia Saúde da Família'],
  98:['Política de Saúde','Atenção Primária à Saúde: ações e atributos'],
  99:['Direito Processual Civil','Mediação: escolha e designação do mediador'],
  100:['Direito Processual Civil','Lei de Mediação: princípios e confidencialidade'],
  101:['Direito Processual Civil','Mediação: atuação e impedimentos do mediador'],
  102:['Serviço Social','Código de Ética: vínculo profissional e finalidade eleitoral'],
  103:['Serviço Social','Código de Ética: autonomia e liberdade de decisão do usuário'],
  104:['Direitos Humanos','PNDH-3: segurança pública, acesso à justiça e combate à violência'],
  105:['Direitos Humanos','PNDH-3: direitos das vítimas e proteção de pessoas ameaçadas'],
  106:['Direitos Humanos','PNDH-3: direitos da criança e do adolescente'],
  107:['Direito da Mulher','Lei Maria da Penha: alimentos provisionais e medidas protetivas'],
  108:['Direito da Mulher','Lei Maria da Penha: restrição de armas do agressor'],
  109:['Direito da Mulher','Lei Maria da Penha: reeducação do agressor e proteção da vítima'],
  110:['Direito Previdenciário','Segurado especial: atividade remunerada e limite de renda'],
  111:['Legislação Educacional','LDB: princípios do ensino'],
  112:['Política de Saúde','SUS: participação complementar de serviços privados'],
  113:['Direitos da Pessoa Idosa','Estatuto da Pessoa Idosa: liberdade e participação religiosa'],
  114:['Direito Constitucional','Objetivos fundamentais da República e direitos sociais'],
  115:['Direito Previdenciário','Custeio da Seguridade Social: princípios e base de financiamento'],
  116:['Política de Assistência Social','LOAS: descentralização e participação social'],
  117:['Política de Saúde','SUS: participação complementar da iniciativa privada'],
}
const contextos={
  51:'Situação do caderno: Rafael é assistente social experiente, atua como consultor e presta assessoria a conselhos de saúde e gestores privados. Itens 51–55 avaliam assessoria, consultoria e a Lei de Regulamentação da profissão.',
  56:'Situação do caderno: Rosa, assistente social em empresa com controle de produtividade, prioriza reflexão ética e defesa da cidadania. Itens 56–59 tratam do Código de Ética e da atuação profissional.',
  60:'Situação do caderno: Sabrina adota postura investigativa e incorpora a pesquisa ao planejamento, execução, avaliação e revisão do trabalho. Itens 60–64 tratam das dimensões investigativa e interventiva.',
  65:'Bloco: estudo social, seus objetivos, pareceres e subsídios para benefícios, serviços e planejamento.',
  68:'Bloco: dimensão técnico-operativa, entrevista e trabalho interdisciplinar no Serviço Social.',
  71:'Bloco: mobilização social e organização dos sujeitos atendidos pelo Serviço Social.',
  75:'Bloco: Política Nacional de Assistência Social (PNAS) e proteção social.',
  79:'Bloco: direitos à vida e à saúde conforme o Estatuto da Criança e do Adolescente.',
  83:'Bloco: Política Nacional de Saúde da Pessoa Idosa (PNSPI).',
  86:'Situação do caderno: usuário recebe diagnóstico positivo de HIV e busca orientação sobre direitos. Itens 86–88 avaliam sigilo, discriminação e proteção previdenciária.',
  89:'Texto-base: reflexão sobre a proteção social pública e a relação entre políticas sociais, Estado, cidadania e direitos.',
  92:'Texto-base: reflexão sobre a institucionalização da previdência e a proteção social brasileira.',
  96:'Bloco: Política Nacional de Atenção Básica no âmbito do SUS.',
  99:'Bloco: Lei nº 13.140/2015, que disciplina mediação e autocomposição de conflitos na administração pública.',
  102:'Bloco: disposições do Código de Ética Profissional da(o) Assistente Social.',
  104:'Bloco: Programa Nacional de Direitos Humanos (PNDH-3), eixo de segurança pública, acesso à justiça e combate à violência.',
  107:'Bloco: medidas protetivas de urgência previstas na Lei Maria da Penha.',
  110:'Bloco: legislação social, enquadramento de segurado especial e princípios da educação.',
  112:'Bloco: legislação social, saúde, direitos da pessoa idosa e direitos constitucionais.',
  115:'Bloco: Lei nº 8.212/1991, organização e custeio da Seguridade Social.',
}
const contextStarts=Object.keys(contextos).map(Number).sort((a,b)=>a-b)
const difficultyHard=new Set([52,55,59,60,61,62,63,64,65,66,67,69,71,72,73,74,77,78,80,81,82,86,88,91,93,94,95,96,98,100,101,104,107,108,109,110,114,115,117])
const clean={
  55:'O exercício da assessoria/consultoria é uma competência e uma atribuição privativa de Rafael, como assistente social.',
  59:'A reflexão ética realizada por Rosa pressupõe a suspensão da cotidianidade e, por isso, tem por objetivo sistematizar a crítica da vida cotidiana e responder às suas necessidades imediatas.',
  64:'A pesquisa, assim como a que se observa no fazer profissional de Sabrina, é uma mediação privilegiada na relação entre conhecimento e realidade e resulta em um conhecimento sempre inteiro e relativo a um tempo e espaço sociocultural e historicamente indeterminado.',
  70:'A entrevista implica uma relação entre sujeitos, sendo atravessada por sentimentos diversos, tanto por parte do usuário como do assistente social.',
  74:'As ações de mobilização e de organização são condição indispensável para a concretização das práticas educativas desenvolvidas pelo assistente social e vinculam-se a um único projeto societário de determinada classe social.',
  78:'A proteção social básica deve priorizar a reestruturação dos serviços de abrigamento voltados ao atendimento das pessoas vítimas de violência que não contem mais com a proteção de suas famílias.',
  82:'Nos casos de internação de criança ou adolescente, os estabelecimentos de atendimento à saúde, inclusive as unidades neonatais, de terapia intensiva e de cuidados intermediários, deverão proporcionar condições para a permanência em tempo integral de um dos pais ou responsável.',
  85:'As diretrizes da PNSPI preveem a prioridade ao atendimento dos idosos com deficiência ou em situação de rua.',
  88:'Dada a especificidade de sua condição, o usuário tem direito à aposentadoria por invalidez, mesmo que se filie à previdência social somente após o diagnóstico.',
  91:'Verifica-se no país o que pode ser chamado de incompletude da proteção social pública, que se manifesta em um desarranjo estratégico caracterizado pela omissão do Estado em consolidar direitos, reconhecer e prover acessos e gerar a articulação e a integridade de atenção quanto ao ingresso e a serviços de diferentes políticas sociais.',
  95:'Observam-se os seguintes aspectos na proteção social brasileira: descontinuidade, inserções diferenciadas, não integralidade, fracionamento, segmentação, não igualdade de acesso e de reconhecimento de direitos.',
  98:'A atenção básica constitui o conjunto de ações de saúde individuais, familiares e coletivas que envolvem promoção, prevenção, proteção, diagnóstico, tratamento, reabilitação, redução de danos, cuidados paliativos e vigilância em saúde.',
  103:'É vedado ao assistente social orientar o usuário a decidir livremente sobre seus interesses.',
  106:'A garantia da igualdade dos direitos de crianças e adolescentes para o seu desenvolvimento de forma não discriminatória é uma das diretrizes desse eixo orientador.',
  114:'O objetivo fundamental da Constituição Federal de 1988 é amenizar as situações de vulnerabilidade socioeconômica e reconfigurar as expressões da questão social.',
  116:'A centralização político-administrativa é uma diretriz da organização da assistência social e manifesta-se na garantia da participação da população na elaboração, na execução e no controle das ações no âmbito da gestão municipal, estadual e distrital.',
  82:'Nos casos de internação de criança ou adolescente, os estabelecimentos de atendimento à saúde, inclusive as unidades neonatais, de terapia intensiva e de cuidados intermediários, deverão proporcionar condições para a permanência em tempo integral de um dos pais ou responsável.',
  85:'As diretrizes da PNSPI preveem a prioridade ao atendimento dos idosos com deficiência ou em situação de rua.',
  88:'Dada a especificidade de sua condição, o usuário tem direito à aposentadoria por invalidez, mesmo que se filie à previdência social somente após o diagnóstico.',
  91:'Verifica-se no país o que pode ser chamado de incompletude da proteção social pública, que se manifesta em um desarranjo estratégico caracterizado pela omissão do Estado em consolidar direitos, reconhecer e prover acessos e gerar a articulação e a integridade de atenção quanto ao ingresso e a serviços de diferentes políticas sociais.',
  95:'Observam-se os seguintes aspectos na proteção social brasileira: descontinuidade, inserções diferenciadas, não integralidade, fracionamento, segmentação, não igualdade de acesso e de reconhecimento de direitos.',
  98:'A atenção básica constitui o conjunto de ações de saúde individuais, familiares e coletivas que envolvem promoção, prevenção, proteção, diagnóstico, tratamento, reabilitação, redução de danos, cuidados paliativos e vigilância em saúde.',
  101:'O mediador poderá ser designado por particulares envolvidos em controvérsias para funcionar como testemunha em processos judiciais oriundos de conflito previamente mediado por ele.',
  103:'É vedado ao assistente social orientar o usuário a decidir livremente sobre seus interesses.',
  106:'A garantia da igualdade dos direitos de crianças e adolescentes para o seu desenvolvimento de forma não discriminatória é uma das diretrizes desse eixo orientador.',
  109:'Uma das medidas protetivas de urgência previstas na referida lei é o comparecimento do agressor, obrigatoriamente com a vítima, a programas de reeducação, caso a mulher se manifeste pela recuperação do núcleo familiar.',
  111:'De acordo com a Lei de Diretrizes e Bases da Educação Brasileira (LDB), o ensino deve ser ministrado com base na observância do princípio da unicidade de ideias e de pressupostos pedagógicos, bem como do princípio do respeito à liberdade e apreço à tolerância.',
  114:'O objetivo fundamental da Constituição Federal de 1988 é amenizar as situações de vulnerabilidade socioeconômica e reconfigurar as expressões da questão social.',
  117:'A participação de redes privadas de hospitais na assistência à saúde dos cidadãos durante a pandemia de covid-19 tem respaldo na Lei nº 8.212/1991.'
}
const decisions=[]
for(const q of qs){
 const n=Number(q.n),t=tax[n]
 if(!t)throw Error('Sem classificação para '+n)
 const pg=Number(q.pagina),imagem=`paginas/${doc}-${String(pg).padStart(4,'0')}.webp`
 await fs.access(`public/acervo-extraido/${imagem}`)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano:2020,pagina:pg,dificuldade:difficultyHard.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela densidade normativa, conceitual e pelo número de relações entre políticas públicas exigidas no item; não representa taxa oficial de acerto.',classificacao_fonte:prova,motivo:`DPDF 2020 — Analista de Apoio à Assistência Judiciária, Serviço Social, CEBRASPE; questão ${n}. Matéria e conteúdo conferidos no texto e no cabeçalho temático da página oficial.`,imagem_pagina:imagem}
 const start=contextStarts.filter(x=>x<=n).at(-1)
 if(start)d.texto_apoio=contextos[start]
 if(clean[n])d.enunciado=clean[n]
 if(n===61||n===77||n===89){const value=n===61?'X':'E';d.anulada=value==='X';d.resposta_correta=value==='X'?null:1;d.gabarito_oficial={valor:value,fonte:justificativas,metodo:'Conferido na justificativa oficial de alteração do gabarito do Cargo 13; sem PDF local para validação por hash.'}}
 decisions.push(d)
}
const byNumber=new Map()
for(const d of decisions){const n=Number(qs.find(q=>q.id===d.id).n);const arr=byNumber.get(n)||[];arr.push(d);byNumber.set(n,arr)}
const duplicates=[]
for(const [n,arr] of byNumber){if(arr.length>1){for(const d of arr.slice(1)){d.apta_resolucao=false;d.inelegibilidade_motivo=`Duplicata exata da questão ${n} no mesmo caderno oficial; mantida uma ocorrência resolvível.`;d.duplicada_de=arr[0].id;duplicates.push({n,id:d.id,duplicateOf:arr[0].id})}}}
if(decisions.length!==68||duplicates.length!==2)throw Error(`Esperadas 68 revisões com 2 duplicatas; recebidas ${decisions.length} e ${duplicates.length}`)
const result=await aplicarRevisoesIndividuais({nome,base,decisoes:decisions})
const report={...result,prova:'DPDF 2020 — Analista de Apoio à Assistência Judiciária — Serviço Social — CEBRASPE',documento_id:doc,registros_revisados:68,questoes_unicas_classificadas:66,duplicatas_desativadas:duplicates,gabaritos_oficiais_confirmados:3,itens_anulados:[61],itens_com_alteracao_oficial:[77,89],gabarito_hash_pendente:true,observacao:'Revisei os textos contra as imagens originais das quatro páginas. A justificativa oficial confirma a anulação do item 61 e a alteração para errado nos itens 77 e 89; como o arquivo binário do gabarito definitivo não está localmente disponível para hash, a correção automática permanece desabilitada. Os demais gabaritos não foram inferidos.',fontes:[prova,justificativas]}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
console.log(JSON.stringify(report))
