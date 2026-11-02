import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-inpi-2023-conhecimentos-basicos-pendencias-v404'
const doc='0687e3fccae2f42d'
const prova='https://cdn.cebraspe.org.br/concursos/INPI_23/arquivos/930_INPI_CB1_01.PDF'
const gabarito='https://cdn.cebraspe.org.br/concursos/inpi_23/arquivos/GAB_DEFINITIVO_930_INPI_CB1_01.PDF'
const concurso='INPI — Edital 2023 — Prova objetiva de conhecimentos básicos — aplicação 2024'
const records=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(records.length!==54||new Set(records.map(q=>q.id)).size!==54)throw Error('O conjunto de pendências do documento mudou; exporte novamente.')
const lang={
'extr-02a8a210a891e70d7408':['Espanhol','Compreensão textual: arquitetura industrial e arquitetura do ferro','Leitura e interpretação de textos em língua espanhola'],
'extr-b7e5fe1b72050c139d93':['Espanhol','Léxico e sintaxe: coordenação de adjetivos e conjunção “e”','Morfossintaxe e semântica em língua espanhola'],
'extr-0947f1fc9955abbef5cb':['Espanhol','Compreensão textual: características da arquitetura industrial','Leitura e interpretação de textos em língua espanhola'],
'extr-558bfbedd5a74c1e8408':['Espanhol','Compreensão textual: materiais e propriedades da arquitetura industrial','Leitura e interpretação de textos em língua espanhola'],
'extr-9413ed30000a05afae0d':['Espanhol','Compreensão textual: Mercado de San Miguel','Leitura e interpretação de textos em língua espanhola'],
'extr-31e86f67af841f0b148e':['Espanhol','Compreensão textual: história e função do Mercado de San Miguel','Leitura e interpretação de textos em língua espanhola'],
'extr-01eaeffbb6ba0aa12ee6':['Espanhol','Compreensão textual: função do Puente Transbordador de Vizcaya','Leitura e interpretação de textos em língua espanhola'],
'extr-08613ce87b8a13c4f700':['Espanhol','Compreensão textual: função e estrutura de ponte transportadora','Leitura e interpretação de textos em língua espanhola'],
'extr-e68ea7fd8e0d2370346c':['Espanhol','Compreensão textual: travessia e transporte no Puente de Vizcaya','Leitura e interpretação de textos em língua espanhola'],
'extr-cbed163896b72a1695f0':['Francês','Compreensão textual: inovação, clima e transição energética','Leitura e interpretação de textos em língua francesa'],
'extr-d1ad064ed4d2b6b62894':['Francês','Morfossintaxe: gênero e substituição de substantivos','Morfossintaxe e semântica em língua francesa'],
'extr-2263a15945d22cf2da8d':['Francês','Compreensão textual: inovação e energias renováveis','Leitura e interpretação de textos em língua francesa'],
'extr-46d93ac7520efbc1f1e2':['Francês','Morfossintaxe: gênero e número de substantivos','Morfossintaxe e semântica em língua francesa'],
'extr-c306028ff6d035e34d4e':['Francês','Coesão textual: referência pronominal de “en”','Coesão, gramática e interpretação em língua francesa'],
'extr-3a30ea949020c0a1ef0a':['Francês','Compreensão textual: Anne L’Huillier e o Nobel de Física','Leitura e interpretação de textos em língua francesa'],
'extr-e1b43f9bd5d1a253ba57':['Francês','Semântica textual: valor do advérbio “pourtant”','Coesão e semântica em língua francesa'],
'extr-4cb8300980fc69d38c8c':['Francês','Semântica: comparação e expressão idiomática','Vocabulário e semântica em língua francesa'],
'extr-552672e84dc140a5f421':['Francês','Semântica: concessão introduzida por “malgré”','Conjunções e relações semânticas em língua francesa'],
'extr-ad0b9db97b4dbbaa1fe2':['Francês','Gramática: conjunção temporal “lorsque”','Conjunções e relações temporais em língua francesa'],
'extr-6e858029202b34ca0480':['Inglês','Compreensão textual: hábito de adiar o despertador','Leitura e interpretação de textos em língua inglesa'],
'extr-c7e70f5c4d4c65853069':['Inglês','Compreensão textual: efeitos de adiar o despertador','Leitura e interpretação de textos em língua inglesa'],
'extr-ef0a89263a6e8229059e':['Inglês','Compreensão textual: frequência e motivos para adiar o despertador','Leitura e interpretação de textos em língua inglesa'],
'extr-0df7f533adc6b4817ab6':['Inglês','Coesão textual: conectivo adversativo “however”','Conjunções e relações semânticas em língua inglesa'],
'extr-63f0142d2903cddfa5cc':['Inglês','Compreensão textual: riscos do uso de celular no banheiro','Leitura e interpretação de textos em língua inglesa'],
'extr-88c6351df8ef69c53349':['Inglês','Vocabulário e equivalência semântica: “apart from”','Vocabulário em língua inglesa'],
'extr-2052dbbd8e95b322e19c':['Inglês','Tradução e compreensão de expressão idiomática','Tradução e vocabulário em língua inglesa'],
'extr-1b9e74fcc031cea76921':['Inglês','Compreensão textual: dados de pesquisa sobre celulares','Leitura e interpretação de textos em língua inglesa'],
'extr-ee37d1005109e653f0f5':['Inglês','Preposições e sentido: “on the toilet”','Gramática e semântica em língua inglesa'],
'extr-74a08b72f3af60e45efe':['Língua Portuguesa','Interpretação: história da proteção patentária','Leitura e interpretação de textos'],
'extr-8dc19c203e5a42d8c843':['Língua Portuguesa','Interpretação: proteção patentária no Brasil','Leitura e interpretação de textos'],
'extr-a61cd26dedebde23e909':['Língua Portuguesa','Interpretação: leis de patentes dos Estados Unidos e da França','Leitura e interpretação de textos'],
'extr-01fa41437f546f4b1fd7':['Língua Portuguesa','Verbos: pretérito perfeito e sequência temporal','Tempos e modos verbais'],
'extr-b7b717b42bc8ca433708':['Língua Portuguesa','Sintaxe: sujeito e complemento verbal na voz passiva','Termos da oração e voz passiva'],
'extr-2303811ec424b8a02610':['Língua Portuguesa','Pontuação: vírgula em adjunto adverbial','Pontuação e sintaxe'],
'extr-8d4c0da61e251679fffe':['Língua Portuguesa','Reescrita: voz passiva e manutenção de sentido','Reescrita de frases e vozes verbais'],
'extr-8e828a11f346f4d2b583':['Língua Portuguesa','Concordância verbal e reescrita','Concordância verbal'],
'extr-c0724abd85dbb231ec51':['Língua Portuguesa','Interpretação: tecnologia e sociedades antigas','Leitura e interpretação de textos'],
'extr-68c805243579ab38d8e2':['Língua Portuguesa','Interpretação: tecnologia empírica e ciência aplicada','Leitura e interpretação de textos'],
'extr-95bd0ae329ba0b920f50':['Língua Portuguesa','Interpretação: conceito de civilização','Leitura e interpretação de textos'],
'extr-5f4949f8cf54e2184390':['Língua Portuguesa','Interpretação: tecnologia e desenvolvimento das artes','Leitura e interpretação de textos'],
'extr-5b3d1e38f049b344908d':['Língua Portuguesa','Semântica e colocação de advérbios','Classes de palavras e semântica'],
'extr-876f4367eb2388b90931':['Língua Portuguesa','Coesão: correlação aditiva “não apenas… mas também”','Conjunções e coesão textual'],
'extr-5e50314e28bc9775318b':['Língua Portuguesa','Regência verbal: substituição de “haver” por “existir”','Regência verbal'],
'extr-f02535e4256f9777902a':['Língua Portuguesa','Concordância nominal e verbal','Concordância'],
'extr-5da7eec4fb43d0a8beca':['Língua Portuguesa','Coesão: oração causal introduzida por “já que”','Conjunções e coesão textual'],
'extr-80297d5c0766b364e447':['Língua Portuguesa','Elipse verbal e paralelismo sintático','Sintaxe e elipse'],
'extr-dcacfb6da2eec3e3911a':['Língua Portuguesa','Colocação pronominal: ênclise em locução verbal','Pronomes e colocação pronominal'],
'extr-75e6d67d41ac39523ca6':['Língua Portuguesa','Crase: emprego diante de pronome demonstrativo','Crase'],
'extr-3158d195e9db922934be':['Língua Portuguesa','Funções sintáticas de termos preposicionados','Análise sintática'],
'extr-e087e93fb70454ef0017':['Língua Portuguesa','Orações subordinadas e funções sintáticas','Orações subordinadas'],
'extr-0f40f80bad59d2e7c72e':['Direito Industrial','Propriedade intelectual: natureza dos direitos','Propriedade intelectual'],
'extr-045bd0de29684a7bfe38':['Direito Industrial','Patenteabilidade e requisitos de patente','Patentes: requisitos de proteção'],
'extr-fabed295ad62dfd1fc41':['Direito Industrial','Renúncia parcial de patente e efeitos sobre produtos e serviços','Patentes: extinção e renúncia'],
'extr-3b1032e34d149d07a4da':['Direito Industrial','Patente de modelo de utilidade: unidade do pedido','Patentes: modelo de utilidade'],
'extr-c1f5c64cc03c1d1863f0':['Direito Industrial','Vigência de patentes de invenção e de modelo de utilidade','Patentes: prazo de vigência'],
'extr-47a8a1f33c704a28c7a8':['Direito Industrial','Divisibilidade do pedido e cessão de patente','Patentes: cessão e titularidade'],
'extr-a0f1eab361ca0483b394':['Direito Industrial','Caducidade de patente por falta de exploração','Patentes: caducidade'],
'extr-0266f024feae0646079b':['Direito Industrial','Desenho industrial: novidade e estado da técnica','Desenhos industriais'],
'extr-5b7de2f53bd55d8cf7af':['Direito Industrial','Registro de marca: sinais não registráveis','Marcas: registrabilidade'],
'extr-5dedd4ceca8cd098f273':['Direito Industrial','Registro de marca: legitimidade de pessoas físicas e jurídicas','Marcas: registro e titularidade'],
'extr-91fd962d59f6c6148c18':['Direito Industrial','Indicação geográfica: nome geográfico de uso comum','Indicações geográficas'],
'extr-cb67a8aeb5e1f670df2b':['Administração Pública','Competências legais do INPI em tratados de propriedade industrial','Organização e competências do INPI'],
'extr-cbccdd7ed876d018bbda':['Administração Pública','Atribuições da Diretoria de Administração do INPI','Estrutura organizacional do INPI'],
'extr-916c11c55399e6342698':['Administração Pública','Posição institucional e competências da Ouvidoria do INPI','Estrutura organizacional do INPI'],
'extr-7ad5ee3edd50f6ba5b18':['Administração Pública','Competências da Diretoria-Executiva no planejamento estratégico','Estrutura organizacional do INPI']
}
const textos={
espanhol:'Texto-base em espanhol: três excertos da prova sobre arquitetura industrial, Mercado de San Miguel de Madrid e Puente Transbordador de Vizcaya. A reprodução integral e a paginação permanecem na imagem original da página 1 ou 2, conforme o item.',
frances_clima:'Texte de base: passage sur l’innovation comme levier de réduction des émissions, les énergies renouvelables, les technologies sobres en carbone et leurs enjeux économiques. Le texte complet est conservé dans l’image originale de la page 2.',
frances_nobel:'Texte de base: article sur Anne L’Huillier, le prix Nobel de physique 2023, ses recherches sur l’attoseconde et les réactions à cette distinction. Le texte complet est conservé dans l’image originale de la page 2.',
ingles_sono:'Text base: “Does Snoozing Your Alarm Really Increase Sleepiness?”, about snoozing, sleepiness, survey results, sleep habits and reasons people use repeated alarms. Full passage is preserved in the original page 3 image.',
ingles_celular:'Text base: passage on using phones in the bathroom, hygiene concerns, health risks and survey data about dropping phones in toilets. Full passage is preserved in the original page 3 image.',
patentes:'Texto-base CB1A1-I: passagem histórica sobre a origem e a evolução da proteção patentária em Veneza, Inglaterra, Estados Unidos, França e Brasil. Texto integral e referência bibliográfica preservados na imagem original da página 4.',
civilizacao:'Texto-base CB1A1-II: passagem sobre a dificuldade de definir civilização, tecnologia nas sociedades antigas, ciência aplicada, divisão do trabalho e desenvolvimento das artes. Texto integral e referência bibliográfica preservados nas imagens originais das páginas 4 e 5.',
lingua:'Texto-base CB1A1-III: passagem sobre a necessidade humana de comunicação, trocas linguísticas e interação por mídias, televisão, jogos e leitura/escrita. Texto integral preservado na imagem original da página 5.',
lei:'Comando: julgue os itens conforme a Lei nº 9.279/1996 (Lei da Propriedade Industrial). O enunciado de cada questão identifica o instituto jurídico; a página original preserva a redação integral.',
inpi:'Comando: julgue os itens sobre a finalidade, as competências e a organização interna do Instituto Nacional da Propriedade Industrial (INPI), conforme as normas indicadas no caderno. A página original permanece vinculada.'
}
function contexto(q){const id=q.id;if(id.startsWith('extr-02a8')||id.startsWith('extr-b7e5')||id.startsWith('extr-0947')||id.startsWith('extr-558')||id.startsWith('extr-941')||id.startsWith('extr-31e')||id.startsWith('extr-01e')||id.startsWith('extr-086')||id.startsWith('extr-e68'))return textos.espanhol;if(['extr-cbed','extr-d1ad','extr-2263','extr-46d','extr-c306'].some(x=>id.startsWith(x)))return textos.frances_clima;if(['extr-3a30','extr-e1b','extr-4cb','extr-552','extr-ad0'].some(x=>id.startsWith(x)))return textos.frances_nobel;if(['extr-6e858','extr-c7e7','extr-ef0','extr-0df7'].some(x=>id.startsWith(x)))return textos.ingles_sono;if(['extr-63f','extr-88c','extr-205','extr-1b9','extr-ee37'].some(x=>id.startsWith(x)))return textos.ingles_celular;const n=Number(q.numero);if(n>=11&&n<=21)return textos.patentes;if(n>=22&&n<=30)return textos.civilizacao;if(n>=31&&n<=35)return textos.lingua;if(n>=36&&n<=46)return textos.lei;return textos.inpi}
function dificuldade(q,materia){const n=Number(q.numero);if(materia==='Direito Industrial')return n>=42?'Difícil':'Média';if(materia==='Administração Pública')return 'Difícil';if(['Francês','Espanhol','Inglês'].includes(materia))return /substitu|conjun|pronome|preposi|tradução|gênero|semântica/i.test(lang[q.id][1])?'Média':'Fácil';if(materia==='Língua Portuguesa')return n>=31&&n<=35?'Difícil':'Média';return 'Média'}
const decis=records.map(q=>{const cl=lang[q.id];if(!cl)throw Error(`Questão sem matéria/conteúdo individual: ${q.id}`);let e=q.enunciado.trim().replace(/\s+/g,' ');e=e.replace(/\s+(?:Texto CB1A6-II|Texto CB1A1-III|Considering the grammatical aspects|LÍNGUA FRANCESA|LÍNGUA INGLESA|Espaço livre|Com base na Lei n\.º 9\.279\/1996|Com relação ao Instituto Nacional).*[\s\S]*$/i,'').trim();if(q.id==='extr-558bfbedd5a74c1e8408')e='Los materiales utilizados por el estilo arquitectónico industrial tienen una característica en común: son resistentes a golpes e inclemencias temporales.';if(q.id==='extr-e68ea7fd8e0d2370346c')e='De acuerdo con el texto, es posible caminar por el puente y atravesar la ría en un máximo de noventa segundos.';if(q.id==='extr-ad0b9db97b4dbbaa1fe2')e='Dans le troisième paragraphe, la conjonction « lorsque » marque la simultanéité temporelle et est le synonyme usuel de « quand ».';if(q.id==='extr-0df7f533adc6b4817ab6')e='The adverb “However” (last sentence of the first paragraph) can be correctly replaced by “Therefore”, without changing the meaning of the text.';if(q.id==='extr-ee37d1005109e653f0f5')e='It would change the meaning of the first sentence of the text if the preposition “on” in “on the toilet” were replaced by “in”.';if(q.id==='extr-74a08b72f3af60e45efe')e='Conforme as informações do texto, a lei de patentes britânica, promulgada em 1624, instituiu o sistema de patentes inglês em substituição ao Estatuto dos Monopólios de 1623, que, até então, constituía a base legal de concessão de patentes na Inglaterra.';if(q.id==='extr-a61cd26dedebde23e909')e='Entende-se da leitura do texto que os Estados Unidos da América e a França promulgaram suas respectivas leis de patentes na mesma época e com o mesmo teor, tendo garantido aos inventores a exclusividade na exploração comercial de suas criações por um período de quatorze anos.';if(q.id==='extr-5da7eec4fb43d0a8beca')e='No segundo parágrafo, a oração introduzida por “já que” (segundo período) denota a razão que justifica a afirmação contida na oração imediatamente anterior.';if(q.id==='extr-e087e93fb70454ef0017')e='As orações “o quão ocupadas algumas pessoas estejam” e “não participarem de alguma conversa na tela à sua frente”, no terceiro período, são ambas orações que exercem a função de sujeito.';const materia=cl[0],pagina=Number(q.pagina),imagem=`paginas/${doc}-${String(pagina).padStart(4,'0')}.webp`,apoio=contexto(q);return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado:e,materia,conteudo:cl[2],ano:2024,concurso,banca:'CEBRASPE',organizadora:'CEBRASPE',aplicacao:'04/02/2024',cargo:'Todos os cargos — prova de conhecimentos básicos',numero_original:Number(q.numero),numero:Number(q.numero),pagina,dificuldade:dificuldade(q,materia),dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial pelo tipo de habilidade, densidade do texto ou tecnicidade do tema; a banca não publica nível de dificuldade.',classificacao_fonte:prova,motivo:`Classificação individual conferida no enunciado e no texto-base da prova oficial: ${cl[1]}.`,texto_apoio:apoio,imagens_contexto:[{pagina,imagem,texto:apoio}],reemplazarContexto:true,visual:{pagina,imagem,motivo:'Página original conferida visualmente; a imagem preserva integralmente o texto-base e o enunciado da prova.'},apta_resolucao:true,remover_pendencias:['classificacao_especifica_pendente','ano_sem_evidencia','gabarito_oficial_nao_vinculado','integridade_visual_pendente']}})
if(process.argv.includes('--dry-run')){console.log(JSON.stringify({registros:decis.length,porMateria:Object.fromEntries([...new Set(decis.map(x=>x.materia))].map(m=>[m,decis.filter(x=>x.materia===m).length])),porAno:{2024:decis.length},prova,gabarito,publicado:false},null,2));process.exit(0)}
const result=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decis})
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs',`\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const report={...result,edicao:concurso,prova,gabarito,nota:'54 registros revistos. As matérias foram corrigidas por seção e idioma: Espanhol, Francês, Inglês, Língua Portuguesa, Direito Industrial e Administração Pública/estrutura do INPI. A data e o ano da aplicação foram corrigidos para 04/02/2024. Textos-base concatenados foram separados dos enunciados e as páginas originais correspondentes foram preservadas. A fonte oficial de gabarito definitivo foi localizada, mas o arquivo apresenta tabelas de línguas em disposição que não permite validar com segurança a associação de cada versão; por isso nenhuma chave foi anexada nem a correção automática habilitada neste lote.',publicado:false}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify(report,null,2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`\n\n## CEBRASPE — INPI 2023 — Conhecimentos Básicos — revisão v404\n\n- ${decis.length} questões classificadas individualmente por idioma/matéria e tópico, com prova, ano, data de aplicação e cargo.\n- Corrigidas contaminações de enunciados por cabeçalhos e textos-base seguintes.\n- Textos de arquitetura, energia, idiomas, história da propriedade industrial e civilização permanecem ligados às imagens originais correspondentes; questões de legislação foram agrupadas sob Direito Industrial e as de estrutura do INPI sob Administração Pública.\n- Dificuldade estimada editorialmente. Gabarito definitivo não vinculado; sem correção automática.\n- Fonte: [caderno oficial CEBRASPE](${prova}). Alterações locais, não publicadas na nuvem.\n`)
console.log(JSON.stringify({...result,publicado:false}))
