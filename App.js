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
            model: 'UserStory',
            storeConfig: {
                listeners: {
                    load: this._onIterationComboboxLoad,
                    scope: this
                }
            },
            listeners: {
                select: this._onSelect,
                scope: this
            },
            cls: 'iteration-filter'
        },
        {           
            xtype: 'rallybutton',
            text: 'Print Story Cards',
            handler: this._onButtonPressed,
            scope: this,
            cls: 'print-button'
        });
    },

    _onIterationComboboxLoad: function() {
        this.iterationCombobox = this.down('#iterationComboBox');
        this._loadStories();
    },

    _loadStories: function() {
        var userStories = Ext.create('Rally.data.WsapiDataStore', {
            model: 'User Story',
            autoLoad: true,
            fetch: true,
            limit: Infinity,
            listeners: {
                load: this._onStoriesLoaded,
                scope: this
            },
            filters: [
                this.iterationCombobox.getQueryFromSelected()
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


    _onButtonPressed: function() {
        var title, options;
        var css = document.getElementsByTagName('style')[0].innerHTML;

        debugger;

        //var myHappyHTML = document.documentElement.innerHTML;
        
        title = this.iterationCombobox.rawValue + ' Stories';
        options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";
        printWindow = window.open('', title, options);
        
        doc = printWindow.document;



        cardMarkup = this.down('#card');

        doc.write('<html><head><style>' + css + '</style><title>' + title + '</title>');

        Ext.each(Ext.query('link'), function(stylesheet){
                this._injectContent('', 'link', {
                    rel: 'stylesheet',
                    href: stylesheet.href,
                    type: 'text/css'
                }, doc.getElementsByTagName('head')[0]);
        }, this);

        doc.write('</head><body class="landscape">');
        doc.write(cardMarkup.getEl().dom.innerHTML);
        doc.write('</body></html>');
        doc.close();

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
    }

    
});



