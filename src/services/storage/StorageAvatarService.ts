import supabase from '@/config/supabase';
import { useStoreProfissional } from '@/stores/storeProfissional';

export class StorageAvatarService {
  private bucket = 'avatares';

  async uploadAvatar(profissionalId: string, file: File): Promise<string> {
    const filePath = `${profissionalId}/avatar_${profissionalId}.webp`;
    await this.deleteAvatar(profissionalId);

    const { error } = await supabase.storage
      .from(this.bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/webp',
      });

    if (error) {
      console.error('Erro no upload do avatar:', error);
      throw new Error(`Erro ao fazer upload do avatar: ${error.message}`);
    }
    console.log(filePath)
    return filePath;
  }

  async getAvatarUrl(profissionalId: string): Promise<string> {
    const filePath = `/${profissionalId}/avatar_${profissionalId}.webp`;
    const { data } = supabase.storage.from(this.bucket).getPublicUrl(filePath);
    console.log("getAvatarUrl")
    console.log(data)
    return data?.publicUrl ?? '';
  }

  async getAvatarUrlBlob(profissionalId: string): Promise<string> {
    const filePath = `${profissionalId}/avatar_${profissionalId}.webp`;
    const { data, error } = await supabase.storage.from(this.bucket).download(filePath);
    if (error || !data) return '/assets/logo.jpeg';
    return URL.createObjectURL(data);
  }

  async deleteAvatar(profissionalId: string): Promise<boolean> {    
    const filePath = `${profissionalId}/avatar_${profissionalId}.webp`;
    const { error } = await supabase.storage.from(this.bucket).remove([filePath]);
    return !error;
  }
}
