Ext.define('Rally.apps.printstorycards.App', {
    extend: 'Rally.app.TimeboxScopedApp',
    requires: ['Card'],
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        fieldLabel: 'Select Iteration: ',
        labelWidth: 100,
        width: 300
    },

    addContent: function() {
        this.add({
            xtype: 'container',
            itemId: 'card'
        });
        this._loadStories();
    },

    onScopeChange: function() {
        this.down('#card').removeAll();
        this._loadStories();
    },

    _loadStories: function() {
        Ext.create('Rally.data.WsapiDataStore', {
            model: 'User Story',
            autoLoad: true,
            fetch: ['FormattedID', 'Name', 'Owner', 'Description', 'PlanEstimate'],
            limit: Infinity,
            listeners: {
                load: this._onStoriesLoaded,
                scope: this
            },
            filters: [
                this.getContext().getTimeboxScope().getQueryFilter()
            ]
        });
    },

    _onStoriesLoaded: function(store, records) {
        Ext.Array.each(records, function(record, index) {
            if (record.get('PlanEstimate') === null) {
                record.raw.PlanEstimate = 'None';
            }

            this.down('#card').add({
                xtype: 'card',
                data: record.raw
            });

            if (index%4 === 3) {
                this.down('#card').add({
                    xtype: 'component',
                    html: '<div class="pb"></div>'
                });
            }
        }, this); 
    },

    // Printing functions:

    getOptions: function() {
        return [
            {
                text: 'Print',
                handler: this._onButtonPressed,
                scope: this
            }
        ];
    },

    _onButtonPressed: function() {
        var title, options, css = '';
        if (document.getElementsByTagName('style').length > 0) {
            css = document.getElementsByTagName('style')[0].innerHTML;
        }

        title = this.getContext().getTimeboxScope().getRecord().get('Name') + ' Stories';
        options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";

        if (Ext.isIE) {
            printWindow = window.open();
        } else {
            printWindow = window.open('', title, options);
        }
        
        doc = printWindow.document;

        cardMarkup = this.down('#card');

        doc.write('<html><head><style>' + css + '</style><title>' + title + '</title>');
        doc.write('</head><body class="landscape">');
        doc.write('<div style="font-weight:bold">Iteration: ' +
            this.getContext().getTimeboxScope().getRecord().get('Name') +  '</div>');
        doc.write(cardMarkup.getEl().dom.innerHTML);
        doc.write('</body></html>');
        doc.close();

        this._injectCSS(printWindow);

        if (Ext.isSafari) {
            var timeout = setTimeout(function() {
                printWindow.print();
            }, 500);
        } else {
            printWindow.print();
        }
    },

    _injectContent: function(html, elementType, attributes, container){
        elementType = elementType || 'div';
        container = container || printWindow.document.getElementsByTagName('body')[0];
        var element = printWindow.document.createElement(elementType);
        Ext.Object.each(attributes, function(key, value){
            if (key === 'class') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        if(html){
            element.innerHTML = html;
        }
        return container.appendChild(element);
    },

    _injectCSS: function(printWindow){
        Ext.each(Ext.query('link'), function(stylesheet){
                this._injectContent('', 'link', {
                rel: 'stylesheet',
                href: stylesheet.href,
                type: 'text/css'
            }, printWindow.document.getElementsByTagName('head')[0], printWindow);
        }, this);

    }
});



