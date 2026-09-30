// DTO fields are documented by the Swagger compiler plugin (see nest-cli.json).
// Controller files are excluded from that plugin so Sequelize models are not
// published as empty response schemas.
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

export function ApiEndpoint(
  summary: string,
  options?: {
    auth?: 'required' | 'optional';
    roles?: string[];
    description?: string;
  },
) {
  const description = [
    options?.description,
    options?.auth === 'required'
      ? 'Bearer access token is required.'
      : undefined,
    options?.auth === 'optional'
      ? 'Bearer access token is optional. When present, the response is personalized for that user.'
      : undefined,
    options?.roles?.length ? `Roles: ${options.roles.join(', ')}.` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return applyDecorators(
    ApiOperation({ summary, description: description || undefined }),
    ...(options?.auth ? [ApiBearerAuth()] : []),
  );
}

const binaryFile = { type: 'string', format: 'binary' };

export function ApiFileBody(
  files: Record<string, { multiple?: boolean; required?: boolean }>,
  description?: string,
) {
  const properties: Record<string, object> = {};
  const required: string[] = [];

  for (const [name, file] of Object.entries(files)) {
    properties[name] = file.multiple
      ? { type: 'array', items: binaryFile }
      : binaryFile;
    if (file.required) {
      required.push(name);
    }
  }

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description,
      required: required.length > 0,
      schema: {
        type: 'object',
        required: required.length ? required : undefined,
        properties,
      },
    }),
  );
}

export function ApiMultipart(dto: Type<unknown>, description?: string) {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({ type: dto, description }),
  );
}
