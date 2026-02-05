import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AttributesService } from "./attributes.service";
import { CreateAttributeGroupDto } from "./dto/create-attribute-group.dto";
import { CreateAttributeOptionDto } from "./dto/create-attribute-option.dto";

@Controller("admin/attributes")
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get("groups")
  findGroups() {
    return this.attributesService.findAllGroups();
  }

  @Post("groups")
  createGroup(@Body() dto: CreateAttributeGroupDto) {
    return this.attributesService.createGroup(dto);
  }

  @Post("options")
  createOption(@Body() dto: CreateAttributeOptionDto) {
    return this.attributesService.createOption(dto);
  }

  @Get("groups/:id/options")
  getOptions(@Param("id") id: string) {
    return this.attributesService.findOptionsByGroup(id);
  }
}