import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {raizesAtuais,lerArquivoAtual} from './acervo-atual.mjs'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const doc='3c3cf3b678b949d4'
const prova='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/MATRIZ_376_SEDUCAL005__PAG_4.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/SEDUC_AL_17/arquivos/GAB_DEFINITIVO_376_SEDUCAL005.PDF'
const raw=JSON.parse(await fs.readFile(`tmp/registros-documento-${doc}.json`,'utf8'))
const answerGroups=[
 ['C','C','C','C','E','C','E','C','E','C','C','E','C','E','C','E','E','C','E','E'],
 ['E','C','C','E','E','E','E','E','C','C','E','C','C','E','E','C','C','C','E','C'],
 ['C','E','C','C','E','C','E','E','C','X','C','C','C','E','C','E','E','C','C','E'],
 ['E','E','C','C','C','C','E','E','E','E']
]
const key=new Map();let item=51
for(const group of answerGroups)for(const value of group)key.set(item++,value)
if(item!==121||key.size!==70)throw new Error(`Gabarito transcrito incorretamente: ${key.size} respostas`)
const keyHash=hashRevisao([...key].map(([n,v])=>`${n}:${v}`).join('|'))
const duplicates=new Map([
 ['extr-2f839c53775e189d5edd','extr-cc176908a1d073f52966'],
 ['extr-c741291340d63daf72e6','extr-7b15d0aeb32eb6472486']
])
const topicFor=n=>{
 if(n<=55)return ['Filosofia','Filosofia antiga — pré-socráticos, physis, cosmologia e arkhé']
 if(n<=59)return ['Filosofia','Platão — reminiscência, alma e conhecimento']
 if(n<=63)return ['Filosofia','Ética, moral e educação — reconhecimento do outro e formação moral']
 if(n===64)return ['Filosofia','Ética contemporânea — responsabilidade individual e ação política']
 if(n<=67)return ['Filosofia','Kant — imperativo categórico e formalismo moral']
 if(n<=71)return ['Filosofia','Aristóteles — ética, felicidade, virtude e amizade']
 if(n<=75)return ['Filosofia','Kant — Iluminismo, autonomia e menoridade']
 if(n<=80)return ['Filosofia','Descartes — racionalismo, ideias claras e distintas e leis da natureza']
 if(n<=85)return ['Filosofia','Francis Bacon — empirismo, indução e método experimental']
 if(n<=90)return ['Filosofia','Filosofia moderna — revolução científica e mecanicismo']
 if(n<=95)return ['Filosofia','Nietzsche — estética, apolíneo e dionisíaco']
 if(n<=100)return ['Filosofia','Escola de Frankfurt — razão instrumental e indústria cultural']
 if(n<=105)return ['Filosofia','Ensino de Filosofia — competências e habilidades dos PCNEM']
 if(n<=110)return ['Filosofia','Ensino de Filosofia — história da disciplina, autonomia e não doutrinação']
 if(n<=115)return ['Filosofia','Ensino de Filosofia — interdisciplinaridade e integração curricular']
 return ['Filosofia','Ensino de Filosofia — Deleuze, Guattari e pedagogia do conceito']
}
const sourcePassages={
 51:'O que intriga os primeiros filósofos é principalmente o movimento, conceito que em grego tem um sentido bem amplo, podendo significar “mudança de lugar”, “aumento e diminuição”, “qualquer alteração ou um movimento substancial”, quando alguma coisa é gerada ou se deteriora. Diante disso, eles se perguntam: o que faz com que, apesar da mudança, haja algo na realidade que sempre permanece o mesmo? Assim, sob a multiplicidade das coisas, eles buscam a identidade. Ou seja, procuram um princípio original e racional (em grego arkhé). O termo princípio pode ser entendido como “origem”, mas também como “fundamento”.',
 56:'Sendo então a alma imortal e tendo nascido muitas vezes, e tendo visto tanto as coisas que estão aqui quanto as que estão no Hades, enfim, todas as coisas, não é que não tenha aprendido; de modo que não é nada de admirar, tanto com respeito à virtude quanto ao demais, ser possível a ela rememorar aquelas coisas justamente que já antes conhecia. Pois, sendo a natureza toda congênere e tendo a alma aprendido todas as coisas, nada impede que, tendo alguém rememorado alguma só coisa — fato esse precisamente que os homens chamam aprendizado —, essa pessoa descubra todas as outras coisas, se for corajosa e não se cansar de procurar. Pois, pelo visto, o procurar e o aprender são, no seu total, uma rememoração.',
 60:'Todas as pessoas precisam ser educadas para a convivência. O processo de aprendizagem supõe descentramento, um sair de si mesmo, tanto do ponto de vista da inteligência como da afetividade ou da moral. A descoberta de que o outro é um “outro eu” é fundamental para superar o egocentrismo. No entanto, o desenvolvimento desses três níveis mentais — inteligência, afetividade e moralidade — não é automático, porque exige a intermediação de agentes culturais — pais, professores, adultos em geral.',
 64:'Acerca do formalismo moral desenvolvido na filosofia kantiana, julgue os itens.',
 68:'Mas é natural que tais amizades não sejam muito frequentes, pois tais homens são raros. Acresce que uma amizade dessa espécie exige tempo e familiaridade. Como diz o provérbio, os homens não podem conhecer-se mutuamente enquanto não houverem “provado sal juntos”; e tampouco podem aceitar um ao outro como amigos enquanto cada um não parecer estimável ao outro e este não depositar confiança nele. Os que não tardam a mostrar mutuamente sinais de amizade desejam ser amigos, mas não o são a menos que ambos sejam estimáveis e o saibam; porque o desejo da amizade pode surgir depressa, mas a amizade não.',
 72:'O Esclarecimento é a saída do homem da condição de menoridade autoimposta. Menoridade é a incapacidade de servir-se de seu entendimento sem a orientação de um outro. Essa menoridade é autoimposta quando a sua causa reside na carência não de entendimento, mas de decisão e coragem em fazer uso do seu próprio entendimento sem a orientação alheia. Sapere aude! Tem coragem em servir-te de teu próprio entendimento! Este é o mote do Esclarecimento.',
 76:'Notei certas leis que Deus estabeleceu de tal modo na natureza e das quais imprimiu tais noções em nossas almas que, depois de ter refletido bem sobre elas, não podemos duvidar de que sejam exatamente observadas em tudo o que existe ou se faz no mundo.',
 81:'Ainda não foi criada uma filosofia natural pura. As existentes acham-se infectadas e corrompidas: na escola de Aristóteles, pela lógica; na escola de Platão, pela teologia natural; na segunda escola de Platão, a de Proclo e outros, pela matemática, a quem cabe rematar a filosofia e não engendrar ou produzir a filosofia natural.',
 86:'O período de tempo que vai mais ou menos da data de publicação do De revolutionibus de Nicolau Copérnico, isto é, de 1543, à obra de Isaac Newton, Philosophia naturalis principia mathematica, publicada pela primeira vez em 1687, é comumente apontado hoje como o período da “revolução científica”. Trata-se de um poderoso movimento de ideias que adquiriu, no século XVII, as suas características determinantes na obra de Galileu e Newton, encontra seus filósofos — em aspectos diferentes — nas ideias de Bacon e Descartes e que depois iria encontrar sua expressão, agora clássica, na imagem newtoniana do universo concebido como uma máquina, ou seja, como um relógio.',
 91:'Nietzsche é considerado o filósofo que afirma a vida. Mais ainda, é o filósofo que relaciona vida e estética. Em O Nascimento da Tragédia, a afirmação está expressa da seguinte maneira: “Só como fenômeno estético a existência e o mundo aparecem eternamente justificados”.',
 96:'A indústria cultural impede a formação de indivíduos autônomos, independentes, capazes de julgar e de decidir conscientemente.',
 101:'Conforme os Parâmetros Curriculares Nacionais do Ensino Médio (PCNEM), o ensino de Filosofia deve capacitar o aluno a desenvolver as competências e habilidades descritas nos itens 101 a 105.',
 106:'A centralidade na história da Filosofia pode matizar um ponto que se afigura bastante controverso, qual seja, a assunção de uma perspectiva filosófica pelo professor. Certamente ninguém trabalha uma questão filosófica situando-se fora de suas próprias referências intelectuais, sendo inevitável que o professor dê seu assentimento a uma perspectiva filosófica. Essa adesão, entretanto, tem alguma medida de controle na referência à história da Filosofia, sem a qual seu labor se tornaria mera doutrinação.',
 111:'Com relação à interdisciplinaridade no ensino de Filosofia, julgue os itens.',
 116:'É tarde demais quando já não é possível pensar... Esse é o movimento que os tempos hipermodernos nos apresentam: lançar-nos tanto à opinião, afastar-nos tanto do conceito, como forma de fugir do caos, que de repente o pensamento já não é mais possível. É mais do que tempo, pois, de fazermos das escolas um espaço de resistência a isso. E se a escola não puder ser propriamente o lugar do exercício do conceito, que seja ao menos de uma propedêutica ao conceito. Deleuze e Guattari afirmaram que é preciso investir em uma “pedagogia do conceito”, à qual os filósofos se dedicaram pouco ao longo da história. Ora, se os conceitos não estão dados, mas são criados, é possível se desvendarem as regras, os processos, os caminhos de criação dos conceitos; é possível — e é necessária — uma pedagogia do conceito, isto é, um aprendizado em torno do ato criativo de um conceito. No que concerne ao trato com as aulas de Filosofia na educação média, penso que a pedagogia do conceito poderia estar articulada em torno de quatro momentos didáticos: uma etapa de sensibilização, uma etapa de problematização, uma etapa de investigação e, finalmente, uma etapa de conceituação (isto é, de criação ou recriação do conceito).'
}
const ranges=[[[51,55],51],[[56,59],56],[[60,63],60],[[64,67],64],[[68,71],68],[[72,75],72],[[76,80],76],[[81,85],81],[[86,90],86],[[91,95],91],[[96,100],96],[[101,105],101],[[106,110],106],[[111,115],111],[[116,120],116]]
const contextFor=n=>sourcePassages[ranges.find(([[a,b]])=>n>=a&&n<=b)[1]]
const pageFor=n=>n<=68?1:n<=90?2:n<=115?3:4
const corrected=new Map([
 [56,'Conforme a teoria da reminiscência platônica, os sentidos são as ferramentas que despertam na alma as lembranças latentes.'],
 [57,'Na teoria platônica, exposta no Mito de Er ou Mito da Reminiscência, a alma e o corpo, sendo congêneres, detêm os mesmos aspectos reminiscentes quanto ao conhecimento.'],
 [58,'De acordo com a teoria da reminiscência, a alma contempla as ideias antes de encarnar, mas de tudo se esquece ao se unir ao corpo.'],
 [59,'Para Platão, todos os indivíduos aprendem da mesma forma e pelas mesmas vias, uma vez que aprender é lembrar daquilo que já existe na alma.'],
 [61,'O sujeito ético surge com a “descoberta de que o outro é um ‘outro eu’”, ou seja, com o reconhecimento da sua humanidade no outro.'],
 [63,'Por meio da educação e da cultura e do acesso às demais produções tecnológicas e intelectuais desenvolvidas pela humanidade ao longo de sua trajetória civilizatória, o ser humano tem a oportunidade de constituir uma personalidade moral.'],
 [67,'Na defesa de sua teoria moral, Kant distingue os imperativos categórico e hipotético, dando ao primeiro menor relevância que ao último.'],
 [68,'Com a expressão “provado sal juntos”, Aristóteles refere-se à ética que constitui os laços de amizade, explicitando a importância da convivência para a formação da amizade.'],
 [71,'De acordo com Aristóteles, toda amizade gera felicidade.'],
 [75,'Em relação à moral, o homem deve servir-se de si mesmo quando se autoimpõe a condição de menoridade.'],
 [80,'Em Descartes, a racionalidade se exprime, em grande medida, pelo uso ou pela aplicação das ideias claras e distintas na Epistemologia — entendida como Teoria do Conhecimento —, na Matemática e na Física.'],
 [85,'Em contraposição à filosofia aristotélica, o empirismo baconiano não admite a noção de indução.'],
 [90,'Em Newton, a metáfora do relógio pode ser justificada, em grande parte, por sua relação com o mecanicismo e pela busca de precisão no estudo da natureza e do próprio universo.'],
 [95,'No estado apolíneo, a natureza força o artista a exprimir-se, a dominar o caos da vontade e a criar um novo mundo de símbolos, no qual se encontram a dança e a música.'],
 [100,'Adorno defende a ideia de que a cultura de massas, ao contrário de uma cultura elitista, emana do povo.'],
 [105,'Elaborar por escrito o que tenha sido apropriado por meio da reflexão.'],
 [110,'Um professor que assume uma perspectiva filosófica em sua atividade docente impele os alunos a assumirem determinados valores em vez de estimular uma prática reflexiva.'],
 [113,'Apesar de suas especificidades, a transversalidade e a interdisciplinaridade são complementares.'],
 [114,'A contextualização aliada à interdisciplinaridade contribui para a transversalidade do conhecimento filosófico.'],
 [115,'O ensino de lógica permite a abordagem interdisciplinar.'],
 [116,'A proposta metodológica do autor do texto, Silvio Gallo, concorda com o pensamento de Gilles Deleuze e Félix Guattari, autores que definem a Filosofia como a arte de criar conceitos.'],
 [117,'A proposta de uma pedagogia do conceito contraria didaticamente a de um ensino que tenha como referência a história da Filosofia.'],
 [118,'A propedêutica corresponde ao estudo especializado dos temas mais relevantes da tradição filosófica como forma de garantir profundidade na aprendizagem dos estudantes.'],
 [119,'A proposta de uma pedagogia do conceito converge para uma atitude didática conteudista.'],
 [120,'Na perspectiva didático-metodológica apresentada no texto, a construção de uma pedagogia do conceito requer que a escola incite os jovens a defender sua própria opinião como uma estratégia de fuga ao caos.']
])
const normalize=(n,s)=>{
 if(corrected.has(n))return corrected.get(n)
 let out=(s||'').replace(/\u000c/g,' ')
 out=out.replace(/\s+CESPE\s*[|–-]\s*CEBRASPE[\s\S]*$/iu,'').replace(/\s+Espaço livre\s*$/iu,'')
 return out.replace(/\s+/g,' ').replace(/\s+([.,;:!?])/g,'$1').trim()
}

