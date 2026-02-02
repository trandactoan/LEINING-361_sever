import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/createUserDto';
import { ZaloUserInfoDto } from './dtos/zaloAuthDto';
import { User } from './user.schema';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return await this.userService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User | null> {
    return await this.userService.update(id, createUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    await this.userService.delete(id);
    return { message: 'User deleted successfully' };
  }

  @Get('zalo/:zaloId')
  @ApiOperation({ summary: 'Get user by Zalo ID' })
  @ApiResponse({ status: 200, description: 'User found or null' })
  async getUserByZaloId(@Param('zaloId') zaloId: string): Promise<User | null> {
    return await this.userService.findByZaloId(zaloId);
  }

  @Post('auth/zalo')
  @ApiOperation({ summary: 'Check if user exists by Zalo user info from getUserInfo() SDK' })
  @ApiResponse({ status: 200, description: 'User check completed' })
  async checkZaloUser(@Body() zaloUserInfo: ZaloUserInfoDto): Promise<{ user: User | null; isNewUser: boolean }> {
    // Check if user exists in our system by Zalo ID
    const existingUser = await this.userService.findByZaloId(zaloUserInfo.id);

    if (existingUser) {
      return { user: existingUser, isNewUser: false };
    }

    // User not in our system yet
    return { user: null, isNewUser: true };
  }

  @Post('auth/zalo/register')
  @ApiOperation({ summary: 'Register or update user from Zalo getUserInfo() data' })
  @ApiResponse({ status: 201, description: 'User registered/updated successfully' })
  async registerZaloUser(@Body() zaloUserInfo: ZaloUserInfoDto): Promise<User> {
    // Create or update user with Zalo user info from Mini App SDK
    return await this.userService.createOrUpdateFromZalo(zaloUserInfo);
  }
}
