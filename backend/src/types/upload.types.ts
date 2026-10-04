export interface Upload {
  id: number;
  userId: number;
  storageKey: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
  createdAt: Date;
}

export interface NewUpload {
  userId: number;
  storageKey: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
}

export interface IncomingFile {
  buffer: Buffer;
  originalname: string;
  size: number;
}

export interface DetectedFile {
  ext: string;
  mime: string;
}

export interface UploadView {
  id: number;
  filename: string;
  url: string;
  type: string;
  content_type: string;
  size: number;
  created_at: Date;
}
