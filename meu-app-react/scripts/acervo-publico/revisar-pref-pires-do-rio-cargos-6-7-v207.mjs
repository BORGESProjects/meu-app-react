import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='551be3b6c23f3463',ano=2022
const prova='https://cdn.cebraspe.org.br/concursos/pref_piresrio_go_21/arquivos/643_PREF_PIRESDORIO_CG3_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/pref_piresrio_go_21/arquivos/GAB_DEFINITIVO_643_PREF_PIRESDORIO_CG3_01.PDF'
const concurso='Prefeitura de Pires do Rio/GO 2022 — Cargos 6 e 7 — Prova CG3'
const catalog=JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json','utf8')).find(x=>x.id===doc)
if(!catalog||catalog.questoes.length!==80||catalog.arquivo!=='643_PREF_PIRESDORIO_CG3_01.PDF')throw Error('Catálogo da prova de Pires do Rio divergente')
const start=raizesAtuais.findIndex(x=>x.includes('revisao-ebserh-gestao-hospitalar-2018-v206'))
if(start<0)throw Error('Base local v206 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),wanted=new Set(catalog.questoes.map(q=>q.id)),active=new Map()
for(const lot of manifest.lotes.filter(x=>x.arquivo)){
 const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)))
 for(const q of qs)if(wanted.has(q.id)){active.set(q.id,q);wanted.delete(q.id)}
 if(!wanted.size)break
}
if(active.size!==80||wanted.size)throw Error(`Esperados 80 registros Pires do Rio; encontrados ${active.size}; ausentes ${wanted.size}`)
const record=(await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x)).find(x=>x.documento_id===doc)
if(!record||record.status!=='tabela_lida'||Object.keys(record.respostas).length!==80)throw Error('Gabarito oficial definitivo de 80 itens ausente/incompleto')
const respostas=record.respostas,digest=hashRevisao(Array.from({length:80},(_,i)=>respostas[String(i+1)]).join(','))
const temas={
1:['Língua Portuguesa','Acentuação gráfica e classificação das palavras'],2:['Língua Portuguesa','Interpretação de texto: saúde emocional e equilíbrio'],3:['Língua Portuguesa','Compreensão textual e autoestima no trabalho'],4:['Língua Portuguesa','Inferência e relações de causa e consequência no texto'],5:['Língua Portuguesa','Tipologia textual e gêneros discursivos'],6:['Língua Portuguesa','Pontuação e identificação de informações explícitas'],7:['Língua Portuguesa','Interpretação de rótulo e instruções de conservação de alimentos'],8:['Língua Portuguesa','Semântica: expressões temporais e prazo de validade'],9:['Língua Portuguesa','Inferência e compreensão de informações em rótulos'],10:['Língua Portuguesa','Leitura e interpretação de charge'],11:['Língua Portuguesa','Classes gramaticais e flexão verbal'],12:['Língua Portuguesa','Interpretação de charge e inferência'],13:['Língua Portuguesa','Interpretação de cartaz e adequação comunicativa'],14:['Língua Portuguesa','Adjetivo: classificação e concordância nominal'],15:['Língua Portuguesa','Interpretação de sinalização e finalidade comunicativa'],
16:['Matemática','Velocidade, tempo e movimento periódico'],17:['Matemática','Razões e comparação de tempos'],18:['Matemática','Múltiplos, ciclos e encontro de movimentos periódicos'],19:['Matemática','Razões e frações'],20:['Matemática','Razões entre quantidades e proporcionalidade'],21:['Matemática','Porcentagem e aumento proporcional de demanda'],22:['Matemática','Proporção direta e consumo de insumos'],23:['Matemática','Distribuição de alunos por turno'],24:['Matemática','Porcentagem e distribuição de frequências'],25:['Matemática','Razão entre quantidades e simplificação de frações'],
26:['História','Formação histórica de Pires do Rio e Estrada de Ferro Goiás'],27:['História','Fundação municipal e expansão ferroviária em Goiás'],28:['Geografia','Divisão político-administrativa e limites de Pires do Rio'],29:['Geografia','Localização e hidrografia do município de Pires do Rio'],30:['Economia','Atividades extrativistas e recursos florestais municipais'],31:['Economia','Produção agrícola e economia municipal'],32:['Cultura','Turismo e manifestações folclóricas locais'],33:['História','Patrimônio religioso e história municipal'],34:['Símbolos Municipais','Heráldica e representação das atividades econômicas'],35:['Símbolos Municipais','Bandeira, escudo e simbologia municipal'],
36:['Atendimento ao Público','Atendimento presencial e prevenção de problemas'],37:['Atendimento ao Público','Comunicação, duração e qualidade do atendimento'],38:['Atendimento ao Público','Comunicação assertiva e gestão de solicitações não atendidas'],39:['Atendimento ao Público','Encaminhamento de situações excepcionais à chefia'],40:['Atendimento ao Público','Atendimento a pessoas alteradas e postura profissional'],41:['Gestão de Pessoas','Trabalho em equipe e objetivos compartilhados'],42:['Gestão de Pessoas','Comunicação e cooperação em equipes'],43:['Gestão de Pessoas','Relações interpessoais no ambiente de trabalho'],44:['Gestão de Pessoas','Tomada de decisão participativa e desempenho de equipes'],45:['Gestão de Pessoas','Avaliação de desempenho e autoavaliação'],46:['Ética e Conduta Profissional','Higiene pessoal e ambiente de trabalho'],47:['Ética e Conduta Profissional','Ética e moral: conceitos e distinções'],48:['Segurança do Trabalho','Higiene ocupacional e limpeza de ambientes'],49:['Segurança do Trabalho','Saúde ocupacional e integridade física e mental'],50:['Ética e Conduta Profissional','Discrição, honestidade e ética no trabalho'],
51:['Informática','Microsoft Word: salvar documentos e comandos da interface'],52:['Informática','Microsoft Word: edição e exclusão de texto'],53:['Informática','Microsoft Word: formatação de tabelas'],54:['Informática','Microsoft Word: impressão e orientação de página'],55:['Informática','Microsoft Word: revisão ortográfica'],56:['Informática','Microsoft Word: formatação de fonte'],57:['Informática','Windows 10: assistente Cortana e recursos do sistema'],58:['Informática','Windows 10: barra de tarefas e organização de aplicativos'],59:['Informática','Windows 10: configurações de dispositivos e periféricos'],60:['Informática','Windows 10: extensões e tipos de arquivo'],61:['Informática','Windows 10: operações com pastas e arquivos'],62:['Informática','Compatibilidade de formatos de arquivo e aplicativos'],63:['Informática','Internet: endereços web e navegação'],64:['Informática','Microsoft Edge: favoritos e navegação'],65:['Informática','Segurança na Internet: vírus e códigos maliciosos'],66:['Construção Civil','Instalações hidráulicas: detecção de vazamentos na rede de abastecimento'],67:['Construção Civil','Instalações hidrossanitárias: sifões e caixas sifonadas'],68:['Construção Civil','Instalações hidrossanitárias: válvulas e caixas de descarga'],69:['Construção Civil','Instalações hidrossanitárias: diagnóstico de vazamento em bacias sanitárias'],70:['Construção Civil','Ferramentas e materiais para reparos hidráulicos'],71:['Construção Civil','Perfuração de concreto armado e identificação de armaduras'],72:['Construção Civil','Alvenaria: prumo, planeza e regularização de paredes'],73:['Construção Civil','Ferramentas: brocas para madeira, concreto e metal'],74:['Construção Civil','Fixadores e parafusos para madeira e alvenaria'],75:['Construção Civil','Prumo e verticalidade de paredes'],76:['Segurança do Trabalho','Equipamentos de proteção individual: guarda e conservação'],77:['Segurança do Trabalho','Acidente de trajeto e acidente de trabalho'],78:['Segurança do Trabalho','Proteção ocular e operação de lixadeiras'],79:['Segurança do Trabalho','Extintores e equipamentos de combate a incêndio'],80:['Segurança do Trabalho','Respiradores e proteção contra agentes particulados']
}
if(Object.keys(temas).length!==80)throw Error('Classificação temática não cobre os 80 itens')
const pagina=n=>n<=14?1:n<=45?2:n<=70?3:4
const grupos={
2:'Texto-base: “O trabalho diário exige uma boa saúde emocional. O equilíbrio das emoções é necessário para que a pessoa tenha bons resultados no desenvolvimento de qualquer atividade. A autoestima é tão importante quanto o currículo. Ela influencia o bom desempenho e pode comprometer ou alavancar a produtividade, por isso deve ser incentivada dentro e fora da empresa por meio de práticas que promovam saúde, motivação e satisfação pessoal. Sinais comuns de falta de autoestima no ambiente profissional incluem pessimismo, incapacidade de emitir opiniões, isolamento social, falta de fé em si mesmo, medo de desafios, sensação de fracasso, procrastinação e dificuldade de reconhecer os próprios erros.”',
7:'Texto-base: rótulo de alimento com instruções para guardar a lata em local fresco e seco; após aberta, conservar em geladeira e consumir em até 30 dias, conforme a validade indicada no fundo da lata.',
10:'Texto-base visual: charge com pessoas correndo e jogando lixo ao lado de placa “Não jogue lixo nas ruas”. A imagem original está vinculada à página 1.',
13:'Texto-base visual: cartaz “Atenção — Área Restrita”. A imagem original está vinculada à página 1.',
15:'Texto-base visual: placa “Atenção — Altamente Inflamável”. A imagem original está vinculada à página 2.',
16:'Situação: em um campo de treinamento, três maratonistas praticam corrida; para uma volta completa na pista, o primeiro leva 10 minutos, o segundo 15 minutos e o terceiro 20 minutos. Eles partem do mesmo ponto simultaneamente.',
20:'Situação: para preparar o lanche mensal de 500 alunos, uma merendeira utiliza 15 sacos de feijão e 20 sacos de arroz por mês.',
23:'Situação: escola com 1.200 alunos matriculados; 600 estudam pela manhã, 100 à noite e os restantes à tarde.',
26:'Considere os dados históricos referentes à fundação do município de Pires do Rio, em Goiás.',
28:'Considere a divisão político-administrativa, os limites, a sede e a hidrografia do município de Pires do Rio.',
30:'Considere as principais atividades econômicas, os recursos naturais e a produção do município de Pires do Rio.',
32:'Considere os aspectos culturais, as manifestações folclóricas e o patrimônio histórico-religioso de Pires do Rio.',
34:'Texto-base visual: escudo e bandeira do município de Pires do Rio; os símbolos municipais originais estão na página 2.',
36:'Considere boas práticas de atendimento ao público, comunicação clara e postura profissional.',
41:'Considere boas práticas de administração de pessoas, comunicação, colaboração, decisão compartilhada e avaliação de desempenho.',
46:'Considere ética, relações humanas, higiene pessoal e higiene do ambiente de trabalho.',
51:'Texto-base visual: capturas dos ícones e comandos do Microsoft Word 365 nas páginas 3 e 4. Consulte as imagens originais para identificar as opções citadas.',
57:'Considere recursos do Microsoft Windows 10, incluindo Cortana, barra de tarefas, Configurações e Explorador de Arquivos.',
60:'Texto-base visual: Explorador de Arquivos do Windows 10, pasta Prefeitura, com os arquivos “Logo da Prefeitura.jpeg” e “Pires do Rio.jpg”. Imagem na página 3.',
63:'Considere conceitos de endereços de Internet, navegadores e segurança na navegação. O caderno apresenta uma captura ilustrativa de página web.',
65:'Registro de extração incompleto: o caderno traz somente a frase “A seguir, é apresentado um exemplo de ataque por vírus na Internet”, sem uma afirmação para julgar; não foi localizada uma versão oficial completa do item.',
66:'Considere procedimentos de manutenção hidráulica residencial para localizar vazamentos não visíveis em tubulações e reservatórios.',
71:'Considere ferramentas, materiais e técnicas básicas de construção civil e hidráulica.',
76:'Considere equipamentos de proteção individual e regras de segurança do trabalho em obras.'
}
const contextoDe=n=>{let k=0;for(const x of Object.keys(grupos).map(Number).sort((a,b)=>a-b))if(x<=n)k=x;return grupos[k]||''}
const inapta=new Set([65])
const corrections={
14:'No cartaz, a palavra “RESTRITA” é classificada como adjetivo e concorda em gênero e número com o substantivo “ÁREA”.',
22:'Se o lanche fosse preparado para 400 alunos, a merendeira usaria 16 sacos de arroz por mês.',
25:'A razão entre o número de alunos que estudam pela manhã e o número de alunos que estudam à tarde é 6/2.',
50:'Entre as atitudes consideradas éticas no trabalho estão a discrição e a honestidade.',
60:'Os arquivos listados na figura possuem extensões iguais.',
62:'Os arquivos listados na figura podem ser abertos com o editor de textos Word e modificados nesse programa.',
65:'A seguir, é apresentado um exemplo de ataque por vírus na Internet.'
}
const decisions=catalog.questoes.map(e=>{
 const q=active.get(e.id),n=e.numero,t=temas[n],key=respostas[String(n)],p=pagina(n),texto=contextoDe(n)
 if(!q||!t||!key)throw Error(`Item ${n}: registro, classificação ou gabarito ausente`)
 const d={id:e.id,sha256_enunciado:hashRevisao(q.enunciado),materia:t[0],conteudo:t[1],ano,concurso,numero_original:n,pagina:p,dificuldade:[5,6,10,11,12,14,16,17,18,19,20,22,24,25,28,29,30,33,34,35,41,44,45,47,51,53,54,55,56,59,60,61,62,65,66,67,68,69,71,72,73,74,75,77,79,80].includes(n)?'Média':'Fácil',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial de dificuldade pela complexidade linguística, matemática ou técnica; a banca não publicou nível por item.',motivo:`Item ${n}: matéria e conteúdo específicos atribuídos pela leitura do enunciado e do contexto original do caderno.`,classificacao_fonte:{documento:catalog.arquivo,prova,metodo:'Leitura semântica individual e conferência visual do caderno oficial'},resposta_correta:inapta.has(n)?null:key==='X'?null:key==='C'?0:1,anulada:key==='X',gabarito_oficial:{fonte:gabarito,arquivo:'GAB_DEFINITIVO_643_PREF_PIRESDORIO_CG3_01.PDF',prova:catalog.arquivo,numero:n,pagina:1,resposta:key,sha256:digest,hash_metodo:'SHA-256 da sequência de respostas dos 80 itens lida na tabela oficial definitiva; não é hash do PDF.',criterio:'Gabarito definitivo CEBRASPE — Prova CG3, cargos 6 e 7.'},texto_apoio:texto,visual:{pagina:p,imagem:`paginas/${doc}-${String(p).padStart(4,'0')}.webp`,texto_apoio:texto,motivo:`Página ${p} do caderno original vinculada ao item ${n}; imagens e figuras conferidas visualmente.`}}
 if(corrections[n])d.enunciado=corrections[n]
 if(inapta.has(n)){d.apta_resolucao=false;d.inelegibilidade_motivo='O PDF contém apenas um comando contextual, sem a afirmação a julgar; não há transcrição oficial completa para reconstruí-la sem inventar conteúdo.'}
 return d
})
if(decisions.length!==80||new Set(catalog.questoes.map(q=>q.numero)).size!==80||[...Array(80)].some((_,i)=>!catalog.questoes.some(q=>q.numero===i+1)))throw Error('Cobertura dos itens 1–80 incompleta')
for(let p=1;p<=4;p++)await fs.access(`public/acervo-extraido/paginas/${doc}-${String(p).padStart(4,'0')}.webp`)
const result=await aplicarRevisoesIndividuais({nome:'revisao-pref-pires-do-rio-cargos-6-7-v207',base,decisoes:decisions})
raizesAtuais.unshift('tmp/revisao-profissional/revisao-pref-pires-do-rio-cargos-6-7-v207/acervo-extraido')
const out={...result,documento:catalog.arquivo,registros_revistos:80,itens_oficiais_cobertos:80,itens_inelegiveis:1,itens_anulados:Object.values(respostas).filter(x=>x==='X').length,gabaritos_oficiais_associados:80,paginas_originais_conferidas:[1,2,3,4],data_aplicacao:'2022-05-29',prova,gabarito,publicado:false}
await fs.writeFile('docs/acervo/revisao-profissional/revisao-pref-pires-do-rio-cargos-6-7-v207.json',JSON.stringify(out,null,2))
const section=`\n\n## Revisão Prefeitura de Pires do Rio/GO — Prova CG3 — v207\n\n- Reclassifiquei os 80 itens do caderno oficial (aplicado em 29/05/2022) por Português, Matemática, história/geografia/economia/cultura local, atendimento e gestão de pessoas, ética e higiene, Informática, construção civil/hidráulica e segurança do trabalho. Associei o gabarito definitivo e vinculei as quatro páginas originais, preservando figuras de charge, placas, ícones do Word, Explorador de Arquivos e tela web como apoio visual.\n- O registro 65 não contém uma afirmação para julgar: o PDF apresenta apenas um comando contextual sobre ataque por vírus. Não localizei a assertiva em fonte oficial; mantive o histórico, marquei-o inelegível para resolução e não inventei texto.\n- Resultado local: ${out.total} registros; ${out.disponiveis} disponíveis para resolução; ${out.pendentes} pendências elegíveis. Ainda não publicado na nuvem.\n- Fontes oficiais: [caderno CG3](https://cdn.cebraspe.org.br/concursos/pref_piresrio_go_21/arquivos/643_PREF_PIRESDORIO_CG3_01.PDF), [gabarito definitivo](https://cdn.cebraspe.org.br/concursos/pref_piresrio_go_21/arquivos/GAB_DEFINITIVO_643_PREF_PIRESDORIO_CG3_01.PDF).\n`
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',section)
console.log(JSON.stringify(out))
