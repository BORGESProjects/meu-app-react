import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'
const base='tmp/revisao-profissional/revisao-anac-especialista-2024-v113/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-d7437d4cf413e52c.json','utf8'))
const grupos=[];const definir=(a,b,materia,conteudo,contexto)=>grupos.push({a,b,materia,conteudo,contexto})
definir(1,2,'Ética no Serviço Público','Código de Ética e deveres dos servidores da ANAC: conflito de interesses, presentes e hospitalidades','Comandos do Curso de Formação: código de ética do servidor público e direitos/deveres de agentes da ANAC.')
definir(3,3,'Regulação da Aviação Civil','Política de sustentabilidade da ANAC e mecanismo CORSIA de compensação de emissões da aviação','Comando oficial: Política de Sustentabilidade da ANAC e CORSIA.')
definir(4,12,'Direito Aeronáutico','Introdução ao transporte aéreo, acordos de serviços, liberdades do ar, OACI/SARPs, USOAP e Sistema de Aviação Civil Brasileiro','Comandos oficiais sobre introdução ao transporte aéreo e constituição/funcionamento dos sistemas de aviação civil internacional e brasileiro.')
definir(13,14,'Regulação da Aviação Civil','Política Nacional de Transportes (PNT), Política Nacional de Aviação Civil (PNAC) e competência da Secretaria de Aviação Civil','Comando oficial: política de aviação civil.')
definir(15,18,'Economia e Regulação','Teoria regulatória, falhas de mercado, Estado regulador e papel das agências','Comandos oficiais sobre teoria regulatória e papel das agências reguladoras.')
definir(19,22,'Economia do Transporte Aéreo','Governança regulatória, modelos de companhias aéreas, custos e falhas de governo no transporte aéreo','Comandos oficiais sobre governança e economia da regulação do transporte aéreo.')
definir(23,30,'Economia e Regulação','Direito regulatório, agenda e análise de impacto regulatório, ferramentas, processo normativo da ANAC e avaliação de resultado regulatório','Comandos oficiais sobre direito administrativo/regulatório, ferramentas, normatização, governança regulatória e ARR.')
definir(31,36,'Direito Aeronáutico','Certificação aeronáutica, fases de certificação, ação fiscal, fiscalização baseada em risco e poder de polícia em áreas restritas','Comandos oficiais sobre certificação, fiscalização e atuação de agentes da administração em áreas restritas aeroportuárias.')
definir(37,44,'Direito Aeronáutico','Ação fiscal, vigilância continuada, regulação responsiva, Código Brasileiro de Aeronáutica e instruções suplementares','Comandos oficiais sobre ação fiscal, regulação responsiva e normas/instruções da ANAC.')
definir(45,54,'Direito Aeronáutico','Certificação de projeto e produção, aeronavegabilidade, Registro Aeronáutico Brasileiro e ordens técnicas','Comandos oficiais sobre certificados de aeronavegabilidade, RAB e certificação de projeto/produção.')
definir(55,60,'Direito Aeronáutico','Manutenção de aeronaves, limitações de aeronavegabilidade e regras gerais de operação (RBAC n.º 91)','Comandos oficiais sobre manutenção aeronáutica e aeronavegabilidade continuada.')
definir(61,68,'Aviação Civil: Operações e Pessoal','Operações de transporte aéreo, artigos perigosos, táxi aéreo, manutenção da aeronavegabilidade e serviços aéreos especializados','Comandos oficiais sobre operações de transporte e serviços aéreos especializados.')
definir(69,72,'Aviação Civil: Operações e Pessoal','Licenciamento e certificação de pessoal, AVSEC, ultraleves e organizações de instrução (CIAC/CTAC)','Comandos oficiais sobre licenças, processo de certificação de pessoal e centros de instrução.')
definir(73,73,'Medicina da Aviação','Ilusões visuais e fatores médicos/operacionais de voo','Comando oficial: ilusões visuais estudadas pela medicina na aviação.')
definir(74,74,'Economia e Regulação','Incentivos regulatórios e multas como instrumento financeiro','Comando oficial sobre incentivos regulatórios.')
definir(75,83,'Infraestrutura Aeroportuária','RBAC n.º 154, código de referência, certificação e manutenção de aeródromos, CIAD, plano diretor, vertiportos e incursão em pista','Comandos oficiais sobre infraestrutura, certificação/vigilância de aeródromos e vertiportos.')
definir(84,91,'Segurança da Aviação Civil','História regulatória, PNAVSEC, certificação AVSEC, inspeção de segurança, facilitação e cibersegurança','Comandos oficiais sobre segurança da aviação civil, certificação/controle de qualidade AVSEC e cibersegurança.')
definir(92,103,'Economia do Transporte Aéreo','Regulação de mercado, custos e autorização de operadores, slots, tarifas, dados de pontualidade e direitos do passageiro','Comandos oficiais sobre regulação econômica, mercado de serviços aéreos, infraestrutura e relações de consumo.')
definir(104,111,'Concessões Aeroportuárias','Comissão Especial de Licitação, prazo/objeto de concessão, receitas, indicadores de qualidade, obras e situação dos aeroportos concedidos','Comandos oficiais sobre concessões aeroportuárias, remuneração, investimento e obras.')
definir(112,120,'Segurança Operacional da Aviação','Modelos de acidentes, USOAP, Programa/Plano Nacional de Segurança Operacional, CST e Sistema de Gerenciamento da Segurança Operacional','Comandos oficiais sobre gestão e governança da segurança operacional da aviação.')
const correcoes=new Map([
 [2,'É defeso aos servidores da ANAC receber presentes, tais como brindes e hospitalidades, oferecidos por quem tenha interesse em decisão sua ou de colegiado do qual participe.'],
 [3,'O acordo do CORSIA (Mecanismo de Compensação de Emissões da Aviação), adotado pelo Brasil, obriga o país a iniciar o monitoramento das emissões e compensá-las a partir de 2050.'],
 [33,'No processo de fiscalização, a vigilância continuada não se confunde com a ação fiscal, porque, primariamente, esta adota medidas sem caráter punitivo, enquanto aquela determina medidas acautelatórias e punições.']
])
const decisoes=[]
for(const q of pendentes){const n=Number(q.numero_original),g=grupos.find(x=>n>=x.a&&n<=x.b);if(!g)throw Error(`Sem classificação específica para item ${n}`)
 let enunciado=correcoes.get(n)||q.enunciado
 enunciado=enunciado.replace(/\s*\|\|[^\n]*(?:\n|$)[\s\S]*$/,'').replace(/\s*Espaço livre\s*[\s\S]*$/i,'').replace(/\s*CEBRASPE\s*[–-]\s*ANAC\s*[–-]\s*Edital:\s*2023[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g.materia,conteudo:g.conteudo,ano:2023,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial de complexidade técnica e regulatória; a prova não publica nível de dificuldade.',motivo:'Classificação pela seção e pelo conteúdo do caderno oficial do Curso de Formação da ANAC, identificado no edital 2023.',...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${q.documento_id||'d7437d4cf413e52c'}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Página da prova oficial vinculada ao item, com o comando correspondente associado ao grupo temático.'}})
}
if(decisoes.length!==117)throw Error(`Esperadas 117 decisões, encontradas ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-anac-curso-formacao-v114',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anac-curso-formacao-v114/acervo-extraido')
