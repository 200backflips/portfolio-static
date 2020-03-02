
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if (typeof $$scope.dirty === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.17.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/components/Header.svelte generated by Svelte v3.17.2 */

    const file = "src/components/Header.svelte";

    function create_fragment(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "Header svelte-121nvj1");
    			add_location(div, file, 9, 0, 122);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var uaParser = createCommonjsModule(function (module, exports) {
    /*!
     * UAParser.js v0.7.21
     * Lightweight JavaScript-based User-Agent string parser
     * https://github.com/faisalman/ua-parser-js
     *
     * Copyright © 2012-2019 Faisal Salman <f@faisalman.com>
     * Licensed under MIT License
     */

    (function (window, undefined$1) {

        //////////////
        // Constants
        /////////////


        var LIBVERSION  = '0.7.21',
            EMPTY       = '',
            UNKNOWN     = '?',
            FUNC_TYPE   = 'function',
            OBJ_TYPE    = 'object',
            STR_TYPE    = 'string',
            MAJOR       = 'major', // deprecated
            MODEL       = 'model',
            NAME        = 'name',
            TYPE        = 'type',
            VENDOR      = 'vendor',
            VERSION     = 'version',
            ARCHITECTURE= 'architecture',
            CONSOLE     = 'console',
            MOBILE      = 'mobile',
            TABLET      = 'tablet',
            SMARTTV     = 'smarttv',
            WEARABLE    = 'wearable',
            EMBEDDED    = 'embedded';


        ///////////
        // Helper
        //////////


        var util = {
            extend : function (regexes, extensions) {
                var mergedRegexes = {};
                for (var i in regexes) {
                    if (extensions[i] && extensions[i].length % 2 === 0) {
                        mergedRegexes[i] = extensions[i].concat(regexes[i]);
                    } else {
                        mergedRegexes[i] = regexes[i];
                    }
                }
                return mergedRegexes;
            },
            has : function (str1, str2) {
              if (typeof str1 === "string") {
                return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
              } else {
                return false;
              }
            },
            lowerize : function (str) {
                return str.toLowerCase();
            },
            major : function (version) {
                return typeof(version) === STR_TYPE ? version.replace(/[^\d\.]/g,'').split(".")[0] : undefined$1;
            },
            trim : function (str) {
              return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            }
        };


        ///////////////
        // Map helper
        //////////////


        var mapper = {

            rgx : function (ua, arrays) {

                var i = 0, j, k, p, q, matches, match;

                // loop through all regexes maps
                while (i < arrays.length && !matches) {

                    var regex = arrays[i],       // even sequence (0,2,4,..)
                        props = arrays[i + 1];   // odd sequence (1,3,5,..)
                    j = k = 0;

                    // try matching uastring with regexes
                    while (j < regex.length && !matches) {

                        matches = regex[j++].exec(ua);

                        if (!!matches) {
                            for (p = 0; p < props.length; p++) {
                                match = matches[++k];
                                q = props[p];
                                // check if given property is actually array
                                if (typeof q === OBJ_TYPE && q.length > 0) {
                                    if (q.length == 2) {
                                        if (typeof q[1] == FUNC_TYPE) {
                                            // assign modified match
                                            this[q[0]] = q[1].call(this, match);
                                        } else {
                                            // assign given value, ignore regex match
                                            this[q[0]] = q[1];
                                        }
                                    } else if (q.length == 3) {
                                        // check whether function or regex
                                        if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                            // call function (usually string mapper)
                                            this[q[0]] = match ? q[1].call(this, match, q[2]) : undefined$1;
                                        } else {
                                            // sanitize match using given regex
                                            this[q[0]] = match ? match.replace(q[1], q[2]) : undefined$1;
                                        }
                                    } else if (q.length == 4) {
                                            this[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined$1;
                                    }
                                } else {
                                    this[q] = match ? match : undefined$1;
                                }
                            }
                        }
                    }
                    i += 2;
                }
            },

            str : function (str, map) {

                for (var i in map) {
                    // check if array
                    if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                        for (var j = 0; j < map[i].length; j++) {
                            if (util.has(map[i][j], str)) {
                                return (i === UNKNOWN) ? undefined$1 : i;
                            }
                        }
                    } else if (util.has(map[i], str)) {
                        return (i === UNKNOWN) ? undefined$1 : i;
                    }
                }
                return str;
            }
        };


        ///////////////
        // String map
        //////////////


        var maps = {

            browser : {
                oldsafari : {
                    version : {
                        '1.0'   : '/8',
                        '1.2'   : '/1',
                        '1.3'   : '/3',
                        '2.0'   : '/412',
                        '2.0.2' : '/416',
                        '2.0.3' : '/417',
                        '2.0.4' : '/419',
                        '?'     : '/'
                    }
                }
            },

            device : {
                amazon : {
                    model : {
                        'Fire Phone' : ['SD', 'KF']
                    }
                },
                sprint : {
                    model : {
                        'Evo Shift 4G' : '7373KT'
                    },
                    vendor : {
                        'HTC'       : 'APA',
                        'Sprint'    : 'Sprint'
                    }
                }
            },

            os : {
                windows : {
                    version : {
                        'ME'        : '4.90',
                        'NT 3.11'   : 'NT3.51',
                        'NT 4.0'    : 'NT4.0',
                        '2000'      : 'NT 5.0',
                        'XP'        : ['NT 5.1', 'NT 5.2'],
                        'Vista'     : 'NT 6.0',
                        '7'         : 'NT 6.1',
                        '8'         : 'NT 6.2',
                        '8.1'       : 'NT 6.3',
                        '10'        : ['NT 6.4', 'NT 10.0'],
                        'RT'        : 'ARM'
                    }
                }
            }
        };


        //////////////
        // Regex map
        /////////////


        var regexes = {

            browser : [[

                // Presto based
                /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
                /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
                /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
                /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
                ], [NAME, VERSION], [

                /(opios)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
                ], [[NAME, 'Opera Mini'], VERSION], [

                /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
                ], [[NAME, 'Opera'], VERSION], [

                // Mixed
                /(kindle)\/([\w\.]+)/i,                                             // Kindle
                /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]*)/i,
                                                                                    // Lunascape/Maxthon/Netfront/Jasmine/Blazer
                // Trident based
                /(avant\s|iemobile|slim)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                    // Avant/IEMobile/SlimBrowser
                /(bidubrowser|baidubrowser)[\/\s]?([\w\.]+)/i,                      // Baidu Browser
                /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

                // Webkit/KHTML based
                /(rekonq)\/([\w\.]*)/i,                                             // Rekonq
                /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon)\/([\w\.-]+)/i
                                                                                    // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS/Bowser/QupZilla/Falkon
                ], [NAME, VERSION], [

                /(konqueror)\/([\w\.]+)/i                                           // Konqueror
                ], [[NAME, 'Konqueror'], VERSION], [

                /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
                ], [[NAME, 'IE'], VERSION], [

                /(edge|edgios|edga|edg)\/((\d+)?[\w\.]+)/i                          // Microsoft Edge
                ], [[NAME, 'Edge'], VERSION], [

                /(yabrowser)\/([\w\.]+)/i                                           // Yandex
                ], [[NAME, 'Yandex'], VERSION], [

                /(Avast)\/([\w\.]+)/i                                               // Avast Secure Browser
                ], [[NAME, 'Avast Secure Browser'], VERSION], [

                /(AVG)\/([\w\.]+)/i                                                 // AVG Secure Browser
                ], [[NAME, 'AVG Secure Browser'], VERSION], [

                /(puffin)\/([\w\.]+)/i                                              // Puffin
                ], [[NAME, 'Puffin'], VERSION], [

                /(focus)\/([\w\.]+)/i                                               // Firefox Focus
                ], [[NAME, 'Firefox Focus'], VERSION], [

                /(opt)\/([\w\.]+)/i                                                 // Opera Touch
                ], [[NAME, 'Opera Touch'], VERSION], [

                /((?:[\s\/])uc?\s?browser|(?:juc.+)ucweb)[\/\s]?([\w\.]+)/i         // UCBrowser
                ], [[NAME, 'UCBrowser'], VERSION], [

                /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
                ], [[NAME, /_/g, ' '], VERSION], [

                /(windowswechat qbcore)\/([\w\.]+)/i                                // WeChat Desktop for Windows Built-in Browser
                ], [[NAME, 'WeChat(Win) Desktop'], VERSION], [

                /(micromessenger)\/([\w\.]+)/i                                      // WeChat
                ], [[NAME, 'WeChat'], VERSION], [

                /(brave)\/([\w\.]+)/i                                               // Brave browser
                ], [[NAME, 'Brave'], VERSION], [

                /(qqbrowserlite)\/([\w\.]+)/i                                       // QQBrowserLite
                ], [NAME, VERSION], [

                /(QQ)\/([\d\.]+)/i                                                  // QQ, aka ShouQ
                ], [NAME, VERSION], [

                /m?(qqbrowser)[\/\s]?([\w\.]+)/i                                    // QQBrowser
                ], [NAME, VERSION], [

                /(baiduboxapp)[\/\s]?([\w\.]+)/i                                    // Baidu App
                ], [NAME, VERSION], [

                /(2345Explorer)[\/\s]?([\w\.]+)/i                                   // 2345 Browser
                ], [NAME, VERSION], [

                /(MetaSr)[\/\s]?([\w\.]+)/i                                         // SouGouBrowser
                ], [NAME], [

                /(LBBROWSER)/i                                                      // LieBao Browser
                ], [NAME], [

                /xiaomi\/miuibrowser\/([\w\.]+)/i                                   // MIUI Browser
                ], [VERSION, [NAME, 'MIUI Browser']], [

                /;fbav\/([\w\.]+);/i                                                // Facebook App for iOS & Android
                ], [VERSION, [NAME, 'Facebook']], [

                /safari\s(line)\/([\w\.]+)/i,                                       // Line App for iOS
                /android.+(line)\/([\w\.]+)\/iab/i                                  // Line App for Android
                ], [NAME, VERSION], [

                /headlesschrome(?:\/([\w\.]+)|\s)/i                                 // Chrome Headless
                ], [VERSION, [NAME, 'Chrome Headless']], [

                /\swv\).+(chrome)\/([\w\.]+)/i                                      // Chrome WebView
                ], [[NAME, /(.+)/, '$1 WebView'], VERSION], [

                /((?:oculus|samsung)browser)\/([\w\.]+)/i
                ], [[NAME, /(.+(?:g|us))(.+)/, '$1 $2'], VERSION], [                // Oculus / Samsung Browser

                /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)*/i        // Android Browser
                ], [VERSION, [NAME, 'Android Browser']], [

                /(sailfishbrowser)\/([\w\.]+)/i                                     // Sailfish Browser
                ], [[NAME, 'Sailfish Browser'], VERSION], [

                /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i
                                                                                    // Chrome/OmniWeb/Arora/Tizen/Nokia
                ], [NAME, VERSION], [

                /(dolfin)\/([\w\.]+)/i                                              // Dolphin
                ], [[NAME, 'Dolphin'], VERSION], [

                /(qihu|qhbrowser|qihoobrowser|360browser)/i                         // 360
                ], [[NAME, '360 Browser']], [

                /((?:android.+)crmo|crios)\/([\w\.]+)/i                             // Chrome for Android/iOS
                ], [[NAME, 'Chrome'], VERSION], [

                /(coast)\/([\w\.]+)/i                                               // Opera Coast
                ], [[NAME, 'Opera Coast'], VERSION], [

                /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
                ], [VERSION, [NAME, 'Firefox']], [

                /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
                ], [VERSION, [NAME, 'Mobile Safari']], [

                /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
                ], [VERSION, NAME], [

                /webkit.+?(gsa)\/([\w\.]+).+?(mobile\s?safari|safari)(\/[\w\.]+)/i  // Google Search Appliance on iOS
                ], [[NAME, 'GSA'], VERSION], [

                /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
                ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

                /(webkit|khtml)\/([\w\.]+)/i
                ], [NAME, VERSION], [

                // Gecko based
                /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
                ], [[NAME, 'Netscape'], VERSION], [
                /(swiftfox)/i,                                                      // Swiftfox
                /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                    // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
                /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([\w\.-]+)$/i,

                                                                                    // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
                /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

                // Other
                /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                    // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
                /(links)\s\(([\w\.]+)/i,                                            // Links
                /(gobrowser)\/?([\w\.]*)/i,                                         // GoBrowser
                /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
                /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
                ], [NAME, VERSION]
            ],

            cpu : [[

                /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
                ], [[ARCHITECTURE, 'amd64']], [

                /(ia32(?=;))/i                                                      // IA32 (quicktime)
                ], [[ARCHITECTURE, util.lowerize]], [

                /((?:i[346]|x)86)[;\)]/i                                            // IA32
                ], [[ARCHITECTURE, 'ia32']], [

                // PocketPC mistakenly identified as PowerPC
                /windows\s(ce|mobile);\sppc;/i
                ], [[ARCHITECTURE, 'arm']], [

                /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
                ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

                /(sun4\w)[;\)]/i                                                    // SPARC
                ], [[ARCHITECTURE, 'sparc']], [

                /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+[;l]))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                    // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
                ], [[ARCHITECTURE, util.lowerize]]
            ],

            device : [[

                /\((ipad|playbook);[\w\s\),;-]+(rim|apple)/i                        // iPad/PlayBook
                ], [MODEL, VENDOR, [TYPE, TABLET]], [

                /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
                ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

                /(apple\s{0,1}tv)/i                                                 // Apple TV
                ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple'], [TYPE, SMARTTV]], [

                /(archos)\s(gamepad2?)/i,                                           // Archos
                /(hp).+(touchpad)/i,                                                // HP TouchPad
                /(hp).+(tablet)/i,                                                  // HP Tablet
                /(kindle)\/([\w\.]+)/i,                                             // Kindle
                /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
                /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /(kf[A-z]+)\sbuild\/.+silk\//i                                      // Kindle Fire HD
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
                /(sd|kf)[0349hijorstuw]+\sbuild\/.+silk\//i                         // Fire Phone
                ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [
                /android.+aft([bms])\sbuild/i                                       // Fire TV
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, SMARTTV]], [

                /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
                ], [MODEL, VENDOR, [TYPE, MOBILE]], [
                /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
                ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

                /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
                /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[\s_-]?([\w-]*)/i,
                                                                                    // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Meizu/Motorola/Polytron
                /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
                /(asus)-?(\w+)/i                                                    // Asus
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [
                /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
                ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                    // Asus Tablets
                /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7|padfone|p00c)/i
                ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

                /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
                /(sony)?(?:sgp.+)\sbuild\//i
                ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
                /android.+\s([c-g]\d{4}|so[-l]\w+)(?=\sbuild\/|\).+chrome\/(?![1-6]{0,1}\d\.))/i
                ], [MODEL, [VENDOR, 'Sony'], [TYPE, MOBILE]], [

                /\s(ouya)\s/i,                                                      // Ouya
                /(nintendo)\s([wids3u]+)/i                                          // Nintendo
                ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

                /android.+;\s(shield)\sbuild/i                                      // Nvidia
                ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

                /(playstation\s[34portablevi]+)/i                                   // Playstation
                ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

                /(sprint\s(\w+))/i                                                  // Sprint Phones
                ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

                /(htc)[;_\s-]+([\w\s]+(?=\)|\sbuild)|\w+)/i,                        // HTC
                /(zte)-(\w*)/i,                                                     // ZTE
                /(alcatel|geeksphone|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]*)/i
                                                                                    // Alcatel/GeeksPhone/Nexian/Panasonic/Sony
                ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

                /(nexus\s9)/i                                                       // HTC Nexus 9
                ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

                /d\/huawei([\w\s-]+)[;\)]/i,
                /(nexus\s6p|vog-l29|ane-lx1|eml-l29)/i                              // Huawei
                ], [MODEL, [VENDOR, 'Huawei'], [TYPE, MOBILE]], [

                /android.+(bah2?-a?[lw]\d{2})/i                                     // Huawei MediaPad
                ], [MODEL, [VENDOR, 'Huawei'], [TYPE, TABLET]], [

                /(microsoft);\s(lumia[\s\w]+)/i                                     // Microsoft Lumia
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
                ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
                /(kin\.[onetw]{3})/i                                                // Microsoft Kin
                ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                    // Motorola
                /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?:?(\s4g)?)[\w\s]+build\//i,
                /mot[\s-]?(\w*)/i,
                /(XT\d{3,4}) build\//i,
                /(nexus\s6)/i
                ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
                /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
                ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

                /hbbtv\/\d+\.\d+\.\d+\s+\([\w\s]*;\s*(\w[^;]*);([^;]*)/i            // HbbTV devices
                ], [[VENDOR, util.trim], [MODEL, util.trim], [TYPE, SMARTTV]], [

                /hbbtv.+maple;(\d+)/i
                ], [[MODEL, /^/, 'SmartTV'], [VENDOR, 'Samsung'], [TYPE, SMARTTV]], [

                /\(dtv[\);].+(aquos)/i                                              // Sharp
                ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [

                /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n\d+|sgh-t8[56]9|nexus 10))/i,
                /((SM-T\w+))/i
                ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
                /smart-tv.+(samsung)/i
                ], [VENDOR, [TYPE, SMARTTV], MODEL], [
                /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-\w[\w\d]+))/i,
                /(sam[sung]*)[\s-]*(\w+-?[\w-]*)/i,
                /sec-((sgh\w+))/i
                ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [

                /sie-(\w*)/i                                                        // Siemens
                ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

                /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
                /(nokia)[\s_-]?([\w-]*)/i
                ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

                /android[x\d\.\s;]+\s([ab][1-7]\-?[0178a]\d\d?)/i                   // Acer
                ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

                /android.+([vl]k\-?\d{3})\s+build/i                                 // LG Tablet
                ], [MODEL, [VENDOR, 'LG'], [TYPE, TABLET]], [
                /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
                ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
                /(lg) netcast\.tv/i                                                 // LG SmartTV
                ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
                /(nexus\s[45])/i,                                                   // LG
                /lg[e;\s\/-]+(\w*)/i,
                /android.+lg(\-?[\d\w]+)\s+build/i
                ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

                /(lenovo)\s?(s(?:5000|6000)(?:[\w-]+)|tab(?:[\s\w]+))/i             // Lenovo tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [
                /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
                ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [
                /(lenovo)[_\s-]?([\w-]+)/i
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /linux;.+((jolla));/i                                               // Jolla
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /((pebble))app\/[\d\.]+\s/i                                         // Pebble
                ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

                /android.+;\s(oppo)\s?([\w\s]+)\sbuild/i                            // OPPO
                ], [VENDOR, MODEL, [TYPE, MOBILE]], [

                /crkey/i                                                            // Google Chromecast
                ], [[MODEL, 'Chromecast'], [VENDOR, 'Google'], [TYPE, SMARTTV]], [

                /android.+;\s(glass)\s\d/i                                          // Google Glass
                ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

                /android.+;\s(pixel c)[\s)]/i                                       // Google Pixel C
                ], [MODEL, [VENDOR, 'Google'], [TYPE, TABLET]], [

                /android.+;\s(pixel( [23])?( xl)?)[\s)]/i                              // Google Pixel
                ], [MODEL, [VENDOR, 'Google'], [TYPE, MOBILE]], [

                /android.+;\s(\w+)\s+build\/hm\1/i,                                 // Xiaomi Hongmi 'numeric' models
                /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,               // Xiaomi Hongmi
                /android.+(mi[\s\-_]*(?:a\d|one|one[\s_]plus|note lte)?[\s_]*(?:\d?\w?)[\s_]*(?:plus)?)\s+build/i,    
                                                                                    // Xiaomi Mi
                /android.+(redmi[\s\-_]*(?:note)?(?:[\s_]*[\w\s]+))\s+build/i       // Redmi Phones
                ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [
                /android.+(mi[\s\-_]*(?:pad)(?:[\s_]*[\w\s]+))\s+build/i            // Mi Pad tablets
                ],[[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, TABLET]], [
                /android.+;\s(m[1-5]\snote)\sbuild/i                                // Meizu
                ], [MODEL, [VENDOR, 'Meizu'], [TYPE, MOBILE]], [
                /(mz)-([\w-]{2,})/i
                ], [[VENDOR, 'Meizu'], MODEL, [TYPE, MOBILE]], [

                /android.+a000(1)\s+build/i,                                        // OnePlus
                /android.+oneplus\s(a\d{4})[\s)]/i
                ], [MODEL, [VENDOR, 'OnePlus'], [TYPE, MOBILE]], [

                /android.+[;\/]\s*(RCT[\d\w]+)\s+build/i                            // RCA Tablets
                ], [MODEL, [VENDOR, 'RCA'], [TYPE, TABLET]], [

                /android.+[;\/\s]+(Venue[\d\s]{2,7})\s+build/i                      // Dell Venue Tablets
                ], [MODEL, [VENDOR, 'Dell'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Q[T|M][\d\w]+)\s+build/i                         // Verizon Tablet
                ], [MODEL, [VENDOR, 'Verizon'], [TYPE, TABLET]], [

                /android.+[;\/]\s+(Barnes[&\s]+Noble\s+|BN[RT])(V?.*)\s+build/i     // Barnes & Noble Tablet
                ], [[VENDOR, 'Barnes & Noble'], MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s+(TM\d{3}.*\b)\s+build/i                           // Barnes & Noble Tablet
                ], [MODEL, [VENDOR, 'NuVision'], [TYPE, TABLET]], [

                /android.+;\s(k88)\sbuild/i                                         // ZTE K Series Tablet
                ], [MODEL, [VENDOR, 'ZTE'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(gen\d{3})\s+build.*49h/i                         // Swiss GEN Mobile
                ], [MODEL, [VENDOR, 'Swiss'], [TYPE, MOBILE]], [

                /android.+[;\/]\s*(zur\d{3})\s+build/i                              // Swiss ZUR Tablet
                ], [MODEL, [VENDOR, 'Swiss'], [TYPE, TABLET]], [

                /android.+[;\/]\s*((Zeki)?TB.*\b)\s+build/i                         // Zeki Tablets
                ], [MODEL, [VENDOR, 'Zeki'], [TYPE, TABLET]], [

                /(android).+[;\/]\s+([YR]\d{2})\s+build/i,
                /android.+[;\/]\s+(Dragon[\-\s]+Touch\s+|DT)(\w{5})\sbuild/i        // Dragon Touch Tablet
                ], [[VENDOR, 'Dragon Touch'], MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s*(NS-?\w{0,9})\sbuild/i                            // Insignia Tablets
                ], [MODEL, [VENDOR, 'Insignia'], [TYPE, TABLET]], [

                /android.+[;\/]\s*((NX|Next)-?\w{0,9})\s+build/i                    // NextBook Tablets
                ], [MODEL, [VENDOR, 'NextBook'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Xtreme\_)?(V(1[045]|2[015]|30|40|60|7[05]|90))\s+build/i
                ], [[VENDOR, 'Voice'], MODEL, [TYPE, MOBILE]], [                    // Voice Xtreme Phones

                /android.+[;\/]\s*(LVTEL\-)?(V1[12])\s+build/i                     // LvTel Phones
                ], [[VENDOR, 'LvTel'], MODEL, [TYPE, MOBILE]], [

                /android.+;\s(PH-1)\s/i
                ], [MODEL, [VENDOR, 'Essential'], [TYPE, MOBILE]], [                // Essential PH-1

                /android.+[;\/]\s*(V(100MD|700NA|7011|917G).*\b)\s+build/i          // Envizen Tablets
                ], [MODEL, [VENDOR, 'Envizen'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Le[\s\-]+Pan)[\s\-]+(\w{1,9})\s+build/i          // Le Pan Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s*(Trio[\s\-]*.*)\s+build/i                         // MachSpeed Tablets
                ], [MODEL, [VENDOR, 'MachSpeed'], [TYPE, TABLET]], [

                /android.+[;\/]\s*(Trinity)[\-\s]*(T\d{3})\s+build/i                // Trinity Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /android.+[;\/]\s*TU_(1491)\s+build/i                               // Rotor Tablets
                ], [MODEL, [VENDOR, 'Rotor'], [TYPE, TABLET]], [

                /android.+(KS(.+))\s+build/i                                        // Amazon Kindle Tablets
                ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [

                /android.+(Gigaset)[\s\-]+(Q\w{1,9})\s+build/i                      // Gigaset Tablets
                ], [VENDOR, MODEL, [TYPE, TABLET]], [

                /\s(tablet|tab)[;\/]/i,                                             // Unidentifiable Tablet
                /\s(mobile)(?:[;\/]|\ssafari)/i                                     // Unidentifiable Mobile
                ], [[TYPE, util.lowerize], VENDOR, MODEL], [

                /[\s\/\(](smart-?tv)[;\)]/i                                         // SmartTV
                ], [[TYPE, SMARTTV]], [

                /(android[\w\.\s\-]{0,9});.+build/i                                 // Generic Android Device
                ], [MODEL, [VENDOR, 'Generic']]
            ],

            engine : [[

                /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
                ], [VERSION, [NAME, 'EdgeHTML']], [

                /webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i                         // Blink
                ], [VERSION, [NAME, 'Blink']], [

                /(presto)\/([\w\.]+)/i,                                             // Presto
                /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,     
                                                                                    // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m/Goanna
                /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
                /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
                ], [NAME, VERSION], [

                /rv\:([\w\.]{1,9}).+(gecko)/i                                       // Gecko
                ], [VERSION, NAME]
            ],

            os : [[

                // Windows based
                /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
                ], [NAME, VERSION], [
                /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
                /(windows\sphone(?:\sos)*)[\s\/]?([\d\.\s\w]*)/i,                   // Windows Phone
                /(windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
                ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
                /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
                ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

                // Mobile/Embedded OS
                /\((bb)(10);/i                                                      // BlackBerry 10
                ], [[NAME, 'BlackBerry'], VERSION], [
                /(blackberry)\w*\/?([\w\.]*)/i,                                     // Blackberry
                /(tizen|kaios)[\/\s]([\w\.]+)/i,                                    // Tizen/KaiOS
                /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|sailfish|contiki)[\/\s-]?([\w\.]*)/i
                                                                                    // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki/Sailfish OS
                ], [NAME, VERSION], [
                /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]*)/i                  // Symbian
                ], [[NAME, 'Symbian'], VERSION], [
                /\((series40);/i                                                    // Series 40
                ], [NAME], [
                /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
                ], [[NAME, 'Firefox OS'], VERSION], [

                // Console
                /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

                // GNU/Linux based
                /(mint)[\/\s\(]?(\w*)/i,                                            // Mint
                /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
                /(joli|[kxln]?ubuntu|debian|suse|opensuse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?(?!chrom)([\w\.-]*)/i,
                                                                                    // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                    // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
                /(hurd|linux)\s?([\w\.]*)/i,                                        // Hurd/Linux
                /(gnu)\s?([\w\.]*)/i                                                // GNU
                ], [NAME, VERSION], [

                /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
                ], [[NAME, 'Chromium OS'], VERSION],[

                // Solaris
                /(sunos)\s?([\w\.\d]*)/i                                            // Solaris
                ], [[NAME, 'Solaris'], VERSION], [

                // BSD based
                /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]*)/i                    // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
                ], [NAME, VERSION],[

                /(haiku)\s(\w+)/i                                                   // Haiku
                ], [NAME, VERSION],[

                /cfnetwork\/.+darwin/i,
                /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i             // iOS
                ], [[VERSION, /_/g, '.'], [NAME, 'iOS']], [

                /(mac\sos\sx)\s?([\w\s\.]*)/i,
                /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
                ], [[NAME, 'Mac OS'], [VERSION, /_/g, '.']], [

                // Other
                /((?:open)?solaris)[\/\s-]?([\w\.]*)/i,                             // Solaris
                /(aix)\s((\d)(?=\.|\)|\s)[\w\.])*/i,                                // AIX
                /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms|fuchsia)/i,
                                                                                    // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS/Fuchsia
                /(unix)\s?([\w\.]*)/i                                               // UNIX
                ], [NAME, VERSION]
            ]
        };


        /////////////////
        // Constructor
        ////////////////
        var UAParser = function (uastring, extensions) {

            if (typeof uastring === 'object') {
                extensions = uastring;
                uastring = undefined$1;
            }

            if (!(this instanceof UAParser)) {
                return new UAParser(uastring, extensions).getResult();
            }

            var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
            var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

            this.getBrowser = function () {
                var browser = { name: undefined$1, version: undefined$1 };
                mapper.rgx.call(browser, ua, rgxmap.browser);
                browser.major = util.major(browser.version); // deprecated
                return browser;
            };
            this.getCPU = function () {
                var cpu = { architecture: undefined$1 };
                mapper.rgx.call(cpu, ua, rgxmap.cpu);
                return cpu;
            };
            this.getDevice = function () {
                var device = { vendor: undefined$1, model: undefined$1, type: undefined$1 };
                mapper.rgx.call(device, ua, rgxmap.device);
                return device;
            };
            this.getEngine = function () {
                var engine = { name: undefined$1, version: undefined$1 };
                mapper.rgx.call(engine, ua, rgxmap.engine);
                return engine;
            };
            this.getOS = function () {
                var os = { name: undefined$1, version: undefined$1 };
                mapper.rgx.call(os, ua, rgxmap.os);
                return os;
            };
            this.getResult = function () {
                return {
                    ua      : this.getUA(),
                    browser : this.getBrowser(),
                    engine  : this.getEngine(),
                    os      : this.getOS(),
                    device  : this.getDevice(),
                    cpu     : this.getCPU()
                };
            };
            this.getUA = function () {
                return ua;
            };
            this.setUA = function (uastring) {
                ua = uastring;
                return this;
            };
            return this;
        };

        UAParser.VERSION = LIBVERSION;
        UAParser.BROWSER = {
            NAME    : NAME,
            MAJOR   : MAJOR, // deprecated
            VERSION : VERSION
        };
        UAParser.CPU = {
            ARCHITECTURE : ARCHITECTURE
        };
        UAParser.DEVICE = {
            MODEL   : MODEL,
            VENDOR  : VENDOR,
            TYPE    : TYPE,
            CONSOLE : CONSOLE,
            MOBILE  : MOBILE,
            SMARTTV : SMARTTV,
            TABLET  : TABLET,
            WEARABLE: WEARABLE,
            EMBEDDED: EMBEDDED
        };
        UAParser.ENGINE = {
            NAME    : NAME,
            VERSION : VERSION
        };
        UAParser.OS = {
            NAME    : NAME,
            VERSION : VERSION
        };

        ///////////
        // Export
        //////////


        // check js environment
        {
            // nodejs env
            if ( module.exports) {
                exports = module.exports = UAParser;
            }
            exports.UAParser = UAParser;
        }

        // jQuery/Zepto specific (optional)
        // Note:
        //   In AMD env the global scope should be kept clean, but jQuery is an exception.
        //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
        //   and we should catch that.
        var $ = window && (window.jQuery || window.Zepto);
        if ($ && !$.ua) {
            var parser = new UAParser();
            $.ua = parser.getResult();
            $.ua.get = function () {
                return parser.getUA();
            };
            $.ua.set = function (uastring) {
                parser.setUA(uastring);
                var result = parser.getResult();
                for (var prop in result) {
                    $.ua[prop] = result[prop];
                }
            };
        }

    })(typeof window === 'object' ? window : commonjsGlobal);
    });
    var uaParser_1 = uaParser.UAParser;

    const parser = new uaParser().getResult();
    const isMobileBrowser = readable(parser.device.type === 'mobile');

    const imageList = readable([
      {
        placement: 'bigHighlight',
        placementOrder: 0,
        path: '/images/musikguiden.gif',
        brief: '”Be Creative and create something new”',
        id: '3D Intro/Outro, Musikguiden Sveriges Radio P3',
        tools: 'Cinema4D, Adobe Aftereffects, Adobe Photoshop',
        delivery: 'Delivery: 2x 15sec animations'
      },
      {
        placement: 'bigHighlight',
        placementOrder: 1,
        path: '/images/tbtbmed.gif',
        brief: '”Tell our organisation what we been up to lately”',
        id: '2D Infographic, Musikguiden Sveriges Radio P3',
        tools: 'Adobe Aftereffects, Adobe Illustrator',
        delivery: 'Delivery: 1x 2min 16:9 movie'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 0,
        path: '/images/musikguiden-infografik.gif',
        brief: '”Tell our organisation what we been up to lately”',
        id: '2D Infographic, Musikguiden Sveriges Radio P3',
        tools: 'Adobe Aftereffects, Adobe Illustrator',
        delivery: '1x 2min 16:9 movie'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 1,
        path: '/images/musikguiden-infografik-pt2.gif',
        brief: '”Promote our 10 most played songs of 2018 in Social Media”',
        id: '3D, Concept, Design and animation Musikguiden Sveriges Radio P3',
        tools: 'Cinema4D, Adobe Illustrator',
        delivery: '2x 25sec movies, 3x prints'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 2,
        path: '/images/kub-1-10.gif',
        brief: '”Promote and make our audience aware of our top 50 of the year”',
        id: '3D, Concept, Design and animation Musikguiden Sveriges Radio P3',
        tools: 'Cinema4D, Adobe Illustrator',
        delivery: '2x 25sec movies, 3x prints'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 3,
        path: '/images/arsbasta18.gif',
        brief:
          '”To come up with design and concept for the best music of the year including graphics and animation”',
        id: '3D, 2D, Concept, design and animation Sveriges Radio P3',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro, Cinema4D',
        delivery:
          '5x 15 sec animations, 2x 50 prints of all artist in different angles'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 4,
        path: '/images/lift.gif',
        brief: '”Create a concept, design and animation templates for P3STAR”',
        id: '3D Intro/Outro, Editing and animation, Design and Concept dev',
        tools: 'Cinema4D, Adobe Aftereffects, Adobe Photoshop',
        delivery: '1x10sec animation, 20 editable animation templates'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 5,
        path: '/images/arsbasta06.png',
        brief: '”Create a perfect loop”',
        id: '3D, animation',
        tools: 'Cinema4D',
        delivery: '1x10sec animation'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 6,
        path: '/images/arsbasta10.png',
        brief:
          '”To come up with design and concept for the best music of the year including graphics and animation”',
        id: '3D, 2D, Concept, design and animation Sveriges Radio P3',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro, Cinema4D',
        delivery:
          '5x 15 sec animations, 2x 50 prints of all artist in different angles'
      },
      {
        placement: 'smallHighlight',
        placementOrder: 7,
        path: '/images/poddpuff.gif',
        brief: '”Promote our story about the 90s Ravescene on instagram”',
        id: 'Editing and animation for Sveriges Radio P3 podd',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro',
        delivery: '1x 60 sec animation with Music, Voiceover and FX'
      },
      {
        placement: 'otherImages',
        placementOrder: 0,
        path: '/images/arsbasta01.png',
        brief:
          '”To come up with design and concept for the best music of the year including graphics and animation”',
        id: '3D, 2D, Concept, design and animation Sveriges Radio P3',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro, Cinema4D',
        delivery:
          '5x 15 sec animations, 2x 50 prints of all artist in different angles'
      },
      {
        placement: 'otherImages',
        placementOrder: 1,
        path: '/images/arsbasta03.gif',
        brief:
          '”To come up with design and concept for the best music of the year including graphics and animation”',
        id: '3D, 2D, Concept, design and animation Sveriges Radio P3',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro, Cinema4D',
        delivery:
          '5x 15 sec animations, 2x 50 prints of all artist in different angles'
      },
      {
        placement: 'otherImages',
        placementOrder: 2,
        path: '/images/arsbasta05.png',
        brief:
          '”To come up with design and concept for the best music of the year including graphics and animation”',
        id: '3D, 2D, Concept, design and animation Sveriges Radio P3',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro, Cinema4D',
        delivery:
          '5x 15 sec animations, 2x 50 prints of all artist in different angles'
      },
      {
        placement: 'otherImages',
        placementOrder: 3,
        path: '/images/poffpuff05.gif',
        brief: '”Promote our story about Jai Paul on instagram”',
        id: '2D, design and animation for Sveriges Radio P3 podd',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro',
        delivery: ' 1x 60 sec animation with Music, Voiceover and FX'
      },
      {
        placement: 'otherImages',
        placementOrder: 4,
        path: '/images/poffpuff04.gif',
        brief: '”Promote our story about Koffee on instagram”',
        id: 'Editing and animation for Sveriges Radio P3 podd',
        tools: 'Adobe Aftereffects, Adobe Premiere Pro',
        delivery: '1x 60 sec movie with Music, Voiceover and FX'
      },
      {
        placement: 'otherImages',
        placementOrder: 5,
        path: '/images/poddpuff01.gif',
        brief: '”Promote our story about trending remixes on instagram”',
        id: 'Editing and animation for Sveriges Radio P3 podd',
        tools: 'Adobe Aftereffects, Adobe Premiere Pro',
        delivery: '1x 60 sec movie with Music, Voiceover and FX'
      },
      {
        placement: 'otherImages',
        placementOrder: 6,
        path: '/images/tagintro.gif',
        brief: '”Promote our story about trains”',
        id: 'Design and animation for Sveriges Radio P3 podd',
        tools: ' Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Cinema4D',
        delivery: '4x 15 sec animation with Music, Voiceover and FX'
      },
      {
        placement: 'otherImages',
        placementOrder: 7,
        path: '/images/arsbasta04.png',
        brief:
          '”To come up with design and concept for the best music of the year including graphics and animation”',
        id: '3D, 2D, Concept, design and animation Sveriges Radio P3',
        tools:
          'Adobe Illustrator, Adobe Photoshop, Adobe Aftereffects, Adobe Premiere Pro, Cinema4D',
        delivery:
          '5x 15 sec animations, 2x 50 prints of all artist in different angles'
      },
      {
        placement: 'otherImages',
        placementOrder: 8,
        path: '/images/abstrakt.gif',
        brief: '”Create a perfect loop”',
        id: '3D, animation',
        tools: 'Cinema4D',
        delivery: '1x10sec animation'
      },
      {
        placement: 'otherImages',
        placementOrder: 9,
        path: '/images/wavy.gif',
        brief: '”Create a perfect loop”',
        id: '3D, animation',
        tools: 'Cinema4D',
        delivery: '1x5 sec animation'
      },
      {
        placement: 'otherImages',
        placementOrder: 10,
        path: '/images/rymdintro.gif',
        brief: '”Promote our story about space”',
        id: 'Design and animation',
        tools: 'Adobe Illustrator, Adobe Aftereffects, Cinema4D',
        delivery: '1x 60sec animation with Music, Voiceover and FX'
      },
      {
        placement: 'otherImages',
        placementOrder: 11,
        path: '/images/fyrkanter01.gif',
        brief: '”Create a perfect loop”',
        id: '3D, Animation, Design, Concept',
        tools: 'Cinema4D',
        delivery: '2x10 sec animations'
      }
    ]);

    /* src/components/BigHighlight.svelte generated by Svelte v3.17.2 */
    const file$1 = "src/components/BigHighlight.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i].placement;
    	child_ctx[3] = list[i].placementOrder;
    	child_ctx[4] = list[i].path;
    	child_ctx[5] = list[i].brief;
    	child_ctx[6] = list[i].id;
    	child_ctx[7] = list[i].tools;
    	child_ctx[8] = list[i].delivery;
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (46:2) {#if placement === 'bigHighlight' && placementOrder === order}
    function create_if_block(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let p0;
    	let t2;
    	let t3_value = /*brief*/ ctx[5] + "";
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6_value = /*id*/ ctx[6] + "";
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9_value = /*tools*/ ctx[7] + "";
    	let t9;
    	let t10;
    	let p3;
    	let t11;
    	let t12_value = /*delivery*/ ctx[8] + "";
    	let t12;
    	let t13;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t2 = text("Brief: ");
    			t3 = text(t3_value);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("ID: ");
    			t6 = text(t6_value);
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Tools: ");
    			t9 = text(t9_value);
    			t10 = space();
    			p3 = element("p");
    			t11 = text("Delivery: ");
    			t12 = text(t12_value);
    			t13 = space();
    			attr_dev(div0, "class", "overlay svelte-h37r31");
    			add_location(div0, file$1, 47, 6, 944);
    			attr_dev(img, "loading", "lazy");
    			if (img.src !== (img_src_value = /*path*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "big-highlight");
    			attr_dev(img, "class", "svelte-h37r31");
    			add_location(img, file$1, 48, 6, 974);
    			add_location(p0, file$1, 50, 8, 1075);
    			add_location(p1, file$1, 51, 8, 1105);
    			add_location(p2, file$1, 52, 8, 1129);
    			add_location(p3, file$1, 53, 8, 1159);
    			attr_dev(div1, "class", "big-highlight-text svelte-h37r31");
    			add_location(div1, file$1, 49, 6, 1034);
    			attr_dev(div2, "class", "big-highlight svelte-h37r31");
    			add_location(div2, file$1, 46, 4, 910);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, img);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p2);
    			append_dev(p2, t8);
    			append_dev(p2, t9);
    			append_dev(div1, t10);
    			append_dev(div1, p3);
    			append_dev(p3, t11);
    			append_dev(p3, t12);
    			append_dev(div2, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$imageList*/ 2 && img.src !== (img_src_value = /*path*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$imageList*/ 2 && t3_value !== (t3_value = /*brief*/ ctx[5] + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$imageList*/ 2 && t6_value !== (t6_value = /*id*/ ctx[6] + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$imageList*/ 2 && t9_value !== (t9_value = /*tools*/ ctx[7] + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*$imageList*/ 2 && t12_value !== (t12_value = /*delivery*/ ctx[8] + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(46:2) {#if placement === 'bigHighlight' && placementOrder === order}",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*placement*/ ctx[2] === "bigHighlight" && /*placementOrder*/ ctx[3] === /*order*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*placement*/ ctx[2] === "bigHighlight" && /*placementOrder*/ ctx[3] === /*order*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(45:0) {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*$imageList*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$imageList, order*/ 3) {
    				each_value = /*$imageList*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $imageList;
    	validate_store(imageList, "imageList");
    	component_subscribe($$self, imageList, $$value => $$invalidate(1, $imageList = $$value));
    	let { order } = $$props;
    	const writable_props = ["order"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BigHighlight> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("order" in $$props) $$invalidate(0, order = $$props.order);
    	};

    	$$self.$capture_state = () => {
    		return { order, $imageList };
    	};

    	$$self.$inject_state = $$props => {
    		if ("order" in $$props) $$invalidate(0, order = $$props.order);
    		if ("$imageList" in $$props) imageList.set($imageList = $$props.$imageList);
    	};

    	return [order, $imageList];
    }

    class BigHighlight extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, { order: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BigHighlight",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*order*/ ctx[0] === undefined && !("order" in props)) {
    			console.warn("<BigHighlight> was created without expected prop 'order'");
    		}
    	}

    	get order() {
    		throw new Error("<BigHighlight>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<BigHighlight>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SmallHighlights.svelte generated by Svelte v3.17.2 */
    const file$2 = "src/components/SmallHighlights.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].placement;
    	child_ctx[6] = list[i].placementOrder;
    	child_ctx[7] = list[i].path;
    	child_ctx[8] = list[i].brief;
    	child_ctx[9] = list[i].id;
    	child_ctx[10] = list[i].tools;
    	child_ctx[11] = list[i].delivery;
    	return child_ctx;
    }

    // (65:4) {#if placement === 'smallHighlight' && placementOrder >= order1 && placementOrder <= order2}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let if_block = !/*$isMobileBrowser*/ ctx[1] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(div0, "class", "overlay svelte-dkee9x");
    			add_location(div0, file$2, 66, 8, 1489);
    			attr_dev(img, "loading", "lazy");
    			if (img.src !== (img_src_value = /*path*/ ctx[7])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "small-highlight");
    			attr_dev(img, "class", "svelte-dkee9x");
    			add_location(img, file$2, 67, 8, 1521);
    			attr_dev(div1, "class", "small-highlight svelte-dkee9x");
    			add_location(div1, file$2, 65, 6, 1451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$imageList*/ 1 && img.src !== (img_src_value = /*path*/ ctx[7])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!/*$isMobileBrowser*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(65:4) {#if placement === 'smallHighlight' && placementOrder >= order1 && placementOrder <= order2}",
    		ctx
    	});

    	return block;
    }

    // (69:8) {#if !$isMobileBrowser}
    function create_if_block_1(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1_value = /*brief*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4_value = /*id*/ ctx[9] + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6;
    	let t7_value = /*tools*/ ctx[10] + "";
    	let t7;
    	let t8;
    	let p3;
    	let t9;
    	let t10_value = /*delivery*/ ctx[11] + "";
    	let t10;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Brief: ");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("ID: ");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Tools: ");
    			t7 = text(t7_value);
    			t8 = space();
    			p3 = element("p");
    			t9 = text("Delivery: ");
    			t10 = text(t10_value);
    			add_location(p0, file$2, 70, 12, 1666);
    			add_location(p1, file$2, 71, 12, 1700);
    			add_location(p2, file$2, 72, 12, 1728);
    			add_location(p3, file$2, 73, 12, 1762);
    			attr_dev(div, "class", "small-highlight-text svelte-dkee9x");
    			add_location(div, file$2, 69, 10, 1619);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			append_dev(div, t8);
    			append_dev(div, p3);
    			append_dev(p3, t9);
    			append_dev(p3, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$imageList*/ 1 && t1_value !== (t1_value = /*brief*/ ctx[8] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$imageList*/ 1 && t4_value !== (t4_value = /*id*/ ctx[9] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$imageList*/ 1 && t7_value !== (t7_value = /*tools*/ ctx[10] + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$imageList*/ 1 && t10_value !== (t10_value = /*delivery*/ ctx[11] + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(69:8) {#if !$isMobileBrowser}",
    		ctx
    	});

    	return block;
    }

    // (64:2) {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}
    function create_each_block$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*placement*/ ctx[5] === "smallHighlight" && /*placementOrder*/ ctx[6] >= /*order1*/ ctx[2] && /*placementOrder*/ ctx[6] <= /*order2*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*placement*/ ctx[5] === "smallHighlight" && /*placementOrder*/ ctx[6] >= /*order1*/ ctx[2] && /*placementOrder*/ ctx[6] <= /*order2*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(64:2) {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let each_value = /*$imageList*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "small-container svelte-dkee9x");
    			add_location(div, file$2, 62, 0, 1230);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$imageList, order1, order2, $isMobileBrowser*/ 15) {
    				each_value = /*$imageList*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $imageList;
    	let $isMobileBrowser;
    	validate_store(imageList, "imageList");
    	component_subscribe($$self, imageList, $$value => $$invalidate(0, $imageList = $$value));
    	validate_store(isMobileBrowser, "isMobileBrowser");
    	component_subscribe($$self, isMobileBrowser, $$value => $$invalidate(1, $isMobileBrowser = $$value));
    	let { order = [] } = $$props;
    	const [order1, order2] = order;
    	const writable_props = ["order"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SmallHighlights> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("order" in $$props) $$invalidate(4, order = $$props.order);
    	};

    	$$self.$capture_state = () => {
    		return { order, $imageList, $isMobileBrowser };
    	};

    	$$self.$inject_state = $$props => {
    		if ("order" in $$props) $$invalidate(4, order = $$props.order);
    		if ("$imageList" in $$props) imageList.set($imageList = $$props.$imageList);
    		if ("$isMobileBrowser" in $$props) isMobileBrowser.set($isMobileBrowser = $$props.$isMobileBrowser);
    	};

    	return [$imageList, $isMobileBrowser, order1, order2, order];
    }

    class SmallHighlights extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, { order: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SmallHighlights",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get order() {
    		throw new Error("<SmallHighlights>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<SmallHighlights>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/OtherImages.svelte generated by Svelte v3.17.2 */
    const file$3 = "src/components/OtherImages.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].placement;
    	child_ctx[6] = list[i].placementOrder;
    	child_ctx[7] = list[i].path;
    	child_ctx[8] = list[i].brief;
    	child_ctx[9] = list[i].id;
    	child_ctx[10] = list[i].tools;
    	child_ctx[11] = list[i].delivery;
    	return child_ctx;
    }

    // (62:4) {#if placement === 'otherImages' && placementOrder >= order1 && placementOrder <= order2}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let t2;
    	let if_block = !/*$isMobileBrowser*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			attr_dev(div0, "class", "overlay svelte-j0wnt8");
    			add_location(div0, file$3, 63, 8, 1443);
    			attr_dev(img, "loading", "lazy");
    			if (img.src !== (img_src_value = /*path*/ ctx[7])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "other-images");
    			attr_dev(img, "class", "svelte-j0wnt8");
    			add_location(img, file$3, 64, 8, 1475);
    			attr_dev(div1, "class", "other-imgs svelte-j0wnt8");
    			add_location(div1, file$3, 62, 6, 1410);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$imageList*/ 1 && img.src !== (img_src_value = /*path*/ ctx[7])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!/*$isMobileBrowser*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(62:4) {#if placement === 'otherImages' && placementOrder >= order1 && placementOrder <= order2}",
    		ctx
    	});

    	return block;
    }

    // (66:8) {#if !$isMobileBrowser}
    function create_if_block_1$1(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1_value = /*brief*/ ctx[8] + "";
    	let t1;
    	let t2;
    	let p1;
    	let t3;
    	let t4_value = /*id*/ ctx[9] + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6;
    	let t7_value = /*tools*/ ctx[10] + "";
    	let t7;
    	let t8;
    	let p3;
    	let t9;
    	let t10_value = /*delivery*/ ctx[11] + "";
    	let t10;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("Brief: ");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			t3 = text("ID: ");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Tools: ");
    			t7 = text(t7_value);
    			t8 = space();
    			p3 = element("p");
    			t9 = text("Delivery: ");
    			t10 = text(t10_value);
    			add_location(p0, file$3, 67, 12, 1612);
    			add_location(p1, file$3, 68, 12, 1646);
    			add_location(p2, file$3, 69, 12, 1674);
    			add_location(p3, file$3, 70, 12, 1708);
    			attr_dev(div, "class", "other-imgs-text svelte-j0wnt8");
    			add_location(div, file$3, 66, 10, 1570);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(div, t2);
    			append_dev(div, p1);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			append_dev(div, t5);
    			append_dev(div, p2);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			append_dev(div, t8);
    			append_dev(div, p3);
    			append_dev(p3, t9);
    			append_dev(p3, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$imageList*/ 1 && t1_value !== (t1_value = /*brief*/ ctx[8] + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$imageList*/ 1 && t4_value !== (t4_value = /*id*/ ctx[9] + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$imageList*/ 1 && t7_value !== (t7_value = /*tools*/ ctx[10] + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$imageList*/ 1 && t10_value !== (t10_value = /*delivery*/ ctx[11] + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(66:8) {#if !$isMobileBrowser}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}
    function create_each_block$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*placement*/ ctx[5] === "otherImages" && /*placementOrder*/ ctx[6] >= /*order1*/ ctx[2] && /*placementOrder*/ ctx[6] <= /*order2*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*placement*/ ctx[5] === "otherImages" && /*placementOrder*/ ctx[6] >= /*order1*/ ctx[2] && /*placementOrder*/ ctx[6] <= /*order2*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(61:2) {#each $imageList as { placement, placementOrder, path, brief, id, tools, delivery }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_value = /*$imageList*/ ctx[0];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "other-container svelte-j0wnt8");
    			add_location(div, file$3, 59, 0, 1192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$imageList, order1, order2, $isMobileBrowser*/ 15) {
    				each_value = /*$imageList*/ ctx[0];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $imageList;
    	let $isMobileBrowser;
    	validate_store(imageList, "imageList");
    	component_subscribe($$self, imageList, $$value => $$invalidate(0, $imageList = $$value));
    	validate_store(isMobileBrowser, "isMobileBrowser");
    	component_subscribe($$self, isMobileBrowser, $$value => $$invalidate(1, $isMobileBrowser = $$value));
    	let { order = [] } = $$props;
    	const [order1, order2] = order;
    	const writable_props = ["order"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<OtherImages> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("order" in $$props) $$invalidate(4, order = $$props.order);
    	};

    	$$self.$capture_state = () => {
    		return { order, $imageList, $isMobileBrowser };
    	};

    	$$self.$inject_state = $$props => {
    		if ("order" in $$props) $$invalidate(4, order = $$props.order);
    		if ("$imageList" in $$props) imageList.set($imageList = $$props.$imageList);
    		if ("$isMobileBrowser" in $$props) isMobileBrowser.set($isMobileBrowser = $$props.$isMobileBrowser);
    	};

    	return [$imageList, $isMobileBrowser, order1, order2, order];
    }

    class OtherImages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, { order: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OtherImages",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get order() {
    		throw new Error("<OtherImages>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<OtherImages>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/IntersectionObserver.svelte generated by Svelte v3.17.2 */
    const file$4 = "src/components/IntersectionObserver.svelte";
    const get_default_slot_changes = dirty => ({ intersecting: dirty & /*intersecting*/ 1 });
    const get_default_slot_context = ctx => ({ intersecting: /*intersecting*/ ctx[0] });

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$4, 45, 0, 1214);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[9](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope, intersecting*/ 129) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[9](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { once = false } = $$props;
    	let { top = 0 } = $$props;
    	let { bottom = 0 } = $$props;
    	let { left = 0 } = $$props;
    	let { right = 0 } = $$props;
    	let intersecting = false;
    	let container;

    	onMount(() => {
    		if (typeof IntersectionObserver !== "undefined") {
    			const rootMargin = `${bottom}px ${left}px ${top}px ${right}px`;

    			const observer = new IntersectionObserver(entries => {
    					$$invalidate(0, intersecting = entries[0].isIntersecting);

    					if (intersecting && once) {
    						observer.unobserve(container);
    					}
    				},
    			{ rootMargin });

    			observer.observe(container);
    			return () => observer.unobserve(container);
    		}

    		function handler() {
    			const bcr = container.getBoundingClientRect();
    			$$invalidate(0, intersecting = bcr.bottom + bottom > 0 && bcr.right + right > 0 && bcr.top - top < window.innerHeight && bcr.left - left < window.innerWidth);

    			if (intersecting && once) {
    				window.removeEventListener("scroll", handler);
    			}
    		}

    		window.addEventListener("scroll", handler);
    		return () => window.removeEventListener("scroll", handler);
    	});

    	const writable_props = ["once", "top", "bottom", "left", "right"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntersectionObserver> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(1, container = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("once" in $$props) $$invalidate(2, once = $$props.once);
    		if ("top" in $$props) $$invalidate(3, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(5, left = $$props.left);
    		if ("right" in $$props) $$invalidate(6, right = $$props.right);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {
    			once,
    			top,
    			bottom,
    			left,
    			right,
    			intersecting,
    			container
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("once" in $$props) $$invalidate(2, once = $$props.once);
    		if ("top" in $$props) $$invalidate(3, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(4, bottom = $$props.bottom);
    		if ("left" in $$props) $$invalidate(5, left = $$props.left);
    		if ("right" in $$props) $$invalidate(6, right = $$props.right);
    		if ("intersecting" in $$props) $$invalidate(0, intersecting = $$props.intersecting);
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    	};

    	return [
    		intersecting,
    		container,
    		once,
    		top,
    		bottom,
    		left,
    		right,
    		$$scope,
    		$$slots,
    		div_binding
    	];
    }

    class IntersectionObserver_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$4, safe_not_equal, {
    			once: 2,
    			top: 3,
    			bottom: 4,
    			left: 5,
    			right: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntersectionObserver_1",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get once() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get top() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get left() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set left(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Feed.svelte generated by Svelte v3.17.2 */
    const file$5 = "src/components/Feed.svelte";

    // (37:4) {#if intersecting}
    function create_if_block$3(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let t4;
    	let current;
    	const bighighlight0 = new BigHighlight({ props: { order: 0 }, $$inline: true });
    	const smallhighlights0 = new SmallHighlights({ props: { order: [0, 3] }, $$inline: true });
    	const otherimages0 = new OtherImages({ props: { order: [0, 5] }, $$inline: true });
    	const bighighlight1 = new BigHighlight({ props: { order: 1 }, $$inline: true });
    	const smallhighlights1 = new SmallHighlights({ props: { order: [4, 7] }, $$inline: true });

    	const otherimages1 = new OtherImages({
    			props: { order: [6, 11] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(bighighlight0.$$.fragment);
    			t0 = space();
    			create_component(smallhighlights0.$$.fragment);
    			t1 = space();
    			create_component(otherimages0.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			create_component(bighighlight1.$$.fragment);
    			t3 = space();
    			create_component(smallhighlights1.$$.fragment);
    			t4 = space();
    			create_component(otherimages1.$$.fragment);
    			attr_dev(div0, "class", "highlights-container svelte-irmy3n");
    			add_location(div0, file$5, 37, 6, 942);
    			attr_dev(div1, "class", "highlights-container svelte-irmy3n");
    			add_location(div1, file$5, 42, 6, 1111);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(bighighlight0, div0, null);
    			append_dev(div0, t0);
    			mount_component(smallhighlights0, div0, null);
    			insert_dev(target, t1, anchor);
    			mount_component(otherimages0, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(bighighlight1, div1, null);
    			append_dev(div1, t3);
    			mount_component(smallhighlights1, div1, null);
    			insert_dev(target, t4, anchor);
    			mount_component(otherimages1, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bighighlight0.$$.fragment, local);
    			transition_in(smallhighlights0.$$.fragment, local);
    			transition_in(otherimages0.$$.fragment, local);
    			transition_in(bighighlight1.$$.fragment, local);
    			transition_in(smallhighlights1.$$.fragment, local);
    			transition_in(otherimages1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bighighlight0.$$.fragment, local);
    			transition_out(smallhighlights0.$$.fragment, local);
    			transition_out(otherimages0.$$.fragment, local);
    			transition_out(bighighlight1.$$.fragment, local);
    			transition_out(smallhighlights1.$$.fragment, local);
    			transition_out(otherimages1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(bighighlight0);
    			destroy_component(smallhighlights0);
    			if (detaching) detach_dev(t1);
    			destroy_component(otherimages0, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_component(bighighlight1);
    			destroy_component(smallhighlights1);
    			if (detaching) detach_dev(t4);
    			destroy_component(otherimages1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(37:4) {#if intersecting}",
    		ctx
    	});

    	return block;
    }

    // (36:2) <IntersectionObserver let:intersecting top={400}>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*intersecting*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*intersecting*/ ctx[0]) {
    				if (!if_block) {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					transition_in(if_block, 1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(36:2) <IntersectionObserver let:intersecting top={400}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div;
    	let current;

    	const intersectionobserver = new IntersectionObserver_1({
    			props: {
    				top: 400,
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ intersecting }) => ({ 0: intersecting }),
    						({ intersecting }) => intersecting ? 1 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(intersectionobserver.$$.fragment);
    			attr_dev(div, "class", "Feed svelte-irmy3n");
    			add_location(div, file$5, 34, 0, 842);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(intersectionobserver, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};

    			if (dirty & /*$$scope, intersecting*/ 3) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(intersectionobserver);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class Feed extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Feed",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.17.2 */
    const file$6 = "src/App.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let t;
    	let current;
    	const header = new Header({ $$inline: true });
    	const feed = new Feed({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(feed.$$.fragment);
    			add_location(main, file$6, 5, 0, 118);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t);
    			mount_component(feed, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(feed.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(feed.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(feed);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
