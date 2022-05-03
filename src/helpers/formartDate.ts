import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate=(value:string)=>{
 return  format(
    new Date(),"dd MMMM yyyy",{
      locale: ptBR
    }
  )
}