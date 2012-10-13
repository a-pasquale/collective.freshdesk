import hashlib
from zope.interface import implements, Interface
from zope.component import getMultiAdapter

from Products.Five import BrowserView
from Products.CMFCore.utils import getToolByName
from zope.component import getUtility
from plone.registry.interfaces import IRegistry

from collective.freshdesk import freshdeskMessageFactory as _


class IFreshDeskAuthView(Interface):
    """
    FreshDeskAuth view interface
    """


def gen_hash_from_params(name, email, secret):
    m = hashlib.md5()
    m.update("%s%s%s" % (name, email, secret))
    return m.hexdigest()

class FreshDeskAuthView(BrowserView):
    """
    FreshDeskAuth browser view
    """
    implements(IFreshDeskAuthView)

    def __init__(self, context, request):
        self.context = context
        self.request = request

    @property
    def portal_state(self):
        return getMultiAdapter((self.context, self.request), 
                                name="plone_portal_state")

    @property
    def member(self):
        return self.portal_state.member()

    def __call__(self):
        registry = getUtility(IRegistry)
        freshdesk_domain_name = registry['collective.freshdesk.domain_name']
        freshdesk_sso_secret = registry['collective.freshdesk.sso_secret']
        name = self.member.getProperty('fullname')
        email = self.member.getProperty('email')
        h = gen_hash_from_params(name, email, freshdesk_sso_secret)
        redirect_url = "%slogin/sso?name=%s&email=%s&hash=%s" % (freshdesk_domain_name, name, email, h)
        self.request.response.redirect(redirect_url)


