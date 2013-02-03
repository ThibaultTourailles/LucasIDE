ace.define('ace/mode/lucas', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/lucas_highlight_rules', 'ace/mode/folding/lucasic', 'ace/range'], function(require, exports, module) {


var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var Tokenizer = require("../tokenizer").Tokenizer;
var LucasHighlightRules = require("./lucas_highlight_rules").LucasHighlightRules;
var LucasFoldMode = require("./folding/lucasic").FoldMode;
var Range = require("../range").Range;

var Mode = function() {
    this.$tokenizer = new Tokenizer(new LucasHighlightRules().getRules());
    this.foldingRules = new LucasFoldMode("\\:");
};
oop.inherits(Mode, TextMode);

(function() {

    this.toggleCommentLines = function(state, doc, startRow, endRow) {
        var outdent = true;
        var re = /^(\s*)#/;

        for (var i=startRow; i<= endRow; i++) {
            if (!re.test(doc.getLine(i))) {
                outdent = false;
                break;
            }
        }

        if (outdent) {
            var deleteRange = new Range(0, 0, 0, 0);
            for (var i=startRow; i<= endRow; i++)
            {
                var line = doc.getLine(i);
                var m = line.match(re);
                deleteRange.start.row = i;
                deleteRange.end.row = i;
                deleteRange.end.column = m[0].length;
                doc.replace(deleteRange, m[1]);
            }
        }
        else {
            doc.indentRows(startRow, endRow, "#");
        }
    };

    this.getNextLineIndent = function(state, line, tab) {
        var indent = this.$getIndent(line);

        var tokenizedLine = this.$tokenizer.getLineTokens(line, state);
        var tokens = tokenizedLine.tokens;

        if (tokens.length && tokens[tokens.length-1].type == "comment") {
            return indent;
        }

        if (state == "start") {
            var match = line.match(/^.*[\{\(\[\:]\s*$/);
            if (match) {
                indent += tab;
            }
        }

        return indent;
    };

    var outdents = {
        "pass": 1,
        "return": 1,
        "raise": 1,
        "break": 1,
        "continue": 1
    };
    
    this.checkOutdent = function(state, line, input) {
        if (input !== "\r\n" && input !== "\r" && input !== "\n")
            return false;

        var tokens = this.$tokenizer.getLineTokens(line.trim(), state).tokens;
        
        if (!tokens)
            return false;
        do {
            var last = tokens.pop();
        } while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
        
        if (!last)
            return false;
        
        return (last.type == "keyword" && outdents[last.value]);
    };

    this.autoOutdent = function(state, doc, row) {
        
        row += 1;
        var indent = this.$getIndent(doc.getLine(row));
        var tab = doc.getTabString();
        if (indent.slice(-tab.length) == tab)
            doc.remove(new Range(row, indent.length-tab.length, row, indent.length));
    };

}).call(Mode.prototype);

exports.Mode = Mode;
});

ace.define('ace/mode/lucas_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) {


var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var LucasHighlightRules = function() {

var keywords = (
        "PROGRAMME|" +
        "ET|OU|" +
        "SI|ALORS|SINON|SINONSI"
    );

    var keywordsControl = "TANTQUE|FAIRE|FAIRETANTQUE"

    var builtinConstants = (
        "VRAI|FAUX|Out"
    );

    var builtinFunctions = (
        "ecrire|AFI"
    );

    var variableLanguage = "RETOURNER";

    var types = "Entier|Flottant|Booleen|Car|Chc";

    var keywordMapper = this.createKeywordMapper({
        "invalid.deprecated": "",               // dafuq
        "support.function": builtinFunctions,   // Fonctions fournies de base
        "variable.language": variableLanguage,  // Variable de language
        "constant.language": builtinConstants,  // Constantes de language
        "keyword": keywords,                    // Mots clé
        "entity.name.tag" : types,              // Types de variable
        "keyword.control": keywordsControl,     // Mots clé de contrôle ( while, continue...)
    }, "identifier");

    var strPre = "(?:r|u|ur|R|U|UR|Ur|uR)?";

    var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
    var integer = "(?:" + decimalInteger + ")";

    var exponent = "(?:[eE][+-]?\\d+)";
    var fraction = "(?:\\.\\d+)";
    var intPart = "(?:\\d+)";
    var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
    var exponentFloat = "(?:(?:" + pointFloat + "|" +  intPart + ")" + exponent + ")";
    var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";

    this.$rules = {
        
        "start" : [ {
            token : "comment",
            regex : "\/\/.*$"
        }, {
            token : "comment", // multi line comment
            regex : "\\/\\*",
            next : "comment"
        }, {
            token : "string",           // " string
            regex : strPre + '"(?:[^\\\\]|\\\\.)*?"'
        }, {
            token : "string",           // ' string
            regex : strPre + "'(?:[^\\\\]|\\\\.)*?'"
        }, {
            token : "constant.numeric", // imaginary
            regex : "(?:" + floatNumber + "|\\d+)[jJ]\\b"
        }, {
            token : "constant.numeric", // float
            regex : floatNumber
        }, {
            token : "constant.numeric", // integer
            regex : integer + "\\b"
        }, {
            token : "paren.lparen",
            regex : "{"
        }, {
            token : "paren.rparen",
            regex : "}"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="
        }, {
            token : "text",
            regex : "\\s+"
        } ],
        "qstring":[ {
            token : "string",
            regex : '.+'
        } ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ]
    };
};

oop.inherits(LucasHighlightRules, TextHighlightRules);

exports.LucasHighlightRules = LucasHighlightRules;
}), ace.define("ace/mode/folding/lucasic", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function (e, t, n) {
    var r = e("../../lib/oop"),
        i = e("../../range").Range,
        s = e("./fold_mode").FoldMode,
        o = t.FoldMode = function () {};
    r.inherits(o, s),
    function () {
        this.foldingStartMarker = /(\{)[^\}]*$|^\s*(\/\*)/, this.foldingStopMarker = /^[^\{]*(\})|^[\s\*]*(\*\/)/, this.getFoldWidgetRange = function (e, t, n) {
            var r = e.getLine(n),
                i = r.match(this.foldingStartMarker);
            if (i) {
                var s = i.index;
                return i[1] ? this.openingBracketBlock(e, i[1], n, s) : e.getCommentFoldRange(n, s + i[0].length, 1)
            }
            if (t !== "markbeginend") return;
            var i = r.match(this.foldingStopMarker);
            if (i) {
                var s = i.index + i[0].length;
                return i[1] ? this.closingBracketBlock(e, i[1], n, s) : e.getCommentFoldRange(n, s, -1)
            }
        }
    }.call(o.prototype)
});