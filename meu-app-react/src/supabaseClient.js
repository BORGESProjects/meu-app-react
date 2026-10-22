import { createClient } from '@supabase/supabase-js'
import {aplicativoNativo,esquecerConta} from './plataforma'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export function sairDaConta() {
  if(aplicativoNativo)esquecerConta()
  return supabase.auth.signOut(aplicativoNativo?{scope:'local'}:undefined)
}
