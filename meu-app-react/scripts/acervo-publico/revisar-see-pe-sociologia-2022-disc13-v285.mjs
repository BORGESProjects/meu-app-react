import fs from 'node:fs/promises'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'

const nome='revisao-see-pe-sociologia-2022-disc13-v285'
const base='tmp/revisao-profissional/revisao-secont-es-2022-cargo5-engenharia-v284/acervo-extraido'
const doc='f83eff8512386f6e'
const prova='https://cdn.cebraspe.org.br/concursos/see_pe_22_educacao_basica/arquivos/714_SEE_PE_013_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/see_pe_22_educacao_basica/arquivos/GAB_DEFINITIVO_714_SEE_PE_013_01.PDF'
const registro=JSON.parse((await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl','utf8')).split(/\r?\n/).find(x=>x.includes(`"documento_id": "${doc}"`)))
if(registro.status!=='tabela_lida'||registro.sha256!=='76f13b0adbaa220dd7a58f6d12ee52843e29abf29b9460f305d8c81adbad2a40')throw Error('Gabarito definitivo não está validado')
const chave={...registro.respostas,111:'C',112:'C',113:'X',114:'C',115:'C',116:'C',117:'E',118:'C',119:'E',120:'E'}
const topicos={
51:'Surgimento da Sociologia: formação disciplinar e intervenção sobre problemas sociais modernos',
52:'Sociologia como ciência: fronteiras com Biologia, História, Psicologia e Literatura',
53:'Teoria sociológica clássica: fato social em Durkheim e ação social em Weber',
54:'Institucionalização da Sociologia: universidades, cátedras e associações científicas',
55:'Max Weber: neutralidade axiológica e limites da intervenção valorativa da Sociologia',
56:'Georg Simmel: individualidade, moda e diferenciação social',
57:'Modernidade e tradição: cidadania, igualdade e estratificação por estamentos',
58:'Preconceito regional e discriminação: representações sociais e hierarquias',
59:'Simmel: aparência, subjetividade e formas de interação social',
60:'Estratificação social: classes em Marx e estamentos em Weber',
61:'Karl Marx: alienação, relações de produção e limites ao desenvolvimento humano',
62:'Max Weber: racionalização, burocracia e valores liberais',
63:'Capitalismo industrial: classes sociais e apropriação da riqueza',
64:'Émile Durkheim: anomia, individualismo e integração social',
65:'Estrutura social: classe e status em Marx e Weber',
66:'Escravidão e estratificação no Brasil: grupos de status e classes sociais',
67:'Trabalho escravizado: classe social em Marx e status em Weber',
68:'Cultura e agência: condições materiais, criatividade e estilos de vida',
69:'Instituições sociais: relações entre trabalho e família',
70:'Estratificação em Weber: casta, estamento e classe',
71:'Violência de gênero: interseccionalidade e opressões sobre mulheres migrantes',
72:'Violência nas relações íntimas: afeto, poder e desigualdade',
73:'Migração e refúgio: atuação estatal e proteção social',
74:'Interseccionalidade: articulação de gênero, raça, classe e etnia',
75:'Migração e desigualdades: estatuto legal, acesso a direitos e redes de apoio',
76:'Violência e gênero: análise relacional dos sujeitos e das estruturas sociais',
77:'Religião e gênero: práticas de fé e relações sociais',
78:'Max Weber: ética protestante, racionalização e desenvolvimento do capitalismo',
79:'Émile Durkheim: fato social, patologia e normalidade social',
80:'Gênero e moralidade: civilidade atribuída às mulheres e exposição à violência',
81:'Racismo estrutural: violência policial e seletividade racial',
82:'Movimentos sociais: direito à diferença e disputas políticas',
83:'Movimentos sociais e diferença: ambiguidades e usos políticos',
84:'Diversidade cultural e disputa entre projetos políticos',
85:'Individualismo, conservadorismo e defesa da diferença',
86:'Ações afirmativas: Lei de Cotas, acesso ao ensino superior e reconhecimento social',
87:'Interseccionalidade: análise conjunta de raça e classe',
88:'Ações afirmativas: inclusão institucional, preconceito e discriminação',
89:'Educação, mobilidade social e reprodução das desigualdades',
90:'Políticas de ação afirmativa: acesso educacional e enfrentamento da desigualdade racial',
91:'Ensino de Sociologia: interdisciplinaridade e organização curricular por áreas',
92:'Paulo Freire: transdisciplinaridade e ensino crítico de Sociologia',
93:'Sociologia no Ensino Médio: leitura da realidade social e formação cidadã',
94:'Imaginação sociológica: essência, aparência e interpretação da realidade',
95:'Ensino de Sociologia: formação intelectual e reprodução social',
96:'Direitos humanos: enfrentamento da violência e das desigualdades',
97:'Pensamento sociológico: análise crítica das dimensões social, econômica, política e cultural',
98:'Relações de poder: territorialidade e geopolítica dos Estados-nações',
99:'Conhecimento científico: crítica ao absolutismo epistemológico e igualdade social',
100:'Ética na pesquisa científica e consumo responsável',
101:'Sociologia pública: necessidades locais e participação/liderança social',
102:'Cidadania: pluralidade, autonomia moral e liberdade',
103:'Direitos e deveres: práticas pedagógicas no ensino de Sociologia',
104:'BNCC: conhecimento técnico, pensamento sociológico e interdisciplinaridade',
105:'BNCC e Ensino Médio: tecnicismo, interdisciplinaridade e reprodução social',
115:'Currículo de Pernambuco: valorização e uso de conteúdos factuais'
}
const dificil=new Set([52,53,55,58,59,60,61,62,63,65,68,71,74,75,76,78,79,81,83,84,86,87,88,89,90,94,95,97,98,99,104,105])
const contextos={
 'surgimento':'Texto-base apresenta a emergência da Sociologia no fim do século XIX e o estudo da transição entre formas tradicionais e modernas de organização social.',
 'tirinha':'Questões referem-se a uma tirinha de André Dahmer; a página original vinculada contém a imagem e o contexto da crítica a preconceitos e discriminações.',
 'pintura':'Questões referem-se à tela “Trabalhadores no eito”, de Lula Cardoso Ayres; a imagem original da página está vinculada ao item.',
 'violencia':'Texto-base aborda violência nas relações íntimas contra mulheres migrantes, interseccionalidade, sistemas de poder e acesso a redes de apoio.',
 'diferenca':'Texto-base de Antônio Flávio Pierucci discute a ambiguidade política da reivindicação do direito à diferença e os movimentos sociais.',
 'raca_classe':'Texto-base examina a relação entre raça, classe e ações afirmativas no Brasil, incluindo a Lei de Cotas e o acesso à educação.',
 'curriculo':'Os itens tratam do Currículo de Pernambuco, da BNCC e dos objetivos do ensino de Sociologia no Ensino Médio.'
}
const qs=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(qs.length!==58)throw Error(`Esperados 58 registros pendentes; recebidos ${qs.length}`)
const letras={C:0,E:1}
const duplicatas=new Map([['extr-b205cb540f7f9ca39ef2',{principal:'extr-d5e9e3d713d8def4e6f5',n:55}],['extr-44f6ce150f5ebb9a6d48',{principal:'extr-4110f21d675e419d2366',n:60}]])
const contextoPorNumero=n=>n<=55?'surgimento':n<=60?'tirinha':n<=70?'pintura':n<=75?'violencia':n<=81?'violencia':n<=85?'diferenca':n<=90?'raca_classe':'curriculo'
const decisoes=qs.map(q=>{
 const n=Number(q.numero),conteudo=topicos[n],answer=chave[n]
 if(!conteudo)throw Error(`Falta classificação específica no item ${n}`)
 if(!['C','E','X'].includes(answer))throw Error(`Falta gabarito oficial no item ${n}`)
 const pagina=Number(q.pagina),anulada=answer==='X',imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,duplicata=duplicatas.get(q.id)
 const d={id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:'Sociologia',conteudo,ano:2022,concurso:'SEE/PE 2022 — Professor de Educação Básica — Disciplina 13: Sociologia',numero_original:n,pagina,dificuldade:dificil.has(n)?'Difícil':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na densidade conceitual e na interpretação exigidas; não representa estatística oficial de acerto.',classificacao_fonte:prova,motivo:`Item ${n} da Disciplina 13: Sociologia; tópico identificado pelo enunciado, pelo texto-base e pelo contexto visual do caderno oficial.`,visual:{pagina,imagem,motivo:'Página original do caderno preservada, incluindo texto-base, tirinha, obra de arte e elementos gráficos quando presentes.'},gabarito_oficial:{fonte:gabarito,sha256:registro.sha256,numero:n,pagina:1,resposta:anulada?null:answer,criterio:anulada?'Gabarito definitivo oficial marca X; item anulado.':'Gabarito definitivo oficial da Disciplina 13: Sociologia.'},resposta_correta:anulada?null:letras[answer],anulada,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado']}
 const grupo=contextoPorNumero(n)
 if(!q.apoio&&contextos[grupo])d.texto_apoio=contextos[grupo]
 if(duplicata){d.apta_resolucao=false;d.inelegibilidade_motivo='Duplicata de OCR do mesmo item, na mesma página, com o mesmo enunciado e as mesmas alternativas.';d.duplicada_de=duplicata.principal}
 return d
})
for(const d of decisoes)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const resultado=await aplicarRevisoesIndividuais({nome,base,decisoes})
const relatorio={...resultado,prova:'SEE/PE 2022 — Disciplina 13: Sociologia',documento_id:doc,registros_revisados:decisoes.length,questoes_unicas_classificadas:decisoes.length-duplicatas.size,duplicatas_inelegiveis:[...duplicatas.entries()].map(([id,v])=>({id,duplicada_de:v.principal,questao:v.n})),questoes_anuladas:decisoes.filter(x=>x.anulada).map(x=>x.numero_original),contextos_textuais_reconstruidos:decisoes.filter(x=>x.texto_apoio).length,fontes:[prova,gabarito],publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(relatorio,null,2))
console.log(JSON.stringify(relatorio))
