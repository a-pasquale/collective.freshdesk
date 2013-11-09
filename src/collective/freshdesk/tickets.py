# -*- coding: utf-8 -*-

# Basic implementation taken from
# http://davisagli.com/blog/using-tiles-to-provide-more-flexible-plone-layouts

from collective.cover.tiles.base import IPersistentCoverTile
from collective.cover.tiles.base import PersistentCoverTile
from plone.tiles.interfaces import ITileDataManager
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class IHelpdeskTicketsTileData(IPersistentCoverTile):

    pass

class HelpdeskTicketsTile(PersistentCoverTile):

    index = ViewPageTemplateFile("helpdesk_tickets.pt")

    is_configurable = False 

    def populate_with_object(self, obj):
        super(HelpdeskTicketsTile, self).populate_with_object(obj)

        data_mgr = ITileDataManager(self)

        data_mgr.set()


    def accepted_ct(self):
        """ Return a list of content types accepted by the tile.
        """
        pass

