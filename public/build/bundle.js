
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
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
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
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
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
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
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.38.3 */

    const { Error: Error_1, Object: Object_1$1, console: console_1$1 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		const newState = { ...history.state };
    		delete newState["__svelte_spa_router_scrollX"];
    		delete newState["__svelte_spa_router_scrollY"];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute("href");

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == "/") {
    		// Add # to the href attribute
    		href = "#" + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != "#/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	node.setAttribute("href", href);

    	node.addEventListener("click", event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute("href"));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == "string") {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener("popstate", popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == "object" && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener("popstate", popStateChanged);
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("popStateChanged" in $$props) popStateChanged = $$props.popStateChanged;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$o.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class PageDesc {

        constructor ( red = 0, green = 0, blue = 0, newtext = "Test text" ) {
            this.r = red;
            this.g = green;
            this.b = blue;
            this.t = newtext;
        }
    }

    class userAccount {
        constructor ( logon = false, name = 'Guest', profLink = "/#/login" ){
            this.logon = logon;
            this.name = name;
            this.profLink = "/#/login";
            this.userID;
        }
    }

    const userAcc = writable( new userAccount() );

    const ActualPageDescription = writable( new PageDesc() );

    const basketMap = writable( new Map() );

    const basketSizeHolder = writable( 0 );

    const productTotalSummValue = writable( 0 );

    let clearMesageTimer;

    function errMessage( message ) {
        ActualPageDescription.update( obj => {
            obj.r = 128;
            obj.g = 0;
            obj.b = 0;
            obj.t = message;
            return obj;
        } );
        clearMesageTimer = setTimeout( simpleMessage, 3000, "" );
    }
        
    function successMessage( message ) {
        ActualPageDescription.update( obj => {
            obj.r = 0;
            obj.g = 143;
            obj.b = 143;
            obj.t = message;
            return obj;
        } );
        clearMesageTimer = setTimeout( simpleMessage, 3000, "" );
    }

    function simpleMessage( message ) {
        ActualPageDescription.update( obj => {
            obj.r = 0;
            obj.g = 0;
            obj.b = 0;
            obj.t = message;
            return obj;
        } );
        clearTimeout( clearMesageTimer );
    }

    /* src\Pages\Home.svelte generated by Svelte v3.38.3 */
    const file$j = "src\\Pages\\Home.svelte";

    function create_fragment$n(ctx) {
    	let body;
    	let span;
    	let p0;
    	let t1;
    	let p1;
    	let t2;
    	let a0;
    	let t4;
    	let t5;
    	let p2;
    	let t6;
    	let a1;
    	let t8;
    	let a2;
    	let t10;
    	let a3;
    	let t12;
    	let t13;
    	let p3;
    	let t15;
    	let ul;
    	let li0;
    	let h30;
    	let t17;
    	let li1;
    	let a4;
    	let h31;
    	let t19;
    	let li2;
    	let a5;
    	let h32;

    	const block = {
    		c: function create() {
    			body = element("body");
    			span = element("span");
    			p0 = element("p");
    			p0.textContent = "Hi! My name is Valentins Lubgans and this is my project. At first I want to apologise for the design - working on this project I understood\r\n                one thing: I am not a designer at all. Second thing - I am  new in programming and I am still learning. This project was made to show my \r\n                skills in JS, CSS and THML at this moment. Having a little experience in the IT sector for now, I am looking for a job as a junior developer where I could improve \r\n                my skills as an IT developer.";
    			t1 = space();
    			p1 = element("p");
    			t2 = text("In this project I used  ");
    			a0 = element("a");
    			a0.textContent = "Svelte";
    			t4 = text(" framework for front-end development. Why Svelte? \r\n                It is a new and really powerfull framework, and I find it very used-friendly. But It is just a framework and I can quickly learn to operate with other \r\n                often used franeworks like Angular, React or Vue.js.");
    			t5 = space();
    			p2 = element("p");
    			t6 = text("For the server part I used Node.js with ");
    			a1 = element("a");
    			a1.textContent = "express.js";
    			t8 = text(" framework. For the database I used \r\n             ");
    			a2 = element("a");
    			a2.textContent = "mongoDB";
    			t10 = text(" with Mongoose library. All images are saved on the server. All passwords are hashed with \r\n             ");
    			a3 = element("a");
    			a3.textContent = "bcrypt";
    			t12 = text(" library.");
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "I have never worked as an IT developer, but I do know that most IT companies use Angular, React and Vue.js frameworks and use different\r\n                databases. This project is too small to show all the programming options, but It is big enough to show the most important part - I understand the programming structure and\r\n                 I challenge myself in finding solutions to any problem. Self-learning process proved that I am self-disciplined and motivated to keep working until getting the result. \r\n                 I enjoyed every single challenge and brainstorming - I am now sure that learning, experimenting, exploring options and seeking the most suitable solution is something \r\n                 I know I can and want to do for living.";
    			t15 = space();
    			ul = element("ul");
    			li0 = element("li");
    			h30 = element("h3");
    			h30.textContent = "My code on GitHub:";
    			t17 = space();
    			li1 = element("li");
    			a4 = element("a");
    			h31 = element("h3");
    			h31.textContent = "Web app repository";
    			t19 = space();
    			li2 = element("li");
    			a5 = element("a");
    			h32 = element("h3");
    			h32.textContent = "Server part repository";
    			attr_dev(p0, "class", "svelte-1d7v9ee");
    			add_location(p0, file$j, 13, 12, 345);
    			attr_dev(a0, "href", "https://svelte.dev/");
    			add_location(a0, file$j, 21, 40, 968);
    			attr_dev(p1, "class", "svelte-1d7v9ee");
    			add_location(p1, file$j, 20, 12, 923);
    			attr_dev(a1, "href", "https://expressjs.com/");
    			add_location(a1, file$j, 27, 56, 1392);
    			attr_dev(a2, "href", "https://www.mongodb.com/");
    			add_location(a2, file$j, 28, 13, 1490);
    			attr_dev(a3, "href", "https://www.npmjs.com/package/bcrypt");
    			add_location(a3, file$j, 29, 13, 1641);
    			attr_dev(p2, "class", "svelte-1d7v9ee");
    			add_location(p2, file$j, 26, 12, 1331);
    			attr_dev(p3, "class", "svelte-1d7v9ee");
    			add_location(p3, file$j, 32, 12, 1741);
    			attr_dev(h30, "class", "svelte-1d7v9ee");
    			add_location(h30, file$j, 40, 21, 2577);
    			add_location(li0, file$j, 40, 16, 2572);
    			attr_dev(h31, "class", "svelte-1d7v9ee");
    			add_location(h31, file$j, 41, 79, 2694);
    			attr_dev(a4, "href", "https://github.com/valentinslubgans/WebApp.git");
    			add_location(a4, file$j, 41, 21, 2636);
    			add_location(li1, file$j, 41, 16, 2631);
    			attr_dev(h32, "class", "svelte-1d7v9ee");
    			add_location(h32, file$j, 42, 79, 2815);
    			attr_dev(a5, "href", "https://github.com/valentinslubgans/Server.git");
    			add_location(a5, file$j, 42, 21, 2757);
    			add_location(li2, file$j, 42, 16, 2752);
    			attr_dev(ul, "class", "svelte-1d7v9ee");
    			add_location(ul, file$j, 39, 12, 2550);
    			attr_dev(span, "class", "svelte-1d7v9ee");
    			add_location(span, file$j, 11, 8, 323);
    			attr_dev(body, "class", "svelte-1d7v9ee");
    			add_location(body, file$j, 10, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, span);
    			append_dev(span, p0);
    			append_dev(span, t1);
    			append_dev(span, p1);
    			append_dev(p1, t2);
    			append_dev(p1, a0);
    			append_dev(p1, t4);
    			append_dev(span, t5);
    			append_dev(span, p2);
    			append_dev(p2, t6);
    			append_dev(p2, a1);
    			append_dev(p2, t8);
    			append_dev(p2, a2);
    			append_dev(p2, t10);
    			append_dev(p2, a3);
    			append_dev(p2, t12);
    			append_dev(span, t13);
    			append_dev(span, p3);
    			append_dev(span, t15);
    			append_dev(span, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h30);
    			append_dev(ul, t17);
    			append_dev(ul, li1);
    			append_dev(li1, a4);
    			append_dev(a4, h31);
    			append_dev(ul, t19);
    			append_dev(ul, li2);
    			append_dev(li2, a5);
    			append_dev(a5, h32);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);

    	onMount(() => {
    		simpleMessage("Hi, this is the Home page. <br> On this page i want to tell you a bit about this project and myself.");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		simpleMessage
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src\Pages\About.svelte generated by Svelte v3.38.3 */
    const file$i = "src\\Pages\\About.svelte";

    function create_fragment$m(ctx) {
    	let body;
    	let span;
    	let p0;
    	let t0;
    	let a;
    	let t2;
    	let t3;
    	let p1;
    	let t5;
    	let p2;

    	const block = {
    		c: function create() {
    			body = element("body");
    			span = element("span");
    			p0 = element("p");
    			t0 = text("If You red ");
    			a = element("a");
    			a.textContent = "home page";
    			t2 = text(", You already know, my name is Valentins Lubgans and i am 32 year old.\r\n            First time i face with programming when i was 15. That time were popular game \"Ultima Online\", i played on \r\n            private server where were legal software, witch allowed automatizate avery process in a game via scripts.\r\n            As I`m lazy person, I start to lear script language and in some time i could automatizate everything. \r\n            Year after, i join to a project, where we made own private server for this game. It wasn`t popular, \r\n            as well it used script language, but it gave me good experience.");
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "After I finished technical school and moved to England. All this time i dropped off programming,\r\n            before, leaving in England, i start to play \"World of Warcraft\" ( WoW forward ). As You remember, i`m lazy person, \r\n            and didn`t want to press all buttons by myself, it was kind a playing piano... So i made the addon (using LUA languge),\r\n            learned Java to make software, witch could communicate with my addon and pressed buttons my place. After i start \r\n            to use C++ for softwares. After i dropped off programming once again till i came back to Latvia.";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Year ago i deside: i will change my life, and first - i will change my job, i want to do, what i like to do!\r\n            I really enjoy with developing, solutions founding. So i start to learn Java Script. Every day after hard job, \r\n            at leas hour i learned JS. At the end of summer, i finished my job, and concentrated on this project creating.";
    			attr_dev(a, "href", "/#/");
    			add_location(a, file$i, 14, 23, 317);
    			attr_dev(p0, "class", "svelte-otpqlk");
    			add_location(p0, file$i, 13, 8, 289);
    			attr_dev(p1, "class", "svelte-otpqlk");
    			add_location(p1, file$i, 22, 8, 988);
    			attr_dev(p2, "class", "svelte-otpqlk");
    			add_location(p2, file$i, 30, 8, 1627);
    			attr_dev(span, "class", "svelte-otpqlk");
    			add_location(span, file$i, 12, 4, 273);
    			attr_dev(body, "class", "svelte-otpqlk");
    			add_location(body, file$i, 11, 0, 261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, span);
    			append_dev(span, p0);
    			append_dev(p0, t0);
    			append_dev(p0, a);
    			append_dev(p0, t2);
    			append_dev(span, t3);
    			append_dev(span, p1);
    			append_dev(span, t5);
    			append_dev(span, p2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);

    	onMount(() => {
    		simpleMessage("On this page i want to tell you a bit more about my.");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		simpleMessage
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    function NewsDisplay(element) {

        const userAcc_News = get_store_value(userAcc);

        let mainDiv = document.createElement("div");
        document.getElementById("newsBody").prepend(mainDiv);
        AddStyleToMain(mainDiv);

        let span = document.createElement("span");
        mainDiv.appendChild(span);
        spanStyle(span);

        let newsText = document.createElement("h3");
        newsText.innerHTML = element.newsText;
        mainDiv.appendChild(newsText);
        newsTextStyle(newsText);

        let newsHeader = document.createElement("h2");
        newsHeader.innerHTML = element.newsHeader;
        span.appendChild(newsHeader);
        newsHeaderStyle(newsHeader);

        let newDate = document.createElement("h3");
        newDate.innerHTML = element.newsPostingDate;
        newsHeader.appendChild(newDate);
        newDateStyle(newDate);

        let newsPostedBy = document.createElement("h5");
        newsPostedBy.innerHTML = "posted by " + element.authorName;
        mainDiv.appendChild(newsPostedBy);
        newsPostedByStyle(newsPostedBy);

        if (userAcc_News.userID == element.authorID) {
            let newsDeleteButton = document.createElement("button");
            mainDiv.appendChild(newsDeleteButton);
            newsDeleteButton.innerHTML = "Delete";
            newsDeleteButtonStyle(newsDeleteButton);

            newsDeleteButton.value = element._id;
            newsDeleteButton.onclick = async () => {
                await fetch("http://localhost:5000/newsDelete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        newsID: newsDeleteButton.value,
                        userID: userAcc_News.userID
                    })
                })
                .then( response => response.json() )
                .then( data => successMessage( data ) );

                mainDiv.remove();
            };
        }
    }


    function AddStyleToMain(element) {
        element.style.width = "70%";
        element.style.height = "auto";
        element.style.margin = "0";
        element.style.marginTop = "100px";
        element.style.marginLeft = "auto";
        element.style.marginRight = "auto";
        element.style.padding = "0";
        element.style.paddingBottom = "5px";
        element.style.backgroundColor = "white";
        element.style.maxWidth = "1000px";
    }


    function spanStyle(element) {
        element.style.paddingBottom = "5px";
        element.style.width = "100%";
        element.style.height = "auto";
        element.style.backgroundColor = "teal";
        element.style.display = "grid";
    }


    function newsHeaderStyle(element) {
        element.style.margin = "0";
        element.style.marginTop = "5px";
        element.style.marginLeft = "10px";
        element.style.marginRight = "10px";
        element.style.color = "white";
        element.style.fontSize = "20px";
        element.style.display = "grid";
    }

    function newDateStyle(element) {
        element.style.margin = "0";
        element.style.marginRight = "10px";
        element.style.marginLeft = "auto";
        element.style.marginTop = "2px";
        element.style.padding = "0";
        element.style.fontSize = "10px";
        element.style.color = "white";
        element.style.display = "grid";
        element.style.float = "right";
    }

    function newsTextStyle(element) {
        element.style.margin = "0";
        element.style.marginLeft = "10px";
        element.style.marginRight = "10px";
        element.style.marginTop = "10px";
        element.style.fontWeight = "400";
        element.style.fontSize = "15px";
        element.style.textIndent = "10px";
    }

    function newsPostedByStyle(element) {
        element.style.margin = "0";
        element.style.marginTop = "20px";
        element.style.marginLeft = "10px";
        element.style.padding = "0";
    }

    function newsDeleteButtonStyle(element) {
        element.style.float = "right";
        element.style.margin = "0";
        element.style.marginTop = "10px";
        element.style.width = "20%";
        element.style.color = "white";
        element.style.backgroundColor = "rgb(128,0,0)";
        element.style.fontWeight = "500";

    }

    /* src\Pages\News\AddNews.svelte generated by Svelte v3.38.3 */
    const file$h = "src\\Pages\\News\\AddNews.svelte";

    function create_fragment$l(ctx) {
    	let body;
    	let div1;
    	let span;
    	let h1;
    	let t1;
    	let div0;
    	let input;
    	let t2;
    	let textarea;
    	let t3;
    	let button;
    	let h2;
    	let t5;
    	let hr;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div1 = element("div");
    			span = element("span");
    			h1 = element("h1");
    			h1.textContent = "Add news";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			textarea = element("textarea");
    			t3 = space();
    			button = element("button");
    			h2 = element("h2");
    			h2.textContent = "Place news";
    			t5 = space();
    			hr = element("hr");
    			attr_dev(h1, "class", "svelte-hqrdcn");
    			add_location(h1, file$h, 80, 12, 2394);
    			attr_dev(span, "class", "svelte-hqrdcn");
    			add_location(span, file$h, 79, 8, 2347);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "ENTER NEWS HEADER");
    			attr_dev(input, "id", "newsHeader");
    			attr_dev(input, "class", "svelte-hqrdcn");
    			add_location(input, file$h, 84, 12, 2489);
    			attr_dev(textarea, "name", "news");
    			attr_dev(textarea, "placeholder", "Enter your text here");
    			attr_dev(textarea, "id", "newstext");
    			attr_dev(textarea, "class", "svelte-hqrdcn");
    			add_location(textarea, file$h, 86, 12, 2580);
    			attr_dev(h2, "class", "svelte-hqrdcn");
    			add_location(h2, file$h, 88, 44, 2714);
    			attr_dev(button, "class", "svelte-hqrdcn");
    			add_location(button, file$h, 88, 12, 2682);
    			attr_dev(div0, "id", "addNewsDivHolder");
    			attr_dev(div0, "class", "svelte-hqrdcn");
    			add_location(div0, file$h, 83, 8, 2448);
    			attr_dev(div1, "class", "svelte-hqrdcn");
    			add_location(div1, file$h, 78, 4, 2332);
    			attr_dev(hr, "class", "svelte-hqrdcn");
    			add_location(hr, file$h, 93, 4, 2781);
    			attr_dev(body, "class", "svelte-hqrdcn");
    			add_location(body, file$h, 77, 0, 2320);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div1);
    			append_dev(div1, span);
    			append_dev(span, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			append_dev(div0, t2);
    			append_dev(div0, textarea);
    			append_dev(div0, t3);
    			append_dev(div0, button);
    			append_dev(button, h2);
    			append_dev(body, t5);
    			append_dev(body, hr);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*addNewsDivOpen*/ ctx[1], false, false, false),
    					listen_dev(button, "click", /*fieldsCheck*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let $userAcc;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(3, $userAcc = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddNews", slots, []);

    	onMount(() => {
    		document.getElementById("newsHeader").focus();
    	});

    	function fieldsCheck() {
    		if (document.getElementById("newsHeader").value.length < 3 || document.getElementById("newstext").value.length < 20) {
    			errMessage("Please fell out the fields");
    			return;
    		} else newsPosting();
    	}

    	function newsPosting() {
    		const postingDate = new Intl.DateTimeFormat("en-GB",
    		{
    				year: "numeric",
    				month: "long",
    				day: "numeric",
    				hour: "numeric",
    				minute: "numeric",
    				second: "numeric",
    				hour12: false
    			});

    		fetch("http://localhost:5000/newsPosting", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				authorID: $userAcc.userID,
    				authorName: $userAcc.name,
    				newsPostingDate: "posting date: " + postingDate.format(new Date()),
    				newsHeader: document.getElementById("newsHeader").value,
    				newsText: document.getElementById("newstext").value
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.newsposting) {
    				document.getElementById("newsHeader").value = "";
    				document.getElementById("newstext").value = "";
    				successMessage(data.text);
    				NewsDisplay(data.news);
    			} else {
    				errMessage(data.text);
    			}
    		});
    	}

    	let scaleValue = 0;

    	function addNewsDivOpen() {
    		let addNewsDiv = document.getElementById("addNewsDivHolder");

    		if (scaleValue) {
    			scaleValue = 0;
    			addNewsDiv.style.height = "0";
    			addNewsDiv.style.transform = `scale(${scaleValue})`;
    			return;
    		}

    		scaleValue = 1;
    		addNewsDiv.style.height = "420px";
    		addNewsDiv.style.transform = `scale(${scaleValue})`;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddNews> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		successMessage,
    		userAcc,
    		NewsDisplay,
    		fieldsCheck,
    		newsPosting,
    		scaleValue,
    		addNewsDivOpen,
    		$userAcc
    	});

    	$$self.$inject_state = $$props => {
    		if ("scaleValue" in $$props) scaleValue = $$props.scaleValue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fieldsCheck, addNewsDivOpen];
    }

    class AddNews extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddNews",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* src\Pages\News\News.svelte generated by Svelte v3.38.3 */
    const file$g = "src\\Pages\\News\\News.svelte";

    // (27:0) {#if $userAcc.logon}
    function create_if_block$3(ctx) {
    	let addnews;
    	let current;
    	addnews = new AddNews({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(addnews.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(addnews, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addnews.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addnews.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(addnews, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(27:0) {#if $userAcc.logon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let t;
    	let body;
    	let current;
    	let if_block = /*$userAcc*/ ctx[0].logon && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			body = element("body");
    			attr_dev(body, "id", "newsBody");
    			add_location(body, file$g, 30, 0, 873);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, body, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$userAcc*/ ctx[0].logon) {
    				if (if_block) {
    					if (dirty & /*$userAcc*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
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
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(body);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $userAcc;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(0, $userAcc = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("News", slots, []);

    	onMount(async () => {
    		if ($userAcc.logon) simpleMessage("Now you can add news"); else simpleMessage("To add news you need to login");

    		await fetch("http://localhost:5000/newsReading", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" }
    		}).then(response => response.json()).then(data => {
    			data.forEach(element => {
    				NewsDisplay(element);
    			});
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		simpleMessage,
    		userAcc,
    		AddNews,
    		NewsDisplay,
    		$userAcc
    	});

    	return [$userAcc];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src\Forms\LoginForm.svelte generated by Svelte v3.38.3 */
    const file$f = "src\\Forms\\LoginForm.svelte";

    function create_fragment$j(ctx) {
    	let body;
    	let div;
    	let span;
    	let h1;
    	let t1;
    	let a;
    	let t3;
    	let ul;
    	let li0;
    	let h20;
    	let t5;
    	let li1;
    	let input0;
    	let t6;
    	let li2;
    	let h21;
    	let t8;
    	let li3;
    	let input1;
    	let t9;
    	let li4;
    	let button;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			span = element("span");
    			h1 = element("h1");
    			h1.textContent = "Hello";
    			t1 = space();
    			a = element("a");
    			a.textContent = "If you are NEW, PRESS HERE to register.";
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			h20 = element("h2");
    			h20.textContent = "Login";
    			t5 = space();
    			li1 = element("li");
    			input0 = element("input");
    			t6 = space();
    			li2 = element("li");
    			h21 = element("h2");
    			h21.textContent = "Password";
    			t8 = space();
    			li3 = element("li");
    			input1 = element("input");
    			t9 = space();
    			li4 = element("li");
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Login";
    			attr_dev(h1, "class", "svelte-1i0kk5z");
    			add_location(h1, file$f, 50, 12, 1398);
    			attr_dev(a, "href", "#/register");
    			attr_dev(a, "class", "reglink svelte-1i0kk5z");
    			add_location(a, file$f, 51, 12, 1426);
    			attr_dev(span, "class", "svelte-1i0kk5z");
    			add_location(span, file$f, 49, 8, 1378);
    			add_location(h20, file$f, 55, 16, 1560);
    			add_location(li0, file$f, 55, 12, 1556);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter your login name");
    			attr_dev(input0, "id", "loginCheck");
    			attr_dev(input0, "class", "svelte-1i0kk5z");
    			add_location(input0, file$f, 56, 16, 1597);
    			add_location(li1, file$f, 56, 12, 1593);
    			add_location(h21, file$f, 57, 16, 1720);
    			add_location(li2, file$f, 57, 12, 1716);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Enter your password");
    			attr_dev(input1, "id", "passwordCheck");
    			attr_dev(input1, "class", "svelte-1i0kk5z");
    			add_location(input1, file$f, 58, 16, 1760);
    			add_location(li3, file$f, 58, 12, 1756);
    			attr_dev(h3, "class", "svelte-1i0kk5z");
    			add_location(h3, file$f, 59, 50, 1918);
    			attr_dev(button, "class", "svelte-1i0kk5z");
    			add_location(button, file$f, 59, 16, 1884);
    			add_location(li4, file$f, 59, 12, 1880);
    			attr_dev(ul, "class", "svelte-1i0kk5z");
    			add_location(ul, file$f, 54, 8, 1538);
    			attr_dev(div, "class", "svelte-1i0kk5z");
    			add_location(div, file$f, 47, 4, 1361);
    			attr_dev(body, "class", "svelte-1i0kk5z");
    			add_location(body, file$f, 46, 0, 1349);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			append_dev(div, span);
    			append_dev(span, h1);
    			append_dev(span, t1);
    			append_dev(span, a);
    			append_dev(div, t3);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h20);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, input0);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, h21);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, input1);
    			append_dev(ul, t9);
    			append_dev(ul, li4);
    			append_dev(li4, button);
    			append_dev(button, h3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "keypress", /*jupmToPassword*/ ctx[2], false, false, false),
    					listen_dev(input1, "keypress", /*onKeyPress*/ ctx[1], false, false, false),
    					listen_dev(button, "click", /*loginRequest*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $userAcc;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(3, $userAcc = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LoginForm", slots, []);

    	onMount(() => {
    		document.getElementById("loginCheck").focus();
    	});

    	function loginRequest() {
    		fetch("http://localhost:5000/login", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify({
    				name: document.getElementById("loginCheck").value,
    				pass: document.getElementById("passwordCheck").value
    			})
    		}).then(response => response.json()).then(data => {
    			if (data.login) {
    				successMessage(data.text);
    				set_store_value(userAcc, $userAcc.logon = true, $userAcc);
    				set_store_value(userAcc, $userAcc.name = data.userName, $userAcc);
    				set_store_value(userAcc, $userAcc.userID = data.userID, $userAcc);
    				set_store_value(userAcc, $userAcc.profLink = "./#/profile", $userAcc);
    				window.location.href = "./#/profile";
    			} else {
    				errMessage(data.text);
    			}
    		});
    	}

    	const onKeyPress = e => {
    		if (e.charCode === 13) loginRequest();
    	};

    	const jupmToPassword = e => {
    		if (e.charCode === 13) document.getElementById("passwordCheck").focus();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoginForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		successMessage,
    		userAcc,
    		loginRequest,
    		onKeyPress,
    		jupmToPassword,
    		$userAcc
    	});

    	return [loginRequest, onKeyPress, jupmToPassword];
    }

    class LoginForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginForm",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src\Pages\Login.svelte generated by Svelte v3.38.3 */

    function create_fragment$i(ctx) {
    	let loginform;
    	let current;
    	loginform = new LoginForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loginform.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(loginform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loginform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loginform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loginform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);

    	onMount(() => {
    		simpleMessage("Login page");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		simpleMessage,
    		LoginForm
    	});

    	return [];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src\Icons\UploadIcon.svelte generated by Svelte v3.38.3 */

    const file$e = "src\\Icons\\UploadIcon.svelte";

    function create_fragment$h(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "d", "M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm65.18 216.01H224v80c0 8.84-7.16 16-16 16h-32c-8.84 0-16-7.16-16-16v-80H94.82c-14.28 0-21.41-17.29-11.27-27.36l96.42-95.7c6.65-6.61 17.39-6.61 24.04 0l96.42 95.7c10.15 10.07 3.03 27.36-11.25 27.36zM377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z");
    			add_location(path, file$e, 7, 5, 224);
    			attr_dev(svg, "width", "512px");
    			attr_dev(svg, "height", "512px");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "fill", "darkgray");
    			set_style(svg, "height", "50px");
    			set_style(svg, "width", "50px");
    			set_style(svg, "margin-left", "45%");
    			set_style(svg, "margin-top", "80px");
    			set_style(svg, "display", "block");
    			add_location(svg, file$e, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("UploadIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<UploadIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class UploadIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UploadIcon",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src\Icons\BackArrow.svelte generated by Svelte v3.38.3 */

    const file$d = "src\\Icons\\BackArrow.svelte";

    function create_fragment$g(ctx) {
    	let svg;
    	let g15;
    	let path;
    	let g0;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g16;
    	let g17;
    	let g18;
    	let g19;
    	let g20;
    	let g21;
    	let g22;
    	let g23;
    	let g24;
    	let g25;
    	let g26;
    	let g27;
    	let g28;
    	let g29;
    	let g30;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g15 = svg_element("g");
    			path = svg_element("path");
    			g0 = svg_element("g");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g16 = svg_element("g");
    			g17 = svg_element("g");
    			g18 = svg_element("g");
    			g19 = svg_element("g");
    			g20 = svg_element("g");
    			g21 = svg_element("g");
    			g22 = svg_element("g");
    			g23 = svg_element("g");
    			g24 = svg_element("g");
    			g25 = svg_element("g");
    			g26 = svg_element("g");
    			g27 = svg_element("g");
    			g28 = svg_element("g");
    			g29 = svg_element("g");
    			g30 = svg_element("g");
    			attr_dev(path, "d", "M26.105,21.891c-0.229,0-0.439-0.131-0.529-0.346l0,0c-0.066-0.156-1.716-3.857-7.885-4.59\r\n\t\tc-1.285-0.156-2.824-0.236-4.693-0.25v4.613c0,0.213-0.115,0.406-0.304,0.508c-0.188,0.098-0.413,0.084-0.588-0.033L0.254,13.815\r\n\t\tC0.094,13.708,0,13.528,0,13.339c0-0.191,0.094-0.365,0.254-0.477l11.857-7.979c0.175-0.121,0.398-0.129,0.588-0.029\r\n\t\tc0.19,0.102,0.303,0.295,0.303,0.502v4.293c2.578,0.336,13.674,2.33,13.674,11.674c0,0.271-0.191,0.508-0.459,0.562\r\n\t\tC26.18,21.891,26.141,21.891,26.105,21.891z");
    			add_location(path, file$d, 3, 1, 274);
    			add_location(g0, file$d, 8, 1, 781);
    			add_location(g1, file$d, 10, 1, 794);
    			add_location(g2, file$d, 12, 1, 807);
    			add_location(g3, file$d, 14, 1, 820);
    			add_location(g4, file$d, 16, 1, 833);
    			add_location(g5, file$d, 18, 1, 846);
    			add_location(g6, file$d, 20, 1, 859);
    			add_location(g7, file$d, 22, 1, 872);
    			add_location(g8, file$d, 24, 1, 885);
    			add_location(g9, file$d, 26, 1, 898);
    			add_location(g10, file$d, 28, 1, 911);
    			add_location(g11, file$d, 30, 1, 924);
    			add_location(g12, file$d, 32, 1, 937);
    			add_location(g13, file$d, 34, 1, 950);
    			add_location(g14, file$d, 36, 1, 963);
    			add_location(g15, file$d, 2, 0, 268);
    			add_location(g16, file$d, 39, 0, 981);
    			add_location(g17, file$d, 41, 0, 992);
    			add_location(g18, file$d, 43, 0, 1003);
    			add_location(g19, file$d, 45, 0, 1014);
    			add_location(g20, file$d, 47, 0, 1025);
    			add_location(g21, file$d, 49, 0, 1036);
    			add_location(g22, file$d, 51, 0, 1047);
    			add_location(g23, file$d, 53, 0, 1058);
    			add_location(g24, file$d, 55, 0, 1069);
    			add_location(g25, file$d, 57, 0, 1080);
    			add_location(g26, file$d, 59, 0, 1091);
    			add_location(g27, file$d, 61, 0, 1102);
    			add_location(g28, file$d, 63, 0, 1113);
    			add_location(g29, file$d, 65, 0, 1124);
    			add_location(g30, file$d, 67, 0, 1135);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 26.676 26.676");
    			set_style(svg, "enable-background", "new 0 0 26.676 26.676");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "width", "40px");
    			attr_dev(svg, "height", "40px");
    			attr_dev(svg, "fill", "white");
    			add_location(svg, file$d, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g15);
    			append_dev(g15, path);
    			append_dev(g15, g0);
    			append_dev(g15, g1);
    			append_dev(g15, g2);
    			append_dev(g15, g3);
    			append_dev(g15, g4);
    			append_dev(g15, g5);
    			append_dev(g15, g6);
    			append_dev(g15, g7);
    			append_dev(g15, g8);
    			append_dev(g15, g9);
    			append_dev(g15, g10);
    			append_dev(g15, g11);
    			append_dev(g15, g12);
    			append_dev(g15, g13);
    			append_dev(g15, g14);
    			append_dev(svg, g16);
    			append_dev(svg, g17);
    			append_dev(svg, g18);
    			append_dev(svg, g19);
    			append_dev(svg, g20);
    			append_dev(svg, g21);
    			append_dev(svg, g22);
    			append_dev(svg, g23);
    			append_dev(svg, g24);
    			append_dev(svg, g25);
    			append_dev(svg, g26);
    			append_dev(svg, g27);
    			append_dev(svg, g28);
    			append_dev(svg, g29);
    			append_dev(svg, g30);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BackArrow", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BackArrow> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class BackArrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BackArrow",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\Icons\TrashBinIcon.svelte generated by Svelte v3.38.3 */

    const file$c = "src\\Icons\\TrashBinIcon.svelte";

    function create_fragment$f(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let g16;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			g16 = svg_element("g");
    			attr_dev(path0, "d", "M87.748,388.784c0.461,11.01,9.521,19.699,20.539,19.699h191.911c11.018,0,20.078-8.689,20.539-19.699l13.705-289.316\r\n\t\t\tH74.043L87.748,388.784z M247.655,171.329c0-4.61,3.738-8.349,8.35-8.349h13.355c4.609,0,8.35,3.738,8.35,8.349v165.293\r\n\t\t\tc0,4.611-3.738,8.349-8.35,8.349h-13.355c-4.61,0-8.35-3.736-8.35-8.349V171.329z M189.216,171.329\r\n\t\t\tc0-4.61,3.738-8.349,8.349-8.349h13.355c4.609,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.737,8.349-8.349,8.349h-13.355\r\n\t\t\tc-4.61,0-8.349-3.736-8.349-8.349V171.329L189.216,171.329z M130.775,171.329c0-4.61,3.738-8.349,8.349-8.349h13.356\r\n\t\t\tc4.61,0,8.349,3.738,8.349,8.349v165.293c0,4.611-3.738,8.349-8.349,8.349h-13.356c-4.61,0-8.349-3.736-8.349-8.349V171.329z");
    			add_location(path0, file$c, 9, 2, 348);
    			attr_dev(path1, "d", "M343.567,21.043h-88.535V4.305c0-2.377-1.927-4.305-4.305-4.305h-92.971c-2.377,0-4.304,1.928-4.304,4.305v16.737H64.916\r\n\t\t\tc-7.125,0-12.9,5.776-12.9,12.901V74.47h304.451V33.944C356.467,26.819,350.692,21.043,343.567,21.043z");
    			add_location(path1, file$c, 15, 2, 1062);
    			add_location(g0, file$c, 8, 1, 341);
    			add_location(g1, file$c, 7, 0, 335);
    			add_location(g2, file$c, 19, 0, 1309);
    			add_location(g3, file$c, 21, 0, 1320);
    			add_location(g4, file$c, 23, 0, 1331);
    			add_location(g5, file$c, 25, 0, 1342);
    			add_location(g6, file$c, 27, 0, 1353);
    			add_location(g7, file$c, 29, 0, 1364);
    			add_location(g8, file$c, 31, 0, 1375);
    			add_location(g9, file$c, 33, 0, 1386);
    			add_location(g10, file$c, 35, 0, 1397);
    			add_location(g11, file$c, 37, 0, 1408);
    			add_location(g12, file$c, 39, 0, 1419);
    			add_location(g13, file$c, 41, 0, 1430);
    			add_location(g14, file$c, 43, 0, 1441);
    			add_location(g15, file$c, 45, 0, 1452);
    			add_location(g16, file$c, 47, 0, 1463);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "width", "30px");
    			attr_dev(svg, "height", "30px");
    			attr_dev(svg, "viewBox", "0 0 408.483 408.483");
    			set_style(svg, "enable-background", "new 0 0 408.483 408.483");
    			set_style(svg, "background", "rgba(0,0,0,0)");
    			attr_dev(svg, "fill", /*c*/ ctx[0]);
    			attr_dev(svg, "xml:space", "preserve");
    			add_location(svg, file$c, 4, 0, 39);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(svg, g2);
    			append_dev(svg, g3);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    			append_dev(svg, g16);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*c*/ 1) {
    				attr_dev(svg, "fill", /*c*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TrashBinIcon", slots, []);
    	let { c } = $$props;
    	const writable_props = ["c"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TrashBinIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("c" in $$props) $$invalidate(0, c = $$props.c);
    	};

    	$$self.$capture_state = () => ({ c });

    	$$self.$inject_state = $$props => {
    		if ("c" in $$props) $$invalidate(0, c = $$props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [c];
    }

    class TrashBinIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { c: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TrashBinIcon",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*c*/ ctx[0] === undefined && !("c" in props)) {
    			console.warn("<TrashBinIcon> was created without expected prop 'c'");
    		}
    	}

    	get c() {
    		throw new Error("<TrashBinIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set c(value) {
    		throw new Error("<TrashBinIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Icons\BasketIcon.svelte generated by Svelte v3.38.3 */

    const file$b = "src\\Icons\\BasketIcon.svelte";

    function create_fragment$e(ctx) {
    	let svg;
    	let g0;
    	let path;
    	let g1;
    	let g2;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			g1 = svg_element("g");
    			g2 = svg_element("g");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			attr_dev(path, "d", "M25.856,10.641C21.673,19.5,20.312,19.5,19.5,19.5h-8c-2.802,0-4.949-1.648-5.47-4.2\r\n\t\tc-0.016-0.078-1.6-7.853-2.005-10.025C3.826,4.21,3.32,3.5,1.5,3.5C0.671,3.5,0,2.829,0,2s0.671-1.5,1.5-1.5\r\n\t\tc3.02,0,4.964,1.5,5.474,4.224c0.401,2.149,1.98,9.898,1.996,9.977c0.319,1.566,1.722,1.8,2.53,1.8h7.605\r\n\t\tc0.817-0.878,2.679-4.261,4.038-7.141c0.354-0.749,1.249-1.068,1.997-0.716C25.89,8.997,26.21,9.891,25.856,10.641z M10.5,20.5\r\n\t\tC9.119,20.5,8,21.619,8,23s1.119,2.5,2.5,2.5S13,24.381,13,23S11.881,20.5,10.5,20.5z M19.5,20.5c-1.381,0-2.5,1.119-2.5,2.5\r\n\t\ts1.119,2.5,2.5,2.5S22,24.381,22,23S20.881,20.5,19.5,20.5z M14.663,12.344c0.1,0.081,0.223,0.12,0.346,0.12\r\n\t\ts0.244-0.039,0.346-0.12c0.1-0.079,2.828-2.74,4.316-4.954c0.115-0.172,0.126-0.392,0.028-0.574\r\n\t\tc-0.095-0.181-0.285-0.295-0.49-0.295h-2.226c0,0-0.217-4.291-0.359-4.49c-0.206-0.294-1.057-0.494-1.616-0.494\r\n\t\tc-0.561,0-1.427,0.2-1.634,0.494c-0.141,0.198-0.328,4.49-0.328,4.49h-2.255c-0.206,0-0.395,0.114-0.492,0.295\r\n\t\tc-0.097,0.182-0.086,0.403,0.028,0.574C11.816,9.605,14.564,12.265,14.663,12.344z");
    			add_location(path, file$b, 9, 1, 344);
    			add_location(g0, file$b, 8, 0, 338);
    			add_location(g1, file$b, 20, 0, 1416);
    			add_location(g2, file$b, 22, 0, 1427);
    			add_location(g3, file$b, 24, 0, 1438);
    			add_location(g4, file$b, 26, 0, 1449);
    			add_location(g5, file$b, 28, 0, 1460);
    			add_location(g6, file$b, 30, 0, 1471);
    			add_location(g7, file$b, 32, 0, 1482);
    			add_location(g8, file$b, 34, 0, 1493);
    			add_location(g9, file$b, 36, 0, 1504);
    			add_location(g10, file$b, 38, 0, 1515);
    			add_location(g11, file$b, 40, 0, 1526);
    			add_location(g12, file$b, 42, 0, 1537);
    			add_location(g13, file$b, 44, 0, 1548);
    			add_location(g14, file$b, 46, 0, 1559);
    			add_location(g15, file$b, 48, 0, 1570);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 26 26");
    			set_style(svg, "enable-background", "new 0 0 26 26");
    			set_style(svg, "width", /*w*/ ctx[0]);
    			set_style(svg, "height", /*h*/ ctx[1]);
    			set_style(svg, "margin-left", /*ml*/ ctx[2]);
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "fill", "white");
    			add_location(svg, file$b, 6, 0, 72);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g0);
    			append_dev(g0, path);
    			append_dev(svg, g1);
    			append_dev(svg, g2);
    			append_dev(svg, g3);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*w*/ 1) {
    				set_style(svg, "width", /*w*/ ctx[0]);
    			}

    			if (dirty & /*h*/ 2) {
    				set_style(svg, "height", /*h*/ ctx[1]);
    			}

    			if (dirty & /*ml*/ 4) {
    				set_style(svg, "margin-left", /*ml*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BasketIcon", slots, []);
    	let { w } = $$props;
    	let { h } = $$props;
    	let { ml } = $$props;
    	const writable_props = ["w", "h", "ml"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BasketIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("h" in $$props) $$invalidate(1, h = $$props.h);
    		if ("ml" in $$props) $$invalidate(2, ml = $$props.ml);
    	};

    	$$self.$capture_state = () => ({ w, h, ml });

    	$$self.$inject_state = $$props => {
    		if ("w" in $$props) $$invalidate(0, w = $$props.w);
    		if ("h" in $$props) $$invalidate(1, h = $$props.h);
    		if ("ml" in $$props) $$invalidate(2, ml = $$props.ml);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [w, h, ml];
    }

    class BasketIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { w: 0, h: 1, ml: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BasketIcon",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*w*/ ctx[0] === undefined && !("w" in props)) {
    			console.warn("<BasketIcon> was created without expected prop 'w'");
    		}

    		if (/*h*/ ctx[1] === undefined && !("h" in props)) {
    			console.warn("<BasketIcon> was created without expected prop 'h'");
    		}

    		if (/*ml*/ ctx[2] === undefined && !("ml" in props)) {
    			console.warn("<BasketIcon> was created without expected prop 'ml'");
    		}
    	}

    	get w() {
    		throw new Error("<BasketIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set w(value) {
    		throw new Error("<BasketIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get h() {
    		throw new Error("<BasketIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set h(value) {
    		throw new Error("<BasketIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ml() {
    		throw new Error("<BasketIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ml(value) {
    		throw new Error("<BasketIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Pages\Products\ProductSheet.svelte generated by Svelte v3.38.3 */
    const file$a = "src\\Pages\\Products\\ProductSheet.svelte";

    // (91:16) {#if $userAcc.userID == productObject.sellerID}
    function create_if_block$2(ctx) {
    	let button;
    	let trashbinicon;
    	let t0;
    	let h3;
    	let current;
    	let mounted;
    	let dispose;
    	trashbinicon = new TrashBinIcon({ props: { c: "white" }, $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			create_component(trashbinicon.$$.fragment);
    			t0 = space();
    			h3 = element("h3");
    			h3.textContent = "DELETE";
    			attr_dev(h3, "class", "svelte-8gy7ir");
    			add_location(h3, file$a, 91, 132, 3489);
    			attr_dev(button, "id", "productDeleteButton");
    			attr_dev(button, "class", "exit svelte-8gy7ir");
    			add_location(button, file$a, 91, 20, 3377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			mount_component(trashbinicon, button, null);
    			append_dev(button, t0);
    			append_dev(button, h3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*productDeleteButtonFunction*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trashbinicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trashbinicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(trashbinicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(91:16) {#if $userAcc.userID == productObject.sellerID}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let body;
    	let div4;
    	let button0;
    	let backarrow;
    	let t0;
    	let h30;
    	let t2;
    	let div3;
    	let div0;
    	let h1;
    	let t3_value = /*productObject*/ ctx[0].productName + "";
    	let t3;
    	let t4;
    	let div1;
    	let img;
    	let img_src_value;
    	let t5;
    	let ul;
    	let li0;
    	let h40;
    	let t7;
    	let h20;
    	let t8_value = /*productObject*/ ctx[0].productPrice + "";
    	let t8;
    	let t9;
    	let t10;
    	let li1;
    	let h41;
    	let t12;
    	let h21;
    	let t13_value = /*productObject*/ ctx[0].productQuantity + "";
    	let t13;
    	let t14;
    	let li2;
    	let h42;
    	let t16;
    	let input;
    	let input_max_value;
    	let t17;
    	let li3;
    	let h43;
    	let t19;
    	let h22;
    	let t20_value = /*productObject*/ ctx[0].sellerName + "";
    	let t20;
    	let t21;
    	let span;
    	let h44;
    	let t22_value = /*productObject*/ ctx[0].productDescription + "";
    	let t22;
    	let t23;
    	let div2;
    	let button1;
    	let basketicon;
    	let t24;
    	let h31;
    	let t26;
    	let current;
    	let mounted;
    	let dispose;
    	backarrow = new BackArrow({ $$inline: true });

    	basketicon = new BasketIcon({
    			props: { w: "40px", h: "40px", ml: "20px" },
    			$$inline: true
    		});

    	let if_block = /*$userAcc*/ ctx[2].userID == /*productObject*/ ctx[0].sellerID && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			body = element("body");
    			div4 = element("div");
    			button0 = element("button");
    			create_component(backarrow.$$.fragment);
    			t0 = space();
    			h30 = element("h3");
    			h30.textContent = "back";
    			t2 = space();
    			div3 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			img = element("img");
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			h40 = element("h4");
    			h40.textContent = "Price:";
    			t7 = space();
    			h20 = element("h2");
    			t8 = text(t8_value);
    			t9 = text("$");
    			t10 = space();
    			li1 = element("li");
    			h41 = element("h4");
    			h41.textContent = "Quantity in a stock:";
    			t12 = space();
    			h21 = element("h2");
    			t13 = text(t13_value);
    			t14 = space();
    			li2 = element("li");
    			h42 = element("h4");
    			h42.textContent = "Order:";
    			t16 = space();
    			input = element("input");
    			t17 = space();
    			li3 = element("li");
    			h43 = element("h4");
    			h43.textContent = "Seller:";
    			t19 = space();
    			h22 = element("h2");
    			t20 = text(t20_value);
    			t21 = space();
    			span = element("span");
    			h44 = element("h4");
    			t22 = text(t22_value);
    			t23 = space();
    			div2 = element("div");
    			button1 = element("button");
    			create_component(basketicon.$$.fragment);
    			t24 = space();
    			h31 = element("h3");
    			h31.textContent = "Add to basket";
    			t26 = space();
    			if (if_block) if_block.c();
    			attr_dev(h30, "class", "svelte-8gy7ir");
    			add_location(h30, file$a, 64, 117, 2143);
    			attr_dev(button0, "id", "productOverlayBackButton");
    			attr_dev(button0, "class", "exit svelte-8gy7ir");
    			add_location(button0, file$a, 64, 8, 2034);
    			attr_dev(h1, "class", "svelte-8gy7ir");
    			add_location(h1, file$a, 69, 16, 2294);
    			attr_dev(div0, "id", "productSheetNameHolder");
    			attr_dev(div0, "class", "svelte-8gy7ir");
    			add_location(div0, file$a, 68, 12, 2243);
    			if (img.src !== (img_src_value = /*productPicture*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-8gy7ir");
    			add_location(img, file$a, 73, 16, 2409);
    			attr_dev(h40, "class", "svelte-8gy7ir");
    			add_location(h40, file$a, 75, 25, 2491);
    			set_style(h20, "color", "MAROON");
    			attr_dev(h20, "class", "svelte-8gy7ir");
    			add_location(h20, file$a, 75, 42, 2508);
    			attr_dev(li0, "class", "svelte-8gy7ir");
    			add_location(li0, file$a, 75, 20, 2486);
    			attr_dev(h41, "class", "svelte-8gy7ir");
    			add_location(h41, file$a, 76, 25, 2601);
    			attr_dev(h21, "class", "svelte-8gy7ir");
    			add_location(h21, file$a, 76, 56, 2632);
    			attr_dev(li1, "class", "svelte-8gy7ir");
    			add_location(li1, file$a, 76, 20, 2596);
    			attr_dev(h42, "class", "svelte-8gy7ir");
    			add_location(h42, file$a, 77, 25, 2705);
    			attr_dev(input, "type", "number");
    			attr_dev(input, "id", "productOrderQuantuty");
    			input.value = "1";
    			attr_dev(input, "min", "1");
    			attr_dev(input, "max", input_max_value = /*productObject*/ ctx[0].productQuantity);
    			attr_dev(input, "class", "svelte-8gy7ir");
    			add_location(input, file$a, 77, 41, 2721);
    			attr_dev(li2, "class", "svelte-8gy7ir");
    			add_location(li2, file$a, 77, 20, 2700);
    			attr_dev(h43, "class", "svelte-8gy7ir");
    			add_location(h43, file$a, 78, 25, 2851);
    			attr_dev(h22, "class", "svelte-8gy7ir");
    			add_location(h22, file$a, 78, 43, 2869);
    			attr_dev(li3, "class", "svelte-8gy7ir");
    			add_location(li3, file$a, 78, 20, 2846);
    			attr_dev(ul, "class", "svelte-8gy7ir");
    			add_location(ul, file$a, 74, 16, 2460);
    			attr_dev(div1, "id", "pictureAndSpec");
    			attr_dev(div1, "class", "svelte-8gy7ir");
    			add_location(div1, file$a, 72, 12, 2366);
    			attr_dev(h44, "class", "svelte-8gy7ir");
    			add_location(h44, file$a, 83, 16, 2995);
    			attr_dev(span, "class", "svelte-8gy7ir");
    			add_location(span, file$a, 82, 12, 2971);
    			attr_dev(h31, "class", "svelte-8gy7ir");
    			add_location(h31, file$a, 88, 121, 3237);
    			attr_dev(button1, "id", "addToBaskerButton");
    			attr_dev(button1, "class", "svelte-8gy7ir");
    			add_location(button1, file$a, 88, 16, 3132);
    			attr_dev(div2, "id", "productSheetButtonHolder");
    			attr_dev(div2, "class", "svelte-8gy7ir");
    			add_location(div2, file$a, 86, 12, 3077);
    			attr_dev(div3, "id", "productSheetHolder");
    			attr_dev(div3, "class", "svelte-8gy7ir");
    			add_location(div3, file$a, 66, 8, 2186);
    			attr_dev(div4, "id", "productOverlay");
    			attr_dev(div4, "class", "svelte-8gy7ir");
    			add_location(div4, file$a, 62, 4, 1997);
    			add_location(body, file$a, 61, 0, 1985);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div4);
    			append_dev(div4, button0);
    			mount_component(backarrow, button0, null);
    			append_dev(button0, t0);
    			append_dev(button0, h30);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div1, t5);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h40);
    			append_dev(li0, t7);
    			append_dev(li0, h20);
    			append_dev(h20, t8);
    			append_dev(h20, t9);
    			append_dev(ul, t10);
    			append_dev(ul, li1);
    			append_dev(li1, h41);
    			append_dev(li1, t12);
    			append_dev(li1, h21);
    			append_dev(h21, t13);
    			append_dev(ul, t14);
    			append_dev(ul, li2);
    			append_dev(li2, h42);
    			append_dev(li2, t16);
    			append_dev(li2, input);
    			append_dev(ul, t17);
    			append_dev(ul, li3);
    			append_dev(li3, h43);
    			append_dev(li3, t19);
    			append_dev(li3, h22);
    			append_dev(h22, t20);
    			append_dev(div3, t21);
    			append_dev(div3, span);
    			append_dev(span, h44);
    			append_dev(h44, t22);
    			append_dev(div3, t23);
    			append_dev(div3, div2);
    			append_dev(div2, button1);
    			mount_component(basketicon, button1, null);
    			append_dev(button1, t24);
    			append_dev(button1, h31);
    			append_dev(div2, t26);
    			if (if_block) if_block.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", productOverlayBackButtonFunction, false, false, false),
    					listen_dev(button1, "click", /*addToBasketFunction*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*productObject*/ 1) && t3_value !== (t3_value = /*productObject*/ ctx[0].productName + "")) set_data_dev(t3, t3_value);

    			if (!current || dirty & /*productPicture*/ 2 && img.src !== (img_src_value = /*productPicture*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*productObject*/ 1) && t8_value !== (t8_value = /*productObject*/ ctx[0].productPrice + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*productObject*/ 1) && t13_value !== (t13_value = /*productObject*/ ctx[0].productQuantity + "")) set_data_dev(t13, t13_value);

    			if (!current || dirty & /*productObject*/ 1 && input_max_value !== (input_max_value = /*productObject*/ ctx[0].productQuantity)) {
    				attr_dev(input, "max", input_max_value);
    			}

    			if ((!current || dirty & /*productObject*/ 1) && t20_value !== (t20_value = /*productObject*/ ctx[0].sellerName + "")) set_data_dev(t20, t20_value);
    			if ((!current || dirty & /*productObject*/ 1) && t22_value !== (t22_value = /*productObject*/ ctx[0].productDescription + "")) set_data_dev(t22, t22_value);

    			if (/*$userAcc*/ ctx[2].userID == /*productObject*/ ctx[0].sellerID) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$userAcc, productObject*/ 5) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
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
    			transition_in(backarrow.$$.fragment, local);
    			transition_in(basketicon.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(backarrow.$$.fragment, local);
    			transition_out(basketicon.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(backarrow);
    			destroy_component(basketicon);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function productOverlayBackButtonFunction() {
    	document.getElementById("productOverlay").parentNode.remove();
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $userAcc;
    	let $basketMap;
    	let $basketSizeHolder;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(2, $userAcc = $$value));
    	validate_store(basketMap, "basketMap");
    	component_subscribe($$self, basketMap, $$value => $$invalidate(6, $basketMap = $$value));
    	validate_store(basketSizeHolder, "basketSizeHolder");
    	component_subscribe($$self, basketSizeHolder, $$value => $$invalidate(7, $basketSizeHolder = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProductSheet", slots, []);
    	let { productObject } = $$props;
    	let { productPicture } = $$props;
    	let { parentElement } = $$props;

    	function productDeleteButtonFunction() {
    		fetch("http://localhost:5000/deleteProduct", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(productObject)
    		}).then(response => response.json()).then(data => {
    			if (data.fileRemoved) {
    				successMessage(data.text);
    				parentElement.remove();
    				productOverlayBackButtonFunction();
    			} else {
    				errMessage(data.text);
    			}
    		});
    	}

    	function addToBasketFunction() {
    		if (!$userAcc.logon) {
    			errMessage("You need to login at first");
    			productOverlayBackButtonFunction();
    			return;
    		}

    		let productCountVariable = +document.getElementById("productOrderQuantuty").value;
    		if ($basketMap.has(productObject._id)) productCountVariable += +$basketMap.get(productObject._id)[1];
    		if (productCountVariable > productObject.productQuantity) productCountVariable = productObject.productQuantity;
    		$basketMap.set(productObject._id, [productObject, productCountVariable]);
    		set_store_value(basketSizeHolder, $basketSizeHolder = $basketMap.size, $basketSizeHolder);
    		productOverlayBackButtonFunction();
    	}

    	const writable_props = ["productObject", "productPicture", "parentElement"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProductSheet> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("productObject" in $$props) $$invalidate(0, productObject = $$props.productObject);
    		if ("productPicture" in $$props) $$invalidate(1, productPicture = $$props.productPicture);
    		if ("parentElement" in $$props) $$invalidate(5, parentElement = $$props.parentElement);
    	};

    	$$self.$capture_state = () => ({
    		userAcc,
    		BackArrow,
    		TrashBinIcon,
    		BasketIcon,
    		errMessage,
    		successMessage,
    		basketMap,
    		basketSizeHolder,
    		productObject,
    		productPicture,
    		parentElement,
    		productOverlayBackButtonFunction,
    		productDeleteButtonFunction,
    		addToBasketFunction,
    		$userAcc,
    		$basketMap,
    		$basketSizeHolder
    	});

    	$$self.$inject_state = $$props => {
    		if ("productObject" in $$props) $$invalidate(0, productObject = $$props.productObject);
    		if ("productPicture" in $$props) $$invalidate(1, productPicture = $$props.productPicture);
    		if ("parentElement" in $$props) $$invalidate(5, parentElement = $$props.parentElement);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		productObject,
    		productPicture,
    		$userAcc,
    		productDeleteButtonFunction,
    		addToBasketFunction,
    		parentElement
    	];
    }

    class ProductSheet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			productObject: 0,
    			productPicture: 1,
    			parentElement: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProductSheet",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*productObject*/ ctx[0] === undefined && !("productObject" in props)) {
    			console.warn("<ProductSheet> was created without expected prop 'productObject'");
    		}

    		if (/*productPicture*/ ctx[1] === undefined && !("productPicture" in props)) {
    			console.warn("<ProductSheet> was created without expected prop 'productPicture'");
    		}

    		if (/*parentElement*/ ctx[5] === undefined && !("parentElement" in props)) {
    			console.warn("<ProductSheet> was created without expected prop 'parentElement'");
    		}
    	}

    	get productObject() {
    		throw new Error("<ProductSheet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set productObject(value) {
    		throw new Error("<ProductSheet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get productPicture() {
    		throw new Error("<ProductSheet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set productPicture(value) {
    		throw new Error("<ProductSheet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parentElement() {
    		throw new Error("<ProductSheet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parentElement(value) {
    		throw new Error("<ProductSheet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function productListCreating( productFile ) {

        let productDiv = document.createElement( "div" );
        document.getElementById("productListDiv").prepend(productDiv);
        AddStyleToProductDiv( productDiv );

        productDiv.value = productFile;

        let productImg = document.createElement( "img" );
        productDiv.append( productImg );
        AddProductImageStyle( productImg );

        let spanPHolder = document.createElement( "span" );
        productDiv.append( spanPHolder );

        let priceP = document.createElement( "p" );
        spanPHolder.append( priceP );
        priceP.innerHTML = "Price: " + productFile.productPrice + "$";
        priceP.style.color = "MAROON";
        AddPStyle( priceP );

        let nameP = document.createElement( "p" );
        spanPHolder.append( nameP );
        nameP.innerHTML = productFile.productName;
        AddPStyle( nameP );

        
            fetch("http://localhost:5000/imageGet/" + productFile.productPictureName )
            .then( response => response.blob() )
            .then( imageURL => {
                let imageBlob = URL.createObjectURL( imageURL );
                productImg.src = imageBlob;
            })
            .catch( err => console.log( err ) );

        productDiv.onclick = () => {
            new ProductSheet({
                target: document.getElementById("porductBody"),
                props: {
                    productObject: productDiv.value,
                    productPicture: productImg.src,
                    parentElement: productDiv
                }
            });
        };
    }


    function AddPStyle( element ) {
        element.style.margin = "0";
        element.style.marginBottom = "10px";
        element.style.marginLeft = "10px";
        element.style.maxWidth = "180px";
        element.style.fontWeight = "bolder";
    }


    function AddProductImageStyle( element ) {
        element.style.marginBottom = "20px";
        element.style.width = "100%";
        element.style.height = "auto";
        element.style.maxHeight = "75%";
        element.style.top = "0";
        element.style.left = "0";
    }


    function AddStyleToProductDiv( element ) {

        element.style.margin = "50px 2% 0 2%";
        element.style.padding = "0";
        element.style.width = "200px";
        element.style.height = "300px";
        element.style.backgroundColor = "white";
        element.style.cursor = "pointer";
        element.style.display = "flex";
        element.style.flexDirection = "column";
        element.style.alignItems = "flex-start";
        element.style.justifyContent = "space-between";


        element.onmouseover = () => {
            element.style.transform = "scale(1.2)";
            element.style.boxShadow = "rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px";
        };

        element.onmouseout = () => {
            element.style.transform = "scale(1)";
            element.style.boxShadow = "none";
        };
    }

    function sendproductToServer( file ) {

        const seller = get_store_value( userAcc );

        const formData = new FormData();

        formData.append( 'imageFile', file );
        formData.append( 'sellersID', seller.userID );
        formData.append( 'sellerName', seller.name );
        formData.append( 'productName', document.getElementById("productName").value );
        formData.append( 'productPrice', parseFloat( document.getElementById("productPrice").value ).toFixed(2) );
        formData.append( 'productQuantity', Math.floor( parseFloat( document.getElementById("productQuantity").value ) ) );
        formData.append( 'productDescription', document.getElementById("productDescription").value );
        
        fetch("http://localhost:5000/productAdd", {
            method: "POST",
            body: formData
                
        })
        .then( response =>  response.json() )
        .then( ( data ) => {
            document.getElementById("productName").value = "";
            document.getElementById("productPrice").value = "";
            document.getElementById("productQuantity").value = "";
            document.getElementById("productDescription").value = "";
            if ( data.productSaved ) {
                successMessage( data.text );
                productListCreating( data.product );
            }
        });

    }

    /* src\Pages\Products\AddFileForm.svelte generated by Svelte v3.38.3 */

    const { console: console_1 } = globals;
    const file$9 = "src\\Pages\\Products\\AddFileForm.svelte";

    function create_fragment$c(ctx) {
    	let body;
    	let div4;
    	let div2;
    	let input0;
    	let t0;
    	let label;
    	let div0;
    	let uploadicon;
    	let t1;
    	let h4;
    	let t3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t4;
    	let div3;
    	let ul;
    	let li0;
    	let h30;
    	let t6;
    	let li1;
    	let input1;
    	let t7;
    	let li2;
    	let h31;
    	let t9;
    	let li3;
    	let input2;
    	let t10;
    	let h6;
    	let t12;
    	let li4;
    	let h32;
    	let t14;
    	let li5;
    	let input3;
    	let t15;
    	let div5;
    	let span;
    	let h33;
    	let t17;
    	let textarea;
    	let t18;
    	let div6;
    	let button;
    	let h5;
    	let current;
    	let mounted;
    	let dispose;
    	uploadicon = new UploadIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			div4 = element("div");
    			div2 = element("div");
    			input0 = element("input");
    			t0 = space();
    			label = element("label");
    			div0 = element("div");
    			create_component(uploadicon.$$.fragment);
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "Press here to upload image";
    			t3 = space();
    			div1 = element("div");
    			img = element("img");
    			t4 = space();
    			div3 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			h30 = element("h3");
    			h30.textContent = "Product name:";
    			t6 = space();
    			li1 = element("li");
    			input1 = element("input");
    			t7 = space();
    			li2 = element("li");
    			h31 = element("h3");
    			h31.textContent = "Price:";
    			t9 = space();
    			li3 = element("li");
    			input2 = element("input");
    			t10 = space();
    			h6 = element("h6");
    			h6.textContent = "$";
    			t12 = space();
    			li4 = element("li");
    			h32 = element("h3");
    			h32.textContent = "Quantity:";
    			t14 = space();
    			li5 = element("li");
    			input3 = element("input");
    			t15 = space();
    			div5 = element("div");
    			span = element("span");
    			h33 = element("h3");
    			h33.textContent = "Product description:";
    			t17 = space();
    			textarea = element("textarea");
    			t18 = space();
    			div6 = element("div");
    			button = element("button");
    			h5 = element("h5");
    			h5.textContent = "Add product";
    			attr_dev(input0, "type", "file");
    			attr_dev(input0, "id", "productPictureUpload");
    			attr_dev(input0, "name", "Product Picture");
    			attr_dev(input0, "accept", "image/jpg, image/jpeg, image/png");
    			attr_dev(input0, "class", "hidden svelte-16abxdu");
    			add_location(input0, file$9, 57, 12, 2154);
    			attr_dev(h4, "class", "svelte-16abxdu");
    			add_location(h4, file$9, 62, 20, 2462);
    			attr_dev(div0, "id", "uploadSpanHolder");
    			attr_dev(div0, "class", "svelte-16abxdu");
    			add_location(div0, file$9, 60, 16, 2377);
    			attr_dev(img, "id", "productDescriptionImage");
    			if (img.src !== (img_src_value = "")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-16abxdu");
    			add_location(img, file$9, 66, 20, 2612);
    			attr_dev(div1, "id", "uploadIMGHolder");
    			attr_dev(div1, "class", "hidden svelte-16abxdu");
    			add_location(div1, file$9, 65, 16, 2549);
    			attr_dev(label, "id", "imgUploadLabel");
    			attr_dev(label, "for", "productPictureUpload");
    			attr_dev(label, "class", "svelte-16abxdu");
    			add_location(label, file$9, 59, 12, 2305);
    			attr_dev(div2, "id", "imageField");
    			attr_dev(div2, "class", "svelte-16abxdu");
    			add_location(div2, file$9, 56, 8, 2119);
    			attr_dev(h30, "class", "svelte-16abxdu");
    			add_location(h30, file$9, 75, 21, 2808);
    			attr_dev(li0, "class", "svelte-16abxdu");
    			add_location(li0, file$9, 75, 16, 2803);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "productName");
    			attr_dev(input1, "placeholder", "Input product name");
    			attr_dev(input1, "class", "svelte-16abxdu");
    			add_location(input1, file$9, 76, 21, 2861);
    			attr_dev(li1, "class", "svelte-16abxdu");
    			add_location(li1, file$9, 76, 16, 2856);
    			attr_dev(h31, "class", "svelte-16abxdu");
    			add_location(h31, file$9, 77, 21, 2959);
    			attr_dev(li2, "class", "svelte-16abxdu");
    			add_location(li2, file$9, 77, 16, 2954);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0.01");
    			attr_dev(input2, "step", "0.1");
    			attr_dev(input2, "id", "productPrice");
    			attr_dev(input2, "class", "svelte-16abxdu");
    			add_location(input2, file$9, 78, 21, 3005);
    			attr_dev(h6, "class", "svelte-16abxdu");
    			add_location(h6, file$9, 78, 84, 3068);
    			attr_dev(li3, "class", "svelte-16abxdu");
    			add_location(li3, file$9, 78, 16, 3000);
    			attr_dev(h32, "class", "svelte-16abxdu");
    			add_location(h32, file$9, 79, 21, 3109);
    			attr_dev(li4, "class", "svelte-16abxdu");
    			add_location(li4, file$9, 79, 16, 3104);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "min", "1");
    			attr_dev(input3, "step", "1");
    			attr_dev(input3, "id", "productQuantity");
    			attr_dev(input3, "class", "svelte-16abxdu");
    			add_location(input3, file$9, 80, 21, 3158);
    			attr_dev(li5, "class", "svelte-16abxdu");
    			add_location(li5, file$9, 80, 16, 3153);
    			attr_dev(ul, "class", "svelte-16abxdu");
    			add_location(ul, file$9, 74, 12, 2781);
    			attr_dev(div3, "id", "inputsFormHolder");
    			attr_dev(div3, "class", "svelte-16abxdu");
    			add_location(div3, file$9, 73, 8, 2740);
    			attr_dev(div4, "id", "mainProductFormDiv");
    			attr_dev(div4, "class", "svelte-16abxdu");
    			add_location(div4, file$9, 54, 4, 2078);
    			attr_dev(h33, "class", "svelte-16abxdu");
    			add_location(h33, file$9, 88, 15, 3340);
    			attr_dev(span, "class", "svelte-16abxdu");
    			add_location(span, file$9, 88, 8, 3333);
    			attr_dev(textarea, "name", "Product description");
    			attr_dev(textarea, "placeholder", "Describe the product");
    			attr_dev(textarea, "id", "productDescription");
    			attr_dev(textarea, "class", "svelte-16abxdu");
    			add_location(textarea, file$9, 89, 8, 3389);
    			attr_dev(div5, "id", "productDescriptionAreaDiv");
    			attr_dev(div5, "class", "svelte-16abxdu");
    			add_location(div5, file$9, 87, 4, 3287);
    			attr_dev(h5, "class", "svelte-16abxdu");
    			add_location(h5, file$9, 93, 48, 3599);
    			attr_dev(button, "class", "svelte-16abxdu");
    			add_location(button, file$9, 93, 8, 3559);
    			attr_dev(div6, "id", "productAddingButtonDiv");
    			attr_dev(div6, "class", "svelte-16abxdu");
    			add_location(div6, file$9, 92, 4, 3516);
    			attr_dev(body, "class", "svelte-16abxdu");
    			add_location(body, file$9, 52, 0, 2064);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div4);
    			append_dev(div4, div2);
    			append_dev(div2, input0);
    			append_dev(div2, t0);
    			append_dev(div2, label);
    			append_dev(label, div0);
    			mount_component(uploadicon, div0, null);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(label, t3);
    			append_dev(label, div1);
    			append_dev(div1, img);
    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h30);
    			append_dev(ul, t6);
    			append_dev(ul, li1);
    			append_dev(li1, input1);
    			append_dev(ul, t7);
    			append_dev(ul, li2);
    			append_dev(li2, h31);
    			append_dev(ul, t9);
    			append_dev(ul, li3);
    			append_dev(li3, input2);
    			append_dev(li3, t10);
    			append_dev(li3, h6);
    			append_dev(ul, t12);
    			append_dev(ul, li4);
    			append_dev(li4, h32);
    			append_dev(ul, t14);
    			append_dev(ul, li5);
    			append_dev(li5, input3);
    			append_dev(body, t15);
    			append_dev(body, div5);
    			append_dev(div5, span);
    			append_dev(span, h33);
    			append_dev(div5, t17);
    			append_dev(div5, textarea);
    			append_dev(body, t18);
    			append_dev(body, div6);
    			append_dev(div6, button);
    			append_dev(button, h5);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*fieldCompleateCheck*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uploadicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uploadicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(uploadicon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddFileForm", slots, []);
    	let productImmages;

    	onMount(() => {
    		productImmages = document.getElementById("productPictureUpload");
    		productImmages.addEventListener("change", uploadProductImmages, false);
    	});

    	function uploadProductImmages() {
    		if (!productImmages.files.length) {
    			console.log("There is no immages to upload.");
    			document.getElementById("uploadSpanHolder").classList.remove("hidden");
    			document.getElementById("uploadIMGHolder").classList.add("hidden");
    			return;
    		}

    		document.getElementById("uploadSpanHolder").classList.add("hidden");
    		document.getElementById("uploadIMGHolder").classList.remove("hidden");
    		let fileURL = URL.createObjectURL(productImmages.files[0]);
    		let imgWindow = document.getElementById("productDescriptionImage");
    		imgWindow.src = fileURL;
    	}

    	function fieldCompleateCheck() {
    		let errMessageText = "";
    		if (!productImmages.files.length) errMessageText += "Please add image of your product <br>";
    		if (!document.getElementById("productName").value) errMessageText += "Please add name of your product <br>";
    		if (!document.getElementById("productPrice").value) errMessageText += "Please add price for your product <br>";
    		if (!document.getElementById("productQuantity").value) errMessageText += "Please add product quantity <br>";
    		if (!document.getElementById("productDescription").value) errMessageText += "Please add description of your product <br>";

    		if (errMessageText.length) {
    			errMessage(errMessageText);
    			return;
    		} else sendproductToServer(productImmages.files[0]);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AddFileForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		errMessage,
    		successMessage,
    		UploadIcon,
    		sendproductToServer,
    		productImmages,
    		uploadProductImmages,
    		fieldCompleateCheck
    	});

    	$$self.$inject_state = $$props => {
    		if ("productImmages" in $$props) productImmages = $$props.productImmages;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fieldCompleateCheck];
    }

    class AddFileForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddFileForm",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\Pages\Products\Products.svelte generated by Svelte v3.38.3 */
    const file$8 = "src\\Pages\\Products\\Products.svelte";

    // (49:4) {#if $userAcc.logon}
    function create_if_block$1(ctx) {
    	let span;
    	let h1;
    	let t1;
    	let div;
    	let addfileform;
    	let t2;
    	let hr;
    	let current;
    	let mounted;
    	let dispose;
    	addfileform = new AddFileForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			span = element("span");
    			h1 = element("h1");
    			h1.textContent = "Add product";
    			t1 = space();
    			div = element("div");
    			create_component(addfileform.$$.fragment);
    			t2 = space();
    			hr = element("hr");
    			attr_dev(h1, "class", "svelte-17vbxhr");
    			add_location(h1, file$8, 50, 12, 1627);
    			attr_dev(span, "class", "svelte-17vbxhr");
    			add_location(span, file$8, 49, 8, 1571);
    			attr_dev(div, "id", "addProductFormHolder");
    			attr_dev(div, "class", "svelte-17vbxhr");
    			add_location(div, file$8, 52, 8, 1674);
    			attr_dev(hr, "class", "svelte-17vbxhr");
    			add_location(hr, file$8, 55, 8, 1759);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, h1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(addfileform, div, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, hr, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*addFileFormScaleFunction*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(addfileform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(addfileform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(addfileform);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(hr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(49:4) {#if $userAcc.logon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let body;
    	let t;
    	let div;
    	let current;
    	let if_block = /*$userAcc*/ ctx[0].logon && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			body = element("body");
    			if (if_block) if_block.c();
    			t = space();
    			div = element("div");
    			attr_dev(div, "id", "productListDiv");
    			attr_dev(div, "class", "svelte-17vbxhr");
    			add_location(div, file$8, 58, 4, 1783);
    			attr_dev(body, "id", "porductBody");
    			add_location(body, file$8, 45, 0, 1504);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			if (if_block) if_block.m(body, null);
    			append_dev(body, t);
    			append_dev(body, div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$userAcc*/ ctx[0].logon) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$userAcc*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(body, t);
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
    			if (detaching) detach_dev(body);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $userAcc;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(0, $userAcc = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Products", slots, []);

    	onMount(async () => {
    		if ($userAcc.logon) simpleMessage("Now you can add products"); else simpleMessage("To add products you need to login");

    		await fetch("http://localhost:5000/productGet", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" }
    		}).then(response => response.json()).then(data => {
    			data.forEach(element => {
    				productListCreating(element);
    			});
    		});
    	});

    	let addProductFormHolderScale = 0;

    	function addFileFormScaleFunction() {
    		let addProductFormHolderNode = document.getElementById("addProductFormHolder");

    		if (addProductFormHolderScale) {
    			addProductFormHolderScale = 0;
    			addProductFormHolderNode.style.height = "0";
    			addProductFormHolderNode.style.transform = `scale(${addProductFormHolderScale})`;
    			return;
    		}

    		addProductFormHolderScale = 1;
    		addProductFormHolderNode.style.height = "auto";
    		addProductFormHolderNode.style.transform = `scale(${addProductFormHolderScale})`;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		simpleMessage,
    		userAcc,
    		AddFileForm,
    		productListCreating,
    		addProductFormHolderScale,
    		addFileFormScaleFunction,
    		$userAcc
    	});

    	$$self.$inject_state = $$props => {
    		if ("addProductFormHolderScale" in $$props) addProductFormHolderScale = $$props.addProductFormHolderScale;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$userAcc, addFileFormScaleFunction];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\Forms\RegisterForm.svelte generated by Svelte v3.38.3 */
    const file$7 = "src\\Forms\\RegisterForm.svelte";

    function create_fragment$a(ctx) {
    	let body;
    	let div;
    	let ul;
    	let li0;
    	let h20;
    	let t1;
    	let li1;
    	let input0;
    	let t2;
    	let li2;
    	let h21;
    	let t4;
    	let li3;
    	let input1;
    	let t5;
    	let li4;
    	let h22;
    	let t7;
    	let li5;
    	let input2;
    	let t8;
    	let li6;
    	let h23;
    	let t10;
    	let li7;
    	let input3;
    	let t11;
    	let li8;
    	let button;
    	let h3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			h20 = element("h2");
    			h20.textContent = "Login name";
    			t1 = space();
    			li1 = element("li");
    			input0 = element("input");
    			t2 = space();
    			li2 = element("li");
    			h21 = element("h2");
    			h21.textContent = "Password";
    			t4 = space();
    			li3 = element("li");
    			input1 = element("input");
    			t5 = space();
    			li4 = element("li");
    			h22 = element("h2");
    			h22.textContent = "Confirm password";
    			t7 = space();
    			li5 = element("li");
    			input2 = element("input");
    			t8 = space();
    			li6 = element("li");
    			h23 = element("h2");
    			h23.textContent = "Email";
    			t10 = space();
    			li7 = element("li");
    			input3 = element("input");
    			t11 = space();
    			li8 = element("li");
    			button = element("button");
    			h3 = element("h3");
    			h3.textContent = "Registrate";
    			attr_dev(h20, "class", "svelte-1isyeyk");
    			add_location(h20, file$7, 90, 16, 2873);
    			attr_dev(li0, "class", "svelte-1isyeyk");
    			add_location(li0, file$7, 90, 12, 2869);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Enter your login name");
    			attr_dev(input0, "id", "loginReg");
    			attr_dev(input0, "class", "svelte-1isyeyk");
    			add_location(input0, file$7, 91, 16, 2915);
    			attr_dev(li1, "class", "svelte-1isyeyk");
    			add_location(li1, file$7, 91, 12, 2911);
    			attr_dev(h21, "class", "svelte-1isyeyk");
    			add_location(h21, file$7, 92, 16, 3036);
    			attr_dev(li2, "class", "svelte-1isyeyk");
    			add_location(li2, file$7, 92, 12, 3032);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Enter your password");
    			attr_dev(input1, "id", "passwordReg");
    			attr_dev(input1, "class", "svelte-1isyeyk");
    			add_location(input1, file$7, 93, 16, 3076);
    			attr_dev(li3, "class", "svelte-1isyeyk");
    			add_location(li3, file$7, 93, 12, 3072);
    			attr_dev(h22, "class", "svelte-1isyeyk");
    			add_location(h22, file$7, 94, 16, 3209);
    			attr_dev(li4, "class", "svelte-1isyeyk");
    			add_location(li4, file$7, 94, 12, 3205);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "placeholder", "Confirm your password");
    			attr_dev(input2, "id", "passwordConf");
    			attr_dev(input2, "class", "svelte-1isyeyk");
    			add_location(input2, file$7, 95, 16, 3257);
    			attr_dev(li5, "class", "svelte-1isyeyk");
    			add_location(li5, file$7, 95, 12, 3253);
    			attr_dev(h23, "class", "svelte-1isyeyk");
    			add_location(h23, file$7, 96, 16, 3388);
    			attr_dev(li6, "class", "svelte-1isyeyk");
    			add_location(li6, file$7, 96, 12, 3384);
    			attr_dev(input3, "type", "email");
    			attr_dev(input3, "placeholder", "Enter your email");
    			attr_dev(input3, "id", "emailReg");
    			attr_dev(input3, "class", "svelte-1isyeyk");
    			add_location(input3, file$7, 97, 16, 3425);
    			attr_dev(li7, "class", "svelte-1isyeyk");
    			add_location(li7, file$7, 97, 12, 3421);
    			attr_dev(h3, "class", "svelte-1isyeyk");
    			add_location(h3, file$7, 98, 48, 3570);
    			attr_dev(button, "class", "svelte-1isyeyk");
    			add_location(button, file$7, 98, 16, 3538);
    			attr_dev(li8, "class", "svelte-1isyeyk");
    			add_location(li8, file$7, 98, 12, 3534);
    			attr_dev(ul, "class", "svelte-1isyeyk");
    			add_location(ul, file$7, 89, 8, 2851);
    			attr_dev(div, "class", "svelte-1isyeyk");
    			add_location(div, file$7, 88, 4, 2836);
    			attr_dev(body, "class", "svelte-1isyeyk");
    			add_location(body, file$7, 87, 0, 2824);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div);
    			append_dev(div, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h20);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, input0);
    			append_dev(ul, t2);
    			append_dev(ul, li2);
    			append_dev(li2, h21);
    			append_dev(ul, t4);
    			append_dev(ul, li3);
    			append_dev(li3, input1);
    			append_dev(ul, t5);
    			append_dev(ul, li4);
    			append_dev(li4, h22);
    			append_dev(ul, t7);
    			append_dev(ul, li5);
    			append_dev(li5, input2);
    			append_dev(ul, t8);
    			append_dev(ul, li6);
    			append_dev(li6, h23);
    			append_dev(ul, t10);
    			append_dev(ul, li7);
    			append_dev(li7, input3);
    			append_dev(ul, t11);
    			append_dev(ul, li8);
    			append_dev(li8, button);
    			append_dev(button, h3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "keypress", /*jumpToPassword*/ ctx[1], false, false, false),
    					listen_dev(input1, "keypress", /*jumpToPasswordConfirm*/ ctx[2], false, false, false),
    					listen_dev(input2, "keypress", /*jumpToEmailInput*/ ctx[3], false, false, false),
    					listen_dev(input3, "keypress", /*onKeyPress*/ ctx[4], false, false, false),
    					listen_dev(button, "click", /*Registration*/ ctx[0], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RegisterForm", slots, []);
    	let mistakesDescription = "";

    	function Registration() {
    		let loginName = document.getElementById("loginReg");
    		let regPassword = document.getElementById("passwordReg");
    		let confPassword = document.getElementById("passwordConf");
    		let regEmail = document.getElementById("emailReg");
    		mistakesDescription = "";

    		if (loginName.value.length < 4) {
    			mistakesDescription += "Login name must have at leas 4 simbols <br>";
    		}

    		if (regPassword.value.length < 5) {
    			mistakesDescription += "Passwords must have at leas 5 simbols <br>";
    		}

    		if (regPassword.value !== confPassword.value) {
    			mistakesDescription += "Passwords not equals <br>";
    		}

    		if (!regEmail.value.includes("@")) {
    			mistakesDescription += "Please enter correct email <br>";
    		} else if (regEmail.value.length < 5) {
    			mistakesDescription += "Please enter correct email <br>";
    		} else if (!regEmail.value.includes(".")) {
    			mistakesDescription += "Please enter correct email <br>";
    		}

    		if (mistakesDescription.length === 0) {
    			fetch("http://localhost:5000/reg", {
    				method: "POST",
    				headers: { "Content-Type": "application/json" },
    				body: JSON.stringify({
    					name: loginName.value,
    					pass: regPassword.value,
    					email: regEmail.value
    				})
    			}).then(response => response.json()).then(data => {
    				if (data.registration) {
    					successMessage(data.text);

    					setTimeout(
    						() => {
    							window.location.href = "./#/login";
    						},
    						1000
    					);
    				} else {
    					errMessage(data.text.replaceAll("\n", "<br>"));
    				}
    			});
    		} else {
    			errMessage(mistakesDescription);
    		}
    	}

    	onMount(() => {
    		document.getElementById("loginReg").focus();
    	});

    	const jumpToPassword = e => {
    		if (e.charCode === 13) document.getElementById("passwordReg").focus();
    	};

    	const jumpToPasswordConfirm = e => {
    		if (e.charCode === 13) document.getElementById("passwordConf").focus();
    	};

    	const jumpToEmailInput = e => {
    		if (e.charCode === 13) document.getElementById("emailReg").focus();
    	};

    	const onKeyPress = e => {
    		if (e.charCode === 13) Registration();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RegisterForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		errMessage,
    		successMessage,
    		mistakesDescription,
    		Registration,
    		jumpToPassword,
    		jumpToPasswordConfirm,
    		jumpToEmailInput,
    		onKeyPress
    	});

    	$$self.$inject_state = $$props => {
    		if ("mistakesDescription" in $$props) mistakesDescription = $$props.mistakesDescription;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		Registration,
    		jumpToPassword,
    		jumpToPasswordConfirm,
    		jumpToEmailInput,
    		onKeyPress
    	];
    }

    class RegisterForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegisterForm",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\Pages\RegisterPage.svelte generated by Svelte v3.38.3 */

    function create_fragment$9(ctx) {
    	let registerform;
    	let current;
    	registerform = new RegisterForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(registerform.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(registerform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(registerform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(registerform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(registerform, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RegisterPage", slots, []);

    	onMount(() => {
    		simpleMessage("You need to fill all fields");
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RegisterPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		simpleMessage,
    		RegisterForm
    	});

    	return [];
    }

    class RegisterPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegisterPage",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\Icons\ExitIcon.svelte generated by Svelte v3.38.3 */

    const file$6 = "src\\Icons\\ExitIcon.svelte";

    function create_fragment$8(ctx) {
    	let svg;
    	let g2;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let g16;
    	let g17;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			g16 = svg_element("g");
    			g17 = svg_element("g");
    			attr_dev(path0, "d", "M510.371,226.513c-1.088-2.603-2.645-4.971-4.629-6.955l-63.979-63.979c-8.341-8.32-21.824-8.32-30.165,0\r\n\t\t\t\tc-8.341,8.341-8.341,21.845,0,30.165l27.584,27.584H320.013c-11.797,0-21.333,9.557-21.333,21.333s9.536,21.333,21.333,21.333\r\n\t\t\t\th119.168l-27.584,27.584c-8.341,8.341-8.341,21.845,0,30.165c4.16,4.181,9.621,6.251,15.083,6.251s10.923-2.069,15.083-6.251\r\n\t\t\t\tl63.979-63.979c1.984-1.963,3.541-4.331,4.629-6.955C512.525,237.606,512.525,231.718,510.371,226.513z");
    			add_location(path0, file$6, 5, 3, 281);
    			attr_dev(path1, "d", "M362.68,298.667c-11.797,0-21.333,9.557-21.333,21.333v106.667h-85.333V85.333c0-9.408-6.187-17.728-15.211-20.437\r\n\t\t\t\tl-74.091-22.229h174.635v106.667c0,11.776,9.536,21.333,21.333,21.333s21.333-9.557,21.333-21.333v-128\r\n\t\t\t\tC384.013,9.557,374.477,0,362.68,0H21.347c-0.768,0-1.451,0.32-2.197,0.405c-1.003,0.107-1.92,0.277-2.88,0.512\r\n\t\t\t\tc-2.24,0.576-4.267,1.451-6.165,2.645c-0.469,0.299-1.045,0.32-1.493,0.661C8.44,4.352,8.376,4.587,8.205,4.715\r\n\t\t\t\tC5.88,6.549,3.939,8.789,2.531,11.456c-0.299,0.576-0.363,1.195-0.597,1.792c-0.683,1.621-1.429,3.2-1.685,4.992\r\n\t\t\t\tc-0.107,0.64,0.085,1.237,0.064,1.856c-0.021,0.427-0.299,0.811-0.299,1.237V448c0,10.176,7.189,18.923,17.152,20.907\r\n\t\t\t\tl213.333,42.667c1.387,0.299,2.795,0.427,4.181,0.427c4.885,0,9.685-1.685,13.525-4.843c4.928-4.053,7.808-10.091,7.808-16.491\r\n\t\t\t\tv-21.333H362.68c11.797,0,21.333-9.557,21.333-21.333V320C384.013,308.224,374.477,298.667,362.68,298.667z");
    			add_location(path1, file$6, 9, 3, 757);
    			add_location(g0, file$6, 4, 2, 273);
    			add_location(g1, file$6, 3, 1, 266);
    			add_location(g2, file$6, 2, 0, 260);
    			add_location(g3, file$6, 20, 0, 1703);
    			add_location(g4, file$6, 22, 0, 1714);
    			add_location(g5, file$6, 24, 0, 1725);
    			add_location(g6, file$6, 26, 0, 1736);
    			add_location(g7, file$6, 28, 0, 1747);
    			add_location(g8, file$6, 30, 0, 1758);
    			add_location(g9, file$6, 32, 0, 1769);
    			add_location(g10, file$6, 34, 0, 1780);
    			add_location(g11, file$6, 36, 0, 1791);
    			add_location(g12, file$6, 38, 0, 1802);
    			add_location(g13, file$6, 40, 0, 1813);
    			add_location(g14, file$6, 42, 0, 1824);
    			add_location(g15, file$6, 44, 0, 1835);
    			add_location(g16, file$6, 46, 0, 1846);
    			add_location(g17, file$6, 48, 0, 1857);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			set_style(svg, "enable-background", "new 0 0 512 512");
    			set_style(svg, "margin-top", "5px");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "height", "60%");
    			attr_dev(svg, "fill", "white");
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(svg, g3);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    			append_dev(svg, g16);
    			append_dev(svg, g17);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ExitIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ExitIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class ExitIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExitIcon",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    async function funcPassChange( userAcc, checkThePassword ) {
        
            let newPassword = document.getElementById( 'passChange' );
            let confirmNewPassword = document.getElementById( 'passChangeConfirm' );
        
        
            await fetch("http://localhost:5000/passChange", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( { 
                    userID : userAcc.userID,
                    pass: checkThePassword,
                    newPass: newPassword.value
                } )
            })
            .then( response =>  response.json() )
            .then( ( data ) => {
                if ( data.passChange ){
                    successMessage( data.text );
                } else {
                    errMessage( data.text );
                }
            } ).catch( (err) => {
                errMessage( "Some error!" );
            } );
        
            newPassword.value = "";
            confirmNewPassword.value = "";
        }

    async function funcEmailChange( userAcc, checkThePassword ) {

        let newEmail = document.getElementById( 'emailChange' );

    await fetch("http://localhost:5000/emailChange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( { 
            userID : userAcc.userID,
            pass: checkThePassword,
            newEmail: newEmail.value
        } )
    })
    .then( response =>  response.json() )
    .then( ( data ) => {
        if ( data.emailChange ){
            successMessage( data.text );
        } else {
            errMessage( data.text );
        }
    } ).catch( (err) => {
        errMessage( "Some error!" );
    } );

        newEmail.value = "";
    }

    /* src\Forms\ProfileForm.svelte generated by Svelte v3.38.3 */
    const file$5 = "src\\Forms\\ProfileForm.svelte";

    function create_fragment$7(ctx) {
    	let body;
    	let div0;
    	let ul;
    	let li0;
    	let h10;
    	let t0;
    	let t1_value = /*$userAcc*/ ctx[0].name + "";
    	let t1;
    	let t2;
    	let li1;
    	let h11;
    	let t4;
    	let li2;
    	let input0;
    	let t5;
    	let li3;
    	let input1;
    	let t6;
    	let li4;
    	let button0;
    	let h30;
    	let t8;
    	let li5;
    	let h12;
    	let t10;
    	let li6;
    	let input2;
    	let t11;
    	let li7;
    	let button1;
    	let h31;
    	let t13;
    	let li8;
    	let button2;
    	let h32;
    	let t15;
    	let exiticon;
    	let t16;
    	let div3;
    	let div2;
    	let span;
    	let h13;
    	let t18;
    	let input3;
    	let t19;
    	let div1;
    	let button3;
    	let t21;
    	let button4;
    	let current;
    	let mounted;
    	let dispose;
    	exiticon = new ExitIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			body = element("body");
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			h10 = element("h1");
    			t0 = text("Account name: ");
    			t1 = text(t1_value);
    			t2 = space();
    			li1 = element("li");
    			h11 = element("h1");
    			h11.textContent = "Change the password:";
    			t4 = space();
    			li2 = element("li");
    			input0 = element("input");
    			t5 = space();
    			li3 = element("li");
    			input1 = element("input");
    			t6 = space();
    			li4 = element("li");
    			button0 = element("button");
    			h30 = element("h3");
    			h30.textContent = "Change";
    			t8 = space();
    			li5 = element("li");
    			h12 = element("h1");
    			h12.textContent = "Change the e-mail:";
    			t10 = space();
    			li6 = element("li");
    			input2 = element("input");
    			t11 = space();
    			li7 = element("li");
    			button1 = element("button");
    			h31 = element("h3");
    			h31.textContent = "Change";
    			t13 = space();
    			li8 = element("li");
    			button2 = element("button");
    			h32 = element("h3");
    			h32.textContent = "Exit";
    			t15 = space();
    			create_component(exiticon.$$.fragment);
    			t16 = space();
    			div3 = element("div");
    			div2 = element("div");
    			span = element("span");
    			h13 = element("h1");
    			h13.textContent = "To confirm changes, enter your existing password.";
    			t18 = space();
    			input3 = element("input");
    			t19 = space();
    			div1 = element("div");
    			button3 = element("button");
    			button3.textContent = "CANCEL";
    			t21 = space();
    			button4 = element("button");
    			button4.textContent = "ENTER";
    			attr_dev(h10, "class", "accName svelte-4kqeq3");
    			add_location(h10, file$5, 111, 16, 3652);
    			attr_dev(li0, "class", "svelte-4kqeq3");
    			add_location(li0, file$5, 111, 12, 3648);
    			attr_dev(h11, "class", "svelte-4kqeq3");
    			add_location(h11, file$5, 112, 16, 3730);
    			attr_dev(li1, "class", "svelte-4kqeq3");
    			add_location(li1, file$5, 112, 12, 3726);
    			attr_dev(input0, "type", "password");
    			attr_dev(input0, "placeholder", "Enter your new password");
    			attr_dev(input0, "id", "passChange");
    			attr_dev(input0, "class", "svelte-4kqeq3");
    			add_location(input0, file$5, 113, 16, 3782);
    			attr_dev(li2, "class", "svelte-4kqeq3");
    			add_location(li2, file$5, 113, 12, 3778);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Confirm your new password");
    			attr_dev(input1, "id", "passChangeConfirm");
    			attr_dev(input1, "class", "svelte-4kqeq3");
    			add_location(input1, file$5, 114, 16, 3915);
    			attr_dev(li3, "class", "svelte-4kqeq3");
    			add_location(li3, file$5, 114, 12, 3911);
    			attr_dev(h30, "class", "svelte-4kqeq3");
    			add_location(h30, file$5, 115, 55, 4104);
    			attr_dev(button0, "class", "svelte-4kqeq3");
    			add_location(button0, file$5, 115, 16, 4065);
    			attr_dev(li4, "class", "svelte-4kqeq3");
    			add_location(li4, file$5, 115, 12, 4061);
    			attr_dev(h12, "class", "svelte-4kqeq3");
    			add_location(h12, file$5, 116, 16, 4151);
    			attr_dev(li5, "class", "svelte-4kqeq3");
    			add_location(li5, file$5, 116, 12, 4147);
    			attr_dev(input2, "type", "email");
    			attr_dev(input2, "placeholder", "Enter your new email");
    			attr_dev(input2, "id", "emailChange");
    			attr_dev(input2, "class", "svelte-4kqeq3");
    			add_location(input2, file$5, 117, 16, 4201);
    			attr_dev(li6, "class", "svelte-4kqeq3");
    			add_location(li6, file$5, 117, 12, 4197);
    			attr_dev(h31, "class", "svelte-4kqeq3");
    			add_location(h31, file$5, 118, 56, 4378);
    			attr_dev(button1, "class", "svelte-4kqeq3");
    			add_location(button1, file$5, 118, 16, 4338);
    			attr_dev(li7, "class", "svelte-4kqeq3");
    			add_location(li7, file$5, 118, 12, 4334);
    			attr_dev(h32, "class", "svelte-4kqeq3");
    			add_location(h32, file$5, 119, 58, 4467);
    			attr_dev(button2, "class", "exit svelte-4kqeq3");
    			add_location(button2, file$5, 119, 16, 4425);
    			attr_dev(li8, "class", "svelte-4kqeq3");
    			add_location(li8, file$5, 119, 12, 4421);
    			attr_dev(ul, "class", "svelte-4kqeq3");
    			add_location(ul, file$5, 110, 8, 3630);
    			attr_dev(div0, "class", "svelte-4kqeq3");
    			add_location(div0, file$5, 109, 4, 3615);
    			attr_dev(h13, "class", "svelte-4kqeq3");
    			add_location(h13, file$5, 127, 16, 4637);
    			attr_dev(span, "class", "svelte-4kqeq3");
    			add_location(span, file$5, 126, 12, 4613);
    			attr_dev(input3, "class", "inputChangesConfirm svelte-4kqeq3");
    			attr_dev(input3, "type", "password");
    			attr_dev(input3, "placeholder", "Enter your existing password");
    			attr_dev(input3, "id", "changesConfirm");
    			add_location(input3, file$5, 130, 12, 4745);
    			attr_dev(button3, "class", "cancelConfirm svelte-4kqeq3");
    			add_location(button3, file$5, 133, 16, 4958);
    			attr_dev(button4, "class", "enterConfirm svelte-4kqeq3");
    			add_location(button4, file$5, 134, 16, 5049);
    			attr_dev(div1, "class", "buttonHolder svelte-4kqeq3");
    			add_location(div1, file$5, 132, 12, 4914);
    			attr_dev(div2, "class", "passConfirm svelte-4kqeq3");
    			add_location(div2, file$5, 125, 8, 4573);
    			attr_dev(div3, "id", "overlay");
    			attr_dev(div3, "class", "svelte-4kqeq3");
    			add_location(div3, file$5, 124, 4, 4545);
    			attr_dev(body, "class", "svelte-4kqeq3");
    			add_location(body, file$5, 107, 0, 3601);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, h10);
    			append_dev(h10, t0);
    			append_dev(h10, t1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, h11);
    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			append_dev(li2, input0);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, input1);
    			append_dev(ul, t6);
    			append_dev(ul, li4);
    			append_dev(li4, button0);
    			append_dev(button0, h30);
    			append_dev(ul, t8);
    			append_dev(ul, li5);
    			append_dev(li5, h12);
    			append_dev(ul, t10);
    			append_dev(ul, li6);
    			append_dev(li6, input2);
    			append_dev(ul, t11);
    			append_dev(ul, li7);
    			append_dev(li7, button1);
    			append_dev(button1, h31);
    			append_dev(ul, t13);
    			append_dev(ul, li8);
    			append_dev(li8, button2);
    			append_dev(button2, h32);
    			append_dev(button2, t15);
    			mount_component(exiticon, button2, null);
    			append_dev(body, t16);
    			append_dev(body, div3);
    			append_dev(div3, div2);
    			append_dev(div2, span);
    			append_dev(span, h13);
    			append_dev(div2, t18);
    			append_dev(div2, input3);
    			append_dev(div2, t19);
    			append_dev(div2, div1);
    			append_dev(div1, button3);
    			append_dev(div1, t21);
    			append_dev(div1, button4);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "keypress", /*nextPassFieldFocus*/ ctx[5], false, false, false),
    					listen_dev(input1, "keypress", /*checkIfPassCorrectKeyPress*/ ctx[2], false, false, false),
    					listen_dev(button0, "click", /*checkIfPassCorrect*/ ctx[1], false, false, false),
    					listen_dev(input2, "keypress", /*checkIfEmailCorrectKeyPress*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*checkIfEmailCorrect*/ ctx[3], false, false, false),
    					listen_dev(button2, "click", /*funcExit*/ ctx[8], false, false, false),
    					listen_dev(input3, "keypress", /*onKeyPressPassCheck*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", passCheckCancel, false, false, false),
    					listen_dev(button4, "click", /*changesSending*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$userAcc*/ 1) && t1_value !== (t1_value = /*$userAcc*/ ctx[0].name + "")) set_data_dev(t1, t1_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(exiticon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(exiticon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			destroy_component(exiticon);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function passCheckCancel() {
    	document.getElementById("changesConfirm").value = "";
    	document.getElementById("overlay").style.transform = "scale(0)";
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $userAcc;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(0, $userAcc = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ProfileForm", slots, []);
    	let changeThePassword = true;

    	// смена пароля
    	function checkIfPassCorrect() {
    		let errorPassField = false;
    		let errText = "";

    		if (document.getElementById("passChange").value.length < 5 || document.getElementById("passChangeConfirm").value.length < 5) {
    			errorPassField = true;
    			errText += "Password must have at leas 5 simbols <br>";
    		}

    		if (document.getElementById("passChange").value != document.getElementById("passChangeConfirm").value) {
    			errorPassField = true;
    			errText += "Passwords must be equals.";
    		}

    		if (errorPassField) {
    			errMessage(errText);
    			return;
    		} else {
    			changeThePassword = true;
    			document.getElementById("overlay").style.transform = "scale(1)";
    			document.getElementById("changesConfirm").focus();
    		}
    	}

    	const checkIfPassCorrectKeyPress = e => {
    		if (e.charCode === 13) checkIfPassCorrect();
    	};

    	//смена E-Mail
    	function checkIfEmailCorrect() {
    		if (!document.getElementById("emailChange").value.includes("@")) {
    			errMessage("Please enter correct email.");
    		} else if (document.getElementById("emailChange").value.length < 5) {
    			errMessage("Please enter correct email.");
    		} else if (!document.getElementById("emailChange").value.includes(".")) {
    			errMessage("Please enter correct email.");
    		} else {
    			changeThePassword = false;
    			document.getElementById("overlay").style.transform = "scale(1)";
    			document.getElementById("changesConfirm").focus();
    		}
    	}

    	const checkIfEmailCorrectKeyPress = e => {
    		if (e.charCode === 13) checkIfEmailCorrect();
    	};

    	// переход на след строку в поле пароля
    	const nextPassFieldFocus = e => {
    		if (e.charCode === 13) document.getElementById("passChangeConfirm").focus();
    	};

    	function changesSending() {
    		if (changeThePassword) {
    			funcPassChange($userAcc, document.getElementById("changesConfirm").value);
    			passCheckCancel();
    		} else {
    			funcEmailChange($userAcc, document.getElementById("changesConfirm").value);
    			passCheckCancel();
    		}
    	}

    	const onKeyPressPassCheck = e => {
    		if (e.charCode === 13) {
    			if (changeThePassword) {
    				funcPassChange($userAcc, document.getElementById("changesConfirm").value);
    				passCheckCancel();
    			} else {
    				funcEmailChange($userAcc, document.getElementById("changesConfirm").value);
    				passCheckCancel();
    			}
    		}
    	};

    	//выход
    	function funcExit() {
    		set_store_value(userAcc, $userAcc.logon = false, $userAcc);
    		set_store_value(userAcc, $userAcc.name = "Guest", $userAcc);
    		set_store_value(userAcc, $userAcc.profLink = "/#/login", $userAcc);
    		set_store_value(userAcc, $userAcc.userID = "", $userAcc);
    		window.location.href = "/#/login";
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProfileForm> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ExitIcon,
    		userAcc,
    		funcPassChange,
    		funcEmailChange,
    		errMessage,
    		changeThePassword,
    		checkIfPassCorrect,
    		checkIfPassCorrectKeyPress,
    		checkIfEmailCorrect,
    		checkIfEmailCorrectKeyPress,
    		nextPassFieldFocus,
    		passCheckCancel,
    		changesSending,
    		onKeyPressPassCheck,
    		funcExit,
    		$userAcc
    	});

    	$$self.$inject_state = $$props => {
    		if ("changeThePassword" in $$props) changeThePassword = $$props.changeThePassword;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$userAcc,
    		checkIfPassCorrect,
    		checkIfPassCorrectKeyPress,
    		checkIfEmailCorrect,
    		checkIfEmailCorrectKeyPress,
    		nextPassFieldFocus,
    		changesSending,
    		onKeyPressPassCheck,
    		funcExit
    	];
    }

    class ProfileForm extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProfileForm",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Pages\Profile.svelte generated by Svelte v3.38.3 */

    function create_fragment$6(ctx) {
    	let profileform;
    	let current;
    	profileform = new ProfileForm({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(profileform.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(profileform, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(profileform.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(profileform.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(profileform, detaching);
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

    function instance$6($$self, $$props, $$invalidate) {
    	let $userAcc;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(0, $userAcc = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Profile", slots, []);

    	onMount(() => {
    		if ($userAcc.logon) {
    			simpleMessage("Hi, this is Your account profile. <br> Here you can change your password and e-mail.");
    		} else {
    			window.location.href = "./#/login";
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		ProfileForm,
    		simpleMessage,
    		userAcc,
    		$userAcc
    	});

    	return [];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Icons\LoginIcon.svelte generated by Svelte v3.38.3 */

    const file$4 = "src\\Icons\\LoginIcon.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let g2;
    	let g1;
    	let g0;
    	let path0;
    	let path1;
    	let g3;
    	let g4;
    	let g5;
    	let g6;
    	let g7;
    	let g8;
    	let g9;
    	let g10;
    	let g11;
    	let g12;
    	let g13;
    	let g14;
    	let g15;
    	let g16;
    	let g17;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g2 = svg_element("g");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			g3 = svg_element("g");
    			g4 = svg_element("g");
    			g5 = svg_element("g");
    			g6 = svg_element("g");
    			g7 = svg_element("g");
    			g8 = svg_element("g");
    			g9 = svg_element("g");
    			g10 = svg_element("g");
    			g11 = svg_element("g");
    			g12 = svg_element("g");
    			g13 = svg_element("g");
    			g14 = svg_element("g");
    			g15 = svg_element("g");
    			g16 = svg_element("g");
    			g17 = svg_element("g");
    			attr_dev(path0, "d", "M469.333,0h-256c-23.564,0-42.667,19.103-42.667,42.667v74.667c0,5.891,4.776,10.667,10.667,10.667h21.333\r\n                    c5.891,0,10.667-4.776,10.667-10.667V42.667h256v426.667h-256v-74.667c0-5.891-4.776-10.667-10.667-10.667h-21.333\r\n                    c-5.891,0-10.667,4.776-10.667,10.667v74.667c0,23.564,19.102,42.667,42.667,42.667h256C492.898,512,512,492.898,512,469.333\r\n                    V42.667C512,19.103,492.898,0,469.333,0z");
    			add_location(path0, file$4, 5, 16, 346);
    			attr_dev(path1, "d", "M238.198,344.073c-2.25,2.021-3.531,4.906-3.531,7.927v21.333c0,4.229,2.5,8.063,6.375,9.76\r\n                    c1.375,0.615,2.844,0.906,4.292,0.906c2.615,0,5.198-0.969,7.208-2.802l128-117.333C382.75,261.844,384,258.99,384,256\r\n                    s-1.25-5.844-3.458-7.865l-128-117.333c-3.125-2.844-7.656-3.625-11.5-1.896c-3.875,1.698-6.375,5.531-6.375,9.76V160\r\n                    c0,3.021,1.281,5.906,3.531,7.927l74.151,66.74H10.667C4.771,234.667,0,239.438,0,245.333v21.333\r\n                    c0,5.896,4.771,10.667,10.667,10.667h301.682L238.198,344.073z");
    			add_location(path1, file$4, 9, 16, 813);
    			add_location(g0, file$4, 4, 12, 325);
    			add_location(g1, file$4, 3, 8, 308);
    			add_location(g2, file$4, 2, 4, 295);
    			add_location(g3, file$4, 17, 4, 1429);
    			add_location(g4, file$4, 19, 4, 1448);
    			add_location(g5, file$4, 21, 4, 1467);
    			add_location(g6, file$4, 23, 4, 1486);
    			add_location(g7, file$4, 25, 4, 1505);
    			add_location(g8, file$4, 27, 4, 1524);
    			add_location(g9, file$4, 29, 4, 1543);
    			add_location(g10, file$4, 31, 4, 1562);
    			add_location(g11, file$4, 33, 4, 1581);
    			add_location(g12, file$4, 35, 4, 1600);
    			add_location(g13, file$4, 37, 4, 1619);
    			add_location(g14, file$4, 39, 4, 1638);
    			add_location(g15, file$4, 41, 4, 1657);
    			add_location(g16, file$4, 43, 4, 1676);
    			add_location(g17, file$4, 45, 4, 1695);
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "Capa_1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "x", "0px");
    			attr_dev(svg, "y", "0px");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			set_style(svg, "enable-background", "new 0 0 512 512");
    			set_style(svg, "padding-left", "20px");
    			set_style(svg, "padding-top", "5px");
    			attr_dev(svg, "xml:space", "preserve");
    			attr_dev(svg, "fill", "white");
    			attr_dev(svg, "height", "25px");
    			add_location(svg, file$4, 0, 4, 4);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g2);
    			append_dev(g2, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(g0, path1);
    			append_dev(svg, g3);
    			append_dev(svg, g4);
    			append_dev(svg, g5);
    			append_dev(svg, g6);
    			append_dev(svg, g7);
    			append_dev(svg, g8);
    			append_dev(svg, g9);
    			append_dev(svg, g10);
    			append_dev(svg, g11);
    			append_dev(svg, g12);
    			append_dev(svg, g13);
    			append_dev(svg, g14);
    			append_dev(svg, g15);
    			append_dev(svg, g16);
    			append_dev(svg, g17);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
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

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LoginIcon", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LoginIcon> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LoginIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginIcon",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Pages\Header.svelte generated by Svelte v3.38.3 */
    const file$3 = "src\\Pages\\Header.svelte";

    // (19:20) {#if !$userAcc.logon }
    function create_if_block_1(ctx) {
    	let icon;
    	let current;
    	icon = new LoginIcon({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(19:20) {#if !$userAcc.logon }",
    		ctx
    	});

    	return block;
    }

    // (20:12) {#if $userAcc.logon}
    function create_if_block(ctx) {
    	let li;
    	let a;
    	let basketicon;
    	let t0;
    	let h6;
    	let t1;
    	let current;

    	basketicon = new BasketIcon({
    			props: { w: "30px", h: "30px", ml: "5px" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			create_component(basketicon.$$.fragment);
    			t0 = space();
    			h6 = element("h6");
    			t1 = text(/*$basketSizeHolder*/ ctx[1]);
    			attr_dev(h6, "class", "svelte-81l4dk");
    			add_location(h6, file$3, 20, 100, 871);
    			attr_dev(a, "href", "/#/basket");
    			attr_dev(a, "class", "svelte-81l4dk");
    			add_location(a, file$3, 20, 37, 808);
    			set_style(li, "float", "right");
    			attr_dev(li, "class", "svelte-81l4dk");
    			add_location(li, file$3, 20, 12, 783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			mount_component(basketicon, a, null);
    			append_dev(a, t0);
    			append_dev(a, h6);
    			append_dev(h6, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*$basketSizeHolder*/ 2) set_data_dev(t1, /*$basketSizeHolder*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(basketicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(basketicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(basketicon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(20:12) {#if $userAcc.logon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let body;
    	let header;
    	let ul;
    	let li0;
    	let a0;
    	let h10;
    	let t1;
    	let li1;
    	let a1;
    	let h11;
    	let t3;
    	let li2;
    	let a2;
    	let h12;
    	let t5;
    	let li3;
    	let a3;
    	let h13;
    	let t7;
    	let li4;
    	let a4;
    	let h14;
    	let t8;
    	let t9_value = /*$userAcc*/ ctx[0].name + "";
    	let t9;
    	let t10;
    	let t11;
    	let a4_href_value;
    	let t12;
    	let current;
    	let if_block0 = !/*$userAcc*/ ctx[0].logon && create_if_block_1(ctx);
    	let if_block1 = /*$userAcc*/ ctx[0].logon && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			body = element("body");
    			header = element("header");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			h10 = element("h1");
    			h10.textContent = "Home";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			h11 = element("h1");
    			h11.textContent = "About";
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			h12 = element("h1");
    			h12.textContent = "News";
    			t5 = space();
    			li3 = element("li");
    			a3 = element("a");
    			h13 = element("h1");
    			h13.textContent = "Products";
    			t7 = space();
    			li4 = element("li");
    			a4 = element("a");
    			h14 = element("h1");
    			t8 = text("Hi, ");
    			t9 = text(t9_value);
    			t10 = text(" !");
    			t11 = space();
    			if (if_block0) if_block0.c();
    			t12 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h10, "class", "svelte-81l4dk");
    			add_location(h10, file$3, 12, 32, 310);
    			attr_dev(a0, "href", "/#/");
    			attr_dev(a0, "class", "svelte-81l4dk");
    			add_location(a0, file$3, 12, 17, 295);
    			attr_dev(li0, "class", "svelte-81l4dk");
    			add_location(li0, file$3, 12, 12, 290);
    			attr_dev(h11, "class", "svelte-81l4dk");
    			add_location(h11, file$3, 13, 37, 373);
    			attr_dev(a1, "href", "/#/about");
    			attr_dev(a1, "class", "svelte-81l4dk");
    			add_location(a1, file$3, 13, 17, 353);
    			attr_dev(li1, "class", "svelte-81l4dk");
    			add_location(li1, file$3, 13, 12, 348);
    			attr_dev(h12, "class", "svelte-81l4dk");
    			add_location(h12, file$3, 14, 36, 436);
    			attr_dev(a2, "href", "/#/news");
    			attr_dev(a2, "class", "svelte-81l4dk");
    			add_location(a2, file$3, 14, 17, 417);
    			attr_dev(li2, "class", "svelte-81l4dk");
    			add_location(li2, file$3, 14, 12, 412);
    			attr_dev(h13, "class", "svelte-81l4dk");
    			add_location(h13, file$3, 15, 40, 502);
    			attr_dev(a3, "href", "/#/products");
    			attr_dev(a3, "class", "svelte-81l4dk");
    			add_location(a3, file$3, 15, 17, 479);
    			attr_dev(li3, "class", "svelte-81l4dk");
    			add_location(li3, file$3, 15, 12, 474);
    			set_style(h14, "float", "left");
    			attr_dev(h14, "class", "svelte-81l4dk");
    			add_location(h14, file$3, 17, 16, 615);
    			attr_dev(a4, "href", a4_href_value = /*$userAcc*/ ctx[0].profLink);
    			attr_dev(a4, "class", "svelte-81l4dk");
    			add_location(a4, file$3, 16, 37, 569);
    			set_style(li4, "float", "right");
    			attr_dev(li4, "class", "svelte-81l4dk");
    			add_location(li4, file$3, 16, 12, 544);
    			attr_dev(ul, "class", "svelte-81l4dk");
    			add_location(ul, file$3, 11, 8, 272);
    			attr_dev(header, "class", "svelte-81l4dk");
    			add_location(header, file$3, 10, 4, 254);
    			attr_dev(body, "class", "svelte-81l4dk");
    			add_location(body, file$3, 9, 0, 242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, header);
    			append_dev(header, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(a0, h10);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, h11);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(a2, h12);
    			append_dev(ul, t5);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    			append_dev(a3, h13);
    			append_dev(ul, t7);
    			append_dev(ul, li4);
    			append_dev(li4, a4);
    			append_dev(a4, h14);
    			append_dev(h14, t8);
    			append_dev(h14, t9);
    			append_dev(h14, t10);
    			append_dev(a4, t11);
    			if (if_block0) if_block0.m(a4, null);
    			append_dev(ul, t12);
    			if (if_block1) if_block1.m(ul, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$userAcc*/ 1) && t9_value !== (t9_value = /*$userAcc*/ ctx[0].name + "")) set_data_dev(t9, t9_value);

    			if (!/*$userAcc*/ ctx[0].logon) {
    				if (if_block0) {
    					if (dirty & /*$userAcc*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(a4, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*$userAcc*/ 1 && a4_href_value !== (a4_href_value = /*$userAcc*/ ctx[0].profLink)) {
    				attr_dev(a4, "href", a4_href_value);
    			}

    			if (/*$userAcc*/ ctx[0].logon) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$userAcc*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(ul, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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

    function instance$4($$self, $$props, $$invalidate) {
    	let $userAcc;
    	let $basketSizeHolder;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(0, $userAcc = $$value));
    	validate_store(basketSizeHolder, "basketSizeHolder");
    	component_subscribe($$self, basketSizeHolder, $$value => $$invalidate(1, $basketSizeHolder = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Icon: LoginIcon,
    		BasketIcon,
    		basketMap,
    		userAcc,
    		basketSizeHolder,
    		$userAcc,
    		$basketSizeHolder
    	});

    	return [$userAcc, $basketSizeHolder];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\Pages\PageDescription.svelte generated by Svelte v3.38.3 */
    const file$2 = "src\\Pages\\PageDescription.svelte";

    function create_fragment$3(ctx) {
    	let body;
    	let h3;
    	let raw_value = /*$ActualPageDescription*/ ctx[0].t + "";
    	let t;
    	let hr;

    	const block = {
    		c: function create() {
    			body = element("body");
    			h3 = element("h3");
    			t = space();
    			hr = element("hr");
    			set_style(h3, "color", "rgb( " + /*$ActualPageDescription*/ ctx[0].r + ", " + /*$ActualPageDescription*/ ctx[0].g + ", " + /*$ActualPageDescription*/ ctx[0].b + " )");
    			attr_dev(h3, "class", "svelte-1akndeu");
    			add_location(h3, file$2, 5, 4, 90);
    			attr_dev(hr, "class", "svelte-1akndeu");
    			add_location(hr, file$2, 7, 4, 258);
    			attr_dev(body, "class", "svelte-1akndeu");
    			add_location(body, file$2, 4, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, h3);
    			h3.innerHTML = raw_value;
    			append_dev(body, t);
    			append_dev(body, hr);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$ActualPageDescription*/ 1 && raw_value !== (raw_value = /*$ActualPageDescription*/ ctx[0].t + "")) h3.innerHTML = raw_value;
    			if (dirty & /*$ActualPageDescription*/ 1) {
    				set_style(h3, "color", "rgb( " + /*$ActualPageDescription*/ ctx[0].r + ", " + /*$ActualPageDescription*/ ctx[0].g + ", " + /*$ActualPageDescription*/ ctx[0].b + " )");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $ActualPageDescription;
    	validate_store(ActualPageDescription, "ActualPageDescription");
    	component_subscribe($$self, ActualPageDescription, $$value => $$invalidate(0, $ActualPageDescription = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PageDescription", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageDescription> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ActualPageDescription,
    		$ActualPageDescription
    	});

    	return [$ActualPageDescription];
    }

    class PageDescription extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageDescription",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Pages\BasketList.svelte generated by Svelte v3.38.3 */
    const file$1 = "src\\Pages\\BasketList.svelte";

    function create_fragment$2(ctx) {
    	let li;
    	let h1;
    	let t0_value = /*productValue*/ ctx[0][0].productName + "";
    	let t0;
    	let t1;
    	let h20;
    	let t2;
    	let t3;
    	let t4;
    	let button0;
    	let h21;
    	let t6;
    	let h22;
    	let t7_value = /*productValue*/ ctx[0][1] + "";
    	let t7;
    	let t8;
    	let button1;
    	let h23;
    	let t10;
    	let button2;
    	let trashbinicon;
    	let t11;
    	let h24;
    	let t12;
    	let t13_value = +/*productValue*/ ctx[0][0].productPrice + "";
    	let t13;
    	let t14;
    	let current;
    	let mounted;
    	let dispose;
    	trashbinicon = new TrashBinIcon({ props: { c: "MAROON" }, $$inline: true });

    	const block = {
    		c: function create() {
    			li = element("li");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			h20 = element("h2");
    			t2 = text(/*productPriceSummValue*/ ctx[1]);
    			t3 = text(" $");
    			t4 = space();
    			button0 = element("button");
    			h21 = element("h2");
    			h21.textContent = "+";
    			t6 = space();
    			h22 = element("h2");
    			t7 = text(t7_value);
    			t8 = space();
    			button1 = element("button");
    			h23 = element("h2");
    			h23.textContent = "-";
    			t10 = space();
    			button2 = element("button");
    			create_component(trashbinicon.$$.fragment);
    			t11 = space();
    			h24 = element("h2");
    			t12 = text("Price: ");
    			t13 = text(t13_value);
    			t14 = text("$");
    			attr_dev(h1, "class", "svelte-ok3swm");
    			add_location(h1, file$1, 71, 4, 1615);
    			attr_dev(h20, "class", "svelte-ok3swm");
    			add_location(h20, file$1, 72, 4, 1661);
    			attr_dev(h21, "class", "svelte-ok3swm");
    			add_location(h21, file$1, 73, 42, 1740);
    			attr_dev(button0, "class", "svelte-ok3swm");
    			add_location(button0, file$1, 73, 4, 1702);
    			attr_dev(h22, "class", "svelte-ok3swm");
    			add_location(h22, file$1, 74, 4, 1766);
    			attr_dev(h23, "class", "svelte-ok3swm");
    			add_location(h23, file$1, 75, 42, 1838);
    			attr_dev(button1, "class", "svelte-ok3swm");
    			add_location(button1, file$1, 75, 4, 1800);
    			attr_dev(button2, "id", "positionRemoveButton");
    			attr_dev(button2, "class", "svelte-ok3swm");
    			add_location(button2, file$1, 76, 4, 1864);
    			attr_dev(h24, "class", "svelte-ok3swm");
    			add_location(h24, file$1, 77, 4, 1975);
    			attr_dev(li, "class", "svelte-ok3swm");
    			add_location(li, file$1, 70, 0, 1605);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, h1);
    			append_dev(h1, t0);
    			append_dev(li, t1);
    			append_dev(li, h20);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(li, t4);
    			append_dev(li, button0);
    			append_dev(button0, h21);
    			append_dev(li, t6);
    			append_dev(li, h22);
    			append_dev(h22, t7);
    			append_dev(li, t8);
    			append_dev(li, button1);
    			append_dev(button1, h23);
    			append_dev(li, t10);
    			append_dev(li, button2);
    			mount_component(trashbinicon, button2, null);
    			append_dev(li, t11);
    			append_dev(li, h24);
    			append_dev(h24, t12);
    			append_dev(h24, t13);
    			append_dev(h24, t14);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*incrementFunction*/ ctx[2], false, false, false),
    					listen_dev(button1, "click", /*decrementFunction*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*positionRemoveFunction*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*productValue*/ 1) && t0_value !== (t0_value = /*productValue*/ ctx[0][0].productName + "")) set_data_dev(t0, t0_value);
    			if (!current || dirty & /*productPriceSummValue*/ 2) set_data_dev(t2, /*productPriceSummValue*/ ctx[1]);
    			if ((!current || dirty & /*productValue*/ 1) && t7_value !== (t7_value = /*productValue*/ ctx[0][1] + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*productValue*/ 1) && t13_value !== (t13_value = +/*productValue*/ ctx[0][0].productPrice + "")) set_data_dev(t13, t13_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(trashbinicon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(trashbinicon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(trashbinicon);
    			mounted = false;
    			run_all(dispose);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let $productTotalSummValue;
    	let $basketMap;
    	let $basketSizeHolder;
    	validate_store(productTotalSummValue, "productTotalSummValue");
    	component_subscribe($$self, productTotalSummValue, $$value => $$invalidate(6, $productTotalSummValue = $$value));
    	validate_store(basketMap, "basketMap");
    	component_subscribe($$self, basketMap, $$value => $$invalidate(7, $basketMap = $$value));
    	validate_store(basketSizeHolder, "basketSizeHolder");
    	component_subscribe($$self, basketSizeHolder, $$value => $$invalidate(8, $basketSizeHolder = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BasketList", slots, []);
    	let { productObject } = $$props;
    	let { productValue } = $$props;
    	let productPriceSummValue = 0;
    	productPriceSummFunction();
    	productTotalSumCountFunction();

    	function productPriceSummFunction() {
    		$$invalidate(1, productPriceSummValue = +productValue[0].productPrice * productValue[1]);
    		$$invalidate(1, productPriceSummValue = productPriceSummValue.toFixed(2));
    		productTotalSumCountFunction();
    	}

    	function productTotalSumCountFunction() {
    		set_store_value(productTotalSummValue, $productTotalSummValue = 0, $productTotalSummValue);

    		$basketMap.forEach((value, key) => {
    			set_store_value(productTotalSummValue, $productTotalSummValue += value[1] * value[0].productPrice, $productTotalSummValue);
    		});

    		set_store_value(productTotalSummValue, $productTotalSummValue = $productTotalSummValue.toFixed(2), $productTotalSummValue);
    	}

    	function incrementFunction() {
    		if (productValue[0].productQuantity <= productValue[1]) {
    			errMessage("Product maximal limit!");
    			return;
    		}

    		$$invalidate(0, productValue[1]++, productValue);
    		productPriceSummFunction();
    	}

    	function positionRemoveFunction() {
    		$basketMap.delete(productObject);
    		set_store_value(basketSizeHolder, $basketSizeHolder = $basketMap.size, $basketSizeHolder);
    		this.parentNode.remove();
    		productTotalSumCountFunction();
    	}

    	function decrementFunction() {
    		$$invalidate(0, productValue[1]--, productValue);

    		if (productValue[1] < 1) {
    			$$invalidate(0, productValue[1] = 1, productValue);
    			set_store_value(basketSizeHolder, $basketSizeHolder = $basketMap.size, $basketSizeHolder);
    		}

    		productPriceSummFunction();
    	}

    	const writable_props = ["productObject", "productValue"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BasketList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("productObject" in $$props) $$invalidate(5, productObject = $$props.productObject);
    		if ("productValue" in $$props) $$invalidate(0, productValue = $$props.productValue);
    	};

    	$$self.$capture_state = () => ({
    		TrashBinIcon,
    		errMessage,
    		successMessage,
    		basketMap,
    		basketSizeHolder,
    		productTotalSummValue,
    		productObject,
    		productValue,
    		productPriceSummValue,
    		productPriceSummFunction,
    		productTotalSumCountFunction,
    		incrementFunction,
    		positionRemoveFunction,
    		decrementFunction,
    		$productTotalSummValue,
    		$basketMap,
    		$basketSizeHolder
    	});

    	$$self.$inject_state = $$props => {
    		if ("productObject" in $$props) $$invalidate(5, productObject = $$props.productObject);
    		if ("productValue" in $$props) $$invalidate(0, productValue = $$props.productValue);
    		if ("productPriceSummValue" in $$props) $$invalidate(1, productPriceSummValue = $$props.productPriceSummValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		productValue,
    		productPriceSummValue,
    		incrementFunction,
    		positionRemoveFunction,
    		decrementFunction,
    		productObject
    	];
    }

    class BasketList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { productObject: 5, productValue: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BasketList",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*productObject*/ ctx[5] === undefined && !("productObject" in props)) {
    			console.warn("<BasketList> was created without expected prop 'productObject'");
    		}

    		if (/*productValue*/ ctx[0] === undefined && !("productValue" in props)) {
    			console.warn("<BasketList> was created without expected prop 'productValue'");
    		}
    	}

    	get productObject() {
    		throw new Error("<BasketList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set productObject(value) {
    		throw new Error("<BasketList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get productValue() {
    		throw new Error("<BasketList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set productValue(value) {
    		throw new Error("<BasketList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Pages\Basket.svelte generated by Svelte v3.38.3 */

    const { Object: Object_1 } = globals;
    const file = "src\\Pages\\Basket.svelte";

    function create_fragment$1(ctx) {
    	let body;
    	let div3;
    	let div0;
    	let ul;
    	let t0;
    	let div1;
    	let h20;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let button;
    	let h21;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			body = element("body");
    			div3 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			t0 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			t1 = text("Total summ: ");
    			t2 = text(/*$productTotalSummValue*/ ctx[0]);
    			t3 = text(" $");
    			t4 = space();
    			div2 = element("div");
    			button = element("button");
    			h21 = element("h2");
    			h21.textContent = "Make order";
    			attr_dev(ul, "id", "productList");
    			attr_dev(ul, "class", "svelte-1ulh30b");
    			add_location(ul, file, 73, 12, 2057);
    			attr_dev(div0, "id", "productBasketDiv");
    			attr_dev(div0, "class", "svelte-1ulh30b");
    			add_location(div0, file, 72, 8, 2016);
    			add_location(h20, file, 77, 12, 2170);
    			attr_dev(div1, "id", "productTotalSummHolder");
    			attr_dev(div1, "class", "svelte-1ulh30b");
    			add_location(div1, file, 76, 8, 2123);
    			attr_dev(h21, "class", "svelte-1ulh30b");
    			add_location(h21, file, 80, 66, 2348);
    			attr_dev(button, "class", "svelte-1ulh30b");
    			add_location(button, file, 80, 12, 2294);
    			attr_dev(div2, "id", "productBasketButtonHolder");
    			attr_dev(div2, "class", "svelte-1ulh30b");
    			add_location(div2, file, 79, 8, 2244);
    			attr_dev(div3, "id", "basketMainDiv");
    			attr_dev(div3, "class", "svelte-1ulh30b");
    			add_location(div3, file, 71, 4, 1982);
    			add_location(body, file, 70, 0, 1970);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, body, anchor);
    			append_dev(body, div3);
    			append_dev(div3, div0);
    			append_dev(div0, ul);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div1, h20);
    			append_dev(h20, t1);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, button);
    			append_dev(button, h21);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*sendBasketListToTheServerFunction*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$productTotalSummValue*/ 1) set_data_dev(t2, /*$productTotalSummValue*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(body);
    			mounted = false;
    			dispose();
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $userAcc;
    	let $basketMap;
    	let $basketSizeHolder;
    	let $productTotalSummValue;
    	validate_store(userAcc, "userAcc");
    	component_subscribe($$self, userAcc, $$value => $$invalidate(2, $userAcc = $$value));
    	validate_store(basketMap, "basketMap");
    	component_subscribe($$self, basketMap, $$value => $$invalidate(3, $basketMap = $$value));
    	validate_store(basketSizeHolder, "basketSizeHolder");
    	component_subscribe($$self, basketSizeHolder, $$value => $$invalidate(4, $basketSizeHolder = $$value));
    	validate_store(productTotalSummValue, "productTotalSummValue");
    	component_subscribe($$self, productTotalSummValue, $$value => $$invalidate(0, $productTotalSummValue = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Basket", slots, []);

    	onMount(() => {
    		simpleMessage("It`s your basket");

    		if (!$userAcc.logon) {
    			window.location.href = "./#/login";
    			return;
    		}

    		if (!$basketMap.size) return;

    		$basketMap.forEach((value, key) => {
    			new BasketList({
    					target: document.getElementById("productList"),
    					props: { productObject: key, productValue: value }
    				});
    		});
    	});

    	function productBasketClear() {
    		let productListNode = document.getElementById("productList");

    		while (productListNode.childNodes.length) {
    			productListNode.firstChild.remove();
    		}

    		$basketMap.clear();
    		set_store_value(basketSizeHolder, $basketSizeHolder = 0, $basketSizeHolder);
    		set_store_value(productTotalSummValue, $productTotalSummValue = 0, $productTotalSummValue);
    	}

    	function sendBasketListToTheServerFunction() {
    		if ($basketMap.size == 0) {
    			errMessage("Nothing in basket");
    			return;
    		}

    		let productOrder = Object.fromEntries($basketMap.entries());

    		fetch("http://localhost:5000/productListToBuy", {
    			method: "POST",
    			headers: { "Content-Type": "application/json" },
    			body: JSON.stringify(productOrder)
    		}).then(response => response.json()).then(data => {
    			if (data.error) errMessage(data.text); else successMessage(data.text);
    			productBasketClear();
    		});
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Basket> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		basketMap,
    		basketSizeHolder,
    		productTotalSummValue,
    		userAcc,
    		simpleMessage,
    		beforeUpdate,
    		afterUpdate,
    		onMount,
    		BasketList,
    		errMessage,
    		successMessage,
    		productBasketClear,
    		sendBasketListToTheServerFunction,
    		$userAcc,
    		$basketMap,
    		$basketSizeHolder,
    		$productTotalSummValue
    	});

    	return [$productTotalSummValue, sendBasketListToTheServerFunction];
    }

    class Basket extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Basket",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.3 */

    function create_fragment(ctx) {
    	let header;
    	let t0;
    	let pagedescription;
    	let t1;
    	let router;
    	let current;
    	header = new Header({ $$inline: true });
    	pagedescription = new PageDescription({ $$inline: true });

    	router = new Router({
    			props: {
    				routes: {
    					"/": Home,
    					"/about": About,
    					"/news": News,
    					"/login": Login,
    					"/products": Products,
    					"/register": RegisterPage,
    					"/profile": Profile,
    					"/basket": Basket
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(pagedescription.$$.fragment);
    			t1 = space();
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(pagedescription, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(pagedescription.$$.fragment, local);
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(pagedescription.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(pagedescription, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(router, detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Home,
    		About,
    		News,
    		Login,
    		Products,
    		RegisterPage,
    		Profile,
    		Header,
    		PageDescription,
    		Basket
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
