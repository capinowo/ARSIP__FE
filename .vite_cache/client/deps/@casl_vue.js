import "./chunk-BSPL5VGI.js";

// node_modules/@casl/vue/dist/es6m/index.mjs
import { ref as t3, inject as i4, provide as n3, defineComponent as r2 } from "vue";

// node_modules/@ucast/core/dist/es6m/index.mjs
var t = class {
  constructor(t4, e4) {
    this.operator = t4, this.value = e4, Object.defineProperty(this, "t", { writable: true });
  }
  get notes() {
    return this.t;
  }
  addNote(t4) {
    this.t = this.t || [], this.t.push(t4);
  }
};
var e = class extends t {
};
var r = class extends e {
  constructor(t4, e4) {
    if (!Array.isArray(e4)) throw new Error(`"${t4}" operator expects to receive an array of conditions`);
    super(t4, e4);
  }
};
var n = "__itself__";
var o = class extends t {
  constructor(t4, e4, r3) {
    super(t4, r3), this.field = e4;
  }
};
var s = new e("__null__", null);
var i = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
function c(t4, e4) {
  return e4 instanceof r && e4.operator === t4;
}
function u(t4, e4) {
  return 1 === e4.length ? e4[0] : new r(t4, function t5(e5, r3, n4) {
    const o3 = n4 || [];
    for (let n5 = 0, s4 = r3.length; n5 < s4; n5++) {
      const s5 = r3[n5];
      c(e5, s5) ? t5(e5, s5.value, o3) : o3.push(s5);
    }
    return o3;
  }(t4, e4));
}
var a = (t4) => t4;
var h = () => /* @__PURE__ */ Object.create(null);
var f = Object.defineProperty(h(), "__@type@__", { value: "ignore value" });
function l(t4, e4, r3 = false) {
  if (!t4 || t4 && t4.constructor !== Object) return false;
  for (const n4 in t4) {
    if (i(t4, n4) && i(e4, n4) && (!r3 || t4[n4] !== f)) return true;
  }
  return false;
}
function d(t4) {
  const e4 = [];
  for (const r3 in t4) i(t4, r3) && t4[r3] !== f && e4.push(r3);
  return e4;
}
function p(t4, e4) {
  e4 !== s && t4.push(e4);
}
var w = (t4) => u("and", t4);
var O = { compound(t4, e4, n4) {
  const o3 = (Array.isArray(e4) ? e4 : [e4]).map((t5) => n4.parse(t5));
  return new r(t4.name, o3);
}, field: (t4, e4, r3) => new o(t4.name, r3.field, e4), document: (t4, r3) => new e(t4.name, r3) };
var j = class {
  constructor(t4, e4 = h()) {
    this.o = void 0, this.s = void 0, this.i = void 0, this.u = void 0, this.h = void 0, this.parse = this.parse.bind(this), this.u = { operatorToConditionName: e4.operatorToConditionName || a, defaultOperatorName: e4.defaultOperatorName || "eq", mergeFinalConditions: e4.mergeFinalConditions || w }, this.o = Object.keys(t4).reduce((e5, r3) => (e5[r3] = Object.assign({ name: this.u.operatorToConditionName(r3) }, t4[r3]), e5), {}), this.s = Object.assign({}, e4.fieldContext, { field: "", query: {}, parse: this.parse, hasOperators: (t5) => l(t5, this.o, e4.useIgnoreValue) }), this.i = Object.assign({}, e4.documentContext, { parse: this.parse, query: {} }), this.h = e4.useIgnoreValue ? d : Object.keys;
  }
  setParse(t4) {
    this.parse = t4, this.s.parse = t4, this.i.parse = t4;
  }
  parseField(t4, e4, r3, n4) {
    const o3 = this.o[e4];
    if (!o3) throw new Error(`Unsupported operator "${e4}"`);
    if ("field" !== o3.type) throw new Error(`Unexpected ${o3.type} operator "${e4}" at field level`);
    return this.s.field = t4, this.s.query = n4, this.parseInstruction(o3, r3, this.s);
  }
  parseInstruction(t4, e4, r3) {
    "function" == typeof t4.validate && t4.validate(t4, e4);
    return (t4.parse || O[t4.type])(t4, e4, r3);
  }
  parseFieldOperators(t4, e4) {
    const r3 = [], n4 = this.h(e4);
    for (let o3 = 0, s4 = n4.length; o3 < s4; o3++) {
      const s5 = n4[o3];
      if (!this.o[s5]) throw new Error(`Field query for "${t4}" may contain only operators or a plain object as a value`);
      p(r3, this.parseField(t4, s5, e4[s5], e4));
    }
    return r3;
  }
  parse(t4) {
    const e4 = [], r3 = this.h(t4);
    this.i.query = t4;
    for (let n4 = 0, o3 = r3.length; n4 < o3; n4++) {
      const o4 = r3[n4], s4 = t4[o4], i5 = this.o[o4];
      if (i5) {
        if ("document" !== i5.type && "compound" !== i5.type) throw new Error(`Cannot use parsing instruction for operator "${o4}" in "document" context as it is supposed to be used in  "${i5.type}" context`);
        p(e4, this.parseInstruction(i5, s4, this.i));
      } else this.s.hasOperators(s4) ? e4.push(...this.parseFieldOperators(o4, s4)) : p(e4, this.parseField(o4, this.u.defaultOperatorName, s4, t4));
    }
    return this.u.mergeFinalConditions(e4);
  }
};
function _(t4, e4) {
  const r3 = t4[e4];
  if ("function" != typeof r3) throw new Error(`Unable to interpret "${e4}" condition. Did you forget to register interpreter for it?`);
  return r3;
}
function y(t4) {
  return t4.operator;
}
function m(t4, e4) {
  const r3 = e4, n4 = r3 && r3.getInterpreterName || y;
  let o3;
  switch (r3 ? r3.numberOfArguments : 0) {
    case 1:
      o3 = (e5) => {
        const o4 = n4(e5, r3);
        return _(t4, o4)(e5, s4);
      };
      break;
    case 3:
      o3 = (e5, o4, i5) => {
        const c4 = n4(e5, r3);
        return _(t4, c4)(e5, o4, i5, s4);
      };
      break;
    default:
      o3 = (e5, o4) => {
        const i5 = n4(e5, r3);
        return _(t4, i5)(e5, o4, s4);
      };
  }
  const s4 = Object.assign({}, r3, { interpret: o3 });
  return s4.interpret;
}
function v(t4, e4) {
  return (r3, ...n4) => {
    const o3 = t4(r3, ...n4), s4 = e4.bind(null, o3);
    return s4.ast = o3, s4;
  };
}
var x = j.prototype.parseInstruction;

