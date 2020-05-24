import * as SolidFileClient from "solid-file-client";
import {FetchImpl} from "./fetch.impl";
import {SolidFileService} from "../contracts";


class SolidFileServiceImpl extends SolidFileClient {

    constructor() {
        super({fetch: FetchImpl})
    }

}

export const fs = new SolidFileServiceImpl() as SolidFileService
