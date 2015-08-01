var expr = "2a + 4 * 3 ^ 2";

var tokens = {
    LPAREN      : /[([{]/,
    RPAREN      : /[)\]}]/,
    OPERATOR    : /[\+\-\*\/\^]/,
    FUNCTION    : /sin|cos|tan/,
    VARIABLE    : /[A-Za-z][\w]*/,
    NUMBER      : /\d+(\.\d+)?/,
    WHITESPACE  : /\s+/
};
var list = [];
var cursor = 0;

while (cursor < expr.length) {
    for (k in tokens) {
        var match = expr.substr(cursor).match(tokens[k]);

        if (match != null && match.index == 0) {
            console.log("" + k + match[0]);
            cursor += match[0].length - 1;
            break;
        }
    }
    cursor++;
}

