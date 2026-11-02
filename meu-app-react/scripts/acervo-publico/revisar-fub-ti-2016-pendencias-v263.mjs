import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const doc='32355c159a9feefa'
const nome='revisao-fub-ti-2016-pendencias-v263'
const prova='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/281FUB_013_01.pdf'
const chave='https://cdn.cebraspe.org.br/concursos/FUB_16_1/arquivos/Gab_Definitivo_281FUB_013_01.pdf'
const raw=JSON.parse(await fs.readFile(`tmp/pendentes-documento-${doc}.json`,'utf8'))
if(raw.length!==20)throw Error(`Esperava 20 pendências, encontrei ${raw.length}`)

// Respostas extraídas do gabarito definitivo do Cargo 13 (51–120).
const answersText='51:C|52:E|78:C|79:C|80:E|81:C|82:C|83:E|84:E|85:C|86:C|87:E|88:C|90:C|92:C|110:C|111:E|113:C|114:E|115:C'
const answers=new Map(answersText.split('|').map(x=>{const [n,a]=x.split(':');return[Number(n),a]}))
const keyHash=createHash('sha256').update(answersText).digest('hex')
const exam='FUB 2016 — Cargo 13, Técnico de Tecnologia da Informação (aplicação em 18/12/2016)'
const topics={
  51:['Sistemas Operacionais','Gerenciamento de memória por mapa de bits e unidade de alocação','Média'],
  52:['Sistemas Operacionais','Arquitetura de sistema operacional monolítico','Média'],
  78:['Arquitetura de Computadores','GPU: etapas do pipeline gráfico e processamento de imagens','Média'],
  79:['Arquitetura de Computadores','GPU e processamento paralelo de tarefas gráficas','Fácil'],
  80:['Hardware e Periféricos','Comunicação serial assíncrona: formato 8/N/1, paridade e bit de parada','Média'],
  81:['Hardware e Periféricos','Porta paralela DB-25: pinos de sinal e aterramento','Média'],
  82:['Redes de Computadores','Interface serial RS-232: equipamentos DTE e DCE','Média'],
  83:['Estruturas de Dados','Árvores binárias: definição e número máximo de filhos','Fácil'],
  84:['Estruturas de Dados','Pilha: operações LIFO e extremidade de acesso','Fácil'],
  85:['Estruturas de Dados','Fila: operações FIFO e extremidades de inserção e remoção','Fácil'],
  86:['Redes de Computadores','DNS: servidores raiz, delegação e resolução de nomes','Difícil'],
  87:['Redes de Computadores','DNS e protocolos de resolução de nomes','Fácil'],
  88:['Redes de Computadores','DNS: registro do tipo A e associação de nome a endereço IPv4','Fácil'],
  90:['Segurança da Informação','Firewall de rede: filtragem por endereços IP de origem e destino','Fácil'],
  92:['Arquitetura de Computadores','Memória principal: módulos SIMM de 30 e 72 vias','Média'],
  110:['Banco de Dados','Modelo entidade-relacionamento: cardinalidade entre empréstimo e itens','Média'],
  111:['Banco de Dados','Modelo entidade-relacionamento: entidades fortes e fracas','Média'],
  113:['Banco de Dados','Modelo entidade-relacionamento: entidade associativa e chaves compostas','Média'],
  114:['Banco de Dados','Compartilhamento de dados, redundância e integração em SGBD','Média'],
  115:['Banco de Dados','Independência lógica e física de dados em SGBD','Difícil'],
}
const contexts=n=>{
  if(n<=52)return 'Acerca de estruturas do sistema operacional e de gerenciamento de processos e memória, julgue o item.'
  if(n<=79)return 'Com relação a placas de vídeo modernas, julgue o item acerca de GPU (graphics processing unit).'
  if(n<=82)return 'Com relação às principais diferenças entre portas paralelas e seriais, assim como ao seu uso, julgue o item.'
  if(n<=85)return 'Estruturas de pilhas, filas e árvores binárias são amplamente utilizadas para a construção de algoritmos e programas de computador. Acerca dessas estruturas, julgue o item.'
  if(n<=88)return 'Julgue o item relativo ao DNS (domain name system), amplamente utilizado na Internet para resolução de nomes.'
  if(n===90)return 'Ferramentas de firewall são amplamente utilizadas em redes de computadores para permitir ou negar fluxos de pacotes. Acerca de firewall convencional de rede, julgue o item.'
  if(n===92)return 'Memórias são utilizadas por computadores como recurso auxiliar para armazenamento de dados necessários ao processamento. Acerca dos tipos de memória volátil, julgue o item.'
  if(n<=113)return 'Considerando o diagrama entidade-relacionamento de um sistema de aluguel de livros de uma repartição pública, julgue o item. O diagrama original está preservado na imagem da página 4.'
  return 'Acerca dos conceitos de bancos de dados, julgue o item.'
}
const decisions=raw.map(q=>{
  const n=Number(q.numero),topic=topics[n],answer=answers.get(n)
  if(!topic||!answer)throw Error(`Classificação ou gabarito ausente no item ${n}`)
  const page=Number(q.pagina),image=`paginas/${doc}-${String(page).padStart(4,'0')}.webp`
  const stems={
    51:'Em se tratando de gerenciamento de memória embasado em mapa de bites, tal mapa tem tamanho inversamente proporcional ao tamanho da unidade de alocação.',
    52:'Em um sistema operacional monolítico, todos os componentes necessários ao seu correto funcionamento são carregados no momento em que o computador é iniciado.',
    78:'O trabalho de uma GPU consiste em executar uma sequência de etapas relacionadas, entre outras, com a elaboração de elementos geométricos, aplicação de cores e inserção de efeitos.',
    79:'Uma GPU reduz o uso do processador principal do computador relacionado às tarefas de geração e processamento de imagens.',
    80:'A notação 8/N/1 em portas seriais determina que sejam transmitidos oito bites de dados, com paridade ímpar e um bite de CRC.',
    81:'Uma porta paralela (DB-25) é formada por dezessete linhas de sinal e oito linhas ligadas ao terra.',
    82:'Dispositivos RS-232 normalmente são classificados em DTE e DCE, o que permite definir quais fios em portas seriais irão enviar sinais de dados.',
    83:'Uma estrutura do tipo árvore é considerada binária se e somente se um conjunto infinito de elementos denominados nós existir.',
    84:'Nas estruturas de pilhas, a inserção de um novo item ou a remoção de um item já existente ocorre tanto na extremidade de baixo quanto no topo da pilha.',
    85:'Em uma lista linear, a inserção de um elemento é feita em uma extremidade e a eliminação, na outra. Esse tipo de estrutura também é conhecida como FIFO (first in, first out).',
    86:'Caso precise ser consultado em uma requisição DNS, um root server deverá indicar corretamente o servidor responsável por determinado domínio e seu endereço IP.',
    87:'Sendo um sistema de nome centralizado e hierárquico, o DNS faz uso do protocolo WWW para resolver um nome em um endereço IP.',
    88:'Registro DNS do tipo A (address) indica o endereço IP atribuído a determinado nome.',
    90:'Um firewall é capaz de verificar tanto o endereço IP de origem quanto o endereço IP de destino em um pacote de rede.',
    92:'Memórias do tipo SIMM de 30 vias ou 72 vias podem ser utilizadas em PCs padrão 386, 486 e Pentium.',
    110:'No modelo apresentado, um empréstimo contém vários itens, entretanto um item só pode estar contido em um único empréstimo.',
    111:'As entidades Usuário, Empréstimo e Livro são classificadas como fracas.',
    113:'Livro_Empréstimo é uma entidade associativa, composta pelas chaves das duas entidades principais, Livro e Empréstimo.',
    114:'Uma solução para evitar a redundância controlada de informações é o uso do compartilhamento de dados; dessa forma, cada informação é armazenada uma única vez.',
    115:'Em sistemas gerenciados de banco de dados, a independência dos dados refere-se à capacidade de modificar a estrutura lógica ou física do banco, sem a necessidade de uma reprogramação dos programas de aplicativos.'
  }[n]
  return {
    id:q.id,sha256_enunciado:hashRevisao(q.enunciado),materia:topic[0],conteudo:topic[1],ano:2016,
    concurso:exam,numero_original:n,pagina:page,dificuldade:topic[2],dificuldade_estimada:true,
    dificuldade_evidencia:'Estimativa editorial baseada na complexidade conceitual e no conhecimento prévio exigido; não é classificação oficial da banca.',
    classificacao_fonte:prova,
    motivo:`CEBRASPE — FUB 2016, Cargo 13 (Técnico de Tecnologia da Informação), item ${n}, página ${page}. Classificação temática e numeração cotejadas com a prova oficial; resposta comparada ao gabarito definitivo do cargo.`,
    enunciado:stems,texto_apoio:contexts(n),opcoes:['Certo','Errado'],resposta_correta:answer==='C'?0:1,anulada:false,
    gabarito_oficial:{fonte:chave,arquivo:'Gab_Definitivo_281FUB_013_01.pdf',sha256:keyHash,sha256_tipo:'sha256_da_transcricao_canonica_dos_itens_revisados; nao_e_hash_do_pdf',numero:n,pagina:1,resposta:answer,criterio:'Gabarito oficial definitivo do Cargo 13 — Técnico de Tecnologia da Informação; aplicação em 18/12/2016.'},
    apta_resolucao:true,
    remover_pendencias:['classificacao_especifica_pendente','gabarito_oficial_nao_vinculado','ano_sem_evidencia','enunciado_incompleto','alternativas_invalida','alternativa_vazia','texto_corrompido','texto_de_outro_bloco','visual_ausente'],
    visual:{pagina:page,imagem:image,motivo:`Imagem da página ${page} do caderno oficial vinculada após conferência; preserva o contexto visual e, na página 4, o diagrama entidade-relacionamento necessário aos itens 110, 111 e 113.`}
  }
})
if(decisions.length!==20||new Set(decisions.map(x=>x.id)).size!==20)throw Error('Contagem ou unicidade do pacote inconsistente')
for(const d of decisions)await fs.access(`public/acervo-extraido/${d.visual.imagem}`)
const report=await aplicarRevisoesIndividuais({nome,base:raizesAtuais[0],decisoes:decisions})
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md',`

## FUB 2016 — Cargo 13, Técnico de Tecnologia da Informação — v263

- Revisei 20 itens pendentes e classifiquei-os por matéria, conteúdo, ano, concurso e dificuldade estimada: sistemas operacionais, arquitetura e hardware, redes, estruturas de dados, segurança da informação e banco de dados.
- Removi contaminação de OCR e texto de outros itens dos enunciados, incluindo a continuação indevida anexada ao item 82 e o bloco “Espaço livre” e cabeçalho subsequente anexados ao item 88. Mantive os comandos comuns como texto de apoio e corrigi a redação dos itens para corresponder ao caderno.
- Vinculei o gabarito definitivo do Cargo 13, com os itens 110–115 ligados ao contexto e ao diagrama ER da página 4. Imagens das páginas originais foram mantidas para os 20 itens.
- Alteração local, não publicada na nuvem.
- Fontes oficiais: [caderno do Cargo 13](<${prova}>), [gabarito definitivo](<${chave}>), [página oficial do concurso](https://cdn.cebraspe.org.br/concursos/FUB_16_1/).
`)
console.log(JSON.stringify({...report,documento:doc,revisadas:20,publicacao:'local'},null,2))
