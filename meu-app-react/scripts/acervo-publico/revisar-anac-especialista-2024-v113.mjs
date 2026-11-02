import fs from 'node:fs/promises'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'
import { raizesAtuais } from './acervo-atual.mjs'
const base='tmp/revisao-profissional/revisao-mpsc-promotor-2021-v112/acervo-extraido'
const pendentes=JSON.parse(await fs.readFile('tmp/pendentes-40c7403745318ea6.json','utf8'))
const grupos=[];const definir=(a,b,materia,conteudo,contexto)=>grupos.push({a,b,materia,conteudo,contexto})
definir(1,2,'Ética no Serviço Público','Ética pública: códigos de conduta e recebimento de presentes, brindes e hospitalidades por agente regulador','Comandos oficiais: surgimento dos códigos de ética e proibições aplicáveis aos servidores da ANAC.')
definir(3,5,'Regulação da Aviação Civil','Sustentabilidade ambiental, coordenação institucional do espaço aéreo e concessões aeroportuárias no Brasil','Comandos oficiais sobre política ambiental da ANAC, OACI, DECEA e início das concessões aeroportuárias.')
definir(6,10,'Regulação da Aviação Civil','Aviação internacional: regimes tarifários, liberdades do ar, estrutura da OACI e auditoria de supervisão de segurança (USOAP CMA)','Comandos oficiais sobre o manual da OACI, organização do Conselho e programa universal de monitoramento da segurança.')
definir(11,12,'Direito Aeronáutico','Lei do Aeronauta e natureza jurídica, autonomia e competências da ANAC','Comando oficial: Lei n.º 13.475/2017 e funcionamento do Sistema de Aviação Civil brasileiro.')
definir(13,14,'Regulação da Aviação Civil','Política Nacional de Aviação Civil (PNAC): diretrizes, objetivos e ações estratégicas','Comando oficial sobre a Política Nacional de Aviação Civil.')
definir(15,18,'Economia e Regulação','Teorias regulatórias, falhas de mercado, agências reguladoras e modelo de regulação setorial','Comandos oficiais sobre teorias regulatórias e papel das agências reguladoras no Estado brasileiro.')
definir(19,22,'Economia do Transporte Aéreo','Governança regulatória, perfil de companhias regionais, liberdade tarifária, preços e concorrência no transporte aéreo','Comandos oficiais sobre governança regulatória e economia da regulação e do transporte aéreo.')
definir(23,30,'Economia e Regulação','Ciclo regulatório, agenda regulatória, análise de resultado regulatório (ARR), ferramentas de regulação, governança e análise de impacto regulatório (AIR)','Comandos oficiais sobre procedimento, ferramentas e impacto regulatório; item 30 pertence ao bloco de AIR.')
definir(31,36,'Direito Aeronáutico','Regulamentos Brasileiros de Aviação Civil (RBAC), certificação, fiscalização baseada em risco e acesso a áreas restritas','Comandos oficiais sobre certificação da ANAC, fiscalização e condições de acesso a áreas restritas de segurança.')
definir(37,44,'Direito Aeronáutico','Ação fiscal, regulação responsiva, Código Brasileiro de Aeronáutica e instruções suplementares','Comandos oficiais sobre fiscalização, regulação responsiva e instrumentos normativos aeronáuticos.')
definir(45,54,'Direito Aeronáutico','Aeronavegabilidade, certificação de projeto e produção, Registro Aeronáutico Brasileiro (RAB) e ordens técnicas padrão','Comandos oficiais sobre certificados de aeronavegabilidade, RAB e certificação de projetos e organizações de produção.')
definir(55,60,'Direito Aeronáutico','Manutenção de aeronaves, limitações de aeronavegabilidade, organização de manutenção e regras gerais de operação do RBAC n.º 91','Comandos oficiais sobre manutenção aeronáutica e operação de aeronaves civis no Brasil.')
definir(61,73,'Aviação Civil: Operações e Pessoal','Operações de transporte aéreo, artigos perigosos, táxi aéreo, manutenção continuada, licenças e habilitações, formação de pessoal e medicina aeronáutica','Comandos oficiais sobre operações de transporte, pessoal da aviação civil, certificação de instrução e noções de medicina aeronáutica.')
definir(74,83,'Infraestrutura Aeroportuária','Operações, sistemas elétricos, certificação de aeródromos, incursão em pista, zoneamento de ruído, CIAD e resposta a emergências em helipontos','Comandos oficiais sobre operações e infraestrutura aeroportuária, certificação, movimentação operacional, ruído, identificação de aeródromos e planos de emergência.')
definir(84,91,'Segurança da Aviação Civil','História regulatória, Convenção de Chicago, segurança contra interferência ilícita (AVSEC) e cibersegurança da aviação','Comandos oficiais sobre segurança da aviação civil, Convenção de Chicago, controle de qualidade AVSEC e comitê de segurança cibernética.')
definir(92,103,'Economia do Transporte Aéreo','Concorrência e preços, frequências e slots, dados de mercado, direitos do consumidor e modelos de regulação econômica','Comandos oficiais sobre mercado, transporte regular, infraestrutura, dados operacionais, regulação econômica, consumo e Convenção de Chicago.')
definir(104,111,'Concessões Aeroportuárias','Licitação e relicitação, EVTEA, tarifas, enquadramento de passageiros, investimentos, natureza jurídica dos aeroportos e concessões vigentes','Comandos oficiais sobre concessões aeroportuárias, receitas tarifárias, investimentos e situação de aeroportos concedidos.')
definir(112,120,'Segurança Operacional da Aviação','Teoria do queijo suíço, prevenção de acidentes, USOAP, PNSO, CSO-BR, grupos colaborativos e Sistema de Gerenciamento da Segurança Operacional (SGSO)','Comandos oficiais sobre segurança operacional, auditoria USOAP, PNSO/CSO-BR, grupos colaborativos e SGSO.')
const correcoes=new Map([
 [2,'É vedado ao servidor da ANAC receber presentes, brindes e hospitalidades oferecidos por quem tenha interesse em decisão sua ou de colegiado do qual participe.'],
 [33,'A regulamentação, a certificação e a fiscalização são os processos desempenhados pela ANAC para fins de regulação.']
])
const decisoes=[]
for(const q of pendentes){const n=Number(q.numero_original),g=grupos.find(x=>n>=x.a&&n<=x.b);if(!g)throw Error(`Sem classificação específica para item ${n}`)
 let enunciado=correcoes.get(n)||q.enunciado
 enunciado=enunciado.replace(/\s*\|\|[^\n]*(?:\n|$)[\s\S]*$/,'').replace(/\s*Espaço livre\s*[\s\S]*$/i,'').replace(/\s*CEBRASPE\s*[–-]\s*ANAC\s*[–-]\s*Edital:\s*2023[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
 decisoes.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:g.materia,conteudo:g.conteudo,ano:2024,numero_original:n,pagina:q.pagina,dificuldade:'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial de complexidade técnica e regulatória; o caderno não publica nível oficial de dificuldade.',motivo:`Classificação pela seção e pelo conteúdo do caderno CEBRASPE/ANAC do concurso regido pelo edital de 2023, com prova aplicada em 2024.`,...(enunciado!==q.enunciado?{enunciado}:{}),visual:{pagina:q.pagina,imagem:`paginas/${q.documento_id||'40c7403745318ea6'}-${String(q.pagina).padStart(4,'0')}.webp`,texto_apoio:g.contexto,motivo:'Página do caderno oficial vinculada ao item; a classificação segue o comando temático correspondente.'}})
}
if(decisoes.length!==118)throw Error(`Esperadas 118 decisões, encontradas ${decisoes.length}`)
await aplicarRevisoesIndividuais({nome:'revisao-anac-especialista-2024-v113',base,decisoes})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-anac-especialista-2024-v113/acervo-extraido')
