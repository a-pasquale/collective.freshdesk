(function (a) {
    a.extend(a.fn, {
        validate: function (b) {
            if (!this.length) {
                b && b.debug && window.console && console.warn("nothing selected, can't validate, returning nothing");
                return
            }
            var c = a.data(this[0], "validator");
            if (c) {
                return c
            }
            c = new a.validator(b, this[0]);
            a.data(this[0], "validator", c);
            if (c.settings.onsubmit) {
                this.find("input, button").filter(".cancel").click(function () {
                    c.cancelSubmit = true
                });
                if (c.settings.submitHandler) {
                    this.find("input, button").filter(":submit").click(function () {
                        c.submitButton = this
                    })
                }
                this.submit(function (d) {
                    if (c.settings.debug) {
                        d.preventDefault()
                    }
                    function e() {
                        if (c.settings.submitHandler) {
                            if (c.submitButton) {
                                var f = a("<input type='hidden'/>").attr("name", c.submitButton.name).val(c.submitButton.value).appendTo(c.currentForm)
                            }
                            c.settings.submitHandler.call(c, c.currentForm);
                            if (c.submitButton) {
                                f.remove()
                            }
                            return false
                        }
                        return true
                    }
                    if (c.cancelSubmit) {
                        c.cancelSubmit = false;
                        return e()
                    }
                    if (c.form()) {
                        if (c.pendingRequest) {
                            c.formSubmitted = true;
                            return false
                        }
                        return e()
                    } else {
                        c.focusInvalid();
                        return false
                    }
                })
            }
            return c
        },
        valid: function () {
            if (a(this[0]).is("form")) {
                return this.validate().form()
            } else {
                var c = true;
                var b = a(this[0].form).validate();
                this.each(function () {
                    c &= b.element(this)
                });
                return c
            }
        },
        removeAttrs: function (d) {
            var b = {}, c = this;
            a.each(d.split(/\s/), function (e, f) {
                b[f] = c.attr(f);
                c.removeAttr(f)
            });
            return b
        },
        rules: function (e, b) {
            var g = this[0];
            if (e) {
                var d = a.data(g.form, "validator").settings;
                var i = d.rules;
                var j = a.validator.staticRules(g);
                switch (e) {
                    case "add":
                        a.extend(j, a.validator.normalizeRule(b));
                        i[g.name] = j;
                        if (b.messages) {
                            d.messages[g.name] = a.extend(d.messages[g.name], b.messages)
                        }
                        break;
                    case "remove":
                        if (!b) {
                            delete i[g.name];
                            return j
                        }
                        var h = {};
                        a.each(b.split(/\s/), function (k, l) {
                            h[l] = j[l];
                            delete j[l]
                        });
                        return h
                }
            }
            var f = a.validator.normalizeRules(a.extend({}, a.validator.metadataRules(g), a.validator.classRules(g), a.validator.attributeRules(g), a.validator.staticRules(g)), g);
            if (f.required) {
                var c = f.required;
                delete f.required;
                f = a.extend({
                    required: c
                }, f)
            }
            return f
        }
    });
    a.extend(a.expr[":"], {
        blank: function (b) {
            return !a.trim("" + b.value)
        },
        filled: function (b) {
            return !!a.trim("" + b.value)
        },
        unchecked: function (b) {
            return !b.checked
        }
    });
    a.validator = function (b, c) {
        this.settings = a.extend(true, {}, a.validator.defaults, b);
        this.currentForm = c;
        this.init()
    };
    a.validator.format = function (b, c) {
        if (arguments.length == 1) {
            return function () {
                var d = a.makeArray(arguments);
                d.unshift(b);
                return a.validator.format.apply(this, d)
            }
        }
        if (arguments.length > 2 && c.constructor != Array) {
            c = a.makeArray(arguments).slice(1)
        }
        if (c.constructor != Array) {
            c = [c]
        }
        a.each(c, function (d, e) {
            b = b.replace(new RegExp("\\{" + d + "\\}", "g"), e)
        });
        return b
    };
    a.extend(a.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: a([]),
            errorLabelContainer: a([]),
            onsubmit: true,
            ignore: [],
            ignoreTitle: false,
            onfocusin: function (b) {
                this.lastActive = b;
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    this.settings.unhighlight && this.settings.unhighlight.call(this, b, this.settings.errorClass, this.settings.validClass);
                    this.addWrapper(this.errorsFor(b)).hide()
                }
            },
            onfocusout: function (b) {
                if (!this.checkable(b) && (b.name in this.submitted || !this.optional(b))) {
                    this.element(b)
                }
            },
            onkeyup: function (b) {
                if (b.name in this.submitted || b == this.lastElement) {
                    this.element(b)
                }
            },
            onclick: function (b) {
                if (b.name in this.submitted) {
                    this.element(b)
                } else {
                    if (b.parentNode.name in this.submitted) {
                        this.element(b.parentNode)
                    }
                }
            },
            highlight: function (d, b, c) {
                a(d).addClass(b).removeClass(c)
            },
            unhighlight: function (d, b, c) {
                a(d).removeClass(b).addClass(c)
            }
        },
        setDefaults: function (b) {
            a.extend(a.validator.defaults, b)
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            accept: "Please enter a value with a valid extension.",
            maxlength: a.validator.format("Please enter no more than {0} characters."),
            minlength: a.validator.format("Please enter at least {0} characters."),
            rangelength: a.validator.format("Please enter a value between {0} and {1} characters long."),
            range: a.validator.format("Please enter a value between {0} and {1}."),
            max: a.validator.format("Please enter a value less than or equal to {0}."),
            min: a.validator.format("Please enter a value greater than or equal to {0}.")
        },
        autoCreateRanges: false,
        prototype: {
            init: function () {
                this.labelContainer = a(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || a(this.currentForm);
                this.containers = a(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();
                var b = (this.groups = {});
                a.each(this.settings.groups, function (e, f) {
                    a.each(f.split(/\s/), function (h, g) {
                        b[g] = e
                    })
                });
                var d = this.settings.rules;
                a.each(d, function (e, f) {
                    d[e] = a.validator.normalizeRule(f)
                });

                function c(g) {
                    var f = a.data(this[0].form, "validator"),
                        e = "on" + g.type.replace(/^validate/, "");
                    f.settings[e] && f.settings[e].call(f, this[0])
                }
                a(this.currentForm).validateDelegate(":text, :password, :file, select, textarea", "focusin focusout keyup", c).validateDelegate(":radio, :checkbox, select, option", "click", c);
                if (this.settings.invalidHandler) {
                    a(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler)
                }
            },
            form: function () {
                this.checkForm();
                a.extend(this.submitted, this.errorMap);
                this.invalid = a.extend({}, this.errorMap);
                if (!this.valid()) {
                    a(this.currentForm).triggerHandler("invalid-form", [this])
                }
                this.showErrors();
                return this.valid()
            },
            checkForm: function () {
                this.prepareForm();
                for (var b = 0, c = (this.currentElements = this.elements()); c[b]; b++) {
                    this.check(c[b])
                }
                return this.valid()
            },
            element: function (c) {
                c = this.clean(c);
                this.lastElement = c;
                this.prepareElement(c);
                this.currentElements = a(c);
                var b = this.check(c);
                if (b) {
                    delete this.invalid[c.name]
                } else {
                    this.invalid[c.name] = true
                }
                if (!this.numberOfInvalids()) {
                    this.toHide = this.toHide.add(this.containers)
                }
                this.showErrors();
                return b
            },
            showErrors: function (c) {
                if (c) {
                    a.extend(this.errorMap, c);
                    this.errorList = [];
                    for (var b in c) {
                        this.errorList.push({
                            message: c[b],
                            element: this.findByName(b)[0]
                        })
                    }
                    this.successList = a.grep(this.successList, function (d) {
                        return !(d.name in c)
                    })
                }
                this.settings.showErrors ? this.settings.showErrors.call(this, this.errorMap, this.errorList) : this.defaultShowErrors()
            },
            resetForm: function () {
                if (a.fn.resetForm) {
                    a(this.currentForm).resetForm()
                }
                this.submitted = {};
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass)
            },
            numberOfInvalids: function () {
                return this.objectLength(this.invalid)
            },
            objectLength: function (d) {
                var c = 0;
                for (var b in d) {
                    c++
                }
                return c
            },
            hideErrors: function () {
                this.addWrapper(this.toHide).hide()
            },
            valid: function () {
                return this.size() == 0
            },
            size: function () {
                return this.errorList.length
            },
            focusInvalid: function () {
                if (this.settings.focusInvalid) {
                    try {
                        a(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin")
                    } catch (b) {}
                }
            },
            findLastActive: function () {
                var b = this.lastActive;
                return b && a.grep(this.errorList, function (c) {
                    return c.element.name == b.name
                }).length == 1 && b
            },
            elements: function () {
                var c = this,
                    b = {};
                return a([]).add(this.currentForm.elements).filter(":input").not(":submit, :reset, :image, [disabled]").not(this.settings.ignore).filter(function () {
                    !this.name && c.settings.debug && window.console && console.error("%o has no name assigned", this);
                    if (this.name in b || !c.objectLength(a(this).rules())) {
                        return false
                    }
                    b[this.name] = true;
                    return true
                })
            },
            clean: function (b) {
                return a(b)[0]
            },
            errors: function () {
                return a(this.settings.errorElement + "." + this.settings.errorClass, this.errorContext)
            },
            reset: function () {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = a([]);
                this.toHide = a([]);
                this.currentElements = a([])
            },
            prepareForm: function () {
                this.reset();
                this.toHide = this.errors().add(this.containers)
            },
            prepareElement: function (b) {
                this.reset();
                this.toHide = this.errorsFor(b)
            },
            check: function (c) {
                c = this.clean(c);
                if (this.checkable(c)) {
                    c = this.findByName(c.name).not(this.settings.ignore)[0]
                }
                var h = a(c).rules();
                var d = false;
                for (var i in h) {
                    var g = {
                        method: i,
                        parameters: h[i]
                    };
                    try {
                        var b = a.validator.methods[i].call(this, c.value.replace(/\r/g, ""), c, g.parameters);
                        if (b == "dependency-mismatch") {
                            d = true;
                            continue
                        }
                        d = false;
                        if (b == "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(c));
                            return
                        }
                        if (!b) {
                            this.formatAndAdd(c, g);
                            return false
                        }
                    } catch (f) {
                        this.settings.debug && window.console && console.log("exception occured when checking element " + c.id + ", check the '" + g.method + "' method", f);
                        throw f
                    }
                }
                if (d) {
                    return
                }
                if (this.objectLength(h)) {
                    this.successList.push(c)
                }
                return true
            },
            customMetaMessage: function (b, d) {
                if (!a.metadata) {
                    return
                }
                var c = this.settings.meta ? a(b).metadata()[this.settings.meta] : a(b).metadata();
                return c && c.messages && c.messages[d]
            },
            customMessage: function (c, d) {
                var b = this.settings.messages[c];
                return b && (b.constructor == String ? b : b[d])
            },
            findDefined: function () {
                for (var b = 0; b < arguments.length; b++) {
                    if (arguments[b] !== undefined) {
                        return arguments[b]
                    }
                }
                return undefined
            },
            defaultMessage: function (b, c) {
                return this.findDefined(this.customMessage(b.name, c), this.customMetaMessage(b, c), !this.settings.ignoreTitle && b.title || undefined, a.validator.messages[c], "<strong>Warning: No message defined for " + b.name + "</strong>")
            },
            formatAndAdd: function (c, e) {
                var d = this.defaultMessage(c, e.method),
                    b = /\$?\{(\d+)\}/g;
                if (typeof d == "function") {
                    d = d.call(this, e.parameters, c)
                } else {
                    if (b.test(d)) {
                        d = jQuery.format(d.replace(b, "{$1}"), e.parameters)
                    }
                }
                this.errorList.push({
                    message: d,
                    element: c
                });
                this.errorMap[c.name] = d;
                this.submitted[c.name] = d
            },
            addWrapper: function (b) {
                if (this.settings.wrapper) {
                    b = b.add(b.parent(this.settings.wrapper))
                }
                return b
            },
            defaultShowErrors: function () {
                for (var c = 0; this.errorList[c]; c++) {
                    var b = this.errorList[c];
                    this.settings.highlight && this.settings.highlight.call(this, b.element, this.settings.errorClass, this.settings.validClass);
                    this.showLabel(b.element, b.message)
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers)
                }
                if (this.settings.success) {
                    for (var c = 0; this.successList[c]; c++) {
                        this.showLabel(this.successList[c])
                    }
                }
                if (this.settings.unhighlight) {
                    for (var c = 0, d = this.validElements(); d[c]; c++) {
                        this.settings.unhighlight.call(this, d[c], this.settings.errorClass, this.settings.validClass)
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show()
            },
            validElements: function () {
                return this.currentElements.not(this.invalidElements())
            },
            invalidElements: function () {
                return a(this.errorList).map(function () {
                    return this.element
                })
            },
            showLabel: function (c, d) {
                var b = this.errorsFor(c);
                if (b.length) {
                    b.removeClass().addClass(this.settings.errorClass);
                    b.attr("generated") && b.html(d)
                } else {
                    b = a("<" + this.settings.errorElement + "/>").attr({
                        "for": this.idOrName(c),
                        generated: true
                    }).addClass(this.settings.errorClass).html(d || "");
                    if (this.settings.wrapper) {
                        b = b.hide().show().wrap("<" + this.settings.wrapper + "/>").parent()
                    }
                    if (!this.labelContainer.append(b).length) {
                        this.settings.errorPlacement ? this.settings.errorPlacement(b, a(c)) : b.insertAfter(c)
                    }
                }
                if (!d && this.settings.success) {
                    b.text("");
                    typeof this.settings.success == "string" ? b.addClass(this.settings.success) : this.settings.success(b)
                }
                this.toShow = this.toShow.add(b)
            },
            errorsFor: function (c) {
                var b = this.idOrName(c);
                return this.errors().filter(function () {
                    return a(this).attr("for") == b
                })
            },
            idOrName: function (b) {
                return this.groups[b.name] || (this.checkable(b) ? b.name : b.id || b.name)
            },
            checkable: function (b) {
                return /radio|checkbox/i.test(b.type)
            },
            findByName: function (b) {
                var c = this.currentForm;
                return a(document.getElementsByName(b)).map(function (d, e) {
                    return e.form == c && e.name == b && e || null
                })
            },
            getLength: function (c, b) {
                switch (b.nodeName.toLowerCase()) {
                    case "select":
                        return a("option:selected", b).length;
                    case "input":
                        if (this.checkable(b)) {
                            return this.findByName(b.name).filter(":checked").length
                        }
                }
                return c.length
            },
            depend: function (c, b) {
                return this.dependTypes[typeof c] ? this.dependTypes[typeof c](c, b) : true
            },
            dependTypes: {
                "boolean": function (c, b) {
                    return c
                },
                string: function (c, b) {
                    return !!a(c, b.form).length
                },
                "function": function (c, b) {
                    return c(b)
                }
            },
            optional: function (b) {
                return !a.validator.methods.required.call(this, a.trim(b.value), b) && "dependency-mismatch"
            },
            startRequest: function (b) {
                if (!this.pending[b.name]) {
                    this.pendingRequest++;
                    this.pending[b.name] = true
                }
            },
            stopRequest: function (b, c) {
                this.pendingRequest--;
                if (this.pendingRequest < 0) {
                    this.pendingRequest = 0
                }
                delete this.pending[b.name];
                if (c && this.pendingRequest == 0 && this.formSubmitted && this.form()) {
                    a(this.currentForm).submit();
                    this.formSubmitted = false
                } else {
                    if (!c && this.pendingRequest == 0 && this.formSubmitted) {
                        a(this.currentForm).triggerHandler("invalid-form", [this]);
                        this.formSubmitted = false
                    }
                }
            },
            previousValue: function (b) {
                return a.data(b, "previousValue") || a.data(b, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(b, "remote")
                })
            }
        },
        classRuleSettings: {
            required: {
                required: true
            },
            email: {
                email: true
            },
            url: {
                url: true
            },
            date: {
                date: true
            },
            dateISO: {
                dateISO: true
            },
            dateDE: {
                dateDE: true
            },
            number: {
                number: true
            },
            numberDE: {
                numberDE: true
            },
            digits: {
                digits: true
            },
            creditcard: {
                creditcard: true
            }
        },
        addClassRules: function (b, c) {
            b.constructor == String ? this.classRuleSettings[b] = c : a.extend(this.classRuleSettings, b)
        },
        classRules: function (c) {
            var d = {};
            var b = a(c).attr("class");
            b && a.each(b.split(" "), function () {
                if (this in a.validator.classRuleSettings) {
                    a.extend(d, a.validator.classRuleSettings[this])
                }
            });
            return d
        },
        attributeRules: function (c) {
            var e = {};
            var b = a(c);
            for (var f in a.validator.methods) {
                var d = b.attr(f);
                if (d) {
                    e[f] = d
                }
            }
            if (e.maxlength && /-1|2147483647|524288/.test(e.maxlength)) {
                delete e.maxlength
            }
            return e
        },
        metadataRules: function (b) {
            if (!a.metadata) {
                return {}
            }
            var c = a.data(b.form, "validator").settings.meta;
            return c ? a(b).metadata()[c] : a(b).metadata()
        },
        staticRules: function (c) {
            var d = {};
            var b = a.data(c.form, "validator");
            if (b.settings.rules) {
                d = a.validator.normalizeRule(b.settings.rules[c.name]) || {}
            }
            return d
        },
        normalizeRules: function (c, b) {
            a.each(c, function (f, e) {
                if (e === false) {
                    delete c[f];
                    return
                }
                if (e.param || e.depends) {
                    var d = true;
                    switch (typeof e.depends) {
                        case "string":
                            d = !! a(e.depends, b.form).length;
                            break;
                        case "function":
                            d = e.depends.call(b, b);
                            break
                    }
                    if (d) {
                        c[f] = e.param !== undefined ? e.param : true
                    } else {
                        delete c[f]
                    }
                }
            });
            a.each(c, function (d, e) {
                c[d] = a.isFunction(e) ? e(b) : e
            });
            a.each(["minlength", "maxlength", "min", "max"], function () {
                if (c[this]) {
                    c[this] = Number(c[this])
                }
            });
            a.each(["rangelength", "range"], function () {
                if (c[this]) {
                    c[this] = [Number(c[this][0]), Number(c[this][1])]
                }
            });
            if (a.validator.autoCreateRanges) {
                if (c.min && c.max) {
                    c.range = [c.min, c.max];
                    delete c.min;
                    delete c.max
                }
                if (c.minlength && c.maxlength) {
                    c.rangelength = [c.minlength, c.maxlength];
                    delete c.minlength;
                    delete c.maxlength
                }
            }
            if (c.messages) {
                delete c.messages
            }
            return c
        },
        normalizeRule: function (c) {
            if (typeof c == "string") {
                var b = {};
                a.each(c.split(/\s/), function () {
                    b[this] = true
                });
                c = b
            }
            return c
        },
        addMethod: function (b, d, c) {
            a.validator.methods[b] = d;
            a.validator.messages[b] = c != undefined ? c : a.validator.messages[b];
            if (d.length < 3) {
                a.validator.addClassRules(b, a.validator.normalizeRule(b))
            }
        },
        methods: {
            required: function (c, b, e) {
                if (!this.depend(e, b)) {
                    return "dependency-mismatch"
                }
                switch (b.nodeName.toLowerCase()) {
                    case "select":
                        var d = a(b).val();
                        return d && d.length > 0;
                    case "input":
                        if (this.checkable(b)) {
                            return this.getLength(c, b) > 0
                        }
                    default:
                        return a.trim(c).length > 0
                }
            },
            remote: function (f, c, g) {
                if (this.optional(c)) {
                    return "dependency-mismatch"
                }
                var d = this.previousValue(c);
                if (!this.settings.messages[c.name]) {
                    this.settings.messages[c.name] = {}
                }
                d.originalMessage = this.settings.messages[c.name].remote;
                this.settings.messages[c.name].remote = d.message;
                g = typeof g == "string" && {
                    url: g
                } || g;
                if (this.pending[c.name]) {
                    return "pending"
                }
                if (d.old === f) {
                    return d.valid
                }
                d.old = f;
                var b = this;
                this.startRequest(c);
                var e = {};
                e[c.name] = f;
                a.ajax(a.extend(true, {
                    url: g,
                    mode: "abort",
                    port: "validate" + c.name,
                    dataType: "json",
                    data: e,
                    success: function (i) {
                        b.settings.messages[c.name].remote = d.originalMessage;
                        var k = i === true;
                        if (k) {
                            var h = b.formSubmitted;
                            b.prepareElement(c);
                            b.formSubmitted = h;
                            b.successList.push(c);
                            b.showErrors()
                        } else {
                            var l = {};
                            var j = i || b.defaultMessage(c, "remote");
                            l[c.name] = d.message = a.isFunction(j) ? j(f) : j;
                            b.showErrors(l)
                        }
                        d.valid = k;
                        b.stopRequest(c, k)
                    }
                }, g));
                return "pending"
            },
            minlength: function (c, b, d) {
                return this.optional(b) || this.getLength(a.trim(c), b) >= d
            },
            maxlength: function (c, b, d) {
                return this.optional(b) || this.getLength(a.trim(c), b) <= d
            },
            rangelength: function (d, b, e) {
                var c = this.getLength(a.trim(d), b);
                return this.optional(b) || (c >= e[0] && c <= e[1])
            },
            min: function (c, b, d) {
                return this.optional(b) || c >= d
            },
            max: function (c, b, d) {
                return this.optional(b) || c <= d
            },
            range: function (c, b, d) {
                return this.optional(b) || (c >= d[0] && c <= d[1])
            },
            email: function (c, b) {
                return this.optional(b) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(c)
            },
            url: function (c, b) {
                return this.optional(b) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(c)
            },
            date: function (c, b) {
                return this.optional(b) || !/Invalid|NaN/.test(new Date(c))
            },
            dateISO: function (c, b) {
                return this.optional(b) || /^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(c)
            },
            number: function (c, b) {
                return this.optional(b) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(c)
            },
            digits: function (c, b) {
                return this.optional(b) || /^\d+$/.test(c)
            },
            creditcard: function (f, c) {
                if (this.optional(c)) {
                    return "dependency-mismatch"
                }
                if (/[^0-9-]+/.test(f)) {
                    return false
                }
                var g = 0,
                    e = 0,
                    b = false;
                f = f.replace(/\D/g, "");
                for (var h = f.length - 1; h >= 0; h--) {
                    var d = f.charAt(h);
                    var e = parseInt(d, 10);
                    if (b) {
                        if ((e *= 2) > 9) {
                            e -= 9
                        }
                    }
                    g += e;
                    b = !b
                }
                return (g % 10) == 0
            },
            accept: function (c, b, d) {
                d = typeof d == "string" ? d.replace(/,/g, "|") : "png|jpe?g|gif";
                return this.optional(b) || c.match(new RegExp(".(" + d + ")$", "i"))
            },
            equalTo: function (c, b, e) {
                var d = a(e).unbind(".validate-equalTo").bind("blur.validate-equalTo", function () {
                    a(b).valid()
                });
                return c == d.val()
            }
        }
    });
    a.format = a.validator.format
})(jQuery);
(function (c) {
    var a = {};
    if (c.ajaxPrefilter) {
        c.ajaxPrefilter(function (f, e, g) {
            var d = f.port;
            if (f.mode == "abort") {
                if (a[d]) {
                    a[d].abort()
                }
                a[d] = g
            }
        })
    } else {
        var b = c.ajax;
        c.ajax = function (e) {
            var f = ("mode" in e ? e : c.ajaxSettings).mode,
                d = ("port" in e ? e : c.ajaxSettings).port;
            if (f == "abort") {
                if (a[d]) {
                    a[d].abort()
                }
                return (a[d] = b.apply(this, arguments))
            }
            return b.apply(this, arguments)
        }
    }
})(jQuery);
(function (a) {
    if (!jQuery.event.special.focusin && !jQuery.event.special.focusout && document.addEventListener) {
        a.each({
            focus: "focusin",
            blur: "focusout"
        }, function (c, b) {
            a.event.special[b] = {
                setup: function () {
                    this.addEventListener(c, d, true)
                },
                teardown: function () {
                    this.removeEventListener(c, d, true)
                },
                handler: function (f) {
                    arguments[0] = a.event.fix(f);
                    arguments[0].type = b;
                    return a.event.handle.apply(this, arguments)
                }
            };

            function d(f) {
                f = a.event.fix(f);
                f.type = b;
                return a.event.handle.call(this, f)
            }
        })
    }
    a.extend(a.fn, {
        validateDelegate: function (d, c, b) {
            return this.bind(c, function (e) {
                var f = a(e.target);
                if (f.is(d)) {
                    return b.apply(f, arguments)
                }
            })
        }
    })
})(jQuery);
if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment) {
    Range.prototype.createContextualFragment = function (a) {
        var c = document.createDocumentFragment(),
            b = document.createElement("div");
        c.appendChild(b);
        b.outerHTML = a;
        return c
    }
}
var $t = Class.create({
    initialize: function (a) {
        this.id = a || "0";
        this.children = $H()
    },
    set: function (a, b) {
        this.children.set(a, b)
    },
    get: function (a) {
        return (a != "...") ? this.children.get(a) : ""
    }
});
var NestedField = Class.create({
    initialize: function (a) {
        this._blank = "...";
        this.tree = new $H();
        this.readData(a)
    },
    readData: function (a) {
        delete this.tree;
        this.tree = new $H();
        this.third_level = this.second_level = false;
        if (typeof a == "string") {
            this.parseString(a)
        } else {
            if (typeof a == "object") {
                this.parseObject(a)
            }
        }
    },
    removeTests: function (a) {
        return a.replace(/[\t\r]/g, "").strip()
    },
    testChar: function (a) {
        return /[\t\r]/g.test(a)
    },
    parseObject: function (a) {
        _self = this;
        a.each(function (b) {
            _self.tree.set(b[0], new $t(b[1]));
            if (!b[2]) {
                return
            }
            b[2].each(function (c) {
                _self.tree.get(b[0]).set(c[0], new $t(c[1]));
                _self.setSecondPresent();
                if (!c[2]) {
                    return
                }
                c[2].each(function (d) {
                    _self.tree.get(b[0]).get(c[0]).set(d[0], new $t(d[1]));
                    _self.setThirdPresent()
                })
            })
        })
    },
    parseString: function (a) {
        _self = this, _category = "", _subcategory = "", _item = "", _caseoption = "";
        a.split("\n").each(function (b) {
            try {
                _caseoption = (_self.testChar(b[0])) ? ((_self.testChar(b[1])) ? 2 : 1) : 0;
                b = _self.removeTests(b);
                if (b == "") {
                    return
                }
                switch (_caseoption) {
                    case 0:
                        _self.tree.set(b, new $t());
                        _category = b;
                        break;
                    case 1:
                        _self.tree.get(_category).set(b, new $t());
                        _subcategory = b;
                        _self.setSecondPresent();
                        break;
                    case 2:
                        _self.tree.get(_category).get(_subcategory).set(b, new $t());
                        _self.setThirdPresent();
                        break
                }
            } catch (c) {}
        })
    },
    setThirdPresent: function () {
        this.third_level = true
    },
    setSecondPresent: function () {
        this.second_level = true
    },
    getCategory: function () {
        _categories = [];
        this.tree.each(function (a) {
            _categories.push("<option value=" + a.value.id + ">" + a.key + "</option>")
        });
        return _categories.join()
    },
    getSubcategory: function (a) {
        _subcategories = [];
        if (this.tree.get(a).children) {
            this.tree.get(a).children.each(function (b) {
                _subcategories.push("<option value=" + b.value.id + ">" + b.key + "</option>")
            })
        }
        if (!_subcategories.first()) {
            _subcategories = ["<option value='0'>" + this._blank + "</option>"]
        }
        return _subcategories.join()
    },
    getItems: function (a, b) {
        _items = [];
        console.log("category_key: " + a);
        console.log("subcategory_key: " + b);
        if (this.tree.get(a)) {
            if (this.tree.get(a).get(b).children) {
                this.tree.get(a).get(b).children.each(function (c) {
                    _items.push("<option value=" + c.value.id + ">" + c.key + "</option>")
                })
            }
        }
        console.log("ITEMS: " + _items);
        return (_items.first()) ? _items.join() : false
    },
    getCategoryList: function () {
        _categories = [];
        this.tree.each(function (a) {
            _categories.push(a.key)
        });
        return _categories
    },
    getSubcategoryList: function (a) {
        return ((a && a != "-1") ? this.tree.get(a).children : $H()) || $H()
    },
    getItemsList: function (a, b) {
        return ((b && b != "-1" && this.tree.get(a)) ? this.tree.get(a).get(b).children : $H()) || $H()
    },
    toString: function () {
        _self = this, _treeString = "";
        _self.tree.each(function (a) {
            _treeString += a.key + "\n";
            a.value.children.each(function (b) {
                _treeString += "\t" + b.key + "\n";
                b.value.children.each(function (c) {
                    _treeString += "\t\t" + c.key + "\n"
                })
            })
        });
        return _treeString
    },
    toArray: function () {
        _self = this, _category_array = [];
        _self.tree.each(function (a) {
            var b = [];
            a.value.children.each(function (d) {
                var c = [];
                d.value.children.each(function (e) {
                    c.push([e.key, e.value.id])
                });
                b.push((c.size()) ? [d.key, d.value.id, c] : [d.key, d.value.id])
            });
            _category_array.push((b.size()) ? [a.key, a.value.id, b] : [a.key, a.value.id])
        });
        return _category_array
    }
});
if (!window.Helpdesk) {
    Helpdesk = {}
}
Helpdesk.Multifile = {
    load: function () {
        Helpdesk.Multifile.template = jQuery("#file-list-template").template()
    },
    onFileSelected: function (a) {
        if (jQuery(a).css("display") != "none") {
            this.addFileToList(a);
            this.duplicateInput(a)
        }
    },
    duplicateInput: function (a) {
        i2 = jQuery(a).clone();
        i2.attr("id", i2.attr("id") + "_c");
        i2.val("");
        jQuery(a).before(i2);
        jQuery(a).attr("name", jQuery(a).attr("nameWhenFilled"));
        jQuery(a).hide();
        this.removeEventHandler(a);
        this.addEventHandler(i2);
        return i2
    },
    changeUploadFile: function (a) {
        Helpdesk.Multifile.onFileSelected(a)
    },
    addEventHandler: function (a) {
        jQuery(a).bind("change", function () {
            Helpdesk.Multifile.onFileSelected(a)
        })
    },
    removeEventHandler: function (a) {
        jQuery(a).unbind("change")
    },
    addFileToList: function (c) {
        var a = jQuery(c).attr("fileContainer");
        jQuery("#" + a).show();
        var b = jQuery("#" + jQuery(c).attr("fileList"));
        b.prepend(jQuery.tmpl(this.template, {
            name: jQuery(c).val(),
            inputId: jQuery(c).attr("id")
        }))
    },
    remove: function (a) {
        try {
            jQuery("#" + jQuery(a).attr("inputId")).remove();
            jQuery(a).parents("div:first").remove()
        } catch (b) {
            alert(b)
        }
    },
    resetAll: function () {
        jQuery("input[fileList]").each(function () {
            jQuery(this).val("");
            var a = jQuery("#" + jQuery(this).attr("fileList"));
            a.html("")
        })
    }
};
jQuery("document").ready(function () {
    jQuery("input[fileList]").livequery(function () {
        Helpdesk.Multifile.load();
        Helpdesk.Multifile.addEventHandler(this)
    })
});
(function (b) {
    var a = {
        init: function (c) {
            return this.each(function () {
                var j = b.fn.nested_select_tag.defaults;
                var h = b.extend({}, j, c),
                    k = new NestedField(h.data_tree),
                    i = b(this),
                    g = b("#" + h.subcategory_id),
                    e = b("#" + h.item_id),
                    f = (h.initValues || {}),
                    d = h.disable_children;
                h.default_option = "<option value=''>" + h.include_blank + "</option>";
                i.bind("change", function (l) {
                    var m = false;
                    g.html(h.default_option);
                    (k.getSubcategoryList(i.val())).each(function (n) {
                        m = true;
                        b("<option />").html(n.key).val(n.key).appendTo(g)
                    });
                    g.trigger("change");
                    _condition = (!m || (!i.val() || i.val() == -1));
                    g.prop("disabled", d && _condition).parent().toggle(!_condition)
                });
                g.bind("change", function (l) {
                    if (!g.data("initialLoad")) {
                        g.val(f.subcategory_val);
                        g.data("initialLoad", true)
                    } else {
                        if (!e.get(0)) {
                            h.change_callback()
                        }
                    }
                    if (k.third_level) {
                        var m = false;
                        e.html(h.default_option);
                        (k.getItemsList(i.val(), g.val())).each(function (n) {
                            m = true;
                            b("<option />").html(n.key).val(n.key).appendTo(e)
                        });
                        e.trigger("change");
                        _condition = (!m || (!g.val() || g.val() == -1));
                        e.prop("disabled", d && _condition).parent().toggle(!_condition)
                    }
                });
                e.bind("change", function (l) {
                    if (e.data("initialLoad")) {
                        h.change_callback()
                    } else {
                        e.val(f.item_val);
                        e.data("initialLoad", true)
                    }
                });
                i.val(f.category_val).trigger("change")
            })
        }
    };
    b.fn.nested_select_tag = function (c) {
        if (a[c]) {
            return a[c].apply(this, Array.prototype.slice.call(arguments, 1))
        } else {
            if (typeof c === "object" || !c) {
                return a.init.apply(this, arguments)
            } else {
                b.error("Method " + c + " does not exist on jQuery.nested_select_tag")
            }
        }
    };
    b.fn.nested_select_tag.defaults = {
        data_tree: [],
        initValues: {},
        include_blank: "...",
        default_option: "<option value=''>...</option>",
        inline_labels: true,
        change_callback: function () {},
        disable_children: true
    }
})(jQuery);