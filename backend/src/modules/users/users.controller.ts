import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryParamsDto } from './dto';
import { UserWithRelations, PaginatedUsersResponse } from './interfaces';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserWithRelations> {
    return this.usersService.create(createUserDto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取用户列表（分页）' })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  async findAll(
    @Query() params: UserQueryParamsDto,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findAll(params);
  }

  @Get('detail/:id')
  @ApiOperation({ summary: '根据ID获取用户详情' })
  @ApiResponse({ status: 200, description: '成功获取用户详情' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string): Promise<UserWithRelations> {
    return this.usersService.findOneWithRoles(id);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @ApiResponse({ status: 400, description: '请求参数无效' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserWithRelations> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: '用户删除成功' };
  }
}
