export interface CameraIdentifier {
    model: string;
    nickname: string;
    id: string;
}
export interface FileInfo {
    path: string;
    camera: CameraIdentifier;
    dateCreated: Date;
    humanReadableDate: string;
}
export type FilesJson = FileInfo[];
