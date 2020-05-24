import {Container} from "@hypertype/core";
import {AppServicesContainer} from "@app";
import {InfrContainer} from "@infr";
import {SolidContainer} from "@solid";

export const AppContainer = Container.withProviders(
    ...AppServicesContainer.getProviders(),
    ...InfrContainer.getProviders(),
    ...SolidContainer.getProviders(),
);
