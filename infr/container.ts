import {Container} from "@hypertype/core";
import {ContextRepository, ProfileRepository} from "./contracts";
import {ContextRepositoryImpl} from "./impl/context-repository.impl";
import {NodeProfileRepository} from "./impl/node-profile.repository";

export const InfrContainer = Container.withProviders(
    {provide: ContextRepository, useClass: ContextRepositoryImpl},
    {provide: ProfileRepository, useClass: NodeProfileRepository}
);
