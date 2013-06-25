Ext.define('Card', {
    extend: 'Ext.Component',
    alias: 'widget.card',
    cls: 'card',
    tpl: Ext.create('Ext.XTemplate', '<tpl><div class="artifact">' +
        '<div class="header">' +
            '<span class="storyID">{FormattedID}</span>' +
            '<span class="owner">{[this.getOwnerImage(values)]}</span>' +
            '<span class="ownerText">{[this.getOwnerName(values)]}</span>' +
        '</div>' +
        '<div class="content">' +
            '<div class="card-title">{Name}</div>' +
            '<div class="description">{Description}</div>' +
        '</div>' +
        '<span class="estimate">{PlanEstimate}</span>' +
        '</div></tpl>', {
            getOwnerImage: function(values) {
                if(values.Owner) {
                    return '<img src="' + Rally.environment.getServer().getContextUrl() + 
                    '/profile/viewThumbnailImage.sp?tSize=40&uid=' + Rally.util.Ref.getOidFromRef(values.Owner) + '"/>';
                }
            },
            getOwnerName: function(values) {
                if (values.Owner) {
                    return values.Owner._refObjectName;
                } else {
                    return 'No Owner';
                }
            }
        }
    )
});
