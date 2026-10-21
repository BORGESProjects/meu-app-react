import {publicarLote} from './publicar-lote.mjs'
const conflitos=new Map([
 ['sae-4d8d1c6cb78cd35048f7','A chave V-F-F contradiz a sequência dos itens: apitos de trens não antecedem relógios mecânicos e ciclos agrícolas medem passagem do tempo. Conferir prova UFSM 2015.'],
 ['sae-94a61c769f1ca043a23b','A alternativa marcada atribui a cavalos os carros do Estandarte de Ur; a identificação dos animais requer conferência da imagem e da redação oficial.'],
 ['sae-6be1eb9e6d99cda65c7e','Texto introdutório situa o túmulo de Tutancâmon em uma pirâmide e traz datas que requerem conferência no caderno oficial.'],
])
const introdutorias=new Set([1,6,7,11,12,13,15,16,17])
publicarLote({pasta:'estudo-historia-antiga',definicoes:[['695c109158c12211ab3b1bda','Civilizações da Antiguidade']],conflitos,apoioIntegradoIds:new Set(['sae-c3ec54b6afb7ec0ab4a9']),conteudoPara:q=>introdutorias.has(q.numero_livro)?'Introdução à História':'Civilizações da Antiguidade'})
