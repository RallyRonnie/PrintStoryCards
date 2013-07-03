Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    requires: ['Card'],
    componentCls: 'app',
    items: [
        {
            xtype: 'container',
            itemId: 'headerContainer'
        },
        {
            xtype: 'container',
            itemId: 'card'
        }
    ],

    launch: function() {
        this.down('#headerContainer').add({
            xtype: 'rallyiterationcombobox',
            itemId: 'iterationComboBox',
            fieldLabel: 'Select Iteration: ',
            width: 310,
            labelWidth: 100,
            model: 'UserStory',
            storeConfig: {
                listeners: {
                    load: this._loadStories,
                    scope: this
                }
            },
            listeners: {
                select: this._onSelect,
                scope: this
            },
            cls: 'iteration-filter'
        });
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
                this.down('#iterationComboBox').getQueryFromSelected()
            ]
        });
    },

    _onSelect: function() {
        this.down('#card').removeAll();
        this._loadStories();
    },


    _onStoriesLoaded: function(store, records) {
        Ext.Array.each(records, function(record, index) {
            if (record.raw.PlanEstimate === null) {
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
        debugger;
        var title, options;
        var css = document.getElementsByTagName('style')[0].innerHTML;
        
        title = this.down('#iterationComboBox').getRawValue() + ' Stories';
        options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";
        printWindow = window.open('', title, options);
        
        doc = printWindow.document;

        cardMarkup = this.down('#card');

        doc.write('<html><head><style>' + css + '</style><title>' + title + '</title>');
        doc.write('</head><body class="landscape">');
        doc.write(cardMarkup.getEl().dom.innerHTML);
        doc.write('</body></html>');
        doc.close();

        this._injectCSS(printWindow);

        printWindow.print();
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



