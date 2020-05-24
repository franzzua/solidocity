import {SolidRepository} from "@solid";
import {Context} from "../impl/context-repository.impl";

export abstract class ContextRepository extends SolidRepository<Context>{

    public abstract async GetContexts();

    public abstract async Save();
}
