

(function (global) {
    'use strict';

    function escapeRegExp(text) {
        return text.replace(/\n/g, '\\n');
    }

    var html2js = function () { };
    html2js.parse = function (html, functionName, containerName) {
        functionName = functionName || 'createNode';
        containerName = containerName || 'container';
        // var parser = new DOMParser();
        // var dom = parser.parseFromString('', 'text/html');
        // if (parserError(dom)) return parserError(dom).textContent;
        var div = document.createElement('div');
        div.innerHTML = html;
        var res = ['function ', functionName, '(', containerName, ')', ' {\n'];
        // div.normalize();
        var vi = 0;

        if (div.children.length > 1) {
            parseRecursive(div, containerName);
        } else {
            parseRecursive(div.firstChild, containerName);
        }

        res.push('}');
        return res.join('');

        function parseRecursive(elem, parent) {
            var name = 'e_' + vi++;
            res.push('var ');
            res.push(name);
            if (elem.nodeType === 3) {
                res.push(' = document.createTextNode("');
                res.push(escapeRegExp(elem.textContent));
                res.push('");\n');
                return;
            }
            res.push(' = document.createElement("');
            res.push(elem.tagName.toLowerCase());
            res.push('");\n');
            var attrs = Array.prototype.slice.apply(elem.attributes);
            for (var i = 0; i < attrs.length; i++) {
                res.push(name);
                res.push('.setAttribute("');
                res.push(attrs[i].name);
                res.push('", "');
                res.push(attrs[i].value);
                res.push('");\n');
            }
            var children = Array.prototype.slice.apply(elem.childNodes);
            for (var j = 0; j < children.length; j++) {
                parseRecursive(children[j], name);
            }
            res.push(parent);
            res.push('.appendChild(');
            res.push(name);
            res.push(');\n');
        }
    }

    function parserError(parsedDocument) {
        // parser and parsererrorNS could be cached on startup for efficiency
        var parser = new DOMParser(),
            errorneousParse = parser.parseFromString('<', 'text/xml'),
            parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;

        if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
            // In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
            return parsedDocument.getElementsByTagName("parsererror").length > 0
                ? parsedDocument.children[0] : false;
        }

        return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0
            ? parsedDocument.children[0] : false;
    };

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return html2js; });
        // CommonJS and Node.js module support.
    } else if (typeof exports !== 'undefined') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = html2js;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.html2js = html2js;
    } else {
        global.html2js = html2js;
    }
})(this);

