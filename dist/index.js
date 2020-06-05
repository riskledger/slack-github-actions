function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = _interopDefault(require('os'));
var path = _interopDefault(require('path'));
var Url = _interopDefault(require('url'));
var events = _interopDefault(require('events'));
var fs = _interopDefault(require('fs'));
var Stream = _interopDefault(require('stream'));
var util = _interopDefault(require('util'));
var http = _interopDefault(require('http'));
var https = _interopDefault(require('https'));
var tls = _interopDefault(require('tls'));
var dns = _interopDefault(require('dns'));
var zlib = _interopDefault(require('zlib'));
var http2 = _interopDefault(require('http2'));
var net = _interopDefault(require('net'));
require('assert');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var command = createCommonjsModule(function (module, exports) {
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os$1 = __importStar(os);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os$1.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}

});

unwrapExports(command);

var core = createCommonjsModule(function (module, exports) {
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });

const os$1 = __importStar(os);
const path$1 = __importStar(path);
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command.toCommandValue(val);
    process.env[name] = convertedVal;
    command.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path$1.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os$1.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;

});

var core$1 = unwrapExports(core);

class CancelError extends Error {
	constructor(reason) {
		super(reason || 'Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

class PCancelable {
	static fn(userFn) {
		return (...arguments_) => {
			return new PCancelable((resolve, reject, onCancel) => {
				arguments_.push(onCancel);
				// eslint-disable-next-line promise/prefer-await-to-then
				userFn(...arguments_).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;
		this._rejectOnCancel = true;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			const onResolve = value => {
				this._isPending = false;
				resolve(value);
			};

			const onReject = error => {
				this._isPending = false;
				reject(error);
			};

			const onCancel = handler => {
				if (!this._isPending) {
					throw new Error('The `onCancel` handler was attached after the promise settled.');
				}

				this._cancelHandlers.push(handler);
			};

			Object.defineProperties(onCancel, {
				shouldReject: {
					get: () => this._rejectOnCancel,
					set: boolean => {
						this._rejectOnCancel = boolean;
					}
				}
			});

			return executor(onResolve, onReject, onCancel);
		});
	}

	then(onFulfilled, onRejected) {
		// eslint-disable-next-line promise/prefer-await-to-then
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel(reason) {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (error) {
				this._reject(error);
			}
		}

		this._isCanceled = true;
		if (this._rejectOnCancel) {
			this._reject(new CancelError(reason));
		}
	}

	get isCanceled() {
		return this._isCanceled;
	}
}

Object.setPrototypeOf(PCancelable.prototype, Promise.prototype);

var pCancelable = PCancelable;
var CancelError_1 = CancelError;
pCancelable.CancelError = CancelError_1;

var dist = createCommonjsModule(function (module, exports) {
/// <reference lib="es2018"/>
/// <reference lib="dom"/>
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const { toString } = Object.prototype;
const isOfType = (type) => (value) => typeof value === type;
const getObjectType = (value) => {
    const objectName = toString.call(value).slice(8, -1);
    if (objectName) {
        return objectName;
    }
    return undefined;
};
const isObjectOfType = (type) => (value) => getObjectType(value) === type;
function is(value) {
    switch (value) {
        case null:
            return "null" /* null */;
        case true:
        case false:
            return "boolean" /* boolean */;
    }
    switch (typeof value) {
        case 'undefined':
            return "undefined" /* undefined */;
        case 'string':
            return "string" /* string */;
        case 'number':
            return "number" /* number */;
        case 'bigint':
            return "bigint" /* bigint */;
        case 'symbol':
            return "symbol" /* symbol */;
    }
    if (is.function_(value)) {
        return "Function" /* Function */;
    }
    if (is.observable(value)) {
        return "Observable" /* Observable */;
    }
    if (is.array(value)) {
        return "Array" /* Array */;
    }
    if (is.buffer(value)) {
        return "Buffer" /* Buffer */;
    }
    const tagType = getObjectType(value);
    if (tagType) {
        return tagType;
    }
    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
        throw new TypeError('Please don\'t use object wrappers for primitive types');
    }
    return "Object" /* Object */;
}
is.undefined = isOfType('undefined');
is.string = isOfType('string');
const isNumberType = isOfType('number');
is.number = (value) => isNumberType(value) && !is.nan(value);
is.bigint = isOfType('bigint');
// eslint-disable-next-line @typescript-eslint/ban-types
is.function_ = isOfType('function');
is.null_ = (value) => value === null;
is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
is.boolean = (value) => value === true || value === false;
is.symbol = isOfType('symbol');
is.numericString = (value) => is.string(value) && !is.emptyStringOrWhitespace(value) && !Number.isNaN(Number(value));
is.array = Array.isArray;
is.buffer = (value) => { var _a, _b, _c, _d; return (_d = (_c = (_b = (_a = value) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.isBuffer) === null || _c === void 0 ? void 0 : _c.call(_b, value)) !== null && _d !== void 0 ? _d : false; };
is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
is.object = (value) => !is.null_(value) && (typeof value === 'object' || is.function_(value));
is.iterable = (value) => { var _a; return is.function_((_a = value) === null || _a === void 0 ? void 0 : _a[Symbol.iterator]); };
is.asyncIterable = (value) => { var _a; return is.function_((_a = value) === null || _a === void 0 ? void 0 : _a[Symbol.asyncIterator]); };
is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
is.asyncGenerator = (value) => is.asyncIterable(value) && is.function_(value.next) && is.function_(value.throw);
is.nativePromise = (value) => isObjectOfType("Promise" /* Promise */)(value);
const hasPromiseAPI = (value) => {
    var _a, _b;
    return is.function_((_a = value) === null || _a === void 0 ? void 0 : _a.then) &&
        is.function_((_b = value) === null || _b === void 0 ? void 0 : _b.catch);
};
is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
is.generatorFunction = isObjectOfType("GeneratorFunction" /* GeneratorFunction */);
is.asyncGeneratorFunction = (value) => getObjectType(value) === "AsyncGeneratorFunction" /* AsyncGeneratorFunction */;
is.asyncFunction = (value) => getObjectType(value) === "AsyncFunction" /* AsyncFunction */;
// eslint-disable-next-line no-prototype-builtins, @typescript-eslint/ban-types
is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
is.regExp = isObjectOfType("RegExp" /* RegExp */);
is.date = isObjectOfType("Date" /* Date */);
is.error = isObjectOfType("Error" /* Error */);
is.map = (value) => isObjectOfType("Map" /* Map */)(value);
is.set = (value) => isObjectOfType("Set" /* Set */)(value);
is.weakMap = (value) => isObjectOfType("WeakMap" /* WeakMap */)(value);
is.weakSet = (value) => isObjectOfType("WeakSet" /* WeakSet */)(value);
is.int8Array = isObjectOfType("Int8Array" /* Int8Array */);
is.uint8Array = isObjectOfType("Uint8Array" /* Uint8Array */);
is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray" /* Uint8ClampedArray */);
is.int16Array = isObjectOfType("Int16Array" /* Int16Array */);
is.uint16Array = isObjectOfType("Uint16Array" /* Uint16Array */);
is.int32Array = isObjectOfType("Int32Array" /* Int32Array */);
is.uint32Array = isObjectOfType("Uint32Array" /* Uint32Array */);
is.float32Array = isObjectOfType("Float32Array" /* Float32Array */);
is.float64Array = isObjectOfType("Float64Array" /* Float64Array */);
is.bigInt64Array = isObjectOfType("BigInt64Array" /* BigInt64Array */);
is.bigUint64Array = isObjectOfType("BigUint64Array" /* BigUint64Array */);
is.arrayBuffer = isObjectOfType("ArrayBuffer" /* ArrayBuffer */);
is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer" /* SharedArrayBuffer */);
is.dataView = isObjectOfType("DataView" /* DataView */);
is.directInstanceOf = (instance, class_) => Object.getPrototypeOf(instance) === class_.prototype;
is.urlInstance = (value) => isObjectOfType("URL" /* URL */)(value);
is.urlString = (value) => {
    if (!is.string(value)) {
        return false;
    }
    try {
        new URL(value); // eslint-disable-line no-new
        return true;
    }
    catch (_a) {
        return false;
    }
};
// TODO: Use the `not` operator with a type guard here when it's available.
// Example: `is.truthy = (value: unknown): value is (not false | not 0 | not '' | not undefined | not null) => Boolean(value);`
is.truthy = (value) => Boolean(value);
// Example: `is.falsy = (value: unknown): value is (not true | 0 | '' | undefined | null) => Boolean(value);`
is.falsy = (value) => !value;
is.nan = (value) => Number.isNaN(value);
const primitiveTypeOfTypes = new Set([
    'undefined',
    'string',
    'number',
    'bigint',
    'boolean',
    'symbol'
]);
is.primitive = (value) => is.null_(value) || primitiveTypeOfTypes.has(typeof value);
is.integer = (value) => Number.isInteger(value);
is.safeInteger = (value) => Number.isSafeInteger(value);
is.plainObject = (value) => {
    // From: https://github.com/sindresorhus/is-plain-obj/blob/master/index.js
    if (getObjectType(value) !== "Object" /* Object */) {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.getPrototypeOf({});
};
const typedArrayTypes = new Set([
    "Int8Array" /* Int8Array */,
    "Uint8Array" /* Uint8Array */,
    "Uint8ClampedArray" /* Uint8ClampedArray */,
    "Int16Array" /* Int16Array */,
    "Uint16Array" /* Uint16Array */,
    "Int32Array" /* Int32Array */,
    "Uint32Array" /* Uint32Array */,
    "Float32Array" /* Float32Array */,
    "Float64Array" /* Float64Array */,
    "BigInt64Array" /* BigInt64Array */,
    "BigUint64Array" /* BigUint64Array */
]);
is.typedArray = (value) => {
    const objectType = getObjectType(value);
    if (objectType === undefined) {
        return false;
    }
    return typedArrayTypes.has(objectType);
};
const isValidLength = (value) => is.safeInteger(value) && value >= 0;
is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
is.inRange = (value, range) => {
    if (is.number(range)) {
        return value >= Math.min(0, range) && value <= Math.max(range, 0);
    }
    if (is.array(range) && range.length === 2) {
        return value >= Math.min(...range) && value <= Math.max(...range);
    }
    throw new TypeError(`Invalid range: ${JSON.stringify(range)}`);
};
const NODE_TYPE_ELEMENT = 1;
const DOM_PROPERTIES_TO_CHECK = [
    'innerHTML',
    'ownerDocument',
    'style',
    'attributes',
    'nodeValue'
];
is.domElement = (value) => is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) &&
    !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every(property => property in value);
is.observable = (value) => {
    var _a, _b, _c, _d;
    if (!value) {
        return false;
    }
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native
    if (value === ((_b = (_a = value)[Symbol.observable]) === null || _b === void 0 ? void 0 : _b.call(_a))) {
        return true;
    }
    if (value === ((_d = (_c = value)['@@observable']) === null || _d === void 0 ? void 0 : _d.call(_c))) {
        return true;
    }
    return false;
};
is.nodeStream = (value) => is.object(value) && is.function_(value.pipe) && !is.observable(value);
is.infinite = (value) => value === Infinity || value === -Infinity;
const isAbsoluteMod2 = (remainder) => (value) => is.integer(value) && Math.abs(value % 2) === remainder;
is.evenInteger = isAbsoluteMod2(0);
is.oddInteger = isAbsoluteMod2(1);
is.emptyArray = (value) => is.array(value) && value.length === 0;
is.nonEmptyArray = (value) => is.array(value) && value.length > 0;
is.emptyString = (value) => is.string(value) && value.length === 0;
// TODO: Use `not ''` when the `not` operator is available.
is.nonEmptyString = (value) => is.string(value) && value.length > 0;
const isWhiteSpaceString = (value) => is.string(value) && !/\S/.test(value);
is.emptyStringOrWhitespace = (value) => is.emptyString(value) || isWhiteSpaceString(value);
is.emptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length === 0;
// TODO: Use `not` operator here to remove `Map` and `Set` from type guard:
// - https://github.com/Microsoft/TypeScript/pull/29317
is.nonEmptyObject = (value) => is.object(value) && !is.map(value) && !is.set(value) && Object.keys(value).length > 0;
is.emptySet = (value) => is.set(value) && value.size === 0;
is.nonEmptySet = (value) => is.set(value) && value.size > 0;
is.emptyMap = (value) => is.map(value) && value.size === 0;
is.nonEmptyMap = (value) => is.map(value) && value.size > 0;
const predicateOnArray = (method, predicate, values) => {
    if (!is.function_(predicate)) {
        throw new TypeError(`Invalid predicate: ${JSON.stringify(predicate)}`);
    }
    if (values.length === 0) {
        throw new TypeError('Invalid number of values');
    }
    return method.call(values, predicate);
};
is.any = (predicate, ...values) => {
    const predicates = is.array(predicate) ? predicate : [predicate];
    return predicates.some(singlePredicate => predicateOnArray(Array.prototype.some, singlePredicate, values));
};
is.all = (predicate, ...values) => predicateOnArray(Array.prototype.every, predicate, values);
const assertType = (condition, description, value) => {
    if (!condition) {
        throw new TypeError(`Expected value which is \`${description}\`, received value of type \`${is(value)}\`.`);
    }
};
exports.assert = {
    // Unknowns.
    undefined: (value) => assertType(is.undefined(value), "undefined" /* undefined */, value),
    string: (value) => assertType(is.string(value), "string" /* string */, value),
    number: (value) => assertType(is.number(value), "number" /* number */, value),
    bigint: (value) => assertType(is.bigint(value), "bigint" /* bigint */, value),
    // eslint-disable-next-line @typescript-eslint/ban-types
    function_: (value) => assertType(is.function_(value), "Function" /* Function */, value),
    null_: (value) => assertType(is.null_(value), "null" /* null */, value),
    class_: (value) => assertType(is.class_(value), "Class" /* class_ */, value),
    boolean: (value) => assertType(is.boolean(value), "boolean" /* boolean */, value),
    symbol: (value) => assertType(is.symbol(value), "symbol" /* symbol */, value),
    numericString: (value) => assertType(is.numericString(value), "string with a number" /* numericString */, value),
    array: (value) => assertType(is.array(value), "Array" /* Array */, value),
    buffer: (value) => assertType(is.buffer(value), "Buffer" /* Buffer */, value),
    nullOrUndefined: (value) => assertType(is.nullOrUndefined(value), "null or undefined" /* nullOrUndefined */, value),
    object: (value) => assertType(is.object(value), "Object" /* Object */, value),
    iterable: (value) => assertType(is.iterable(value), "Iterable" /* iterable */, value),
    asyncIterable: (value) => assertType(is.asyncIterable(value), "AsyncIterable" /* asyncIterable */, value),
    generator: (value) => assertType(is.generator(value), "Generator" /* Generator */, value),
    asyncGenerator: (value) => assertType(is.asyncGenerator(value), "AsyncGenerator" /* AsyncGenerator */, value),
    nativePromise: (value) => assertType(is.nativePromise(value), "native Promise" /* nativePromise */, value),
    promise: (value) => assertType(is.promise(value), "Promise" /* Promise */, value),
    generatorFunction: (value) => assertType(is.generatorFunction(value), "GeneratorFunction" /* GeneratorFunction */, value),
    asyncGeneratorFunction: (value) => assertType(is.asyncGeneratorFunction(value), "AsyncGeneratorFunction" /* AsyncGeneratorFunction */, value),
    // eslint-disable-next-line @typescript-eslint/ban-types
    asyncFunction: (value) => assertType(is.asyncFunction(value), "AsyncFunction" /* AsyncFunction */, value),
    // eslint-disable-next-line @typescript-eslint/ban-types
    boundFunction: (value) => assertType(is.boundFunction(value), "Function" /* Function */, value),
    regExp: (value) => assertType(is.regExp(value), "RegExp" /* RegExp */, value),
    date: (value) => assertType(is.date(value), "Date" /* Date */, value),
    error: (value) => assertType(is.error(value), "Error" /* Error */, value),
    map: (value) => assertType(is.map(value), "Map" /* Map */, value),
    set: (value) => assertType(is.set(value), "Set" /* Set */, value),
    weakMap: (value) => assertType(is.weakMap(value), "WeakMap" /* WeakMap */, value),
    weakSet: (value) => assertType(is.weakSet(value), "WeakSet" /* WeakSet */, value),
    int8Array: (value) => assertType(is.int8Array(value), "Int8Array" /* Int8Array */, value),
    uint8Array: (value) => assertType(is.uint8Array(value), "Uint8Array" /* Uint8Array */, value),
    uint8ClampedArray: (value) => assertType(is.uint8ClampedArray(value), "Uint8ClampedArray" /* Uint8ClampedArray */, value),
    int16Array: (value) => assertType(is.int16Array(value), "Int16Array" /* Int16Array */, value),
    uint16Array: (value) => assertType(is.uint16Array(value), "Uint16Array" /* Uint16Array */, value),
    int32Array: (value) => assertType(is.int32Array(value), "Int32Array" /* Int32Array */, value),
    uint32Array: (value) => assertType(is.uint32Array(value), "Uint32Array" /* Uint32Array */, value),
    float32Array: (value) => assertType(is.float32Array(value), "Float32Array" /* Float32Array */, value),
    float64Array: (value) => assertType(is.float64Array(value), "Float64Array" /* Float64Array */, value),
    bigInt64Array: (value) => assertType(is.bigInt64Array(value), "BigInt64Array" /* BigInt64Array */, value),
    bigUint64Array: (value) => assertType(is.bigUint64Array(value), "BigUint64Array" /* BigUint64Array */, value),
    arrayBuffer: (value) => assertType(is.arrayBuffer(value), "ArrayBuffer" /* ArrayBuffer */, value),
    sharedArrayBuffer: (value) => assertType(is.sharedArrayBuffer(value), "SharedArrayBuffer" /* SharedArrayBuffer */, value),
    dataView: (value) => assertType(is.dataView(value), "DataView" /* DataView */, value),
    urlInstance: (value) => assertType(is.urlInstance(value), "URL" /* URL */, value),
    urlString: (value) => assertType(is.urlString(value), "string with a URL" /* urlString */, value),
    truthy: (value) => assertType(is.truthy(value), "truthy" /* truthy */, value),
    falsy: (value) => assertType(is.falsy(value), "falsy" /* falsy */, value),
    nan: (value) => assertType(is.nan(value), "NaN" /* nan */, value),
    primitive: (value) => assertType(is.primitive(value), "primitive" /* primitive */, value),
    integer: (value) => assertType(is.integer(value), "integer" /* integer */, value),
    safeInteger: (value) => assertType(is.safeInteger(value), "integer" /* safeInteger */, value),
    plainObject: (value) => assertType(is.plainObject(value), "plain object" /* plainObject */, value),
    typedArray: (value) => assertType(is.typedArray(value), "TypedArray" /* typedArray */, value),
    arrayLike: (value) => assertType(is.arrayLike(value), "array-like" /* arrayLike */, value),
    domElement: (value) => assertType(is.domElement(value), "Element" /* domElement */, value),
    observable: (value) => assertType(is.observable(value), "Observable" /* Observable */, value),
    nodeStream: (value) => assertType(is.nodeStream(value), "Node.js Stream" /* nodeStream */, value),
    infinite: (value) => assertType(is.infinite(value), "infinite number" /* infinite */, value),
    emptyArray: (value) => assertType(is.emptyArray(value), "empty array" /* emptyArray */, value),
    nonEmptyArray: (value) => assertType(is.nonEmptyArray(value), "non-empty array" /* nonEmptyArray */, value),
    emptyString: (value) => assertType(is.emptyString(value), "empty string" /* emptyString */, value),
    nonEmptyString: (value) => assertType(is.nonEmptyString(value), "non-empty string" /* nonEmptyString */, value),
    emptyStringOrWhitespace: (value) => assertType(is.emptyStringOrWhitespace(value), "empty string or whitespace" /* emptyStringOrWhitespace */, value),
    emptyObject: (value) => assertType(is.emptyObject(value), "empty object" /* emptyObject */, value),
    nonEmptyObject: (value) => assertType(is.nonEmptyObject(value), "non-empty object" /* nonEmptyObject */, value),
    emptySet: (value) => assertType(is.emptySet(value), "empty set" /* emptySet */, value),
    nonEmptySet: (value) => assertType(is.nonEmptySet(value), "non-empty set" /* nonEmptySet */, value),
    emptyMap: (value) => assertType(is.emptyMap(value), "empty map" /* emptyMap */, value),
    nonEmptyMap: (value) => assertType(is.nonEmptyMap(value), "non-empty map" /* nonEmptyMap */, value),
    // Numbers.
    evenInteger: (value) => assertType(is.evenInteger(value), "even integer" /* evenInteger */, value),
    oddInteger: (value) => assertType(is.oddInteger(value), "odd integer" /* oddInteger */, value),
    // Two arguments.
    directInstanceOf: (instance, class_) => assertType(is.directInstanceOf(instance, class_), "T" /* directInstanceOf */, instance),
    inRange: (value, range) => assertType(is.inRange(value, range), "in range" /* inRange */, value),
    // Variadic functions.
    any: (predicate, ...values) => assertType(is.any(predicate, ...values), "predicate returns truthy for any value" /* any */, values),
    all: (predicate, ...values) => assertType(is.all(predicate, ...values), "predicate returns truthy for all values" /* all */, values)
};
// Some few keywords are reserved, but we'll populate them for Node.js users
// See https://github.com/Microsoft/TypeScript/issues/2536
Object.defineProperties(is, {
    class: {
        value: is.class_
    },
    function: {
        value: is.function_
    },
    null: {
        value: is.null_
    }
});
Object.defineProperties(exports.assert, {
    class: {
        value: exports.assert.class_
    },
    function: {
        value: exports.assert.function_
    },
    null: {
        value: exports.assert.null_
    }
});
exports.default = is;
// For CommonJS default export support
module.exports = is;
module.exports.default = is;
module.exports.assert = exports.assert;
});

unwrapExports(dist);

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
var wrappy_1 = wrappy;
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length-1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret
  }
}

var once_1 = wrappy_1(once);
var strict = wrappy_1(onceStrict);

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  });
});

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  f.called = false;
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f
}
once_1.strict = strict;

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once_1(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

var endOfStream = eos;

// we only need fs to get the ReadStream and WriteStream prototypes

var noop$1 = function () {};
var ancient = /^v?\.0/.test(process.version);

var isFn = function (fn) {
  return typeof fn === 'function'
};

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop$1) || stream instanceof (fs.WriteStream || noop$1)) && isFn(stream.close)
};

var isRequest$1 = function (stream) {
  return stream.setHeader && isFn(stream.abort)
};

var destroyer = function (stream, reading, writing, callback) {
  callback = once_1(callback);

  var closed = false;
  stream.on('close', function () {
    closed = true;
  });

  endOfStream(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true;
    callback();
  });

  var destroyed = false;
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true;

    if (isFS(stream)) return stream.close(noop$1) // use close for fs streams to avoid fd leaks
    if (isRequest$1(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'));
  }
};

var call = function (fn) {
  fn();
};

var pipe = function (from, to) {
  return from.pipe(to)
};

var pump = function () {
  var streams = Array.prototype.slice.call(arguments);
  var callback = isFn(streams[streams.length - 1] || noop$1) && streams.pop() || noop$1;

  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return
      destroys.forEach(call);
      callback(error);
    })
  });

  return streams.reduce(pipe)
};

var pump_1 = pump;

const {PassThrough: PassThroughStream} = Stream;

var bufferStream = options => {
	options = {...options};

	const {array} = options;
	let {encoding} = options;
	const isBuffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || isBuffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (isBuffer) {
		encoding = null;
	}

	const stream = new PassThroughStream({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	let length = 0;
	const chunks = [];

	stream.on('data', chunk => {
		chunks.push(chunk);

		if (objectMode) {
			length = chunks.length;
		} else {
			length += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return chunks;
		}

		return isBuffer ? Buffer.concat(chunks, length) : chunks.join('');
	};

	stream.getBufferedLength = () => length;

	return stream;
};

class MaxBufferError extends Error {
	constructor() {
		super('maxBuffer exceeded');
		this.name = 'MaxBufferError';
	}
}

async function getStream(inputStream, options) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	options = {
		maxBuffer: Infinity,
		...options
	};

	const {maxBuffer} = options;

	let stream;
	await new Promise((resolve, reject) => {
		const rejectPromise = error => {
			if (error) { // A null check
				error.bufferedData = stream.getBufferedValue();
			}

			reject(error);
		};

		stream = pump_1(inputStream, bufferStream(options), error => {
			if (error) {
				rejectPromise(error);
				return;
			}

			resolve();
		});

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				rejectPromise(new MaxBufferError());
			}
		});
	});

	return stream.getBufferedValue();
}

var getStream_1 = getStream;
// TODO: Remove this for the next major release
var _default = getStream;
var buffer = (stream, options) => getStream(stream, {...options, encoding: 'buffer'});
var array = (stream, options) => getStream(stream, {...options, array: true});
var MaxBufferError_1 = MaxBufferError;
getStream_1.default = _default;
getStream_1.buffer = buffer;
getStream_1.array = array;
getStream_1.MaxBufferError = MaxBufferError_1;

var source = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

const deferToConnect = (socket, fn) => {
    let listeners;
    if (typeof fn === 'function') {
        const connect = fn;
        listeners = { connect };
    }
    else {
        listeners = fn;
    }
    const hasConnectListener = typeof listeners.connect === 'function';
    const hasSecureConnectListener = typeof listeners.secureConnect === 'function';
    const hasCloseListener = typeof listeners.close === 'function';
    const onConnect = () => {
        if (hasConnectListener) {
            listeners.connect();
        }
        if (socket instanceof tls.TLSSocket && hasSecureConnectListener) {
            if (socket.authorized) {
                listeners.secureConnect();
            }
            else if (!socket.authorizationError) {
                socket.once('secureConnect', listeners.secureConnect);
            }
        }
        if (hasCloseListener) {
            socket.once('close', listeners.close);
        }
    };
    if (socket.writable && !socket.connecting) {
        onConnect();
    }
    else if (socket.connecting) {
        socket.once('connect', onConnect);
    }
    else if (socket.destroyed && hasCloseListener) {
        listeners.close(socket._hadError);
    }
};
exports.default = deferToConnect;
// For CommonJS default export support
module.exports = deferToConnect;
module.exports.default = deferToConnect;
});

unwrapExports(source);

var source$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

const nodejsMajorVersion = Number(process.versions.node.split('.')[0]);
const timer = (request) => {
    const timings = {
        start: Date.now(),
        socket: undefined,
        lookup: undefined,
        connect: undefined,
        secureConnect: undefined,
        upload: undefined,
        response: undefined,
        end: undefined,
        error: undefined,
        abort: undefined,
        phases: {
            wait: undefined,
            dns: undefined,
            tcp: undefined,
            tls: undefined,
            request: undefined,
            firstByte: undefined,
            download: undefined,
            total: undefined
        }
    };
    request.timings = timings;
    const handleError = (origin) => {
        const emit = origin.emit.bind(origin);
        origin.emit = (event, ...args) => {
            // Catches the `error` event
            if (event === 'error') {
                timings.error = Date.now();
                timings.phases.total = timings.error - timings.start;
                origin.emit = emit;
            }
            // Saves the original behavior
            return emit(event, ...args);
        };
    };
    handleError(request);
    request.prependOnceListener('abort', () => {
        timings.abort = Date.now();
        // Let the `end` response event be responsible for setting the total phase,
        // unless the Node.js major version is >= 13.
        if (!timings.response || nodejsMajorVersion >= 13) {
            timings.phases.total = Date.now() - timings.start;
        }
    });
    const onSocket = (socket) => {
        timings.socket = Date.now();
        timings.phases.wait = timings.socket - timings.start;
        const lookupListener = () => {
            timings.lookup = Date.now();
            timings.phases.dns = timings.lookup - timings.socket;
        };
        socket.prependOnceListener('lookup', lookupListener);
        source.default(socket, {
            connect: () => {
                timings.connect = Date.now();
                if (timings.lookup === undefined) {
                    socket.removeListener('lookup', lookupListener);
                    timings.lookup = timings.connect;
                    timings.phases.dns = timings.lookup - timings.socket;
                }
                timings.phases.tcp = timings.connect - timings.lookup;
                // This callback is called before flushing any data,
                // so we don't need to set `timings.phases.request` here.
            },
            secureConnect: () => {
                timings.secureConnect = Date.now();
                timings.phases.tls = timings.secureConnect - timings.connect;
            }
        });
    };
    if (request.socket) {
        onSocket(request.socket);
    }
    else {
        request.prependOnceListener('socket', onSocket);
    }
    const onUpload = () => {
        var _a;
        timings.upload = Date.now();
        timings.phases.request = timings.upload - (_a = timings.secureConnect, (_a !== null && _a !== void 0 ? _a : timings.connect));
    };
    const writableFinished = () => {
        if (typeof request.writableFinished === 'boolean') {
            return request.writableFinished;
        }
        // Node.js doesn't have `request.writableFinished` property
        return request.finished && request.outputSize === 0 && (!request.socket || request.socket.writableLength === 0);
    };
    if (writableFinished()) {
        onUpload();
    }
    else {
        request.prependOnceListener('finish', onUpload);
    }
    request.prependOnceListener('response', (response) => {
        timings.response = Date.now();
        timings.phases.firstByte = timings.response - timings.upload;
        response.timings = timings;
        handleError(response);
        response.prependOnceListener('end', () => {
            timings.end = Date.now();
            timings.phases.download = timings.end - timings.response;
            timings.phases.total = timings.end - timings.start;
        });
    });
    return timings;
};
exports.default = timer;
// For CommonJS default export support
module.exports = timer;
module.exports.default = timer;
});

unwrapExports(source$1);

const {
	V4MAPPED,
	ADDRCONFIG,
	ALL,
	promises: {
		Resolver: AsyncResolver
	},
	lookup: dnsLookup
} = dns;
const {promisify} = util;


const kCacheableLookupCreateConnection = Symbol('cacheableLookupCreateConnection');
const kCacheableLookupInstance = Symbol('cacheableLookupInstance');
const kExpires = Symbol('expires');

const supportsALL = typeof ALL === 'number';

const verifyAgent = agent => {
	if (!(agent && typeof agent.createConnection === 'function')) {
		throw new Error('Expected an Agent instance as the first argument');
	}
};

const map4to6 = entries => {
	for (const entry of entries) {
		if (entry.family === 6) {
			continue;
		}

		entry.address = `::ffff:${entry.address}`;
		entry.family = 6;
	}
};

const getIfaceInfo = () => {
	let has4 = false;
	let has6 = false;

	for (const device of Object.values(os.networkInterfaces())) {
		for (const iface of device) {
			if (iface.internal) {
				continue;
			}

			if (iface.family === 'IPv6') {
				has6 = true;
			} else {
				has4 = true;
			}

			if (has4 && has6) {
				return {has4, has6};
			}
		}
	}

	return {has4, has6};
};

const isIterable = map => {
	return Symbol.iterator in map;
};

const ttl = {ttl: true};
const all = {all: true};

class CacheableLookup {
	constructor({
		cache = new Map(),
		maxTtl = Infinity,
		fallbackDuration = 3600,
		errorTtl = 0.15,
		resolver = new AsyncResolver(),
		lookup = dnsLookup
	} = {}) {
		this.maxTtl = maxTtl;
		this.errorTtl = errorTtl;

		this._cache = cache;
		this._resolver = resolver;
		this._dnsLookup = promisify(lookup);

		if (this._resolver instanceof AsyncResolver) {
			this._resolve4 = this._resolver.resolve4.bind(this._resolver);
			this._resolve6 = this._resolver.resolve6.bind(this._resolver);
		} else {
			this._resolve4 = promisify(this._resolver.resolve4.bind(this._resolver));
			this._resolve6 = promisify(this._resolver.resolve6.bind(this._resolver));
		}

		this._iface = getIfaceInfo();

		this._pending = {};
		this._nextRemovalTime = false;
		this._hostnamesToFallback = new Set();

		if (fallbackDuration < 1) {
			this._fallback = false;
		} else {
			this._fallback = true;

			const interval = setInterval(() => {
				this._hostnamesToFallback.clear();
			}, fallbackDuration * 1000);

			/* istanbul ignore next: There is no `interval.unref()` when running inside an Electron renderer */
			if (interval.unref) {
				interval.unref();
			}
		}

		this.lookup = this.lookup.bind(this);
		this.lookupAsync = this.lookupAsync.bind(this);
	}

	set servers(servers) {
		this.clear();

		this._resolver.setServers(servers);
	}

	get servers() {
		return this._resolver.getServers();
	}

	lookup(hostname, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		} else if (typeof options === 'number') {
			options = {
				family: options
			};
		}

		if (!callback) {
			throw new Error('Callback must be a function.');
		}

		// eslint-disable-next-line promise/prefer-await-to-then
		this.lookupAsync(hostname, options).then(result => {
			if (options.all) {
				callback(null, result);
			} else {
				callback(null, result.address, result.family, result.expires, result.ttl);
			}
		}, callback);
	}

	async lookupAsync(hostname, options = {}) {
		if (typeof options === 'number') {
			options = {
				family: options
			};
		}

		let cached = await this.query(hostname);

		if (options.family === 6) {
			const filtered = cached.filter(entry => entry.family === 6);

			if (options.hints & V4MAPPED) {
				if ((supportsALL && options.hints & ALL) || filtered.length === 0) {
					map4to6(cached);
				} else {
					cached = filtered;
				}
			} else {
				cached = filtered;
			}
		} else if (options.family === 4) {
			cached = cached.filter(entry => entry.family === 4);
		}

		if (options.hints & ADDRCONFIG) {
			const {_iface} = this;
			cached = cached.filter(entry => entry.family === 6 ? _iface.has6 : _iface.has4);
		}

		if (cached.length === 0) {
			const error = new Error(`cacheableLookup ENOTFOUND ${hostname}`);
			error.code = 'ENOTFOUND';
			error.hostname = hostname;

			throw error;
		}

		if (options.all) {
			return cached;
		}

		return cached[0];
	}

	async query(hostname) {
		let cached = await this._cache.get(hostname);

		if (!cached) {
			const pending = this._pending[hostname];

			if (pending) {
				cached = await pending;
			} else {
				const newPromise = this.queryAndCache(hostname);
				this._pending[hostname] = newPromise;

				cached = await newPromise;
			}
		}

		cached = cached.map(entry => {
			return {...entry};
		});

		return cached;
	}

	async _resolve(hostname) {
		const wrap = async promise => {
			try {
				return await promise;
			} catch (error) {
				if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
					return [];
				}

				throw error;
			}
		};

		// ANY is unsafe as it doesn't trigger new queries in the underlying server.
		const [A, AAAA] = await Promise.all([
			this._resolve4(hostname, ttl),
			this._resolve6(hostname, ttl)
		].map(promise => wrap(promise)));

		let aTtl = 0;
		let aaaaTtl = 0;
		let cacheTtl = 0;

		const now = Date.now();

		for (const entry of A) {
			entry.family = 4;
			entry.expires = now + (entry.ttl * 1000);

			aTtl = Math.max(aTtl, entry.ttl);
		}

		for (const entry of AAAA) {
			entry.family = 6;
			entry.expires = now + (entry.ttl * 1000);

			aaaaTtl = Math.max(aaaaTtl, entry.ttl);
		}

		if (A.length > 0) {
			if (AAAA.length > 0) {
				cacheTtl = Math.min(aTtl, aaaaTtl);
			} else {
				cacheTtl = aTtl;
			}
		} else {
			cacheTtl = aaaaTtl;
		}

		return {
			entries: [
				...A,
				...AAAA
			],
			cacheTtl
		};
	}

	async _lookup(hostname) {
		try {
			const entries = await this._dnsLookup(hostname, {
				all: true
			});

			return {
				entries,
				cacheTtl: 0
			};
		} catch (_) {
			return {
				entries: [],
				cacheTtl: 0
			};
		}
	}

	async _set(hostname, data, cacheTtl) {
		if (this.maxTtl > 0 && cacheTtl > 0) {
			cacheTtl = Math.min(cacheTtl, this.maxTtl) * 1000;
			data[kExpires] = Date.now() + cacheTtl;

			try {
				await this._cache.set(hostname, data, cacheTtl);
			} catch (error) {
				this.lookupAsync = async () => {
					const cacheError = new Error('Cache Error. Please recreate the CacheableLookup instance.');
					cacheError.cause = error;

					throw cacheError;
				};
			}

			if (isIterable(this._cache)) {
				this._tick(cacheTtl);
			}
		}
	}

	async queryAndCache(hostname) {
		if (this._hostnamesToFallback.has(hostname)) {
			return this._dnsLookup(hostname, all);
		}

		try {
			let query = await this._resolve(hostname);

			if (query.entries.length === 0 && this._fallback) {
				query = await this._lookup(hostname);

				if (query.entries.length !== 0) {
					// Use `dns.lookup(...)` for that particular hostname
					this._hostnamesToFallback.add(hostname);
				}
			}

			const cacheTtl = query.entries.length === 0 ? this.errorTtl : query.cacheTtl;
			await this._set(hostname, query.entries, cacheTtl);

			delete this._pending[hostname];

			return query.entries;
		} catch (error) {
			delete this._pending[hostname];

			throw error;
		}
	}

	_tick(ms) {
		const nextRemovalTime = this._nextRemovalTime;

		if (!nextRemovalTime || ms < nextRemovalTime) {
			clearTimeout(this._removalTimeout);

			this._nextRemovalTime = ms;

			this._removalTimeout = setTimeout(() => {
				this._nextRemovalTime = false;

				let nextExpiry = Infinity;

				const now = Date.now();

				for (const [hostname, entries] of this._cache) {
					const expires = entries[kExpires];

					if (now >= expires) {
						this._cache.delete(hostname);
					} else if (expires < nextExpiry) {
						nextExpiry = expires;
					}
				}

				if (nextExpiry !== Infinity) {
					this._tick(nextExpiry - now);
				}
			}, ms);

			/* istanbul ignore next: There is no `timeout.unref()` when running inside an Electron renderer */
			if (this._removalTimeout.unref) {
				this._removalTimeout.unref();
			}
		}
	}

	install(agent) {
		verifyAgent(agent);

		if (kCacheableLookupCreateConnection in agent) {
			throw new Error('CacheableLookup has been already installed');
		}

		agent[kCacheableLookupCreateConnection] = agent.createConnection;
		agent[kCacheableLookupInstance] = this;

		agent.createConnection = (options, callback) => {
			if (!('lookup' in options)) {
				options.lookup = this.lookup;
			}

			return agent[kCacheableLookupCreateConnection](options, callback);
		};
	}

	uninstall(agent) {
		verifyAgent(agent);

		if (agent[kCacheableLookupCreateConnection]) {
			if (agent[kCacheableLookupInstance] !== this) {
				throw new Error('The agent is not owned by this CacheableLookup instance');
			}

			agent.createConnection = agent[kCacheableLookupCreateConnection];

			delete agent[kCacheableLookupCreateConnection];
			delete agent[kCacheableLookupInstance];
		}
	}

	updateInterfaceInfo() {
		const {_iface} = this;

		this._iface = getIfaceInfo();

		if ((_iface.has4 && !this._iface.has4) || (_iface.has6 && !this._iface.has6)) {
			this._cache.clear();
		}
	}

	clear(hostname) {
		if (hostname) {
			this._cache.delete(hostname);
			return;
		}

		this._cache.clear();
	}
}

var source$2 = CacheableLookup;
var _default$1 = CacheableLookup;
source$2.default = _default$1;

// TODO: Use the `URL` global when targeting Node.js 10
const URLParser = typeof URL === 'undefined' ? Url.URL : URL;

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
const DATA_URL_DEFAULT_CHARSET = 'us-ascii';

const testParameter = (name, filters) => {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
};

const normalizeDataURL = (urlString, {stripHash}) => {
	const parts = urlString.match(/^data:(.*?),(.*?)(?:#(.*))?$/);

	if (!parts) {
		throw new Error(`Invalid URL: ${urlString}`);
	}

	const mediaType = parts[1].split(';');
	const body = parts[2];
	const hash = stripHash ? '' : parts[3];

	let base64 = false;

	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop();
		base64 = true;
	}

	// Lowercase MIME type
	const mimeType = (mediaType.shift() || '').toLowerCase();
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim());

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase();

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return '';
				}
			}

			return `${key}${value ? `=${value}` : ''}`;
		})
		.filter(Boolean);

	const normalizedMediaType = [
		...attributes
	];

	if (base64) {
		normalizedMediaType.push('base64');
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType);
	}

	return `data:${normalizedMediaType.join(';')},${base64 ? body.trim() : body}${hash ? `#${hash}` : ''}`;
};

const normalizeUrl = (urlString, options) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: false,
		stripAuthentication: true,
		stripHash: false,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	};

	// TODO: Remove this at some point in the future
	if (Reflect.has(options, 'normalizeHttps')) {
		throw new Error('options.normalizeHttps is renamed to options.forceHttp');
	}

	if (Reflect.has(options, 'normalizeHttp')) {
		throw new Error('options.normalizeHttp is renamed to options.forceHttps');
	}

	if (Reflect.has(options, 'stripFragment')) {
		throw new Error('options.stripFragment is renamed to options.stripHash');
	}

	urlString = urlString.trim();

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options);
	}

	const hasRelativeProtocol = urlString.startsWith('//');
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
	}

	const urlObj = new URLParser(urlString);

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
	}

	if (options.forceHttp && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:';
	}

	if (options.forceHttps && urlObj.protocol === 'http:') {
		urlObj.protocol = 'https:';
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObj.username = '';
		urlObj.password = '';
	}

	// Remove hash
	if (options.stripHash) {
		urlObj.hash = '';
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		// TODO: Use the following instead when targeting Node.js 10
		// `urlObj.pathname = urlObj.pathname.replace(/(?<!https?:)\/{2,}/g, '/');`
		urlObj.pathname = urlObj.pathname.replace(/((?!:).|^)\/{2,}/g, (_, p1) => {
			if (/^(?!\/)/g.test(p1)) {
				return `${p1}/`;
			}

			return '/';
		});
	}

	// Decode URI octets
	if (urlObj.pathname) {
		urlObj.pathname = decodeURI(urlObj.pathname);
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/');
		const lastComponent = pathComponents[pathComponents.length - 1];

		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
		}
	}

	if (urlObj.hostname) {
		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (options.stripWWW && /^www\.([a-z\-\d]{2,63})\.([a-z.]{2,5})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 2).
			// The extension should be max 5 at length (min: 2).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
		}
	}

	// Remove query unwanted parameters
	if (Array.isArray(options.removeQueryParameters)) {
		for (const key of [...urlObj.searchParams.keys()]) {
			if (testParameter(key, options.removeQueryParameters)) {
				urlObj.searchParams.delete(key);
			}
		}
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort();
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '');
	}

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString();

	// Remove ending `/`
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//');
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '');
	}

	return urlString;
};

var normalizeUrl_1 = normalizeUrl;
// TODO: Remove this for the next major release
var _default$2 = normalizeUrl;
normalizeUrl_1.default = _default$2;

// rfc7231 6.1
const statusCodeCacheableByDefault = new Set([
    200,
    203,
    204,
    206,
    300,
    301,
    404,
    405,
    410,
    414,
    501,
]);

// This implementation does not understand partial responses (206)
const understoodStatuses = new Set([
    200,
    203,
    204,
    300,
    301,
    302,
    303,
    307,
    308,
    404,
    405,
    410,
    414,
    501,
]);

const errorStatusCodes = new Set([
    500,
    502,
    503, 
    504,
]);

const hopByHopHeaders = {
    date: true, // included, because we add Age update Date
    connection: true,
    'keep-alive': true,
    'proxy-authenticate': true,
    'proxy-authorization': true,
    te: true,
    trailer: true,
    'transfer-encoding': true,
    upgrade: true,
};

const excludedFromRevalidationUpdate = {
    // Since the old body is reused, it doesn't make sense to change properties of the body
    'content-length': true,
    'content-encoding': true,
    'transfer-encoding': true,
    'content-range': true,
};

function toNumberOrZero(s) {
    const n = parseInt(s, 10);
    return isFinite(n) ? n : 0;
}

// RFC 5861
function isErrorResponse(response) {
    // consider undefined response as faulty
    if(!response) {
        return true
    }
    return errorStatusCodes.has(response.status);
}

function parseCacheControl(header) {
    const cc = {};
    if (!header) return cc;

    // TODO: When there is more than one value present for a given directive (e.g., two Expires header fields, multiple Cache-Control: max-age directives),
    // the directive's value is considered invalid. Caches are encouraged to consider responses that have invalid freshness information to be stale
    const parts = header.trim().split(/\s*,\s*/); // TODO: lame parsing
    for (const part of parts) {
        const [k, v] = part.split(/\s*=\s*/, 2);
        cc[k] = v === undefined ? true : v.replace(/^"|"$/g, ''); // TODO: lame unquoting
    }

    return cc;
}

function formatCacheControl(cc) {
    let parts = [];
    for (const k in cc) {
        const v = cc[k];
        parts.push(v === true ? k : k + '=' + v);
    }
    if (!parts.length) {
        return undefined;
    }
    return parts.join(', ');
}

var httpCacheSemantics = class CachePolicy {
    constructor(
        req,
        res,
        {
            shared,
            cacheHeuristic,
            immutableMinTimeToLive,
            ignoreCargoCult,
            _fromObject,
        } = {}
    ) {
        if (_fromObject) {
            this._fromObject(_fromObject);
            return;
        }

        if (!res || !res.headers) {
            throw Error('Response headers missing');
        }
        this._assertRequestHasHeaders(req);

        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._cacheHeuristic =
            undefined !== cacheHeuristic ? cacheHeuristic : 0.1; // 10% matches IE
        this._immutableMinTtl =
            undefined !== immutableMinTimeToLive
                ? immutableMinTimeToLive
                : 24 * 3600 * 1000;

        this._status = 'status' in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = 'method' in req ? req.method : 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null; // Don't keep all request headers if they won't be used
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        // Assume that if someone uses legacy, non-standard uncecessary options they don't understand caching,
        // so there's no point stricly adhering to the blindly copy&pasted directives.
        if (
            ignoreCargoCult &&
            'pre-check' in this._rescc &&
            'post-check' in this._rescc
        ) {
            delete this._rescc['pre-check'];
            delete this._rescc['post-check'];
            delete this._rescc['no-cache'];
            delete this._rescc['no-store'];
            delete this._rescc['must-revalidate'];
            this._resHeaders = Object.assign({}, this._resHeaders, {
                'cache-control': formatCacheControl(this._rescc),
            });
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        // When the Cache-Control header field is not present in a request, caches MUST consider the no-cache request pragma-directive
        // as having the same effect as if "Cache-Control: no-cache" were present (see Section 5.2.1).
        if (
            res.headers['cache-control'] == null &&
            /no-cache/.test(res.headers.pragma)
        ) {
            this._rescc['no-cache'] = true;
        }
    }

    now() {
        return Date.now();
    }

    storable() {
        // The "no-store" request directive indicates that a cache MUST NOT store any part of either this request or any response to it.
        return !!(
            !this._reqcc['no-store'] &&
            // A cache MUST NOT store a response to any request, unless:
            // The request method is understood by the cache and defined as being cacheable, and
            ('GET' === this._method ||
                'HEAD' === this._method ||
                ('POST' === this._method && this._hasExplicitExpiration())) &&
            // the response status code is understood by the cache, and
            understoodStatuses.has(this._status) &&
            // the "no-store" cache directive does not appear in request or response header fields, and
            !this._rescc['no-store'] &&
            // the "private" response directive does not appear in the response, if the cache is shared, and
            (!this._isShared || !this._rescc.private) &&
            // the Authorization header field does not appear in the request, if the cache is shared,
            (!this._isShared ||
                this._noAuthorization ||
                this._allowsStoringAuthenticated()) &&
            // the response either:
            // contains an Expires header field, or
            (this._resHeaders.expires ||
                // contains a max-age response directive, or
                // contains a s-maxage response directive and the cache is shared, or
                // contains a public response directive.
                this._rescc['max-age'] ||
                (this._isShared && this._rescc['s-maxage']) ||
                this._rescc.public ||
                // has a status code that is defined as cacheable by default
                statusCodeCacheableByDefault.has(this._status))
        );
    }

    _hasExplicitExpiration() {
        // 4.2.1 Calculating Freshness Lifetime
        return (
            (this._isShared && this._rescc['s-maxage']) ||
            this._rescc['max-age'] ||
            this._resHeaders.expires
        );
    }

    _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
            throw Error('Request headers missing');
        }
    }

    satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);

        // When presented with a request, a cache MUST NOT reuse a stored response, unless:
        // the presented request does not contain the no-cache pragma (Section 5.4), nor the no-cache cache directive,
        // unless the stored response is successfully validated (Section 4.3), and
        const requestCC = parseCacheControl(req.headers['cache-control']);
        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) {
            return false;
        }

        if (requestCC['max-age'] && this.age() > requestCC['max-age']) {
            return false;
        }

        if (
            requestCC['min-fresh'] &&
            this.timeToLive() < 1000 * requestCC['min-fresh']
        ) {
            return false;
        }

        // the stored response is either:
        // fresh, or allowed to be served stale
        if (this.stale()) {
            const allowsStale =
                requestCC['max-stale'] &&
                !this._rescc['must-revalidate'] &&
                (true === requestCC['max-stale'] ||
                    requestCC['max-stale'] > this.age() - this.maxAge());
            if (!allowsStale) {
                return false;
            }
        }

        return this._requestMatches(req, false);
    }

    _requestMatches(req, allowHeadMethod) {
        // The presented effective request URI and that of the stored response match, and
        return (
            (!this._url || this._url === req.url) &&
            this._host === req.headers.host &&
            // the request method associated with the stored response allows it to be used for the presented request, and
            (!req.method ||
                this._method === req.method ||
                (allowHeadMethod && 'HEAD' === req.method)) &&
            // selecting header fields nominated by the stored response (if any) match those presented, and
            this._varyMatches(req)
        );
    }

    _allowsStoringAuthenticated() {
        //  following Cache-Control response directives (Section 5.2.2) have such an effect: must-revalidate, public, and s-maxage.
        return (
            this._rescc['must-revalidate'] ||
            this._rescc.public ||
            this._rescc['s-maxage']
        );
    }

    _varyMatches(req) {
        if (!this._resHeaders.vary) {
            return true;
        }

        // A Vary header field-value of "*" always fails to match
        if (this._resHeaders.vary === '*') {
            return false;
        }

        const fields = this._resHeaders.vary
            .trim()
            .toLowerCase()
            .split(/\s*,\s*/);
        for (const name of fields) {
            if (req.headers[name] !== this._reqHeaders[name]) return false;
        }
        return true;
    }

    _copyWithoutHopByHopHeaders(inHeaders) {
        const headers = {};
        for (const name in inHeaders) {
            if (hopByHopHeaders[name]) continue;
            headers[name] = inHeaders[name];
        }
        // 9.1.  Connection
        if (inHeaders.connection) {
            const tokens = inHeaders.connection.trim().split(/\s*,\s*/);
            for (const name of tokens) {
                delete headers[name];
            }
        }
        if (headers.warning) {
            const warnings = headers.warning.split(/,/).filter(warning => {
                return !/^\s*1[0-9][0-9]/.test(warning);
            });
            if (!warnings.length) {
                delete headers.warning;
            } else {
                headers.warning = warnings.join(',').trim();
            }
        }
        return headers;
    }

    responseHeaders() {
        const headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        const age = this.age();

        // A cache SHOULD generate 113 warning if it heuristically chose a freshness
        // lifetime greater than 24 hours and the response's age is greater than 24 hours.
        if (
            age > 3600 * 24 &&
            !this._hasExplicitExpiration() &&
            this.maxAge() > 3600 * 24
        ) {
            headers.warning =
                (headers.warning ? `${headers.warning}, ` : '') +
                '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        headers.date = new Date(this.now()).toUTCString();
        return headers;
    }

    /**
     * Value of the Date response header or current time if Date was invalid
     * @return timestamp
     */
    date() {
        const serverDate = Date.parse(this._resHeaders.date);
        if (isFinite(serverDate)) {
            return serverDate;
        }
        return this._responseTime;
    }

    /**
     * Value of the Age header, in seconds, updated for the current time.
     * May be fractional.
     *
     * @return Number
     */
    age() {
        let age = this._ageValue();

        const residentTime = (this.now() - this._responseTime) / 1000;
        return age + residentTime;
    }

    _ageValue() {
        return toNumberOrZero(this._resHeaders.age);
    }

    /**
     * Value of applicable max-age (or heuristic equivalent) in seconds. This counts since response's `Date`.
     *
     * For an up-to-date value, see `timeToLive()`.
     *
     * @return Number
     */
    maxAge() {
        if (!this.storable() || this._rescc['no-cache']) {
            return 0;
        }

        // Shared responses with cookies are cacheable according to the RFC, but IMHO it'd be unwise to do so by default
        // so this implementation requires explicit opt-in via public header
        if (
            this._isShared &&
            (this._resHeaders['set-cookie'] &&
                !this._rescc.public &&
                !this._rescc.immutable)
        ) {
            return 0;
        }

        if (this._resHeaders.vary === '*') {
            return 0;
        }

        if (this._isShared) {
            if (this._rescc['proxy-revalidate']) {
                return 0;
            }
            // if a response includes the s-maxage directive, a shared cache recipient MUST ignore the Expires field.
            if (this._rescc['s-maxage']) {
                return toNumberOrZero(this._rescc['s-maxage']);
            }
        }

        // If a response includes a Cache-Control field with the max-age directive, a recipient MUST ignore the Expires field.
        if (this._rescc['max-age']) {
            return toNumberOrZero(this._rescc['max-age']);
        }

        const defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;

        const serverDate = this.date();
        if (this._resHeaders.expires) {
            const expires = Date.parse(this._resHeaders.expires);
            // A cache recipient MUST interpret invalid date formats, especially the value "0", as representing a time in the past (i.e., "already expired").
            if (Number.isNaN(expires) || expires < serverDate) {
                return 0;
            }
            return Math.max(defaultMinTtl, (expires - serverDate) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            const lastModified = Date.parse(this._resHeaders['last-modified']);
            if (isFinite(lastModified) && serverDate > lastModified) {
                return Math.max(
                    defaultMinTtl,
                    ((serverDate - lastModified) / 1000) * this._cacheHeuristic
                );
            }
        }

        return defaultMinTtl;
    }

    timeToLive() {
        const age = this.maxAge() - this.age();
        const staleIfErrorAge = age + toNumberOrZero(this._rescc['stale-if-error']);
        const staleWhileRevalidateAge = age + toNumberOrZero(this._rescc['stale-while-revalidate']);
        return Math.max(0, age, staleIfErrorAge, staleWhileRevalidateAge) * 1000;
    }

    stale() {
        return this.maxAge() <= this.age();
    }

    _useStaleIfError() {
        return this.maxAge() + toNumberOrZero(this._rescc['stale-if-error']) > this.age();
    }

    useStaleWhileRevalidate() {
        return this.maxAge() + toNumberOrZero(this._rescc['stale-while-revalidate']) > this.age();
    }

    static fromObject(obj) {
        return new this(undefined, undefined, { _fromObject: obj });
    }

    _fromObject(obj) {
        if (this._responseTime) throw Error('Reinitialized');
        if (!obj || obj.v !== 1) throw Error('Invalid serialization');

        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl =
            obj.imm !== undefined ? obj.imm : 24 * 3600 * 1000;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
    }

    toObject() {
        return {
            v: 1,
            t: this._responseTime,
            sh: this._isShared,
            ch: this._cacheHeuristic,
            imm: this._immutableMinTtl,
            st: this._status,
            resh: this._resHeaders,
            rescc: this._rescc,
            m: this._method,
            u: this._url,
            h: this._host,
            a: this._noAuthorization,
            reqh: this._reqHeaders,
            reqcc: this._reqcc,
        };
    }

    /**
     * Headers for sending to the origin server to revalidate stale response.
     * Allows server to return 304 to allow reuse of the previous response.
     *
     * Hop by hop headers are always stripped.
     * Revalidation headers may be added or removed, depending on request.
     */
    revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        const headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);

        // This implementation does not understand range requests
        delete headers['if-range'];

        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
            // revalidation allowed via HEAD
            // not for the same resource, or wasn't allowed to be cached anyway
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        /* MUST send that entity-tag in any cache validation request (using If-Match or If-None-Match) if an entity-tag has been provided by the origin server. */
        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match']
                ? `${headers['if-none-match']}, ${this._resHeaders.etag}`
                : this._resHeaders.etag;
        }

        // Clients MAY issue simple (non-subrange) GET requests with either weak validators or strong validators. Clients MUST NOT use weak validators in other forms of request.
        const forbidsWeakValidators =
            headers['accept-ranges'] ||
            headers['if-match'] ||
            headers['if-unmodified-since'] ||
            (this._method && this._method != 'GET');

        /* SHOULD send the Last-Modified value in non-subrange cache validation requests (using If-Modified-Since) if only a Last-Modified value has been provided by the origin server.
        Note: This implementation does not understand partial responses (206) */
        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];

            if (headers['if-none-match']) {
                const etags = headers['if-none-match']
                    .split(/,/)
                    .filter(etag => {
                        return !/^\s*W\//.test(etag);
                    });
                if (!etags.length) {
                    delete headers['if-none-match'];
                } else {
                    headers['if-none-match'] = etags.join(',').trim();
                }
            }
        } else if (
            this._resHeaders['last-modified'] &&
            !headers['if-modified-since']
        ) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    }

    /**
     * Creates new CachePolicy with information combined from the previews response,
     * and the new revalidation response.
     *
     * Returns {policy, modified} where modified is a boolean indicating
     * whether the response body has been modified, and old cached body can't be used.
     *
     * @return {Object} {policy: CachePolicy, modified: Boolean}
     */
    revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if(this._useStaleIfError() && isErrorResponse(response)) {  // I consider the revalidation request unsuccessful
          return {
            modified: false,
            matches: false,
            policy: this,
          };
        }
        if (!response || !response.headers) {
            throw Error('Response headers missing');
        }

        // These aren't going to be supported exactly, since one CachePolicy object
        // doesn't know about all the other cached objects.
        let matches = false;
        if (response.status !== undefined && response.status != 304) {
            matches = false;
        } else if (
            response.headers.etag &&
            !/^\s*W\//.test(response.headers.etag)
        ) {
            // "All of the stored responses with the same strong validator are selected.
            // If none of the stored responses contain the same strong validator,
            // then the cache MUST NOT use the new response to update any stored responses."
            matches =
                this._resHeaders.etag &&
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                    response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
            // "If the new response contains a weak validator and that validator corresponds
            // to one of the cache's stored responses,
            // then the most recent of those matching stored responses is selected for update."
            matches =
                this._resHeaders.etag.replace(/^\s*W\//, '') ===
                response.headers.etag.replace(/^\s*W\//, '');
        } else if (this._resHeaders['last-modified']) {
            matches =
                this._resHeaders['last-modified'] ===
                response.headers['last-modified'];
        } else {
            // If the new response does not include any form of validator (such as in the case where
            // a client generates an If-Modified-Since request from a source other than the Last-Modified
            // response header field), and there is only one stored response, and that stored response also
            // lacks a validator, then that stored response is selected for update.
            if (
                !this._resHeaders.etag &&
                !this._resHeaders['last-modified'] &&
                !response.headers.etag &&
                !response.headers['last-modified']
            ) {
                matches = true;
            }
        }

        if (!matches) {
            return {
                policy: new this.constructor(request, response),
                // Client receiving 304 without body, even if it's invalid/mismatched has no option
                // but to reuse a cached body. We don't have a good way to tell clients to do
                // error recovery in such case.
                modified: response.status != 304,
                matches: false,
            };
        }

        // use other header fields provided in the 304 (Not Modified) response to replace all instances
        // of the corresponding header fields in the stored response.
        const headers = {};
        for (const k in this._resHeaders) {
            headers[k] =
                k in response.headers && !excludedFromRevalidationUpdate[k]
                    ? response.headers[k]
                    : this._resHeaders[k];
        }

        const newResponse = Object.assign({}, response, {
            status: this._status,
            method: this._method,
            headers,
        });
        return {
            policy: new this.constructor(request, newResponse, {
                shared: this._isShared,
                cacheHeuristic: this._cacheHeuristic,
                immutableMinTimeToLive: this._immutableMinTtl,
            }),
            modified: false,
            matches: true,
        };
    }
};

var lowercaseKeys = object => {
	const result = {};

	for (const [key, value] of Object.entries(object)) {
		result[key.toLowerCase()] = value;
	}

	return result;
};

const Readable = Stream.Readable;


class Response extends Readable {
	constructor(statusCode, headers, body, url) {
		if (typeof statusCode !== 'number') {
			throw new TypeError('Argument `statusCode` should be a number');
		}
		if (typeof headers !== 'object') {
			throw new TypeError('Argument `headers` should be an object');
		}
		if (!(body instanceof Buffer)) {
			throw new TypeError('Argument `body` should be a buffer');
		}
		if (typeof url !== 'string') {
			throw new TypeError('Argument `url` should be a string');
		}

		super();
		this.statusCode = statusCode;
		this.headers = lowercaseKeys(headers);
		this.body = body;
		this.url = url;
	}

	_read() {
		this.push(this.body);
		this.push(null);
	}
}

var src = Response;

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
	'destroy',
	'setTimeout',
	'socket',
	'headers',
	'trailers',
	'rawHeaders',
	'statusCode',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'rawTrailers',
	'statusMessage'
];

var mimicResponse = (fromStream, toStream) => {
	const fromProps = new Set(Object.keys(fromStream).concat(knownProps));

	for (const prop of fromProps) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			continue;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	}
};

const PassThrough = Stream.PassThrough;


const cloneResponse = response => {
	if (!(response && response.pipe)) {
		throw new TypeError('Parameter `response` must be a response stream.');
	}

	const clone = new PassThrough();
	mimicResponse(response, clone);

	return response.pipe(clone);
};

var src$1 = cloneResponse;

//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

var stringify = function stringify (o) {
  if('undefined' == typeof o) return o

  if(o && Buffer.isBuffer(o))
    return JSON.stringify(':base64:' + o.toString('base64'))

  if(o && o.toJSON)
    o =  o.toJSON();

  if(o && 'object' === typeof o) {
    var s = '';
    var array = Array.isArray(o);
    s = array ? '[' : '{';
    var first = true;

    for(var k in o) {
      var ignore = 'function' == typeof o[k] || (!array && 'undefined' === typeof o[k]);
      if(Object.hasOwnProperty.call(o, k) && !ignore) {
        if(!first)
          s += ',';
        first = false;
        if (array) {
          if(o[k] == undefined)
            s += 'null';
          else
            s += stringify(o[k]);
        } else if (o[k] !== void(0)) {
          s += stringify(k) + ':' + stringify(o[k]);
        }
      }
    }

    s += array ? ']' : '}';

    return s
  } else if ('string' === typeof o) {
    return JSON.stringify(/^:/.test(o) ? ':' + o : o)
  } else if ('undefined' === typeof o) {
    return 'null';
  } else
    return JSON.stringify(o)
};

var parse = function (s) {
  return JSON.parse(s, function (key, value) {
    if('string' === typeof value) {
      if(/^:base64:/.test(value))
        return Buffer.from(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
};

var jsonBuffer = {
	stringify: stringify,
	parse: parse
};

const loadStore = opts => {
	if (opts.adapter || opts.uri) {
		const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
		return new (commonjsRequire())(opts);
	}

	return new Map();
};

class Keyv extends events {
	constructor(uri, opts) {
		super();
		this.opts = Object.assign(
			{
				namespace: 'keyv',
				serialize: jsonBuffer.stringify,
				deserialize: jsonBuffer.parse
			},
			(typeof uri === 'string') ? { uri } : uri,
			opts
		);

		if (!this.opts.store) {
			const adapterOpts = Object.assign({}, this.opts);
			this.opts.store = loadStore(adapterOpts);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', err => this.emit('error', err));
		}

		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	get(key, opts) {
		const keyPrefixed = this._getKeyPrefix(key);
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => store.get(keyPrefixed))
			.then(data => {
				return (typeof data === 'string') ? this.opts.deserialize(data) : data;
			})
			.then(data => {
				if (data === undefined) {
					return undefined;
				}

				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					return undefined;
				}

				return (opts && opts.raw) ? data : data.value;
			});
	}

	set(key, value, ttl) {
		const keyPrefixed = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}

		if (ttl === 0) {
			ttl = undefined;
		}

		const { store } = this.opts;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return this.opts.serialize(value);
			})
			.then(value => store.set(keyPrefixed, value, ttl))
			.then(() => true);
	}

	delete(key) {
		const keyPrefixed = this._getKeyPrefix(key);
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => store.delete(keyPrefixed));
	}

	clear() {
		const { store } = this.opts;
		return Promise.resolve()
			.then(() => store.clear());
	}
}

var src$2 = Keyv;

class CacheableRequest {
	constructor(request, cacheAdapter) {
		if (typeof request !== 'function') {
			throw new TypeError('Parameter `request` must be a function');
		}

		this.cache = new src$2({
			uri: typeof cacheAdapter === 'string' && cacheAdapter,
			store: typeof cacheAdapter !== 'string' && cacheAdapter,
			namespace: 'cacheable-request'
		});

		return this.createCacheableRequest(request);
	}

	createCacheableRequest(request) {
		return (opts, cb) => {
			let url;
			if (typeof opts === 'string') {
				url = normalizeUrlObject(Url.parse(opts));
				opts = {};
			} else if (opts instanceof Url.URL) {
				url = normalizeUrlObject(Url.parse(opts.toString()));
				opts = {};
			} else {
				const [pathname, ...searchParts] = (opts.path || '').split('?');
				const search = searchParts.length > 0 ?
					`?${searchParts.join('?')}` :
					'';
				url = normalizeUrlObject({ ...opts, pathname, search });
			}

			opts = {
				headers: {},
				method: 'GET',
				cache: true,
				strictTtl: false,
				automaticFailover: false,
				...opts,
				...urlObjectToRequestOptions(url)
			};
			opts.headers = lowercaseKeys(opts.headers);

			const ee = new events();
			const normalizedUrlString = normalizeUrl_1(
				Url.format(url),
				{
					stripWWW: false,
					removeTrailingSlash: false,
					stripAuthentication: false
				}
			);
			const key = `${opts.method}:${normalizedUrlString}`;
			let revalidate = false;
			let madeRequest = false;

			const makeRequest = opts => {
				madeRequest = true;
				let requestErrored = false;
				let requestErrorCallback;

				const requestErrorPromise = new Promise(resolve => {
					requestErrorCallback = () => {
						if (!requestErrored) {
							requestErrored = true;
							resolve();
						}
					};
				});

				const handler = response => {
					if (revalidate && !opts.forceRefresh) {
						response.status = response.statusCode;
						const revalidatedPolicy = httpCacheSemantics.fromObject(revalidate.cachePolicy).revalidatedPolicy(opts, response);
						if (!revalidatedPolicy.modified) {
							const headers = revalidatedPolicy.policy.responseHeaders();
							response = new src(revalidate.statusCode, headers, revalidate.body, revalidate.url);
							response.cachePolicy = revalidatedPolicy.policy;
							response.fromCache = true;
						}
					}

					if (!response.fromCache) {
						response.cachePolicy = new httpCacheSemantics(opts, response, opts);
						response.fromCache = false;
					}

					let clonedResponse;
					if (opts.cache && response.cachePolicy.storable()) {
						clonedResponse = src$1(response);

						(async () => {
							try {
								const bodyPromise = getStream_1.buffer(response);

								await Promise.race([
									requestErrorPromise,
									new Promise(resolve => response.once('end', resolve))
								]);

								if (requestErrored) {
									return;
								}

								const body = await bodyPromise;

								const value = {
									cachePolicy: response.cachePolicy.toObject(),
									url: response.url,
									statusCode: response.fromCache ? revalidate.statusCode : response.statusCode,
									body
								};

								let ttl = opts.strictTtl ? response.cachePolicy.timeToLive() : undefined;
								if (opts.maxTtl) {
									ttl = ttl ? Math.min(ttl, opts.maxTtl) : opts.maxTtl;
								}

								await this.cache.set(key, value, ttl);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					} else if (opts.cache && revalidate) {
						(async () => {
							try {
								await this.cache.delete(key);
							} catch (error) {
								ee.emit('error', new CacheableRequest.CacheError(error));
							}
						})();
					}

					ee.emit('response', clonedResponse || response);
					if (typeof cb === 'function') {
						cb(clonedResponse || response);
					}
				};

				try {
					const req = request(opts, handler);
					req.once('error', requestErrorCallback);
					req.once('abort', requestErrorCallback);
					ee.emit('request', req);
				} catch (error) {
					ee.emit('error', new CacheableRequest.RequestError(error));
				}
			};

			(async () => {
				const get = async opts => {
					await Promise.resolve();

					const cacheEntry = opts.cache ? await this.cache.get(key) : undefined;
					if (typeof cacheEntry === 'undefined') {
						return makeRequest(opts);
					}

					const policy = httpCacheSemantics.fromObject(cacheEntry.cachePolicy);
					if (policy.satisfiesWithoutRevalidation(opts) && !opts.forceRefresh) {
						const headers = policy.responseHeaders();
						const response = new src(cacheEntry.statusCode, headers, cacheEntry.body, cacheEntry.url);
						response.cachePolicy = policy;
						response.fromCache = true;

						ee.emit('response', response);
						if (typeof cb === 'function') {
							cb(response);
						}
					} else {
						revalidate = cacheEntry;
						opts.headers = policy.revalidationHeaders(opts);
						makeRequest(opts);
					}
				};

				const errorHandler = error => ee.emit('error', new CacheableRequest.CacheError(error));
				this.cache.once('error', errorHandler);
				ee.on('response', () => this.cache.removeListener('error', errorHandler));

				try {
					await get(opts);
				} catch (error) {
					if (opts.automaticFailover && !madeRequest) {
						makeRequest(opts);
					}

					ee.emit('error', new CacheableRequest.CacheError(error));
				}
			})();

			return ee;
		};
	}
}

function urlObjectToRequestOptions(url) {
	const options = { ...url };
	options.path = `${url.pathname || '/'}${url.search || ''}`;
	delete options.pathname;
	delete options.search;
	return options;
}

function normalizeUrlObject(url) {
	// If url was parsed by url.parse or new URL:
	// - hostname will be set
	// - host will be hostname[:port]
	// - port will be set if it was explicit in the parsed string
	// Otherwise, url was from request options:
	// - hostname or host may be set
	// - host shall not have port encoded
	return {
		protocol: url.protocol,
		auth: url.auth,
		hostname: url.hostname || url.host || 'localhost',
		port: url.port,
		pathname: url.pathname,
		search: url.search
	};
}

CacheableRequest.RequestError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'RequestError';
		Object.assign(this, error);
	}
};

CacheableRequest.CacheError = class extends Error {
	constructor(error) {
		super(error.message);
		this.name = 'CacheError';
		Object.assign(this, error);
	}
};

var src$3 = CacheableRequest;

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProperties = [
	'aborted',
	'complete',
	'headers',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'method',
	'rawHeaders',
	'rawTrailers',
	'setTimeout',
	'socket',
	'statusCode',
	'statusMessage',
	'trailers',
	'url'
];

var mimicResponse$1 = (fromStream, toStream) => {
	if (toStream._readableState.autoDestroy) {
		throw new Error('The second stream must have the `autoDestroy` option set to `false`');
	}

	const fromProperties = new Set(Object.keys(fromStream).concat(knownProperties));

	const properties = {};

	for (const property of fromProperties) {
		// Don't overwrite existing properties.
		if (property in toStream) {
			continue;
		}

		properties[property] = {
			get() {
				const value = fromStream[property];
				const isFunction = typeof value === 'function';

				return isFunction ? value.bind(fromStream) : value;
			},
			set(value) {
				fromStream[property] = value;
			},
			enumerable: true,
			configurable: false
		};
	}

	Object.defineProperties(toStream, properties);

	fromStream.once('aborted', () => {
		toStream.destroy();

		toStream.emit('aborted');
	});

	fromStream.once('close', () => {
		if (fromStream.complete) {
			if (toStream.readable) {
				toStream.once('end', () => {
					toStream.emit('close');
				});
			} else {
				toStream.emit('close');
			}
		} else {
			toStream.emit('close');
		}
	});

	return toStream;
};

const {Transform, PassThrough: PassThrough$1} = Stream;



var decompressResponse = response => {
	const contentEncoding = (response.headers['content-encoding'] || '').toLowerCase();

	if (!['gzip', 'deflate', 'br'].includes(contentEncoding)) {
		return response;
	}

	// TODO: Remove this when targeting Node.js 12.
	const isBrotli = contentEncoding === 'br';
	if (isBrotli && typeof zlib.createBrotliDecompress !== 'function') {
		response.destroy(new Error('Brotli is not supported on Node.js < 12'));
		return response;
	}

	let isEmpty = true;

	const checker = new Transform({
		transform(data, _encoding, callback) {
			isEmpty = false;

			callback(null, data);
		},

		flush(callback) {
			callback();
		}
	});

	const finalStream = new PassThrough$1({
		autoDestroy: false,
		destroy(error, callback) {
			response.destroy();

			callback(error);
		}
	});

	const decompressStream = isBrotli ? zlib.createBrotliDecompress() : zlib.createUnzip();

	decompressStream.once('error', error => {
		if (isEmpty && !response.readable) {
			finalStream.end();
			return;
		}

		finalStream.destroy(error);
	});

	mimicResponse$1(response, finalStream);
	response.pipe(checker).pipe(decompressStream).pipe(finalStream);

	return finalStream;
};

class QuickLRU {
	constructor(options = {}) {
		if (!(options.maxSize && options.maxSize > 0)) {
			throw new TypeError('`maxSize` must be a number greater than 0');
		}

		this.maxSize = options.maxSize;
		this.onEviction = options.onEviction;
		this.cache = new Map();
		this.oldCache = new Map();
		this._size = 0;
	}

	_set(key, value) {
		this.cache.set(key, value);
		this._size++;

		if (this._size >= this.maxSize) {
			this._size = 0;

			if (typeof this.onEviction === 'function') {
				for (const [key, value] of this.oldCache.entries()) {
					this.onEviction(key, value);
				}
			}

			this.oldCache = this.cache;
			this.cache = new Map();
		}
	}

	get(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			const value = this.oldCache.get(key);
			this.oldCache.delete(key);
			this._set(key, value);
			return value;
		}
	}

	set(key, value) {
		if (this.cache.has(key)) {
			this.cache.set(key, value);
		} else {
			this._set(key, value);
		}

		return this;
	}

	has(key) {
		return this.cache.has(key) || this.oldCache.has(key);
	}

	peek(key) {
		if (this.cache.has(key)) {
			return this.cache.get(key);
		}

		if (this.oldCache.has(key)) {
			return this.oldCache.get(key);
		}
	}

	delete(key) {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this._size--;
		}

		return this.oldCache.delete(key) || deleted;
	}

	clear() {
		this.cache.clear();
		this.oldCache.clear();
		this._size = 0;
	}

	* keys() {
		for (const [key] of this) {
			yield key;
		}
	}

	* values() {
		for (const [, value] of this) {
			yield value;
		}
	}

	* [Symbol.iterator]() {
		for (const item of this.cache) {
			yield item;
		}

		for (const item of this.oldCache) {
			const [key] = item;
			if (!this.cache.has(key)) {
				yield item;
			}
		}
	}

	get size() {
		let oldCacheSize = 0;
		for (const key of this.oldCache.keys()) {
			if (!this.cache.has(key)) {
				oldCacheSize++;
			}
		}

		return Math.min(this._size + oldCacheSize, this.maxSize);
	}
}

var quickLru = QuickLRU;

const kCurrentStreamsCount = Symbol('currentStreamsCount');
const kRequest = Symbol('request');
const kOriginSet = Symbol('cachedOriginSet');

const nameKeys = [
	// `http2.connect()` options
	'maxDeflateDynamicTableSize',
	'maxSessionMemory',
	'maxHeaderListPairs',
	'maxOutstandingPings',
	'maxReservedRemoteStreams',
	'maxSendHeaderBlockLength',
	'paddingStrategy',

	// `tls.connect()` options
	'localAddress',
	'path',
	'rejectUnauthorized',
	'minDHSize',

	// `tls.createSecureContext()` options
	'ca',
	'cert',
	'clientCertEngine',
	'ciphers',
	'key',
	'pfx',
	'servername',
	'minVersion',
	'maxVersion',
	'secureProtocol',
	'crl',
	'honorCipherOrder',
	'ecdhCurve',
	'dhparam',
	'secureOptions',
	'sessionIdContext'
];

const removeSession = (where, name, session) => {
	if (name in where) {
		const index = where[name].indexOf(session);

		if (index !== -1) {
			where[name].splice(index, 1);

			if (where[name].length === 0) {
				delete where[name];
			}

			return true;
		}
	}

	return false;
};

const addSession = (where, name, session) => {
	if (name in where) {
		where[name].push(session);
	} else {
		where[name] = [session];
	}
};

const getSessions = (where, name, normalizedOrigin) => {
	if (!(name in where)) {
		return [];
	}

	return where[name].filter(session => {
		return !session.closed && !session.destroyed && session[kOriginSet].includes(normalizedOrigin);
	});
};

// See https://tools.ietf.org/html/rfc8336
const closeCoveredSessions = (where, name, session) => {
	if (!(name in where)) {
		return;
	}

	// Clients SHOULD NOT emit new requests on any connection whose Origin
	// Set is a proper subset of another connection's Origin Set, and they
	// SHOULD close it once all outstanding requests are satisfied.
	for (const coveredSession of where[name]) {
		if (
			// The set is a proper subset when its length is less than the other set.
			coveredSession[kOriginSet].length < session[kOriginSet].length &&

			// And the other set includes all elements of the subset.
			coveredSession[kOriginSet].every(origin => session[kOriginSet].includes(origin)) &&

			// Makes sure that the session can handle all requests from the covered session.
			// TODO: can the session become uncovered when a stream is closed after checking this condition?
			coveredSession[kCurrentStreamsCount] + session[kCurrentStreamsCount] <= session.remoteSettings.maxConcurrentStreams
		) {
			// This allows pending requests to finish and prevents making new requests.
			coveredSession.close();
		}
	}
};

// This is basically inverted `closeCoveredSessions(...)`.
const closeSessionIfCovered = (where, name, coveredSession) => {
	if (!(name in where)) {
		return;
	}

	for (const session of where[name]) {
		if (
			coveredSession[kOriginSet].length < session[kOriginSet].length &&
			coveredSession[kOriginSet].every(origin => session[kOriginSet].includes(origin)) &&
			coveredSession[kCurrentStreamsCount] + session[kCurrentStreamsCount] <= session.remoteSettings.maxConcurrentStreams
		) {
			coveredSession.close();
		}
	}
};

class Agent extends events {
	constructor({timeout = 60000, maxSessions = Infinity, maxFreeSessions = 1, maxCachedTlsSessions = 100} = {}) {
		super();

		// A session is considered busy when its current streams count
		// is equal to or greater than the `maxConcurrentStreams` value.
		this.busySessions = {};

		// A session is considered free when its current streams count
		// is less than the `maxConcurrentStreams` value.
		this.freeSessions = {};

		// The queue for creating new sessions. It looks like this:
		// QUEUE[NORMALIZED_OPTIONS][NORMALIZED_ORIGIN] = ENTRY_FUNCTION
		//
		// The entry function has `listeners`, `completed` and `destroyed` properties.
		// `listeners` is an array of objects containing `resolve` and `reject` functions.
		// `completed` is a boolean. It's set to true after ENTRY_FUNCTION is executed.
		// `destroyed` is a boolean. If it's set to true, the session will be destroyed if hasn't connected yet.
		this.queue = {};

		// Each session will use this timeout value.
		this.timeout = timeout;

		// Max sessions per origin.
		this.maxSessions = maxSessions;

		// Max free sessions per origin.
		// TODO: decreasing `maxFreeSessions` should close some sessions
		// TODO: should `maxFreeSessions` be related only to sessions with 0 pending streams?
		this.maxFreeSessions = maxFreeSessions;

		// We don't support push streams by default.
		this.settings = {
			enablePush: false
		};

		// Reusing TLS sessions increases performance.
		this.tlsSessionCache = new quickLru({maxSize: maxCachedTlsSessions});
	}

	static normalizeOrigin(url, servername) {
		if (typeof url === 'string') {
			url = new URL(url);
		}

		if (servername && url.hostname !== servername) {
			url.hostname = servername;
		}

		return url.origin;
	}

	normalizeOptions(options) {
		let normalized = '';

		if (options) {
			for (const key of nameKeys) {
				if (options[key]) {
					normalized += `:${options[key]}`;
				}
			}
		}

		return normalized;
	}

	_tryToCreateNewSession(normalizedOptions, normalizedOrigin) {
		if (!(normalizedOptions in this.queue) || !(normalizedOrigin in this.queue[normalizedOptions])) {
			return;
		}

		// We need the busy sessions length to check if a session can be created.
		const busyLength = getSessions(this.busySessions, normalizedOptions, normalizedOrigin).length;
		const item = this.queue[normalizedOptions][normalizedOrigin];

		// The entry function can be run only once.
		if (busyLength < this.maxSessions && !item.completed) {
			item.completed = true;

			item();
		}
	}

	_closeCoveredSessions(normalizedOptions, session) {
		closeCoveredSessions(this.freeSessions, normalizedOptions, session);
		closeCoveredSessions(this.busySessions, normalizedOptions, session);
	}

	getSession(origin, options, listeners) {
		return new Promise((resolve, reject) => {
			if (Array.isArray(listeners)) {
				listeners = [...listeners];

				// Resolve the current promise ASAP, we're just moving the listeners.
				// They will be executed at a different time.
				resolve();
			} else {
				listeners = [{resolve, reject}];
			}

			const normalizedOptions = this.normalizeOptions(options);
			const normalizedOrigin = Agent.normalizeOrigin(origin, options && options.servername);

			if (normalizedOrigin === undefined) {
				for (const {reject} of listeners) {
					reject(new TypeError('The `origin` argument needs to be a string or an URL object'));
				}

				return;
			}

			if (normalizedOptions in this.freeSessions) {
				// Look for all available free sessions.
				const freeSessions = getSessions(this.freeSessions, normalizedOptions, normalizedOrigin);

				if (freeSessions.length !== 0) {
					// Use session which has the biggest stream capacity in order to use the smallest number of sessions possible.
					const session = freeSessions.reduce((previousSession, nextSession) => {
						if (
							nextSession.remoteSettings.maxConcurrentStreams >= previousSession.remoteSettings.maxConcurrentStreams &&
							nextSession[kCurrentStreamsCount] > previousSession[kCurrentStreamsCount]
						) {
							return nextSession;
						}

						return previousSession;
					});

					for (const {resolve} of listeners) {
						// TODO: The session can get busy here
						resolve(session);
					}

					return;
				}
			}

			if (normalizedOptions in this.queue) {
				if (normalizedOrigin in this.queue[normalizedOptions]) {
					// There's already an item in the queue, just attach ourselves to it.
					this.queue[normalizedOptions][normalizedOrigin].listeners.push(...listeners);

					return;
				}
			} else {
				this.queue[normalizedOptions] = {};
			}

			// The entry must be removed from the queue IMMEDIATELY when:
			// 1. the session connects successfully,
			// 2. an error occurs.
			const removeFromQueue = () => {
				// Our entry can be replaced. We cannot remove the new one.
				if (normalizedOptions in this.queue && this.queue[normalizedOptions][normalizedOrigin] === entry) {
					delete this.queue[normalizedOptions][normalizedOrigin];

					if (Object.keys(this.queue[normalizedOptions]).length === 0) {
						delete this.queue[normalizedOptions];
					}
				}
			};

			// The main logic is here
			const entry = () => {
				const name = `${normalizedOrigin}:${normalizedOptions}`;
				let receivedSettings = false;
				let servername;

				try {
					const tlsSessionCache = this.tlsSessionCache.get(name);

					const session = http2.connect(origin, {
						createConnection: this.createConnection,
						settings: this.settings,
						session: tlsSessionCache ? tlsSessionCache.session : undefined,
						...options
					});
					session[kCurrentStreamsCount] = 0;

					// Tries to free the session.
					const freeSession = () => {
						// Fetch the smallest amount of free sessions of any origin we have.
						const freeSessionsCount = session[kOriginSet].reduce((accumulator, origin) => {
							return Math.min(accumulator, getSessions(this.freeSessions, normalizedOptions, origin).length);
						}, Infinity);

						// Check the limit.
						if (freeSessionsCount < this.maxFreeSessions) {
							addSession(this.freeSessions, normalizedOptions, session);

							return true;
						}

						return false;
					};

					const isFree = () => session[kCurrentStreamsCount] < session.remoteSettings.maxConcurrentStreams;

					session.socket.once('session', tlsSession => {
						// We need to cache the servername due to a bug in OpenSSL.
						setImmediate(() => {
							this.tlsSessionCache.set(name, {
								session: tlsSession,
								servername
							});
						});
					});

					// OpenSSL bug workaround.
					// See https://github.com/nodejs/node/issues/28985
					session.socket.once('secureConnect', () => {
						servername = session.socket.servername;

						if (servername === false && typeof tlsSessionCache !== 'undefined' && typeof tlsSessionCache.servername !== 'undefined') {
							session.socket.servername = tlsSessionCache.servername;
						}
					});

					session.once('error', error => {
						// `receivedSettings` is true when the session has successfully connected.
						if (!receivedSettings) {
							for (const {reject} of listeners) {
								reject(error);
							}
						}

						// The connection got broken, purge the cache.
						this.tlsSessionCache.delete(name);
					});

					session.setTimeout(this.timeout, () => {
						// Terminates all streams owned by this session.
						session.destroy();
					});

					session.once('close', () => {
						if (!receivedSettings) {
							// Broken connection
							const error = new Error('Session closed without receiving a SETTINGS frame');

							for (const {reject} of listeners) {
								reject(error);
							}
						}

						removeFromQueue();

						// This cannot be moved to the stream logic,
						// because there may be a session that hadn't made a single request.
						removeSession(this.freeSessions, normalizedOptions, session);

						// There may be another session awaiting.
						this._tryToCreateNewSession(normalizedOptions, normalizedOrigin);
					});

					// Iterates over the queue and processes listeners.
					const processListeners = () => {
						if (!(normalizedOptions in this.queue)) {
							return;
						}

						for (const origin of session[kOriginSet]) {
							if (origin in this.queue[normalizedOptions]) {
								const {listeners} = this.queue[normalizedOptions][origin];

								// Prevents session overloading.
								while (listeners.length !== 0 && isFree()) {
									// We assume `resolve(...)` calls `request(...)` *directly*,
									// otherwise the session will get overloaded.
									listeners.shift().resolve(session);
								}

								if (this.queue[normalizedOptions][origin].listeners.length === 0) {
									delete this.queue[normalizedOptions][origin];

									if (Object.keys(this.queue[normalizedOptions]).length === 0) {
										delete this.queue[normalizedOptions];
										break;
									}
								}

								// We're no longer free, no point in continuing.
								if (!isFree()) {
									break;
								}
							}
						}
					};

					// The Origin Set cannot shrink. No need to check if it suddenly became covered by another one.
					session.once('origin', () => {
						session[kOriginSet] = session.originSet;

						if (!isFree()) {
							// The session is full.
							return;
						}

						// Close covered sessions (if possible).
						this._closeCoveredSessions(normalizedOptions, session);

						processListeners();

						// `session.remoteSettings.maxConcurrentStreams` might get increased
						session.on('remoteSettings', () => {
							this._closeCoveredSessions(normalizedOptions, session);
						});
					});

					session.once('remoteSettings', () => {
						// The Agent could have been destroyed already.
						if (entry.destroyed) {
							const error = new Error('Agent has been destroyed');

							for (const listener of listeners) {
								listener.reject(error);
							}

							session.destroy();
							return;
						}

						session[kOriginSet] = session.originSet;
						this.emit('session', session);

						if (freeSession()) {
							// Process listeners, we're free.
							processListeners();
						} else if (this.maxFreeSessions === 0) {
							processListeners();

							// We're closing ASAP, when all possible requests have been made for this event loop tick.
							setImmediate(() => {
								session.close();
							});
						} else {
							// Too late, another free session took these listeners.
							session.close();
						}

						removeFromQueue();

						// Check if we haven't managed to execute all listeners.
						if (listeners.length !== 0) {
							// Request for a new session with predefined listeners.
							this.getSession(normalizedOrigin, options, listeners);
							listeners.length = 0;
						}

						receivedSettings = true;

						// `session.remoteSettings.maxConcurrentStreams` might get increased
						session.on('remoteSettings', () => {
							// Check if we're eligible to become a free session
							if (isFree() && removeSession(this.busySessions, normalizedOptions, session)) {
								// Check for free seats
								if (freeSession()) {
									processListeners();
								} else {
									// Assume it's still a busy session
									addSession(this.busySessions, normalizedOptions, session);
								}
							}
						});
					});

					// Shim `session.request()` in order to catch all streams
					session[kRequest] = session.request;
					session.request = headers => {
						const stream = session[kRequest](headers, {
							endStream: false
						});

						// The process won't exit until the session is closed.
						session.ref();

						++session[kCurrentStreamsCount];

						// Check if we became busy
						if (!isFree() && removeSession(this.freeSessions, normalizedOptions, session)) {
							addSession(this.busySessions, normalizedOptions, session);
						}

						stream.once('close', () => {
							--session[kCurrentStreamsCount];

							if (isFree()) {
								if (session[kCurrentStreamsCount] === 0) {
									// All requests are finished, the process may exit now.
									session.unref();
								}

								// Check if we are no longer busy and the session is not broken.
								if (removeSession(this.busySessions, normalizedOptions, session) && !session.destroyed && !session.closed) {
									// Check the sessions count of this authority and compare it to `maxSessionsCount`.
									if (freeSession()) {
										this._closeCoveredSessions(normalizedOptions, session);
										processListeners();
									} else {
										session.close();
									}
								}
							}

							if (!session.destroyed && !session.closed) {
								closeSessionIfCovered(this.freeSessions, normalizedOptions, session);
							}
						});

						return stream;
					};
				} catch (error) {
					for (const listener of listeners) {
						listener.reject(error);
					}

					removeFromQueue();
				}
			};

			entry.listeners = listeners;
			entry.completed = false;
			entry.destroyed = false;

			this.queue[normalizedOptions][normalizedOrigin] = entry;
			this._tryToCreateNewSession(normalizedOptions, normalizedOrigin);
		});
	}

	request(origin, options, headers) {
		return new Promise((resolve, reject) => {
			this.getSession(origin, options, [{
				reject,
				resolve: session => {
					resolve(session.request(headers));
				}
			}]);
		});
	}

	createConnection(origin, options) {
		return Agent.connect(origin, options);
	}

	static connect(origin, options) {
		options.ALPNProtocols = ['h2'];

		const port = origin.port || 443;
		const host = origin.hostname || origin.host;

		if (typeof options.servername === 'undefined') {
			options.servername = host;
		}

		return tls.connect(port, host, options);
	}

	closeFreeSessions() {
		for (const freeSessions of Object.values(this.freeSessions)) {
			for (const session of freeSessions) {
				if (session[kCurrentStreamsCount] === 0) {
					session.close();
				}
			}
		}
	}

	destroy(reason) {
		for (const busySessions of Object.values(this.busySessions)) {
			for (const session of busySessions) {
				session.destroy(reason);
			}
		}

		for (const freeSessions of Object.values(this.freeSessions)) {
			for (const session of freeSessions) {
				session.destroy(reason);
			}
		}

		for (const entriesOfAuthority of Object.values(this.queue)) {
			for (const entry of Object.values(entriesOfAuthority)) {
				entry.destroyed = true;
			}
		}

		// New requests should NOT attach to destroyed sessions
		this.queue = {};
	}
}

var agent = {
	Agent,
	globalAgent: new Agent()
};

const {Readable: Readable$1} = Stream;

class IncomingMessage extends Readable$1 {
	constructor(socket, highWaterMark) {
		super({
			highWaterMark,
			autoDestroy: false
		});

		this.statusCode = null;
		this.statusMessage = '';
		this.httpVersion = '2.0';
		this.httpVersionMajor = 2;
		this.httpVersionMinor = 0;
		this.headers = {};
		this.trailers = {};
		this.req = null;

		this.aborted = false;
		this.complete = false;
		this.upgrade = null;

		this.rawHeaders = [];
		this.rawTrailers = [];

		this.socket = socket;
		this.connection = socket;

		this._dumped = false;
	}

	_destroy(error) {
		this.req._request.destroy(error);
	}

	setTimeout(ms, callback) {
		this.req.setTimeout(ms, callback);
		return this;
	}

	_dump() {
		if (!this._dumped) {
			this._dumped = true;

			this.removeAllListeners('data');
			this.resume();
		}
	}

	_read() {
		if (this.req) {
			this.req._request.resume();
		}
	}
}

var incomingMessage = IncomingMessage;

/* istanbul ignore file: https://github.com/nodejs/node/blob/a91293d4d9ab403046ab5eb022332e4e3d249bd3/lib/internal/url.js#L1257 */

var urlToOptions = url => {
	const options = {
		protocol: url.protocol,
		hostname: typeof url.hostname === 'string' && url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
		host: url.host,
		hash: url.hash,
		search: url.search,
		pathname: url.pathname,
		href: url.href,
		path: `${url.pathname || ''}${url.search || ''}`
	};

	if (typeof url.port === 'string' && url.port.length !== 0) {
		options.port = Number(url.port);
	}

	if (url.username || url.password) {
		options.auth = `${url.username || ''}:${url.password || ''}`;
	}

	return options;
};

var proxyEvents = (from, to, events) => {
	for (const event of events) {
		from.on(event, (...args) => to.emit(event, ...args));
	}
};

var isRequestPseudoHeader = header => {
	switch (header) {
		case ':method':
		case ':scheme':
		case ':authority':
		case ':path':
			return true;
		default:
			return false;
	}
};

var errors = createCommonjsModule(function (module) {
/* istanbul ignore file: https://github.com/nodejs/node/blob/master/lib/internal/errors.js */

const makeError = (Base, key, getMessage) => {
	module.exports[key] = class NodeError extends Base {
		constructor(...args) {
			super(typeof getMessage === 'string' ? getMessage : getMessage(args));
			this.name = `${super.name} [${key}]`;
			this.code = key;
		}
	};
};

makeError(TypeError, 'ERR_INVALID_ARG_TYPE', args => {
	const type = args[0].includes('.') ? 'property' : 'argument';

	let valid = args[1];
	const isManyTypes = Array.isArray(valid);

	if (isManyTypes) {
		valid = `${valid.slice(0, -1).join(', ')} or ${valid.slice(-1)}`;
	}

	return `The "${args[0]}" ${type} must be ${isManyTypes ? 'one of' : 'of'} type ${valid}. Received ${typeof args[2]}`;
});

makeError(TypeError, 'ERR_INVALID_PROTOCOL', args => {
	return `Protocol "${args[0]}" not supported. Expected "${args[1]}"`;
});

makeError(Error, 'ERR_HTTP_HEADERS_SENT', args => {
	return `Cannot ${args[0]} headers after they are sent to the client`;
});

makeError(TypeError, 'ERR_INVALID_HTTP_TOKEN', args => {
	return `${args[0]} must be a valid HTTP token [${args[1]}]`;
});

makeError(TypeError, 'ERR_HTTP_INVALID_HEADER_VALUE', args => {
	return `Invalid value "${args[0]} for header "${args[1]}"`;
});

makeError(TypeError, 'ERR_INVALID_CHAR', args => {
	return `Invalid character in ${args[0]} [${args[1]}]`;
});
});

const {Writable} = Stream;
const {Agent: Agent$1, globalAgent} = agent;




const {
	ERR_INVALID_ARG_TYPE,
	ERR_INVALID_PROTOCOL,
	ERR_HTTP_HEADERS_SENT,
	ERR_INVALID_HTTP_TOKEN,
	ERR_HTTP_INVALID_HEADER_VALUE,
	ERR_INVALID_CHAR
} = errors;

const {
	HTTP2_HEADER_STATUS,
	HTTP2_HEADER_METHOD,
	HTTP2_HEADER_PATH,
	HTTP2_METHOD_CONNECT
} = http2.constants;

const kHeaders = Symbol('headers');
const kOrigin = Symbol('origin');
const kSession = Symbol('session');
const kOptions = Symbol('options');
const kFlushedHeaders = Symbol('flushedHeaders');
const kJobs = Symbol('jobs');

const isValidHttpToken = /^[\^_`a-zA-Z\-0-9!#$%&'*+.|~]+$/;
const isInvalidHeaderValue = /[^\t\u0020-\u007E\u0080-\u00FF]/;

class ClientRequest extends Writable {
	constructor(input, options, callback) {
		super({
			autoDestroy: false
		});

		const hasInput = typeof input === 'string' || input instanceof URL;
		if (hasInput) {
			input = urlToOptions(input instanceof URL ? input : new URL(input));
		}

		if (typeof options === 'function' || options === undefined) {
			// (options, callback)
			callback = options;
			options = hasInput ? input : {...input};
		} else {
			// (input, options, callback)
			options = {...input, ...options};
		}

		if (options.h2session) {
			this[kSession] = options.h2session;
		} else if (options.agent === false) {
			this.agent = new Agent$1({maxFreeSessions: 0});
		} else if (typeof options.agent === 'undefined' || options.agent === null) {
			if (typeof options.createConnection === 'function') {
				// This is a workaround - we don't have to create the session on our own.
				this.agent = new Agent$1({maxFreeSessions: 0});
				this.agent.createConnection = options.createConnection;
			} else {
				this.agent = globalAgent;
			}
		} else if (typeof options.agent.request === 'function') {
			this.agent = options.agent;
		} else {
			throw new ERR_INVALID_ARG_TYPE('options.agent', ['Agent-like Object', 'undefined', 'false'], options.agent);
		}

		if (!options.port) {
			options.port = options.defaultPort || (this.agent && this.agent.defaultPort) || 443;
		}

		options.host = options.hostname || options.host || 'localhost';

		if (options.protocol && options.protocol !== 'https:') {
			throw new ERR_INVALID_PROTOCOL(options.protocol, 'https:');
		}

		const {timeout} = options;
		options.timeout = undefined;

		this[kHeaders] = Object.create(null);
		this[kJobs] = [];

		this.socket = null;
		this.connection = null;

		this.method = options.method;
		this.path = options.path;

		this.res = null;
		this.aborted = false;
		this.reusedSocket = false;

		if (options.headers) {
			for (const [header, value] of Object.entries(options.headers)) {
				this.setHeader(header, value);
			}
		}

		if (options.auth && !('authorization' in this[kHeaders])) {
			this[kHeaders].authorization = 'Basic ' + Buffer.from(options.auth).toString('base64');
		}

		options.session = options.tlsSession;
		options.path = options.socketPath;

		this[kOptions] = options;

		// Clients that generate HTTP/2 requests directly SHOULD use the :authority pseudo-header field instead of the Host header field.
		// What about IPv6? Square brackets?
		if (options.port === 443) {
			options.origin = `https://${options.host}`;

			if (!(':authority' in this[kHeaders])) {
				this[kHeaders][':authority'] = options.host;
			}
		} else {
			options.origin = `https://${options.host}:${options.port}`;

			if (!(':authority' in this[kHeaders])) {
				this[kHeaders][':authority'] = `${options.host}:${options.port}`;
			}
		}

		this[kOrigin] = options;

		if (timeout) {
			this.setTimeout(timeout);
		}

		if (callback) {
			this.once('response', callback);
		}

		this[kFlushedHeaders] = false;
	}

	get method() {
		return this[kHeaders][HTTP2_HEADER_METHOD];
	}

	set method(value) {
		if (value) {
			this[kHeaders][HTTP2_HEADER_METHOD] = value.toUpperCase();
		}
	}

	get path() {
		return this[kHeaders][HTTP2_HEADER_PATH];
	}

	set path(value) {
		if (value) {
			this[kHeaders][HTTP2_HEADER_PATH] = value;
		}
	}

	_write(chunk, encoding, callback) {
		this.flushHeaders();

		const callWrite = () => this._request.write(chunk, encoding, callback);
		if (this._request) {
			callWrite();
		} else {
			this[kJobs].push(callWrite);
		}
	}

	_final(callback) {
		if (this.destroyed) {
			return;
		}

		this.flushHeaders();

		const callEnd = () => this._request.end(callback);
		if (this._request) {
			callEnd();
		} else {
			this[kJobs].push(callEnd);
		}
	}

	abort() {
		if (this.res && this.res.complete) {
			return;
		}

		if (!this.aborted) {
			process.nextTick(() => this.emit('abort'));
		}

		this.aborted = true;

		this.destroy();
	}

	_destroy(error, callback) {
		if (this.res) {
			this.res._dump();
		}

		if (this._request) {
			this._request.destroy();
		}

		callback(error);
	}

	async flushHeaders() {
		if (this[kFlushedHeaders] || this.destroyed) {
			return;
		}

		this[kFlushedHeaders] = true;

		const isConnectMethod = this.method === HTTP2_METHOD_CONNECT;

		// The real magic is here
		const onStream = stream => {
			this._request = stream;

			if (this.destroyed) {
				stream.destroy();
				return;
			}

			// Forwards `timeout`, `continue`, `close` and `error` events to this instance.
			if (!isConnectMethod) {
				proxyEvents(stream, this, ['timeout', 'continue', 'close', 'error']);
			}

			// This event tells we are ready to listen for the data.
			stream.once('response', (headers, flags, rawHeaders) => {
				// If we were to emit raw request stream, it would be as fast as the native approach.
				// Note that wrapping the raw stream in a Proxy instance won't improve the performance (already tested it).
				const response = new incomingMessage(this.socket, stream.readableHighWaterMark);
				this.res = response;

				response.req = this;
				response.statusCode = headers[HTTP2_HEADER_STATUS];
				response.headers = headers;
				response.rawHeaders = rawHeaders;

				response.once('end', () => {
					if (this.aborted) {
						response.aborted = true;
						response.emit('aborted');
					} else {
						response.complete = true;

						// Has no effect, just be consistent with the Node.js behavior
						response.socket = null;
						response.connection = null;
					}
				});

				if (isConnectMethod) {
					response.upgrade = true;

					// The HTTP1 API says the socket is detached here,
					// but we can't do that so we pass the original HTTP2 request.
					if (this.emit('connect', response, stream, Buffer.alloc(0))) {
						this.emit('close');
					} else {
						// No listeners attached, destroy the original request.
						stream.destroy();
					}
				} else {
					// Forwards data
					stream.on('data', chunk => {
						if (!response._dumped && !response.push(chunk)) {
							stream.pause();
						}
					});

					stream.once('end', () => {
						response.push(null);
					});

					if (!this.emit('response', response)) {
						// No listeners attached, dump the response.
						response._dump();
					}
				}
			});

			// Emits `information` event
			stream.once('headers', headers => this.emit('information', {statusCode: headers[HTTP2_HEADER_STATUS]}));

			stream.once('trailers', (trailers, flags, rawTrailers) => {
				const {res} = this;

				// Assigns trailers to the response object.
				res.trailers = trailers;
				res.rawTrailers = rawTrailers;
			});

			const {socket} = stream.session;
			this.socket = socket;
			this.connection = socket;

			for (const job of this[kJobs]) {
				job();
			}

			this.emit('socket', this.socket);
		};

		// Makes a HTTP2 request
		if (this[kSession]) {
			try {
				onStream(this[kSession].request(this[kHeaders], {
					endStream: false
				}));
			} catch (error) {
				this.emit('error', error);
			}
		} else {
			this.reusedSocket = true;

			try {
				onStream(await this.agent.request(this[kOrigin], this[kOptions], this[kHeaders]));
			} catch (error) {
				this.emit('error', error);
			}
		}
	}

	getHeader(name) {
		if (typeof name !== 'string') {
			throw new ERR_INVALID_ARG_TYPE('name', 'string', name);
		}

		return this[kHeaders][name.toLowerCase()];
	}

	get headersSent() {
		return this[kFlushedHeaders];
	}

	removeHeader(name) {
		if (typeof name !== 'string') {
			throw new ERR_INVALID_ARG_TYPE('name', 'string', name);
		}

		if (this.headersSent) {
			throw new ERR_HTTP_HEADERS_SENT('remove');
		}

		delete this[kHeaders][name.toLowerCase()];
	}

	setHeader(name, value) {
		if (this.headersSent) {
			throw new ERR_HTTP_HEADERS_SENT('set');
		}

		if (typeof name !== 'string' || (!isValidHttpToken.test(name) && !isRequestPseudoHeader(name))) {
			throw new ERR_INVALID_HTTP_TOKEN('Header name', name);
		}

		if (typeof value === 'undefined') {
			throw new ERR_HTTP_INVALID_HEADER_VALUE(value, name);
		}

		if (isInvalidHeaderValue.test(value)) {
			throw new ERR_INVALID_CHAR('header content', name);
		}

		this[kHeaders][name.toLowerCase()] = value;
	}

	setNoDelay() {
		// HTTP2 sockets cannot be malformed, do nothing.
	}

	setSocketKeepAlive() {
		// HTTP2 sockets cannot be malformed, do nothing.
	}

	setTimeout(ms, callback) {
		const applyTimeout = () => this._request.setTimeout(ms, callback);

		if (this._request) {
			applyTimeout();
		} else {
			this[kJobs].push(applyTimeout);
		}

		return this;
	}

	get maxHeadersCount() {
		if (!this.destroyed && this._request) {
			return this._request.session.localSettings.maxHeaderListSize;
		}

		return undefined;
	}

	set maxHeadersCount(_value) {
		// Updating HTTP2 settings would affect all requests, do nothing.
	}
}

var clientRequest = ClientRequest;

var resolveAlpn = (options = {}) => new Promise((resolve, reject) => {
	const socket = tls.connect(options, () => {
		if (options.resolveSocket) {
			socket.off('error', reject);
			resolve({alpnProtocol: socket.alpnProtocol, socket});
		} else {
			socket.destroy();
			resolve({alpnProtocol: socket.alpnProtocol});
		}
	});

	socket.on('error', reject);
});

/* istanbul ignore file: https://github.com/nodejs/node/blob/v13.0.1/lib/_http_agent.js */

var calculateServerName = options => {
	let servername = options.host;
	const hostHeader = options.headers && options.headers.host;

	if (hostHeader) {
		if (hostHeader.startsWith('[')) {
			const index = hostHeader.indexOf(']');
			if (index === -1) {
				servername = hostHeader;
			} else {
				servername = hostHeader.slice(1, -1);
			}
		} else {
			servername = hostHeader.split(':', 1)[0];
		}
	}

	if (net.isIP(servername)) {
		return '';
	}

	return servername;
};

const cache = new quickLru({maxSize: 100});
const queue = new Map();

const installSocket = (agent, socket, options) => {
	socket._httpMessage = {shouldKeepAlive: true};

	const onFree = () => {
		agent.emit('free', socket, options);
	};

	socket.on('free', onFree);

	const onClose = () => {
		agent.removeSocket(socket, options);
	};

	socket.on('close', onClose);

	const onRemove = () => {
		agent.removeSocket(socket, options);
		socket.off('close', onClose);
		socket.off('free', onFree);
		socket.off('agentRemove', onRemove);
	};

	socket.on('agentRemove', onRemove);

	agent.emit('free', socket, options);
};

const resolveProtocol = async options => {
	const name = `${options.host}:${options.port}:${options.ALPNProtocols.sort()}`;

	if (!cache.has(name)) {
		if (queue.has(name)) {
			const result = await queue.get(name);
			return result.alpnProtocol;
		}

		const {path, agent} = options;
		options.path = options.socketPath;

		const resultPromise = resolveAlpn(options);
		queue.set(name, resultPromise);

		try {
			const {socket, alpnProtocol} = await resultPromise;
			cache.set(name, alpnProtocol);

			options.path = path;

			if (alpnProtocol === 'h2') {
				// https://github.com/nodejs/node/issues/33343
				socket.destroy();
			} else {
				const {globalAgent} = https;
				const defaultCreateConnection = https.Agent.prototype.createConnection;

				if (agent) {
					if (agent.createConnection === defaultCreateConnection) {
						installSocket(agent, socket, options);
					} else {
						socket.destroy();
					}
				} else if (globalAgent.createConnection === defaultCreateConnection) {
					installSocket(globalAgent, socket, options);
				} else {
					socket.destroy();
				}
			}

			queue.delete(name);

			return alpnProtocol;
		} catch (error) {
			queue.delete(name);

			throw error;
		}
	}

	return cache.get(name);
};

var auto = async (input, options, callback) => {
	if (typeof input === 'string' || input instanceof URL) {
		input = urlToOptions(new URL(input));
	}

	if (typeof options === 'function') {
		callback = options;
		options = undefined;
	}

	options = {
		ALPNProtocols: ['h2', 'http/1.1'],
		protocol: 'https:',
		...input,
		...options,
		resolveSocket: true
	};

	const isHttps = options.protocol === 'https:';
	const agents = options.agent;

	options.host = options.hostname || options.host || 'localhost';
	options.session = options.tlsSession;
	options.servername = options.servername || calculateServerName(options);
	options.port = options.port || (isHttps ? 443 : 80);
	options._defaultAgent = isHttps ? https.globalAgent : http.globalAgent;

	if (agents) {
		if (agents.addRequest) {
			throw new Error('The `options.agent` object can contain only `http`, `https` or `http2` properties');
		}

		options.agent = agents[isHttps ? 'https' : 'http'];
	}

	if (isHttps) {
		const protocol = await resolveProtocol(options);

		if (protocol === 'h2') {
			if (agents) {
				options.agent = agents.http2;
			}

			return new clientRequest(options, callback);
		}
	}

	return http.request(options, callback);
};

var protocolCache = cache;
auto.protocolCache = protocolCache;

const request = (url, options, callback) => {
	return new clientRequest(url, options, callback);
};

const get = (url, options, callback) => {
	const req = new clientRequest(url, options, callback);
	req.end();

	return req;
};

var source$3 = {
	...http2,
	ClientRequest: clientRequest,
	IncomingMessage: incomingMessage,
	...agent,
	request,
	get,
	auto
};

var isFormData = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.default = (body) => dist.default.nodeStream(body) && dist.default.function_(body.getBoundary);
});

unwrapExports(isFormData);

var getBodySize = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




const statAsync = util.promisify(fs.stat);
exports.default = async (body, headers) => {
    if (headers && 'content-length' in headers) {
        return Number(headers['content-length']);
    }
    if (!body) {
        return 0;
    }
    if (dist.default.string(body)) {
        return Buffer.byteLength(body);
    }
    if (dist.default.buffer(body)) {
        return body.length;
    }
    if (isFormData.default(body)) {
        return util.promisify(body.getLength.bind(body))();
    }
    if (body instanceof fs.ReadStream) {
        const { size } = await statAsync(body.path);
        return size;
    }
    return undefined;
};
});

unwrapExports(getBodySize);

var proxyEvents$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(from, to, events) {
    const fns = {};
    for (const event of events) {
        fns[event] = (...args) => {
            to.emit(event, ...args);
        };
        from.on(event, fns[event]);
    }
    return () => {
        for (const event of events) {
            from.off(event, fns[event]);
        }
    };
}
exports.default = default_1;
});

unwrapExports(proxyEvents$1);

var unhandle = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
// When attaching listeners, it's very easy to forget about them.
// Especially if you do error handling and set timeouts.
// So instead of checking if it's proper to throw an error on every timeout ever,
// use this simple tool which will remove all listeners you have attached.
exports.default = () => {
    const handlers = [];
    return {
        once(origin, event, fn) {
            origin.once(event, fn);
            handlers.push({ origin, event, fn });
        },
        unhandleAll() {
            for (const handler of handlers) {
                const { origin, event, fn } = handler;
                origin.removeListener(event, fn);
            }
            handlers.length = 0;
        }
    };
};
});

unwrapExports(unhandle);

var timedOut = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


const reentry = Symbol('reentry');
const noop = () => { };
class TimeoutError extends Error {
    constructor(threshold, event) {
        super(`Timeout awaiting '${event}' for ${threshold}ms`);
        this.event = event;
        this.name = 'TimeoutError';
        this.code = 'ETIMEDOUT';
    }
}
exports.TimeoutError = TimeoutError;
exports.default = (request, delays, options) => {
    if (reentry in request) {
        return noop;
    }
    request[reentry] = true;
    const cancelers = [];
    const { once, unhandleAll } = unhandle.default();
    const addTimeout = (delay, callback, event) => {
        var _a;
        const timeout = setTimeout(callback, delay, delay, event);
        (_a = timeout.unref) === null || _a === void 0 ? void 0 : _a.call(timeout);
        const cancel = () => {
            clearTimeout(timeout);
        };
        cancelers.push(cancel);
        return cancel;
    };
    const { host, hostname } = options;
    const timeoutHandler = (delay, event) => {
        request.destroy(new TimeoutError(delay, event));
    };
    const cancelTimeouts = () => {
        for (const cancel of cancelers) {
            cancel();
        }
        unhandleAll();
    };
    request.once('error', error => {
        cancelTimeouts();
        // Save original behavior
        /* istanbul ignore next */
        if (request.listenerCount('error') === 0) {
            throw error;
        }
    });
    request.once('close', cancelTimeouts);
    once(request, 'response', (response) => {
        once(response, 'end', cancelTimeouts);
    });
    if (typeof delays.request !== 'undefined') {
        addTimeout(delays.request, timeoutHandler, 'request');
    }
    if (typeof delays.socket !== 'undefined') {
        const socketTimeoutHandler = () => {
            timeoutHandler(delays.socket, 'socket');
        };
        request.setTimeout(delays.socket, socketTimeoutHandler);
        // `request.setTimeout(0)` causes a memory leak.
        // We can just remove the listener and forget about the timer - it's unreffed.
        // See https://github.com/sindresorhus/got/issues/690
        cancelers.push(() => {
            request.removeListener('timeout', socketTimeoutHandler);
        });
    }
    once(request, 'socket', (socket) => {
        var _a;
        const { socketPath } = request;
        /* istanbul ignore next: hard to test */
        if (socket.connecting) {
            const hasPath = Boolean(socketPath !== null && socketPath !== void 0 ? socketPath : net.isIP((_a = hostname !== null && hostname !== void 0 ? hostname : host) !== null && _a !== void 0 ? _a : '') !== 0);
            if (typeof delays.lookup !== 'undefined' && !hasPath && typeof socket.address().address === 'undefined') {
                const cancelTimeout = addTimeout(delays.lookup, timeoutHandler, 'lookup');
                once(socket, 'lookup', cancelTimeout);
            }
            if (typeof delays.connect !== 'undefined') {
                const timeConnect = () => addTimeout(delays.connect, timeoutHandler, 'connect');
                if (hasPath) {
                    once(socket, 'connect', timeConnect());
                }
                else {
                    once(socket, 'lookup', (error) => {
                        if (error === null) {
                            once(socket, 'connect', timeConnect());
                        }
                    });
                }
            }
            if (typeof delays.secureConnect !== 'undefined' && options.protocol === 'https:') {
                once(socket, 'connect', () => {
                    const cancelTimeout = addTimeout(delays.secureConnect, timeoutHandler, 'secureConnect');
                    once(socket, 'secureConnect', cancelTimeout);
                });
            }
        }
        if (typeof delays.send !== 'undefined') {
            const timeRequest = () => addTimeout(delays.send, timeoutHandler, 'send');
            /* istanbul ignore next: hard to test */
            if (socket.connecting) {
                once(socket, 'connect', () => {
                    once(request, 'upload-complete', timeRequest());
                });
            }
            else {
                once(request, 'upload-complete', timeRequest());
            }
        }
    });
    if (typeof delays.response !== 'undefined') {
        once(request, 'upload-complete', () => {
            const cancelTimeout = addTimeout(delays.response, timeoutHandler, 'response');
            once(request, 'response', cancelTimeout);
        });
    }
    return cancelTimeouts;
};
});

unwrapExports(timedOut);

var urlToOptions$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.default = (url) => {
    // Cast to URL
    url = url;
    const options = {
        protocol: url.protocol,
        hostname: dist.default.string(url.hostname) && url.hostname.startsWith('[') ? url.hostname.slice(1, -1) : url.hostname,
        host: url.host,
        hash: url.hash,
        search: url.search,
        pathname: url.pathname,
        href: url.href,
        path: `${url.pathname || ''}${url.search || ''}`
    };
    if (dist.default.string(url.port) && url.port.length !== 0) {
        options.port = Number(url.port);
    }
    if (url.username || url.password) {
        options.auth = `${url.username || ''}:${url.password || ''}`;
    }
    return options;
};
});

unwrapExports(urlToOptions$1);

var optionsToUrl = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
/* istanbul ignore file: deprecated */

const keys = [
    'protocol',
    'host',
    'hostname',
    'port',
    'pathname',
    'search'
];
exports.default = (origin, options) => {
    var _a, _b;
    if (options.path) {
        if (options.pathname) {
            throw new TypeError('Parameters `path` and `pathname` are mutually exclusive.');
        }
        if (options.search) {
            throw new TypeError('Parameters `path` and `search` are mutually exclusive.');
        }
        if (options.searchParams) {
            throw new TypeError('Parameters `path` and `searchParams` are mutually exclusive.');
        }
    }
    if (options.search && options.searchParams) {
        throw new TypeError('Parameters `search` and `searchParams` are mutually exclusive.');
    }
    if (!origin) {
        if (!options.protocol) {
            throw new TypeError('No URL protocol specified');
        }
        origin = `${options.protocol}//${(_b = (_a = options.hostname) !== null && _a !== void 0 ? _a : options.host) !== null && _b !== void 0 ? _b : ''}`;
    }
    const url = new Url.URL(origin);
    if (options.path) {
        const searchIndex = options.path.indexOf('?');
        if (searchIndex === -1) {
            options.pathname = options.path;
        }
        else {
            options.pathname = options.path.slice(0, searchIndex);
            options.search = options.path.slice(searchIndex + 1);
        }
        delete options.path;
    }
    for (const key of keys) {
        if (options[key]) {
            url[key] = options[key].toString();
        }
    }
    return url;
};
});

unwrapExports(optionsToUrl);

var weakableMap = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
class WeakableMap {
    constructor() {
        this.weakMap = new WeakMap();
        this.map = new Map();
    }
    set(key, value) {
        if (typeof key === 'object') {
            this.weakMap.set(key, value);
        }
        else {
            this.map.set(key, value);
        }
    }
    get(key) {
        if (typeof key === 'object') {
            return this.weakMap.get(key);
        }
        return this.map.get(key);
    }
    has(key) {
        if (typeof key === 'object') {
            return this.weakMap.has(key);
        }
        return this.map.has(key);
    }
}
exports.default = WeakableMap;
});

unwrapExports(weakableMap);

var deprecationWarning = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
const alreadyWarned = new Set();
exports.default = (message) => {
    if (alreadyWarned.has(message)) {
        return;
    }
    alreadyWarned.add(message);
    // @ts-ignore Missing types.
    process.emitWarning(`Got: ${message}`, {
        type: 'DeprecationWarning'
    });
};
});

unwrapExports(deprecationWarning);

var core$2 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });





const http_1 = http;





// @ts-ignore Missing types












const kRequest = Symbol('request');
const kResponse = Symbol('response');
const kResponseSize = Symbol('responseSize');
const kDownloadedSize = Symbol('downloadedSize');
const kBodySize = Symbol('bodySize');
const kUploadedSize = Symbol('uploadedSize');
const kServerResponsesPiped = Symbol('serverResponsesPiped');
const kUnproxyEvents = Symbol('unproxyEvents');
const kIsFromCache = Symbol('isFromCache');
const kCancelTimeouts = Symbol('cancelTimeouts');
const kStartedReading = Symbol('startedReading');
const kStopReading = Symbol('stopReading');
const kTriggerRead = Symbol('triggerRead');
const kBody = Symbol('body');
const kJobs = Symbol('jobs');
const kOriginalResponse = Symbol('originalResponse');
exports.kIsNormalizedAlready = Symbol('isNormalizedAlready');
const supportsBrotli = dist.default.string(process.versions.brotli);
exports.withoutBody = new Set(['GET', 'HEAD']);
exports.knownHookEvents = ['init', 'beforeRequest', 'beforeRedirect', 'beforeError'];
function validateSearchParameters(searchParameters) {
    // eslint-disable-next-line guard-for-in
    for (const key in searchParameters) {
        const value = searchParameters[key];
        if (!dist.default.string(value) && !dist.default.number(value) && !dist.default.boolean(value) && !dist.default.null_(value)) {
            throw new TypeError(`The \`searchParams\` value '${String(value)}' must be a string, number, boolean or null`);
        }
    }
}
function isClientRequest(clientRequest) {
    return dist.default.object(clientRequest) && !('statusCode' in clientRequest);
}
const cacheableStore = new weakableMap.default();
const waitForOpenFile = async (file) => new Promise((resolve, reject) => {
    const onError = (error) => {
        reject(error);
    };
    if (!file.pending) {
        resolve();
    }
    file.once('error', onError);
    file.once('ready', () => {
        file.off('error', onError);
        resolve();
    });
});
const redirectCodes = new Set([300, 301, 302, 303, 304, 307, 308]);
const nonEnumerableProperties = [
    'context',
    'body',
    'json',
    'form'
];
const setNonEnumerableProperties = (sources, to) => {
    // Non enumerable properties shall not be merged
    const properties = {};
    for (const source of sources) {
        if (!source) {
            continue;
        }
        for (const name of nonEnumerableProperties) {
            if (!(name in source)) {
                continue;
            }
            properties[name] = {
                writable: true,
                configurable: true,
                enumerable: false,
                // @ts-ignore TS doesn't see the check above
                value: source[name]
            };
        }
    }
    Object.defineProperties(to, properties);
};
class RequestError extends Error {
    constructor(message, error, self) {
        var _a;
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = 'RequestError';
        this.code = error.code;
        if (self instanceof Request) {
            Object.defineProperty(this, 'request', {
                enumerable: false,
                value: self
            });
            Object.defineProperty(this, 'response', {
                enumerable: false,
                value: self[kResponse]
            });
            Object.defineProperty(this, 'options', {
                // This fails because of TS 3.7.2 useDefineForClassFields
                // Ref: https://github.com/microsoft/TypeScript/issues/34972
                enumerable: false,
                value: self.options
            });
        }
        else {
            Object.defineProperty(this, 'options', {
                // This fails because of TS 3.7.2 useDefineForClassFields
                // Ref: https://github.com/microsoft/TypeScript/issues/34972
                enumerable: false,
                value: self
            });
        }
        this.timings = (_a = this.request) === null || _a === void 0 ? void 0 : _a.timings;
        // Recover the original stacktrace
        if (!dist.default.undefined(error.stack)) {
            const indexOfMessage = this.stack.indexOf(this.message) + this.message.length;
            const thisStackTrace = this.stack.slice(indexOfMessage).split('\n').reverse();
            const errorStackTrace = error.stack.slice(error.stack.indexOf(error.message) + error.message.length).split('\n').reverse();
            // Remove duplicated traces
            while (errorStackTrace.length !== 0 && errorStackTrace[0] === thisStackTrace[0]) {
                thisStackTrace.shift();
            }
            this.stack = `${this.stack.slice(0, indexOfMessage)}${thisStackTrace.reverse().join('\n')}${errorStackTrace.reverse().join('\n')}`;
        }
    }
}
exports.RequestError = RequestError;
class MaxRedirectsError extends RequestError {
    constructor(request) {
        super(`Redirected ${request.options.maxRedirects} times. Aborting.`, {}, request);
        this.name = 'MaxRedirectsError';
    }
}
exports.MaxRedirectsError = MaxRedirectsError;
class HTTPError extends RequestError {
    constructor(response) {
        super(`Response code ${response.statusCode} (${response.statusMessage})`, {}, response.request);
        this.name = 'HTTPError';
    }
}
exports.HTTPError = HTTPError;
class CacheError extends RequestError {
    constructor(error, request) {
        super(error.message, error, request);
        this.name = 'CacheError';
    }
}
exports.CacheError = CacheError;
class UploadError extends RequestError {
    constructor(error, request) {
        super(error.message, error, request);
        this.name = 'UploadError';
    }
}
exports.UploadError = UploadError;
class TimeoutError extends RequestError {
    constructor(error, timings, request) {
        super(error.message, error, request);
        this.name = 'TimeoutError';
        this.event = error.event;
        this.timings = timings;
    }
}
exports.TimeoutError = TimeoutError;
class ReadError extends RequestError {
    constructor(error, request) {
        super(error.message, error, request);
        this.name = 'ReadError';
    }
}
exports.ReadError = ReadError;
class UnsupportedProtocolError extends RequestError {
    constructor(options) {
        super(`Unsupported protocol "${options.url.protocol}"`, {}, options);
        this.name = 'UnsupportedProtocolError';
    }
}
exports.UnsupportedProtocolError = UnsupportedProtocolError;
const proxiedRequestEvents = [
    'socket',
    'connect',
    'continue',
    'information',
    'upgrade',
    'timeout'
];
class Request extends Stream.Duplex {
    constructor(url, options = {}, defaults) {
        super({
            // It needs to be zero because we're just proxying the data to another stream
            highWaterMark: 0
        });
        this[kDownloadedSize] = 0;
        this[kUploadedSize] = 0;
        this.requestInitialized = false;
        this[kServerResponsesPiped] = new Set();
        this.redirects = [];
        this[kStopReading] = false;
        this[kTriggerRead] = false;
        this[kJobs] = [];
        // TODO: Remove this when targeting Node.js >= 12
        this._progressCallbacks = [];
        const unlockWrite = () => this._unlockWrite();
        const lockWrite = () => this._lockWrite();
        this.on('pipe', (source) => {
            source.prependListener('data', unlockWrite);
            source.on('data', lockWrite);
            source.prependListener('end', unlockWrite);
            source.on('end', lockWrite);
        });
        this.on('unpipe', (source) => {
            source.off('data', unlockWrite);
            source.off('data', lockWrite);
            source.off('end', unlockWrite);
            source.off('end', lockWrite);
        });
        this.on('pipe', source => {
            if (source instanceof http_1.IncomingMessage) {
                this.options.headers = {
                    ...source.headers,
                    ...this.options.headers
                };
            }
        });
        const { json, body, form } = options;
        if (json || body || form) {
            this._lockWrite();
        }
        (async (nonNormalizedOptions) => {
            var _a;
            try {
                if (nonNormalizedOptions.body instanceof fs.ReadStream) {
                    await waitForOpenFile(nonNormalizedOptions.body);
                }
                if (exports.kIsNormalizedAlready in nonNormalizedOptions) {
                    this.options = nonNormalizedOptions;
                }
                else {
                    // @ts-ignore Common TypeScript bug saying that `this.constructor` is not accessible
                    this.options = this.constructor.normalizeArguments(url, nonNormalizedOptions, defaults);
                }
                const { url: normalizedURL } = this.options;
                if (!normalizedURL) {
                    throw new TypeError('Missing `url` property');
                }
                this.requestUrl = normalizedURL.toString();
                decodeURI(this.requestUrl);
                await this._finalizeBody();
                await this._makeRequest();
                if (this.destroyed) {
                    (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.destroy();
                    return;
                }
                // Queued writes etc.
                for (const job of this[kJobs]) {
                    job();
                }
                this.requestInitialized = true;
            }
            catch (error) {
                if (error instanceof RequestError) {
                    this._beforeError(error);
                    return;
                }
                // This is a workaround for https://github.com/nodejs/node/issues/33335
                if (!this.destroyed) {
                    this.destroy(error);
                }
            }
        })(options);
    }
    static normalizeArguments(url, options, defaults) {
        var _a, _b, _c, _d;
        const rawOptions = options;
        if (dist.default.object(url) && !dist.default.urlInstance(url)) {
            options = { ...defaults, ...url, ...options };
        }
        else {
            if (url && options && options.url) {
                throw new TypeError('The `url` option is mutually exclusive with the `input` argument');
            }
            options = { ...defaults, ...options };
            if (url) {
                options.url = url;
            }
            if (dist.default.urlInstance(options.url)) {
                options.url = new Url.URL(options.url.toString());
            }
        }
        // TODO: Deprecate URL options in Got 12.
        // Support extend-specific options
        if (options.cache === false) {
            options.cache = undefined;
        }
        if (options.dnsCache === false) {
            options.dnsCache = undefined;
        }
        // Nice type assertions
        dist.assert.any([dist.default.string, dist.default.undefined], options.method);
        dist.assert.any([dist.default.object, dist.default.undefined], options.headers);
        dist.assert.any([dist.default.string, dist.default.urlInstance, dist.default.undefined], options.prefixUrl);
        dist.assert.any([dist.default.object, dist.default.undefined], options.cookieJar);
        dist.assert.any([dist.default.object, dist.default.string, dist.default.undefined], options.searchParams);
        dist.assert.any([dist.default.object, dist.default.string, dist.default.undefined], options.cache);
        dist.assert.any([dist.default.object, dist.default.number, dist.default.undefined], options.timeout);
        dist.assert.any([dist.default.object, dist.default.undefined], options.context);
        dist.assert.any([dist.default.object, dist.default.undefined], options.hooks);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.decompress);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.ignoreInvalidCookies);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.followRedirect);
        dist.assert.any([dist.default.number, dist.default.undefined], options.maxRedirects);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.throwHttpErrors);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.http2);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.allowGetBody);
        dist.assert.any([dist.default.string, dist.default.undefined], options.localAddress);
        dist.assert.any([dist.default.object, dist.default.undefined], options.https);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.rejectUnauthorized);
        if (options.https) {
            dist.assert.any([dist.default.boolean, dist.default.undefined], options.https.rejectUnauthorized);
            dist.assert.any([dist.default.function_, dist.default.undefined], options.https.checkServerIdentity);
            dist.assert.any([dist.default.string, dist.default.object, dist.default.array, dist.default.undefined], options.https.certificateAuthority);
            dist.assert.any([dist.default.string, dist.default.object, dist.default.array, dist.default.undefined], options.https.key);
            dist.assert.any([dist.default.string, dist.default.object, dist.default.array, dist.default.undefined], options.https.certificate);
            dist.assert.any([dist.default.string, dist.default.undefined], options.https.passphrase);
        }
        // `options.method`
        if (dist.default.string(options.method)) {
            options.method = options.method.toUpperCase();
        }
        else {
            options.method = 'GET';
        }
        // `options.headers`
        if (options.headers === (defaults === null || defaults === void 0 ? void 0 : defaults.headers)) {
            options.headers = { ...options.headers };
        }
        else {
            options.headers = lowercaseKeys({ ...(defaults === null || defaults === void 0 ? void 0 : defaults.headers), ...options.headers });
        }
        // Disallow legacy `url.Url`
        if ('slashes' in options) {
            throw new TypeError('The legacy `url.Url` has been deprecated. Use `URL` instead.');
        }
        // `options.auth`
        if ('auth' in options) {
            throw new TypeError('Parameter `auth` is deprecated. Use `username` / `password` instead.');
        }
        // `options.searchParams`
        if ('searchParams' in options) {
            if (options.searchParams && options.searchParams !== (defaults === null || defaults === void 0 ? void 0 : defaults.searchParams)) {
                if (!dist.default.string(options.searchParams) && !(options.searchParams instanceof Url.URLSearchParams)) {
                    validateSearchParameters(options.searchParams);
                }
                const searchParameters = new Url.URLSearchParams(options.searchParams);
                // `normalizeArguments()` is also used to merge options
                (_a = defaults === null || defaults === void 0 ? void 0 : defaults.searchParams) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
                    // Only use default if one isn't already defined
                    if (!searchParameters.has(key)) {
                        searchParameters.append(key, value);
                    }
                });
                options.searchParams = searchParameters;
            }
        }
        // `options.username` & `options.password`
        options.username = (_b = options.username) !== null && _b !== void 0 ? _b : '';
        options.password = (_c = options.password) !== null && _c !== void 0 ? _c : '';
        // `options.prefixUrl` & `options.url`
        if (options.prefixUrl) {
            options.prefixUrl = options.prefixUrl.toString();
            if (options.prefixUrl !== '' && !options.prefixUrl.endsWith('/')) {
                options.prefixUrl += '/';
            }
        }
        else {
            options.prefixUrl = '';
        }
        if (dist.default.string(options.url)) {
            if (options.url.startsWith('/')) {
                throw new Error('`input` must not start with a slash when using `prefixUrl`');
            }
            options.url = optionsToUrl.default(options.prefixUrl + options.url, options);
        }
        else if ((dist.default.undefined(options.url) && options.prefixUrl !== '') || options.protocol) {
            options.url = optionsToUrl.default(options.prefixUrl, options);
        }
        if (options.url) {
            // Make it possible to change `options.prefixUrl`
            let { prefixUrl } = options;
            Object.defineProperty(options, 'prefixUrl', {
                set: (value) => {
                    const url = options.url;
                    if (!url.href.startsWith(value)) {
                        throw new Error(`Cannot change \`prefixUrl\` from ${prefixUrl} to ${value}: ${url.href}`);
                    }
                    options.url = new Url.URL(value + url.href.slice(prefixUrl.length));
                    prefixUrl = value;
                },
                get: () => prefixUrl
            });
            // Support UNIX sockets
            let { protocol } = options.url;
            if (protocol === 'unix:') {
                protocol = 'http:';
                options.url = new Url.URL(`http://unix${options.url.pathname}${options.url.search}`);
            }
            // Set search params
            if (options.searchParams) {
                options.url.search = options.searchParams.toString();
            }
            // Protocol check
            if (protocol !== 'http:' && protocol !== 'https:') {
                throw new UnsupportedProtocolError(options);
            }
            // Update `username`
            if (options.username === '') {
                options.username = options.url.username;
            }
            else {
                options.url.username = options.username;
            }
            // Update `password`
            if (options.password === '') {
                options.password = options.url.password;
            }
            else {
                options.url.password = options.password;
            }
        }
        // `options.cookieJar`
        const { cookieJar } = options;
        if (cookieJar) {
            let { setCookie, getCookieString } = cookieJar;
            dist.assert.function_(setCookie);
            dist.assert.function_(getCookieString);
            /* istanbul ignore next: Horrible `tough-cookie` v3 check */
            if (setCookie.length === 4 && getCookieString.length === 0) {
                setCookie = util.promisify(setCookie.bind(options.cookieJar));
                getCookieString = util.promisify(getCookieString.bind(options.cookieJar));
                options.cookieJar = {
                    setCookie,
                    getCookieString
                };
            }
        }
        // `options.cache`
        const { cache } = options;
        if (cache) {
            if (!cacheableStore.has(cache)) {
                cacheableStore.set(cache, new src$3(((requestOptions, handler) => requestOptions[kRequest](requestOptions, handler)), cache));
            }
        }
        // `options.dnsCache`
        if (options.dnsCache === true) {
            options.dnsCache = new source$2.default();
        }
        else if (!dist.default.undefined(options.dnsCache) && !options.dnsCache.lookup) {
            throw new TypeError(`Parameter \`dnsCache\` must be a CacheableLookup instance or a boolean, got ${dist.default(options.dnsCache)}`);
        }
        // `options.timeout`
        if (dist.default.number(options.timeout)) {
            options.timeout = { request: options.timeout };
        }
        else if (defaults && options.timeout !== defaults.timeout) {
            options.timeout = {
                ...defaults.timeout,
                ...options.timeout
            };
        }
        else {
            options.timeout = { ...options.timeout };
        }
        // `options.context`
        if (!options.context) {
            options.context = {};
        }
        // `options.hooks`
        const areHooksDefault = options.hooks === (defaults === null || defaults === void 0 ? void 0 : defaults.hooks);
        options.hooks = { ...options.hooks };
        for (const event of exports.knownHookEvents) {
            if (event in options.hooks) {
                if (dist.default.array(options.hooks[event])) {
                    // See https://github.com/microsoft/TypeScript/issues/31445#issuecomment-576929044
                    options.hooks[event] = [...options.hooks[event]];
                }
                else {
                    throw new TypeError(`Parameter \`${event}\` must be an Array, got ${dist.default(options.hooks[event])}`);
                }
            }
            else {
                options.hooks[event] = [];
            }
        }
        if (defaults && !areHooksDefault) {
            for (const event of exports.knownHookEvents) {
                const defaultHooks = defaults.hooks[event];
                if (defaultHooks.length !== 0) {
                    // See https://github.com/microsoft/TypeScript/issues/31445#issuecomment-576929044
                    options.hooks[event] = [
                        ...defaults.hooks[event],
                        ...options.hooks[event]
                    ];
                }
            }
        }
        // HTTPS options
        if ('rejectUnauthorized' in options) {
            deprecationWarning.default('"options.rejectUnauthorized" is now deprecated, please use "options.https.rejectUnauthorized"');
        }
        if ('checkServerIdentity' in options) {
            deprecationWarning.default('"options.checkServerIdentity" was never documented, please use "options.https.checkServerIdentity"');
        }
        if ('ca' in options) {
            deprecationWarning.default('"options.ca" was never documented, please use "options.https.certificateAuthority"');
        }
        if ('key' in options) {
            deprecationWarning.default('"options.key" was never documented, please use "options.https.key"');
        }
        if ('cert' in options) {
            deprecationWarning.default('"options.cert" was never documented, please use "options.https.certificate"');
        }
        if ('passphrase' in options) {
            deprecationWarning.default('"options.passphrase" was never documented, please use "options.https.passphrase"');
        }
        // Other options
        if ('followRedirects' in options) {
            throw new TypeError('The `followRedirects` option does not exist. Use `followRedirect` instead.');
        }
        if (options.agent) {
            for (const key in options.agent) {
                if (key !== 'http' && key !== 'https' && key !== 'http2') {
                    throw new TypeError(`Expected the \`options.agent\` properties to be \`http\`, \`https\` or \`http2\`, got \`${key}\``);
                }
            }
        }
        options.maxRedirects = (_d = options.maxRedirects) !== null && _d !== void 0 ? _d : 0;
        // Set non-enumerable properties
        setNonEnumerableProperties([defaults, rawOptions], options);
        return options;
    }
    _lockWrite() {
        const onLockedWrite = () => {
            throw new TypeError('The payload has been already provided');
        };
        this.write = onLockedWrite;
        this.end = onLockedWrite;
    }
    _unlockWrite() {
        this.write = super.write;
        this.end = super.end;
    }
    async _finalizeBody() {
        const { options } = this;
        const { headers } = options;
        const isForm = !dist.default.undefined(options.form);
        const isJSON = !dist.default.undefined(options.json);
        const isBody = !dist.default.undefined(options.body);
        const hasPayload = isForm || isJSON || isBody;
        const cannotHaveBody = exports.withoutBody.has(options.method) && !(options.method === 'GET' && options.allowGetBody);
        this._cannotHaveBody = cannotHaveBody;
        if (hasPayload) {
            if (cannotHaveBody) {
                throw new TypeError(`The \`${options.method}\` method cannot be used with a body`);
            }
            if ([isBody, isForm, isJSON].filter(isTrue => isTrue).length > 1) {
                throw new TypeError('The `body`, `json` and `form` options are mutually exclusive');
            }
            if (isBody &&
                !(options.body instanceof Stream.Readable) &&
                !dist.default.string(options.body) &&
                !dist.default.buffer(options.body) &&
                !isFormData.default(options.body)) {
                throw new TypeError('The `body` option must be a stream.Readable, string or Buffer');
            }
            if (isForm && !dist.default.object(options.form)) {
                throw new TypeError('The `form` option must be an Object');
            }
            {
                // Serialize body
                const noContentType = !dist.default.string(headers['content-type']);
                if (isBody) {
                    // Special case for https://github.com/form-data/form-data
                    if (isFormData.default(options.body) && noContentType) {
                        headers['content-type'] = `multipart/form-data; boundary=${options.body.getBoundary()}`;
                    }
                    this[kBody] = options.body;
                }
                else if (isForm) {
                    if (noContentType) {
                        headers['content-type'] = 'application/x-www-form-urlencoded';
                    }
                    this[kBody] = (new Url.URLSearchParams(options.form)).toString();
                }
                else {
                    if (noContentType) {
                        headers['content-type'] = 'application/json';
                    }
                    this[kBody] = JSON.stringify(options.json);
                }
                const uploadBodySize = await getBodySize.default(this[kBody], options.headers);
                // See https://tools.ietf.org/html/rfc7230#section-3.3.2
                // A user agent SHOULD send a Content-Length in a request message when
                // no Transfer-Encoding is sent and the request method defines a meaning
                // for an enclosed payload body.  For example, a Content-Length header
                // field is normally sent in a POST request even when the value is 0
                // (indicating an empty payload body).  A user agent SHOULD NOT send a
                // Content-Length header field when the request message does not contain
                // a payload body and the method semantics do not anticipate such a
                // body.
                if (dist.default.undefined(headers['content-length']) && dist.default.undefined(headers['transfer-encoding'])) {
                    if (!cannotHaveBody && !dist.default.undefined(uploadBodySize)) {
                        headers['content-length'] = String(uploadBodySize);
                    }
                }
            }
        }
        else if (cannotHaveBody) {
            this._lockWrite();
        }
        else {
            this._unlockWrite();
        }
        this[kBodySize] = Number(headers['content-length']) || undefined;
    }
    async _onResponse(response) {
        const { options } = this;
        const { url } = options;
        this[kOriginalResponse] = response;
        if (options.decompress) {
            response = decompressResponse(response);
        }
        const statusCode = response.statusCode;
        const typedResponse = response;
        typedResponse.statusMessage = typedResponse.statusMessage ? typedResponse.statusMessage : http.STATUS_CODES[statusCode];
        typedResponse.url = options.url.toString();
        typedResponse.requestUrl = this.requestUrl;
        typedResponse.redirectUrls = this.redirects;
        typedResponse.request = this;
        typedResponse.isFromCache = response.fromCache || false;
        typedResponse.ip = this.ip;
        this[kIsFromCache] = typedResponse.isFromCache;
        this[kResponseSize] = Number(response.headers['content-length']) || undefined;
        this[kResponse] = response;
        response.once('end', () => {
            this[kResponseSize] = this[kDownloadedSize];
            this.emit('downloadProgress', this.downloadProgress);
        });
        response.once('error', (error) => {
            // Force clean-up, because some packages don't do this.
            // TODO: Fix decompress-response
            response.destroy();
            this._beforeError(new ReadError(error, this));
        });
        response.once('aborted', () => {
            this._beforeError(new ReadError({
                name: 'Error',
                message: 'The server aborted the pending request'
            }, this));
        });
        this.emit('downloadProgress', this.downloadProgress);
        const rawCookies = response.headers['set-cookie'];
        if (dist.default.object(options.cookieJar) && rawCookies) {
            let promises = rawCookies.map(async (rawCookie) => options.cookieJar.setCookie(rawCookie, url.toString()));
            if (options.ignoreInvalidCookies) {
                promises = promises.map(async (p) => p.catch(() => { }));
            }
            try {
                await Promise.all(promises);
            }
            catch (error) {
                this._beforeError(error);
                return;
            }
        }
        if (options.followRedirect && response.headers.location && redirectCodes.has(statusCode)) {
            // We're being redirected, we don't care about the response.
            // It'd be besto to abort the request, but we can't because
            // we would have to sacrifice the TCP connection. We don't want that.
            response.resume();
            if (this[kRequest]) {
                this[kCancelTimeouts]();
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this[kRequest];
                this[kUnproxyEvents]();
            }
            const shouldBeGet = statusCode === 303 && options.method !== 'GET' && options.method !== 'HEAD';
            if (shouldBeGet || !options.methodRewriting) {
                // Server responded with "see other", indicating that the resource exists at another location,
                // and the client should request it from that location via GET or HEAD.
                options.method = 'GET';
                if ('body' in options) {
                    delete options.body;
                }
                if ('json' in options) {
                    delete options.json;
                }
                if ('form' in options) {
                    delete options.form;
                }
            }
            if (this.redirects.length >= options.maxRedirects) {
                this._beforeError(new MaxRedirectsError(this));
                return;
            }
            try {
                // Do not remove. See https://github.com/sindresorhus/got/pull/214
                const redirectBuffer = Buffer.from(response.headers.location, 'binary').toString();
                // Handles invalid URLs. See https://github.com/sindresorhus/got/issues/604
                const redirectUrl = new Url.URL(redirectBuffer, url);
                const redirectString = redirectUrl.toString();
                decodeURI(redirectString);
                // Redirecting to a different site, clear sensitive data.
                if (redirectUrl.hostname !== url.hostname) {
                    if ('host' in options.headers) {
                        delete options.headers.host;
                    }
                    if ('cookie' in options.headers) {
                        delete options.headers.cookie;
                    }
                    if ('authorization' in options.headers) {
                        delete options.headers.authorization;
                    }
                    if (options.username || options.password) {
                        delete options.username;
                        delete options.password;
                    }
                }
                this.redirects.push(redirectString);
                options.url = redirectUrl;
                for (const hook of options.hooks.beforeRedirect) {
                    // eslint-disable-next-line no-await-in-loop
                    await hook(options, typedResponse);
                }
                this.emit('redirect', typedResponse, options);
                await this._makeRequest();
            }
            catch (error) {
                this._beforeError(error);
                return;
            }
            return;
        }
        const limitStatusCode = options.followRedirect ? 299 : 399;
        const isOk = (statusCode >= 200 && statusCode <= limitStatusCode) || statusCode === 304;
        if (options.throwHttpErrors && !isOk) {
            await this._beforeError(new HTTPError(typedResponse));
            if (this.destroyed) {
                return;
            }
        }
        response.on('readable', () => {
            if (this[kTriggerRead]) {
                this._read();
            }
        });
        this.on('resume', () => {
            response.resume();
        });
        this.on('pause', () => {
            response.pause();
        });
        response.once('end', () => {
            this.push(null);
        });
        this.emit('response', response);
        for (const destination of this[kServerResponsesPiped]) {
            if (destination.headersSent) {
                continue;
            }
            // eslint-disable-next-line guard-for-in
            for (const key in response.headers) {
                const isAllowed = options.decompress ? key !== 'content-encoding' : true;
                const value = response.headers[key];
                if (isAllowed) {
                    destination.setHeader(key, value);
                }
            }
            destination.statusCode = statusCode;
        }
    }
    _onRequest(request) {
        const { options } = this;
        const { timeout, url } = options;
        source$1.default(request);
        this[kCancelTimeouts] = timedOut.default(request, timeout, url);
        const responseEventName = options.cache ? 'cacheableResponse' : 'response';
        request.once(responseEventName, (response) => {
            this._onResponse(response);
        });
        request.once('error', (error) => {
            // Force clean-up, because some packages (e.g. nock) don't do this.
            request.destroy();
            if (error instanceof timedOut.TimeoutError) {
                error = new TimeoutError(error, this.timings, this);
            }
            else {
                error = new RequestError(error.message, error, this);
            }
            this._beforeError(error);
        });
        this[kUnproxyEvents] = proxyEvents$1.default(request, this, proxiedRequestEvents);
        this[kRequest] = request;
        this.emit('uploadProgress', this.uploadProgress);
        // Send body
        const body = this[kBody];
        const currentRequest = this.redirects.length === 0 ? this : request;
        if (dist.default.nodeStream(body)) {
            body.pipe(currentRequest);
            body.once('error', (error) => {
                this._beforeError(new UploadError(error, this));
            });
            body.once('end', () => {
                delete options.body;
            });
        }
        else {
            this._unlockWrite();
            if (!dist.default.undefined(body)) {
                this._writeRequest(body, null, () => { });
                currentRequest.end();
                this._lockWrite();
            }
            else if (this._cannotHaveBody || this._noPipe) {
                currentRequest.end();
                this._lockWrite();
            }
        }
        this.emit('request', request);
    }
    async _createCacheableRequest(url, options) {
        return new Promise((resolve, reject) => {
            // TODO: Remove `utils/url-to-options.ts` when `cacheable-request` is fixed
            Object.assign(options, urlToOptions$1.default(url));
            // `http-cache-semantics` checks this
            delete options.url;
            // This is ugly
            const cacheRequest = cacheableStore.get(options.cache)(options, response => {
                const typedResponse = response;
                const { req } = typedResponse;
                // TODO: Fix `cacheable-response`
                typedResponse._readableState.autoDestroy = false;
                if (req) {
                    req.emit('cacheableResponse', typedResponse);
                }
                resolve(typedResponse);
            });
            // Restore options
            options.url = url;
            cacheRequest.once('error', reject);
            cacheRequest.once('request', resolve);
        });
    }
    async _makeRequest() {
        var _a;
        const { options } = this;
        const { headers } = options;
        for (const key in headers) {
            if (dist.default.undefined(headers[key])) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete headers[key];
            }
            else if (dist.default.null_(headers[key])) {
                throw new TypeError(`Use \`undefined\` instead of \`null\` to delete the \`${key}\` header`);
            }
        }
        if (options.decompress && dist.default.undefined(headers['accept-encoding'])) {
            headers['accept-encoding'] = supportsBrotli ? 'gzip, deflate, br' : 'gzip, deflate';
        }
        // Set cookies
        if (options.cookieJar) {
            const cookieString = await options.cookieJar.getCookieString(options.url.toString());
            if (dist.default.nonEmptyString(cookieString)) {
                options.headers.cookie = cookieString;
            }
        }
        for (const hook of options.hooks.beforeRequest) {
            // eslint-disable-next-line no-await-in-loop
            const result = await hook(options);
            if (!dist.default.undefined(result)) {
                // @ts-ignore Skip the type mismatch to support abstract responses
                options.request = () => result;
                break;
            }
        }
        const { agent, request, timeout, url } = options;
        if (options.dnsCache && !('lookup' in options)) {
            options.lookup = options.dnsCache.lookup;
        }
        // UNIX sockets
        if (url.hostname === 'unix') {
            const matches = /(?<socketPath>.+?):(?<path>.+)/.exec(`${url.pathname}${url.search}`);
            if (matches === null || matches === void 0 ? void 0 : matches.groups) {
                const { socketPath, path } = matches.groups;
                Object.assign(options, {
                    socketPath,
                    path,
                    host: ''
                });
            }
        }
        const isHttps = url.protocol === 'https:';
        // Fallback function
        let fallbackFn;
        if (options.http2) {
            fallbackFn = source$3.auto;
        }
        else {
            fallbackFn = isHttps ? https.request : http.request;
        }
        const realFn = (_a = options.request) !== null && _a !== void 0 ? _a : fallbackFn;
        // Cache support
        const fn = options.cache ? this._createCacheableRequest : realFn;
        // Pass an agent directly when HTTP2 is disabled
        if (agent && !options.http2) {
            options.agent = agent[isHttps ? 'https' : 'http'];
        }
        // Prepare plain HTTP request options
        options[kRequest] = realFn;
        delete options.request;
        delete options.timeout;
        const requestOptions = options;
        // HTTPS options remapping
        if (options.https) {
            if ('rejectUnauthorized' in options.https) {
                requestOptions.rejectUnauthorized = options.https.rejectUnauthorized;
            }
            if (options.https.checkServerIdentity) {
                requestOptions.checkServerIdentity = options.https.checkServerIdentity;
            }
            if (options.https.certificateAuthority) {
                requestOptions.ca = options.https.certificateAuthority;
            }
            if (options.https.certificate) {
                requestOptions.cert = options.https.certificate;
            }
            if (options.https.key) {
                requestOptions.key = options.https.key;
            }
            if (options.https.passphrase) {
                requestOptions.passphrase = options.https.passphrase;
            }
        }
        try {
            let requestOrResponse = await fn(url, requestOptions);
            if (dist.default.undefined(requestOrResponse)) {
                requestOrResponse = fallbackFn(url, requestOptions);
            }
            // Restore options
            options.request = request;
            options.timeout = timeout;
            options.agent = agent;
            if (isClientRequest(requestOrResponse)) {
                this._onRequest(requestOrResponse);
                // Emit the response after the stream has been ended
            }
            else if (this.writable) {
                this.once('finish', () => {
                    this._onResponse(requestOrResponse);
                });
                this._unlockWrite();
                this.end();
                this._lockWrite();
            }
            else {
                this._onResponse(requestOrResponse);
            }
        }
        catch (error) {
            if (error instanceof src$3.CacheError) {
                throw new CacheError(error, this);
            }
            throw new RequestError(error.message, error, this);
        }
    }
    async _beforeError(error) {
        if (this.destroyed) {
            return;
        }
        this[kStopReading] = true;
        if (!(error instanceof RequestError)) {
            error = new RequestError(error.message, error, this);
        }
        try {
            const { response } = error;
            if (response) {
                response.setEncoding(this._readableState.encoding);
                response.rawBody = await getStream_1.buffer(response);
                response.body = response.rawBody.toString();
            }
        }
        catch (_) { }
        try {
            for (const hook of this.options.hooks.beforeError) {
                // eslint-disable-next-line no-await-in-loop
                error = await hook(error);
            }
        }
        catch (error_) {
            error = new RequestError(error_.message, error_, this);
        }
        this.destroy(error);
    }
    _read() {
        this[kTriggerRead] = true;
        const response = this[kResponse];
        if (response && !this[kStopReading]) {
            // We cannot put this in the `if` above
            // because `.read()` also triggers the `end` event
            if (response.readableLength) {
                this[kTriggerRead] = false;
            }
            let data;
            while ((data = response.read()) !== null) {
                this[kDownloadedSize] += data.length;
                this[kStartedReading] = true;
                const progress = this.downloadProgress;
                if (progress.percent < 1) {
                    this.emit('downloadProgress', progress);
                }
                this.push(data);
            }
        }
    }
    _write(chunk, encoding, callback) {
        const write = () => {
            this._writeRequest(chunk, encoding, callback);
        };
        if (this.requestInitialized) {
            write();
        }
        else {
            this[kJobs].push(write);
        }
    }
    _writeRequest(chunk, encoding, callback) {
        this._progressCallbacks.push(() => {
            this[kUploadedSize] += Buffer.byteLength(chunk, encoding);
            const progress = this.uploadProgress;
            if (progress.percent < 1) {
                this.emit('uploadProgress', progress);
            }
        });
        // TODO: What happens if it's from cache? Then this[kRequest] won't be defined.
        this[kRequest].write(chunk, encoding, (error) => {
            if (!error && this._progressCallbacks.length !== 0) {
                this._progressCallbacks.shift()();
            }
            callback(error);
        });
    }
    _final(callback) {
        const endRequest = () => {
            // FIX: Node.js 10 calls the write callback AFTER the end callback!
            while (this._progressCallbacks.length !== 0) {
                this._progressCallbacks.shift()();
            }
            // We need to check if `this[kRequest]` is present,
            // because it isn't when we use cache.
            if (!(kRequest in this)) {
                callback();
                return;
            }
            if (this[kRequest].destroyed) {
                callback();
                return;
            }
            this[kRequest].end((error) => {
                if (!error) {
                    this[kBodySize] = this[kUploadedSize];
                    this.emit('uploadProgress', this.uploadProgress);
                    this[kRequest].emit('upload-complete');
                }
                callback(error);
            });
        };
        if (this.requestInitialized) {
            endRequest();
        }
        else {
            this[kJobs].push(endRequest);
        }
    }
    _destroy(error, callback) {
        var _a;
        if (kRequest in this) {
            this[kCancelTimeouts]();
            // TODO: Remove the next `if` when these get fixed:
            // - https://github.com/nodejs/node/issues/32851
            if (!((_a = this[kResponse]) === null || _a === void 0 ? void 0 : _a.complete)) {
                this[kRequest].destroy();
            }
        }
        if (error !== null && !dist.default.undefined(error) && !(error instanceof RequestError)) {
            error = new RequestError(error.message, error, this);
        }
        callback(error);
    }
    get ip() {
        var _a;
        return (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.socket.remoteAddress;
    }
    get aborted() {
        var _a, _b, _c;
        return ((_b = (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.destroyed) !== null && _b !== void 0 ? _b : this.destroyed) && !((_c = this[kOriginalResponse]) === null || _c === void 0 ? void 0 : _c.complete);
    }
    get socket() {
        var _a;
        return (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.socket;
    }
    get downloadProgress() {
        let percent;
        if (this[kResponseSize]) {
            percent = this[kDownloadedSize] / this[kResponseSize];
        }
        else if (this[kResponseSize] === this[kDownloadedSize]) {
            percent = 1;
        }
        else {
            percent = 0;
        }
        return {
            percent,
            transferred: this[kDownloadedSize],
            total: this[kResponseSize]
        };
    }
    get uploadProgress() {
        let percent;
        if (this[kBodySize]) {
            percent = this[kUploadedSize] / this[kBodySize];
        }
        else if (this[kBodySize] === this[kUploadedSize]) {
            percent = 1;
        }
        else {
            percent = 0;
        }
        return {
            percent,
            transferred: this[kUploadedSize],
            total: this[kBodySize]
        };
    }
    get timings() {
        var _a;
        return (_a = this[kRequest]) === null || _a === void 0 ? void 0 : _a.timings;
    }
    get isFromCache() {
        return this[kIsFromCache];
    }
    get _response() {
        return this[kResponse];
    }
    pipe(destination, options) {
        if (this[kStartedReading]) {
            throw new Error('Failed to pipe. The response has been emitted already.');
        }
        if (destination instanceof http_1.ServerResponse) {
            this[kServerResponsesPiped].add(destination);
        }
        return super.pipe(destination, options);
    }
    unpipe(destination) {
        if (destination instanceof http_1.ServerResponse) {
            this[kServerResponsesPiped].delete(destination);
        }
        super.unpipe(destination);
        return this;
    }
}
exports.default = Request;
});

unwrapExports(core$2);

var types = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.CancelError = pCancelable.CancelError;

exports.RequestError = 
// Errors to be exported
core$2.RequestError;
exports.MaxRedirectsError = core$2.MaxRedirectsError;
exports.CacheError = core$2.CacheError;
exports.UploadError = core$2.UploadError;
exports.TimeoutError = core$2.TimeoutError;
exports.HTTPError = core$2.HTTPError;
exports.ReadError = core$2.ReadError;
exports.UnsupportedProtocolError = core$2.UnsupportedProtocolError;
class ParseError extends core$2.RequestError {
    constructor(error, response) {
        const { options } = response.request;
        super(`${error.message} in "${options.url.toString()}"`, error, response.request);
        this.name = 'ParseError';
        Object.defineProperty(this, 'response', {
            enumerable: false,
            value: response
        });
    }
}
exports.ParseError = ParseError;
});

unwrapExports(types);

var calculateRetryDelay_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

const retryAfterStatusCodes = new Set([413, 429, 503]);
const isErrorWithResponse = (error) => (error instanceof types.HTTPError || error instanceof types.ParseError || error instanceof types.MaxRedirectsError);
const calculateRetryDelay = ({ attemptCount, retryOptions, error }) => {
    if (attemptCount > retryOptions.limit) {
        return 0;
    }
    const hasMethod = retryOptions.methods.includes(error.options.method);
    const hasErrorCode = retryOptions.errorCodes.includes(error.code);
    const hasStatusCode = isErrorWithResponse(error) && retryOptions.statusCodes.includes(error.response.statusCode);
    if (!hasMethod || (!hasErrorCode && !hasStatusCode)) {
        return 0;
    }
    if (isErrorWithResponse(error)) {
        const { response } = error;
        if (response && 'retry-after' in response.headers && retryAfterStatusCodes.has(response.statusCode)) {
            let after = Number(response.headers['retry-after']);
            if (Number.isNaN(after)) {
                after = Date.parse(response.headers['retry-after']) - Date.now();
            }
            else {
                after *= 1000;
            }
            if (retryOptions.maxRetryAfter === undefined || after > retryOptions.maxRetryAfter) {
                return 0;
            }
            return after;
        }
        if (response.statusCode === 413) {
            return 0;
        }
    }
    const noise = Math.random() * 100;
    return ((2 ** (attemptCount - 1)) * 1000) + noise;
};
exports.default = calculateRetryDelay;
});

unwrapExports(calculateRetryDelay_1);

var core$3 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



if (!core$2.knownHookEvents.includes('beforeRetry')) {
    core$2.knownHookEvents.push('beforeRetry', 'afterResponse');
}
exports.knownBodyTypes = ['json', 'buffer', 'text'];
// @ts-ignore The error is: Not all code paths return a value.
exports.parseBody = (response, responseType, encoding) => {
    const { rawBody } = response;
    try {
        if (responseType === 'text') {
            return rawBody.toString(encoding);
        }
        if (responseType === 'json') {
            return rawBody.length === 0 ? '' : JSON.parse(rawBody.toString());
        }
        if (responseType === 'buffer') {
            return Buffer.from(rawBody);
        }
        throw new types.ParseError({
            message: `Unknown body type '${responseType}'`,
            name: 'Error'
        }, response);
    }
    catch (error) {
        throw new types.ParseError(error, response);
    }
};
class PromisableRequest extends core$2.default {
    static normalizeArguments(url, nonNormalizedOptions, defaults) {
        const options = super.normalizeArguments(url, nonNormalizedOptions, defaults);
        if (dist.default.null_(options.encoding)) {
            throw new TypeError('To get a Buffer, set `options.responseType` to `buffer` instead');
        }
        dist.assert.any([dist.default.string, dist.default.undefined], options.encoding);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.resolveBodyOnly);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.methodRewriting);
        dist.assert.any([dist.default.boolean, dist.default.undefined], options.isStream);
        dist.assert.any([dist.default.string, dist.default.undefined], options.responseType);
        // `options.responseType`
        if (options.responseType === undefined) {
            options.responseType = 'text';
        }
        // `options.retry`
        const { retry } = options;
        if (defaults) {
            options.retry = { ...defaults.retry };
        }
        else {
            options.retry = {
                calculateDelay: retryObject => retryObject.computedValue,
                limit: 0,
                methods: [],
                statusCodes: [],
                errorCodes: [],
                maxRetryAfter: undefined
            };
        }
        if (dist.default.object(retry)) {
            options.retry = {
                ...options.retry,
                ...retry
            };
            options.retry.methods = [...new Set(options.retry.methods.map(method => method.toUpperCase()))];
            options.retry.statusCodes = [...new Set(options.retry.statusCodes)];
            options.retry.errorCodes = [...new Set(options.retry.errorCodes)];
        }
        else if (dist.default.number(retry)) {
            options.retry.limit = retry;
        }
        if (dist.default.undefined(options.retry.maxRetryAfter)) {
            options.retry.maxRetryAfter = Math.min(...[options.timeout.request, options.timeout.connect].filter(dist.default.number));
        }
        // `options.pagination`
        if (dist.default.object(options.pagination)) {
            if (defaults) {
                options.pagination = {
                    ...defaults.pagination,
                    ...options.pagination
                };
            }
            const { pagination } = options;
            if (!dist.default.function_(pagination.transform)) {
                throw new Error('`options.pagination.transform` must be implemented');
            }
            if (!dist.default.function_(pagination.shouldContinue)) {
                throw new Error('`options.pagination.shouldContinue` must be implemented');
            }
            if (!dist.default.function_(pagination.filter)) {
                throw new TypeError('`options.pagination.filter` must be implemented');
            }
            if (!dist.default.function_(pagination.paginate)) {
                throw new Error('`options.pagination.paginate` must be implemented');
            }
        }
        // JSON mode
        if (options.responseType === 'json' && options.headers.accept === undefined) {
            options.headers.accept = 'application/json';
        }
        return options;
    }
    static mergeOptions(...sources) {
        let mergedOptions;
        for (const source of sources) {
            mergedOptions = PromisableRequest.normalizeArguments(undefined, source, mergedOptions);
        }
        return mergedOptions;
    }
    async _beforeError(error) {
        if (!(error instanceof core$2.RequestError)) {
            error = new core$2.RequestError(error.message, error, this);
        }
        // Let the promise decide whether to abort or not
        // It is also responsible for the `beforeError` hook
        this.emit('error', error);
    }
}
exports.default = PromisableRequest;
});

unwrapExports(core$3);

var asPromise_1 = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });






exports.PromisableRequest = core$3.default;

const proxiedRequestEvents = [
    'request',
    'response',
    'redirect',
    'uploadProgress',
    'downloadProgress'
];
function asPromise(options) {
    let retryCount = 0;
    let globalRequest;
    let globalResponse;
    const emitter = new events.EventEmitter();
    const promise = new pCancelable((resolve, _reject, onCancel) => {
        const makeRequest = () => {
            // Support retries
            // `options.throwHttpErrors` needs to be always true,
            // so the HTTP errors are caught and the request is retried.
            // The error is **eventually** thrown if the user value is true.
            const { throwHttpErrors } = options;
            if (!throwHttpErrors) {
                options.throwHttpErrors = true;
            }
            // Note from @szmarczak: I think we should use `request.options` instead of the local options
            const request = new core$3.default(options.url, options);
            request._noPipe = true;
            onCancel(() => request.destroy());
            const reject = async (error) => {
                try {
                    for (const hook of options.hooks.beforeError) {
                        // eslint-disable-next-line no-await-in-loop
                        error = await hook(error);
                    }
                }
                catch (error_) {
                    _reject(new types.RequestError(error_.message, error_, request));
                    return;
                }
                _reject(error);
            };
            globalRequest = request;
            const onResponse = async (response) => {
                response.retryCount = retryCount;
                if (response.request.aborted) {
                    // Canceled while downloading - will throw a `CancelError` or `TimeoutError` error
                    return;
                }
                const isOk = () => {
                    const { statusCode } = response;
                    const limitStatusCode = options.followRedirect ? 299 : 399;
                    return (statusCode >= 200 && statusCode <= limitStatusCode) || statusCode === 304;
                };
                // Download body
                let rawBody;
                try {
                    rawBody = await getStream_1.buffer(request);
                    response.rawBody = rawBody;
                }
                catch (_) {
                    // The same error is caught below.
                    // See request.once('error')
                    return;
                }
                // Parse body
                try {
                    response.body = core$3.parseBody(response, options.responseType, options.encoding);
                }
                catch (error) {
                    // Fallback to `utf8`
                    response.body = rawBody.toString();
                    if (isOk()) {
                        // TODO: Call `request._beforeError`, see https://github.com/nodejs/node/issues/32995
                        reject(error);
                        return;
                    }
                }
                try {
                    for (const [index, hook] of options.hooks.afterResponse.entries()) {
                        // @ts-ignore TS doesn't notice that CancelableRequest is a Promise
                        // eslint-disable-next-line no-await-in-loop
                        response = await hook(response, async (updatedOptions) => {
                            const typedOptions = core$3.default.normalizeArguments(undefined, {
                                ...updatedOptions,
                                retry: {
                                    calculateDelay: () => 0
                                },
                                throwHttpErrors: false,
                                resolveBodyOnly: false
                            }, options);
                            // Remove any further hooks for that request, because we'll call them anyway.
                            // The loop continues. We don't want duplicates (asPromise recursion).
                            typedOptions.hooks.afterResponse = typedOptions.hooks.afterResponse.slice(0, index);
                            for (const hook of typedOptions.hooks.beforeRetry) {
                                // eslint-disable-next-line no-await-in-loop
                                await hook(typedOptions);
                            }
                            const promise = asPromise(typedOptions);
                            onCancel(() => {
                                promise.catch(() => { });
                                promise.cancel();
                            });
                            return promise;
                        });
                    }
                }
                catch (error) {
                    // TODO: Call `request._beforeError`, see https://github.com/nodejs/node/issues/32995
                    reject(new types.RequestError(error.message, error, request));
                    return;
                }
                if (throwHttpErrors && !isOk()) {
                    reject(new types.HTTPError(response));
                    return;
                }
                globalResponse = response;
                resolve(options.resolveBodyOnly ? response.body : response);
            };
            request.once('response', onResponse);
            request.once('error', async (error) => {
                if (promise.isCanceled) {
                    return;
                }
                if (!request.options) {
                    reject(error);
                    return;
                }
                request.off('response', onResponse);
                let backoff;
                retryCount++;
                try {
                    backoff = await options.retry.calculateDelay({
                        attemptCount: retryCount,
                        retryOptions: options.retry,
                        error,
                        computedValue: calculateRetryDelay_1.default({
                            attemptCount: retryCount,
                            retryOptions: options.retry,
                            error,
                            computedValue: 0
                        })
                    });
                }
                catch (error_) {
                    // Don't emit the `response` event
                    request.destroy();
                    reject(new types.RequestError(error_.message, error, request));
                    return;
                }
                if (backoff) {
                    // Don't emit the `response` event
                    request.destroy();
                    const retry = async () => {
                        options.throwHttpErrors = throwHttpErrors;
                        try {
                            for (const hook of options.hooks.beforeRetry) {
                                // eslint-disable-next-line no-await-in-loop
                                await hook(options, error, retryCount);
                            }
                        }
                        catch (error_) {
                            // Don't emit the `response` event
                            request.destroy();
                            reject(new types.RequestError(error_.message, error, request));
                            return;
                        }
                        makeRequest();
                    };
                    setTimeout(retry, backoff);
                    return;
                }
                // The retry has not been made
                retryCount--;
                if (error instanceof types.HTTPError) {
                    // The error will be handled by the `response` event
                    onResponse(request._response);
                    return;
                }
                // Don't emit the `response` event
                request.destroy();
                reject(error);
            });
            proxyEvents$1.default(request, emitter, proxiedRequestEvents);
        };
        makeRequest();
    });
    promise.on = (event, fn) => {
        emitter.on(event, fn);
        return promise;
    };
    const shortcut = (responseType) => {
        const newPromise = (async () => {
            // Wait until downloading has ended
            await promise;
            return core$3.parseBody(globalResponse, responseType, options.encoding);
        })();
        Object.defineProperties(newPromise, Object.getOwnPropertyDescriptors(promise));
        return newPromise;
    };
    promise.json = () => {
        if (!globalRequest.writableFinished && options.headers.accept === undefined) {
            options.headers.accept = 'application/json';
        }
        return shortcut('json');
    };
    promise.buffer = () => shortcut('buffer');
    promise.text = () => shortcut('text');
    return promise;
}
exports.default = asPromise;
__export(types);
});

unwrapExports(asPromise_1);

var createRejection_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function createRejection(error, ...beforeErrorGroups) {
    const promise = (async () => {
        if (error instanceof types.RequestError) {
            try {
                for (const hooks of beforeErrorGroups) {
                    if (hooks) {
                        for (const hook of hooks) {
                            // eslint-disable-next-line no-await-in-loop
                            error = await hook(error);
                        }
                    }
                }
            }
            catch (error_) {
                error = error_;
            }
        }
        throw error;
    })();
    const returnPromise = () => promise;
    promise.json = returnPromise;
    promise.text = returnPromise;
    promise.buffer = returnPromise;
    promise.on = returnPromise;
    return promise;
}
exports.default = createRejection;
});

unwrapExports(createRejection_1);

var deepFreeze_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function deepFreeze(object) {
    for (const value of Object.values(object)) {
        if (dist.default.plainObject(value) || dist.default.array(value)) {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
}
exports.default = deepFreeze;
});

unwrapExports(deepFreeze_1);

var create_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });






const errors = {
    RequestError: asPromise_1.RequestError,
    CacheError: asPromise_1.CacheError,
    ReadError: asPromise_1.ReadError,
    HTTPError: asPromise_1.HTTPError,
    MaxRedirectsError: asPromise_1.MaxRedirectsError,
    TimeoutError: asPromise_1.TimeoutError,
    ParseError: asPromise_1.ParseError,
    CancelError: pCancelable.CancelError,
    UnsupportedProtocolError: asPromise_1.UnsupportedProtocolError,
    UploadError: asPromise_1.UploadError
};
const { normalizeArguments, mergeOptions } = asPromise_1.PromisableRequest;
const getPromiseOrStream = (options) => options.isStream ? new core$2.default(options.url, options) : asPromise_1.default(options);
const isGotInstance = (value) => ('defaults' in value && 'options' in value.defaults);
const aliases = [
    'get',
    'post',
    'put',
    'patch',
    'head',
    'delete'
];
exports.defaultHandler = (options, next) => next(options);
const callInitHooks = (hooks, options) => {
    if (hooks) {
        for (const hook of hooks) {
            hook(options);
        }
    }
};
const create = (defaults) => {
    // Proxy properties from next handlers
    defaults._rawHandlers = defaults.handlers;
    defaults.handlers = defaults.handlers.map(fn => ((options, next) => {
        // This will be assigned by assigning result
        let root;
        const result = fn(options, newOptions => {
            root = next(newOptions);
            return root;
        });
        if (result !== root && !options.isStream && root) {
            const typedResult = result;
            const { then: promiseThen, catch: promiseCatch, finally: promiseFianlly } = typedResult;
            Object.setPrototypeOf(typedResult, Object.getPrototypeOf(root));
            Object.defineProperties(typedResult, Object.getOwnPropertyDescriptors(root));
            // These should point to the new promise
            // eslint-disable-next-line promise/prefer-await-to-then
            typedResult.then = promiseThen;
            typedResult.catch = promiseCatch;
            typedResult.finally = promiseFianlly;
        }
        return result;
    }));
    // Got interface
    const got = ((url, options) => {
        var _a, _b;
        let iteration = 0;
        const iterateHandlers = (newOptions) => {
            return defaults.handlers[iteration++](newOptions, iteration === defaults.handlers.length ? getPromiseOrStream : iterateHandlers);
        };
        if (dist.default.plainObject(url)) {
            options = {
                ...url,
                ...options
            };
            url = undefined;
        }
        try {
            // Call `init` hooks
            let initHookError;
            try {
                callInitHooks(defaults.options.hooks.init, options);
                callInitHooks((_a = options === null || options === void 0 ? void 0 : options.hooks) === null || _a === void 0 ? void 0 : _a.init, options);
            }
            catch (error) {
                initHookError = error;
            }
            // Normalize options & call handlers
            const normalizedOptions = normalizeArguments(url, options, defaults.options);
            normalizedOptions[core$2.kIsNormalizedAlready] = true;
            if (initHookError) {
                throw new asPromise_1.RequestError(initHookError.message, initHookError, normalizedOptions);
            }
            return iterateHandlers(normalizedOptions);
        }
        catch (error) {
            if (options === null || options === void 0 ? void 0 : options.isStream) {
                throw error;
            }
            else {
                return createRejection_1.default(error, defaults.options.hooks.beforeError, (_b = options === null || options === void 0 ? void 0 : options.hooks) === null || _b === void 0 ? void 0 : _b.beforeError);
            }
        }
    });
    got.extend = (...instancesOrOptions) => {
        const optionsArray = [defaults.options];
        let handlers = [...defaults._rawHandlers];
        let isMutableDefaults;
        for (const value of instancesOrOptions) {
            if (isGotInstance(value)) {
                optionsArray.push(value.defaults.options);
                handlers.push(...value.defaults._rawHandlers);
                isMutableDefaults = value.defaults.mutableDefaults;
            }
            else {
                optionsArray.push(value);
                if ('handlers' in value) {
                    handlers.push(...value.handlers);
                }
                isMutableDefaults = value.mutableDefaults;
            }
        }
        handlers = handlers.filter(handler => handler !== exports.defaultHandler);
        if (handlers.length === 0) {
            handlers.push(exports.defaultHandler);
        }
        return create({
            options: mergeOptions(...optionsArray),
            handlers,
            mutableDefaults: Boolean(isMutableDefaults)
        });
    };
    // Pagination
    const paginateEach = (async function* (url, options) {
        let normalizedOptions = normalizeArguments(url, options, defaults.options);
        normalizedOptions.resolveBodyOnly = false;
        const pagination = normalizedOptions.pagination;
        if (!dist.default.object(pagination)) {
            throw new TypeError('`options.pagination` must be implemented');
        }
        const all = [];
        let { countLimit } = pagination;
        let numberOfRequests = 0;
        while (numberOfRequests < pagination.requestLimit) {
            // TODO: Throw when result is not an instance of Response
            // eslint-disable-next-line no-await-in-loop
            const result = (await got('', normalizedOptions));
            // eslint-disable-next-line no-await-in-loop
            const parsed = await pagination.transform(result);
            const current = [];
            for (const item of parsed) {
                if (pagination.filter(item, all, current)) {
                    if (!pagination.shouldContinue(item, all, current)) {
                        return;
                    }
                    yield item;
                    if (pagination.stackAllItems) {
                        all.push(item);
                    }
                    current.push(item);
                    if (--countLimit <= 0) {
                        return;
                    }
                }
            }
            const optionsToMerge = pagination.paginate(result, all, current);
            if (optionsToMerge === false) {
                return;
            }
            if (optionsToMerge === result.request.options) {
                normalizedOptions = result.request.options;
            }
            else if (optionsToMerge !== undefined) {
                normalizedOptions = normalizeArguments(undefined, optionsToMerge, normalizedOptions);
            }
            numberOfRequests++;
        }
    });
    got.paginate = ((url, options) => {
        return paginateEach(url, options);
    });
    got.paginate.all = (async (url, options) => {
        const results = [];
        for await (const item of got.paginate(url, options)) {
            results.push(item);
        }
        return results;
    });
    // For those who like very descriptive names
    got.paginate.each = paginateEach;
    // Stream API
    got.stream = ((url, options) => got(url, { ...options, isStream: true }));
    // Shortcuts
    for (const method of aliases) {
        got[method] = ((url, options) => got(url, { ...options, method }));
        got.stream[method] = ((url, options) => {
            return got(url, { ...options, method, isStream: true });
        });
    }
    Object.assign(got, { ...errors, mergeOptions });
    Object.defineProperty(got, 'defaults', {
        value: defaults.mutableDefaults ? defaults : deepFreeze_1.default(defaults),
        writable: defaults.mutableDefaults,
        configurable: defaults.mutableDefaults,
        enumerable: true
    });
    return got;
};
exports.default = create;
});

unwrapExports(create_1);

var source$4 = createCommonjsModule(function (module, exports) {
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });


const defaults = {
    options: {
        method: 'GET',
        retry: {
            limit: 2,
            methods: [
                'GET',
                'PUT',
                'HEAD',
                'DELETE',
                'OPTIONS',
                'TRACE'
            ],
            statusCodes: [
                408,
                413,
                429,
                500,
                502,
                503,
                504,
                521,
                522,
                524
            ],
            errorCodes: [
                'ETIMEDOUT',
                'ECONNRESET',
                'EADDRINUSE',
                'ECONNREFUSED',
                'EPIPE',
                'ENOTFOUND',
                'ENETUNREACH',
                'EAI_AGAIN'
            ],
            maxRetryAfter: undefined,
            calculateDelay: ({ computedValue }) => computedValue
        },
        timeout: {},
        headers: {
            'user-agent': 'got (https://github.com/sindresorhus/got)'
        },
        hooks: {
            init: [],
            beforeRequest: [],
            beforeRedirect: [],
            beforeRetry: [],
            beforeError: [],
            afterResponse: []
        },
        cache: undefined,
        dnsCache: undefined,
        decompress: true,
        throwHttpErrors: true,
        followRedirect: true,
        isStream: false,
        responseType: 'text',
        resolveBodyOnly: false,
        maxRedirects: 10,
        prefixUrl: '',
        methodRewriting: true,
        ignoreInvalidCookies: false,
        context: {},
        // TODO: Set this to `true` when Got 12 gets released
        http2: false,
        allowGetBody: false,
        https: undefined,
        pagination: {
            transform: (response) => {
                if (response.request.options.responseType === 'json') {
                    return response.body;
                }
                return JSON.parse(response.body);
            },
            paginate: response => {
                if (!Reflect.has(response.headers, 'link')) {
                    return false;
                }
                const items = response.headers.link.split(',');
                let next;
                for (const item of items) {
                    const parsed = item.split(';');
                    if (parsed[1].includes('next')) {
                        next = parsed[0].trimStart().trim();
                        next = next.slice(1, -1);
                        break;
                    }
                }
                if (next) {
                    const options = {
                        url: new Url.URL(next)
                    };
                    return options;
                }
                return false;
            },
            filter: () => true,
            shouldContinue: () => true,
            countLimit: Infinity,
            requestLimit: 10000,
            stackAllItems: true
        }
    },
    handlers: [create_1.defaultHandler],
    mutableDefaults: false
};
const got = create_1.default(defaults);
exports.default = got;
// For CommonJS default export support
module.exports = got;
module.exports.default = got;
__export(create_1);
__export(asPromise_1);
});

var got = unwrapExports(source$4);

/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

function getUserAgent() {
    try {
        return navigator.userAgent;
    }
    catch (e) {
        return "<environment undetectable>";
    }
}

function lowercaseKeys$1(object) {
    if (!object) {
        return {};
    }
    return Object.keys(object).reduce((newObj, key) => {
        newObj[key.toLowerCase()] = object[key];
        return newObj;
    }, {});
}

function mergeDeep(defaults, options) {
    const result = Object.assign({}, defaults);
    Object.keys(options).forEach((key) => {
        if (isPlainObject(options[key])) {
            if (!(key in defaults))
                Object.assign(result, { [key]: options[key] });
            else
                result[key] = mergeDeep(defaults[key], options[key]);
        }
        else {
            Object.assign(result, { [key]: options[key] });
        }
    });
    return result;
}

function merge(defaults, route, options) {
    if (typeof route === "string") {
        let [method, url] = route.split(" ");
        options = Object.assign(url ? { method, url } : { url: method }, options);
    }
    else {
        options = Object.assign({}, route);
    }
    // lowercase header names before merging with defaults to avoid duplicates
    options.headers = lowercaseKeys$1(options.headers);
    const mergedOptions = mergeDeep(defaults || {}, options);
    // mediaType.previews arrays are merged, instead of overwritten
    if (defaults && defaults.mediaType.previews.length) {
        mergedOptions.mediaType.previews = defaults.mediaType.previews
            .filter((preview) => !mergedOptions.mediaType.previews.includes(preview))
            .concat(mergedOptions.mediaType.previews);
    }
    mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map((preview) => preview.replace(/-preview/, ""));
    return mergedOptions;
}

function addQueryParameters(url, parameters) {
    const separator = /\?/.test(url) ? "&" : "?";
    const names = Object.keys(parameters);
    if (names.length === 0) {
        return url;
    }
    return (url +
        separator +
        names
            .map((name) => {
            if (name === "q") {
                return ("q=" + parameters.q.split("+").map(encodeURIComponent).join("+"));
            }
            return `${name}=${encodeURIComponent(parameters[name])}`;
        })
            .join("&"));
}

const urlVariableRegex = /\{[^}]+\}/g;
function removeNonChars(variableName) {
    return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}
function extractUrlVariableNames(url) {
    const matches = url.match(urlVariableRegex);
    if (!matches) {
        return [];
    }
    return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

function omit(object, keysToOmit) {
    return Object.keys(object)
        .filter((option) => !keysToOmit.includes(option))
        .reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
    }, {});
}

// Based on https://github.com/bramstein/url-template, licensed under BSD
// TODO: create separate package.
//
// Copyright (c) 2012-2014, Bram Stein
// All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
/* istanbul ignore file */
function encodeReserved(str) {
    return str
        .split(/(%[0-9A-Fa-f]{2})/g)
        .map(function (part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
        }
        return part;
    })
        .join("");
}
function encodeUnreserved(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
    });
}
function encodeValue(operator, value, key) {
    value =
        operator === "+" || operator === "#"
            ? encodeReserved(value)
            : encodeUnreserved(value);
    if (key) {
        return encodeUnreserved(key) + "=" + value;
    }
    else {
        return value;
    }
}
function isDefined(value) {
    return value !== undefined && value !== null;
}
function isKeyOperator(operator) {
    return operator === ";" || operator === "&" || operator === "?";
}
function getValues(context, operator, key, modifier) {
    var value = context[key], result = [];
    if (isDefined(value) && value !== "") {
        if (typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean") {
            value = value.toString();
            if (modifier && modifier !== "*") {
                value = value.substring(0, parseInt(modifier, 10));
            }
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
        }
        else {
            if (modifier === "*") {
                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
                    });
                }
                else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            result.push(encodeValue(operator, value[k], k));
                        }
                    });
                }
            }
            else {
                const tmp = [];
                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        tmp.push(encodeValue(operator, value));
                    });
                }
                else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            tmp.push(encodeUnreserved(k));
                            tmp.push(encodeValue(operator, value[k].toString()));
                        }
                    });
                }
                if (isKeyOperator(operator)) {
                    result.push(encodeUnreserved(key) + "=" + tmp.join(","));
                }
                else if (tmp.length !== 0) {
                    result.push(tmp.join(","));
                }
            }
        }
    }
    else {
        if (operator === ";") {
            if (isDefined(value)) {
                result.push(encodeUnreserved(key));
            }
        }
        else if (value === "" && (operator === "&" || operator === "?")) {
            result.push(encodeUnreserved(key) + "=");
        }
        else if (value === "") {
            result.push("");
        }
    }
    return result;
}
function parseUrl(template) {
    return {
        expand: expand.bind(null, template),
    };
}
function expand(template, context) {
    var operators = ["+", "#", ".", "/", ";", "?", "&"];
    return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
        if (expression) {
            let operator = "";
            const values = [];
            if (operators.indexOf(expression.charAt(0)) !== -1) {
                operator = expression.charAt(0);
                expression = expression.substr(1);
            }
            expression.split(/,/g).forEach(function (variable) {
                var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
            });
            if (operator && operator !== "+") {
                var separator = ",";
                if (operator === "?") {
                    separator = "&";
                }
                else if (operator !== "#") {
                    separator = operator;
                }
                return (values.length !== 0 ? operator : "") + values.join(separator);
            }
            else {
                return values.join(",");
            }
        }
        else {
            return encodeReserved(literal);
        }
    });
}

function parse$1(options) {
    // https://fetch.spec.whatwg.org/#methods
    let method = options.method.toUpperCase();
    // replace :varname with {varname} to make it RFC 6570 compatible
    let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{+$1}");
    let headers = Object.assign({}, options.headers);
    let body;
    let parameters = omit(options, [
        "method",
        "baseUrl",
        "url",
        "headers",
        "request",
        "mediaType",
    ]);
    // extract variable names from URL to calculate remaining variables later
    const urlVariableNames = extractUrlVariableNames(url);
    url = parseUrl(url).expand(parameters);
    if (!/^http/.test(url)) {
        url = options.baseUrl + url;
    }
    const omittedParameters = Object.keys(options)
        .filter((option) => urlVariableNames.includes(option))
        .concat("baseUrl");
    const remainingParameters = omit(parameters, omittedParameters);
    const isBinaryRequset = /application\/octet-stream/i.test(headers.accept);
    if (!isBinaryRequset) {
        if (options.mediaType.format) {
            // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
            headers.accept = headers.accept
                .split(/,/)
                .map((preview) => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`))
                .join(",");
        }
        if (options.mediaType.previews.length) {
            const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
            headers.accept = previewsFromAcceptHeader
                .concat(options.mediaType.previews)
                .map((preview) => {
                const format = options.mediaType.format
                    ? `.${options.mediaType.format}`
                    : "+json";
                return `application/vnd.github.${preview}-preview${format}`;
            })
                .join(",");
        }
    }
    // for GET/HEAD requests, set URL query parameters from remaining parameters
    // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters
    if (["GET", "HEAD"].includes(method)) {
        url = addQueryParameters(url, remainingParameters);
    }
    else {
        if ("data" in remainingParameters) {
            body = remainingParameters.data;
        }
        else {
            if (Object.keys(remainingParameters).length) {
                body = remainingParameters;
            }
            else {
                headers["content-length"] = 0;
            }
        }
    }
    // default content-type for JSON if body is set
    if (!headers["content-type"] && typeof body !== "undefined") {
        headers["content-type"] = "application/json; charset=utf-8";
    }
    // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
    // fetch does not allow to set `content-length` header, but we can set body to an empty string
    if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
        body = "";
    }
    // Only return body/request keys if present
    return Object.assign({ method, url, headers }, typeof body !== "undefined" ? { body } : null, options.request ? { request: options.request } : null);
}

function endpointWithDefaults(defaults, route, options) {
    return parse$1(merge(defaults, route, options));
}

function withDefaults(oldDefaults, newDefaults) {
    const DEFAULTS = merge(oldDefaults, newDefaults);
    const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
    return Object.assign(endpoint, {
        DEFAULTS,
        defaults: withDefaults.bind(null, DEFAULTS),
        merge: merge.bind(null, DEFAULTS),
        parse: parse$1,
    });
}

const VERSION = "6.0.2";

const userAgent = `octokit-endpoint.js/${VERSION} ${getUserAgent()}`;
// DEFAULTS has all properties set that EndpointOptions has, except url.
// So we use RequestParameters and add method as additional required property.
const DEFAULTS = {
    method: "GET",
    baseUrl: "https://api.github.com",
    headers: {
        accept: "application/vnd.github.v3+json",
        "user-agent": userAgent,
    },
    mediaType: {
        format: "",
        previews: [],
    },
};

const endpoint = withDefaults(null, DEFAULTS);

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable$2 = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable$2();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough$2 = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough$2();
		p2 = new PassThrough$2();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response$1 {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response$1(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response$1.prototype);

Object.defineProperties(Response$1.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response$1.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest$2(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest$2(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest$2(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest$2(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest$2(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response$1(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response$1(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response$1(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response$1(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response$1(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

var distWeb = {
	__proto__: null,
	Deprecation: Deprecation
};

const logOnce = once_1((deprecation) => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */
class RequestError extends Error {
    constructor(message, statusCode, options) {
        super(message);
        // Maintains proper stack trace (only available on V8)
        /* istanbul ignore next */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = "HttpError";
        this.status = statusCode;
        Object.defineProperty(this, "code", {
            get() {
                logOnce(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
                return statusCode;
            },
        });
        this.headers = options.headers || {};
        // redact request credentials without mutating original request options
        const requestCopy = Object.assign({}, options.request);
        if (options.request.headers.authorization) {
            requestCopy.headers = Object.assign({}, options.request.headers, {
                authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]"),
            });
        }
        requestCopy.url = requestCopy.url
            // client_id & client_secret can be passed as URL query parameters to increase rate limit
            // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
            .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
            // OAuth tokens can be passed as URL query parameters, although it is not recommended
            // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
            .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
        this.request = requestCopy;
    }
}

const VERSION$1 = "5.4.4";

function getBufferResponse(response) {
    return response.arrayBuffer();
}

function fetchWrapper(requestOptions) {
    if (isPlainObject(requestOptions.body) ||
        Array.isArray(requestOptions.body)) {
        requestOptions.body = JSON.stringify(requestOptions.body);
    }
    let headers = {};
    let status;
    let url;
    const fetch$1 = (requestOptions.request && requestOptions.request.fetch) || fetch;
    return fetch$1(requestOptions.url, Object.assign({
        method: requestOptions.method,
        body: requestOptions.body,
        headers: requestOptions.headers,
        redirect: requestOptions.redirect,
    }, requestOptions.request))
        .then((response) => {
        url = response.url;
        status = response.status;
        for (const keyAndValue of response.headers) {
            headers[keyAndValue[0]] = keyAndValue[1];
        }
        if (status === 204 || status === 205) {
            return;
        }
        // GitHub API returns 200 for HEAD requests
        if (requestOptions.method === "HEAD") {
            if (status < 400) {
                return;
            }
            throw new RequestError(response.statusText, status, {
                headers,
                request: requestOptions,
            });
        }
        if (status === 304) {
            throw new RequestError("Not modified", status, {
                headers,
                request: requestOptions,
            });
        }
        if (status >= 400) {
            return response
                .text()
                .then((message) => {
                const error = new RequestError(message, status, {
                    headers,
                    request: requestOptions,
                });
                try {
                    let responseBody = JSON.parse(error.message);
                    Object.assign(error, responseBody);
                    let errors = responseBody.errors;
                    // Assumption `errors` would always be in Array format
                    error.message =
                        error.message + ": " + errors.map(JSON.stringify).join(", ");
                }
                catch (e) {
                    // ignore, see octokit/rest.js#684
                }
                throw error;
            });
        }
        const contentType = response.headers.get("content-type");
        if (/application\/json/.test(contentType)) {
            return response.json();
        }
        if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
            return response.text();
        }
        return getBufferResponse(response);
    })
        .then((data) => {
        return {
            status,
            url,
            headers,
            data,
        };
    })
        .catch((error) => {
        if (error instanceof RequestError) {
            throw error;
        }
        throw new RequestError(error.message, 500, {
            headers,
            request: requestOptions,
        });
    });
}

function withDefaults$1(oldEndpoint, newDefaults) {
    const endpoint = oldEndpoint.defaults(newDefaults);
    const newApi = function (route, parameters) {
        const endpointOptions = endpoint.merge(route, parameters);
        if (!endpointOptions.request || !endpointOptions.request.hook) {
            return fetchWrapper(endpoint.parse(endpointOptions));
        }
        const request = (route, parameters) => {
            return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
        };
        Object.assign(request, {
            endpoint,
            defaults: withDefaults$1.bind(null, endpoint),
        });
        return endpointOptions.request.hook(request, endpointOptions);
    };
    return Object.assign(newApi, {
        endpoint,
        defaults: withDefaults$1.bind(null, endpoint),
    });
}

const request$1 = withDefaults$1(endpoint, {
    headers: {
        "user-agent": `octokit-request.js/${VERSION$1} ${getUserAgent()}`,
    },
});

var distWeb$1 = {
	__proto__: null,
	request: request$1
};

const VERSION$2 = "4.5.0";

class GraphqlError extends Error {
    constructor(request, response) {
        const message = response.data.errors[0].message;
        super(message);
        Object.assign(this, response.data);
        this.name = "GraphqlError";
        this.request = request;
        // Maintains proper stack trace (only available on V8)
        /* istanbul ignore next */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const NON_VARIABLE_OPTIONS = [
    "method",
    "baseUrl",
    "url",
    "headers",
    "request",
    "query",
    "mediaType",
];
function graphql(request, query, options) {
    options =
        typeof query === "string"
            ? (options = Object.assign({ query }, options))
            : (options = query);
    const requestOptions = Object.keys(options).reduce((result, key) => {
        if (NON_VARIABLE_OPTIONS.includes(key)) {
            result[key] = options[key];
            return result;
        }
        if (!result.variables) {
            result.variables = {};
        }
        result.variables[key] = options[key];
        return result;
    }, {});
    return request(requestOptions).then((response) => {
        if (response.data.errors) {
            throw new GraphqlError(requestOptions, {
                data: response.data,
            });
        }
        return response.data.data;
    });
}

function withDefaults$2(request$1$1, newDefaults) {
    const newRequest = request$1$1.defaults(newDefaults);
    const newApi = (query, options) => {
        return graphql(newRequest, query, options);
    };
    return Object.assign(newApi, {
        defaults: withDefaults$2.bind(null, newRequest),
        endpoint: request$1.endpoint,
    });
}

const graphql$1 = withDefaults$2(request$1, {
    headers: {
        "user-agent": `octokit-graphql.js/${VERSION$2} ${getUserAgent()}`,
    },
    method: "POST",
    url: "/graphql",
});
function withCustomRequest(customRequest) {
    return withDefaults$2(customRequest, {
        method: "POST",
        url: "/graphql",
    });
}

var distWeb$2 = {
	__proto__: null,
	graphql: graphql$1,
	withCustomRequest: withCustomRequest
};

const VERSION$3 = "1.0.0";

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */
function requestLog(octokit) {
    octokit.hook.wrap("request", (request, options) => {
        octokit.log.debug("request", options);
        const start = Date.now();
        const requestOptions = octokit.request.endpoint.parse(options);
        const path = requestOptions.url.replace(options.baseUrl, "");
        return request(options)
            .then(response => {
            octokit.log.info(`${requestOptions.method} ${path} - ${response.status} in ${Date.now() - start}ms`);
            return response;
        })
            .catch(error => {
            octokit.log.info(`${requestOptions.method} ${path} - ${error.status} in ${Date.now() -
                start}ms`);
            throw error;
        });
    });
}
requestLog.VERSION = VERSION$3;

var distWeb$3 = {
	__proto__: null,
	requestLog: requestLog
};

var endpointsByScope = {
    actions: {
        cancelWorkflowRun: {
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                run_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runs/:run_id/cancel"
        },
        createOrUpdateSecretForRepo: {
            method: "PUT",
            params: {
                encrypted_value: { type: "string" },
                key_id: { type: "string" },
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/secrets/:name"
        },
        createRegistrationToken: {
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/runners/registration-token"
        },
        createRemoveToken: {
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/runners/remove-token"
        },
        deleteArtifact: {
            method: "DELETE",
            params: {
                artifact_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/artifacts/:artifact_id"
        },
        deleteSecretFromRepo: {
            method: "DELETE",
            params: {
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/secrets/:name"
        },
        downloadArtifact: {
            method: "GET",
            params: {
                archive_format: { required: true, type: "string" },
                artifact_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/artifacts/:artifact_id/:archive_format"
        },
        getArtifact: {
            method: "GET",
            params: {
                artifact_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/artifacts/:artifact_id"
        },
        getPublicKey: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/secrets/public-key"
        },
        getSecret: {
            method: "GET",
            params: {
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/secrets/:name"
        },
        getSelfHostedRunner: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                runner_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runners/:runner_id"
        },
        getWorkflow: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                workflow_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/workflows/:workflow_id"
        },
        getWorkflowJob: {
            method: "GET",
            params: {
                job_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/jobs/:job_id"
        },
        getWorkflowRun: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                run_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runs/:run_id"
        },
        listDownloadsForSelfHostedRunnerApplication: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/runners/downloads"
        },
        listJobsForWorkflowRun: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                run_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runs/:run_id/jobs"
        },
        listRepoWorkflowRuns: {
            method: "GET",
            params: {
                actor: { type: "string" },
                branch: { type: "string" },
                event: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                status: { enum: ["completed", "status", "conclusion"], type: "string" }
            },
            url: "/repos/:owner/:repo/actions/runs"
        },
        listRepoWorkflows: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/workflows"
        },
        listSecretsForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/secrets"
        },
        listSelfHostedRunnersForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/runners"
        },
        listWorkflowJobLogs: {
            method: "GET",
            params: {
                job_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/actions/jobs/:job_id/logs"
        },
        listWorkflowRunArtifacts: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                run_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runs/:run_id/artifacts"
        },
        listWorkflowRunLogs: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                run_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runs/:run_id/logs"
        },
        listWorkflowRuns: {
            method: "GET",
            params: {
                actor: { type: "string" },
                branch: { type: "string" },
                event: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                status: { enum: ["completed", "status", "conclusion"], type: "string" },
                workflow_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/workflows/:workflow_id/runs"
        },
        reRunWorkflow: {
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                run_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runs/:run_id/rerun"
        },
        removeSelfHostedRunner: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                runner_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/actions/runners/:runner_id"
        }
    },
    activity: {
        checkStarringRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/user/starred/:owner/:repo"
        },
        deleteRepoSubscription: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/subscription"
        },
        deleteThreadSubscription: {
            method: "DELETE",
            params: { thread_id: { required: true, type: "integer" } },
            url: "/notifications/threads/:thread_id/subscription"
        },
        getRepoSubscription: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/subscription"
        },
        getThread: {
            method: "GET",
            params: { thread_id: { required: true, type: "integer" } },
            url: "/notifications/threads/:thread_id"
        },
        getThreadSubscription: {
            method: "GET",
            params: { thread_id: { required: true, type: "integer" } },
            url: "/notifications/threads/:thread_id/subscription"
        },
        listEventsForOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/events/orgs/:org"
        },
        listEventsForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/events"
        },
        listFeeds: { method: "GET", params: {}, url: "/feeds" },
        listNotifications: {
            method: "GET",
            params: {
                all: { type: "boolean" },
                before: { type: "string" },
                page: { type: "integer" },
                participating: { type: "boolean" },
                per_page: { type: "integer" },
                since: { type: "string" }
            },
            url: "/notifications"
        },
        listNotificationsForRepo: {
            method: "GET",
            params: {
                all: { type: "boolean" },
                before: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                participating: { type: "boolean" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                since: { type: "string" }
            },
            url: "/repos/:owner/:repo/notifications"
        },
        listPublicEvents: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/events"
        },
        listPublicEventsForOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/events"
        },
        listPublicEventsForRepoNetwork: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/networks/:owner/:repo/events"
        },
        listPublicEventsForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/events/public"
        },
        listReceivedEventsForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/received_events"
        },
        listReceivedPublicEventsForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/received_events/public"
        },
        listRepoEvents: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/events"
        },
        listReposStarredByAuthenticatedUser: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/user/starred"
        },
        listReposStarredByUser: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                sort: { enum: ["created", "updated"], type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/starred"
        },
        listReposWatchedByUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/subscriptions"
        },
        listStargazersForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/stargazers"
        },
        listWatchedReposForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/subscriptions"
        },
        listWatchersForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/subscribers"
        },
        markAsRead: {
            method: "PUT",
            params: { last_read_at: { type: "string" } },
            url: "/notifications"
        },
        markNotificationsAsReadForRepo: {
            method: "PUT",
            params: {
                last_read_at: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/notifications"
        },
        markThreadAsRead: {
            method: "PATCH",
            params: { thread_id: { required: true, type: "integer" } },
            url: "/notifications/threads/:thread_id"
        },
        setRepoSubscription: {
            method: "PUT",
            params: {
                ignored: { type: "boolean" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                subscribed: { type: "boolean" }
            },
            url: "/repos/:owner/:repo/subscription"
        },
        setThreadSubscription: {
            method: "PUT",
            params: {
                ignored: { type: "boolean" },
                thread_id: { required: true, type: "integer" }
            },
            url: "/notifications/threads/:thread_id/subscription"
        },
        starRepo: {
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/user/starred/:owner/:repo"
        },
        unstarRepo: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/user/starred/:owner/:repo"
        }
    },
    apps: {
        addRepoToInstallation: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "PUT",
            params: {
                installation_id: { required: true, type: "integer" },
                repository_id: { required: true, type: "integer" }
            },
            url: "/user/installations/:installation_id/repositories/:repository_id"
        },
        checkAccountIsAssociatedWithAny: {
            method: "GET",
            params: { account_id: { required: true, type: "integer" } },
            url: "/marketplace_listing/accounts/:account_id"
        },
        checkAccountIsAssociatedWithAnyStubbed: {
            method: "GET",
            params: { account_id: { required: true, type: "integer" } },
            url: "/marketplace_listing/stubbed/accounts/:account_id"
        },
        checkAuthorization: {
            deprecated: "octokit.apps.checkAuthorization() is deprecated, see https://developer.github.com/v3/apps/oauth_applications/#check-an-authorization",
            method: "GET",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/tokens/:access_token"
        },
        checkToken: {
            headers: { accept: "application/vnd.github.doctor-strange-preview+json" },
            method: "POST",
            params: {
                access_token: { type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/token"
        },
        createContentAttachment: {
            headers: { accept: "application/vnd.github.corsair-preview+json" },
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                content_reference_id: { required: true, type: "integer" },
                title: { required: true, type: "string" }
            },
            url: "/content_references/:content_reference_id/attachments"
        },
        createFromManifest: {
            headers: { accept: "application/vnd.github.fury-preview+json" },
            method: "POST",
            params: { code: { required: true, type: "string" } },
            url: "/app-manifests/:code/conversions"
        },
        createInstallationToken: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "POST",
            params: {
                installation_id: { required: true, type: "integer" },
                permissions: { type: "object" },
                repository_ids: { type: "integer[]" }
            },
            url: "/app/installations/:installation_id/access_tokens"
        },
        deleteAuthorization: {
            headers: { accept: "application/vnd.github.doctor-strange-preview+json" },
            method: "DELETE",
            params: {
                access_token: { type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/grant"
        },
        deleteInstallation: {
            headers: {
                accept: "application/vnd.github.gambit-preview+json,application/vnd.github.machine-man-preview+json"
            },
            method: "DELETE",
            params: { installation_id: { required: true, type: "integer" } },
            url: "/app/installations/:installation_id"
        },
        deleteToken: {
            headers: { accept: "application/vnd.github.doctor-strange-preview+json" },
            method: "DELETE",
            params: {
                access_token: { type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/token"
        },
        findOrgInstallation: {
            deprecated: "octokit.apps.findOrgInstallation() has been renamed to octokit.apps.getOrgInstallation() (2019-04-10)",
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { org: { required: true, type: "string" } },
            url: "/orgs/:org/installation"
        },
        findRepoInstallation: {
            deprecated: "octokit.apps.findRepoInstallation() has been renamed to octokit.apps.getRepoInstallation() (2019-04-10)",
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/installation"
        },
        findUserInstallation: {
            deprecated: "octokit.apps.findUserInstallation() has been renamed to octokit.apps.getUserInstallation() (2019-04-10)",
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { username: { required: true, type: "string" } },
            url: "/users/:username/installation"
        },
        getAuthenticated: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: {},
            url: "/app"
        },
        getBySlug: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { app_slug: { required: true, type: "string" } },
            url: "/apps/:app_slug"
        },
        getInstallation: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { installation_id: { required: true, type: "integer" } },
            url: "/app/installations/:installation_id"
        },
        getOrgInstallation: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { org: { required: true, type: "string" } },
            url: "/orgs/:org/installation"
        },
        getRepoInstallation: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/installation"
        },
        getUserInstallation: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { username: { required: true, type: "string" } },
            url: "/users/:username/installation"
        },
        listAccountsUserOrOrgOnPlan: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                plan_id: { required: true, type: "integer" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/marketplace_listing/plans/:plan_id/accounts"
        },
        listAccountsUserOrOrgOnPlanStubbed: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                plan_id: { required: true, type: "integer" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/marketplace_listing/stubbed/plans/:plan_id/accounts"
        },
        listInstallationReposForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: {
                installation_id: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/user/installations/:installation_id/repositories"
        },
        listInstallations: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/app/installations"
        },
        listInstallationsForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/installations"
        },
        listMarketplacePurchasesForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/marketplace_purchases"
        },
        listMarketplacePurchasesForAuthenticatedUserStubbed: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/marketplace_purchases/stubbed"
        },
        listPlans: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/marketplace_listing/plans"
        },
        listPlansStubbed: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/marketplace_listing/stubbed/plans"
        },
        listRepos: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/installation/repositories"
        },
        removeRepoFromInstallation: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "DELETE",
            params: {
                installation_id: { required: true, type: "integer" },
                repository_id: { required: true, type: "integer" }
            },
            url: "/user/installations/:installation_id/repositories/:repository_id"
        },
        resetAuthorization: {
            deprecated: "octokit.apps.resetAuthorization() is deprecated, see https://developer.github.com/v3/apps/oauth_applications/#reset-an-authorization",
            method: "POST",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/tokens/:access_token"
        },
        resetToken: {
            headers: { accept: "application/vnd.github.doctor-strange-preview+json" },
            method: "PATCH",
            params: {
                access_token: { type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/token"
        },
        revokeAuthorizationForApplication: {
            deprecated: "octokit.apps.revokeAuthorizationForApplication() is deprecated, see https://developer.github.com/v3/apps/oauth_applications/#revoke-an-authorization-for-an-application",
            method: "DELETE",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/tokens/:access_token"
        },
        revokeGrantForApplication: {
            deprecated: "octokit.apps.revokeGrantForApplication() is deprecated, see https://developer.github.com/v3/apps/oauth_applications/#revoke-a-grant-for-an-application",
            method: "DELETE",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/grants/:access_token"
        },
        revokeInstallationToken: {
            headers: { accept: "application/vnd.github.gambit-preview+json" },
            method: "DELETE",
            params: {},
            url: "/installation/token"
        }
    },
    checks: {
        create: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "POST",
            params: {
                actions: { type: "object[]" },
                "actions[].description": { required: true, type: "string" },
                "actions[].identifier": { required: true, type: "string" },
                "actions[].label": { required: true, type: "string" },
                completed_at: { type: "string" },
                conclusion: {
                    enum: [
                        "success",
                        "failure",
                        "neutral",
                        "cancelled",
                        "timed_out",
                        "action_required"
                    ],
                    type: "string"
                },
                details_url: { type: "string" },
                external_id: { type: "string" },
                head_sha: { required: true, type: "string" },
                name: { required: true, type: "string" },
                output: { type: "object" },
                "output.annotations": { type: "object[]" },
                "output.annotations[].annotation_level": {
                    enum: ["notice", "warning", "failure"],
                    required: true,
                    type: "string"
                },
                "output.annotations[].end_column": { type: "integer" },
                "output.annotations[].end_line": { required: true, type: "integer" },
                "output.annotations[].message": { required: true, type: "string" },
                "output.annotations[].path": { required: true, type: "string" },
                "output.annotations[].raw_details": { type: "string" },
                "output.annotations[].start_column": { type: "integer" },
                "output.annotations[].start_line": { required: true, type: "integer" },
                "output.annotations[].title": { type: "string" },
                "output.images": { type: "object[]" },
                "output.images[].alt": { required: true, type: "string" },
                "output.images[].caption": { type: "string" },
                "output.images[].image_url": { required: true, type: "string" },
                "output.summary": { required: true, type: "string" },
                "output.text": { type: "string" },
                "output.title": { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                started_at: { type: "string" },
                status: { enum: ["queued", "in_progress", "completed"], type: "string" }
            },
            url: "/repos/:owner/:repo/check-runs"
        },
        createSuite: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "POST",
            params: {
                head_sha: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/check-suites"
        },
        get: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "GET",
            params: {
                check_run_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/check-runs/:check_run_id"
        },
        getSuite: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "GET",
            params: {
                check_suite_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/check-suites/:check_suite_id"
        },
        listAnnotations: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "GET",
            params: {
                check_run_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/check-runs/:check_run_id/annotations"
        },
        listForRef: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "GET",
            params: {
                check_name: { type: "string" },
                filter: { enum: ["latest", "all"], type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                status: { enum: ["queued", "in_progress", "completed"], type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:ref/check-runs"
        },
        listForSuite: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "GET",
            params: {
                check_name: { type: "string" },
                check_suite_id: { required: true, type: "integer" },
                filter: { enum: ["latest", "all"], type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                status: { enum: ["queued", "in_progress", "completed"], type: "string" }
            },
            url: "/repos/:owner/:repo/check-suites/:check_suite_id/check-runs"
        },
        listSuitesForRef: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "GET",
            params: {
                app_id: { type: "integer" },
                check_name: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:ref/check-suites"
        },
        rerequestSuite: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "POST",
            params: {
                check_suite_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/check-suites/:check_suite_id/rerequest"
        },
        setSuitesPreferences: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "PATCH",
            params: {
                auto_trigger_checks: { type: "object[]" },
                "auto_trigger_checks[].app_id": { required: true, type: "integer" },
                "auto_trigger_checks[].setting": { required: true, type: "boolean" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/check-suites/preferences"
        },
        update: {
            headers: { accept: "application/vnd.github.antiope-preview+json" },
            method: "PATCH",
            params: {
                actions: { type: "object[]" },
                "actions[].description": { required: true, type: "string" },
                "actions[].identifier": { required: true, type: "string" },
                "actions[].label": { required: true, type: "string" },
                check_run_id: { required: true, type: "integer" },
                completed_at: { type: "string" },
                conclusion: {
                    enum: [
                        "success",
                        "failure",
                        "neutral",
                        "cancelled",
                        "timed_out",
                        "action_required"
                    ],
                    type: "string"
                },
                details_url: { type: "string" },
                external_id: { type: "string" },
                name: { type: "string" },
                output: { type: "object" },
                "output.annotations": { type: "object[]" },
                "output.annotations[].annotation_level": {
                    enum: ["notice", "warning", "failure"],
                    required: true,
                    type: "string"
                },
                "output.annotations[].end_column": { type: "integer" },
                "output.annotations[].end_line": { required: true, type: "integer" },
                "output.annotations[].message": { required: true, type: "string" },
                "output.annotations[].path": { required: true, type: "string" },
                "output.annotations[].raw_details": { type: "string" },
                "output.annotations[].start_column": { type: "integer" },
                "output.annotations[].start_line": { required: true, type: "integer" },
                "output.annotations[].title": { type: "string" },
                "output.images": { type: "object[]" },
                "output.images[].alt": { required: true, type: "string" },
                "output.images[].caption": { type: "string" },
                "output.images[].image_url": { required: true, type: "string" },
                "output.summary": { required: true, type: "string" },
                "output.text": { type: "string" },
                "output.title": { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                started_at: { type: "string" },
                status: { enum: ["queued", "in_progress", "completed"], type: "string" }
            },
            url: "/repos/:owner/:repo/check-runs/:check_run_id"
        }
    },
    codesOfConduct: {
        getConductCode: {
            headers: { accept: "application/vnd.github.scarlet-witch-preview+json" },
            method: "GET",
            params: { key: { required: true, type: "string" } },
            url: "/codes_of_conduct/:key"
        },
        getForRepo: {
            headers: { accept: "application/vnd.github.scarlet-witch-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/community/code_of_conduct"
        },
        listConductCodes: {
            headers: { accept: "application/vnd.github.scarlet-witch-preview+json" },
            method: "GET",
            params: {},
            url: "/codes_of_conduct"
        }
    },
    emojis: { get: { method: "GET", params: {}, url: "/emojis" } },
    gists: {
        checkIsStarred: {
            method: "GET",
            params: { gist_id: { required: true, type: "string" } },
            url: "/gists/:gist_id/star"
        },
        create: {
            method: "POST",
            params: {
                description: { type: "string" },
                files: { required: true, type: "object" },
                "files.content": { type: "string" },
                public: { type: "boolean" }
            },
            url: "/gists"
        },
        createComment: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                gist_id: { required: true, type: "string" }
            },
            url: "/gists/:gist_id/comments"
        },
        delete: {
            method: "DELETE",
            params: { gist_id: { required: true, type: "string" } },
            url: "/gists/:gist_id"
        },
        deleteComment: {
            method: "DELETE",
            params: {
                comment_id: { required: true, type: "integer" },
                gist_id: { required: true, type: "string" }
            },
            url: "/gists/:gist_id/comments/:comment_id"
        },
        fork: {
            method: "POST",
            params: { gist_id: { required: true, type: "string" } },
            url: "/gists/:gist_id/forks"
        },
        get: {
            method: "GET",
            params: { gist_id: { required: true, type: "string" } },
            url: "/gists/:gist_id"
        },
        getComment: {
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                gist_id: { required: true, type: "string" }
            },
            url: "/gists/:gist_id/comments/:comment_id"
        },
        getRevision: {
            method: "GET",
            params: {
                gist_id: { required: true, type: "string" },
                sha: { required: true, type: "string" }
            },
            url: "/gists/:gist_id/:sha"
        },
        list: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" }
            },
            url: "/gists"
        },
        listComments: {
            method: "GET",
            params: {
                gist_id: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/gists/:gist_id/comments"
        },
        listCommits: {
            method: "GET",
            params: {
                gist_id: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/gists/:gist_id/commits"
        },
        listForks: {
            method: "GET",
            params: {
                gist_id: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/gists/:gist_id/forks"
        },
        listPublic: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" }
            },
            url: "/gists/public"
        },
        listPublicForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/gists"
        },
        listStarred: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" }
            },
            url: "/gists/starred"
        },
        star: {
            method: "PUT",
            params: { gist_id: { required: true, type: "string" } },
            url: "/gists/:gist_id/star"
        },
        unstar: {
            method: "DELETE",
            params: { gist_id: { required: true, type: "string" } },
            url: "/gists/:gist_id/star"
        },
        update: {
            method: "PATCH",
            params: {
                description: { type: "string" },
                files: { type: "object" },
                "files.content": { type: "string" },
                "files.filename": { type: "string" },
                gist_id: { required: true, type: "string" }
            },
            url: "/gists/:gist_id"
        },
        updateComment: {
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_id: { required: true, type: "integer" },
                gist_id: { required: true, type: "string" }
            },
            url: "/gists/:gist_id/comments/:comment_id"
        }
    },
    git: {
        createBlob: {
            method: "POST",
            params: {
                content: { required: true, type: "string" },
                encoding: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/blobs"
        },
        createCommit: {
            method: "POST",
            params: {
                author: { type: "object" },
                "author.date": { type: "string" },
                "author.email": { type: "string" },
                "author.name": { type: "string" },
                committer: { type: "object" },
                "committer.date": { type: "string" },
                "committer.email": { type: "string" },
                "committer.name": { type: "string" },
                message: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                parents: { required: true, type: "string[]" },
                repo: { required: true, type: "string" },
                signature: { type: "string" },
                tree: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/commits"
        },
        createRef: {
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/refs"
        },
        createTag: {
            method: "POST",
            params: {
                message: { required: true, type: "string" },
                object: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                tag: { required: true, type: "string" },
                tagger: { type: "object" },
                "tagger.date": { type: "string" },
                "tagger.email": { type: "string" },
                "tagger.name": { type: "string" },
                type: {
                    enum: ["commit", "tree", "blob"],
                    required: true,
                    type: "string"
                }
            },
            url: "/repos/:owner/:repo/git/tags"
        },
        createTree: {
            method: "POST",
            params: {
                base_tree: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                tree: { required: true, type: "object[]" },
                "tree[].content": { type: "string" },
                "tree[].mode": {
                    enum: ["100644", "100755", "040000", "160000", "120000"],
                    type: "string"
                },
                "tree[].path": { type: "string" },
                "tree[].sha": { allowNull: true, type: "string" },
                "tree[].type": { enum: ["blob", "tree", "commit"], type: "string" }
            },
            url: "/repos/:owner/:repo/git/trees"
        },
        deleteRef: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/refs/:ref"
        },
        getBlob: {
            method: "GET",
            params: {
                file_sha: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/blobs/:file_sha"
        },
        getCommit: {
            method: "GET",
            params: {
                commit_sha: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/commits/:commit_sha"
        },
        getRef: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/ref/:ref"
        },
        getTag: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                tag_sha: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/tags/:tag_sha"
        },
        getTree: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                recursive: { enum: ["1"], type: "integer" },
                repo: { required: true, type: "string" },
                tree_sha: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/trees/:tree_sha"
        },
        listMatchingRefs: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/matching-refs/:ref"
        },
        listRefs: {
            method: "GET",
            params: {
                namespace: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/refs/:namespace"
        },
        updateRef: {
            method: "PATCH",
            params: {
                force: { type: "boolean" },
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/git/refs/:ref"
        }
    },
    gitignore: {
        getTemplate: {
            method: "GET",
            params: { name: { required: true, type: "string" } },
            url: "/gitignore/templates/:name"
        },
        listTemplates: { method: "GET", params: {}, url: "/gitignore/templates" }
    },
    interactions: {
        addOrUpdateRestrictionsForOrg: {
            headers: { accept: "application/vnd.github.sombra-preview+json" },
            method: "PUT",
            params: {
                limit: {
                    enum: ["existing_users", "contributors_only", "collaborators_only"],
                    required: true,
                    type: "string"
                },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/interaction-limits"
        },
        addOrUpdateRestrictionsForRepo: {
            headers: { accept: "application/vnd.github.sombra-preview+json" },
            method: "PUT",
            params: {
                limit: {
                    enum: ["existing_users", "contributors_only", "collaborators_only"],
                    required: true,
                    type: "string"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/interaction-limits"
        },
        getRestrictionsForOrg: {
            headers: { accept: "application/vnd.github.sombra-preview+json" },
            method: "GET",
            params: { org: { required: true, type: "string" } },
            url: "/orgs/:org/interaction-limits"
        },
        getRestrictionsForRepo: {
            headers: { accept: "application/vnd.github.sombra-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/interaction-limits"
        },
        removeRestrictionsForOrg: {
            headers: { accept: "application/vnd.github.sombra-preview+json" },
            method: "DELETE",
            params: { org: { required: true, type: "string" } },
            url: "/orgs/:org/interaction-limits"
        },
        removeRestrictionsForRepo: {
            headers: { accept: "application/vnd.github.sombra-preview+json" },
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/interaction-limits"
        }
    },
    issues: {
        addAssignees: {
            method: "POST",
            params: {
                assignees: { type: "string[]" },
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/assignees"
        },
        addLabels: {
            method: "POST",
            params: {
                issue_number: { required: true, type: "integer" },
                labels: { required: true, type: "string[]" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/labels"
        },
        checkAssignee: {
            method: "GET",
            params: {
                assignee: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/assignees/:assignee"
        },
        create: {
            method: "POST",
            params: {
                assignee: { type: "string" },
                assignees: { type: "string[]" },
                body: { type: "string" },
                labels: { type: "string[]" },
                milestone: { type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                title: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues"
        },
        createComment: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/comments"
        },
        createLabel: {
            method: "POST",
            params: {
                color: { required: true, type: "string" },
                description: { type: "string" },
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/labels"
        },
        createMilestone: {
            method: "POST",
            params: {
                description: { type: "string" },
                due_on: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                state: { enum: ["open", "closed"], type: "string" },
                title: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/milestones"
        },
        deleteComment: {
            method: "DELETE",
            params: {
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/comments/:comment_id"
        },
        deleteLabel: {
            method: "DELETE",
            params: {
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/labels/:name"
        },
        deleteMilestone: {
            method: "DELETE",
            params: {
                milestone_number: { required: true, type: "integer" },
                number: {
                    alias: "milestone_number",
                    deprecated: true,
                    type: "integer"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/milestones/:milestone_number"
        },
        get: {
            method: "GET",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number"
        },
        getComment: {
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/comments/:comment_id"
        },
        getEvent: {
            method: "GET",
            params: {
                event_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/events/:event_id"
        },
        getLabel: {
            method: "GET",
            params: {
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/labels/:name"
        },
        getMilestone: {
            method: "GET",
            params: {
                milestone_number: { required: true, type: "integer" },
                number: {
                    alias: "milestone_number",
                    deprecated: true,
                    type: "integer"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/milestones/:milestone_number"
        },
        list: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                filter: {
                    enum: ["assigned", "created", "mentioned", "subscribed", "all"],
                    type: "string"
                },
                labels: { type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" },
                sort: { enum: ["created", "updated", "comments"], type: "string" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/issues"
        },
        listAssignees: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/assignees"
        },
        listComments: {
            method: "GET",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                since: { type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/comments"
        },
        listCommentsForRepo: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                since: { type: "string" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/repos/:owner/:repo/issues/comments"
        },
        listEvents: {
            method: "GET",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/events"
        },
        listEventsForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/events"
        },
        listEventsForTimeline: {
            headers: { accept: "application/vnd.github.mockingbird-preview+json" },
            method: "GET",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/timeline"
        },
        listForAuthenticatedUser: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                filter: {
                    enum: ["assigned", "created", "mentioned", "subscribed", "all"],
                    type: "string"
                },
                labels: { type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" },
                sort: { enum: ["created", "updated", "comments"], type: "string" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/user/issues"
        },
        listForOrg: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                filter: {
                    enum: ["assigned", "created", "mentioned", "subscribed", "all"],
                    type: "string"
                },
                labels: { type: "string" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" },
                sort: { enum: ["created", "updated", "comments"], type: "string" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/orgs/:org/issues"
        },
        listForRepo: {
            method: "GET",
            params: {
                assignee: { type: "string" },
                creator: { type: "string" },
                direction: { enum: ["asc", "desc"], type: "string" },
                labels: { type: "string" },
                mentioned: { type: "string" },
                milestone: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                since: { type: "string" },
                sort: { enum: ["created", "updated", "comments"], type: "string" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/repos/:owner/:repo/issues"
        },
        listLabelsForMilestone: {
            method: "GET",
            params: {
                milestone_number: { required: true, type: "integer" },
                number: {
                    alias: "milestone_number",
                    deprecated: true,
                    type: "integer"
                },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/milestones/:milestone_number/labels"
        },
        listLabelsForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/labels"
        },
        listLabelsOnIssue: {
            method: "GET",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/labels"
        },
        listMilestonesForRepo: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                sort: { enum: ["due_on", "completeness"], type: "string" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/repos/:owner/:repo/milestones"
        },
        lock: {
            method: "PUT",
            params: {
                issue_number: { required: true, type: "integer" },
                lock_reason: {
                    enum: ["off-topic", "too heated", "resolved", "spam"],
                    type: "string"
                },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/lock"
        },
        removeAssignees: {
            method: "DELETE",
            params: {
                assignees: { type: "string[]" },
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/assignees"
        },
        removeLabel: {
            method: "DELETE",
            params: {
                issue_number: { required: true, type: "integer" },
                name: { required: true, type: "string" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/labels/:name"
        },
        removeLabels: {
            method: "DELETE",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/labels"
        },
        replaceLabels: {
            method: "PUT",
            params: {
                issue_number: { required: true, type: "integer" },
                labels: { type: "string[]" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/labels"
        },
        unlock: {
            method: "DELETE",
            params: {
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/lock"
        },
        update: {
            method: "PATCH",
            params: {
                assignee: { type: "string" },
                assignees: { type: "string[]" },
                body: { type: "string" },
                issue_number: { required: true, type: "integer" },
                labels: { type: "string[]" },
                milestone: { allowNull: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                state: { enum: ["open", "closed"], type: "string" },
                title: { type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number"
        },
        updateComment: {
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/comments/:comment_id"
        },
        updateLabel: {
            method: "PATCH",
            params: {
                color: { type: "string" },
                current_name: { required: true, type: "string" },
                description: { type: "string" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/labels/:current_name"
        },
        updateMilestone: {
            method: "PATCH",
            params: {
                description: { type: "string" },
                due_on: { type: "string" },
                milestone_number: { required: true, type: "integer" },
                number: {
                    alias: "milestone_number",
                    deprecated: true,
                    type: "integer"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                state: { enum: ["open", "closed"], type: "string" },
                title: { type: "string" }
            },
            url: "/repos/:owner/:repo/milestones/:milestone_number"
        }
    },
    licenses: {
        get: {
            method: "GET",
            params: { license: { required: true, type: "string" } },
            url: "/licenses/:license"
        },
        getForRepo: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/license"
        },
        list: {
            deprecated: "octokit.licenses.list() has been renamed to octokit.licenses.listCommonlyUsed() (2019-03-05)",
            method: "GET",
            params: {},
            url: "/licenses"
        },
        listCommonlyUsed: { method: "GET", params: {}, url: "/licenses" }
    },
    markdown: {
        render: {
            method: "POST",
            params: {
                context: { type: "string" },
                mode: { enum: ["markdown", "gfm"], type: "string" },
                text: { required: true, type: "string" }
            },
            url: "/markdown"
        },
        renderRaw: {
            headers: { "content-type": "text/plain; charset=utf-8" },
            method: "POST",
            params: { data: { mapTo: "data", required: true, type: "string" } },
            url: "/markdown/raw"
        }
    },
    meta: { get: { method: "GET", params: {}, url: "/meta" } },
    migrations: {
        cancelImport: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/import"
        },
        deleteArchiveForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "DELETE",
            params: { migration_id: { required: true, type: "integer" } },
            url: "/user/migrations/:migration_id/archive"
        },
        deleteArchiveForOrg: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "DELETE",
            params: {
                migration_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/migrations/:migration_id/archive"
        },
        downloadArchiveForOrg: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: {
                migration_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/migrations/:migration_id/archive"
        },
        getArchiveForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: { migration_id: { required: true, type: "integer" } },
            url: "/user/migrations/:migration_id/archive"
        },
        getArchiveForOrg: {
            deprecated: "octokit.migrations.getArchiveForOrg() has been renamed to octokit.migrations.downloadArchiveForOrg() (2020-01-27)",
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: {
                migration_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/migrations/:migration_id/archive"
        },
        getCommitAuthors: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                since: { type: "string" }
            },
            url: "/repos/:owner/:repo/import/authors"
        },
        getImportProgress: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/import"
        },
        getLargeFiles: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/import/large_files"
        },
        getStatusForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: { migration_id: { required: true, type: "integer" } },
            url: "/user/migrations/:migration_id"
        },
        getStatusForOrg: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: {
                migration_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/migrations/:migration_id"
        },
        listForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/migrations"
        },
        listForOrg: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/migrations"
        },
        listReposForOrg: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: {
                migration_id: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/migrations/:migration_id/repositories"
        },
        listReposForUser: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "GET",
            params: {
                migration_id: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/user/:migration_id/repositories"
        },
        mapCommitAuthor: {
            method: "PATCH",
            params: {
                author_id: { required: true, type: "integer" },
                email: { type: "string" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/import/authors/:author_id"
        },
        setLfsPreference: {
            method: "PATCH",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                use_lfs: { enum: ["opt_in", "opt_out"], required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/import/lfs"
        },
        startForAuthenticatedUser: {
            method: "POST",
            params: {
                exclude_attachments: { type: "boolean" },
                lock_repositories: { type: "boolean" },
                repositories: { required: true, type: "string[]" }
            },
            url: "/user/migrations"
        },
        startForOrg: {
            method: "POST",
            params: {
                exclude_attachments: { type: "boolean" },
                lock_repositories: { type: "boolean" },
                org: { required: true, type: "string" },
                repositories: { required: true, type: "string[]" }
            },
            url: "/orgs/:org/migrations"
        },
        startImport: {
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                tfvc_project: { type: "string" },
                vcs: {
                    enum: ["subversion", "git", "mercurial", "tfvc"],
                    type: "string"
                },
                vcs_password: { type: "string" },
                vcs_url: { required: true, type: "string" },
                vcs_username: { type: "string" }
            },
            url: "/repos/:owner/:repo/import"
        },
        unlockRepoForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "DELETE",
            params: {
                migration_id: { required: true, type: "integer" },
                repo_name: { required: true, type: "string" }
            },
            url: "/user/migrations/:migration_id/repos/:repo_name/lock"
        },
        unlockRepoForOrg: {
            headers: { accept: "application/vnd.github.wyandotte-preview+json" },
            method: "DELETE",
            params: {
                migration_id: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                repo_name: { required: true, type: "string" }
            },
            url: "/orgs/:org/migrations/:migration_id/repos/:repo_name/lock"
        },
        updateImport: {
            method: "PATCH",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                vcs_password: { type: "string" },
                vcs_username: { type: "string" }
            },
            url: "/repos/:owner/:repo/import"
        }
    },
    oauthAuthorizations: {
        checkAuthorization: {
            deprecated: "octokit.oauthAuthorizations.checkAuthorization() has been renamed to octokit.apps.checkAuthorization() (2019-11-05)",
            method: "GET",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/tokens/:access_token"
        },
        createAuthorization: {
            deprecated: "octokit.oauthAuthorizations.createAuthorization() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#create-a-new-authorization",
            method: "POST",
            params: {
                client_id: { type: "string" },
                client_secret: { type: "string" },
                fingerprint: { type: "string" },
                note: { required: true, type: "string" },
                note_url: { type: "string" },
                scopes: { type: "string[]" }
            },
            url: "/authorizations"
        },
        deleteAuthorization: {
            deprecated: "octokit.oauthAuthorizations.deleteAuthorization() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#delete-an-authorization",
            method: "DELETE",
            params: { authorization_id: { required: true, type: "integer" } },
            url: "/authorizations/:authorization_id"
        },
        deleteGrant: {
            deprecated: "octokit.oauthAuthorizations.deleteGrant() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#delete-a-grant",
            method: "DELETE",
            params: { grant_id: { required: true, type: "integer" } },
            url: "/applications/grants/:grant_id"
        },
        getAuthorization: {
            deprecated: "octokit.oauthAuthorizations.getAuthorization() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#get-a-single-authorization",
            method: "GET",
            params: { authorization_id: { required: true, type: "integer" } },
            url: "/authorizations/:authorization_id"
        },
        getGrant: {
            deprecated: "octokit.oauthAuthorizations.getGrant() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#get-a-single-grant",
            method: "GET",
            params: { grant_id: { required: true, type: "integer" } },
            url: "/applications/grants/:grant_id"
        },
        getOrCreateAuthorizationForApp: {
            deprecated: "octokit.oauthAuthorizations.getOrCreateAuthorizationForApp() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#get-or-create-an-authorization-for-a-specific-app",
            method: "PUT",
            params: {
                client_id: { required: true, type: "string" },
                client_secret: { required: true, type: "string" },
                fingerprint: { type: "string" },
                note: { type: "string" },
                note_url: { type: "string" },
                scopes: { type: "string[]" }
            },
            url: "/authorizations/clients/:client_id"
        },
        getOrCreateAuthorizationForAppAndFingerprint: {
            deprecated: "octokit.oauthAuthorizations.getOrCreateAuthorizationForAppAndFingerprint() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#get-or-create-an-authorization-for-a-specific-app-and-fingerprint",
            method: "PUT",
            params: {
                client_id: { required: true, type: "string" },
                client_secret: { required: true, type: "string" },
                fingerprint: { required: true, type: "string" },
                note: { type: "string" },
                note_url: { type: "string" },
                scopes: { type: "string[]" }
            },
            url: "/authorizations/clients/:client_id/:fingerprint"
        },
        getOrCreateAuthorizationForAppFingerprint: {
            deprecated: "octokit.oauthAuthorizations.getOrCreateAuthorizationForAppFingerprint() has been renamed to octokit.oauthAuthorizations.getOrCreateAuthorizationForAppAndFingerprint() (2018-12-27)",
            method: "PUT",
            params: {
                client_id: { required: true, type: "string" },
                client_secret: { required: true, type: "string" },
                fingerprint: { required: true, type: "string" },
                note: { type: "string" },
                note_url: { type: "string" },
                scopes: { type: "string[]" }
            },
            url: "/authorizations/clients/:client_id/:fingerprint"
        },
        listAuthorizations: {
            deprecated: "octokit.oauthAuthorizations.listAuthorizations() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#list-your-authorizations",
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/authorizations"
        },
        listGrants: {
            deprecated: "octokit.oauthAuthorizations.listGrants() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#list-your-grants",
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/applications/grants"
        },
        resetAuthorization: {
            deprecated: "octokit.oauthAuthorizations.resetAuthorization() has been renamed to octokit.apps.resetAuthorization() (2019-11-05)",
            method: "POST",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/tokens/:access_token"
        },
        revokeAuthorizationForApplication: {
            deprecated: "octokit.oauthAuthorizations.revokeAuthorizationForApplication() has been renamed to octokit.apps.revokeAuthorizationForApplication() (2019-11-05)",
            method: "DELETE",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/tokens/:access_token"
        },
        revokeGrantForApplication: {
            deprecated: "octokit.oauthAuthorizations.revokeGrantForApplication() has been renamed to octokit.apps.revokeGrantForApplication() (2019-11-05)",
            method: "DELETE",
            params: {
                access_token: { required: true, type: "string" },
                client_id: { required: true, type: "string" }
            },
            url: "/applications/:client_id/grants/:access_token"
        },
        updateAuthorization: {
            deprecated: "octokit.oauthAuthorizations.updateAuthorization() is deprecated, see https://developer.github.com/v3/oauth_authorizations/#update-an-existing-authorization",
            method: "PATCH",
            params: {
                add_scopes: { type: "string[]" },
                authorization_id: { required: true, type: "integer" },
                fingerprint: { type: "string" },
                note: { type: "string" },
                note_url: { type: "string" },
                remove_scopes: { type: "string[]" },
                scopes: { type: "string[]" }
            },
            url: "/authorizations/:authorization_id"
        }
    },
    orgs: {
        addOrUpdateMembership: {
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                role: { enum: ["admin", "member"], type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/memberships/:username"
        },
        blockUser: {
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/blocks/:username"
        },
        checkBlockedUser: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/blocks/:username"
        },
        checkMembership: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/members/:username"
        },
        checkPublicMembership: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/public_members/:username"
        },
        concealMembership: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/public_members/:username"
        },
        convertMemberToOutsideCollaborator: {
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/outside_collaborators/:username"
        },
        createHook: {
            method: "POST",
            params: {
                active: { type: "boolean" },
                config: { required: true, type: "object" },
                "config.content_type": { type: "string" },
                "config.insecure_ssl": { type: "string" },
                "config.secret": { type: "string" },
                "config.url": { required: true, type: "string" },
                events: { type: "string[]" },
                name: { required: true, type: "string" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/hooks"
        },
        createInvitation: {
            method: "POST",
            params: {
                email: { type: "string" },
                invitee_id: { type: "integer" },
                org: { required: true, type: "string" },
                role: {
                    enum: ["admin", "direct_member", "billing_manager"],
                    type: "string"
                },
                team_ids: { type: "integer[]" }
            },
            url: "/orgs/:org/invitations"
        },
        deleteHook: {
            method: "DELETE",
            params: {
                hook_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/hooks/:hook_id"
        },
        get: {
            method: "GET",
            params: { org: { required: true, type: "string" } },
            url: "/orgs/:org"
        },
        getHook: {
            method: "GET",
            params: {
                hook_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/hooks/:hook_id"
        },
        getMembership: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/memberships/:username"
        },
        getMembershipForAuthenticatedUser: {
            method: "GET",
            params: { org: { required: true, type: "string" } },
            url: "/user/memberships/orgs/:org"
        },
        list: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "integer" }
            },
            url: "/organizations"
        },
        listBlockedUsers: {
            method: "GET",
            params: { org: { required: true, type: "string" } },
            url: "/orgs/:org/blocks"
        },
        listForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/orgs"
        },
        listForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/orgs"
        },
        listHooks: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/hooks"
        },
        listInstallations: {
            headers: { accept: "application/vnd.github.machine-man-preview+json" },
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/installations"
        },
        listInvitationTeams: {
            method: "GET",
            params: {
                invitation_id: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/invitations/:invitation_id/teams"
        },
        listMembers: {
            method: "GET",
            params: {
                filter: { enum: ["2fa_disabled", "all"], type: "string" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                role: { enum: ["all", "admin", "member"], type: "string" }
            },
            url: "/orgs/:org/members"
        },
        listMemberships: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                state: { enum: ["active", "pending"], type: "string" }
            },
            url: "/user/memberships/orgs"
        },
        listOutsideCollaborators: {
            method: "GET",
            params: {
                filter: { enum: ["2fa_disabled", "all"], type: "string" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/outside_collaborators"
        },
        listPendingInvitations: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/invitations"
        },
        listPublicMembers: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/public_members"
        },
        pingHook: {
            method: "POST",
            params: {
                hook_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/hooks/:hook_id/pings"
        },
        publicizeMembership: {
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/public_members/:username"
        },
        removeMember: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/members/:username"
        },
        removeMembership: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/memberships/:username"
        },
        removeOutsideCollaborator: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/outside_collaborators/:username"
        },
        unblockUser: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/blocks/:username"
        },
        update: {
            method: "PATCH",
            params: {
                billing_email: { type: "string" },
                company: { type: "string" },
                default_repository_permission: {
                    enum: ["read", "write", "admin", "none"],
                    type: "string"
                },
                description: { type: "string" },
                email: { type: "string" },
                has_organization_projects: { type: "boolean" },
                has_repository_projects: { type: "boolean" },
                location: { type: "string" },
                members_allowed_repository_creation_type: {
                    enum: ["all", "private", "none"],
                    type: "string"
                },
                members_can_create_internal_repositories: { type: "boolean" },
                members_can_create_private_repositories: { type: "boolean" },
                members_can_create_public_repositories: { type: "boolean" },
                members_can_create_repositories: { type: "boolean" },
                name: { type: "string" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org"
        },
        updateHook: {
            method: "PATCH",
            params: {
                active: { type: "boolean" },
                config: { type: "object" },
                "config.content_type": { type: "string" },
                "config.insecure_ssl": { type: "string" },
                "config.secret": { type: "string" },
                "config.url": { required: true, type: "string" },
                events: { type: "string[]" },
                hook_id: { required: true, type: "integer" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/hooks/:hook_id"
        },
        updateMembership: {
            method: "PATCH",
            params: {
                org: { required: true, type: "string" },
                state: { enum: ["active"], required: true, type: "string" }
            },
            url: "/user/memberships/orgs/:org"
        }
    },
    projects: {
        addCollaborator: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PUT",
            params: {
                permission: { enum: ["read", "write", "admin"], type: "string" },
                project_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/projects/:project_id/collaborators/:username"
        },
        createCard: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                column_id: { required: true, type: "integer" },
                content_id: { type: "integer" },
                content_type: { type: "string" },
                note: { type: "string" }
            },
            url: "/projects/columns/:column_id/cards"
        },
        createColumn: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                name: { required: true, type: "string" },
                project_id: { required: true, type: "integer" }
            },
            url: "/projects/:project_id/columns"
        },
        createForAuthenticatedUser: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                body: { type: "string" },
                name: { required: true, type: "string" }
            },
            url: "/user/projects"
        },
        createForOrg: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                body: { type: "string" },
                name: { required: true, type: "string" },
                org: { required: true, type: "string" }
            },
            url: "/orgs/:org/projects"
        },
        createForRepo: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                body: { type: "string" },
                name: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/projects"
        },
        delete: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "DELETE",
            params: { project_id: { required: true, type: "integer" } },
            url: "/projects/:project_id"
        },
        deleteCard: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "DELETE",
            params: { card_id: { required: true, type: "integer" } },
            url: "/projects/columns/cards/:card_id"
        },
        deleteColumn: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "DELETE",
            params: { column_id: { required: true, type: "integer" } },
            url: "/projects/columns/:column_id"
        },
        get: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: { project_id: { required: true, type: "integer" } },
            url: "/projects/:project_id"
        },
        getCard: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: { card_id: { required: true, type: "integer" } },
            url: "/projects/columns/cards/:card_id"
        },
        getColumn: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: { column_id: { required: true, type: "integer" } },
            url: "/projects/columns/:column_id"
        },
        listCards: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                archived_state: {
                    enum: ["all", "archived", "not_archived"],
                    type: "string"
                },
                column_id: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/projects/columns/:column_id/cards"
        },
        listCollaborators: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                affiliation: { enum: ["outside", "direct", "all"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                project_id: { required: true, type: "integer" }
            },
            url: "/projects/:project_id/collaborators"
        },
        listColumns: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                project_id: { required: true, type: "integer" }
            },
            url: "/projects/:project_id/columns"
        },
        listForOrg: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/orgs/:org/projects"
        },
        listForRepo: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/repos/:owner/:repo/projects"
        },
        listForUser: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                state: { enum: ["open", "closed", "all"], type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/projects"
        },
        moveCard: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                card_id: { required: true, type: "integer" },
                column_id: { type: "integer" },
                position: {
                    required: true,
                    type: "string",
                    validation: "^(top|bottom|after:\\d+)$"
                }
            },
            url: "/projects/columns/cards/:card_id/moves"
        },
        moveColumn: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "POST",
            params: {
                column_id: { required: true, type: "integer" },
                position: {
                    required: true,
                    type: "string",
                    validation: "^(first|last|after:\\d+)$"
                }
            },
            url: "/projects/columns/:column_id/moves"
        },
        removeCollaborator: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "DELETE",
            params: {
                project_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/projects/:project_id/collaborators/:username"
        },
        reviewUserPermissionLevel: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                project_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/projects/:project_id/collaborators/:username/permission"
        },
        update: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PATCH",
            params: {
                body: { type: "string" },
                name: { type: "string" },
                organization_permission: { type: "string" },
                private: { type: "boolean" },
                project_id: { required: true, type: "integer" },
                state: { enum: ["open", "closed"], type: "string" }
            },
            url: "/projects/:project_id"
        },
        updateCard: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PATCH",
            params: {
                archived: { type: "boolean" },
                card_id: { required: true, type: "integer" },
                note: { type: "string" }
            },
            url: "/projects/columns/cards/:card_id"
        },
        updateColumn: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PATCH",
            params: {
                column_id: { required: true, type: "integer" },
                name: { required: true, type: "string" }
            },
            url: "/projects/columns/:column_id"
        }
    },
    pulls: {
        checkIfMerged: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/merge"
        },
        create: {
            method: "POST",
            params: {
                base: { required: true, type: "string" },
                body: { type: "string" },
                draft: { type: "boolean" },
                head: { required: true, type: "string" },
                maintainer_can_modify: { type: "boolean" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                title: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls"
        },
        createComment: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                commit_id: { required: true, type: "string" },
                in_reply_to: {
                    deprecated: true,
                    description: "The comment ID to reply to. **Note**: This must be the ID of a top-level comment, not a reply to that comment. Replies to replies are not supported.",
                    type: "integer"
                },
                line: { type: "integer" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                position: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                side: { enum: ["LEFT", "RIGHT"], type: "string" },
                start_line: { type: "integer" },
                start_side: { enum: ["LEFT", "RIGHT", "side"], type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/comments"
        },
        createCommentReply: {
            deprecated: "octokit.pulls.createCommentReply() has been renamed to octokit.pulls.createComment() (2019-09-09)",
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                commit_id: { required: true, type: "string" },
                in_reply_to: {
                    deprecated: true,
                    description: "The comment ID to reply to. **Note**: This must be the ID of a top-level comment, not a reply to that comment. Replies to replies are not supported.",
                    type: "integer"
                },
                line: { type: "integer" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                position: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                side: { enum: ["LEFT", "RIGHT"], type: "string" },
                start_line: { type: "integer" },
                start_side: { enum: ["LEFT", "RIGHT", "side"], type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/comments"
        },
        createFromIssue: {
            deprecated: "octokit.pulls.createFromIssue() is deprecated, see https://developer.github.com/v3/pulls/#create-a-pull-request",
            method: "POST",
            params: {
                base: { required: true, type: "string" },
                draft: { type: "boolean" },
                head: { required: true, type: "string" },
                issue: { required: true, type: "integer" },
                maintainer_can_modify: { type: "boolean" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls"
        },
        createReview: {
            method: "POST",
            params: {
                body: { type: "string" },
                comments: { type: "object[]" },
                "comments[].body": { required: true, type: "string" },
                "comments[].path": { required: true, type: "string" },
                "comments[].position": { required: true, type: "integer" },
                commit_id: { type: "string" },
                event: {
                    enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
                    type: "string"
                },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews"
        },
        createReviewCommentReply: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/comments/:comment_id/replies"
        },
        createReviewRequest: {
            method: "POST",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                reviewers: { type: "string[]" },
                team_reviewers: { type: "string[]" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/requested_reviewers"
        },
        deleteComment: {
            method: "DELETE",
            params: {
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/comments/:comment_id"
        },
        deletePendingReview: {
            method: "DELETE",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                review_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id"
        },
        deleteReviewRequest: {
            method: "DELETE",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                reviewers: { type: "string[]" },
                team_reviewers: { type: "string[]" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/requested_reviewers"
        },
        dismissReview: {
            method: "PUT",
            params: {
                message: { required: true, type: "string" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                review_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/dismissals"
        },
        get: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number"
        },
        getComment: {
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/comments/:comment_id"
        },
        getCommentsForReview: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                review_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/comments"
        },
        getReview: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                review_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id"
        },
        list: {
            method: "GET",
            params: {
                base: { type: "string" },
                direction: { enum: ["asc", "desc"], type: "string" },
                head: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                sort: {
                    enum: ["created", "updated", "popularity", "long-running"],
                    type: "string"
                },
                state: { enum: ["open", "closed", "all"], type: "string" }
            },
            url: "/repos/:owner/:repo/pulls"
        },
        listComments: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                since: { type: "string" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/comments"
        },
        listCommentsForRepo: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                since: { type: "string" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/comments"
        },
        listCommits: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/commits"
        },
        listFiles: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/files"
        },
        listReviewRequests: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/requested_reviewers"
        },
        listReviews: {
            method: "GET",
            params: {
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews"
        },
        merge: {
            method: "PUT",
            params: {
                commit_message: { type: "string" },
                commit_title: { type: "string" },
                merge_method: { enum: ["merge", "squash", "rebase"], type: "string" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                sha: { type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/merge"
        },
        submitReview: {
            method: "POST",
            params: {
                body: { type: "string" },
                event: {
                    enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
                    required: true,
                    type: "string"
                },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                review_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id/events"
        },
        update: {
            method: "PATCH",
            params: {
                base: { type: "string" },
                body: { type: "string" },
                maintainer_can_modify: { type: "boolean" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                state: { enum: ["open", "closed"], type: "string" },
                title: { type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number"
        },
        updateBranch: {
            headers: { accept: "application/vnd.github.lydian-preview+json" },
            method: "PUT",
            params: {
                expected_head_sha: { type: "string" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/update-branch"
        },
        updateComment: {
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/comments/:comment_id"
        },
        updateReview: {
            method: "PUT",
            params: {
                body: { required: true, type: "string" },
                number: { alias: "pull_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                pull_number: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                review_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/pulls/:pull_number/reviews/:review_id"
        }
    },
    rateLimit: { get: { method: "GET", params: {}, url: "/rate_limit" } },
    reactions: {
        createForCommitComment: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                comment_id: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/comments/:comment_id/reactions"
        },
        createForIssue: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/reactions"
        },
        createForIssueComment: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                comment_id: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/comments/:comment_id/reactions"
        },
        createForPullRequestReviewComment: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                comment_id: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/comments/:comment_id/reactions"
        },
        createForTeamDiscussion: {
            deprecated: "octokit.reactions.createForTeamDiscussion() has been renamed to octokit.reactions.createForTeamDiscussionLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/reactions"
        },
        createForTeamDiscussionComment: {
            deprecated: "octokit.reactions.createForTeamDiscussionComment() has been renamed to octokit.reactions.createForTeamDiscussionCommentLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                comment_number: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number/reactions"
        },
        createForTeamDiscussionCommentInOrg: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                comment_number: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments/:comment_number/reactions"
        },
        createForTeamDiscussionCommentLegacy: {
            deprecated: "octokit.reactions.createForTeamDiscussionCommentLegacy() is deprecated, see https://developer.github.com/v3/reactions/#create-reaction-for-a-team-discussion-comment-legacy",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                comment_number: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number/reactions"
        },
        createForTeamDiscussionInOrg: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/reactions"
        },
        createForTeamDiscussionLegacy: {
            deprecated: "octokit.reactions.createForTeamDiscussionLegacy() is deprecated, see https://developer.github.com/v3/reactions/#create-reaction-for-a-team-discussion-legacy",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "POST",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    required: true,
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/reactions"
        },
        delete: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "DELETE",
            params: { reaction_id: { required: true, type: "integer" } },
            url: "/reactions/:reaction_id"
        },
        listForCommitComment: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/comments/:comment_id/reactions"
        },
        listForIssue: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                issue_number: { required: true, type: "integer" },
                number: { alias: "issue_number", deprecated: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/:issue_number/reactions"
        },
        listForIssueComment: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/issues/comments/:comment_id/reactions"
        },
        listForPullRequestReviewComment: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pulls/comments/:comment_id/reactions"
        },
        listForTeamDiscussion: {
            deprecated: "octokit.reactions.listForTeamDiscussion() has been renamed to octokit.reactions.listForTeamDiscussionLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/reactions"
        },
        listForTeamDiscussionComment: {
            deprecated: "octokit.reactions.listForTeamDiscussionComment() has been renamed to octokit.reactions.listForTeamDiscussionCommentLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                comment_number: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number/reactions"
        },
        listForTeamDiscussionCommentInOrg: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                comment_number: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments/:comment_number/reactions"
        },
        listForTeamDiscussionCommentLegacy: {
            deprecated: "octokit.reactions.listForTeamDiscussionCommentLegacy() is deprecated, see https://developer.github.com/v3/reactions/#list-reactions-for-a-team-discussion-comment-legacy",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                comment_number: { required: true, type: "integer" },
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number/reactions"
        },
        listForTeamDiscussionInOrg: {
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/reactions"
        },
        listForTeamDiscussionLegacy: {
            deprecated: "octokit.reactions.listForTeamDiscussionLegacy() is deprecated, see https://developer.github.com/v3/reactions/#list-reactions-for-a-team-discussion-legacy",
            headers: { accept: "application/vnd.github.squirrel-girl-preview+json" },
            method: "GET",
            params: {
                content: {
                    enum: [
                        "+1",
                        "-1",
                        "laugh",
                        "confused",
                        "heart",
                        "hooray",
                        "rocket",
                        "eyes"
                    ],
                    type: "string"
                },
                discussion_number: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/reactions"
        }
    },
    repos: {
        acceptInvitation: {
            method: "PATCH",
            params: { invitation_id: { required: true, type: "integer" } },
            url: "/user/repository_invitations/:invitation_id"
        },
        addCollaborator: {
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                repo: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/collaborators/:username"
        },
        addDeployKey: {
            method: "POST",
            params: {
                key: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                read_only: { type: "boolean" },
                repo: { required: true, type: "string" },
                title: { type: "string" }
            },
            url: "/repos/:owner/:repo/keys"
        },
        addProtectedBranchAdminEnforcement: {
            method: "POST",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/enforce_admins"
        },
        addProtectedBranchAppRestrictions: {
            method: "POST",
            params: {
                apps: { mapTo: "data", required: true, type: "string[]" },
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/apps"
        },
        addProtectedBranchRequiredSignatures: {
            headers: { accept: "application/vnd.github.zzzax-preview+json" },
            method: "POST",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_signatures"
        },
        addProtectedBranchRequiredStatusChecksContexts: {
            method: "POST",
            params: {
                branch: { required: true, type: "string" },
                contexts: { mapTo: "data", required: true, type: "string[]" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
        },
        addProtectedBranchTeamRestrictions: {
            method: "POST",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                teams: { mapTo: "data", required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
        },
        addProtectedBranchUserRestrictions: {
            method: "POST",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                users: { mapTo: "data", required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
        },
        checkCollaborator: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/collaborators/:username"
        },
        checkVulnerabilityAlerts: {
            headers: { accept: "application/vnd.github.dorian-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/vulnerability-alerts"
        },
        compareCommits: {
            method: "GET",
            params: {
                base: { required: true, type: "string" },
                head: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/compare/:base...:head"
        },
        createCommitComment: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                commit_sha: { required: true, type: "string" },
                line: { type: "integer" },
                owner: { required: true, type: "string" },
                path: { type: "string" },
                position: { type: "integer" },
                repo: { required: true, type: "string" },
                sha: { alias: "commit_sha", deprecated: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:commit_sha/comments"
        },
        createDeployment: {
            method: "POST",
            params: {
                auto_merge: { type: "boolean" },
                description: { type: "string" },
                environment: { type: "string" },
                owner: { required: true, type: "string" },
                payload: { type: "string" },
                production_environment: { type: "boolean" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                required_contexts: { type: "string[]" },
                task: { type: "string" },
                transient_environment: { type: "boolean" }
            },
            url: "/repos/:owner/:repo/deployments"
        },
        createDeploymentStatus: {
            method: "POST",
            params: {
                auto_inactive: { type: "boolean" },
                deployment_id: { required: true, type: "integer" },
                description: { type: "string" },
                environment: { enum: ["production", "staging", "qa"], type: "string" },
                environment_url: { type: "string" },
                log_url: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                state: {
                    enum: [
                        "error",
                        "failure",
                        "inactive",
                        "in_progress",
                        "queued",
                        "pending",
                        "success"
                    ],
                    required: true,
                    type: "string"
                },
                target_url: { type: "string" }
            },
            url: "/repos/:owner/:repo/deployments/:deployment_id/statuses"
        },
        createDispatchEvent: {
            method: "POST",
            params: {
                client_payload: { type: "object" },
                event_type: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/dispatches"
        },
        createFile: {
            deprecated: "octokit.repos.createFile() has been renamed to octokit.repos.createOrUpdateFile() (2019-06-07)",
            method: "PUT",
            params: {
                author: { type: "object" },
                "author.email": { required: true, type: "string" },
                "author.name": { required: true, type: "string" },
                branch: { type: "string" },
                committer: { type: "object" },
                "committer.email": { required: true, type: "string" },
                "committer.name": { required: true, type: "string" },
                content: { required: true, type: "string" },
                message: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { type: "string" }
            },
            url: "/repos/:owner/:repo/contents/:path"
        },
        createForAuthenticatedUser: {
            method: "POST",
            params: {
                allow_merge_commit: { type: "boolean" },
                allow_rebase_merge: { type: "boolean" },
                allow_squash_merge: { type: "boolean" },
                auto_init: { type: "boolean" },
                delete_branch_on_merge: { type: "boolean" },
                description: { type: "string" },
                gitignore_template: { type: "string" },
                has_issues: { type: "boolean" },
                has_projects: { type: "boolean" },
                has_wiki: { type: "boolean" },
                homepage: { type: "string" },
                is_template: { type: "boolean" },
                license_template: { type: "string" },
                name: { required: true, type: "string" },
                private: { type: "boolean" },
                team_id: { type: "integer" },
                visibility: {
                    enum: ["public", "private", "visibility", "internal"],
                    type: "string"
                }
            },
            url: "/user/repos"
        },
        createFork: {
            method: "POST",
            params: {
                organization: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/forks"
        },
        createHook: {
            method: "POST",
            params: {
                active: { type: "boolean" },
                config: { required: true, type: "object" },
                "config.content_type": { type: "string" },
                "config.insecure_ssl": { type: "string" },
                "config.secret": { type: "string" },
                "config.url": { required: true, type: "string" },
                events: { type: "string[]" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks"
        },
        createInOrg: {
            method: "POST",
            params: {
                allow_merge_commit: { type: "boolean" },
                allow_rebase_merge: { type: "boolean" },
                allow_squash_merge: { type: "boolean" },
                auto_init: { type: "boolean" },
                delete_branch_on_merge: { type: "boolean" },
                description: { type: "string" },
                gitignore_template: { type: "string" },
                has_issues: { type: "boolean" },
                has_projects: { type: "boolean" },
                has_wiki: { type: "boolean" },
                homepage: { type: "string" },
                is_template: { type: "boolean" },
                license_template: { type: "string" },
                name: { required: true, type: "string" },
                org: { required: true, type: "string" },
                private: { type: "boolean" },
                team_id: { type: "integer" },
                visibility: {
                    enum: ["public", "private", "visibility", "internal"],
                    type: "string"
                }
            },
            url: "/orgs/:org/repos"
        },
        createOrUpdateFile: {
            method: "PUT",
            params: {
                author: { type: "object" },
                "author.email": { required: true, type: "string" },
                "author.name": { required: true, type: "string" },
                branch: { type: "string" },
                committer: { type: "object" },
                "committer.email": { required: true, type: "string" },
                "committer.name": { required: true, type: "string" },
                content: { required: true, type: "string" },
                message: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { type: "string" }
            },
            url: "/repos/:owner/:repo/contents/:path"
        },
        createRelease: {
            method: "POST",
            params: {
                body: { type: "string" },
                draft: { type: "boolean" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                prerelease: { type: "boolean" },
                repo: { required: true, type: "string" },
                tag_name: { required: true, type: "string" },
                target_commitish: { type: "string" }
            },
            url: "/repos/:owner/:repo/releases"
        },
        createStatus: {
            method: "POST",
            params: {
                context: { type: "string" },
                description: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { required: true, type: "string" },
                state: {
                    enum: ["error", "failure", "pending", "success"],
                    required: true,
                    type: "string"
                },
                target_url: { type: "string" }
            },
            url: "/repos/:owner/:repo/statuses/:sha"
        },
        createUsingTemplate: {
            headers: { accept: "application/vnd.github.baptiste-preview+json" },
            method: "POST",
            params: {
                description: { type: "string" },
                name: { required: true, type: "string" },
                owner: { type: "string" },
                private: { type: "boolean" },
                template_owner: { required: true, type: "string" },
                template_repo: { required: true, type: "string" }
            },
            url: "/repos/:template_owner/:template_repo/generate"
        },
        declineInvitation: {
            method: "DELETE",
            params: { invitation_id: { required: true, type: "integer" } },
            url: "/user/repository_invitations/:invitation_id"
        },
        delete: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo"
        },
        deleteCommitComment: {
            method: "DELETE",
            params: {
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/comments/:comment_id"
        },
        deleteDownload: {
            method: "DELETE",
            params: {
                download_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/downloads/:download_id"
        },
        deleteFile: {
            method: "DELETE",
            params: {
                author: { type: "object" },
                "author.email": { type: "string" },
                "author.name": { type: "string" },
                branch: { type: "string" },
                committer: { type: "object" },
                "committer.email": { type: "string" },
                "committer.name": { type: "string" },
                message: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/contents/:path"
        },
        deleteHook: {
            method: "DELETE",
            params: {
                hook_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks/:hook_id"
        },
        deleteInvitation: {
            method: "DELETE",
            params: {
                invitation_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/invitations/:invitation_id"
        },
        deleteRelease: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                release_id: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/:release_id"
        },
        deleteReleaseAsset: {
            method: "DELETE",
            params: {
                asset_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/assets/:asset_id"
        },
        disableAutomatedSecurityFixes: {
            headers: { accept: "application/vnd.github.london-preview+json" },
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/automated-security-fixes"
        },
        disablePagesSite: {
            headers: { accept: "application/vnd.github.switcheroo-preview+json" },
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pages"
        },
        disableVulnerabilityAlerts: {
            headers: { accept: "application/vnd.github.dorian-preview+json" },
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/vulnerability-alerts"
        },
        enableAutomatedSecurityFixes: {
            headers: { accept: "application/vnd.github.london-preview+json" },
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/automated-security-fixes"
        },
        enablePagesSite: {
            headers: { accept: "application/vnd.github.switcheroo-preview+json" },
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                source: { type: "object" },
                "source.branch": { enum: ["master", "gh-pages"], type: "string" },
                "source.path": { type: "string" }
            },
            url: "/repos/:owner/:repo/pages"
        },
        enableVulnerabilityAlerts: {
            headers: { accept: "application/vnd.github.dorian-preview+json" },
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/vulnerability-alerts"
        },
        get: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo"
        },
        getAppsWithAccessToProtectedBranch: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/apps"
        },
        getArchiveLink: {
            method: "GET",
            params: {
                archive_format: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/:archive_format/:ref"
        },
        getBranch: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch"
        },
        getBranchProtection: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection"
        },
        getClones: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                per: { enum: ["day", "week"], type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/traffic/clones"
        },
        getCodeFrequencyStats: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/stats/code_frequency"
        },
        getCollaboratorPermissionLevel: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/collaborators/:username/permission"
        },
        getCombinedStatusForRef: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:ref/status"
        },
        getCommit: {
            method: "GET",
            params: {
                commit_sha: { alias: "ref", deprecated: true, type: "string" },
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { alias: "ref", deprecated: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:ref"
        },
        getCommitActivityStats: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/stats/commit_activity"
        },
        getCommitComment: {
            method: "GET",
            params: {
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/comments/:comment_id"
        },
        getCommitRefSha: {
            deprecated: "octokit.repos.getCommitRefSha() is deprecated, see https://developer.github.com/v3/repos/commits/#get-a-single-commit",
            headers: { accept: "application/vnd.github.v3.sha" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:ref"
        },
        getContents: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                ref: { type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/contents/:path"
        },
        getContributorsStats: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/stats/contributors"
        },
        getDeployKey: {
            method: "GET",
            params: {
                key_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/keys/:key_id"
        },
        getDeployment: {
            method: "GET",
            params: {
                deployment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/deployments/:deployment_id"
        },
        getDeploymentStatus: {
            method: "GET",
            params: {
                deployment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                status_id: { required: true, type: "integer" }
            },
            url: "/repos/:owner/:repo/deployments/:deployment_id/statuses/:status_id"
        },
        getDownload: {
            method: "GET",
            params: {
                download_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/downloads/:download_id"
        },
        getHook: {
            method: "GET",
            params: {
                hook_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks/:hook_id"
        },
        getLatestPagesBuild: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pages/builds/latest"
        },
        getLatestRelease: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/latest"
        },
        getPages: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pages"
        },
        getPagesBuild: {
            method: "GET",
            params: {
                build_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pages/builds/:build_id"
        },
        getParticipationStats: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/stats/participation"
        },
        getProtectedBranchAdminEnforcement: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/enforce_admins"
        },
        getProtectedBranchPullRequestReviewEnforcement: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_pull_request_reviews"
        },
        getProtectedBranchRequiredSignatures: {
            headers: { accept: "application/vnd.github.zzzax-preview+json" },
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_signatures"
        },
        getProtectedBranchRequiredStatusChecks: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks"
        },
        getProtectedBranchRestrictions: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions"
        },
        getPunchCardStats: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/stats/punch_card"
        },
        getReadme: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                ref: { type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/readme"
        },
        getRelease: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                release_id: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/:release_id"
        },
        getReleaseAsset: {
            method: "GET",
            params: {
                asset_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/assets/:asset_id"
        },
        getReleaseByTag: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                tag: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/tags/:tag"
        },
        getTeamsWithAccessToProtectedBranch: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
        },
        getTopPaths: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/traffic/popular/paths"
        },
        getTopReferrers: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/traffic/popular/referrers"
        },
        getUsersWithAccessToProtectedBranch: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
        },
        getViews: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                per: { enum: ["day", "week"], type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/traffic/views"
        },
        list: {
            method: "GET",
            params: {
                affiliation: { type: "string" },
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                sort: {
                    enum: ["created", "updated", "pushed", "full_name"],
                    type: "string"
                },
                type: {
                    enum: ["all", "owner", "public", "private", "member"],
                    type: "string"
                },
                visibility: { enum: ["all", "public", "private"], type: "string" }
            },
            url: "/user/repos"
        },
        listAppsWithAccessToProtectedBranch: {
            deprecated: "octokit.repos.listAppsWithAccessToProtectedBranch() has been renamed to octokit.repos.getAppsWithAccessToProtectedBranch() (2019-09-13)",
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/apps"
        },
        listAssetsForRelease: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                release_id: { required: true, type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/:release_id/assets"
        },
        listBranches: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                protected: { type: "boolean" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches"
        },
        listBranchesForHeadCommit: {
            headers: { accept: "application/vnd.github.groot-preview+json" },
            method: "GET",
            params: {
                commit_sha: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:commit_sha/branches-where-head"
        },
        listCollaborators: {
            method: "GET",
            params: {
                affiliation: { enum: ["outside", "direct", "all"], type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/collaborators"
        },
        listCommentsForCommit: {
            method: "GET",
            params: {
                commit_sha: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                ref: { alias: "commit_sha", deprecated: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:commit_sha/comments"
        },
        listCommitComments: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/comments"
        },
        listCommits: {
            method: "GET",
            params: {
                author: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                path: { type: "string" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                sha: { type: "string" },
                since: { type: "string" },
                until: { type: "string" }
            },
            url: "/repos/:owner/:repo/commits"
        },
        listContributors: {
            method: "GET",
            params: {
                anon: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/contributors"
        },
        listDeployKeys: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/keys"
        },
        listDeploymentStatuses: {
            method: "GET",
            params: {
                deployment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/deployments/:deployment_id/statuses"
        },
        listDeployments: {
            method: "GET",
            params: {
                environment: { type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                ref: { type: "string" },
                repo: { required: true, type: "string" },
                sha: { type: "string" },
                task: { type: "string" }
            },
            url: "/repos/:owner/:repo/deployments"
        },
        listDownloads: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/downloads"
        },
        listForOrg: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                sort: {
                    enum: ["created", "updated", "pushed", "full_name"],
                    type: "string"
                },
                type: {
                    enum: [
                        "all",
                        "public",
                        "private",
                        "forks",
                        "sources",
                        "member",
                        "internal"
                    ],
                    type: "string"
                }
            },
            url: "/orgs/:org/repos"
        },
        listForUser: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                sort: {
                    enum: ["created", "updated", "pushed", "full_name"],
                    type: "string"
                },
                type: { enum: ["all", "owner", "member"], type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/repos"
        },
        listForks: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" },
                sort: { enum: ["newest", "oldest", "stargazers"], type: "string" }
            },
            url: "/repos/:owner/:repo/forks"
        },
        listHooks: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks"
        },
        listInvitations: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/invitations"
        },
        listInvitationsForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/repository_invitations"
        },
        listLanguages: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/languages"
        },
        listPagesBuilds: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pages/builds"
        },
        listProtectedBranchRequiredStatusChecksContexts: {
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
        },
        listProtectedBranchTeamRestrictions: {
            deprecated: "octokit.repos.listProtectedBranchTeamRestrictions() has been renamed to octokit.repos.getTeamsWithAccessToProtectedBranch() (2019-09-09)",
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
        },
        listProtectedBranchUserRestrictions: {
            deprecated: "octokit.repos.listProtectedBranchUserRestrictions() has been renamed to octokit.repos.getUsersWithAccessToProtectedBranch() (2019-09-09)",
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
        },
        listPublic: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "integer" }
            },
            url: "/repositories"
        },
        listPullRequestsAssociatedWithCommit: {
            headers: { accept: "application/vnd.github.groot-preview+json" },
            method: "GET",
            params: {
                commit_sha: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:commit_sha/pulls"
        },
        listReleases: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases"
        },
        listStatusesForRef: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                ref: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/commits/:ref/statuses"
        },
        listTags: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/tags"
        },
        listTeams: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/teams"
        },
        listTeamsWithAccessToProtectedBranch: {
            deprecated: "octokit.repos.listTeamsWithAccessToProtectedBranch() has been renamed to octokit.repos.getTeamsWithAccessToProtectedBranch() (2019-09-13)",
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
        },
        listTopics: {
            headers: { accept: "application/vnd.github.mercy-preview+json" },
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/topics"
        },
        listUsersWithAccessToProtectedBranch: {
            deprecated: "octokit.repos.listUsersWithAccessToProtectedBranch() has been renamed to octokit.repos.getUsersWithAccessToProtectedBranch() (2019-09-13)",
            method: "GET",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
        },
        merge: {
            method: "POST",
            params: {
                base: { required: true, type: "string" },
                commit_message: { type: "string" },
                head: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/merges"
        },
        pingHook: {
            method: "POST",
            params: {
                hook_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks/:hook_id/pings"
        },
        removeBranchProtection: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection"
        },
        removeCollaborator: {
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/collaborators/:username"
        },
        removeDeployKey: {
            method: "DELETE",
            params: {
                key_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/keys/:key_id"
        },
        removeProtectedBranchAdminEnforcement: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/enforce_admins"
        },
        removeProtectedBranchAppRestrictions: {
            method: "DELETE",
            params: {
                apps: { mapTo: "data", required: true, type: "string[]" },
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/apps"
        },
        removeProtectedBranchPullRequestReviewEnforcement: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_pull_request_reviews"
        },
        removeProtectedBranchRequiredSignatures: {
            headers: { accept: "application/vnd.github.zzzax-preview+json" },
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_signatures"
        },
        removeProtectedBranchRequiredStatusChecks: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks"
        },
        removeProtectedBranchRequiredStatusChecksContexts: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                contexts: { mapTo: "data", required: true, type: "string[]" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
        },
        removeProtectedBranchRestrictions: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions"
        },
        removeProtectedBranchTeamRestrictions: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                teams: { mapTo: "data", required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
        },
        removeProtectedBranchUserRestrictions: {
            method: "DELETE",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                users: { mapTo: "data", required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
        },
        replaceProtectedBranchAppRestrictions: {
            method: "PUT",
            params: {
                apps: { mapTo: "data", required: true, type: "string[]" },
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/apps"
        },
        replaceProtectedBranchRequiredStatusChecksContexts: {
            method: "PUT",
            params: {
                branch: { required: true, type: "string" },
                contexts: { mapTo: "data", required: true, type: "string[]" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks/contexts"
        },
        replaceProtectedBranchTeamRestrictions: {
            method: "PUT",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                teams: { mapTo: "data", required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/teams"
        },
        replaceProtectedBranchUserRestrictions: {
            method: "PUT",
            params: {
                branch: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                users: { mapTo: "data", required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/restrictions/users"
        },
        replaceTopics: {
            headers: { accept: "application/vnd.github.mercy-preview+json" },
            method: "PUT",
            params: {
                names: { required: true, type: "string[]" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/topics"
        },
        requestPageBuild: {
            method: "POST",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/pages/builds"
        },
        retrieveCommunityProfileMetrics: {
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/community/profile"
        },
        testPushHook: {
            method: "POST",
            params: {
                hook_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks/:hook_id/tests"
        },
        transfer: {
            method: "POST",
            params: {
                new_owner: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_ids: { type: "integer[]" }
            },
            url: "/repos/:owner/:repo/transfer"
        },
        update: {
            method: "PATCH",
            params: {
                allow_merge_commit: { type: "boolean" },
                allow_rebase_merge: { type: "boolean" },
                allow_squash_merge: { type: "boolean" },
                archived: { type: "boolean" },
                default_branch: { type: "string" },
                delete_branch_on_merge: { type: "boolean" },
                description: { type: "string" },
                has_issues: { type: "boolean" },
                has_projects: { type: "boolean" },
                has_wiki: { type: "boolean" },
                homepage: { type: "string" },
                is_template: { type: "boolean" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                private: { type: "boolean" },
                repo: { required: true, type: "string" },
                visibility: {
                    enum: ["public", "private", "visibility", "internal"],
                    type: "string"
                }
            },
            url: "/repos/:owner/:repo"
        },
        updateBranchProtection: {
            method: "PUT",
            params: {
                allow_deletions: { type: "boolean" },
                allow_force_pushes: { allowNull: true, type: "boolean" },
                branch: { required: true, type: "string" },
                enforce_admins: { allowNull: true, required: true, type: "boolean" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                required_linear_history: { type: "boolean" },
                required_pull_request_reviews: {
                    allowNull: true,
                    required: true,
                    type: "object"
                },
                "required_pull_request_reviews.dismiss_stale_reviews": {
                    type: "boolean"
                },
                "required_pull_request_reviews.dismissal_restrictions": {
                    type: "object"
                },
                "required_pull_request_reviews.dismissal_restrictions.teams": {
                    type: "string[]"
                },
                "required_pull_request_reviews.dismissal_restrictions.users": {
                    type: "string[]"
                },
                "required_pull_request_reviews.require_code_owner_reviews": {
                    type: "boolean"
                },
                "required_pull_request_reviews.required_approving_review_count": {
                    type: "integer"
                },
                required_status_checks: {
                    allowNull: true,
                    required: true,
                    type: "object"
                },
                "required_status_checks.contexts": { required: true, type: "string[]" },
                "required_status_checks.strict": { required: true, type: "boolean" },
                restrictions: { allowNull: true, required: true, type: "object" },
                "restrictions.apps": { type: "string[]" },
                "restrictions.teams": { required: true, type: "string[]" },
                "restrictions.users": { required: true, type: "string[]" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection"
        },
        updateCommitComment: {
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/comments/:comment_id"
        },
        updateFile: {
            deprecated: "octokit.repos.updateFile() has been renamed to octokit.repos.createOrUpdateFile() (2019-06-07)",
            method: "PUT",
            params: {
                author: { type: "object" },
                "author.email": { required: true, type: "string" },
                "author.name": { required: true, type: "string" },
                branch: { type: "string" },
                committer: { type: "object" },
                "committer.email": { required: true, type: "string" },
                "committer.name": { required: true, type: "string" },
                content: { required: true, type: "string" },
                message: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                path: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                sha: { type: "string" }
            },
            url: "/repos/:owner/:repo/contents/:path"
        },
        updateHook: {
            method: "PATCH",
            params: {
                active: { type: "boolean" },
                add_events: { type: "string[]" },
                config: { type: "object" },
                "config.content_type": { type: "string" },
                "config.insecure_ssl": { type: "string" },
                "config.secret": { type: "string" },
                "config.url": { required: true, type: "string" },
                events: { type: "string[]" },
                hook_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                remove_events: { type: "string[]" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/hooks/:hook_id"
        },
        updateInformationAboutPagesSite: {
            method: "PUT",
            params: {
                cname: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                source: {
                    enum: ['"gh-pages"', '"master"', '"master /docs"'],
                    type: "string"
                }
            },
            url: "/repos/:owner/:repo/pages"
        },
        updateInvitation: {
            method: "PATCH",
            params: {
                invitation_id: { required: true, type: "integer" },
                owner: { required: true, type: "string" },
                permissions: { enum: ["read", "write", "admin"], type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/invitations/:invitation_id"
        },
        updateProtectedBranchPullRequestReviewEnforcement: {
            method: "PATCH",
            params: {
                branch: { required: true, type: "string" },
                dismiss_stale_reviews: { type: "boolean" },
                dismissal_restrictions: { type: "object" },
                "dismissal_restrictions.teams": { type: "string[]" },
                "dismissal_restrictions.users": { type: "string[]" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                require_code_owner_reviews: { type: "boolean" },
                required_approving_review_count: { type: "integer" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_pull_request_reviews"
        },
        updateProtectedBranchRequiredStatusChecks: {
            method: "PATCH",
            params: {
                branch: { required: true, type: "string" },
                contexts: { type: "string[]" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                strict: { type: "boolean" }
            },
            url: "/repos/:owner/:repo/branches/:branch/protection/required_status_checks"
        },
        updateRelease: {
            method: "PATCH",
            params: {
                body: { type: "string" },
                draft: { type: "boolean" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                prerelease: { type: "boolean" },
                release_id: { required: true, type: "integer" },
                repo: { required: true, type: "string" },
                tag_name: { type: "string" },
                target_commitish: { type: "string" }
            },
            url: "/repos/:owner/:repo/releases/:release_id"
        },
        updateReleaseAsset: {
            method: "PATCH",
            params: {
                asset_id: { required: true, type: "integer" },
                label: { type: "string" },
                name: { type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" }
            },
            url: "/repos/:owner/:repo/releases/assets/:asset_id"
        },
        uploadReleaseAsset: {
            method: "POST",
            params: {
                data: { mapTo: "data", required: true, type: "string | object" },
                file: { alias: "data", deprecated: true, type: "string | object" },
                headers: { required: true, type: "object" },
                "headers.content-length": { required: true, type: "integer" },
                "headers.content-type": { required: true, type: "string" },
                label: { type: "string" },
                name: { required: true, type: "string" },
                url: { required: true, type: "string" }
            },
            url: ":url"
        }
    },
    search: {
        code: {
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                q: { required: true, type: "string" },
                sort: { enum: ["indexed"], type: "string" }
            },
            url: "/search/code"
        },
        commits: {
            headers: { accept: "application/vnd.github.cloak-preview+json" },
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                q: { required: true, type: "string" },
                sort: { enum: ["author-date", "committer-date"], type: "string" }
            },
            url: "/search/commits"
        },
        issues: {
            deprecated: "octokit.search.issues() has been renamed to octokit.search.issuesAndPullRequests() (2018-12-27)",
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                q: { required: true, type: "string" },
                sort: {
                    enum: [
                        "comments",
                        "reactions",
                        "reactions-+1",
                        "reactions--1",
                        "reactions-smile",
                        "reactions-thinking_face",
                        "reactions-heart",
                        "reactions-tada",
                        "interactions",
                        "created",
                        "updated"
                    ],
                    type: "string"
                }
            },
            url: "/search/issues"
        },
        issuesAndPullRequests: {
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                q: { required: true, type: "string" },
                sort: {
                    enum: [
                        "comments",
                        "reactions",
                        "reactions-+1",
                        "reactions--1",
                        "reactions-smile",
                        "reactions-thinking_face",
                        "reactions-heart",
                        "reactions-tada",
                        "interactions",
                        "created",
                        "updated"
                    ],
                    type: "string"
                }
            },
            url: "/search/issues"
        },
        labels: {
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                q: { required: true, type: "string" },
                repository_id: { required: true, type: "integer" },
                sort: { enum: ["created", "updated"], type: "string" }
            },
            url: "/search/labels"
        },
        repos: {
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                q: { required: true, type: "string" },
                sort: {
                    enum: ["stars", "forks", "help-wanted-issues", "updated"],
                    type: "string"
                }
            },
            url: "/search/repositories"
        },
        topics: {
            method: "GET",
            params: { q: { required: true, type: "string" } },
            url: "/search/topics"
        },
        users: {
            method: "GET",
            params: {
                order: { enum: ["desc", "asc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                q: { required: true, type: "string" },
                sort: { enum: ["followers", "repositories", "joined"], type: "string" }
            },
            url: "/search/users"
        }
    },
    teams: {
        addMember: {
            deprecated: "octokit.teams.addMember() has been renamed to octokit.teams.addMemberLegacy() (2020-01-16)",
            method: "PUT",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/members/:username"
        },
        addMemberLegacy: {
            deprecated: "octokit.teams.addMemberLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#add-team-member-legacy",
            method: "PUT",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/members/:username"
        },
        addOrUpdateMembership: {
            deprecated: "octokit.teams.addOrUpdateMembership() has been renamed to octokit.teams.addOrUpdateMembershipLegacy() (2020-01-16)",
            method: "PUT",
            params: {
                role: { enum: ["member", "maintainer"], type: "string" },
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/memberships/:username"
        },
        addOrUpdateMembershipInOrg: {
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                role: { enum: ["member", "maintainer"], type: "string" },
                team_slug: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/memberships/:username"
        },
        addOrUpdateMembershipLegacy: {
            deprecated: "octokit.teams.addOrUpdateMembershipLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#add-or-update-team-membership-legacy",
            method: "PUT",
            params: {
                role: { enum: ["member", "maintainer"], type: "string" },
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/memberships/:username"
        },
        addOrUpdateProject: {
            deprecated: "octokit.teams.addOrUpdateProject() has been renamed to octokit.teams.addOrUpdateProjectLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PUT",
            params: {
                permission: { enum: ["read", "write", "admin"], type: "string" },
                project_id: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects/:project_id"
        },
        addOrUpdateProjectInOrg: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                permission: { enum: ["read", "write", "admin"], type: "string" },
                project_id: { required: true, type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/projects/:project_id"
        },
        addOrUpdateProjectLegacy: {
            deprecated: "octokit.teams.addOrUpdateProjectLegacy() is deprecated, see https://developer.github.com/v3/teams/#add-or-update-team-project-legacy",
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "PUT",
            params: {
                permission: { enum: ["read", "write", "admin"], type: "string" },
                project_id: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects/:project_id"
        },
        addOrUpdateRepo: {
            deprecated: "octokit.teams.addOrUpdateRepo() has been renamed to octokit.teams.addOrUpdateRepoLegacy() (2020-01-16)",
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                repo: { required: true, type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos/:owner/:repo"
        },
        addOrUpdateRepoInOrg: {
            method: "PUT",
            params: {
                org: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                repo: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/repos/:owner/:repo"
        },
        addOrUpdateRepoLegacy: {
            deprecated: "octokit.teams.addOrUpdateRepoLegacy() is deprecated, see https://developer.github.com/v3/teams/#add-or-update-team-repository-legacy",
            method: "PUT",
            params: {
                owner: { required: true, type: "string" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                repo: { required: true, type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos/:owner/:repo"
        },
        checkManagesRepo: {
            deprecated: "octokit.teams.checkManagesRepo() has been renamed to octokit.teams.checkManagesRepoLegacy() (2020-01-16)",
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos/:owner/:repo"
        },
        checkManagesRepoInOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/repos/:owner/:repo"
        },
        checkManagesRepoLegacy: {
            deprecated: "octokit.teams.checkManagesRepoLegacy() is deprecated, see https://developer.github.com/v3/teams/#check-if-a-team-manages-a-repository-legacy",
            method: "GET",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos/:owner/:repo"
        },
        create: {
            method: "POST",
            params: {
                description: { type: "string" },
                maintainers: { type: "string[]" },
                name: { required: true, type: "string" },
                org: { required: true, type: "string" },
                parent_team_id: { type: "integer" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                privacy: { enum: ["secret", "closed"], type: "string" },
                repo_names: { type: "string[]" }
            },
            url: "/orgs/:org/teams"
        },
        createDiscussion: {
            deprecated: "octokit.teams.createDiscussion() has been renamed to octokit.teams.createDiscussionLegacy() (2020-01-16)",
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                private: { type: "boolean" },
                team_id: { required: true, type: "integer" },
                title: { required: true, type: "string" }
            },
            url: "/teams/:team_id/discussions"
        },
        createDiscussionComment: {
            deprecated: "octokit.teams.createDiscussionComment() has been renamed to octokit.teams.createDiscussionCommentLegacy() (2020-01-16)",
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments"
        },
        createDiscussionCommentInOrg: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments"
        },
        createDiscussionCommentLegacy: {
            deprecated: "octokit.teams.createDiscussionCommentLegacy() is deprecated, see https://developer.github.com/v3/teams/discussion_comments/#create-a-comment-legacy",
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments"
        },
        createDiscussionInOrg: {
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                org: { required: true, type: "string" },
                private: { type: "boolean" },
                team_slug: { required: true, type: "string" },
                title: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions"
        },
        createDiscussionLegacy: {
            deprecated: "octokit.teams.createDiscussionLegacy() is deprecated, see https://developer.github.com/v3/teams/discussions/#create-a-discussion-legacy",
            method: "POST",
            params: {
                body: { required: true, type: "string" },
                private: { type: "boolean" },
                team_id: { required: true, type: "integer" },
                title: { required: true, type: "string" }
            },
            url: "/teams/:team_id/discussions"
        },
        delete: {
            deprecated: "octokit.teams.delete() has been renamed to octokit.teams.deleteLegacy() (2020-01-16)",
            method: "DELETE",
            params: { team_id: { required: true, type: "integer" } },
            url: "/teams/:team_id"
        },
        deleteDiscussion: {
            deprecated: "octokit.teams.deleteDiscussion() has been renamed to octokit.teams.deleteDiscussionLegacy() (2020-01-16)",
            method: "DELETE",
            params: {
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number"
        },
        deleteDiscussionComment: {
            deprecated: "octokit.teams.deleteDiscussionComment() has been renamed to octokit.teams.deleteDiscussionCommentLegacy() (2020-01-16)",
            method: "DELETE",
            params: {
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
        },
        deleteDiscussionCommentInOrg: {
            method: "DELETE",
            params: {
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments/:comment_number"
        },
        deleteDiscussionCommentLegacy: {
            deprecated: "octokit.teams.deleteDiscussionCommentLegacy() is deprecated, see https://developer.github.com/v3/teams/discussion_comments/#delete-a-comment-legacy",
            method: "DELETE",
            params: {
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
        },
        deleteDiscussionInOrg: {
            method: "DELETE",
            params: {
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number"
        },
        deleteDiscussionLegacy: {
            deprecated: "octokit.teams.deleteDiscussionLegacy() is deprecated, see https://developer.github.com/v3/teams/discussions/#delete-a-discussion-legacy",
            method: "DELETE",
            params: {
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number"
        },
        deleteInOrg: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug"
        },
        deleteLegacy: {
            deprecated: "octokit.teams.deleteLegacy() is deprecated, see https://developer.github.com/v3/teams/#delete-team-legacy",
            method: "DELETE",
            params: { team_id: { required: true, type: "integer" } },
            url: "/teams/:team_id"
        },
        get: {
            deprecated: "octokit.teams.get() has been renamed to octokit.teams.getLegacy() (2020-01-16)",
            method: "GET",
            params: { team_id: { required: true, type: "integer" } },
            url: "/teams/:team_id"
        },
        getByName: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug"
        },
        getDiscussion: {
            deprecated: "octokit.teams.getDiscussion() has been renamed to octokit.teams.getDiscussionLegacy() (2020-01-16)",
            method: "GET",
            params: {
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number"
        },
        getDiscussionComment: {
            deprecated: "octokit.teams.getDiscussionComment() has been renamed to octokit.teams.getDiscussionCommentLegacy() (2020-01-16)",
            method: "GET",
            params: {
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
        },
        getDiscussionCommentInOrg: {
            method: "GET",
            params: {
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments/:comment_number"
        },
        getDiscussionCommentLegacy: {
            deprecated: "octokit.teams.getDiscussionCommentLegacy() is deprecated, see https://developer.github.com/v3/teams/discussion_comments/#get-a-single-comment-legacy",
            method: "GET",
            params: {
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
        },
        getDiscussionInOrg: {
            method: "GET",
            params: {
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number"
        },
        getDiscussionLegacy: {
            deprecated: "octokit.teams.getDiscussionLegacy() is deprecated, see https://developer.github.com/v3/teams/discussions/#get-a-single-discussion-legacy",
            method: "GET",
            params: {
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number"
        },
        getLegacy: {
            deprecated: "octokit.teams.getLegacy() is deprecated, see https://developer.github.com/v3/teams/#get-team-legacy",
            method: "GET",
            params: { team_id: { required: true, type: "integer" } },
            url: "/teams/:team_id"
        },
        getMember: {
            deprecated: "octokit.teams.getMember() has been renamed to octokit.teams.getMemberLegacy() (2020-01-16)",
            method: "GET",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/members/:username"
        },
        getMemberLegacy: {
            deprecated: "octokit.teams.getMemberLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#get-team-member-legacy",
            method: "GET",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/members/:username"
        },
        getMembership: {
            deprecated: "octokit.teams.getMembership() has been renamed to octokit.teams.getMembershipLegacy() (2020-01-16)",
            method: "GET",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/memberships/:username"
        },
        getMembershipInOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/memberships/:username"
        },
        getMembershipLegacy: {
            deprecated: "octokit.teams.getMembershipLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#get-team-membership-legacy",
            method: "GET",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/memberships/:username"
        },
        list: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" }
            },
            url: "/orgs/:org/teams"
        },
        listChild: {
            deprecated: "octokit.teams.listChild() has been renamed to octokit.teams.listChildLegacy() (2020-01-16)",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/teams"
        },
        listChildInOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/teams"
        },
        listChildLegacy: {
            deprecated: "octokit.teams.listChildLegacy() is deprecated, see https://developer.github.com/v3/teams/#list-child-teams-legacy",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/teams"
        },
        listDiscussionComments: {
            deprecated: "octokit.teams.listDiscussionComments() has been renamed to octokit.teams.listDiscussionCommentsLegacy() (2020-01-16)",
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                discussion_number: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments"
        },
        listDiscussionCommentsInOrg: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments"
        },
        listDiscussionCommentsLegacy: {
            deprecated: "octokit.teams.listDiscussionCommentsLegacy() is deprecated, see https://developer.github.com/v3/teams/discussion_comments/#list-comments-legacy",
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                discussion_number: { required: true, type: "integer" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments"
        },
        listDiscussions: {
            deprecated: "octokit.teams.listDiscussions() has been renamed to octokit.teams.listDiscussionsLegacy() (2020-01-16)",
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions"
        },
        listDiscussionsInOrg: {
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions"
        },
        listDiscussionsLegacy: {
            deprecated: "octokit.teams.listDiscussionsLegacy() is deprecated, see https://developer.github.com/v3/teams/discussions/#list-discussions-legacy",
            method: "GET",
            params: {
                direction: { enum: ["asc", "desc"], type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions"
        },
        listForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/teams"
        },
        listMembers: {
            deprecated: "octokit.teams.listMembers() has been renamed to octokit.teams.listMembersLegacy() (2020-01-16)",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                role: { enum: ["member", "maintainer", "all"], type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/members"
        },
        listMembersInOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                role: { enum: ["member", "maintainer", "all"], type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/members"
        },
        listMembersLegacy: {
            deprecated: "octokit.teams.listMembersLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#list-team-members-legacy",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                role: { enum: ["member", "maintainer", "all"], type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/members"
        },
        listPendingInvitations: {
            deprecated: "octokit.teams.listPendingInvitations() has been renamed to octokit.teams.listPendingInvitationsLegacy() (2020-01-16)",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/invitations"
        },
        listPendingInvitationsInOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/invitations"
        },
        listPendingInvitationsLegacy: {
            deprecated: "octokit.teams.listPendingInvitationsLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#list-pending-team-invitations-legacy",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/invitations"
        },
        listProjects: {
            deprecated: "octokit.teams.listProjects() has been renamed to octokit.teams.listProjectsLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects"
        },
        listProjectsInOrg: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/projects"
        },
        listProjectsLegacy: {
            deprecated: "octokit.teams.listProjectsLegacy() is deprecated, see https://developer.github.com/v3/teams/#list-team-projects-legacy",
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects"
        },
        listRepos: {
            deprecated: "octokit.teams.listRepos() has been renamed to octokit.teams.listReposLegacy() (2020-01-16)",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos"
        },
        listReposInOrg: {
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/repos"
        },
        listReposLegacy: {
            deprecated: "octokit.teams.listReposLegacy() is deprecated, see https://developer.github.com/v3/teams/#list-team-repos-legacy",
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos"
        },
        removeMember: {
            deprecated: "octokit.teams.removeMember() has been renamed to octokit.teams.removeMemberLegacy() (2020-01-16)",
            method: "DELETE",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/members/:username"
        },
        removeMemberLegacy: {
            deprecated: "octokit.teams.removeMemberLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#remove-team-member-legacy",
            method: "DELETE",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/members/:username"
        },
        removeMembership: {
            deprecated: "octokit.teams.removeMembership() has been renamed to octokit.teams.removeMembershipLegacy() (2020-01-16)",
            method: "DELETE",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/memberships/:username"
        },
        removeMembershipInOrg: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/memberships/:username"
        },
        removeMembershipLegacy: {
            deprecated: "octokit.teams.removeMembershipLegacy() is deprecated, see https://developer.github.com/v3/teams/members/#remove-team-membership-legacy",
            method: "DELETE",
            params: {
                team_id: { required: true, type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/teams/:team_id/memberships/:username"
        },
        removeProject: {
            deprecated: "octokit.teams.removeProject() has been renamed to octokit.teams.removeProjectLegacy() (2020-01-16)",
            method: "DELETE",
            params: {
                project_id: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects/:project_id"
        },
        removeProjectInOrg: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                project_id: { required: true, type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/projects/:project_id"
        },
        removeProjectLegacy: {
            deprecated: "octokit.teams.removeProjectLegacy() is deprecated, see https://developer.github.com/v3/teams/#remove-team-project-legacy",
            method: "DELETE",
            params: {
                project_id: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects/:project_id"
        },
        removeRepo: {
            deprecated: "octokit.teams.removeRepo() has been renamed to octokit.teams.removeRepoLegacy() (2020-01-16)",
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos/:owner/:repo"
        },
        removeRepoInOrg: {
            method: "DELETE",
            params: {
                org: { required: true, type: "string" },
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/repos/:owner/:repo"
        },
        removeRepoLegacy: {
            deprecated: "octokit.teams.removeRepoLegacy() is deprecated, see https://developer.github.com/v3/teams/#remove-team-repository-legacy",
            method: "DELETE",
            params: {
                owner: { required: true, type: "string" },
                repo: { required: true, type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/repos/:owner/:repo"
        },
        reviewProject: {
            deprecated: "octokit.teams.reviewProject() has been renamed to octokit.teams.reviewProjectLegacy() (2020-01-16)",
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                project_id: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects/:project_id"
        },
        reviewProjectInOrg: {
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                org: { required: true, type: "string" },
                project_id: { required: true, type: "integer" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/projects/:project_id"
        },
        reviewProjectLegacy: {
            deprecated: "octokit.teams.reviewProjectLegacy() is deprecated, see https://developer.github.com/v3/teams/#review-a-team-project-legacy",
            headers: { accept: "application/vnd.github.inertia-preview+json" },
            method: "GET",
            params: {
                project_id: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/projects/:project_id"
        },
        update: {
            deprecated: "octokit.teams.update() has been renamed to octokit.teams.updateLegacy() (2020-01-16)",
            method: "PATCH",
            params: {
                description: { type: "string" },
                name: { required: true, type: "string" },
                parent_team_id: { type: "integer" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                privacy: { enum: ["secret", "closed"], type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id"
        },
        updateDiscussion: {
            deprecated: "octokit.teams.updateDiscussion() has been renamed to octokit.teams.updateDiscussionLegacy() (2020-01-16)",
            method: "PATCH",
            params: {
                body: { type: "string" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" },
                title: { type: "string" }
            },
            url: "/teams/:team_id/discussions/:discussion_number"
        },
        updateDiscussionComment: {
            deprecated: "octokit.teams.updateDiscussionComment() has been renamed to octokit.teams.updateDiscussionCommentLegacy() (2020-01-16)",
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
        },
        updateDiscussionCommentInOrg: {
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number/comments/:comment_number"
        },
        updateDiscussionCommentLegacy: {
            deprecated: "octokit.teams.updateDiscussionCommentLegacy() is deprecated, see https://developer.github.com/v3/teams/discussion_comments/#edit-a-comment-legacy",
            method: "PATCH",
            params: {
                body: { required: true, type: "string" },
                comment_number: { required: true, type: "integer" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id/discussions/:discussion_number/comments/:comment_number"
        },
        updateDiscussionInOrg: {
            method: "PATCH",
            params: {
                body: { type: "string" },
                discussion_number: { required: true, type: "integer" },
                org: { required: true, type: "string" },
                team_slug: { required: true, type: "string" },
                title: { type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug/discussions/:discussion_number"
        },
        updateDiscussionLegacy: {
            deprecated: "octokit.teams.updateDiscussionLegacy() is deprecated, see https://developer.github.com/v3/teams/discussions/#edit-a-discussion-legacy",
            method: "PATCH",
            params: {
                body: { type: "string" },
                discussion_number: { required: true, type: "integer" },
                team_id: { required: true, type: "integer" },
                title: { type: "string" }
            },
            url: "/teams/:team_id/discussions/:discussion_number"
        },
        updateInOrg: {
            method: "PATCH",
            params: {
                description: { type: "string" },
                name: { required: true, type: "string" },
                org: { required: true, type: "string" },
                parent_team_id: { type: "integer" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                privacy: { enum: ["secret", "closed"], type: "string" },
                team_slug: { required: true, type: "string" }
            },
            url: "/orgs/:org/teams/:team_slug"
        },
        updateLegacy: {
            deprecated: "octokit.teams.updateLegacy() is deprecated, see https://developer.github.com/v3/teams/#edit-team-legacy",
            method: "PATCH",
            params: {
                description: { type: "string" },
                name: { required: true, type: "string" },
                parent_team_id: { type: "integer" },
                permission: { enum: ["pull", "push", "admin"], type: "string" },
                privacy: { enum: ["secret", "closed"], type: "string" },
                team_id: { required: true, type: "integer" }
            },
            url: "/teams/:team_id"
        }
    },
    users: {
        addEmails: {
            method: "POST",
            params: { emails: { required: true, type: "string[]" } },
            url: "/user/emails"
        },
        block: {
            method: "PUT",
            params: { username: { required: true, type: "string" } },
            url: "/user/blocks/:username"
        },
        checkBlocked: {
            method: "GET",
            params: { username: { required: true, type: "string" } },
            url: "/user/blocks/:username"
        },
        checkFollowing: {
            method: "GET",
            params: { username: { required: true, type: "string" } },
            url: "/user/following/:username"
        },
        checkFollowingForUser: {
            method: "GET",
            params: {
                target_user: { required: true, type: "string" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/following/:target_user"
        },
        createGpgKey: {
            method: "POST",
            params: { armored_public_key: { type: "string" } },
            url: "/user/gpg_keys"
        },
        createPublicKey: {
            method: "POST",
            params: { key: { type: "string" }, title: { type: "string" } },
            url: "/user/keys"
        },
        deleteEmails: {
            method: "DELETE",
            params: { emails: { required: true, type: "string[]" } },
            url: "/user/emails"
        },
        deleteGpgKey: {
            method: "DELETE",
            params: { gpg_key_id: { required: true, type: "integer" } },
            url: "/user/gpg_keys/:gpg_key_id"
        },
        deletePublicKey: {
            method: "DELETE",
            params: { key_id: { required: true, type: "integer" } },
            url: "/user/keys/:key_id"
        },
        follow: {
            method: "PUT",
            params: { username: { required: true, type: "string" } },
            url: "/user/following/:username"
        },
        getAuthenticated: { method: "GET", params: {}, url: "/user" },
        getByUsername: {
            method: "GET",
            params: { username: { required: true, type: "string" } },
            url: "/users/:username"
        },
        getContextForUser: {
            method: "GET",
            params: {
                subject_id: { type: "string" },
                subject_type: {
                    enum: ["organization", "repository", "issue", "pull_request"],
                    type: "string"
                },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/hovercard"
        },
        getGpgKey: {
            method: "GET",
            params: { gpg_key_id: { required: true, type: "integer" } },
            url: "/user/gpg_keys/:gpg_key_id"
        },
        getPublicKey: {
            method: "GET",
            params: { key_id: { required: true, type: "integer" } },
            url: "/user/keys/:key_id"
        },
        list: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                since: { type: "string" }
            },
            url: "/users"
        },
        listBlocked: { method: "GET", params: {}, url: "/user/blocks" },
        listEmails: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/emails"
        },
        listFollowersForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/followers"
        },
        listFollowersForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/followers"
        },
        listFollowingForAuthenticatedUser: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/following"
        },
        listFollowingForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/following"
        },
        listGpgKeys: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/gpg_keys"
        },
        listGpgKeysForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/gpg_keys"
        },
        listPublicEmails: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/public_emails"
        },
        listPublicKeys: {
            method: "GET",
            params: { page: { type: "integer" }, per_page: { type: "integer" } },
            url: "/user/keys"
        },
        listPublicKeysForUser: {
            method: "GET",
            params: {
                page: { type: "integer" },
                per_page: { type: "integer" },
                username: { required: true, type: "string" }
            },
            url: "/users/:username/keys"
        },
        togglePrimaryEmailVisibility: {
            method: "PATCH",
            params: {
                email: { required: true, type: "string" },
                visibility: { required: true, type: "string" }
            },
            url: "/user/email/visibility"
        },
        unblock: {
            method: "DELETE",
            params: { username: { required: true, type: "string" } },
            url: "/user/blocks/:username"
        },
        unfollow: {
            method: "DELETE",
            params: { username: { required: true, type: "string" } },
            url: "/user/following/:username"
        },
        updateAuthenticated: {
            method: "PATCH",
            params: {
                bio: { type: "string" },
                blog: { type: "string" },
                company: { type: "string" },
                email: { type: "string" },
                hireable: { type: "boolean" },
                location: { type: "string" },
                name: { type: "string" }
            },
            url: "/user"
        }
    }
};

const VERSION$4 = "2.4.0";

function registerEndpoints(octokit, routes) {
    Object.keys(routes).forEach(namespaceName => {
        if (!octokit[namespaceName]) {
            octokit[namespaceName] = {};
        }
        Object.keys(routes[namespaceName]).forEach(apiName => {
            const apiOptions = routes[namespaceName][apiName];
            const endpointDefaults = ["method", "url", "headers"].reduce((map, key) => {
                if (typeof apiOptions[key] !== "undefined") {
                    map[key] = apiOptions[key];
                }
                return map;
            }, {});
            endpointDefaults.request = {
                validate: apiOptions.params
            };
            let request = octokit.request.defaults(endpointDefaults);
            // patch request & endpoint methods to support deprecated parameters.
            // Not the most elegant solution, but we don’t want to move deprecation
            // logic into octokit/endpoint.js as it’s out of scope
            const hasDeprecatedParam = Object.keys(apiOptions.params || {}).find(key => apiOptions.params[key].deprecated);
            if (hasDeprecatedParam) {
                const patch = patchForDeprecation.bind(null, octokit, apiOptions);
                request = patch(octokit.request.defaults(endpointDefaults), `.${namespaceName}.${apiName}()`);
                request.endpoint = patch(request.endpoint, `.${namespaceName}.${apiName}.endpoint()`);
                request.endpoint.merge = patch(request.endpoint.merge, `.${namespaceName}.${apiName}.endpoint.merge()`);
            }
            if (apiOptions.deprecated) {
                octokit[namespaceName][apiName] = Object.assign(function deprecatedEndpointMethod() {
                    octokit.log.warn(new Deprecation(`[@octokit/rest] ${apiOptions.deprecated}`));
                    octokit[namespaceName][apiName] = request;
                    return request.apply(null, arguments);
                }, request);
                return;
            }
            octokit[namespaceName][apiName] = request;
        });
    });
}
function patchForDeprecation(octokit, apiOptions, method, methodName) {
    const patchedMethod = (options) => {
        options = Object.assign({}, options);
        Object.keys(options).forEach(key => {
            if (apiOptions.params[key] && apiOptions.params[key].deprecated) {
                const aliasKey = apiOptions.params[key].alias;
                octokit.log.warn(new Deprecation(`[@octokit/rest] "${key}" parameter is deprecated for "${methodName}". Use "${aliasKey}" instead`));
                if (!(aliasKey in options)) {
                    options[aliasKey] = options[key];
                }
                delete options[key];
            }
        });
        return method(options);
    };
    Object.keys(method).forEach(key => {
        patchedMethod[key] = method[key];
    });
    return patchedMethod;
}

/**
 * This plugin is a 1:1 copy of internal @octokit/rest plugins. The primary
 * goal is to rebuild @octokit/rest on top of @octokit/core. Once that is
 * done, we will remove the registerEndpoints methods and return the methods
 * directly as with the other plugins. At that point we will also remove the
 * legacy workarounds and deprecations.
 *
 * See the plan at
 * https://github.com/octokit/plugin-rest-endpoint-methods.js/pull/1
 */
function restEndpointMethods(octokit) {
    // @ts-ignore
    octokit.registerEndpoints = registerEndpoints.bind(null, octokit);
    registerEndpoints(octokit, endpointsByScope);
    // Aliasing scopes for backward compatibility
    // See https://github.com/octokit/rest.js/pull/1134
    [
        ["gitdata", "git"],
        ["authorization", "oauthAuthorizations"],
        ["pullRequests", "pulls"]
    ].forEach(([deprecatedScope, scope]) => {
        Object.defineProperty(octokit, deprecatedScope, {
            get() {
                octokit.log.warn(
                // @ts-ignore
                new Deprecation(`[@octokit/plugin-rest-endpoint-methods] "octokit.${deprecatedScope}.*" methods are deprecated, use "octokit.${scope}.*" instead`));
                // @ts-ignore
                return octokit[scope];
            }
        });
    });
    return {};
}
restEndpointMethods.VERSION = VERSION$4;

var distWeb$4 = {
	__proto__: null,
	restEndpointMethods: restEndpointMethods
};

var register_1 = register;

function register (state, name, method, options) {
  if (typeof method !== 'function') {
    throw new Error('method for before hook must be a function')
  }

  if (!options) {
    options = {};
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options)
    }, method)()
  }

  return Promise.resolve()
    .then(function () {
      if (!state.registry[name]) {
        return method(options)
      }

      return (state.registry[name]).reduce(function (method, registered) {
        return registered.hook.bind(null, method, options)
      }, method)()
    })
}

var add = addHook;

function addHook (state, kind, name, hook) {
  var orig = hook;
  if (!state.registry[name]) {
    state.registry[name] = [];
  }

  if (kind === 'before') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options))
    };
  }

  if (kind === 'after') {
    hook = function (method, options) {
      var result;
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_;
          return orig(result, options)
        })
        .then(function () {
          return result
        })
    };
  }

  if (kind === 'error') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options)
        })
    };
  }

  state.registry[name].push({
    hook: hook,
    orig: orig
  });
}

var remove = removeHook;

function removeHook (state, name, method) {
  if (!state.registry[name]) {
    return
  }

  var index = state.registry[name]
    .map(function (registered) { return registered.orig })
    .indexOf(method);

  if (index === -1) {
    return
  }

  state.registry[name].splice(index, 1);
}

// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind;
var bindable = bind.bind(bind);

function bindApi (hook, state, name) {
  var removeHookRef = bindable(remove, null).apply(null, name ? [state, name] : [state]);
  hook.api = { remove: removeHookRef };
  hook.remove = removeHookRef

  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind];
    hook[kind] = hook.api[kind] = bindable(add, null).apply(null, args);
  });
}

function HookSingular () {
  var singularHookName = 'h';
  var singularHookState = {
    registry: {}
  };
  var singularHook = register_1.bind(null, singularHookState, singularHookName);
  bindApi(singularHook, singularHookState, singularHookName);
  return singularHook
}

function HookCollection () {
  var state = {
    registry: {}
  };

  var hook = register_1.bind(null, state);
  bindApi(hook, state);

  return hook
}

var collectionHookDeprecationMessageDisplayed = false;
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4');
    collectionHookDeprecationMessageDisplayed = true;
  }
  return HookCollection()
}

Hook.Singular = HookSingular.bind();
Hook.Collection = HookCollection.bind();

var beforeAfterHook = Hook;
// expose constructors as a named property for TypeScript
var Hook_1 = Hook;
var Singular = Hook.Singular;
var Collection = Hook.Collection;
beforeAfterHook.Hook = Hook_1;
beforeAfterHook.Singular = Singular;
beforeAfterHook.Collection = Collection;

function getUserAgent$1() {
    try {
        return navigator.userAgent;
    }
    catch (e) {
        return "<environment unknown>";
    }
}

var distWeb$5 = {
	__proto__: null,
	getUserAgent: getUserAgent$1
};

var name = "@octokit/rest";
var version = "16.43.1";
var publishConfig = {
	access: "public"
};
var description = "GitHub REST API client for Node.js";
var keywords = [
	"octokit",
	"github",
	"rest",
	"api-client"
];
var author = "Gregor Martynus (https://github.com/gr2m)";
var contributors = [
	{
		name: "Mike de Boer",
		email: "info@mikedeboer.nl"
	},
	{
		name: "Fabian Jakobs",
		email: "fabian@c9.io"
	},
	{
		name: "Joe Gallo",
		email: "joe@brassafrax.com"
	},
	{
		name: "Gregor Martynus",
		url: "https://github.com/gr2m"
	}
];
var repository = "https://github.com/octokit/rest.js";
var dependencies = {
	"@octokit/auth-token": "^2.4.0",
	"@octokit/plugin-paginate-rest": "^1.1.1",
	"@octokit/plugin-request-log": "^1.0.0",
	"@octokit/plugin-rest-endpoint-methods": "2.4.0",
	"@octokit/request": "^5.2.0",
	"@octokit/request-error": "^1.0.2",
	"atob-lite": "^2.0.0",
	"before-after-hook": "^2.0.0",
	"btoa-lite": "^1.0.0",
	deprecation: "^2.0.0",
	"lodash.get": "^4.4.2",
	"lodash.set": "^4.3.2",
	"lodash.uniq": "^4.5.0",
	"octokit-pagination-methods": "^1.1.0",
	once: "^1.4.0",
	"universal-user-agent": "^4.0.0"
};
var devDependencies = {
	"@gimenete/type-writer": "^0.1.3",
	"@octokit/auth": "^1.1.1",
	"@octokit/fixtures-server": "^5.0.6",
	"@octokit/graphql": "^4.2.0",
	"@types/node": "^13.1.0",
	bundlesize: "^0.18.0",
	chai: "^4.1.2",
	"compression-webpack-plugin": "^3.1.0",
	cypress: "^3.0.0",
	glob: "^7.1.2",
	"http-proxy-agent": "^4.0.0",
	"lodash.camelcase": "^4.3.0",
	"lodash.merge": "^4.6.1",
	"lodash.upperfirst": "^4.3.1",
	lolex: "^5.1.2",
	mkdirp: "^1.0.0",
	mocha: "^7.0.1",
	mustache: "^4.0.0",
	nock: "^11.3.3",
	"npm-run-all": "^4.1.2",
	nyc: "^15.0.0",
	prettier: "^1.14.2",
	proxy: "^1.0.0",
	"semantic-release": "^17.0.0",
	sinon: "^8.0.0",
	"sinon-chai": "^3.0.0",
	"sort-keys": "^4.0.0",
	"string-to-arraybuffer": "^1.0.0",
	"string-to-jsdoc-comment": "^1.0.0",
	typescript: "^3.3.1",
	webpack: "^4.0.0",
	"webpack-bundle-analyzer": "^3.0.0",
	"webpack-cli": "^3.0.0"
};
var types$1 = "index.d.ts";
var scripts = {
	coverage: "nyc report --reporter=html && open coverage/index.html",
	lint: "prettier --check '{lib,plugins,scripts,test}/**/*.{js,json,ts}' 'docs/*.{js,json}' 'docs/src/**/*' index.js README.md package.json",
	"lint:fix": "prettier --write '{lib,plugins,scripts,test}/**/*.{js,json,ts}' 'docs/*.{js,json}' 'docs/src/**/*' index.js README.md package.json",
	pretest: "npm run -s lint",
	test: "nyc mocha test/mocha-node-setup.js \"test/*/**/*-test.js\"",
	"test:browser": "cypress run --browser chrome",
	build: "npm-run-all build:*",
	"build:ts": "npm run -s update-endpoints:typescript",
	"prebuild:browser": "mkdirp dist/",
	"build:browser": "npm-run-all build:browser:*",
	"build:browser:development": "webpack --mode development --entry . --output-library=Octokit --output=./dist/octokit-rest.js --profile --json > dist/bundle-stats.json",
	"build:browser:production": "webpack --mode production --entry . --plugin=compression-webpack-plugin --output-library=Octokit --output-path=./dist --output-filename=octokit-rest.min.js --devtool source-map",
	"generate-bundle-report": "webpack-bundle-analyzer dist/bundle-stats.json --mode=static --no-open --report dist/bundle-report.html",
	"update-endpoints": "npm-run-all update-endpoints:*",
	"update-endpoints:fetch-json": "node scripts/update-endpoints/fetch-json",
	"update-endpoints:typescript": "node scripts/update-endpoints/typescript",
	"prevalidate:ts": "npm run -s build:ts",
	"validate:ts": "tsc --target es6 --noImplicitAny index.d.ts",
	"postvalidate:ts": "tsc --noEmit --target es6 test/typescript-validate.ts",
	"start-fixtures-server": "octokit-fixtures-server"
};
var license = "MIT";
var files = [
	"index.js",
	"index.d.ts",
	"lib",
	"plugins"
];
var nyc = {
	ignore: [
		"test"
	]
};
var release = {
	publish: [
		"@semantic-release/npm",
		{
			path: "@semantic-release/github",
			assets: [
				"dist/*",
				"!dist/*.map.gz"
			]
		}
	]
};
var bundlesize = [
	{
		path: "./dist/octokit-rest.min.js.gz",
		maxSize: "33 kB"
	}
];
var _package = {
	name: name,
	version: version,
	publishConfig: publishConfig,
	description: description,
	keywords: keywords,
	author: author,
	contributors: contributors,
	repository: repository,
	dependencies: dependencies,
	devDependencies: devDependencies,
	types: types$1,
	scripts: scripts,
	license: license,
	files: files,
	nyc: nyc,
	release: release,
	bundlesize: bundlesize
};

var _package$1 = {
	__proto__: null,
	name: name,
	version: version,
	publishConfig: publishConfig,
	description: description,
	keywords: keywords,
	author: author,
	contributors: contributors,
	repository: repository,
	dependencies: dependencies,
	devDependencies: devDependencies,
	types: types$1,
	scripts: scripts,
	license: license,
	files: files,
	nyc: nyc,
	release: release,
	bundlesize: bundlesize,
	'default': _package
};

var pkg = getCjsExportFromNamespace(_package$1);

var parseClientOptions = parseOptions;

const { Deprecation: Deprecation$1 } = distWeb;
const { getUserAgent: getUserAgent$2 } = distWeb$5;




const deprecateOptionsTimeout = once_1((log, deprecation) =>
  log.warn(deprecation)
);
const deprecateOptionsAgent = once_1((log, deprecation) => log.warn(deprecation));
const deprecateOptionsHeaders = once_1((log, deprecation) =>
  log.warn(deprecation)
);

function parseOptions(options, log, hook) {
  if (options.headers) {
    options.headers = Object.keys(options.headers).reduce((newObj, key) => {
      newObj[key.toLowerCase()] = options.headers[key];
      return newObj;
    }, {});
  }

  const clientDefaults = {
    headers: options.headers || {},
    request: options.request || {},
    mediaType: {
      previews: [],
      format: ""
    }
  };

  if (options.baseUrl) {
    clientDefaults.baseUrl = options.baseUrl;
  }

  if (options.userAgent) {
    clientDefaults.headers["user-agent"] = options.userAgent;
  }

  if (options.previews) {
    clientDefaults.mediaType.previews = options.previews;
  }

  if (options.timeZone) {
    clientDefaults.headers["time-zone"] = options.timeZone;
  }

  if (options.timeout) {
    deprecateOptionsTimeout(
      log,
      new Deprecation$1(
        "[@octokit/rest] new Octokit({timeout}) is deprecated. Use {request: {timeout}} instead. See https://github.com/octokit/request.js#request"
      )
    );
    clientDefaults.request.timeout = options.timeout;
  }

  if (options.agent) {
    deprecateOptionsAgent(
      log,
      new Deprecation$1(
        "[@octokit/rest] new Octokit({agent}) is deprecated. Use {request: {agent}} instead. See https://github.com/octokit/request.js#request"
      )
    );
    clientDefaults.request.agent = options.agent;
  }

  if (options.headers) {
    deprecateOptionsHeaders(
      log,
      new Deprecation$1(
        "[@octokit/rest] new Octokit({headers}) is deprecated. Use {userAgent, previews} instead. See https://github.com/octokit/request.js#request"
      )
    );
  }

  const userAgentOption = clientDefaults.headers["user-agent"];
  const defaultUserAgent = `octokit.js/${pkg.version} ${getUserAgent$2()}`;

  clientDefaults.headers["user-agent"] = [userAgentOption, defaultUserAgent]
    .filter(Boolean)
    .join(" ");

  clientDefaults.request.hook = hook.bind(null, "request");

  return clientDefaults;
}

var constructor_1 = Octokit;

const { request: request$2 } = distWeb$1;




function Octokit(plugins, options) {
  options = options || {};
  const hook = new beforeAfterHook.Collection();
  const log = Object.assign(
    {
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error
    },
    options && options.log
  );
  const api = {
    hook,
    log,
    request: request$2.defaults(parseClientOptions(options, log, hook))
  };

  plugins.forEach(pluginFunction => pluginFunction(api, options));

  return api;
}

var registerPlugin_1 = registerPlugin;



function registerPlugin(plugins, pluginFunction) {
  return factory_1(
    plugins.includes(pluginFunction) ? plugins : plugins.concat(pluginFunction)
  );
}

var factory_1 = factory;




function factory(plugins) {
  const Api = constructor_1.bind(null, plugins || []);
  Api.plugin = registerPlugin_1.bind(null, plugins || []);
  return Api;
}

var core$4 = factory_1();

async function auth(token) {
    const tokenType = token.split(/\./).length === 3
        ? "app"
        : /^v\d+\./.test(token)
            ? "installation"
            : "oauth";
    return {
        type: "token",
        token: token,
        tokenType
    };
}

/**
 * Prefix token for usage in the Authorization header
 *
 * @param token OAuth token or JSON Web Token
 */
function withAuthorizationPrefix(token) {
    if (token.split(/\./).length === 3) {
        return `bearer ${token}`;
    }
    return `token ${token}`;
}

async function hook(token, request, route, parameters) {
    const endpoint = request.endpoint.merge(route, parameters);
    endpoint.headers.authorization = withAuthorizationPrefix(token);
    return request(endpoint);
}

const createTokenAuth = function createTokenAuth(token) {
    if (!token) {
        throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
    }
    if (typeof token !== "string") {
        throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
    }
    token = token.replace(/^(token|bearer) +/i, "");
    return Object.assign(auth.bind(null, token), {
        hook: hook.bind(null, token)
    });
};

var distWeb$6 = {
	__proto__: null,
	createTokenAuth: createTokenAuth
};

var btoaNode = function btoa(str) {
  return new Buffer(str).toString('base64')
};

var atobNode = function atob(str) {
  return Buffer.from(str, 'base64').toString('binary')
};

var withAuthorizationPrefix_1 = withAuthorizationPrefix$1;



const REGEX_IS_BASIC_AUTH = /^[\w-]+:/;

function withAuthorizationPrefix$1(authorization) {
  if (/^(basic|bearer|token) /i.test(authorization)) {
    return authorization;
  }

  try {
    if (REGEX_IS_BASIC_AUTH.test(atobNode(authorization))) {
      return `basic ${authorization}`;
    }
  } catch (error) {}

  if (authorization.split(/\./).length === 3) {
    return `bearer ${authorization}`;
  }

  return `token ${authorization}`;
}

var beforeRequest = authenticationBeforeRequest;





function authenticationBeforeRequest(state, options) {
  if (typeof state.auth === "string") {
    options.headers.authorization = withAuthorizationPrefix_1(state.auth);
    return;
  }

  if (state.auth.username) {
    const hash = btoaNode(`${state.auth.username}:${state.auth.password}`);
    options.headers.authorization = `Basic ${hash}`;
    if (state.otp) {
      options.headers["x-github-otp"] = state.otp;
    }
    return;
  }

  if (state.auth.clientId) {
    // There is a special case for OAuth applications, when `clientId` and `clientSecret` is passed as
    // Basic Authorization instead of query parameters. The only routes where that applies share the same
    // URL though: `/applications/:client_id/tokens/:access_token`.
    //
    //  1. [Check an authorization](https://developer.github.com/v3/oauth_authorizations/#check-an-authorization)
    //  2. [Reset an authorization](https://developer.github.com/v3/oauth_authorizations/#reset-an-authorization)
    //  3. [Revoke an authorization for an application](https://developer.github.com/v3/oauth_authorizations/#revoke-an-authorization-for-an-application)
    //
    // We identify by checking the URL. It must merge both "/applications/:client_id/tokens/:access_token"
    // as well as "/applications/123/tokens/token456"
    if (/\/applications\/:?[\w_]+\/tokens\/:?[\w_]+($|\?)/.test(options.url)) {
      const hash = btoaNode(`${state.auth.clientId}:${state.auth.clientSecret}`);
      options.headers.authorization = `Basic ${hash}`;
      return;
    }

    options.url += options.url.indexOf("?") === -1 ? "?" : "&";
    options.url += `client_id=${state.auth.clientId}&client_secret=${state.auth.clientSecret}`;
    return;
  }

  return Promise.resolve()

    .then(() => {
      return state.auth();
    })

    .then(authorization => {
      options.headers.authorization = withAuthorizationPrefix_1(authorization);
    });
}

const logOnce$1 = once_1((deprecation) => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */
class RequestError$1 extends Error {
    constructor(message, statusCode, options) {
        super(message);
        // Maintains proper stack trace (only available on V8)
        /* istanbul ignore next */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.name = "HttpError";
        this.status = statusCode;
        Object.defineProperty(this, "code", {
            get() {
                logOnce$1(new Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
                return statusCode;
            }
        });
        this.headers = options.headers || {};
        // redact request credentials without mutating original request options
        const requestCopy = Object.assign({}, options.request);
        if (options.request.headers.authorization) {
            requestCopy.headers = Object.assign({}, options.request.headers, {
                authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
            });
        }
        requestCopy.url = requestCopy.url
            // client_id & client_secret can be passed as URL query parameters to increase rate limit
            // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
            .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]")
            // OAuth tokens can be passed as URL query parameters, although it is not recommended
            // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
            .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
        this.request = requestCopy;
    }
}

var distWeb$7 = {
	__proto__: null,
	RequestError: RequestError$1
};

var requestError = authenticationRequestError;

const { RequestError: RequestError$2 } = distWeb$7;

function authenticationRequestError(state, error, options) {
  if (!error.headers) throw error;

  const otpRequired = /required/.test(error.headers["x-github-otp"] || "");
  // handle "2FA required" error only
  if (error.status !== 401 || !otpRequired) {
    throw error;
  }

  if (
    error.status === 401 &&
    otpRequired &&
    error.request &&
    error.request.headers["x-github-otp"]
  ) {
    if (state.otp) {
      delete state.otp; // no longer valid, request again
    } else {
      throw new RequestError$2(
        "Invalid one-time password for two-factor authentication",
        401,
        {
          headers: error.headers,
          request: options
        }
      );
    }
  }

  if (typeof state.auth.on2fa !== "function") {
    throw new RequestError$2(
      "2FA required, but options.on2fa is not a function. See https://github.com/octokit/rest.js#authentication",
      401,
      {
        headers: error.headers,
        request: options
      }
    );
  }

  return Promise.resolve()
    .then(() => {
      return state.auth.on2fa();
    })
    .then(oneTimePassword => {
      const newOptions = Object.assign(options, {
        headers: Object.assign(options.headers, {
          "x-github-otp": oneTimePassword
        })
      });
      return state.octokit.request(newOptions).then(response => {
        // If OTP still valid, then persist it for following requests
        state.otp = oneTimePassword;
        return response;
      });
    });
}

var validate = validateAuth;

function validateAuth(auth) {
  if (typeof auth === "string") {
    return;
  }

  if (typeof auth === "function") {
    return;
  }

  if (auth.username && auth.password) {
    return;
  }

  if (auth.clientId && auth.clientSecret) {
    return;
  }

  throw new Error(`Invalid "auth" option: ${JSON.stringify(auth)}`);
}

var authentication = authenticationPlugin;

const { createTokenAuth: createTokenAuth$1 } = distWeb$6;
const { Deprecation: Deprecation$2 } = distWeb;







const deprecateAuthBasic = once_1((log, deprecation) => log.warn(deprecation));
const deprecateAuthObject = once_1((log, deprecation) => log.warn(deprecation));

function authenticationPlugin(octokit, options) {
  // If `options.authStrategy` is set then use it and pass in `options.auth`
  if (options.authStrategy) {
    const auth = options.authStrategy(options.auth);
    octokit.hook.wrap("request", auth.hook);
    octokit.auth = auth;
    return;
  }

  // If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
  // is unauthenticated. The `octokit.auth()` method is a no-op and no request hook is registred.
  if (!options.auth) {
    octokit.auth = () =>
      Promise.resolve({
        type: "unauthenticated"
      });
    return;
  }

  const isBasicAuthString =
    typeof options.auth === "string" &&
    /^basic/.test(withAuthorizationPrefix_1(options.auth));

  // If only `options.auth` is set to a string, use the default token authentication strategy.
  if (typeof options.auth === "string" && !isBasicAuthString) {
    const auth = createTokenAuth$1(options.auth);
    octokit.hook.wrap("request", auth.hook);
    octokit.auth = auth;
    return;
  }

  // Otherwise log a deprecation message
  const [deprecationMethod, deprecationMessapge] = isBasicAuthString
    ? [
        deprecateAuthBasic,
        'Setting the "new Octokit({ auth })" option to a Basic Auth string is deprecated. Use https://github.com/octokit/auth-basic.js instead. See (https://octokit.github.io/rest.js/#authentication)'
      ]
    : [
        deprecateAuthObject,
        'Setting the "new Octokit({ auth })" option to an object without also setting the "authStrategy" option is deprecated and will be removed in v17. See (https://octokit.github.io/rest.js/#authentication)'
      ];
  deprecationMethod(
    octokit.log,
    new Deprecation$2("[@octokit/rest] " + deprecationMessapge)
  );

  octokit.auth = () =>
    Promise.resolve({
      type: "deprecated",
      message: deprecationMessapge
    });

  validate(options.auth);

  const state = {
    octokit,
    auth: options.auth
  };

  octokit.hook.before("request", beforeRequest.bind(null, state));
  octokit.hook.error("request", requestError.bind(null, state));
}

var authenticate_1 = authenticate;

const { Deprecation: Deprecation$3 } = distWeb;


const deprecateAuthenticate = once_1((log, deprecation) => log.warn(deprecation));

function authenticate(state, options) {
  deprecateAuthenticate(
    state.octokit.log,
    new Deprecation$3(
      '[@octokit/rest] octokit.authenticate() is deprecated. Use "auth" constructor option instead.'
    )
  );

  if (!options) {
    state.auth = false;
    return;
  }

  switch (options.type) {
    case "basic":
      if (!options.username || !options.password) {
        throw new Error(
          "Basic authentication requires both a username and password to be set"
        );
      }
      break;

    case "oauth":
      if (!options.token && !(options.key && options.secret)) {
        throw new Error(
          "OAuth2 authentication requires a token or key & secret to be set"
        );
      }
      break;

    case "token":
    case "app":
      if (!options.token) {
        throw new Error("Token authentication requires a token to be set");
      }
      break;

    default:
      throw new Error(
        "Invalid authentication type, must be 'basic', 'oauth', 'token' or 'app'"
      );
  }

  state.auth = options;
}

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array ? array.length : 0;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * Checks if a cache value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var splice = arrayProto.splice;

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root, 'Map'),
    Set$1 = getNative(root, 'Set'),
    nativeCreate = getNative(Object, 'create');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$1 || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;

  this.__data__ = new MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject$1(value) || isMasked(value)) {
    return false;
  }
  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);
    if (set) {
      return setToArray(set);
    }
    isCommon = false;
    includes = cacheHas;
    seen = new SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY) ? noop$2 : function(values) {
  return new Set$1(values);
};

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each
 * element is kept.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length)
    ? baseUniq(array)
    : [];
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$1(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop$2() {
  // No operation performed.
}

var lodash_uniq = uniq;

var beforeRequest$1 = authenticationBeforeRequest$1;




function authenticationBeforeRequest$1(state, options) {
  if (!state.auth.type) {
    return;
  }

  if (state.auth.type === "basic") {
    const hash = btoaNode(`${state.auth.username}:${state.auth.password}`);
    options.headers.authorization = `Basic ${hash}`;
    return;
  }

  if (state.auth.type === "token") {
    options.headers.authorization = `token ${state.auth.token}`;
    return;
  }

  if (state.auth.type === "app") {
    options.headers.authorization = `Bearer ${state.auth.token}`;
    const acceptHeaders = options.headers.accept
      .split(",")
      .concat("application/vnd.github.machine-man-preview+json");
    options.headers.accept = lodash_uniq(acceptHeaders)
      .filter(Boolean)
      .join(",");
    return;
  }

  options.url += options.url.indexOf("?") === -1 ? "?" : "&";

  if (state.auth.token) {
    options.url += `access_token=${encodeURIComponent(state.auth.token)}`;
    return;
  }

  const key = encodeURIComponent(state.auth.key);
  const secret = encodeURIComponent(state.auth.secret);
  options.url += `client_id=${key}&client_secret=${secret}`;
}

var requestError$1 = authenticationRequestError$1;

const { RequestError: RequestError$3 } = distWeb$7;

function authenticationRequestError$1(state, error, options) {
  /* istanbul ignore next */
  if (!error.headers) throw error;

  const otpRequired = /required/.test(error.headers["x-github-otp"] || "");
  // handle "2FA required" error only
  if (error.status !== 401 || !otpRequired) {
    throw error;
  }

  if (
    error.status === 401 &&
    otpRequired &&
    error.request &&
    error.request.headers["x-github-otp"]
  ) {
    throw new RequestError$3(
      "Invalid one-time password for two-factor authentication",
      401,
      {
        headers: error.headers,
        request: options
      }
    );
  }

  if (typeof state.auth.on2fa !== "function") {
    throw new RequestError$3(
      "2FA required, but options.on2fa is not a function. See https://github.com/octokit/rest.js#authentication",
      401,
      {
        headers: error.headers,
        request: options
      }
    );
  }

  return Promise.resolve()
    .then(() => {
      return state.auth.on2fa();
    })
    .then(oneTimePassword => {
      const newOptions = Object.assign(options, {
        headers: Object.assign(
          { "x-github-otp": oneTimePassword },
          options.headers
        )
      });
      return state.octokit.request(newOptions);
    });
}

var authenticationDeprecated = authenticationPlugin$1;

const { Deprecation: Deprecation$4 } = distWeb;


const deprecateAuthenticate$1 = once_1((log, deprecation) => log.warn(deprecation));





function authenticationPlugin$1(octokit, options) {
  if (options.auth) {
    octokit.authenticate = () => {
      deprecateAuthenticate$1(
        octokit.log,
        new Deprecation$4(
          '[@octokit/rest] octokit.authenticate() is deprecated and has no effect when "auth" option is set on Octokit constructor'
        )
      );
    };
    return;
  }
  const state = {
    octokit,
    auth: false
  };
  octokit.authenticate = authenticate_1.bind(null, state);
  octokit.hook.before("request", beforeRequest$1.bind(null, state));
  octokit.hook.error("request", requestError$1.bind(null, state));
}

const VERSION$5 = "1.1.2";

/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint:
 *
 * - https://developer.github.com/v3/search/#example (key `items`)
 * - https://developer.github.com/v3/checks/runs/#response-3 (key: `check_runs`)
 * - https://developer.github.com/v3/checks/suites/#response-1 (key: `check_suites`)
 * - https://developer.github.com/v3/apps/installations/#list-repositories (key: `repositories`)
 * - https://developer.github.com/v3/apps/installations/#list-installations-for-a-user (key `installations`)
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not. For the exceptions with the namespace, a fallback check for the route
 * paths has to be added in order to normalize the response. We cannot check for the total_count
 * property because it also exists in the response of Get the combined status for a specific ref.
 */
const REGEX = [
    /^\/search\//,
    /^\/repos\/[^/]+\/[^/]+\/commits\/[^/]+\/(check-runs|check-suites)([^/]|$)/,
    /^\/installation\/repositories([^/]|$)/,
    /^\/user\/installations([^/]|$)/,
    /^\/repos\/[^/]+\/[^/]+\/actions\/secrets([^/]|$)/,
    /^\/repos\/[^/]+\/[^/]+\/actions\/workflows(\/[^/]+\/runs)?([^/]|$)/,
    /^\/repos\/[^/]+\/[^/]+\/actions\/runs(\/[^/]+\/(artifacts|jobs))?([^/]|$)/
];
function normalizePaginatedListResponse(octokit, url, response) {
    const path = url.replace(octokit.request.endpoint.DEFAULTS.baseUrl, "");
    const responseNeedsNormalization = REGEX.find(regex => regex.test(path));
    if (!responseNeedsNormalization)
        return;
    // keep the additional properties intact as there is currently no other way
    // to retrieve the same information.
    const incompleteResults = response.data.incomplete_results;
    const repositorySelection = response.data.repository_selection;
    const totalCount = response.data.total_count;
    delete response.data.incomplete_results;
    delete response.data.repository_selection;
    delete response.data.total_count;
    const namespaceKey = Object.keys(response.data)[0];
    const data = response.data[namespaceKey];
    response.data = data;
    if (typeof incompleteResults !== "undefined") {
        response.data.incomplete_results = incompleteResults;
    }
    if (typeof repositorySelection !== "undefined") {
        response.data.repository_selection = repositorySelection;
    }
    response.data.total_count = totalCount;
    Object.defineProperty(response.data, namespaceKey, {
        get() {
            octokit.log.warn(`[@octokit/paginate-rest] "response.data.${namespaceKey}" is deprecated for "GET ${path}". Get the results directly from "response.data"`);
            return Array.from(data);
        }
    });
}

function iterator(octokit, route, parameters) {
    const options = octokit.request.endpoint(route, parameters);
    const method = options.method;
    const headers = options.headers;
    let url = options.url;
    return {
        [Symbol.asyncIterator]: () => ({
            next() {
                if (!url) {
                    return Promise.resolve({ done: true });
                }
                return octokit
                    .request({ method, url, headers })
                    .then((response) => {
                    normalizePaginatedListResponse(octokit, url, response);
                    // `response.headers.link` format:
                    // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
                    // sets `url` to undefined if "next" URL is not present or `link` header is not set
                    url = ((response.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
                    return { value: response };
                });
            }
        })
    };
}

function paginate(octokit, route, parameters, mapFn) {
    if (typeof parameters === "function") {
        mapFn = parameters;
        parameters = undefined;
    }
    return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}
function gather(octokit, results, iterator, mapFn) {
    return iterator.next().then(result => {
        if (result.done) {
            return results;
        }
        let earlyExit = false;
        function done() {
            earlyExit = true;
        }
        results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);
        if (earlyExit) {
            return results;
        }
        return gather(octokit, results, iterator, mapFn);
    });
}

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */
function paginateRest(octokit) {
    return {
        paginate: Object.assign(paginate.bind(null, octokit), {
            iterator: iterator.bind(null, octokit)
        })
    };
}
paginateRest.VERSION = VERSION$5;

var distWeb$8 = {
	__proto__: null,
	paginateRest: paginateRest
};

var pagination = paginatePlugin;

const { paginateRest: paginateRest$1 } = distWeb$8;

function paginatePlugin(octokit) {
  Object.assign(octokit, paginateRest$1(octokit));
}

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/** `Object#toString` result references. */
var funcTag$1 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor$1 = /^\[object .+?Constructor\]$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal$1 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$1 = freeGlobal$1 || freeSelf$1 || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue$1(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject$1(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto$1 = Array.prototype,
    funcProto$1 = Function.prototype,
    objectProto$1 = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData$1 = root$1['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey$1 = (function() {
  var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$1 = objectProto$1.toString;

/** Used to detect if a method is native. */
var reIsNative$1 = RegExp('^' +
  funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar$1, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol$1 = root$1.Symbol,
    splice$1 = arrayProto$1.splice;

/* Built-in method references that are verified to be native. */
var Map$2 = getNative$1(root$1, 'Map'),
    nativeCreate$1 = getNative$1(Object, 'create');

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash$1(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear$1() {
  this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete$1(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$1) {
    var result = data[key];
    return result === HASH_UNDEFINED$1 ? undefined : result;
  }
  return hasOwnProperty$1.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== undefined : hasOwnProperty$1.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet$1(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

// Add methods to `Hash`.
Hash$1.prototype.clear = hashClear$1;
Hash$1.prototype['delete'] = hashDelete$1;
Hash$1.prototype.get = hashGet$1;
Hash$1.prototype.has = hashHas$1;
Hash$1.prototype.set = hashSet$1;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache$1(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear$1() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete$1(key) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice$1.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet$1(key) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet$1(key, value) {
  var data = this.__data__,
      index = assocIndexOf$1(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache$1.prototype.clear = listCacheClear$1;
ListCache$1.prototype['delete'] = listCacheDelete$1;
ListCache$1.prototype.get = listCacheGet$1;
ListCache$1.prototype.has = listCacheHas$1;
ListCache$1.prototype.set = listCacheSet$1;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache$1(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear$1() {
  this.__data__ = {
    'hash': new Hash$1,
    'map': new (Map$2 || ListCache$1),
    'string': new Hash$1
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete$1(key) {
  return getMapData$1(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet$1(key) {
  return getMapData$1(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet$1(key, value) {
  getMapData$1(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache$1.prototype.clear = mapCacheClear$1;
MapCache$1.prototype['delete'] = mapCacheDelete$1;
MapCache$1.prototype.get = mapCacheGet$1;
MapCache$1.prototype.has = mapCacheHas$1;
MapCache$1.prototype.set = mapCacheSet$1;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf$1(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$1(value) {
  if (!isObject$2(value) || isMasked$1(value)) {
    return false;
  }
  var pattern = (isFunction$1(value) || isHostObject$1(value)) ? reIsNative$1 : reIsHostCtor$1;
  return pattern.test(toSource$1(value));
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData$1(map, key) {
  var data = map.__data__;
  return isKeyable$1(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$1(object, key) {
  var value = getValue$1(object, key);
  return baseIsNative$1(value) ? value : undefined;
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable$1(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$1(func) {
  return !!maskSrcKey$1 && (maskSrcKey$1 in func);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoize(function(string) {
  string = toString(string);

  var result = [];
  if (reLeadingDot.test(string)) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource$1(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache$1);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize.Cache = MapCache$1;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq$1(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$1(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$2(value) ? objectToString$1.call(value) : '';
  return tag == funcTag$1 || tag == genTag$1;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$2(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString$1.call(value) == symbolTag);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get$1(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

var lodash_get = get$1;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT$1 = 'Expected a function';

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/** Used as references for various `Number` constants. */
var INFINITY$2 = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var funcTag$2 = '[object Function]',
    genTag$2 = '[object GeneratorFunction]',
    symbolTag$1 = '[object Symbol]';

/** Used to match property names within property paths. */
var reIsDeepProp$1 = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp$1 = /^\w*$/,
    reLeadingDot$1 = /^\./,
    rePropName$1 = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar$2 = /[\\^$.*+?()[\]{}|]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar$1 = /\\(\\)?/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor$2 = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Detect free variable `global` from Node.js. */
var freeGlobal$2 = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf$2 = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root$2 = freeGlobal$2 || freeSelf$2 || Function('return this')();

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue$2(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject$2(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/** Used for built-in method references. */
var arrayProto$2 = Array.prototype,
    funcProto$2 = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData$2 = root$2['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey$2 = (function() {
  var uid = /[^.]+$/.exec(coreJsData$2 && coreJsData$2.keys && coreJsData$2.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$2 = objectProto$2.toString;

/** Used to detect if a method is native. */
var reIsNative$2 = RegExp('^' +
  funcToString$2.call(hasOwnProperty$2).replace(reRegExpChar$2, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Symbol$2 = root$2.Symbol,
    splice$2 = arrayProto$2.splice;

/* Built-in method references that are verified to be native. */
var Map$3 = getNative$2(root$2, 'Map'),
    nativeCreate$2 = getNative$2(Object, 'create');

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolToString$1 = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash$2(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear$2() {
  this.__data__ = nativeCreate$2 ? nativeCreate$2(null) : {};
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete$2(key) {
  return this.has(key) && delete this.__data__[key];
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet$2(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas$2(key) {
  var data = this.__data__;
  return nativeCreate$2 ? data[key] !== undefined : hasOwnProperty$2.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet$2(key, value) {
  var data = this.__data__;
  data[key] = (nativeCreate$2 && value === undefined) ? HASH_UNDEFINED$2 : value;
  return this;
}

// Add methods to `Hash`.
Hash$2.prototype.clear = hashClear$2;
Hash$2.prototype['delete'] = hashDelete$2;
Hash$2.prototype.get = hashGet$2;
Hash$2.prototype.has = hashHas$2;
Hash$2.prototype.set = hashSet$2;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache$2(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear$2() {
  this.__data__ = [];
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete$2(key) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice$2.call(data, index, 1);
  }
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet$2(key) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas$2(key) {
  return assocIndexOf$2(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet$2(key, value) {
  var data = this.__data__,
      index = assocIndexOf$2(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache$2.prototype.clear = listCacheClear$2;
ListCache$2.prototype['delete'] = listCacheDelete$2;
ListCache$2.prototype.get = listCacheGet$2;
ListCache$2.prototype.has = listCacheHas$2;
ListCache$2.prototype.set = listCacheSet$2;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache$2(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear$2() {
  this.__data__ = {
    'hash': new Hash$2,
    'map': new (Map$3 || ListCache$2),
    'string': new Hash$2
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete$2(key) {
  return getMapData$2(this, key)['delete'](key);
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet$2(key) {
  return getMapData$2(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas$2(key) {
  return getMapData$2(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet$2(key, value) {
  getMapData$2(this, key).set(key, value);
  return this;
}

// Add methods to `MapCache`.
MapCache$2.prototype.clear = mapCacheClear$2;
MapCache$2.prototype['delete'] = mapCacheDelete$2;
MapCache$2.prototype.get = mapCacheGet$2;
MapCache$2.prototype.has = mapCacheHas$2;
MapCache$2.prototype.set = mapCacheSet$2;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$2.call(object, key) && eq$2(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf$2(array, key) {
  var length = array.length;
  while (length--) {
    if (eq$2(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative$2(value) {
  if (!isObject$3(value) || isMasked$2(value)) {
    return false;
  }
  var pattern = (isFunction$2(value) || isHostObject$2(value)) ? reIsNative$2 : reIsHostCtor$2;
  return pattern.test(toSource$2(value));
}

/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!isObject$3(object)) {
    return object;
  }
  path = isKey$1(path, object) ? [path] : castPath$1(path);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = toKey$1(path[index]),
        newValue = value;

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = isObject$3(objValue)
          ? objValue
          : (isIndex(path[index + 1]) ? [] : {});
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString$1(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isSymbol$1(value)) {
    return symbolToString$1 ? symbolToString$1.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */
function castPath$1(value) {
  return isArray$1(value) ? value : stringToPath$1(value);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData$2(map, key) {
  var data = map.__data__;
  return isKeyable$2(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative$2(object, key) {
  var value = getValue$2(object, key);
  return baseIsNative$2(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey$1(value, object) {
  if (isArray$1(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol$1(value)) {
    return true;
  }
  return reIsPlainProp$1.test(value) || !reIsDeepProp$1.test(value) ||
    (object != null && value in Object(object));
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable$2(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked$2(func) {
  return !!maskSrcKey$2 && (maskSrcKey$2 in func);
}

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath$1 = memoize$1(function(string) {
  string = toString$1(string);

  var result = [];
  if (reLeadingDot$1.test(string)) {
    result.push('');
  }
  string.replace(rePropName$1, function(match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar$1, '$1') : (number || match));
  });
  return result;
});

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey$1(value) {
  if (typeof value == 'string' || isSymbol$1(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */
function toSource$2(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize$1(func, resolver) {
  if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT$1);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };
  memoized.cache = new (memoize$1.Cache || MapCache$2);
  return memoized;
}

// Assign cache to `_.memoize`.
memoize$1.Cache = MapCache$2;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq$2(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray$1 = Array.isArray;

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$2(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$3(value) ? objectToString$2.call(value) : '';
  return tag == funcTag$2 || tag == genTag$2;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$3(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$1(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$1(value) && objectToString$2.call(value) == symbolTag$1);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString$1(value) {
  return value == null ? '' : baseToString$1(value);
}

/**
 * Sets the value at `path` of `object`. If a portion of `path` doesn't exist,
 * it's created. Arrays are created for missing index properties while objects
 * are created for all other missing properties. Use `_.setWith` to customize
 * `path` creation.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.set(object, 'a[0].b.c', 4);
 * console.log(object.a[0].b.c);
 * // => 4
 *
 * _.set(object, ['x', '0', 'y', 'z'], 5);
 * console.log(object.x[0].y.z);
 * // => 5
 */
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}

var lodash_set = set;

var validate_1 = validate$1;

const { RequestError: RequestError$4 } = distWeb$7;



function validate$1(octokit, options) {
  if (!options.request.validate) {
    return;
  }
  const { validate: params } = options.request;

  Object.keys(params).forEach(parameterName => {
    const parameter = lodash_get(params, parameterName);

    const expectedType = parameter.type;
    let parentParameterName;
    let parentValue;
    let parentParamIsPresent = true;
    let parentParameterIsArray = false;

    if (/\./.test(parameterName)) {
      parentParameterName = parameterName.replace(/\.[^.]+$/, "");
      parentParameterIsArray = parentParameterName.slice(-2) === "[]";
      if (parentParameterIsArray) {
        parentParameterName = parentParameterName.slice(0, -2);
      }
      parentValue = lodash_get(options, parentParameterName);
      parentParamIsPresent =
        parentParameterName === "headers" ||
        (typeof parentValue === "object" && parentValue !== null);
    }

    const values = parentParameterIsArray
      ? (lodash_get(options, parentParameterName) || []).map(
          value => value[parameterName.split(/\./).pop()]
        )
      : [lodash_get(options, parameterName)];

    values.forEach((value, i) => {
      const valueIsPresent = typeof value !== "undefined";
      const valueIsNull = value === null;
      const currentParameterName = parentParameterIsArray
        ? parameterName.replace(/\[\]/, `[${i}]`)
        : parameterName;

      if (!parameter.required && !valueIsPresent) {
        return;
      }

      // if the parent parameter is of type object but allows null
      // then the child parameters can be ignored
      if (!parentParamIsPresent) {
        return;
      }

      if (parameter.allowNull && valueIsNull) {
        return;
      }

      if (!parameter.allowNull && valueIsNull) {
        throw new RequestError$4(
          `'${currentParameterName}' cannot be null`,
          400,
          {
            request: options
          }
        );
      }

      if (parameter.required && !valueIsPresent) {
        throw new RequestError$4(
          `Empty value for parameter '${currentParameterName}': ${JSON.stringify(
            value
          )}`,
          400,
          {
            request: options
          }
        );
      }

      // parse to integer before checking for enum
      // so that string "1" will match enum with number 1
      if (expectedType === "integer") {
        const unparsedValue = value;
        value = parseInt(value, 10);
        if (isNaN(value)) {
          throw new RequestError$4(
            `Invalid value for parameter '${currentParameterName}': ${JSON.stringify(
              unparsedValue
            )} is NaN`,
            400,
            {
              request: options
            }
          );
        }
      }

      if (parameter.enum && parameter.enum.indexOf(String(value)) === -1) {
        throw new RequestError$4(
          `Invalid value for parameter '${currentParameterName}': ${JSON.stringify(
            value
          )}`,
          400,
          {
            request: options
          }
        );
      }

      if (parameter.validation) {
        const regex = new RegExp(parameter.validation);
        if (!regex.test(value)) {
          throw new RequestError$4(
            `Invalid value for parameter '${currentParameterName}': ${JSON.stringify(
              value
            )}`,
            400,
            {
              request: options
            }
          );
        }
      }

      if (expectedType === "object" && typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch (exception) {
          throw new RequestError$4(
            `JSON parse error of value for parameter '${currentParameterName}': ${JSON.stringify(
              value
            )}`,
            400,
            {
              request: options
            }
          );
        }
      }

      lodash_set(options, parameter.mapTo || currentParameterName, value);
    });
  });

  return options;
}

var validate_1$1 = octokitValidate;



function octokitValidate(octokit) {
  octokit.hook.before("request", validate_1.bind(null, octokit));
}

var deprecate_1 = deprecate;

const loggedMessages = {};

function deprecate (message) {
  if (loggedMessages[message]) {
    return
  }

  console.warn(`DEPRECATED (@octokit/rest): ${message}`);
  loggedMessages[message] = 1;
}

var getPageLinks_1 = getPageLinks;

function getPageLinks (link) {
  link = link.link || link.headers.link || '';

  const links = {};

  // link format:
  // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
  link.replace(/<([^>]*)>;\s*rel="([\w]*)"/g, (m, uri, type) => {
    links[type] = uri;
  });

  return links
}

var httpError = class HttpError extends Error {
  constructor (message, code, headers) {
    super(message);

    // Maintains proper stack trace (only available on V8)
    /* istanbul ignore next */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'HttpError';
    this.code = code;
    this.headers = headers;
  }
};

var getPage_1 = getPage;





function getPage (octokit, link, which, headers) {
  deprecate_1(`octokit.get${which.charAt(0).toUpperCase() + which.slice(1)}Page() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  const url = getPageLinks_1(link)[which];

  if (!url) {
    const urlError = new httpError(`No ${which} page found`, 404);
    return Promise.reject(urlError)
  }

  const requestOptions = {
    url,
    headers: applyAcceptHeader(link, headers)
  };

  const promise = octokit.request(requestOptions);

  return promise
}

function applyAcceptHeader (res, headers) {
  const previous = res.headers && res.headers['x-github-media-type'];

  if (!previous || (headers && headers.accept)) {
    return headers
  }
  headers = headers || {};
  headers.accept = 'application/vnd.' + previous
    .replace('; param=', '.')
    .replace('; format=', '+');

  return headers
}

var getFirstPage_1 = getFirstPage;



function getFirstPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'first', headers)
}

var getLastPage_1 = getLastPage;



function getLastPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'last', headers)
}

var getNextPage_1 = getNextPage;



function getNextPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'next', headers)
}

var getPreviousPage_1 = getPreviousPage;



function getPreviousPage (octokit, link, headers) {
  return getPage_1(octokit, link, 'prev', headers)
}

var hasFirstPage_1 = hasFirstPage;




function hasFirstPage (link) {
  deprecate_1(`octokit.hasFirstPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).first
}

var hasLastPage_1 = hasLastPage;




function hasLastPage (link) {
  deprecate_1(`octokit.hasLastPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).last
}

var hasNextPage_1 = hasNextPage;




function hasNextPage (link) {
  deprecate_1(`octokit.hasNextPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).next
}

var hasPreviousPage_1 = hasPreviousPage;




function hasPreviousPage (link) {
  deprecate_1(`octokit.hasPreviousPage() – You can use octokit.paginate or async iterators instead: https://github.com/octokit/rest.js#pagination.`);
  return getPageLinks_1(link).prev
}

var octokitPaginationMethods = paginationMethodsPlugin;

function paginationMethodsPlugin (octokit) {
  octokit.getFirstPage = getFirstPage_1.bind(null, octokit);
  octokit.getLastPage = getLastPage_1.bind(null, octokit);
  octokit.getNextPage = getNextPage_1.bind(null, octokit);
  octokit.getPreviousPage = getPreviousPage_1.bind(null, octokit);
  octokit.hasFirstPage = hasFirstPage_1;
  octokit.hasLastPage = hasLastPage_1;
  octokit.hasNextPage = hasNextPage_1;
  octokit.hasPreviousPage = hasPreviousPage_1;
}

const { requestLog: requestLog$1 } = distWeb$3;
const {
  restEndpointMethods: restEndpointMethods$1
} = distWeb$4;



const CORE_PLUGINS = [
  authentication,
  authenticationDeprecated, // deprecated: remove in v17
  requestLog$1,
  pagination,
  restEndpointMethods$1,
  validate_1$1,

  octokitPaginationMethods // deprecated: remove in v17
];

const OctokitRest = core$4.plugin(CORE_PLUGINS);

function DeprecatedOctokit(options) {
  const warn =
    options && options.log && options.log.warn
      ? options.log.warn
      : console.warn;
  warn(
    '[@octokit/rest] `const Octokit = require("@octokit/rest")` is deprecated. Use `const { Octokit } = require("@octokit/rest")` instead'
  );
  return new OctokitRest(options);
}

const Octokit$1 = Object.assign(DeprecatedOctokit, {
  Octokit: OctokitRest
});

Object.keys(OctokitRest).forEach(key => {
  /* istanbul ignore else */
  if (OctokitRest.hasOwnProperty(key)) {
    Octokit$1[key] = OctokitRest[key];
  }
});

var rest = Octokit$1;

var context = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


class Context {
    /**
     * Hydrate the context from the environment
     */
    constructor() {
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
            }
            else {
                const path = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os.EOL}`);
            }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
    }
    get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
exports.Context = Context;

});

unwrapExports(context);

var proxy = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function getProxyUrl(reqUrl) {
    let usingSsl = reqUrl.protocol === 'https:';
    let proxyUrl;
    if (checkBypass(reqUrl)) {
        return proxyUrl;
    }
    let proxyVar;
    if (usingSsl) {
        proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
    }
    else {
        proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY'];
    }
    if (proxyVar) {
        proxyUrl = Url.parse(proxyVar);
    }
    return proxyUrl;
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    let upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (let upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;
});

unwrapExports(proxy);

var httpOverHttp_1 = httpOverHttp;
var httpsOverHttp_1 = httpsOverHttp;
var httpOverHttps_1 = httpOverHttps;
var httpsOverHttps_1 = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket);
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  };
} else {
  debug = function() {};
}
var debug_1 = debug; // for test

var tunnel = {
	httpOverHttp: httpOverHttp_1,
	httpsOverHttp: httpsOverHttp_1,
	httpOverHttps: httpOverHttps_1,
	httpsOverHttps: httpsOverHttps_1,
	debug: debug_1
};

var tunnel$1 = tunnel;

var httpClient = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




let tunnel;
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    let proxyUrl = proxy.getProxyUrl(Url.parse(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return new Promise(async (resolve, reject) => {
            let output = Buffer.alloc(0);
            this.message.on('data', (chunk) => {
                output = Buffer.concat([output, chunk]);
            });
            this.message.on('end', () => {
                resolve(output.toString());
            });
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    let parsedUrl = Url.parse(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
    }
    get(requestUrl, additionalHeaders) {
        return this.request('GET', requestUrl, null, additionalHeaders || {});
    }
    del(requestUrl, additionalHeaders) {
        return this.request('DELETE', requestUrl, null, additionalHeaders || {});
    }
    post(requestUrl, data, additionalHeaders) {
        return this.request('POST', requestUrl, data, additionalHeaders || {});
    }
    patch(requestUrl, data, additionalHeaders) {
        return this.request('PATCH', requestUrl, data, additionalHeaders || {});
    }
    put(requestUrl, data, additionalHeaders) {
        return this.request('PUT', requestUrl, data, additionalHeaders || {});
    }
    head(requestUrl, additionalHeaders) {
        return this.request('HEAD', requestUrl, null, additionalHeaders || {});
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
            throw new Error('Client has already been disposed.');
        }
        let parsedUrl = Url.parse(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        // Only perform retries on reads since writes may not be idempotent.
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1
            ? this._maxRetries + 1
            : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
            response = await this.requestRaw(info, data);
            // Check if it's an authentication challenge
            if (response &&
                response.message &&
                response.message.statusCode === HttpCodes.Unauthorized) {
                let authenticationHandler;
                for (let i = 0; i < this.handlers.length; i++) {
                    if (this.handlers[i].canHandleAuthentication(response)) {
                        authenticationHandler = this.handlers[i];
                        break;
                    }
                }
                if (authenticationHandler) {
                    return authenticationHandler.handleAuthentication(this, info, data);
                }
                else {
                    // We have received an unauthorized response but have no handlers to handle it.
                    // Let the response return to the caller.
                    return response;
                }
            }
            let redirectsRemaining = this._maxRedirects;
            while (HttpRedirectCodes.indexOf(response.message.statusCode) != -1 &&
                this._allowRedirects &&
                redirectsRemaining > 0) {
                const redirectUrl = response.message.headers['location'];
                if (!redirectUrl) {
                    // if there's no location to redirect to, we won't
                    break;
                }
                let parsedRedirectUrl = Url.parse(redirectUrl);
                if (parsedUrl.protocol == 'https:' &&
                    parsedUrl.protocol != parsedRedirectUrl.protocol &&
                    !this._allowRedirectDowngrade) {
                    throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                }
                // we need to finish reading the response before reassigning response
                // which will leak the open socket.
                await response.readBody();
                // strip authorization header if redirected to a different hostname
                if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                    for (let header in headers) {
                        // header names are case insensitive
                        if (header.toLowerCase() === 'authorization') {
                            delete headers[header];
                        }
                    }
                }
                // let's make the request with the new redirectUrl
                info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                response = await this.requestRaw(info, data);
                redirectsRemaining--;
            }
            if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
                // If not a retry code, return immediately instead of retrying
                return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
                await response.readBody();
                await this._performExponentialBackoff(numTries);
            }
        }
        return response;
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return new Promise((resolve, reject) => {
            let callbackForResult = function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            };
            this.requestRawWithCallback(info, data, callbackForResult);
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === 'string') {
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        };
        let req = info.httpModule.request(info.options, (msg) => {
            let res = new HttpClientResponse(msg);
            handleResult(null, res);
        });
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error('Request timeout: ' + info.options.path), null);
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err, null);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        let parsedUrl = Url.parse(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            this.handlers.forEach(handler => {
                handler.prepareRequest(info.options);
            });
        }
        return info;
    }
    _mergeHeaders(headers) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = proxy.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (!!agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (!!this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
            // If using proxy, need tunnel
            if (!tunnel) {
                tunnel = tunnel$1;
            }
            const agentOptions = {
                maxSockets: maxSockets,
                keepAlive: this._keepAlive,
                proxy: {
                    proxyAuth: proxyUrl.auth,
                    host: proxyUrl.hostname,
                    port: proxyUrl.port
                }
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets: maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    static dateTimeDeserializer(key, value) {
        if (typeof value === 'string') {
            let a = new Date(value);
            if (!isNaN(a.valueOf())) {
                return a;
            }
        }
        return value;
    }
    async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
            const statusCode = res.message.statusCode;
            const response = {
                statusCode: statusCode,
                result: null,
                headers: {}
            };
            // not found leads to null obj returned
            if (statusCode == HttpCodes.NotFound) {
                resolve(response);
            }
            let obj;
            let contents;
            // get the result from the body
            try {
                contents = await res.readBody();
                if (contents && contents.length > 0) {
                    if (options && options.deserializeDates) {
                        obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
                    }
                    else {
                        obj = JSON.parse(contents);
                    }
                    response.result = obj;
                }
                response.headers = res.message.headers;
            }
            catch (err) {
                // Invalid resource (contents not json);  leaving result obj null
            }
            // note that 3xx redirects are handled by the http layer.
            if (statusCode > 299) {
                let msg;
                // if exception/error in body, attempt to get better error
                if (obj && obj.message) {
                    msg = obj.message;
                }
                else if (contents && contents.length > 0) {
                    // it may be the case that the exception is in the body message as string
                    msg = contents;
                }
                else {
                    msg = 'Failed request: (' + statusCode + ')';
                }
                let err = new Error(msg);
                // attach statusCode and body obj (if available) to the error object
                err['statusCode'] = statusCode;
                if (response.result) {
                    err['result'] = response.result;
                }
                reject(err);
            }
            else {
                resolve(response);
            }
        });
    }
}
exports.HttpClient = HttpClient;
});

unwrapExports(httpClient);

var github = createCommonjsModule(function (module, exports) {
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Originally pulled from https://github.com/JasonEtco/actions-toolkit/blob/master/src/github.ts


const Context = __importStar(context);
const httpClient$1 = __importStar(httpClient);
// We need this in order to extend Octokit
rest.Octokit.prototype = new rest.Octokit();
exports.context = new Context.Context();
class GitHub extends rest.Octokit {
    constructor(token, opts) {
        super(GitHub.getOctokitOptions(GitHub.disambiguate(token, opts)));
        this.graphql = GitHub.getGraphQL(GitHub.disambiguate(token, opts));
    }
    /**
     * Disambiguates the constructor overload parameters
     */
    static disambiguate(token, opts) {
        return [
            typeof token === 'string' ? token : '',
            typeof token === 'object' ? token : opts || {}
        ];
    }
    static getOctokitOptions(args) {
        const token = args[0];
        const options = Object.assign({}, args[1]); // Shallow clone - don't mutate the object provided by the caller
        // Base URL - GHES or Dotcom
        options.baseUrl = options.baseUrl || this.getApiBaseUrl();
        // Auth
        const auth = GitHub.getAuthString(token, options);
        if (auth) {
            options.auth = auth;
        }
        // Proxy
        const agent = GitHub.getProxyAgent(options.baseUrl, options);
        if (agent) {
            // Shallow clone - don't mutate the object provided by the caller
            options.request = options.request ? Object.assign({}, options.request) : {};
            // Set the agent
            options.request.agent = agent;
        }
        return options;
    }
    static getGraphQL(args) {
        const defaults = {};
        defaults.baseUrl = this.getGraphQLBaseUrl();
        const token = args[0];
        const options = args[1];
        // Authorization
        const auth = this.getAuthString(token, options);
        if (auth) {
            defaults.headers = {
                authorization: auth
            };
        }
        // Proxy
        const agent = GitHub.getProxyAgent(defaults.baseUrl, options);
        if (agent) {
            defaults.request = { agent };
        }
        return distWeb$2.graphql.defaults(defaults);
    }
    static getAuthString(token, options) {
        // Validate args
        if (!token && !options.auth) {
            throw new Error('Parameter token or opts.auth is required');
        }
        else if (token && options.auth) {
            throw new Error('Parameters token and opts.auth may not both be specified');
        }
        return typeof options.auth === 'string' ? options.auth : `token ${token}`;
    }
    static getProxyAgent(destinationUrl, options) {
        var _a;
        if (!((_a = options.request) === null || _a === void 0 ? void 0 : _a.agent)) {
            if (httpClient$1.getProxyUrl(destinationUrl)) {
                const hc = new httpClient$1.HttpClient();
                return hc.getAgent(destinationUrl);
            }
        }
        return undefined;
    }
    static getApiBaseUrl() {
        return process.env['GITHUB_API_URL'] || 'https://api.github.com';
    }
    static getGraphQLBaseUrl() {
        let url = process.env['GITHUB_GRAPHQL_URL'] || 'https://api.github.com/graphql';
        // Shouldn't be a trailing slash, but remove if so
        if (url.endsWith('/')) {
            url = url.substr(0, url.length - 1);
        }
        // Remove trailing "/graphql"
        if (url.toUpperCase().endsWith('/GRAPHQL')) {
            url = url.substr(0, url.length - '/graphql'.length);
        }
        return url;
    }
}
exports.GitHub = GitHub;

});

unwrapExports(github);
var github_1 = github.context;

const jobParameters = status => {
  return {
    success: {
      color: 'good',
      text: 'succeeded'
    },
    failure: {
      color: 'danger',
      text: 'failed'
    },
    cancelled: {
      color: 'warning',
      text: 'was cancelled.'
    }
  }[status];
};

const getMessage = () => {
  var _context$payload$repo;

  const eventName = github_1.eventName;
  const runUrl = `${(_context$payload$repo = github_1.payload.repository) == null ? void 0 : _context$payload$repo.html_url}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const commitId = github_1.sha.substring(0, 7);

  switch (eventName) {
    case 'pull_request':
      {
        var _context$payload$pull, _context$payload$pull2, _context$payload$pull3, _context$payload$repo2, _context$payload$pull4;

        const pr = {
          title: (_context$payload$pull = github_1.payload.pull_request) == null ? void 0 : _context$payload$pull.title,
          number: (_context$payload$pull2 = github_1.payload.pull_request) == null ? void 0 : _context$payload$pull2.number,
          url: (_context$payload$pull3 = github_1.payload.pull_request) == null ? void 0 : _context$payload$pull3.html_url
        };
        const compareUrl = `${(_context$payload$repo2 = github_1.payload.repository) == null ? void 0 : _context$payload$repo2.html_url}/compare/${(_context$payload$pull4 = github_1.payload.pull_request) == null ? void 0 : _context$payload$pull4.head.ref}`;
        return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${compareUrl}|${commitId}>) for PR <${pr.url}| #${pr.number} ${pr.title}>`;
      }

    case 'release':
      {
        var _context$payload$repo3;

        const release = {
          title: github_1.payload.release.name || github_1.payload.release.tag_name,
          url: github_1.payload.release.html_url,
          commit: `${(_context$payload$repo3 = github_1.payload.repository) == null ? void 0 : _context$payload$repo3.html_url}/commit/${github_1.sha}`
        };
        return `Workflow <${runUrl}|${process.env.GITHUB_WORKFLOW}> (<${release.commit}|${commitId}>) for Release <${release.url}| ${release.title}>`;
      }

    default:
      return null;
  }
};

const notify = function (status, url) {
  try {
    var _context$payload$repo4;

    const repository = github_1.payload.repository;
    const sender = github_1.payload.sender;
    const message = getMessage();

    if (!message) {
      console.log(`We don't support the [${github_1.eventName}] event yet.`);
      return Promise.resolve();
    }

    const payload = {
      attachments: [{
        author_name: sender == null ? void 0 : sender.login,
        author_link: sender == null ? void 0 : sender.html_url,
        author_icon: sender == null ? void 0 : sender.avatar_url,
        color: jobParameters(status).color,
        footer: `<${repository == null ? void 0 : repository.html_url}|${repository == null ? void 0 : repository.full_name}>`,
        footer_icon: 'https://github.githubassets.com/favicon.ico',
        mrkdwn_in: ['text'],
        ts: new Date((_context$payload$repo4 = github_1.payload.repository) == null ? void 0 : _context$payload$repo4.pushed_at).getTime().toString(),
        text: `${message} ${jobParameters(status).text}`
      }]
    };
    return Promise.resolve(got.post(url, {
      body: JSON.stringify(payload)
    })).then(function () {});
  } catch (e) {
    return Promise.reject(e);
  }
};

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

const run = function () {
  try {
    return Promise.resolve(_catch(function () {
      const url = process.env.SLACK_WEBHOOK_URL;

      if (!url) {
        throw new Error('Please set [SLACK_WEBHOOK_URL] environment variable');
      }

      const jobStatus = core$1.getInput('status', {
        required: true
      });

      if (!['success', 'failure', 'cancelled'].includes(jobStatus)) {
        throw new Error('Unknown job status passed in.');
      }

      return Promise.resolve(notify(jobStatus, url)).then(function () {});
    }, function (error) {
      core$1.setFailed(error.message);
      core$1.debug(error.stack);
    }));
  } catch (e) {
    return Promise.reject(e);
  }
};

run();
//# sourceMappingURL=index.js.map