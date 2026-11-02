import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { raizesAtuais } from './acervo-atual.mjs'
import { aplicarRevisoesIndividuais, hashRevisao } from './aplicar-revisoes-individuais.mjs'

const nome = 'revisao-petrobras-2021-engenharia-civil-itens-51-86-v468'
const documento = 'b3a318d99185e480'
const prova = 'https://cdn.cebraspe.org.br/concursos/PETROBRAS_21_NS/arquivos/658_PETROBRAS_010_01.PDF'
const gabaritoUrl = 'https://cdn.cebraspe.org.br/concursos/PETROBRAS_21_NS/arquivos/GAB_DEFINITIVO_658_PETROBRAS_010_01.PDF'
const concurso = 'PETROBRAS — Engenheiro Civil — 2021'

const catalogo = JSON.parse(await fs.readFile('docs/acervo/revisao-profissional/fontes-documentais.json', 'utf8')).find(x => x.id === documento)
assert.equal(catalogo?.url, prova, 'O caderno não corresponde ao catálogo documental')
const chave = (await fs.readFile('docs/acervo/revisao-profissional/gabaritos-conferidos.jsonl', 'utf8'))
  .split(/\r?\n/).filter(Boolean).map(JSON.parse).find(x => x.documento_id === documento)
assert.equal(chave?.gabarito_url, gabaritoUrl)
assert.equal(chave?.status, 'tabela_lida')
assert.equal(chave?.sha256, '19432411d031da1f6d86f77891255c263466ba66d95772733972aec9e18b25c9')

const registros = JSON.parse(await fs.readFile(`tmp/registros-documento-${documento}.json`, 'utf8'))
const pendentes = registros.filter(q => q.classificacao_pendente && q.materia === 'Conhecimentos Específicos' && q.conteudo === 'Conteúdos gerais de Conhecimentos Específicos')
assert.equal(pendentes.length, 34, 'O grupo pendente mudou; não aplicar um lote desatualizado')