// node_modules/@ucast/mongo/dist/es6m/index.mjs
function s2(e4, t4) {
  if (!Array.isArray(t4)) throw new Error(`"${e4.name}" expects value to be an array`);
}
function p2(e4, t4) {
  if (s2(e4, t4), !t4.length) throw new Error(`"${e4.name}" expects to have at least one element in array`);
}
var l2 = (e4) => (t4, r3) => {
  if (typeof r3 !== e4) throw new Error(`"${t4.name}" expects value to be a "${e4}"`);
};
var c2 = { type: "compound", validate: p2, parse(t4, r3, { parse: o3 }) {
  const a4 = r3.map((e4) => o3(e4));
  return u(t4.name, a4);
} };
var f2 = c2;
var d2 = { type: "compound", validate: p2 };
var u2 = { type: "field", validate(e4, t4) {
  if (!(t4 && (t4 instanceof RegExp || t4.constructor === Object))) throw new Error(`"${e4.name}" expects to receive either regular expression or object of field operators`);
}, parse(e4, o3, a4) {
  const n4 = o3 instanceof RegExp ? new o("regex", a4.field, o3) : a4.parse(o3, a4);
  return new r(e4.name, [n4]);
} };
var $ = { type: "field", validate(e4, t4) {
  if (!t4 || t4.constructor !== Object) throw new Error(`"${e4.name}" expects to receive an object with nested query or field level operators`);
}, parse(e4, r3, { parse: a4, field: n4, hasOperators: i5 }) {
  const s4 = i5(r3) ? a4(r3, { field: n }) : a4(r3);
  return new o(e4.name, n4, s4);
} };
var w2 = { type: "field", validate: l2("number") };
var y2 = { type: "field", validate: s2 };
var x2 = y2;
var v2 = y2;
var h2 = { type: "field", validate(e4, t4) {
  if (!Array.isArray(t4) || 2 !== t4.length) throw new Error(`"${e4.name}" expects an array with 2 numeric elements`);
} };
var m2 = { type: "field", validate: l2("boolean") };
var g = { type: "field", validate: function(e4, t4) {
  if (!("string" == typeof t4 || "number" == typeof t4 || t4 instanceof Date)) throw new Error(`"${e4.name}" expects value to be comparable (i.e., string, number or date)`);
} };
var b = g;
var E = b;
var j2 = b;
var O2 = { type: "field" };
var R = O2;
var _2 = { type: "field", validate(e4, t4) {
  if (!(t4 instanceof RegExp) && "string" != typeof t4) throw new Error(`"${e4.name}" expects value to be a regular expression or a string that represents regular expression`);
}, parse(e4, r3, o3) {
  const a4 = "string" == typeof r3 ? new RegExp(r3, o3.query.$options || "") : r3;
  return new o(e4.name, o3.field, a4);
} };
var q = { type: "field", parse: () => s };
var A = { type: "document", validate: l2("function") };
var N = Object.freeze({ __proto__: null, $and: c2, $or: f2, $nor: d2, $not: u2, $elemMatch: $, $size: w2, $in: y2, $nin: x2, $all: v2, $mod: h2, $exists: m2, $gte: g, $gt: b, $lt: E, $lte: j2, $eq: O2, $ne: R, $regex: _2, $options: q, $where: A });
var P = class extends j {
  constructor(e4) {
    super(e4, { defaultOperatorName: "$eq", operatorToConditionName: (e5) => e5.slice(1) });
  }
  parse(e4, t4) {
    return t4 && t4.field ? w(this.parseFieldOperators(t4.field, e4)) : super.parse(e4);
  }
};
var z = N;

