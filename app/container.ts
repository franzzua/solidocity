import {Container} from "@hypertype/core";
import {AuthAppService} from "./contracts";
import {NodeAuthAppService} from "./node-auth-app.service";

export const AppServicesContainer = Container.withProviders(
    {provide: AuthAppService, useClass: NodeAuthAppService}
);
