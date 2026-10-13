export const ESPECIFICAS_UEM = ['Arte', 'Biologia', 'Educação Física', 'Filosofia', 'Física', 'Geografia', 'História', 'Matemática', 'Química', 'Sociologia']

export function incluirNoSimuladoUem(questao, idioma, especificas) {
  if (questao.banca !== 'UEM') return true
  if (questao.idioma && questao.idioma !== idioma) return false
  return !questao.bloco_especifico || especificas.includes(questao.bloco_especifico)
}
