import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-cbmal-2021-lote-v440'
const doc='454618e27497297c'
const prova='https://cdn.cebraspe.org.br/concursos/cbm_al_21/arquivos/595_CBMAL_001_MATRIZ.PDF'
const preliminar='https://cdn.cebraspe.org.br/concursos/cbm_al_21/arquivos/GAB_DEFINITIVO_MATRIZ_595_CBMAL_001_PAG_8.PDF'
const justificativas='https://cdn.cebraspe.org.br/concursos/cbm_al_21/arquivos/CBMAL_21_JUSTIFICATIVAS_DE_ALTERAES_DE_GABARITO.PDF'
const concurso='CBMAL — Curso de Formação de Oficiais — Aspirante-a-Oficial (2021)'
const cargo='Aspirante-a-Oficial Bombeiro Militar'
const gabarito=[
 'X C C E E E X E E E E C C E E E C E C E',
 'E C X E C E C C E E C C E C E C C C E E',
 'C C C E E E C E C C C E C C E E E C C E',
 'E E E C E E C E E C E C C E E C E C C E',
 'C C E E C C E E C E C E E E C E C C C E',
 'C C C E E C C E E C E E C E C E C C C E'
].flatMap(x=>x.split(' '))
if(gabarito.length!==120)throw Error(`Esperados 120 gabaritos definitivos, recebidos ${gabarito.length}`)
const anuladas=new Set([1,7,23])
const alteracoes=new Map([[18,'E'],[65,'E'],[68,'E'],[94,'E'],[102,'C']])
const materias=new Map()
const add=(nums,materia,conteudo,dificuldade='Média')=>{for(const n of nums)materias.set(n,{materia,conteudo,dificuldade})}
add([1,2,3,4,5,6,7,8,9,10,12],'Português','Interpretação textual, efeitos de sentido, coesão e semântica')
add([16,17,18,19,20],'Língua Inglesa','Compreensão e interpretação de texto em língua inglesa')
add([27],'Matemática','Progressão aritmética e sequências','Média')
add([30],'Matemática','Análise combinatória e princípio multiplicativo','Média')
add([31,32,33,34,35,36],'Matemática','Geometria analítica, funções, cônicas e distância no plano','Difícil')
add([37,38,39,40],'Matemática','Geometria espacial, cilindros, prismas, volume e área','Média')
add([46,47,48,49,50],'Atualidades','Conflito Israel–Palestina, geopolítica e relações internacionais','Média')
add([51,52,53,54,55],'Atualidades','Problemas sociais brasileiros, saúde, mobilidade, trabalho e sustentabilidade','Média')
add([56,57,58,59,60],'Direitos Humanos','Teorias, gerações, tratados internacionais, DUDH, ética e moral','Média')
add([61,62,63,64,65],'Legislação Institucional','Estatuto, hierarquia, ingresso e promoções no Corpo de Bombeiros Militar de Alagoas','Média')
add([69,70],'Física','Hidrostática e transferência de calor','Difícil')
add([72,73],'Física','Efeito fotoelétrico, circuito elétrico e potencial de corte','Média')
add([75],'Física','Radioatividade e meia-vida','Média')
add([77,80],'Química','Número de oxidação, estequiometria e rendimento de reações','Média')
add([86,87,88,89,90],'Biologia','Zoologia, botânica, citologia, microbiologia e imunização','Média')
add([91,92,93,94,95],'História do Brasil','Política indigenista, Brasil Império, República e regime militar','Média')
add([96,97,98,99],'Geografia','Globalização, divisão internacional do trabalho e geopolítica','Média')
add([105,106,109,110],'Direito Administrativo','Agentes públicos, responsabilidade civil do Estado e regime jurídico administrativo','Média')
add([111,114,116,117,118,119],'Direito Constitucional','Direitos fundamentais, direitos políticos dos militares, segurança pública e defesa do Estado','Difícil')
const correcoes={
  3:'O jogo Go Viral! baseia-se em um mecanismo de exposição parecido com o das vacinas que atuam contra doenças como a covid-19.',
  4:'Infere-se das informações do texto que sentimentos negativos como raiva, indignação e medo impedem as pessoas de compartilhar fake news na Internet.',
  5:'Nos textos que circulam na Internet, o discurso de autoridade, mesmo que seja de especialista não reconhecido, passa credibilidade e elimina falsas notícias.',
  12:'Infere-se do penúltimo parágrafo do texto que, no trecho “muitos deixaram de compartilhar essas fake news com outras pessoas”, está elíptico o substantivo “jogadores” após o termo “muitos”.',
  16:'Two reasons why forests are crucial to the functioning of the Earth are the production of carbon dioxide and the absorption of rainfall.',
  17:'The text claims that over 50% of the world’s habitable land was covered in trees ten millennia ago.',
  18:'For the last 10,000 years, at least one third of the trees which covered the world have been cut down so that men could grow their food, among other activities.',
  19:'It can be inferred that the more goods rich countries demand from poor countries, the more deforestation will take place in those poor countries.',
  20:'In G7 countries, the tree-covered areas gradually decreased in a period of 14 years.',
  30:'Suponha que duas ambulâncias tenham comparecido a um dos locais de acidente para transportar quatro vítimas. Considerando-se que cada ambulância transporte no máximo duas vítimas e que todas as quatro vítimas devam ser transportadas, então a quantidade de formas diferentes de dispor as vítimas nas ambulâncias é inferior a seis.',
  31:'A distância a ser percorrida do ponto A até o ponto D é maior que 25 quilômetros.',
  32:'Os segmentos CB e CD são perpendiculares.',
  33:'O trajeto indicado pelo desenho do gráfico da parábola y = −x² + (9/2)x + 14 também passa pelos pontos A e D.',
  34:'A expressão analítica y = m·x + n do segmento de reta que une os pontos A e D tem, necessariamente, o coeficiente linear n igual a 14 e o coeficiente angular m negativo.',
  35:'Os pontos A, B, C e D estão todos contidos dentro da região delimitada pelo gráfico da elipse x²/100 + y²/400 = 1.',
  36:'O segmento CD intercepta em um único ponto a circunferência de centro em P(14, 0) e de raio igual a 2.',
  38:'O volume do reservatório Tipo B é igual ao volume do reservatório Tipo A.',
  39:'Suponha que o reservatório Tipo A, inicialmente com uma quantidade de água correspondente a 1/4 de seu volume total, tenha sido preenchido a uma taxa de 200 litros por minuto. Nessa situação, o processo para completar o volume de água demorou menos de 4 horas.',
  40:'Suponha que as laterais dos reservatórios sejam construídas de aço carbono, cujo metro quadrado custa R$ 300. Nessa situação, o custo do material necessário para fazer as paredes laterais do reservatório do Tipo B é igual a R$ 6.000.',
  50:'No contexto do cessar-fogo, o premiê israelense Binyamin Netanyahu acusou de anti-israelense o Conselho de Direitos Humanos da Organização das Nações Unidas.',
  52:'No Brasil, a maior parte da população infectada pelo novo coronavírus foi atendida por clínicas e hospitais especializados da rede privada, pois o Sistema Único de Saúde não teve capacidade de atender à densidade demográfica tão alta de internações por covid-19.',
  58:'Na estrutura normativa dos direitos humanos, a Declaração Universal dos Direitos Humanos, proclamada em 1948, é, do ponto de vista técnico-formal, uma resolução juridicamente não vinculante, com caráter de recomendação.',
  60:'Moral e ética são conceitos habitualmente empregados como antônimos, apesar de ambos expressarem regras de conduta obrigatórias.',
  61:'Se dois aspirantes-a-oficial incorporarem no CBMAL na mesma data, o mais antigo entre eles na hierarquia militar será o que tiver nascido primeiro.',
  65:'O ingressante no CBMAL é imediatamente promovido à graduação seguinte se conclui o curso de formação com aproveitamento.',
  69:'Na situação de equilíbrio estático, a pressão da coluna de água é inversamente proporcional ao diâmetro D₁ e à altura H₁.',
  70:'Se a razão D₁/D₂ for igual a 1/3, o fluxo de calor através da boia expandida será superior a oito vezes o fluxo térmico através da boia antes da reação, mantidas as outras condições de temperatura, condutividade térmica e espessura.',
  72:'Para que se possa medir o potencial de corte, o polo positivo da bateria deve ser b.',
  73:'Em um gráfico do potencial de corte versus a frequência, a inclinação da reta independe da função trabalho do material em estudo.',
  75:'A vida-média do elemento em questão é menor que 18 dias.',
  77:'O número de oxidação do fósforo no di-hidrogenofosfato de amônio é uma unidade maior que o número de oxidação do enxofre no (NH₄)₂SO₄.',
  80:'Considere que a obtenção do NH₄H₂PO₄ se dê pela reação do ácido fosfórico (H₃PO₄) com a amônia (NH₃), em uma reação com 100% de rendimento. Nesse caso, para a obtenção de 120 kg de NH₄H₂PO₄, são necessários menos de 100 kg de ácido fosfórico.',
  87:'A planta descrita por Maria é uma espécie vegetal pertencente ao grupo das pteridófitas.',
  88:'Tanto as células eucariotas quanto as células procariotas possuem material genético que pode ser localizado em uma região denominada nucleoide.',
  89:'O peptideoglicano é um dos componentes que constituem a parede celular na maioria dos seres procariontes; nas células vegetais, essa parede é formada por celulose.',
  90:'A vacina tríplice acelular (DTPa), recomendada para a prevenção contra o sarampo, é eficaz por estimular a imunidade passiva nas pessoas.',
  91:'Na América portuguesa, as ordens religiosas estavam diretamente envolvidas com as políticas dos descimentos e aldeamentos indígenas.',
  92:'A Lei de Terras de 1850 promoveu uma drástica mudança na estrutura fundiária brasileira, garantindo a propriedade da terra aos micro e pequenos produtores, além da preservação dos territórios oriundos dos aldeamentos indígenas.',
  93:'O envio de tropas indígenas da Província de Alagoas para auxiliar os revoltosos na Confederação do Equador (1824) foi decisivo para o sucesso do movimento que acabou por proclamar a independência das províncias do Norte.',
  94:'O Departamento de Imprensa e Propaganda criado por Vargas em 1939 buscava interferir em todas as áreas da cultura brasileira por meio da censura artística e cultural.',
  95:'Concebido por militares da ativa, o frustrado atentado do Riocentro em 1981 demonstrou a discordância de parte do Exército com a gradual mudança de regime que ocorria à época.',
  96:'A mundialização do capital, no contexto da globalização, amenizou uma série de problemas dos países em desenvolvimento, como, por exemplo, o mercado de trabalho, que foi assimilado pela imigração para os países desenvolvidos.',
  97:'A nova divisão do trabalho diferencia-se da anterior por ter como pressupostos a formação de grandes corporações no mercado mundial, a produção de tecnologia de ponta concentrada nos países desenvolvidos e a exigência de mão de obra cada vez mais qualificada.',
  98:'Apesar do desenvolvimento tecnológico e informacional, a globalização enfrenta problemas como a exploração, por empresas de países desenvolvidos, da matéria-prima e da mão de obra barata em países mais pobres.',
  99:'Comparado ao século passado, o contexto atual da geopolítica mundial tem menos conflitos bélicos, mas outras contendas se intensificaram em estratégias de guerras comerciais e de informação, sendo um dos exemplos estratégicos dessa discórdia a constante tentativa de ataques virtuais a dados relacionados a empresas e governos.',
  105:'Caso uma viatura do Corpo de Bombeiros Militar do Estado de Alagoas se envolva em um acidente de trânsito com um veículo particular e disso resultem danos materiais e morais ao condutor do veículo particular, este não será indenizado pelo Estado se não for provada culpa ou dolo do condutor da viatura, subsistindo a responsabilidade subjetiva do Estado.',
  106:'Considere que o teto de um automóvel estacionado em via pública tenha sido atingido por uma placa de sinalização de trânsito que caiu por falta da devida manutenção, o que gerou danos materiais ao proprietário do automóvel. Nesse caso, o proprietário poderá ser indenizado por conduta omissiva do Estado.',
  109:'O denominado regime jurídico administrativo compreende tudo aquilo que tanto o particular quanto a administração pública podem fazer, sendo caracterizado pela horizontalidade nas relações jurídicas e pela igualdade jurídica entre as partes.',
  110:'O princípio da indisponibilidade do interesse público é intrinsecamente ligado ao princípio da supremacia do interesse público, isto é, à incapacidade da administração de livremente dispor de bens e do interesse público sob sua tutela.',
  111:'A liberdade de associação é garantia fundamental que prevê que os indivíduos são livres para criar ou participar de associações, desde que seus fins sejam lícitos e que não tenham caráter paramilitar; no entanto, a CF veda a associação de militares, sobretudo porque isso tira o direito à segurança da sociedade e fere a hierarquia e a disciplina militares — nesse caso, o interesse da sociedade sobrepõe-se ao direito do militar.',
  114:'Considere que um militar da ativa do Corpo de Bombeiros Militar do Estado de Alagoas, há mais de 15 anos no exercício do cargo, pretenda se candidatar a prefeito do município. Nesse caso, ele poderá ser candidato às eleições desde que se afaste das atividades a tempo de cumprir a condição de elegibilidade da filiação partidária e, se eleito, passará automaticamente, no ato da diplomação, para a inatividade.',
  116:'Na condição de órgão integrante da segurança pública, exercida para a preservação da ordem pública e da incolumidade das pessoas e do patrimônio, o corpo de bombeiros militar tem a atribuição de exercer as funções de polícia marítima.',
  117:'A decretação de estado de sítio permite ao poder público restringir a liberdade de ir e vir do cidadão, com a utilização de força armada, obrigando, por exemplo, a população a se manter em quarentena total.',
  118:'Oficial do Corpo de Bombeiros do Estado de Alagoas só perderá o posto e a patente se for julgado indigno do oficialato ou com ele incompatível, por decisão de tribunal militar de caráter permanente, em tempo de paz, ou de tribunal especial, em tempo de guerra.',
  119:'Embora estejam sob a autoridade suprema do presidente da República, as Forças Armadas podem atuar para a garantia da lei e da ordem quando assim determinado por iniciativa de qualquer um dos três poderes.'
}
const exportado=JSON.parse(await fs.readFile('tmp/pendentes-documento-454618e27497297c.json','utf8'))
if(exportado.length!==79)throw Error(`Lote alterado: esperadas 79 questões pendentes, recebidas ${exportado.length}`)
const keySha=hashRevisao(gabarito.map((x,i)=>`${i+1}:${x}`).join('\n'))
const decisions=exportado.map(q=>{
 const n=q.numero,meta=materias.get(n),ans=alteracoes.get(n)||gabarito[n-1]
 if(!meta)throw Error(`Questão ${n} sem classificação`)
 const anulada=anuladas.has(n)
 const fontes=[preliminar,justificativas]
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:correcoes[n]||q.enunciado.replace(/\s*Espaço livre[\s\S]*$/i,'').replace(/\s*(?:Noções de Informática|Raciocínio Lógico|Física|Química|História do Brasil|Geografia Geral e do Brasil|Noções de Direito Administrativo|Noções de Direito Constitucional)\s*(?:Julgue|A respeito|Com base|Considerando|A seguir|O efeito|O sistema|As forças|Com relação|Acerca|Durante|Na condição)[\s\S]*$/i,'').replace(/\s+/g,' ').trim(),opcoes:['Certo','Errado'],materia:meta.materia,conteudo:meta.conteudo,ano:2021,concurso,cargo,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'Prova objetiva aplicada em 8 de agosto de 2021',numero_original:n,numero:n,pagina:q.pagina,dificuldade:meta.dificuldade,dificuldade_estimada:true,dificuldade_evidencia:'Estimativa pedagógica pela complexidade do conteúdo e do raciocínio exigido; não é índice psicométrico publicado pela banca.',classificacao_fonte:prova,motivo:`Item ${n} classificado pelo bloco temático e pelo assunto específico do caderno oficial; página de origem ${q.pagina}.`,apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],resposta_correta:anulada?null:ans==='C'?0:1,anulada,gabarito_oficial:{valor:ans,fonte:preliminar,fontes,arquivo:'Gabarito definitivo oficial do cargo 1; justificativas oficiais das alterações e anulações',prova:'Caderno objetivo oficial CBMAL 2021',sha256:keySha,sha256_tipo:'transcricao_canonica_do_gabarito_definitivo; nao_e_hash_dos_pdfs',metodo:'Transcrição do gabarito definitivo oficial, conferida com o documento oficial de justificativas; alterações dos itens 18, 65, 68, 94 e 102 e anulações dos itens 1, 7 e 23 aplicadas.',numero:n,resposta:anulada?'Anulado':ans,criterio:anulada?'Item anulado no gabarito definitivo; sem correção automática.':'Gabarito definitivo oficial CEBRASPE.'}}
})
if(decisions.some(d=>!d.enunciado||d.enunciado.length>1500))throw Error('Enunciado vazio ou excessivamente longo após limpeza')
if(decisions.filter(d=>d.anulada).map(d=>d.numero).join(',')!=='1,7')throw Error('Anulações pendentes divergentes do gabarito final')
if(decisions.filter(d=>!d.anulada&&d.gabarito_oficial).length!==77)throw Error('Quantidade de respostas corrigíveis divergente')
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({nome,documento_id:doc,fonte:prova,gabarito:preliminar,justificativas,questoes_revisadas:decisions.length,questoes_anuladas:decisions.filter(x=>x.anulada).map(x=>x.numero),resultado:result},null,2))
console.log(JSON.stringify({nome,questoes:decisions.length,anuladas:[...anuladas],classificadas:[...new Set(decisions.map(x=>x.materia))],resultado:result},null,2))
