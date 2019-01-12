var util = module.exports;

util.slice = function (A, start, end) { return Array.prototype.slice.call(A, start, end); };
util.push = function (A, B) { Array.prototype.push.apply(A, B); };

util.once = function (cb) {
    var called;
    return function () {
        if (called) { return; }
        called = true;
        f.apply(this, util.slice(arguments));
    };
};

util.forEach = function (u8, f) {
    var i = 0;
    var l = u8.length;
    for (;i < l;i++) {
        f(u8[i], i, u8);
    }
};

util.map = function (u8, f) {
    var res = [];
    util.forEach(u8, function (x, i, u8) {
        res.push(f(x, i, u8));
    });
    return res;
};

util.reduce = function (u8, f) {
    var i = 0;
    var l = u8.length - 1;

    var r = u8[0];

    for (;i < l; i++) {
        r = f(r, u8[i + 1], i + 1, u8);
    }
    return r;
};

util.some = function (u8, f) {
    var i = 0;
    var l = u8.length;
    for (;i < l;i++) { if (f(u8[i], i, u8)) { return true; } }
    return false;
};

util.int_from_buffer = function (A) {
    // MAX_SAFE_INTEGER in js is Math.pow(2, 53) - 1
    // log(MSI, 2) => 53

    // that means we want to generate 53 random bits of information
    // that means we need 6.625 random uint_8s

    // 7 Uint_8s
    var bytes = util.slice(A, 0, 7);
    return util.reduce(bytes, function (a, b, i) {
        var R = (i === 1?
            ((a & 31 /*0b00011111*/) * 256) + b:
            ((a * 256) + b));
        return R;
    });
};

util.buffer_from_int = function (x) {
    var n = Math.floor(x);
    return new Uint8Array(new Array(7).fill(0).map(function (_, i) {
        var mask = Math.floor(n / Math.pow(256, 6 - i));
        return i === 0? 31 & mask: mask;
    }));
};

util.concat = function (u8_list) {
    var length = 0;

    // take the total length of all the uint8Arrays
    util.forEach(u8_list, function (u8) {
        length += u8.length;
    });

    var total = new Uint8Array(length);

    var offset = 0;
    util.forEach(u8_list, function (u8) {
        total.set(u8, offset);
        offset += u8.length;
    });
    return total;
};

util.lower_hash = function (A, B) {
    var res = 0;
    util.some(A, function (a, i) {
        var b = B[i];
        if (a === b) { return 0; }
        if (a < b) { res = -1; return true; }
        res = 1;
        return true;
    });
    return res;
};

util.isUint8 = function (x) {
    return (
        typeof(x) === 'number' &&
        !isNaN(x) &&
        x > -1 &&
        x < 256);
};

util.xor = function (a, b) {
    if (!util.isUint8(a) ||
        !util.isUint8(b)) {
        console.error(a, b);
        throw new Error('expected iterable of uint8s');
    }
    return a ^ b;
};

util.xor.array = function (A, B) {
    if (A.length !== B.length) {
        console.log(A.length, B.length);
        throw new Error('expected iterables to have equal length');
    }
    var C = [];
    util.forEach(A, function (a, i) { C[i] = util.xor(a, B[i]); });
    return C;
};