const start=raizesAtuais.findIndex(r=>r.includes('revisao-pf-comunicacao-social-2025-v153'))
if(start<0)throw new Error('Base v153 não encontrada')
const base=raizesAtuais[start],bases=raizesAtuais.slice(start),manifest=JSON.parse(await lerArquivoAtual('manifesto.json',bases)),active=new Map()
for(const lot of manifest.lotes){if(!lot.arquivo)continue;const qs=JSON.parse(zlib.gunzipSync(await lerArquivoAtual(lot.arquivo,bases)));for(const q of qs)if(q.documento_id===doc)active.set(q.id,q)}
if(raw.length!==72||active.size!==72||new Set(raw.map(x=>Number(x.numero))).size!==70||raw.some(x=>!active.has(x.id)))throw new Error(`Caderno incompleto: registros=${raw.length}, itens=${new Set(raw.map(x=>Number(x.numero))).size}, ativos=${active.size}`)
const decisions=raw.map(x=>{
 const n=Number(x.numero),q=active.get(x.id),answer=key.get(n),topic=topicFor(n),page=pageFor(n),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`,stem=normalize(n,x.enunciado),dupe=duplicates.get(x.id),context=contextFor(n)
 if(!answer||!topic||!x.imagem?.startsWith(`paginas/${doc}-`)||stem.length<30)throw new Error(`Metadado ou enunciado ausente no item ${n}`)
 const annulled=answer==='X'
 return {id:x.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2018,concurso:'SEDUC/AL — Professor, Cargo 5: Filosofia — edital 2017, aplicação em 01/04/2018',numero_original:n,pagina:page,dificuldade:[55,57,62,64,67,74,77,83,84,89,92,94,96,98,100,106,107,112,116,117,118,120].includes(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pela complexidade conceitual e didática; não é classificação oficial da banca.',resposta_correta:annulled?null:answer==='C'?0:1,anulada:annulled,gabarito_oficial:{valor:answer,fonte:gabarito,sha256:keyHash,sha256_tipo:'hash_da_transcricao_canonica_dos_itens_51_a_120_do_gabarito_definitivo',numero:n,resposta:answer,metodo:'Gabarito definitivo oficial do Cargo 5 — Professor de Filosofia; aplicação em 01/04/2018. O item 100 foi anulado. O hash identifica a transcrição, não o binário do PDF.'},classificacao_fonte:prova,motivo:`Item ${n} conferido na página ${page} do caderno oficial; matéria e conteúdo específicos identificados pelo enunciado e pelo comando do bloco.`,visual:{pagina:page,imagem:image,texto_apoio:context,motivo:`Página ${page} do caderno oficial conferida visualmente; texto-base correspondente separado e ligado a este bloco.`},enunciado:stem,...(dupe?{apta_resolucao:false,duplicada_de:dupe,inelegibilidade_motivo:`Duplicata OCR do item ${n}; o registro íntegro do mesmo item está preservado no ID ${dupe}.`}:{remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente']})}
})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decisions.length,itensUnicos:new Set(decisions.map(d=>d.numero_original)).size,duplicatas:decisions.filter(d=>d.duplicada_de).length,respostas:key.size,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),contextos:new Set(decisions.filter(d=>!d.duplicada_de).map(d=>d.visual.texto_apoio)).size,correcoes:corrected.size,paginas:[...new Set(decisions.map(d=>d.pagina))]},null,2));process.exit(0)}
const name='revisao-seduc-al-filosofia-2018-v154',report=await aplicarRevisoesIndividuais({nome:name,base,decisoes:decisions})
raizesAtuais.unshift(`tmp/revisao-profissional/${name}/acervo-extraido`)
const output={...report,fonte_prova:prova,fonte_gabarito:gabarito,registros_revistos:decisions.length,itens_unicos:new Set(decisions.map(d=>d.numero_original)).size,duplicatas_inelegiveis:decisions.filter(d=>d.duplicada_de).length,anuladas:decisions.filter(d=>d.anulada).map(d=>d.numero_original),contextos_e_paginas_associados:true,paginas_originais:[...new Set(decisions.map(d=>d.pagina))].length,publicada:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${name}.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2))
