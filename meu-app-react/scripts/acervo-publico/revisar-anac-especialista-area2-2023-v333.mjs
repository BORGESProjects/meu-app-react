import fs from 'node:fs/promises'
import {raizesAtuais} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='91c67a5079d1bd53'
const prova='https://cdn.cebraspe.org.br/concursos/anac_23/arquivos/945_ANAC_23_002_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/anac_23/arquivos/GAB_DEFINITIVO_945_ANAC_23_002_01.PDF'
const concurso='ANAC — Especialista em Regulação de Aviação Civil — Área 2 — 2023'
const records=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(catalog?.arquivo!=='945_ANAC_23_002_01.PDF'||catalog.ano_catalogo!=='2023'||!catalog.tipo_catalogo.includes('CARGO 2'))throw Error('A aplicação oficial não confere com o documento do Cargo 2')
const keyRecord=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x=>x.documento_id===doc&&x.arquivo_gabarito==='GAB_DEFINITIVO_945_ANAC_23_002_01.PDF')
if(!keyRecord||keyRecord.status!=='tabela_lida'||Object.keys(keyRecord.respostas).length!==60||keyRecord.respostas['51']!=='C'||keyRecord.respostas['110']!=='C')throw Error('Gabarito definitivo ausente ou a faixa do Cargo 2 está incompleta')
const topics={
'extr-e6ff173a41accdc11219':[51,'Engenharia Mecânica','Mecânica dos sólidos — coeficiente de Poisson','Média',1],
'extr-777b1bf76c9195e0b36f':[52,'Engenharia Mecânica','Ciência dos materiais — curva tensão–deformação e limite de resistência','Média',1],
'extr-49af11ffc74cdd05453e':[65,'Metrologia','Qualidade de medição — repetibilidade e tendência','Média',2],
'extr-187de70608a568fc6f0d':[68,'Engenharia Aeronáutica','Motores convencionais — magneto e sistema de ignição','Média',2],
'extr-e60a4741d900c4fe4343':[69,'Engenharia Mecânica','Termodinâmica — potência e rendimento de motores','Média',2],
'extr-81174d673edc90a1954d':[70,'Engenharia Aeronáutica','Motores convencionais — carburador e dosagem da mistura','Média',2],
'extr-d71d0be879824737b78e':[71,'Engenharia Aeronáutica','Aerodinâmica — sustentação, downwash e ângulo de ataque','Difícil',2],
'extr-2231f2ecdafcbf938caa':[72,'Engenharia Aeronáutica','Aerodinâmica — enflechamento de asa e efeitos no voo','Difícil',2],
'extr-70ffee1d0e17404b5d6a':[73,'Engenharia Aeronáutica','Instrumentos de voo — velocidade indicada e estol','Difícil',2],
'extr-a1018e2b4ebb5ca54ecc':[74,'Engenharia Aeronáutica','Mecânica de voo — ailerons e guinada adversa','Difícil',2],
'extr-a0c666ea16c1e24b9242':[75,'Engenharia Aeronáutica','Peso e balanceamento — braço, carga e centro de gravidade','Média',2],
'extr-c9fda5f702775bebaf9d':[76,'Engenharia Aeronáutica','Mecânica de voo — entrada em parafuso e estol','Difícil',2],
'extr-f3ea21a023cc8f83d496':[77,'Controle de Tráfego Aéreo','Regras do ar — classificação do espaço aéreo classe D','Média',2],
'extr-6bd4ddcbcf94709e09a2':[78,'Controle de Tráfego Aéreo','Regras do ar — classificação do espaço aéreo classe E','Média',2],
'extr-537eaa858b36c844707a':[79,'Controle de Tráfego Aéreo','Regras do ar — classificação do espaço aéreo classe B','Média',2],
'extr-adb4ae067264cd3487fc':[80,'Regulação Aeronáutica','Código Brasileiro de Aeronáutica — infraestrutura aeronáutica','Média',2],
'extr-5c63a85a53631dde8e92':[81,'Regulação Aeronáutica','Segurança de voo — sistema de controle do espaço aéreo e auxílios','Média',2],
'extr-ed042528cac7296e2240':[82,'Engenharia Eletrônica','Eletrônica digital — tecnologia CMOS e tipos de MOSFET','Média',2],
'extr-e6f3b95c5fcbf7e96e6e':[83,'Engenharia Eletrônica','Eletrônica analógica — ganho de estágios MOSFET em cascata','Média',2],
'extr-ff35979c13b6803c6ea3':[84,'Engenharia Eletrônica','Eletrônica analógica — amplificador seguidor de fonte','Média',2],
'extr-3a0c84acce736b82df21':[85,'Engenharia Eletrônica','Eletrônica analógica — transcondutância de MOSFET','Média',2],
'extr-f46979a0be5251246d6c':[86,'Engenharia Eletrônica','Eletrônica analógica — autopolarização e capacitor de desvio','Difícil',2],
'extr-899d7bcf161630c48846':[87,'Engenharia da Computação','Memórias digitais — programação e apagamento de EPROM','Fácil',3],
'extr-0f1af692e9ed77f3ccd1':[88,'Engenharia da Computação','Linguagens de descrição de hardware — VHDL','Média',3],
'extr-650495c3730214103180':[89,'Engenharia da Computação','Sistemas digitais — máquinas de estados de Moore','Média',3],
'extr-6a0ecb0923a60852e1fb':[90,'Engenharia da Computação','Arquitetura de computadores — características de CISC','Fácil',3],
'extr-e95a74f14639878d0d38':[91,'Telecomunicações','Osciladores de RF — VCO e diodo varactor','Média',3],
'extr-a156a82c816b7fcaee2e':[92,'Telecomunicações','Modulação AM — detector de envoltória','Média',3],
'extr-7698eb20e8a29c121283':[93,'Telecomunicações','Receptores — amplificador de baixo ruído (LNA)','Média',3],
'extr-a1c7e382c050b959d4e4':[94,'Telecomunicações','Circuitos de RF — misturadores balanceados','Difícil',3],
'extr-fe1b352e21258599050b':[95,'Telecomunicações','Antenas — antena log-periódica e classificação','Média',3],
'extr-5b6e4b7c58c4257783c7':[96,'Telecomunicações','Antenas — dispositivos passivos de transmissão','Fácil',3],
'extr-55ecb39a35bcca833391':[97,'Telecomunicações','Antenas — campos de radiação em região próxima','Difícil',3],
'extr-bb659a880c6a5ebb848e':[98,'Telecomunicações','Antenas — comprimento do dipolo e eficiência de radiação','Difícil',3],
'extr-a62d1d65f4d724733f4f':[99,'Programação','Lógica de programação — seleção por casos em pseudocódigo','Fácil',3],
'extr-d91b18e87b419892a408':[101,'Sistemas Embarcados','Microcontroladores — interfaces de comunicação serial','Fácil',3],
'extr-afc0d915aad92bc5d8f4':[102,'Arquitetura de Computadores','Microprocessadores — barramento de dados','Fácil',3]
}
const pending=records.filter(q=>q.classificacao_pendente&&q.integridade_profissional?.apta_resolucao===true&&q.materia==='Conhecimentos Específicos'&&q.conteudo==='Conteúdos gerais de Conhecimentos Específicos')
if(pending.length!==37)throw Error(`Esperadas 37 pendências da aplicação; encontradas ${pending.length}`)
const pendencias=['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto']
const decisions=[]
for(const q of pending){
 const entry=topics[q.id]
 if(!entry)throw Error(`Item sem decisão explícita: ${q.id}`)
 const [n,materia,conteudo,dificuldade,pagina]=entry,answer=keyRecord.respostas[String(n)]
 if(Number(q.numero)!==n||!answer||!['C','E','X'].includes(answer))throw Error(`Numeração ou chave oficial incompatível no item ${n}`)
 if(q.opcoes?.length!==2||q.opcoes[0]!=='Certo'||q.opcoes[1]!=='Errado')throw Error(`Alternativas C/E inválidas no item ${n}`)
 if(Number(q.pagina)!==pagina||!String(q.imagem||'').endsWith(`-${String(pagina).padStart(4,'0')}.webp`))throw Error(`Imagem ou página original divergente no item ${n}`)
 const annulled=answer==='X'
 decisions.push({id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia,conteudo,ano:2023,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva — Conhecimentos Específicos — Cargo 2 — Especialista em Regulação de Aviação Civil, Área 2',numero_original:n,pagina,dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada em conceitos técnicos, cálculos e integração de fundamentos exigidos; não é nível oficial da banca.',classificacao_fonte:prova,motivo:`Classificação técnica individual pelo conteúdo do item e pela seção do caderno oficial do Cargo 2; gabarito confrontado com a tabela definitiva do mesmo caderno.`,resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,apta_resolucao:true,gabarito_oficial:{fonte:gabarito,arquivo:keyRecord.arquivo_gabarito,prova:keyRecord.arquivo_prova,sha256:keyRecord.sha256,numero:n,resposta:answer,criterio:'Gabarito definitivo CEBRASPE do caderno 945_ANAC_23_002_01, Cargo 2; itens X são anulados.'},remover_pendencias:pendencias,...(n===86?{imagem_pagina:`paginas/${doc}-0002.webp`}:{})})
}
if(decisions.length!==37||decisions.filter(d=>d.anulada).length!==3)throw Error('Quantidade de classificações ou anulações diverge da chave oficial')
for(const d of decisions)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(d.pagina).padStart(4,'0')}.webp`)
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({avaliadas:37,classificadas:37,gabaritosOficiais:37,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),referenciaVisualCorrigida:86,imagensVerificadas:37,publicado:false},null,2));process.exit(0)}
const nome='revisao-anac-especialista-area2-2023-pendentes-v333'
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,documento:doc,edicao:concurso,itensClassificados:37,itensComGabaritoDefinitivo:37,itensAnulados:decisions.filter(d=>d.anulada).map(d=>d.numero_original),paginaExtraIndevidaRemovida:{questao:86,pagina:3},faixaDoGabarito:'51–110',fonteProva:prova,fonteGabarito:gabarito,sha256Gabarito:keyRecord.sha256,publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## ANAC 2023 — Especialista em Regulação de Aviação Civil — Área 2 — revisão v333\n\n- Classifiquei 37 itens por matéria e assunto técnico: mecânica e materiais, metrologia, propulsão, aerodinâmica, controle de tráfego aéreo, regulação, eletrônica, telecomunicações, computação e programação.\n- Associei as respostas ao gabarito definitivo do Cargo 2; os itens ${decisions.filter(d=>d.anulada).map(d=>d.numero_original).join(', ')} estão anulados e não recebem correção automática.\n- Corrigi a referência de imagem do item 86: sua página de enunciado é a 2; a imagem da página 3 contém o início do bloco seguinte e não deve ser anexada ao item. As imagens originais dos três cadernos foram conferidas.\n- Validação local: ${result.total} registros; ${result.disponiveis} elegíveis; ${result.pendentes} pendências. Nada publicado na nuvem.\n- Fontes: [caderno oficial ANAC Cargo 2](<${prova}>), [gabarito definitivo ANAC Cargo 2](<${gabarito}>).\n`)
console.log(JSON.stringify(report,null,2))
