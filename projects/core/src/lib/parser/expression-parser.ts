import { Binary, Conditional, ImplicitReceiver, KeyedRead, Lexer, LiteralArray, LiteralMap, LiteralPrimitive, MethodCall, Parser, PrefixNot, PropertyRead } from '@angular/compiler';

const isString = v => typeof v === 'string';
const isDef = v => v !== void 0;
const ifDef = (v, d) => v === void 0 ? d : v;
const plus = (a, b) => void 0 === a ? b : void 0 === b ? a : a + b;
const minus = (a, b) => ifDef(a, 0) - ifDef(b, 0);
const noop = () => { };

const fnCache = new Map();

const primitiveEquals = (a, b) => {
    if (typeof a === 'object' || typeof b === 'object') {
        return false;
    }
    if (a !== a && b !== b) { // NaN case
        return true;
    }
    return a === b;
};

// tslint:disable:no-unused-variable
const detectChanges = (ov, nv) => {
    const len = nv.length;
    let hasChange = len > 10;
    switch (len) {
        // tslint:disable:no-switch-case-fall-through
        case 10: hasChange = !primitiveEquals(ov[9], nv[9]); if (hasChange) { break; }
        case 9: hasChange = !primitiveEquals(ov[8], nv[8]); if (hasChange) { break; }
        case 8: hasChange = !primitiveEquals(ov[7], nv[7]); if (hasChange) { break; }
        case 7: hasChange = !primitiveEquals(ov[6], nv[6]); if (hasChange) { break; }
        case 6: hasChange = !primitiveEquals(ov[5], nv[5]); if (hasChange) { break; }
        case 5: hasChange = !primitiveEquals(ov[4], nv[4]); if (hasChange) { break; }
        case 4: hasChange = !primitiveEquals(ov[3], nv[3]); if (hasChange) { break; }
        case 3: hasChange = !primitiveEquals(ov[2], nv[2]); if (hasChange) { break; }
        case 2: hasChange = !primitiveEquals(ov[1], nv[1]); if (hasChange) { break; }
        case 1: hasChange = !primitiveEquals(ov[0], nv[0]); if (hasChange) { break; }
    }
    return hasChange;
};


class ASTCompiler {
    ast; // ast to be compiled
    declarations; // variable names
    stmts; // function body statements
    vIdx; // variable name index
    cAst; // current AST node in the process
    cStmts;

    constructor(ast) {
        this.ast = ast;
        this.declarations = [];
        this.stmts = [];
        this.vIdx = 0;
    }

    createVar() {
        const v = `v${this.vIdx++}`;
        this.declarations.push(v);
        return v;
    }

    processImplicitReceiver() {
        return 'ctx';
    }

    processLiteralPrimitive() {
        const ast = this.cAst;
        return isString(ast.value) ? `"${ast.value}"` : ast.value;
    }

