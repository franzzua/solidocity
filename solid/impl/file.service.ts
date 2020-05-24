import {Fetch} from "../contracts";
import * as SolidFileClient from "solid-file-client";
import {Injectable} from "@hypertype/core";

@Injectable()
export class SolidFileServiceImpl extends SolidFileClient {

    constructor(private fetch: Fetch) {
        super({fetch})
    }
}
