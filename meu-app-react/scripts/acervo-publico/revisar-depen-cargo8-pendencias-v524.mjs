import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {raizesAtuais,lotesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-depen-cargo8-agente-federal-execucao-penal-v524'
const doc='706b0a315cf4ce57'
const base='tmp/revisao-profissional/revisao-slu-df-2019-engenharia-mecanica-cargo14-v523/acervo-extraido'
const prova='https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/MATRIZ_541_DEPEN_008_00.PDF'
const gabBasicos='https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/GAB_DEFINITIVO_MATRIZ_541_DEPEN_CB2_00.PDF'
const gabEspecificos='https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/gab_definitivo_matriz_541_depen_008_00.pdf'
const gabComplementares='https://cdn.cebraspe.org.br/concursos/depen_20/arquivos/GAB_DEFINITIVO_MATRIZ_541_DEPEN_CG2_00.PDF'
const pendentes=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
assert.equal(pendentes.length,72)

const respostas={
 1:'C',2:'C',3:'E',4:'E',5:'E',6:'X',7:'C',8:'E',9:'C',10:'E',11:'E',12:'E',13:'C',14:'E',15:'E',16:'C',17:'E',18:'C',19:'E',20:'C',21:'C',22:'E',23:'E',24:'C',25:'C',26:'E',27:'C',28:'E',29:'C',30:'C',
 31:'E',32:'C',33:'E',34:'X',35:'E',36:'E',37:'E',38:'C',39:'C',40:'E',41:'C',42:'E',43:'E',44:'C',45:'E',46:'C',47:'E',48:'E',49:'E',50:'E',51:'C',52:'X',53:'C',54:'X',55:'E',56:'C',57:'C',58:'C',59:'C',60:'E',61:'C',62:'E',63:'C',64:'E',65:'C',66:'E',67:'C',68:'C',69:'E',70:'C',71:'E',72:'E',73:'C',74:'E',75:'E',76:'C',77:'C',78:'E',79:'E',80:'E',
 81:'C',82:'C',83:'C',84:'E',85:'E',86:'E',87:'C',88:'C',89:'E',90:'E',91:'C',92:'E',93:'C',94:'C',95:'C',96:'C',97:'E',98:'E',99:'E',100:'X',101:'C',102:'E',103:'E',104:'E',105:'C',106:'E',107:'C',108:'C',109:'C',110:'E',111:'C',112:'C',113:'C',114:'E',115:'E',116:'E',117:'E',118:'C',119:'C',120:'E'
}
const assuntos={
 1:['Português','Compreensão e interpretação de texto: direitos humanos e historicidade'],
 2:['Português','Inferência e relações entre tecnologia, informação e direitos'],
 3:['Português','Sintaxe: colocação pronominal e próclise'],
 4:['Português','Pontuação: isolamento de expressões explicativas'],
 5:['Redação Oficial','Manual de Redação da Presidência: fechos e tratamento em comunicações oficiais'],
 6:['Redação Oficial','Manual de Redação da Presidência: padronização dos expedientes oficiais'],
 7:['Português','Interpretação de texto literário: descrição do ambiente prisional'],
 8:['Português','Inferência e interpretação de texto'],
 9:['Português','Regência e emprego de preposições'],
 10:['Português','Coesão referencial e valor do advérbio “lá”'],
 11:['Português','Semântica de conectivos: relações temporais e proporcionais'],
 12:['Português','Interpretação de informações explícitas e implícitas'],
 13:['Português','Semântica e sinonímia: “lúgubre” e “fúnebre”'],
 14:['Direito Administrativo','Lei Anticorrupção (Lei nº 12.846/2013): responsabilidade de pessoa jurídica'],
 15:['Direito Administrativo','Lei Anticorrupção (Lei nº 12.846/2013): processo administrativo de responsabilização'],
 16:['Ética no Serviço Público','Ética e moral: autonomia e responsabilidade moral'],
 17:['Ética no Serviço Público','Ética e moral: natureza e escolha dos valores éticos'],
 18:['Direito Administrativo','Sindicância investigativa: contraditório e ampla defesa'],
 19:['Direito Administrativo','Sindicância acusatória e aplicação de penalidades disciplinares'],
 20:['Raciocínio Lógico-Matemático','Lógica proposicional: tautologia, equivalência e conectivos'],
 21:['Raciocínio Lógico-Matemático','Lógica proposicional: condicional e negação de conjunção'],
 22:['Raciocínio Lógico-Matemático','Raciocínio combinatório e distribuição de inteiros em linhas'],
 23:['Raciocínio Lógico-Matemático','Problemas de trabalho conjunto, taxas e tempo'],
 24:['Raciocínio Lógico-Matemático','Razão, porcentagem e proporção'],
 25:['Informática','Microsoft Word: sublinhado e atalhos de teclado'],
 26:['Informática','Microsoft Word: comandos da faixa de opções e pincel de formatação'],
 27:['Informática','Microsoft Word: inserção e edição de planilhas incorporadas'],
 28:['Informática','Redes: intranet, Internet e VPN'],
 29:['Informática','Power BI: painéis e integração de fontes de dados'],
 30:['Informática','Segurança da informação: cavalos de Troia e phishing'],
 31:['Direito Penal','Crimes resultantes de preconceito: racismo, fiança e penas'],
 32:['Direito Constitucional','Direitos fundamentais: liberdade e prisão em flagrante'],
 33:['Direito Constitucional','Segurança pública: atribuições constitucionais das polícias penais'],
 34:['Direito Constitucional','Direitos fundamentais das pessoas presas: separação por sexo'],
 35:['Direito Constitucional','Direitos políticos: efeitos da condenação criminal transitada em julgado'],
 36:['Direito Constitucional','Forma de governo, sistema de governo e funções presidenciais'],
 37:['Direito Administrativo','Regime jurídico dos servidores: ausência ao serviço e penalidades da Lei nº 8.112/1990'],
 38:['Direito Administrativo','Licitações e contratos: medidas de inclusão de egressos do sistema prisional'],
 39:['Direito Administrativo','Contratação direta: motivação e dispensa de licitação'],
 40:['Direito Administrativo','Lei nº 8.112/1990: aplicação a ocupantes de cargo em comissão'],
 41:['Direito Administrativo','Poderes administrativos: poder hierárquico'],
 42:['Direito Administrativo','Poderes administrativos: poder disciplinar e poder de polícia'],
 43:['Direito Administrativo','Responsabilidade civil do Estado e responsabilidade do agente público'],
 44:['Direito Administrativo','Licitações: dispensa em situação de grave risco à segurança pública'],
 45:['Direito Penal','Excludentes de ilicitude: estrito cumprimento do dever legal'],
 46:['Direito Penal','Falsidade documental: documento ideologicamente falso e prova pericial'],
 47:['Direito Penal','Extorsão: consumação e tentativa'],
 48:['Direito Penal','Interpretação da lei penal: interpretação analógica favorável'],
 49:['Direito Penal','Lei penal no tempo: abolitio criminis e efeitos da condenação'],
 50:['Direito Penal','Concurso aparente de normas: subsidiariedade entre invasão de domicílio e furto'],
 51:['Direito Penal','Crimes contra a Administração Pública: desacato'],
 52:['Direito Penal','Crimes contra a Administração Pública: evasão e tentativa de evasão'],
 53:['Direito Penal','Crimes contra a Administração Pública: resistência passiva'],
 54:['Direito Penal','Crimes contra o patrimônio: roubo e emprego de arma de fogo'],
 55:['Direito Processual Penal','Habeas corpus: legitimidade para impetração'],
 56:['Direito Processual Penal','Inquérito em ação penal privada: requerimento do legitimado'],
 57:['Direito Processual Penal','Extinção da punibilidade: reconhecimento de ofício'],
 58:['Direito Processual Penal','Resposta à acusação: absolvição sumária e rejeição da denúncia'],
 59:['Direito Processual Penal','Acordo de não persecução penal: requisitos legais'],
 60:['Direito Processual Penal','Lei processual penal no tempo: aplicação e retroatividade benéfica'],
 61:['Direito Processual Penal','Prisão especial e separação de presos'],
 62:['Direito Processual Penal','Audiência de custódia: finalidade e atos processuais'],
 63:['Direitos Humanos','Declaração Universal dos Direitos Humanos: presunção de inocência'],
 64:['Direito Constitucional','Tratados internacionais de direitos humanos e hierarquia normativa'],
 65:['Direito Administrativo','Organização administrativa: criação de colegiados interministeriais'],
 66:['Direito Penitenciário','Política Nacional de Direitos Humanos: reintegração social de pessoas presas e egressas'],
 67:['Legislação Penal Especial','Estatuto do Desarmamento: registro de armas de fogo destruídas'],
 68:['Direito Penitenciário','Conselho Nacional de Política Criminal e Penitenciária: pesquisa criminológica'],
 69:['Direito Penitenciário','Conselhos penitenciários: atribuições sobre arquitetura prisional'],
 70:['Direito Penitenciário','Conselho da Comunidade: visitas periódicas a estabelecimentos penais'],
 71:['Direitos Humanos','Regras Mínimas da ONU para o Tratamento de Pessoas Presas: finalidade da pena'],
 72:['Direito Penitenciário','Justiça restaurativa e meios alternativos na gestão de infrações disciplinares'],
 73:['Legislação Penal Especial','Lei de Organizações Criminosas: infiltração de agentes e sigilo dos autos'],
 74:['Legislação Penal Especial','Estatuto do Desarmamento: destinação de armas apreendidas'],
 75:['Legislação Penal Especial','Lei de Drogas: laudo preliminar, laudo definitivo e perito'],
 76:['Direito Penal','Lei de Tortura: inafiançabilidade e regime inicial da pena'],
 77:['Direito Processual Penal','Lei de Abuso de Autoridade: ação penal privada subsidiária'],
 78:['Direito Penal','Organização criminosa e lavagem de dinheiro: autonomia dos delitos'],
 79:['Legislação Penal Especial','Estatuto do Desarmamento: porte funcional de arma por agentes prisionais'],
 80:['Direito Penal','Organização criminosa: requisitos legais e crimes praticados por organização'],
 81:['Política Penitenciária','Plano Nacional de Política Criminal e Penitenciária: formação e saúde mental dos agentes'],
 82:['Política Penitenciária','Plano Nacional de Política Criminal e Penitenciária: monitoramento eletrônico'],
 83:['Direito Penitenciário','Lei de Execução Penal: falta grave e subversão da ordem'],
 84:['Direito Penitenciário','Lei de Execução Penal: regime disciplinar diferenciado e preso provisório'],
 85:['Direito Penitenciário','Lei de Execução Penal: sanções disciplinares'],
 86:['Segurança Pública','Sistema Único de Segurança Pública: força-tarefa de intervenção penitenciária'],
 87:['Direito Penitenciário','Regulamento penitenciário federal: agendamento e duração de visitas'],
 88:['Segurança Pública','Sistema Único de Segurança Pública: integrantes operacionais'],
 89:['Segurança Pública','Conselho Nacional de Segurança Pública: natureza e efeito das deliberações'],
 90:['Direito Penitenciário','Execução penal: competência jurisdicional do juiz da execução'],
 91:['Direito Penitenciário','Execução penal: natureza judicial e contraditório'],
 92:['Direito Penitenciário','Execução provisória da pena e prisão temporária'],
 93:['Direito Penitenciário','Execução provisória: progressão de regime antes do trânsito em julgado'],
 94:['Direito Penal','Detração penal: cômputo de prisão cautelar na pena'],
 95:['Direito Penitenciário','Visitas em presídio federal: visitação social por videoconferência'],
 96:['Direito Penitenciário','Visitas em presídio federal: parlatório e comunicação por interfone'],
 97:['Direito Penitenciário','Visitas em presídio federal: visita de crianças'],
 98:['Direito Penitenciário','Visitas em presídio federal: suspensão durante rebelião'],
 99:['Segurança Pública','Política Nacional de Segurança Pública: autonomia de institutos periciais'],
 100:['Segurança Pública','Conselho estadual e distrital de segurança pública: composição'],
 101:['Direito Penitenciário','Lei de Execução Penal: inclusão no regime disciplinar diferenciado'],
 102:['Direito Penitenciário','Princípio da legalidade e tipificação de faltas disciplinares'],
 103:['Direito Penitenciário','Regulamento Penitenciário Federal: faltas e sanções disciplinares'],
 104:['Administração Pública','Estrutura organizacional do DEPEN e proteção de dados'],
 105:['Direito Penitenciário','Atribuições do cargo de agente federal de execução penal'],
 106:['Administração Pública','Carreira federal penitenciária: progressão funcional e interstício'],
 107:['Direito Penitenciário','Regulamento de presídios federais: gravação e uso de registros de visita'],
 108:['Direito Penitenciário','Assistência à saúde de pessoa presa e internação externa'],
 109:['Direito Penitenciário','Transferência para penitenciária federal: requisitos e critérios'],
 110:['Direito Penitenciário','Regulamento Penitenciário Federal: fiscalização, reclamações e corregedoria'],
 111:['Direito Penitenciário','Assistência ao egresso: orientação e apoio à reintegração social'],
 112:['Direito Penitenciário','Regulamento Penitenciário Federal: falta grave e natureza do fato'],
 113:['Direito Penitenciário','Regulamento Penitenciário Federal: tentativa de falta disciplinar'],
 114:['Administração Pública','Carreira federal penitenciária: competência para capacitação dos servidores'],
 115:['Segurança Pública','Força Nacional de Segurança Pública: convênio e atuação voluntária'],
 116:['Direito Processual Penal','Execução penal em unidade federal: competência judicial e carta precatória'],
 117:['Direito Penitenciário','Transferência de presos para estabelecimento penal federal: critérios legais'],
 118:['Direito Penitenciário','Progressão de regime e retorno ou transferência de preso federal'],
 119:['Direito Penitenciário','Manual de Assistências do Sistema Penitenciário Federal: cirurgias eletivas']
}
const faceis=new Set([1,5,9,13,16,17,25,27,28,30,31,34,35,41,47,48,55,56,63,68,70,71,72,74,76,81,87,88,91,92,95,96,105,107,110,111,114,119])
const dificeis=new Set([20,21,23,39,43,49,58,60,64,73,78,89,90,94,101,116,117])
const provasBasicas=new Set(Array.from({length:30},(_,i)=>i+1))
const provasEspecificas=new Set(Array.from({length:50},(_,i)=>i+31))
const urlGabarito=n=>provasBasicas.has(n)?gabBasicos:provasEspecificas.has(n)?gabEspecificos:gabComplementares
const inicio=raizesAtuais.indexOf(base);assert.ok(inicio>=0)
const registros=[]
for await(const {questoes} of lotesAtuais(raizesAtuais.slice(inicio)))for(const q of questoes)if(q.documento_id===doc)registros.push(q)
const materiasDoPdf=new Map(registros.map(q=>[Number(q.numero_original??q.numero),q]))
assert.equal(registros.length,119);assert.equal(materiasDoPdf.size,119)
assert.deepEqual([...materiasDoPdf.keys()].sort((a,b)=>a-b),Array.from({length:119},(_,i)=>i+1))
const idsPendentes=new Set(pendentes.map(q=>q.id));assert.equal(registros.filter(q=>idsPendentes.has(q.id)).length,72)
const decisoes=registros.map(q=>{
 const n=Number(q.numero_original??q.numero),[materia,conteudo]=assuntos[n],resposta=respostas[n]
 assert.ok(materia&&conteudo,`classificação ausente no item ${n}`);assert.ok(resposta,`gabarito oficial ausente no item ${n}`)
 const dificuldade=dificeis.has(n)?'Difícil':faceis.has(n)?'Fácil':'Média'
 let enunciado=q.enunciado
 if(n===20)enunciado='Uma tautologia é uma proposição composta cujo valor lógico é sempre verdadeiro, independentemente dos valores lógicos das proposições que a compõem. Considerando p e q como proposições, a proposição p ∧ q ↔ ¬(p → ¬q) é uma tautologia.'
 if(n===21)enunciado='Considere as proposições p: “Paola é feliz”; q: “Paola pinta um quadro”. Assim, a proposição “Paola é feliz apenas se ela pinta um quadro” pode ser representada por ¬(p ∧ ¬q).'
 if(n===25)enunciado='Para sublinhar uma palavra no texto, é necessário selecioná-la e, em seguida, clicar o botão “S” sublinhado da barra de ferramentas ou acionar simultaneamente as teclas Ctrl + S.'
 if(n===26)enunciado='O botão “Pincel de Formatação”, indicado pelo ícone de pincel mostrado no caderno, na guia de opções identificada como “Arquivo” do Microsoft Word, é usado para colorir ou realçar palavras a que se deseja dar destaque no texto.'
 return {
  id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2021,
  concurso:'DEPEN 2020 — Cargo 8: Agente Federal de Execução Penal (prova aplicada em 2021)',
  banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'27/06/2021',cargo:'Cargo 8: Agente Federal de Execução Penal',
  numero_original:n,pagina:q.pagina,dificuldade,dificuldade_estimada:true,
  dificuldade_evidencia:'Estimativa editorial baseada na quantidade de etapas de raciocínio e na especificidade normativa; o CEBRASPE não publicou nível de dificuldade por item.',
  classificacao_fonte:prova,
  motivo:`Item ${n} conferido no caderno oficial do DEPEN, Cargo 8, aplicação em 27/06/2021; matéria e conteúdo identificados pelo assunto efetivamente cobrado e pelo comando que antecede o item. Gabarito definitivo consultado no documento oficial correspondente.`,
  ...(enunciado!==q.enunciado?{enunciado}:{}),tipo_resposta:'certo_errado',opcoes:['Certo','Errado'],
  resposta_correta:resposta==='C'?0:resposta==='E'?1:null,anulada:resposta==='X',
  gabarito_oficial:{verificada:true,url:urlGabarito(n),edicao:'Gabarito oficial definitivo — aplicação em 27/06/2021 — Cargo 8 / bloco correspondente',item:n,resposta,fonte:'CEBRASPE'},
  apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','visual_ausente','banca_nao_identificada']
 }
})
assert.equal(decisoes.length,119)
assert.equal(decisoes.filter(x=>idsPendentes.has(x.id)).length,72)
assert.equal(decisoes.filter(x=>x.gabarito_oficial.resposta==='X').length,5)
const imagem120=`paginas/${doc}-0008.webp`
await fs.access(`public/acervo-extraido/${imagem120}`)
const id120=`extr-${createHash('sha256').update(`${doc}:item:120:depen-cargo8`).digest('hex').slice(0,20)}`
const apoio120='Com relação ao Manual de Assistências do Sistema Penitenciário Federal, nos termos da Portaria DISPF/DEPEN nº 11/2015, julgue os itens subsequentes.'
const adicoes=[{
 id:id120,documento_id:doc,numero_original:120,numero:120,pagina:8,
 banca:'CEBRASPE',organizadora:'CEBRASPE',ano:2021,aplicacao:'27/06/2021',
 concurso:'DEPEN 2020 — Cargo 8: Agente Federal de Execução Penal (prova aplicada em 2021)',cargo:'Cargo 8: Agente Federal de Execução Penal',
 materia:'Direito Penitenciário',conteudo:'Manual de Assistências do Sistema Penitenciário Federal: autorização e consentimento para pesquisa científica',
 enunciado:'Em penitenciária federal, a realização de pesquisa científica com preso depende da autorização do diretor e da assistência educacional da penitenciária, além do consentimento formal do preso.',
 texto_apoio:apoio120,opcoes:['Certo','Errado'],tipo_resposta:'certo_errado',resposta_correta:1,anulada:false,
 dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na necessidade de identificar as autorizações e salvaguardas previstas no Manual de Assistências; a banca não publicou dificuldade por item.',
 classificacao_revisada:true,classificacao_pendente:false,classificacao_confianca:0.98,
 classificacao_metodo:'Transcrição e classificação individual conferidas no caderno oficial e no gabarito definitivo do CEBRASPE.',
 classificacao_evidencia:`Item 120 e comando de contexto conferidos no caderno oficial: ${prova}`,
 classificacao_fonte:prova,
 gabarito_oficial:{verificada:true,url:gabComplementares,edicao:'Gabarito oficial definitivo — Conhecimentos Complementares — aplicação em 27/06/2021',item:120,resposta:'E',fonte:'CEBRASPE'},
 pagina_imagem:imagem120,imagens_paginas:[imagem120],paginas_origem:[8],contexto_paginas:[{pagina:8,imagem:imagem120,texto:apoio120}],apoio:[{pagina:8,imagem:imagem120,texto:apoio120}],
 integridade_profissional:{apta_resolucao:true,correcao_automatica:true,verificada_individualmente:true,pendencias:[]},
 elegibilidade:{elegivel_para_resolucao:true,elegivel_para_correcao_automatica:true,apontamentos:[]}
}]
const r=await aplicarRevisoesIndividuais({nome,base,decisoes,adicoes})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}-fontes.json`,JSON.stringify({prova,gabaritos:{basicos:gabBasicos,especificos:gabEspecificos,complementares:gabComplementares},aplicacao:'27/06/2021',concurso:'DEPEN 2020 — Cargo 8: Agente Federal de Execução Penal',nota:'A edição foi conferida integralmente: os 119 registros existentes foram classificados e tiveram os gabaritos definitivos oficiais vinculados; o item 120, ausente, foi transcrito e incluído. Itens 20, 21, 25 e 26 tiveram a notação lógica e os elementos gráficos transcritos para texto acessível. As imagens de página foram preservadas como apoio visual.'},null,2))
console.log(JSON.stringify({...r,documento:doc,edicao:'DEPEN 2020 — Cargo 8',itens_revisados_e_com_gabarito_verificado:decisoes.length+adicoes.length,itens_que_sairam_da_fila_pendente:idsPendentes.size,itens_adicionados:adicoes.length,anulados:decisoes.filter(x=>x.anulada).map(x=>x.numero_original),fontes:[prova,gabBasicos,gabEspecificos,gabComplementares]}))