// node_modules/@ucast/js/dist/es6m/index.mjs
function n2(r3, t4, n4) {
  for (let e4 = 0, o3 = r3.length; e4 < o3; e4++) if (0 === n4(r3[e4], t4)) return true;
  return false;
}
function e2(r3, t4) {
  return Array.isArray(r3) && Number.isNaN(Number(t4));
}
function o2(r3, t4, n4) {
  if (!e2(r3, t4)) return n4(r3, t4);
  let o3 = [];
  for (let e4 = 0; e4 < r3.length; e4++) {
    const u6 = n4(r3[e4], t4);
    void 0 !== u6 && (o3 = o3.concat(u6));
  }
  return o3;
}
function u3(r3) {
  return (t4, n4, e4) => {
    const o3 = e4.get(n4, t4.field);
    return Array.isArray(o3) ? o3.some((n5) => r3(t4, n5, e4)) : r3(t4, o3, e4);
  };
}
var c3 = (r3, t4) => r3[t4];
function i2(r3, t4, n4) {
  const e4 = t4.lastIndexOf(".");
  return -1 === e4 ? [r3, t4] : [n4(r3, t4.slice(0, e4)), t4.slice(e4 + 1)];
}
function f3(t4, n4, e4 = c3) {
  if (n4 === n) return t4;
  if (!t4) throw new Error(`Unable to get field "${n4}" out of ${String(t4)}.`);
  return function(r3, t5, n5) {
    if (-1 === t5.indexOf(".")) return o2(r3, t5, n5);
    const e5 = t5.split(".");
    let u6 = r3;
    for (let r4 = 0, t6 = e5.length; r4 < t6; r4++) if (u6 = o2(u6, e5[r4], n5), !u6 || "object" != typeof u6) return u6;
    return u6;
  }(t4, n4, e4);
}
function a2(r3, t4) {
  return r3 === t4 ? 0 : r3 > t4 ? 1 : -1;
}
function l3(r3, n4 = {}) {
  return m(r3, Object.assign({ get: f3, compare: a2 }, n4));
}
var p3 = (r3, t4, { interpret: n4 }) => r3.value.some((r4) => n4(r4, t4));
var g2 = (r3, t4, n4) => !p3(r3, t4, n4);
var m3 = (r3, t4, { interpret: n4 }) => r3.value.every((r4) => n4(r4, t4));
var y3 = (r3, t4, { interpret: n4 }) => !n4(r3.value[0], t4);
var b2 = (r3, t4, { compare: e4, get: o3 }) => {
  const u6 = o3(t4, r3.field);
  return Array.isArray(u6) && !Array.isArray(r3.value) ? n2(u6, r3.value, e4) : 0 === e4(u6, r3.value);
};
var A2 = (r3, t4, n4) => !b2(r3, t4, n4);
var d3 = u3((r3, t4, n4) => {
  const e4 = n4.compare(t4, r3.value);
  return 0 === e4 || -1 === e4;
});
var h3 = u3((r3, t4, n4) => -1 === n4.compare(t4, r3.value));
var j3 = u3((r3, t4, n4) => 1 === n4.compare(t4, r3.value));
var w3 = u3((r3, t4, n4) => {
  const e4 = n4.compare(t4, r3.value);
  return 0 === e4 || 1 === e4;
});
var _3 = (t4, n4, { get: o3 }) => {
  if (t4.field === n) return void 0 !== n4;
  const [u6, c4] = i2(n4, t4.field, o3), f4 = (r3) => null == r3 ? Boolean(r3) === t4.value : r3.hasOwnProperty(c4) === t4.value;
  return e2(u6, c4) ? u6.some(f4) : f4(u6);
};
var v3 = u3((r3, t4) => "number" == typeof t4 && t4 % r3.value[0] === r3.value[1]);
var x3 = (t4, n4, { get: o3 }) => {
  const [u6, c4] = i2(n4, t4.field, o3), f4 = (r3) => {
    const n5 = o3(r3, c4);
    return Array.isArray(n5) && n5.length === t4.value;
  };
  return t4.field !== n && e2(u6, c4) ? u6.some(f4) : f4(u6);
};
var O3 = u3((r3, t4) => "string" == typeof t4 && r3.value.test(t4));
var N2 = u3((r3, t4, { compare: e4 }) => n2(r3.value, t4, e4));
var $2 = (r3, t4, n4) => !N2(r3, t4, n4);
var q2 = (r3, t4, { compare: e4, get: o3 }) => {
  const u6 = o3(t4, r3.field);
  return Array.isArray(u6) && r3.value.every((r4) => n2(u6, r4, e4));
};
var z2 = (r3, t4, { interpret: n4, get: e4 }) => {
  const o3 = e4(t4, r3.field);
  return Array.isArray(o3) && o3.some((t5) => n4(r3.value, t5));
};
var B = (r3, t4) => r3.value.call(t4);
var E2 = Object.freeze({ __proto__: null, or: p3, nor: g2, and: m3, not: y3, eq: b2, ne: A2, lte: d3, lt: h3, gt: j3, gte: w3, exists: _3, mod: v3, size: x3, regex: O3, within: N2, nin: $2, all: q2, elemMatch: z2, where: B });
var M = Object.assign({}, E2, { in: N2 });
var S = l3(M);

