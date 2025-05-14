import supabase from '@/config/supabase'
import Configuracao from '@/models/Configuracao'
import ConfigFeriado from '@/models/ConfigFeriado'
import ConfigWhatsapp from '@/models/ConfigWhatsapp'
import { useShowErrorMessage } from '@/userCases/useShowErrorMessage'

const { showError } = useShowErrorMessage()

export default class ConfigService {
  async getConfiguracao(idProfissional: string): Promise<Configuracao | null> {
    try {
      const { data, error } = await supabase
        .from('tb_config')
        .select('*')
        .eq('id_profissional', idProfissional)
        .single()

      if (error) {
        // Se não encontrou configuração, cria uma nova
        if (error.code === 'PGRST116') {
          return await this.createConfiguracao(idProfissional)
        }
        throw error
      }
      return data as Configuracao
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao buscar configurações')
      }
      return null
    }
  }

  async createConfiguracao(idProfissional: string): Promise<Configuracao | null> {
    try {
      const { data, error } = await supabase
        .from('tb_config')
        .insert([{ id_profissional: idProfissional }])
        .select()
        .single()

      if (error) throw error
      return data as Configuracao
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao criar configurações')
      }
      return null
    }
  }

  // Métodos para Feriados
  async getFeriados(idConfig: string): Promise<ConfigFeriado[]> {
    try {
      const { data, error } = await supabase
        .from('tb_config_feriado')
        .select('*')
        .eq('id_config', idConfig)

      if (error) throw error
      return data as ConfigFeriado[]
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao buscar feriados')
      }
      return []
    }
  }

  async addFeriado(feriado: Partial<ConfigFeriado>): Promise<ConfigFeriado | null> {
    try {
      const { data, error } = await supabase
        .from('tb_config_feriado')
        .insert([feriado])
        .select()
        .single()

      if (error) throw error
      return data as ConfigFeriado
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao adicionar feriado')
      }
      return null
    }
  }

  async updateFeriado(feriado: ConfigFeriado): Promise<ConfigFeriado | null> {
    try {
      const { data, error } = await supabase
        .from('tb_config_feriado')
        .update({
          label: feriado.label,
          data: feriado.data
        })
        .eq('id', feriado.id)
        .select()
        .single()

      if (error) throw error
      return data as ConfigFeriado
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar feriado')
      }
      return null
    }
  }

  async deleteFeriado(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tb_config_feriado')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao remover feriado')
      }
      return false
    }
  }

  // Métodos para Mensagens WhatsApp
  async getMensagensWhatsapp(idConfig: string): Promise<ConfigWhatsapp | null> {
    try {
      const { data, error } = await supabase
        .from('tb_config_whatsapp')
        .select('*')
        .eq('id_config', idConfig)
        .single()

      if (error) throw error
      return data as ConfigWhatsapp
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao buscar mensagens do WhatsApp')
      }
      return null
    }
  }

  async updateMensagensWhatsapp(mensagens: ConfigWhatsapp): Promise<ConfigWhatsapp | null> {
    try {
      const { data, error } = await supabase
        .from('tb_config_whatsapp')
        .upsert({
          id: mensagens.id,
          id_config: mensagens.idConfig,
          mensagem_cobranca: mensagens.mensagemCobranca,
          mensagem_confirmacao: mensagens.mensagemConfirmacao
        })
        .select()
        .single()

      if (error) throw error
      return data as ConfigWhatsapp
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message)
      } else {
        showError('Erro ao atualizar mensagens do WhatsApp')
      }
      return null
    }
  }
} 