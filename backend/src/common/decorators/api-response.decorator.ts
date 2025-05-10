import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponse } from '../response';
import { PageData } from '../response/page-data.class';

/**
 * API成功响应装饰器
 * @param dataDto 响应数据DTO类型
 * @param description 响应描述
 * @returns 装饰器
 */
export function ApiSuccessResponse<T extends Type<any>>(
  dataDto: T,
  description = '请求成功',
) {
  return applyDecorators(
    ApiExtraModels(ApiResponse, dataDto),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );
}

/**
 * API分页数据响应装饰器
 * @param dataDto 响应数据DTO类型
 * @param description 响应描述
 * @returns 装饰器
 */
export function ApiPageResponse<T extends Type<any>>(
  dataDto: T,
  description = '查询成功',
) {
  return applyDecorators(
    ApiExtraModels(ApiResponse, PageData, dataDto),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(PageData) },
                  {
                    properties: {
                      items: {
                        type: 'array',
                        items: { $ref: getSchemaPath(dataDto) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
}