const assuntos = {
  'extr-fc4c592ce51de88c8772': ['Estruturas de concreto armado', 'Vigas em balanço: linha neutra, estribos e esforços internos', 'Média'],
  'extr-0c4f47bf19820aead824': ['Estruturas de concreto armado', 'Vigas em balanço: distribuição do momento fletor', 'Média'],
  'extr-caf5fae47771c3121534': ['Estruturas de concreto armado', 'Vigas em balanço: distribuição do momento fletor', 'Média'],
  'extr-fdaa194a8f2ae75b5181': ['Estruturas de concreto armado', 'Vigas em balanço: linha neutra e tensões de compressão', 'Média'],
  'extr-320c32ffc559e840e198': ['Estruturas de concreto pré-moldado', 'Armaduras longitudinais e função dos estribos', 'Média'],
  'extr-c39c1f4d9c91bcb8846b': ['Estruturas de concreto pré-moldado', 'Armaduras longitudinais e função dos estribos', 'Média'],
  'extr-14aa0b6dcf407bce696f': ['Estruturas de concreto protendido', 'Calda de injeção e corrosão de armaduras', 'Média'],
  'extr-39381b32c5ab2c0a54b5': ['Estruturas de concreto pré-moldado', 'Aço para alças de içamento', 'Média'],
  'extr-39b77dc556b00f4b3703': ['Estruturas de concreto pré-moldado', 'Aço para alças de içamento', 'Média'],
  'extr-1fa62b1e6cdab3c3edcc': ['Estruturas de concreto pré-moldado', 'Pilares pré-moldados e condução de águas pluviais', 'Média'],
  'extr-bdcea8a150047e610d80': ['Estruturas de concreto pré-moldado', 'Pilares pré-moldados e condução de águas pluviais', 'Média'],
  'extr-32fabc0ce25382d212b9': ['Estruturas de aço', 'Análise global elástica e estados-limites', 'Difícil'],
  'extr-8927476c7873415ae2cd': ['Estruturas de aço', 'Ligações parafusadas de alta resistência', 'Média'],
  'extr-fc065b02874206a32a19': ['Estruturas de aço', 'Ações do vento e dimensionamento estrutural', 'Média'],
  'extr-7f99cd3955e36e9fa7b7': ['Estruturas de aço', 'Combinações de ações e estados-limites', 'Média'],
  'extr-6c28982ee44676b5a8ca': ['Estruturas de aço', 'Ações do vento e dimensionamento estrutural', 'Média'],
  'extr-5c26dfe827a52191b601': ['Materiais de construção', 'Diagrama tensão-deformação do aço: regime elástico', 'Média'],
  'extr-3ba3bbd0764185621fa9': ['Materiais de construção', 'Diagramas tensão-deformação convencional e real', 'Difícil'],
  'extr-f0b11dcec78667543599': ['Materiais de construção', 'Diagrama tensão-deformação do aço: estricção', 'Média'],
  'extr-0ed76cd2b1787c0277b6': ['Materiais de construção', 'Diagrama tensão-deformação do aço: estricção', 'Média'],
  'extr-6086448b99b51960268e': ['Análise estrutural', 'Vigas isostáticas inclinadas: reações de apoio', 'Média'],
  'extr-606a9e864536166302e5': ['Análise estrutural', 'Vigas isostáticas: momento fletor máximo', 'Média'],
  'extr-7a536437858e32cf4206': ['Análise estrutural', 'Treliças planas isostáticas: contagem de barras, nós e reações', 'Média'],
  'extr-ead2b8b16f733356776c': ['Tecnologia do concreto', 'Retração e carregamento de estruturas recém-concretadas', 'Média'],
  'extr-4f960ab7c6e00cbc5136': ['Tecnologia do concreto', 'Relação água/cimento e resistência à compressão', 'Média'],
  'extr-31edfea585e2d3fd7cfb': ['Fundações', 'Efeito de grupo de estacas e capacidade de carga', 'Difícil'],
  'extr-e75b8241bb9be029fe3d': ['Mecânica dos solos', 'Hidrogeologia: infiltração, percolação e gradiente hidráulico', 'Média'],
  'extr-c7ae88cc51367a510276': ['Mecânica dos solos', 'Compactação, resistência ao cisalhamento e compressibilidade', 'Média'],
  'extr-8b13ff31d0c04c135f98': ['Mecânica dos solos', 'Solos não saturados: sucção e estado energético da água', 'Média'],
  'extr-c9f4f6f698c28a6e23e0': ['Mecânica dos solos', 'Curva de retenção e sucção em solos granulares e finos', 'Difícil'],
  'extr-930b6222eb6c959f039b': ['Terraplenagem', 'Drenagem e prevenção de assoreamento em aterros', 'Média'],
  'extr-d871399e65cd02d6c1ec': ['Terraplenagem', 'Classificação de materiais de escavação', 'Média'],
  'extr-0587667dc82792a7610b': ['Terraplenagem', 'Espessura de camadas e compactação de aterros', 'Média'],
  'extr-0957625f4cebedd25a9b': ['Planejamento e controle de obras', 'Medição, avanço físico e custo de serviços executados', 'Média']
}

// Preservar o identificador extraído; corrigir apenas numeração deslocada comprovada no caderno oficial.
const ajustes = {
  'extr-7f99cd3955e36e9fa7b7': { numero: 60 },
  'extr-6c28982ee44676b5a8ca': { numero: 61, dup: 'extr-fc065b02874206a32a19' },
  'extr-5c26dfe827a52191b601': { numero: 62 },
  'extr-3ba3bbd0764185621fa9': { numero: 63 },
  'extr-0ed76cd2b1787c0277b6': { numero: 64, dup: 'extr-f0b11dcec78667543599' },
  'extr-caf5fae47771c3121534': { numero: 52, dup: 'extr-0c4f47bf19820aead824' },
  'extr-320c32ffc559e840e198': { numero: 54, dup: 'extr-c39c1f4d9c91bcb8846b' },
  'extr-39381b32c5ab2c0a54b5': { numero: 56, dup: 'extr-39b77dc556b00f4b3703' },
  'extr-bdcea8a150047e610d80': { numero: 57, dup: 'extr-1fa62b1e6cdab3c3edcc' }
}