// node_modules/@ucast/mongo2js/dist/es6m/index.mjs
function i3(o3) {
  return o3 instanceof Date ? o3.getTime() : o3 && "function" == typeof o3.toJSON ? o3.toJSON() : o3;
}
var m4 = (o3, t4) => a2(i3(o3), i3(t4));
function p4(e4, c4, f4) {
  const s4 = new P(e4), i5 = l3(c4, Object.assign({ compare: m4 }, f4));
  if (f4 && f4.forPrimitives) {
    const o3 = { field: n }, r3 = s4.parse;
    s4.setParse((t4) => r3(t4, o3));
  }
  return v(s4.parse, i5);
}
var a3 = p4(z, M);
var u4 = p4(["$and", "$or"].reduce((o3, t4) => (o3[t4] = Object.assign({}, o3[t4], { type: "field" }), o3), Object.assign({}, z, { $nor: Object.assign({}, z.$nor, { type: "field", parse: O.compound }) })), M, { forPrimitives: true });

// node_modules/@casl/ability/dist/es6m/index.mjs
function O4(t4) {
  return Array.isArray(t4) ? t4 : [t4];
}
var C = "__caslSubjectType__";
var P2 = (t4) => {
  const i5 = typeof t4;
  return i5 === "string" || i5 === "function";
};
var S2 = (t4) => t4.modelName || t4.name;
function T(t4) {
  return typeof t4 === "string" ? t4 : S2(t4);
}
function z3(t4) {
  if (Object.hasOwn(t4, C)) return t4[C];
  return S2(t4.constructor);
}
var B2 = { function: (t4) => t4.constructor, string: z3 };
function U(t4, i5, e4) {
  for (let s4 = e4; s4 < i5.length; s4++) t4.push(i5[s4]);
}
function G(t4, i5) {
  if (!t4 || !t4.length) return i5 || [];
  if (!i5 || !i5.length) return t4 || [];
  let e4 = 0;
  let s4 = 0;
  const n4 = [];
  while (e4 < t4.length && s4 < i5.length) if (t4[e4].priority < i5[s4].priority) {
    n4.push(t4[e4]);
    e4++;
  } else {
    n4.push(i5[s4]);
    s4++;
  }
  U(n4, t4, e4);
  U(n4, i5, s4);
  return n4;
}
function H(t4, i5, e4) {
  let s4 = t4.get(i5);
  if (!s4) {
    s4 = e4();
    t4.set(i5, s4);
  }
  return s4;
}
var I = (t4) => t4;
function J(t4, i5) {
  if (Array.isArray(t4.fields) && !t4.fields.length) throw new Error("`rawRule.fields` cannot be an empty array. https://bit.ly/390miLa");
  if (t4.fields && !i5.fieldMatcher) throw new Error('You need to pass "fieldMatcher" option in order to restrict access by fields');
  if (t4.conditions && !i5.conditionsMatcher) throw new Error('You need to pass "conditionsMatcher" option in order to restrict access by conditions');
}
var K = class {
  constructor(t4, i5, e4 = 0) {
    J(t4, i5);
    this.action = i5.resolveAction(t4.action);
    this.subject = t4.subject;
    this.inverted = !!t4.inverted;
    this.conditions = t4.conditions;
    this.reason = t4.reason;
    this.origin = t4;
    this.fields = t4.fields ? O4(t4.fields) : void 0;
    this.priority = e4;
    this.t = i5;
  }
  i() {
    if (this.conditions && !this.o) this.o = this.t.conditionsMatcher(this.conditions);
    return this.o;
  }
  get ast() {
    const t4 = this.i();
    return t4 ? t4.ast : void 0;
  }
  matchesConditions(t4) {
    if (!this.conditions) return true;
    if (!t4 || P2(t4)) return !this.inverted;
    const i5 = this.i();
    return i5(t4);
  }
  matchesField(t4) {
    if (!this.fields) return true;
    if (!t4) return !this.inverted;
    if (this.fields && !this.u) this.u = this.t.fieldMatcher(this.fields);
    return this.u(t4);
  }
};
function N3(t4, i5) {
  const e4 = { value: t4, prev: i5, next: null };
  if (i5) i5.next = e4;
  return e4;
}
function Q(t4) {
  if (t4.next) t4.next.prev = t4.prev;
  if (t4.prev) t4.prev.next = t4.next;
  t4.next = t4.prev = null;
}
var V = (t4) => ({ value: t4.value, prev: t4.prev, next: t4.next });
var W = () => ({ rules: [], merged: false });
var X = () => /* @__PURE__ */ new Map();
var Z = class {
  constructor(t4 = [], i5 = {}) {
    this.h = false;
    this.l = /* @__PURE__ */ new Map();
    this.p = { conditionsMatcher: i5.conditionsMatcher, fieldMatcher: i5.fieldMatcher, resolveAction: i5.resolveAction || I };
    this.$ = i5.anyAction || "manage";
    this.A = i5.anySubjectType || "all";
    this.m = t4;
    this.M = !!i5.detectSubjectType;
    this.j = i5.detectSubjectType || z3;
    this.v(t4);
  }
  get rules() {
    return this.m;
  }
  detectSubjectType(t4) {
    if (P2(t4)) return t4;
    if (!t4) return this.A;
    return this.j(t4);
  }
  update(t4) {
    const i5 = { rules: t4, ability: this, target: this };
    this._("update", i5);
    this.m = t4;
    this.v(t4);
    this._("updated", i5);
    return this;
  }
  v(t4) {
    const i5 = /* @__PURE__ */ new Map();
    let e4;
    for (let s4 = t4.length - 1; s4 >= 0; s4--) {
      const n4 = t4.length - s4 - 1;
      const r3 = new K(t4[s4], this.p, n4);
      const o3 = O4(r3.action);
      const c4 = O4(r3.subject || this.A);
      if (!this.h && r3.fields) this.h = true;
      for (let t5 = 0; t5 < c4.length; t5++) {
        const s5 = H(i5, c4[t5], X);
        if (e4 === void 0) e4 = typeof c4[t5];
        if (typeof c4[t5] !== e4 && e4 !== "mixed") e4 = "mixed";
        for (let t6 = 0; t6 < o3.length; t6++) H(s5, o3[t6], W).rules.push(r3);
      }
    }
    this.l = i5;
    if (e4 !== "mixed" && !this.M) {
      const t5 = B2[e4] || B2.string;
      this.j = t5;
    }
  }
  possibleRulesFor(t4, i5 = this.A) {
    if (!P2(i5)) throw new Error('"possibleRulesFor" accepts only subject types (i.e., string or class) as the 2nd parameter');
    const e4 = H(this.l, i5, X);
    const s4 = H(e4, t4, W);
    if (s4.merged) return s4.rules;
    const n4 = t4 !== this.$ && e4.has(this.$) ? e4.get(this.$).rules : void 0;
    let r3 = G(s4.rules, n4);
    if (i5 !== this.A) r3 = G(r3, this.possibleRulesFor(t4, this.A));
    s4.rules = r3;
    s4.merged = true;
    return r3;
  }
  rulesFor(t4, i5, e4) {
    const s4 = this.possibleRulesFor(t4, i5);
    if (e4 && typeof e4 !== "string") throw new Error("The 3rd, `field` parameter is expected to be a string. See https://stalniy.github.io/casl/en/api/casl-ability#can-of-pure-ability for details");
    if (!this.h) return s4;
    return s4.filter((t5) => t5.matchesField(e4));
  }
  actionsFor(t4) {
    if (!P2(t4)) throw new Error('"actionsFor" accepts only subject types (i.e., string or class) as a parameter');
    const i5 = /* @__PURE__ */ new Set();
    const e4 = this.l.get(t4);
    if (e4) Array.from(e4.keys()).forEach((t5) => i5.add(t5));
    const s4 = t4 !== this.A ? this.l.get(this.A) : void 0;
    if (s4) Array.from(s4.keys()).forEach((t5) => i5.add(t5));
    return Array.from(i5);
  }
  on(t4, i5) {
    this.F = this.F || /* @__PURE__ */ new Map();
    const e4 = this.F;
    const s4 = e4.get(t4) || null;
    const n4 = N3(i5, s4);
    e4.set(t4, n4);
    return () => {
      const i6 = e4.get(t4);
      if (!n4.next && !n4.prev && i6 === n4) e4.delete(t4);
      else if (n4 === i6) e4.set(t4, n4.prev);
      Q(n4);
    };
  }
  _(t4, i5) {
    if (!this.F) return;
    let e4 = this.F.get(t4) || null;
    while (e4 !== null) {
      const t5 = e4.prev ? V(e4.prev) : null;
      e4.value(i5);
      e4 = t5;
    }
  }
};
var PureAbility = class extends Z {
  can(t4, i5, e4) {
    const s4 = this.relevantRuleFor(t4, i5, e4);
    return !!s4 && !s4.inverted;
  }
  relevantRuleFor(t4, i5, e4) {
    const s4 = this.detectSubjectType(i5);
    const n4 = this.rulesFor(t4, s4, e4);
    for (let t5 = 0, e5 = n4.length; t5 < e5; t5++) if (n4[t5].matchesConditions(i5)) return n4[t5];
    return null;
  }
  cannot(t4, i5, e4) {
    return !this.can(t4, i5, e4);
  }
};
var tt = { $eq: O2, $ne: R, $lt: E, $lte: j2, $gt: b, $gte: g, $in: y2, $nin: x2, $all: v2, $size: w2, $regex: _2, $options: q, $elemMatch: $, $exists: m2 };
var it = { eq: b2, ne: A2, lt: h3, lte: d3, gt: j3, gte: w3, in: N2, nin: $2, all: q2, size: x3, regex: O3, elemMatch: z2, exists: _3, and: m3 };
var st = p4(tt, it);
var dt = (t4) => `Cannot execute "${t4.action}" on "${t4.subjectType}"`;
var yt = function t2(i5) {
  this.message = i5;
};
yt.prototype = Object.create(Error.prototype);
var ForbiddenError = class extends yt {
  static setDefaultMessage(t4) {
    this.P = typeof t4 === "string" ? () => t4 : t4;
  }
  static from(t4) {
    return new this(t4);
  }
  constructor(t4) {
    super("");
    this.ability = t4;
    if (typeof Error.captureStackTrace === "function") {
      this.name = "ForbiddenError";
      Error.captureStackTrace(this, this.constructor);
    }
  }
  setMessage(t4) {
    this.message = t4;
    return this;
  }
  throwUnlessCan(t4, i5, e4) {
    const s4 = this.unlessCan(t4, i5, e4);
    if (s4) throw s4;
  }
  unlessCan(t4, i5, e4) {
    const s4 = this.ability.relevantRuleFor(t4, i5, e4);
    if (s4 && !s4.inverted) return;
    this.action = t4;
    this.subject = i5;
    this.subjectType = T(this.ability.detectSubjectType(i5));
    this.field = e4;
    const n4 = s4 ? s4.reason : "";
    this.message = this.message || n4 || this.constructor.P(this);
    return this;
  }
};
ForbiddenError.P = dt;
var pt = Object.freeze({ __proto__: null });

