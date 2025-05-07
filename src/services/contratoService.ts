// src/services/ContratoService.ts
import supabase from '@/config/supabase'
import Contrato from '@/models/Contrato'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'
import { useStoreProfissional } from '@/stores/storeProfissional'

export class ContratoService {
  private showError = useShowErrorMessage().showError
  private profissionalStore = useStoreProfissional()

  async loadContratos(idCliente: string): Promise<Contrato[]> {
    try {
      const { data, error } = await supabase
        .from('tb_contrato')
        .select('*')
        .eq('id_cliente', idCliente)

      if (error) throw error
      return data as Contrato[]
    } catch (err: any) {
      this.showError(err.message || 'Erro ao carregar contratos')
      return []
    }
  }

  async addContrato(contrato: Contrato): Promise<void> {
    try {
      contrato.idProfissional = this.profissionalStore.profissionalDetails?.id || ''
      const {data, error } = await supabase
        .from('tb_contrato')
        .insert([contrato])

      if (error) throw error
      return data.id_contrato;
    } catch (err: any) {
      this.showError(err.message || 'Erro ao adicionar contrato')
    }
  }

  async deleteContrato(idContrato: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tb_contrato')
        .delete()
        .eq('id_contrato', idContrato)
      if (error) throw error
    } catch (err: any) {
      this.showError(err.message || 'Erro ao remover contrato')
    }
  }
}