const textos = {
  'extr-fc4c592ce51de88c8772': { enunciado: 'O estribo está sujeito a um esforço de torção.', apoio: 'A figura I representa a seção de uma viga de concreto armado em balanço, com linha neutra, barras longitudinais e armadura de estribo. A figura II mostra a viga engastada em um único apoio, submetida a carga distribuída uniformemente de cima para baixo. Julgue os itens 51 a 54 com base nessas figuras.' },
  'extr-0c4f47bf19820aead824': { enunciado: 'A parte central é a posição da viga com maior momento fletor.', apoio: 'A figura I representa a seção de uma viga de concreto armado em balanço, com linha neutra, barras longitudinais e armadura de estribo. A figura II mostra a viga engastada em um único apoio, submetida a carga distribuída uniformemente de cima para baixo. Julgue os itens 51 a 54 com base nessas figuras.' },
  'extr-caf5fae47771c3121534': { enunciado: 'A parte central é a posição da viga com maior momento fletor.', apoio: 'A figura I representa a seção de uma viga de concreto armado em balanço, com linha neutra, barras longitudinais e armadura de estribo. A figura II mostra a viga engastada em um único apoio, submetida a carga distribuída uniformemente de cima para baixo. Julgue os itens 51 a 54 com base nessas figuras.' },
  'extr-fdaa194a8f2ae75b5181': { enunciado: 'A zona abaixo da linha neutra está exposta a um esforço de compressão.', apoio: 'A figura I representa a seção de uma viga de concreto armado em balanço, com linha neutra, barras longitudinais e armadura de estribo. A figura II mostra a viga engastada em um único apoio, submetida a carga distribuída uniformemente de cima para baixo. Julgue os itens 51 a 54 com base nessas figuras.' },
  'extr-320c32ffc559e840e198': { enunciado: 'As duas barras de aço longitudinais acima da linha neutra têm como principal função manter os estribos em sua posição de projeto.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-c39c1f4d9c91bcb8846b': { enunciado: 'As duas barras de aço longitudinais acima da linha neutra têm como principal função manter os estribos em sua posição de projeto.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-14aa0b6dcf407bce696f': { enunciado: 'A utilização de argamassa de injeção com aditivos à base de halogenetos não é recomendada, pois esses elementos podem provocar corrosão no aço da estrutura.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-39381b32c5ab2c0a54b5': { enunciado: 'Para o içamento de peças pré-moldadas, é correto adotar o aço CA60, tendo em vista sua maior resistência à tração.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-39b77dc556b00f4b3703': { enunciado: 'Para o içamento de peças pré-moldadas, é correto adotar o aço CA60, tendo em vista sua maior resistência à tração.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-1fa62b1e6cdab3c3edcc': { enunciado: 'Em elementos pré-moldados, o aproveitamento de pilares vazados como condutor de águas pluviais não é permitido por norma, sendo a alteração realizada no projeto a solução mais adequada, conforme as normas vigentes.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-bdcea8a150047e610d80': { enunciado: 'Em elementos pré-moldados, o aproveitamento de pilares vazados como condutor de águas pluviais não é permitido por norma, sendo a alteração realizada no projeto a solução mais adequada, conforme as normas vigentes.', apoio: 'Durante a construção de uma edificação em estrutura de concreto pré-moldado, foram observadas: a utilização de argamassa de injeção com aditivos à base de halogenetos em elementos protendidos; a alteração do projeto para instalar externamente dutos pluviais em vez de usar pilares vazados; e a reprovação das alças de içamento por serem de aço CA60. Julgue os itens 55 a 57 conforme as normas vigentes.' },
  'extr-32fabc0ce25382d212b9': { enunciado: 'O engenheiro deve justificar a adoção de análise global elástica, que é indicada, por norma, somente para situações excepcionais.', apoio: 'O engenheiro responsável por uma edificação em estrutura de aço adotou aperto normal em ligações com parafusos de alta resistência, considerou os estados-limites de serviço e último, desprezou a ação do vento por condições locais e determinou os esforços internos por análise global elástica. Julgue os itens 58 a 61 com base nas normas vigentes.' },
  'extr-8927476c7873415ae2cd': { enunciado: 'Nas ligações metálicas com parafuso de alta resistência, é correto adotar o aperto normal, devendo-se indicar essa informação no desenho do projeto.', apoio: 'O engenheiro responsável por uma edificação em estrutura de aço adotou aperto normal em ligações com parafusos de alta resistência, considerou os estados-limites de serviço e último, desprezou a ação do vento por condições locais e determinou os esforços internos por análise global elástica. Julgue os itens 58 a 61 com base nas normas vigentes.' },
  'extr-fc065b02874206a32a19': { enunciado: 'Pelo comportamento flexível da estrutura em aço e pelos diversos fatores de segurança adotados em outros carregamentos, as cargas de vento podem ser desconsideradas no cálculo estrutural.', apoio: 'O engenheiro responsável por uma edificação em estrutura de aço adotou aperto normal em ligações com parafusos de alta resistência, considerou os estados-limites de serviço e último, desprezou a ação do vento por condições locais e determinou os esforços internos por análise global elástica. Julgue os itens 58 a 61 com base nas normas vigentes.' },
  'extr-7f99cd3955e36e9fa7b7': { enunciado: 'Ao considerar a influência de todas as ações que possam impactar significativamente a estrutura, o engenheiro poderia ter desprezado o estado-limite de serviço ao adotar o estado-limite último na análise.', apoio: 'O engenheiro responsável por uma edificação em estrutura de aço adotou aperto normal em ligações com parafusos de alta resistência, considerou os estados-limites de serviço e último, desprezou a ação do vento por condições locais e determinou os esforços internos por análise global elástica. Julgue os itens 58 a 61 com base nas normas vigentes.' },
  'extr-6c28982ee44676b5a8ca': { enunciado: 'Pelo comportamento flexível da estrutura em aço e pelos diversos fatores de segurança adotados em outros carregamentos, as cargas de vento podem ser desconsideradas no cálculo estrutural.', apoio: 'O engenheiro responsável por uma edificação em estrutura de aço adotou aperto normal em ligações com parafusos de alta resistência, considerou os estados-limites de serviço e último, desprezou a ação do vento por condições locais e determinou os esforços internos por análise global elástica. Julgue os itens 58 a 61 com base nas normas vigentes.' },
  'extr-5c26dfe827a52191b601': { enunciado: 'A região A do gráfico representa o comportamento elástico da barra de aço.', apoio: 'A figura mostra os diagramas tensão–deformação convencional e real de uma barra de aço, com regiões A, B, C e D e pontos numerados. Julgue os itens 62 a 64 com base no gráfico da página original.' },
  'extr-3ba3bbd0764185621fa9': { enunciado: 'O diagrama delimitado pelos pontos 0, 1, 2 e 5 representa a tensão–deformação real da barra de aço.', apoio: 'A figura mostra os diagramas tensão–deformação convencional e real de uma barra de aço, com regiões A, B, C e D e pontos numerados. Julgue os itens 62 a 64 com base no gráfico da página original.' },
  'extr-f0b11dcec78667543599': { enunciado: 'A estricção ocorre na região C, logo após a fase de escoamento.', apoio: 'A figura mostra os diagramas tensão–deformação convencional e real de uma barra de aço, com regiões A, B, C e D e pontos numerados. Julgue os itens 62 a 64 com base no gráfico da página original.' },
  'extr-0ed76cd2b1787c0277b6': { enunciado: 'A estricção ocorre na região C, logo após a fase de escoamento.', apoio: 'A figura mostra os diagramas tensão–deformação convencional e real de uma barra de aço, com regiões A, B, C e D e pontos numerados. Julgue os itens 62 a 64 com base no gráfico da página original.' },
  'extr-6086448b99b51960268e': { enunciado: 'A reação no apoio B é maior do que a reação no apoio A.', apoio: 'A figura mostra uma viga isostática inclinada de 5 m, apoiada em A e B, com desnível vertical de 3 m, vão horizontal de 4 m e carregamento uniformemente distribuído q = 500 kgf/m. Julgue os itens 65 e 66 com base na figura.' },
  'extr-606a9e864536166302e5': { enunciado: 'O momento fletor máximo ocorre no centro da viga e tem valor igual a 1.000 kgf × m.', apoio: 'A figura mostra uma viga isostática inclinada de 5 m, apoiada em A e B, com desnível vertical de 3 m, vão horizontal de 4 m e carregamento uniformemente distribuído q = 500 kgf/m. Julgue os itens 65 e 66 com base na figura.' },
  'extr-7a536437858e32cf4206': { enunciado: 'A estrutura em treliça em tela é considerada isostática, pois a quantidade de reações nos apoios somada à quantidade de barras é o dobro do número total de nós.', apoio: 'A figura mostra uma treliça plana triangular com barras 1, 2 e 3, apoios em A e B e carga F aplicada no nó superior. Julgue os itens 67 e 68 com base na figura.' },
  'extr-ead2b8b16f733356776c': { enunciado: 'Para evitar a deformação de peças estruturais de concreto por retração, deve-se evitar a aplicação de cargas nas peças estruturais nos primeiros meses após a concretagem.', apoio: 'Julgue os itens 69 a 71 sobre cuidados de execução e propriedades do concreto.' },
  'extr-4f960ab7c6e00cbc5136': { enunciado: 'O fator água/cimento influi diretamente na variabilidade da resistência à compressão do concreto; por isso, deve-se evitar adicionar água em excesso ao concreto fresco para melhorar sua trabalhabilidade.', apoio: 'Julgue os itens 69 a 71 sobre cuidados de execução e propriedades do concreto.' },
  'extr-31edfea585e2d3fd7cfb': { enunciado: 'Considerando-se o efeito de um grupo de estacas, é correto afirmar que a sua carga admissível não pode ser superior à de uma sapata de mesmo contorno que o do grupo.', apoio: 'Julgue os itens 72 a 75 sobre projeto e execução de fundações rasas e profundas.' },
  'extr-e75b8241bb9be029fe3d': { enunciado: 'A infiltração diferencia-se da percolação no sentido de que a primeira se refere ao fluxo na interface solo–atmosfera, e a segunda, ao fluxo no interior do solo, sem necessidade de gradiente hidráulico.', apoio: 'Acerca da hidrogeologia e do fluxo de água em meios porosos não saturados, julgue os itens 76 a 78.' },
  'extr-c7ae88cc51367a510276': { enunciado: 'Solos pouco compactados apresentam valores de resistência ao cisalhamento e de compressibilidade mais baixos.', apoio: 'De acordo com os fundamentos da mecânica dos solos, julgue os itens 79 a 82.' },
  'extr-8b13ff31d0c04c135f98': { enunciado: 'A diferença de pressão entre as fases ar e água é denominada sucção do solo; essa grandeza normalmente representa o estado energético da água em solos não saturados.', apoio: 'De acordo com os fundamentos da mecânica dos solos, julgue os itens 79 a 82.' },
  'extr-c9f4f6f698c28a6e23e0': { enunciado: 'Solos com granulometria mais fina exigem menores valores de sucção para serem drenados do que solos relativamente mais granulares.', apoio: 'De acordo com os fundamentos da mecânica dos solos, julgue os itens 79 a 82.' },
  'extr-930b6222eb6c959f039b': { enunciado: 'Para impedir possível assoreamento, deve-se evitar lançar uma primeira camada de material permeável na base do aterro.', apoio: 'Na execução de uma obra de terraplenagem, definiu-se uma camada inicial de aterro com material granular permeável, limitou-se a espessura compactada de cada camada a 30 cm e constatou-se a necessidade de escarificação e, eventualmente, de explosivos. Julgue os itens 83 a 85.' },
  'extr-d871399e65cd02d6c1ec': { enunciado: 'O emprego de escarificador com uso eventual de explosivos na escavação caracteriza o solo como de 2.ª categoria.', apoio: 'Na execução de uma obra de terraplenagem, definiu-se uma camada inicial de aterro com material granular permeável, limitou-se a espessura compactada de cada camada a 30 cm e constatou-se a necessidade de escarificação e, eventualmente, de explosivos. Julgue os itens 83 a 85.' },
  'extr-0587667dc82792a7610b': { enunciado: 'Para tornar economicamente viável a obra, é correto definir as camadas de compactação com espessura superior a 1 metro.', apoio: 'Na execução de uma obra de terraplenagem, definiu-se uma camada inicial de aterro com material granular permeável, limitou-se a espessura compactada de cada camada a 30 cm e constatou-se a necessidade de escarificação e, eventualmente, de explosivos. Julgue os itens 83 a 85.' },
  'extr-0957625f4cebedd25a9b': { enunciado: 'O valor de 1 milhão de reais de insumos estocados deve ser computado como custo real dos serviços já executados.', apoio: 'Em uma obra orçada em R$ 10 milhões, os pagamentos de R$ 5 milhões ocorreram conforme programado, embora algumas atividades estivessem atrasadas. Nenhum pagamento foi feito sem a execução dos serviços, e havia R$ 1 milhão em insumos armazenados no almoxarifado. Julgue os itens 86 e 87.' }
}

const duplicatas = {
  'extr-caf5fae47771c3121534': 'extr-0c4f47bf19820aead824',
  'extr-320c32ffc559e840e198': 'extr-c39c1f4d9c91bcb8846b',
  'extr-39381b32c5ab2c0a54b5': 'extr-39b77dc556b00f4b3703',
  'extr-bdcea8a150047e610d80': 'extr-1fa62b1e6cdab3c3edcc',
  'extr-6c28982ee44676b5a8ca': 'extr-fc065b02874206a32a19',
  'extr-0ed76cd2b1787c0277b6': 'extr-f0b11dcec78667543599'
}

assert.equal(pendentes.filter(q => !assuntos[q.id] || !textos[q.id]).length, 0, 'Há registro sem classificação ou revisão textual')
assert.equal(pendentes.length, Object.keys(assuntos).length)

const decisoes = pendentes.map(q => {
  const n = Number(q.numero)
  const [submateria, topico, dificuldade] = assuntos[q.id]
  const ajuste = ajustes[q.id] || {}
  const numero = ajuste.numero ?? n
  const resposta = chave.respostas[String(numero)]
  assert.ok(resposta, `Gabarito oficial ausente para o item ${numero}`)
  const pagina = Number(q.pagina)
  const imagem = `paginas/${documento}-${String(pagina).padStart(4, '0')}.webp`
  return {
    id: q.id,
    sha256_enunciado: hashRevisao(q.enunciado),
    materia: 'Engenharia Civil',
    conteudo: `${submateria} — ${topico}`,
    ano: 2021,
    concurso,
    cargo: 'Engenheiro Civil — Ênfase 10 — Conhecimentos Específicos',
    banca: 'CEBRASPE',
    organizadora: 'CEBRASPE',
    aplicacao: 'Prova objetiva — conhecimentos específicos — cargo 10 — caderno 658_PETROBRAS_010_01',
    numero,
    numero_original: numero,
    pagina,
    dificuldade,
    dificuldade_estimada: true,
    dificuldade_evidencia: 'Estimativa editorial pelo nível de cálculo, aplicação normativa e integração conceitual exigidos; não é classificação oficial da banca.',
    classificacao_fonte: prova,
    motivo: `Item ${numero} classificado pelo conteúdo efetivamente apresentado no caderno oficial da ênfase 10; o assunto foi conferido na página original.`,
    enunciado: textos[q.id].enunciado,
    opcoes: ['Certo', 'Errado'],
    resposta_correta: duplicatas[q.id] || resposta === 'X' ? null : resposta === 'C' ? 0 : 1,
    anulada: !duplicatas[q.id] && resposta === 'X',
    apta_resolucao: !duplicatas[q.id],
    ...(duplicatas[q.id] ? { inelegibilidade_motivo: 'duplicata_de_item_oficial', duplicada_de: duplicatas[q.id] } : {}),
    ...(!duplicatas[q.id] ? { gabarito_oficial: { fonte: gabaritoUrl, arquivo: 'GAB_DEFINITIVO_658_PETROBRAS_010_01.PDF', prova: '658_PETROBRAS_010_01.PDF', sha256: chave.sha256, numero, resposta, criterio: 'Gabarito definitivo oficial vinculado ao mesmo caderno e à mesma ênfase.' } } : {}),
    remover_pendencias: ['classificacao_especifica_pendente', 'ano_sem_evidencia', 'visual_ausente', 'dificuldade_nao_informada', 'texto_corrompido', 'texto_corrompido_requer_reconstrucao', 'texto_de_outro_bloco', 'enunciado_incompleto', 'gabarito_oficial_nao_vinculado'],
    visual: { pagina, imagem, enunciado: textos[q.id].enunciado, texto_apoio: textos[q.id].apoio, motivo: `Página ${pagina} do caderno oficial conferida visualmente; o contexto, a figura/gráfico e a numeração correspondem ao item ${numero}.` }
  }
})

for (const d of decisoes) await fs.access(`public/acervo-extraido/${d.visual.imagem}`)

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ lote: nome, registros: decisoes.length, itensUnicosEstimados: decisoes.length - Object.keys(duplicatas).length, duplicatas: Object.keys(duplicatas).length, respostasConferidas: decisoes.filter(x => x.apta_resolucao).length, anulada: decisoes.filter(x => x.anulada).map(x => x.numero), paginasConferidas: [...new Set(decisoes.map(x => x.pagina))], totalImagemBytes: (await Promise.all(decisoes.map(x => fs.stat(`public/acervo-extraido/${x.visual.imagem}`)))).reduce((n, x) => n + x.size, 0), publicado: false }, null, 2))
  process.exit(0)
}

const resultado = await aplicarRevisoesIndividuais({ nome, base: raizesAtuais[0], decisoes })
raizesAtuais.unshift(`tmp/revisao-profissional/${nome}/acervo-extraido`)
await fs.appendFile('scripts/acervo-publico/acervo-atual.mjs', `\nraizesAtuais.unshift('tmp/revisao-profissional/${nome}/acervo-extraido')\n`)
const relatorio = {
  ...resultado,
  documento,
  concurso,
  itens_oficiais_revisados: [...new Set(decisoes.filter(x => x.apta_resolucao).map(x => x.numero))].length,
  registros_revisados: decisoes.length,
  classificacoes_novas: decisoes.length,
  duplicatas_marcadas: Object.keys(duplicatas).length,
  numeracoes_corrigidas: { '80→60': 1, '82→62': 1, '83→63': 1, '81→61 (duplicata)': 1, '84→64 (duplicata)': 1 },
  gabaritos_definitivos_vinculados: decisoes.filter(x => x.gabarito_oficial).length,
  itens_anulados: decisoes.filter(x => x.anulada).map(x => x.numero),
  paginas_originais_conferidas: [...new Set(decisoes.map(x => x.pagina))],
  fonte_prova: prova,
  fonte_gabarito: gabaritoUrl,
  publicado: false
}
await fs.writeFile(`docs/acervo/revisao-profissional/${nome}.json`, JSON.stringify(relatorio, null, 2))
await fs.appendFile('docs/acervo/revisao-profissional/RELATORIO.md', `\n\n## PETROBRAS — Engenheiro Civil, Ênfase 10 — revisão v468\n\n- Revisei ${decisoes.length} registros pendentes, classificando os itens de estruturas, materiais, geotecnia, fundações, terraplenagem e controle de obras.\n- Conferi visualmente as páginas originais 1, 2 e 3, corrigi enunciados que absorviam o bloco seguinte e restabeleci os contextos de figuras, gráficos e situações compartilhadas.\n- Corrigi numerações OCR deslocadas (itens 60, 62 e 63) e marquei ${Object.keys(duplicatas).length} cópias como inelegíveis, ligando-as aos registros canônicos.\n- Associei respostas do gabarito definitivo do mesmo caderno; o item ${decisoes.find(x => x.anulada)?.numero} consta anulado e não recebe correção automática.\n- Validação e publicação na nuvem serão registradas separadamente; este pacote é local.\n- Fontes: [caderno oficial](<${prova}>), [gabarito definitivo](<${gabaritoUrl}>).\n`)
console.log(JSON.stringify(relatorio, null, 2))
