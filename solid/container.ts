import {Container} from "@hypertype/core";
import {SolidFileServiceImpl} from "./impl/file.service";
import {Fetch, SolidFileService} from "./contracts";
import {FetchImpl} from "./impl/fetch.impl";

export const POD = Symbol('POD');

export const SolidContainer = Container.withProviders(
    {provide: Fetch, useValue: FetchImpl},
    {provide: SolidFileService, useClass: SolidFileServiceImpl}
);

export {}
