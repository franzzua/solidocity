
import {parse,sparqlUpdateParser, graph} from 'rdflib';
const N3 = require('n3');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const turtleParser = new N3.Parser({format: 'text/turtle'});

const {DataFactory: {namedNode, literal, defaultGraph, quad}} = N3;
const prefixes = {
    ldp: 'http://www.w3.org/ns/ldp#',
    terms: 'http://purl.org/dc/terms/',
    XML: 'http://www.w3.org/2001/XMLSchema#',
    st: 'http://www.w3.org/ns/posix/stat#'
};

let _baseURI = 'https://example.com';
let _basePath = __dirname;

function placeholder(reqPath, options) {
    return new Response('placeholder: ' + reqPath, {status: 200})
}

const head = placeholder;
const options = placeholder;

const methodHandlers = {
    HEAD: assertNot404(head),
    OPTIONS: assertNot404(options),
    GET: assertNot404(get),
    POST: assertNot404(post),
    PUT: put,
    PATCH: patch,
    DELETE: assertNot404(_delete)
};

async function fetch(reqPath: string, options = {method: 'GET'}) {
    reqPath = reqPath.replace(_baseURI, _basePath);
    reqPath = decodeURIComponent(reqPath);
    const method = options.method || 'GET';
    const handler = methodHandlers[method.toUpperCase()];

    try {
        return await handler(reqPath, options)
    } catch (err) {
        console.error(err);
        return await internalServerErrorResponse()
    }
}

async function get(reqPath, options) {
    return (await isDirectory(reqPath)) ?
        await getDirectory(reqPath, options)
        : await getFile(reqPath, options)
}

async function getDirectory(reqPath, options) {
    if (options.headers.accept && !options.headers.accept.match('text/turtle') && options.headers.accept.match('text/html')) {
        return getDirectoryView(reqPath, options)
    }
    const content = await getDirectoryContent(reqPath);
    const resOptions = {
        status: 200,
        headers: {'content-type': 'text/turtle'}
    };
    return new Response(content, resOptions)
}

async function getDirectoryView(reqPath, options) {
    const defaultFile = path.join(reqPath, 'index.html');
    if (await itemExists(defaultFile)) {
        return getFile(defaultFile, options)
    } else {
        return new Response('',{
            status: 404
        })
    }
}

async function getFile(reqPath, options) {
    const content = await getFileContent(reqPath);
    const contentType = mime.contentType(path.extname(reqPath));
    const resOptions = {
        status: 200,
        headers: contentType ? {'content-type': contentType} : {}
    };
    return new Response(content, resOptions)
}

async function _delete(reqPath, options) {
    return (await isDirectory(reqPath)) ?
        deleteDirectory(reqPath, options)
        : deleteFile(reqPath, options)
}

async function deleteDirectory(reqPath, options) {
    if ((await fs.promises.readdir(reqPath)).length) {
        return new Response('Directory not Empty', {status: 409})
    }
    await fs.promises.rmdir(reqPath);
    return new Response(null, {status: 204})
}

async function deleteFile(reqPath, options) {
    await fs.promises.unlink(reqPath);
    return new Response(null, {status: 204})
}

async function post(reqPath, options) {
    if (!(await isDirectory(reqPath)))
        return badRequestResponse('POST url must be a directory');

    const {slug, link} = options.headers;
    if (!slug)
        return badRequestResponse('POST must contain a slug header');
    if (!link)
        return badRequestResponse('POST must contain a link header');

    let itemPath = path.join(reqPath, slug);
    if (link.match('BasicContainer')) {
        return createDirectory(itemPath)
    } else if (link.match('Resource')) {
        if (!path.extname(itemPath)) {
            const contentType = options.headers['content-type'];
            const ext = mime.extension(contentType);
            if (typeof ext === 'string') {
                itemPath += `.${ext}`
            }
        }
        return createResource(itemPath, options)
    } else {
        return badRequestResponse('POST must contain a valid link header')
    }
}

async function createDirectory(dirPath) {
    await fs.promises.mkdir(dirPath);
    return new Response('Directory created', {status: 201})
}

