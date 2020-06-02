import * as SolidFileClient from "solid-file-client";
import {SolidApi} from "../contracts";
import {Fetch} from "./fetch";


class SolidFileServiceImpl extends SolidFileClient {

    constructor() {
        super({fetch: Fetch})
    }

}

export const fs = new SolidFileServiceImpl() as SolidApi
