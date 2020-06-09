import * as SolidFileClient from "solid-file-client";
import {SolidApi} from "../contracts";
const  Fetch = require("node-fetch");


class SolidFileServiceImpl extends SolidFileClient {

    constructor() {
        super({fetch: Fetch})
    }

}

export const fs = new SolidFileServiceImpl() as SolidApi
