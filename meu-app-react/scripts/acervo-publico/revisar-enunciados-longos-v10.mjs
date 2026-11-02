import fs from 'node:fs/promises'
import zlib from 'node:zlib'
import {aplicarRevisoesIndividuais,hashRevisao} from './aplicar-revisoes-individuais.mjs'
const fila=JSON.parse(zlib.gunzipSync(await fs.readFile('docs/acervo/revisao-profissional/revisao-longos-pendente.json.gz'))),item=i=>fila.find(q=>q.indice===i).questao
const decisoes=[
 {i:15,materia:'Direito Administrativo',conteudo:'Contratos administrativos: alteração unilateral e limites de acréscimo',motivo:'Leitura da situação e do item 58 na página original: acréscimo quantitativo e alteração unilateral de contrato regido pela Lei 8.666/1993.'},
 {i:16,materia:'Informática',conteudo:'Banco de dados: modelo entidade-relacionamento e chaves primárias',texto_apoio:'Considerando o modelo entidade-relacionamento (ER) precedente, julgue os itens relativos a banco de dados.',imagem:'paginas/4798936e340e70c5-0007.webp',pagina:7,motivo:'A página contém o diagrama ER referido pelo item 83. O enunciado é acompanhado do diagrama original; o contexto anterior de teoria da informação foi removido.'},
 {i:17,materia:'Informática',conteudo:'Planilhas eletrônicas: Excel, fórmulas e referências entre planilhas',motivo:'A imagem confirma que o item 34 pergunta pela fórmula de soma entre células em duas planilhas do mesmo arquivo, incluindo a sintaxe “=SOMA(Plan2!A1;A2)”.'},
 {i:18,materia:'Administração',conteudo:'Gestão de pessoas: teorias da liderança situacional',motivo:'A página identifica o bloco como liderança e o item 58 trata dos fatores contingenciais da liderança situacional.'},
 {i:19,materia:'Direito Penal',conteudo:'Crimes contra a Administração Pública: corrupção ativa e contrabando',motivo:'A página confirma o item 44 no caso de oferta de vantagem indevida a policial rodoviário federal e de mercadoria falsificada; o tema é tipificação penal.'}
]
await aplicarRevisoesIndividuais({nome:'revisao-semantica-v10',base:'tmp/revisao-profissional/revisao-semantica-v9/acervo-extraido',decisoes:decisoes.map(p=>{const q=item(p.i);return {id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:p.materia,conteudo:p.conteudo,motivo:p.motivo,...(p.imagem?{visual:{pagina:p.pagina,imagem:p.imagem,texto_apoio:p.texto_apoio,motivo:p.motivo}}:{})}})})
