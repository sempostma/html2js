const config = require('./config');

const escapeRegExp = text => text.replace(/\r?\n\s*/gm, '\\n').replace(/"/g, '\\"');

window.html2js = {};
window.html2js.parse = (html, { functionName = 'createNode' } = {}) => {
    var div = document.createElement('div');
    div.innerHTML = html;
    div.normalize();
    var res = 'function ' + functionName + '() {\n';
    var vi = 0;

        
    if (div.childNodes.length > 1) {
        res += 'var container = ' + config.document.createDocumentFragment() + ';\n';
        res += parseRecursive(div, 'container');
        res += 'return container;\n';
    } else if (div.childNodes.length > 0) {
        res += parseRecursive(div.childNodes[0], null);
    }
    res += '}';
    return res;

    function parseRecursive(elem, parent) {
        var ret = '';
        switch (elem.nodeType) {
            case Node.ELEMENT_NODE:
            break;
            case Node.TEXT_NODE:
            if (elem.textContent.trim() === '') return '';
            const textNodeInstruction = config.document.createTextNode(escapeRegExp(elem.textContent));
            if (parent) ret += config.elem.appendChild(parent, textNodeInstruction) + ';\n';
            else ret += 'return ' + textNodeInstruction + ';\n';
            return ret;
            case Node.COMMENT_NODE:
            const textNodeComment = config.document.createComment(elem.textContent);
            if (parent) ret += config.elem.appendChild(parent, textNodeComment) + ';\n';
            else ret += 'return ' + textNodeComment + ';\n';
            return ret;
            default: throw 'element with node type ' + elem.nodeType + ' should not be in loaded with this loader';
        }
        var name = 'e_' + vi++;
        ret += ('var ');
        ret += (name);
        ret += ' = ' + config.document.createElement(elem.tagName.toLowerCase()) + ';\n';
        var attrs = Array.prototype.slice.apply(elem.attributes);
        for (var i = 0; i < attrs.length; i++) {
            ret += config.elem.setAttribute(name, attrs[i].name, attrs[i].value) + ';\n';
        }
        var children = Array.prototype.slice.apply(elem.childNodes);
        for (var j = 0; j < children.length; j++) {
            ret += parseRecursive(children[j], name);
        }
        if (parent) ret += config.elem.appendChild(parent, name) + ';\n';
        else ret += 'return ' + name + ';\n';
        return ret;
    }
}

const parserError = parsedDocument => {
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