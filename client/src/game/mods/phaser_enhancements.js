/**
* Modified this method to be able to ignore certain children, so that select elements (such as scrolling background) can be preserved
* between states.
*/
Phaser.Group.prototype.removeAll = function (destroy, silent) {

    if (typeof destroy === 'undefined') { destroy = false; }
    if (typeof silent === 'undefined') { silent = false; }

    if (this.children.length === 0)
    {
        return;
    }

    var i = 0;

    do
    {
        if(this.children[i].doNotDestroy) {
            i++;
        }

        if (!silent && this.children[i].events)
        {
            this.children[i].events.onRemovedFromGroup.dispatch(this.children[i], this);
        }

        var removed = this.removeChild(this.children[i]);

        if (destroy && removed)
        {
            removed.destroy(true);
        }
    }
    while (this.children.length > i);

    this.cursor = null;

};