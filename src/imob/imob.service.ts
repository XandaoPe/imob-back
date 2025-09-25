import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Imob } from './imob.model';
import * as xlsx from 'xlsx';

@Injectable()
export class ImobsService {
  constructor(@InjectModel(Imob.name) private imobModel: Model<Imob>) { }

  async create(imob: Imob): Promise<Imob> {
    const createdImob = new this.imobModel(imob);
    return createdImob.save();
  }

  async findAll(): Promise<Imob[]> {
    return this.imobModel.find({ isDisabled: false }).exec();
  }

  async findAllWithDisabled(): Promise<Imob[]> {
    return this.imobModel.find().exec();
  }

  async findOne(id: string): Promise<{ data: Imob | null; message: string; status: number }> {
    try {

      const data = await this.imobModel.findById(id).exec();

      if (!data) {
        return {
          data: null,
          message: 'Imóvel não encontrado',
          status: 404
        };
      }

      return {
        data,
        message: 'Imóvel encontrado com sucesso',
        status: 200
      };

    } catch (error) {
      return {
        data: null,
        message: 'Erro ao buscar imóvel',
        status: 500
      };
    }
  }

  async update(id: string, imob: Imob): Promise<Imob> {
    return this.imobModel.findByIdAndUpdate(id, imob, { new: true }).exec();
  }

  async remove(id: string): Promise<Imob> {
    return this.imobModel.findByIdAndDelete(id).exec();
  }

  async deactivate(id: string): Promise<Imob> {
    const imob = await this.imobModel.findByIdAndUpdate(
      id,
      { isDisabled: true },
      { new: true }
    ).exec();
    if (!imob) {
      throw new NotFoundException('Imóvel não encontrado.');
    }
    return imob;
  }

  // 🔥 NOVO MÉTODO: Ativa o imóvel
  async activate(id: string): Promise<Imob> {
    const imob = await this.imobModel.findByIdAndUpdate(
      id,
      { isDisabled: false },
      { new: true }
    ).exec();
    if (!imob) {
      throw new NotFoundException('Imóvel não encontrado.'); // Alterado de 'Usuário' para 'Imóvel'
    }
    return imob;
  }

  async importFromExcel(file: Express.Multer.File): Promise<any> {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const imobData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      const headers = imobData[0] as string[];
      const dataRows = imobData.slice(1);

      const importSummary = {
        created: 0,
        updated: 0,
        deactivated: 0, // Novo contador para imóveis desativados
        ignored: 0,
        details: []
      };

      // Usaremos um Set para armazenar identificadores únicos de imóveis da planilha
      // O identificador será uma string combinando tipo, rua e numero (ex: "Casa|Rua A|123")
      const imobsInSpreadsheetIdentifiers: Set<string> = new Set();

      // 1. Coletar todos os identificadores de imóveis da planilha
      for (const row of dataRows) {
        const rowData = Object.fromEntries(
          headers.map((header, i) => [header.toLowerCase(), row[i]])
        );
        const { tipo, rua, numero } = rowData as any;

        if (tipo && rua && numero) {
          // Criar um identificador único para o imóvel
          const identifier = `${tipo.toString().toLowerCase()}|${rua.toString().toLowerCase()}|${numero.toString().toLowerCase()}`;
          imobsInSpreadsheetIdentifiers.add(identifier);
        }
      }

      // 2. Desativar todos os imóveis existentes no banco de dados que NÃO estão na planilha
      // Nota: Não há um "admin" para imóveis que precise ser excluído da desativação.
      const deactivateResult = await this.imobModel.updateMany(
        {}, // Aplica a todos os documentos
        { $set: { isDisabled: true } }
      ).exec();
      importSummary.deactivated = deactivateResult.modifiedCount;
      console.log(`ℹ️ ${deactivateResult.modifiedCount} imóveis foram marcados como inativos.`);

      // 3. Processar a planilha: Criar/Atualizar e Ativar
      for (const row of dataRows) {
        const rowData = Object.fromEntries(
          headers.map((header, i) => [header.toLowerCase(), row[i]])
        );
        const { tipo, rua, numero, complemento, cep, cidade, uf, obs, copasa, cemig } = rowData as any;

        if (!tipo || !rua || !numero) {
          console.error(`❌ Ignorando linha com tipo, rua ou numero ausente: ${JSON.stringify(rowData)}`);
          importSummary.ignored++;
          importSummary.details.push({ data: rowData, status: 'Ignorado', reason: 'Tipo, rua ou número ausentes' });
          continue;
        }

        // Usar os campos para encontrar o imóvel (garantindo case-insensitivity se necessário, ou conforme seu modelo)
        const findQuery = {
          tipo: tipo, // Ajuste para case-insensitive se 'tipo' puder variar (ex: new RegExp(tipo, 'i'))
          rua: rua,
          numero: numero
        };

        const existingImob = await this.imobModel.findOne(findQuery).exec();

        const imobPayload: any = {
          tipo,
          rua,
          numero,
          complemento,
          cep,
          cidade,
          uf,
          obs,
          copasa,
          cemig,
          isDisabled: false, // Define como ativo explicitamente para imóveis da planilha
        };

        if (existingImob) {
          await this.imobModel.findByIdAndUpdate(
            existingImob._id,
            { $set: imobPayload },
            { new: true }
          ).exec();
          importSummary.updated++;
          importSummary.details.push({ tipo, rua, numero, status: 'Atualizado (ativado)' });
        } else {
          const newImob = new this.imobModel({
            ...imobPayload
          });
          await newImob.save();
          importSummary.created++;
          importSummary.details.push({ tipo, rua, numero, status: 'Criado e ativado' });
        }
      }

      return {
        message: `Importação concluída. ${importSummary.created} criados, ${importSummary.updated} atualizados (e ativados), e ${importSummary.deactivated} imóveis (que não estavam na planilha) desativados.`,
        ...importSummary,
      };
    } catch (error) {
      console.error('❌ Erro na importação:', error);
      throw new BadRequestException('Erro ao processar a planilha. Verifique o formato do arquivo e os cabeçalhos das colunas (tipo, rua, numero, complemento, cep, cidade, uf, obs, copasa, cemig).');
    }
  }

  // 📁 MÉTODO: Exportar imóveis para Excel
  async exportToExcel(): Promise<Buffer> {
    const imobs = await this.imobModel.find().exec();

    const imobToExport = imobs.map(imob => ({ // Renomeado 'user' para 'imob' para clareza
      "tipo": imob.tipo,
      "rua": imob.rua,
      "numero": imob.numero,
      "complemento": imob.complemento,
      "cep": imob.cep,
      "cidade": imob.cidade,
      "uf": imob.uf,
      "obs": imob.obs,
      "copasa": imob.copasa,
      "cemig": imob.cemig,
      "status": imob.isDisabled ? 'Inativo' : 'Ativo' // Adicionado status para exportação
    }));

    const worksheet = xlsx.utils.json_to_sheet(imobToExport);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Imóveis');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}