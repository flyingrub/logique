var formules = [
    'p → ((p → q) → q)',
    'p → (¬q → ¬(p → q))',
    '(¬p → ¬q) → (q → p)',
    '(p ∧ (p → q) ∧ ((p → q) → r)) → (p ∧ q ∧ r)',

];
var formule = formules[Math.floor(Math.random()*formules.length)];

function findExpression(expression, goToEnd = false) {
    if (expression[0] == '(') {
        var nextLetter = 1;
        var count = 1
        while (count != 0) {
            if (expression[nextLetter] == '(') count++;
            if (expression[nextLetter] == ')') count--;
            nextLetter++;
        }

        // Begin and end with ()
        if (nextLetter == expression.length && !goToEnd) {
            return findExpression(expression.slice(1, -1));
        } else {
            return { 'firstPartEnd': nextLetter, 'expression': expression};
        }
    } else if (expression[0] == '¬') {
        var res = findExpression(expression.substring(1), true);
        return { 'firstPartEnd': 1 + res.firstPartEnd, 'expression': expression};
    } else { // only one char
        return { 'firstPartEnd': 1, 'expression': expression };
    }
}

function createExpressionObject(expression) {
    var res = findExpression(expression);
    var firstPartEnd = res.firstPartEnd;
    if (res.expression) {
        expression = res.expression;
    }
    return {
        firstPart: expression.substring(0,firstPartEnd),
        operator: expression[firstPartEnd + 1],
        secondPart: expression.substring(firstPartEnd + 3)
    }
}

function decompose(node, name) {
    var e = createExpressionObject(name);
    console.log('EXPRESSION', e)
    if (e.operator == '→') {
        addChildren(node, createNode(not(e.firstPart)));
        addChildren(node, createNode(e.secondPart));
    } else if (e.operator == '∨') {
        addChildren(node, createNode(e.firstPart));
        addChildren(node, createNode(e.secondPart));
    } else if (e.operator == '∧') {
        addChildren(node, createNode([ e.firstPart,  e.secondPart]));
    } else if (e.firstPart.startsWith('¬(')) {
        var e = createExpressionObject(e.firstPart.substring(1));
        console.log('NEXPRESSION', e)
        if (e.operator == '→') {
            addChildren(node, createNode([e.firstPart, not(e.secondPart)]));
        } else if (e.operator == '∨') {
            addChildren(node, createNode([not(e.firstPart), not(e.secondPart)]));
        } else if (e.operator == '∧') {
            addChildren(node, createNode(not(e.firstPart)));
            addChildren(node, createNode(not(e.secondPart)));
        } else if (e.firstPart.startsWith('¬') && !e.secondPart) {
            addChildren(node, createNode(e.firstPart.substring(1)));
        }
    } else if (e.firstPart.startsWith('¬¬') && !e.secondPart) {
        console.log('NNEXPRESSION', e)
        addChildren(node, createNode(e.firstPart.substring(2)));
    }
}

function not(s) {
    if (s.length > 1) {
        return '¬(' + s + ')';
    } else {
        return '¬' + s;
    }
    
}

function addOldExpression(node, name) {
    oldEXpression = node.name.filter(function (ex) {
        return ex != name;
    });
    if (node.children) {
        oldEXpression.forEach(function(n) {
            node.children.forEach(function(c){
                c.name.push(n);
            });
        });
        node.computed = name;
    } else {
        var needCompute = node.name.some(function(n){
            return n.length > 2;
        });
        var incoherent = false;
        for (var k = 0; k < node.name.length; k++) {
            var compare = node.name[k];
            if ('¬' + compare == name || '¬' + name == compare) {
                incoherent = true;
            }
        }
        if (!needCompute) {
            node.computed = name;
            node.end = true;
            node.incoherent = incoherent;
        }
    }
}

// Toggle children on click.
function click(node, name) {
  if (node.computed) return;
  decompose(node, name);
  addOldExpression(node, name);
  console.log('CNODE', node); 
  update(node);
}
function createNode(name) {
    if (!Array.isArray(name)) name = [ name ];
    return { 'name': name };
}

function addChildren(node, children) {
    if (node.children) {
        node.children.push(children);
    } else {
        node['children'] = [ children ];
    }
}

// INIT
createTree(createNode(formules[2]));
