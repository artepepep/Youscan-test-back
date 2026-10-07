import { UnsupportedMediaTypeException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'node:path';
import { ALLOWED_EXTENSIONS } from '../constants/allowed-extensions.const';

export const WidgetFileInterceptor = FileInterceptor('file', {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      callback(
        new UnsupportedMediaTypeException(
          'Only CSV and XLSX files are supported',
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
});
