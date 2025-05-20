import { Module } from '@nestjs/common';
import { PrismaService } from '../../services/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { WorkflowDefinitionController } from './controllers/workflow-definition.controller';
import { WorkflowInstanceController } from './controllers/workflow-instance.controller';
import { WorkflowTaskController } from './controllers/workflow-task.controller';

import { WorkflowDefinitionService } from './services/workflow-definition.service';
import { WorkflowInstanceService } from './services/workflow-instance.service';
import { WorkflowTaskService } from './services/workflow-task.service';
import { WorkflowEngineService } from './services/workflow-engine.service';
import { NodeTypeService } from './services/node-type.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [
    WorkflowDefinitionController,
    WorkflowInstanceController,
    WorkflowTaskController,
  ],
  providers: [
    PrismaService,
    WorkflowDefinitionService,
    WorkflowInstanceService,
    WorkflowTaskService,
    WorkflowEngineService,
    NodeTypeService,
  ],
  exports: [
    WorkflowDefinitionService,
    WorkflowInstanceService,
    WorkflowTaskService,
    WorkflowEngineService,
    NodeTypeService,
  ],
})
export class WorkflowsModule {}
