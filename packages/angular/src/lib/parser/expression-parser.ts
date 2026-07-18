import { Binary, Conditional, ImplicitReceiver, KeyedRead, Lexer, LiteralArray, LiteralMap, LiteralPrimitive, Call, Parser, PrefixNot, PropertyRead, AST, ParseLocation, ParseSourceFile, ParseSourceSpan } from '@angular/compiler';

const isString = (v: any) => typeof v === 'string';
const ifDef = (v: undefined, d: number) => v === void 0 ? d : v;
const plus = (a: undefined, b: undefined) => void 0 === a ? b : void 0 === b ? a : a + b;
const minus = (a: undefined, b: undefined) => ifDef(a, 0) - ifDef(b, 0);
const noop = () => { };

const fnCache = new Map();

function bindingSourceSpan(expr: string): ParseSourceSpan {
    const file = new ParseSourceFile(expr, 'expression');
    const start = new ParseLocation(file, 0, 0, 0);
    const end = new ParseLocation(file, expr.length, 0, expr.length);
    return new ParseSourceSpan(start, end);
}

class ASTCompiler {
    ast: any; // ast to be compiled
    declarations: any; // variable names
    stmts: any; // function body statements
    vIdx; // variable name index
    cAst: any; // current AST node in the process
    cStmts: any;

    constructor(ast: AST) {
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
        return isString(ast.value) ? JSON.stringify(ast.value) : ast.value;
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
        const _values: any[] = [];
        for (const _value of ast.values) {
            _values.push(this.build(_value));
        }
        stmts.push(`${v}={${ast.keys.map((k: { key: string; }, i: any) => JSON.stringify(k.key) + ':' + _values[i])}}`);
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
        // Angular 20 exposes the keyed-read target as `receiver` (older versions used `obj`).
        const o = this.build(ast.receiver ?? ast.obj);
        const v = this.createVar();
        stmts.push(`${v}=${o}&&${o}[${k}]`);
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
        const _s2: any[] = [];
        const l = this.build(ast.left);
        const r = this.build(ast.right, _s2);

        const v = this.createVar();

        if (ast.operation === '&&') {
            _s1.push(
                `${v}=${l};`,
                `if(${l}){`,
                _s2.join(';'),
                `;${v}=${r};`,
                `}`
            );
        } else {
            _s1.push(
                `${v}=${l};`,
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
        const _s2: any[] = [];
        const _s3: any[] = [];
        const trueExp = this.build(ast.trueExp, _s2);
        const falseExp = this.build(ast.falseExp, _s3);

        _s1.push(
            `if(${condition}){`,
            _s2.join(';'),
            `;${v}=${trueExp};`,
            `}else{`,
            _s3.join(';'),
            `;${v}=${falseExp};`,
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
        const v = this.createVar();

        // Angular 20 represents a method call as Call(PropertyRead(receiver, name), args).
        // Compile that shape without losing the method's `this` binding.
        if (ast.receiver instanceof PropertyRead) {
            const target = this.build(ast.receiver.receiver);
            const methodName = ast.receiver.name;
            stmts.push(`${v}=${target}&&${target}.${methodName}&&${target}.${methodName}(${_args.join(',')})`);
        } else {
            const fn = this.build(ast.receiver);
            stmts.push(`${v}=${fn}&&${fn}(${_args.join(',')})`);
        }
        return v;
    }

    build(ast: any, cStmts?: any[] | undefined): any {
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
        } else if (ast instanceof Call) {
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
        const args = ['_plus', '_minus'];

        args.push('ctx', 'locals');

        return args.join(',');
    }

    addReturnStmt(result: any) {
        this.stmts.push(`return ${result};`);
    }

    cleanup() {
        this.ast = this.cAst = this.stmts = this.cStmts = this.declarations = undefined;
    }

    compile() {
        this.extendCtxWithLocals();
        this.addReturnStmt(this.build(this.ast));

        const fn = new Function(this.fnArgs(), this.fnBody());
        const boundFn = fn.bind(undefined, plus, minus);
        this.cleanup();
        return boundFn;
    }
}

export function $parse(expr: string) {

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
    const ast = parser.parseBinding(expr, bindingSourceSpan(expr), 0);
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
