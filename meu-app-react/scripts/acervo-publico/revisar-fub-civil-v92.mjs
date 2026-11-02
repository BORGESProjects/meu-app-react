import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const base='tmp/revisao-profissional/revisao-fub-agronomia-v91/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-fub-civil.json','utf8'))
const topicos=new Map(),definir=(ns,m,c)=>ns.forEach(n=>topicos.set(n,{materia:m,conteudo:c}))
definir([51,52,53,54],'Engenharia Civil','Projeto básico e executivo, orçamento de obras públicas e reajuste contratual')
definir([56,57,58,59],'Engenharia Civil','Orçamentação de obras: aditivos, composição de custos, produtividade e consumo de materiais')
definir([60,61,62],'Engenharia Civil','Terraplenagem: produtividade de equipamentos, empolamento, volumes e transporte de solo')
definir([64,65],'Engenharia Civil','Desempenho de edificações: vida útil de projeto, garantias e segurança de uso')
definir([66,67,68],'Engenharia Civil','Orçamento de obras: BDI, custos indiretos, mobilização e formação da taxa')
definir([69],'Instalações Elétricas','Eletrodutos e componentes de instalações elétricas prediais')
definir([70],'Engenharia Sanitária','Sistemas públicos de coleta e condução de esgoto e águas pluviais')
definir([71,72],'Construção Civil','Materiais e sistemas construtivos: poliestireno expandido e steel frame')
definir([73,74,75,76],'Gerenciamento de Projetos','Gestão do valor agregado: valor planejado, valor agregado, custo e prazo')
definir([77,78,79],'Gerenciamento de Projetos','Gestão de riscos: respostas, matriz SWOT, análise qualitativa e quantitativa')
definir([80,81,82],'Direito Urbanístico','Política Nacional de Mobilidade Urbana, infraestrutura e planos municipais')
definir([83,84,85,86],'Engenharia Civil','Patologia das estruturas: fissuras de cisalhamento em vigas de concreto')
definir([87,88,89,90,91],'Engenharia de Avaliações','Avaliação de imóveis: métodos, laudos, classificação de bens e depreciação')
definir([92,93,94],'Acessibilidade e Desenho Universal','Acessibilidade em edificações públicas e reserva de vagas de estacionamento')
definir([95,96],'Topografia e Geodésia','Curvas de nível, sistemas de coordenadas e orientação cartográfica')
definir([97,98,99],'Manutenção Predial','Manutenção preventiva, corretiva e modernização de elevadores e edificações')
definir([100,101,102,103,104],'Direito Urbanístico','Parcelamento do solo urbano, infraestrutura, registro e distinção entre loteamento e desmembramento')
definir([105,106,107,108,109,110,111,112],'Engenharia Sanitária e Ambiental','Esgotamento sanitário, soluções individuais, tratamento de água, compostagem e resíduos')
definir([113,114],'Legislação de Saneamento','Marco legal do saneamento básico, princípios e componentes dos serviços')
definir([115,116],'Licenciamento Ambiental','Licenças ambientais e renovação da licença de operação')
definir([117,118],'Gestão de Recursos Hídricos','Outorga de uso da água, competências e controle quantitativo e qualitativo')
definir([119,120],'Direito Ambiental','Código Florestal e áreas de preservação permanente')
const decisoes=pendentes.map(q=>{
 const n=q.numero_original,t=topicos.get(n);if(!t)throw Error(`Sem classificação para o item ${n}`)
 const pagina=q.pagina
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t.materia,conteudo:t.conteudo,ano:2016,numero_original:n,pagina,
  dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela leitura do item e pelo nível técnico de aplicação em prova para Engenheiro Civil; não é dado oficial da banca.',
  motivo:'Caderno oficial CEBRASPE/FUB 2016, cargo 2 — Engenheiro/área Civil; tópico identificado pela leitura do enunciado e do comando comum da seção.',
  visual:{pagina,imagem:`paginas/${q.documento_id}-${String(pagina).padStart(4,'0')}.webp`,motivo:'Página original conferida visualmente; preserva tabelas, esquemas, figuras e comandos compartilhados.'}}
})
const report=await aplicarRevisoesIndividuais({nome:'revisao-fub-civil-v92',base,decisoes})
await fs.writeFile('docs/acervo/revisao-profissional/revisao-fub-civil-v92-notas.json',JSON.stringify({prova:'FUB 2016 — cargo 2, Engenheiro/área Civil',fonte:'https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_002_01.pdf',paginasConferidas:[1,2,3,4,5],itensRevisados:decisoes.length,itens:[...topicos.keys()].sort((a,b)=>a-b),relatorio:report},null,2))
