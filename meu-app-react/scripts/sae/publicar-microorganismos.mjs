import {publicarLote} from './publicar-lote.mjs'
const definicoes=[
 ['695c1076ba77cf5c87d7e6de','Vírus e fungos'],
 ['695c1076ba77cf5c87d7e6df','Bactérias e arqueas'],
 ['695c1076ba77cf5c87d7e6e0','Algas e protozoários'],
]
const conflitos=new Map([
 ['sae-c811133f41e83e0bcb00','A afirmação II generaliza a origem meiótica dos esporos; necessária conferência da redação e da chave na prova.'],
 ['sae-7690ed65d094d407e029','Alternativas A e B idênticas no material; conferir caderno original antes de corrigir.'],
 ['sae-7bc2a347441167224669','Uso de vetor biológico para o rato na leptospirose requer conferência; reservatório e vetor não são equivalentes.'],
 ['sae-52e0372f4559b90e6157','O apoio contém o literal undefined; conferir imagens e legendas na fonte original.'],
 ['sae-40a97335ef2753db8582','Alternativa marcada menciona fezes do parasita em vez de fezes do inseto vetor.'],
 ['sae-305e105c8991cb83bfe2','Hierarquia das vias de transmissão sem data de referência: não publicar como orientação epidemiológica atual.'],
 ['sae-c4b7bc0fec39867a63e9','A chave A descreve dinoflagelados; o enunciado pede clorofíceas. Há ainda comando de outro exercício no final.'],
])
publicarLote({pasta:'estudo-biologia-microorganismos',definicoes,conflitos})
