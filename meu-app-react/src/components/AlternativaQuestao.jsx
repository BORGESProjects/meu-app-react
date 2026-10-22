import {recursoLocal} from '../plataforma'
import { formatarTextoAlternativa, imagemDaAlternativa } from '../textoQuestao'
import BlocosQuestao from './BlocosQuestao'

export default function AlternativaQuestao({ questao, indice, texto }) {
  const imagem = imagemDaAlternativa(questao, indice)
  return imagem
    ? <img src={recursoLocal(imagem)} alt={questao.opcoes_texto_corrompido?.[indice] ? `Alternativa ${questao.rotulos_opcoes?.[indice] || String.fromCharCode(65 + indice)}` : texto} loading="lazy" className={`max-w-full w-auto h-auto ${questao.banca === 'UEM' ? '' : 'max-h-80'} rounded-lg bg-white p-2`} />
    : questao.blocos_opcoes?.[indice] ? <BlocosQuestao inline blocos={questao.blocos_opcoes[indice]}/> : <span className="block w-full whitespace-pre-line leading-relaxed">{formatarTextoAlternativa(texto)}</span>
}
