import OpenSearchConstants from './OpenSearchConstants';

/**
 * Constructs a request object with the specified options.
 * @alias OpenSearchRequest
 * @constructor
 * @classdesc Object representing an OpenSearch request.
 * @param {Object} options
 */
var OpenSearchRequest = function (options) {
    var defaultOptions = OpenSearchRequest.defaultOptions;
    options = options || defaultOptions;

    //A flag to indicate if the current shapes in the layer should be replaced.
    //Only used in the OpenSearchLayer.
    this.replaceShapes = options.replaceShapes || defaultOptions.replaceShapes;

    //Url for a resource such as a description document.
    this.url = options.url || defaultOptions.url;

    //A valid http method.
    this.method = options.method || defaultOptions.method;

    //A valid encoding for POST, PUT requests.
    this.encType = options.encType || defaultOptions.encType;

    //A valid mime type.
    this.type = options.type || defaultOptions.type;

    //A valid open search rel. Possible values are 'collection' or 'results'.
    this.relation = options.relation || defaultOptions.relation;

    //A flag to indicate if the request should include credentials.
    this.withCredentials = options.withCredentials || defaultOptions.withCredentials;

    //A timeout in milliseconds for the ajax request
    this.timeout = options.timeout || defaultOptions.timeout;

    //Request headers. Use the addHeader method.
    this.headers = options.headers || defaultOptions.headers;

    //Payload data for POST, PUT requests.
    this.body = options.body || defaultOptions.body;

    //The response type for XHR.
    this.responseType = options.responseType || defaultOptions.responseType;

    //Username and password for authentication purposes.
    this.user = options.user || defaultOptions.user;
    this.password = options.password || defaultOptions.password;
};

OpenSearchRequest.prototype.addHeader = function (name, value) {
    var header = this.getHeader(name);
    if (header) {
        this.headers[name] = header + ',' + value;
    }
    else {
        this.headers[name] = value;
    }
};

OpenSearchRequest.prototype.getHeader = function (name) {
    return this.headers[name];
};

OpenSearchRequest.defaultOptions = {
    replaceShapes: true,
    url: '',
    method: '',
    encType: 'application/x-www-form-urlencoded',
    type: '',
    relation: OpenSearchConstants.RESULTS,
    withCredentials: false,
    timeout: 0,
    headers: {},
    body: null,
    responseType: 'text',
    user: null,
    password: null
};

export default OpenSearchRequest;