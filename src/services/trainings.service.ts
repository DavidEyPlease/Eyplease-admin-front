import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api';
import { ApiResponse } from '@/interfaces/common';
import { ITraining, ITrainingUpdate } from '@/interfaces/training';
import { EypleaseFile, FileTypes } from '@/interfaces/files';

export class TrainingsService {
    static async put(id: string, data: ITrainingUpdate): Promise<ApiResponse<ITraining>> {
        return HttpService.put(API_ROUTES.TRAININGS.UPDATE.replace('{id}', id), data);
    }

    static async attachFile(trainingId: string, fileUri: string, fileType: FileTypes): Promise<ApiResponse<EypleaseFile[]>> {
        return HttpService.post(API_ROUTES.TRAININGS.ATTACH_FILE.replace('{id}', trainingId), {
            file_uri: fileUri,
            file_type: fileType
        });
    }
}