import supabase from '@/config/supabase';

export class SupabaseStorageService {
  private bucket = 'avatares';
  async uploadAvatar(profissionalId: string, file: File): Promise<string> {
    const filePath = `${profissionalId}/avatar_${profissionalId}.webp`; // padrão único
    await this.deleteAvatar(profissionalId); // remove qualquer extensão antiga
  
    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp', // se você converter antes
      });
  
    if (error) {
      console.error('Erro no upload do avatar:', error);
      throw new Error(`Erro ao fazer upload do avatar: ${error.message}`);
    }
  
    return filePath;
  }
  
  async getAvatarUrl(profissionalId: string): Promise<string | null> {
    const filePath = `${profissionalId}/avatar_${profissionalId}.webp`; // padrão único
    const { data } = supabase.storage.from(this.bucket).getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  }
  
  async deleteAvatar(profissionalId: string): Promise<boolean> {
    const possibleExtensions = ['jpg', 'jpeg', 'png', 'webp']; // ou qualquer suporte aceito
    for (const ext of possibleExtensions) {
      const filePath = `${profissionalId}/avatar_${profissionalId}.${ext}`;
      const { error } = await supabase.storage.from(this.bucket).remove([filePath]);
      if (!error) return true; // Sucesso ao deletar
    }
    return false;
  }
  
}
