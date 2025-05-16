import { Module } from '@nestjs/common';
import { MetaTablesController } from './controllers/meta-tables.controller';
import { MetaFieldsController } from './controllers/meta-fields.controller';
import { MetaRelationsController } from './controllers/meta-relations.controller';
import { MetaVersionsController } from './controllers/meta-versions.controller';
import { ModelApprovalController } from './controllers/model-approval.controller';
import { ImpactAnalysisController } from './controllers/impact-analysis.controller';
import { TestDataGeneratorController } from './controllers/test-data-generator.controller';
import { VisualDesignerController } from './controllers/visual-designer.controller';

import { MetaTablesService } from './services/meta-tables.service';
import { MetaFieldsService } from './services/meta-fields.service';
import { MetaRelationsService } from './services/meta-relations.service';
import { MetaVersionsService } from './services/meta-versions.service';
import { ModelGeneratorService } from './services/model-generator.service';
import { ModelApprovalService } from './services/model-approval.service';
import { ImpactAnalysisService } from './services/impact-analysis.service';
import { TestDataGeneratorService } from './services/test-data-generator.service';
import { VisualDesignerService } from './services/visual-designer.service';
import { DataModelsService } from './data-models.service';
import { PrismaService } from '../../services/prisma.service';
import { TenantModule } from '../tenants/tenant.module';
import { AuthModule } from '../auth/auth.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [TenantModule, AuthModule, SystemModule],
  controllers: [
    MetaTablesController,
    MetaFieldsController,
    MetaRelationsController,
    MetaVersionsController,
    ModelApprovalController,
    ImpactAnalysisController,
    TestDataGeneratorController,
    VisualDesignerController,
  ],
  providers: [
    PrismaService,
    MetaTablesService,
    MetaFieldsService,
    MetaRelationsService,
    MetaVersionsService,
    ModelGeneratorService,
    ModelApprovalService,
    ImpactAnalysisService,
    TestDataGeneratorService,
    VisualDesignerService,
    DataModelsService,
  ],
  exports: [
    MetaTablesService,
    MetaFieldsService,
    MetaRelationsService,
    MetaVersionsService,
    ModelGeneratorService,
    ModelApprovalService,
    ImpactAnalysisService,
    TestDataGeneratorService,
    VisualDesignerService,
    DataModelsService,
  ],
})
export class DataModelsModule {}