async function createResource(itemPath, options) {
    const {body} = options;
    await fs.promises.writeFile(itemPath, body);
    return new Response('File created', {
        status: 201,
        url: itemPath,
        headers: {location: itemPath}
    })
}
async function updateResource(itemPath, options) {
    const body = options.body as string;
    const content = await fs.promises.readFile(itemPath, 'utf8');
    const g = graph() as any;
    // g.add = console.log;
    parse(content, g, _baseURI, 'text/turtle');
    const res = sparqlUpdateParser(body, g, _baseURI);
    return new Response('File created', {
        status: 201,
        url: itemPath,
        headers: {location: itemPath}
    })
}

async function put(reqPath, options) {
    const container = path.dirname(reqPath);
    // TODO: Check if this results in an error on windows
    // >> On Windows, using fs.mkdir() on the root directory even with recursion will result in an error:
    await fs.promises.mkdir(container, {recursive: true});
    return createResource(reqPath, options)
}

async function patch(reqPath, options) {
    const container = path.dirname(reqPath);
    // TODO: Check if this results in an error on windows
    // >> On Windows, using fs.mkdir() on the root directory even with recursion will result in an error:
    await fs.promises.mkdir(container, {recursive: true});
    return updateResource(reqPath, options)
}

function assertNot404(handler) {
    return async (reqPath, options) => {
        if (await itemExists(reqPath))
            return await handler(reqPath, options);
        return notFoundResponse()
    }
}

function itemExists(path) {
    return new Promise((resolve) => fs.access(path, err => err ? resolve(false) : resolve(true)))
}

function isDirectory(reqPath) {
    return fs.promises.stat(reqPath)
        .then(stats => stats.isDirectory())
}

async function getDirectoryContent(dirPath) {
    const itemNames = await fs.promises.readdir(dirPath);
    itemNames.unshift('');

    const writer = new N3.Writer({prefixes});
    await Promise.all(itemNames.map(async name => {
        const itemPath = path.resolve(dirPath, name);
        const stats = await fs.promises.stat(itemPath);
        writer.addQuads(await statsToQuads(itemPath, name, stats))
    }));

    return new Promise((resolve, reject) => {
        writer.end((err, result) => err ? reject(err) : resolve(result))
    })
}

/**
 *
 * @param {string} itemPath
 * @param {Stats} stats
 */
async function statsToQuads(itemPath, name, stats) {
    // TODO: Check if replacing spaces is sufficient or if encodeURIComponent is really necessary
    const quads = [];
    const subject = namedNode(name.replace(/ /g, '%20') + ((name !== '' && stats.isDirectory() && !name.endsWith('/')) ? '/' : ''));
    const a = namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');

    if (stats.isDirectory()) {
        quads.push(quad(subject, a, namedNode(`${prefixes.ldp}BasicContainer`)));
        quads.push(quad(subject, a, namedNode(`${prefixes.ldp}Container`)));

        const itemNames = await fs.promises.readdir(itemPath);
        await Promise.all(itemNames.map(async itemName => {
            let relPath = path.join(name, itemName).replace(/ /gi, '%20');
            const absPath = path.resolve(itemPath, itemName);
            if (await isDirectory(absPath))
                relPath += '/';
            quads.push(quad(subject, namedNode(`${prefixes.ldp}contains`), namedNode(relPath)))
        }))
    }
    quads.push(quad(subject, a, namedNode(`${prefixes.ldp}Resource`)));
    quads.push(quad(subject, namedNode(`${prefixes.terms}modified`), literal(stats.mtime.toISOString())));
    quads.push(quad(subject, namedNode(`${prefixes.st}mtime`), literal(stats.mtimeMs)));
    quads.push(quad(subject, namedNode(`${prefixes.st}size`), literal(stats.size)));

    return quads
}

function getFileContent(filePath) {
    return fs.promises.readFile(filePath)
}


function notFoundResponse() {
    return new Response('404 Not Found', {
        status: 404
    })
}

function internalServerErrorResponse() {
    return new Response('500 Internal Server Error', {
        status: 500
    })
}

function badRequestResponse(reason = 'Bad Request') {
    return new Response(reason, {
        status: 400
    })
}

function init(baseURI, basePath) {
    _basePath = basePath;
    _baseURI = baseURI;
}

export {
    fetch,
    init
}
