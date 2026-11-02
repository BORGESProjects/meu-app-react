import fs from 'node:fs/promises'
import {hashRevisao,aplicarRevisoesIndividuais} from './aplicar-revisoes-individuais.mjs'
import {raizesAtuais} from './acervo-atual.mjs'

const nome='revisao-enem-2024-2a-aplicacao-linguagens-humanas-lote-v445'
const doc='60538b6601c7c048'
const prova='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_PV_reaplicacao_PPL_D1_CD4_superampliada.pdf'
const gabarito='https://download.inep.gov.br/enem/provas_e_gabaritos/2024_GB_reaplicacao_PPL_D1_CD4.pdf'
const concurso='ENEM 2024 — 2ª aplicação/Reaplicação-PPL — 1º dia — Caderno 4 Verde (superampliado)'
const cargo='Exame Nacional do Ensino Médio — prova do 1º dia'

const ingles='D A B C D'.split(' ')
const espanhol='C A D D C'.split(' ')
const linguagens=[
 'C A D D C C B C A A',
 'C C D B A C B A E E',
 'A C E C B D E A E E',
 'D A E A D D B C D D',
 'A E D E C'
].flatMap(x=>x.split(' '))
const humanas=[
 'B D A D B C B E A A',
 'E C C B E B E D B C',
 'E C D C D E D B A C',
 'D A D B A E A E A C',
 'A C E B D'
].flatMap(x=>x.split(' '))
if(linguagens.length!==45||humanas.length!==45)throw Error(`Gabarito oficial inválido: linguagens ${linguagens.length}, humanas ${humanas.length}`)
const resposta=(n,pagina)=>n<=5?(pagina<=7?ingles[n-1]:espanhol[n-1]):n<=45?linguagens[n-1]:humanas[n-46]
const chaveCanonica=[...ingles.map((x,i)=>`I${i+1}:${x}`),...espanhol.map((x,i)=>`E${i+1}:${x}`),...linguagens.map((x,i)=>`${i+1}:${x}`),...humanas.map((x,i)=>`${i+46}:${x}`)].join('\n')
const hashGabarito=hashRevisao(chaveCanonica)
const invalidos=new Map([
 ['extr-03b8c2b86db5f8da9b3e',{motivo:'pagina_de_instrucoes_e_capa_nao_e_questao'}],
 ['extr-e03a8441c73f8f57bcab',{motivo:'duplicata_da_capa_e_instrucoes_do_caderno; nao_e_questao'}],
 ['extr-454f01cb0d2f309c713d',{motivo:'extracao_incorreta_de_verbete_de_dicionario_embutido_na_questao_43; nao_e_item_de_fisica'}]
])
const textos={
 6:['Língua Portuguesa','Interpretação de texto institucional: campanha pública de combate à desnutrição'],
 7:['Língua Portuguesa','Gênero notícia e serviço público digital: finalidade do aplicativo Celular Seguro'],
 8:['Educação Física','Esporte e sociedade: doping, desempenho e práticas corporais'],
 10:['Literatura Brasileira','Poesia popular, eu lírico e representação do trabalho rural'],
 11:['Artes','Arte popular brasileira: leitura de obra de Mestre Vitalino'],
 13:['Língua Portuguesa','Interpretação de reportagem: comunidades transfronteiriças e identidade cultural'],
 14:['Língua Portuguesa','Leitura crítica de notícias falsas e estratégias de verificação'],
 15:['Literatura Brasileira','Poesia moderna: linguagem, liberdade e crítica social'],
 16:['Língua Portuguesa','Gênero crônica e referência à psicanálise na construção de sentido'],
 17:['Língua Portuguesa','Texto jornalístico e debate público sobre inteligência artificial'],
 18:['Língua Portuguesa','Crônica: leitura, formação de leitores e apreciação literária'],
 19:['Língua Portuguesa','Gênero epistolar: carta, interlocução e marcas de interlocutor'],
 20:['Língua Portuguesa','Leitura crítica de aplicativos de rastreamento e privacidade familiar'],
 21:['Literatura Brasileira','Poema: ritmo, repetição e efeitos de sentido'],
 22:['Literatura Brasileira','Conto: narrador, tensão narrativa e construção do desfecho'],
 23:['Língua Portuguesa','Gênero notícia e direitos sociais: licença-paternidade'],
 24:['Literatura Brasileira','Prosa literária: foco narrativo e representação da experiência'],
 26:['Língua Portuguesa','História em quadrinhos: linguagem verbal, visual e intertextualidade'],
 27:['Literatura Brasileira','Poesia metalinguística: materialidade do signo e crítica estética'],
 28:['Língua Portuguesa','Interpretação de texto jornalístico e construção de ponto de vista'],
 29:['Literatura Brasileira','Crônica e representação literária do espaço urbano'],
 31:['Literatura Brasileira','Prosa realista: caracterização de personagem e perspectiva narrativa'],
 32:['Língua Portuguesa','Cartaz: linguagem verbal e visual em campanha de inclusão'],
 33:['Literatura Brasileira','Carta e intertextualidade: diálogo com Gilberto Freyre e cultura goiana'],
 34:['Literatura Brasileira','Canção: eu lírico, cotidiano e recursos expressivos'],
 35:['Língua Portuguesa','Interpretação de texto: preconceito e relações sociais'],
 36:['Língua Portuguesa','Variação linguística: jargão corporativo e usos sociais da língua'],
 38:['Língua Portuguesa','Gênero notícia: adequação linguística e informação sobre fake news'],
 39:['Literatura Brasileira','Prosa literária: caracterização da personagem e descrição'],
 40:['Artes','Leitura de ilustração: crítica social e linguagem visual'],
 41:['Língua Portuguesa','Gêneros digitais: podcast, circulação e interação on-line'],
 42:['Língua Portuguesa','Divulgação científica e acessibilidade textual em bulas de medicamentos'],
 44:['Língua Portuguesa','Inteligência artificial generativa: interpretação de texto jornalístico'],
 45:['Educação Física','Esporte, mídia e interpretação de informação institucional'],
 46:['História do Brasil','Abolicionismo e memória da abolição no Ceará'],
 48:['História','Povoamento da Europa: arqueologia, migrações e formação populacional'],
 50:['História','Movimento dos direitos civis nos Estados Unidos: Rosa Parks e segregação racial'],
 51:['Geografia','Questões ambientais: proteção da natureza e conflitos socioambientais'],
 52:['Filosofia','Nietzsche: eterno retorno, ética e afirmação da vida'],
 54:['Filosofia','Albert Camus e o absurdo: liberdade, sentido e existência'],
 55:['Geografia','Migrações internacionais e debate político no referendo britânico'],
 56:['Sociologia','Memória coletiva, museus comunitários e patrimônio cultural'],
 58:['Geografia','Caatinga: uso comunitário da terra, pecuária e modos de vida tradicionais'],
 59:['Filosofia','Cidadania e pensamento político nas civilizações clássicas'],
 60:['Sociologia','Religião, cultura popular e patrimônio: Círio de Nazaré'],
 62:['História do Brasil','Industrialização brasileira e política econômica de Getúlio Vargas'],
 63:['História','Ditadura chilena, violência política e justiça de transição'],
 65:['História','Urbanização medieval e relações entre cidade e campo'],
 66:['Geografia','Energia fóssil, localização industrial e organização do espaço econômico'],
 67:['História','Colonização da América e debate europeu sobre os povos indígenas'],
 68:['História','Contracultura, juventude e festivais de música na década de 1960'],
 69:['Sociologia','Direitos sociais, cidadania e interpretação de charge'],
 71:['Filosofia','Ubuntu: ética comunitária e concepções africanas de pessoa'],
 72:['Filosofia','Epistemologia: significatividade do mundo e estruturas de interpretação'],
 73:['Geografia','Mudanças climáticas, degelo e exploração de recursos naturais'],
 75:['Geografia','Cartografia temática e interpretação de dados ambientais do MapBiomas'],
 78:['Filosofia','Civilização, barbárie e crítica dos valores sociais'],
 79:['Geografia','Migrações e governança internacional: Organização Internacional para as Migrações'],
 80:['Geografia','Modernização agrícola, propriedade da terra e desigualdade rural'],
 81:['Geografia','Território, soberania e reconhecimento de micronações'],
 83:['Geografia','Sustentabilidade e pegada ecológica: Dia da Sobrecarga da Terra'],
 84:['Sociologia','Mídia televisiva e construção da percepção da realidade'],
 87:['Geografia','Cartografia digital, sensoriamento remoto e representação do espaço'],
 89:['Sociologia','Corpo, padrões de beleza e consumo na sociedade contemporânea'],
 90:['Geografia','Biodiversidade agrícola, sementes e adaptação às condições de cultivo']
}
const exportado=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(exportado.length!==78)throw Error(`Esperados 78 registros exportados; recebido ${exportado.length}`)
const decisions=exportado.map(q=>{
 const itemInvalido=invalidos.get(q.id)
 let materia,conteudo
 if(itemInvalido){materia=q.id==='extr-454f01cb0d2f309c713d'?'Língua Portuguesa':'ENEM';conteudo='Registro de capa/instrução ou fragmento fora do item'}
 else if(q.numero<=5){const lingua=q.pagina<=7?'Inglês':'Espanhol';materia=lingua;conteudo=`Leitura e interpretação de texto em ${lingua.toLowerCase()} — ENEM, questões de língua estrangeira (itens 1 a 5)`}
 else if(q.numero<=45){[materia,conteudo]=textos[q.numero]||['Língua Portuguesa','Leitura, interpretação e análise de gêneros textuais']}
 else [materia,conteudo]=textos[q.numero]||[]
 if(!materia||!conteudo)throw Error(`Questão sem classificação específica: ${q.id}, número ${q.numero}`)
 const correta=itemInvalido?null:resposta(q.numero,q.pagina)
 const enunciado=q.enunciado.replace(/\s*(?:ENEM\s*2024|2ª APLICAÇÃO|SUPERAMPLIADA|CADERNO\s*4\s*VERDE|Questões de 0?1 a 45|Questões de 46 a 90|Espaço livre)[\s\S]*$/i,'').replace(/\s+/g,' ').trim()
 const apoioTexto=(q.apoio||'').replace(/\s+/g,' ').trim()
 const links= q.opcoes.map(x=>String(x).replace(/\s+/g,' ').trim())
 return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),enunciado,opcoes:links,materia,conteudo,ano:2024,concurso,cargo,banca:'INEP',organizadora:'INEP',aplicacao:'2ª aplicação/Reaplicação-PPL, 1º dia, caderno 4 verde superampliado; edição 2024',numero_original:q.numero,numero:q.numero,pagina:q.pagina,dificuldade:q.numero<=5?'Média':q.numero>=46?'Média':'Média',dificuldade_estimada:true,dificuldade_evidencia:'Estimativa editorial baseada na complexidade de leitura, repertório e inferência exigida; não é índice psicométrico publicado pelo INEP.',classificacao_fonte:prova,motivo:itemInvalido?`Registro descartado da resolução: ${itemInvalido.motivo}.`:`Classificação individual pela leitura do texto, do comando, das alternativas e da área indicada no caderno oficial. Para os itens de língua estrangeira, a página separa as versões de inglês e espanhol.`,texto_apoio:apoioTexto,apoio:[],imagem_pagina:`paginas/${doc}-${String(q.pagina).padStart(4,'0')}.webp`,apta_resolucao:!itemInvalido,remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','visual_ausente','integridade_visual_pendente','dificuldade_nao_informada','texto_corrompido','texto_corrompido_requer_reconstrucao','texto_de_outro_bloco','enunciado_incompleto','classificacao_pendente'],...(itemInvalido?{inelegibilidade_motivo:itemInvalido.motivo}:{resposta_correta:['A','B','C','D','E'].indexOf(correta),anulada:false,gabarito_oficial:{valor:correta,fonte:gabarito,fontes:[gabarito],arquivo:'Gabarito oficial INEP — ENEM 2024, 2ª aplicação, 1º dia, Caderno 4 Verde',prova:'Caderno oficial superampliado de reaplicação/PPL, 1º dia, ENEM 2024',sha256:hashGabarito,sha256_tipo:'transcricao_canonica_do_gabarito_oficial; nao_e_hash_do_pdf',metodo:'Transcrição das tabelas oficiais por número; versão inglesa ou espanhola identificada pela página nos itens 1 a 5; questões comuns de Linguagens (6 a 45) e Ciências Humanas (46 a 90).',numero:q.numero,resposta:correta,criterio:'Gabarito oficial definitivo INEP.'}})}
})
const validas=decisions.filter(x=>x.apta_resolucao)
if(validas.length!==75||decisions.filter(x=>!x.apta_resolucao).length!==3)throw Error(`Contagem não confere: ${validas.length} válidas / ${decisions.length-validas.length} inválidas`)
const resultado=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.mkdir('docs/acervo/revisao-profissional',{recursive:true})
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`,JSON.stringify({nome,documento_id:doc,prova,gabarito,questoes_revisadas:decisions.length,questoes_unicas_elegiveis:validas.length,registros_inaptos:decisions.filter(x=>!x.apta_resolucao).map(x=>({id:x.id,motivo:x.inelegibilidade_motivo})),resultado},null,2))
console.log(JSON.stringify({nome,questoes_revisadas:decisions.length,elegiveis:validas.length,inaptas:decisions.length-validas.length,materias:[...new Set(validas.map(x=>x.materia))],resultado},null,2))