    processLiteralArray() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const v = this.createVar();
        const s = [];
        for (const item of ast.expressions) {
            s.push(this.build(item));
        }
        stmts.push(`${v}=[${s.join(',')}]`);
        return v;
    }

    processLiteralMap() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const v = this.createVar();
        const _values = [];
        for (const _value of ast.values) {
            _values.push(this.build(_value));
        }
        stmts.push(`${v}={${ast.keys.map((k, i) => k.key + ':' + _values[i])}}`);
        return v;
    }

    processPropertyRead() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const r = this.build(ast.receiver);
        const v = this.createVar();
        stmts.push(`${v}=${r}&&${r}.${ast.name}`);
        return v;
    }

    processKeyedRead() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const k = this.build(ast.key);
        const o = this.build(ast.obj);
        const v = this.createVar();
        stmts.push(`${v}=${o}["${k}"]`);
        return v;
    }

    processPrefixNot() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const r = this.build(ast.expression);
        stmts.push(`${r}=!${r}`);
        return r;
    }

    handleBinaryPlus_Minus() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const l = this.build(ast.left);
        const r = this.build(ast.right);
        const v = this.createVar();
        const m = ast.operation === '+' ? '_plus' : '_minus';
        stmts.push(`${v}=${m}(${l},${r})`);
        return v;
    }

    handleBinaryAND_OR() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const _s1 = [];
        const _s2 = [];
        const l = this.build(ast.left);
        const r = this.build(ast.right, _s2);

        let v = this.createVar();

        if (ast.operation === '&&') {
            v = r;
            _s1.push(
                `if(${l}){`,
                _s2.join(';'),
                `}`
            );
        } else {
            v = l;
            _s1.push(
                `if(!${l}){`,
                _s2.join(';'),
                `;${v}=${r};`,
                `}`
            );
        }
        stmts.push(_s1.join(''));
        return v;
    }

    handleBinaryDefault() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const l = this.build(ast.left);
        const r = this.build(ast.right);
        const v = this.createVar();
        stmts.push(`${v}=${l}${ast.operation}${r}`);
        return v;
    }

    processBinary() {
        const ast = this.cAst;
        const op = ast.operation;
        if (op === '+' || op === '-') {
            return this.handleBinaryPlus_Minus();
        }
        if (op === '&&' || op === '||') {
            return this.handleBinaryAND_OR();
        }

        return this.handleBinaryDefault();
    }

    processConditional() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const condition = this.build(ast.condition);
        const v = this.createVar();
        const _s1 = [];
        const _s2 = [];
        const _s3 = [];
        const trueExp = this.build(ast.trueExp, _s2);
        const falseExp = this.build(ast.falseExp, _s3);

        _s1.push(
            `if(${condition}){`,
            _s2.join(';'),
            `${v}=${trueExp};`,
            `}else{`,
            _s3.join(';'),
            `${v}=${falseExp};`,
            `}`
        );

        stmts.push(_s1.join(' '));
        return v;
    }

    processMethod() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const _args = [];
        for (const arg of ast.args) {
            _args.push(this.build(arg));
        }
        const fn = this.build(ast.receiver);
        const v = this.createVar();
        stmts.push(`${v}=${fn}.${ast.name}&&${fn}.${ast.name}(${_args.join(',')})`);
        return v;
    }

    build(ast, cStmts?) {
        this.cAst = ast;
        this.cStmts = cStmts || this.stmts;

        if (ast instanceof ImplicitReceiver) {
            return this.processImplicitReceiver();
        } else if (ast instanceof LiteralPrimitive) {
            return this.processLiteralPrimitive();
        } else if (ast instanceof LiteralArray) {
            return this.processLiteralArray();
        } else if (ast instanceof LiteralMap) {
            return this.processLiteralMap();
        } else if (ast instanceof PropertyRead) {
            return this.processPropertyRead();
        } else if (ast instanceof KeyedRead) {
            return this.processKeyedRead();
        } else if (ast instanceof PrefixNot) {
            return this.processPrefixNot();
        } else if (ast instanceof Binary) {
            return this.processBinary();
        } else if (ast instanceof Conditional) {
            return this.processConditional();
        } else if (ast instanceof MethodCall) {
            return this.processMethod();
        }
    }

    extendCtxWithLocals() {
        const v1 = this.createVar();
        this.stmts.push(
            `${v1}=Object.assign({}, locals)`,
            `ctx=Object.setPrototypeOf(${v1}, ctx)`
        );
    }

    fnBody() {
        return '"use strict";\nvar ' + this.declarations.join(',') + ';\n' + this.stmts.join(';');
    }

    fnArgs() {
        const args = ['_plus', '_minus', '_isDef'];

        args.push('ctx', 'locals');

        return args.join(',');
    }

    addReturnStmt(result) {
        this.stmts.push(`return ${result};`);
    }

    cleanup() {
        this.ast = this.cAst = this.stmts = this.cStmts = this.declarations = undefined;
    }

    compile() {
        this.extendCtxWithLocals();
        this.addReturnStmt(this.build(this.ast));

        const fn = new Function(this.fnArgs(), this.fnBody());
        const boundFn = fn.bind(undefined, plus, minus, isDef);
        this.cleanup();
        return boundFn;
    }
}

export function $parse(expr) {

    if (!isString(expr)) {
        return noop;
    }

    expr = expr.trim();

    if (!expr.length) {
        return noop;
    }

    let fn = fnCache.get(expr);

    if (fn) {
        return fn;
    }

    const parser = new Parser(new Lexer());
    const ast = parser.parseBinding(expr, '');
    let boundFn;

    if (ast.errors.length) {
        fn = noop;
        boundFn = fn;
    } else {
        const astCompiler = new ASTCompiler(ast.ast);
        fn = astCompiler.compile();
        boundFn = fn;
    }
    fnCache.set(expr, fn);

    return boundFn;
}
