import supabase from '@/config/supabase';

export class UploadService {
  async uploadArquivo(bucket: string, caminho: string, arquivo: File): Promise<string> {
    try {
      const fileExt = arquivo.name.split('.').pop();
      const fileName = `${arquivo.name.split('.')[0]}.${fileExt}`;
      const filePath = `${caminho}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, arquivo, {
          contentType: arquivo.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new Error(`Erro ao fazer upload: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Erro ao obter URL pública');
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  async downloadArquivo(bucket: string, caminho: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(caminho);

      if (error) {
        throw new Error(`Erro ao baixar arquivo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro no download:', error);
      throw error;
    }
  }
}