// node_modules/@casl/vue/dist/es6m/index.mjs
function reactiveAbility(i5) {
  if (Object.hasOwn(i5, "possibleRulesFor")) return i5;
  const n4 = t3(true);
  i5.on("updated", () => {
    n4.value = !n4.value;
  });
  const r3 = i5.possibleRulesFor.bind(i5);
  i5.possibleRulesFor = (t4, i6) => {
    n4.value = n4.value;
    return r3(t4, i6);
  };
  i5.can = i5.can.bind(i5);
  i5.cannot = i5.cannot.bind(i5);
  return i5;
}
var e3 = Symbol("ability");
function useAbility() {
  const t4 = i4(e3);
  if (!t4) throw new Error("Cannot inject Ability instance because it was not provided");
  return t4;
}
function provideAbility(t4) {
  n3(e3, reactiveAbility(t4));
}
function s3(t4) {
  if (t4.a !== void 0) return "a";
  if (t4.this !== void 0) return "this";
  if (t4.an !== void 0) return "an";
  return "";
}
var u5 = r2({ name: "Can", props: { I: String, do: String, a: [String, Function], an: [String, Function], this: [String, Function, Object], on: [String, Function, Object], not: Boolean, passThrough: Boolean, field: String }, setup(t4, { slots: i5 }) {
  const n4 = t4;
  let r3 = "do";
  let o3 = "on";
  if (n4[r3] === void 0) {
    r3 = "I";
    o3 = s3(t4);
  }
  if (!n4[r3]) throw new Error("Neither `I` nor `do` prop was passed in <Can>");
  if (!i5.default) throw new Error("Expects to receive default slot");
  const e4 = useAbility();
  return () => {
    const s4 = e4.can(n4[r3], n4[o3], n4.field);
    const u6 = t4.not ? !s4 : s4;
    if (!t4.passThrough) return u6 ? i5.default() : null;
    return i5.default({ allowed: u6, ability: e4 });
  };
} });
function l4(t4, i5, n4) {
  if (!i5 || !(i5 instanceof PureAbility)) throw new Error("Please provide an Ability instance to abilitiesPlugin plugin");
  t4.provide(e3, reactiveAbility(i5));
  if (n4 && n4.useGlobalProperties) {
    t4.config.globalProperties.$ability = i5;
    t4.config.globalProperties.$can = i5.can.bind(i5);
  }
}
export {
  e3 as ABILITY_TOKEN,
  u5 as Can,
  l4 as abilitiesPlugin,
  provideAbility,
  useAbility
};
//# sourceMappingURL=@casl_vue.js.map
